// PURE validation contract for a future atomic checkout admission path.
// No network, persistence, account identity, or customer-facing stock details.
// This module is intentionally not wired into /api/checkout yet.
const cents = (value) =>
  typeof value==="number" && Number.isFinite(value) && value>0 &&
  Math.abs(value*100-Math.round(value*100))<1e-6
    ? Math.round(value*100) : null;
const decantMl = (size) => {
  const match=String(size||"").trim().match(/^([0-9]+(?:\.[0-9]+)?)\s*ml$/i);
  return match?Number(match[1]):null;
};
const canonical = (name) => String(name||"").trim().toLowerCase();

// Validate all order items before checking trusted, SERVER-SOURCED limits.
// A malformed order is INVALID_ORDER, not an inventory UNKNOWN.
export function collectOrderFragranceMl(items) {
  if(!Array.isArray(items)||!items.length||items.length>100)
    return {status:"INVALID_ORDER",totals:[]};
  const totals=new Map();
  for(const item of items){
    const quantity=Number(item?.quantity), name=canonical(item?.name);
    const bundle=Array.isArray(item?.bundleItems)?item.bundleItems:[];
    if(!name || !Number.isSafeInteger(quantity)||quantity<=0||quantity>100)
      return {status:"INVALID_ORDER",totals:[]};
    const lines=bundle.length?bundle.map(x=>({name:canonical(x?.name),ml:decantMl(x?.size)})):
      [{name,ml:decantMl(item?.size)}];
    if(!lines.length || lines.length>40)return {status:"INVALID_ORDER",totals:[]};
    for(const line of lines){
      const ml=cents(line.ml);
      if(!line.name||ml===null||ml>500000) return {status:"INVALID_ORDER",totals:[]};
      const next=(totals.get(line.name)||0)+ml*quantity;
      if(!Number.isSafeInteger(next)||next>500000) return {status:"INVALID_ORDER",totals:[]};
      totals.set(line.name,next);
    }
  }
  return {status:"VALID",totals:[...totals].map(([productName,mlCents])=>({
    productName,requestedMl:mlCents/100
  }))};
}

// policies and inventoryDecisions MUST come from server-only trusted sources.
// Stock UNKNOWN is fail-open; policy unavailable is not treated as 30 ml.
// Caller must not accept shopper-provided policy/decision objects.
export function assessCheckoutOrder(items,{policies,inventoryDecisions}={}) {
  const parsed=collectOrderFragranceMl(items);
  if(parsed.status!=="VALID")return {decision:"INVALID_ORDER"};
  for(const {productName,requestedMl} of parsed.totals){
    const cap=policies instanceof Map?policies.get(productName):null;
    if(cap!=null){
      const capCents=cents(cap);
      if(capCents===null)return {decision:"POLICY_UNAVAILABLE"};
      if(Math.round(requestedMl*100)>capCents)
        return {decision:"PURCHASE_CAP_REACHED"};
    }
    const stock=inventoryDecisions instanceof Map?inventoryDecisions.get(productName):"UNKNOWN";
    if(stock==="LIMIT_REACHED")return {decision:"STOCK_LIMIT_REACHED"};
    if(stock!=="ALLOW"&&stock!=="UNKNOWN"&&stock!==undefined&&stock!==null)
      return {decision:"INVENTORY_UNAVAILABLE"};
  }
  return {decision:"ALLOW"};
}
