import {
  DISCOVERY_PROMPTS,
  getDiscoveryAnalyticsParams,
  getDiscoveryReferenceQuery,
  getDiscoveryMatchLabel,
  formatDiscoveryPrice,
  getDiscoveryResultPresentation,
  buildDiscoveryResultClickParams,
  buildDiscoveryAttribution,
} from "./discoveryDerivations";

describe("discoveryDerivations", () => {
  test("keeps the four curated prompt pairs", () => {
    expect(DISCOVERY_PROMPTS).toHaveLength(4);
    expect(DISCOVERY_PROMPTS[1]).toEqual({
      sr: "Nešto kao Naxos",
      en: "Something like Naxos",
    });
  });

  test("builds search analytics flags from intent", () => {
    const result = getDiscoveryAnalyticsParams(
      {
        isRelevant: true,
        results: [{}, {}],
        intent: {
          maxPrice: 15,
          referenceProduct: { id: 1 },
          categories: ["Niche"],
          gender: "unisex",
          contexts: ["summer", "work"],
          referenceModifiers: ["fresher"],
          excludedNotes: ["oud"],
        },
      },
      {
        lang: "sr",
        source: "prompt",
      }
    );

    expect(result).toEqual({
      lang: "sr",
      search_source: "prompt",
      result_count: 2,
      is_relevant: "yes",
      has_budget: "yes",
      has_reference: "yes",
      category: "Niche",
      gender: "unisex",
      contexts: "summer|work",
      modifiers: "fresher",
      has_exclusions: "yes",
    });
  });

  test("builds localized find-similar query", () => {
    const product = { name: "Naxos" };

    expect(
      getDiscoveryReferenceQuery(product, "sr")
    ).toBe("nešto kao Naxos");

    expect(
      getDiscoveryReferenceQuery(product, "en")
    ).toBe("something like Naxos");
  });

  test("preserves match label thresholds", () => {
    expect(
      getDiscoveryMatchLabel(92, "sr")
    ).toBe("Najbolji izbor");
    expect(
      getDiscoveryMatchLabel(86, "en")
    ).toBe("Excellent match");
    expect(
      getDiscoveryMatchLabel(85, "sr")
    ).toBe("Dobar izbor");
  });

  test("formats selected price with current precision rules", () => {
    expect(formatDiscoveryPrice(12)).toBe("€12");
    expect(formatDiscoveryPrice(12.5)).toBe("€12.5");
    expect(formatDiscoveryPrice(undefined)).toBe("");
  });

  test("builds result presentation values", () => {
    expect(
      getDiscoveryResultPresentation(
        {
          match: 93,
          selectedSize: {
            size: "5ml",
            price: 12.5,
          },
          reason: "Clean and bright.",
        },
        "en"
      )
    ).toEqual({
      matchLabel: "Best match",
      sizeLabel: "5ml",
      priceLabel: "€12.5",
      refinedReason: "Clean and bright.",
    });
  });

  test("builds result-click analytics using search context defaults", () => {
    const result = {
      product: {
        id: 7,
        name: "Test",
        slug: "test",
      },
      match: 91,
      selectedSize: {
        size: "10ml",
        price: 20,
      },
    };

    expect(
      buildDiscoveryResultClickParams({
        result,
        rank: 2,
        lang: "en",
        searchContext: {
          search_source: "manual",
          has_budget: "yes",
          category: "Designer",
        },
      })
    ).toMatchObject({
      lang: "en",
      rank: 2,
      product_id: "7",
      product_slug: "test",
      selected_size: "10ml",
      selected_price: 20,
      search_source: "manual",
      has_budget: "yes",
      has_reference: "no",
      category: "Designer",
      gender: "none",
      has_exclusions: "no",
    });
  });

  test("builds attribution payload without changing field names", () => {
    const result = {
      product: { id: 7 },
      match: 91,
      selectedSize: { size: "10ml" },
    };

    expect(
      buildDiscoveryAttribution({
        result,
        rank: 2,
        clickedAt: 1234,
        searchContext: {
          search_source: "prompt",
          category: "Niche",
          gender: "unisex",
          has_budget: "yes",
          has_reference: "yes",
          has_exclusions: "no",
        },
      })
    ).toEqual({
      productId: 7,
      rank: 2,
      match: 91,
      selectedSize: "10ml",
      clickedAt: 1234,
      searchSource: "prompt",
      category: "Niche",
      gender: "unisex",
      hasBudget: "yes",
      hasReference: "yes",
      hasExclusions: "no",
    });
  });
});
