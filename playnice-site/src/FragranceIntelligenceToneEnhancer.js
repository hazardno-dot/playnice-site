import { useEffect } from "react";
import { products } from "./data/products";
import { discoveryProfiles } from "./data/products/discoveryProfiles";

const normalizeName = (value = "") =>
  String(value)
    .replace(/\s+NEW\s*$/i, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

const productByName = new Map();

products.forEach((product) => {
  [product?.name, product?.shortName]
    .filter(Boolean)
    .forEach((name) => productByName.set(normalizeName(name), product));
});

const score = (profile, weights) =>
  weights.reduce(
    (total, [key, weight]) => total + Number(profile?.[key] || 0) * weight,
    0
  );

const getScentDirection = (product) => {
  if (!product) return "fresh";

  const profile = discoveryProfiles?.[product.slug] || {};
  const name = normalizeName(product.name);

  /* A few literal direction cues are stronger than broad vector overlap. */
  if (/\b(vert|green|vetiver|cypress|herbal|mint|tea|fig)\b/i.test(name)) {
    return "green";
  }

  if (/\b(poudree|poudré|powder|powdery)\b/i.test(name)) {
    return "soft";
  }

  const directions = {
    citrus: score(profile, [
      ["citrus", 1.0],
      ["freshness", 0.14],
      ["airiness", 0.08]
    ]),
    fresh: score(profile, [
      ["freshness", 0.42],
      ["cleanliness", 0.22],
      ["airiness", 0.14],
      ["aquatic", 0.12],
      ["versatility", 0.10]
    ]),
    green: score(profile, [
      ["aromaticity", 0.50],
      ["dryness", 0.18],
      ["freshness", 0.17],
      ["woodiness", 0.15]
    ]),
    dark: score(profile, [
      ["darkness", 0.45],
      ["evening", 0.24],
      ["spiciness", 0.16],
      ["woodiness", 0.15]
    ]),
    soft: score(profile, [
      ["powdery", 0.42],
      ["florality", 0.24],
      ["creaminess", 0.19],
      ["cleanliness", 0.15]
    ]),
    warm: score(profile, [
      ["warmth", 0.34],
      ["sweetness", 0.30],
      ["gourmandness", 0.21],
      ["creaminess", 0.15]
    ])
  };

  return Object.entries(directions).reduce(
    (best, entry) => (entry[1] > best[1] ? entry : best),
    ["fresh", -Infinity]
  )[0];
};

const applyTone = (card) => {
  if (!(card instanceof HTMLElement)) return;

  const title = card.querySelector(".playnice-discovery-card-copy h4")?.textContent;
  if (!title) return;

  const product = productByName.get(normalizeName(title));
  if (!product) return;

  card.dataset.scentTone = getScentDirection(product);
};

const applyAllTones = (root = document) => {
  root
    .querySelectorAll?.(".playnice-discovery-card")
    .forEach((card) => applyTone(card));
};

export default function FragranceIntelligenceToneEnhancer() {
  useEffect(() => {
    applyAllTones();

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) return;

          if (node.matches?.(".playnice-discovery-card")) {
            applyTone(node);
          }

          applyAllTones(node);
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => observer.disconnect();
  }, []);

  return null;
}
