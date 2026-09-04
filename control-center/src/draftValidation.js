import { products } from "@shop/data/products/index.js";
import { productCopy } from "@shop/data/products/productCopy.js";
import { productWearContext } from "@shop/data/products/productWearContext.js";
import discoveryProfiles from "@shop/data/products/discoveryProfiles.js";
import noteMapSource from "@shop/TheNoteMap.jsx?raw";

const csv = (value) => String(value ?? "").split(",").map((v) => v.trim()).filter(Boolean);
const empty = (value) => value == null || String(value).trim() === "";
const finite = (value) => Number.isFinite(Number(value));

function noteLibraryKeys(source) {
  const start = source.indexOf("const NOTE_LIBRARY = {");
  const end = source.indexOf("const NOTE_SR = {", start);
  if (start < 0 || end < 0) return [];
  const section = source.slice(start, end);
  return [...section.matchAll(/^  (?:(?:"([^"]+)")|(?:'([^']+)')|([A-Za-z0-9_-]+))\s*:\s*\{/gm)]
    .map((match) => match[1] || match[2] || match[3])
    .filter(Boolean);
}

const KNOWN_NOTE_KEYS = new Set([
  ...products.flatMap((product) => ["top", "heart", "base"].flatMap((level) => product.noteMap?.[level] || [])),
  ...noteLibraryKeys(noteMapSource),
]);
const PRODUCT_SLUGS = new Set(products.map((product) => product.slug));
const DISCOVERY_KEYS = Object.keys(discoveryProfiles[products[0]?.slug] || {});

function issue(level, section, field, message) {
  return { level, section, field, message };
}

export function validateProductDraft(live, draft) {
  const issues = [];
  const core = draft?.core || {};

  [["Name", core.name], ["Short name", core.shortName], ["Category", core.category], ["Image path", core.image], ["Season", core.season], ["Rating label", core.ratingLabel]].forEach(([field, value]) => {
    if (empty(value)) issues.push(issue("error", "Core", field, `${field} is required.`));
  });

  if (!finite(core.rating) || Number(core.rating) < 0 || Number(core.rating) > 10) {
    issues.push(issue("error", "Core", "Rating", "Rating must be a number from 0 to 10."));
  }

  const moods = csv(core.moods);
  if (moods.length !== 3) issues.push(issue("error", "Presentation", "Moods", "Exactly 3 moods are required for product-card parity."));

  const imagePath = String(core.image || "").trim();
  if (!imagePath.startsWith("/products/") || imagePath === "/products/" || imagePath.endsWith("/")) issues.push(issue("error", "Core", "Image path", "Use a specific product image file under /products/, not a directory placeholder."));

  if (!live && empty(core.badge)) issues.push(issue("error", "Presentation", "Badge", "A new product must have a presentation badge so the modal media column keeps the standard PlayNice hierarchy."));
  if (!live && empty(core.inspiredBy?.name)) issues.push(issue("error", "Presentation", "Inspired by · name", "A new product must define the modal reference/original-creation label. The optional short DNA label may remain empty."));
  if (!empty(core.inspiredBy?.short) && empty(core.inspiredBy?.name)) issues.push(issue("warning", "Core", "Inspired by", "A short DNA label cannot be used without the main inspired-by/original-creation label."));

  const sizes = core.sizes || {};
  if (!Object.keys(sizes).length) issues.push(issue("error", "Prices", "Sizes", "At least one size and price is required."));
  Object.entries(sizes).forEach(([size, price]) => {
    if (!finite(price) || Number(price) <= 0) issues.push(issue("error", "Prices", size, `${size} price must be greater than 0.`));
  });

  const recs = csv(core.recommendations);
  if (recs.length !== 3) issues.push(issue("error", "Recommendations", "Linked products", "Exactly 3 recommendation slugs are required."));
  recs.forEach((slug) => {
    if (!PRODUCT_SLUGS.has(slug)) issues.push(issue("error", "Recommendations", slug, `Unknown product slug: ${slug}.`));
    if (slug === live?.slug) issues.push(issue("error", "Recommendations", slug, "A product cannot recommend itself."));
  });
  if (new Set(recs).size !== recs.length) issues.push(issue("error", "Recommendations", "Linked products", "Recommendation slugs must be unique."));

  ["top", "heart", "base"].forEach((level) => {
    const notes = csv(core.noteMap?.[level]);
    if (!notes.length) issues.push(issue("error", "Notes", level, `${level} notes cannot be empty.`));
    notes.forEach((note) => {
      if (!KNOWN_NOTE_KEYS.has(note)) issues.push(issue("error", "Notes", note, `Unknown note key: ${note}. Add it to the Note Library before review.`));
    });
  });

  const copy = draft?.copy || {};
  ["miniTag", "scentType", "card", "modal", "dominantNotes", "tags", "whyChoose"].forEach((field) => {
    ["sr", "en"].forEach((lang) => {
      if (empty(copy?.[field]?.[lang])) issues.push(issue("error", "Copy", `${field} · ${lang.toUpperCase()}`, "Required bilingual copy is missing."));
    });
  });

  const presentationLengths = [
    ["miniTag", 32],
    ["scentType", 42],
    ["card", { sr: 82, en: 92 }],
    ["modal", 230],
    ["whyChoose", 125],
  ];
  presentationLengths.forEach(([field, limit]) => {
    ["sr", "en"].forEach((lang) => {
      const value = String(copy?.[field]?.[lang] || "").trim();
      const max = typeof limit === "object" ? limit[lang] : limit;
      if (value.length > max) issues.push(issue("error", "Presentation", `${field} · ${lang.toUpperCase()}`, `Copy is ${value.length} characters; keep it at or below ${max} to protect the shared card/modal layout.`));
    });
  });

  ["sr", "en"].forEach((lang) => {
    const dominant = csv(copy?.dominantNotes?.[lang]);
    const tags = csv(copy?.tags?.[lang]);
    if (dominant.length !== 4) issues.push(issue("error", "Presentation", `dominantNotes · ${lang.toUpperCase()}`, "Exactly 4 dominant notes are required for modal parity."));
    if (tags.length !== 3) issues.push(issue("error", "Presentation", `tags · ${lang.toUpperCase()}`, "Exactly 3 tags are required for product presentation parity."));
  });

  const wear = draft?.wear || {};
  ["sr", "en"].forEach((lang) => {
    if (empty(wear?.[lang])) issues.push(issue("error", "Wear", lang.toUpperCase(), "Wear context is required in both languages."));
    const value = String(wear?.[lang] || "").trim();
    if (value.length > 90) issues.push(issue("error", "Presentation", `Wear · ${lang.toUpperCase()}`, `Wear context is ${value.length} characters; keep it at or below 90 so product cards remain balanced.`));
  });

  const liveDiscovery = discoveryProfiles[live?.slug] || {};
  const discovery = draft?.discovery || {};
  const discoveryKeys = live ? Object.keys(liveDiscovery) : DISCOVERY_KEYS;
  discoveryKeys.forEach((key) => {
    const value = discovery[key];
    if (!finite(value) || Number(value) < 0 || Number(value) > 10) {
      issues.push(issue("error", "Discovery", key, `${key} must be a number from 0 to 10.`));
    }
  });

  if (live) {
    const liveCopy = productCopy[live.name] || {};
    const liveWear = productWearContext[live.name] || {};
    const warnIfCleared = (section, field, before, after) => {
      if (!empty(before) && empty(after)) issues.push(issue("warning", section, field, "Existing live value would be cleared."));
    };
    [["Name", live.name, core.name], ["Short name", live.shortName, core.shortName], ["Category", live.category, core.category], ["Badge", live.badge, core.badge], ["Rating label", live.ratingLabel, core.ratingLabel], ["Season", live.season, core.season]].forEach(([field, before, after]) => warnIfCleared("Core", field, before, after));
    ["miniTag", "scentType", "card", "modal", "whyChoose"].forEach((field) => ["sr", "en"].forEach((lang) => warnIfCleared("Copy", `${field} · ${lang.toUpperCase()}`, liveCopy?.[field]?.[lang], copy?.[field]?.[lang])));
    ["sr", "en"].forEach((lang) => warnIfCleared("Wear", lang.toUpperCase(), liveWear?.[lang], wear?.[lang]));
  }

  const errors = issues.filter((item) => item.level === "error");
  const warnings = issues.filter((item) => item.level === "warning");
  return {
    status: errors.length ? "blocked" : "ready",
    errors,
    warnings,
    issues,
  };
}
