import assert from "node:assert/strict";
import fs from "node:fs";

const sql = fs.readFileSync("control-center/tests/fixtures/inventory-reservation-lab.sql", "utf8");
for (const required of [
  "ISOLATED SQL LAB",
  "create schema if not exists inventory_protection_lab",
  "revoke all on schema inventory_protection_lab from public, anon, authenticated",
  "physical_centi_ml bigint",
  "reserved_centi_ml bigint",
  "fingerprint text not null unique",
  "pg_advisory_xact_lock",
  "for update",
  "order by product_key",
  "INSUFFICIENT_AVAILABLE",
  "UNKNOWN_STOCK",
  "create or replace function inventory_protection_lab.transition",
  "RECONCILIATION_REQUIRED",
  "('naxos-test',8000,true)"
]) assert.ok(sql.toLowerCase().includes(required.toLowerCase()), "Missing isolated SQL lab contract: " + required);
assert.doesNotMatch(sql,/\b(public\.checkout_orders|public\.fragrance_inventory_events|public\.order_status_events)\b/i);
assert.doesNotMatch(sql, /grant\s+(usage|execute|insert|update|delete|all).*\b(to|,\s*)(anon|authenticated)\b/i);
console.log("PASS isolated SQL reservation lab source contract (not a concurrency test)");
