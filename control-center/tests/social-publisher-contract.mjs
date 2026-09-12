import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { SOCIAL_SHADOW_MODE, normalizeSocialEvent, socialEventDedupeKey, canPublishSocialEvent } from "../src/socialEvent.mjs";
import { generateSocialDraft, resolveEventMedia, selectSocialMedia } from "../src/socialDraft.mjs";

const event = normalizeSocialEvent({
  event_type: "product_published",
  source_type: "product",
  source_id: "test-fragrance",
  source_url: "/product/test-fragrance",
  payload: {
    name: "Test Fragrance",
    shortName: "Test Fragrance",
    image: "/products/test.webp",
    sizes: { "5ml": 9, "10ml": 16 },
    copy: { miniTag: { sr: "Novo u PlayNice." }, card: { sr: "Čist, moderan i lako nosiv." } },
  },
  media: [
    { src: "https://www.playniceshop.me/products/test-square.webp", format: "1:1" },
    { src: "https://www.playniceshop.me/products/test-story.webp", format: "9:16" },
  ],
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
assert.equal(draft.instagram_story.media.format, "9:16");
assert.equal(draft.facebook.media.format, "1:1");
assert.match(draft.facebook.caption, /Čist, moderan i lako nosiv/);

const payloadOnlyMedia = resolveEventMedia({ source_type: "product", payload: { image: "/products/fallback.webp" }, media: [] });
assert.equal(payloadOnlyMedia[0].format, "product_image", "Product payload image must remain available when no explicit Social media exists.");
assert.equal(selectSocialMedia(payloadOnlyMedia, "instagram_feed")?.format, "product_image");

const heroMedia = [
  { src: "/hero-desktop.webp", format: "hero_desktop" },
  { src: "/hero-mobile.webp", format: "hero_mobile" },
];
assert.equal(selectSocialMedia(heroMedia, "instagram_story")?.format, "hero_mobile", "Story must prefer mobile Hero media when no vertical Social asset exists.");
assert.equal(selectSocialMedia(heroMedia, "facebook")?.format, "hero_mobile", "Facebook must prefer the more social-friendly mobile Hero asset before desktop fallback.");

assert.throws(() => normalizeSocialEvent({ event_type: "bad", source_type: "product", source_id: "x" }), /Unsupported social event type/);
assert.throws(() => generateSocialDraft({ source_type: "unknown" }), /No social draft generator/);

const root = process.cwd();
const productPublishSync = fs.readFileSync(path.join(root, "control-center/api/sync-publish-status.js"), "utf8");
for (const token of [
  "productPublishedEvent",
  "createProductSocialShadowEvent",
  "product_image",
  "schema_unavailable",
  "publish_history_already_exists",
  "shadow_event_created_from_product_publish",
  "social_shadow_event",
]) {
  assert.ok(productPublishSync.includes(token), `Product publish Social shadow integration missing: ${token}`);
}
assert.ok(productPublishSync.includes("console.warn(\"Social shadow event creation skipped\""), "Product Social producer must fail open and never block product publishing.");

const heroFinalize = fs.readFileSync(path.join(root, "control-center/api/finalize-hero-apply.js"), "utf8");
for (const token of [
  "heroPublishedEvent",
  "createHeroSocialShadowEvent",
  "shadow_event_created_from_hero_publish",
  "skipped_retirement",
  "social_shadow_event",
]) {
  assert.ok(heroFinalize.includes(token), `Hero publish Social shadow integration missing: ${token}`);
}
assert.ok(heroFinalize.includes("console.warn(\"Hero Social shadow event creation skipped\""), "Hero Social producer must fail open and never block Hero finalization.");
const heroFinalizeRpcIndex = heroFinalize.indexOf('supabaseFetch("/rest/v1/rpc/finalize_hero_apply"');
const heroSocialInvocationIndex = heroFinalize.lastIndexOf("await createHeroSocialShadowEvent({");
assert.ok(heroFinalizeRpcIndex > -1, "Hero finalize RPC marker is missing.");
assert.ok(heroSocialInvocationIndex > heroFinalizeRpcIndex, "Hero Social event must be downstream of successful Hero finalization.");

const journalPublishSync = fs.readFileSync(path.join(root, "control-center/api/sync-journal-publish-status.js"), "utf8");
for (const token of [
  "journalPublishedEvent",
  "createJournalSocialShadowEvent",
  "shadow_event_created_from_journal_publish",
  "POST-MERGE SAFETY BLOCK",
  "renderJournalArticle(approved)",
  "social_shadow_event",
]) {
  assert.ok(journalPublishSync.includes(token), `Journal publish Social shadow integration missing: ${token}`);
}
assert.ok(journalPublishSync.includes("console.warn(\"Journal Social shadow event creation skipped\""), "Journal Social producer must fail open and never block Journal reconciliation.");
const journalSafetyIndex = journalPublishSync.indexOf("const expectedBlock = renderJournalArticle(approved)");
const journalSocialInvocationIndex = journalPublishSync.lastIndexOf("await createJournalSocialShadowEvent({");
const journalDeleteIndex = journalPublishSync.indexOf("journal_drafts?article_id=eq.${articleId}&apply_pr_number=eq.${draft.apply_pr_number}");
assert.ok(journalSafetyIndex > -1, "Journal post-merge live-source safety check is missing.");
assert.ok(journalSocialInvocationIndex > journalSafetyIndex, "Journal Social event must be downstream of post-merge live-source verification.");
assert.ok(journalDeleteIndex > journalSocialInvocationIndex, "Journal draft must only be cleared after the Social shadow producer has run.");

const journalApplyManager = fs.readFileSync(path.join(root, "control-center/src/JournalApplyManager.jsx"), "utf8");
assert.ok(journalApplyManager.includes('/api/sync-journal-publish-status'), "Journal UI must reconcile publication through the authenticated backend endpoint.");
assert.ok(!journalApplyManager.includes("api.github.com/repos/hazardno-dot/playnice-site/pulls"), "Journal UI must not directly use the public GitHub PR API for publish reconciliation.");

const socialManager = fs.readFileSync(path.join(root, "control-center/src/SocialManager.jsx"), "utf8");
for (const token of ["/api/social-draft", "Save draft", "Mark ready", "Return to draft", "draft_content", "approved_content"]) {
  assert.ok(socialManager.includes(token), `Social Manager editing/review workflow missing: ${token}`);
}
assert.ok(socialManager.includes("social-media-meta"), "Social preview must expose selected media metadata.");
assert.ok(socialManager.includes('key === "instagram_story" ? "story" : ""'), "Instagram Story preview must use a vertical-specific layout.");

const socialDraftApi = fs.readFileSync(path.join(root, "control-center/api/social-draft.js"), "utf8");
for (const token of ["generateSocialDraft", "draft_content", "approved_content", "approved_at", "draft_marked_ready", "draft_reopened", "2200"]) {
  assert.ok(socialDraftApi.includes(token), `Social draft API contract missing: ${token}`);
}
assert.ok(!socialDraftApi.includes("publish_mode: \"approval\""), "Draft approval must not unlock Meta publishing.");

const socialSchema = fs.readFileSync(path.join(root, "control-center/supabase/social_publisher_v1.sql"), "utf8");
for (const token of ["draft_content jsonb", "approved_content jsonb", "approved_at timestamptz", "publish_mode text not null default 'shadow'"]) {
  assert.ok(socialSchema.includes(token), `Social schema review-state contract missing: ${token}`);
}

console.log("PASS  Social Publisher shadow-mode contract");
console.log("PASS  Channel-aware media selection prefers square feed and vertical Story assets with safe fallbacks");
console.log("PASS  Social captions are editable, auditable and can be marked READY without unlocking Meta publishing");
console.log("PASS  Product publish creates a best-effort deduped Social shadow event after live merge");
console.log("PASS  Hero finalize creates a best-effort Social shadow event after post-merge safety checks");
console.log("PASS  Journal reconciliation verifies live source server-side before creating a Social shadow event");
console.log("PASS  Social schema/publisher failures remain non-blocking for storefront publishing");
