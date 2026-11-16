// Read-only stock decisions from Shop's own server; never expose remaining ml.
// All failures or missing checks fail open. No checkout or inventory writes.
const responses=new Map();
const waiting=new Set();
const FRESH_MS=15000;
// A confirmed limit stays active through background refreshes, rather than
// disappearing with an individual request cache entry.
const blockedByProduct=new Map();
const BLOCK_MS=20000;
const clickPauseByProduct=new Map();
const CLICK_PAUSE_MS=480;
let lastSuccessfulCheck=0;
let networkOutageUntil=0;
const emitDecision=()=>{try{window.dispatchEvent(new Event("playnice:stock-decision-updated"));}catch{}};
const clearProduct=(id)=>{
  const key=String(id);
  blockedByProduct.delete(key);
  clickPauseByProduct.delete(key);
  for(const k of responses.keys())if(k.startsWith(key+":"))responses.delete(k);
};

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
export function isStockDecisionPending(product){
  if(!product?.id || Date.now()<networkOutageUntil || Date.now()-lastSuccessfulCheck>30000)return false;
  return (clickPauseByProduct.get(String(product.id))||0)>Date.now();
}
export function noteInventoryCartClick(product){
  if(!product?.id || Date.now()<networkOutageUntil || Date.now()-lastSuccessfulCheck>30000)return;
  const id=String(product.id);
  clickPauseByProduct.set(id,Date.now()+CLICK_PAUSE_MS);
  setTimeout(()=>{if((clickPauseByProduct.get(id)||0)<=Date.now()){
    clickPauseByProduct.delete(id);emitDecision();
  }},CLICK_PAUSE_MS+15);
}
export function isStockDecisionBlocked(product,cart,size){
  const request=makeKey(product,cart,size);
  const key=request?.key;
  const row=key&&responses.get(key);
  const now=Date.now();
  if(now<networkOutageUntil || now-lastSuccessfulCheck>30000)return false;
  const block=request&&blockedByProduct.get(String(product.id));
  if(block && block.expires>now && request.requestedTotalMl>=block.atMl) return true;
  return Boolean(row && row.decision==="LIMIT_REACHED" && row.expires>now);
}
export async function warmStockDecision(product,cart,size){
  try{
    // Preview only until service role RPC and security review are approved.
    if(typeof window==="undefined" || !window.location.hostname.endsWith(".vercel.app"))return;
    const request=makeKey(product,cart,size);
    if(!request || waiting.has(request.key) || Date.now()<networkOutageUntil)return;
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
      if(!response.ok)throw new Error("INVENTORY_SERVICE_UNAVAILABLE");
      const data=await response.json();
      const decision=data?.decision==="LIMIT_REACHED"?"LIMIT_REACHED":
        data?.decision==="ALLOW"?"ALLOW":"UNKNOWN";
      const now=Date.now();
      const pid=String(product.id);
      if(decision==="UNKNOWN"){
        clearProduct(pid);
        emitDecision();
        return;
      }
      lastSuccessfulCheck=now;
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
      responses.set(request.key,{decision,expires:now+FRESH_MS});
      emitDecision();
    }finally{clearTimeout(timer);waiting.delete(request.key);}
  }catch{
    // Global fail-open circuit: no old denial survives a network outage.
    networkOutageUntil=Date.now()+30000;
    lastSuccessfulCheck=0;
    blockedByProduct.clear();
    responses.clear();
    clickPauseByProduct.clear();
    emitDecision();
  }
}
