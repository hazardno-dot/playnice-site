import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "../..");
const source = fs.readFileSync(path.resolve(here, "../api/create-apply.js"), "utf8");
const marker = source.indexOf("export default async function handler");
if (marker < 0) throw new Error("Could not isolate helpers.");
const context = { process: { env: {} }, Buffer, console, fetch: async () => { throw new Error("Network disabled"); } };
vm.createContext(context);
vm.runInContext(`${source.slice(0, marker)}\nglobalThis.__h={findProductBlock,findNamedObjectBlock,locatePropertyValue,parseJsLiteral,patchProperty,renameNamedObjectKey};`, context);
const h = context.__h;
const read = (block, key) => { const r=h.locatePropertyValue(block,key); return h.parseJsLiteral(block.slice(r.start,r.end)); };

const catalogPath = path.join(repoRoot, "src/data/products/index.js");
const copyPath = path.join(repoRoot, "src/data/products/productCopy.js");
const wearPath = path.join(repoRoot, "src/data/products/productWearContext.js");
const catalog = fs.readFileSync(catalogPath, "utf8");
const copy = fs.readFileSync(copyPath, "utf8");
const wear = fs.readFileSync(wearPath, "utf8");
const located = h.findProductBlock(catalog, "afnan-9am");
const oldName = String(read(located.block, "name"));
const oldShort = String(read(located.block, "shortName"));
const newName = `${oldName} TEST`;
const newShort = `${oldShort} TEST`;
let nextBlock = h.patchProperty(located.block, "name", oldName, newName);
nextBlock = h.patchProperty(nextBlock, "shortName", oldShort, newShort);
if (String(read(nextBlock, "name")) !== newName) throw new Error("Catalog name rename failed.");
if (String(read(nextBlock, "shortName")) !== newShort) throw new Error("Catalog shortName rename failed.");

const copyRenamed = h.renameNamedObjectKey(copy, oldName, newName, "Product Copy");
h.findNamedObjectBlock(copyRenamed, newName, "Product Copy");
let oldCopyMissing=false; try { h.findNamedObjectBlock(copyRenamed, oldName, "Product Copy"); } catch { oldCopyMissing=true; }
if (!oldCopyMissing) throw new Error("Old Product Copy key remained after rename.");

const wearRenamed = h.renameNamedObjectKey(wear, oldName, newName, "Wear Context");
h.findNamedObjectBlock(wearRenamed, newName, "Wear Context");
let oldWearMissing=false; try { h.findNamedObjectBlock(wearRenamed, oldName, "Wear Context"); } catch { oldWearMissing=true; }
if (!oldWearMissing) throw new Error("Old Wear key remained after rename.");

let duplicateBlocked=false;
try { h.renameNamedObjectKey(copy, oldName, oldName, "Product Copy"); } catch {}
const synthetic = `export const x={"Old":{},"New":{}};`;
try { h.renameNamedObjectKey(synthetic, "Old", "New", "Synthetic"); } catch (e) { duplicateBlocked=String(e.message).includes("duplicate key"); }
if (!duplicateBlocked) throw new Error("Duplicate-key guard did not block unsafe rename.");

if (fs.readFileSync(catalogPath,"utf8")!==catalog || fs.readFileSync(copyPath,"utf8")!==copy || fs.readFileSync(wearPath,"utf8")!==wear) throw new Error("Identity regression mutated source files.");
console.log("PASS  catalog name and shortName patch safely");
console.log("PASS  Product Copy key follows product rename");
console.log("PASS  Wear Context key follows product rename");
console.log("PASS  duplicate-key guard blocks unsafe rename");
console.log("Production untouched: yes (in-memory regression only)");
