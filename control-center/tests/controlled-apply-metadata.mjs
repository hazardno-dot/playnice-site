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
vm.runInContext(`${applySource.slice(0, marker)}\nglobalThis.__h={findProductBlock,findChildObjectBlock,locatePropertyValue,parseJsLiteral,patchProperty,patchInspiredBy};`, context);
const h = context.__h;

if (!applySource.includes('const supportedFields = ["category", "image",')) throw new Error("Image path is not enabled in supportedFields.");
if (!applySource.includes("patchInspiredBy")) throw new Error("Inspired-by metadata support is missing.");

const source = fs.readFileSync(path.join(repoRoot, "src/data/products/index.js"), "utf8");
const located = h.findProductBlock(source, "afnan-9am");
const read = (block, key) => {
  const range = h.locatePropertyValue(block, key);
  return h.parseJsLiteral(block.slice(range.start, range.end));
};

const image = String(read(located.block, "image"));
const nextImage = image.endsWith(".png") ? image.replace(/\.png$/, "-test.png") : `${image}-test`;
const imageBlock = h.patchProperty(located.block, "image", image, nextImage);
if (String(read(imageBlock, "image")) !== nextImage) throw new Error("Image path did not patch.");

const inspired = h.findChildObjectBlock(located.block, "inspiredBy").block;
const inspiredBaseline = { name: String(read(inspired, "name")), short: String(read(inspired, "short")) };
const inspiredApproved = { ...inspiredBaseline, short: `${inspiredBaseline.short} TEST` };
const inspiredBlock = h.patchInspiredBy(located.block, inspiredBaseline, inspiredApproved);
const inspiredNext = h.findChildObjectBlock(inspiredBlock, "inspiredBy").block;
if (String(read(inspiredNext, "short")) !== inspiredApproved.short) throw new Error("Inspired-by short label did not patch.");
if (String(read(inspiredNext, "name")) !== inspiredBaseline.name) throw new Error("Inspired-by name changed unexpectedly.");

let driftBlocked = false;
try {
  h.patchInspiredBy(located.block, { ...inspiredBaseline, short: "stale" }, inspiredApproved);
} catch (error) {
  driftBlocked = String(error?.message || error).includes("LIVE DRIFT");
}
if (!driftBlocked) throw new Error("Inspired-by LIVE DRIFT guard did not block stale baseline.");

const disk = fs.readFileSync(path.join(repoRoot, "src/data/products/index.js"), "utf8");
if (disk !== source) throw new Error("Metadata regression mutated catalog on disk.");

console.log("PASS  image path patches safely");
console.log("PASS  inspired-by nested metadata patches safely");
console.log("PASS  inspired-by LIVE DRIFT guard blocks stale baseline");
console.log("Production untouched: yes (in-memory regression only)");
