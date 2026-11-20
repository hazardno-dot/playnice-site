// Private Shop server (Preview only). Never return source rows to browser.
import { remainingFromSupabaseSources } from "./inventory-shop-source.mjs";
import { shopDecisionFromRemaining } from "./inventory-remaining-bridge.mjs";

const UNKNOWN={decision:"UNKNOWN"};
const normalize=s=>String(s||"").trim().toLowerCase();
export async function decisionFromShopRemaining({
  supabaseUrl,secret,productName,requestedTotalMl,verifiedRemaining=false,fetchImpl=fetch,signal
}={}){
  try{
    if(!secret||!supabaseUrl||!productName||!Number.isFinite(requestedTotalMl))
      return UNKNOWN;
    const headers={apikey:secret,"Content-Type":"application/json"};
    if(!/^sb_secret_/i.test(secret)) headers.Authorization="Bearer "+secret;
    const response=await fetchImpl(
      supabaseUrl.replace(/\/$/,"")+"/rest/v1/rpc/get_shop_inventory_source_v1",
      {method:"POST",headers,body:"{}",signal}
    );
    if(!response?.ok)return UNKNOWN;
    const source=await response.json();
    if(!source||source.complete!==true)return UNKNOWN;
    // Independent completeness/shape defense beyond the service-role SQL.
    // Never enforce a stock cap on malformed, mixed-environment or
    // unjoinable order snapshots.
    if(!Array.isArray(source.events)||!Array.isArray(source.orders)||
       !Array.isArray(source.items)||source.events.length>2000||
       source.orders.length>250||source.items.length>5000)return UNKNOWN;
    const ids=new Set();
    for(const order of source.orders){
      if(!order?.id || order.environment!=="production" ||
         ids.has(String(order.id)))return UNKNOWN;
      ids.add(String(order.id));
    }
    if(source.items.some(item=>!item?.order_record_id||
       !ids.has(String(item.order_record_id))))return UNKNOWN;
    // A complete source is not necessarily fresh. Reject missing, invalid,
    // future-dated or stale snapshots instead of assuming freshness.
    const snapshotAt=typeof source.snapshot_at==="string"?Date.parse(source.snapshot_at):NaN;
    const ageMs=Date.now()-snapshotAt;
    if(!Number.isFinite(snapshotAt)||ageMs < -5000||ageMs > 30000)return UNKNOWN;
    const result=remainingFromSupabaseSources(source);
    if(!result.complete)return UNKNOWN;
    const decision=shopDecisionFromRemaining(
      result.rows,productName,requestedTotalMl,{
        complete:true,fresh:true,verifiedRemaining:verifiedRemaining===true,
        // No customer-reported stock values accepted.
        hasUnmatchedOrders:false,ambiguousMappings:false
      }
    );
    return ["ALLOW","LIMIT_REACHED"].includes(decision.decision)?
      {decision:decision.decision}:UNKNOWN;
  }catch{return UNKNOWN;}
}
