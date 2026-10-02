import assert from "node:assert/strict";
import fs from "node:fs";

const app = fs.readFileSync("control-center/src/App.jsx", "utf8");
const manager = fs.readFileSync("control-center/src/DraftManager.jsx", "utf8");
const prepublish = fs.readFileSync("control-center/src/prepublish.js", "utf8");
const validation = fs.readFileSync("control-center/src/draftValidation.js", "utf8");
const apply = fs.readFileSync("control-center/server/create-apply.js", "utf8");
const newProduct = fs.readFileSync("control-center/lib/create-new-product-engine.mjs", "utf8");

assert.ok(app.includes("Discount active"), "Product editor must expose a discount on/off control.");
assert.ok(app.includes('setCore("discount",e.target.checked?'), "Discount toggle must persist through core draft state.");
assert.ok(app.includes('label="Discount size"'), "Product editor must select the discounted size.");
assert.ok(app.includes('label="Discount %"'), "Product editor must edit the discount percent.");
assert.ok(app.includes("OFF removes the SALE badge"), "Product editor must explain storefront impact when discount is disabled.");

assert.ok(manager.includes('"Discount", "Promotion"'), "Draft Manager must review discount changes.");
assert.ok(prepublish.includes("discount: product.discount ?"), "Preparation baseline must snapshot the live discount.");
assert.ok(validation.includes('"Discount", "Size"'), "Draft validation must reject discounts for missing sizes.");
assert.ok(validation.includes('"Discount", "Percent"'), "Draft validation must reject invalid percentages.");

assert.ok(apply.includes("function patchDiscount"), "Controlled Apply must have a dedicated discount patcher.");
assert.ok(apply.includes("discountChange.changed"), "Controlled Apply must include discount-only changes.");
assert.ok(apply.includes('["discount"]'), "Controlled Apply summary must identify discount changes.");
assert.ok(apply.includes("LIVE DRIFT: main discount"), "Controlled Apply must protect discount changes against live drift.");

assert.ok(newProduct.includes("discount: core.discount ?"), "New-product normalization must preserve optional discounts.");
assert.ok(newProduct.includes("const discount = core.discount ?"), "New-product rendering must support optional discounts.");

console.log("PASS  Product discounts can be added, edited or removed through controlled CC workflow");
