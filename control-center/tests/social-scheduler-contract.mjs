import assert from "node:assert/strict";
import {
  buildShadowExecution,
  retryPlan,
  schedulerIdempotencyKey,
  validateScheduledSnapshot,
} from "../src/socialScheduler.mjs";

const due = {
  id: "11111111-1111-4111-8111-111111111111",
  status: "scheduled",
  publish_mode: "shadow",
  scheduled_for: "2026-09-16T00:00:00.000Z",
  approved_at: "2026-09-15T23:00:00.000Z",
  retry_count: 0,
  approved_content: {
    instagram_feed: { caption: "feed frozen", media: { src: "https://example.com/feed.jpg" } },
    instagram_story: { caption: "story frozen", media: { src: "https://example.com/story.jpg" } },
    facebook: { caption: "facebook frozen", media: { src: "https://example.com/facebook.jpg" } },
  },
  draft_content: {
    instagram_feed: { caption: "MUTABLE DRAFT MUST NOT BE USED" },
  },
};

const now = new Date("2026-09-16T00:05:00.000Z");
const validation = validateScheduledSnapshot(due, now);
assert.equal(validation.due, true);
assert.equal(validation.channels.length, 3);
assert.equal(
  schedulerIdempotencyKey(due),
  "11111111-1111-4111-8111-111111111111:2026-09-15T23:00:00.000Z:2026-09-16T00:00:00.000Z",
);
assert.equal(schedulerIdempotencyKey(due), schedulerIdempotencyKey({ ...due }));

const execution = buildShadowExecution(due, now);
assert.equal(execution.mode, "shadow");
assert.equal(execution.network_requested, false);
assert.equal(execution.meta_publish_requested, false);
assert.equal(execution.channels[0].caption, "feed frozen");
assert.notEqual(execution.channels[0].caption, due.draft_content.instagram_feed.caption);

assert.throws(
  () => validateScheduledSnapshot({ ...due, scheduled_for: "2026-09-16T01:00:00.000Z" }, now),
  /not due yet/i,
);
assert.throws(
  () => buildShadowExecution({ ...due, publish_mode: "auto" }, now),
  /refuses publish_mode=auto/i,
);
assert.throws(
  () => validateScheduledSnapshot({ ...due, approved_content: null }, now),
  /frozen approved_content/i,
);

const retry1 = retryPlan(0, now);
assert.equal(retry1.retry_count, 1);
assert.equal(retry1.exhausted, false);
assert.equal(retry1.next_retry_at, "2026-09-16T00:10:00.000Z");

const retry2 = retryPlan(1, now);
assert.equal(retry2.retry_count, 2);
assert.equal(retry2.exhausted, false);
assert.equal(retry2.next_retry_at, "2026-09-16T00:20:00.000Z");

const retry3 = retryPlan(2, now);
assert.equal(retry3.retry_count, 3);
assert.equal(retry3.exhausted, true);
assert.equal(retry3.next_retry_at, null);

console.log("PASS  Social scheduler shadow/idempotency/retry contract");
