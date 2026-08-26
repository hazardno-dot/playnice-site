from pathlib import Path

path = Path("control-center/api/create-apply.js")
text = path.read_text()

# Add source-level key rename helper before discovery helpers.
marker = 'function discoveryChangesBetween(baselineDiscovery = {}, approvedDiscovery = {}) {'
helper = r'''function renameNamedObjectKey(source, oldKey, newKey, label = "data object") {
  const before = String(oldKey || "");
  const after = String(newKey || "");
  if (!before || !after) throw new Error(`${label} rename requires non-empty names.`);
  if (before === after) return source;
  const oldRe = new RegExp(`(["'])${escapeRegex(before)}\\1(\\s*:\\s*\\{)`);
  const oldMatch = oldRe.exec(source);
  if (!oldMatch) throw new Error(`Could not locate ${before} in ${label}.`);
  const duplicateRe = new RegExp(`(["'])${escapeRegex(after)}\\1\\s*:\\s*\\{`);
  if (duplicateRe.test(source)) throw new Error(`${label} already contains ${after}; rename would create a duplicate key.`);
  const quote = oldMatch[1];
  const escaped = after.replace(/\\/g, "\\\\").replace(new RegExp(quote, "g"), `\\${quote}`);
  const replacement = `${quote}${escaped}${quote}${oldMatch[2]}`;
  return source.slice(0, oldMatch.index) + replacement + source.slice(oldMatch.index + oldMatch[0].length);
}

'''
assert marker in text, "discovery marker missing"
text = text.replace(marker, helper + marker)

old = '''    const supportedFields = ["category", "image", "rating", "ratingLabel", "badge", "season", "moods", "sizes"];
    const protectedFields = ["name", "shortName"];
    const unsupportedCore = protectedFields.filter((field) => String(baselineCore[field] ?? "") !== String(approvedCore[field] ?? ""));
    if (unsupportedCore.length) return json(res, 409, { error: "Controlled Apply supports Core, Note Map, Recommendations, Wear, Copy and Discovery. Name and Short name remain protected.", unsupported_core: unsupportedCore });

    const coreChanges = supportedFields.map((field) => {'''
new = '''    const supportedFields = ["category", "image", "rating", "ratingLabel", "badge", "season", "moods", "sizes"];
    const identityChanges = ["name", "shortName"].map((field) => {
      const live = String(baselineCore?.[field] ?? "");
      const next = String(approvedCore?.[field] ?? "");
      return { section: "Identity", field, live, next, changed: live !== next };
    }).filter((item) => item.changed);
    if (identityChanges.some((c) => !c.next.trim())) return json(res, 409, { error: "Name and Short name cannot be empty." });

    const coreChanges = supportedFields.map((field) => {'''
assert old in text, "protected fields block missing"
text = text.replace(old, new)

old = 'const changes = [...coreChanges, ...inspiredByChanges, ...noteMapChanges, ...recommendationChanges, ...wearChanges, ...copyChanges, ...discoveryChanges];'
new = 'const changes = [...identityChanges, ...coreChanges, ...inspiredByChanges, ...noteMapChanges, ...recommendationChanges, ...wearChanges, ...copyChanges, ...discoveryChanges];'
assert old in text
text = text.replace(old, new)

old = 'if (coreChanges.length || inspiredByChanges.length || noteMapChanges.length || recommendationChanges.length) {'
new = 'if (identityChanges.length || coreChanges.length || inspiredByChanges.length || noteMapChanges.length || recommendationChanges.length) {'
assert old in text
text = text.replace(old, new)

old = '''      let nextBlock = located.block;
      for (const change of coreChanges) nextBlock = patchProperty(nextBlock, change.field, change.live, change.next);'''
new = '''      let nextBlock = located.block;
      for (const change of identityChanges) nextBlock = patchProperty(nextBlock, change.field, change.live, change.next);
      for (const change of coreChanges) nextBlock = patchProperty(nextBlock, change.field, change.live, change.next);'''
assert old in text
text = text.replace(old, new)

old = '''      const summary = [
        ...coreChanges.map((c) => c.field),'''
new = '''      const summary = [
        ...identityChanges.map((c) => c.field),
        ...coreChanges.map((c) => c.field),'''
assert old in text
text = text.replace(old, new)

# Wear: execute on content change OR name rename, then rename the top-level key.
old = '''    if (wearChanges.length) {
      const filePath = "src/data/products/productWearContext.js";'''
new = '''    const oldProductName = String(baselineCore.name || "");
    const newProductName = String(approvedCore.name || oldProductName);
    const nameChanged = oldProductName !== newProductName;

    if (wearChanges.length || nameChanged) {
      const filePath = "src/data/products/productWearContext.js";'''
assert old in text
text = text.replace(old, new)

old = '''      const productName = String(baselineCore.name || approvedCore.name || "");
      if (!productName) throw new Error("Wear Context apply requires a stable product name.");
      const located = findNamedObjectBlock(source, productName, "Wear Context");
      const nextBlock = patchWearBlock(located.block, baselineWear, approvedWear);
      const nextSource = source.slice(0, located.start) + nextBlock + source.slice(located.end);
      const summary = wearChanges.map((c) => `wear.${c.field}`).join(", ");'''
new = '''      if (!oldProductName) throw new Error("Wear Context apply requires a stable product name.");
      const located = findNamedObjectBlock(source, oldProductName, "Wear Context");
      const nextBlock = wearChanges.length ? patchWearBlock(located.block, baselineWear, approvedWear) : located.block;
      let nextSource = source.slice(0, located.start) + nextBlock + source.slice(located.end);
      if (nameChanged) nextSource = renameNamedObjectKey(nextSource, oldProductName, newProductName, "Wear Context");
      const summary = [...(nameChanged ? ["identity.name"] : []), ...wearChanges.map((c) => `wear.${c.field}`)].join(", ");'''
assert old in text
text = text.replace(old, new)

# Copy: same coupled rename.
old = '''    if (copyChanges.length) {
      const filePath = "src/data/products/productCopy.js";'''
new = '''    if (copyChanges.length || nameChanged) {
      const filePath = "src/data/products/productCopy.js";'''
assert old in text
text = text.replace(old, new)

old = '''      const productName = String(baselineCore.name || approvedCore.name || "");
      if (!productName) throw new Error("Copy apply requires a stable product name.");
      const located = findNamedObjectBlock(source, productName, "Product Copy");
      const nextBlock = patchCopyBlock(located.block, baseline.copy || {}, approved.copy || {});
      const nextSource = source.slice(0, located.start) + nextBlock + source.slice(located.end);
      const summary = copyChanges.map((c) => `copy.${c.field}`).join(", ");'''
new = '''      if (!oldProductName) throw new Error("Copy apply requires a stable product name.");
      const located = findNamedObjectBlock(source, oldProductName, "Product Copy");
      const nextBlock = copyChanges.length ? patchCopyBlock(located.block, baseline.copy || {}, approved.copy || {}) : located.block;
      let nextSource = source.slice(0, located.start) + nextBlock + source.slice(located.end);
      if (nameChanged) nextSource = renameNamedObjectKey(nextSource, oldProductName, newProductName, "Product Copy");
      const summary = [...(nameChanged ? ["identity.name"] : []), ...copyChanges.map((c) => `copy.${c.field}`)].join(", ");'''
assert old in text
text = text.replace(old, new)

# Version bump.
text = text.replace('controlled apply v2.6.', 'controlled apply v2.7.')
text = text.replace('version: "2.6"', 'version: "2.7"')
text = text.replace('controlled apply v2.6.', 'controlled apply v2.7.')
path.write_text(text)

# Add dedicated regression test.
Path("control-center/tests/controlled-apply-identity.mjs").write_text(r'''import fs from "node:fs";
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
''')

# Add test to permanent CI.
path = Path(".github/workflows/control-center-apply-regression.yml")
text = path.read_text()
anchor = '          node control-center/tests/controlled-apply-metadata.mjs\n'
assert anchor in text
if 'controlled-apply-identity.mjs' not in text:
    text = text.replace(anchor, anchor + '          node control-center/tests/controlled-apply-identity.mjs\n')
path.write_text(text)
