import { products } from "../data/products";
import { productCopy } from "../data/products/productCopy";
import { productWearContext } from "../data/products/productWearContext";
import { discoveryProfiles } from "../data/products/discoveryProfiles";
import { discoverFragrances } from "./discoveryEngine";
import { resolveFragranceKnowledgeQuery } from "./fragranceKnowledgeRouter";

const runDiscovery = (query) =>
  discoverFragrances({
    query,
    products,
    productCopy,
    productWearContext,
    discoveryProfiles,
    lang: "sr",
    limit: 5,
  });

describe("FI Ultra sovereignty contract", () => {
  test.each([
    "Nesto kao Ganymede",
    "Preporuci mi nesto kao Baccarat Rouge 540",
    "Alternativa za YSL Libre za posao",
    "Something like Terre d Hermes for summer",
    "Treba mi nesto od Essential Parfums za leto",
    "Parfem kao Bois Imperial ali manje drvenast",
    "Nesto kao Baccarat Rouge 540 ali ne tako slatko",
  ])("supported recommendation stays on Discovery: %s", (query) => {
    expect(resolveFragranceKnowledgeQuery(query, "sr", { products }).handled).toBe(false);
    const result = runDiscovery(query);
    expect(result.isRelevant).toBe(true);
    expect(result.results.length).toBeGreaterThan(0);
  });

  test.each([
    "Hocu nesto slicno Bois Imperial",
    "Recommend something similar to Le Male",
    "Preporuci mi nesto od Quentin Bisch",
  ])("unsupported legacy phrasing still falls through: %s", (query) => {
    expect(resolveFragranceKnowledgeQuery(query, "sr", { products }).handled).toBe(false);
  });

  test.each([
    "Ko je Quentin Bisch?",
    "Sta je Givaudan?",
    "Ko je napravio Ganymede?",
    "Ciji je Ganymede?",
    "Sta je sillage?",
  ])("knowledge query is handled: %s", (query) => {
    const result = resolveFragranceKnowledgeQuery(query, "sr", { products });
    expect(result.handled).toBe(true);
    expect(result.answer).toBeTruthy();
  });
});
