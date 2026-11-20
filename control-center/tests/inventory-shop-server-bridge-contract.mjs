import assert from "node:assert/strict";
import fs from "node:fs";
import { decisionFromShopRemaining } from "../../playnice-site/server/inventory-shop-remaining.mjs";
for(const file of ["inventory-accounting.mjs","inventory-shop-source.mjs","inventory-remaining-bridge.mjs"]){
  const cc=fs.readFileSync("control-center/lib/"+file,"utf8");
  const shop=fs.readFileSync("playnice-site/server/"+file,"utf8");
  assert.equal(shop,cc,"Shop/CC inventory code must be byte-identical: "+file);
}
const api=fs.readFileSync("playnice-site/api/inventory-check.js","utf8");
assert.match(api,/isInventoryEnabled\(process\.env\)/);
assert.match(api,/namesFor\(process\.env\)/);
assert.match(fs.readFileSync("playnice-site/server/inventory-rollout-gate.cjs","utf8"),/SHOP_INVENTORY_VERIFIED_REMAINING_NAMES/);
assert.match(fs.readFileSync("playnice-site/server/inventory-rollout-gate.cjs","utf8"),/SHOP_INVENTORY_CHECK_ENABLED/);
assert.match(fs.readFileSync("playnice-site/server/inventory-rollout-gate.cjs","utf8"),/VERCEL_ENV==="preview"/);
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
const source={complete:true,snapshot_at:new Date().toISOString(),events:[{
  id:"1",product_name:perfume,event_type:"BASELINE_SET",
  quantity_ml:100,created_at:"2026-01-01T00:00:00Z"
}],orders:[],items:[]};
const fetchImpl=async()=>({ok:true,json:async()=>source});
const fields={supabaseUrl:"https://example.invalid",secret:"test-secret",
  productName:perfume,fetchImpl};
assert.equal((await decisionFromShopRemaining({...fields,requestedTotalMl:110})).decision,"UNKNOWN",
  "unverified Remaining cannot block, even with a complete and fresh snapshot");
assert.equal((await decisionFromShopRemaining({...fields,requestedTotalMl:100,verifiedRemaining:true})).decision,"ALLOW");
assert.equal((await decisionFromShopRemaining({...fields,requestedTotalMl:110,verifiedRemaining:true})).decision,"LIMIT_REACHED");
assert.equal((await decisionFromShopRemaining({...fields,productName:"Unknown",requestedTotalMl:110})).decision,"UNKNOWN");
for(const snapshot_at of [undefined,"not-a-date",
  new Date(Date.now()-60000).toISOString(),
  new Date(Date.now()+60000).toISOString()]){
  const staleSource={...source,snapshot_at};
  const response=await decisionFromShopRemaining({
    ...fields,requestedTotalMl:110,
    fetchImpl:async()=>({ok:true,json:async()=>staleSource})
  });
  assert.equal(response.decision,"UNKNOWN","invalid/stale/future snapshot must fail open");
}
// Complex stock histories: a single private source must calculate both
// delivered gifts, active SHIPPED consumption, and negative manual-out.
const narciso="Narciso Rodriguez NARCISO Poudrée Eau de Parfum";
const stockCases={
  complete:true,snapshot_at:new Date().toISOString(),
  events:[
    {id:"1",product_name:perfume,event_type:"BASELINE_SET",quantity_ml:100,created_at:"2026-01-01T00:00:00Z"},
    {id:"2",product_name:perfume,event_type:"MANUAL_OUT",quantity_ml:-20,created_at:"2026-03-01T00:00:00Z"},
    {id:"3",product_name:narciso,event_type:"BASELINE_SET",quantity_ml:50,created_at:"2026-01-01T00:00:00Z"},
    {id:"4",product_name:narciso,event_type:"BASELINE_SET",quantity_ml:100,created_at:"2026-02-01T00:00:00Z"},
    {id:"5",product_name:narciso,event_type:"MANUAL_OUT",quantity_ml:-30,created_at:"2026-03-01T00:00:00Z"}
  ],
  orders:[
    {id:"d1",order_id:"PN-DELIVERED",environment:"production",status:"DELIVERED",
      created_at:"2026-04-01T00:00:00Z",source_payload:{
        items:[{name:perfume,size:"10ml",quantity:1}],
        freeGift:perfume+" - 2ml",
        giftSamples:[{name:perfume,size:"2ml",sizeMl:2}]
      }},
    {id:"s1",order_id:"PN-SHIPPED",environment:"production",status:"SHIPPED",
      created_at:"2026-05-01T00:00:00Z",packed_at:"2026-05-02T00:00:00Z",
      source_payload:{items:[{name:perfume,size:"20ml",quantity:1}],
        giftSamples:[{name:perfume,size:"2ml",sizeMl:2}],
        freeGift:perfume+" - 2ml + olovka"}},
    {id:"r1",order_id:"PN-RETURNED",environment:"production",status:"RETURNED",
      created_at:"2026-05-01T00:00:00Z",
      source_payload:{items:[{name:perfume,size:"10ml",quantity:4}]}}
  ],
  items:[{order_record_id:"d1",product_name:perfume,size_label:"10ml",
    size_ml:10,quantity:1,source_data:{}}]
};
const stockCasesFetch=async()=>({ok:true,json:async()=>stockCases});
const checkStock=async(name,total,verified=true)=> (await decisionFromShopRemaining({
  ...fields,fetchImpl:stockCasesFetch,productName:name,requestedTotalMl:total,
  verifiedRemaining:verified
})).decision;
assert.equal(await checkStock(perfume,46),"ALLOW",
  "100 - 20 manual - 10 delivered - 2 delivered gift - 20 shipped - 2 shipped gift = 46");
assert.equal(await checkStock(perfume,47),"LIMIT_REACHED");
assert.equal(await checkStock(perfume,47,false),"UNKNOWN",
  "no verified stock, no blocking");
assert.equal(await checkStock(narciso,70),"ALLOW",
  "most recent baseline 100 - 30 manual removal, not sum of two baselines");
assert.equal(await checkStock(narciso,71),"LIMIT_REACHED");
const afterDelivered={
  ...stockCases,snapshot_at:new Date().toISOString(),
  orders:stockCases.orders.map(o=>o.id==="s1"?{...o,status:"DELIVERED"}:o),
  items:[...stockCases.items,{order_record_id:"s1",product_name:perfume,
    size_label:"20ml",size_ml:20,quantity:1,source_data:{}}]
};
const afterDeliveredFetch=async()=>({ok:true,json:async()=>afterDelivered});
assert.equal((await decisionFromShopRemaining({...fields,productName:perfume,
  requestedTotalMl:47,verifiedRemaining:true,fetchImpl:afterDeliveredFetch})).decision,
  "LIMIT_REACHED","transition to DELIVERED must not double-debit shipment");
// Runtime source verification must fail open even if a malformed payload
// incorrectly claims complete=true.
const malformedSnapshots=[
  {...stockCases,items:[{order_record_id:"ghost",product_name:perfume}]},
  {...stockCases,orders:[{...stockCases.orders[0],environment:"preview"}]},
  {...stockCases,orders:[stockCases.orders[0],stockCases.orders[0]]},
  {...stockCases,events:null}
];
for(const bad of malformedSnapshots){
  const answer=await decisionFromShopRemaining({...fields,
    productName:perfume,requestedTotalMl:47,verifiedRemaining:true,
    fetchImpl:async()=>({ok:true,json:async()=>({...bad,snapshot_at:new Date().toISOString()})})
  });
  assert.equal(answer.decision,"UNKNOWN","invalid private source must never block");
}
const responseSource=fs.readFileSync("playnice-site/server/inventory-shop-remaining.mjs","utf8");
// Inspect actual return lines; comments are not executable return statements.
const returnLines=responseSource.split("\n").map(line=>line.trim()).filter(line=>line.startsWith("return "));
assert.ok(returnLines.every(line => line !== "return source;" && line !== "return result.rows;"));
assert.ok(responseSource.includes('return ["ALLOW","LIMIT_REACHED"].includes(decision.decision)?'));
console.log("PASS preview-only Shop backend: byte-identical CC calculation, service-role-only source, fail-open");
