import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  META_GRAPH_API_VERSION,
  assertMetaPublishLocked,
  buildInstagramStoryCreateRequest,
  parseInstagramStoryCreateResponse,
  buildInstagramStoryPublishRequest,
  parseInstagramStoryPublishResponse,
  buildInstagramStoryDryRun,
  publishInstagramStory,
} from "../src/metaPublishAdapter.mjs";
import { classifySocialMedia } from "../src/socialDraft.mjs";

const input = {
  instagram_account_id: "17841448113014180",
  content: {
    instagram_story: {
      caption: "PlayNice Story test caption",
      media: {
        src: "https://www.playniceshop.me/hero/story-test.jpg",
        format: "9:16",
      },
    },
  },
};

const createRequest = buildInstagramStoryCreateRequest(input);
assert.equal(createRequest.method, "POST");
assert.equal(createRequest.url, `https://graph.facebook.com/${META_GRAPH_API_VERSION}/17841448113014180/media`);
assert.equal(createRequest.auth, "bearer");
assert.deepEqual(createRequest.body, {
  image_url: "https://www.playniceshop.me/hero/story-test.jpg",
  media_type: "STORIES",
});
assert.equal("caption" in createRequest.body, false, "Story v1 must publish image-only media without caption transport.");

const created = parseInstagramStoryCreateResponse({ id: "story-container-123" });
assert.equal(created.media_id, "story-container-123");

const publishRequest = buildInstagramStoryPublishRequest({
  instagram_account_id: "17841448113014180",
  creation_id: created.media_id,
});
assert.equal(publishRequest.method, "POST");
assert.equal(publishRequest.url, `https://graph.facebook.com/${META_GRAPH_API_VERSION}/17841448113014180/media_publish`);
assert.deepEqual(publishRequest.body, { creation_id: "story-container-123" });

const published = parseInstagramStoryPublishResponse({ id: "ig-story-456" }, "2026-09-15T20:00:00.000Z");
assert.equal(published.ok, true);
assert.equal(published.status, "published");
assert.equal(published.channel, "instagram_story");
assert.equal(published.post_id, "ig-story-456");
assert.equal(published.provider_id, "ig-story-456");
assert.equal(published.published_at, "2026-09-15T20:00:00.000Z");

const dryRun = buildInstagramStoryDryRun(input);
assert.equal(dryRun.channel, "instagram_story");
assert.equal(dryRun.sends_network_request, false);
assert.equal(dryRun.token_included, false);
assert.equal(dryRun.create.url.endsWith("/17841448113014180/media"), true);
assert.deepEqual(dryRun.create.body, {
  image_url: "https://www.playniceshop.me/hero/story-test.jpg",
  media_type: "STORIES",
});
assert.equal(dryRun.publish_template.url.endsWith("/17841448113014180/media_publish"), true);

assert.throws(
  () => buildInstagramStoryCreateRequest({
    instagram_account_id: "17841448113014180",
    image_url: "http://example.com/story.jpg",
  }),
  /public HTTPS image URL/,
);

const idealStory = classifySocialMedia({ src: "https://www.playniceshop.me/story.jpg", format: "9:16" }, "instagram_story");
assert.equal(idealStory.status, "ideal");
assert.equal(idealStory.blocking, false);

const fallbackStory = classifySocialMedia({ src: "https://www.playniceshop.me/mobile.jpg", format: "hero_mobile" }, "instagram_story");
assert.equal(fallbackStory.status, "fallback");
assert.equal(fallbackStory.label, "FALLBACK");

assert.equal(assertMetaPublishLocked("instagram_story")?.reason, "PUBLISH_LOCKED");
const locked = await publishInstagramStory(input);
assert.equal(locked.ok, false);
assert.equal(locked.status, "locked");
assert.equal(locked.reason, "PUBLISH_LOCKED");
assert.equal(locked.channel, "instagram_story");

const root = process.cwd();
const endpointSource = fs.readFileSync(path.join(root, "control-center/api/social-instagram-feed-test-publish.js"), "utf8");
const bridgeSource = fs.readFileSync(path.join(root, "control-center/src/SocialInstagramStoryTestPublishBridge.jsx"), "utf8");
assert.ok(endpointSource.includes('classifySocialMedia(story.media || null, "instagram_story")'), "Story endpoint must classify approved Story media before transport.");
assert.ok(endpointSource.includes('readiness.status !== "ideal"'), "Story endpoint must reject non-ideal media.");
assert.ok(bridgeSource.includes('FALLBACK · DO NOT PUBLISH TO STORY') || bridgeSource.includes('DO NOT PUBLISH TO STORY'), "Story UI must label fallback media as non-publishable.");
assert.ok(bridgeSource.includes('disabled={!storyReady || loading || Boolean(published)}'), "Story publish button must stay disabled unless ideal Story media is ready and must remain locked after publication.");

console.log("PASS  Instagram Story adapter builds media_type=STORIES create request");
console.log("PASS  Instagram Story response parsing keeps published Story id");
console.log("PASS  Instagram Story global publishing remains hard locked");
console.log("PASS  Instagram Story manual transport is blocked for fallback media");
