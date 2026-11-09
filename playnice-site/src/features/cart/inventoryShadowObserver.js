// Client-only, non-blocking Shadow Mode transport.
// Dormant until explicitly enabled in a reviewed Preview build.
// Never uses customer identity or raw cart contents.
const enabled = process.env.REACT_APP_INVENTORY_SHADOW_ENABLED === "true";
const EVENT_URL = "/api/inventory-shadow";
const exactSize = (value) => {
  const match = String(value || "").trim().match(/^(\d+(?:\.\d+)?)\s*ml$/i);
  return match ? Number(match[1]) : NaN;
};

// Count all supported sizes for one fragrance, not only the button just clicked.
// Return null for ambiguous/malformed cart state rather than claiming availability.
export function calculateShadowCartDemand(cart, productId, extraSize, extraCount = 1) {
  const size = exactSize(extraSize);
  if (!Number.isFinite(size) || size <= 0 || size >= 50 ||
      !Number.isSafeInteger(extraCount) || extraCount <= 0) return null;
  let total = size * extraCount;
  for (const item of Array.isArray(cart) ? cart : []) {
    if (item?.id !== productId) continue;
    const ml = exactSize(item.size);
    const qty = Number(item.quantity);
    if (!Number.isFinite(ml) || ml <= 0 || ml >= 50 ||
        !Number.isSafeInteger(qty) || qty <= 0) return null;
    total += ml * qty;
  }
  return Number.isFinite(total) && total <= 5000 ? Math.round(total * 100) / 100 : null;
}

export function observeInventoryCartIntent({ source, product, size, cart, extraCount = 1 }) {
  if (!enabled || typeof window === "undefined") return;
  const key = String(product?.slug || "").trim();
  const demandMl = calculateShadowCartDemand(cart, product?.id, size, extraCount);
  if (!key || demandMl === null || !["ADD_TO_CART","CART_QUANTITY"].includes(source)) return;

  const payload = JSON.stringify({ source, productKey: key, demandMl });
  // No await: a slow or failed telemetry request must never affect commerce.
  try {
    void fetch(EVENT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
      credentials: "omit",
      signal: typeof AbortSignal?.timeout === "function" ? AbortSignal.timeout(1200) : undefined
    }).catch(() => {});
  } catch { /* Observability must never affect commerce. */ }
}
