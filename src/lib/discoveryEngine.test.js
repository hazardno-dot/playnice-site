// PLAYNICE FRAGRANCE INTELLIGENCE — automated QA benchmark
// Save as: src/lib/discoveryEngine.test.js
// Requires the package.json test script:
//   "test": "react-scripts test --watchAll=false"

import { products } from "../data/products";
import { productCopy } from "../data/products/productCopy";
import { productWearContext } from "../data/products/productWearContext";
import { discoveryProfiles } from "../data/products/discoveryProfiles";
import { discoverFragrances, parseQuery } from "./discoveryEngine";

const run = (query, lang = "en") =>
  discoverFragrances({
    query,
    products,
    productCopy,
    productWearContext,
    discoveryProfiles,
    lang,
    limit: 5,
  });

describe("Fragrance Intelligence — intent guard", () => {
  test.each([
    "Trava raste",
    "Srbijaaaa",
    "office chair do 100 €",
    "summer vacation in Greece",
    "weather tomorrow",
    "football tonight",
    "laptop do 900 €",
    "recept za palačinke",
  ])("rejects unrelated input: %s", (query) => {
    const output = run(query);
    expect(output.isRelevant).toBe(false);
    expect(output.results).toEqual([]);
    expect(output.feedback.length).toBeGreaterThan(0);
  });

  test.each([
    "Nešto diskretno za posao",
    "Office do 10 €",
    "Fresh for summer under €15",
    "Slatko ali ne previše",
    "Ne volim vanilu, hoću nešto za dejt",
    "Arabian, čist i moderan, do 15 €",
    "Something like Bleu de Chanel",
    "Nešto kao Naxos, ali svežije",
  ])("accepts fragrance intent: %s", (query) => {
    const output = run(query);
    expect(output.isRelevant).toBe(true);
    expect(output.results.length).toBeGreaterThan(0);
  });
});

describe("Fragrance Intelligence — ranking invariants", () => {
  test.each([
    ["Office do 10 €", 10],
    ["Fresh for summer under €15", 15],
    ["Arabian, clean and modern, under €15", 15],
  ])("never breaks budget: %s", (query, budget) => {
    const output = run(query);
    output.results.forEach((item) => {
      expect(item.selectedSize.price).toBeLessThanOrEqual(budget);
    });
  });

  test("hard vanilla exclusion is respected", () => {
    const output = run("Ne volim vanilu, hoću nešto za dejt");
    const vanillaKeys = [
      "vanilla", "bourbon-vanilla", "madagascar-vanilla",
      "vanilla-absolute", "vanilla-orchid", "vanilla-flower"
    ];

    output.results.forEach((item) => {
      expect((item.profile?.notes || []).some((note) => vanillaKeys.includes(note))).toBe(false);
    });
  });

  test("reference anchor never recommends itself", () => {
    const output = run("Something like Bleu de Chanel");
    expect(output.intent.referenceProduct).toBeTruthy();
    expect(
      output.results.some(
        (item) => item.product.id === output.intent.referenceProduct.id
      )
    ).toBe(false);
  });

  test("Naxos fresher modifier is parsed", () => {
    const intent = parseQuery("Nešto kao Naxos, ali svežije", products);
    expect(intent.referenceProduct).toBeTruthy();
    expect(intent.referenceModifiers).toContain("fresher");
  });

  test("summer brief strongly prefers summer/all", () => {
    const output = run("Fresh for summer under €15, but not too citrusy");
    const compatible = output.results.filter((item) =>
      ["summer", "all"].includes(item.product.season)
    );
    expect(compatible.length).toBeGreaterThanOrEqual(4);
  });

  test("office top 3 are office-capable", () => {
    const output = run("Clean and elegant for work");
    output.results.slice(0, 3).forEach((item) => {
      expect(item.profile.office).toBeGreaterThanOrEqual(7);
    });
  });

  test("reasons are not five identical generic sentences", () => {
    const output = run("Clean and elegant for work");
    expect(new Set(output.results.map((item) => item.reason)).size).toBeGreaterThanOrEqual(3);
  });

  test("five returned products are unique", () => {
    const output = run("Date night, not too sweet");
    expect(output.results).toHaveLength(5);
    expect(new Set(output.results.map((item) => item.product.slug)).size).toBe(5);
  });
});

describe("Fragrance Intelligence — catalog coverage", () => {
  test("every product has an explicit discovery profile", () => {
    const missing = products
      .filter((product) => !discoveryProfiles[product.slug])
      .map((product) => product.slug);

    expect(missing).toEqual([]);
  });
});