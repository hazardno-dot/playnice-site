import {
  SMART_CTA_INITIAL_STATS,
  resolveSmartCtaVibe,
  incrementSmartCtaStats,
  buildStickyCtaData,
} from "./stickyCtaDerivations";

const tr = {
  stickyCheckout: "Checkout",
  stickyItem: "item",
  stickyItems: "items",
  stickySaved: "Saved",
  stickyExplore: "Explore",
  privateSelection: "Private Selection",
};

describe("sticky CTA derivations", () => {
  test("tracks only known moods", () => {
    const next = incrementSmartCtaStats(
      SMART_CTA_INITIAL_STATS,
      ["clean", "soft", "unknown"]
    );

    expect(next.clean).toBe(1);
    expect(next.soft).toBe(1);
    expect(next.unknown).toBeUndefined();
  });

  test("resolves vibe by existing priority rules", () => {
    expect(
      resolveSmartCtaVibe({
        stats: {
          ...SMART_CTA_INITIAL_STATS,
          summer: 3,
          rich: 5,
        },
        cartCount: 0,
        wishlistCount: 0,
      })
    ).toBe("summer");

    expect(
      resolveSmartCtaVibe({
        stats: {
          ...SMART_CTA_INITIAL_STATS,
          clean: 2,
        },
        cartCount: 1,
        wishlistCount: 0,
      })
    ).toBeNull();
  });

  test("prioritizes checkout CTA when cart has items", () => {
    const onCheckout = jest.fn();

    const result = buildStickyCtaData({
      cartCount: 2,
      total: 18,
      wishlistCount: 3,
      view: "shop",
      filteredProductsCount: 50,
      tr,
      lang: "en",
      smartCtaVibe: "summer",
      formatPrice: (value) => `€${Number(value).toFixed(2)}`,
      onCheckout,
      onOpenPrivateSelection: jest.fn(),
      onSmartClick: jest.fn(),
    });

    expect(result.label).toBe("Checkout");
    expect(result.sublabel).toBe("2 items • €18.00");
    expect(result.onClick).toBe(onCheckout);
  });

  test("uses saved CTA in shop when wishlist has items", () => {
    const onOpenPrivateSelection = jest.fn();

    const result = buildStickyCtaData({
      cartCount: 0,
      total: 0,
      wishlistCount: 1,
      view: "shop",
      filteredProductsCount: 50,
      tr,
      lang: "en",
      smartCtaVibe: null,
      formatPrice: String,
      onCheckout: jest.fn(),
      onOpenPrivateSelection,
      onSmartClick: jest.fn(),
    });

    expect(result.label).toBe("Saved");
    expect(result.sublabel).toBe("1 item");
    expect(result.onClick).toBe(onOpenPrivateSelection);
  });

  test("uses smart copy and forwards its mood id", () => {
    const onSmartClick = jest.fn();

    const result = buildStickyCtaData({
      cartCount: 0,
      total: 0,
      wishlistCount: 0,
      view: "home",
      filteredProductsCount: 50,
      tr,
      lang: "sr",
      smartCtaVibe: "date",
      formatPrice: String,
      onCheckout: jest.fn(),
      onOpenPrivateSelection: jest.fn(),
      onSmartClick,
    });

    expect(result.label).toBe("Nešto za veče?");

    result.onClick();
    expect(onSmartClick).toHaveBeenCalledWith("date");
  });
});
