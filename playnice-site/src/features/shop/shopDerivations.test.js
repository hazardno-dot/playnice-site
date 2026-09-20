import {
  normalizeShopSearch,
  filterAndSortProducts,
  getCategoryOptions,
  getScentMoodOptions,
  getSeasonOptions,
  getSortOptions,
  getSelectedOption,
  getPaginationData,
  getProductThumbnail,
} from "./shopDerivations";

const getMinPrice = (product) =>
  Math.min(...Object.values(product.sizes));

const products = [
  {
    id: 1,
    slug: "one",
    brand: "Maison",
    name: "Élan",
    category: "Niche",
    season: "summer",
    moods: ["clean"],
    rating: 4.5,
    sizes: { "5ml": 12 },
  },
  {
    id: 3,
    slug: "three",
    brand: "Brand",
    name: "Night",
    category: "Designer",
    season: "winter",
    moods: ["date", "rich"],
    rating: 4.8,
    sizes: { "5ml": 8 },
  },
  {
    id: 2,
    slug: "two",
    brand: "Maison",
    name: "All Season",
    category: "Niche",
    season: "All",
    moods: ["clean"],
    rating: 4.8,
    sizes: { "5ml": 10 },
  },
];

describe("shopDerivations", () => {
  test("normalizes accents, case and whitespace", () => {
    expect(
      normalizeShopSearch("  ÉLAN   Maison ")
    ).toBe("elan maison");
  });

  test("filters by category/search/season/mood", () => {
    const result = filterAndSortProducts({
      products,
      category: "Niche",
      searchTerm: "elan",
      season: "summer",
      scentMood: "clean",
      sortBy: "featured",
      getMinPrice,
    });

    expect(result.map((p) => p.id)).toEqual([1]);
  });

  test("treats product season All as matching selected season", () => {
    const result = filterAndSortProducts({
      products,
      category: "All",
      season: "summer",
      scentMood: "clean",
      sortBy: "featured",
      getMinPrice,
    });

    expect(result.map((p) => p.id)).toEqual([2, 1]);
  });

  test("sorts rating with newest-id tie break", () => {
    const result = filterAndSortProducts({
      products,
      sortBy: "rating",
      getMinPrice,
    });

    expect(result.map((p) => p.id)).toEqual([3, 2, 1]);
  });

  test("sorts by price both directions", () => {
    expect(
      filterAndSortProducts({
        products,
        sortBy: "priceLow",
        getMinPrice,
      }).map((p) => p.id)
    ).toEqual([3, 2, 1]);

    expect(
      filterAndSortProducts({
        products,
        sortBy: "priceHigh",
        getMinPrice,
      }).map((p) => p.id)
    ).toEqual([1, 2, 3]);
  });

  test("preserves hero collection order for featured", () => {
    const result = filterAndSortProducts({
      products,
      heroCollectionFilter: [
        "one",
        "three",
      ],
      sortBy: "featured",
      getMinPrice,
    });

    expect(result.map((p) => p.id)).toEqual([1, 3]);
  });

  test("builds localized option collections and selected fallback", () => {
    const categories = getCategoryOptions("sr");
    const moods = getScentMoodOptions("en");

    expect(categories[0].label).toBe("Sve");
    expect(moods[0].label).toBe("All moods");
    expect(
      getSelectedOption(categories, "Niche").value
    ).toBe("Niche");
    expect(
      getSelectedOption(categories, "missing").value
    ).toBe("All");
  });

  test("builds season and sort options from translations", () => {
    const tr = {
      seasonAll: "Sve sezone",
      seasonSummer: "Leto",
      seasonWinter: "Zima",
      sortFeatured: "Istaknuto",
      sortRating: "Ocena",
      sortPriceLow: "Cena niska",
      sortPriceHigh: "Cena visoka",
      sortName: "Naziv",
    };

    expect(getSeasonOptions(tr)[1].label)
      .toBe("☀️ Leto");
    expect(getSortOptions(tr)[1].label)
      .toBe("★ Ocena");
  });

  test("derives total pages and page slice", () => {
    const items = Array.from(
      { length: 25 },
      (_, index) => ({ id: index + 1 })
    );

    expect(
      getPaginationData({
        filteredProducts: items,
        currentPage: 2,
        productsPerPage: 12,
      })
    ).toEqual({
      totalPages: 3,
      paginatedProducts: items.slice(12, 24),
    });
  });

  test("maps product image to thumbnail path", () => {
    expect(
      getProductThumbnail(
        "/products/test.png"
      )
    ).toBe("/products/thumbs/test.webp");
  });
});
