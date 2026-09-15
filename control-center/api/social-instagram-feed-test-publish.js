import {
  buildInstagramFeedCreateRequest,
  parseInstagramFeedCreateResponse,
  buildInstagramFeedPublishRequest,
  parseInstagramFeedPublishResponse,
} from "../src/metaPublishAdapter.mjs";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const META_PAGE_ACCESS_TOKEN = process.env.META_PAGE_ACCESS_TOKEN;
const META_GRAPH_API_VERSION = process.env.META_GRAPH_API_VERSION || "v26.0";
const TEST_PUBLISH_ENABLED = process.env.META_TEST_PUBLISH_INSTAGRAM_FEED_ENABLED === "true";
const json = (res, status, body) => res.status(status).json(body);
const TRANSIENT_SUPABASE_STATUSES = new Set([502, 503, 504]);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const MEDIA_PROCESSING_MAX_ATTEMPTS = 15;
const MEDIA_PROCESSING_DELAY_MS = 1000;

async function safeJson(response) {
  const text = await response.text();
  if (!text) return null;
  try { return JSON.parse(text); } catch { return { message: text.slice(0, 300) }; }
}

async function supabaseFetch(path, token, init = {}) {
  const run = () => fetch(`${SUPABASE_URL}${path}`, {
    ...init,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
  let response = await run();
  if (TRANSIENT_SUPABASE_STATUSES.has(response.status)) {
    await sleep(350);
    response = await run();
  }
  return response;
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

const isExplicitTestEvent = (event) => Boolean(
  event?.metadata?.test ||
  event?.metadata?.replay ||
  String(event?.source_id || "").includes("--shadow-test-") ||
  String(event?.source_id || "").includes("--shadow-replay-")
);

async function probeInstagramImage(url) {
  let response;
  try {
    response = await fetch(url, { method: "HEAD", redirect: "follow" });
    if (response.status === 405 || response.status === 403) {
      response = await fetch(url, { method: "GET", redirect: "follow", headers: { Range: "bytes=0-0" } });
    }
  } catch (error) {
    throw new Error(`Instagram image is not publicly reachable: ${error?.message || String(error)}`);
  }
  if (!response.ok && response.status !== 206) throw new Error(`Instagram image returned HTTP ${response.status}.`);
  const contentType = String(response.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
  if (contentType !== "image/jpeg") {
    throw new Error(`Instagram Feed test publish requires JPEG media; received ${contentType || "unknown content type"}.`);
  }
  return { content_type: contentType, public_media_verified: true };
}

async function metaPost(request) {
  const body = new URLSearchParams();
  for (const [key, value] of Object.entries(request.body || {})) body.set(key, String(value));
  const response = await fetch(request.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${META_PAGE_ACCESS_TOKEN}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
  const payload = await safeJson(response);
  if (!response.ok) {
    const message = payload?.error?.message || payload?.message || `Meta Graph returned HTTP ${response.status}`;
    const code = payload?.error?.code ? ` (code ${payload.error.code})` : "";
    throw new Error(`${message}${code}`);
  }
  return payload || {};
}

async function metaGetMediaStatus(mediaId) {
  const url = new URL(`https://graph.facebook.com/${META_GRAPH_API_VERSION}/${encodeURIComponent(mediaId)}`);
  url.searchParams.set("fields", "status_code,status");
  const response = await fetch(url, {
    method: "GET",
    headers: { Authorization: `Bearer ${META_PAGE_ACCESS_TOKEN}` },
  });
  const payload = await safeJson(response);
  if (!response.ok) {
    const message = payload?.error?.message || payload?.message || `Meta Graph returned HTTP ${response.status}`;
    const code = payload?.error?.code ? ` (code ${payload.error.code})` : "";
    throw new Error(`Could not check Instagram media processing status: ${message}${code}`);
  }
  return payload || {};
}

async function waitForInstagramMedia(mediaId) {
  let lastStatus = null;
  for (let attempt = 1; attempt <= MEDIA_PROCESSING_MAX_ATTEMPTS; attempt += 1) {
    const payload = await metaGetMediaStatus(mediaId);
    const statusCode = String(payload?.status_code || "").trim().toUpperCase();
    const statusText = String(payload?.status || "").trim();
    lastStatus = { status_code: statusCode || null, status: statusText || null, attempts: attempt };

    if (statusCode === "FINISHED") return lastStatus;
    if (["ERROR", "EXPIRED"].includes(statusCode)) {
      throw new Error(`Instagram media container ${statusCode.toLowerCase()} before publish${statusText ? `: ${statusText}` : "."}`);
    }

    if (attempt < MEDIA_PROCESSING_MAX_ATTEMPTS) await sleep(MEDIA_PROCESSING_DELAY_MS);
  }

  throw new Error(`Instagram media container was not ready after ${MEDIA_PROCESSING_MAX_ATTEMPTS} checks (last status: ${lastStatus?.status_code || "unknown"}).`);
}

async function writeAudit(token, event, userId, details) {
  const response = await supabaseFetch("/rest/v1/social_audit_log", token, {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({
      social_event_id: event.id,
      action: "test_instagram_feed_published",
      actor_id: userId,
      details,
    }),
  });
  if (!response.ok) console.warn("Instagram Feed test publish audit write failed", response.status);
}

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });

  const admin = await requireAdmin(req);
  if (admin.error) return json(res, admin.status, { error: admin.error });
  if (!TEST_PUBLISH_ENABLED) {
    return json(res, 423, {
      error: "Instagram Feed test publishing is locked. Set META_TEST_PUBLISH_INSTAGRAM_FEED_ENABLED=true only for the controlled manual test.",
      publish_enabled: false,
    });
  }
  if (!META_PAGE_ACCESS_TOKEN) return json(res, 503, { error: "META_PAGE_ACCESS_TOKEN is not configured." });

  const eventId = String(req.body?.event_id || "").trim();
  if (!eventId) return json(res, 400, { error: "event_id is required." });

  const eventRes = await supabaseFetch(`/rest/v1/social_events?id=eq.${encodeURIComponent(eventId)}&select=*`, admin.token);
  const events = await safeJson(eventRes);
  if (!eventRes.ok) return json(res, 502, { error: `Could not load Social event (${eventRes.status}).` });
  const event = Array.isArray(events) ? events[0] : null;
  if (!event) return json(res, 404, { error: "Social event not found." });
  if (!isExplicitTestEvent(event)) return json(res, 403, { error: "Real Meta test publishing is allowed only for explicit test/replay Social events." });
  if (!["ready", "scheduled"].includes(event.status)) return json(res, 409, { error: "Test event must be READY or SCHEDULED with an approved snapshot." });
  if (!event.approved_content?.instagram_feed) return json(res, 409, { error: "Approved Instagram Feed snapshot is required." });

  try {
    const createRequest = buildInstagramFeedCreateRequest({ content: event.approved_content });
    const mediaCheck = await probeInstagramImage(createRequest.body.image_url);
    const createPayload = await metaPost(createRequest);
    const { media_id } = parseInstagramFeedCreateResponse(createPayload);
    const processing = await waitForInstagramMedia(media_id);
    const publishRequest = buildInstagramFeedPublishRequest({ creation_id: media_id });
    const publishPayload = await metaPost(publishRequest);
    const result = parseInstagramFeedPublishResponse(publishPayload);

    await writeAudit(admin.token, event, admin.user.id, {
      channel: "instagram_feed",
      test_only: true,
      media_id,
      post_id: result.post_id,
      content_type: mediaCheck.content_type,
      source_id: event.source_id,
      processing_attempts: processing.attempts,
      processing_status_code: processing.status_code,
    });

    return json(res, 200, {
      ok: true,
      mode: "manual_test_publish",
      test_only: true,
      event_id: event.id,
      processing,
      result: { ...result, media_id },
    });
  } catch (error) {
    return json(res, 400, {
      ok: false,
      mode: "manual_test_publish",
      test_only: true,
      error: error?.message || String(error),
    });
  }
}
