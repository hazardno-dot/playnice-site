import {
  getCartSummary,
  getOverlayVisibility,
  buildManagedShopUrl,
  getProductOriginView,
} from "./appStateDerivations";

describe("appStateDerivations", () => {
  test("derives cart totals and shipping below threshold", () => {
    expect(
      getCartSummary({
        cart: [
          {
            price: 10,
            quantity: 2,
          },
          {
            price: 5,
            quantity: 1,
          },
        ],
        freeShippingThreshold: 39,
        shippingCost: 4,
      })
    ).toEqual({
      cartCount: 3,
      subtotal: 25,
      shipping: 4,
      total: 29,
      amountLeftForFreeShipping: 14,
      freeShippingProgress:
        (25 / 39) * 100,
    });
  });

  test("gives free shipping at threshold and zero shipping for empty cart", () => {
    expect(
      getCartSummary({
        cart: [
          {
            price: 39,
            quantity: 1,
          },
        ],
        freeShippingThreshold: 39,
        shippingCost: 4,
      }).shipping
    ).toBe(0);

    expect(
      getCartSummary({
        cart: [],
        freeShippingThreshold: 39,
        shippingCost: 4,
      }).shipping
    ).toBe(0);
  });

  test("caps free shipping progress at 100", () => {
    expect(
      getCartSummary({
        cart: [
          {
            price: 50,
            quantity: 1,
          },
        ],
        freeShippingThreshold: 39,
        shippingCost: 4,
      }).freeShippingProgress
    ).toBe(100);
  });

  test("blocks sticky CTA when any blocking overlay is open", () => {
    expect(
      getOverlayVisibility({
        cartOpen: true,
        checkoutOpen: false,
        storyOpen: false,
        howItWorksOpen: false,
        faqOpen: false,
        privateSelectionOpen: false,
        catalogPreview: null,
        manifestoOpen: false,
        discoveryOpen: false,
        isHomeDiscoverySuspendedForProduct: false,
        discoveryBuilderOpen: false,
        view: "home",
      })
    ).toEqual({
      hasBlockingOverlay: true,
      showStickyCta: false,
    });
  });

  test("does not block for discovery suspended behind product", () => {
    expect(
      getOverlayVisibility({
        cartOpen: false,
        checkoutOpen: false,
        storyOpen: false,
        howItWorksOpen: false,
        faqOpen: false,
        privateSelectionOpen: false,
        catalogPreview: null,
        manifestoOpen: false,
        discoveryOpen: true,
        isHomeDiscoverySuspendedForProduct: true,
        discoveryBuilderOpen: false,
        view: "shop",
      })
    ).toEqual({
      hasBlockingOverlay: false,
      showStickyCta: true,
    });
  });

  test("preserves attribution query params while replacing managed shop params", () => {
    expect(
      buildManagedShopUrl({
        pathname: "/shop",
        search:
          "?utm_source=ig&category=Designer&page=4&gclid=abc",
        view: "shop",
        category: "Niche",
        searchTerm: "  naxos  ",
        season: "winter",
        scentMood: "rich",
        sortBy: "priceHigh",
        currentPage: 2,
      })
    ).toBe(
      "/shop?utm_source=ig&gclid=abc&category=Niche&search=naxos&season=winter&mood=rich&sort=priceHigh&page=2"
    );
  });

  test("removes managed params when shop state returns to defaults", () => {
    expect(
      buildManagedShopUrl({
        pathname: "/shop",
        search:
          "?category=Niche&page=3&utm_medium=social",
        view: "shop",
        category: "All",
        searchTerm: "",
        season: "All",
        scentMood: "All",
        sortBy: "featured",
        currentPage: 1,
      })
    ).toBe(
      "/shop?utm_medium=social"
    );
  });

  test("keeps legacy view query only on root path", () => {
    expect(
      buildManagedShopUrl({
        pathname: "/",
        search: "",
        view: "journal",
        category: "All",
        searchTerm: "",
        season: "All",
        scentMood: "All",
        sortBy: "featured",
        currentPage: 1,
      })
    ).toBe("/?view=journal");

    expect(
      buildManagedShopUrl({
        pathname: "/journal",
        search: "",
        view: "journal",
        category: "All",
        searchTerm: "",
        season: "All",
        scentMood: "All",
        sortBy: "featured",
        currentPage: 1,
      })
    ).toBe("/journal");
  });
  test("restores valid PDP origin views and falls back safely", () => {
    expect(
      getProductOriginView({
        productOriginView: "home",
      })
    ).toBe("home");

    expect(
      getProductOriginView({
        productOriginView: "journal",
      })
    ).toBe("journal");

    expect(
      getProductOriginView({
        productOriginView: "invalid",
      })
    ).toBe("shop");

    expect(
      getProductOriginView(null)
    ).toBe("shop");
  });
});
