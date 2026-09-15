import assert from "node:assert/strict";
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

assert.equal(assertMetaPublishLocked("instagram_story")?.reason, "PUBLISH_LOCKED");
const locked = await publishInstagramStory(input);
assert.equal(locked.ok, false);
assert.equal(locked.status, "locked");
assert.equal(locked.reason, "PUBLISH_LOCKED");
assert.equal(locked.channel, "instagram_story");

console.log("PASS  Instagram Story adapter builds media_type=STORIES create request");
console.log("PASS  Instagram Story response parsing keeps published Story id");
console.log("PASS  Instagram Story global publishing remains hard locked");
