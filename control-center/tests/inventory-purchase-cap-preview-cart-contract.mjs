import assert from "node:assert/strict";
import fs from "node:fs";
// The Shop uses CRA/CommonJS package defaults; import this pure ESM source as data in Node contracts.
const source=fs.readFileSync("playnice-site/src/features/cart/cartQuantityCap.js","utf8");
const {warmPurchaseCapPolicy,previewCapForProduct,assessCartQuantityCap}=await import(
  "data:text/javascript;base64,"+Buffer.from(source).toString("base64")
);
const oldWindow=global.window,oldFetch=global.fetch;
const product={id:11,name:"Naxos",slug:"naxos"};
try{
  global.window={location:{hostname:"playnice-preview.vercel.app",search:""},
    dispatchEvent:()=>{}};
  global.fetch=async()=>({ok:true,json:async()=>({status:"READY",maximumMl:20})});
  assert.equal(previewCapForProduct(product),null);
  await warmPurchaseCapPolicy(product);
  assert.equal(previewCapForProduct(product),20);
  assert.equal(assessCartQuantityCap([{id:11,size:"10ml",quantity:1}],11,"10ml",
    previewCapForProduct(product)).blocked,false);
  assert.equal(assessCartQuantityCap([{id:11,size:"10ml",quantity:2}],11,"5ml",
    previewCapForProduct(product)).blocked,true);
  const other={id:12,name:"Other fragrance",slug:"other"};
  global.fetch=async()=>({ok:true,json:async()=>({status:"READY",maximumMl:30})});
  await warmPurchaseCapPolicy(other);
  assert.equal(previewCapForProduct(other),30);
  assert.equal(assessCartQuantityCap([{id:12,size:"20ml",quantity:1},
    {id:12,size:"5ml",quantity:2}],12,"5ml",previewCapForProduct(other)).blocked,true);
  assert.equal(previewCapForProduct({id:13,name:"Unconfigured",slug:"unc"}),null);
  global.window.location.hostname="www.playniceshop.me";
  assert.equal(previewCapForProduct(product),null,"Production never uses Preview policy cache");
}finally{
  if(oldWindow===undefined)delete global.window;else global.window=oldWindow;
  global.fetch=oldFetch;
}
console.log("PASS Preview cart purchase cap: configured override, mixed ml, Production untouched");
