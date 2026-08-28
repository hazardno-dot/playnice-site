import { productCopy } from "@shop/data/products/productCopy.js";
import { productWearContext } from "@shop/data/products/productWearContext.js";
import discoveryProfiles from "@shop/data/products/discoveryProfiles.js";

export function makeLiveSnapshot(product) {
  if (!product) return null;
  return {
    core: {
      name: product.name || "",
      shortName: product.shortName || "",
      category: product.category || "",
      image: product.image || "",
      inspiredBy: { name: product.inspiredBy?.name || "", short: product.inspiredBy?.short || "" },
      badge: product.badge || "",
      rating: product.rating ?? "",
      ratingLabel: product.ratingLabel || "",
      season: product.season || "",
      moods: [...(product.moods || [])],
      sizes: { ...(product.sizes || {}) },
      noteMap: {
        top: [...(product.noteMap?.top || [])],
        heart: [...(product.noteMap?.heart || [])],
        base: [...(product.noteMap?.base || [])],
      },
      recommendations: [...(product.recommendations || [])],
    },
    copy: JSON.parse(JSON.stringify(productCopy[product.name] || {})),
    wear: JSON.parse(JSON.stringify(productWearContext[product.name] || {})),
    discovery: { ...(discoveryProfiles[product.slug] || {}) },
  };
}

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    return Object.keys(value)
      .sort()
      .reduce((out, key) => {
        out[key] = canonicalize(value[key]);
        return out;
      }, {});
  }
  return value ?? null;
}

const stable = (value) => JSON.stringify(canonicalize(value));
export const snapshotsEqual = (a, b) => stable(a) === stable(b);

export function buildPatchPlan(changes) {
  const files = {
    "src/data/products/index.js": [],
    "src/data/products/productCopy.js": [],
    "src/data/products/productWearContext.js": [],
    "src/data/products/discoveryProfiles.js": [],
  };

  changes.forEach((change) => {
    let file = "src/data/products/index.js";
    if (change.section === "Copy") file = "src/data/products/productCopy.js";
    if (change.section === "Wear") file = "src/data/products/productWearContext.js";
    if (change.section === "Discovery") file = "src/data/products/discoveryProfiles.js";
    files[file].push(change);
  });

  return Object.entries(files)
    .filter(([, items]) => items.length)
    .map(([file, items]) => ({ file, items }));
}
