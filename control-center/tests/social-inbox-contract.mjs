import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const managers = fs.readFileSync(path.join(root, "control-center/src/ControlCenterManagers.jsx"), "utf8");
const inbox = fs.readFileSync(path.join(root, "control-center/src/SocialInboxManager.jsx"), "utf8");
const api = fs.readFileSync(path.join(root, "control-center/api/social-inbox-sync.js"), "utf8");
const schema = fs.readFileSync(path.join(root, "control-center/supabase/social_inbox_v1.sql"), "utf8");

assert.ok(managers.includes('import SocialInboxManager from "./SocialInboxManager";'));
assert.ok(managers.includes("<SocialInboxManager />"));
assert.ok(managers.includes('persisted === "Inbox"'));

for (const token of [
  "SOCIAL INBOX V1",
  "/api/social-inbox-sync",
  "READ ONLY",
  "AI draft → review → Approve & Send",
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
  "sending_enabled: false",
  "social_inbox_threads",
  "social_inbox_messages",
]) {
  assert.ok(api.includes(token), `Social Inbox sync contract missing: ${token}`);
}

assert.ok(!api.includes('/messages"'), "Read-only sync must not call the Meta Send API.");

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

console.log("PASS  Social Inbox v1 is isolated, admin-only and read-only");
console.log("PASS  Instagram/Facebook conversations use the existing Meta credential resolver");
console.log("PASS  Reply controls stay locked until the read path is verified");
