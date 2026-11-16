// Pure, read-only parity gate for a future Shop stock snapshot.
// Only exact matching, independently produced balances can authorize limits.
// A missing/stale/ambiguous input always yields UNKNOWN; never exposes stock.
const roundCents=(value)=>{
  if(typeof value!=="number" || !Number.isFinite(value) || value<0 ||
     value>5000 || Math.abs(Math.round(value*100)-value*100)>0.000001)return null;
  return Math.round(value*100);
};
const key=(text)=>typeof text==="string"?text.trim().toLocaleLowerCase("en-US"):"";

export function compareInventoryBalance(ccRow,shopRow,options={}){
  const unknown=(reason)=>({decision:"UNKNOWN",reason,allowCheckout:true});
  if(!ccRow || !shopRow)return unknown("MISSING_INPUT");
  const ccName=key(ccRow.product_name),shopName=key(shopRow.product_name);
  if(!ccName || ccName!==shopName)return unknown("PRODUCT_MAPPING_MISMATCH");
  if(ccRow.ambiguous || shopRow.ambiguous || !options.sourceComplete)
    return unknown("INCOMPLETE_OR_AMBIGUOUS_SOURCE");
  if(options.snapshotAgeMs==null || !Number.isFinite(options.snapshotAgeMs) ||
     options.snapshotAgeMs<0 || options.snapshotAgeMs>30000)
    return unknown("STALE_SNAPSHOT");
  // Compare two genuinely independent, server-side reconciliations.
  // A client-supplied CC balance must NEVER be treated as proof.
  if(options.independentlyRecomputed!==true)return unknown("NOT_RECOMPUTED");
  const a=roundCents(ccRow.remaining_ml);
  const b=roundCents(shopRow.remaining_ml);
  if(a===null || b===null)return unknown("INVALID_BALANCE");
  if(a!==b)return unknown("BALANCE_MISMATCH");
  if(options.unmatchedItems || options.unmatchedGifts ||
     options.missingOrders || options.legacyAmbiguity)
    return unknown("UNRESOLVED_CONSUMPTION");
  return {decision:"MATCH",reason:null,allowCheckout:true};
}

export function auditInventoryParity(ccRows,shopRows,options={}){
  const shopMap=new Map();
  const dupes=new Set();
  for(const row of Array.isArray(shopRows)?shopRows:[]){
    const name=key(row?.product_name);
    if(!name)continue;
    if(shopMap.has(name))dupes.add(name);
    shopMap.set(name,row);
  }
  const results=(Array.isArray(ccRows)?ccRows:[]).map(row=>{
    const name=key(row?.product_name);
    const comparison=dupes.has(name)
      ? {decision:"UNKNOWN",reason:"DUPLICATE_MAPPING",allowCheckout:true}
      : compareInventoryBalance(row,shopMap.get(name),options);
    return {product_name:row?.product_name||"",...comparison};
  });
  return {
    total:results.length,
    matched:results.filter(x=>x.decision==="MATCH").length,
    unknown:results.filter(x=>x.decision==="UNKNOWN").length,
    results
  };
}
