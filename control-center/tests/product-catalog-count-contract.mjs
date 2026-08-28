import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const bridge = fs.readFileSync(path.join(root, "control-center/src/ProductCatalogCountBridge.jsx"), "utf8");
const managers = fs.readFileSync(path.join(root, "control-center/src/ControlCenterManagers.jsx"), "utf8");

for (const token of [
  'heading !== "Products"',
  '.catalog-count',
  '.from("product_drafts")',
  'product_slug',
  'draft-only',
  'postgres_changes',
  'event: "*"',
  'aria-label',
]) if (!bridge.includes(token)) throw new Error(`Products count bridge contract missing: ${token}`);

if (!bridge.includes('const liveSlugs = new Set(products.map((product) => product.slug));')) {
  throw new Error("Products count bridge must distinguish live slugs from draft-only slugs.");
}
if (!bridge.includes('`${products.length} live · ${draftOnly} draft-only`')) {
  throw new Error("Products catalog count must explicitly label live and draft-only counts.");
}
if (!managers.includes('import ProductCatalogCountBridge from "./ProductCatalogCountBridge"')) {
  throw new Error("Products count bridge is not imported.");
}
if (!managers.includes("<ProductCatalogCountBridge />")) {
  throw new Error("Products count bridge is not mounted.");
}
if (/\.insert\(|\.update\(|\.delete\(/.test(bridge)) {
  throw new Error("Products count bridge must remain read only.");
}

console.log("PASS  Products catalog count distinguishes live and draft-only products");
console.log("PASS  Products catalog count updates from realtime draft changes");
console.log("PASS  Products catalog count bridge remains read only");
