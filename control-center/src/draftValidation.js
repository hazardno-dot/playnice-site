import { products } from "@shop/data/products/index.js";
import { productCopy } from "@shop/data/products/productCopy.js";
import { productWearContext } from "@shop/data/products/productWearContext.js";
import discoveryProfiles from "@shop/data/products/discoveryProfiles.js";

const csv = (value) => String(value ?? "").split(",").map((v) => v.trim()).filter(Boolean);
const empty = (value) => value == null || String(value).trim() === "";
const finite = (value) => Number.isFinite(Number(value));

const KNOWN_NOTE_KEYS = new Set(
  products.flatMap((product) => ["top", "heart", "base"].flatMap((level) => product.noteMap?.[level] || []))
);
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

  if (!csv(core.moods).length) issues.push(issue("error", "Core", "Moods", "At least one mood is required."));

  const imagePath = String(core.image || "").trim();
  if (!imagePath.startsWith("/products/") || imagePath === "/products/" || imagePath.endsWith("/")) issues.push(issue("error", "Core", "Image path", "Use a specific product image file under /products/, not a directory placeholder."));
  if (core.inspiredBy && (!empty(core.inspiredBy.name) || !empty(core.inspiredBy.short)) && (empty(core.inspiredBy.name) || empty(core.inspiredBy.short))) issues.push(issue("warning", "Core", "Inspired by", "Use both inspired-by name and short label, or leave both empty."));

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

  const wear = draft?.wear || {};
  ["sr", "en"].forEach((lang) => {
    if (empty(wear?.[lang])) issues.push(issue("error", "Wear", lang.toUpperCase(), "Wear context is required in both languages."));
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
