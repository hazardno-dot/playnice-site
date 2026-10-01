import { products } from "../data/products";
import {
  buildDiscoveryConversationContext,
  resolveDiscoveryFollowUp,
} from "./conversationContinuity";

describe("FI Ultra v1.3 — conversational continuity", () => {
  test("resolves a follow-up about one grounded product", () => {
    const context = buildDiscoveryConversationContext({
      rawQuery: "Koliko je Hawas Ice 10ml?",
      effectiveQuery: "Koliko je Hawas Ice 10ml?",
      knowledge: {
        handled: true,
        entity: { productSlug: "rasasi-hawas-ice" },
      },
    });

    const result = resolveDiscoveryFollowUp({
      query: "A u 5 ml?",
      context,
      products,
      lang: "sr",
    });

    expect(result.usedContext).toBe(true);
    expect(result.kind).toBe("single-product");
    expect(result.resolvedQuery).toContain("Hawas Ice");
    expect(result.resolvedQuery).toContain("5 ml");
  });

  test("restores a concrete comparison pair for 'od ta dva'", () => {
    const context = buildDiscoveryConversationContext({
      rawQuery: "Hawas Ice ili 9AM?",
      effectiveQuery: "Hawas Ice ili 9AM?",
      knowledge: {
        handled: true,
        entity: {
          productSlugs: [
            "rasasi-hawas-ice",
            "afnan-9am",
          ],
        },
      },
    });

    const result = resolveDiscoveryFollowUp({
      query: "Koji je bolji za posao od ta dva?",
      context,
      products,
      lang: "sr",
    });

    expect(result.usedContext).toBe(true);
    expect(result.kind).toBe("pair");
    expect(result.resolvedQuery).toContain("Hawas Ice");
    expect(result.resolvedQuery).toContain("9 AM");
    expect(result.resolvedQuery).toContain("posao");
  });

  test("adds a new constraint to the previous discovery brief", () => {
    const context = {
      mode: "discovery",
      rawQuery: "Sveže za leto do 15 €",
      effectiveQuery: "Sveže za leto do 15 €",
      productSlugs: [],
      resultSnapshots: [],
    };

    const result = resolveDiscoveryFollowUp({
      query: "Bez vanile",
      context,
      products,
      lang: "sr",
    });

    expect(result.usedContext).toBe(true);
    expect(result.kind).toBe("additive-constraint");
    expect(result.resolvedQuery)
      .toContain("Sveže za leto do 15 €");
    expect(result.resolvedQuery)
      .toContain("Bez vanile");
  });

  test("turns 'nešto jeftinije' into a cheaper reference search", () => {
    const context = {
      mode: "discovery",
      rawQuery: "Jak parfem za izlazak",
      effectiveQuery: "Jak parfem za izlazak",
      productSlugs: [],
      resultSnapshots: [
        {
          slug: "rasasi-hawas-ice",
          selectedPrice: 9,
        },
      ],
    };

    const result = resolveDiscoveryFollowUp({
      query: "Nešto jeftinije",
      context,
      products,
      lang: "sr",
    });

    expect(result.usedContext).toBe(true);
    expect(result.kind)
      .toBe("cheaper-than-top-result");
    expect(result.resolvedQuery)
      .toContain("Hawas Ice");
    expect(result.resolvedQuery)
      .toContain("do 8 €");
  });

  test("explicit product wins over stored single-product context", () => {
    const context = {
      mode: "knowledge",
      rawQuery: "Koliko je Hawas Ice 10ml?",
      effectiveQuery: "Koliko je Hawas Ice 10ml?",
      productSlugs: ["rasasi-hawas-ice"],
      resultSnapshots: [],
    };

    const result = resolveDiscoveryFollowUp({
      query: "Koliko je Afnan 9AM 10ml?",
      context,
      products,
      lang: "sr",
    });

    expect(result.usedContext).toBe(false);
    expect(result.resolvedQuery)
      .toBe("Koliko je Afnan 9AM 10ml?");
  });

  test("does not invent continuity without context", () => {
    const result = resolveDiscoveryFollowUp({
      query: "A u 5 ml?",
      context: null,
      products,
      lang: "sr",
    });

    expect(result.usedContext).toBe(false);
    expect(result.kind).toBe("none");
  });

  test("non-product knowledge does not create product continuity", () => {
    const context = buildDiscoveryConversationContext({
      rawQuery: "Šta je Ambroxan?",
      effectiveQuery: "Šta je Ambroxan?",
      knowledge: {
        handled: true,
        entity: { id: "ambroxan" },
      },
    });

    expect(context).toBeNull();
  });
});
