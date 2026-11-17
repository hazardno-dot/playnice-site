// Optional cart-only decant quantity limit. No inventory data is fetched here.
// The Naxos 100 ml fixture is explicitly Preview-only and user-activated.
// Until a trusted server-sourced cap exists, Production must fail open.
const sizeMl = (size) => {
  const match = String(size || "").trim().match(/^(\d+(?:\.\d+)?)\s*ml$/i);
  return match ? Number(match[1]) : null;
};

const purchasePolicies=new Map();
const pendingPolicies=new Set();
const REFRESH_MS=15000; // Retry cadence only, never the lifetime of an accepted purchase cap.
const policyEnabledHost=()=>{
  try{return typeof window!=="undefined"&&window.location.hostname.endsWith(".vercel.app");}
  catch{return false;}
};
const notifyPolicyChange=()=>{
  try{window.dispatchEvent(new Event("playnice:stock-decision-updated"));}catch{}
};
// Fetch only a single fragrance's cap; the Shop never receives the admin override map.
// No enforcement happens unless the Preview server returns a validated policy.
export async function warmPurchaseCapPolicy(product) {
  const name=String(product?.name||"").trim();
  if(!policyEnabledHost()||!name||name.length>180)return;
  const key=name.toLowerCase(),now=Date.now(),cached=purchasePolicies.get(key);
  if(pendingPolicies.has(key)||cached?.refreshAfter>now)return;
  pendingPolicies.add(key);
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),3500);
  try{
    const response=await fetch("/api/purchase-policy",{
      method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({productName:name}),credentials:"same-origin",
      cache:"no-store",signal:controller.signal
    });
    const data=response.ok?await response.json():null;
    const cap=Number(data?.maximumMl);
    const approved=data?.status==="READY"&&typeof data.maximumMl==="number"&&
      Number.isFinite(cap)&&cap>=2&&cap<=200&&
      Math.abs(cap*100-Math.round(cap*100))<1e-6;
    purchasePolicies.set(key,{cap:approved?cap:(cached?.cap??null),refreshAfter:Date.now()+REFRESH_MS});
    notifyPolicyChange();
  }catch{
    // Policy service unavailable: do not invent a customer restriction.
    purchasePolicies.set(key,{cap:cached?.cap??null,refreshAfter:Date.now()+REFRESH_MS});
    notifyPolicyChange();
  }finally{clearTimeout(timer);pendingPolicies.delete(key);}
}
const previewPolicyCap=(product)=>{
  if(!policyEnabledHost())return null;
  const key=String(product?.name||"").trim().toLowerCase();
  const entry=purchasePolicies.get(key);
  // A confirmed administrative purchase cap must not silently expire mid-cart.
  // refreshAfter only controls when the server may be queried again.
  return entry?.cap??null;
};

export function previewCapForProduct(product) {
  try {
    if(!policyEnabledHost())return null;
    const configuredCap=previewPolicyCap(product);
    const demo=new URLSearchParams(window.location.search).get("inventoryCapDemo")==="1" &&
      String(product?.slug||"").toLowerCase()==="xerjoff-naxos" ? 100 : null;
    // A real policy never becomes less restrictive because of the synthetic demo.
    return configuredCap!==null && demo!==null?Math.min(configuredCap,demo):
      configuredCap??demo;
  } catch { return null; }
}

export function assessCartQuantityCap(cart, productId, extraSize, maximumMl, count = 1) {
  // Unknown, invalid or untrusted maxima never cause a cart restriction.
  if (typeof maximumMl !== "number" || !Number.isFinite(maximumMl) || maximumMl <= 0)
    return { blocked: false, reason: "NO_TRUSTED_CAP" };
  const extra = sizeMl(extraSize);
  if (!Number.isFinite(extra) || extra <= 0 ||
      !Number.isSafeInteger(count) || count <= 0 || productId == null)
    return { blocked: false, reason: "UNKNOWN_DEMAND" };
  let current = 0;
  for (const row of Array.isArray(cart) ? cart : []) {
    if (row?.id !== productId) continue;
    const ml = sizeMl(row.size);
    const qty = Number(row.quantity);
    // Skip restricting mixed, malformed or unrecognized items instead of guessing.
    if (!Number.isFinite(ml) || ml <= 0 || !Number.isSafeInteger(qty) || qty < 0)
      return {blocked:false,reason:"UNKNOWN_CART_STATE"};
    current += Math.round(ml * 100) * qty;
  }
  const next = current + Math.round(extra * 100) * count;
  if (!Number.isSafeInteger(next))
    return { blocked:false, reason:"UNKNOWN_CART_STATE" };
  return { blocked: next > Math.round(maximumMl * 100), reason: next > Math.round(maximumMl * 100) ? "CAP_REACHED" : "WITHIN_CAP" };
}
