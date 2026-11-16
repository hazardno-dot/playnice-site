import assert from "node:assert/strict";
import fs from "node:fs";
import { buildInventoryAnalytics,inventorySaleItems,inventoryGiftItems,canonicalProductName } from "../lib/inventory-accounting.mjs";

const ordersSource=fs.readFileSync("control-center/server/orders.js","utf8");
assert.match(ordersSource,/import \{ buildInventoryAnalytics \} from "\.\.\/lib\/inventory-accounting\.mjs"/);
assert.doesNotMatch(ordersSource,/function buildInventoryAnalytics\(/,"no duplicate inventory accounting allowed");

const product="Xerjoff Naxos Eau de Parfum";
const stock=[{
 product_name:product, opening_balance_ml:100,stock_in_ml:100,
 restock_ml:0,manual_out_ml:0,baseline_verified:true,estimated:true,
 historical_baseline:true,tracking_started_at:"2026-01-01T00:00:00Z"
}];
const orders=[{
 order_id:"PN0001",environment:"production",status:"DELIVERED",
 created_at:"2026-05-01T12:00:00Z",packed_at:"2026-05-02T12:00:00Z",
 source_payload:{items:[{name:product,size:"10ml",quantity:2}],
 giftSamples:[{name:product,size:"2ml"}]}
},{
 order_id:"PN0002",environment:"production",status:"NEW",
 created_at:"2026-05-03T12:00:00Z",
 source_payload:{items:[{name:product,size:"5ml",quantity:1}]}
}];
const commerce={full_bottles:[],top_products:[{
 product_name:product,total_ml_out:22,sold_ml:20,gift_ml:2
}]};
const result=buildInventoryAnalytics(orders,stock,commerce);
assert.equal(result.rows.length,1);
assert.equal(result.rows[0].remaining_ml,78);
assert.equal(result.rows[0].pending_new_ml,5);
assert.equal(result.rows[0].hypothetical_after_new_ml,73);
assert.equal(result.rows[0].consumed_since_tracking_ml,22);
assert.equal(result.rows[0].historical_baseline,true);
assert.equal(result.remaining_total_ml,78);
assert.deepEqual(inventorySaleItems([{name:product,size:"10ml",quantity:2}]),
 [{product_name:product,ml:20}]);
assert.deepEqual(inventoryGiftItems({giftSamples:[{name:product,size:"2ml"}]}),
 [{product_name:product,ml:2}]);
assert.equal(canonicalProductName("afnan 9am"),"Afnan 9 AM Eau de Parfum");

const fresh={...stock[0],historical_baseline:false,estimated:false};
const freshResult=buildInventoryAnalytics(orders,[fresh],commerce);
assert.equal(freshResult.rows[0].remaining_ml,78);
assert.equal(freshResult.rows[0].consumed_since_tracking_ml,22);
console.log("PASS exact shared Control Center inventory accounting: orders, gifts, NEW demand");
