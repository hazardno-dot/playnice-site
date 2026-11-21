import assert from "node:assert/strict";
import { compareInventoryBalance,auditInventoryParity } from "../lib/inventory-shop-parity.mjs";
const row={product_name:"Xerjoff Naxos Eau de Parfum",remaining_ml:100};
const opt={sourceComplete:true,independentlyRecomputed:true,snapshotAgeMs:200};
const check=(cc,shop,extra={})=>compareInventoryBalance(cc,shop,{...opt,...extra});
assert.equal(check(row,{...row}).decision,"MATCH");
assert.equal(check(row,{...row,remaining_ml:99.99}).reason,"BALANCE_MISMATCH");
assert.equal(check(row,{...row,remaining_ml:-1}).reason,"INVALID_BALANCE");
assert.equal(check(row,{...row,remaining_ml:NaN}).reason,"INVALID_BALANCE");
assert.equal(check(row,{...row,product_name:"Different"}).reason,"PRODUCT_MAPPING_MISMATCH");
assert.equal(check(row,{...row},{snapshotAgeMs:30001}).reason,"STALE_SNAPSHOT");
assert.equal(check(row,{...row},{snapshotAgeMs:undefined}).reason,"STALE_SNAPSHOT");
assert.equal(compareInventoryBalance(row,row,{sourceComplete:true,snapshotAgeMs:200}).reason,"NOT_RECOMPUTED");
assert.equal(check(row,{...row},{unmatchedGifts:true}).reason,"UNRESOLVED_CONSUMPTION");
assert.equal(check(row,{...row},{unmatchedItems:true}).reason,"UNRESOLVED_CONSUMPTION");
assert.equal(check(row,{...row},{missingOrders:true}).reason,"UNRESOLVED_CONSUMPTION");
assert.equal(check(row,{...row},{legacyAmbiguity:true}).reason,"UNRESOLVED_CONSUMPTION");
assert.equal(check(row,{...row},{sourceComplete:false}).reason,"INCOMPLETE_OR_AMBIGUOUS_SOURCE");
assert.equal(check(row,{...row,ambiguous:true}).decision,"UNKNOWN");
assert.equal(check(row,{...row,remaining_ml:0}).decision,"UNKNOWN");
const results=auditInventoryParity([row,{...row,product_name:"Another",remaining_ml:70}],
  [row],opt);
assert.equal(results.matched,1);
assert.equal(results.unknown,1);
assert.equal(results.results[1].allowCheckout,true);
const duplicate=auditInventoryParity([row],[row,row],opt);
assert.equal(duplicate.results[0].reason,"DUPLICATE_MAPPING");
for(const v of [null,{},0,undefined]){
  assert.equal(compareInventoryBalance(row,v,opt).allowCheckout,true);
}
console.log("PASS inventory shop parity: strict server reconciliation or fail-open UNKNOWN");
