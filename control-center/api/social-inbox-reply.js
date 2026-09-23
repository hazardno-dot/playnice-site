import { resolveMetaPageAccessToken } from "../lib/meta-page-token.mjs";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const META_GRAPH_API_VERSION = String(process.env.META_GRAPH_API_VERSION || "v26.0").trim();
const META_FACEBOOK_PAGE_ID = String(process.env.META_FACEBOOK_PAGE_ID || "").trim();
const MAX_REPLY_LENGTH = 2000;
const RESPONSE_WINDOW_MS = 24 * 60 * 60 * 1000;

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
  return { token, user: { id: admins[0].user_id } };
}

async function graphPost(path, token, body) {
  const url = `https://graph.facebook.com/${META_GRAPH_API_VERSION}/${path.replace(/^\\/+/, "")}`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
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

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });
  if (!SUPABASE_URL || !SUPABASE_KEY || !META_FACEBOOK_PAGE_ID) {
    return json(res, 500, { error: "Server configuration is incomplete." });
  }

  const auth = await requireAdmin(req);
  if (auth.error) return json(res, auth.status, { error: auth.error });

  const threadId = String(req.body?.thread_id || "").trim();
  const text = String(req.body?.text || "").trim();
  if (!threadId) return json(res, 400, { error: "Inbox thread id is required." });
  if (req.body?.approved !== true) return json(res, 400, { error: "Explicit admin approval is required before sending." });
  if (!text) return json(res, 400, { error: "Reply text is required." });
  if (text.length > MAX_REPLY_LENGTH) return json(res, 400, { error: `Reply exceeds ${MAX_REPLY_LENGTH} characters.` });

  const threadRes = await supabaseFetch(
    `/rest/v1/social_inbox_threads?id=eq.${encodeURIComponent(threadId)}&select=id,platform,meta_conversation_id,participant_id,participant_name,status,metadata&limit=1`,
    auth.token
  );
  const threads = await safeJson(threadRes);
  if (!threadRes.ok) return json(res, 400, { error: `Could not load inbox thread (Supabase ${threadRes.status}).` });
  const thread = Array.isArray(threads) ? threads[0] : null;
  if (!thread) return json(res, 404, { error: "Inbox thread not found." });
  if (thread.platform !== "facebook") {
    return json(res, 409, { error: "Instagram sending is disabled. Facebook is the only enabled reply channel." });
  }
  if (!thread.participant_id) return json(res, 409, { error: "Facebook recipient id is missing. Run Sync now and try again." });

  const inboundRes = await supabaseFetch(
    `/rest/v1/social_inbox_messages?thread_id=eq.${encodeURIComponent(thread.id)}&direction=eq.inbound&select=sent_at&order=sent_at.desc&limit=1`,
    auth.token
  );
  const inboundRows = await safeJson(inboundRes);
  if (!inboundRes.ok) return json(res, 400, { error: `Could not verify Facebook response window (Supabase ${inboundRes.status}).` });
  const lastInboundAt = Array.isArray(inboundRows) ? inboundRows[0]?.sent_at : null;
  const lastInboundTime = lastInboundAt ? new Date(lastInboundAt).getTime() : NaN;
  if (!Number.isFinite(lastInboundTime)) {
    return json(res, 409, { error: "No stored inbound Facebook message is available for this conversation. Run Sync now first." });
  }
  if (Date.now() - lastInboundTime > RESPONSE_WINDOW_MS) {
    return json(res, 409, { error: "Facebook reply blocked: the latest customer message is outside Meta's 24-hour response window." });
  }

  try {
    const resolved = await resolveMetaPageAccessToken();
    const meta = await graphPost(`${encodeURIComponent(META_FACEBOOK_PAGE_ID)}/messages`, resolved.token, {
      recipient: { id: thread.participant_id },
      messaging_type: "RESPONSE",
      message: { text },
    });

    const now = new Date().toISOString();
    const messageId = String(meta?.message_id || "").trim();
    const storageWarnings = [];
    let storedMessage = null;

    if (messageId) {
      const messageRes = await supabaseFetch(
        "/rest/v1/social_inbox_messages?on_conflict=platform,meta_message_id",
        auth.token,
        {
          method: "POST",
          headers: { Prefer: "resolution=merge-duplicates,return=representation" },
          body: JSON.stringify({
            thread_id: thread.id,
            platform: "facebook",
            meta_message_id: messageId,
            direction: "outbound",
            sender_id: META_FACEBOOK_PAGE_ID,
            sender_name: "PlayNice",
            recipient_id: thread.participant_id,
            body: text,
            sent_at: now,
            metadata: {
              source: "meta_send_api",
              messaging_type: "RESPONSE",
              approval: "explicit_admin",
              approved_by: auth.user.id,
              approved_at: now,
              credential_source: resolved.source,
            },
          }),
        }
      );
      const messagePayload = await safeJson(messageRes);
      if (!messageRes.ok) storageWarnings.push(`Message sent but local message storage failed (Supabase ${messageRes.status}).`);
      else storedMessage = Array.isArray(messagePayload) ? messagePayload[0] : messagePayload;
    } else {
      storageWarnings.push("Meta accepted the send request but did not return a message id; run Sync now before sending again.");
    }

    const threadMetadata = thread.metadata && typeof thread.metadata === "object" ? thread.metadata : {};
    const threadPatch = await supabaseFetch(
      `/rest/v1/social_inbox_threads?id=eq.${encodeURIComponent(thread.id)}`,
      auth.token,
      {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({
          status: "replied",
          last_message_text: text,
          last_message_direction: "outbound",
          last_message_at: now,
          synced_at: now,
          metadata: {
            ...threadMetadata,
            last_reply: {
              meta_message_id: messageId || null,
              approved_by: auth.user.id,
              approved_at: now,
              transport: "meta_send_api",
            },
          },
        }),
      }
    );
    if (!threadPatch.ok) storageWarnings.push(`Message sent but thread state update failed (Supabase ${threadPatch.status}).`);

    return json(res, 200, {
      ok: true,
      sent: true,
      platform: "facebook",
      recipient_id: String(meta?.recipient_id || thread.participant_id),
      meta_message_id: messageId || null,
      message: storedMessage,
      storage_warnings: storageWarnings,
    });
  } catch (error) {
    return json(res, 400, {
      error: String(error?.message || error).slice(0, 300),
      meta_code: error?.metaCode || null,
      meta_subcode: error?.metaSubcode || null,
    });
  }
}
