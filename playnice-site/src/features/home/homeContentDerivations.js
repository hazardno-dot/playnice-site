export const HERO_VIDEOS = [
  "/videos/hero.mp4",
  "/videos/hero1.mp4",
  "/videos/hero2.mp4",
  "/videos/hero3.mp4",
  "/videos/hero4.mp4",
  "/videos/hero5.mp4",
  "/videos/hero6.mp4",
  "/videos/hero7.mp4",
  "/videos/hero8.mp4",
];

export const FOREVER_ALOE_URL =
  "https://foreverliving.com/shop/scg/sr-Cyrl-RS/drinks?fboId=360000920762&categoryId=1&title=Napici";

export const getImpactProducts = (
  products = []
) =>
  [2, 11, 5]
    .map((id) =>
      products.find(
        (product) => product.id === id
      )
    )
    .filter(Boolean);

export const buildSideRailAds = (
  lang
) => [
  {
    id: "forever-aloe-refresh",
    side: "left",
    enabled: true,
    isSponsored: true,
    label: "SPONSORED",
    title: "Aloe Vera\nDrinks",
    text:
      lang === "sr"
        ? "Napici sa aloe verom iz Forever Living ponude. Pogledaj gel, berry, mango i druge favorite."
        : "Explore Forever Living aloe vera drinks. Discover gel, berry, mango and other favourites.",
    cta:
      lang === "sr"
        ? "Pogledaj"
        : "Explore",
    href: FOREVER_ALOE_URL,
    partner: "forever_living",
    sellerId: "360000920762",
    campaign: "aloe_drinks",
    logoSrc:
      "/partners/forever-logo.png",
    logoAlt: "Forever Living",
  },
  {
    id: "right-partner-placeholder",
    side: "right",
    enabled: true,
    icon: "♥",
    label: "FEATURED",
    title: "Private\nSelection",
    text:
      lang === "sr"
        ? "Sačuvaj favorite i napravi svoju mirisnu shortlistu."
        : "Save favourites and build your personal scent shortlist.",
    cta:
      lang === "sr"
        ? "Otvori"
        : "Open",
    action: "privateSelection",
  },
];

export const getSideRailVisibility = ({
  view,
  cartOpen,
  checkoutOpen,
  storyOpen,
  howItWorksOpen,
  privateSelectionOpen,
  catalogPreview,
  isMobileProductPageActive = false,
  sideRailAds = [],
}) => {
  const blocked =
    Boolean(cartOpen) ||
    Boolean(checkoutOpen) ||
    Boolean(storyOpen) ||
    Boolean(howItWorksOpen) ||
    Boolean(privateSelectionOpen) ||
    Boolean(catalogPreview);

  const onSupportedView =
    (view === "home" ||
      view === "shop") &&
    !isMobileProductPageActive;

  const mobileSponsoredAd =
    sideRailAds.find(
      (ad) =>
        ad.id ===
          "forever-aloe-refresh" &&
        ad.enabled
    );

  return {
    blocked,
    shouldShowSideRails:
      onSupportedView && !blocked,
    mobileSponsoredAd:
      mobileSponsoredAd || null,
    shouldShowMobileSponsoredAd:
      Boolean(mobileSponsoredAd) &&
      onSupportedView &&
      !blocked,
  };
};

export const getHeroManifestos = (
  lang
) => ({
  "playnice-mission": {
    kicker: "PLAYNICE MISSION",
    title:
      lang === "sr"
        ? "Ne prodajemo samo mirise."
        : "We do not just sell fragrances.",
    body:
      lang === "sr"
        ? [
            "Biramo trenutke koji ostaju na koži, u sećanju i u načinu na koji ulaziš u prostoriju.",
            "PlayNice postoji zbog jedne jednostavne ideje: da luksuz treba prvo doživeti — a tek onda kupiti.",
            "Try before you buy.",
            "Remember. PlayNice.",
          ]
        : [
            "We choose moments that stay on the skin, in memory, and in the way you enter a room.",
            "PlayNice exists because of one simple idea: luxury should be experienced first — and bought after.",
            "Try before you buy.",
            "Remember. PlayNice.",
          ],
    cta:
      lang === "sr"
        ? "Napravi svoj Discovery Set"
        : "Build your Discovery Set",
    action: "discovery",
  },

  details: {
    kicker: "PLAYNICE DETAILS",
    title:
      lang === "sr"
        ? "Ne šaljemo samo pakete."
        : "We do not just send packages.",
    body:
      lang === "sr"
        ? [
            "Svaka porudžbina prolazi kroz iste ruke koje biraju parfeme za kolekciju.",
            "Premium bočice. Poklon uzorci. Kartica zahvalnosti. Pakovanje koje izgleda kao poklon — čak i kada ga kupuješ sebi.",
            "Verujemo da luksuz ne počinje kada otvoriš parfem.",
            "Počinje kada otvoriš kutiju.",
            "Hvala što si deo PlayNice priče.",
          ]
        : [
            "Every order passes through the same hands that choose the fragrances for the collection.",
            "Premium bottles. Gift samples. A thank-you card. Packaging that feels like a gift — even when you are buying it for yourself.",
            "We believe luxury does not begin when you open the fragrance.",
            "It begins when you open the box.",
            "Thank you for being part of the PlayNice story.",
          ],
    cta:
      lang === "sr"
        ? "Otkrij kolekciju"
        : "Explore collection",
    action: "shop",
  },

  confidence: {
    kicker:
      "PLAYNICE CONFIDENCE",
    title:
      lang === "sr"
        ? "Neki parfemi mirišu dobro."
        : "Some fragrances smell good.",
    body:
      lang === "sr"
        ? [
            "Neki menjaju način na koji ulaziš u prostoriju.",
            "Ne kupujemo mirise samo zbog nota. Kupujemo ih zbog osećaja koji ostavljaju iza sebe.",
            "Samopouzdanje. Prisustvo. Karakter.",
            "Zato u PlayNice kolekciji nema stotine nasumičnih parfema.",
            "Samo oni koji ostavljaju utisak.",
            "Pronađi svoj potpis.",
          ]
        : [
            "Some change the way you enter a room.",
            "We do not choose fragrances only for their notes. We choose them for the feeling they leave behind.",
            "Confidence. Presence. Character.",
            "That is why the PlayNice collection is not filled with hundreds of random perfumes.",
            "Only the ones that leave an impression.",
            "Find your signature.",
          ],
    cta:
      lang === "sr"
        ? "Pronađi svoj potpis"
        : "Find your signature",
    action: "shop",
  },
});


export const shouldShowBackToTopButton = ({
  showBackToTop,
  sideRailBlocked,
  isMobileProductPageActive,
  hasBlockingOverlay,
}) =>
  Boolean(showBackToTop) &&
  (
    !Boolean(sideRailBlocked) ||
    (
      Boolean(isMobileProductPageActive) &&
      !Boolean(hasBlockingOverlay)
    )
  );
