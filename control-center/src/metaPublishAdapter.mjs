import { SOCIAL_SHADOW_MODE } from "./socialEvent.mjs";

export const META_PUBLISH_ENABLED = false;
export const META_PUBLISH_RESULT_VERSION = 1;

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

export function assertMetaPublishLocked(channel = "unknown") {
  if (SOCIAL_SHADOW_MODE || !META_PUBLISH_ENABLED) return lockedResult(channel);
  return null;
}

export async function publishInstagramFeed(input = {}) {
  const locked = assertMetaPublishLocked("instagram_feed");
  if (locked) return locked;
  return lockedResult("instagram_feed", { reason: "ADAPTER_NOT_IMPLEMENTED", input_received: Boolean(input) });
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
    return {
      ok: false,
      status: "failed",
      reason: "UNSUPPORTED_CHANNEL",
      channel,
      provider: "meta",
      publish_result_version: META_PUBLISH_RESULT_VERSION,
      provider_id: null,
      media_id: null,
      post_id: null,
      published_at: null,
    };
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
