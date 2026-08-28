export const OPEN_PRODUCT_EVENT = "playnice:open-product";

export function requestOpenProduct(slug) {
  const normalized = String(slug || "").trim();
  if (!normalized || typeof window === "undefined") return false;
  window.dispatchEvent(new CustomEvent(OPEN_PRODUCT_EVENT, { detail: { slug: normalized } }));
  return true;
}
