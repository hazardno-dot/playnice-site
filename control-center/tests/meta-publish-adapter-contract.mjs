import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  META_PUBLISH_ENABLED,
  META_PUBLISH_RESULT_VERSION,
  META_GRAPH_API_VERSION,
  assertMetaPublishLocked,
  buildInstagramFeedCreateRequest,
  parseInstagramFeedCreateResponse,
  buildInstagramFeedPublishRequest,
  parseInstagramFeedPublishResponse,
  buildInstagramFeedDryRun,
  publishInstagramFeed,
  publishInstagramStory,
  publishFacebook,
  publishSocialChannel,
  publishSocialEvent,
} from "../src/metaPublishAdapter.mjs";

assert.equal(META_PUBLISH_ENABLED, false, "Meta publishing must remain disabled while the real transport is being prepared.");
assert.equal(META_PUBLISH_RESULT_VERSION, 1);
assert.equal(assertMetaPublishLocked("instagram_feed")?.reason, "PUBLISH_LOCKED");

const igInput = {
  instagram_account_id: "17841448113014180",
  content: {
    instagram_feed: {
      caption: "PlayNice test caption",
      media: {
        src: "https://www.playniceshop.me/products/test.webp",
        format: "1:1",
      },
    },
  },
};

const createRequest = buildInstagramFeedCreateRequest(igInput);
assert.equal(createRequest.method, "POST");
assert.equal(createRequest.url, `https://graph.facebook.com/${META_GRAPH_API_VERSION}/17841448113014180/media`);
assert.equal(createRequest.auth, "bearer");
assert.deepEqual(createRequest.body, {
  image_url: "https://www.playniceshop.me/products/test.webp",
  caption: "PlayNice test caption",
});
assert.equal("access_token" in createRequest.body, false, "Dry-run payload must never expose the Meta token.");

const created = parseInstagramFeedCreateResponse({ id: "media-container-123" });
assert.equal(created.media_id, "media-container-123");

const publishRequest = buildInstagramFeedPublishRequest({
  instagram_account_id: "17841448113014180",
  creation_id: created.media_id,
});
assert.equal(publishRequest.method, "POST");
assert.equal(publishRequest.url, `https://graph.facebook.com/${META_GRAPH_API_VERSION}/17841448113014180/media_publish`);
assert.deepEqual(publishRequest.body, { creation_id: "media-container-123" });

const published = parseInstagramFeedPublishResponse({ id: "ig-post-456" }, "2026-09-15T12:00:00.000Z");
assert.equal(published.ok, true);
assert.equal(published.status, "published");
assert.equal(published.post_id, "ig-post-456");
assert.equal(published.provider_id, "ig-post-456");
assert.equal(published.published_at, "2026-09-15T12:00:00.000Z");

const dryRun = buildInstagramFeedDryRun(igInput);
assert.equal(dryRun.channel, "instagram_feed");
assert.equal(dryRun.sends_network_request, false);
assert.equal(dryRun.token_included, false);
assert.equal(dryRun.create.url.endsWith("/17841448113014180/media"), true);
assert.equal(dryRun.publish_template.url.endsWith("/17841448113014180/media_publish"), true);
assert.deepEqual(dryRun.publish_template.body, { creation_id: "<MEDIA_CONTAINER_ID>" });

assert.throws(
  () => buildInstagramFeedCreateRequest({ instagram_account_id: "17841448113014180", caption: "x", image_url: "http://example.com/test.jpg" }),
  /public HTTPS image URL/
);

for (const [channel, publisher] of [
  ["instagram_feed", publishInstagramFeed],
  ["instagram_story", publishInstagramStory],
  ["facebook", publishFacebook],
]) {
  const result = await publisher(igInput);
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
  approved_content: igInput.content,
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
  "buildInstagramFeedCreateRequest",
  "buildInstagramFeedPublishRequest",
  "buildInstagramFeedDryRun",
  "parseInstagramFeedCreateResponse",
  "parseInstagramFeedPublishResponse",
  "PUBLISH_LOCKED",
  "META_PUBLISH_ENABLED = false",
  "graph.facebook.com",
  "/media_publish",
  "provider_id: null",
  "media_id: null",
  "post_id: null",
]) {
  assert.ok(adapterSource.includes(token), `Meta adapter contract missing: ${token}`);
}

assert.ok(publishApiSource.includes("META_PUBLISH_ENABLED"), "Publish API must enforce the adapter-level hard lock.");
assert.ok(publishApiSource.includes("PUBLISH_LOCKED"), "Publish API must expose the hard-lock reason.");
assert.ok(publishApiSource.indexOf("SOCIAL_SHADOW_MODE || !META_PUBLISH_ENABLED") < publishApiSource.indexOf("publishSocialEvent(event)"), "Hard lock must run before any adapter execution.");
assert.ok(!adapterSource.includes("fetch("), "Instagram Feed adapter v1 must remain dry-run only; no network transport is allowed yet.");
assert.ok(!adapterSource.includes("META_PAGE_ACCESS_TOKEN"), "Dry-run adapter must not read or expose the Page access token yet.");

console.log("PASS  Instagram Feed adapter builds the real Meta Graph create + publish request contract");
console.log("PASS  Instagram Feed dry run excludes secrets and performs no network request");
console.log("PASS  Global Meta publish lock still executes before any transport path");
