import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");

const app = fs.readFileSync(path.resolve(root, "control-center/src/App.jsx"), "utf8");
const managers = fs.readFileSync(path.resolve(root, "control-center/src/ControlCenterManagers.jsx"), "utf8");
const router = fs.readFileSync(path.resolve(root, "control-center/api/router.js"), "utf8");
const server = fs.readFileSync(path.resolve(root, "control-center/server/orders.js"), "utf8");
const ui = fs.readFileSync(path.resolve(root, "control-center/src/OrdersManager.jsx"), "utf8");

assert.ok(app.includes('{ name: "Operations", modules: ["Orders"] }'), "Operations primary nav must expose Orders.");
assert.ok(app.includes('Orders: { eyebrow: "OPERATIONS / FULFILLMENT"'), "Orders module metadata must exist.");
assert.ok(managers.includes('import OrdersManager from "./OrdersManager";'), "Orders manager must be mounted.");
assert.ok(managers.includes("<OrdersManager />"), "Orders manager component must render.");
assert.ok(router.includes('"orders": () => import("../server/orders.js")'), "Orders API must use consolidated router.");
assert.ok(server.includes("get_control_center_orders"), "Orders API must read through the admin-gated Supabase RPC.");
assert.ok(server.includes("update_control_center_order"), "Orders API must mutate through the admin-gated Supabase RPC.");
assert.ok(server.includes("mark_control_center_order_sheet_sync"), "Orders API must persist Google backup sync results.");
assert.ok(server.includes("order_state_sync"), "Orders API must use the dedicated Google Sheets state-sync contract.");
assert.ok(server.includes("set_delivery_issue"), "Orders API must support delivery issue write-through.");
assert.ok(server.includes("ORDERS_WRITE_THROUGH_ENABLED"), "Orders writes must stay behind an explicit feature gate.");
assert.ok(server.includes("ORDERS_SHEET_SYNC_SECRET"), "Orders mirror writes must require a server-side shared secret.");
assert.ok(ui.includes('fetch("/api/orders"'), "Orders UI must use the authenticated server route.");
assert.ok(ui.includes("WRITE-THROUGH ACTIVE"), "Orders UI must communicate active write-through mode.");
assert.ok(ui.includes("Retry backup sync"), "Orders UI must expose retry for failed Google backup sync.");
assert.ok(ui.includes("Mark packed"), "Orders UI must support the safe PACKED transition.");
assert.ok(ui.includes("Mark shipped"), "Orders UI must support the legacy-compatible SHIPPED transition.");
assert.ok(ui.includes("Return to new"), "Orders UI must support undoing an accidental PACKED transition.");
assert.ok(ui.includes("DUPLICATE"), "Orders UI must keep duplicate audit records visible.");
assert.ok(ui.includes("UNREACHABLE"), "Orders UI must expose the existing delivery issue workflow.");
assert.ok(ui.includes("Mark delivery failed"), "Orders UI must support the terminal delivery-failed transition.");

console.log("PASS orders operations contract");
