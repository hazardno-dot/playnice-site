// Read-only source adapter for identical Control Center Remaining calculation.
// Takes raw Supabase rows; no network, database writes or checkout dependencies.
// The Shop server will only consume sanitized final decisions after parity QA.
import { buildInventoryAnalytics, inventorySaleItems, canonicalProductName } from "./inventory-accounting.mjs";

const lower=s=>String(s||"").trim().toLowerCase();
const num=v=>Number(v);
const positive=v=>Number.isFinite(num(v))&&num(v)>0;
const sortBy=(a,b)=>String(a.created_at||"").localeCompare(String(b.created_at||""))||String(a.id||"").localeCompare(String(b.id||""));
const round=v=>Math.round((v+Number.EPSILON)*100)/100;
const isValidMl=v=>Number.isFinite(num(v))&&num(v)>=0&&num(v)<=5000;

export function stockRowsFromInventoryEvents(events){
  if(!Array.isArray(events))return {complete:false,rows:[],issues:["EVENTS_MISSING"]};
  const groups=new Map(), issues=[];
  for(const e of events){
    const k=lower(e?.product_name);
    if(!k||!["BASELINE_SET","OPENING","RESTOCK","MANUAL_OUT"].includes(e?.event_type)||
       !Number.isFinite(num(e?.quantity_ml))||!e?.created_at||!e?.id){
      issues.push("UNKNOWN_INVENTORY_EVENT");continue;
    }
    if(!groups.has(k))groups.set(k,[]);
    groups.get(k).push(e);
  }
  const rows=[];
  for(const eventsForName of groups.values()){
    const sorted=[...eventsForName].sort(sortBy);
    const base=sorted.filter(e=>e.event_type==="BASELINE_SET").at(-1);
    const opening=sorted.find(e=>e.event_type==="OPENING");
    const first=base||opening;
    if(!first){issues.push("MISSING_BASELINE");continue;}
    const starting=num(first.quantity_ml);
    const restock=sorted.filter(e=>e.event_type==="RESTOCK").reduce((n,e)=>n+num(e.quantity_ml),0);
    const manualOut=-sorted.filter(e=>e.event_type==="MANUAL_OUT").reduce((n,e)=>n+num(e.quantity_ml),0);
    if(!isValidMl(starting)||!isValidMl(restock)||!isValidMl(manualOut)){
      issues.push("INVALID_LEDGER_QUANTITY");continue;
    }
    const provisional=base!==undefined||
      ["PROVISIONAL_100_ML_HISTORICAL",
       "Historical opening estimate — 100 ml, before recorded shipments"].includes(opening?.note);
    rows.push({
      product_name:first.product_name,
      tracking_started_at:opening?.created_at||null,
      opening_balance_ml:starting,restock_ml:restock,manual_out_ml:manualOut,
      stock_in_ml:round(starting+restock),
      estimated:provisional,baseline_verified:Boolean(base),
      historical_baseline:provisional
    });
  }
  return {complete:issues.length===0,rows,issues};
}

// A compact projection of the CC commerce RPC's historical consumed volume.
// Direct sales/bundles come from delivered order_items, gifts from legacy freeGift
// (exactly as the currently installed get_control_center_order_analytics RPC).
export function commerceFromDeliveredHistory(orders,items){
  const issues=[];
  if(!Array.isArray(orders)||!Array.isArray(items))
    return {complete:false,commerce:{top_products:[],full_bottles:[]},issues:["ORDERS_MISSING"]};
  const delivered=new Map(orders.filter(o=>o?.environment==="production"&&o.status==="DELIVERED")
    .map(o=>[o.id,o]));
  const counts=new Map(),full=new Map();
  const add=(name,ml,kind,fullBottle=false)=>{
    const n=canonicalProductName(name), k=lower(n),value=num(ml);
    if(!k||!positive(value)){issues.push("INVALID_CONSUMPTION_ITEM");return;}
    let row=counts.get(k);if(!row){row={product_name:n,total_ml_out:0,sold_ml:0,gift_ml:0};counts.set(k,row);}
    row.total_ml_out+=value;
    if(kind==="gift")row.gift_ml+=value;else row.sold_ml+=value;
    if(kind==="sale"&&fullBottle)full.set(k,(full.get(k)||0)+value);
  };
  for(const i of items){
    if(!delivered.has(i?.order_record_id))continue;
    const quantity=num(i.quantity);
    const sizeMl=num(i.size_ml);
    if(!positive(quantity)||!positive(sizeMl)||!i.product_name){issues.push("INVALID_SALE_ITEM");continue;}
    const item={name:i.product_name,size:i.size_label,sizeMl,quantity,
      bundleItems:Array.isArray(i.source_data?.bundleItems)?i.source_data.bundleItems:[]};
    const sales=inventorySaleItems([item]);
    if(sales.length){
      for(const sale of sales)add(sale.product_name,sale.ml,"sale",false);
    }else if(sizeMl>=50 && !item.bundleItems.length){
      add(item.name,sizeMl*quantity,"sale",true);
    }else{
      issues.push("UNRECOGNIZED_BUNDLE_OR_DECANT");
    }
  }
  for(const o of delivered.values()){
    const text=String(o.source_payload?.freeGift||"").trim();
    if(!text)continue;
    // Legacy CC analytics currently recognizes only 2 ml freeGift records.
    const m=text.match(/^(.*?)\s*[-–—]\s*2\s*ml/i);
    if(m && m[1].trim())add(m[1],2,"gift");
    else if(/\d+(?:\.\d+)?\s*ml/i.test(text))issues.push("UNRECONCILED_GIFT_FORMAT");
  }
  return {complete:issues.length===0,
    commerce:{top_products:[...counts.values()].map(r=>({
      ...r,total_ml_out:round(r.total_ml_out),sold_ml:round(r.sold_ml),gift_ml:round(r.gift_ml)})),
      full_bottles:[...full.entries()].map(([k,ml])=>({
        product_name:counts.get(k)?.product_name||k,ml:round(ml)}))},issues};
}
export function remainingFromSupabaseSources({events,orders,items,complete}={}){
  const inventory=stockRowsFromInventoryEvents(events);
  const history=commerceFromDeliveredHistory(orders,items);
  if(complete!==true||!inventory.complete||!history.complete)
    return {complete:false,rows:[],issues:[...inventory.issues,...history.issues,
      ...(complete===true?[]:["SOURCE_PAGINATION_UNVERIFIED"])]};
  const data=buildInventoryAnalytics(orders,inventory.rows,history.commerce);
  return {complete:true,rows:data.rows,issues:[]};
}
