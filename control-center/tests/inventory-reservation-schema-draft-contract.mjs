import assert from "node:assert/strict";
import fs from "node:fs";
const sql=fs.readFileSync("control-center/supabase/checkout_inventory_reservations_v1_DRAFT.sql","utf8");
const admission=fs.readFileSync("playnice-site/server/inventory-atomic-admission-contract.mjs","utf8");
assert.match(sql,/DRAFT \/ NEVER APPLY DIRECTLY TO PRODUCTION/);
assert.match(sql,/create table if not exists public\.checkout_inventory_reservations_v1/i);
assert.match(sql,/order_record_id uuid not null references public\.checkout_orders\(id\)/);
assert.match(sql,/unique\(order_record_id,product_key\)/);
assert.match(sql,/alter table public\.checkout_inventory_reservations_v1 enable row level security/i);
assert.match(sql,/revoke all on public\.checkout_inventory_reservations_v1 from public,anon,authenticated/i);
assert.match(sql,/where disposition<>'RELEASED'/);
assert.doesNotMatch(sql,/create or replace function.*checkout_order/is,
  "Draft may not introduce an active checkout writer");
assert.match(admission,/await tx\.lockFingerprint\(environment,fingerprint\)/);
assert.match(admission,/await tx\.lockFragrances\(environment,demand\.map/);
assert.match(admission,/await tx\.insertCheckoutOrder/);
assert.match(admission,/await tx\.insertReservationLines/);
const api=fs.readFileSync("playnice-site/api/checkout.js","utf8");
assert.doesNotMatch(api,/inventory-atomic-admission-contract/,
  "Atomic admission cannot be activated before real PostgreSQL concurrency tests");
console.log("PASS draft reservation schema: RLS, idempotent unique order/product, inactive checkout");
