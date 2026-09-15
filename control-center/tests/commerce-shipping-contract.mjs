import assert from "node:assert/strict";
import {
  COMMERCE_KEY,
  auditCommerceShippingDraft,
  getCommerceCopyPreview,
  normalizeCommerceShippingDraft,
} from "../src/commerceShippingDraft.mjs";

assert.equal(COMMERCE_KEY, "shipping");

assert.deepEqual(normalizeCommerceShippingDraft({ shippingPrice: "4", freeShippingThreshold: "39" }), {
  shippingPrice: 4,
  freeShippingThreshold: 39,
});

assert.deepEqual(auditCommerceShippingDraft({ shippingPrice: 4, freeShippingThreshold: 39 }).errors, []);
assert.ok(auditCommerceShippingDraft({ shippingPrice: -1, freeShippingThreshold: 39 }).errors.length > 0);
assert.ok(auditCommerceShippingDraft({ shippingPrice: 4, freeShippingThreshold: 0 }).errors.length > 0);
assert.ok(auditCommerceShippingDraft({ shippingPrice: 40, freeShippingThreshold: 39 }).errors.length > 0);

assert.deepEqual(getCommerceCopyPreview({ shippingPrice: 4, freeShippingThreshold: 39 }), {
  sr: "Besplatna dostava preko 39€",
  en: "Free shipping over €39",
});

console.log("PASS commerce shipping contract");
