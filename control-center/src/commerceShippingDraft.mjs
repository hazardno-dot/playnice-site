export const COMMERCE_KEY = "shipping";

export function normalizeCommerceShippingDraft(value = {}) {
  return {
    shippingPrice: Number(value.shippingPrice),
    freeShippingThreshold: Number(value.freeShippingThreshold),
  };
}

export function auditCommerceShippingDraft(value = {}) {
  const payload = normalizeCommerceShippingDraft(value);
  const errors = [];

  if (!Number.isFinite(payload.shippingPrice) || payload.shippingPrice < 0) {
    errors.push("Shipping price must be a number greater than or equal to 0.");
  }

  if (!Number.isFinite(payload.freeShippingThreshold) || payload.freeShippingThreshold <= 0) {
    errors.push("Free shipping threshold must be a number greater than 0.");
  }

  if (
    Number.isFinite(payload.shippingPrice) &&
    Number.isFinite(payload.freeShippingThreshold) &&
    payload.freeShippingThreshold <= payload.shippingPrice
  ) {
    errors.push("Free shipping threshold must be greater than the shipping price.");
  }

  return { payload, errors };
}

export function getCommerceDraftState(row) {
  const status = String(row?.review_status || "draft").toLowerCase();
  return ["draft", "ready", "approved"].includes(status) ? status : "draft";
}

export function formatCommerceMoney(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "—";
  return `€${number.toFixed(2)}`;
}

export function getCommerceCopyPreview(value = {}) {
  const payload = normalizeCommerceShippingDraft(value);
  const threshold = Number.isInteger(payload.freeShippingThreshold)
    ? String(payload.freeShippingThreshold)
    : String(payload.freeShippingThreshold);

  return {
    sr: `Besplatna dostava preko ${threshold}€`,
    en: `Free shipping over €${threshold}`,
  };
}
