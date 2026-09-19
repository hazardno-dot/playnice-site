import {
  buildInstagramFeedCreateRequest,
  parseInstagramFeedCreateResponse,
  buildInstagramFeedPublishRequest,
  parseInstagramFeedPublishResponse,
  buildInstagramStoryCreateRequest,
  parseInstagramStoryCreateResponse,
  buildInstagramStoryPublishRequest,
  parseInstagramStoryPublishResponse,
  buildFacebookPhotoRequest,
  parseFacebookPhotoResponse,
} from "../src/metaPublishAdapter.mjs";
import { classifySocialMedia } from "../src/socialDraft.mjs";
import { resolveMetaPageAccessToken } from "../lib/meta-page-token.mjs";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const META_GRAPH_API_VERSION = process.env.META_GRAPH_API_VERSION || "v26.0";
const INSTAGRAM_TEST_PUBLISH_ENABLED = process.env.META_TEST_PUBLISH_INSTAGRAM_FEED_ENABLED === "true";
const INSTAGRAM_STORY_TEST_PUBLISH_ENABLED = process.env.META_TEST_PUBLISH_INSTAGRAM_STORY_ENABLED === "true";
const FACEBOOK_TEST_PUBLISH_ENABLED = process.env.META_TEST_PUBLISH_FACEBOOK_ENABLED === "true";
const json = (res, status, body) => res.status(status).json(body);
const TRANSIENT_SUPABASE_STATUSES = new Set([502, 503, 504]);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const MEDIA_PROCESSING_MAX_ATTEMPTS = 15;
const MEDIA_PROCESSING_DELAY_MS = 1000;
const STORY_PUBLISH_MAX_ATTEMPTS = 5;
const STORY_PUBLISH_INITIAL_DELAY_MS = 2500;

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

const isControlledPublishEvent = (event) => Boolean(
  event?.metadata?.test ||
  event?.metadata?.replay ||
  event?.metadata?.manual_product_post ||
  event?.metadata?.manual_hero_post ||
  event?.metadata?.manual_journal_post ||
  String(event?.metadata?.producer || "").startsWith("social-manual-") ||
  String(event?.source_id || "").includes("--shadow-test-") ||
  String(event?.source_id || "").includes("--shadow-replay-") ||
  String(event?.source_id || "").includes("--manual-social-")
);

async function probeImage(url, channel) {
  let response;
  try {
    response = await fetch(url, { method: "HEAD", redirect: "follow" });
    if (response.status === 405 || response.status === 403) {
      response = await fetch(url, { method: "GET", redirect: "follow", headers: { Range: "bytes=0-0" } });
    }
  } catch (error) {
    throw new Error(`${channel} image is not publicly reachable: ${error?.message || String(error)}`);
  }
  if (!response.ok && response.status !== 206) throw new Error(`${channel} image returned HTTP ${response.status}.`);
  const contentType = String(response.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
  const allowed = channel === "Facebook Page" ? ["image/jpeg", "image/png"] : ["image/jpeg"];
  if (!allowed.includes(contentType)) {
    throw new Error(`${channel} test publish requires ${channel === "Facebook Page" ? "JPEG or PNG" : "JPEG"} media; received ${contentType || "unknown content type"}.`);
  }
  return { content_type: contentType, public_media_verified: true };
}

async function metaPost(request, pageToken) {
  const body = new URLSearchParams();
  for (const [key, value] of Object.entries(request.body || {})) body.set(key, String(value));
  const response = await fetch(request.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${pageToken}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
  const payload = await safeJson(response);
  if (!response.ok) {
    const message = payload?.error?.message || payload?.message || `Meta Graph returned HTTP ${response.status}`;
    const metaCode = payload?.error?.code ?? null;
    const code = metaCode ? ` (code ${metaCode})` : "";
    const error = new Error(`${message}${code}`);
    error.metaCode = metaCode;
    error.metaPayload = payload?.error || payload || null;
    throw error;
  }
  return payload || {};
}

async function metaGetMediaStatus(mediaId, pageToken) {
  const url = new URL(`https://graph.facebook.com/${META_GRAPH_API_VERSION}/${encodeURIComponent(mediaId)}`);
  url.searchParams.set("fields", "status_code,status");
  const response = await fetch(url, {
    method: "GET",
    headers: { Authorization: `Bearer ${pageToken}` },
  });
  const payload = await safeJson(response);
  if (!response.ok) {
    const message = payload?.error?.message || payload?.message || `Meta Graph returned HTTP ${response.status}`;
    const code = payload?.error?.code ? ` (code ${payload.error.code})` : "";
    throw new Error(`Could not check Instagram media processing status: ${message}${code}`);
  }
  return payload || {};
}

async function waitForInstagramMedia(mediaId, pageToken) {
  let lastStatus = null;
  for (let attempt = 1; attempt <= MEDIA_PROCESSING_MAX_ATTEMPTS; attempt += 1) {
    const payload = await metaGetMediaStatus(mediaId, pageToken);
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

async function writeAudit(token, event, userId, action, details) {
  const response = await supabaseFetch("/rest/v1/social_audit_log", token, {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({ social_event_id: event.id, action, actor_id: userId, details }),
  });
  if (!response.ok) console.warn(`${action} audit write failed`, response.status);
}


const PUBLISH_AUDIT_ACTIONS = {
  instagram_feed: "test_instagram_feed_published",
  instagram_story: "test_instagram_story_published",
  facebook: "test_facebook_published",
};

async function alreadyPublished(token, eventId, channel) {
  const action = PUBLISH_AUDIT_ACTIONS[channel];
  if (!action) return null;
  const response = await supabaseFetch(
    `/rest/v1/social_audit_log?social_event_id=eq.${encodeURIComponent(eventId)}&action=eq.${encodeURIComponent(action)}&select=id,details,created_at&order=created_at.desc&limit=1`,
    token,
  );
  const rows = await safeJson(response);
  if (!response.ok || !Array.isArray(rows) || !rows.length) return null;
  return rows[0];
}


async function finalizePublishedEvent(token, event) {
  const [feed, story, facebook] = await Promise.all([
    alreadyPublished(token, event.id, "instagram_feed"),
    alreadyPublished(token, event.id, "instagram_story"),
    alreadyPublished(token, event.id, "facebook"),
  ]);
  if (!feed || !story || !facebook) return null;

  const publishedAt = [feed.created_at, story.created_at, facebook.created_at]
    .filter(Boolean)
    .sort()
    .at(-1) || new Date().toISOString();

  const response = await supabaseFetch(`/rest/v1/social_events?id=eq.${encodeURIComponent(event.id)}`, token, {
    method: "PATCH",
    body: JSON.stringify({
      status: "published",
      published_at: publishedAt,
      scheduled_for: null,
    }),
  });
  const rows = await safeJson(response);
  if (!response.ok) throw new Error(`Could not archive completed Social event (${response.status}).`);
  return Array.isArray(rows) ? rows[0] || null : null;
}

async function publishInstagram(event, admin, pageToken, credentialSource) {
  if (!INSTAGRAM_TEST_PUBLISH_ENABLED) {
    return { status: 423, body: { error: "Instagram Feed test publishing is locked. Set META_TEST_PUBLISH_INSTAGRAM_FEED_ENABLED=true only for the controlled manual test.", publish_enabled: false } };
  }
  if (!event.approved_content?.instagram_feed) return { status: 409, body: { error: "Approved Instagram Feed snapshot is required." } };

  const createRequest = buildInstagramFeedCreateRequest({ content: event.approved_content });
  const mediaCheck = await probeImage(createRequest.body.image_url, "Instagram Feed");
  const createPayload = await metaPost(createRequest, pageToken);
  const { media_id } = parseInstagramFeedCreateResponse(createPayload);
  const processing = await waitForInstagramMedia(media_id, pageToken);
  const publishRequest = buildInstagramFeedPublishRequest({ creation_id: media_id });
  const publishPayload = await metaPost(publishRequest, pageToken);
  const publishAttempts = 1;
  const result = parseInstagramFeedPublishResponse(publishPayload);
  await writeAudit(admin.token, event, admin.user.id, "test_instagram_feed_published", {
    channel: "instagram_feed", test_only: true, media_id, post_id: result.post_id,
    content_type: mediaCheck.content_type, source_id: event.source_id,
    processing_attempts: processing.attempts, processing_status_code: processing.status_code,
    publish_attempts: publishAttempts,
    credential_source: credentialSource,
  });
  const archivedEvent = await finalizePublishedEvent(admin.token, event);
  return { status: 200, body: { ok: true, mode: "manual_test_publish", test_only: true, event_id: event.id, archived: Boolean(archivedEvent), published_at: archivedEvent?.published_at || null, credential_source: credentialSource, processing, publish_attempts: publishAttempts, result: { ...result, media_id } } };
}

async function publishInstagramStory(event, admin, pageToken, credentialSource) {
  if (!INSTAGRAM_STORY_TEST_PUBLISH_ENABLED) {
    return { status: 423, body: { error: "Instagram Story test publishing is locked. Set META_TEST_PUBLISH_INSTAGRAM_STORY_ENABLED=true only for the controlled manual test.", publish_enabled: false } };
  }
  const story = event.approved_content?.instagram_story;
  if (!story) return { status: 409, body: { error: "Approved Instagram Story snapshot is required." } };

  const readiness = classifySocialMedia(story.media || null, "instagram_story");
  if (readiness.status !== "ideal") {
    return {
      status: 409,
      body: {
        error: `Instagram Story publish requires IDEAL Story media (9:16 / Story / vertical). Current asset is ${readiness.label}.`,
        media_readiness: readiness,
      },
    };
  }

  const createRequest = buildInstagramStoryCreateRequest({ content: event.approved_content });
  const mediaCheck = await probeImage(createRequest.body.image_url, "Instagram Story");
  const createPayload = await metaPost(createRequest, pageToken);
  const { media_id } = parseInstagramStoryCreateResponse(createPayload);
  const processing = await waitForInstagramMedia(media_id, pageToken);
  const publishRequest = buildInstagramStoryPublishRequest({ creation_id: media_id });
  await sleep(STORY_PUBLISH_INITIAL_DELAY_MS);
  let publishPayload = null;
  let publishAttempts = 0;
  for (let attempt = 1; attempt <= STORY_PUBLISH_MAX_ATTEMPTS; attempt += 1) {
    publishAttempts = attempt;
    try {
      publishPayload = await metaPost(publishRequest, pageToken);
      break;
    } catch (error) {
      const retryable9007 = Number(error?.metaCode) === 9007;
      if (!retryable9007 || attempt === STORY_PUBLISH_MAX_ATTEMPTS) throw error;
      await sleep(STORY_PUBLISH_INITIAL_DELAY_MS * attempt);
    }
  }
  const result = parseInstagramStoryPublishResponse(publishPayload);
  await writeAudit(admin.token, event, admin.user.id, "test_instagram_story_published", {
    channel: "instagram_story", test_only: true, media_id, post_id: result.post_id,
    content_type: mediaCheck.content_type, source_id: event.source_id,
    story_media_format: story.media?.format || null,
    media_readiness: readiness.status,
    processing_attempts: processing.attempts, processing_status_code: processing.status_code,
    credential_source: credentialSource,
  });
  const archivedEvent = await finalizePublishedEvent(admin.token, event);
  return { status: 200, body: { ok: true, mode: "manual_test_publish", test_only: true, event_id: event.id, archived: Boolean(archivedEvent), published_at: archivedEvent?.published_at || null, credential_source: credentialSource, processing, result: { ...result, media_id } } };
}

async function publishFacebookPage(event, admin, pageToken, credentialSource) {
  if (!FACEBOOK_TEST_PUBLISH_ENABLED) {
    return { status: 423, body: { error: "Facebook Page test publishing is locked. Set META_TEST_PUBLISH_FACEBOOK_ENABLED=true only for the controlled manual test.", publish_enabled: false } };
  }
  if (!event.approved_content?.facebook) return { status: 409, body: { error: "Approved Facebook snapshot is required." } };

  const request = buildFacebookPhotoRequest({ content: event.approved_content });
  const mediaCheck = await probeImage(request.body.url, "Facebook Page");
  const payload = await metaPost(request, pageToken);
  const result = parseFacebookPhotoResponse(payload);
  await writeAudit(admin.token, event, admin.user.id, "test_facebook_published", {
    channel: "facebook", test_only: true, media_id: result.media_id, post_id: result.post_id,
    content_type: mediaCheck.content_type, source_id: event.source_id,
    credential_source: credentialSource,
  });
  const archivedEvent = await finalizePublishedEvent(admin.token, event);
  return { status: 200, body: { ok: true, mode: "manual_test_publish", test_only: true, event_id: event.id, archived: Boolean(archivedEvent), published_at: archivedEvent?.published_at || null, credential_source: credentialSource, result } };
}

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });

  const admin = await requireAdmin(req);
  if (admin.error) return json(res, admin.status, { error: admin.error });

  const eventId = String(req.body?.event_id || "").trim();
  const channel = String(req.body?.channel || "instagram_feed").trim();
  if (!eventId) return json(res, 400, { error: "event_id is required." });
  if (!["instagram_feed", "instagram_story", "facebook"].includes(channel)) return json(res, 400, { error: "Unsupported manual Meta test channel." });

  const eventRes = await supabaseFetch(`/rest/v1/social_events?id=eq.${encodeURIComponent(eventId)}&select=*`, admin.token);
  const events = await safeJson(eventRes);
  if (!eventRes.ok) return json(res, 502, { error: `Could not load Social event (${eventRes.status}).` });
  const event = Array.isArray(events) ? events[0] : null;
  if (!event) return json(res, 404, { error: "Social event not found." });
  if (!isControlledPublishEvent(event)) return json(res, 403, { error: "Manual Meta publishing is allowed only for controlled test/replay or manual Product, Hero or Journal Social events." });
  if (!["ready", "scheduled"].includes(event.status)) return json(res, 409, { error: "Test event must be READY or SCHEDULED with an approved snapshot." });

  const priorPublish = await alreadyPublished(admin.token, event.id, channel);
  if (priorPublish) {
    return json(res, 409, {
      error: "This Social event has already been published to this channel. Create a new Social post to publish it again.",
      already_published: true,
      channel,
      published_at: priorPublish.created_at || null,
      result: {
        post_id: priorPublish.details?.post_id || null,
        media_id: priorPublish.details?.media_id || null,
      },
    });
  }

  let credential;
  try {
    credential = await resolveMetaPageAccessToken();
  } catch (error) {
    return json(res, 503, { error: error?.message || "Meta Page credential could not be resolved." });
  }

  try {
    let outcome;
    if (channel === "facebook") outcome = await publishFacebookPage(event, admin, credential.token, credential.source);
    else if (channel === "instagram_story") outcome = await publishInstagramStory(event, admin, credential.token, credential.source);
    else outcome = await publishInstagram(event, admin, credential.token, credential.source);
    return json(res, outcome.status, outcome.body);
  } catch (error) {
    return json(res, 400, { ok: false, mode: "manual_test_publish", test_only: true, channel, credential_source: credential.source, error: error?.message || String(error) });
  }
}
