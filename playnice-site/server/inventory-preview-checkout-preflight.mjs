// Preview-only preflight for the EXISTING checkout wrapper.
// Never allocates orders/reservations and never applies in Production.
// Inventory UNKNOWN is fail-open; server-confirmed purchase caps still apply.
import { collectOrderFragranceMl,assessCheckoutOrder } from "./inventory-checkout-guard.mjs";
import { decisionFromShopRemaining } from "./inventory-shop-remaining.mjs";

import rollout from "./inventory-rollout-gate.cjs";
const fallback={decision:"ALLOW"};
const headersFor=(secret)=>{
  const h={apikey:secret,"Content-Type":"application/json"};
  if(!/^sb_secret_/i.test(secret))h.Authorization="Bearer "+secret;
  return h;
};
const setOf=(value)=>new Set(String(value||"").split(";").map(x=>x.trim().toLowerCase()).filter(Boolean));
const serverAllowed=(env)=>rollout.isCheckoutPreflightEnabled(env);
const isValidMl=(n)=>typeof n==="number" && Number.isFinite(n) &&
  n>=2 && n<=200 && Math.abs(n*100-Math.round(n*100))<1e-6;

export async function checkPreviewCheckout(body,{env=process.env,fetchImpl=fetch}={}){
  if(!serverAllowed(env) || body?.type!=="order" ||
     (body?.customer?.country||"ME")!=="ME")return fallback;
  const parsed=collectOrderFragranceMl(body?.items);
  if(parsed.status!=="VALID")return {decision:"INVALID_ORDER"};
  const secret=String(env.SHOP_INVENTORY_READ_SECRET||"").trim();
  if(!secret)return fallback;
  const url=String(env.SUPABASE_URL||"https://fsujznyfdrstinqexxgs.supabase.co").replace(/\/$/,"");
  const ctl=new AbortController();
  const timer=setTimeout(()=>ctl.abort(),3500);
  try{
    const response=await fetchImpl(url+"/rest/v1/rpc/get_shop_purchase_caps_v1",{
      method:"POST",headers:headersFor(secret),body:"{}",signal:ctl.signal
    });
    const policy=response?.ok?await response.json():null;
    const hasValidPolicy=Number(policy?.default_limit_ml)===30 &&
      policy.overrides && typeof policy.overrides==="object" &&
      !Array.isArray(policy.overrides);
    const caps=new Map();
    if(hasValidPolicy){
      const overrides=new Map(Object.entries(policy.overrides)
        .map(([name,value])=>[name.trim().toLowerCase(),value]));
      for(const {productName} of parsed.totals){
        const raw=overrides.has(productName)?overrides.get(productName):30;
        if(!isValidMl(raw))return {decision:"POLICY_UNAVAILABLE"};
        caps.set(productName,raw);
      }
    }
    // V2 stock restrictions apply to names individually approved AND verified.
    const names=rollout.namesFor(env);
    const approved=setOf(names.approved);
    const verified=setOf(names.verified);
    const stock=new Map();
    if(rollout.isInventoryEnabled(env)){
      await Promise.all(parsed.totals.filter(x=>approved.has(x.productName)&&
        verified.has(x.productName)).map(async({productName,requestedMl})=>{
        const r=await decisionFromShopRemaining({
          supabaseUrl:url,secret,productName,requestedTotalMl:requestedMl,
          verifiedRemaining:true,signal:ctl.signal,fetchImpl
        });
        stock.set(productName,r.decision);
      }));
    }
    return assessCheckoutOrder(body.items,{policies:caps,inventoryDecisions:stock});
  }catch{
    // Preserve independently validated limits where available, otherwise
    // preserve existing checkout behavior on transient service failures.
    return fallback;
  }finally{clearTimeout(timer)}
}
