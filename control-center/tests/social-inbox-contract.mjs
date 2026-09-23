import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const managers = fs.readFileSync(path.join(root, "control-center/src/ControlCenterManagers.jsx"), "utf8");
const inbox = fs.readFileSync(path.join(root, "control-center/src/SocialInboxManager.jsx"), "utf8");
const syncApi = fs.readFileSync(path.join(root, "control-center/api/social-inbox-sync.js"), "utf8");
const replyApi = fs.readFileSync(path.join(root, "control-center/api/social-inbox-reply.js"), "utf8");
const webhookApi = fs.readFileSync(path.join(root, "control-center/api/social-inbox-webhook.js"), "utf8");
const webhookManageApi = fs.readFileSync(path.join(root, "control-center/api/social-inbox-webhook-manage.js"), "utf8");
const assistant = fs.readFileSync(path.join(root, "control-center/lib/social-inbox-assistant.mjs"), "utf8");
const notify = fs.readFileSync(path.join(root, "control-center/lib/social-inbox-notify.mjs"), "utf8");
const schemaV1 = fs.readFileSync(path.join(root, "control-center/supabase/social_inbox_v1.sql"), "utf8");
const schemaV2 = fs.readFileSync(path.join(root, "control-center/supabase/social_inbox_assistant_v2.sql"), "utf8");

assert.ok(managers.includes('import SocialInboxManager from "./SocialInboxManager";'));
assert.ok(managers.includes("<SocialInboxManager />"));
assert.ok(managers.includes('persisted === "Inbox"'));

for (const token of [
  "SOCIAL INBOX V2",
  "/api/social-inbox-sync",
  "/api/social-inbox-reply",
  "/api/social-inbox-webhook-manage",
  "social_inbox_drafts",
  "Activate automation",
  "notification_ready",
  "webhook_ready",
  "ASSISTANT DRAFT",
  "NO AUTO-SEND",
  "Approve & Send",
  "assistant_draft_id",
  "Meta 24-hour response window is enforced server-side.",
  "postgres_changes",
]) {
  assert.ok(inbox.includes(token), `Social Inbox UI contract missing: ${token}`);
}

for (const token of [
  "resolveMetaPageAccessToken",
  "prepareAssistantDrafts",
  "/conversations",
  'platform === "instagram"',
  "instagram_manage_messages",
  "pages_messaging",
  "facebook: true",
  "instagram: false",
  "social_inbox_threads",
  "social_inbox_messages",
  "thread_ids",
  'status: last?.direction === "outbound" ? "replied" : "open"',
]) {
  assert.ok(syncApi.includes(token), `Social Inbox sync contract missing: ${token}`);
}
assert.ok(!syncApi.includes('messaging_type: "RESPONSE"'), "Inbox sync must never send a Meta message.");

for (const token of [
  "resolveMetaPageAccessToken",
  "markAssistantDraftSent",
  "assistantDraftId",
  "source_message_id",
  "A newer customer message arrived",
  'thread.platform !== "facebook"',
  "req.body?.approved !== true",
  'messaging_type: "RESPONSE"',
  "/messages",
  "24-hour response window",
  'approval: "explicit_admin"',
  "approved_by: auth.user.id",
]) {
  assert.ok(replyApi.includes(token), `Facebook reply contract missing: ${token}`);
}

for (const token of [
  'ASSISTANT_RULES_VERSION = "assistant-v2.1"',
  "playnice-site/src/data/products/index.js",
  "GITHUB_TOKEN",
  "loadLiveProducts",
  "buildAssistantDraft",
  "detectIjekavian",
  "www.playniceshop.me",
  "conversationAlreadySharedWebsite",
  "shouldProactivelyShareWebsite",
  "asksOffer",
  "limit=100",
  "prepareAssistantDrafts",
  "notification_candidates",
  "RESPONSE_WINDOW_MS",
  "outside_response_window",
  'status: "needs_review"',
  "social_inbox_drafts",
  "auto_send: false",
]) {
  assert.ok(assistant.includes(token), `Assistant engine contract missing: ${token}`);
}
assert.ok(!assistant.includes("api.openai.com"), "Assistant v2 must not depend on OpenAI.");
assert.ok(!assistant.includes("OPENAI_API_KEY"), "Assistant v2 must not require an OpenAI API key.");

for (const token of [
  "SUPABASE_SERVICE_ROLE_KEY",
  "resolveMetaPageAccessToken",
  "syncPlatform",
  "prepareAssistantDrafts",
  "notifyAssistantDrafts",
  'process.env.VERCEL_ENV === "production"',
  "inboundSenderIds",
  "accepted: true",
  "auto_send: false",
]) {
  assert.ok(webhookApi.includes(token), `Inbox webhook contract missing: ${token}`);
}
assert.ok(!webhookApi.includes('messaging_type: "RESPONSE"'), "Inbox webhook must never send a Meta reply.");

for (const token of [
  'process.env.VERCEL_ENV !== "production"',
  "/subscriptions",
  "/subscribed_apps",
  'fields: "messages"',
  "webhook_ready",
  "automation_active",
  "auto_send: false",
]) {
  assert.ok(webhookManageApi.includes(token), `Webhook management contract missing: ${token}`);
}

for (const token of [
  "TELEGRAM_BOT_TOKEN",
  "TELEGRAM_CHAT_ID",
  "ODGOVOR JE SPREMAN",
  "PORUKA TRAŽI PREGLED",
  "Approve & Send ostaje obavezan",
  "notified_at",
  "claimDraftNotification",
]) {
  assert.ok(notify.includes(token), `Assistant notification contract missing: ${token}`);
}

for (const token of [
  "create table if not exists public.social_inbox_threads",
  "create table if not exists public.social_inbox_messages",
  "enable row level security",
  "social_inbox_threads_admin_select",
  "social_inbox_messages_admin_select",
  "supabase_realtime",
]) {
  assert.ok(schemaV1.includes(token), `Social Inbox v1 schema contract missing: ${token}`);
}

for (const token of [
  "create table if not exists public.social_inbox_drafts",
  "source_message_id",
  "social_inbox_drafts_admin_select",
  "social_inbox_drafts_admin_insert",
  "social_inbox_drafts_admin_update",
  "social_inbox_drafts_source_message_idx",
  "security invoker",
  "supabase_realtime",
]) {
  assert.ok(schemaV2.includes(token), `Social Inbox v2 schema contract missing: ${token}`);
}

console.log("PASS  Social Inbox v2 remains admin-only and preserves explicit send approval");
console.log("PASS  Assistant drafts use deterministic PlayNice rules and the live catalog with no OpenAI dependency");
console.log("PASS  Meta webhook can wake sync + draft preparation but has no Facebook send path");
console.log("PASS  Telegram notifications are draft alerts only; customer send remains manual");
console.log("PASS  Assistant draft storage has RLS, Realtime and source-message idempotency");
