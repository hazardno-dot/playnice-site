import {
  HERO_VIDEOS,
  FOREVER_ALOE_URL,
  getImpactProducts,
  buildSideRailAds,
  getSideRailVisibility,
  shouldShowBackToTopButton,
  getHeroManifestos,
} from "./homeContentDerivations";

describe("homeContentDerivations", () => {
  test("keeps the full hero video sequence", () => {
    expect(HERO_VIDEOS).toHaveLength(9);
    expect(HERO_VIDEOS[0])
      .toBe("/videos/hero.mp4");
    expect(HERO_VIDEOS[8])
      .toBe("/videos/hero8.mp4");
  });

  test("selects impact products in fixed id order", () => {
    const products = [
      { id: 11 },
      { id: 2 },
      { id: 5 },
      { id: 99 },
    ];

    expect(
      getImpactProducts(products)
        .map((product) => product.id)
    ).toEqual([2, 11, 5]);
  });

  test("builds localized side rail copy and keeps sponsor contract", () => {
    const ads =
      buildSideRailAds("sr");

    expect(ads[0]).toMatchObject({
      id: "forever-aloe-refresh",
      href: FOREVER_ALOE_URL,
      partner: "forever_living",
      sellerId: "360000920762",
      campaign: "aloe_drinks",
    });

    expect(ads[1].cta)
      .toBe("Otvori");
  });

  test("blocks side rails when an overlay is open", () => {
    const ads =
      buildSideRailAds("en");

    expect(
      getSideRailVisibility({
        view: "home",
        cartOpen: true,
        checkoutOpen: false,
        storyOpen: false,
        howItWorksOpen: false,
        privateSelectionOpen: false,
        catalogPreview: null,
        sideRailAds: ads,
      })
    ).toEqual({
      blocked: true,
      shouldShowSideRails: false,
      mobileSponsoredAd: ads[0],
      shouldShowMobileSponsoredAd: false,
    });
  });

  test("shows rails and mobile sponsor on supported view when unblocked", () => {
    const ads =
      buildSideRailAds("en");

    expect(
      getSideRailVisibility({
        view: "shop",
        cartOpen: false,
        checkoutOpen: false,
        storyOpen: false,
        howItWorksOpen: false,
        privateSelectionOpen: false,
        catalogPreview: null,
        sideRailAds: ads,
      })
    ).toEqual({
      blocked: false,
      shouldShowSideRails: true,
      mobileSponsoredAd: ads[0],
      shouldShowMobileSponsoredAd: true,
    });
  });


  test("suppresses rails while mobile PDP is active", () => {
    const ads =
      buildSideRailAds("en");

    expect(
      getSideRailVisibility({
        view: "shop",
        cartOpen: false,
        checkoutOpen: false,
        storyOpen: false,
        howItWorksOpen: false,
        privateSelectionOpen: false,
        catalogPreview: null,
        isMobileProductPageActive: true,
        sideRailAds: ads,
      })
    ).toEqual({
      blocked: false,
      shouldShowSideRails: false,
      mobileSponsoredAd: ads[0],
      shouldShowMobileSponsoredAd: false,
    });
  });

  test("keeps back-to-top available on an unblocked mobile PDP", () => {
    expect(
      shouldShowBackToTopButton({
        showBackToTop: true,
        sideRailBlocked: true,
        isMobileProductPageActive: true,
        hasBlockingOverlay: false,
      })
    ).toBe(true);

    expect(
      shouldShowBackToTopButton({
        showBackToTop: true,
        sideRailBlocked: true,
        isMobileProductPageActive: true,
        hasBlockingOverlay: true,
      })
    ).toBe(false);

    expect(
      shouldShowBackToTopButton({
        showBackToTop: false,
        sideRailBlocked: false,
        isMobileProductPageActive: true,
        hasBlockingOverlay: false,
      })
    ).toBe(false);
  });

  test("builds localized hero manifestos with current actions", () => {
    const sr =
      getHeroManifestos("sr");
    const en =
      getHeroManifestos("en");

    expect(
      sr["playnice-mission"]
        .action
    ).toBe("discovery");

    expect(
      sr.details.title
    ).toBe("Ne šaljemo samo pakete.");

    expect(
      en.confidence.cta
    ).toBe("Find your signature");
  });
});
