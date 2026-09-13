import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  META_PUBLISH_ENABLED,
  META_PUBLISH_RESULT_VERSION,
  assertMetaPublishLocked,
  publishInstagramFeed,
  publishInstagramStory,
  publishFacebook,
  publishSocialChannel,
  publishSocialEvent,
} from "../src/metaPublishAdapter.mjs";

assert.equal(META_PUBLISH_ENABLED, false, "Meta publishing must remain disabled in the adapter skeleton.");
assert.equal(META_PUBLISH_RESULT_VERSION, 1);
assert.equal(assertMetaPublishLocked("instagram_feed")?.reason, "PUBLISH_LOCKED");

for (const [channel, publisher] of [
  ["instagram_feed", publishInstagramFeed],
  ["instagram_story", publishInstagramStory],
  ["facebook", publishFacebook],
]) {
  const result = await publisher({ caption: "test" });
  assert.equal(result.ok, false);
  assert.equal(result.status, "locked");
  assert.equal(result.reason, "PUBLISH_LOCKED");
  assert.equal(result.channel, channel);
  assert.equal(result.provider, "meta");
  assert.equal(result.media_id, null);
  assert.equal(result.post_id, null);
  assert.equal(result.published_at, null);
}

const unsupported = await publishSocialChannel("unknown", {});
assert.equal(unsupported.ok, false);
assert.equal(unsupported.reason, "UNSUPPORTED_CHANNEL");

const eventResult = await publishSocialEvent({
  id: "shadow-test",
  source_type: "product",
  source_id: "test-fragrance",
  channels: ["instagram_feed", "instagram_story", "facebook"],
  approved_content: { instagram_feed: {}, instagram_story: {}, facebook: {} },
});
assert.equal(eventResult.ok, false);
assert.equal(eventResult.status, "locked");
assert.equal(eventResult.reason, "PUBLISH_LOCKED");
assert.deepEqual(Object.keys(eventResult.results), ["instagram_feed", "instagram_story", "facebook"]);

const root = process.cwd();
const adapterSource = fs.readFileSync(path.join(root, "control-center/src/metaPublishAdapter.mjs"), "utf8");
const publishApiSource = fs.readFileSync(path.join(root, "control-center/api/social-publish.js"), "utf8");

for (const token of [
  "publishInstagramFeed",
  "publishInstagramStory",
  "publishFacebook",
  "publishSocialChannel",
  "publishSocialEvent",
  "PUBLISH_LOCKED",
  "META_PUBLISH_ENABLED = false",
  "provider_id: null",
  "media_id: null",
  "post_id: null",
]) {
  assert.ok(adapterSource.includes(token), `Meta adapter skeleton missing: ${token}`);
}

assert.ok(publishApiSource.includes("META_PUBLISH_ENABLED"), "Publish API must enforce the adapter-level hard lock.");
assert.ok(publishApiSource.includes("PUBLISH_LOCKED"), "Publish API must expose the hard-lock reason.");
assert.ok(publishApiSource.indexOf("SOCIAL_SHADOW_MODE || !META_PUBLISH_ENABLED") < publishApiSource.indexOf("publishSocialEvent(event)"), "Hard lock must run before any adapter execution.");
assert.ok(!adapterSource.includes("graph.facebook.com"), "Adapter skeleton must not contain a live Graph API host.");
assert.ok(!adapterSource.includes("/media_publish"), "Adapter skeleton must not contain an Instagram publish endpoint.");
assert.ok(!adapterSource.includes("/feed"), "Adapter skeleton must not contain a Facebook publish endpoint.");
assert.ok(!adapterSource.includes("fetch("), "Adapter skeleton must not make network requests while publishing is locked.");

console.log("PASS  Meta publish adapter skeleton exposes Feed, Story and Facebook contracts");
console.log("PASS  Unified publish results reserve provider/media/post IDs without performing network calls");
console.log("PASS  PUBLISH_LOCKED executes before any future Meta transport path");
