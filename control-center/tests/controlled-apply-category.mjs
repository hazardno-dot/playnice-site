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
vm.runInContext(`${applySource.slice(0, marker)}\nglobalThis.__h={findProductBlock,locatePropertyValue,parseJsLiteral,patchProperty};`, context);
const h = context.__h;

if (!applySource.includes('const supportedFields = ["category",')) throw new Error("Category is not enabled in supportedFields.");
if (!/controlled apply v2\.[4-9]\./.test(applySource)) throw new Error("Controlled Apply version is older than v2.4.");

const source = fs.readFileSync(path.join(repoRoot, "src/data/products/index.js"), "utf8");
const located = h.findProductBlock(source, "afnan-9am");
const read = (block, key) => {
  const range = h.locatePropertyValue(block, key);
  return h.parseJsLiteral(block.slice(range.start, range.end));
};

const before = String(read(located.block, "category"));
const after = before === "Arabian" ? "Designer" : "Arabian";
const next = h.patchProperty(located.block, "category", before, after);
if (String(read(next, "category")) !== after) throw new Error("Category did not patch.");
if (String(read(next, "name")) !== String(read(located.block, "name"))) throw new Error("Name changed while patching Category.");
if (String(read(next, "shortName")) !== String(read(located.block, "shortName"))) throw new Error("Short name changed while patching Category.");

let driftBlocked = false;
try {
  h.patchProperty(located.block, "category", "Niche", after);
} catch (error) {
  driftBlocked = String(error?.message || error).includes("LIVE DRIFT");
}
if (!driftBlocked) throw new Error("Category LIVE DRIFT guard did not block stale baseline.");

const disk = fs.readFileSync(path.join(repoRoot, "src/data/products/index.js"), "utf8");
if (disk !== source) throw new Error("Category regression mutated the catalog on disk.");

console.log("PASS  category patches safely through Controlled Apply");
console.log("PASS  category LIVE DRIFT guard blocks stale baseline");
console.log("PASS  category patch leaves identity fields untouched");
console.log("Production untouched: yes (in-memory regression only)");
