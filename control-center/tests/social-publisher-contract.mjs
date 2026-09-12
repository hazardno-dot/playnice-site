import assert from "node:assert/strict";
import { SOCIAL_SHADOW_MODE, normalizeSocialEvent, socialEventDedupeKey, canPublishSocialEvent } from "../src/socialEvent.mjs";
import { generateSocialDraft } from "../src/socialDraft.mjs";

const event = normalizeSocialEvent({
  event_type: "product_published",
  source_type: "product",
  source_id: "test-fragrance",
  source_url: "/product/test-fragrance",
  payload: {
    name: "Test Fragrance",
    shortName: "Test Fragrance",
    sizes: { "5ml": 9, "10ml": 16 },
    copy: { miniTag: { sr: "Novo u PlayNice." }, card: { sr: "Čist, moderan i lako nosiv." } },
  },
  media: [{ src: "https://www.playniceshop.me/products/test.webp", format: "1:1" }],
});

assert.equal(SOCIAL_SHADOW_MODE, true, "v1 must remain in shadow mode");
assert.equal(event.status, "draft");
assert.equal(event.publish_mode, "shadow");
assert.deepEqual(event.channels, ["instagram_feed", "instagram_story", "facebook"]);
assert.equal(socialEventDedupeKey(event), "product_published:product:test-fragrance");
assert.deepEqual(canPublishSocialEvent({ ...event, status: "ready" }), { ok: false, reason: "shadow_mode" });

const draft = generateSocialDraft(event);
assert.match(draft.instagram_feed.caption, /Test Fragrance/);
assert.match(draft.instagram_feed.caption, /5ml · €9/);
assert.match(draft.instagram_feed.caption, /playniceshop\.me\/product\/test-fragrance/);
assert.equal(draft.instagram_feed.media.format, "1:1");
assert.match(draft.facebook.caption, /Čist, moderan i lako nosiv/);

assert.throws(() => normalizeSocialEvent({ event_type: "bad", source_type: "product", source_id: "x" }), /Unsupported social event type/);
assert.throws(() => generateSocialDraft({ source_type: "unknown" }), /No social draft generator/);

console.log("PASS  Social Publisher shadow-mode contract");
