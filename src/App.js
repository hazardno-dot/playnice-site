import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from "react";
import "./App.css";
import { trackPageView, trackEvent, trackMeta } from "./lib/ga";
import { journalArticles } from "./data/journal";
import { categoryLabels, products } from "./data/products";
import { productCopy, fallbackCopy } from "./data/products/productCopy";
import { productWearContext } from "./data/products/productWearContext";
import { translations } from "./data/translations";

const JOURNAL_SEEN_KEY = "playnice_latest_journal_seen_v1";

const slugifyProduct = (name = "") =>
  name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/* =========================================
   SEO HELPERS
========================================= */
const SITE_BASE_URL = "https://www.playniceshop.me";

const cleanSeoProductName = (name = "") =>
  String(name)
    .replace(/\s+NEW\s*$/i, "")
    .replace(/\s+/g, " ")
    .trim();

const getProductSlug = (product) => {
  if (!product) return "";

  if (product.slug) {
    return String(product.slug)
      .replace(/^\/+|\/+$/g, "")
      .trim();
  }

  return String(product.name || "")
    .replace(/\s+NEW\s*$/i, "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .trim();
};

const getProductUrl = (product) => {
  const slug = getProductSlug(product);

  if (!slug) return "/shop";

  return `/product/${slug}`;
};

const getSeoProductUrl = (product) => {
  const url = getProductUrl(product);

  if (!url) return SITE_BASE_URL;

  if (url.startsWith("http")) return url;

  return `${SITE_BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
};

const getProductFromCurrentUrl = () => {
  const path = window.location.pathname;
  const match = path.match(/^\/product\/([^/]+)$/);

  if (!match?.[1]) return null;

  const slugFromUrl = decodeURIComponent(match[1]);

  return (
    products.find((product) => getProductSlug(product) === slugFromUrl) ||
    null
  );
};

const getSeoProductImage = (product) => {
  if (!product?.image) return `${SITE_BASE_URL}/og-image.jpg`;

  if (product.image.startsWith("http")) return product.image;

  return `${SITE_BASE_URL}${product.image}`;
};

const getSeoProductSizes = (product) =>
  product?.sizes ? Object.keys(product.sizes) : [];

const getSeoProductPrices = (product) =>
  product?.sizes ? Object.values(product.sizes).filter(Boolean) : [];

const getSeoLowestPrice = (product) => {
  const prices = getSeoProductPrices(product);

  if (!prices.length) return null;

  return Math.min(...prices);
};

const getSeoCategoryLabel = (category, lang = "sr") => {
  const labels = {
    Arabian: {
      sr: "arapski parfem",
      en: "Arabian fragrance"
    },
    Designer: {
      sr: "dizajnerski parfem",
      en: "designer fragrance"
    },
    Niche: {
      sr: "niche parfem",
      en: "niche fragrance"
    }
  };

  return labels?.[category]?.[lang] || (lang === "en" ? "fragrance" : "parfem");
};

const getSeoSeasonText = (season, lang = "sr") => {
  const labels = {
    summer: {
      sr: "Posebno dobar izbor za toplije dane.",
      en: "Especially suited for warmer days."
    },
    winter: {
      sr: "Posebno dobar izbor za hladnije dane.",
      en: "Especially suited for colder days."
    },
    all: {
      sr: "Lako nosiv tokom cijele godine.",
      en: "Easy to wear all year round."
    },
    spring: {
      sr: "Odličan izbor za proljeće.",
      en: "A great choice for spring."
    },
    autumn: {
      sr: "Odličan izbor za jesen.",
      en: "A great choice for autumn."
    }
  };

  return labels?.[season]?.[lang] || "";
};

const getSeoProductCopy = (product, lang = "sr") => {
  const cleanName = cleanSeoProductName(product?.name);
  const directCopy = productCopy?.[cleanName];
  const fallbackProductCopy = productCopy?.[product?.name];

  const copy = directCopy || fallbackProductCopy;

  if (copy?.modal?.[lang]) return copy.modal[lang];
  if (copy?.card?.[lang]) return copy.card[lang];

  return "";
};

const getProductSeoTitle = (product, lang = "sr") => {
  const name = cleanSeoProductName(product?.name);

  if (lang === "en") {
    return `${name} decants | Try before you buy | PlayNice`;
  }

  return `${name} dekanti | Probaj prije kupovine | PlayNice`;
};

const getProductSeoDescription = (product, lang = "sr") => {
  const name = cleanSeoProductName(product?.name);
  const category = getSeoCategoryLabel(product?.category, lang);
  const sizes = getSeoProductSizes(product);
  const sizeText = sizes.length
    ? sizes.join(", ")
    : lang === "en"
    ? "decants"
    : "dekantima";
  const lowestPrice = getSeoLowestPrice(product);
  const productCopyText = getSeoProductCopy(product, lang);
  const seasonText = getSeoSeasonText(product?.season, lang);

  if (lang === "en") {
    return [
      `${name} is available at PlayNice as ${getEnglishArticle(
        category
      )} ${category} in ${sizeText} sizes${
        lowestPrice ? ` from €${lowestPrice}` : ""
      }.`,
      productCopyText,
      seasonText,
      "Try before you buy, with delivery across Montenegro and payment on delivery."
    ]
      .filter(Boolean)
      .join(" ");
  }

  return [
    `${name} je dostupan u PlayNice ponudi kao ${category} u ${sizeText} dekantima${
      lowestPrice ? ` već od €${lowestPrice}` : ""
    }.`,
    productCopyText,
    seasonText,
    "Probaj parfem prije kupovine cijele bočice, uz dostavu širom Crne Gore i plaćanje pouzećem."
  ]
    .filter(Boolean)
    .join(" ");
};

const getProductMetaDescription = (product, lang = "sr") => {
  const description = getProductSeoDescription(product, lang);

  if (description.length <= 160) return description;

  return `${description.slice(0, 157).trim()}...`;
};

/* =========================================
   ARABIAN FRAGRANCE "AN" HELPER
========================================= */
const getEnglishArticle = (text = "") => {
  const firstLetter = String(text).trim().charAt(0).toLowerCase();

  return ["a", "e", "i", "o", "u"].includes(firstLetter) ? "an" : "a";
};

/* =========================================
   JSON-LD HELPER
========================================= */
const getProductStructuredData = (product, lang = "sr") => {
  if (!product) return null;

  const name = cleanSeoProductName(product.name);
  const productUrl = getSeoProductUrl(product);
  const imageUrl = getSeoProductImage(product);
  const description = getProductSeoDescription(product, lang);
  const sizes = product?.sizes || {};

  const shippingDetails = {
    "@type": "OfferShippingDetails",
    shippingRate: {
      "@type": "MonetaryAmount",
      value: 4,
      currency: "EUR"
    },
    shippingDestination: {
      "@type": "DefinedRegion",
      addressCountry: "ME"
    },
    deliveryTime: {
      "@type": "ShippingDeliveryTime",
      handlingTime: {
        "@type": "QuantitativeValue",
        minValue: 0,
        maxValue: 1,
        unitCode: "DAY"
      },
      transitTime: {
        "@type": "QuantitativeValue",
        minValue: 1,
        maxValue: 3,
        unitCode: "DAY"
      }
    }
  };

  const hasMerchantReturnPolicy = {
    "@type": "MerchantReturnPolicy",
    applicableCountry: "ME",
    returnPolicyCountry: "ME",
    returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
    merchantReturnDays: 14,
    itemCondition: [
      "https://schema.org/NewCondition",
      "https://schema.org/DamagedCondition"
    ],
    returnMethod: "https://schema.org/ReturnByMail",
    returnFees: "https://schema.org/ReturnFeesCustomerResponsibility",
    refundType: "https://schema.org/FullRefund"
  };

  const offers = Object.entries(sizes)
    .filter(([, price]) => price)
    .map(([size, price]) => ({
      "@type": "Offer",
      url: productUrl,
      name: `${name} ${size} decant`,
      priceCurrency: "EUR",
      price: String(price),
      priceValidUntil: "2026-12-31",
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      shippingDetails,
      hasMerchantReturnPolicy,
      seller: {
        "@type": "Organization",
        name: "PlayNice",
        url: SITE_BASE_URL
      }
    }));

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    image: [imageUrl],
    description,
    sku: String(product.id || getProductSlug(product)),
    category: product.category || "Fragrance",
    url: productUrl,
    brand: {
      "@type": "Brand",
      name: name.split(" ")[0]
    },
    offers
  };
};

/* =========================================
   GLOBAL CONSTANTS & HELPERS
========================================= */
const PRODUCTS_PER_PAGE = 24;
const SHIPPING_COST = 4.0;
const FREE_SHIPPING_THRESHOLD = 39;

function formatPrice(value) {
  return `€${Number(value).toFixed(2)}`;
}

function getMinPrice(product) {
  return Math.min(...Object.values(product.sizes));
}

function safeReadLocalStorage(key, fallback) {
  if (typeof window === "undefined") return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function smoothScrollToTop() {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: "smooth"
  });
}

function getDefaultLanguage() {
  if (typeof window === "undefined") return "sr";

  const savedLang = window.localStorage.getItem("playnice_lang");

  if (savedLang === "sr" || savedLang === "en") return savedLang;

  const browserLang = (window.navigator.language || "").toLowerCase();

  if (
    browserLang.startsWith("sr") ||
    browserLang.startsWith("hr") ||
    browserLang.startsWith("bs") ||
    browserLang.startsWith("me")
  ) {
    return "sr";
  }

  return "en";
}

function getFallbackDescription(product, lang) {
  const map = {
    sr: {
      Arabian:
        "Pažljivo odabran arapski parfem sa izraženim karakterom, odličnim odnosom cene i utiska, i idealan za otkrivanje kroz decant format.",
      Designer:
        "Pažljivo odabran dizajnerski parfem sa premium karakterom, elegantnim nastupom i odličnom prilikom da ga prvo testiraš kroz decant format.",
      Niche:
        "Pažljivo odabran niche parfem sa luksuznim karakterom, dubinom i izraženim signature potencijalom.",
      Summer:
        "Svetao, svež i dopadljiv parfem idealan za toplije dane, odmor i lagano nošenje."
    },
    en: {
      Arabian:
        "A carefully selected Arabian fragrance with strong character, excellent value and an ideal profile for discovery through decant format.",
      Designer:
        "A carefully selected designer fragrance with premium character, refined presence and a perfect profile to discover through decant format.",
      Niche:
        "A carefully selected niche fragrance with luxurious character, depth and strong signature potential.",
      Summer:
        "A bright, fresh and easy-to-love fragrance ideal for warm weather, holidays and effortless wear."
    }
  };

  return map[lang]?.[product.category] || map.en.Designer;
}

function getFallbackVibe(product, lang) {
  const map = {
    sr: {
      Arabian: "Karakter • Value • Upečatljiv trag",
      Designer: "Elegantno • Dopadljivo • Premium osećaj",
      Niche: "Luksuz • Dubina • Signature potencijal",
      Summer: "Sveže • Svetlo • Letnji vajb"
    },
    en: {
      Arabian: "Character • Value • Strong trail",
      Designer: "Elegant • Appealing • Premium feel",
      Niche: "Luxury • Depth • Signature potential",
      Summer: "Fresh • Bright • Summer mood"
    }
  };

  return map[lang]?.[product.category] || map.en.Designer;
}

function getProductCopy(product, lang) {
  const copy = productCopy[product.name] || fallbackCopy;

  return {
    miniTag:
      copy.miniTag?.[lang] ||
      copy.miniTag?.en ||
      fallbackCopy.miniTag[lang],
    card: copy.card?.[lang] || copy.card?.en || fallbackCopy.card[lang],
    modal: copy.modal?.[lang] || copy.modal?.en || fallbackCopy.modal[lang],
    scentType:
      copy.scentType?.[lang] ||
      copy.scentType?.en ||
      fallbackCopy.scentType[lang],
    dominantNotes:
      copy.dominantNotes?.[lang] ||
      copy.dominantNotes?.en ||
      fallbackCopy.dominantNotes[lang],
    tags: copy.tags?.[lang] || copy.tags?.en || fallbackCopy.tags[lang],
    whyChoose:
      copy.whyChoose?.[lang] ||
      copy.whyChoose?.en ||
      fallbackCopy.whyChoose[lang]
  };
}

const getJournalText = (field, lang) => {
  if (!field) return "";

  if (typeof field === "string") return field;

  if (typeof field === "object") {
    return field[lang] || field.en || field.sr || "";
  }

  return "";
};

const getJournalAvatarLetter = (lang) => (lang === "sr" ? "Č" : "C");

const getRelatedJournalProducts = (article) => {
  if (!article?.relatedProducts?.length) return [];

  return article.relatedProducts
    .map((relatedName) =>
      products.find(
        (product) =>
          product.name?.trim().toLowerCase() ===
          relatedName.trim().toLowerCase()
      )
    )
    .filter(Boolean);
};

const getJournalArticleKey = (article) => {
  if (!article) return "";

  return (
    article.id ||
    article.slug ||
    article.title?.en ||
    article.title?.sr ||
    article.title ||
    ""
  );
};

const getInitialView = () => {
  if (typeof window === "undefined") return "home";

  const path = window.location.pathname;

  if (path === "/shop") return "shop";
  if (path === "/journal") return "journal";
  if (path.startsWith("/product/")) return "shop";

  const params = new URLSearchParams(window.location.search);
  const urlView = params.get("view");

  return ["home", "shop", "journal"].includes(urlView)
    ? urlView
    : "home";
};

const createProductSlug = (name = "") => {
  return String(name)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const BASE_HERO_SLIDES = [
  {
    id: 1,
    kind: "imageOnly",
    image: "/hero/slide-1-fix.jpg",
    desktopImage: "/hero/slide-1-fix.jpg",
    mobileImage: "/hero/mobile/slide-1-mobile.jpg",
    alt: "New In / Best of the Best",
    actionPrimary: "shop"
  },
  {
    id: 2,
    kind: "imageOnly",
    image: "/hero/slide-2.jpg",
    desktopImage: "/hero/slide-2.jpg",
    mobileImage: "/hero/mobile/slide-2-mobile.jpg",
    alt: "PlayNice – luxury fragrance experience and trust",
    actionPrimary: "shop"
  },
  {
    id: 3,
    kind: "imageOnly",
    image: "/hero/slide-3.jpg",
    desktopImage: "/hero/slide-3.jpg",
    mobileImage: "/hero/mobile/slide-3-mobile.jpg",
    alt: "Proleće-leto sezona",
    actionPrimary: "shop"
  },
  {
    id: 4,
    kind: "imageOnly",
    image: "/hero/slide-4.jpg",
    desktopImage: "/hero/slide-4.jpg",
    mobileImage: "/hero/mobile/slide-4-mobile.jpg",
    alt: "PlayNice Private Selection – trusted premium decants",
    actionPrimary: "shop"
  },
  {
    id: 5,
    kind: "imageOnly",
    image: "/hero/slide-5.jpg",
    desktopImage: "/hero/slide-5.jpg",
    mobileImage: "/hero/mobile/slide-5-mobile.jpg",
    alt: "Try before you buy / dekanti",
    actionPrimary: "shop"
  },
  {
    id: 6,
    kind: "imageOnly",
    image: "/hero/slide-6.jpg",
    desktopImage: "/hero/slide-6.jpg",
    mobileImage: "/hero/mobile/slide-6-mobile.jpg",
    alt: "PlayNice – Try it first",
    actionPrimary: "shop"
  },
  {
    id: 7,
    kind: "imageOnly",
    image: "/hero/slide-7.jpg",
    desktopImage: "/hero/slide-7.jpg",
    mobileImage: "/hero/mobile/slide-7-mobile.jpg",
    alt: "Optional: special action, drop ili limited stock",
    actionPrimary: "shop"
  }
];

const shuffleHeroSlides = (slides) => {
  const shuffled = [...slides];

  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const randomIndex = Math.floor(Math.random() * (i + 1));

    [shuffled[i], shuffled[randomIndex]] = [
      shuffled[randomIndex],
      shuffled[i]
    ];
  }

  return shuffled;
};

/* =========================================
   SHOP_NEW_PRODUCTS_SEEN_KEY
========================================= */
const SHOP_NEW_PRODUCTS_SEEN_KEY = "playnice_seen_new_products_signature";

const getNewProductsSignature = (items = []) => {
  return items
    .filter((product) => product.isNew)
    .map((product) => String(product.id))
    .sort()
    .join("|");
};

/* =========================================
   APP
========================================= */
function App() {
  /* =========================================
     APP STATE
  ========================================= */
  const [lang, setLang] = useState(() => getDefaultLanguage());
  const [view, setView] = useState(() => getInitialView());
  const [category, setCategory] = useState("All");
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const [seasonMenuOpen, setSeasonMenuOpen] = useState(false);
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [addedFeedback, setAddedFeedback] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [cart, setCart] = useState([]);
  const [selectedSize, setSelectedSize] = useState("");
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderSuccessMessage, setOrderSuccessMessage] = useState("");

  const [storyOpen, setStoryOpen] = useState(false);
  const [inlineAddedKey, setInlineAddedKey] = useState(null);
  const [catalogPreview, setCatalogPreview] = useState(null);
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);

  const [sortBy, setSortBy] = useState("featured");
  const [season, setSeason] = useState("All");
  const [privateSelectionOpen, setPrivateSelectionOpen] = useState(false);
  const [closingVisible, setClosingVisible] = useState(false);

  const [currentHero, setCurrentHero] = useState(0);
  const [heroPaused, setHeroPaused] = useState(false);
  const [showStickyCta, setShowStickyCta] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(0);

  const [productModalVisible, setProductModalVisible] = useState(false);
  const [modalAddedKey, setModalAddedKey] = useState(null);
  const modalAddedTimeoutRef = useRef(null);

  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const newProductsSignature = useMemo(() => {
    return getNewProductsSignature(products);
  }, []);

  const [hasNewShopProducts, setHasNewShopProducts] = useState(() => {
    if (typeof window === "undefined") return false;

    const currentSignature = getNewProductsSignature(products);

    if (!currentSignature) return false;

    return (
      localStorage.getItem(SHOP_NEW_PRODUCTS_SEEN_KEY) !== currentSignature
    );
  });

  const [wishlist, setWishlist] = useState(() =>
    safeReadLocalStorage("playnice_wishlist", [])
  );

  const [sprayingWishlistId, setSprayingWishlistId] = useState(null);

  const [checkoutForm, setCheckoutForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    country: "ME",
    city: "",
    address: "",
    note: ""
  });

  const checkoutCountryOptions = [
    { value: "ME", sr: "Crna Gora", en: "Montenegro" },
    { value: "RS", sr: "Srbija", en: "Serbia" },
    { value: "BA", sr: "Bosna i Hercegovina", en: "Bosnia and Herzegovina" },
    { value: "HR", sr: "Hrvatska", en: "Croatia" },
    { value: "SI", sr: "Slovenija", en: "Slovenia" },
    { value: "MK", sr: "Severna Makedonija", en: "North Macedonia" },
    { value: "AL", sr: "Albanija", en: "Albania" },
    { value: "XK", sr: "Kosovo", en: "Kosovo" },
    { value: "OTHER", sr: "Druga zemlja", en: "Other country" }
  ];

  const selectedCheckoutCountry =
    checkoutCountryOptions.find(
      (country) => country.value === checkoutForm.country
    ) || checkoutCountryOptions[0];

  const selectedCheckoutCountryLabel =
    lang === "sr" ? selectedCheckoutCountry.sr : selectedCheckoutCountry.en;

  const isMontenegroOrder = checkoutForm.country === "ME";

  const isInternationalEnquiry =
    checkoutForm.country && checkoutForm.country !== "ME";

  const [hasUserPickedSize, setHasUserPickedSize] = useState(false);
  const [journalOpen, setJournalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);

  const [seenLatestJournalKey, setSeenLatestJournalKey] = useState(() => {
    if (typeof window === "undefined") return "";

    try {
      return localStorage.getItem(JOURNAL_SEEN_KEY) || "";
    } catch {
      return "";
    }
  });

  const [journalFeedback, setJournalFeedback] = useState({});
  const [journalFeedbackSubmitted, setJournalFeedbackSubmitted] =
    useState(false);
  const [journalVoteSuccess, setJournalVoteSuccess] = useState("");
  const [journalFeedbackSuccess, setJournalFeedbackSuccess] = useState(false);

  /* =========================================
     APP REFS
  ========================================= */
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const productModalScrollYRef = useRef(0);
  const productModalCloseTimeoutRef = useRef(null);

  /* =========================================
     DERIVED TRANSLATIONS / STATIC ARRAYS
  ========================================= */
  const tr = translations[lang];

  const heroVideos = [
    "/videos/hero.mp4",
    "/videos/hero1.mp4",
    "/videos/hero2.mp4",
    "/videos/hero3.mp4",
    "/videos/hero4.mp4",
    "/videos/hero5.mp4"
  ];

  const heroSlides = useMemo(() => {
    const [fixedFirstSlide, ...randomSlides] = BASE_HERO_SLIDES;

    return [fixedFirstSlide, ...shuffleHeroSlides(randomSlides)];
  }, []);

  const categories = useMemo(
    () => ["All", "Arabian", "Designer", "Niche"],
    []
  );

  const impactProducts = useMemo(
    () =>
      [2, 11, 5]
        .map((id) => products.find((product) => product.id === id))
        .filter(Boolean),
    []
  );

  const filteredProducts = useMemo(() => {
    const result = products.filter((product) => {
      const categoryMatch =
        category === "All" || product.category === category;

      const searchMatch = product.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const selectedSeason = String(season || "").toLowerCase();
      const productSeason = String(product.season || "").toLowerCase();

      const seasonMatch =
        selectedSeason === "all" ||
        productSeason === "all" ||
        productSeason === selectedSeason;

      return categoryMatch && searchMatch && seasonMatch;
    });

    switch (sortBy) {
      case "rating":
        return [...result].sort((a, b) => b.rating - a.rating);

      case "priceLow":
        return [...result].sort((a, b) => getMinPrice(a) - getMinPrice(b));

      case "priceHigh":
        return [...result].sort((a, b) => getMinPrice(b) - getMinPrice(a));

      case "name":
        return [...result].sort((a, b) => a.name.localeCompare(b.name));

      case "featured":
      default:
        return result;
    }
  }, [category, searchTerm, season, sortBy]);

  const categoryOptions = [
    {
      value: "All",
      label: lang === "sr" ? "Sve" : "All"
    },
    {
      value: "Arabian",
      label: lang === "sr" ? "Arapski" : "Arabian"
    },
    {
      value: "Designer",
      label: lang === "sr" ? "Dizajner" : "Designer"
    },
    {
      value: "Niche",
      label: "Niche"
    }
  ];

  const selectedCategory =
    categoryOptions.find((option) => option.value === category) ||
    categoryOptions[0];

  /* =========================================
     SIDE RAILS ADS
  ========================================= */
  const foreverAloeUrl =
    "https://foreverliving.com/shop/scg/sr-Cyrl-RS/drinks?fboId=360000920762&categoryId=1&title=Napici";

  const sideRailAds = [
    {
      id: "forever-aloe-refresh",
      side: "left",
      enabled: true,
      isSponsored: true,
      label: "SPONSORED",
      title: lang === "sr" ? "Aloe Vera\nDrinks" : "Aloe Vera\nDrinks",
      text:
        lang === "sr"
          ? "Napici sa aloe verom iz Forever Living ponude. Pogledaj gel, berry, mango i druge favorite."
          : "Explore Forever Living aloe vera drinks. Discover gel, berry, mango and other favourites.",
      cta: lang === "sr" ? "Pogledaj" : "Explore",
      href: foreverAloeUrl,
      partner: "forever_living",
      sellerId: "360000920762",
      campaign: "aloe_drinks",
      logoSrc: "/partners/forever-logo.png",
      logoAlt: "Forever Living"
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
      cta: lang === "sr" ? "Otvori" : "Open",
      action: "privateSelection"
    }
  ];

  const sideRailBlocked =
    cartOpen ||
    checkoutOpen ||
    storyOpen ||
    howItWorksOpen ||
    privateSelectionOpen ||
    journalOpen ||
    Boolean(selectedArticle) ||
    productModalVisible;

  const shouldShowSideRails =
    (view === "home" || view === "shop") && !sideRailBlocked;

  const mobileSponsoredAd = sideRailAds.find(
    (ad) => ad.id === "forever-aloe-refresh" && ad.enabled
  );

  const shouldShowMobileSponsoredAd =
    Boolean(mobileSponsoredAd) &&
    (view === "home" || view === "shop") &&
    !sideRailBlocked;

  const handleSideRailAction = (ad) => {
    if (ad.href) {
      return;
    }

    if (ad.action === "shop") {
      setView("shop");
      setCurrentPage(1);

      window.setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 0);

      return;
    }

    if (ad.action === "privateSelection") {
      setPrivateSelectionOpen(true);
    }
  };

  const handleSponsoredAdClick = (ad, placement) => {
    if (typeof trackEvent !== "function") return;

    trackEvent("sponsored_ad_click", {
      partner: ad?.partner || "forever_living",
      sellerId: ad?.sellerId || "360000920762",
      campaign: ad?.campaign || "aloe_drinks",
      placement,
      lang,
      view
    });
  };

  /* =========================================
     SEASON / SORT OPTIONS
  ========================================= */
  const seasonOptions = [
    {
      value: "All",
      label: tr.seasonAll
    },
    {
      value: "summer",
      label: `☀️ ${tr.seasonSummer}`
    },
    {
      value: "winter",
      label: `❄️ ${tr.seasonWinter}`
    }
  ];

  const sortOptions = [
    {
      value: "featured",
      label: tr.sortFeatured
    },
    {
      value: "rating",
      label: `★ ${tr.sortRating}`
    },
    {
      value: "priceLow",
      label: `↗ ${tr.sortPriceLow}`
    },
    {
      value: "priceHigh",
      label: `↘ ${tr.sortPriceHigh}`
    },
    {
      value: "name",
      label: tr.sortName
    }
  ];

  const selectedSeasonOption =
    seasonOptions.find((option) => option.value === season) ||
    seasonOptions[0];

  const selectedSortOption =
    sortOptions.find((option) => option.value === sortBy) ||
    sortOptions[0];

  /* =========================================
     TOTAL PAGES / CART TOTALS
  ========================================= */
  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE)
  );

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * PRODUCTS_PER_PAGE;

    return filteredProducts.slice(start, start + PRODUCTS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  const shipping =
    cart.length === 0
      ? 0
      : subtotal >= FREE_SHIPPING_THRESHOLD
      ? 0
      : SHIPPING_COST;

  const total = subtotal + shipping;

  const amountLeftForFreeShipping = Math.max(
    0,
    FREE_SHIPPING_THRESHOLD - subtotal
  );

  const scrollYRef = useRef(0);

  /* =========================================
     EFFECTS
  ========================================= */
  useLayoutEffect(() => {
    const shouldLockScroll =
      !!selectedProduct ||
      cartOpen ||
      checkoutOpen ||
      storyOpen ||
      howItWorksOpen ||
      privateSelectionOpen ||
      journalOpen ||
      !!selectedArticle ||
      !!catalogPreview;

    const body = document.body;

    if (shouldLockScroll) {
      const lockY = window.scrollY || window.pageYOffset || 0;

      scrollYRef.current = lockY;

      body.style.position = "fixed";
      body.style.top = `-${lockY}px`;
      body.style.left = "0";
      body.style.right = "0";
      body.style.width = "100%";
      body.style.overflow = "hidden";
    } else {
      const savedScrollY = Math.abs(parseInt(body.style.top || "0", 10));

      body.style.position = "";
      body.style.top = "";
      body.style.left = "";
      body.style.right = "";
      body.style.width = "";
      body.style.overflow = "";

      window.scrollTo(0, savedScrollY || scrollYRef.current || 0);
    }

    return () => {
      body.style.position = "";
      body.style.top = "";
      body.style.left = "";
      body.style.right = "";
      body.style.width = "";
      body.style.overflow = "";
    };
  }, [
    selectedProduct,
    cartOpen,
    checkoutOpen,
    storyOpen,
    howItWorksOpen,
    privateSelectionOpen,
    journalOpen,
    selectedArticle,
    catalogPreview
  ]);

  useEffect(() => {
    const section = document.querySelector(".closing-section");

    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setClosingVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -20px 0px"
      }
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    window.localStorage.setItem("playnice_lang", lang);
  }, [lang]);

  useEffect(() => {
    if (window.location.pathname.startsWith("/product/")) {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const urlView = params.get("view");
    const urlCategory = params.get("category");
    const urlSearch = params.get("search");
    const urlPage = params.get("page");
    const urlSort = params.get("sort");
    const urlSeason = params.get("season");

    if (urlView && ["home", "shop", "journal"].includes(urlView)) {
      setView(urlView);
    }

    if (urlCategory && categories.includes(urlCategory)) {
      setCategory(urlCategory);
    }

    if (urlSearch) {
      setSearchTerm(urlSearch);
    }

    if (urlPage && !Number.isNaN(Number(urlPage))) {
      setCurrentPage(Number(urlPage));
    }

    if (
      urlSort &&
      ["featured", "rating", "priceLow", "priceHigh", "name"].includes(urlSort)
    ) {
      setSortBy(urlSort);
    }

    if (urlSeason && ["All", "summer", "winter"].includes(urlSeason)) {
      setSeason(urlSeason);
    }
  }, [categories]);

  useEffect(() => {
    if (window.location.pathname.startsWith("/product/")) {
      return;
    }

    const params = new URLSearchParams();

    params.set("view", view);

    if (category !== "All") params.set("category", category);
    if (searchTerm.trim()) params.set("search", searchTerm.trim());
    if (season !== "All") params.set("season", season);
    if (sortBy !== "featured") params.set("sort", sortBy);
    if (currentPage > 1) params.set("page", String(currentPage));

    const query = params.toString();

    const nextUrl = query
      ? `${window.location.pathname}?${query}`
      : window.location.pathname;

    const currentUrl = `${window.location.pathname}${window.location.search}`;

    if (currentUrl !== nextUrl) {
      window.history.replaceState({}, "", nextUrl);
    }
  }, [view, category, searchTerm, season, sortBy, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [category, searchTerm, season, sortBy]);

  useEffect(() => {
    if (!addedFeedback) return;

    const timer = setTimeout(() => setAddedFeedback(""), 1200);

    return () => clearTimeout(timer);
  }, [addedFeedback]);

  useEffect(() => {
    if (!orderSuccessMessage) return;

    const timer = setTimeout(() => setOrderSuccessMessage(""), 2200);

    return () => clearTimeout(timer);
  }, [orderSuccessMessage]);

  useEffect(() => {
    if (selectedProduct) {
      const firstSize = Object.keys(selectedProduct.sizes)[0];

      setSelectedSize(firstSize);
    } else {
      setSelectedSize("");
    }
  }, [selectedProduct]);

  useEffect(() => {
    if (heroPaused || heroSlides.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentHero((prev) => (prev + 1) % heroSlides.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [heroPaused, heroSlides.length]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    const path = window.location.pathname + window.location.search;

    trackPageView(path || "/");
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        document.body.classList.add("scrolled");
      } else {
        document.body.classList.remove("scrolled");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
  const hasBlockingLayer =
    !!selectedProduct ||
    cartOpen ||
    checkoutOpen ||
    storyOpen ||
    howItWorksOpen ||
    privateSelectionOpen ||
    journalOpen ||
    !!selectedArticle ||
    !!catalogPreview;

  const shouldShow =
    !hasBlockingLayer &&
    (view === "home" ||
      view === "shop" ||
      cartCount > 0 ||
      wishlist.length > 0);

  setShowStickyCta(shouldShow);
}, [
  view,
  selectedProduct,
  cartOpen,
  checkoutOpen,
  storyOpen,
  howItWorksOpen,
  privateSelectionOpen,
  journalOpen,
  selectedArticle,
  catalogPreview,
  cartCount,
  wishlist.length
]);

  useEffect(() => {
  if (selectedProduct) {
    const id = requestAnimationFrame(() => {
      setProductModalVisible(true);
    });
    return () => cancelAnimationFrame(id);
  } else {
    setProductModalVisible(false);
  }
}, [selectedProduct]);

useEffect(() => {
  return () => {
    if (productModalCloseTimeoutRef.current) {
      clearTimeout(productModalCloseTimeoutRef.current);
    }
  };
}, []);

useEffect(() => {
  try {
    const saved = localStorage.getItem("playnice_journal_feedback");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === "object") {
        setJournalFeedback(parsed);
      }
    }
  } catch (error) {
    console.error("Failed to restore journal feedback:", error);
  }
}, []);

useEffect(() => {
  setJournalFeedbackSubmitted(false);
  setJournalVoteSuccess("");
}, [selectedArticle]);

useEffect(() => {
  return () => {
    if (modalAddedTimeoutRef.current) {
      clearTimeout(modalAddedTimeoutRef.current);
    }
  };
}, []);

useEffect(() => {
  const handlePopState = () => {
    setView(getInitialView());

    requestAnimationFrame(() => {
      smoothScrollToTop();
    });
  };

  window.addEventListener("popstate", handlePopState);

  return () => {
    window.removeEventListener("popstate", handlePopState);
  };
}, []);

/* feedback helper */

const sendJournalFeedback = (article, override = {}) => {
  const key = getJournalArticleKey(article);
  if (!key) return;

  const saved = journalFeedback[key] || {};
  const vote = override.vote ?? saved.vote ?? "";
  const note = (override.note ?? saved.note ?? "").trim();

  if (!vote) return;

  try {
    const payloadToSend = JSON.stringify({
      timestamp: new Date().toISOString(),
      article: key,
      articleTitle: getJournalText(article?.title, lang),
      vote,
      note,
      lang,
      page: window.location.pathname,
      source: "journal"
    });

    const blob = new Blob([payloadToSend], {
      type: "text/plain;charset=utf-8"
    });

    navigator.sendBeacon(
      "https://script.google.com/macros/s/AKfycby38XWvXcD6Cgw2_ExKEpegaYg-mgiuYLVXzDgcwefVSCZtyWVL2QvVQzmX7nrltene/exec",
      blob
    );
  } catch (error) {
    console.error("Journal feedback submit failed:", error);
  }
};

const getJournalSavedFeedback = (article) => {
  const key = getJournalArticleKey(article);
  if (!key) return null;
  return journalFeedback[key] || null;
};

const triggerJournalVoteSuccess = (vote) => {
  setJournalVoteSuccess(vote);

  setTimeout(() => {
    setJournalVoteSuccess("");
  }, 1100);
};

const handleJournalFeedbackVote = (article, vote) => {
  const key = getJournalArticleKey(article);
  if (!key) return;

  setJournalFeedbackSubmitted(false);

  const current = journalFeedback[key] || {};
  const nextVote = vote;

  const nextFeedback = {
    ...journalFeedback,
    [key]: {
      ...current,
      vote: nextVote,
      submittedAt: nextVote ? Date.now() : current.submittedAt || null
    }
  };

  setJournalFeedback(nextFeedback);

  try {
    localStorage.setItem(
      "playnice_journal_feedback",
      JSON.stringify(nextFeedback)
    );
  } catch (error) {
    console.error("Journal feedback storage failed:", error);
  }

  if (!nextVote) return;

  sendJournalFeedback(article, {
    vote: nextVote,
    note: (current.note || "").trim()
  });

  triggerJournalVoteSuccess(nextVote);
};

const handleJournalFeedbackNoteChange = (article, value) => {
  const key = getJournalArticleKey(article);
  if (!key) return;

  setJournalFeedback((prev) => {
    const current = prev[key] || {};
    return {
      ...prev,
      [key]: {
        ...current,
        note: value
      }
    };
  });
};

const handleJournalFeedbackSubmit = (article) => {
  const key = getJournalArticleKey(article);
  if (!key) return;

  const current = journalFeedback[key] || {};
  const trimmedNote = (current.note || "").trim();

  if (!current.vote || !trimmedNote) return;

  sendJournalFeedback(article, {
    vote: current.vote,
    note: trimmedNote
  });

  setJournalFeedback((prev) => {
    const prevItem = prev[key] || {};

    const nextFeedback = {
      ...prev,
      [key]: {
        ...prevItem,
        note: "",
        submittedAt: Date.now()
      }
    };

    try {
      localStorage.setItem(
        "playnice_journal_feedback",
        JSON.stringify(nextFeedback)
      );
    } catch (error) {
      console.error("Journal feedback storage failed:", error);
    }

    return nextFeedback;
  });

  setJournalFeedbackSubmitted(true);
  setJournalFeedbackSuccess(true);

  setTimeout(() => {
    setJournalFeedbackSuccess(false);
  }, 1200);
};

const handleJournalClose = () => {
  setJournalOpen(false);
  setSelectedArticle(null);
  switchView("home");
};

/* =========================================
   DERIVED DATA
========================================= */

const sortedJournalArticles = useMemo(() => {
  if (!journalArticles?.length) return [];

  return [...journalArticles].sort((a, b) => {
    const aId = Number(a?.id || 0);
    const bId = Number(b?.id || 0);

    return bId - aId;
  });
}, [journalArticles]);

const latestJournalArticle = sortedJournalArticles?.[0] || null;

const latestJournalArticleKey = latestJournalArticle?.id
  ? String(latestJournalArticle.id)
  : "";

const hasNewJournalArticle =
  Boolean(latestJournalArticleKey) &&
  String(seenLatestJournalKey) !== String(latestJournalArticleKey);

const journalUnreadCount = hasNewJournalArticle ? 1 : 0;

const markLatestJournalAsSeen = () => {
  if (!latestJournalArticleKey) return;

  const keyToSave = String(latestJournalArticleKey);

  try {
    window.localStorage.setItem(JOURNAL_SEEN_KEY, keyToSave);
  } catch (error) {
    console.error("Failed to save seen journal article:", error);
  }

  setSeenLatestJournalKey(keyToSave);
};

const handleJournalOpen = () => {
  setJournalOpen(true);
  setSelectedArticle(null);
  switchView("journal");
};

const handleJournalArticleOpen = (article) => {
  if (!article) return;

  setJournalOpen(true);
  setSelectedArticle(article);

  if (String(article.id) === String(latestJournalArticleKey)) {
    markLatestJournalAsSeen();
  }

  switchView("journal");
};

const announcementItems = useMemo(() => {
  const latestJournalTitle = latestJournalArticle
    ? getJournalText(latestJournalArticle.title, lang)
    : "";

  const shopNewAnnouncementItem = hasNewShopProducts
    ? {
        id: "new-shop-products-announcement",
        text:
          lang === "sr"
            ? "Novi parfemi su stigli u PlayNice"
            : "New fragrances just arrived at PlayNice",
        icon: "→",
        tone: "new-shop",
        action: "openShop",
      }
    : null;

  const journalAnnouncementItem =
    hasNewJournalArticle && latestJournalArticle && latestJournalTitle
      ? {
          id: "latest-journal-announcement",
          text:
            lang === "sr"
              ? `Novo u Journalu: ${latestJournalTitle}`
              : `New in Journal: ${latestJournalTitle}`,
          icon: "→",
          tone: "journal",
          action: "openLatestJournalArticle",
        }
      : null;

  const foreverAnnouncementItem = {
    id: "forever-announcement-logo",
    type: "logoLink",
    text: "Forever Living Products",
    icon: "★",
    tone: "forever",
    href: foreverAloeUrl,
    logoSrc: "/partners/forever-logo-wide.png",
    logoAlt: "Forever Living Products",
    partner: "forever_living",
    sellerId: "360000920762",
    campaign: "aloe_drinks",
  };

  const withPriorityAnnouncements = (items) => [
    ...(shopNewAnnouncementItem ? [shopNewAnnouncementItem] : []),
    ...(journalAnnouncementItem ? [journalAnnouncementItem] : []),
    foreverAnnouncementItem,
    ...items,
  ];

  if (cart.length === 0) {
    return withPriorityAnnouncements([
      { text: tr.announcementDynamicEmpty1, icon: "🚚" },
      { text: tr.announcementDynamicEmpty2, icon: "✓" },
      { text: tr.announcementDynamicEmpty3, icon: "🔥" },
      { text: tr.announcementDynamicEmpty4, icon: "🔥" },
      { text: tr.announcementDynamicEmpty5, icon: "🚚" },
      { text: tr.announcementDynamicEmpty6, icon: "★" },
    ]);
  }

  if (subtotal >= FREE_SHIPPING_THRESHOLD) {
    return withPriorityAnnouncements([
      { text: tr.announcementDynamicUnlocked, icon: "✓", tone: "success" },
      { text: tr.announcementDynamicEmpty3, icon: "🔥" },
      { text: tr.announcementDynamicEmpty4, icon: "🔥" },
      { text: tr.announcementDynamicEmpty5, icon: "🚚" },
      { text: tr.announcementDynamicEmpty6, icon: "★" },
    ]);
  }

  return withPriorityAnnouncements([
    {
      text: tr.announcementDynamicLocked.replace(
        "{{amount}}",
        formatPrice(amountLeftForFreeShipping)
      ),
      icon: "🚚",
      tone: "warning",
    },
    { text: tr.announcementDynamicEmpty2, icon: "✓" },
    { text: tr.announcementDynamicEmpty3, icon: "🔥" },
    { text: tr.announcementDynamicEmpty4, icon: "🔥" },
    { text: tr.announcementDynamicEmpty6, icon: "★" },
  ]);
}, [
  cart.length,
  subtotal,
  amountLeftForFreeShipping,
  tr,
  lang,
  hasNewShopProducts,
  hasNewJournalArticle,
  latestJournalArticle,
  latestJournalArticleKey,
]);

const handleAnnouncementItemClick = (item) => {
  if (item?.action === "openShop") {
    goToShop();
    return;
  }

  if (item?.action === "openLatestJournalArticle") {
    if (!latestJournalArticle) return;

    handleJournalArticleOpen(latestJournalArticle);
  }
};

const freeShippingProgress = Math.min(
  100,
  Math.max(0, (subtotal / FREE_SHIPPING_THRESHOLD) * 100)
);

const activeJournalFeedback = selectedArticle
  ? getJournalSavedFeedback(selectedArticle)
  : null;

const selectedCopy = selectedProduct
  ? getProductCopy(selectedProduct, lang)
  : {
      miniTag: fallbackCopy.miniTag[lang],
      card: fallbackCopy.card[lang],
      modal: fallbackCopy.modal[lang],
      scentType: fallbackCopy.scentType[lang],
      dominantNotes: fallbackCopy.dominantNotes[lang],
      tags: fallbackCopy.tags[lang]
    };

const privateSelectionProducts = useMemo(() => {
  return products.filter((product) => wishlist.includes(product.id));
}, [wishlist]);

const goToShop = () => {
  switchView("shop");
};

const stickyCtaData = useMemo(() => {
  if (cartCount > 0) {
    return {
      label: tr.stickyCheckout,
      sublabel: `${cartCount} ${
        cartCount === 1 ? tr.stickyItem : tr.stickyItems
      } • ${formatPrice(total)}`,
      onClick: () => {
        setCartOpen(false);
        setCheckoutOpen(true);
      }
    };
  }

  if (wishlist.length > 0 && view === "shop") {
    return {
      label: tr.stickySaved,
      sublabel: `${wishlist.length} ${
        wishlist.length === 1 ? tr.stickyItem : tr.stickyItems
      }`,
      onClick: () => setPrivateSelectionOpen(true)
    };
  }

  return {
    label: tr.stickyExplore,
    sublabel:
      view === "shop"
        ? `${filteredProducts.length} ${
            lang === "sr" ? "parfema" : "fragrances"
          }`
        : tr.privateSelection,
    onClick: goToShop
  };
}, [
  cartCount,
  total,
  wishlist.length,
  view,
  filteredProducts.length,
  tr,
  lang
]);

const stickyCtaJournalHasNew = journalUnreadCount > 0;

const handleStickyCtaJournalClick = (event) => {
  event.stopPropagation();
  setJournalOpen(true);
};

  /* =========================================
     ACTIONS
  ========================================= */
  const routeForView = (nextView) => {
  if (nextView === "shop") return "/shop";
  if (nextView === "journal") return "/journal";
  return "/";
};

const switchView = (nextView) => {
  const nextPath = routeForView(nextView);

  if (view !== nextView) {
    setView(nextView);
  }

  // 👉 PUSH CLEAN URL
  if (window.location.pathname !== nextPath) {
    window.history.pushState({}, "", nextPath);
  }

  // 👉 (opciono) zadrži query za debug ako želiš
  // window.history.pushState({}, "", `${nextPath}?view=${nextView}`);

  trackPageView(nextPath);
  trackMeta("PageView");

  requestAnimationFrame(() => {
    smoothScrollToTop();
  });
};

const goHome = () => {
  switchView("home");
};

const goToJournal = () => {
  switchView("journal");
};

  const toggleWishlist = (productId) => {
    const isAdding = !wishlist.includes(productId);

    setWishlist((prev) => {
      let updated;

      if (prev.includes(productId)) {
        updated = prev.filter((id) => id !== productId);
      } else {
        updated = [...prev, productId];
      }

      try {
  window.localStorage.setItem("playnice_wishlist", JSON.stringify(updated));
} catch {}
      return updated;
    });

    if (isAdding) {
      setSprayingWishlistId(productId);
      setTimeout(() => {
        setSprayingWishlistId((current) =>
          current === productId ? null : current
        );
      }, 650);
    }
  };

  const openCatalogPreview = (url) => {
    setCatalogPreview(url);
  };

  const closeCatalogPreview = () => {
    setCatalogPreview(null);
  };

  const bumpHeroAutoplay = () => {
    setHeroPaused(true);
    setTimeout(() => setHeroPaused(false), 220);
  };

  const nextHeroSlide = () => {
    bumpHeroAutoplay();
    setCurrentHero((prev) => (prev + 1) % heroSlides.length);
  };

  const prevHeroSlide = () => {
    bumpHeroAutoplay();
    setCurrentHero((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const goToHeroSlide = (index) => {
    if (index === currentHero) return;
    bumpHeroAutoplay();
    setCurrentHero(index);
  };

  const showFeedback = (text) => {
    setAddedFeedback(text);
  };

  const addToCart = (
  product,
  size,
  customPrice = null,
  customLabel = null,
  options = {}
) => {
  const { showToast = true } = options;

  const key = `${product.id}-${size}-${customLabel || ""}`;
  const price = customPrice ?? product.sizes[size];
  const label = customLabel || size;

  trackEvent("add_to_cart", {
    currency: "EUR",
    value: Number(price),
    item_name: `${product.name} ${label}`,
    item_category: product.category
  });

  trackMeta("AddToCart", {
    content_name: `${product.name} ${label}`,
    content_category: product.category,
    value: Number(price),
    currency: "EUR"
  });

  setCart((prev) => {
    const existing = prev.find((item) => item.key === key);

    if (existing) {
      return prev.map((item) =>
        item.key === key ? { ...item, quantity: item.quantity + 1 } : item
      );
    }

    return [
      ...prev,
      {
        key,
        id: product.id,
        name: product.name,
        size: label,
        price,
        quantity: 1
      }
    ];
  });

  if (showToast) {
    showFeedback(`${product.name} ${tr.addedToCart}`);
  }
};

const triggerInlineAddedFeedback = (productId, size) => {
  const key = `${productId}-${size}`;
  setInlineAddedKey(key);

  setTimeout(() => {
    setInlineAddedKey((current) => (current === key ? null : current));
  }, 1300);
};

const handleModalAddToCart = (product, size) => {
  if (!product || !size) return;

  addToCart(product, size);

  const key = `${product.id}-${size}`;
  setModalAddedKey(key);

  if (modalAddedTimeoutRef.current) {
    clearTimeout(modalAddedTimeoutRef.current);
  }

  modalAddedTimeoutRef.current = setTimeout(() => {
    setModalAddedKey(null);
  }, 1300);
};

const addHeroBottleToCart = () => {
  const heroProduct = {
    id: 999,
    name: "Afnan 9PM Rebel",
    image: "/hero/hero-bottle.png",
    sizes: { "100ml": 34.9 }
  };

  addToCart(heroProduct, "100ml", 34.9, "100ml Full Bottle");
  setCartOpen(true);
  setCheckoutOpen(false);
};

  const updateQuantity = (key, delta) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.key === key ? { ...item, quantity: item.quantity + delta } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (key) => {
    setCart((prev) => prev.filter((item) => item.key !== key));
  };

  const handleCheckoutInput = (e) => {
    const { name, value } = e.target;
    setCheckoutForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleInternationalEnquiry = async () => {
  if (cart.length === 0) {
    alert(tr.noItemsCart || (lang === "sr" ? "Korpa je prazna." : "Your cart is empty."));
    return;
  }

  if (
    !checkoutForm.firstName.trim() ||
    !checkoutForm.lastName.trim() ||
    !checkoutForm.email.trim() ||
    !checkoutForm.phone.trim() ||
    !checkoutForm.country.trim() ||
    !checkoutForm.city.trim()
  ) {
    alert(
      lang === "sr"
        ? "Molimo unesite ime, prezime, email, telefon, zemlju i grad."
        : "Please enter your first name, last name, email, phone, country and city."
    );
    return;
  }

  setIsSubmittingOrder(true);

  try {
    const payload = {
      type: "international_enquiry",
      customer: {
        firstName: checkoutForm.firstName.trim(),
        lastName: checkoutForm.lastName.trim(),
        email: checkoutForm.email.trim(),
        phone: checkoutForm.phone.trim(),
        country: checkoutForm.country,
        countryLabel: selectedCheckoutCountryLabel,
        city: checkoutForm.city.trim(),
        address: checkoutForm.address.trim(),
        note: checkoutForm.note.trim()
      },
      items: cart,
      subtotal,
      shippingStatus: "to_be_confirmed",
      totalStatus: "products_only_not_final",
      language: lang,
      source: "checkout_international_enquiry",
      page: window.location.href,
      createdAt: new Date().toISOString()
    };

    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error("International enquiry request failed");
    }

    setOrderSuccessMessage(
      lang === "sr"
        ? "Upit je poslat. Proverićemo mogućnost dostave van Crne Gore i javiti vam se uskoro."
        : "Your enquiry has been sent. We’ll check delivery outside Montenegro and get back to you soon."
    );

    setCheckoutForm({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      country: "ME",
      city: "",
      address: "",
      note: ""
    });

    setTimeout(() => {
      setCheckoutOpen(false);
      setCartOpen(false);
    }, 2200);
  } catch (error) {
    alert(
      lang === "sr"
        ? "Došlo je do greške pri slanju upita. Molimo pokušajte ponovo ili nas kontaktirajte direktno."
        : "Something went wrong while sending your enquiry. Please try again or contact us directly."
    );
  } finally {
    setIsSubmittingOrder(false);
  }
};

  const handlePlaceOrder = async () => {
  if (!isMontenegroOrder) {
    handleInternationalEnquiry();
    return;
  }

  if (cart.length === 0) {
    alert(tr.emptyCartAlert);
    return;
  }

  if (
    !checkoutForm.firstName.trim() ||
    !checkoutForm.lastName.trim() ||
    !checkoutForm.email.trim() ||
    !checkoutForm.phone.trim() ||
    !checkoutForm.city.trim() ||
    !checkoutForm.address.trim()
  ) {
    alert(tr.fillRequired);
    return;
  }

  setIsSubmittingOrder(true);

  try {
    const payload = {
      type: "order",
      customer: {
        firstName: checkoutForm.firstName.trim(),
        lastName: checkoutForm.lastName.trim(),
        email: checkoutForm.email.trim(),
        phone: checkoutForm.phone.trim(),
        country: checkoutForm.country,
        countryLabel: selectedCheckoutCountryLabel,
        city: checkoutForm.city.trim(),
        address: checkoutForm.address.trim(),
        note: checkoutForm.note.trim()
      },
      items: cart,
      subtotal,
      shipping,
      total,
      language: lang,
      source: "checkout_order",
      page: window.location.href,
      createdAt: new Date().toISOString()
    };

    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error("Checkout request failed");
    }

    setOrderSuccessMessage(tr.orderSuccess);
    setCart([]);

    setCheckoutForm({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      country: "ME",
      city: "",
      address: "",
      note: ""
    });

    setTimeout(() => {
      setCheckoutOpen(false);
      setCartOpen(false);
    }, 1800);
  } catch (error) {
    alert(tr.orderError);
  } finally {
    setIsSubmittingOrder(false);
  }
};

  const handleHeroTouchStart = (e) => {
    touchStartX.current = e.changedTouches[0].clientX;
  };

  const handleHeroTouchEnd = (e) => {
    touchEndX.current = e.changedTouches[0].clientX;

    const distance = touchStartX.current - touchEndX.current;
    const swipeThreshold = 50;

    if (Math.abs(distance) < swipeThreshold) return;

    if (distance > 0) {
      nextHeroSlide();
    } else {
      prevHeroSlide();
    }
  };

  const goToPage = (pageNumber) => {
  const safePageNumber = Math.min(Math.max(pageNumber, 1), totalPages);

  if (safePageNumber === currentPage) return;

  setCurrentPage(safePageNumber);

  requestAnimationFrame(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
};

const nextPage = () => {
  goToPage(currentPage + 1);
};

const prevPage = () => {
  goToPage(currentPage - 1);
};

const renderPagination = (position = "bottom") => {
  if (totalPages <= 1) return null;

  return (
    <div className={`pagination-wrap pagination-wrap-${position}`}>
      <button
        type="button"
        className="pagination-nav"
        onClick={prevPage}
        disabled={currentPage === 1}
      >
        {lang === "sr" ? "Nazad" : "Prev"}
      </button>

      <div className="pagination-numbers">
        {Array.from({ length: totalPages }, (_, index) => {
          const pageNumber = index + 1;

          return (
            <button
              key={pageNumber}
              type="button"
              className={`pagination-number ${
                currentPage === pageNumber ? "active" : ""
              }`}
              onClick={() => goToPage(pageNumber)}
              aria-label={
                lang === "sr"
                  ? `Idi na stranicu ${pageNumber}`
                  : `Go to page ${pageNumber}`
              }
              aria-current={currentPage === pageNumber ? "page" : undefined}
            >
              {pageNumber}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        className="pagination-nav"
        onClick={nextPage}
        disabled={currentPage === totalPages}
      >
        {lang === "sr" ? "Dalje" : "Next"}
      </button>
    </div>
  );
};

  const getProductUrl = (product) => {
  if (!product?.name) return "/shop";

  return `/product/${slugifyProduct(product.name)}`;
};

const isMobileProductModal = () =>
  window.matchMedia("(max-width: 640px)").matches;

const openProductModal = (product, options = {}) => {
  if (!product) return;

  const { updateUrl = true } = options;
  const isMobileModal = isMobileProductModal();

  if (productModalCloseTimeoutRef.current) {
    clearTimeout(productModalCloseTimeoutRef.current);
    productModalCloseTimeoutRef.current = null;
  }

  productModalScrollYRef.current = window.scrollY || window.pageYOffset || 0;

  setView("shop");
  setSelectedProduct(product);
  setSelectedSize(Object.keys(product.sizes || {})[0] || "");
  setHasUserPickedSize(false);

  if (isMobileModal) {
    setProductModalVisible(true);
  } else {
    setProductModalVisible(false);
  }

  if (updateUrl) {
    const productUrl = getProductUrl(product);

    if (window.location.pathname !== productUrl) {
      window.history.pushState({}, "", productUrl);
    }

    trackPageView(productUrl);
    trackMeta("PageView");
  }

  if (!isMobileModal) {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setProductModalVisible(true);
      });
    });
  }
};

const handleProductCardOpen = (product) => {
  openProductModal(product);

  if (!product?.isNew || !newProductsSignature) return;

  localStorage.setItem(SHOP_NEW_PRODUCTS_SEEN_KEY, newProductsSignature);
  setHasNewShopProducts(false);
};

useEffect(() => {
  const path = window.location.pathname;

  if (!path.startsWith("/product/")) return;

  const slugFromUrl = decodeURIComponent(
    path.replace("/product/", "").replace(/\/$/, "")
  );

  const matchedProduct = products.find(
    (product) => getProductSlug(product) === slugFromUrl
  );

  if (!matchedProduct) {
    setView("shop");
    window.history.replaceState({}, "", "/shop");
    return;
  }

  openProductModal(matchedProduct, { updateUrl: false });
}, []);

const closeProductModal = () => {
  const isMobileModal = isMobileProductModal();

  setProductModalVisible(false);
  setHasUserPickedSize(false);

  if (productModalCloseTimeoutRef.current) {
    clearTimeout(productModalCloseTimeoutRef.current);
    productModalCloseTimeoutRef.current = null;
  }

  const cleanupProductModal = () => {
    setSelectedProduct(null);
    setSelectedSize("");
    productModalCloseTimeoutRef.current = null;

    if (window.location.pathname.startsWith("/product/")) {
      window.history.pushState({}, "", "/shop");
      trackPageView("/shop");
      trackMeta("PageView");
    }
  };

  if (isMobileModal) {
    cleanupProductModal();
    return;
  }

  productModalCloseTimeoutRef.current = setTimeout(() => {
    cleanupProductModal();
  }, 200);
};

const openImpactProductModal = (product) => {
  openProductModal(product);
};

  const getCategoryLabel = (categoryKey) => {
    if (categoryKey === "All") return tr.all;
    return categoryLabels[categoryKey]?.[lang] || categoryKey;
  };

  const removeFromPrivateSelection = (productId) => {
    toggleWishlist(productId);
  };

  useEffect(() => {
  const productFromUrl = getProductFromCurrentUrl();

  if (!productFromUrl) {
    return;
  }

  setSelectedProduct(productFromUrl);
  setView("shop");
}, []);

/* =========================================
   SEO title/meta useEffect
========================================= */
  useEffect(() => {
  const seoTitle = selectedProduct
    ? getProductSeoTitle(selectedProduct, lang)
    : view === "shop"
    ? lang === "en"
      ? "Shop | Premium fragrances and decants in Montenegro | PlayNice"
      : "Shop | Premium parfemi i dekanti u Crnoj Gori | PlayNice"
    : view === "journal"
    ? lang === "en"
      ? "Journal | Fragrance stories and recommendations | PlayNice"
      : "Journal | Mirisne priče i preporuke | PlayNice"
    : lang === "en"
    ? "PlayNice | Premium fragrances and decants in Montenegro"
    : "PlayNice | Premium parfemi i dekanti u Crnoj Gori";

  const seoDescription = selectedProduct
    ? getProductMetaDescription(selectedProduct, lang)
    : view === "shop"
    ? lang === "en"
      ? "Explore the PlayNice collection of premium fragrance decants in Montenegro. Designer, niche and Arabian fragrances with delivery across Montenegro."
      : "Istraži PlayNice kolekciju premium parfema i dekanata u Crnoj Gori. Designer, niche i Arabian mirisi, dostava širom Crne Gore."
    : view === "journal"
    ? lang === "en"
      ? "PlayNice Journal brings short fragrance stories, recommendations and guides for choosing the right perfume."
      : "PlayNice Journal donosi kratke mirisne priče, preporuke i vodiče za bolji izbor parfema."
    : lang === "en"
    ? "Premium fragrance decants and original perfumes in Montenegro. Try before you buy with PlayNice — designer, niche and Arabian fragrances."
    : "Premium dekanti i originalni parfemi u Crnoj Gori. Probaj prije kupovine uz PlayNice — designer, niche i Arabian mirisi.";

  const seoUrl = selectedProduct
    ? getSeoProductUrl(selectedProduct)
    : view === "shop"
    ? `${SITE_BASE_URL}/shop`
    : view === "journal"
    ? `${SITE_BASE_URL}/journal`
    : `${SITE_BASE_URL}/`;

  const seoImage = selectedProduct
    ? getSeoProductImage(selectedProduct)
    : `${SITE_BASE_URL}/og-image.jpg`;

  document.title = seoTitle;

  const setMeta = (selector, attribute, value) => {
    let element = document.head.querySelector(selector);

    if (!element) {
      if (selector.startsWith("link")) {
        element = document.createElement("link");
        element.setAttribute("rel", "canonical");
      } else {
        element = document.createElement("meta");

        const nameMatch = selector.match(/name="([^"]+)"/);
        const propertyMatch = selector.match(/property="([^"]+)"/);

        if (nameMatch?.[1]) {
          element.setAttribute("name", nameMatch[1]);
        }

        if (propertyMatch?.[1]) {
          element.setAttribute("property", propertyMatch[1]);
        }
      }

      document.head.appendChild(element);
    }

    element.setAttribute(attribute, value);
  };

  setMeta('meta[name="description"]', "content", seoDescription);
  setMeta('link[rel="canonical"]', "href", seoUrl);

  setMeta('meta[property="og:title"]', "content", seoTitle);
  setMeta('meta[property="og:description"]', "content", seoDescription);
  setMeta('meta[property="og:url"]', "content", seoUrl);
  setMeta('meta[property="og:image"]', "content", seoImage);
  setMeta('meta[property="og:type"]', "content", selectedProduct ? "product" : "website");

  setMeta('meta[name="twitter:title"]', "content", seoTitle);
  setMeta('meta[name="twitter:description"]', "content", seoDescription);
  setMeta('meta[name="twitter:image"]', "content", seoImage);
  setMeta('meta[name="twitter:card"]', "content", "summary_large_image");
}, [view, selectedProduct, lang]);

/* =========================================
   SEO existingSchema useEffect
========================================= */
useEffect(() => {
  const existingSchema = document.getElementById("playnice-product-schema");

  if (existingSchema) {
    existingSchema.remove();
  }

  if (!selectedProduct) return;

  const schema = getProductStructuredData(selectedProduct, lang);

  if (!schema) return;

  const script = document.createElement("script");
  script.id = "playnice-product-schema";
  script.type = "application/ld+json";
  script.textContent = JSON.stringify(schema);

  document.head.appendChild(script);

  return () => {
    const currentSchema = document.getElementById("playnice-product-schema");

    if (currentSchema) {
      currentSchema.remove();
    }
  };
}, [selectedProduct, lang]);

/* =========================================
   INNER COMPONENTS
========================================= */
const ProductCard = ({
  product,
  wishlist,
  toggleWishlist,
  sprayingWishlistId
}) => {
  const copy = getProductCopy(product, lang);
  const minPrice = getMinPrice(product);
  const isWishlisted = wishlist.includes(product.id);
  const isSpraying = sprayingWishlistId === product.id;

  const getBadgeVariant = (miniTag = "") => {
    const tag = miniTag.toLowerCase();

    if (
      tag.includes("bestseller") ||
      tag.includes("top") ||
      tag.includes("🔥")
    ) {
      return "badge-hot";
    }

    if (
      tag.includes("fresh") ||
      tag.includes("summer") ||
      tag.includes("blue") ||
      tag.includes("❄️")
    ) {
      return "badge-fresh";
    }

    if (
      tag.includes("sweet") ||
      tag.includes("date") ||
      tag.includes("gourmand") ||
      tag.includes("🍯")
    ) {
      return "badge-sweet";
    }

    if (
      tag.includes("luxury") ||
      tag.includes("signature") ||
      tag.includes("exclusive") ||
      tag.includes("💎")
    ) {
      return "badge-luxury";
    }

    return "badge-default";
  };

  const getWearContext = (product, lang) => {
  return productWearContext[product.name]?.[lang] || "";
};

  const tr = translations[lang];

const getSizeWearHint = (size) => {
  if (size === "2ml") return tr.wearHint_2ml;
  if (size === "5ml") return tr.wearHint_5ml;
  if (size === "10ml") return tr.wearHint_10ml;
  if (size === "20ml") return tr.wearHint_20ml;
  return "";
};

const titleLengthClass =
  product.name.length > 44
    ? "is-very-long-title"
    : product.name.length > 32
    ? "is-long-title"
    : "";

  return (
  <article className="product-card premium-product-card">
    <button
      type="button"
      className="product-card-media clickable-media"
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => handleProductCardOpen(product)}
      aria-label={product.name}
    >
      <img
        src={product.image || "/placeholder.png"}
        alt={product.name}
        className="product-card-image"
        loading="lazy"
      />

      {product.isNew && (
  <span className="product-new-badge">
    {tr.justIn}
  </span>
)}
    </button>

    <button
      type="button"
      className={`wishlist-btn ${isWishlisted ? "active" : ""} ${
        isSpraying ? "is-spraying" : ""
      }`}
    onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleWishlist(product.id);
    }}
    aria-label={
      isWishlisted
        ? lang === "sr"
          ? `Ukloni ${product.name} iz wishlist`
          : `Remove ${product.name} from wishlist`
        : lang === "sr"
        ? `Dodaj ${product.name} u wishlist`
        : `Add ${product.name} to wishlist`
    }
  >
    <span className="heart-icon" aria-hidden="true">
      ♥
    </span>
  </button>

  {copy.miniTag && (
    <span
      className={`product-floating-badge ${getBadgeVariant(copy.miniTag)}`}
    >
      {copy.miniTag}
    </span>
  )}

  <div
  className="product-meta premium-product-meta"
  role="button"
  tabIndex={0}
  onClick={() => handleProductCardOpen(product)}
  onKeyDown={(e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleProductCardOpen(product);
    }
  }}
>
    <div className="product-meta-top">
      <p className="product-category">{getCategoryLabel(product.category)}</p>
      <h3 className={`product-card-title ${titleLengthClass}`}>
  {product.name}
</h3>
    </div>

    <div className="product-meta-middle">
      <div className="product-card-copy-stack">
        <p className="product-card-copy premium-card-copy">{copy.card}</p>

        <p className="product-card-decant-note">
          {getWearContext(product, lang)}
        </p>
      </div>
    </div>

    <div className="product-meta-bottom">
      <div className="product-price-block">
        <div className="product-price-row">
          <span className="product-price-from premium-product-price">
            <span className="price-prefix">{tr.tryFrom}</span>
            <span className="price-value">€{minPrice}</span>
          </span>
        </div>
      </div>

      <div className="product-preview-line premium-preview-line single-line-preview">
        <span className="product-card-cta">{tr.productCardCta}</span>
      </div>
    </div>
  </div>

  <div className="size-buttons" onClick={(e) => e.stopPropagation()}>
    {Object.entries(product.sizes).map(([size, price]) => {
      const feedbackKey = `${product.id}-${size}`;
      const isJustAdded = inlineAddedKey === feedbackKey;
      const isRecommendedSize = size === "5ml";
      const wearHint = getSizeWearHint(size);

      return (
        <button
          key={size}
          type="button"
          className={`size-chip ${isRecommendedSize ? "is-recommended" : ""}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            e.currentTarget.blur();

            addToCart(product, size, null, null, { showToast: false });
            triggerInlineAddedFeedback(product.id, size);
          }}
        >
          <span className="size-chip-main-wrap">
            <span className="size-chip-main-row">
              <span className="size-chip-main">{size}</span>

              {isRecommendedSize && (
                <span className="size-chip-recommended">
                  {tr.sizeBestChoice}
                </span>
              )}
            </span>

            {wearHint && (
              <span className="size-chip-wear-hint">{wearHint}</span>
            )}
          </span>

          <span className="size-chip-price">{formatPrice(price)}</span>

          <span className={`size-chip-flash ${isJustAdded ? "show" : ""}`}>
            {tr.justAdded}
          </span>
        </button>
      );
    })}
  </div>
</article>
  );
};

/* =========================================
     DeliveryReturns MINI
========================================= */
const DeliveryReturnsMini = ({ surface = "footer" }) => {
  const isSr = lang === "sr";

  const labels = {
    title: isSr ? "Dostava i povrat" : "Delivery & Returns",
    delivery: isSr ? "Dostava širom CG" : "Delivery across Montenegro",
    shipping: isSr ? "Dostava €4" : "Shipping €4",
    free: isSr ? "Besplatno preko €39" : "Free over €39",
    cod: isSr ? "Plaćanje pouzećem" : "Cash on delivery",
    returnNote: isSr
      ? "Otvoreni dekanti se ne vraćaju iz higijenskih razloga. Povrat je moguć za neotvoreno, nekorišćeno i neoštećeno pakovanje, ili u slučaju greške/oštećenja pri dostavi."
      : "Opened decants cannot be returned for hygiene reasons. Returns are possible for unopened, unused and undamaged items, or in case of delivery error/damage."
  };

  if (surface === "footer") {
    return (
      <section
        id="delivery-returns"
        className="policy-strip policy-strip--footer"
        aria-label={labels.title}
      >
        <div className="policy-title-row">
          <span className="policy-dot">✓</span>
          <strong>{labels.title}</strong>
        </div>

        <div className="policy-detail-row">
          <span>{labels.delivery}</span>
          <span>{labels.shipping}</span>
          <span>{labels.free}</span>
          <span>{labels.cod}</span>
        </div>

        <p>{labels.returnNote}</p>
      </section>
    );
  }

  return (
    <section
      className={`policy-compact policy-compact--${surface}`}
      aria-label={labels.title}
    >
      <div className="policy-title-row">
        <span className="policy-dot">✓</span>
        <strong>{labels.title}</strong>
      </div>

      <div className="policy-detail-row">
        <span>{labels.delivery}</span>
        <span>{labels.shipping}</span>
        <span>{labels.free}</span>
        <span>{labels.cod}</span>
      </div>

      <p>{labels.returnNote}</p>
    </section>
  );
};

  /* =========================================
     RENDER
  ========================================= */
  return (
  <div className="app-shell">

  {shouldShowSideRails && (
  <aside
    className="side-ad-rails"
    aria-label={
      lang === "sr"
        ? "PlayNice istaknuti partneri"
        : "PlayNice featured partners"
    }
  >
    {sideRailAds
      .filter((ad) => ad.enabled)
      .map((ad) => {
        const railClassName = [
          "side-ad-rail",
          `side-ad-rail-${ad.side}`,
          ad.isSponsored ? "side-ad-rail-sponsored" : "",
        ]
          .filter(Boolean)
          .join(" ");

        const railContent = (
          <>
            <span className="side-ad-label">{ad.label}</span>

            {ad.logoSrc ? (
  <span className="side-ad-logo-wrap">
    <img
      src={ad.logoSrc}
      alt={ad.logoAlt || ad.label}
      className="side-ad-logo"
      loading="lazy"
    />
  </span>
) : (
  <span className="side-ad-icon" aria-hidden="true">
    {ad.icon}
  </span>
)}

            <span className="side-ad-title">
              {ad.title.split("\n").map((line, index) => (
                <span key={`${ad.id}-${index}`}>{line}</span>
              ))}
            </span>

            <span className="side-ad-copy">{ad.text}</span>

            <span className="side-ad-cta">
              {ad.cta}
              <span aria-hidden="true">→</span>
            </span>
          </>
        );

        if (ad.href) {
          return (
            <a
              key={ad.id}
              className={railClassName}
              href={ad.href}
              target="_blank"
              rel="sponsored noopener noreferrer"
              aria-label={`${ad.label}: ${ad.title.replace("\n", " ")}`}
              onClick={() =>
               handleSponsoredAdClick(ad, "desktop_left_side_rail")
              }
            >
              {railContent}
            </a>
          );
        }

        return (
          <button
            key={ad.id}
            type="button"
            className={railClassName}
            onClick={() => handleSideRailAction(ad)}
          >
            {railContent}
          </button>
        );
      })}
  </aside>
)}

<div className="header-system">
  <header className="topbar topbar-enterprise">
    <span className="topbar-connector" aria-hidden="true" />

    <button
      className="brand enterprise-brand"
      type="button"
      onClick={() => switchView("home")}
      aria-label="PlayNice home"
    >
      <span className="brand-copy">
        <strong className="brand-full">PlayNice</strong>
        <strong className="brand-short" aria-hidden="true">
          PN
        </strong>
        <small>Remember. PlayNice.</small>
      </span>
    </button>

    <nav
  className={`nav-links enterprise-main-nav ${
    view === "shop" ? "is-shop" : "is-home"
  } ${hasNewShopProducts ? "has-new-shop-signal" : ""}`}
  aria-label="Primary navigation"
    >
      {hasNewShopProducts && (
  <span className="shop-orb-ripples" aria-hidden="true">
    <span></span>
    <span></span>
  </span>
      )}
      <button
        className={`nav-link nav-link-home ${
          view === "home" ? "active" : ""
        }`}
        type="button"
        onClick={() => switchView("home")}
      >
        {tr.navHome}
      </button>

      <button
        className={`nav-link nav-link-shop nav-shop-link ${
          view === "shop" ? "active" : ""
        } ${hasNewShopProducts ? "has-new-shop" : ""}`}
        type="button"
        onClick={goToShop}
        aria-label={
          hasNewShopProducts
            ? lang === "sr"
              ? "Shop, novi parfemi"
              : "Shop, new fragrances"
            : "Shop"
        }
      >
        <span className="nav-shop-link-text">{tr.navShop}</span>

        {hasNewShopProducts && <span className="shop-nav-new-badge">NEW</span>}
      </button>
    </nav>

    <div className="topbar-right enterprise-utility">
      <button
        className="cart-button cart-button--icon-only"
        type="button"
        onClick={() => setCartOpen((prev) => !prev)}
        aria-label={lang === "sr" ? "Korpa" : "Cart"}
        title={lang === "sr" ? "Korpa" : "Cart"}
      >
        <span className="cart-icon" aria-hidden="true">
          🛒
        </span>
        {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
      </button>

      <button
        className={`header-private-selection-btn ${
          wishlist.length > 0 ? "has-items" : ""
        }`}
        onClick={() => setPrivateSelectionOpen(true)}
        type="button"
        aria-label="Private Selection"
        title="Private Selection"
      >
        <span className="ps-heart" aria-hidden="true">
          {wishlist.length > 0 ? "♥" : "♡"}
        </span>

        {wishlist.length > 0 && <span className="ps-count">{wishlist.length}</span>}
      </button>

      <div
        className={`language-compact ${languageMenuOpen ? "open" : ""}`}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) {
            setLanguageMenuOpen(false);
          }
        }}
      >
        <button
          className="language-current"
          type="button"
          aria-haspopup="menu"
          aria-expanded={languageMenuOpen}
          aria-label={lang === "sr" ? "Promeni jezik" : "Change language"}
          onClick={() => setLanguageMenuOpen((prev) => !prev)}
        >
          {lang.toUpperCase()}
        </button>

        <div className="language-options" role="menu">
          <button
            className="language-option"
            type="button"
            role="menuitem"
            onClick={() => {
              setLang(lang === "sr" ? "en" : "sr");
              setLanguageMenuOpen(false);
            }}
          >
            {lang === "sr" ? "EN" : "SR"}
          </button>
        </div>
      </div>
    </div>
  </header>

  <div
    className={`announcement-bar announcement-bar-system ${
      cart.length === 0
        ? ""
        : subtotal >= FREE_SHIPPING_THRESHOLD
        ? "announcement-bar-success"
        : "announcement-bar-warning"
    }`}
  >
    <div className="announcement-bar-inner">
      <div className="announcement-marquee">
        <div className="announcement-track">
          {[...announcementItems, ...announcementItems].map((item, index) => {
            const itemClassName = `announcement-text ${
              item.tone ? `announcement-${item.tone}` : ""
            }`;

            const iconClassName = `announcement-icon ${
              item.tone ? `announcement-${item.tone}` : ""
            }`;

            const key = `${item.id || item.text}-${index}`;

            return (
              <React.Fragment key={key}>
                {item.type === "logoLink" ? (
                  <a
                    className="announcement-logo-link announcement-logo-link-forever"
                    href={item.href}
                    target="_blank"
                    rel="sponsored noopener noreferrer"
                    aria-label={item.logoAlt || item.text}
                    onClick={() =>
                      handleSponsoredAdClick(item, "announcement_bar")
                    }
                  >
                    <img
                      src={item.logoSrc}
                      alt={item.logoAlt || item.text}
                      className="announcement-logo-img"
                      loading="lazy"
                    />
                  </a>
                ) : item.action ? (
                  <button
                    type="button"
                    className={`${itemClassName} announcement-action`}
                    onClick={() => handleAnnouncementItemClick(item)}
                    aria-label={item.text}
                  >
                    {item.text}
                  </button>
                ) : (
                  <span className={itemClassName}>{item.text}</span>
                )}

                <span className={iconClassName}>{item.icon}</span>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div className="announcement-progress-shell">
        <div className="announcement-progress-bar">
          <div
            className="announcement-progress-fill"
            style={{
              width:
                cart.length === 0
                  ? "100%"
                  : `${Math.min(
                      100,
                      (subtotal / FREE_SHIPPING_THRESHOLD) * 100
                    )}%`
            }}
          />
        </div>
      </div>
    </div>
  </div>
</div>

{addedFeedback && <div className="added-feedback">{addedFeedback}</div>}

      <main>
        {view === "home" && (
          <>
            <section
              className="hero hero-carousel"
              onMouseEnter={() => setHeroPaused(true)}
              onMouseLeave={() => setHeroPaused(false)}
              onTouchStart={handleHeroTouchStart}
              onTouchEnd={handleHeroTouchEnd}
            >
              <div className="hero-carousel-track">
                {heroSlides.map((slide, index) => (
                  <article
                    key={slide.id}
                    className={`hero-slide ${index === currentHero ? "active" : ""}`}
                    aria-hidden={index !== currentHero}
                  >
                    <div className="hero-image-only">
                      <picture>
  <source
    media="(max-width: 768px)"
    srcSet={slide.mobileImage || slide.image}
  />

  <img
    className={`hero-image-only-img ${
      index === currentHero ? "is-active" : ""
    }`}
    src={slide.desktopImage || slide.image}
    alt={slide.alt}
    loading={index === 0 ? "eager" : "lazy"}
    draggable="false"
  />
</picture>
                    </div>
                  </article>
                ))}
              </div>

              {heroSlides.length > 1 && (
                <>
                  <button
                    type="button"
                    className="hero-carousel-arrow hero-carousel-arrow-left"
                    onClick={prevHeroSlide}
                    aria-label="Previous slide"
                  />

                  <button
                    type="button"
                    className="hero-carousel-arrow hero-carousel-arrow-right"
                    onClick={nextHeroSlide}
                    aria-label="Next slide"
                  />

                  <div
                    className="hero-carousel-dots"
                    role="tablist"
                    aria-label="Hero slides"
                  >
                    {heroSlides.map((slide, index) => (
                      <button
                        key={slide.id}
                        type="button"
                        className={`hero-carousel-dot ${
                          index === currentHero ? "active" : ""
                        }`}
                        onClick={() => goToHeroSlide(index)}
                        aria-label={`Go to slide ${index + 1}`}
                        aria-selected={index === currentHero}
                        role="tab"
                      >
                        <span className="hero-carousel-dot-pill" />
                      </button>
                    ))}
                  </div>
                </>
              )}
            </section>

            <section className="value-strip">
              <div>{tr.valueTry}</div>
              <div>{tr.valuePremium}</div>
              <div>{tr.valueDelivery}</div>
            </section>

            {shouldShowMobileSponsoredAd && (
  <section
    className="mobile-sponsored-ad-wrap"
    aria-label={lang === "sr" ? "Sponzorisani partner" : "Sponsored partner"}
  >
    <a
      className="mobile-sponsored-ad mobile-sponsored-ad-micro"
      href={mobileSponsoredAd.href}
      target="_blank"
      rel="sponsored noopener noreferrer"
      onClick={() =>
  handleSponsoredAdClick(mobileSponsoredAd, "mobile_sponsored_bar")
}
    >
      <span className="mobile-sponsored-ad-side mobile-sponsored-ad-side-left">
        <span className="mobile-sponsored-ad-label">
          {mobileSponsoredAd.label}
        </span>
      </span>

      <span className="mobile-sponsored-ad-textblock">
        <span className="mobile-sponsored-ad-title-inline">
          {lang === "sr" ? "Aloe Vera napici" : "Aloe Vera Drinks"}
        </span>

        <span className="mobile-sponsored-ad-subtitle-inline">
          {lang === "sr"
            ? "Istraži Forever Living aloe vera napitke."
            : "Explore Forever Living aloe vera drinks."}
        </span>
      </span>

      <span className="mobile-sponsored-ad-side mobile-sponsored-ad-side-right">
        {mobileSponsoredAd.logoSrc ? (
          <img
            src={mobileSponsoredAd.logoSrc}
            alt={mobileSponsoredAd.logoAlt || "Forever Living"}
            className="mobile-sponsored-ad-logo"
            loading="lazy"
          />
        ) : (
          <span className="mobile-sponsored-ad-icon" aria-hidden="true">
            {mobileSponsoredAd.icon}
          </span>
        )}
      </span>
    </a>
  </section>
)}

            <section
              id="how-it-works"
              className="how-it-works-section section-wrap"
            >
              <div className="section-head how-it-works-head">
                <p className="section-kicker">
                  {lang === "sr" ? "Kako funkcioniše?" : "How it works"}
                </p>
                <h2>
                  {lang === "sr"
                    ? "Kako funkcionišu dekanti?"
                    : "How decants work?"}
                </h2>
                <p>
                  {lang === "sr"
                    ? "Jednostavan i pametan način da pronađeš pravi parfem pre kupovine pune bočice."
                    : "A simple and smart way to find the right fragrance before buying a full bottle."}
                </p>
              </div>

              <div className="how-it-works-grid">
                <article className="how-it-works-card">
                  <span className="how-it-works-number">01</span>
                  <h3>{lang === "sr" ? "Šta su dekanti?" : "What are decants?"}</h3>
                  <p>
                    {lang === "sr"
                      ? "Manja, pažljivo presuta pakovanja originalnih parfema."
                      : "Smaller, carefully decanted portions of original fragrances."}
                  </p>
                </article>

                <article className="how-it-works-card">
                  <span className="how-it-works-number">02</span>
                  <h3>{lang === "sr" ? "Zašto su korisni?" : "Why they matter?"}</h3>
                  <p>
                    {lang === "sr"
                      ? "Možeš da probaš miris na svojoj koži pre kupovine pune bočice."
                      : "They let you test a fragrance on your skin before committing to a full bottle."}
                  </p>
                </article>

                <article className="how-it-works-card">
                  <span className="how-it-works-number">03</span>
                  <h3>
                    {lang === "sr" ? "Zašto je to pametnije?" : "Why it is smarter?"}
                  </h3>
                  <p>
                    {lang === "sr"
                      ? "Manji rizik, manji trošak i više parfema za rotaciju."
                      : "Lower risk, lower cost, and more room to build a fragrance rotation."}
                  </p>
                </article>
              </div>

              <div className="how-it-works-cta">
                <button
                  className="ghost-button"
                  type="button"
                  onClick={() => setHowItWorksOpen(true)}
                >
                  {lang === "sr" ? "Saznaj više" : "Learn more"}
                </button>
              </div>
            </section>

            <div className="section-divider">
              <span />
            </div>

            <section className="featured-section section-wrap impact-split-section">
              <div className="impact-video-column">
                <div className="impact-video-frame">
                  <video
                    key={currentVideo}
                    autoPlay
                    muted
                    playsInline
                    onEnded={() => {
                      setCurrentVideo((prev) => (prev + 1) % heroVideos.length);
                    }}
                  >
                    <source src={heroVideos[currentVideo]} type="video/mp4" />
                  </video>

                  <div className="impact-video-badge">PLAYNICE FILM</div>
                </div>

                <div className="impact-video-panel">
                  <div className="impact-video-panel-content">
                    <span className="impact-video-eyebrow">
                      {lang === "sr" ? "PLAYNICE CONCEPT" : "PLAYNICE CONCEPT"}
                    </span>

                    <h3>
                      {lang === "sr"
                        ? "Probaj pre nego što se odlučiš."
                        : "Try before you commit."}
                    </h3>

                    <p>
                      {lang === "sr"
                        ? "Isprobaj na koži kroz 5ml ili 10ml dekante. Bez rizika. Samo pravi izbor."
                        : "Experience it on skin first. 5ml and 10ml decants. No risk. Just the right decision."}
                    </p>

                    <button
                      className="impact-video-cta"
                      type="button"
                      onClick={goToShop}
                    >
                      {lang === "sr" ? "Istraži kolekciju" : "Explore collection"}
                    </button>
                  </div>
                </div>
              </div>

              <div className="impact-products-column">
                <div className="section-head impact-head">
                  <p className="section-kicker">{tr.highlightsKicker}</p>
                  <h2>{tr.highlightsTitle}</h2>
                  <p>{tr.highlightsText}</p>
                </div>

                <div className="impact-products-panel">
                  <article className="impact-products-merged-card">
                    <div className="impact-product-row">
                      <button
                        type="button"
                        className="impact-product-image-button"
                        onClick={() => openImpactProductModal(impactProducts[0])}
                        aria-label="Afnan 9PM Rebel"
                      >
                        <div className="impact-product-image-wrap">
                          <img
                            src="/products/9pm.png"
                            alt="Afnan 9PM Rebel"
                            className="impact-product-image"
                          />
                        </div>
                      </button>

                      <div className="impact-product-copy">
                        <div className="impact-product-topline">
                          <span className="impact-product-tag">{tr.campaignPick}</span>
                        </div>

                        <h3>Afnan 9PM Rebel</h3>
                        <p>{tr.rebelCardText}</p>

                        <div className="impact-product-actions">
                          <button
                            className="inline-link impact-inline-link"
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              addHeroBottleToCart();
                            }}
                          >
                            {tr.add100ml}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="impact-product-divider" />

                    <div className="impact-product-row">
                      <button
                        type="button"
                        className="impact-product-image-button"
                        onClick={() => openImpactProductModal(impactProducts[1])}
                        aria-label="Khadlaj Island Dreams Extrait de Parfum"
                      >
                        <div className="impact-product-image-wrap">
                          <img
                            src="/products/island.png"
                            alt="Khadlaj Island Dreams Extrait de Parfum"
                            className="impact-product-image"
                          />
                        </div>
                      </button>

                      <div className="impact-product-copy">
                        <div className="impact-product-topline">
                          <span className="impact-product-tag">{tr.summerHit}</span>
                        </div>

                        <h3>Khadlaj Island Dreams Extrait de Parfum</h3>
                        <p>{tr.islandDreamsText}</p>
                      </div>
                    </div>

                    <div className="impact-product-divider" />

                    <div className="impact-product-row">
                      <button
                        type="button"
                        className="impact-product-image-button"
                        onClick={() => openImpactProductModal(impactProducts[2])}
                        aria-label="Arabiyat Prestige Marwa"
                      >
                        <div className="impact-product-image-wrap">
                          <img
                            src="/products/marwa.png"
                            alt="Arabiyat Prestige Marwa"
                            className="impact-product-image"
                          />
                        </div>
                      </button>

                      <div className="impact-product-copy">
                        <div className="impact-product-topline">
                          <span className="impact-product-tag">{tr.arabianEdge}</span>
                        </div>

                        <h3>Arabiyat Prestige Marwa</h3>
                        <p>{tr.marwaText}</p>
                      </div>
                    </div>
                  </article>
                </div>
              </div>
            </section>

            <div className="section-divider">
              <span />
            </div>

            <section className="homepage-shop-preview section-wrap">
              <div className="section-head">
                <p className="section-kicker">{tr.privateSelection}</p>
                <h2>{tr.bestsellersTitle}</h2>
                <p>{tr.bestsellersText}</p>
              </div>

              <div className="product-grid">
                {[5, 21, 48, 49]
                  .map((id) => products.find((product) => product.id === id))
                  .filter(Boolean)
                  .map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      wishlist={wishlist}
                      toggleWishlist={toggleWishlist}
                      sprayingWishlistId={sprayingWishlistId}
                    />
                  ))}
              </div>

              <div className="section-cta-center">
                <button className="gold-button" type="button" onClick={goToShop}>
                  {tr.viewFullCollection}
                </button>
              </div>
            </section>

                        <div className="section-divider">
              <span />
            </div>

            <section className="catalog-download-section">
              <div className="catalog-download-card">
                <div className="catalog-download-copy">
                  <p className="catalog-download-kicker">
                    {lang === "sr" ? "PLAYNICE KATALOG" : "PLAYNICE CATALOG"}
                  </p>

                  <h2>
                    {lang === "sr" ? "Preuzmi katalog." : "Download the catalog."}
                  </h2>

                  <p>
                    {lang === "sr"
                      ? "Brz pregled parfema, dostupnih militraža i cena. Idealno za lako deljenje, brzo pregledanje i poručivanje."
                      : "A quick overview of fragrances, available sizes, and prices. Perfect for easy sharing, fast browsing, and ordering."}
                  </p>
                </div>

                <div className="catalog-download-actions">
                  <a
                    className="catalog-download-button recommended"
                    href="/catalog-dark.pdf"
                    onClick={(e) => {
                      e.preventDefault();
                      openCatalogPreview("/catalog-dark.pdf");
                    }}
                  >
                    <span className="recommended-badge">Recommended</span>
                    {lang === "sr" ? "Premium katalog" : "Premium catalog"}
                  </a>

                  <a
                    className="catalog-download-button secondary"
                    href="/catalog-clean.pdf"
                    download
                    target="_blank"
                    rel="noreferrer"
                  >
                    {lang === "sr" ? "Brzi cenovnik" : "Quick price list"}
                  </a>

                  <span className="catalog-download-note">
                    {lang === "sr" ? "DM / print verzije" : "DM / print versions"}
                  </span>
                </div>
              </div>
            </section>

            <section
              className={`closing-section section-wrap ${
                closingVisible ? "is-visible" : ""
              }`}
            >
              <div className="closing-shell">
                <p className="closing-kicker">
                  {lang === "sr" ? "ZAVRŠNI UTISAK" : "FINAL IMPRESSION"}
                </p>

                <h2 className="closing-title">
                  {lang === "sr"
                    ? "Biraj miris koji želiš da pamte."
                    : "Choose the scent they’ll remember."}
                </h2>

                <p className="closing-text">
                  {lang === "sr"
                    ? "Probaj pre kupovine. Otkrij designer, niche i Arabian parfeme kroz pažljivo birane dekante, pre nego se odlučiš za punu bočicu."
                    : "Try before you buy. Discover designer, niche and Arabian fragrances through carefully curated decants before committing to a full bottle."}
                </p>

                <div className="closing-actions">
                  <button
                    type="button"
                    className="gold-button"
                    onClick={goToShop}
                  >
                    {lang === "sr" ? "Istraži kolekciju" : "Explore Collection"}
                  </button>

                  <button
                    type="button"
                    className="ghost-button"
                    onClick={goToShop}
                  >
                    Private Selection
                  </button>
                </div>
              </div>
            </section>
          </>
        )}

          {view === "shop" && (
  <>
    <section className="shop-section section-wrap">
  <div className="shop-top shop-collection-intro">
    <div className="shop-collection-copy">

      <h2 className="shop-collection-title">{tr.shopTitle}</h2>

      <p className="shop-subtext shop-collection-subtext">{tr.shopText}</p>
    </div>
  </div>

  <div
    className="shop-value-anchor shop-value-anchor-compact"
    aria-label={lang === "sr" ? "Zašto probati pre kupovine" : "Why try before you buy"}
  >
    <div className="shop-value-anchor-inner">
      <div className="shop-value-anchor-copy">
        <span className="shop-value-anchor-eyebrow">
          {lang === "sr" ? "PLAYNICE PRISTUP" : "THE PLAYNICE WAY"}
        </span>

        <h2 className="shop-value-anchor-title">
          {lang === "sr"
            ? "Probaj miris pre pune bočice."
            : "Try the scent before the full bottle."}
        </h2>

        <p className="shop-value-anchor-text">
          {lang === "sr"
            ? "Designer i niche parfemi često koštaju €80–€200+. Kod PlayNice možeš da ih upoznaš već od €4."
            : "Designer and niche bottles often cost €80–€200+. With PlayNice, you can get to know them from €4."}
        </p>
      </div>

      <div className="shop-value-anchor-points">
        <div className="shop-value-anchor-point">
          <span className="shop-value-anchor-point-value">€80–€200+</span>
          <span className="shop-value-anchor-point-label">
            {lang === "sr"
              ? "pune designer i niche bočice"
              : "designer and niche full bottles"}
          </span>
        </div>

        <div className="shop-value-anchor-point shop-value-anchor-point-highlight">
          <span className="shop-value-anchor-point-value">€3+</span>
          <span className="shop-value-anchor-point-label">
            {lang === "sr"
              ? "dovoljno da probaš pre kupovine"
              : "enough to try before you buy"}
          </span>
        </div>
      </div>

      <p className="shop-value-anchor-note">
        {lang === "sr"
          ? "Manje rizika. Više sigurnosti. Bolja odluka."
          : "Less risk. More certainty. A better decision."}
      </p>
    </div>
  </div>

      <div className="shop-toolbar shop-toolbar-compact">
  <div className="toolbar-group toolbar-group-search">
    <label htmlFor="shop-search">{tr.searchLabel}</label>

    <div className="compact-search-shell">
      <span className="compact-search-icon" aria-hidden="true">
        ⌕
      </span>

      <input
        id="shop-search"
        type="text"
        placeholder={tr.searchPlaceholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
  </div>

  <div className="toolbar-row-controls">
    <div className="toolbar-group toolbar-group-category">
      <label id="shop-category-label">{tr.categoryLabel}</label>

      <div
        className={`premium-category-select ${
          categoryMenuOpen ? "open" : ""
        }`}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) {
            setCategoryMenuOpen(false);
          }
        }}
      >
        <button
          type="button"
          className="premium-category-trigger"
          aria-labelledby="shop-category-label"
          aria-expanded={categoryMenuOpen}
          aria-controls="shop-category-menu"
          onClick={() => {
  setSeasonMenuOpen(false);
  setSortMenuOpen(false);
  setCategoryMenuOpen((open) => !open);
}}
        >
          <span>{selectedCategory.label}</span>
          <span className="premium-category-arrow" aria-hidden="true">
            ▾
          </span>
        </button>

        {categoryMenuOpen && (
          <div
            id="shop-category-menu"
            className="premium-category-menu"
            role="listbox"
            aria-labelledby="shop-category-label"
          >
            {categoryOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={category === option.value}
                className={`premium-category-option ${
                  category === option.value ? "active" : ""
                }`}
                onClick={() => {
                  setCategory(option.value);
                  setCategoryMenuOpen(false);
                }}
              >
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>

    <div className="toolbar-group toolbar-group-season">
  <label id="shop-season-label">{tr.seasonLabel}</label>

  <div
    className={`premium-category-select premium-filter-select ${
      seasonMenuOpen ? "open" : ""
    }`}
    onBlur={(e) => {
      if (!e.currentTarget.contains(e.relatedTarget)) {
        setSeasonMenuOpen(false);
      }
    }}
  >
    <button
      type="button"
      className="premium-category-trigger premium-filter-trigger"
      aria-labelledby="shop-season-label"
      aria-expanded={seasonMenuOpen}
      aria-controls="shop-season-menu"
      onClick={() => {
        setCategoryMenuOpen(false);
        setSortMenuOpen(false);
        setSeasonMenuOpen((open) => !open);
      }}
    >
      <span>{selectedSeasonOption.label}</span>

      <span className="premium-category-arrow" aria-hidden="true">
        ▾
      </span>
    </button>

    {seasonMenuOpen && (
      <div
        id="shop-season-menu"
        className="premium-category-menu premium-filter-menu"
        role="listbox"
        aria-labelledby="shop-season-label"
      >
        {seasonOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            role="option"
            aria-selected={season === option.value}
            className={`premium-category-option premium-filter-option ${
              season === option.value ? "active" : ""
            }`}
            onClick={() => {
              setSeason(option.value);
              setSeasonMenuOpen(false);
            }}
          >
            <span>{option.label}</span>
          </button>
        ))}
      </div>
    )}
  </div>
</div>

    <div className="toolbar-group toolbar-group-sort">
  <label id="shop-sort-label">{tr.sortLabel}</label>

  <div
    className={`premium-category-select premium-filter-select ${
      sortMenuOpen ? "open" : ""
    }`}
    onBlur={(e) => {
      if (!e.currentTarget.contains(e.relatedTarget)) {
        setSortMenuOpen(false);
      }
    }}
  >
    <button
      type="button"
      className="premium-category-trigger premium-filter-trigger"
      aria-labelledby="shop-sort-label"
      aria-expanded={sortMenuOpen}
      aria-controls="shop-sort-menu"
      onClick={() => {
        setCategoryMenuOpen(false);
        setSeasonMenuOpen(false);
        setSortMenuOpen((open) => !open);
      }}
    >
      <span>{selectedSortOption.label}</span>

      <span className="premium-category-arrow" aria-hidden="true">
        ▾
      </span>
    </button>

    {sortMenuOpen && (
      <div
        id="shop-sort-menu"
        className="premium-category-menu premium-filter-menu"
        role="listbox"
        aria-labelledby="shop-sort-label"
      >
        {sortOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            role="option"
            aria-selected={sortBy === option.value}
            className={`premium-category-option premium-filter-option ${
              sortBy === option.value ? "active" : ""
            }`}
            onClick={() => {
              setSortBy(option.value);
              setSortMenuOpen(false);
            }}
          >
            <span>{option.label}</span>
          </button>
        ))}
      </div>
    )}
  </div>
</div>
  </div>
</div>

{(category !== "All" ||
  season !== "All" ||
  sortBy !== "featured" ||
  searchTerm.trim() !== "") && (
  <div className="active-filters-bar active-filters-bar-compact">
    <div className="active-filters-left">
      {category !== "All" && (
        <span className="active-filter-chip">
          {getCategoryLabel(category)}
        </span>
      )}

      {season !== "All" && (
        <span className="active-filter-chip">
          {selectedSeasonOption.label}
        </span>
      )}

      {sortBy !== "featured" && (
        <span className="active-filter-chip">
          {selectedSortOption.label}
        </span>
      )}

      {searchTerm.trim() !== "" && (
        <span className="active-filter-chip">
          “{searchTerm.trim()}”
        </span>
      )}
    </div>

    <button
      type="button"
      className="clear-filters-button"
      onClick={() => {
        setCategory("All");
        setSeason("All");
        setSortBy("featured");
        setSearchTerm("");
      }}
    >
      {lang === "sr" ? "Obriši" : "Clear"}
    </button>
  </div>
)}

      {renderPagination("top")}

      <div className="product-grid">
        {paginatedProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            wishlist={wishlist}
            toggleWishlist={toggleWishlist}
            sprayingWishlistId={sprayingWishlistId}
          />
        ))}
      </div>

      <div className="pagination-wrap">
        {renderPagination("bottom")}
      </div>
    </section>
  </>
)}

<div className="section-divider"></div>

<footer className="site-footer">
  <div className="footer-benefits">
    <div className="footer-benefit">
      <i className="fa-solid fa-spray-can-sparkles"></i>
      <strong>{lang === "sr" ? "Dekanti" : "Decants"}</strong>
      <span>2ml, 5ml, 10ml, 20ml</span>
    </div>

    <div className="footer-benefit">
      <i className="fa-solid fa-truck-fast"></i>
      <strong>{lang === "sr" ? "Dostava" : "Delivery"}</strong>
      <span>{lang === "sr" ? "Širom Crne Gore" : "Across Montenegro"}</span>
    </div>

    <div className="footer-benefit">
      <i className="fa-solid fa-gift"></i>
      <strong>{lang === "sr" ? "Besplatna dostava" : "Free shipping"}</strong>
      <span>{lang === "sr" ? "Preko 39€" : "Over €39"}</span>
    </div>

    <div className="footer-benefit">
      <i className="fa-solid fa-hand-holding-heart"></i>
      <strong>{lang === "sr" ? "Plaćanje" : "Payment"}</strong>
      <span>{lang === "sr" ? "Pouzećem" : "Cash on delivery"}</span>
    </div>
  </div>

  <div className="site-footer-inner">
    <div className="footer-brand">
      <div className="footer-logo">PlayNice</div>
      <div className="footer-tagline">Remember. PlayNice.</div>

      <p className="footer-brand-text">
        {lang === "sr"
          ? "Kurirana selekcija designer, niche i Arabian parfema za one koji žele da probaju pre pune bočice."
          : "A curated selection of designer, niche and Arabian fragrances for those who want to try before committing to a full bottle."}
      </p>

      <div className="social-links">
        <a href="https://www.instagram.com/playnice.me/" target="_blank" rel="noreferrer" aria-label="PlayNice Instagram">
          <i className="fa-brands fa-instagram"></i>
        </a>

        <a href="https://wa.me/382XXXXXXXXX" target="_blank" rel="noreferrer" aria-label="PlayNice WhatsApp">
          <i className="fa-brands fa-whatsapp"></i>
        </a>

        <a href="https://tiktok.com/@playnice" target="_blank" rel="noreferrer" aria-label="PlayNice TikTok">
          <i className="fa-brands fa-tiktok"></i>
        </a>
      </div>
    </div>

    <div className="footer-column">
      <h4>{lang === "sr" ? "Navigacija" : "Navigation"}</h4>

      <button type="button" className="footer-link" onClick={() => switchView("home")}>
        {lang === "sr" ? "Početna" : "Home"}
      </button>

      <button type="button" className="footer-link" onClick={goToShop}>
        Shop
      </button>

      <button type="button" className="footer-link" onClick={handleJournalOpen}>
        Journal
      </button>

      <button type="button" className="footer-link" onClick={() => setStoryOpen(true)}>
        {lang === "sr" ? "Naša priča" : "Our Story"}
      </button>
    </div>

    <div className="footer-column">
      <h4>{lang === "sr" ? "Servis" : "Service"}</h4>

      <button type="button" className="footer-link" onClick={() => setHowItWorksOpen(true)}>
        {lang === "sr" ? "Kako funkcioniše?" : "How it works"}
      </button>

      <button type="button" className="footer-link" onClick={() => setPrivateSelectionOpen(true)}>
        Private Selection
      </button>

      <button
        type="button"
        className="footer-link"
        onClick={() => {
          document.getElementById("delivery-returns")?.scrollIntoView({
            behavior: "smooth",
            block: "center"
          });
        }}
      >
        {lang === "sr" ? "Dostava i povrat" : "Delivery & Returns"}
      </button>
    </div>

    <div className="footer-column footer-contact-column">
      <h4>{lang === "sr" ? "Kontakt" : "Contact"}</h4>

      <a href="mailto:info@playniceshop.me" className="footer-contact">
       info@playniceshop.me
      </a>

      <a href="https://www.instagram.com/playnice.me/" target="_blank" rel="noreferrer" className="footer-contact">
        @playnice.me
      </a>

      <p>{lang === "sr" ? "Dostava širom Crne Gore" : "Delivery across Montenegro"}</p>
    </div>
  </div>

  <div id="delivery-returns">
    <DeliveryReturnsMini surface="footer" />
  </div>

  <div className="footer-bottom">
    <p>
      © 2026 PlayNice.{" "}
      {lang === "sr" ? "Sva prava zadržana." : "All rights reserved."}
    </p>

    <div className="footer-bottom-links">
      <button
        type="button"
        className="footer-mini-link"
        onClick={() => {
          document.getElementById("delivery-returns")?.scrollIntoView({
            behavior: "smooth",
            block: "center"
          });
        }}
      >
        {lang === "sr" ? "Dostava i povrat" : "Delivery & Returns"}
      </button>

      <a href="mailto:order@playniceshop.me" className="footer-mini-link">
        {lang === "sr" ? "Kontakt" : "Contact"}
      </a>
    </div>
  </div>
</footer>
      </main>

      <div
        className={`backdrop ${
  cartOpen ||
  checkoutOpen ||
  selectedProduct ||
  storyOpen ||
  howItWorksOpen ||
  journalOpen ||
  privateSelectionOpen ||
  catalogPreview
    ? "show"
    : ""
}`}
        onClick={() => {
  setCartOpen(false);
  setCheckoutOpen(false);
  setStoryOpen(false);
  setPrivateSelectionOpen(false);
  setJournalOpen(false);
  setSelectedArticle(null);
  closeProductModal();
  setHowItWorksOpen(false);
  closeCatalogPreview();
}}
      />

      <aside className={`story-drawer ${storyOpen ? "open panel-open" : ""}`}>
        <div className="story-drawer-header panel-anim panel-anim-1">
          <div>
  <p className="section-kicker">
    {lang === "sr" ? "NAŠA PRIČA" : "OUR STORY"}
  </p>

  <h3>
    {lang === "sr"
      ? "Stvoreno da se pamti."
      : "Curated to be remembered."}
  </h3>
</div>

          <button
            className="close-button"
            type="button"
            onClick={() => setStoryOpen(false)}
            aria-label={
              lang === "sr" ? "Zatvori Story panel" : "Close story panel"
            }
          >
            ×
          </button>
        </div>

        <div className="story-drawer-body">
          <p className="story-drawer-lead panel-anim panel-anim-2">
            {lang === "sr"
              ? "PlayNice je nastao za ljude koji žele više od nasumične bočice na polici. Biramo dizajnerske, niche i arapske parfeme sa jednom jasnom idejom — probaj pre kupovine."
              : "PlayNice was created for people who want more than a random bottle on a shelf. We curate designer, niche, and Arabian fragrances with one simple idea in mind — try before you buy."}
          </p>

          <p className="panel-anim panel-anim-3">
            {lang === "sr"
              ? "Parfem ne treba birati na brzinu. Treba ga nositi, osetiti i zapamtiti. Zato PlayNice nudi ličniji način otkrivanja mirisa kroz pažljivo odabrane dekante i limitirane dropove."
              : "A fragrance should not be chosen in a rush. It should be worn, felt, and remembered. That is why PlayNice offers a more personal way to discover scent through carefully selected decants and limited drops."}
          </p>

          <p className="panel-anim panel-anim-4">
            {lang === "sr"
              ? "Ovde nije poenta prodati sve. Poenta je odabrati ono što zaista zaslužuje pažnju."
              : "This is not about selling everything. It is about selecting what deserves attention."}
          </p>

          <div className="story-drawer-points panel-anim panel-anim-5">
            <div className="panel-item-anim panel-item-1">
              {lang === "sr"
                ? "Dizajnerski, niche, i arapski izbor"
                : "Designer, niche, and Arabian curation"}
            </div>
            <div className="panel-item-anim panel-item-2">
              {lang === "sr"
                ? "Premium dekanti pre pune bočice"
                : "Premium decants before full bottles"}
            </div>
            <div className="panel-item-anim panel-item-3">
              {lang === "sr"
                ? "Limitirani dropovi i boutique pristup"
                : "Limited drops with boutique logic"}
            </div>
          </div>

          <div className="story-drawer-footer panel-anim panel-anim-6">
            <span className="story-drawer-signature">Remember. PlayNice.</span>

            <button
              className="gold-button small"
              type="button"
              onClick={() => {
                setStoryOpen(false);
                goToShop();
              }}
            >
              {lang === "sr" ? "Istraži kolekciju" : "Explore collection"}
            </button>
          </div>
        </div>
      </aside>

      <aside className={`how-it-works-drawer ${howItWorksOpen ? "open panel-open" : ""}`}>
  <div className="how-it-works-drawer-header panel-anim panel-anim-1">
    <div>
      <p className="section-kicker">HOW IT WORKS</p>
      <h3>
        {lang === "sr"
          ? "Šta su dekanti i zašto imaju smisla?"
          : "What decants are and why they matter?"}
      </h3>
    </div>

    <button
      className="close-button"
      type="button"
      onClick={() => setHowItWorksOpen(false)}
      aria-label={lang === "sr" ? "Zatvori prozor" : "Close panel"}
    >
      ×
    </button>
  </div>

  <div className="how-it-works-drawer-body">
    <p className="how-it-works-drawer-lead panel-anim panel-anim-2">
      {lang === "sr"
        ? "Dekanti su manja, pažljivo presuta pakovanja originalnih parfema. Namenjeni su onima koji žele da miris prvo dožive na svojoj koži, u svom ritmu, pre nego što se odluče za punu bočicu. Hiljade kupaca upravo tako donosi sigurnu odluku."
        : "Decants are smaller, carefully transferred portions of original fragrances. They are designed for those who want to experience a scent on their own skin, in their own rhythm, before committing to a full bottle. Thousands of customers make confident decisions this way."}
    </p>

    <div className="how-it-works-drawer-grid">
      <div className="how-it-works-drawer-card panel-item-anim panel-item-1">
        <h4>{lang === "sr" ? "Manji rizik" : "Lower risk"}</h4>
        <p>
          {lang === "sr"
            ? "Ne kupuješ naslepo. Prvo probaš, pa tek onda odlučuješ da li miris zaista vredi pune bočice."
            : "You do not buy blindly. You test first, then decide whether the fragrance deserves a full bottle."}
        </p>
      </div>

      <div className="how-it-works-drawer-card panel-item-anim panel-item-2">
        <h4>{lang === "sr" ? "Pametniji trošak" : "Smarter spending"}</h4>
        <p>
          {lang === "sr"
            ? "Umesto jedne skupe greške, možeš probati više parfema i pronaći ono što ti stvarno odgovara."
            : "Instead of making one expensive mistake, you can test several fragrances and find what truly fits you."}
        </p>
      </div>

      <div className="how-it-works-drawer-card panel-item-anim panel-item-3">
        <h4>{lang === "sr" ? "Više izbora" : "More variety"}</h4>
        <p>
          {lang === "sr"
            ? "Dekanti ti omogućuju da rotiraš više mirisa za različite prilike, godišnja doba i raspoloženja."
            : "Decants let you build a rotation for different occasions, seasons, and moods."}
        </p>
      </div>

      <div className="how-it-works-drawer-card panel-item-anim panel-item-4">
        <h4>{lang === "sr" ? "Originalni parfemi" : "Original fragrances"}</h4>
        <p>
          {lang === "sr"
            ? "Poenta nije u zameni za bočicu, već u tome da originalan parfem doživiš na pametniji i pristupačniji način."
            : "The point is not to replace the bottle, but to experience the original fragrance in a smarter and more accessible way."}
        </p>
      </div>
    </div>

    <div className="how-it-works-drawer-footer panel-anim panel-anim-4">
      <span className="story-drawer-signature">Remember. PlayNice.</span>

      <button
        className="gold-button small"
        type="button"
        onClick={() => {
          setHowItWorksOpen(false);
          goToShop();
        }}
      >
        {lang === "sr" ? "Istraži kolekciju" : "Explore collection"}
      </button>
    </div>
  </div>
</aside>

      <aside
        className={`private-selection-drawer ${
          privateSelectionOpen ? "open panel-open" : ""
        }`}
      >
        <div className="private-selection-header panel-anim panel-anim-1">
          <div>
            <p className="section-kicker">
              {lang === "sr" ? "PRIVATE SELECTION" : "PRIVATE SELECTION"}
            </p>
            <h3>{lang === "sr" ? "Sačuvani parfemi" : "Saved fragrances"}</h3>
          </div>

          <button
            className="close-button"
            type="button"
            onClick={() => setPrivateSelectionOpen(false)}
            aria-label={
              lang === "sr"
                ? "Zatvori Private Selection"
                : "Close Private Selection"
            }
          >
            ×
          </button>
        </div>

        {privateSelectionProducts.length === 0 ? (
          <div className="private-selection-empty panel-anim panel-anim-2">
            <p>
              {lang === "sr"
                ? "Još niste sačuvali nijedan parfem."
                : "You have not saved any fragrances yet."}
            </p>

            <span className="private-selection-empty-sub panel-anim panel-anim-3">
              {lang === "sr"
                ? "Klikni srce na kartici i sačuvaj favorite za kasnije."
                : "Tap the heart on a product card to save your favorites for later."}
            </span>

            <button
              className="gold-button small panel-anim panel-anim-4"
              type="button"
              onClick={() => {
                setPrivateSelectionOpen(false);
                goToShop();
              }}
            >
              {lang === "sr" ? "Istraži kolekciju" : "Explore collection"}
            </button>
          </div>
        ) : (
          <>
            <div className="private-selection-items">
              {privateSelectionProducts.map((product, index) => {
                const minPrice = getMinPrice(product);
                const copy = getProductCopy(product, lang);

                return (
                  <div
                    className={`private-selection-item panel-item-anim panel-item-${Math.min(
                      index + 1,
                      6
                    )}`}
                    key={product.id}
                  >
                    <button
                      type="button"
                      className="private-selection-item-media"
                      onClick={() => {
                        openProductModal(product);
                      }}
                      aria-label={product.name}
                    >
                      <img
                        src={product.image || "/placeholder.png"}
                        alt={product.name}
                        className="private-selection-item-image"
                      />
                    </button>

                    <div className="private-selection-item-info">
                      <span className="private-selection-item-category">
                        {getCategoryLabel(product.category)}
                      </span>

                      <h4>{product.name}</h4>

                      <p>{copy.card}</p>

                      <div className="private-selection-item-bottom">
                        <span className="private-selection-item-price">
                          <span>{tr.from}</span> €{minPrice}
                        </span>

                        <div className="private-selection-item-actions">
                          <button
                            type="button"
                            className="private-selection-link"
                            onClick={() => {
                              openProductModal(product);
                            }}
                          >
                            {lang === "sr" ? "Otvori" : "Open"}
                          </button>

                          <button
                            type="button"
                            className="private-selection-remove"
                            onClick={() => removeFromPrivateSelection(product.id)}
                          >
                            {lang === "sr" ? "Ukloni" : "Remove"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="private-selection-footer panel-anim panel-anim-3">
              <span className="story-drawer-signature">Remember. PlayNice.</span>

              <button
                className="gold-button small"
                type="button"
                onClick={() => {
                  setPrivateSelectionOpen(false);
                  goToShop();
                }}
              >
                {lang === "sr" ? "Dodaj još" : "Discover more"}
              </button>
            </div>
          </>
        )}
      </aside>

      <aside
  className={`cart-drawer ${cartOpen ? "open panel-open" : ""} ${
    cart.length === 0 ? "is-empty" : "has-items"
  }`}
>
  <div className="cart-drawer-header panel-anim panel-anim-1">
    <div>
      <p className="section-kicker">{tr.yourCart}</p>
      <h3>{tr.selectedItems}</h3>
    </div>

    <button
      className="close-button"
      type="button"
      onClick={() => setCartOpen(false)}
    >
      ×
    </button>
  </div>

  {cart.length === 0 ? (
    <div className="cart-empty panel-anim panel-anim-2">
      <p>{tr.cartEmpty}</p>

      <button
        className="gold-button small panel-anim panel-anim-3"
        type="button"
        onClick={() => {
          setCartOpen(false);
          goToShop();
        }}
      >
        {tr.goToShop}
      </button>
    </div>
  ) : (
    <>
      <div className="cart-scroll-area panel-anim panel-anim-2">
        <div className="cart-items">
          {cart.map((item, index) => (
            <div
              className={`cart-item panel-item-anim panel-item-${Math.min(
                index + 1,
                6
              )}`}
              key={item.key}
            >
              <div className="cart-item-info">
                <h4>{item.name}</h4>
                <p>{item.size}</p>
                <strong>{formatPrice(item.price)}</strong>
              </div>

              <div className="cart-item-actions">
                <div className="qty-control">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.key, -1)}
                  >
                    -
                  </button>

                  <span>{item.quantity}</span>

                  <button
                    type="button"
                    onClick={() => updateQuantity(item.key, 1)}
                  >
                    +
                  </button>
                </div>

                <button
                  className="remove-link"
                  type="button"
                  onClick={() => removeFromCart(item.key)}
                >
                  {tr.remove}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <div className="cart-total-row">
            <span>{tr.subtotal}</span>
            <strong>{formatPrice(subtotal)}</strong>
          </div>

          <div className="cart-total-row">
            <span>{tr.shipping}</span>
            <strong>
              {shipping === 0 && cart.length > 0
                ? "FREE"
                : formatPrice(shipping)}
            </strong>
          </div>

          <div
            className={`shipping-progress-card cart-shipping-note ${
              subtotal >= FREE_SHIPPING_THRESHOLD
                ? "shipping-note-unlocked"
                : "shipping-note-locked"
            }`}
          >
            <div className="shipping-note">
              {subtotal >= FREE_SHIPPING_THRESHOLD
                ? `${tr.freeShippingUnlocked} ✓`
                : lang === "sr"
                ? `Još ${formatPrice(
                    amountLeftForFreeShipping
                  )} do besplatne dostave`
                : `${formatPrice(
                    amountLeftForFreeShipping
                  )} away from free shipping`}
            </div>

            <div className="shipping-progress-bar">
              <div
                className="shipping-progress-fill"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>

          <div className="cart-trust-block">
            <div className="cart-trust-item">
              <span>✔</span>
              <span>
                {lang === "sr" ? "Plaćanje pouzećem" : "Cash on delivery"}
              </span>
            </div>

            <div className="cart-trust-item">
              <span>✔</span>
              <span>
                {lang === "sr"
                  ? "Potvrda i detalji stižu na email"
                  : "Confirmation and details sent by email"}
              </span>
            </div>

            <div className="cart-trust-item">
              <span>✔</span>
              <span>
                {lang === "sr"
                  ? "Dostava širom Crne Gore"
                  : "Delivery across Montenegro"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="cart-fixed-footer panel-anim panel-anim-6">
        <div className="cart-total-row cart-grand-total">
          <span>{tr.total}</span>
          <strong>{formatPrice(total)}</strong>
        </div>

        <button
          className="gold-button checkout-button cart-checkout-button"
          type="button"
          onClick={() => {
            setCartOpen(false);
            setCheckoutOpen(true);
          }}
        >
          {lang === "sr"
            ? "Dalje do podataka za dostavu"
            : "Continue to delivery details"}
        </button>

        <div className="cart-safe-note">
          {lang === "sr"
            ? "Bez online plaćanja — plaćate tek pri preuzimanju"
            : "No online payment — you pay only on delivery"}
        </div>
      </div>
    </>
  )}
</aside>

      {journalOpen && (
  <div
    className="journal-overlay"
    onClick={handleJournalClose}
  >    
  <section
      className="journal-top-sheet"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="journal-topbar">
        <div className="journal-topbar-copy">
          <div className="journal-kicker">{tr.journalKicker}</div>
          <h2 className="journal-heading">{tr.journalTitle}</h2>
          <p className="journal-subheading">{tr.journalSubtitle}</p>
        </div>

        <div className="journal-topbar-side">
          <div className="journal-topbar-quote">
            {lang === "sr"
              ? "Ne pišemo o parfemima. Pišemo o trenucima koje ostavljaju."
              : "We don’t write about perfumes. We write about moments they leave behind."}
          </div>
        </div>

        <button
  type="button"
  className="journal-close-btn"
  onClick={handleJournalClose}
  aria-label={tr.journalClose}
>
  ×
</button>

   </div>
      <div className="journal-body-scroll">

        {sortedJournalArticles?.[0] && (
  <article
    className="journal-featured journal-featured--split"
    onClick={() => handleJournalArticleOpen(sortedJournalArticles[0])}
  >
    <div className="journal-featured-copy">
      <div className="journal-featured-meta">
        <span>{sortedJournalArticles[0].date}</span>
        <span>{tr.journalReadingTime}</span>
      </div>

      <h2>{getJournalText(sortedJournalArticles[0].title, lang)}</h2>

      <div className="journal-author-signature">
        <div className="journal-author-avatar">
          {getJournalAvatarLetter(lang)}
        </div>

        <div className="journal-author-meta">
          <div className="journal-author-name">
            {tr.journalAuthorName}
          </div>
          <div className="journal-author-role">
            {tr.journalAuthorRole}
          </div>
        </div>
      </div>

      <p>{getJournalText(sortedJournalArticles[0].excerpt, lang)}</p>

      <div className="journal-featured-link">
        {tr.journalReadArticle}
      </div>
    </div>

    {sortedJournalArticles[0].image && (
      <div className="journal-featured-image-wrap">
        <img
          src={sortedJournalArticles[0].image}
          alt={getJournalText(sortedJournalArticles[0].title, lang)}
          className="journal-featured-image"
        />
      </div>
    )}
  </article>
)}

      {sortedJournalArticles.length > 1 && (
  <div className="journal-grid">
    {sortedJournalArticles.slice(1).map((article) => (
      <article
  key={article.id}
  className="journal-card"
  onClick={() => handleJournalArticleOpen(article)}
      >
        {article.image && (
          <div className="journal-card-media">
            <div
              className="journal-card-bg"
              style={{ backgroundImage: `url(${article.image})` }}
            />
          </div>
        )}

        <div className="journal-card-meta">
          <span className="journal-card-date">{article.date}</span>
          <span className="journal-reading-time">
            {tr.journalReadingTime}
          </span>
        </div>

        <h3 className="journal-card-title">
          {getJournalText(article.title, lang)}
        </h3>

        <div className="journal-author-signature small">
          <div className="journal-author-avatar">
            {getJournalAvatarLetter(lang)}
          </div>

          <div className="journal-author-meta">
            <div className="journal-author-name">
              {tr.journalAuthorName}
            </div>
            <div className="journal-author-role">
              {tr.journalAuthorRole}
            </div>
          </div>
        </div>

        <p className="journal-card-excerpt">
          {getJournalText(article.excerpt, lang)}
        </p>

        <div className="journal-card-link">
          {tr.journalReadArticle}
        </div>
      </article>
    ))}
  </div>
)}
      </div>
    </section>
  </div>
)}

{selectedArticle && (
  <div
    className="journal-article-overlay"
    onClick={() => setSelectedArticle(null)}
  >
    <div
      className="journal-article-modal"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="journal-article-sticky-head">
        <div className="journal-article-head">
          <div className="journal-card-meta">
            <span className="journal-card-date">{selectedArticle.date}</span>
            <span className="journal-reading-time">
              {tr.journalReadingTime}
            </span>
          </div>

          <button
            type="button"
            className="journal-close-btn"
            onClick={() => setSelectedArticle(null)}
            aria-label={tr.journalCloseArticle}
          >
            ×
          </button>
        </div>

        <h2 className="journal-article-title">
          {getJournalText(selectedArticle.title, lang)}
        </h2>

        <div className="journal-author-signature">
          <div className="journal-author-avatar">
            {getJournalAvatarLetter(lang)}
          </div>

          <div className="journal-author-meta">
            <div className="journal-author-name">
              {tr.journalAuthorName}
            </div>
            <div className="journal-author-role">
              {tr.journalAuthorRole}
            </div>
          </div>
        </div>
      </div>

      <div className="journal-article-scroll">
        <p className="journal-article-body">
          {getJournalText(selectedArticle.content, lang)}
        </p>

        <div className="journal-inline-feedback-row">
          <div className="journal-inline-feedback-cluster">
            <button
  type="button"
  className={`jf-btn jf-up ${
    activeJournalFeedback?.vote === "up" ? "active" : ""
  }`}
  onClick={() => handleJournalFeedbackVote(selectedArticle, "up")}
  aria-label={lang === "sr" ? "Pozitivan feedback" : "Positive feedback"}
>
  <span className="jf-icon">👍</span>
  {journalVoteSuccess === "up" && (
    <span className="jf-check" aria-hidden="true">
      ✓
    </span>
  )}
</button>

            <div className="journal-feedback-inline-shell">
  <div className="journal-feedback-inline-inner">
    <input
      type="text"
      maxLength={180}
      value={activeJournalFeedback?.note || ""}
      onChange={(e) =>
        handleJournalFeedbackNoteChange(
          selectedArticle,
          e.target.value
        )
      }
      placeholder={
        lang === "sr"
          ? "Feedback u jednoj rečenici..."
          : "Feedback in one sentence..."
      }
      className="journal-feedback-inline-input"
    />

    {(activeJournalFeedback?.note || "").length > 0 && (
      <span className="journal-feedback-inline-count">
        {(activeJournalFeedback?.note || "").length}/180
      </span>
    )}

    <button
      type="button"
      className={`journal-feedback-inline-send ${
        journalFeedbackSuccess ? "is-success" : ""
      }`}
      onClick={() => handleJournalFeedbackSubmit(selectedArticle)}
      disabled={!activeJournalFeedback?.vote}
    >
      <span className="jf-send-label">
        {lang === "sr" ? "Pošalji" : "Send"}
      </span>

      <span className="jf-send-check" aria-hidden="true">
        ✓
      </span>
    </button>
  </div>
</div>

<button
  type="button"
  className={`jf-btn jf-down ${
    activeJournalFeedback?.vote === "down" ? "active" : ""
  }`}
  onClick={() => handleJournalFeedbackVote(selectedArticle, "down")}
  aria-label={lang === "sr" ? "Negativan feedback" : "Negative feedback"}
>
  <span className="jf-icon">👎</span>
  {journalVoteSuccess === "down" && (
  <span className="jf-cross" aria-hidden="true">
    ✕
  </span>
)}
</button>
          </div>
        </div>

        {getRelatedJournalProducts(selectedArticle).length > 0 && (
  <div className="journal-related-products">
    <div className="journal-related-kicker">
      {lang === "sr"
        ? "Mirisi iz ove priče"
        : "Featured in this story"}
    </div>

    <div className="journal-related-links">
      {getRelatedJournalProducts(selectedArticle).map((product) => (
        <button
          key={product.id}
          type="button"
          className="journal-related-text-link"
          onClick={() => {
            openProductModal(product);
          }}
        >
          {product.name}
        </button>
      ))}
    </div>
  </div>
)}
      </div>
    </div>
  </div>
)}

      {selectedProduct && (
  <div
    className={`modal-overlay product-modal-layer ${
      productModalVisible ? "show" : ""
    }`}
    onClick={closeProductModal}
  >
    <div
      className={`product-modal ${productModalVisible ? "open panel-open" : ""}`}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        className="close-button"
        type="button"
        onClick={closeProductModal}
        aria-label={lang === "sr" ? "Zatvori prozor" : "Close modal"}
      >
        ×
      </button>

      <div className="modal-header panel-anim panel-anim-1">
        <span className="modal-eyebrow">PRIVATE DETAIL</span>
        <h2>{selectedProduct.name}</h2>

        <div className="modal-header-meta">
          {selectedProduct.rating ? (
            <div className="modal-rating panel-item-anim panel-item-1">
              <div className="modal-rating-stars" aria-hidden="true">
                {Array.from({ length: 10 }).map((_, index) => (
                  <span
                    key={index}
                    className={
                      index < Math.round(selectedProduct.rating) ? "filled" : ""
                    }
                  >
                    ★
                  </span>
                ))}
              </div>

              <div className="modal-rating-meta">
                <span className="modal-rating-score">
                  {selectedProduct.rating.toFixed(1)}
                </span>
                <span className="modal-rating-label">
                  / 10 • {selectedProduct.ratingLabel}
                </span>
              </div>
            </div>
          ) : (
            <div />
          )}

          {selectedProduct.inspiredBy?.name && (
            <div className="modal-inspired-mini panel-item-anim panel-item-2">
              <span className="modal-inspired-mini-label">
                {lang === "sr" ? "INSPIRISANO" : "INSPIRED BY"}
              </span>

              <strong className="modal-inspired-mini-name">
                {selectedProduct.inspiredBy.name}
              </strong>

              {selectedProduct.inspiredBy.short && (
                <span className="modal-inspired-mini-short">
                  {selectedProduct.inspiredBy.short}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="modal-body">
        <div className="modal-media panel-anim panel-anim-2">
          {selectedProduct.badge && (
            <span className="modal-badge panel-item-anim panel-item-1">
              {selectedProduct.badge}
            </span>
          )}

          <div className="modal-image-wrap panel-item-anim panel-item-2">
            {selectedProduct.image ? (
              <img
                src={selectedProduct.image}
                alt={selectedProduct.name}
                className="modal-image"
              />
            ) : (
              <div className="modal-monogram">
                {selectedProduct.name.charAt(0)}
              </div>
            )}
          </div>

          <div className="modal-media-meta panel-item-anim panel-item-3">
            <span className="modal-category">
              {lang === "sr"
                ? selectedProduct.category === "Arabian"
                  ? "ARAPSKI"
                  : selectedProduct.category === "Designer"
                  ? "DIZAJNERSKI"
                  : selectedProduct.category === "Niche"
                  ? "NICHE"
                  : selectedProduct.category.toUpperCase()
                : selectedProduct.category.toUpperCase()}
            </span>

            <p>
              {selectedCopy.dominantNotes?.join(" • ") ||
                (lang === "sr"
                  ? "Premium mirisna selekcija"
                  : "Premium fragrance selection")}
            </p>
          </div>
        </div>

        <div className="modal-content panel-anim panel-anim-3">
          {selectedCopy.miniTag && (
            <span className="modal-chip panel-item-anim panel-item-1">
              {selectedCopy.miniTag}
            </span>
          )}

          <p className="modal-description panel-item-anim panel-item-2">
            {selectedCopy.modal ||
              (lang === "sr"
                ? "Luksuzan miris sa izraženim karakterom i premium prisustvom."
                : "A luxurious scent with strong character and premium presence.")}
          </p>

          <p className="product-modal-anchor panel-item-anim panel-item-3">
            {lang === "sr" ? (
              <>
                Prvo ga <strong>probaj na svojoj koži</strong> — pre nego što se
                odlučiš za bočicu.
              </>
            ) : (
              <>
                Try it <strong>on your skin first</strong> — before committing to
                the bottle.
              </>
            )}
          </p>

          <div className="modal-info-grid">
            <div className="modal-info-card panel-item-anim panel-item-4">
              <span>
                {lang === "sr" ? "DOMINANTNE NOTE" : "DOMINANT NOTES"}
              </span>
              <strong>
                {selectedCopy.dominantNotes?.join(" • ") ||
                  (lang === "sr" ? "premium akordi" : "premium accords")}
              </strong>
            </div>

            <div className="modal-info-card panel-item-anim panel-item-5">
              <span>
                {lang === "sr"
                  ? "ZAŠTO KUPCI BIRAJU OVAJ PARFEM"
                  : "WHY CUSTOMERS CHOOSE THIS FRAGRANCE"}
              </span>
              <strong>
                {selectedCopy.whyChoose ||
                  (lang === "sr"
                    ? "Odličan izbor za one koji žele upečatljiv premium miris."
                    : "An excellent choice for those who want a memorable premium scent.")}
              </strong>
            </div>
          </div>

          <div className="modal-purchase">
            <div className="modal-size-block panel-item-anim panel-item-6">
              <span className="modal-label">
                {lang === "sr" ? "IZABERI VELIČINU" : "CHOOSE SIZE"}
              </span>

              <p className="modal-size-helper">
                {(() => {
                  if (!selectedSize) {
                    return lang === "sr"
                      ? "Kreni manjom količinom. Nosi ga prvo."
                      : "Start small. Wear it first.";
                  }

                  if (selectedSize.includes("2ml")) {
                    return lang === "sr"
                      ? "Brzi test na koži."
                      : "Quick skin test.";
                  }

                  if (selectedSize.includes("5ml")) {
                    return (
                      <>
                        {lang === "sr" ? "Testiraj " : "Test it over "}
                        <strong>
                          {lang === "sr" ? "nekoliko dana" : "a few days"}
                        </strong>
                      </>
                    );
                  }

                  if (selectedSize.includes("10ml")) {
                    return (
                      <>
                        {lang === "sr" ? "Savršen za " : "Perfect for "}
                        <strong>
                          {lang === "sr"
                            ? "svakodnevno nošenje"
                            : "daily wear"}
                        </strong>
                      </>
                    );
                  }

                  if (selectedSize.includes("20ml")) {
                    return (
                      <>
                        {lang === "sr" ? "Skoro kao " : "Almost like a "}
                        <strong>
                          {lang === "sr" ? "mala bočica" : "small bottle"}
                        </strong>
                      </>
                    );
                  }

                  return null;
                })()}
              </p>

              <div className="modal-sizes">
                {Object.entries(selectedProduct.sizes).map(
                  ([size, price], index) => (
                    <button
                      key={size}
                      type="button"
                      className={`modal-size ${
                        selectedSize === size ? "active" : ""
                      } panel-item-anim panel-item-${Math.min(index + 1, 6)}`}
                      onClick={() => {
                        setSelectedSize(size);
                        setHasUserPickedSize(true);
                      }}
                    >
                      <span>{size}</span>
                      <strong>{formatPrice(price)}</strong>
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="modal-purchase-bar panel-anim panel-anim-3">
              <div className="modal-price-box">
                <span>
                  {lang === "sr" ? "IZABRANA CENA" : "SELECTED PRICE"}
                </span>
                <strong>
                  {formatPrice(
                    selectedProduct.sizes[selectedSize] ??
                      Object.values(selectedProduct.sizes)[0]
                  )}
                </strong>
              </div>

              <div className="modal-cta-group">
                {(() => {
  const activeSize =
    selectedSize || Object.keys(selectedProduct.sizes)[0];

  const modalKey = `${selectedProduct.id}-${activeSize}`;
  const isModalAdded = modalAddedKey === modalKey;

  return (
    <button
      type="button"
      className={`modal-add-button ${isModalAdded ? "is-added" : ""}`}
      onClick={() => {
        handleModalAddToCart(selectedProduct, activeSize);
      }}
      aria-live="polite"
    >
      <span>
        {isModalAdded
          ? lang === "sr"
            ? "DODATO ✓"
            : "ADDED ✓"
          : lang === "sr"
            ? "DODAJ U KORPU"
            : "ADD TO CART"}
      </span>
    </button>
  );
})()}

                {hasUserPickedSize && (
                  <button
                    type="button"
                    className="modal-buy-now"
                    onClick={() => {
                      const activeSize =
                        selectedSize || Object.keys(selectedProduct.sizes)[0];

                      addToCart(selectedProduct, activeSize, null, null, {
                        showToast: false
                      });
                      setCartOpen(false);
                      setCheckoutOpen(true);
                      closeProductModal();
                    }}
                  >
                    {lang === "sr" ? "KUPI ODMAH" : "BUY NOW"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)}

      <div className={`checkout-modal ${checkoutOpen ? "open panel-open" : ""}`}>
  <div className="checkout-header panel-anim panel-anim-1">
    <div>
      <p className="section-kicker">{tr.checkoutKicker}</p>
      <h3>{tr.checkoutTitle}</h3>
      <p className="checkout-subnote">
        {lang === "sr"
          ? "Plaćanje pouzećem — potvrda narudžbine i detalji stižu na email."
          : "Cash on delivery — order confirmation and details will be sent by email."}
      </p>
    </div>
    <button
      className="close-button"
      type="button"
      onClick={() => setCheckoutOpen(false)}
      aria-label={lang === "sr" ? "Zatvori prozor" : "Close modal"}
    >
      ×
    </button>
  </div>

  <div className="checkout-grid">
    <div className="checkout-form panel-anim panel-anim-2">
      <div className="form-row two panel-item-anim panel-item-1">
        <input
          name="firstName"
          placeholder={tr.firstName}
          value={checkoutForm.firstName}
          onChange={handleCheckoutInput}
        />
        <input
          name="lastName"
          placeholder={tr.lastName}
          value={checkoutForm.lastName}
          onChange={handleCheckoutInput}
        />
      </div>

      <div className="form-row two panel-item-anim panel-item-2">
        <input
          name="email"
          type="email"
          placeholder={tr.email}
          value={checkoutForm.email}
          onChange={handleCheckoutInput}
        />
        <input
          name="phone"
          placeholder={tr.phone}
          value={checkoutForm.phone}
          onChange={handleCheckoutInput}
        />
      </div>

      <div className="form-row two panel-item-anim panel-item-3">
  <select
    name="country"
    value={checkoutForm.country}
    onChange={handleCheckoutInput}
    aria-label={lang === "sr" ? "Zemlja dostave" : "Delivery country"}
  >
    {checkoutCountryOptions.map((country) => (
      <option key={country.value} value={country.value}>
        {lang === "sr" ? country.sr : country.en}
      </option>
    ))}
  </select>

  <input
    name="city"
    placeholder={tr.city}
    value={checkoutForm.city}
    onChange={handleCheckoutInput}
  />
</div>

<div className="form-row panel-item-anim panel-item-4">
  <input
    name="address"
    placeholder={tr.address}
    value={checkoutForm.address}
    onChange={handleCheckoutInput}
  />
</div>

{isInternationalEnquiry && (
  <div className="checkout-international-note panel-item-anim panel-item-5">
    <strong>
      {lang === "sr"
        ? "Dostava van Crne Gore nije automatski dostupna."
        : "Delivery outside Montenegro is not automatically available."}
    </strong>
    <span>
      {lang === "sr"
        ? " Pošaljite upit — proverićemo da li je dostava moguća za vašu zemlju i javiti vam se."
        : " Send an enquiry — we’ll check whether delivery is possible for your country and get back to you."}
    </span>
  </div>
)}

      <div className="form-row panel-item-anim panel-item-4">
        <textarea
          name="note"
          placeholder={tr.note}
          rows="4"
          value={checkoutForm.note}
          onChange={handleCheckoutInput}
        />
      </div>

      <div className="checkout-trust panel-item-anim panel-item-6">
        <div className="checkout-trust-item">
          <span>✔</span>
          <span>
            {lang === "sr"
              ? "Plaćanje pouzećem — plaćate tek kada pošiljka stigne"
              : "Cash on delivery — you pay only when your order arrives"}
          </span>
        </div>
        <div className="checkout-trust-item">
          <span>✔</span>
          <span>
            {lang === "sr"
              ? "Potvrda narudžbine i svi detalji stižu na email"
              : "Order confirmation and all details will be sent by email"}
          </span>
        </div>
        <div className="checkout-trust-item">
          <span>✔</span>
          <span>
            {lang === "sr"
              ? "100% original parfemi i premium dekanti"
              : "100% original fragrances and premium decants"}
          </span>
        </div>
        <div className="checkout-trust-item">
          <span>✔</span>
          <span>
            {isMontenegroOrder
  ? lang === "sr"
    ? "Dostava širom Crne Gore"
    : "Delivery across Montenegro"
  : lang === "sr"
  ? "Za dostavu van Crne Gore šaljete upit — bez automatske porudžbine"
  : "For delivery outside Montenegro, you send an enquiry — not an automatic order"}
          </span>
        </div>
      </div>

      {orderSuccessMessage && (
        <div className="order-success-message panel-item-anim panel-item-7">
          {orderSuccessMessage}
        </div>
      )}

      <button
  className="gold-button submit-order-button panel-anim panel-anim-4"
  type="button"
  onClick={isMontenegroOrder ? handlePlaceOrder : handleInternationalEnquiry}
  disabled={isSubmittingOrder}
>
  {isSubmittingOrder
    ? tr.placingOrder
    : isMontenegroOrder
    ? lang === "sr"
      ? "Naruči — plaćanje pouzećem"
      : "Order — pay on delivery"
    : lang === "sr"
    ? "Pošalji upit za dostavu"
    : "Send delivery enquiry"}
</button>

      <div className="checkout-safe-note panel-anim panel-anim-5">
  {isMontenegroOrder
    ? lang === "sr"
      ? "Bez online plaćanja — nakon narudžbine dobijate potvrdu i sve informacije na email."
      : "No online payment — after placing your order, you will receive confirmation and all details by email."
    : lang === "sr"
    ? "Ovo nije automatska porudžbina — šaljete upit za dostavu van Crne Gore."
    : "This is not an automatic order — you are sending a delivery enquiry outside Montenegro."}
</div>
    </div>

    <div className="checkout-summary panel-anim panel-anim-3">
      <h4>{tr.orderSummary}</h4>

      {cart.length === 0 ? (
  <p className="checkout-empty panel-item-anim panel-item-1">
    {tr.noItemsCart}
  </p>
) : (
  <>

  <div className="checkout-summary-scroll">
  <div className="checkout-summary-items">
    {cart.map((item, index) => (
      <div
        className={`checkout-summary-item panel-item-anim panel-item-${Math.min(
          index + 1,
          6
        )}`}
        key={item.key}
      >
        <div>
          <strong>{item.name}</strong>
          <p>
            {item.size} × {item.quantity}
          </p>
        </div>

        <span>{formatPrice(item.price * item.quantity)}</span>
      </div>
    ))}
  </div>

  {isMontenegroOrder && (
    <div
      className={`shipping-progress-card checkout-shipping-note panel-anim panel-anim-4 ${
        subtotal >= FREE_SHIPPING_THRESHOLD
          ? "shipping-note-unlocked"
          : "shipping-note-locked"
      }`}
    >
      <div className="shipping-note">
        {subtotal >= FREE_SHIPPING_THRESHOLD
          ? `${tr.freeShippingUnlocked} ✓`
          : tr.freeShippingProgress.replace(
              "{{amount}}",
              formatPrice(amountLeftForFreeShipping)
            )}
      </div>

      <div className="shipping-progress-bar">
        <div
          className="shipping-progress-fill"
          style={{ width: `${freeShippingProgress}%` }}
        />
      </div>
    </div>
  )}

  {isInternationalEnquiry && (
    <div className="checkout-shipping-note international-shipping-note panel-anim panel-anim-4">
      {lang === "sr"
        ? "Dostava van Crne Gore se proverava posebno — poslaćemo vam odgovor sa mogućnostima i cenom."
        : "Delivery outside Montenegro is checked separately — we’ll reply with availability and shipping cost."}
    </div>
  )}
</div>

    <DeliveryReturnsMini surface="checkout" />

    <div className="checkout-totals panel-anim panel-anim-6">
  <div>
    <span>{isInternationalEnquiry ? (lang === "sr" ? "Proizvodi" : "Products") : tr.subtotal}</span>
    <strong>{formatPrice(subtotal)}</strong>
  </div>

  <div>
    <span>{tr.shipping}</span>
    <strong>
      {isInternationalEnquiry
        ? lang === "sr"
          ? "Po dogovoru"
          : "To be confirmed"
        : shipping === 0 && cart.length > 0
        ? "FREE"
        : formatPrice(shipping)}
    </strong>
  </div>

  <div className="grand-total">
    <span>{tr.total}</span>
    <strong>
      {isInternationalEnquiry
        ? lang === "sr"
          ? "Biće potvrđeno"
          : "To be confirmed"
        : formatPrice(total)}
    </strong>
  </div>
</div>
  </>
)}
    </div>
  </div>
</div>

      {catalogPreview && (
        <div className="catalog-modal-overlay" onClick={closeCatalogPreview}>
          <div className="catalog-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="catalog-modal-close"
              onClick={closeCatalogPreview}
            >
              ×
            </button>

            <iframe
              src={catalogPreview}
              title="Catalog Preview"
              className="catalog-modal-frame"
            />

            <a
              href={catalogPreview}
              download
              className="catalog-modal-download"
            >
              {lang === "sr" ? "Preuzmi PDF" : "Download PDF"}
            </a>
          </div>
        </div>
      )}

      {showStickyCta && (
        <div className="sticky-cta-shell" aria-live="polite">
         <div className="sticky-cta-button">
      <button
        type="button"
        className="sticky-cta-main"
        onClick={stickyCtaData.onClick}
      >
        <span className="sticky-cta-copy">
          <strong>{stickyCtaData.label}</strong>
          <small>{stickyCtaData.sublabel}</small>
        </span>

        <span className="sticky-cta-arrow" aria-hidden="true">
          →
        </span>
      </button>

      <button
        type="button"
        className={`sticky-cta-journal-link ${
          stickyCtaJournalHasNew ? "has-new" : ""
        }`}
        onClick={handleStickyCtaJournalClick}
        aria-label={lang === "sr" ? "Otvori Journal" : "Open Journal"}
      >
        Read me
      </button>
    </div>
  </div>
)}
    </div>
  );
}

export default App;