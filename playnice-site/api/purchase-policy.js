// Preview-only read of administrator-managed per-fragrance purchase limits.
// Exposes only the requested limit (never the complete policy or Supabase secret).
// This endpoint DOES NOT enforce checkout and does not alter inventory.
const {isPolicyEnabled}=require("../server/inventory-rollout-gate.cjs");
const SUPABASE_URL=String(process.env.SUPABASE_URL||"https://fsujznyfdrstinqexxgs.supabase.co").trim();
const SECRET=String(process.env.SHOP_INVENTORY_READ_SECRET||"").trim();
const ENABLED=isPolicyEnabled(process.env);
const unavailable={status:"NOT_CONFIGURED"};
module.exports=async function handler(req,res){
  res.setHeader("Cache-Control","private, no-store, max-age=0");
  res.setHeader("X-Content-Type-Options","nosniff");
  if(req.method!=="POST")return res.status(405).json(unavailable);
  if(!ENABLED || !SECRET)return res.status(200).json(unavailable);
  if(!req.body || typeof req.body!=="object" || Array.isArray(req.body) ||
     Number(req.headers["content-length"]||0)>512)
    return res.status(200).json(unavailable);
  const name=typeof req.body.productName==="string"?req.body.productName.trim():"";
  if(!name || name.length>180)return res.status(200).json(unavailable);
  const ctl=new AbortController();
  const timer=setTimeout(()=>ctl.abort(),2500);
  try{
    const headers={apikey:SECRET,"Content-Type":"application/json"};
    if(!/^sb_secret_/i.test(SECRET))headers.Authorization="Bearer "+SECRET;
    const response=await fetch(SUPABASE_URL.replace(/\/$/,"")+
      "/rest/v1/rpc/get_shop_purchase_caps_v1",{
        method:"POST",headers,body:"{}",signal:ctl.signal
      });
    if(!response.ok)return res.status(200).json(unavailable);
    const policy=await response.json();
    if(Number(policy?.default_limit_ml)!==30 || !policy.overrides ||
      typeof policy.overrides!=="object" || Array.isArray(policy.overrides))
      return res.status(200).json(unavailable);
    const entries=Object.entries(policy.overrides).filter(([product])=>
      product.trim().toLowerCase()===name.toLowerCase());
    if(entries.length>1)return res.status(200).json(unavailable);
    const maximumMl=entries.length?Number(entries[0][1]):30;
    if(!Number.isFinite(maximumMl)||maximumMl<2||maximumMl>200||
       Math.abs(maximumMl*100-Math.round(maximumMl*100))>1e-6)
      return res.status(200).json(unavailable);
    return res.status(200).json({status:"READY",maximumMl});
  }catch{return res.status(200).json(unavailable);}
  finally{clearTimeout(timer);}
};
