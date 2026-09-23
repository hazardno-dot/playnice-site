import { resolveMetaPageAccessToken } from "../lib/meta-page-token.mjs";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const META_GRAPH_API_VERSION = String(process.env.META_GRAPH_API_VERSION || "v26.0").trim();
const META_FACEBOOK_PAGE_ID = String(process.env.META_FACEBOOK_PAGE_ID || "").trim();
const META_INSTAGRAM_ACCOUNT_ID = String(process.env.META_INSTAGRAM_ACCOUNT_ID || "").trim();

const json = (res, status, body) => res.status(status).json(body);

async function safeJson(response) {
  const text = await response.text();
  if (!text) return null;
  try { return JSON.parse(text); } catch { return { message: text.slice(0, 300) }; }
}

async function supabaseFetch(path, token, init = {}) {
  return fetch(`${SUPABASE_URL}${path}`, {
    ...init,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
}

async function requireAdmin(req) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!token) return { error: "Missing admin session.", status: 401 };

  const response = await supabaseFetch("/rest/v1/admin_users?select=user_id&limit=1", token);
  const admins = await safeJson(response);
  if (!response.ok) return { error: `Invalid admin session (Supabase ${response.status}).`, status: 401 };
  if (!Array.isArray(admins) || !admins[0]?.user_id) return { error: "This account is not authorized.", status: 403 };
  return { token };
}

async function graphGet(path, token, params = {}) {
  const url = new URL(`https://graph.facebook.com/${META_GRAPH_API_VERSION}/${path.replace(/^\/+/, "")}`);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, String(value));
  }
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  });
  const payload = await safeJson(response);
  if (!response.ok) {
    const error = new Error(payload?.error?.message || payload?.message || `Meta Graph returned HTTP ${response.status}`);
    error.status = response.status;
    error.metaCode = payload?.error?.code || null;
    error.metaSubcode = payload?.error?.error_subcode || null;
    throw error;
  }
  return payload || {};
}

const iso = (value) => {
  const date = value ? new Date(value) : new Date();
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
};

function participantFor(conversation, messages, businessIds) {
  const participants = Array.isArray(conversation?.participants?.data) ? conversation.participants.data : [];
  const participant = participants.find((item) => item?.id && !businessIds.has(String(item.id)));
  if (participant) return participant;
  for (const message of messages) {
    if (message?.from?.id && !businessIds.has(String(message.from.id))) return message.from;
  }
  return null;
}

function normalizeMessage(message, platform, businessIds) {
  const senderId = String(message?.from?.id || "");
  const recipientIds = Array.isArray(message?.to?.data)
    ? message.to.data.map((item) => String(item?.id || "")).filter(Boolean)
    : [];
  const outbound = senderId && businessIds.has(senderId);
  return {
    platform,
    meta_message_id: String(message?.id || ""),
    direction: outbound ? "outbound" : "inbound",
    sender_id: senderId || null,
    sender_name: String(message?.from?.name || "").trim() || null,
    recipient_id: outbound
      ? recipientIds.find((id) => !businessIds.has(id)) || null
      : recipientIds.find((id) => businessIds.has(id)) || null,
    body: String(message?.message || "").trim() || null,
    sent_at: iso(message?.created_time),
    metadata: { source: "meta_graph", has_text: Boolean(String(message?.message || "").trim()) },
  };
}

async function upsertThread(token, row) {
  const response = await supabaseFetch(
    "/rest/v1/social_inbox_threads?on_conflict=platform,meta_conversation_id",
    token,
    {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify(row),
    }
  );
  const payload = await safeJson(response);
  if (!response.ok) throw new Error(`Could not save inbox thread (Supabase ${response.status}).`);
  return Array.isArray(payload) ? payload[0] : payload;
}

async function upsertMessages(token, rows) {
  const usable = rows.filter((row) => row.meta_message_id);
  if (!usable.length) return 0;
  const response = await supabaseFetch(
    "/rest/v1/social_inbox_messages?on_conflict=platform,meta_message_id",
    token,
    {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify(usable),
    }
  );
  if (!response.ok) throw new Error(`Could not save inbox messages (Supabase ${response.status}).`);
  return usable.length;
}

async function syncPlatform(platform, pageToken, adminToken) {
  const params = {
    fields: "id,updated_time,participants.limit(10){id,name}",
    limit: 50,
  };
  if (platform === "instagram") params.platform = "instagram";

  const list = await graphGet(`${encodeURIComponent(META_FACEBOOK_PAGE_ID)}/conversations`, pageToken, params);
  const conversations = Array.isArray(list?.data) ? list.data : [];
  let messagesSaved = 0;

  for (const summary of conversations) {
    const conversationId = String(summary?.id || "").trim();
    if (!conversationId) continue;

    const detail = await graphGet(encodeURIComponent(conversationId), pageToken, {
      fields: "id,updated_time,participants.limit(10){id,name},messages.limit(20){id,message,from,to,created_time}",
    });
    const rawMessages = Array.isArray(detail?.messages?.data) ? detail.messages.data : [];
    const businessIds = new Set([META_FACEBOOK_PAGE_ID, META_INSTAGRAM_ACCOUNT_ID].filter(Boolean));
    const participant = participantFor(detail, rawMessages, businessIds);
    const messages = rawMessages
      .map((message) => normalizeMessage(message, platform, businessIds))
      .filter((message) => message.meta_message_id)
      .sort((a, b) => new Date(a.sent_at) - new Date(b.sent_at));
    const last = messages[messages.length - 1] || null;

    const thread = await upsertThread(adminToken, {
      platform,
      meta_conversation_id: conversationId,
      participant_id: String(participant?.id || "").trim() || null,
      participant_name: String(participant?.name || "").trim() || null,
      status: last?.direction === "outbound" ? "replied" : "open",
      last_message_text: last?.body || null,
      last_message_direction: last?.direction || null,
      last_message_at: last?.sent_at || null,
      meta_updated_at: detail?.updated_time ? iso(detail.updated_time) : null,
      synced_at: new Date().toISOString(),
      metadata: { source: "meta_graph", history_window: "latest_20_messages" },
    });
    if (!thread?.id) throw new Error("Inbox thread upsert did not return an id.");

    messagesSaved += await upsertMessages(
      adminToken,
      messages.map((message) => ({ ...message, thread_id: thread.id }))
    );
  }

  return { conversations: conversations.length, messages: messagesSaved };
}

function metaError(error) {
  return {
    message: String(error?.message || error).slice(0, 280),
    status: error?.status || null,
    code: error?.metaCode || null,
    subcode: error?.metaSubcode || null,
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });
  if (!SUPABASE_URL || !SUPABASE_KEY) return json(res, 500, { error: "Server configuration is incomplete." });
  if (!META_FACEBOOK_PAGE_ID) return json(res, 500, { error: "META_FACEBOOK_PAGE_ID is not configured." });

  const auth = await requireAdmin(req);
  if (auth.error) return json(res, auth.status, { error: auth.error });

  try {
    const resolved = await resolveMetaPageAccessToken();
    const results = {};
    const errors = {};

    for (const platform of ["instagram", "facebook"]) {
      try {
        results[platform] = await syncPlatform(platform, resolved.token, auth.token);
      } catch (error) {
        errors[platform] = metaError(error);
      }
    }

    if (!Object.keys(results).length) {
      return json(res, 424, {
        error: "Meta inbox sync could not read Instagram or Facebook conversations.",
        required_permissions: {
          instagram: ["instagram_basic", "instagram_manage_messages", "pages_manage_metadata"],
          facebook: ["pages_manage_metadata", "pages_read_engagement", "pages_messaging"],
        },
        meta_errors: errors,
      });
    }

    return json(res, 200, {
      ok: true,
      mode: "facebook_reply_enabled",
      credential_source: resolved.source,
      results,
      meta_errors: errors,
      sending_enabled: { facebook: true, instagram: false },
    });
  } catch (error) {
    return json(res, 400, { error: String(error?.message || error).slice(0, 300) });
  }
}
