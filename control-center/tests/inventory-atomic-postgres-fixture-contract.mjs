import assert from "node:assert/strict";
import fs from "node:fs";
const sql=fs.readFileSync("control-center/supabase/checkout_atomic_admission_fixture_ROLLBACK.sql","utf8");
assert.match(sql,/ISOLATED SQL FIXTURE\. NEVER USE AS PRODUCTION ADMISSION/);
assert.match(sql,/^BEGIN;/m);
assert.match(sql,/ROLLBACK;\s*$/);
assert.match(sql,/CREATE TEMP TABLE fixture_inventory_stock/);
assert.match(sql,/CREATE TEMP TABLE fixture_checkout_orders/);
assert.match(sql,/CREATE TEMP TABLE fixture_stock_reservations/);
assert.match(sql,/CREATE FUNCTION pg_temp\.try_admit_inventory_fixture/);
assert.match(sql,/pg_advisory_xact_lock/);
const fp=sql.indexOf("pn-fixture:preview:fp:");
const fragrance=sql.indexOf("pn-fixture:preview:fragrance:");
const dedupe=sql.indexOf("RETURN 'DUPLICATE'");
const insertOrder=sql.indexOf("INSERT INTO pg_temp.fixture_checkout_orders");
const insertReservation=sql.indexOf("INSERT INTO pg_temp.fixture_stock_reservations");
assert.ok(fp>=0 && dedupe>fp && fragrance>dedupe && insertOrder>fragrance && insertReservation>insertOrder,
  "critical same-fingerprint then product-lock then order and reservation sequence");
assert.match(sql,/RETURN 'STOCK_LIMIT_REACHED'/);
assert.match(sql,/RETURN 'PURCHASE_CAP_REACHED'/);
assert.match(sql,/RETURN 'UNKNOWN'/);
assert.match(sql,/INTENTIONAL_ROLLBACK_TEST/);
assert.match(sql,/IF SQLERRM <> 'INTENTIONAL_ROLLBACK_TEST' THEN RAISE/);
assert.doesNotMatch(sql,/\b(?:INSERT INTO|UPDATE|DELETE FROM)\s+public\./i);
assert.doesNotMatch(sql,/create\s+(?:or\s+replace\s+)?function\s+public\./i);
const live=fs.readFileSync("playnice-site/api/checkout.js","utf8");
assert.doesNotMatch(live,/try_admit_inventory_fixture|checkout_inventory_reservations_v1/,
  "no fixture integration into real checkout");
console.log("PASS isolated SQL fixture contract: temp-only, ordering, rollback and zero live checkout wiring");
