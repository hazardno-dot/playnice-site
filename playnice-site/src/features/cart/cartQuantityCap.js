// Optional cart-only decant quantity limit. No inventory data is fetched here.
// The Naxos 100 ml fixture is explicitly Preview-only and user-activated.
// Until a trusted server-sourced cap exists, Production must fail open.
const sizeMl = (size) => {
  const match = String(size || "").trim().match(/^(\d+(?:\.\d+)?)\s*ml$/i);
  return match ? Number(match[1]) : null;
};

export function previewCapForProduct(product) {
  try {
    if (typeof window === "undefined" ||
        !window.location.hostname.endsWith(".vercel.app") ||
        new URLSearchParams(window.location.search).get("inventoryCapDemo") !== "1" ||
        String(product?.slug || "").toLowerCase() !== "xerjoff-naxos") return null;
    return 100; // SYNTHETIC PREVIEW FIXTURE; NOT a live PlayNice stock value.
  } catch { return null; }
}

export function assessCartQuantityCap(cart, productId, extraSize, maximumMl, count = 1) {
  // Unknown, invalid or untrusted maxima never cause a cart restriction.
  if (typeof maximumMl !== "number" || !Number.isFinite(maximumMl) || maximumMl <= 0)
    return { blocked: false, reason: "NO_TRUSTED_CAP" };
  const extra = sizeMl(extraSize);
  if (!Number.isFinite(extra) || extra <= 0 ||
      !Number.isSafeInteger(count) || count <= 0 || productId == null)
    return { blocked: false, reason: "UNKNOWN_DEMAND" };
  let current = 0;
  for (const row of Array.isArray(cart) ? cart : []) {
    if (row?.id !== productId) continue;
    const ml = sizeMl(row.size);
    const qty = Number(row.quantity);
    // Skip restricting mixed, malformed or unrecognized items instead of guessing.
    if (!Number.isFinite(ml) || ml <= 0 || !Number.isSafeInteger(qty) || qty < 0)
      return {blocked:false,reason:"UNKNOWN_CART_STATE"};
    current += Math.round(ml * 100) * qty;
  }
  const next = current + Math.round(extra * 100) * count;
  if (!Number.isSafeInteger(next))
    return { blocked:false, reason:"UNKNOWN_CART_STATE" };
  return { blocked: next > Math.round(maximumMl * 100), reason: next > Math.round(maximumMl * 100) ? "CAP_REACHED" : "WITHIN_CAP" };
}
