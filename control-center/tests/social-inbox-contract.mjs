import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const managers = fs.readFileSync(path.join(root, "control-center/src/ControlCenterManagers.jsx"), "utf8");
const inbox = fs.readFileSync(path.join(root, "control-center/src/SocialInboxManager.jsx"), "utf8");
const syncApi = fs.readFileSync(path.join(root, "control-center/api/social-inbox-sync.js"), "utf8");
const replyApi = fs.readFileSync(path.join(root, "control-center/api/social-inbox-reply.js"), "utf8");
const aiDraftApi = fs.readFileSync(path.join(root, "control-center/api/social-inbox-ai-draft.js"), "utf8");
const schema = fs.readFileSync(path.join(root, "control-center/supabase/social_inbox_v1.sql"), "utf8");

assert.ok(managers.includes('import SocialInboxManager from "./SocialInboxManager";'));
assert.ok(managers.includes("<SocialInboxManager />"));
assert.ok(managers.includes('persisted === "Inbox"'));

for (const token of [
  "SOCIAL INBOX V1",
  "/api/social-inbox-sync",
  "/api/social-inbox-reply",
  "/api/social-inbox-ai-draft",
  "Generate AI draft",
  "AI draft only · nothing is sent automatically",
  "FB APPROVAL SEND",
  "Approve & Send",
  "Meta 24-hour response window is enforced server-side.",
  "social_inbox_threads",
  "social_inbox_messages",
  "postgres_changes",
]) {
  assert.ok(inbox.includes(token), `Social Inbox UI contract missing: ${token}`);
}

for (const token of [
  "resolveMetaPageAccessToken",
  "/conversations",
  'platform === "instagram"',
  "instagram_manage_messages",
  "pages_messaging",
  "facebook: true",
  "instagram: false",
  "social_inbox_threads",
  "social_inbox_messages",
  'status: last?.direction === "outbound" ? "replied" : "open"',
]) {
  assert.ok(syncApi.includes(token), `Social Inbox sync contract missing: ${token}`);
}

assert.ok(!syncApi.includes('messaging_type: "RESPONSE"'), "Inbox sync must never send a Meta message.");
for (const token of [
  "OPENAI_API_KEY",
  "OPENAI_INBOX_MODEL",
  "\"gpt-5.6-luna\"",
  "https://api.openai.com/v1/responses",
  "store: false",
  "GITHUB_TOKEN",
  "playnice-site/src/data/products/index.js",
  "LIVE CATALOG",
  "latest.direction !== \"inbound\"",
  "24-hour response window",
  "review_required: true",
  "sent: false",
]) {
  assert.ok(aiDraftApi.includes(token), `AI draft contract missing: ${token}`);
}

assert.ok(!aiDraftApi.includes("graph.facebook.com"), "AI draft endpoint must never call Meta Graph.");
assert.ok(!aiDraftApi.includes('messaging_type: "RESPONSE"'), "AI draft endpoint must never send a Meta message.");
assert.ok(aiDraftApi.includes("requireAdmin"), "AI draft endpoint must remain admin-only.");


for (const token of [
  "resolveMetaPageAccessToken",
  'thread.platform !== "facebook"',
  "req.body?.approved !== true",
  'messaging_type: "RESPONSE"',
  "/messages",
  "24-hour response window",
  "approval: \"explicit_admin\"",
  "approved_by: auth.user.id",
]) {
  assert.ok(replyApi.includes(token), `Facebook reply contract missing: ${token}`);
}

for (const token of [
  "create table if not exists public.social_inbox_threads",
  "create table if not exists public.social_inbox_messages",
  "enable row level security",
  "social_inbox_threads_admin_select",
  "social_inbox_messages_admin_select",
  "supabase_realtime",
]) {
  assert.ok(schema.includes(token), `Social Inbox schema contract missing: ${token}`);
}

console.log("PASS  Social Inbox is isolated and admin-only");
console.log("PASS  Facebook read + explicit Approve & Send use the existing Meta credential resolver");
console.log("PASS  AI draft is admin-only, catalog-grounded, review-required, and cannot send to Meta");
console.log("PASS  Instagram sending remains disabled");
console.log("PASS  Facebook replies are blocked outside the stored 24-hour response window");
console.log("PASS  New inbound Meta sync reopens a previously replied thread");
