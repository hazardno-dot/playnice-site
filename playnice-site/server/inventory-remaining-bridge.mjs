// Inventory Remaining → public-safe stock decision.
// Input is the existing Control Center inventory.rows (server-side ONLY).
// Never exposes Remaining, order records or internal stock identifiers.
import { canonicalProductName } from "./inventory-accounting.mjs";

const cents = (value) => {
  if (typeof value !== "number" || !Number.isFinite(value) ||
      value < 0 || value > 5000 ||
      Math.abs(Math.round(value*100)-value*100) > 1e-6) return null;
  return Math.round(value*100);
};

export function shopDecisionFromRemaining(rows, productName, requestedTotalMl, options={}) {
  const unknown = {decision:"UNKNOWN"};
  if (!Array.isArray(rows) || !options.complete || !options.fresh ||
      options.hasUnmatchedOrders || options.ambiguousMappings)
    return unknown;
  if (typeof productName !== "string" || !productName.trim()) return unknown;
  const requested=cents(requestedTotalMl);
  if (requested === null || requested<=0) return unknown;

  const name=canonicalProductName(productName).toLowerCase();
  const matches=rows.filter(row => canonicalProductName(row?.product_name).toLowerCase()===name);
  if(matches.length!==1)return unknown;
  const row=matches[0];
  const remaining=cents(row.remaining_ml);
  if(remaining===null || row?.stock_status==="REVIEW" || row?.invalid ||
     row?.mapping_ambiguous || row?.balance_unverified)
    return unknown;
  return {decision:requested>remaining?"LIMIT_REACHED":"ALLOW"};
}
