import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";

const root = process.cwd();
const sql = fs.readFileSync(path.join(root, "control-center/supabase/inventory_consumption_v1.sql"), "utf8");

for (const token of [
  "fragrance_inventory_events",
  "OPENING",
  "RESTOCK",
  "get_control_center_inventory_stock",
  "record_control_center_inventory_stock",
  "enable row level security",
  "grant execute"
]) assert.ok(sql.includes(token), "Inventory migration missing: " + token);

console.log("PASS inventory consumption v1 schema contract");

const {buildInventoryAnalytics, consumptionBreakdown} = await import("../lib/inventory-accounting.mjs");
const name = "Example fragrance";
const stock = {product_name:name,opening_balance_ml:105,stock_in_ml:105,tracking_started_at:"2026-01-01",manual_out_ml:0,estimated:true,historical_baseline:true};
const shipped = {status:"SHIPPED",packed_at:"2026-11-24",source_payload:{items:[{name,size:"10ml",quantity:1}],giftSamples:[{name,sizeMl:2}]}};
const commerce = {top_products:[{product_name:name,total_ml_out:14,sold_ml:10,gift_ml:4}],full_bottles:[]};
const row = buildInventoryAnalytics([shipped],[stock],commerce).rows[0];
assert.equal(row.orders_out_ml,20);
assert.equal(row.gift_out_ml,6);
assert.equal(row.consumed_since_tracking_ml,26);
assert.equal(row.remaining_ml,79);
const corrected = {...shipped,source_payload:{...shipped.source_payload,giftSamples:[],freeGift:""}};
const after = buildInventoryAnalytics([corrected],[stock],commerce).rows[0];
assert.equal(after.gift_out_ml,4);
assert.equal(after.remaining_ml,81);
const measured = buildInventoryAnalytics([shipped],[{...stock,estimated:false,historical_baseline:false,manual_out_ml:3}],commerce).rows[0];
assert.equal(measured.orders_out_ml,10);
assert.equal(measured.gift_out_ml,2);
assert.equal(measured.remaining_ml,90);
assert.deepEqual(consumptionBreakdown(26,20,5),{orders_out_ml:null,gift_out_ml:null});
console.log("PASS inventory consumption breakdown");
