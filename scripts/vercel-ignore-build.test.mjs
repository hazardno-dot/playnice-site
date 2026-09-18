import assert from "node:assert/strict";
import { classifyPath, shouldBuild } from "./vercel-ignore-build.mjs";

const matrix = [
  ["CC Social UI", ["control-center/src/SocialManager.jsx"], false, true],
  ["CC API", ["control-center/api/social-draft.js"], false, true],
  ["Storefront mobile CSS", ["playnice-site/src/mobile-v2/shop/MobileShopV2.css"], true, false],
  ["Shared product copy", ["playnice-site/src/data/products/productCopy.js"], true, true],
  ["Shared discovery profile", ["playnice-site/src/data/products/discoveryProfiles.js"], true, true],
  ["Do-not-wear editorial context", ["playnice-site/src/data/products/productDoNotWearContext.js"], true, false],
  ["Do-not-wear split context", ["playnice-site/src/data/products/productDoNotWearContext.part3.js"], true, false],
  ["What-to-wear editorial context", ["playnice-site/src/data/products/productWhatToWearContext.js"], true, false],
  ["Hero generated data", ["playnice-site/src/data/heroSlides.generated.js"], true, false],
  ["Journal source", ["playnice-site/src/data/journal/index.js"], true, false],
  ["Note Map asset", ["playnice-site/public/note-map/pomelo.webp"], true, false],
  ["GitHub workflow only", [".github/workflows/control-center-apply-regression.yml"], false, false],
  ["README only", ["README.md"], false, false],
  ["Routing test only", ["scripts/vercel-ignore-build.test.mjs"], false, false],
  ["Routing engine", ["scripts/vercel-ignore-build.mjs"], true, true],
  ["CC vercel config", ["control-center/vercel.json"], false, true],
  ["Storefront vercel config", ["playnice-site/vercel.json"], true, false],
  ["Mixed CC + storefront", ["control-center/src/App.jsx", "playnice-site/src/App.js"], true, true],
  ["Unknown shared root config", ["package-lock.json"], true, true],
];

for (const [name, files, storefront, controlCenter] of matrix) {
  assert.equal(shouldBuild("storefront", files), storefront, `${name}: storefront routing mismatch`);
  assert.equal(shouldBuild("control-center", files), controlCenter, `${name}: Control Center routing mismatch`);
}

assert.deepEqual(classifyPath("playnice-site/src/data/products/productCopy.js"), {
  storefront: true,
  controlCenter: true,
  reason: "shared-product-data",
});
assert.deepEqual(classifyPath(".github/workflows/example.yml"), {
  storefront: false,
  controlCenter: false,
  reason: "non-deploying",
});

console.log(`PASS  Vercel deployment routing matrix (${matrix.length} scenarios)`);
