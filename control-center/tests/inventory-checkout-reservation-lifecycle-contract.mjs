import assert from "node:assert/strict";
import fs from "node:fs";
import {reservationDisposition,admittedOrderFootprint} from "../../playnice-site/server/checkout-reservation-lifecycle.mjs";
for(const status of ["NEW","PACKED"])assert.equal(reservationDisposition(status),"RESERVE");
for(const status of ["SHIPPED","OUT_FOR_DELIVERY","DELIVERY_FAILED","DELIVERED"])
  assert.equal(reservationDisposition(status),"COMMITTED");
assert.equal(reservationDisposition("RETURNED"),"HOLD_RETURN");
assert.equal(reservationDisposition("RETURNED",{returnRestocked:true}),"RELEASED");
assert.equal(reservationDisposition("CANCELLED"),"RELEASED");
assert.equal(reservationDisposition("CANCELLED",{wasShipped:true}),"HOLD_RETURN");
assert.equal(reservationDisposition("DUPLICATE"),"NO_RESERVATION");
assert.equal(reservationDisposition("UNRECOGNIZED"),"HOLD_UNKNOWN");
assert.deepEqual(admittedOrderFootprint([
 {status:"NEW",ml:30},{status:"SHIPPED",ml:20},
 {status:"DELIVERY_FAILED",ml:10},{status:"RETURNED",ml:5},
 {status:"RETURNED",returnRestocked:true,ml:10},
 {status:"CANCELLED",ml:5}
]),{complete:true,committedMl:65});
assert.equal(admittedOrderFootprint([{status:"NEW",ml:-1}]).complete,false);
const checkout=fs.readFileSync("playnice-site/api/checkout.js","utf8");
assert.doesNotMatch(checkout,/checkout-reservation-lifecycle/,
 "draft lifecycle does not modify active checkout");
const functions=fs.readFileSync("control-center/docs/inventory-shop-parity-checkpoint.md","utf8");
assert.match(functions,/atomic/i);
console.log("PASS reservation lifecycle contract: NEW, PACKED, shipped, delivery failed, return receipt, cancel, duplicate");
