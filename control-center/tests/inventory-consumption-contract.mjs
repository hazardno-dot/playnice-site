import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";

const root = process.cwd();
const sql = fs.readFileSync(path.join(root, "control-center/supabase/inventory_consumption_v1.sql"), "utf8");

for (const token of [
  "fragrance_inventory_events",
  "OPENING",
  "RESTOCK",
  "get_control_center_inventory_stock",
  "record_control_center_inventory_stock",
  "enable row level security",
  "grant execute"
]) assert.ok(sql.includes(token), "Inventory migration missing: " + token);

console.log("PASS inventory consumption v1 schema contract");
