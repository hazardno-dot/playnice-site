// Pure in-memory specification model for the future atomic DB transaction.
// NOT a distributed lock, not a checkout implementation and not wired into Production.
// Simulates sequential application of one-at-a-time committed transactions;
// actual correctness requires a database row lock and one ACID order+reservation transaction.

const round = (value) => Math.round((value + Number.EPSILON) * 100) / 100;
const validMl = (x) => typeof x === "number" && Number.isFinite(x) && x >= 0 && Math.round(x * 100) / 100 === x;

export class ReservationSpecification {
  constructor(initialStock = {}) {
    this.stock = new Map();
    this.orders = new Map();
    for (const [key, ml] of Object.entries(initialStock)) {
      if (!key || !validMl(ml)) throw new Error("INVALID_OPENING_STOCK");
      this.stock.set(key, { physicalMl: ml, reservedMl: 0, verified: true });
    }
  }

  // Order creation and reservation must be one transaction.
  commitNewOrder({ orderId, fingerprint, environment = "production", items }) {
    if (environment !== "production") return { ok:false, reason:"PREVIEW_SEPARATE_LEDGER_REQUIRED" };
    if (typeof orderId !== "string" || !orderId ||
      typeof fingerprint !== "string" || !fingerprint ||
      !Array.isArray(items) || items.length === 0) return { ok:false, reason:"INVALID_INPUT" };

    // Transactional replay of an existing order must not reserve a second time.
    const existing = this.orders.get(orderId);
    if (existing) return existing.fingerprint === fingerprint
      ? { ok:true, duplicate:true } : { ok:false, reason:"IDEMPOTENCY_CONFLICT" };

    const requests = new Map();
    for (const item of items) {
      if (!item || typeof item.productKey !== "string" || !item.productKey ||
        !validMl(item.sizeMl) || item.sizeMl <= 0 ||
        !Number.isSafeInteger(item.quantity) || item.quantity <= 0) {
        return { ok:false, reason:"INVALID_ITEM" };
      }
      const requested = item.sizeMl * item.quantity;
      if (!validMl(requested)) return { ok:false, reason:"INVALID_ITEM" };
      requests.set(item.productKey, round((requests.get(item.productKey) || 0) + requested));
    }
    // All-or-nothing validation: a single unavailable fragrance rejects the
    // entire transaction; no partial reservation across mixed-item baskets.
    for (const [key, requested] of requests) {
      const state = this.stock.get(key);
      if (!state || !state.verified) return { ok:false, reason:"UNVERIFIED_STOCK" };
      if (!validMl(state.physicalMl) || !validMl(state.reservedMl) ||
          state.reservedMl > state.physicalMl) return { ok:false, reason:"INCONSISTENT_LEDGER" };
      if (requested > round(state.physicalMl - state.reservedMl))
        return { ok:false, reason:"INSUFFICIENT_AVAILABLE" };
    }
    for (const [key, requested] of requests) {
      const state = this.stock.get(key);
      state.reservedMl = round(state.reservedMl + requested);
    }
    this.orders.set(orderId, { fingerprint, state:"RESERVED", items:requests });
    return { ok:true, duplicate:false };
  }

  packOrder(orderId) {
    const order = this.orders.get(orderId);
    if (!order) return { ok:false, reason:"ORDER_NOT_FOUND" };
    if (order.state === "CONSUMED") return { ok:true, duplicate:true };
    if (order.state !== "RESERVED") return { ok:false, reason:"INVALID_TRANSITION" };
    for (const [key, ml] of order.items) {
      const state = this.stock.get(key);
      if (!state || state.reservedMl < ml || state.physicalMl < ml)
        return { ok:false, reason:"INCONSISTENT_LEDGER" };
    }
    for (const [key, ml] of order.items) {
      const state = this.stock.get(key);
      state.reservedMl = round(state.reservedMl - ml);
      state.physicalMl = round(state.physicalMl - ml);
    }
    order.state = "CONSUMED";
    return { ok:true, duplicate:false };
  }

  cancelUnpacked(orderId) {
    const order = this.orders.get(orderId);
    if (!order) return { ok:false, reason:"ORDER_NOT_FOUND" };
    if (order.state === "RELEASED") return { ok:true, duplicate:true };
    if (order.state !== "RESERVED") return { ok:false, reason:"RECONCILIATION_REQUIRED" };
    for (const [key, ml] of order.items) {
      if (this.stock.get(key)?.reservedMl < ml) return { ok:false, reason:"INCONSISTENT_LEDGER" };
    }
    for (const [key, ml] of order.items)
      this.stock.get(key).reservedMl = round(this.stock.get(key).reservedMl - ml);
    order.state = "RELEASED";
    return { ok:true, duplicate:false };
  }

  view(productKey) {
    const stock = this.stock.get(productKey);
    if (!stock) return null;
    return { physicalMl:stock.physicalMl, reservedMl:stock.reservedMl,
      availableMl:round(stock.physicalMl - stock.reservedMl) };
  }
}
