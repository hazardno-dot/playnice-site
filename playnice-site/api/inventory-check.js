// Read-only Shop inventory decision bridge. Safe defaults: disabled & UNKNOWN.
// No changes to order persistence, and NO raw balances returned to shoppers.
const SUPABASE_URL=String(process.env.SUPABASE_URL||"https://fsujznyfdrstinqexxgs.supabase.co").trim();
const SECRET=String(process.env.SHOP_INVENTORY_READ_SECRET||"").trim();
const ENABLED=process.env.SHOP_INVENTORY_CHECK_ENABLED==="true" &&
  process.env.VERCEL_ENV==="preview";
const UNKNOWN={decision:"UNKNOWN"};
const getBody=(req)=>req.body && typeof req.body==="object" && !Array.isArray(req.body)?req.body:null;
module.exports=async function handler(req,res){
  res.setHeader("Cache-Control","private, no-store, max-age=0");
  res.setHeader("X-Content-Type-Options","nosniff");
  if(req.method!=="POST") return res.status(405).json(UNKNOWN);
  if(!ENABLED || !SECRET) return res.status(200).json(UNKNOWN);
  const body=getBody(req);
  if(!body || Number(req.headers["content-length"]||0)>512)
    return res.status(200).json(UNKNOWN);
  const name=typeof body.productName==="string"?body.productName.trim():"";
  const total=body.requestedTotalMl;
  if(!name || name.length>180 || typeof total!=="number" ||
     !Number.isFinite(total) || total<=0 || total>5000)
    return res.status(200).json(UNKNOWN);
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),2500);
  try{
    const headers={
      apikey:SECRET,
      "Content-Type":"application/json"
    };
    if(!/^sb_secret_/i.test(SECRET)) headers.Authorization="Bearer "+SECRET;
    // Stage 2 remains OFF until exact CC parity has been checked for each
    // fragrance and approved names are explicitly set in Preview settings.
    // Fail open for unapproved products. The old conservative RPC stays
    // active unless the stage-2 flag is deliberately enabled.
    if(process.env.SHOP_INVENTORY_SOURCE_V2_ENABLED==="true"){
      const approved=String(process.env.SHOP_INVENTORY_PARITY_APPROVED_NAMES||"")
        .split(";").map(s=>s.trim().toLowerCase()).filter(Boolean);
      if(!approved.includes(name.toLowerCase()))
        return res.status(200).json(UNKNOWN);
      // Separate operational verification from numerical parity approval.
      // Both must explicitly include the product before V2 can block.
      const verified=String(process.env.SHOP_INVENTORY_VERIFIED_REMAINING_NAMES||"")
        .split(";").map(s=>s.trim().toLowerCase()).filter(Boolean);
      if(!verified.includes(name.toLowerCase()))
        return res.status(200).json(UNKNOWN);
      const {decisionFromShopRemaining}=await import("../server/inventory-shop-remaining.mjs");
      const result=await decisionFromShopRemaining({
        supabaseUrl:SUPABASE_URL,secret:SECRET,productName:name,
        requestedTotalMl:total,verifiedRemaining:true,signal:controller.signal
      });
      return res.status(200).json(result);
    }
    const response=await fetch(
      SUPABASE_URL+"/rest/v1/rpc/get_shop_inventory_cart_decision",
      {method:"POST",headers,body:JSON.stringify({
        p_product_name:name,p_requested_total_ml:total
      }),signal:controller.signal}
    );
    if(!response.ok) return res.status(200).json(UNKNOWN);
    const data=await response.json();
    const decision=["ALLOW","LIMIT_REACHED"].includes(data?.decision)?
      data.decision:"UNKNOWN";
    return res.status(200).json({decision});
  }catch{return res.status(200).json(UNKNOWN);}
  finally{clearTimeout(timer);}
};
