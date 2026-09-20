import {
  getMinPrice,
  getProductCopy,
  getInitialViewFromLocation,
  getJustInProducts,
  getNewProductsSignature,
  createJustInProductIdSet,
  isProductInIdSet,
  getInitialShopStateFromSearch,
} from "./shopBootstrapHelpers";

describe("shopBootstrapHelpers", () => {
  test("returns the lowest product size price", () => {
    expect(
      getMinPrice({
        sizes: {
          "2ml": 4,
          "5ml": 9,
          "10ml": 16,
        },
      })
    ).toBe(4);
  });

  test("builds localized product copy with existing fallbacks", () => {
    const fallback = {
      miniTag: { sr: "Fallback SR", en: "Fallback EN" },
      card: { sr: "Card SR", en: "Card EN" },
      modal: { sr: "Modal SR", en: "Modal EN" },
      scentType: { sr: "Type SR", en: "Type EN" },
      dominantNotes: { sr: "Notes SR", en: "Notes EN" },
      tags: { sr: ["tag-sr"], en: ["tag-en"] },
      whyChoose: { sr: "Why SR", en: "Why EN" },
    };

    const result = getProductCopy(
      { name: "Test" },
      "sr",
      {
        Test: {
          ...fallback,
          card: { en: "English card" },
        },
      },
      fallback
    );

    expect(result.card).toBe("English card");
    expect(result.modal).toBe("Modal SR");
  });

  test("resolves initial view from path before legacy query view", () => {
    expect(
      getInitialViewFromLocation({
        pathname: "/product/test",
        search: "?view=home",
      })
    ).toBe("shop");

    expect(
      getInitialViewFromLocation({
        pathname: "/",
        search: "?view=journal",
      })
    ).toBe("journal");

    expect(
      getInitialViewFromLocation({
        pathname: "/unknown",
        search: "",
      })
    ).toBe("home");
  });

  test("sorts Just In by addedAt then id and enforces limit", () => {
    const result = getJustInProducts(
      [
        {
          id: 1,
          addedAt: "2026-09-01",
        },
        {
          id: 2,
          addedAt: "2026-09-02",
        },
        {
          id: 3,
          addedAt: "2026-09-02",
        },
        {
          id: 4,
        },
      ],
      2
    );

    expect(result.map((item) => item.id)).toEqual([
      3,
      2,
    ]);
  });

  test("builds stable new-products signature and id set", () => {
    const items = [
      {
        id: 7,
        addedAt: "2026-09-02",
      },
      {
        id: 5,
        addedAt: "2026-09-01",
      },
    ];

    expect(
      getNewProductsSignature(items)
    ).toBe("7|5");

    const idSet =
      createJustInProductIdSet(items);

    expect(
      isProductInIdSet({ id: 7 }, idSet)
    ).toBe(true);

    expect(
      isProductInIdSet({ id: 8 }, idSet)
    ).toBe(false);
  });

  test("parses valid shop state and falls back invalid values", () => {
    expect(
      getInitialShopStateFromSearch(
        "?category=Niche&search=naxos&page=3&sort=priceHigh&season=winter&mood=rich"
      )
    ).toEqual({
      category: "Niche",
      searchTerm: "naxos",
      currentPage: 3,
      sortBy: "priceHigh",
      season: "winter",
      scentMood: "rich",
    });

    expect(
      getInitialShopStateFromSearch(
        "?category=Bad&page=-2&sort=bad&season=spring&mood=bad"
      )
    ).toEqual({
      category: "All",
      searchTerm: "",
      currentPage: 1,
      sortBy: "featured",
      season: "All",
      scentMood: "All",
    });
  });
});
