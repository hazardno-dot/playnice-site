import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const api = fs.readFileSync(path.join(root, "control-center/server/meta-connection-status.js"), "utf8");
const resolver = fs.readFileSync(path.join(root, "control-center/lib/meta-page-token.mjs"), "utf8");
const panel = fs.readFileSync(path.join(root, "control-center/src/MetaConnectionPanel.jsx"), "utf8");
const bridge = fs.readFileSync(path.join(root, "control-center/src/MetaConnectionBridge.jsx"), "utf8");
const managers = fs.readFileSync(path.join(root, "control-center/src/ControlCenterManagers.jsx"), "utf8");

for (const token of [
  "META_GRAPH_API_VERSION",
  "META_APP_ID",
  "META_APP_SECRET",
  "META_FACEBOOK_PAGE_ID",
  "META_INSTAGRAM_ACCOUNT_ID",
  "pages_show_list",
  "pages_read_engagement",
  "pages_manage_posts",
  "instagram_basic",
  "instagram_content_publish",
  "publish_enabled: false",
  "connection_test_only",
  "resolveMetaPageAccessToken",
  "credential_source",
]) {
  assert.ok(api.includes(token), `Meta connection contract missing: ${token}`);
}

for (const token of [
  "META_SYSTEM_USER_ACCESS_TOKEN",
  "META_PAGE_ACCESS_TOKEN",
  "system_user",
  "page_env_fallback",
  "resolveMetaPageAccessToken",
]) {
  assert.ok(resolver.includes(token), `Meta credential resolver contract missing: ${token}`);
}

assert.ok(api.includes("instagram_business_account"), "Meta connection check must verify the Page-linked Instagram professional account.");
assert.ok(!api.includes("/media_publish"), "Connection phase must not expose Instagram publishing.");
assert.ok(!api.includes("/feed"), "Connection phase must not expose Facebook Page publishing.");
assert.ok(panel.includes("Automatic publishing remains locked"), "Meta UI must communicate that automatic publishing remains locked while manual publishing is available.");
assert.ok(panel.includes("META CONNECTION · MANUAL PUBLISH"), "Meta UI must identify the manual publish connection mode.");
assert.ok(panel.includes("/api/meta-connection-status"), "Meta UI must use the authenticated connection-status endpoint.");
assert.ok(bridge.includes("#social-manager-slot .social-manager"), "Meta status panel must mount inside Social Manager.");
assert.ok(managers.includes("<MetaConnectionBridge />"), "Meta connection bridge must be active in Control Center managers.");

console.log("PASS  Meta connection phase verifies configuration while keeping automatic publishing locked");
console.log("PASS  Durable System User credential resolver is primary with Page token fallback");
console.log("PASS  Instagram/Facebook capability contract is present and publish endpoints remain absent");
