import assert from "node:assert/strict";
import fs from "node:fs";
import {collectOrderFragranceMl,assessCheckoutOrder} from "../../playnice-site/server/inventory-checkout-guard.mjs";

const items=[
  {name:"Xerjoff Naxos Eau de Parfum",size:"10ml",quantity:2},
  {name:"Xerjoff Naxos Eau de Parfum",size:"5ml",quantity:2},
  {name:"Narciso Rodriguez NARCISO Poudrée Eau de Parfum",size:"10ml",quantity:2},
];
const parsed=collectOrderFragranceMl(items);
assert.equal(parsed.status,"VALID");
assert.deepEqual(parsed.totals.map(x=>x.requestedMl),[30,20]);
const n="xerjoff naxos eau de parfum",p="narciso rodriguez narciso poudrée eau de parfum";
const policy=new Map([[n,30],[p,30]]);
const stock=new Map([[n,"ALLOW"],[p,"ALLOW"]]);
assert.equal(assessCheckoutOrder(items,{policies:policy,inventoryDecisions:stock}).decision,"ALLOW");
assert.equal(assessCheckoutOrder([...items,{name:"Xerjoff Naxos Eau de Parfum",size:"2ml",quantity:1}],{
  policies:policy,inventoryDecisions:stock}).decision,"PURCHASE_CAP_REACHED");
assert.equal(assessCheckoutOrder(items,{policies:new Map([[n,20],[p,30]]),inventoryDecisions:stock}).decision,"PURCHASE_CAP_REACHED");
assert.equal(assessCheckoutOrder(items,{policies:policy,
  inventoryDecisions:new Map([[n,"ALLOW"],[p,"LIMIT_REACHED"]])}).decision,"STOCK_LIMIT_REACHED");
// Inventory unavailable fails open independently of known valid purchase cap.
assert.equal(assessCheckoutOrder(items,{policies:policy,
  inventoryDecisions:new Map([[n,"UNKNOWN"],[p,"UNKNOWN"]])}).decision,"ALLOW");
assert.equal(assessCheckoutOrder(items,{policies:policy}).decision,"ALLOW");
assert.equal(assessCheckoutOrder([{name:"Naxos",size:"broken",quantity:1}],{policies:policy}).decision,"INVALID_ORDER");
assert.equal(assessCheckoutOrder([{name:"Naxos",size:"10ml",quantity:-1}],{policies:policy}).decision,"INVALID_ORDER");
const bundle=[{name:"Discovery Set",size:"10ml",quantity:1,
  bundleItems:[{name:"Xerjoff Naxos Eau de Parfum",size:"10ml"},
    {name:"Narciso Rodriguez NARCISO Poudrée Eau de Parfum",size:"5ml"}]}];
assert.deepEqual(collectOrderFragranceMl(bundle).totals.map(x=>x.requestedMl),[10,5]);
const checkout=fs.readFileSync("playnice-site/api/checkout.js","utf8");
assert.doesNotMatch(checkout,/inventory-checkout-guard/,
  "no enforcement until atomic database admission is designed and approved");
console.log("PASS pure checkout contract: mixed sizes, override, stock, UNKNOWN, malformed, bundle; no Production writes");
