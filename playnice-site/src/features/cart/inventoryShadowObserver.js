// PlayNice stock advisory — optional and strictly fail-open.
// This observer is not an order validator and must never gate commerce.
const enabled = process.env.REACT_APP_INVENTORY_SHADOW_ENABLED === "true";
const EVENT_URL = "/api/inventory-shadow";
const exactSize = (value) => {
  const match = String(value || "").trim().match(/^(\d+(?:\.\d+)?)\s*ml$/i);
  return match ? Number(match[1]) : NaN;
};

// Read-only calculation. Unknown/malformed amounts produce no observation.
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

export function observeInventoryCartIntent(intent) {
  // EVERYTHING including payload generation is inside the exception boundary.
  // A malformed cart, unavailable browser API, or telemetry error must never
  // interrupt the calling add-to-cart/quantity handler.
  try {
    if (!enabled || typeof window === "undefined") return;
    const { source, product, size, cart, extraCount = 1 } = intent || {};
    const key = String(product?.slug || "").trim();
    const demandMl = calculateShadowCartDemand(cart, product?.id, size, extraCount);
    if (!key || demandMl === null || !["ADD_TO_CART","CART_QUANTITY"].includes(source)) return;
    const payload = JSON.stringify({ source, productKey: key, demandMl });
    // Never await or inspect a response as a commerce decision.
    if (typeof fetch !== "function") return;
    void fetch(EVENT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
      credentials: "omit",
      signal: typeof AbortSignal !== "undefined" &&
        typeof AbortSignal.timeout === "function" ? AbortSignal.timeout(1200) : undefined
    }).catch(() => {});
  } catch {
    // Deliberately silent: telemetry has no authority over the basket.
  }
}
