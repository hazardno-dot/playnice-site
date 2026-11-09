// Client-only, non-blocking Shadow Mode transport.
// Dormant until explicitly enabled in a reviewed Preview build.
// Do not inspect IPs, customer data, raw carts or physical inventory here.
const enabled = process.env.REACT_APP_INVENTORY_SHADOW_ENABLED === "true";
const EVENT_URL = "/api/inventory-shadow";

export function observeInventoryCartIntent({ source, product, size, quantity }) {
  if (!enabled || typeof window === "undefined") return;
  // Invalid or non-decant items are unobserved rather than presented as out of stock.
  const match = String(size || "").trim().match(/^(\d+(?:\.\d+)?)\s*ml$/i);
  const sizeMl = match ? Number(match[1]) : NaN;
  const count = Number(quantity);
  const key = String(product?.slug || "").trim();
  if (!key || !Number.isFinite(sizeMl) || sizeMl <= 0 || sizeMl >= 50 ||
      !Number.isSafeInteger(count) || count <= 0 ||
      !["ADD_TO_CART","CART_QUANTITY"].includes(source)) return;

  const payload = JSON.stringify({ source, productKey: key, sizeMl, quantity: count });
  // Fail-open for cart UI: this observer can NEVER block add-to-cart.
  try {
    void fetch(EVENT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
      credentials: "omit",
      signal: typeof AbortSignal?.timeout === "function" ? AbortSignal.timeout(1200) : undefined
    }).catch(() => {});
  } catch { /* Observability must not affect commerce. */ }
}
