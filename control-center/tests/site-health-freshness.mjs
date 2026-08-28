import assert from "node:assert/strict";
import { SITE_HEALTH_STALE_AFTER_MS, getSiteHealthFreshness, getOverviewHealthState } from "../src/siteHealthFreshness.mjs";

const now = Date.UTC(2026, 7, 27, 20, 0, 0);
const freshAt = new Date(now - SITE_HEALTH_STALE_AFTER_MS + 1000).toISOString();
const staleAt = new Date(now - SITE_HEALTH_STALE_AFTER_MS).toISOString();

assert.equal(getSiteHealthFreshness(freshAt, now).stale, false, "check just inside 24h must remain fresh");
assert.equal(getSiteHealthFreshness(staleAt, now).stale, true, "check at 24h must become stale");
assert.equal(getOverviewHealthState({ checked_at: staleAt, overall: "healthy" }, "", now).state, "stale", "stale healthy result must not remain green");
assert.equal(getOverviewHealthState({ checked_at: staleAt, overall: "warning" }, "", now).state, "warning", "known warning must outrank stale state");
assert.equal(getOverviewHealthState({ checked_at: staleAt, overall: "error" }, "", now).state, "error", "known error must outrank stale state");
assert.equal(getOverviewHealthState(null, "", now).state, "stale", "missing baseline must be stale/unknown rather than healthy");
assert.equal(getOverviewHealthState(null, "history unavailable", now).state, "error", "history read failure must surface as error");

console.log("PASS  Site Health freshness threshold is exactly 24 hours");
console.log("PASS  stale healthy checks cannot remain green on Overview");
console.log("PASS  warning/error incidents retain priority over freshness state");
