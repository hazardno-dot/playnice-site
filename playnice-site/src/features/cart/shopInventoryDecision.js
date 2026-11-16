// Read-only stock decisions from Shop's own server; never expose remaining ml.
// All failures or missing checks fail open. No checkout or inventory writes.
const responses=new Map();
const waiting=new Set();
const FRESH_MS=15000;
// A confirmed limit stays active through background refreshes, rather than
// disappearing with an individual request cache entry.
const blockedByProduct=new Map();
const BLOCK_MS=60000;
const makeKey=(product,cart,size)=>{
  const next=requestedCartTotalMl(cart,product?.id,size);
  return next===null || !product?.name?null:{
    key:String(product.id)+":"+next,
    productName:String(product.name),
    requestedTotalMl:next
  };
};
export function requestedCartTotalMl(cart,productId,extraSize){
  const parse=(str)=>{const m=String(str||"").trim().match(/^(\d+(?:\.\d+)?)\s*ml$/i);return m?Number(m[1]):null;};
  const added=parse(extraSize);
  if(productId==null || !Number.isFinite(added) || added<=0) return null;
  let units=Math.round(added*100);
  for(const item of Array.isArray(cart)?cart:[]){
    if(item?.id!==productId)continue;
    const ml=parse(item.size),qty=Number(item.quantity);
    if(!Number.isFinite(ml)||ml<=0||!Number.isSafeInteger(qty)||qty<0)return null;
    units+=Math.round(ml*100)*qty;
  }
  return units>0 && units<=500000 && Number.isSafeInteger(units)?units/100:null;
}
export function isStockDecisionBlocked(product,cart,size){
  const key=makeKey(product,cart,size)?.key;
  const row=key&&responses.get(key);
  const now=Date.now();
  const request=makeKey(product,cart,size);
  const block=request&&blockedByProduct.get(String(product.id));
  if(block && block.expires>now && request.requestedTotalMl>=block.atMl) return true;
  return Boolean(row && row.decision==="LIMIT_REACHED" && row.expires>now);
}
export async function warmStockDecision(product,cart,size){
  try{
    // Preview only until service role RPC and security review are approved.
    if(typeof window==="undefined" || !window.location.hostname.endsWith(".vercel.app"))return;
    const request=makeKey(product,cart,size);
    if(!request || waiting.has(request.key))return;
    const cached=responses.get(request.key);
    if(cached && cached.expires>Date.now())return;
    waiting.add(request.key);
    const ctl=new AbortController();
    const timer=setTimeout(()=>ctl.abort(),3500);
    try{
      const response=await fetch("/api/inventory-check",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          productName:request.productName,requestedTotalMl:request.requestedTotalMl
        }),
        credentials:"same-origin",cache:"no-store",signal:ctl.signal
      });
      const data=response.ok?await response.json():null;
      const decision=data?.decision==="LIMIT_REACHED"?"LIMIT_REACHED":
        data?.decision==="ALLOW"?"ALLOW":"UNKNOWN";
      const now=Date.now();
      const pid=String(product.id);
      if(decision==="LIMIT_REACHED"){
        const prior=blockedByProduct.get(pid);
        blockedByProduct.set(pid,{
          atMl:Math.min(prior?.expires>now?prior.atMl:Infinity,request.requestedTotalMl),
          expires:now+BLOCK_MS
        });
      }else if(decision==="UNKNOWN" ||
          (decision==="ALLOW" && request.requestedTotalMl>=
            (blockedByProduct.get(pid)?.atMl??Infinity))){
        blockedByProduct.delete(pid);
      }
      responses.set(request.key,{decision,expires:now+(decision==="UNKNOWN"?2000:FRESH_MS)});
      window.dispatchEvent(new Event("playnice:stock-decision-updated"));
    }finally{clearTimeout(timer);waiting.delete(request.key);}
  }catch{
    // Fail open on outages: don't retain a prior stop signal without a working
    // decision service. Never affect the checkout itself.
    if(product?.id!=null) blockedByProduct.delete(String(product.id));
  }
}
