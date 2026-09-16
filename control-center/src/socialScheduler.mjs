export const SOCIAL_SCHEDULER_MAX_RETRIES = 3;
export const SOCIAL_SCHEDULER_BACKOFF_MINUTES = [5, 15, 60];

export function schedulerIdempotencyKey(event) {
  const id = String(event?.id || "").trim();
  const approvedAt = String(event?.approved_at || "").trim();
  const scheduledFor = String(event?.scheduled_for || "").trim();
  if (!id || !scheduledFor) throw new Error("Scheduler event is missing id or scheduled_for.");
  return `${id}:${approvedAt || "approved"}:${scheduledFor}`;
}

export function validateScheduledSnapshot(event, now = new Date()) {
  if (!event || typeof event !== "object") throw new Error("Scheduler event is required.");
  if (event.status !== "scheduled") throw new Error(`Scheduler requires SCHEDULED status, received ${String(event.status || "missing").toUpperCase()}.`);
  if (!event.scheduled_for) throw new Error("Scheduled event is missing scheduled_for.");
  const scheduledFor = new Date(event.scheduled_for);
  if (!Number.isFinite(scheduledFor.getTime())) throw new Error("scheduled_for is invalid.");
  if (scheduledFor.getTime() > now.getTime()) throw new Error("Scheduled event is not due yet.");
  if (!event.approved_content || typeof event.approved_content !== "object") throw new Error("Scheduled event is missing frozen approved_content.");
  const channels = ["instagram_feed", "instagram_story", "facebook"];
  for (const channel of channels) {
    const content = event.approved_content[channel];
    const media = content?.media;
    const src = String(media?.src || media?.url || "").trim();
    if (!content || !src) throw new Error(`Approved snapshot is missing ${channel} media.`);
  }
  return {
    due: true,
    channels,
    idempotency_key: schedulerIdempotencyKey(event),
    scheduled_for: scheduledFor.toISOString(),
  };
}

export function retryPlan(retryCount, now = new Date()) {
  const current = Math.max(0, Number(retryCount) || 0);
  const nextCount = current + 1;
  const exhausted = nextCount >= SOCIAL_SCHEDULER_MAX_RETRIES;
  if (exhausted) return { retry_count: nextCount, exhausted: true, next_retry_at: null };
  const index = Math.min(current, SOCIAL_SCHEDULER_BACKOFF_MINUTES.length - 1);
  const minutes = SOCIAL_SCHEDULER_BACKOFF_MINUTES[index];
  return {
    retry_count: nextCount,
    exhausted: false,
    next_retry_at: new Date(now.getTime() + minutes * 60 * 1000).toISOString(),
  };
}

export function buildShadowExecution(event, now = new Date()) {
  const validation = validateScheduledSnapshot(event, now);
  if (event.publish_mode !== "shadow") {
    throw new Error(`Shadow executor refuses publish_mode=${String(event.publish_mode || "missing")}.`);
  }
  return {
    mode: "shadow",
    network_requested: false,
    meta_publish_requested: false,
    idempotency_key: validation.idempotency_key,
    event_id: event.id,
    scheduled_for: validation.scheduled_for,
    executed_at: now.toISOString(),
    channels: validation.channels.map((channel) => ({
      channel,
      action: "would_publish",
      media_url: String(event.approved_content[channel]?.media?.src || event.approved_content[channel]?.media?.url || ""),
      caption: String(event.approved_content[channel]?.caption || ""),
    })),
  };
}
