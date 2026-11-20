// Admin-only advisory classifier for accepted NEW order demand.
// Calculations use existing Control Center Remaining; no stock writes and no
// customer checkout dependency. All results are INFERENCES, never actual holds.
const validMl = (v) => typeof v === "number" && Number.isFinite(v) && v >= 0;
export function reviewNewOrderDemand(row) {
  const remaining = row?.remaining_ml;
  const demand = row?.pending_new_ml;
  if (!row || !validMl(remaining) || !validMl(demand) ||
      !String(row.product_name || "").trim() || row.provisional) {
    return { level: "UNKNOWN", reason: "BALANCE_OR_MAPPING_UNCERTAIN", allowCheckout: true };
  }
  if (demand === 0) return { level: "NONE", reason: "NO_NEW_ORDER_DEMAND", allowCheckout: true };
  const after = Math.round((remaining - demand) * 100) / 100;
  if (after < 0) return {level:"POSSIBLE_SHORTFALL",reason:"DEMAND_EXCEEDS_RECORDED_REMAINING",allowCheckout:true};
  if (after <= 20) return {level:"LOW_BUFFER",reason:"LOW_ESTIMATED_BALANCE_AFTER_NEW",allowCheckout:true};
  return {level:"NONE",reason:"NO_IMMEDIATE_SHORTFALL_SIGNAL",allowCheckout:true};
}
export function summarizeNewOrderAdvisories(rows) {
  return (Array.isArray(rows) ? rows : []).reduce((acc,row) => {
    const level = reviewNewOrderDemand(row).level;
    if (level === "POSSIBLE_SHORTFALL") acc.possibleShortfalls++;
    if (level === "LOW_BUFFER") acc.lowBuffers++;
    if (level === "UNKNOWN") acc.unresolved++;
    return acc;
  },{possibleShortfalls:0,lowBuffers:0,unresolved:0});
}
