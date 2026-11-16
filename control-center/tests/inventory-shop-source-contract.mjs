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
const result=remainingFromSupabaseSources({events,orders,items,complete:true});
assert.equal(result.complete,true);
assert.equal(result.rows[0].remaining_ml,123);
assert.equal(result.rows[0].pending_new_ml,5);
assert.equal(remainingFromSupabaseSources({events,orders,items,complete:false}).complete,false);
assert.equal(remainingFromSupabaseSources({events:[{...events[0],event_type:"UNKNOWN"}],
 orders,items,complete:true}).complete,false);
const missingGift=commerceFromDeliveredHistory([...orders,
 {id:"o3",environment:"production",status:"DELIVERED",
 source_payload:{freeGift:perfume+" - 5 ml"}}],items);
assert.equal(missingGift.complete,false);
const missingBundle=commerceFromDeliveredHistory(orders,
 [{...items[0],size_label:"unknown",size_ml:0}]);
assert.equal(missingBundle.complete,false);
assert.equal(stockRowsFromInventoryEvents(null).complete,false);
console.log("PASS read-only Supabase source adapter: CC Remaining, gifts, manual-out, unknown fail-open");
