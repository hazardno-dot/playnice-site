import assert from "node:assert/strict";
import { stockRowsFromInventoryEvents,commerceFromDeliveredHistory,
  remainingFromSupabaseSources } from "../lib/inventory-shop-source.mjs";
const perfume="Xerjoff Naxos Eau de Parfum";
const events=[
 {id:"1",created_at:"2026-01-01T00:00:00Z",event_type:"BASELINE_SET",product_name:perfume,quantity_ml:100},
 {id:"2",created_at:"2026-02-01T00:00:00Z",event_type:"RESTOCK",product_name:perfume,quantity_ml:50},
 {id:"3",created_at:"2026-02-02T00:00:00Z",event_type:"MANUAL_OUT",product_name:perfume,quantity_ml:-5}
];
const orders=[{id:"o1",environment:"production",status:"DELIVERED",
 packed_at:"2026-03-01T00:00:00Z",source_payload:{freeGift:perfume+" - 2 ml",
 items:[{name:perfume,size:"10ml",quantity:2}]}},
{id:"o2",environment:"production",status:"NEW",source_payload:{items:[{name:perfume,size:"5ml",quantity:1}]}}];
const items=[{order_record_id:"o1",product_name:perfume,size_label:"10ml",
 size_ml:10,quantity:2,source_data:{name:perfume,size:"10ml",quantity:2}}];
const stock=stockRowsFromInventoryEvents(events);
assert.equal(stock.complete,true);
assert.equal(stock.rows[0].stock_in_ml,150);
assert.equal(stock.rows[0].manual_out_ml,5);
const commerce=commerceFromDeliveredHistory(orders,items);
assert.equal(commerce.complete,true);
assert.equal(commerce.commerce.top_products[0].total_ml_out,22);
assert.equal(commerce.commerce.full_bottles.length,0,
  "two 10 ml decants must not count as a full bottle");
const bulk=commerceFromDeliveredHistory(orders,[{...items[0],quantity:10}]);
assert.equal(bulk.commerce.full_bottles.length,0,
  "ten 10 ml decants must not be misclassified as a 100 ml bottle");

const result=remainingFromSupabaseSources({events,orders,items,complete:true});
assert.equal(result.complete,true);
assert.equal(result.rows[0].remaining_ml,123);
assert.equal(result.rows[0].pending_new_ml,5);
const shippedOrders=[...orders,{
 id:"o-shipped",environment:"production",status:"SHIPPED",
 packed_at:"2026-11-18T12:00:00Z",
 source_payload:{items:[{name:perfume,size:"20ml",quantity:1}],
   giftSamples:[{name:perfume,size:"2ml",sizeMl:2}],
   freeGift:perfume+" - 2ml + olovka"}
}];
const shippedRemaining=remainingFromSupabaseSources({
 events,orders:shippedOrders,items,complete:true
});
assert.equal(shippedRemaining.complete,true);
assert.equal(shippedRemaining.rows[0].remaining_ml,101,
  "full source must subtract 22 ml from a non-delivered SHIPPED parcel");
assert.equal(remainingFromSupabaseSources({events,orders,items,complete:false}).complete,false);
assert.equal(remainingFromSupabaseSources({events:[{...events[0],event_type:"UNKNOWN"}],
 orders,items,complete:true}).complete,false);
const missingGift=commerceFromDeliveredHistory([...orders,
 {id:"o3",environment:"production",status:"DELIVERED",
 source_payload:{freeGift:perfume+" - 5 ml"}}],items);
assert.equal(missingGift.complete,false);
// Real production shape: some delivered orders contain both giftSamples and
// legacy freeGift; delivered historical commerce must not count the same 2 ml twice.
const dualGift=commerceFromDeliveredHistory([{...orders[0],source_payload:{
  ...orders[0].source_payload,giftSamples:[{name:perfume,sizeMl:2}]
}}],items);
assert.equal(dualGift.complete,true);
assert.equal(dualGift.commerce.top_products[0].gift_ml,2);
// A non-fragrance stationery gift must not be interpreted as stock consumption.
const stationery=commerceFromDeliveredHistory([{...orders[0],source_payload:{
  ...orders[0].source_payload,freeGift:"olovka",giftSamples:[]
}}],items);
assert.equal(stationery.complete,true);
assert.equal(stationery.commerce.top_products[0].gift_ml,0);
const historicalBundle=commerceFromDeliveredHistory([{
  ...orders[0],source_payload:{items:[{
    name:"Arabiyat P. Marwa / Al Haramain Signature Blue / Rayhaan Aquatica / Afnan 9AM",
    size:"5ml × 4",quantity:1
  }]}
}], [{
  order_record_id:"o1",
  product_name:"Arabiyat P. Marwa / Al Haramain Signature Blue / Rayhaan Aquatica / Afnan 9AM",
  size_label:"5ml × 4",size_ml:null,quantity:1,source_data:{}
}]);
assert.equal(historicalBundle.complete,true,
  "a 5ml × 4 legacy bundle without size_ml must not invalidate entire snapshot");
assert.equal(historicalBundle.commerce.top_products.length,4);
assert.equal(historicalBundle.commerce.top_products.find(x=>x.product_name==="Haramain Signature Blue Eau de Parfum")?.sold_ml,5,
  "historical Al Haramain Signature Blue must resolve to the tracked CC inventory name");
assert.ok(!historicalBundle.commerce.top_products.some(x=>x.product_name==="Al Haramain Signature Blue"),
  "old bundle alias must not create a phantom inventory product");
assert.equal(historicalBundle.commerce.top_products.reduce((sum,x)=>sum+x.sold_ml,0),20);
const missingBundle=commerceFromDeliveredHistory(orders,
 [{...items[0],size_label:"unknown",size_ml:0}]);
assert.equal(missingBundle.complete,false);
assert.equal(stockRowsFromInventoryEvents(null).complete,false);
console.log("PASS read-only Supabase source adapter: CC Remaining, gifts, manual-out, unknown fail-open");
