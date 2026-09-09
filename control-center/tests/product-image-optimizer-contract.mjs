import assert from "node:assert/strict";
import fs from "node:fs";
import { IMAGE_OPTIMIZER_PRESETS } from "../src/imageOptimizer.mjs";

const uploader = fs.readFileSync("control-center/src/ProductMediaUploadBridge.jsx", "utf8");
const optimizer = fs.readFileSync("control-center/src/imageOptimizer.mjs", "utf8");
const api = fs.readFileSync("control-center/api/create-product-media-apply.js", "utf8");

const shop = IMAGE_OPTIMIZER_PRESETS.productShop;
const justIn = IMAGE_OPTIMIZER_PRESETS.productJustIn;

assert.equal(shop.outputType, "image/png");
assert.equal(shop.width, 600);
assert.equal(shop.height, 600);
assert.equal(shop.fit, "contain");
assert.equal(shop.maxBytes, 500_000);

assert.equal(justIn.outputType, "image/webp");
assert.equal(justIn.width, 320);
assert.equal(justIn.height, 320);
assert.equal(justIn.fit, "contain");
assert.equal(justIn.maxBytes, 30_000);

assert.ok(optimizer.includes("function drawContain"), "shared optimizer must support contain placement");
assert.ok(optimizer.includes('preset.fit === "contain"'), "fixed-size presets must route through contain placement");
assert.ok(optimizer.includes("ctx.clearRect(0, 0, targetWidth, targetHeight)"), "contain output must preserve transparent padding");

assert.ok(uploader.includes('const PRODUCT_SOURCE_ACCEPT = "image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"'), "Product uploader must accept JPG/PNG/WebP source files");
assert.ok(uploader.includes("optimizeImage(sourceFile, preset)"), "Product uploader must use the shared optimizer");
assert.ok(uploader.includes("SHOP_PRESET = IMAGE_OPTIMIZER_PRESETS.productShop"), "Shop must use its canonical preset");
assert.ok(uploader.includes("JUST_IN_PRESET = IMAGE_OPTIMIZER_PRESETS.productJustIn"), "Just In must use its canonical preset");
assert.ok(uploader.includes("600 × 600 PNG"), "Shop UI must expose the 600x600 PNG contract");
assert.ok(uploader.includes("320 × 320 WebP"), "Just In UI must expose the 320x320 WebP contract");
assert.ok(uploader.includes('/api/create-product-media-apply'), "Product staging endpoint must remain unchanged");

assert.ok(api.includes('assertDimensions("Shop", pngDimensions(shop.buffer), 600)'), "backend must keep exact 600x600 Shop validation");
assert.ok(api.includes('assertDimensions("Just In", webpDimensions(justIn.buffer), 320)'), "backend must keep exact 320x320 Just In validation");
assert.ok(api.includes('path: `${SHOP_PUBLIC_PREFIX}/products/${slug}.png`'), "Shop canonical PNG path must remain unchanged");
assert.ok(api.includes('path: `${SHOP_PUBLIC_PREFIX}/products/thumbs/${slug}.webp`'), "Just In canonical WebP path must remain unchanged");

console.log("PASS  Product Shop source auto-optimizes to canonical 600x600 PNG contain asset");
console.log("PASS  Product Just In source auto-optimizes to canonical 320x320 WebP contain asset");
console.log("PASS  Product staging and backend dimension guards remain unchanged");
console.log("Production untouched: yes (contract-only verification)");
