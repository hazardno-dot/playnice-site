import assert from "node:assert/strict";
import {
  META_GRAPH_API_VERSION,
  assertMetaPublishLocked,
  buildFacebookPhotoRequest,
  parseFacebookPhotoResponse,
  buildFacebookDryRun,
  publishFacebook,
} from "../src/metaPublishAdapter.mjs";

const input = {
  facebook_page_id: "1297113606809783",
  content: {
    facebook: {
      caption: "PlayNice Facebook test caption",
      media: {
        src: "https://www.playniceshop.me/hero/test.jpg",
        format: "1:1",
      },
    },
  },
};

const request = buildFacebookPhotoRequest(input);
assert.equal(request.method, "POST");
assert.equal(request.url, `https://graph.facebook.com/${META_GRAPH_API_VERSION}/1297113606809783/photos`);
assert.equal(request.auth, "bearer");
assert.deepEqual(request.body, {
  url: "https://www.playniceshop.me/hero/test.jpg",
  message: "PlayNice Facebook test caption",
  published: true,
});

const parsed = parseFacebookPhotoResponse(
  { id: "fb-photo-123", post_id: "1297113606809783_456" },
  "2026-09-15T12:05:00.000Z",
);
assert.equal(parsed.ok, true);
assert.equal(parsed.channel, "facebook");
assert.equal(parsed.media_id, "fb-photo-123");
assert.equal(parsed.post_id, "1297113606809783_456");
assert.equal(parsed.provider_id, "1297113606809783_456");
assert.equal(parsed.published_at, "2026-09-15T12:05:00.000Z");

const dryRun = buildFacebookDryRun(input);
assert.equal(dryRun.channel, "facebook");
assert.equal(dryRun.sends_network_request, false);
assert.equal(dryRun.token_included, false);
assert.equal(dryRun.publish.url.endsWith("/1297113606809783/photos"), true);

assert.throws(
  () => buildFacebookPhotoRequest({
    facebook_page_id: "1297113606809783",
    caption: "x",
    image_url: "http://example.com/test.jpg",
  }),
  /public HTTPS image URL/,
);

assert.equal(assertMetaPublishLocked("facebook")?.reason, "PUBLISH_LOCKED");
const locked = await publishFacebook(input);
assert.equal(locked.ok, false);
assert.equal(locked.status, "locked");
assert.equal(locked.reason, "PUBLISH_LOCKED");
assert.equal(locked.channel, "facebook");

console.log("PASS  Facebook Page adapter builds the /PAGE_ID/photos request contract");
console.log("PASS  Facebook Page response parsing keeps photo and post ids");
console.log("PASS  Facebook Page global publishing remains hard locked");
