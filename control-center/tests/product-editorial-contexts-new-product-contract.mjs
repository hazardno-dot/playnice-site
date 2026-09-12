import { __test } from "../lib/create-new-product-engine.mjs";

const source = `export default [\n  {\n    "sr": "Staro SR",\n    "en": "Old EN"\n  }\n];\n`;
const rendered = __test.renderEditorialContext({ sr: "Novo SR", en: "New EN" });
const next = __test.insertArrayEntry(source, rendered, "Editorial Context");

if (!next.includes('"sr": "Staro SR"')) throw new Error("Existing editorial context entry changed during append.");
if (!next.includes('"sr": "Novo SR"')) throw new Error("New SR editorial context was not appended.");
if (!next.includes('"en": "New EN"')) throw new Error("New EN editorial context was not appended.");
if ((next.match(/^  \{\s*$/gm) || []).length !== 2) throw new Error("Editorial context append did not preserve one-entry-per-product structure.");

const normalized = __test.normalizePayload({
  core: {},
  copy: {},
  wear: { sr: "Wear SR", en: "Wear EN" },
  doNotWear: { sr: "Ne ovde", en: "Not here" },
  whatToWear: { sr: "Bela košulja", en: "White shirt" },
  discovery: {},
}, "test-product");
if (normalized.doNotWear.sr !== "Ne ovde" || normalized.whatToWear.en !== "White shirt") throw new Error("New-product normalization dropped editorial contexts.");

console.log("PASS  new-product editorial contexts normalize and append without shifting existing entries");
