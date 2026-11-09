import fs from "node:fs";
import assert from "node:assert/strict";

const sql = fs.readFileSync("control-center/supabase/inventory_protection_shadow_events_v1.sql","utf8");
for (const marker of [
  "inventory_protection_shadow_events",
  "enable row level security",
  "revoke all on public.inventory_protection_shadow_events from public, anon, authenticated",
  "get_control_center_inventory_protection_shadow",
  "ADMIN_REQUIRED",
  "SHADOW_ONLY",
  "WOULD_BLOCK",
  "UNKNOWN",
  "evaluation_version"
]) assert.ok(sql.includes(marker), "Missing passive telemetry safeguard: "+marker);
assert.doesNotMatch(sql, /grant\s+insert\s+on\s+public\.inventory_protection_shadow_events\s+to\s+(anon|authenticated)/i);
assert.doesNotMatch(sql, /alter\s+table\s+public\.checkout_orders|update\s+public\.checkout_orders|delete\s+from\s+public\.checkout_orders/i);
console.log("PASS inventory protection telemetry schema contract");
