export const LEGACY_PRESENTATION_LIMITS = Object.freeze({
  miniTag: Object.freeze({ sr: 32, en: 32 }),
  scentType: Object.freeze({ sr: 42, en: 42 }),
  card: Object.freeze({ sr: 82, en: 92 }),
  modal: Object.freeze({ sr: 230, en: 230 }),
  whyChoose: Object.freeze({ sr: 125, en: 125 }),
  wear: Object.freeze({ sr: 90, en: 90 }),
});

// New products use tighter limits derived from the layouts that already render
// correctly on Shop cards and the shared desktop/mobile product modal. Existing
// catalog edits keep the legacy ceiling so old copy is not blocked retroactively.
export const NEW_PRODUCT_PRESENTATION_LIMITS = Object.freeze({
  miniTag: Object.freeze({ sr: 32, en: 32 }),
  scentType: Object.freeze({ sr: 42, en: 42 }),
  card: Object.freeze({ sr: 68, en: 72 }),
  modal: Object.freeze({ sr: 150, en: 160 }),
  whyChoose: Object.freeze({ sr: 95, en: 100 }),
  wear: Object.freeze({ sr: 58, en: 64 }),
});

export function presentationLimit(field, lang, { isNewProduct = false } = {}) {
  const source = isNewProduct ? NEW_PRODUCT_PRESENTATION_LIMITS : LEGACY_PRESENTATION_LIMITS;
  return source?.[field]?.[lang] ?? null;
}

export function presentationLimitMessage(field, lang, actual, options = {}) {
  const max = presentationLimit(field, lang, options);
  if (!max || actual <= max) return null;
  const scope = options.isNewProduct ? "new-product visual contract" : "shared presentation contract";
  return `${field} ${lang.toUpperCase()} is ${actual} characters; keep it at or below ${max} for the ${scope}.`;
}
