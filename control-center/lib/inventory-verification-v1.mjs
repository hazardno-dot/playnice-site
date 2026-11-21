// PlayNice Inventory Protection: pure verification review contracts.
// Does not edit inventory or change availability. A review of an existing
// Remaining balance must be bound to the EXACT ledger snapshot reviewed.
const round = (v) => Math.round((v + Number.EPSILON) * 100) / 100;
const valid = (v) => typeof v === "number" && Number.isFinite(v) && v >= 0 && round(v) === v;
const keyOf = (value) => String(value || "").trim().toLowerCase();
const fixed = (v) => Math.round(v * 100);

export function inventoryVerificationSnapshot(row) {
  if (!row || !keyOf(row.product_name) || row.provisional ||
    !row.baseline_verified || !Number.isFinite(row.remaining_ml) ||
    !Number.isFinite(row.opening_balance_ml) ||
    !Number.isFinite(row.restock_ml) ||
    !Number.isFinite(row.consumed_since_tracking_ml) ||
    !Number.isFinite(row.manual_out_ml) ||
    !valid(row.opening_balance_ml) || !valid(row.restock_ml) ||
    !valid(row.consumed_since_tracking_ml) ||
    !valid(row.manual_out_ml) ||
    !valid(row.remaining_ml)) return { eligible: false, reason: "UNVERIFIED_OR_INVALID_BALANCE" };
  const calculated = round(row.opening_balance_ml + row.restock_ml -
    row.consumed_since_tracking_ml - row.manual_out_ml);
  if (calculated !== row.remaining_ml) return { eligible: false, reason: "BALANCE_MISMATCH" };
  if (Number(row.pending_new_ml || 0) > 0) return { eligible: false, reason: "PENDING_NEW_ORDER_REVIEW" };
  // Static, serializable account of the calculation; no browser hash used as
  // an authorization token. Server must independently regenerate and compare.
  const snapshot = JSON.stringify({
    product: keyOf(row.product_name),
    opening: fixed(row.opening_balance_ml),
    restock: fixed(row.restock_ml),
    consumed: fixed(row.consumed_since_tracking_ml),
    manualOut: fixed(row.manual_out_ml),
    remaining: fixed(row.remaining_ml),
    pendingNew: fixed(Number(row.pending_new_ml || 0))
  });
  return { eligible: true, reason: null, snapshot, remainingMl: row.remaining_ml };
}

export function checkVerificationStillCurrent(row, reviewedSnapshot) {
  const current = inventoryVerificationSnapshot(row);
  return Boolean(current.eligible && current.snapshot === reviewedSnapshot);
}
