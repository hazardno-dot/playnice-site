import { SOCIAL_SHADOW_MODE } from "./socialEvent.mjs";

export const META_PUBLISH_ENABLED = false;
export const META_PUBLISH_RESULT_VERSION = 1;
export const META_GRAPH_HOST = "https://graph.facebook.com";
export const META_GRAPH_API_VERSION = process.env.META_GRAPH_API_VERSION || "v26.0";

const lockedResult = (channel, extra = {}) => ({
  ok: false,
  status: "locked",
  reason: "PUBLISH_LOCKED",
  channel,
  provider: "meta",
  publish_result_version: META_PUBLISH_RESULT_VERSION,
  provider_id: null,
  media_id: null,
  post_id: null,
  published_at: null,
  ...extra,
});

const failedResult = (channel, reason, extra = {}) => ({
  ok: false,
  status: "failed",
  reason,
  channel,
  provider: "meta",
  publish_result_version: META_PUBLISH_RESULT_VERSION,
  provider_id: null,
  media_id: null,
  post_id: null,
  published_at: null,
  ...extra,
});

const graphUrl = (path) => `${META_GRAPH_HOST}/${META_GRAPH_API_VERSION}/${String(path || "").replace(/^\/+/, "")}`;
const cleanString = (value) => String(value || "").trim();

function instagramFeedContent(input = {}) {
  const content = input?.content?.instagram_feed || input?.content || {};
  return content && typeof content === "object" ? content : {};
}

export function buildInstagramFeedCreateRequest(input = {}) {
  const igAccountId = cleanString(input.instagram_account_id || process.env.META_INSTAGRAM_ACCOUNT_ID);
  const content = instagramFeedContent(input);
  const imageUrl = cleanString(content?.media?.src || content?.media?.url || input.image_url);
  const caption = cleanString(content?.caption || input.caption);

  if (!igAccountId) throw new Error("META_INSTAGRAM_ACCOUNT_ID is required for Instagram Feed publishing.");
  if (!imageUrl || !/^https:\/\//i.test(imageUrl)) throw new Error("Instagram Feed requires a public HTTPS image URL.");
  if (!caption) throw new Error("Instagram Feed requires a caption.");

  return {
    method: "POST",
    url: graphUrl(`${igAccountId}/media`),
    auth: "bearer",
    body: {
      image_url: imageUrl,
      caption,
    },
  };
}

export function parseInstagramFeedCreateResponse(payload = {}) {
  const mediaId = cleanString(payload?.id);
  if (!mediaId) throw new Error("Instagram media creation response did not include an id.");
  return { media_id: mediaId };
}

export function buildInstagramFeedPublishRequest(input = {}) {
  const igAccountId = cleanString(input.instagram_account_id || process.env.META_INSTAGRAM_ACCOUNT_ID);
  const creationId = cleanString(input.creation_id || input.media_id);

  if (!igAccountId) throw new Error("META_INSTAGRAM_ACCOUNT_ID is required for Instagram Feed publishing.");
  if (!creationId) throw new Error("Instagram Feed publish requires a creation_id.");

  return {
    method: "POST",
    url: graphUrl(`${igAccountId}/media_publish`),
    auth: "bearer",
    body: {
      creation_id: creationId,
    },
  };
}

export function parseInstagramFeedPublishResponse(payload = {}, publishedAt = new Date().toISOString()) {
  const postId = cleanString(payload?.id);
  if (!postId) throw new Error("Instagram media publish response did not include an id.");
  return {
    ok: true,
    status: "published",
    reason: null,
    channel: "instagram_feed",
    provider: "meta",
    publish_result_version: META_PUBLISH_RESULT_VERSION,
    provider_id: postId,
    media_id: null,
    post_id: postId,
    published_at: publishedAt,
  };
}

export function buildInstagramFeedDryRun(input = {}) {
  const create = buildInstagramFeedCreateRequest(input);
  return {
    channel: "instagram_feed",
    provider: "meta",
    graph_api_version: META_GRAPH_API_VERSION,
    create,
    publish_template: {
      method: "POST",
      url: graphUrl(`${cleanString(input.instagram_account_id || process.env.META_INSTAGRAM_ACCOUNT_ID)}/media_publish`),
      auth: "bearer",
      body: { creation_id: "<MEDIA_CONTAINER_ID>" },
    },
    sends_network_request: false,
    token_included: false,
  };
}

export function assertMetaPublishLocked(channel = "unknown") {
  if (SOCIAL_SHADOW_MODE || !META_PUBLISH_ENABLED) return lockedResult(channel);
  return null;
}

export async function publishInstagramFeed(input = {}) {
  const locked = assertMetaPublishLocked("instagram_feed");
  if (locked) return locked;

  try {
    const dryRun = buildInstagramFeedDryRun(input);
    return failedResult("instagram_feed", "TRANSPORT_NOT_ENABLED", { dry_run: dryRun });
  } catch (error) {
    return failedResult("instagram_feed", "INVALID_INSTAGRAM_FEED_PAYLOAD", { message: error?.message || String(error) });
  }
}

export async function publishInstagramStory(input = {}) {
  const locked = assertMetaPublishLocked("instagram_story");
  if (locked) return locked;
  return lockedResult("instagram_story", { reason: "ADAPTER_NOT_IMPLEMENTED", input_received: Boolean(input) });
}

export async function publishFacebook(input = {}) {
  const locked = assertMetaPublishLocked("facebook");
  if (locked) return locked;
  return lockedResult("facebook", { reason: "ADAPTER_NOT_IMPLEMENTED", input_received: Boolean(input) });
}

const PUBLISHERS = {
  instagram_feed: publishInstagramFeed,
  instagram_story: publishInstagramStory,
  facebook: publishFacebook,
};

export async function publishSocialChannel(channel, input = {}) {
  const publisher = PUBLISHERS[channel];
  if (!publisher) {
    return failedResult(channel, "UNSUPPORTED_CHANNEL");
  }
  return publisher(input);
}

export async function publishSocialEvent(event = {}) {
  const channels = Array.isArray(event.channels) ? event.channels : [];
  const results = {};
  for (const channel of channels) {
    results[channel] = await publishSocialChannel(channel, {
      event_id: event.id || null,
      source_type: event.source_type || null,
      source_id: event.source_id || null,
      content: event.approved_content || event.draft_content || null,
    });
  }

  const values = Object.values(results);
  return {
    ok: values.length > 0 && values.every((result) => result.ok),
    status: values.some((result) => result.status === "locked") ? "locked" : values.every((result) => result.ok) ? "published" : "failed",
    reason: values.find((result) => !result.ok)?.reason || null,
    results,
  };
}
