// Read-only decision model for Inventory Protection Shadow Mode.
// This module deliberately NEVER changes orders, inventory or checkout behavior.
// It returns UNKNOWN for any unverified, missing or inconsistent inventory state.

export const PROTECTION_DECISIONS = Object.freeze({
  ALLOW: "ALLOW",
  WOULD_BLOCK: "WOULD_BLOCK",
  UNKNOWN: "UNKNOWN"
});

const finiteNonNegative = (value) =>
  value !== null && value !== undefined && value !== "" &&
  Number.isFinite(Number(value)) && Number(value) >= 0;

const normalizedKey = (value) => String(value || "").trim().toLowerCase();

export function calculateRequestedMl(items, productKey) {
  const key = normalizedKey(productKey);
  if (!key) return { valid: false, requestedMl: null, reason: "MISSING_PRODUCT_KEY" };
  let total = 0;
  for (const item of Array.isArray(items) ? items : []) {
    if (normalizedKey(item?.productKey) !== key) continue;
    const size = Number(item?.sizeMl);
    const count = Number(item?.quantity);
    if (!Number.isFinite(size) || size <= 0 || !Number.isSafeInteger(count) || count <= 0) {
      return { valid: false, requestedMl: null, reason: "INVALID_CART_ITEM" };
    }
    total += size * count;
    if (!Number.isFinite(total)) return { valid: false, requestedMl: null, reason: "INVALID_CART_TOTAL" };
  }
  return { valid: true, requestedMl: Math.round(total * 100) / 100, reason: null };
}

export function evaluateInventoryShadow({ productKey, items, stock, reservedMl }) {
  const demand = calculateRequestedMl(items, productKey);
  if (!demand.valid) return { decision: "UNKNOWN", reason: demand.reason, requestedMl: null };
  const requestedMl = demand.requestedMl;

  if (!stock || normalizedKey(stock.productKey) !== normalizedKey(productKey)) {
    return { decision: "UNKNOWN", reason: "NO_MATCHING_STOCK", requestedMl };
  }
  if (stock.estimated || stock.baselineVerified !== true || stock.mappingVerified !== true) {
    return { decision: "UNKNOWN", reason: "UNVERIFIED_STOCK", requestedMl };
  }
  if (!finiteNonNegative(stock.physicalMl) || !finiteNonNegative(reservedMl)) {
    return { decision: "UNKNOWN", reason: "INVALID_STOCK_OR_RESERVATIONS", requestedMl };
  }
  const physicalMl = Number(stock.physicalMl);
  const reservationMl = Number(reservedMl);
  if (reservationMl > physicalMl) {
    return { decision: "UNKNOWN", reason: "INCONSISTENT_STOCK", requestedMl };
  }
  const availableMl = Math.round((physicalMl - reservationMl) * 100) / 100;
  return {
    decision: requestedMl > availableMl ? "WOULD_BLOCK" : "ALLOW",
    reason: requestedMl > availableMl ? "REQUEST_EXCEEDS_AVAILABLE" : "WITHIN_AVAILABLE",
    requestedMl,
    availableMl
  };
}
