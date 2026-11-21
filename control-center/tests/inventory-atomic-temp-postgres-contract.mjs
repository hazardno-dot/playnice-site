import assert from "node:assert/strict";
import fs from "node:fs";
const sql=fs.readFileSync("control-center/supabase/checkout_atomic_temp_proof_ROLLBACK.sql","utf8");
assert.match(sql,/^BEGIN;/m);
assert.match(sql,/\bROLLBACK;\s*$/);
assert.match(sql,/CREATE TEMP TABLE pn_atomic_test_stock/);
assert.match(sql,/CREATE FUNCTION pg_temp\.pn_atomic_try_admit/);
assert.match(sql,/pg_advisory_xact_lock\(hashtextextended\('pn-audit:preview:fp:/);
assert.match(sql,/pg_advisory_xact_lock\(hashtextextended\('pn-audit:preview:product:/);
assert.match(sql,/available_ml>=p_ml/);
assert.match(sql,/STOCK_LIMIT_REACHED/);
assert.match(sql,/DUPLICATE/);
assert.match(sql,/INJECT_RESERVATION_WRITE_FAILURE/);
assert.match(sql,/ghost order\/reservation remained after rollback/);
assert.match(sql,/NOT a concurrent-session proof/);
assert.doesNotMatch(sql,/\b(public\.checkout_orders|public\.fragrance_inventory_events|public\.order_items)\b/i,
 "synthetic proof must never touch real checkout/inventory rows");
const draft=fs.readFileSync("control-center/supabase/checkout_inventory_reservations_v1_DRAFT.sql","utf8");
assert.match(draft,/grant select on public\.checkout_inventory_reservations_v1 to service_role/i);
assert.doesNotMatch(draft,/grant[^;]*\b(insert|update|delete)\b[^;]*to service_role/i,
 "reservation mutation must not be possible via direct service-role REST table writes");
console.log("PASS inactive PostgreSQL test harness isolation and draft least-privilege grants");
