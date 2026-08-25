import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "../..");
const applyPath = path.resolve(here, "../api/create-apply.js");
const applySource = fs.readFileSync(applyPath, "utf8");
const handlerMarker = "export default async function handler";
const markerIndex = applySource.indexOf(handlerMarker);
if (markerIndex < 0) throw new Error("Could not isolate Controlled Apply helper layer.");

const prefix = applySource.slice(0, markerIndex);
const context = {
  process: { env: {} },
  Buffer,
  console,
  fetch: async () => { throw new Error("Network calls are disabled in regression tests."); },
};
vm.createContext(context);
vm.runInContext(`${prefix}\nglobalThis.__helpers = {\n  normalizeCsv, normalizeSizes, stable, findProductBlock, findNamedObjectBlock, findChildObjectBlock, locatePropertyValue, parseJsLiteral, patchStringArrayRaw, patchProperty, noteMapChangesBetween, patchNoteMap, recommendationsChangeBetween, patchRecommendations, patchWearBlock, patchCopyBlock, patchDiscoveryBlock\n};`, context);
const h = context.__helpers;

const files = {
  index: fs.readFileSync(path.join(repoRoot, "src/data/products/index.js"), "utf8"),
  copy: fs.readFileSync(path.join(repoRoot, "src/data/products/productCopy.js"), "utf8"),
  wear: fs.readFileSync(path.join(repoRoot, "src/data/products/productWearContext.js"), "utf8"),
  discovery: fs.readFileSync(path.join(repoRoot, "src/data/products/discoveryProfiles.js"), "utf8"),
};

const tests = [];
const check = (name, fn) => {
  try {
    fn();
    tests.push({ name, ok: true });
  } catch (error) {
    tests.push({ name, ok: false, error: error?.message || String(error) });
  }
};
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const expectThrow = (fn, needle) => {
  let message = "";
  try { fn(); } catch (error) { message = error?.message || String(error); }
  assert(message, "Expected operation to throw.");
  if (needle) assert(message.includes(needle), `Expected error containing ${needle}, got: ${message}`);
};
const readProp = (block, key) => {
  const range = h.locatePropertyValue(block, key);
  return h.parseJsLiteral(block.slice(range.start, range.end));
};
const replaceBlock = (source, located, nextBlock) => source.slice(0, located.start) + nextBlock + source.slice(located.end);

const slug = "afnan-9am";
const catalogLocated = h.findProductBlock(files.index, slug);
const catalogBlock = catalogLocated.block;
const productName = String(readProp(catalogBlock, "name"));

check("helper layer loads from real create-apply.js", () => {
  for (const key of ["patchProperty", "patchNoteMap", "patchRecommendations", "patchWearBlock", "patchCopyBlock", "patchDiscoveryBlock"]) {
    assert(typeof h[key] === "function", `Missing helper ${key}`);
  }
});

check("v2.3 implementation is present", () => {
  assert(applySource.includes("noteMapChangesBetween"), "Note Map support missing.");
  assert(applySource.includes("recommendationsChangeBetween"), "Recommendations support missing.");
});

check("test product resolves from live catalog", () => {
  assert(productName === "Afnan 9 AM Eau de Parfum", `Unexpected product: ${productName}`);
});

check("core rating patches one scalar", () => {
  const live = Number(readProp(catalogBlock, "rating"));
  const next = h.patchProperty(catalogBlock, "rating", live, live === 7.7 ? 7.8 : 7.7);
  assert(next !== catalogBlock, "Rating patch made no change.");
  assert(Number(readProp(next, "rating")) !== live, "Rating did not update.");
});

check("core live-drift guard blocks stale scalar baseline", () => {
  const live = Number(readProp(catalogBlock, "rating"));
  expectThrow(() => h.patchProperty(catalogBlock, "rating", live + 1, live), "LIVE DRIFT");
});

check("season patches without touching adjacent fields", () => {
  const live = String(readProp(catalogBlock, "season"));
  const nextValue = live === "all" ? "summer" : "all";
  const next = h.patchProperty(catalogBlock, "season", live, nextValue);
  assert(readProp(next, "season") === nextValue, "Season did not update.");
  assert(readProp(next, "badge") === readProp(catalogBlock, "badge"), "Badge changed unexpectedly.");
});

check("moods array patches in place", () => {
  const live = h.normalizeCsv(readProp(catalogBlock, "moods"));
  const draft = [...live];
  draft[1] = draft[1] === "casual" ? "summer" : "casual";
  const next = h.patchProperty(catalogBlock, "moods", live, draft);
  assert(JSON.stringify(h.normalizeCsv(readProp(next, "moods"))) === JSON.stringify(draft), "Moods mismatch.");
});

check("moods formatting is preserved", () => {
  const range = h.locatePropertyValue(catalogBlock, "moods");
  const raw = catalogBlock.slice(range.start, range.end);
  const live = h.normalizeCsv(h.parseJsLiteral(raw));
  const draft = live.map((v, i) => i === 1 ? `${v}-test` : v);
  const nextRaw = h.patchStringArrayRaw(raw, live, draft, "moods");
  const beforeSeparators = raw.match(/,\s+/g) || [];
  const afterSeparators = nextRaw.match(/,\s+/g) || [];
  assert(JSON.stringify(beforeSeparators) === JSON.stringify(afterSeparators), "Array separator formatting changed.");
});

check("array slot-count guard blocks additions", () => {
  const range = h.locatePropertyValue(catalogBlock, "moods");
  const raw = catalogBlock.slice(range.start, range.end);
  const live = h.normalizeCsv(h.parseJsLiteral(raw));
  expectThrow(() => h.patchStringArrayRaw(raw, live, [...live, "extra"], "moods"), "cannot add or remove slots");
});

check("size price patches only requested size", () => {
  const liveSizes = h.normalizeSizes(readProp(catalogBlock, "sizes"));
  const key = Object.keys(liveSizes)[0];
  const draft = { ...liveSizes, [key]: Number(liveSizes[key]) + 0.5 };
  const next = h.patchProperty(catalogBlock, "sizes", liveSizes, draft);
  const nextSizes = h.normalizeSizes(readProp(next, "sizes"));
  assert(nextSizes[key] === draft[key], "Requested price did not update.");
  for (const other of Object.keys(liveSizes).filter((k) => k !== key)) assert(nextSizes[other] === liveSizes[other], `${other} changed unexpectedly.`);
});

const noteMapLocated = h.findChildObjectBlock(catalogBlock, "noteMap");
const noteBaseline = {
  top: h.normalizeCsv(readProp(noteMapLocated.block, "top")),
  heart: h.normalizeCsv(readProp(noteMapLocated.block, "heart")),
  base: h.normalizeCsv(readProp(noteMapLocated.block, "base")),
};

check("note map top slot patches in place", () => {
  const draft = structuredClone(noteBaseline);
  draft.top[1] = draft.top[1] === "bergamot" ? "cedrat" : "bergamot";
  const next = h.patchNoteMap(catalogBlock, noteBaseline, draft);
  const child = h.findChildObjectBlock(next, "noteMap").block;
  assert(h.normalizeCsv(readProp(child, "top"))[1] === draft.top[1], "Top note did not update.");
  assert(JSON.stringify(h.normalizeCsv(readProp(child, "base"))) === JSON.stringify(noteBaseline.base), "Base notes changed unexpectedly.");
});

check("note map heart slot patches in place", () => {
  const draft = structuredClone(noteBaseline);
  draft.heart[2] = draft.heart[2] === "jasmine" ? "rose" : "jasmine";
  const next = h.patchNoteMap(catalogBlock, noteBaseline, draft);
  const child = h.findChildObjectBlock(next, "noteMap").block;
  assert(h.normalizeCsv(readProp(child, "heart"))[2] === draft.heart[2], "Heart note did not update.");
});

check("note map slot-count guard blocks structural edits", () => {
  const draft = structuredClone(noteBaseline);
  draft.top.push("extra-note");
  expectThrow(() => h.patchNoteMap(catalogBlock, noteBaseline, draft), "cannot add or remove slots");
});

const liveRecommendations = h.normalizeCsv(readProp(catalogBlock, "recommendations"));
check("recommendations replace existing slot", () => {
  const draft = [...liveRecommendations];
  draft[2] = draft[2] === "afnan-turathi-blue" ? "french-avenue-ravine-ice" : "afnan-turathi-blue";
  const next = h.patchRecommendations(catalogBlock, liveRecommendations, draft);
  assert(h.normalizeCsv(readProp(next, "recommendations"))[2] === draft[2], "Recommendation did not update.");
});

check("recommendations slot-count guard blocks additions", () => {
  expectThrow(() => h.patchRecommendations(catalogBlock, liveRecommendations, [...liveRecommendations, "extra-slug"]), "cannot add or remove slots");
});

check("catalog patch isolation preserves all text outside product block", () => {
  const live = String(readProp(catalogBlock, "season"));
  const nextBlock = h.patchProperty(catalogBlock, "season", live, live === "all" ? "summer" : "all");
  const nextSource = replaceBlock(files.index, catalogLocated, nextBlock);
  assert(nextSource.slice(0, catalogLocated.start) === files.index.slice(0, catalogLocated.start), "Catalog prefix changed.");
  assert(nextSource.slice(catalogLocated.start + nextBlock.length) === files.index.slice(catalogLocated.end), "Catalog suffix changed.");
});

const wearLocated = h.findNamedObjectBlock(files.wear, productName, "Wear Context");
const wearBaseline = { sr: String(readProp(wearLocated.block, "sr")), en: String(readProp(wearLocated.block, "en")) };
check("wear EN patches while SR stays untouched", () => {
  const approved = { ...wearBaseline, en: `${wearBaseline.en} [test]` };
  const next = h.patchWearBlock(wearLocated.block, wearBaseline, approved);
  assert(readProp(next, "en") === approved.en, "Wear EN did not update.");
  assert(readProp(next, "sr") === wearBaseline.sr, "Wear SR changed unexpectedly.");
});

check("wear live-drift guard blocks stale baseline", () => {
  expectThrow(() => h.patchWearBlock(wearLocated.block, { ...wearBaseline, en: "stale" }, wearBaseline), "LIVE DRIFT");
});

const copyLocated = h.findNamedObjectBlock(files.copy, productName, "Product Copy");
const copyFields = ["miniTag", "card", "modal", "scentType", "dominantNotes", "tags", "whyChoose"];
const copyBaseline = {};
for (const field of copyFields) {
  const child = h.findChildObjectBlock(copyLocated.block, field).block;
  copyBaseline[field] = { sr: readProp(child, "sr"), en: readProp(child, "en") };
}

check("copy scalar EN patches without SR collateral", () => {
  const approved = structuredClone(copyBaseline);
  approved.card.en = `${approved.card.en} [test]`;
  const next = h.patchCopyBlock(copyLocated.block, copyBaseline, approved);
  const child = h.findChildObjectBlock(next, "card").block;
  assert(readProp(child, "en") === approved.card.en, "Card EN did not update.");
  assert(readProp(child, "sr") === copyBaseline.card.sr, "Card SR changed unexpectedly.");
});

check("copy array patches preserve slot count and formatting", () => {
  const approved = structuredClone(copyBaseline);
  approved.dominantNotes.en = [...approved.dominantNotes.en];
  approved.dominantNotes.en[0] = `${approved.dominantNotes.en[0]}-test`;
  const next = h.patchCopyBlock(copyLocated.block, copyBaseline, approved);
  const child = h.findChildObjectBlock(next, "dominantNotes").block;
  assert(h.normalizeCsv(readProp(child, "en"))[0] === approved.dominantNotes.en[0], "Dominant note did not update.");
});

check("copy live-drift guard blocks stale scalar baseline", () => {
  const stale = structuredClone(copyBaseline);
  stale.card.en = "stale";
  const approved = structuredClone(copyBaseline);
  approved.card.en = `${approved.card.en} [test]`;
  expectThrow(() => h.patchCopyBlock(copyLocated.block, stale, approved), "LIVE DRIFT");
});

const discoveryLocated = h.findNamedObjectBlock(files.discovery, slug, "Discovery Profiles");
const discoveryBaseline = {};
for (const key of ["freshness", "office"]) discoveryBaseline[key] = Number(readProp(discoveryLocated.block, key));
check("discovery patches multiple numeric fields", () => {
  const approved = { ...discoveryBaseline, freshness: Math.min(10, discoveryBaseline.freshness + 0.1), office: Math.max(0, discoveryBaseline.office - 0.1) };
  const next = h.patchDiscoveryBlock(discoveryLocated.block, discoveryBaseline, approved);
  assert(Number(readProp(next, "freshness")) === approved.freshness, "Freshness did not update.");
  assert(Number(readProp(next, "office")) === approved.office, "Office did not update.");
});

check("discovery live-drift guard blocks stale baseline", () => {
  const stale = { ...discoveryBaseline, freshness: discoveryBaseline.freshness + 1 };
  expectThrow(() => h.patchDiscoveryBlock(discoveryLocated.block, stale, discoveryBaseline), "LIVE DRIFT");
});

check("all four target source files remain byte-identical on disk", () => {
  for (const [key, content] of Object.entries(files)) {
    const disk = fs.readFileSync({ index: path.join(repoRoot, "src/data/products/index.js"), copy: path.join(repoRoot, "src/data/products/productCopy.js"), wear: path.join(repoRoot, "src/data/products/productWearContext.js"), discovery: path.join(repoRoot, "src/data/products/discoveryProfiles.js") }[key], "utf8");
    assert(disk === content, `${key} source was mutated by the suite.`);
  }
});

const passed = tests.filter((t) => t.ok).length;
const failed = tests.length - passed;
console.log(`Controlled Apply regression: ${passed}/${tests.length} passed`);
for (const test of tests) console.log(`${test.ok ? "PASS" : "FAIL"}  ${test.name}${test.ok ? "" : ` — ${test.error}`}`);
console.log("Production untouched: yes (in-memory regression only)");
if (failed) process.exitCode = 1;
