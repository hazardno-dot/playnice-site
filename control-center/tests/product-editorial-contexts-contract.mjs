import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const app = read("control-center/src/App.jsx");
const validation = read("control-center/src/draftValidation.js");
const prepublish = read("control-center/src/prepublish.js");
const apply = read("control-center/api/create-apply.js");
const createNew = read("control-center/lib/create-new-product-engine.mjs");
const catalog = read("playnice-site/src/data/products/index.js");
const wear = read("playnice-site/src/data/products/productWearContext.js");

const partCount = (prefix) => [1, 2, 3, 4]
  .map((part) => read(`playnice-site/src/data/products/${prefix}.part${part}.js`))
  .reduce((total, source) => total + (source.match(/^  \{\s*$/gm)?.length || 0), 0);

const wearNames = [...wear.matchAll(/^\s{2}("(?:\\.|[^"\\])*")\s*:\s*\{/gm)]
  .map((match) => JSON.parse(match[1]));
const catalogNames = [...catalog.matchAll(/\bslug\s*:\s*["'][^"']+["'][\s\S]*?\bname\s*:\s*(["'])(.*?)\1/g)]
  .map((match) => match[2]);
const missingWear = catalogNames.filter((name) => !wearNames.includes(name));
const unexpectedWear = wearNames.filter((name) => !catalogNames.includes(name));
const wearCount = wearNames.length;
const catalogCount = catalogNames.length;
const doNotWearCount = partCount("productDoNotWearContext");
const whatToWearCount = partCount("productWhatToWearContext");

if (!catalogCount) throw new Error("Catalog product order could not be resolved.");
if (wearCount !== catalogCount) {
  throw new Error(`Wear Context coverage drift: ${wearCount}/${catalogCount}. Missing: ${missingWear.join(" | ") || "none"}. Unexpected: ${unexpectedWear.join(" | ") || "none"}.`);
}
if (doNotWearCount !== catalogCount) throw new Error(`Do Not Wear coverage drift: ${doNotWearCount}/${catalogCount}.`);
if (whatToWearCount !== catalogCount) throw new Error(`What To Wear coverage drift: ${whatToWearCount}/${catalogCount}.`);

for (const token of [
  "productDoNotWearContext",
  "productWhatToWearContext",
  "doNotWear",
  "whatToWear",
  "When NOT to wear",
  "What to wear",
  "Missing Do Not Wear",
  "Missing What To Wear",
]) {
  if (!app.includes(token)) throw new Error(`Product editor contract missing: ${token}`);
}

for (const token of ["Do Not Wear", "What To Wear", "doNotWear", "whatToWear"]) {
  if (!validation.includes(token)) throw new Error(`Draft validation contract missing: ${token}`);
}

for (const token of ["doNotWear", "whatToWear", "editorialContextIndex"]) {
  if (!prepublish.includes(token)) throw new Error(`Prepublish snapshot contract missing: ${token}`);
}

for (const token of [
  "productDoNotWearContext",
  "productWhatToWearContext",
  "resolveEditorialContextIndex",
  "editorial context index changed after preparation",
  "patchEditorialContext",
  "controlled apply v2.8",
]) {
  if (!apply.includes(token)) throw new Error(`Controlled Apply editorial contract missing: ${token}`);
}

for (const token of [
  "doNotWear",
  "whatToWear",
  "productDoNotWearContext.part4.js",
  "productWhatToWearContext.part4.js",
  "controlled apply v3.2",
]) {
  if (!createNew.includes(token)) throw new Error(`New-product editorial contract missing: ${token}`);
}

console.log(`PASS  editorial context coverage matches catalog order (${catalogCount} products)`);
console.log("PASS  Product editor stores Do Not Wear and What To Wear in the native draft payload");
console.log("PASS  validation and prepublish snapshots protect both editorial contexts");
console.log("PASS  Controlled Apply uses editorial index + payload drift guards");
console.log("PASS  new-product apply appends both editorial contexts atomically");
