import assert from "node:assert/strict";
import { classifyInventoryObligation, calculateInventoryObligations } from "../lib/inventory-reservation-lifecycle.mjs";

assert.equal(classifyInventoryObligation("NEW",{everPacked:false}),"RESERVED");
assert.equal(classifyInventoryObligation("PACKED",{everPacked:true}),"CONSUMED");
assert.equal(classifyInventoryObligation("SHIPPED",{everPacked:true}),"CONSUMED");
assert.equal(classifyInventoryObligation("DELIVERY_FAILED",{everPacked:true}),"CONSUMED");
assert.equal(classifyInventoryObligation("RETURNED",{everPacked:true}),"CONSUMED");
assert.equal(classifyInventoryObligation("CANCELLED",{everPacked:false}),"RELEASED");
assert.equal(classifyInventoryObligation("CANCELLED",{everPacked:true}),"RECONCILIATION_REQUIRED");
assert.equal(classifyInventoryObligation("NEW",{everPacked:true}),"RECONCILIATION_REQUIRED");
assert.equal(classifyInventoryObligation("NEW"),"UNKNOWN");
assert.equal(classifyInventoryObligation("UNRECOGNIZED",{everPacked:false}),"UNKNOWN");

const order = (orderId,status,sizeMl,quantity=1,everPacked=false)=>({
  orderId, status, everPacked, environment:"production",
  items:[{productKey:"naxos",sizeMl,quantity}]
});
assert.deepEqual(calculateInventoryObligations([
  order("A","NEW",20,2),order("B","PACKED",10,2,true),order("C","CANCELLED",5),
  {...order("PNTEST-1","NEW",50),environment:"preview"},
  order("D","RETURNED",10,1,true),order("E","NEW",5,2)
],"naxos"),{valid:true,reason:null,reservedMl:50,consumedMl:30,pendingReviewMl:0});
assert.deepEqual(calculateInventoryObligations([
  order("A","NEW",20,1,true),order("B","CANCELLED",10,1,true)
],"naxos"),{valid:true,reason:null,reservedMl:0,consumedMl:0,pendingReviewMl:30});
assert.equal(calculateInventoryObligations([order("A","NEW",20),order("A","NEW",20)],"naxos").reason,"DUPLICATE_OR_MISSING_ORDER_ID");
assert.equal(calculateInventoryObligations([{...order("A","NEW",20),everPacked:null}],"naxos").reason,"UNKNOWN_ORDER_STATUS");
assert.equal(calculateInventoryObligations([order("A","NEW",NaN)],"naxos").reason,"INVALID_ITEM_QUANTITY");
assert.equal(calculateInventoryObligations([order("A","SOMETHING",20)],"naxos").reason,"UNKNOWN_ORDER_STATUS");
console.log("PASS inventory reservation lifecycle contract");
