import assert from "node:assert/strict";
import { reviewNewOrderDemand, summarizeNewOrderAdvisories } from "../lib/inventory-advisory-review.mjs";
const row={product_name:"Test perfume",remaining_ml:85,pending_new_ml:20,estimated:true};
const check=(changes)=>reviewNewOrderDemand({...row,...changes});
assert.equal(check({}).level,"NONE");
assert.equal(check({remaining_ml:10,pending_new_ml:20}).level,"POSSIBLE_SHORTFALL");
assert.equal(check({remaining_ml:20,pending_new_ml:20}).level,"LOW_BUFFER");
assert.equal(check({remaining_ml:40,pending_new_ml:20}).level,"LOW_BUFFER");
assert.equal(check({remaining_ml:41,pending_new_ml:20}).level,"NONE");
assert.equal(check({pending_new_ml:0}).level,"NONE");
assert.equal(check({remaining_ml:null}).level,"UNKNOWN");
assert.equal(check({remaining_ml:-1}).level,"UNKNOWN");
assert.equal(check({pending_new_ml:NaN}).level,"UNKNOWN");
assert.equal(check({provisional:true}).level,"UNKNOWN");
for (const changes of [{},{remaining_ml:10,pending_new_ml:20},{remaining_ml:20,pending_new_ml:20},{remaining_ml:null}]) {
  assert.equal(check(changes).allowCheckout,true);
}
const summary=summarizeNewOrderAdvisories([
  {...row,remaining_ml:10},{...row,remaining_ml:20},{...row,remaining_ml:null},row
]);
assert.deepEqual(summary,{possibleShortfalls:1,lowBuffers:1,unresolved:1});
console.log("PASS admin-only advisory: possible shortfall and low buffer are never checkout blockers");
