// Purchase quantity policy, independent from stock availability.
// Default per fragrance and per order: 30 ml. Overrides are admin policy data,
// never inferred from stock levels or supplied by a shopper.
export const DEFAULT_PURCHASE_CAP_ML = 30;
const toCentiMl = (value) => {
  if (typeof value !== "number" || !Number.isFinite(value) ||
      value <= 0 || value > 5000 || Math.abs(value*100-Math.round(value*100))>1e-6)
    return null;
  return Math.round(value*100);
};
export function purchaseCapForProduct(productName, policy = {}) {
  if(typeof productName !== "string" || !productName.trim()) return DEFAULT_PURCHASE_CAP_ML;
  const overrides = policy && typeof policy === "object" ? policy.overrides : null;
  const candidate=overrides && Object.prototype.hasOwnProperty.call(overrides,productName)
    ? overrides[productName] : DEFAULT_PURCHASE_CAP_ML;
  return toCentiMl(candidate)===null ? DEFAULT_PURCHASE_CAP_ML : candidate;
}
export function checkOrderFragranceCap(items, productName, requestedExtraMl,
  policy = {}) {
  const cap=purchaseCapForProduct(productName,policy);
  const extra=toCentiMl(requestedExtraMl);
  if(!Array.isArray(items)||extra===null||typeof productName!=="string"||!productName.trim())
    return {decision:"UNKNOWN"};
  let existing=0;
  for(const item of items){
    if(String(item?.product_name||"").trim().toLowerCase()!==productName.trim().toLowerCase())continue;
    const ml=toCentiMl(item.size_ml),quantity=Number(item.quantity);
    if(ml===null||!Number.isSafeInteger(quantity)||quantity<0)return {decision:"UNKNOWN"};
    existing+=ml*quantity;
    if(!Number.isSafeInteger(existing))return {decision:"UNKNOWN"};
  }
  return {decision:existing+extra>Math.round(cap*100)?"LIMIT_REACHED":"ALLOW"};
}
