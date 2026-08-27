export const SITE_HEALTH_STALE_AFTER_MS = 24 * 60 * 60 * 1000;

export function getSiteHealthFreshness(checkedAt, now = Date.now()) {
  if (!checkedAt) return { stale: true, ageMs: null, label: "no check recorded" };
  const timestamp = new Date(checkedAt).getTime();
  if (!Number.isFinite(timestamp)) return { stale: true, ageMs: null, label: "invalid check time" };
  const ageMs = Math.max(0, Number(now) - timestamp);
  return {
    stale: ageMs >= SITE_HEALTH_STALE_AFTER_MS,
    ageMs,
    label: ageMs >= SITE_HEALTH_STALE_AFTER_MS ? "health check is stale" : "health check is fresh",
  };
}

export function getOverviewHealthState(latest, error, now = Date.now()) {
  if (error) return { state: "error", stale: false, freshness: null };
  if (!latest) return { state: "stale", stale: true, freshness: getSiteHealthFreshness(null, now) };
  const freshness = getSiteHealthFreshness(latest.checked_at, now);
  return {
    state: freshness.stale ? "stale" : (latest.overall || "unknown"),
    stale: freshness.stale,
    freshness,
  };
}
