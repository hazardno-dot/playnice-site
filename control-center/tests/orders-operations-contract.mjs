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
assert.ok(server.includes("order_status_events"), "Orders API must read timeline events.");
assert.ok(server.includes('mode: "read_only_migration"'), "Orders API must remain read-only during migration.");
assert.ok(server.includes('req.method !== "GET"'), "Orders API must reject write requests during migration.");
assert.ok(server.includes("SUPABASE_SECRET_KEY"), "Orders data access must stay server-side.");
assert.ok(ui.includes('fetch("/api/orders"'), "Orders UI must use the authenticated server route.");
assert.ok(ui.includes("OUT_FOR_DELIVERY"), "Orders UI must understand the delivery lifecycle.");
assert.ok(ui.includes("DUPLICATE"), "Orders UI must expose canonical duplicate audit records.");
assert.ok(ui.includes("READ-ONLY MIGRATION PHASE"), "Orders UI must clearly communicate read-only migration safety.");

console.log("PASS orders operations contract");
