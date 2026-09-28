import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";
import {
  COMMERCE_KEY,
  auditCommerceShippingDraft,
  getCommerceCopyPreview,
  normalizeCommerceShippingDraft,
} from "../src/commerceShippingDraft.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "../..");

assert.equal(COMMERCE_KEY, "shipping");

assert.deepEqual(normalizeCommerceShippingDraft({ shippingPrice: "4", freeShippingThreshold: "49" }), {
  shippingPrice: 4,
  freeShippingThreshold: 49,
});

assert.deepEqual(auditCommerceShippingDraft({ shippingPrice: 4, freeShippingThreshold: 49 }).errors, []);
assert.ok(auditCommerceShippingDraft({ shippingPrice: -1, freeShippingThreshold: 49 }).errors.length > 0);
assert.ok(auditCommerceShippingDraft({ shippingPrice: 4, freeShippingThreshold: 0 }).errors.length > 0);
assert.ok(auditCommerceShippingDraft({ shippingPrice: 40, freeShippingThreshold: 49 }).errors.length > 0);

assert.deepEqual(getCommerceCopyPreview({ shippingPrice: 4, freeShippingThreshold: 49 }), {
  sr: "Besplatna dostava preko 49€",
  en: "Free shipping over €49",
});

console.log("PASS commerce shipping contract");


const managerSource = fs.readFileSync(path.resolve(repoRoot, "control-center/src/CommerceShippingManager.jsx"), "utf8");
assert.ok(managerSource.includes('fetch("/api/commerce-shipping"'), "Commerce manager must use dedicated commerce route.");
assert.ok(!managerSource.includes('fetch("/api/create-apply"'), "Commerce manager must not fall through Product create-apply routing.");

const commerceServer = fs.readFileSync(path.resolve(repoRoot, "control-center/server/commerce-shipping.js"), "utf8");
assert.ok(commerceServer.includes('manualOrdersApi: "control-center/server/orders.js"'), "Commerce Controlled Apply must include the manual-order API shipping contract.");
assert.ok(commerceServer.includes('manualOrderDialog: "control-center/src/ManualOrderDialog.jsx"'), "Commerce Controlled Apply must include the manual-order UI shipping contract.");
assert.ok(commerceServer.includes("storefront, checkout and manual-order shipping values do not match"), "Commerce live validation must block manual-order shipping drift.");
