import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const api = fs.readFileSync(path.join(root, "control-center/api/meta-connection-status.js"), "utf8");
const panel = fs.readFileSync(path.join(root, "control-center/src/MetaConnectionPanel.jsx"), "utf8");
const bridge = fs.readFileSync(path.join(root, "control-center/src/MetaConnectionBridge.jsx"), "utf8");
const managers = fs.readFileSync(path.join(root, "control-center/src/ControlCenterManagers.jsx"), "utf8");

for (const token of [
  "META_GRAPH_API_VERSION",
  "META_APP_ID",
  "META_APP_SECRET",
  "META_FACEBOOK_PAGE_ID",
  "META_PAGE_ACCESS_TOKEN",
  "META_INSTAGRAM_ACCOUNT_ID",
  "pages_show_list",
  "pages_read_engagement",
  "pages_manage_posts",
  "instagram_basic",
  "instagram_content_publish",
  "publish_enabled: false",
  "connection_test_only",
]) {
  assert.ok(api.includes(token), `Meta connection contract missing: ${token}`);
}

assert.ok(api.includes("instagram_business_account"), "Meta connection check must verify the Page-linked Instagram professional account.");
assert.ok(!api.includes("/media_publish"), "Connection phase must not expose Instagram publishing.");
assert.ok(!api.includes("/feed"), "Connection phase must not expose Facebook Page publishing.");
assert.ok(panel.includes("Publish remains hard locked"), "Meta UI must communicate that publishing is locked.");
assert.ok(panel.includes("/api/meta-connection-status"), "Meta UI must use the authenticated connection-status endpoint.");
assert.ok(bridge.includes("#social-manager-slot .social-manager"), "Meta status panel must mount inside Social Manager.");
assert.ok(managers.includes("<MetaConnectionBridge />"), "Meta connection bridge must be active in Control Center managers.");

console.log("PASS  Meta connection phase verifies configuration without enabling publish");
console.log("PASS  Instagram/Facebook capability contract is present and publish endpoints remain absent");
