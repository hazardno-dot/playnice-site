import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const source = fs.readFileSync("playnice-site/src/features/cart/inventoryShadowObserver.js","utf8")
  .replace(/export function /g,"function ");
function load({ enabled, fetchImpl, window = {} } = {}) {
  const context = {
    process: { env: { REACT_APP_INVENTORY_SHADOW_ENABLED: enabled ? "true" : "false" } },
    window,
    fetch: fetchImpl,
    JSON, String, Number, Array, Math
  };
  vm.runInNewContext(source + "\nthis.observe=observeInventoryCartIntent;", context);
  return context.observe;
}
const normal = {
  source:"ADD_TO_CART",product:{id:1,slug:"naxos"},size:"20 ml",
  cart:[{id:1,size:"10 ml",quantity:2}],extraCount:1
};
let requests = [];
const observer = load({
  enabled:true,
  fetchImpl:(_url,options)=>{
    requests.push(JSON.parse(options.body));
    return Promise.reject(new Error("synthetic network outage"));
  }
});
let purchases=0;
function addToCart(observe, intent) {
  observe(intent);
  purchases++;
}
addToCart(observer,normal);
assert.equal(purchases,1);
assert.equal(requests.length,1);
assert.equal(requests[0].demandMl,40);

// A thrown error during property access or serialization cannot abort cart.
addToCart(observer,{...normal,product:{id:1,get slug(){throw Error("corrupt product")}}});
assert.equal(purchases,2);
addToCart(load({enabled:true,fetchImpl:()=>{throw Error("offline")}}),normal);
assert.equal(purchases,3);
addToCart(load({enabled:true,fetchImpl:undefined}),normal);
assert.equal(purchases,4);
addToCart(load({enabled:false,fetchImpl:()=>{throw Error("SHOULD_NOT_RUN")}}),normal);
assert.equal(purchases,5);
const strange = {...normal,cart:[{id:1,size:"not ml",quantity:1}]};
addToCart(observer,strange);
assert.equal(purchases,6);
assert.equal(requests.length,1,"malformed cart did not generate stock-out or gate checkout");

console.log("PASS optional inventory observer fail-open: async reject, sync throw, missing fetch, invalid cart, disabled");
