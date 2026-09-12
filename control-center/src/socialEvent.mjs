export const SOCIAL_SOURCE_TYPES = ["product", "hero", "journal"];
export const SOCIAL_EVENT_TYPES = ["product_published", "hero_published", "journal_published"];
export const SOCIAL_CHANNELS = ["instagram_feed", "instagram_story", "facebook"];
export const SOCIAL_STATUSES = ["draft", "ready", "scheduled", "published", "failed", "cancelled"];

export const SOCIAL_SHADOW_MODE = true;

export function normalizeSocialEvent(input = {}) {
  const sourceType = String(input.source_type || "").trim();
  const eventType = String(input.event_type || "").trim();
  if (!SOCIAL_SOURCE_TYPES.includes(sourceType)) throw new Error(`Unsupported social source type: ${sourceType || "empty"}`);
  if (!SOCIAL_EVENT_TYPES.includes(eventType)) throw new Error(`Unsupported social event type: ${eventType || "empty"}`);

  const sourceId = String(input.source_id || "").trim();
  if (!sourceId) throw new Error("source_id is required");

  const channels = Array.isArray(input.channels) ? input.channels.filter((channel) => SOCIAL_CHANNELS.includes(channel)) : [];
  const uniqueChannels = [...new Set(channels.length ? channels : SOCIAL_CHANNELS)];

  return {
    event_type: eventType,
    source_type: sourceType,
    source_id: sourceId,
    source_url: String(input.source_url || "").trim() || null,
    payload: input.payload && typeof input.payload === "object" ? input.payload : {},
    media: Array.isArray(input.media) ? input.media : [],
    channels: uniqueChannels,
    status: "draft",
    publish_mode: "shadow",
  };
}

export function socialEventDedupeKey(event = {}) {
  return `${event.event_type || "unknown"}:${event.source_type || "unknown"}:${event.source_id || "unknown"}`;
}

export function canPublishSocialEvent(event = {}) {
  if (SOCIAL_SHADOW_MODE) return { ok: false, reason: "shadow_mode" };
  if (event.status !== "ready") return { ok: false, reason: "not_ready" };
  return { ok: true, reason: null };
}
