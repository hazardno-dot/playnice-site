import { products } from "../data/products";
import { productCopy } from "../data/products/productCopy";
import { productWearContext } from "../data/products/productWearContext";
import { discoveryProfiles } from "../data/products/discoveryProfiles";
import { discoverFragrances } from "./discoveryEngine";
import {
  buildDiscoveryEvidence,
  buildKnowledgeEvidence,
  buildProductEvidence,
  getEvidenceLevel,
} from "./evidenceEnvelope";

describe("FI Ultra v1.4 — evidence envelope", () => {
  test("catalog facts are grounded without FI interpretation", () => {
    const hawas = products.find(
      (product) =>
        product.slug === "rasasi-hawas-ice"
    );

    const envelope = buildProductEvidence({
      query: "Koliko je Hawas Ice 10ml?",
      type: "product-grounding",
      products: [hawas],
    });

    expect(envelope.evidenceLevel)
      .toBe("grounded");
    expect(envelope.provenance)
      .toEqual(["catalog-live"]);
    expect(envelope.confidence)
      .toBe("high");
  });

  test("product comparison exposes FI profile interpretation", () => {
    const selected = products.filter(
      (product) =>
        [
          "rasasi-hawas-ice",
          "afnan-9am",
        ].includes(product.slug)
    );

    const envelope = buildProductEvidence({
      query:
        "Hawas Ice ili Afnan 9AM — koji je bolji za posao?",
      type: "product-comparison",
      products: selected,
    });

    expect(envelope.evidenceLevel)
      .toBe("interpretive");
    expect(envelope.provenance)
      .toEqual(
        expect.arrayContaining([
          "catalog-live",
          "playnice-fi-profile",
        ])
      );
  });

  test("official sources are marked as verified", () => {
    const envelope =
      buildKnowledgeEvidence(
        {
          name: "Test",
          sources: [
            {
              label: "Brand source",
              url: "https://example.com",
              type: "brand-official",
            },
          ],
        },
        "high"
      );

    expect(envelope.evidenceLevel)
      .toBe("verified");
    expect(envelope.provenance)
      .toContain("brand-official");
  });

  test("Discovery results expose catalog + FI provenance", () => {
    const output = discoverFragrances({
      query: "Clean and elegant for work",
      products,
      productCopy,
      productWearContext,
      discoveryProfiles,
      lang: "en",
      limit: 5,
    });

    expect(output.results.length)
      .toBeGreaterThan(0);

    output.results.slice(0, 3)
      .forEach((item) => {
        expect(item.evidenceLevel)
          .toBe("interpretive");
        expect(item.provenance)
          .toEqual(
            expect.arrayContaining([
              "catalog-live",
              "playnice-fi-profile",
            ])
          );
      });
  });

  test("manual Discovery profiles carry stronger profile confidence", () => {
    const product = products.find(
      (item) =>
        discoveryProfiles[item.slug]
    );
    const envelope =
      buildDiscoveryEvidence({
        product,
        profile: {
          hasManualProfile: true,
        },
      });

    expect(envelope.confidence)
      .toBe("medium-high");
  });

  test("empty evidence is unknown", () => {
    expect(getEvidenceLevel([]))
      .toBe("unknown");
  });
});
