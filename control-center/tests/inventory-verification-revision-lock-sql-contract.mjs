import fs from "node:fs";
import assert from "node:assert/strict";
const sql=fs.readFileSync("control-center/supabase/inventory_verification_revision_lock_v2.sql","utf8");
for(const pattern of [/NOT APPLIED/,/inventory_verification_global_revision/,
 /revision=revision\+1/,/after insert or update or delete on public\.fragrance_inventory_events/,
 /after insert or update or delete on public\.checkout_orders/,
 /after insert or update or delete on public\.order_status_events/,
 /for each statement execute function public\.inventory_verification_revision_bump/,
 /FOR UPDATE/,/No write\/grant\/confirm RPC is defined/]) assert.match(sql,pattern);
assert.doesNotMatch(sql,/grant\s+(insert|update|delete|all)\s+on\s+public\.inventory_verification_global_revision\s+to\s+(anon|authenticated)/i);
assert.doesNotMatch(sql,/create\s+or\s+replace\s+function\s+public\.(confirm_inventory_verified|commit_inventory_verification)/i);
console.log("PASS isolated SQL revision-lock design contract; no migration executed");
