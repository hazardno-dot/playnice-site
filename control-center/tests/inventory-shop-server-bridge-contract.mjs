import assert from "node:assert/strict";
import fs from "node:fs";
import { decisionFromShopRemaining } from "../../playnice-site/server/inventory-shop-remaining.mjs";
for(const file of ["inventory-accounting.mjs","inventory-shop-source.mjs","inventory-remaining-bridge.mjs"]){
  const cc=fs.readFileSync("control-center/lib/"+file,"utf8");
  const shop=fs.readFileSync("playnice-site/server/"+file,"utf8");
  assert.equal(shop,cc,"Shop/CC inventory code must be byte-identical: "+file);
}
const api=fs.readFileSync("playnice-site/api/inventory-check.js","utf8");
assert.match(api,/SHOP_INVENTORY_SOURCE_V2_ENABLED==="true"/);
assert.match(api,/SHOP_INVENTORY_PARITY_APPROVED_NAMES/);
assert.match(api,/SHOP_INVENTORY_CHECK_ENABLED/);
assert.match(api,/VERCEL_ENV==="preview"/);
assert.match(api,/get_shop_inventory_cart_decision/,"working legacy fallback retained");
const {decision}=await decisionFromShopRemaining({supabaseUrl:"https://example.invalid",secret:"",
  productName:"Xerjoff Naxos Eau de Parfum",requestedTotalMl:110});
assert.equal(decision,"UNKNOWN");
let calls=0;
const fallback=await decisionFromShopRemaining({
  supabaseUrl:"https://example.invalid",secret:"test-secret",
  productName:"Xerjoff Naxos Eau de Parfum",requestedTotalMl:110,
  fetchImpl:async()=>{calls++;return {ok:false,status:404};}
});
assert.equal(calls,1);
assert.equal(fallback.decision,"UNKNOWN");
const broken=await decisionFromShopRemaining({
  supabaseUrl:"https://example.invalid",secret:"test-secret",
  productName:"Xerjoff Naxos Eau de Parfum",requestedTotalMl:110,
  fetchImpl:async()=>({ok:true,json:async()=>({complete:false})})
});
assert.equal(broken.decision,"UNKNOWN");
const perfume="Xerjoff Naxos Eau de Parfum";
const source={complete:true,events:[{
  id:"1",product_name:perfume,event_type:"BASELINE_SET",
  quantity_ml:100,created_at:"2026-01-01T00:00:00Z"
}],orders:[],items:[]};
const fetchImpl=async()=>({ok:true,json:async()=>source});
const fields={supabaseUrl:"https://example.invalid",secret:"test-secret",
  productName:perfume,fetchImpl};
assert.equal((await decisionFromShopRemaining({...fields,requestedTotalMl:100})).decision,"ALLOW");
assert.equal((await decisionFromShopRemaining({...fields,requestedTotalMl:110})).decision,"LIMIT_REACHED");
assert.equal((await decisionFromShopRemaining({...fields,productName:"Unknown",requestedTotalMl:110})).decision,"UNKNOWN");
const responseSource=fs.readFileSync("playnice-site/server/inventory-shop-remaining.mjs","utf8");
// Inspect actual return lines; comments are not executable return statements.
const returnLines=responseSource.split("\n").map(line=>line.trim()).filter(line=>line.startsWith("return "));
assert.ok(returnLines.every(line => line !== "return source;" && line !== "return result.rows;"));
assert.ok(responseSource.includes('return ["ALLOW","LIMIT_REACHED"].includes(decision.decision)?'));
console.log("PASS preview-only Shop backend: byte-identical CC calculation, service-role-only source, fail-open");
