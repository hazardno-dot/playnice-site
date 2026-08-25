import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "../..");
const applySource = fs.readFileSync(path.resolve(here, "../api/create-apply.js"), "utf8");
const marker = applySource.indexOf("export default async function handler");
if (marker < 0) throw new Error("Could not isolate Controlled Apply helpers.");

const context = { process: { env: {} }, Buffer, console, fetch: async () => { throw new Error("Network disabled"); } };
vm.createContext(context);
vm.runInContext(`${applySource.slice(0, marker)}\nglobalThis.__h={findNamedObjectBlock,findChildObjectBlock,locatePropertyValue,parseJsLiteral,patchCopyBlock};`, context);
const h = context.__h;
const source = fs.readFileSync(path.join(repoRoot, "src/data/products/productCopy.js"), "utf8");
const productName = "Afnan 9 AM Eau de Parfum";
const located = h.findNamedObjectBlock(source, productName, "Product Copy");
const fields = ["miniTag", "card", "modal", "scentType", "dominantNotes", "tags", "whyChoose"];
const read = (block, key) => {
  const range = h.locatePropertyValue(block, key);
  return h.parseJsLiteral(block.slice(range.start, range.end));
};
const baseline = {};
for (const field of fields) {
  const child = h.findChildObjectBlock(located.block, field).block;
  baseline[field] = { sr: read(child, "sr"), en: read(child, "en") };
}
const approved = structuredClone(baseline);
approved.miniTag.en = `${approved.miniTag.en} TEST`;
const beforeLines = located.block.split(/\r?\n/).length;
const next = h.patchCopyBlock(located.block, baseline, approved);
const nextMini = h.findChildObjectBlock(next, "miniTag").block;
if (read(nextMini, "en") !== approved.miniTag.en) throw new Error("Inline miniTag EN did not patch.");
if (read(nextMini, "sr") !== baseline.miniTag.sr) throw new Error("Inline miniTag SR changed unexpectedly.");
if (next.split(/\r?\n/).length !== beforeLines) throw new Error("Inline miniTag patch changed line structure.");
if (!/^\{\s*sr:\s*["'].*?["'],\s*en:\s*["'].*?["']\s*\}$/s.test(nextMini)) throw new Error("Inline miniTag object structure was not preserved.");
console.log("PASS  inline miniTag patches safely and preserves inline structure");
console.log("Production untouched: yes (in-memory regression only)");
