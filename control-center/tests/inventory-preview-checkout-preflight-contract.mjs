import assert from "node:assert/strict";
import fs from "node:fs";
import {checkPreviewCheckout} from "../../playnice-site/server/inventory-preview-checkout-preflight.mjs";
const perfume="Narciso Rodriguez NARCISO Poudrée Eau de Parfum";
const env={
 VERCEL_ENV:"preview",VERCEL_GIT_COMMIT_REF:"feature/inventory-protection-audit-shadow-v1",
 SHOP_PURCHASE_CAP_POLICY_PREVIEW_ENABLED:"true",
 SHOP_INVENTORY_SOURCE_V2_ENABLED:"true",SHOP_INVENTORY_CHECK_ENABLED:"true",
 SHOP_INVENTORY_READ_SECRET:"mock-only-secret",
 SUPABASE_URL:"https://example.invalid",
 SHOP_INVENTORY_PARITY_APPROVED_NAMES:perfume,
 SHOP_INVENTORY_VERIFIED_REMAINING_NAMES:perfume
};
const source=()=>({
 complete:true,snapshot_at:new Date().toISOString(),
 events:[{id:"0001",created_at:"2026-01-01T00:00:00Z",
  product_name:perfume,event_type:"BASELINE_SET",quantity_ml:28}],
 orders:[],items:[]
});
const payload=(items)=>({type:"order",customer:{country:"ME"},items});
const row=(size,quantity)=>({name:perfume,size,quantity});
const served=[];
const fetchImpl=async(url)=>{served.push(url);
 if(url.endsWith("/get_shop_purchase_caps_v1"))
  return {ok:true,json:async()=>({default_limit_ml:30,overrides:{}})};
 if(url.endsWith("/get_shop_inventory_source_v1"))
  return {ok:true,json:async()=>source()};
 throw Error("Unexpected URL");
};
assert.equal((await checkPreviewCheckout(payload([row("10ml",3)]),{env,fetchImpl})).decision,"STOCK_LIMIT_REACHED",
  "28ml Remaining is stricter than 30ml purchase cap");
assert.equal((await checkPreviewCheckout(payload([row("10ml",2),row("5ml",1)]),{env,fetchImpl})).decision,"ALLOW");
assert.equal((await checkPreviewCheckout(payload([row("10ml",3),row("2ml",1)]),{env,fetchImpl})).decision,"PURCHASE_CAP_REACHED");
assert.equal((await checkPreviewCheckout(payload([row("broken",1)]),{env,fetchImpl})).decision,"INVALID_ORDER");
const calls=served.length;
assert.equal((await checkPreviewCheckout(payload([row("10ml",3)]),{
 env:{...env,VERCEL_ENV:"production"},fetchImpl
})).decision,"ALLOW");
assert.equal(served.length,calls,"Production must not call preflight private endpoints");
const productionEnabled={
 ...env,VERCEL_ENV:"production",VERCEL_GIT_COMMIT_REF:"main",
 SHOP_INVENTORY_PRODUCTION_ROLLOUT_ENABLED:"true",
 SHOP_PURCHASE_CAP_POLICY_PRODUCTION_ENABLED:"true",
 SHOP_INVENTORY_PRODUCTION_CHECK_ENABLED:"true",
 SHOP_INVENTORY_PRODUCTION_PARITY_APPROVED_NAMES:perfume,
 SHOP_INVENTORY_PRODUCTION_VERIFIED_REMAINING_NAMES:perfume
};
assert.equal((await checkPreviewCheckout(payload([row("10ml",3)]),{
 env:productionEnabled,fetchImpl
})).decision,"STOCK_LIMIT_REACHED","explicit Production opt-in activates trusted stock check");
assert.equal((await checkPreviewCheckout(payload([row("10ml",3)]),{
 env:{...productionEnabled,SHOP_INVENTORY_PRODUCTION_ROLLOUT_ENABLED:"false"},fetchImpl
})).decision,"ALLOW","master flag must disable all Production blocking");
assert.equal((await checkPreviewCheckout(payload([row("10ml",3)]),{
 env:{...productionEnabled,SHOP_INVENTORY_PRODUCTION_VERIFIED_REMAINING_NAMES:""},fetchImpl
})).decision,"ALLOW","no independently verified Production name, no stock blocking");
assert.equal((await checkPreviewCheckout(payload([row("10ml",4)]),{
 env:{...productionEnabled,SHOP_INVENTORY_PRODUCTION_CHECK_ENABLED:"false"},fetchImpl
})).decision,"PURCHASE_CAP_REACHED","trusted purchase cap independent of stock rollout");

assert.equal((await checkPreviewCheckout(payload([row("10ml",3)]),{
 env:{...env,VERCEL_GIT_COMMIT_REF:"main"},fetchImpl
})).decision,"ALLOW");
const unavailable=async(url)=>{
 if(url.endsWith("/get_shop_purchase_caps_v1"))
  return {ok:true,json:async()=>({default_limit_ml:30,overrides:{}})};
 return {ok:false,status:503};
};
assert.equal((await checkPreviewCheckout(payload([row("10ml",3)]),{
 env,fetchImpl:unavailable
})).decision,"ALLOW","Unavailable stock must fail open");
assert.equal((await checkPreviewCheckout(payload([row("10ml",4)]),{
 env,fetchImpl:unavailable
})).decision,"PURCHASE_CAP_REACHED","confirmed purchase cap remains active if stock unavailable");
const checkout=fs.readFileSync("playnice-site/api/checkout.js","utf8");
assert.match(checkout,/checkPreviewCheckout\(req\.body\)/);
assert.match(checkout,/isCheckoutPreflightEnabled\(process\.env\)/);
assert.match(fs.readFileSync("playnice-site/server/inventory-rollout-gate.cjs","utf8"),/SHOP_INVENTORY_PRODUCTION_ROLLOUT_ENABLED/);
assert.ok(checkout.indexOf('checkPreviewCheckout(req.body)')<checkout.indexOf('return legacyHandler(req, res)'),
 "Preflight must occur before any order is persisted");
console.log("PASS Preview checkout: 28ml stock, 30ml cap, mixed sizes, invalid input, outage, no Production call");
