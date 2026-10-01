import { products } from "../data/products";
import { discoveryProfiles } from "../data/products/discoveryProfiles";
import {
  findCatalogProductsByQuery,
  resolveCatalogProductIntelligenceQuery,
} from "./fragranceProductIntelligence";
import { resolveFragranceKnowledgeQuery } from "./fragranceKnowledgeRouter";

describe("FI Ultra v1.1 — catalog product intelligence", () => {
  test("keeps Discovery profile coverage complete for the live catalog", () => {
    const productSlugs = products.map((product) => product.slug);
    const profileSlugs = Object.keys(discoveryProfiles);

    expect(new Set(productSlugs).size).toBe(productSlugs.length);
    expect(new Set(profileSlugs).size).toBe(profileSlugs.length);
    expect(profileSlugs.sort()).toEqual(productSlugs.sort());
  });

  test.each([
    ["Hawas Ice", "rasasi-hawas-ice"],
    ["9AM", "afnan-9am"],
    ["Afnan 9 AM", "afnan-9am"],
    ["Nice Bergamote", "essential-parfums-nice-bergamote"],
  ])("resolves live catalog product %s", (query, slug) => {
    const matches = findCatalogProductsByQuery(query, products);
    expect(matches[0]?.slug).toBe(slug);
  });

  test("grounds a requested live size and price", () => {
    const result = resolveCatalogProductIntelligenceQuery(
      "Koliko je Hawas Ice 10ml?",
      "sr",
      { products }
    );

    expect(result.handled).toBe(true);
    expect(result.type).toBe("product-grounding");
    expect(result.entity.productSlug).toBe("rasasi-hawas-ice");
    expect(result.answer).toContain("10ml");
    expect(result.answer).toContain("9 €");
  });

  test("lists actual available sizes instead of inventing a missing size", () => {
    const product = products.find(
      (item) => item.slug === "afnan-9am"
    );
    const unavailableSize = ["2ml", "5ml", "10ml", "20ml"]
      .find((size) => product?.sizes?.[size] === undefined);

    expect(unavailableSize).toBeTruthy();

    const result = resolveCatalogProductIntelligenceQuery(
      `Ima li Afnan 9AM u ${unavailableSize}?`,
      "sr",
      { products }
    );

    expect(result.handled).toBe(true);
    expect(result.answer).toContain("trenutno nije naveden");
  });

  test("grounds note-map questions from the live product contract", () => {
    const result = resolveCatalogProductIntelligenceQuery(
      "Koje note ima Afnan 9AM?",
      "sr",
      { products }
    );

    expect(result.handled).toBe(true);
    expect(result.answer).toContain("otvaranje");
    expect(result.answer).toContain("mandarin");
    expect(result.answer).toContain("cedarwood");
  });

  test("compares two concrete products without invoking broad recommendation ranking", () => {
    const result = resolveCatalogProductIntelligenceQuery(
      "Hawas Ice ili Afnan 9AM — koji je svježiji?",
      "sr",
      { products }
    );

    expect(result.handled).toBe(true);
    expect(result.type).toBe("product-comparison");
    expect(result.entity.productSlugs).toEqual(
      expect.arrayContaining([
        "rasasi-hawas-ice",
        "afnan-9am",
      ])
    );
    expect(result.answer).toContain("PlayNice FI profilu");
  });

  test("uses buyer-context vectors for a concrete comparison", () => {
    const result = resolveCatalogProductIntelligenceQuery(
      "Hawas Ice ili Afnan 9AM za posao?",
      "sr",
      { products }
    );

    expect(result.handled).toBe(true);
    expect(result.type).toBe("product-comparison");
    expect(result.answer).toContain("posao");
  });

  test("compares live prices at the same requested size", () => {
    const result = resolveCatalogProductIntelligenceQuery(
      "Hawas Ice ili Afnan 9AM — koji je jeftiniji u 10ml?",
      "sr",
      { products }
    );

    expect(result.handled).toBe(true);
    expect(result.answer).toContain("10ml");
    expect(result.answer).toMatch(/7 €|9 €/);
  });

  test.each([
    "Nešto kao Hawas Ice",
    "Preporuči mi nešto slično Afnan 9AM",
    "Treba mi svjež parfem za posao do 20 €",
    "Hawas Ice za ljeto do 20 €",
  ])("does not steal broad Discovery recommendation query: %s", (query) => {
    const result = resolveCatalogProductIntelligenceQuery(
      query,
      "sr",
      { products }
    );
    expect(result.handled).toBe(false);
  });

  test("integrates through the existing FI router", () => {
    const result = resolveFragranceKnowledgeQuery(
      "Koliko je Hawas Ice 10ml?",
      "sr",
      { products }
    );

    expect(result.handled).toBe(true);
    expect(result.type).toBe("product-grounding");
  });

  test("preserves legacy FI knowledge routing", () => {
    const result = resolveFragranceKnowledgeQuery(
      "Šta je Ambroxan?",
      "sr",
      { products }
    );

    expect(result.handled).toBe(true);
    expect(result.type).toBe("fragrance-term");
  });

  test.each([
    "Sveže za leto do 15 €",
    "Nešto kao Naxos, ali manje slatko",
    "Preporuči nešto puderasto za nju",
    "Something clean but not boring for the office",
  ])("preserves Discovery sovereignty: %s", (query) => {
    const result = resolveFragranceKnowledgeQuery(
      query,
      "sr",
      { products }
    );

    expect(result.handled).toBe(false);
  });
});


describe("FI Ultra v1.4 — product evidence provenance", () => {
  test("live price grounding is catalog-grounded", () => {
    const output =
      resolveCatalogProductIntelligenceQuery(
        "Koliko je Hawas Ice 10ml?",
        "sr",
        { products }
      );

    expect(output.handled).toBe(true);
    expect(output.evidenceLevel).toBe("grounded");
    expect(output.provenance)
      .toContain("catalog-live");
    expect(output.provenance)
      .not.toContain("playnice-fi-profile");
    expect(output.evidenceConfidence)
      .toBe("high");
  });

  test("buyer comparison exposes FI interpretation provenance", () => {
    const output =
      resolveCatalogProductIntelligenceQuery(
        "Hawas Ice ili Afnan 9AM — koji je bolji za posao?",
        "sr",
        { products }
      );

    expect(output.handled).toBe(true);
    expect(output.evidenceLevel)
      .toBe("interpretive");
    expect(output.provenance)
      .toEqual(
        expect.arrayContaining([
          "catalog-live",
          "playnice-fi-profile",
        ])
      );
  });
});
