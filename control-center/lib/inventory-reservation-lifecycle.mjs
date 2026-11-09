// PlayNice Inventory Protection — proposed reservation lifecycle model.
// Pure logic only. Not connected to production orders, database, or checkout.
// Quantities represent ml. The caller must supply authoritative validated order items.
// A physical deduction occurs at PACKED; reservations are mutually exclusive with that deduction.

const RESERVED = new Set(["NEW"]);
const CONSUMED = new Set(["PACKED","SHIPPED","OUT_FOR_DELIVERY","DELIVERED","DELIVERY_FAILED","RETURNED"]);
const CLOSED = new Set(["CANCELLED","DUPLICATE"]);

export function classifyInventoryObligation(status, { packedAt = null } = {}) {
  const code = String(status || "").trim().toUpperCase();
  if (RESERVED.has(code)) {
    // PACKED -> NEW rollback is supported by the current order workflow.
    // A previously packed order cannot silently restore physical stock.
    return packedAt ? "RECONCILIATION_REQUIRED" : "RESERVED";
  }
  if (CONSUMED.has(code)) return "CONSUMED";
  if (CLOSED.has(code)) return packedAt ? "RECONCILIATION_REQUIRED" : "RELEASED";
  return "UNKNOWN";
}

export function calculateInventoryObligations(orders, productKey) {
  const key = String(productKey || "").trim().toLowerCase();
  if (!key || !Array.isArray(orders)) return { valid:false, reason:"INVALID_INPUT" };
  let reservedMl = 0, consumedMl = 0, pendingReviewMl = 0;
  const unknownOrders = [];
  const ids = new Set();
  for (const order of orders) {
    if (!order || typeof order !== "object") return { valid:false, reason:"MALFORMED_ORDER" };
    // Production-only. The caller must not mix PNTEST/preview with production.
    if (order.environment !== "production" || String(order.orderId || "").startsWith("PNTEST")) continue;
    const orderId = String(order.orderId || "").trim();
    if (!orderId || ids.has(orderId)) return { valid:false, reason:"DUPLICATE_OR_MISSING_ORDER_ID" };
    ids.add(orderId);
    const state = classifyInventoryObligation(order.status, { packedAt:order.packedAt });
    if (state === "UNKNOWN") { unknownOrders.push(orderId); continue; }
    if (state === "RELEASED") continue;
    if (!Array.isArray(order.items)) return { valid:false, reason:"MISSING_ITEMS" };
    let ml = 0;
    for (const item of order.items) {
      if (String(item?.productKey || "").trim().toLowerCase() !== key) continue;
      if (typeof item.sizeMl !== "number" || !Number.isFinite(item.sizeMl) || item.sizeMl <= 0 ||
          !Number.isSafeInteger(item.quantity) || item.quantity <= 0)
        return { valid:false, reason:"INVALID_ITEM_QUANTITY" };
      ml += item.sizeMl * item.quantity;
      if (!Number.isFinite(ml)) return { valid:false, reason:"INVALID_TOTAL" };
    }
    if (state === "RESERVED") reservedMl += ml;
    else if (state === "CONSUMED") consumedMl += ml;
    else pendingReviewMl += ml;
  }
  if (unknownOrders.length) return { valid:false, reason:"UNKNOWN_ORDER_STATUS", unknownOrders };
  return { valid:true, reason:null,
    reservedMl:Math.round(reservedMl*100)/100,
    consumedMl:Math.round(consumedMl*100)/100,
    pendingReviewMl:Math.round(pendingReviewMl*100)/100
  };
}
