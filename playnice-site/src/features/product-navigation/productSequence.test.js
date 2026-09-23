import {
  getProductNavigationLabel,
  getProductSequenceNeighbors,
} from "./productSequence";

const catalog = [
  { slug: "alpha", name: "Alpha", shortName: "A" },
  { slug: "bravo", name: "Bravo", modalName: "Bravo Modal" },
  { slug: "charlie", name: "Charlie" },
];

describe("productSequence", () => {
  test("returns previous and next products in catalog order", () => {
    const result = getProductSequenceNeighbors(catalog, "bravo");

    expect(result.previousProduct.slug).toBe("alpha");
    expect(result.nextProduct.slug).toBe("charlie");
    expect(result.position).toBe(2);
    expect(result.total).toBe(3);
  });

  test("wraps from the first and last product", () => {
    expect(
      getProductSequenceNeighbors(catalog, "alpha").previousProduct.slug
    ).toBe("charlie");

    expect(
      getProductSequenceNeighbors(catalog, "charlie").nextProduct.slug
    ).toBe("alpha");
  });

  test("handles empty and single-product catalogs safely", () => {
    expect(getProductSequenceNeighbors([], "alpha")).toEqual({
      previousProduct: null,
      nextProduct: null,
      position: 0,
      total: 0,
    });

    expect(
      getProductSequenceNeighbors([{ slug: "only", name: "Only" }], "only")
    ).toEqual({
      previousProduct: null,
      nextProduct: null,
      position: 1,
      total: 1,
    });
  });

  test("uses the shortest curated navigation label first", () => {
    expect(getProductNavigationLabel(catalog[0])).toBe("A");
    expect(getProductNavigationLabel(catalog[1])).toBe("Bravo Modal");
    expect(getProductNavigationLabel(catalog[2])).toBe("Charlie");
  });
});
