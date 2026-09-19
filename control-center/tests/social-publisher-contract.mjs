import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { SOCIAL_SHADOW_MODE, normalizeSocialEvent, socialEventDedupeKey, canPublishSocialEvent } from "../src/socialEvent.mjs";
import { generateSocialDraft, resolveEventMedia, selectSocialMedia, classifySocialMedia, validateSocialDraftMedia } from "../src/socialDraft.mjs";

const event = normalizeSocialEvent({
  event_type: "product_published",
  source_type: "product",
  source_id: "test-fragrance",
  source_url: "/product/test-fragrance",
  payload: {
    core: {
      name: "Test Fragrance Eau de Parfum",
      shortName: "Test Fragrance",
      image: "/products/test.webp",
      sizes: { "5ml": 9, "10ml": 16 },
    },
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
assert.deepEqual(canPublishSocialEvent({ ...event, status: "scheduled" }), { ok: false, reason: "shadow_mode" });

const draft = generateSocialDraft(event);
assert.equal(draft.headline, "Test Fragrance");
assert.match(draft.instagram_feed.caption, /Test Fragrance/);
assert.match(draft.instagram_feed.caption, /5ml · €9/);
assert.match(draft.instagram_feed.caption, /playniceshop\.me\/product\/test-fragrance/);
assert.match(draft.instagram_feed.caption, /#playnice #trybeforeyoubuy #dekanticrnagora #parfemi #montenegro/, "Default Product social hashtags must preserve the PlayNice brand/local ordering.");
assert.equal(draft.instagram_feed.media.format, "1:1");
assert.equal(draft.instagram_story.media.format, "9:16");
assert.equal(draft.facebook.media.format, "1:1");
assert.match(draft.facebook.caption, /Čist, moderan i lako nosiv/);
assert.equal(classifySocialMedia(draft.instagram_feed.media, "instagram_feed").status, "ideal");
assert.equal(classifySocialMedia(draft.instagram_story.media, "instagram_story").status, "ideal");
assert.equal(validateSocialDraftMedia(draft).ok, true);
assert.equal(validateSocialDraftMedia({ ...draft, instagram_story: { ...draft.instagram_story, media: null } }).ok, false);
assert.deepEqual(validateSocialDraftMedia({ ...draft, instagram_story: { ...draft.instagram_story, media: null } }).blocking, ["instagram_story"]);

const payloadOnlyMedia = resolveEventMedia({ source_type: "product", payload: { core: { image: "/products/fallback.webp" } }, media: [] });
assert.equal(payloadOnlyMedia[0].format, "product_image", "Nested Product core image must remain available when no explicit Social media exists.");
assert.equal(payloadOnlyMedia[0].src, "https://www.playniceshop.me/products/fallback.webp", "Relative storefront media must resolve to the canonical public PlayNice origin.");
assert.equal(selectSocialMedia(payloadOnlyMedia, "instagram_feed")?.format, "product_image");
assert.equal(classifySocialMedia(selectSocialMedia(payloadOnlyMedia, "instagram_feed"), "instagram_feed").status, "fallback", "A product image is usable but not an ideal square Feed asset.");

const heroMedia = [
  { src: "/hero-desktop.webp", format: "hero_desktop" },
  { src: "/hero-mobile.webp", format: "hero_mobile" },
];
assert.equal(selectSocialMedia(heroMedia, "instagram_story")?.format, "hero_mobile", "Story must prefer mobile Hero media when no vertical Social asset exists.");
assert.equal(selectSocialMedia(heroMedia, "instagram_story")?.src, "https://www.playniceshop.me/hero-mobile.webp", "Hero preview media must use a public absolute URL.");
assert.equal(selectSocialMedia(heroMedia, "facebook")?.format, "hero_mobile", "Facebook must prefer the more social-friendly mobile Hero asset before desktop fallback.");
assert.equal(classifySocialMedia(selectSocialMedia(heroMedia, "instagram_story"), "instagram_story").status, "fallback");

assert.throws(() => normalizeSocialEvent({ event_type: "bad", source_type: "product", source_id: "x" }), /Unsupported social event type/);
assert.throws(() => generateSocialDraft({ source_type: "unknown" }), /No social draft generator/);

const root = process.cwd();
const productPublishSync = fs.readFileSync(path.join(root, "control-center/api/sync-publish-status.js"), "utf8");
for (const token of [
  "productPublishedEvent",
  "createProductSocialShadowEvent",
  "const core = payload?.core",
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
for (const token of ["/api/social-draft", "/api/social-shadow-replay", "Save draft", "Mark ready", "Return to draft", "Schedule", "Unschedule", "SCHEDULED · LOCKED", "scheduled_for", "datetime-local", "Copy caption", "Open image", "Copy link", "navigator.clipboard", "publicSourceUrl", "Discard draft", "Discard test event", "archived", "CREATE POST FROM", "Product", "Hero", "Journal", "source_type: sourceType", "draft_content", "approved_content", "payload?.core?.shortName", "validateSocialDraftMedia", "MEDIA READINESS", "READY BLOCKED", "readiness.label", "Usable fallback", "Media required", "Media ready"]) {
  assert.ok(socialManager.includes(token), `Social Manager editing/review workflow missing: ${token}`);
}
assert.ok(socialManager.includes('setProductPickerOpen(true)'), "Product create action must open the Product picker.");
assert.ok(socialManager.includes('openSourcePicker("hero")'), "Hero create action must open the Hero picker.");
assert.ok(socialManager.includes('openSourcePicker("journal")'), "Journal create action must open the Journal picker.");
assert.ok(socialManager.includes("disabled={saving || !mediaReadiness.ok}"), "Mark ready must be locally disabled when a channel has no media.");
assert.ok(socialManager.includes('["ready", "scheduled"].includes(selected.status)'), "READY and SCHEDULED must render the approved snapshot instead of editable draft content.");
assert.ok(socialManager.includes('window.open(src, "_blank", "noopener,noreferrer")'), "Manual fallback must open the exact selected channel asset in a separate tab.");
assert.ok(socialManager.includes('new URL(String(value), PUBLIC_ORIGIN)'), "Manual fallback must canonicalize relative source URLs before Copy link.");
assert.ok(socialManager.includes('key === "instagram_story" ? "story" : ""'), "Instagram Story preview must use a vertical-specific layout.");
assert.ok(socialManager.includes('window.addEventListener("playnice:social-media-updated", handleSocialMediaUpdated)'), "Social Manager must refresh immediately after channel media changes.");
assert.ok(socialManager.includes('window.removeEventListener("playnice:social-media-updated", handleSocialMediaUpdated)'), "Social media refresh listener must be cleaned up on unmount.");
assert.ok(socialManager.includes('setFeedDryRun(null);'), "Social media changes must invalidate any stale Meta dry-run payload.");

const socialDraftApi = fs.readFileSync(path.join(root, "control-center/api/social-draft.js"), "utf8");
for (const token of ["generateSocialDraft", "validateSocialDraftMedia", "validateReadyMedia", "probePublicImage", "content-type", "asset must use HTTPS", "READY blocked", "public_media_verified", "draft_content", "approved_content", "approved_at", "scheduled_for", "normalizeScheduledFor", "Only READY events can be scheduled", "Only scheduled events can be unscheduled", "draft_scheduled", "draft_unscheduled", "draft_marked_ready", "draft_reopened", "draft_discarded", "discard", "discard_test", "isTestEvent", "2200"]) {
  assert.ok(socialDraftApi.includes(token), `Social draft API contract missing: ${token}`);
}
assert.ok(socialDraftApi.indexOf("await validateReadyMedia(draftContent)") < socialDraftApi.indexOf('status: "ready"'), "Public media validation must run before READY state is persisted.");
assert.ok(socialDraftApi.includes('event.status !== "ready"'), "Scheduling must be server-side restricted to READY events.");
assert.ok(socialDraftApi.includes('event.status !== "scheduled"'), "Unscheduling must be server-side restricted to SCHEDULED events.");
assert.ok(socialDraftApi.includes('event.status !== "draft"'), "Soft discard must be server-side restricted to DRAFT events.");
assert.ok(socialDraftApi.includes('status: "cancelled"'), "Soft discard must preserve the Social event by moving it to CANCELLED.");
assert.ok(socialManager.includes('!["cancelled", "published"].includes(event.status)'), "Cancelled and published Social events must be hidden from the active queue.");
assert.ok(socialManager.includes('filter === "archived"'), "Archived filter must surface cancelled Social events.");
assert.ok(socialManager.includes("ARCHIVED · PUBLISHED"), "Published Social events must show an explicit archived/published review state.");
assert.ok(socialManager.includes("ARCHIVED · DISCARDED"), "Discarded Social events must remain distinguishable from published archive history.");
assert.ok(socialManager.includes("selected.published_at"), "Published archive state must show the Social publish date.");
assert.ok(socialManager.includes('window.confirm'), "Discard draft must require explicit confirmation.");
assert.ok(!socialDraftApi.includes("publish_mode: \"approval\""), "Draft approval or scheduling must not unlock Meta publishing.");

const manualMetaPublishApi = fs.readFileSync(path.join(root, "control-center/api/social-instagram-feed-test-publish.js"), "utf8");
for (const token of [
  "STORY_PUBLISH_MAX_ATTEMPTS",
  "STORY_PUBLISH_INITIAL_DELAY_MS",
  "error.metaCode = metaCode",
  "Number(error?.metaCode) === 9007",
  "publish_attempts: publishAttempts",
]) {
  assert.ok(manualMetaPublishApi.includes(token), `Instagram Story 9007 retry contract missing: ${token}`);
}

const replayApi = fs.readFileSync(path.join(root, "control-center/api/social-shadow-replay.js"), "utf8");
for (const token of [
  "productPublishedEvent",
  "heroPublishedEvent",
  "journalPublishedEvent",
  "heroRowToSlide",
  "loadLiveJournalArticles",
  "publish_history",
  "hero_slides",
  "replayProduct",
  "replayHero",
  "replayJournal",
  "source_type",
  "replay: !manualPost",
  "social-shadow-replay",
]) {
  assert.ok(replayApi.includes(token), `Social shadow replay contract missing: ${token}`);
}
assert.ok(!replayApi.includes('from "../../playnice-site/src/data/journal/index.js"'), "Replay endpoint must not top-level import the storefront Journal module.");
assert.ok(!replayApi.includes("publish_mode: \"approval\""), "Replay must remain shadow-only.");
assert.ok(socialManager.includes('product_slug: product.slug'), "Manual Product post picker must send the selected live product slug.");
assert.ok(socialManager.includes('product_payload: productPayload'), "Manual Product post picker must send the selected live Product payload.");
assert.ok(socialManager.includes('productCopy[product.name]'), "Manual Product posts must include current Product editorial copy.");
assert.ok(socialManager.includes("/api/social-source-catalog"), "Hero and Journal post pickers must load selectable source catalogs.");
assert.ok(socialManager.includes('openSourcePicker("hero")'), "Social Manager must expose a Hero picker.");
assert.ok(socialManager.includes('openSourcePicker("journal")'), "Social Manager must expose a Journal picker.");
assert.ok(socialManager.includes("body.hero_key = item.key"), "Hero picker must send the selected Hero key.");
assert.ok(socialManager.includes("body.journal_article_id = item.id"), "Journal picker must send the selected article id.");
assert.ok(replayApi.includes("manual_hero_post"), "Replay endpoint must create manual Hero Social events.");
assert.ok(replayApi.includes("manual_journal_post"), "Replay endpoint must create manual Journal Social events.");
assert.ok(replayApi.includes("heroKey: req.body?.hero_key"), "Replay endpoint must accept a selected Hero key.");
assert.ok(replayApi.includes("articleId: req.body?.journal_article_id"), "Replay endpoint must accept a selected Journal article id.");
const sourceCatalogApi = fs.readFileSync(path.join(root, "control-center/api/social-source-catalog.js"), "utf8");
assert.ok(sourceCatalogApi.includes('sourceType === "hero"'), "Social source catalog must expose Hero sources.");
assert.ok(sourceCatalogApi.includes('sourceType === "journal"'), "Social source catalog must expose Journal sources.");
assert.ok(replayApi.includes("`manual_${sourceType}_post_created`"), "Manual Product, Hero and Journal posts must have source-specific dedicated audit events.");
assert.ok(replayApi.includes("`social-manual-${sourceType}-post`"), "Manual Social posts must use a source-specific non-test producer identity.");
assert.ok(replayApi.includes("test: !manualPost"), "Manual Product posts must not be marked as test events.");
assert.ok(replayApi.includes("replay: !manualPost"), "Manual Product posts must not be marked as replay events.");
assert.ok(replayApi.includes("--manual-social-"), "Manual Product posts must receive their own fresh Social event identity.");
const instagramPublishBridge = fs.readFileSync(path.join(root, "control-center/src/SocialInstagramTestPublishBridge.jsx"), "utf8");
const storyPublishBridge = fs.readFileSync(path.join(root, "control-center/src/SocialInstagramStoryTestPublishBridge.jsx"), "utf8");
const facebookPublishBridge = fs.readFileSync(path.join(root, "control-center/src/SocialFacebookTestPublishBridge.jsx"), "utf8");
for (const source of [instagramPublishBridge, storyPublishBridge, facebookPublishBridge, manualMetaPublishApi]) {
  assert.ok(source.includes("manual_product_post"), "Controlled Meta publishing must recognize manual Product Social events.");
  assert.ok(source.includes("--manual-social-"), "Controlled Meta publishing must recognize manual Product Social event ids.");
}
assert.ok(manualMetaPublishApi.includes("isControlledPublishEvent"), "Server-side Meta transport must use the controlled publish eligibility gate.");
assert.ok(manualMetaPublishApi.includes("finalizePublishedEvent"), "Manual Meta transport must archive an event after all three channels publish.");
assert.ok(manualMetaPublishApi.includes('status: "published"'), "Completed Social publication must persist PUBLISHED status.");
assert.ok(manualMetaPublishApi.includes("published_at: publishedAt"), "Completed Social publication must persist its publication timestamp.");
const reconcilePublishApi = fs.readFileSync(path.join(root, "control-center/api/social-reconcile-published.js"), "utf8");
assert.ok(reconcilePublishApi.includes("test_instagram_feed_published"), "Reconciliation must recognize Instagram Feed publication audit.");
assert.ok(reconcilePublishApi.includes("test_instagram_story_published"), "Reconciliation must recognize Instagram Story publication audit.");
assert.ok(reconcilePublishApi.includes("test_facebook_published"), "Reconciliation must recognize Facebook publication audit.");
assert.ok(reconcilePublishApi.includes('status: "published"'), "Reconciliation must restore already-published events to PUBLISHED history.");
assert.ok(reconcilePublishApi.includes("status=in.(draft,ready,scheduled,cancelled)"), "Reconciliation must also recover discarded events that have complete publish audit evidence.");
assert.ok(socialManager.includes("/api/social-reconcile-published"), "Social Manager must reconcile existing publication history on open.");
assert.ok(instagramPublishBridge.includes("Publish Instagram Feed"), "Instagram Feed bridge must expose controlled manual publishing for READY Product posts.");
assert.ok(storyPublishBridge.includes("Publish Instagram Story"), "Instagram Story bridge must expose controlled manual publishing for READY Product posts.");
assert.ok(facebookPublishBridge.includes("Publish Facebook Page"), "Facebook bridge must expose controlled manual publishing for READY Product posts.");

const socialSchema = fs.readFileSync(path.join(root, "control-center/supabase/social_publisher_v1.sql"), "utf8");
for (const token of ["draft_content jsonb", "approved_content jsonb", "approved_at timestamptz", "scheduled_for timestamptz", "status = 'scheduled'", "publish_mode text not null default 'shadow'"]) {
  assert.ok(socialSchema.includes(token), `Social schema review/scheduling contract missing: ${token}`);
}

console.log("PASS  Social Publisher shadow-mode contract");
console.log("PASS  Channel media updates invalidate stale Meta dry-run payloads and reload Social event state immediately");
console.log("PASS  Nested Product payloads resolve canonical name, sizes and media correctly");
console.log("PASS  Relative storefront media are normalized to public PlayNice URLs");
console.log("PASS  Channel media is classified IDEAL, FALLBACK or MISSING before review approval");
console.log("PASS  READY is blocked when media is missing or not publicly reachable as an HTTPS image");
console.log("PASS  READY events can be scheduled for a future time and safely unscheduled without unlocking Meta publishing");
console.log("PASS  Manual fallback can copy channel captions/source links and open the exact selected media without touching event state");
console.log("PASS  Social captions are editable, auditable and can be marked READY without unlocking Meta publishing");
console.log("PASS  Explicit test/replay events can be safely discarded without exposing delete for real Social events");
console.log("PASS  Any live Product can create a fresh publishable Social draft without touching storefront state; Hero and Journal replay remain available");
console.log("PASS  Product publish creates a best-effort deduped Social shadow event after live merge");
console.log("PASS  Hero finalize creates a best-effort Social shadow event after post-merge safety checks");
console.log("PASS  Journal reconciliation verifies live source server-side before creating a Social shadow event");
console.log("PASS  Social schema/publisher failures remain non-blocking for storefront publishing");
