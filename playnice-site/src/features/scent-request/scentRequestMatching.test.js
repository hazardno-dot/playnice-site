import {
  getScentRequestMatchResult,
  getScentRequestMatchScore,
  normalizeScentName,
} from "./scentRequestMatching";

const sampleProducts = [
  {
    id: "hawas-ice",
    name: "Rasasi Hawas Ice",
    shortName: "Hawas Ice",
    brand: "Rasasi",
    slug: "rasasi-hawas-ice",
    aliases: ["Hawas Ice EDP"],
  },
  {
    id: "hawas-black",
    name: "Rasasi Hawas Black",
    shortName: "Hawas Black",
    brand: "Rasasi",
    slug: "rasasi-hawas-black",
  },
  {
    id: "narciso-poudree",
    name: "Narciso Rodriguez Poudrée",
    shortName: "Poudrée",
    brand: "Narciso Rodriguez",
    slug: "narciso-rodriguez-poudree",
  },
];

describe("Scent Request matching", () => {
  test("normalizes accents and fragrance noise words", () => {
    expect(normalizeScentName("Narciso Rodriguez Poudrée EDP")).toBe(
      "narciso rodriguez poudree"
    );
  });

  test("returns an exact product match", () => {
    const result = getScentRequestMatchResult("Hawas Ice", sampleProducts);
    expect(result.ambiguous).toBe(false);
    expect(result.product?.id).toBe("hawas-ice");
  });

  test("tolerates a one-character typo in longer tokens", () => {
    const result = getScentRequestMatchResult("Hawas Ise", sampleProducts);
    expect(result.ambiguous).toBe(false);
    expect(result.product?.id).toBe("hawas-ice");
  });

  test("reports ambiguous broad matches instead of guessing", () => {
    const result = getScentRequestMatchResult("Hawas", sampleProducts);
    expect(result.product).toBeNull();
    expect(result.ambiguous).toBe(true);
  });

  test("scores unrelated products as no match", () => {
    expect(getScentRequestMatchScore("Black Opium", sampleProducts[0])).toBe(0);
  });
});
