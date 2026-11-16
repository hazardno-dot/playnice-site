import assert from "node:assert/strict";
import { calculateRequestedMl, evaluateInventoryShadow, interpretInventoryAdvisory } from "../lib/inventory-protection-shadow.mjs";

const stock = { productKey: "naxos", physicalMl: 80, currentBalanceVerified: true, snapshotConsistent: true, mappingVerified: true, estimated: false };
const item = (sizeMl, quantity, productKey = "naxos") => ({ productKey, sizeMl, quantity });
const check = (items, overrides = {}) => evaluateInventoryShadow({
  productKey: "naxos", items, stock, reservedMl: 0, ...overrides
});

assert.deepEqual(calculateRequestedMl([item(20, 3), item(10, 2), item(20, 4, "other")], "naxos"),
  { valid: true, requestedMl: 80, reason: null });
assert.equal(check([item(20, 4)]).decision, "ALLOW");
assert.equal(check([item(20, 5)]).decision, "WOULD_BLOCK");
assert.equal(check([item(20, 3), item(10, 2)]).decision, "ALLOW");
assert.equal(check([item(20, 3), item(10, 3)]).decision, "WOULD_BLOCK");
assert.equal(check([item(20, 3)], { reservedMl: 20 }).decision, "ALLOW");
assert.equal(check([item(20, 4)], { reservedMl: 20 }).decision, "WOULD_BLOCK");
assert.equal(check([item(20, 1)], { stock: null }).decision, "UNKNOWN");
assert.equal(check([item(20, 1)], { stock: { ...stock, estimated: true } }).decision, "UNKNOWN");
assert.equal(check([item(20, 1)], { stock: { ...stock, mappingVerified: false } }).decision, "UNKNOWN");
assert.equal(check([item(20, 1)], { stock: { ...stock, currentBalanceVerified: false } }).decision, "UNKNOWN");
assert.equal(check([item(20, 1)], { stock: { ...stock, snapshotConsistent: false } }).decision, "UNKNOWN");
assert.equal(check([item(20, 1)], { stock: { ...stock, baselineVerified: true, currentBalanceVerified: false } }).decision, "UNKNOWN");
assert.equal(check([item(20, 1)], { reservedMl: 81 }).decision, "UNKNOWN");
assert.equal(check([item(20, 1)], { reservedMl: null }).decision, "UNKNOWN");
assert.equal(check([item(20, 1)], { stock: { ...stock, physicalMl: NaN } }).decision, "UNKNOWN");
assert.equal(check([item(20, 0)]).decision, "UNKNOWN");
assert.equal(check([item(20, 1.5)]).decision, "UNKNOWN");
assert.equal(check([item("bad", 1)]).decision, "UNKNOWN");
assert.equal(check([item(20, 1)], { stock: { ...stock, productKey: "other" } }).decision, "UNKNOWN");

for (const decision of ["ALLOW", "WOULD_BLOCK", "UNKNOWN", null]) {
  const advice = interpretInventoryAdvisory(decision ? { decision } : null);
  assert.equal(advice.allowCart, true);
  assert.equal(advice.allowCheckout, true);
  assert.equal(advice.enforcementEnabled, false);
  assert.equal(advice.customerMessage, null);
  assert.equal(advice.action, decision === "WOULD_BLOCK" ? "INTERNAL_REVIEW" : "NONE");
}
assert.equal(interpretInventoryAdvisory({decision:"WOULD_BLOCK",availableMl:0}).allowCheckout,true);

console.log("PASS inventory protection shadow decision contract");
