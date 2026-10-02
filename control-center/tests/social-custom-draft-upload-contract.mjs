import assert from "node:assert/strict";
import fs from "node:fs";
import { generateSocialDraft } from "../src/socialDraft.mjs";

const blank = generateSocialDraft({
  source_type: "custom",
  payload: { title: "New Social draft" },
  media: [],
});
assert.equal(blank.headline, "New Social draft");
assert.equal(blank.instagram_feed.caption, "");
assert.equal(blank.instagram_story.caption, "");
assert.equal(blank.facebook.caption, "");
assert.equal(blank.instagram_feed.media, null);
assert.equal(blank.instagram_story.media, null);
assert.equal(blank.facebook.media, null);

const socialManager = fs.readFileSync("control-center/src/SocialManager.jsx", "utf8");
assert.ok(socialManager.includes('source_type: "custom"'), "Social Manager must create a standalone custom draft.");
assert.ok(socialManager.includes('New draft'), "Social Manager must expose a New draft action.");
assert.ok(socialManager.includes('data-social-event-id={event.id}'), "Social queue rows must expose the exact event id for media bridges.");

const bridge = fs.readFileSync("control-center/src/SocialMediaOverrideBridge.jsx", "utf8");
assert.ok(bridge.includes('dataset?.socialEventId'), "Media override bridge must target the selected event by exact id.");
assert.ok(bridge.includes('.eq("id", queueState.eventId)'), "Media override bridge must load exactly the selected Social event.");
assert.ok(!bridge.includes("activeIndex"), "Media override bridge must not infer event identity from queue position.");
assert.ok(bridge.includes('storage.from(BUCKET).remove([storagePath])'), "Failed event persistence must clean up the uploaded storage object.");

const replay = fs.readFileSync("control-center/server/social-shadow-replay.js", "utf8");
assert.ok(replay.includes('sourceType === "custom"'), "Social replay endpoint must support standalone custom drafts.");
assert.ok(replay.includes('event_type: "manual_post"'), "Standalone drafts must use the manual_post event type.");
assert.ok(replay.includes('manual_custom_post: true'), "Standalone drafts must be marked as controlled manual Social posts.");

const schema = fs.readFileSync("control-center/supabase/social_publisher_custom_drafts_v2.sql", "utf8");
assert.ok(schema.includes("'manual_post'"), "Social schema migration must allow manual_post events.");
assert.ok(schema.includes("'custom'"), "Social schema migration must allow custom sources.");

console.log("PASS  standalone Social drafts and exact-id media upload targeting");
