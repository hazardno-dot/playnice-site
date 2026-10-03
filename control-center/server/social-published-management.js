import { resolveMetaPageAccessToken } from "../lib/meta-page-token.mjs";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const META_GRAPH_API_VERSION = process.env.META_GRAPH_API_VERSION || "v26.0";
const json = (res, status, body) => res.status(status).json(body);

const PUBLISH_ACTIONS = {
  instagram_feed: "test_instagram_feed_published",
  instagram_story: "test_instagram_story_published",
  facebook: "test_facebook_published",
};

const DELETE_ACTIONS = {
  instagram_feed: "published_instagram_feed_deleted",
  instagram_story: "published_instagram_story_deleted",
  facebook: "published_facebook_deleted",
};

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
      Prefer: "return=representation",
      ...(init.headers || {}),
    },
  });
}

async function requireAdmin(req) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!token) return { error: "Missing admin session.", status: 401 };

  const response = await supabaseFetch("/rest/v1/admin_users?select=user_id&limit=1", token);
  const rows = await safeJson(response);
  if (!response.ok) return { error: `Invalid admin session (Supabase ${response.status}).`, status: 401 };
  if (!Array.isArray(rows) || !rows[0]?.user_id) return { error: "This account is not authorized.", status: 403 };
  return { token, user: { id: rows[0].user_id } };
}

async function metaRequest(path, credential, init = {}) {
  const response = await fetch(`https://graph.facebook.com/${META_GRAPH_API_VERSION}/${String(path || "").replace(/^\/+/, "")}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${credential.token}`,
      ...(init.headers || {}),
    },
  });
  const payload = await safeJson(response);
  if (!response.ok) {
    const message = payload?.error?.message || payload?.message || `Meta Graph returned HTTP ${response.status}`;
    const code = payload?.error?.code ? ` (code ${payload.error.code})` : "";
    const error = new Error(`${message}${code}`);
    error.status = response.status;
    error.meta = payload?.error || payload || null;
    throw error;
  }
  return payload || {};
}

async function readLatestAudit(token, eventId, action) {
  const response = await supabaseFetch(
    `/rest/v1/social_audit_log?social_event_id=eq.${encodeURIComponent(eventId)}&action=eq.${encodeURIComponent(action)}&select=id,details,created_at&order=created_at.desc&limit=1`,
    token,
  );
  const rows = await safeJson(response);
  if (!response.ok) throw new Error(`Could not read Social audit history (${response.status}).`);
  return Array.isArray(rows) && rows.length ? rows[0] : null;
}

async function writeAudit(token, eventId, userId, action, details) {
  const response = await supabaseFetch("/rest/v1/social_audit_log", token, {
    method: "POST",
    body: JSON.stringify({
      social_event_id: eventId,
      actor_id: userId,
      action,
      details,
    }),
  });
  if (!response.ok) throw new Error(`Could not write Social audit history (${response.status}).`);
  const rows = await safeJson(response);
  return Array.isArray(rows) ? rows[0] || null : null;
}

function externalIdFor(channel, details = {}) {
  if (channel === "facebook") return String(details.post_id || details.provider_id || details.media_id || "").trim();
  return String(details.post_id || details.provider_id || details.media_id || "").trim();
}

async function resolveLiveUrl(channel, externalId, credential) {
  if (channel === "facebook") {
    const payload = await metaRequest(`${encodeURIComponent(externalId)}?fields=permalink_url`, credential);
    return String(payload?.permalink_url || "").trim();
  }

  const payload = await metaRequest(`${encodeURIComponent(externalId)}?fields=permalink,media_product_type,timestamp`, credential);
  return String(payload?.permalink || "").trim();
}

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });
  if (!SUPABASE_URL || !SUPABASE_KEY) return json(res, 500, { error: "Server configuration is incomplete." });

  const admin = await requireAdmin(req);
  if (admin.error) return json(res, admin.status, { error: admin.error });

  const eventId = String(req.body?.event_id || "").trim();
  const channel = String(req.body?.channel || "").trim();
  const action = String(req.body?.action || "").trim();

  if (!eventId) return json(res, 400, { error: "event_id is required." });
  if (!PUBLISH_ACTIONS[channel]) return json(res, 400, { error: "Unsupported published Social channel." });
  if (!["open", "delete", "republish"].includes(action)) return json(res, 400, { error: "Unsupported published Social action." });

  const eventRes = await supabaseFetch(
    `/rest/v1/social_events?id=eq.${encodeURIComponent(eventId)}&select=*&limit=1`,
    admin.token,
  );
  const events = await safeJson(eventRes);
  if (!eventRes.ok) return json(res, 502, { error: `Could not load Social event (${eventRes.status}).` });
  const event = Array.isArray(events) ? events[0] : null;
  if (!event) return json(res, 404, { error: "Social event not found." });
  if (event.status !== "published") return json(res, 409, { error: "Published management is available only for PUBLISHED Social events." });

  const publishAudit = await readLatestAudit(admin.token, eventId, PUBLISH_ACTIONS[channel]);
  if (!publishAudit) return json(res, 404, { error: "No published Meta record exists for this channel." });

  const deletedAudit = await readLatestAudit(admin.token, eventId, DELETE_ACTIONS[channel]);
  if (deletedAudit && action === "delete") {
    return json(res, 200, {
      ok: true,
      deleted: true,
      already_deleted: true,
      channel,
      deleted_at: deletedAudit.created_at || null,
    });
  }
  if (deletedAudit && action === "open") {
    return json(res, 410, {
      ok: false,
      deleted: true,
      already_deleted: true,
      channel,
      deleted_at: deletedAudit.created_at || null,
      error: "This published Meta item was already deleted from Control Center.",
    });
  }
  if (!deletedAudit && action === "republish") {
    return json(res, 409, { error: "Republish is available only after this channel has been deleted from Meta." });
  }

  if (action === "republish") {
    const stamp = Date.now();
    const retrySourceId = `${event.source_id}--manual-social-republish-${channel}-${stamp}`;
    const metadata = event.metadata && typeof event.metadata === "object" ? event.metadata : {};
    const retryMetadata = {
      ...metadata,
      test: false,
      replay: false,
      producer: `social-manual-${channel}-republish`,
      republish: true,
      republish_channel: channel,
      republish_parent_event_id: event.id,
      canonical_source_id: metadata.canonical_source_id || event.source_id,
      social_media_approval: metadata.social_media_approval || {},
    };

    const createRes = await supabaseFetch("/rest/v1/social_events", admin.token, {
      method: "POST",
      body: JSON.stringify({
        event_type: event.event_type,
        source_type: event.source_type,
        source_id: retrySourceId,
        source_url: event.source_url,
        payload: event.payload || {},
        media: Array.isArray(event.media) ? event.media : [],
        metadata: retryMetadata,
        channels: [channel],
        status: "draft",
        publish_mode: "shadow",
        draft_content: event.approved_content || event.draft_content || null,
        created_by: admin.user.id,
      }),
    });
    const createdRows = await safeJson(createRes);
    if (!createRes.ok) {
      const detail = String(createdRows?.message || createdRows?.hint || createdRows?.details || "unknown Supabase insert error").slice(0, 220);
      throw new Error(`Could not create channel republish draft (Supabase ${createRes.status}: ${detail}).`);
    }
    const retryEvent = Array.isArray(createdRows) ? createdRows[0] : null;
    if (!retryEvent?.id) throw new Error("Channel republish draft was created without an event id.");

    await writeAudit(admin.token, event.id, admin.user.id, "published_channel_republish_draft_created", {
      channel,
      retry_event_id: retryEvent.id,
      retry_source_id: retrySourceId,
      parent_event_id: event.id,
    });
    await writeAudit(admin.token, retryEvent.id, admin.user.id, "channel_republish_draft_created", {
      channel,
      parent_event_id: event.id,
      original_publish_audit_id: publishAudit.id,
      original_deleted_audit_id: deletedAudit.id,
    });

    return json(res, 200, {
      ok: true,
      republish: true,
      channel,
      parent_event_id: event.id,
      event: retryEvent,
    });
  }

  const externalId = externalIdFor(channel, publishAudit.details || {});
  if (!externalId) return json(res, 409, { error: "Published Meta ID is missing from Social audit history." });

  let credential;
  try {
    credential = await resolveMetaPageAccessToken();
  } catch (error) {
    return json(res, 503, { error: error?.message || "Meta Page credential could not be resolved." });
  }

  try {
    if (action === "open") {
      const liveUrl = await resolveLiveUrl(channel, externalId, credential);
      if (!liveUrl) return json(res, 404, { error: "Meta did not return a live permalink for this published item." });
      return json(res, 200, {
        ok: true,
        channel,
        live_url: liveUrl,
        external_id: externalId,
        credential_source: credential.source,
      });
    }

    const payload = await metaRequest(encodeURIComponent(externalId), credential, { method: "DELETE" });
    const success = payload?.success !== false;
    if (!success) return json(res, 502, { error: "Meta did not confirm deletion." });

    const now = new Date().toISOString();
    await writeAudit(admin.token, eventId, admin.user.id, DELETE_ACTIONS[channel], {
      channel,
      post_id: publishAudit.details?.post_id || null,
      media_id: publishAudit.details?.media_id || null,
      external_id: externalId,
      deleted_at: now,
      credential_source: credential.source,
      source_id: event.source_id,
    });

    return json(res, 200, {
      ok: true,
      deleted: true,
      channel,
      external_id: externalId,
      deleted_at: now,
      credential_source: credential.source,
    });
  } catch (error) {
    return json(res, 400, {
      ok: false,
      channel,
      action,
      error: error?.message || String(error),
      meta_error: error?.meta || null,
    });
  }
}
