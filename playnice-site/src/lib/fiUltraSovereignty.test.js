import { products } from "../data/products";
import { productCopy } from "../data/products/productCopy";
import { productWearContext } from "../data/products/productWearContext";
import { discoveryProfiles } from "../data/products/discoveryProfiles";
import { discoverFragrances } from "./discoveryEngine";
import { resolveFragranceKnowledgeQuery } from "./fragranceKnowledgeRouter";

const runDiscovery = (query, lang = "sr") =>
  discoverFragrances({
    query,
    products,
    productCopy,
    productWearContext,
    discoveryProfiles,
    lang,
    limit: 5,
  });

describe("FI Ultra — knowledge/discovery sovereignty contract", () => {
  const mixedRecommendationQueries = [
    "Nešto kao Ganymede",
    "Preporuči mi nešto kao Baccarat Rouge 540",
    "Hoću nešto slično Bois Imperial",
    "Alternativa za YSL Libre za posao",
    "Something like Terre d Hermes for summer",
    "Recommend something similar to Le Male",
    "Preporuči mi nešto od Quentin Bisch",
    "Treba mi nešto od Essential Parfums za leto",
    "Parfem kao Bois Imperial ali manje drvenast",
    "Nešto kao Baccarat Rouge 540 ali ne tako slatko",
  ];

  test.each(mixedRecommendationQueries)(
    "known entities stay on Discovery path and still return fragrance results: %s",
    (query) => {
      const knowledge = resolveFragranceKnowledgeQuery(query, "sr", {
        products,
      });

      expect(knowledge.handled).toBe(false);

      const discovery = runDiscovery(query);

      expect(discovery.isRelevant).toBe(true);
      expect(discovery.results.length).toBeGreaterThan(0);
    }
  );

  const pureKnowledgeQueries = [
    "Ko je Quentin Bisch?",
    "Šta je Givaudan?",
    "Ko je napravio Ganymede?",
    "Koje parfeme je napravio Quentin Bisch?",
    "Čiji je Ganymede?",
    "Šta je sillage?",
  ];

  test.each(pureKnowledgeQueries)(
    "pure knowledge query is intercepted before Discovery: %s",
    (query) => {
      const knowledge = resolveFragranceKnowledgeQuery(query, "sr", {
        products,
      });

      expect(knowledge.handled).toBe(true);
      expect(knowledge.answer).toBeTruthy();
    }
  );
});
