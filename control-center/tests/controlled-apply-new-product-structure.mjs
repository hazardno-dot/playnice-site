import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");
const engineSource = fs.readFileSync(path.join(root, "control-center/api/create-new-product-engine.js"), "utf8");
const engineModule = await import(`data:text/javascript;base64,${Buffer.from(engineSource, "utf8").toString("base64")}`);
const { __test } = engineModule;
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");

const payload = {
  core: {
    name: "PlayNice Structural Test Eau de Parfum",
    shortName: "PN Structural",
    category: "Arabian",
    image: "/products/playnice-structural-test.png",
    sizes: { "5ml": 4, "10ml": 7 },
    badge: "TEST",
    rating: 8,
    ratingLabel: "Test Product",
    season: "all",
    moods: "clean, casual, signature",
    recommendations: "afnan-9am, afnan-9pm-rebel, afnan-turathi-blue",
    inspiredBy: { name: "", short: "" },
    noteMap: { top: "mandarin, bergamot", heart: "lavender", base: "cedarwood, moss" }
  },
  copy: {
    miniTag: { sr: "Test / Čist", en: "Test / Clean" },
    card: { sr: "Test opis.", en: "Test copy." },
    modal: { sr: "Test modal.", en: "Test modal." },
    scentType: { sr: "Test", en: "Test" },
    dominantNotes: { sr: "mandarina, bergamot", en: "mandarin, bergamot" },
    tags: { sr: "Svež, Test", en: "Fresh, Test" },
    whyChoose: { sr: "Test razlog.", en: "Test reason." }
  },
  wear: { sr: "Svaki dan.", en: "Every day." },
  discovery: { freshness: 8, office: 9, longevity: 7 }
};

const p = __test.normalizePayload(payload, "playnice-structural-test");
const index = read("playnice-site/src/data/products/index.js");
const copy = read("playnice-site/src/data/products/productCopy.js");
const wear = read("playnice-site/src/data/products/productWearContext.js");
const discovery = read("playnice-site/src/data/products/discoveryProfiles.js");

const nextIndex = __test.insertProduct(index, p);
if (nextIndex.includes("},,")) throw new Error("Catalog insertion created a double comma.");

for (const [source, rendered, label, exportName, key] of [
  [copy, __test.renderCopy(p), "Product Copy", "productCopy", p.core.name],
  [wear, __test.renderWear(p), "Wear Context", "productWearContext", p.core.name],
  [discovery, __test.renderDiscovery(p), "Discovery Profiles", "discoveryProfiles", p.slug],
]) {
  const next = __test.insertObjectEntry(source, rendered, label, exportName);
  if (next.includes("},,")) throw new Error(`${label} insertion created a double comma.`);
  const start = next.indexOf(`export const ${exportName} = {`);
  const end = __test.findExportObjectEnd(next, exportName);
  const keyPos = next.indexOf(JSON.stringify(key));
  if (!(start >= 0 && keyPos > start && keyPos < end)) throw new Error(`${label} inserted outside ${exportName}.`);
}

console.log("PASS  no double commas in new-product insertion");
console.log("PASS  Copy inserts into productCopy, not fallbackCopy");
console.log("PASS  Wear and Discovery insert into their intended exports");
console.log("Production untouched: yes (in-memory regression only)");
