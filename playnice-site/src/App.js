import React, { useEffect, useLayoutEffect, useMemo, useRef, useState, useCallback } from "react";
import "./App.css";
import HeaderNext from "./HeaderNext";
import Exhibition from "./Exhibition";
import JournalPage, { getJournalArticleSlug } from "./JournalPage";
import JournalArticlePage from "./JournalArticlePage";
import { trackPageView, trackEvent, trackMeta } from "./lib/ga";
import { journalArticles } from "./data/journal";
import { categoryLabels, products } from "./data/products";
import { productCopy, fallbackCopy } from "./data/products/productCopy";
import { productWearContext } from "./data/products/productWearContext";
import { discoveryProfiles } from "./data/products/discoveryProfiles";
import { translations } from "./data/translations";
import { BASE_HERO_SLIDES } from "./data/heroSlides.generated";
import TheNoteMap from "./TheNoteMap";
import { discoverFragrances } from "./lib/discoveryEngine";

const JOURNAL_SEEN_KEY = "playnice_latest_journal_seen_v1";

const normalizeShopSearch = (value = "") =>
  String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();

/* =========================================
   SEO helper
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
    products.find((product) => getProductSlug(product) === slugFromUrl) || null
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
  const fallbackCopy = productCopy?.[product?.name];

  const copy = directCopy || fallbackCopy;

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
  const sizeText = sizes.length ? sizes.join(", ") : lang === "en" ? "decants" : "dekantima";
  const lowestPrice = getSeoLowestPrice(product);
  const productCopyText = getSeoProductCopy(product, lang);
  const seasonText = getSeoSeasonText(product?.season, lang);

  if (lang === "en") {
    return [
      `${name} is available at PlayNice as ${getEnglishArticle(category)} ${category} in ${sizeText} sizes${lowestPrice ? ` from €${lowestPrice}` : ""}.`,
      productCopyText,
      seasonText,
      "Try before you buy, with delivery across Montenegro and payment on delivery."
    ]
      .filter(Boolean)
      .join(" ");
  }

  return [
    `${name} je dostupan u PlayNice ponudi kao ${category} u ${sizeText} dekantima${lowestPrice ? ` već od €${lowestPrice}` : ""}.`,
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
   JOURNAL SEO HELPERS
========================================= */

const getJournalSeoUrl = (article = null) => {
  if (!article) {
    return `${SITE_BASE_URL}/journal`;
  }

  const slug = getJournalArticleSlug(article);

  return slug
    ? `${SITE_BASE_URL}/journal/${slug}`
    : `${SITE_BASE_URL}/journal`;
};

const getJournalSeoImage = (article = null) => {
  const image = article?.image;

  if (!image) {
    return `${SITE_BASE_URL}/og-image.jpg`;
  }

  if (/^https?:\/\//i.test(image)) {
    return image;
  }

  return `${SITE_BASE_URL}${image.startsWith("/") ? "" : "/"}${image}`;
};

const getJournalSeoTitle = (article, lang = "sr") => {
  if (!article) {
    return lang === "en"
      ? "Le Journal | Stories, fragrance & culture | PlayNice"
      : "Le Journal | Priče, parfemi i kultura | PlayNice";
  }

  const title = getJournalText(article.title, lang);

  return `${title} | Le Journal | PlayNice`;
};

const getJournalSeoDescription = (article, lang = "sr") => {
  if (!article) {
    return lang === "en"
      ? "Le Journal by PlayNice — stories about fragrance, people, culture, questionable decisions and everything that somehow connects them."
      : "Le Journal by PlayNice — priče o parfemima, ljudima, kulturi, sumnjivim odlukama i svemu što ih nekako povezuje.";
  }

  const excerpt = getJournalText(article.excerpt, lang).trim();

  if (!excerpt) {
    return lang === "en"
      ? "Read the latest story from Le Journal by PlayNice."
      : "Pročitaj priču iz PlayNice Le Journala.";
  }

  if (excerpt.length <= 160) {
    return excerpt;
  }

  return `${excerpt.slice(0, 157).trim()}...`;
};

const getJournalStructuredData = (article, lang = "sr") => {
  if (!article) return null;

  const title = getJournalText(article.title, lang);
  const description = getJournalSeoDescription(article, lang);
  const url = getJournalSeoUrl(article);
  const image = getJournalSeoImage(article);

  return {
    "@context": "https://schema.org",
    "@type": "Article",

    headline: title,
    description,
    image: [image],
    url,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url
    },

    author: {
      "@type": "Person",
      name: lang === "sr" ? "Čarli" : "Charlie"
    },

    publisher: {
      "@type": "Organization",
      name: "PlayNice",
      url: SITE_BASE_URL
    },

    inLanguage: lang === "sr" ? "sr" : "en",

    isPartOf: {
      "@type": "Blog",
      name: "Le Journal",
      url: `${SITE_BASE_URL}/journal`
    }
  };
};

/* =========================================
   Arabian fragrance "AN" HELPER
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
const PRODUCT_PAGE_SIZE_OPTIONS = [12, 24, 48, 96];
const DISCOVERY_RESULTS_PER_PAGE = 5;
const SHIPPING_COST = 4.0;
const FREE_SHIPPING_THRESHOLD = 39;

function formatPrice(value) {
  return `€${Number(value).toFixed(2)}`;
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
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
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  window.scrollTo({
    top: 0,
    left: 0,
    behavior: reduceMotion ? "auto" : "smooth"
  });
}

function getDefaultLanguage() {
  if (typeof window === "undefined") return "sr";

  let savedLang = null;

  try {
    savedLang = window.localStorage.getItem("playnice_lang");
  } catch {}

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

function getProductCopy(product, lang) {
  const copy = productCopy[product.name] || fallbackCopy;

  return {
    miniTag:
      copy.miniTag?.[lang] || copy.miniTag?.en || fallbackCopy.miniTag[lang],
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
    .map((relatedRef) => {
      const normalizedRef = String(relatedRef || "").trim();

      if (!normalizedRef) return null;

      return (
        products.find(
          (product) => getProductSlug(product) === normalizedRef
        ) ||
        products.find(
          (product) =>
            product.name?.trim().toLowerCase() ===
            normalizedRef.toLowerCase()
        ) ||
        null
      );
    })
    .filter(Boolean);
};

const getJournalArticleKey = (article) => {
  if (!article) return "";
  return article.id || article.slug || article.title?.en || article.title?.sr || article.title || "";
};

const getJournalArticleFromCurrentUrl = () => {
  if (typeof window === "undefined") return null;

  const path = window.location.pathname;

  const match = path.match(/^\/journal\/([^/]+)$/);

  if (!match?.[1]) return null;

  const slugFromUrl = decodeURIComponent(match[1]);

  return (
    journalArticles.find(
      (article) => getJournalArticleSlug(article) === slugFromUrl
    ) || null
  );
};

const getInitialView = () => {
  if (typeof window === "undefined") return "home";

  const path = window.location.pathname;

  if (path === "/shop") return "shop";
  if (path === "/journal" || path.startsWith("/journal/")) return "journal";
  if (path === "/exhibition") return "exhibition";
  if (path.startsWith("/product/")) return "shop";

  const params = new URLSearchParams(window.location.search);
  const urlView = params.get("view");

  return ["home", "shop", "journal", "exhibition"].includes(urlView)
    ? urlView
    : "home";
};

const shuffleHeroSlides = (slides) => {
  const shuffled = [...slides];

  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[i]];
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
   getInitialShopState
========================================= */

const getInitialShopState = () => {
  const defaults = {
    category: "All",
    searchTerm: "",
    currentPage: 1,
    sortBy: "featured",
    season: "All",
    scentMood: "All"
  };

  if (typeof window === "undefined") return defaults;

  const params = new URLSearchParams(window.location.search);

  const category = params.get("category");
  const searchTerm = params.get("search") || "";
  const sortBy = params.get("sort");
  const season = params.get("season");
  const scentMood = params.get("mood");
  const parsedPage = Number(params.get("page"));

  return {
    category: ["All", "Arabian", "Designer", "Niche"].includes(category)
      ? category
      : defaults.category,

    searchTerm,

    currentPage:
      Number.isInteger(parsedPage) && parsedPage > 0
        ? parsedPage
        : defaults.currentPage,

    sortBy: [
      "featured",
      "rating",
      "priceLow",
      "priceHigh",
      "name"
    ].includes(sortBy)
      ? sortBy
      : defaults.sortBy,

    season: ["All", "summer", "winter"].includes(season)
      ? season
      : defaults.season,

    scentMood: [
      "clean",
      "summer",
      "date",
      "rich",
      "soft",
      "signature"
    ].includes(scentMood)
      ? scentMood
      : defaults.scentMood
  };
};

/* =========================================
   APP
========================================= */
  function App() {

  const headerVariant = useMemo(() => {
    if (typeof window === "undefined") return "next";

    return new URLSearchParams(window.location.search).get("header") === "classic"
      ? "classic"
      : "next";
  }, []);

    const initialShopStateRef = useRef(null);

  if (initialShopStateRef.current === null) {
    initialShopStateRef.current = getInitialShopState();
  }

  const initialShopState = initialShopStateRef.current;

  /* =========================================
     APP STATE
  ========================================= */
  const [lang, setLang] = useState(() => getDefaultLanguage());
  const [view, setView] = useState(() => getInitialView());
  const [category, setCategory] = useState(initialShopState.category);
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const [seasonMenuOpen, setSeasonMenuOpen] = useState(false);
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(initialShopState.searchTerm);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [addedFeedback, setAddedFeedback] = useState("");
  const [currentPage, setCurrentPage] = useState(
    initialShopState.currentPage
  );
  const [productsPerPage, setProductsPerPage] = useState(24);
  const [cart, setCart] = useState([]);
  const [selectedSize, setSelectedSize] = useState("");
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [existingCollectionRequests, setExistingCollectionRequests] = useState([]);
  const [orderSuccessMessage, setOrderSuccessMessage] = useState("");
  const [storyOpen, setStoryOpen] = useState(false);
  const [inlineAddedKey, setInlineAddedKey] = useState(null);
  const [catalogPreview, setCatalogPreview] = useState(null);
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [sortBy, setSortBy] = useState(initialShopState.sortBy);
  const [season, setSeason] = useState(initialShopState.season);
  const [scentMood, setScentMood] = useState(initialShopState.scentMood);
  const [privateSelectionOpen, setPrivateSelectionOpen] = useState(false);
  const [closingVisible, setClosingVisible] = useState(false);
  const [currentHero, setCurrentHero] = useState(0);
  const heroNavigationRequestRef = useRef(0);
  const heroHoveredRef = useRef(false);
  const heroAutoplayResumeTimeoutRef = useRef(null);
  const [heroPaused, setHeroPaused] = useState(false);
  const [heroCollectionFilter, setHeroCollectionFilter] = useState(null);
  const [heroCollectionTitle, setHeroCollectionTitle] = useState("");
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(0);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  const [isVideoInView, setIsVideoInView] = useState(false);
  const [productModalVisible, setProductModalVisible] = useState(false);
  const productModalReturnScrollRef = useRef(null);
  const productRequestOpenTimeoutRef = useRef(null);
  const [noteMapOpen, setNoteMapOpen] = useState(false);
  const [modalAddedKey, setModalAddedKey] = useState(null);
  const modalAddedTimeoutRef = useRef(null);

  const [modalDiscountFlashKey, setModalDiscountFlashKey] = useState(null);

  const [manifestoOpen, setManifestoOpen] = useState(false);
  const [activeManifesto, setActiveManifesto] = useState(null);

  /* DISCOVERY SET */

  const [discoveryBuilderOpen, setDiscoveryBuilderOpen] = useState(false);
  const [discoveryType, setDiscoveryType] = useState("designerNiche");
  const [discoverySelected, setDiscoverySelected] = useState([]);

  const DISCOVERY_REQUIRED_COUNT = 5;
  const DISCOVERY_DISCOUNT = 0.10;

  const DISCOVERY_CONFIGS = {
    designerNiche: {
      key: "designer-niche",
      size: "2ml",
      categories: ["Designer", "Niche"],
      cartName: "PlayNice Designer & Niche Discovery Set"
    },

    arabian: {
      key: "arabian",
      size: "5ml",
      categories: ["Arabian"],
      cartName: "PlayNice Arabian Discovery Set"
    }
  };

  const activeDiscoveryConfig = DISCOVERY_CONFIGS[discoveryType];

  /* DISCOVERY SET END */

  const [miniCartPreview, setMiniCartPreview] = useState(null);
  const miniCartTimerRef = useRef(null);

  const [miniCartPreviewId, setMiniCartPreviewId] = useState(0);

  const [selectedProduct, setSelectedProduct] = useState(null);

  const [discoveryQuery, setDiscoveryQuery] = useState("");
  const [discoveryResults, setDiscoveryResults] = useState([]);
  const [discoveryFeedback, setDiscoveryFeedback] = useState("");
  const [discoveryPage, setDiscoveryPage] = useState(1);
  const [discoveryOpen, setDiscoveryOpen] = useState(false);
  const discoveryAttributionRef = useRef(null);
  const discoverySearchContextRef = useRef(null);

  const discoveryTotalPages = Math.max(
    1,
    Math.ceil(discoveryResults.length / DISCOVERY_RESULTS_PER_PAGE)
  );

  const discoveryPageStart =
    (discoveryPage - 1) * DISCOVERY_RESULTS_PER_PAGE;

  const visibleDiscoveryResults = discoveryResults.slice(
    discoveryPageStart,
    discoveryPageStart + DISCOVERY_RESULTS_PER_PAGE
  );

  const newProductsSignature = useMemo(() => {
    return getNewProductsSignature(products);
  }, []);

  const [hasNewShopProducts, setHasNewShopProducts] = useState(() => {
    if (typeof window === "undefined") return false;

    const currentSignature = getNewProductsSignature(products);

    if (!currentSignature) return false;

    try {
      return (
        localStorage.getItem(SHOP_NEW_PRODUCTS_SEEN_KEY) !== currentSignature
      );
    } catch {
      return false;
    }
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
    otherCountry: "",
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
  { value: "OTHER", sr: "Druga zemlja", en: "Other country" }
];

const selectedCheckoutCountry =
  checkoutCountryOptions.find((country) => country.value === checkoutForm.country) ||
  checkoutCountryOptions[0];

const selectedCheckoutCountryLabel =
  lang === "sr" ? selectedCheckoutCountry.sr : selectedCheckoutCountry.en;

const isMontenegroOrder = checkoutForm.country === "ME";
const isInternationalEnquiry = checkoutForm.country && checkoutForm.country !== "ME";

  const [hasUserPickedSize, setHasUserPickedSize] = useState(false);

  const [journalPageArticle, setJournalPageArticle] = useState(
    () => getJournalArticleFromCurrentUrl()
  );

  const [seenLatestJournalKey, setSeenLatestJournalKey] = useState(() => {
  if (typeof window === "undefined") return "";

  try {
    return localStorage.getItem(JOURNAL_SEEN_KEY) || "";
  } catch {
    return "";
  }
});

  const [journalFeedback, setJournalFeedback] = useState({});
  const [journalVoteSuccess, setJournalVoteSuccess] = useState("");
  const [journalFeedbackSuccess, setJournalFeedbackSuccess] = useState(false);

  const [scentRequestValue, setScentRequestValue] = useState("");
  const [scentRequestStatus, setScentRequestStatus] = useState("");
  const [scentRequestSubmitting, setScentRequestSubmitting] = useState(false);

  const [communityRequests, setCommunityRequests] = useState(() => {
  const defaultRequests = [
    { name: "LV Imagination", votes: 21 },
    { name: "Xerjoff Naxos", votes: 14 },
    { name: "Gentle Fluidity Silver", votes: 12 },
    { name: "Side Effect", votes: 9 }
  ];

  if (typeof window === "undefined") return defaultRequests;

  try {
    const saved = localStorage.getItem("playnice_scent_requests");

    if (!saved) return defaultRequests;

    const parsed = JSON.parse(saved);

    if (!Array.isArray(parsed)) return defaultRequests;

    return parsed;
  } catch {
    return defaultRequests;
  }
});

const [communityRequestTrends, setCommunityRequestTrends] = useState({});
const [communityTopThreeEntries, setCommunityTopThreeEntries] = useState({});

const isNewRequest = (request) => {
  if (request.votes > 1) return false;

  if (!request.firstSeen) return false;

  const ageInDays =
    (Date.now() - new Date(request.firstSeen).getTime()) /
    (1000 * 60 * 60 * 24);

  return ageInDays <= 7;
};

  /* =========================================
     APP REFS
  ========================================= */
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const productModalScrollYRef = useRef(0);
  const productModalCloseTimeoutRef = useRef(null);
  const productModalRef = useRef(null);
  const productModalCloseButtonRef = useRef(null);
  const productModalTriggerRef = useRef(null);
  const checkoutAutoCloseTimeoutRef = useRef(null);
  const fallbackDeviceIdRef = useRef(null);
  const communityVoteInFlightRef = useRef(new Set());
  const productModalAutoCloseTimeoutRef = useRef(null);
  const productGridRef = useRef(null);
  const hasMountedShopFiltersRef = useRef(false);
  const isRestoringShopHistoryRef = useRef(false);
  const shopFilterStateRef = useRef({
    category,
    searchTerm,
    season,
    scentMood,
    sortBy
  });
  const [shouldScrollToGrid, setShouldScrollToGrid] = useState(false);
  const journalVoteSuccessTimeoutRef = useRef(null);
  const journalFeedbackSuccessTimeoutRef = useRef(null);

  useEffect(() => {
    shopFilterStateRef.current = {
      category,
      searchTerm,
      season,
      scentMood,
      sortBy
    };
  }, [category, searchTerm, season, scentMood, sortBy]);

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
    "/videos/hero5.mp4",
    "/videos/hero6.mp4",
    "/videos/hero7.mp4",
    "/videos/hero8.mp4"
  ];

const videoFrameRef = useRef(null);
const videoRef = useRef(null);
const userPausedVideoRef = useRef(false);
const [isVideoPaused, setIsVideoPaused] = useState(false);

const goToNextVideo = () => {
  userPausedVideoRef.current = false;
  setIsVideoPaused(false);
  setShouldLoadVideo(true);
  setCurrentVideo((prev) => (prev + 1) % heroVideos.length);
};

const goToPrevVideo = () => {
  userPausedVideoRef.current = false;
  setIsVideoPaused(false);
  setShouldLoadVideo(true);

  setCurrentVideo((prev) =>
    prev === 0 ? heroVideos.length - 1 : prev - 1
  );
};

const selectVideo = (index) => {
  userPausedVideoRef.current = false;
  setIsVideoPaused(false);
  setShouldLoadVideo(true);
  setCurrentVideo(index);
};

const toggleVideoPlayback = () => {
  if (!shouldLoadVideo) {
    userPausedVideoRef.current = false;
    setShouldLoadVideo(true);
    setIsVideoPaused(false);
    return;
  }

  const video = videoRef.current;
  if (!video) return;

  if (video.paused) {
    userPausedVideoRef.current = false;

    const playPromise = video.play();

    if (playPromise?.catch) {
      playPromise.catch(() => setIsVideoPaused(true));
    }
  } else {
    userPausedVideoRef.current = true;
    video.pause();
  }
};

  const heroSlides = useMemo(() => {
  const [fixedFirstSlide, ...randomSlides] = BASE_HERO_SLIDES;

  return [fixedFirstSlide, ...shuffleHeroSlides(randomSlides)];
}, []);

const showHeroSlideWhenReady = useCallback(
  (index) => {
    if (index === currentHero) return;

    const slide = heroSlides[index];
    if (!slide) return;

    const isMobile = window.matchMedia("(max-width: 768px)").matches;

    const imageSource = isMobile
      ? slide.mobileImage || slide.image
      : slide.desktopImage || slide.image;

    const requestId = ++heroNavigationRequestRef.current;
    const preloader = new Image();

    preloader.fetchPriority = "high";

    preloader.onload = async () => {
      try {
        await preloader.decode();
      } catch {
        // Slika je učitana; nastavljamo i ako decode nije podržan.
      }

      if (heroNavigationRequestRef.current !== requestId) return;

      setCurrentHero(index);
    };

    preloader.src = imageSource;
  },
  [currentHero, heroSlides]
);

  const impactProducts = useMemo(
    () =>
      [2, 11, 5]
        .map((id) => products.find((product) => product.id === id))
        .filter(Boolean),
    []
  );

 const filteredProducts = useMemo(() => {
    const sourceProducts = heroCollectionFilter?.length
      ? heroCollectionFilter
          .map((slug) =>
            products.find((product) => product.slug === slug)
          )
          .filter(Boolean)
      : products;

  const normalizedSearchTerm = normalizeShopSearch(searchTerm);

  const result = sourceProducts.filter((product) => {
  const categoryMatch =
    category === "All" || product.category === category;

  const searchableProductText = normalizeShopSearch(
    [product.brand, product.name].filter(Boolean).join(" ")
  );

  const searchMatch =
    normalizedSearchTerm === "" ||
    searchableProductText.includes(normalizedSearchTerm);

    const selectedSeason = String(season || "").toLowerCase();
    const productSeason = String(product.season || "").toLowerCase();

    const seasonMatch =
      selectedSeason === "all" ||
      productSeason === "all" ||
      productSeason === selectedSeason;

    const selectedMood = String(scentMood || "").toLowerCase();

    const productMoods = Array.isArray(product.moods)
      ? product.moods.map((mood) => String(mood).toLowerCase())
      : [];

    const moodMatch =
      selectedMood === "all" || productMoods.includes(selectedMood);

    return categoryMatch && searchMatch && seasonMatch && moodMatch;
  });

  const newestFirstTieBreak = (a, b) =>
    Number(b.id || 0) - Number(a.id || 0);

  switch (sortBy) {
  case "rating":
  return [...result].sort((a, b) => {
    const ratingDifference =
      Number(b.rating || 0) - Number(a.rating || 0);

    return ratingDifference || newestFirstTieBreak(a, b);
  });

  case "priceLow":
  return [...result].sort((a, b) => {
    const priceDifference =
      getMinPrice(a) - getMinPrice(b);

    return priceDifference || newestFirstTieBreak(a, b);
  });

  case "priceHigh":
  return [...result].sort((a, b) => {
    const priceDifference =
      getMinPrice(b) - getMinPrice(a);

    return priceDifference || newestFirstTieBreak(a, b);
  });

  case "name":
    return [...result].sort((a, b) =>
      a.name.localeCompare(b.name)
    );

  case "featured":
    default:
      return heroCollectionFilter?.length
        ? result
        : [...result].sort(
            (a, b) =>
              Number(b.id || 0) - Number(a.id || 0)
          );
}
}, [category, searchTerm, season, scentMood, sortBy, heroCollectionFilter]);

  const categoryOptions = [
    {
      value: "All",
      label: lang === "sr" ? "Sve" : "All",
    },
    {
      value: "Arabian",
      label: lang === "sr" ? "Arapski" : "Arabian",
    },
    {
      value: "Designer",
      label: lang === "sr" ? "Dizajner" : "Designer",
    },
    {
      value: "Niche",
      label: "Niche",
    },
  ];

  const selectedCategory =
    categoryOptions.find((option) => option.value === category) ||
    categoryOptions[0];

  const scentMoodOptions = [
  {
    value: "All",
    label: lang === "sr" ? "Svi moodovi" : "All moods",
    icon: "✦",
    hint: lang === "sr" ? "Explore Collection" : "Explore Collection",
  },
  {
    value: "clean",
    label: "Clean Everyday",
    icon: "❄️",
    hint: "Fresh / Daily",
  },
  {
    value: "summer",
    label: "Summer Heat",
    icon: "☀️",
    hint: "Bright / Warm",
  },
  {
    value: "date",
    label: "Date Night",
    icon: "🌙",
    hint: "Close / Seductive",
  },
  {
    value: "rich",
    label: "Rich & Addictive",
    icon: "🥃",
    hint: "Deep / Sweet",
  },
  {
    value: "soft",
    label: "Soft Luxury",
    icon: "🕊️",
    hint: "Smooth / Elegant",
  },
  {
    value: "signature",
    label: "Signature Energy",
    icon: "💎",
    hint: "Memorable",
  },
];

const selectedScentMood =
  scentMoodOptions.find((option) => option.value === scentMood) ||
  scentMoodOptions[0];

/* =========================================
   newArrivalProducts
========================================= */

const newArrivalProducts = [...products]
  .filter((product) => product.isNew === true)
  .reverse();

const getProductThumbnail = (image = "") =>
  image
    .replace("/products/", "/products/thumbs/")
    .replace(/\.png$/i, ".webp");

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
  href: "https://foreverliving.com/shop/scg/sr-Cyrl-RS/drinks?fboId=360000920762&categoryId=1&title=Napici",
  partner: "forever_living",
  sellerId: "360000920762",
  campaign: "aloe_drinks",
  logoSrc: "/partners/forever-logo.png",
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
    cta: lang === "sr" ? "Otvori" : "Open",
    action: "privateSelection",
  },
];

const sideRailBlocked =
  cartOpen ||
  checkoutOpen ||
  storyOpen ||
  howItWorksOpen ||
  privateSelectionOpen ||
  productModalVisible ||
  !!catalogPreview;

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
    view,
  });
};

const handleProductsPerPageChange = (value) => {
  setProductsPerPage(Number(value));
  setCurrentPage(1);
};

/* =========================================
   seasonOptions
========================================= */
const seasonOptions = [
  {
    value: "All",
    label: tr.seasonAll,
  },
  {
    value: "summer",
    label: `☀️ ${tr.seasonSummer}`,
  },
  {
    value: "winter",
    label: `❄️ ${tr.seasonWinter}`,
  },
];

const sortOptions = [
  {
    value: "featured",
    label: tr.sortFeatured,
  },
  {
    value: "rating",
    label: `★ ${tr.sortRating}`,
  },
  {
    value: "priceLow",
    label: `↗ ${tr.sortPriceLow}`,
  },
  {
    value: "priceHigh",
    label: `↘ ${tr.sortPriceHigh}`,
  },
  {
    value: "name",
    label: tr.sortName,
  },
];

const selectedSeasonOption =
  seasonOptions.find((option) => option.value === season) || seasonOptions[0];

const selectedSortOption =
  sortOptions.find((option) => option.value === sortBy) || sortOptions[0];

/* =========================================
   TOTAL PAGES
========================================= */
  const totalPages = Math.max(
  1,
  Math.ceil(filteredProducts.length / productsPerPage)
  );

  const paginatedProducts = useMemo(() => {
  const start = (currentPage - 1) * productsPerPage;

  return filteredProducts.slice(
    start,
    start + productsPerPage
  );
}, [filteredProducts, currentPage, productsPerPage]);

  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  const shipping =
    cart.length === 0 ? 0 : subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;

  const total = subtotal + shipping;

  const amountLeftForFreeShipping = Math.max(
    0,
    FREE_SHIPPING_THRESHOLD - subtotal
  );

  const hasBlockingOverlay =
  !!selectedProduct ||
  cartOpen ||
  checkoutOpen ||
  storyOpen ||
  howItWorksOpen ||
  faqOpen ||
  privateSelectionOpen ||
  !!catalogPreview ||
  manifestoOpen ||
  discoveryOpen ||
  discoveryBuilderOpen;

  const showStickyCta =
  !hasBlockingOverlay &&
  (view === "home" || view === "shop");

  const scrollYRef = useRef(0);

/* =========================================
   EFFECTS
========================================= */
  useLayoutEffect(() => {
  const body = document.body;

  if (hasBlockingOverlay) {
    body.classList.add("overlay-lock");

    const lockY = window.scrollY || window.pageYOffset || 0;

    scrollYRef.current = lockY;

    body.style.position = "fixed";
    body.style.top = `-${lockY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.overflow = "hidden";
  } else {
    body.classList.remove("overlay-lock");

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
    body.classList.remove("overlay-lock");

    body.style.position = "";
    body.style.top = "";
    body.style.left = "";
    body.style.right = "";
    body.style.width = "";
    body.style.overflow = "";
  };
}, [hasBlockingOverlay]);

  useEffect(() => {
    if (view !== "home" || closingVisible) return;

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
  }, [view, closingVisible]);

  useEffect(() => {
  if (view !== "home") {
    videoRef.current?.pause();
    setShouldLoadVideo(false);
    setIsVideoInView(false);
    return;
  }

  const videoFrame = videoFrameRef.current;
  if (!videoFrame) return;

  if (typeof IntersectionObserver === "undefined") {
    setShouldLoadVideo(true);
    setIsVideoInView(true);
    return;
  }

  const loadObserver = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return;

      setShouldLoadVideo(true);
      loadObserver.disconnect();
    },
    {
      threshold: 0.01,
      rootMargin: "320px 0px"
    }
  );

  const playbackObserver = new IntersectionObserver(
    ([entry]) => {
      setIsVideoInView(
        entry.isIntersecting && entry.intersectionRatio >= 0.12
      );
    },
    {
      threshold: [0, 0.12]
    }
  );

  loadObserver.observe(videoFrame);
  playbackObserver.observe(videoFrame);

  return () => {
    loadObserver.disconnect();
    playbackObserver.disconnect();
    videoRef.current?.pause();
  };
}, [view]);

useEffect(() => {
  const video = videoRef.current;
  if (!video || !shouldLoadVideo) return;

  if (!isVideoInView || userPausedVideoRef.current) {
    video.pause();
    return;
  }

  const playPromise = video.play();

  if (playPromise?.catch) {
    playPromise.catch(() => setIsVideoPaused(true));
  }
}, [currentVideo, isVideoInView, shouldLoadVideo]);

  useEffect(() => {
    try {
      window.localStorage.setItem("playnice_lang", lang);
    } catch {}

    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    if (
      window.location.pathname.startsWith("/product/") ||
      window.location.pathname.startsWith("/journal/")
    ) {
      return;
    }

  const params = new URLSearchParams(window.location.search);

  // Ukloni samo PlayNice parametre koje ovaj blok kontroliše.
  // UTM, gclid, fbclid i ostali attribution parametri ostaju sačuvani.
  params.delete("view");
  params.delete("category");
  params.delete("search");
  params.delete("season");
  params.delete("mood");
  params.delete("sort");
  params.delete("page");

  if (
    window.location.pathname === "/" &&
    view !== "home"
  ) {
    params.set("view", view);
  }

  if (view === "shop") {
    if (category !== "All") params.set("category", category);
    if (searchTerm.trim()) params.set("search", searchTerm.trim());
    if (season !== "All") params.set("season", season);
    if (scentMood !== "All") params.set("mood", scentMood);
    if (sortBy !== "featured") params.set("sort", sortBy);
    if (currentPage > 1) params.set("page", String(currentPage));
  }

  const query = params.toString();

  const nextUrl = query
    ? `${window.location.pathname}?${query}`
    : window.location.pathname;

  const currentUrl = `${window.location.pathname}${window.location.search}`;

  if (currentUrl !== nextUrl) {
    window.history.replaceState(window.history.state || {}, "", nextUrl);
  }
}, [
  view,
  category,
  searchTerm,
  season,
  scentMood,
  sortBy,
  currentPage
]);

  useEffect(() => {
    if (!hasMountedShopFiltersRef.current) {
      hasMountedShopFiltersRef.current = true;
      return;
    }

    if (isRestoringShopHistoryRef.current) {
      isRestoringShopHistoryRef.current = false;
      return;
    }

    setCurrentPage(1);
  }, [category, searchTerm, season, scentMood, sortBy]);

  useEffect(() => {
    if (!addedFeedback) return;
    const timer = setTimeout(() => setAddedFeedback(""), 1200);
    return () => clearTimeout(timer);
  }, [addedFeedback]);

  const checkoutTrackedRef = useRef(false);

useEffect(() => {
  if (!orderSuccessMessage) return;

  const timer = setTimeout(() => {
    setOrderSuccessMessage("");
  }, 2200);

  return () => clearTimeout(timer);
}, [orderSuccessMessage]);

useEffect(() => {
  if (!checkoutOpen) {
    checkoutTrackedRef.current = false;
    return;
  }

  if (checkoutTrackedRef.current || cart.length === 0) {
    return;
  }

  checkoutTrackedRef.current = true;

  trackEvent("begin_checkout", {
    currency: "EUR",
    value: Number(subtotal),
    items: cart.map((item) => ({
      item_id: String(item.id ?? item.key),
      item_name: item.name,
      item_variant: item.size,
      price: Number(item.price),
      quantity: Number(item.quantity || 1)
    }))
  });

  const alertPayload = {
    subtotal: Number(subtotal),
    shipping: Number(shipping),
    total: Number(total),
    language: lang,
    source: "shop",
    items: cart.map((item) => ({
      name: item.name,
      size: item.size,
      quantity: Number(item.quantity || 1)
    }))
  };

  fetch("/api/checkout-alert", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(alertPayload)
  }).catch((error) => {
    console.warn("Checkout alert failed:", error);
  });

  trackMeta("InitiateCheckout", {
    content_ids: cart.map((item) =>
      String(item.id ?? item.key)
    ),
    content_type: "product",
    num_items: cart.reduce(
      (total, item) => total + Number(item.quantity || 1),
      0
    ),
    value: Number(subtotal),
    currency: "EUR"
  });
}, [checkoutOpen, cart, subtotal, shipping, total, lang]);

  useEffect(() => {
  if (heroPaused || heroSlides.length <= 1) return;

  const interval = setInterval(() => {
    const nextHeroIndex = (currentHero + 1) % heroSlides.length;
    showHeroSlideWhenReady(nextHeroIndex);
  }, 6000);

  return () => clearInterval(interval);
}, [
  heroPaused,
  heroSlides.length,
  currentHero,
  showHeroSlideWhenReady,
]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [currentPage, totalPages]);

  useEffect(() => {
    const path = window.location.pathname + window.location.search;
    trackPageView(path || "/");
  }, []);

  useEffect(() => {
    let scrollEndTimer;
    let scrollFrame = null;

    const updateScrollState = () => {
      scrollFrame = null;

      const scrollY = window.scrollY;

      document.body.classList.toggle("scrolled", scrollY > 20);
      document.body.classList.add("is-scrolling");

      setShowBackToTop(scrollY > 600);

      window.clearTimeout(scrollEndTimer);

      scrollEndTimer = window.setTimeout(() => {
        document.body.classList.remove("is-scrolling");
      }, 180);
    };

    const handleScroll = () => {
      if (scrollFrame !== null) return;

      scrollFrame = window.requestAnimationFrame(updateScrollState);
    };

    updateScrollState();

    window.addEventListener("scroll", handleScroll, {
      passive: true
    });

    return () => {
      window.clearTimeout(scrollEndTimer);

      if (scrollFrame !== null) {
        window.cancelAnimationFrame(scrollFrame);
      }

      window.removeEventListener("scroll", handleScroll);

      document.body.classList.remove("is-scrolling");
    };
  }, []);

useEffect(() => {
  if (selectedProduct) {
    setSelectedSize((currentSize) => {
      if (currentSize && selectedProduct.sizes?.[currentSize]) {
        return currentSize;
      }

      return Object.keys(selectedProduct.sizes || {})[0] || "";
    });
  } else {
    setSelectedSize("");
  }
}, [selectedProduct]);

useEffect(() => {
  setNoteMapOpen(false);
}, [selectedProduct?.slug]);

useEffect(() => {
  if (!selectedProduct || !productModalVisible) return;

  const frame = requestAnimationFrame(() => {
    productModalCloseButtonRef.current?.focus({
      preventScroll: true
    });
  });

  return () => cancelAnimationFrame(frame);
}, [selectedProduct, productModalVisible]);

useEffect(() => {
  if (!selectedProduct || !productModalVisible) return;

  const modal = productModalRef.current;
  if (!modal) return;

  const handleProductModalTab = (event) => {
    if (event.key !== "Tab") return;

    const focusableElements = Array.from(
      modal.querySelectorAll(
        'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter(
      (element) =>
        element instanceof HTMLElement &&
        element.getAttribute("aria-hidden") !== "true" &&
        element.offsetParent !== null
    );

    if (focusableElements.length === 0) {
      event.preventDefault();
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    const activeElement = document.activeElement;

    if (event.shiftKey) {
      if (
        activeElement === firstElement ||
        !modal.contains(activeElement)
      ) {
        event.preventDefault();
        lastElement.focus();
      }

      return;
    }

    if (
      activeElement === lastElement ||
      !modal.contains(activeElement)
    ) {
      event.preventDefault();
      firstElement.focus();
    }
  };

  document.addEventListener("keydown", handleProductModalTab);

  return () => {
    document.removeEventListener("keydown", handleProductModalTab);
  };
}, [selectedProduct, productModalVisible]);

useEffect(() => {
  return () => {
    if (productRequestOpenTimeoutRef.current) {
      clearTimeout(productRequestOpenTimeoutRef.current);
    }

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
  setJournalVoteSuccess("");
}, [journalPageArticle]);

useEffect(() => {
  return () => {
    if (miniCartTimerRef.current) {
      clearTimeout(miniCartTimerRef.current);
    }
  };
}, []);

useEffect(() => {
  return () => {
    if (modalAddedTimeoutRef.current) {
      clearTimeout(modalAddedTimeoutRef.current);
    }
  };
}, []);

useEffect(() => {
  return () => {
    if (heroAutoplayResumeTimeoutRef.current) {
      clearTimeout(heroAutoplayResumeTimeoutRef.current);
    }
  };
}, []);

useEffect(() => {
  return () => {
    if (journalVoteSuccessTimeoutRef.current) {
      clearTimeout(journalVoteSuccessTimeoutRef.current);
    }

    if (journalFeedbackSuccessTimeoutRef.current) {
      clearTimeout(journalFeedbackSuccessTimeoutRef.current);
    }

    if (productModalAutoCloseTimeoutRef.current) {
      clearTimeout(productModalAutoCloseTimeoutRef.current);
    }
  };
}, []);

useEffect(() => {
  const handlePopState = () => {
    const pagePath =
      window.location.pathname + window.location.search;

    const productFromUrl = getProductFromCurrentUrl();

    if (productFromUrl) {
      const originView = window.history.state?.productOriginView;

      const validOriginView =
        originView === "home" ||
        originView === "shop" ||
        originView === "journal" ||
        originView === "exhibition"
          ? originView
          : "shop";

      setView(validOriginView);

      openProductModal(productFromUrl, {
        updateUrl: false,
        changeView: false
      });

      trackPageView(pagePath || "/");
      trackMeta("PageView");

      return;
    }

const journalArticleFromUrl =
  getJournalArticleFromCurrentUrl();

if (journalArticleFromUrl) {
  setView("journal");

  setJournalPageArticle(journalArticleFromUrl);

  setNoteMapOpen(false);
  setProductModalVisible(false);
  setSelectedProduct(null);
  setSelectedSize("");
  setHasUserPickedSize(false);

  trackPageView(pagePath || "/");
  trackMeta("PageView");

  return;
}

    const nextView = getInitialView();

    if (nextView === "shop") {
      const restoredShopState = getInitialShopState();
      const currentShopFilters = shopFilterStateRef.current;

      const filtersWillChange =
        currentShopFilters.category !== restoredShopState.category ||
        currentShopFilters.searchTerm !== restoredShopState.searchTerm ||
        currentShopFilters.season !== restoredShopState.season ||
        currentShopFilters.scentMood !== restoredShopState.scentMood ||
        currentShopFilters.sortBy !== restoredShopState.sortBy;

      isRestoringShopHistoryRef.current = filtersWillChange;

      setCategory(restoredShopState.category);
      setSearchTerm(restoredShopState.searchTerm);
      setSeason(restoredShopState.season);
      setScentMood(restoredShopState.scentMood);
      setSortBy(restoredShopState.sortBy);
      setCurrentPage(restoredShopState.currentPage);
    }

    if (nextView !== "shop") {
      setHeroCollectionFilter(null);
      setHeroCollectionTitle("");
    }

    setNoteMapOpen(false);
    setProductModalVisible(false);
    setSelectedProduct(null);
    setSelectedSize("");
    setHasUserPickedSize(false);

    setJournalPageArticle(null);

    setView(nextView);

    trackPageView(pagePath || "/");
    trackMeta("PageView");
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

  const deviceId = getPlayNiceDeviceId();
  const feedbackId = `journal_${deviceId}_${key}`;

  try {
    const payloadToSend = JSON.stringify({
      timestamp: new Date().toISOString(),
      feedbackId,
      deviceId,
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

    return navigator.sendBeacon(
      "https://script.google.com/macros/s/AKfycby38XWvXcD6Cgw2_ExKEpegaYg-mgiuYLVXzDgcwefVSCZtyWVL2QvVQzmX7nrltene/exec",
      blob
    );
  } catch (error) {
    console.error("Journal feedback submit failed:", error);
    return false;
  }
};

const getJournalSavedFeedback = (article) => {
  const key = getJournalArticleKey(article);
  if (!key) return null;
  return journalFeedback[key] || null;
};

const triggerJournalVoteSuccess = (vote) => {
  setJournalVoteSuccess(vote);

  if (journalVoteSuccessTimeoutRef.current) {
    clearTimeout(journalVoteSuccessTimeoutRef.current);
  }

  journalVoteSuccessTimeoutRef.current = setTimeout(() => {
    setJournalVoteSuccess("");
    journalVoteSuccessTimeoutRef.current = null;
  }, 1100);
};

const handleJournalFeedbackVote = (article, vote) => {
  const key = getJournalArticleKey(article);
  if (!key) return;

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

  const feedbackQueued = sendJournalFeedback(article, {
    vote: nextVote,
    note: (current.note || "").trim()
  });

  if (feedbackQueued) {
    triggerJournalVoteSuccess(nextVote);
  } else {
    console.error("Journal vote feedback was not queued.");
  }
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

  const feedbackQueued = sendJournalFeedback(article, {
    vote: current.vote,
    note: trimmedNote
  });

  if (!feedbackQueued) {
    console.error("Journal note feedback was not queued.");
    return;
  }

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

  setJournalFeedbackSuccess(true);

  if (journalFeedbackSuccessTimeoutRef.current) {
    clearTimeout(journalFeedbackSuccessTimeoutRef.current);
  }

  journalFeedbackSuccessTimeoutRef.current = setTimeout(() => {
    setJournalFeedbackSuccess(false);
    journalFeedbackSuccessTimeoutRef.current = null;
  }, 1200);
};

/* =========================================
   getPlayNiceDeviceId
========================================= */

const getPlayNiceDeviceId = () => {
  const storageKey = "playnice_device_id";

  try {
    const existingId = localStorage.getItem(storageKey);

    if (existingId) return existingId;

    const newId =
      window.crypto?.randomUUID?.() ||
      `pn_${Date.now()}_${Math.random().toString(36).slice(2)}`;

    localStorage.setItem(storageKey, newId);

    return newId;
  } catch (error) {
    if (!fallbackDeviceIdRef.current) {
      fallbackDeviceIdRef.current =
        window.crypto?.randomUUID?.() ||
        `pn_fallback_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    }

    return fallbackDeviceIdRef.current;
  }
};

/* =========================================
   SEND SCENT REQUEST HEPLER
========================================= */

const sendScentRequest = async (
  fragranceName,
  source = "scent_request"
) => {
  try {
    const response = await fetch(
      "https://script.google.com/macros/s/AKfycby38XWvXcD6Cgw2_ExKEpegaYg-mgiuYLVXzDgcwefVSCZtyWVL2QvVQzmX7nrltene/exec",
      {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          fragrance: fragranceName,
          lang,
          page: window.location.pathname,
          source,
          deviceId: getPlayNiceDeviceId()
        })
      }
    );

    return await response.json();
  } catch (error) {
    console.error("Scent request submit failed:", error);

    return {
      status: "error",
      message: String(error)
    };
  }
};

/* =========================================
   NORMAL SCENT NAME HELPER
========================================= */

const SCENT_NAME_NOISE_WORDS = new Set([
  "eau", "de", "parfum", "perfume", "edp", "edt", "cologne",
  "extrait", "extract", "spray",
]);

const normalizeScentName = (value = "") =>
  String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .filter((token) => !SCENT_NAME_NOISE_WORDS.has(token))
    .join(" ")
    .trim();

const getScentNameTokens = (value = "") =>
  normalizeScentName(value).split(" ").filter(Boolean);

const getScentTokenDistance = (left = "", right = "") => {
  if (left === right) return 0;
  if (!left || !right) return Math.max(left.length, right.length);

  const previous = Array.from({ length: right.length + 1 }, (_, index) => index);

  for (let i = 1; i <= left.length; i += 1) {
    let diagonal = previous[0];
    previous[0] = i;

    for (let j = 1; j <= right.length; j += 1) {
      const above = previous[j];
      const substitutionCost = left[i - 1] === right[j - 1] ? 0 : 1;
      previous[j] = Math.min(
        previous[j] + 1,
        previous[j - 1] + 1,
        diagonal + substitutionCost
      );
      diagonal = above;
    }
  }

  return previous[right.length];
};

const scentTokensMatch = (requestToken, candidateToken) => {
  if (requestToken === candidateToken) return true;
  if (Math.min(requestToken.length, candidateToken.length) < 5) return false;
  return getScentTokenDistance(requestToken, candidateToken) <= 1;
};

const getProductRequestNames = (product) =>
  [
    product.shortName,
    product.cardName,
    product.name,
    product.brand && product.shortName ? `${product.brand} ${product.shortName}` : "",
    product.slug,
    ...(Array.isArray(product.aliases) ? product.aliases : []),
  ]
    .map(normalizeScentName)
    .filter(Boolean);

const getScentRequestMatchScore = (requestName, product) => {
  const normalizedRequest = normalizeScentName(requestName);
  if (!normalizedRequest) return 0;

  const requestTokens = getScentNameTokens(normalizedRequest);
  const candidates = getProductRequestNames(product);
  let bestScore = 0;

  candidates.forEach((candidate) => {
    if (candidate === normalizedRequest) {
      bestScore = Math.max(bestScore, 100);
      return;
    }

    if (
      normalizedRequest.length >= 4 &&
      (candidate.includes(normalizedRequest) || normalizedRequest.includes(candidate))
    ) {
      bestScore = Math.max(bestScore, 90);
    }

    const candidateTokens = getScentNameTokens(candidate);
    const allMatch = requestTokens.length > 0 && requestTokens.every((requestToken) =>
      candidateTokens.some((candidateToken) => scentTokensMatch(requestToken, candidateToken))
    );

    if (!allMatch) return;
    bestScore = Math.max(
      bestScore,
      requestTokens.length === 1 ? 60 : 70 + Math.min(requestTokens.length, 9)
    );
  });

  return bestScore;
};

const findExistingProductByRequest = (requestName) => {
  const rankedMatches = products
    .map((product) => ({ product, score: getScentRequestMatchScore(requestName, product) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  if (!rankedMatches.length) return null;
  const [bestMatch, secondMatch] = rankedMatches;

  // Do not guess when a short request matches multiple variants equally well.
  if (secondMatch && secondMatch.score === bestMatch.score) return null;
  return bestMatch.product;
};

/* =========================================
   SCENT REQUEST HELPERS
========================================= */

const openProductFromRequest = (product) => {
  if (!product) return;

  const requestScrollY = window.scrollY || window.pageYOffset || 0;
  productModalReturnScrollRef.current = requestScrollY;
  productModalScrollYRef.current = requestScrollY;

  if (productRequestOpenTimeoutRef.current) {
    clearTimeout(productRequestOpenTimeoutRef.current);
  }

  productRequestOpenTimeoutRef.current = setTimeout(() => {
    productRequestOpenTimeoutRef.current = null;
    setSelectedProduct(product);
    setProductModalVisible(true);
  }, 450);
};

const getVisibleCommunityRequests = (requests) =>
  requests
    .filter((request) => !findExistingProductByRequest(request.name))
    .sort((a, b) => b.votes - a.votes);

const EXISTING_COLLECTION_LOCKED_VOTES = {
  "Yves Saint Laurent Y Iced Cologne": 27,
  "Prada Paradigme Eau de Parfum": 25,
  "Valentino Uomo Born In Roma Coral Fantasy": 16,
  "Lattafa Khamrah Waha Eau de Parfum": 13,
  "Club De Nuit Intense Overdose": 12,
  "Carolina Herrera Bad Boy Cobalt Eau de Parfum": 5,
  "Rayhaan Azul Eau de Parfum": 3,
  "Bois Impérial by Essential Parfums": 1,
};

const sortedExistingCollectionRequests = useMemo(
  () =>
    existingCollectionRequests
      .map((item) => ({
        ...item,
        displayVotes:
          EXISTING_COLLECTION_LOCKED_VOTES[item.name] ??
          item.lockedVotes ??
          item.votes ??
          1,
      }))
      .sort((a, b) => {
        if (b.displayVotes !== a.displayVotes) {
          return b.displayVotes - a.displayVotes;
        }

        return String(a.name).localeCompare(String(b.name));
      }),
  [existingCollectionRequests]
);

const getVoteCooldownMessage = (fragranceName, remainingDays) =>
  lang === "sr"
    ? `Hvala na podršci za ${fragranceName} ✦ Novi glas možeš dodati za ${remainingDays} dana.`
    : `Thanks for supporting ${fragranceName} ✦ You can vote for it again in ${remainingDays} days.`;

const handleCommunityRequestVote = async (requestName) => {
  if (communityVoteInFlightRef.current.has(requestName)) return;

  communityVoteInFlightRef.current.add(requestName);

  try {
    const existingProduct = findExistingProductByRequest(requestName);

  if (existingProduct) {
  setScentRequestStatus(
    lang === "sr"
      ? `Već deo PlayNice kolekcije ✦ Otvaramo ${existingProduct.name}.`
      : `Already in our collection ✦ Opening ${existingProduct.name}.`
  );

  openProductFromRequest(existingProduct);
  return;
}

  const result = await sendScentRequest(requestName);

  if (result?.status === "blocked") {
  setScentRequestStatus(
    result.blockReason === "daily_limit"
      ? lang === "sr"
        ? `Iskoristio si 3 glasa u poslednja 24 sata. Novi glas možeš dodati za ${result.remainingHours || 1} h.`
        : `You've used 3 votes in the last 24 hours. You can vote again in ${result.remainingHours || 1}h.`
      : getVoteCooldownMessage(requestName, result.remainingDays)
  );

  return;
}

  if (result?.status !== "ok") {
    setScentRequestStatus(
      lang === "sr"
        ? "Glas nije prošao. Probaj ponovo."
        : "Vote was not saved. Please try again."
    );

    return;
  }

  setCommunityRequests((prev) => {
    const beforeSorted = getVisibleCommunityRequests(prev);
    const beforeRanks = beforeSorted.reduce((acc, item, index) => {
      acc[item.name] = index;
      return acc;
    }, {});

    const next = prev
      .map((item) =>
        item.name === requestName
          ? { ...item, votes: item.votes + 1 }
          : item
      )
      .sort((a, b) => b.votes - a.votes);

    const afterSorted = getVisibleCommunityRequests(next);

    const nextTrends = afterSorted.reduce((acc, item, index) => {
      const previousIndex = beforeRanks[item.name];

      if (previousIndex === undefined) {
        acc[item.name] = "same";
      } else if (index < previousIndex) {
        acc[item.name] = "up";
      } else if (index > previousIndex) {
        acc[item.name] = "down";
      } else {
        acc[item.name] = "same";
      }

      return acc;
    }, {});

    const nextTopThreeEntries = afterSorted.reduce((acc, item, index) => {
      const previousIndex = beforeRanks[item.name];

      if (
        previousIndex !== undefined &&
        previousIndex > 2 &&
        index <= 2
      ) {
        acc[item.name] = true;
      }

      return acc;
    }, {});

    setCommunityRequestTrends(nextTrends);
    setCommunityTopThreeEntries(nextTopThreeEntries);

    return next;
  });

  setScentRequestStatus(
    lang === "sr"
      ? `Još jedan glas za ${requestName}.`
      : `One more vote for ${requestName}.`
  );
    } finally {
      communityVoteInFlightRef.current.delete(requestName);
    }
  };

const handleScentRequestSubmit = async (event) => {
  event.preventDefault();

  const fragranceName = scentRequestValue.trim();

  if (!fragranceName) {
    setScentRequestStatus(
      lang === "sr"
        ? "Upiši ime parfema koji želiš da probaš."
        : "Enter the fragrance you want to try."
    );
    return;
  }

  setScentRequestSubmitting(true);
  setScentRequestStatus("");

  try {
    const existingProduct = findExistingProductByRequest(fragranceName);

    if (existingProduct) {
    setScentRequestValue("");

    setScentRequestStatus(
      lang === "sr"
        ? `Već deo PlayNice kolekcije ✦ Otvaramo ${existingProduct.name}.`
        : `Already in our collection ✦ Opening ${existingProduct.name}.`
    );

    openProductFromRequest(existingProduct);
    return;
  }

    const result = await sendScentRequest(fragranceName);

    if (result?.status === "blocked") {
    setScentRequestStatus(
      result.blockReason === "daily_limit"
        ? lang === "sr"
          ? `Iskoristio si 3 glasa u poslednja 24 sata. Novi glas možeš dodati za ${result.remainingHours || 1} h.`
          : `You've used 3 votes in the last 24 hours. You can vote again in ${result.remainingHours || 1}h.`
        : lang === "sr"
          ? `Već si predložio ${fragranceName}. Možeš ponovo za ${result.remainingDays} dana.`
          : `You already requested ${fragranceName}. You can request it again in ${result.remainingDays} days.`
    );

    return;
  }

    if (result?.status !== "ok") {
      setScentRequestStatus(
        lang === "sr"
          ? "Predlog nije sačuvan. Probaj ponovo."
          : "Request was not saved. Please try again."
      );

      return;
    }

    const normalizedFragranceName = normalizeScentName(fragranceName);
  const existingRequest = communityRequests.find(
    (item) => normalizeScentName(item.name) === normalizedFragranceName
  );

    if (existingRequest) {
      setCommunityRequests((prev) =>
        prev
          .map((item) =>
            normalizeScentName(item.name) === normalizedFragranceName
              ? { ...item, votes: item.votes + 1 }
              : item
          )
          .sort((a, b) => b.votes - a.votes)
      );
    } else {
      setCommunityRequests((prev) =>
        [{ name: fragranceName, votes: 1 }, ...prev].sort(
          (a, b) => b.votes - a.votes
        )
      );
    }

    setScentRequestValue("");

    setScentRequestStatus(
      lang === "sr"
        ? "Dodato u community wishlist. Pratimo interesovanje."
        : "Added to the community wishlist. We’re listening."
    );
  } catch (error) {
    console.error("Scent request submit failed:", error);

    setScentRequestStatus(
      lang === "sr"
        ? "Nešto nije prošlo kako treba. Probaj ponovo."
        : "Something went wrong. Please try again."
    );
  } finally {
    setScentRequestSubmitting(false);
  }
};

/* =========================================
   getDiscountedPrice
========================================= */

const getDiscountedPrice = (price, percent) =>
  Number((price * (1 - percent / 100)).toFixed(2));

const getProductDiscountForSize = (product, size) => {
  if (!product?.discount) return null;
  return product.discount.size === size ? product.discount : null;
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

const activeJournalArticleIndex = journalPageArticle
  ? sortedJournalArticles.findIndex(
      (article) =>
        String(article.id) === String(journalPageArticle.id)
    )
  : -1;

const previousJournalArticle =
  activeJournalArticleIndex >= 0
    ? sortedJournalArticles[activeJournalArticleIndex + 1] || null
    : null;

const nextJournalArticle =
  activeJournalArticleIndex > 0
    ? sortedJournalArticles[activeJournalArticleIndex - 1] || null
    : null;

const journalPageRelatedProducts = journalPageArticle
  ? getRelatedJournalProducts(journalPageArticle)
  : [];

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
  markLatestJournalAsSeen();
  setJournalPageArticle(null);
  switchView("journal");

  requestAnimationFrame(() => {
    smoothScrollToTop();
  });
};

const handleJournalArticleOpen = (article) => {
  if (!article) return;

  const slug = getJournalArticleSlug(article);

  if (!slug) return;

  setJournalPageArticle(article);

  if (String(article.id) === String(latestJournalArticleKey)) {
    markLatestJournalAsSeen();
  }

  setView("journal");

  const nextPath = `/journal/${slug}`;

  const currentPath =
    window.location.pathname + window.location.search;

  if (currentPath !== nextPath) {
    window.history.pushState({}, "", nextPath);

    trackPageView(nextPath);
    trackMeta("PageView");
  }

  requestAnimationFrame(() => {
    smoothScrollToTop();
  });
};

const handleJournalPageBack = () => {
  setJournalPageArticle(null);

  setView("journal");

  if (window.location.pathname !== "/journal") {
    window.history.pushState({}, "", "/journal");

    trackPageView("/journal");
    trackMeta("PageView");
  }

  requestAnimationFrame(() => {
    smoothScrollToTop();
  });
};

const announcementItems = useMemo(() => {
  const latestJournalTitle = latestJournalArticle
    ? getJournalText(latestJournalArticle.title, lang)
    : "";

  const yslIcedAnnouncementItem = {
  id: "ysl-y-iced-cologne-announcement",
  text:
    lang === "sr"
      ? "❄️ NOVO: YSL Y Iced Cologne 10ml + Mystery Designer Sample • Limited Stock"
      : "❄️ NEW ARRIVAL: YSL Y Iced Cologne 10ml + Mystery Designer Sample • Limited Stock",
  icon: "→",
  tone: "new-shop",
  action: "openProduct",
  slug: "ysl-y-iced-cologne",
};

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
              ? `Novo u rubrici Le Journal: ${latestJournalTitle}`
              : `New in Le Journal: ${latestJournalTitle}`,
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
  yslIcedAnnouncementItem,
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
  if (item?.action === "openProduct" && item?.slug) {
  const product = products.find((p) => p.slug === item.slug);

  if (product) {
    openProductModal(product, {
      preferredSize: "10ml",
      userPickedSize: true,
      changeView: false,
    });
  }

  return;
}

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

const activeJournalFeedback = journalPageArticle
  ? getJournalSavedFeedback(journalPageArticle)
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
}, [products, wishlist]);

const goToShop = () => {
  const heroSelectionActive = Boolean(
    heroCollectionFilter?.length || heroCollectionTitle
  );

  if (heroSelectionActive) {
    setHeroCollectionFilter(null);
    setHeroCollectionTitle("");
    setCurrentPage(1);
  }

  switchView("shop", {
    scrollTop: view !== "shop"
  });

  if (view === "shop" && heroSelectionActive) {
    requestAnimationFrame(() => {
      smoothScrollToTop();
    });
  }
};

const [smartCtaVibe, setSmartCtaVibe] = useState(null);
const [smartCtaStats, setSmartCtaStats] = useState({
  summer: 0,
  clean: 0,
  rich: 0,
  date: 0,
  soft: 0,
  signature: 0
});

const handleSmartStickyClick = useCallback(
  (moodId) => {
    if (moodId) {
      setScentMood(moodId);
    }

    requestAnimationFrame(() => {
      goToShop();
    });
  },
  [goToShop, setScentMood]
);

const openCheckout = () => {
  if (checkoutAutoCloseTimeoutRef.current) {
    clearTimeout(checkoutAutoCloseTimeoutRef.current);
    checkoutAutoCloseTimeoutRef.current = null;
  }

  setOrderSuccessMessage("");
  setCartOpen(false);
  setCheckoutOpen(true);
};

const stickyCtaData = useMemo(() => {
  if (cartCount > 0) {
    return {
      label: tr.stickyCheckout,
      sublabel: `${cartCount} ${
        cartCount === 1 ? tr.stickyItem : tr.stickyItems
      } • ${formatPrice(total)}`,
      onClick: openCheckout
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

  const smartStickyCopy = {
  summer: {
    label: lang === "sr" ? "Treba ti letnji starter?" : "Need a summer starter?",
    sublabel: lang === "sr" ? "Otvori Summer Heat izbor" : "Open Summer Heat picks",
    moodId: "summer"
  },
  clean: {
    label: lang === "sr" ? "Kreni od čistih potpisa" : "Start with clean signatures",
    sublabel: lang === "sr" ? "Otvori Clean Everyday izbor" : "Open Clean Everyday picks",
    moodId: "clean"
  },
  rich: {
    label: lang === "sr" ? "Idi malo dublje" : "Go deeper",
    sublabel: lang === "sr" ? "Otvori Rich & Addictive izbor" : "Open Rich & Addictive picks",
    moodId: "rich"
  },
  date: {
    label: lang === "sr" ? "Nešto za veče?" : "Something for after dark?",
    sublabel: lang === "sr" ? "Otvori Date Night izbor" : "Open Date Night picks",
    moodId: "date"
  },
  signature: {
    label: lang === "sr" ? "Pronađi svoj potpis" : "Find your signature",
    sublabel: lang === "sr" ? "Otvori Signature Energy izbor" : "Open Signature Energy picks",
    moodId: "signature"
  }
};

const smartCopy = smartCtaVibe ? smartStickyCopy[smartCtaVibe] : null;

return {
  label: smartCopy?.label || tr.stickyExplore,
  sublabel:
    smartCopy?.sublabel ||
    (view === "shop"
      ? `${filteredProducts.length} ${
          lang === "sr" ? "parfema" : "fragrances"
        }`
      : tr.privateSelection),
  onClick: () => handleSmartStickyClick(smartCopy?.moodId)
};
}, [
  cartCount,
  total,
  wishlist.length,
  view,
  filteredProducts.length,
  tr,
  lang,
  smartCtaVibe,
  handleSmartStickyClick
]);

const stickyCtaJournalHasNew = journalUnreadCount > 0;

const handleStickyCtaJournalClick = (event) => {
  event.stopPropagation();
  handleJournalOpen();
};

  /* =========================================
     ACTIONS
  ========================================= */
const routeForView = (nextView) => {
  if (nextView === "shop") return "/shop";
  if (nextView === "journal") return "/journal";
  if (nextView === "exhibition") return "/exhibition";
  return "/";
};

const switchView = (nextView, options = {}) => {
  const { scrollTop = true } = options;
  const nextPath = routeForView(nextView);
  const isSameView = view === nextView;
  const hasRouteChanged = window.location.pathname !== nextPath;

  if (nextView !== "shop") {
    setHeroCollectionFilter(null);
    setHeroCollectionTitle("");
  }

  if (!isSameView) {
    setView(nextView);
  }

  if (hasRouteChanged) {
    window.history.pushState({}, "", nextPath);

    trackPageView(nextPath);
    trackMeta("PageView");
  }

  if (scrollTop && !isSameView) {
    requestAnimationFrame(() => {
      smoothScrollToTop();
    });
  }
};

const handleJournalLinkClick = (link) => {
  if (!link) return;

  const action = String(link.action || "").trim();
  const url = String(link.url || "").trim();

  // External link — YouTube, IMDb itd.
  if (url && /^https?:\/\//i.test(url)) {
    window.open(url, "_blank", "noopener,noreferrer");
    return;
  }

  // Interni Journal link može koristiti action ili stari url format
  const target = action || url;

  if (!target) return;

  // Kod navigacije iz Journala ne vraćamo staru scroll poziciju
  scrollYRef.current = 0;

  // Community / Scent Request
  if (target === "scent-request") {
    switchView("home", { scrollTop: false });

    window.setTimeout(() => {
      document
        .querySelector(".scent-request-panel")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 220);

    return;
  }

  // Shop / Home
  if (target === "shop" || target === "home") {
    switchView(target);
    return;
  }
};

const goHome = () => {
  if (view === "home") {
    smoothScrollToTop();
    return;
  }

  switchView("home");
};

const goToHomeSection = (selector, block = "start") => {
  const isAlreadyHome = view === "home";

  switchView("home", { scrollTop: false });

  window.setTimeout(() => {
    document.querySelector(selector)?.scrollIntoView({
      behavior: "smooth",
      block
    });
  }, isAlreadyHome ? 0 : 220);
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

    if (heroAutoplayResumeTimeoutRef.current) {
      clearTimeout(heroAutoplayResumeTimeoutRef.current);
    }

    heroAutoplayResumeTimeoutRef.current = setTimeout(() => {
      if (!heroHoveredRef.current) {
        setHeroPaused(false);
      }

      heroAutoplayResumeTimeoutRef.current = null;
    }, 220);
  };

  const nextHeroSlide = () => {
    bumpHeroAutoplay();

    const nextHeroIndex = (currentHero + 1) % heroSlides.length;
    showHeroSlideWhenReady(nextHeroIndex);
  };

  const prevHeroSlide = () => {
    bumpHeroAutoplay();

    const previousHeroIndex =
      (currentHero - 1 + heroSlides.length) % heroSlides.length;

    showHeroSlideWhenReady(previousHeroIndex);
  };

  const goToHeroSlide = (index) => {
    if (index === currentHero) return;

    bumpHeroAutoplay();
    showHeroSlideWhenReady(index);
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
  const { showToast = true, showMiniPreview = true } = options;

  const key = `${product.id}-${size}-${customLabel || ""}`;
  const price = customPrice ?? product.sizes[size];
  const label = customLabel || size;

  const discoveryAttribution = discoveryAttributionRef.current;

  const isDiscoveryAttributed =
    discoveryAttribution?.productId === product.id &&
    Date.now() - discoveryAttribution.clickedAt <= 30 * 60 * 1000;

  if (isDiscoveryAttributed) {
    trackEvent("discovery_add_to_cart", {
      lang,
      product_id: String(product.id),
      product_slug: product.slug || "",
      product_name: product.name,
      rank: discoveryAttribution.rank,
      match: discoveryAttribution.match,
      selected_size: label,
      selected_price: Number(price),
      search_source: discoveryAttribution.searchSource || "unknown",
      category: discoveryAttribution.category || "none",
      gender: discoveryAttribution.gender || "none",
      has_budget: discoveryAttribution.hasBudget || "no",
      has_reference: discoveryAttribution.hasReference || "no",
      has_exclusions: discoveryAttribution.hasExclusions || "no",
    });
  }

  trackEvent("add_to_cart", {
    currency: "EUR",
    value: Number(price),
    items: [
      {
        item_id: String(product.id),
        item_name: product.name,
        item_variant: label,
        item_category: product.category,
        price: Number(price),
        quantity: 1
      }
    ]
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
        item.key === key
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    }

    return [
      ...prev,
      {
        key,
        id: product.id,
        name: product.name,
        image: product.image,
        size: label,
        price,
        quantity: 1,

        analyticsSource: isDiscoveryAttributed
          ? "fragrance_intelligence"
          : "standard",

        discoveryRank: isDiscoveryAttributed
          ? discoveryAttribution.rank
          : null,

        discoveryMatch: isDiscoveryAttributed
          ? discoveryAttribution.match
          : null,

        discoverySearchSource: isDiscoveryAttributed
          ? discoveryAttribution.searchSource
          : null,
      }
    ];
  });

  if (showMiniPreview) {
    setMiniCartPreview({
      key,
      id: product.id,
      name: product.name,
      image: product.image,
      size: label,
      price
    });

    setMiniCartPreviewId((prev) => prev + 1);

    if (miniCartTimerRef.current) {
      clearTimeout(miniCartTimerRef.current);
    }

    miniCartTimerRef.current = setTimeout(() => {
      setMiniCartPreview(null);
      miniCartTimerRef.current = null;
    }, 1700);
  }

  if (showToast && !showMiniPreview) {
    showFeedback(`${product.name} ${tr.addedToCart}`);
  }
};

/* =========================================
   DISCOVERY SET HELPER
========================================= */

const discoveryProducts = products.filter(
  (product) =>
    activeDiscoveryConfig.categories.includes(product.category) &&
    product.sizes?.[activeDiscoveryConfig.size]
);

const discoverySubtotal = discoverySelected.reduce(
  (sum, product) =>
    sum + Number(product.sizes[activeDiscoveryConfig.size] || 0),
  0
);

const discoveryBundlePrice = Number(
  (discoverySubtotal * (1 - DISCOVERY_DISCOUNT)).toFixed(2)
);

const discoverySavings = Number(
  (discoverySubtotal - discoveryBundlePrice).toFixed(2)
);

const openDiscoveryBuilder = (type = "designerNiche") => {
  if (!DISCOVERY_CONFIGS[type]) return;

  setDiscoveryType(type);
  setDiscoverySelected([]);
  setDiscoveryBuilderOpen(true);
};

const toggleDiscoveryProduct = (product) => {
  setDiscoverySelected((prev) => {
    const exists = prev.some((item) => item.id === product.id);

    if (exists) {
      return prev.filter((item) => item.id !== product.id);
    }

    if (prev.length >= DISCOVERY_REQUIRED_COUNT) {
      return prev;
    }

    return [...prev, product];
  });
};

const addDiscoverySetToCart = () => {
  if (discoverySelected.length !== DISCOVERY_REQUIRED_COUNT) return;

  const bundleKey =
    `discovery-set-${activeDiscoveryConfig.key}-${discoverySelected
      .map((product) => product.id)
      .sort((a, b) => a - b)
      .join("-")}`;

  const bundleSize =
    `${DISCOVERY_REQUIRED_COUNT} × ${activeDiscoveryConfig.size}`;

  const bundleName = activeDiscoveryConfig.cartName;

  const bundleItem = {
    key: bundleKey,
    id: bundleKey,
    type: "bundle",
    name: bundleName,
    image: discoverySelected[0]?.image,
    size: bundleSize,
    price: discoveryBundlePrice,
    quantity: 1,

    bundleItems: discoverySelected.map((product) => ({
      id: product.id,
      name: product.name,
      image: product.image,
      size: activeDiscoveryConfig.size,
      price: product.sizes[activeDiscoveryConfig.size]
    }))
  };

  trackEvent("add_to_cart", {
    currency: "EUR",
    value: Number(discoveryBundlePrice),

    items: [
      {
        item_id: bundleKey,
        item_name: bundleName,
        item_variant: bundleSize,
        item_category: "Discovery Set",
        price: Number(discoveryBundlePrice),
        quantity: 1
      }
    ]
  });

  trackMeta("AddToCart", {
    content_name: bundleName,
    content_category: "Discovery Set",
    value: Number(discoveryBundlePrice),
    currency: "EUR"
  });

  setCart((prev) => {
    const existing = prev.find((item) => item.key === bundleKey);

    if (existing) {
      return prev.map((item) =>
        item.key === bundleKey
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    }

    return [...prev, bundleItem];
  });

  setDiscoveryBuilderOpen(false);
  setCartOpen(true);
  setDiscoverySelected([]);
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

  addToCart(product, size, null, null, {
    showToast: false,
    showMiniPreview: true
  });

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
    sizes: { "100ml": 39.5 }
  };

  addToCart(heroProduct, "100ml", 39.5, "100ml Full Bottle");
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
    !checkoutForm.city.trim() ||
    (
      checkoutForm.country === "OTHER" &&
      !checkoutForm.otherCountry?.trim()
    )
  ) {
    alert(
      lang === "sr"
        ? "Molimo unesite ime, prezime, email, telefon, zemlju i grad."
        : "Please enter your first name, last name, email, phone, country and city."
    );
    return;
  }

  if (!isValidEmail(checkoutForm.email)) {
    alert(
      lang === "sr"
        ? "Molimo unesite ispravnu email adresu."
        : "Please enter a valid email address."
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
        countryLabel:
          checkoutForm.country === "OTHER"
            ? checkoutForm.otherCountry.trim()
            : selectedCheckoutCountryLabel,
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

    const result = await response.json();

    if (
      !result?.success ||
      !result?.enquiryReceived ||
      !result?.enquiryId
    ) {
      throw new Error("International enquiry was not confirmed by checkout API");
    }

    setOrderSuccessMessage(
      lang === "sr"
        ? "Upit je poslat. Proverićemo mogućnost dostave van Crne Gore i javiti vam se uskoro."
        : "Your enquiry has been sent. We’ll check delivery outside Montenegro and get back to you soon."
    );

    if (checkoutAutoCloseTimeoutRef.current) {
      clearTimeout(checkoutAutoCloseTimeoutRef.current);
    }

    checkoutAutoCloseTimeoutRef.current = setTimeout(() => {
      setCheckoutOpen(false);

      setCheckoutForm({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        country: "ME",
        otherCountry: "",
        city: "",
        address: "",
        note: ""
      });

      checkoutAutoCloseTimeoutRef.current = null;
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

  if (!isValidEmail(checkoutForm.email)) {
    alert(
      lang === "sr"
        ? "Molimo unesite ispravnu email adresu."
        : "Please enter a valid email address."
    );
    return;
  }

  setIsSubmittingOrder(true);

  try {
    const purchasedProductSlugs = new Set(
      cart
        .map((item) =>
          products.find(
            (product) => String(product.id) === String(item.id)
          )
        )
        .filter(Boolean)
        .map((product) => product.slug)
    );

    const recommendationSlugs = [];

    cart.forEach((item) => {
      const sourceProduct = products.find(
        (product) => String(product.id) === String(item.id)
      );

      (sourceProduct?.recommendations || []).forEach((slug) => {
        if (
          slug &&
          !purchasedProductSlugs.has(slug) &&
          !recommendationSlugs.includes(slug)
        ) {
          recommendationSlugs.push(slug);
        }
      });
    });

    const emailRecommendations = recommendationSlugs
      .slice(0, 3)
      .map((slug) =>
        products.find((product) => product.slug === slug)
      )
      .filter(Boolean)
      .map((product) => ({
        name: product.name,
        shortName:
          product.shortName ||
          product.cardName ||
          product.name,
        slug: product.slug,
        image: product.image,
        category: product.category
      }));

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
      recommendations: emailRecommendations,
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

    const result = await response.json();

    if (
      !result?.success ||
      !result?.orderPlaced ||
      !result?.orderId
    ) {
      throw new Error("Order was not confirmed by checkout API");
    }

    const discoveryPurchasedItems = cart.filter(
      (item) => item.analyticsSource === "fragrance_intelligence"
    );

    if (discoveryPurchasedItems.length > 0) {
      const discoveryPurchaseValue = discoveryPurchasedItems.reduce(
        (sum, item) =>
          sum + Number(item.price) * Number(item.quantity || 1),
        0
      );

      trackEvent("discovery_purchase", {
        transaction_id: String(result.orderId),
        currency: "EUR",
        discovery_item_count: discoveryPurchasedItems.reduce(
          (sum, item) => sum + Number(item.quantity || 1),
          0
        ),
        discovery_value: Number(discoveryPurchaseValue.toFixed(2)),
        total_order_value: Number(subtotal),
        search_source:
          discoveryPurchasedItems[0]?.discoverySearchSource || "unknown",
        product_slugs: discoveryPurchasedItems
          .map((item) => {
            const product = products.find(
              (candidate) => candidate.id === item.id
            );

            return product?.slug || String(item.id);
          })
          .join("|"),
      });
    }

    discoveryPurchasedItems.forEach((item) => {
      const product = products.find(
        (candidate) => candidate.id === item.id
      );

      trackEvent("discovery_purchase_item", {
        transaction_id: String(result.orderId),
        currency: "EUR",

        product_id: String(item.id),
        product_slug: product?.slug || String(item.id),
        product_name: item.name,

        rank: Number(item.discoveryRank || 0),
        match: Number(item.discoveryMatch || 0),

        selected_size: item.size || "none",
        selected_price: Number(item.price),

        quantity: Number(item.quantity || 1),
        item_value:
          Number(item.price) * Number(item.quantity || 1),

        search_source:
          item.discoverySearchSource || "unknown",
      });
    });

    trackEvent("purchase", {
      transaction_id: String(result.orderId),
      currency: "EUR",
      value: Number(subtotal),
      shipping: Number(shipping),
      items: cart.map((item) => ({
        item_id: String(item.id ?? item.key),
        item_name: item.name,
        item_variant: item.size,
        price: Number(item.price),
        quantity: Number(item.quantity || 1)
      }))
    });

    trackMeta("Purchase", {
      content_ids: cart.map((item) =>
        String(item.id ?? item.key)
      ),
      content_type: "product",
      contents: cart.map((item) => ({
        id: String(item.id ?? item.key),
        quantity: Number(item.quantity || 1)
      })),
      num_items: cart.reduce(
        (totalItems, item) =>
          totalItems + Number(item.quantity || 1),
        0
      ),
      value: Number(subtotal),
      currency: "EUR"
    });

    setOrderSuccessMessage(tr.orderSuccess);
    setCart([]);

    setCheckoutForm({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      country: "ME",
      otherCountry: "",
      city: "",
      address: "",
      note: ""
    });

    if (checkoutAutoCloseTimeoutRef.current) {
      clearTimeout(checkoutAutoCloseTimeoutRef.current);
    }

    checkoutAutoCloseTimeoutRef.current = setTimeout(() => {
      setCheckoutOpen(false);
      checkoutAutoCloseTimeoutRef.current = null;
    }, 1800);
  } catch (error) {
    alert(tr.orderError);
  } finally {
    setIsSubmittingOrder(false);
  }
};

const handleHeroSlideAction = (slide) => {
  if (!slide?.actionPrimary) return;

  /* =========================================
     SHOP
  ========================================= */

  if (slide.actionPrimary === "shop") {
    setSearchTerm("");
    setCategory("All");
    setSeason("All");
    setScentMood("All");
    setSortBy("featured");
    setCurrentPage(1);
    setHeroCollectionFilter([]);
    setHeroCollectionTitle("");
    setView("shop");
    return;
  }

  /* =========================================
     COLLECTION
  ========================================= */

  if (
    slide.actionPrimary === "collection" &&
    slide.actionCollection?.length
  ) {
    setSearchTerm("");
    setCategory("All");
    setSeason("All");
    setScentMood("All");
    setSortBy("featured");
    setCurrentPage(1);
    setHeroCollectionFilter(slide.actionCollection);
    setHeroCollectionTitle(slide.collectionTitle || "");
    setView("shop");
    return;
  }

  /* =========================================
     MANIFESTO
  ========================================= */

  if (
    slide.actionPrimary === "manifesto" &&
    slide.manifestoType
  ) {
    setActiveManifesto(slide.manifestoType);
    setManifestoOpen(true);
    return;
  }

  /* =========================================
     PRODUCT
  ========================================= */

  if (
    slide.actionPrimary === "product" &&
    slide.actionProductSlug
  ) {
    const product = products.find(
      (item) => item.slug === slide.actionProductSlug
    );

    if (!product) {
      console.warn(
        `Hero product not found: ${slide.actionProductSlug}`
      );
      return;
    }

    openProductModal(product, {
      preferredSize: slide.preferredSize || "10ml",
      userPickedSize: true,
      changeView: false,
    });
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

  document.activeElement?.blur();

  setCurrentPage(safePageNumber);
  setShouldScrollToGrid(true);
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

const isMobileProductModal = () =>
  window.matchMedia("(max-width: 640px)").matches;

const openProductModal = (product, options = {}) => {
  if (!product) return;

  const activeElement = document.activeElement;

    productModalTriggerRef.current =
      activeElement instanceof HTMLElement &&
      activeElement !== document.body
        ? activeElement
        : null;

  const {
    updateUrl = true,
    preferredSize = "",
    userPickedSize = false,
    changeView = true
  } = options;

  const isMobileModal = isMobileProductModal();

  if (productModalCloseTimeoutRef.current) {
    clearTimeout(productModalCloseTimeoutRef.current);
    productModalCloseTimeoutRef.current = null;
  }

  if (productModalAutoCloseTimeoutRef.current) {
    clearTimeout(productModalAutoCloseTimeoutRef.current);
    productModalAutoCloseTimeoutRef.current = null;
  }

  productModalScrollYRef.current =
    window.scrollY || window.pageYOffset || 0;

  const initialSize =
    preferredSize && product.sizes?.[preferredSize]
      ? preferredSize
      : Object.keys(product.sizes || {})[0] || "";

  const initialPrice = Number(product.sizes?.[initialSize] || 0);

  if (changeView) {
    setView("shop");
  }

  setSelectedProduct(product);
  setSelectedSize(initialSize);
  setHasUserPickedSize(userPickedSize);

  trackEvent("view_item", {
    currency: "EUR",
    value: initialPrice,
    items: [
      {
        item_id: String(product.id),
        item_name: product.name,
        item_variant: initialSize,
        item_category: product.category,
        price: initialPrice,
        quantity: 1
      }
    ]
  });

  trackMeta("ViewContent", {
    content_ids: [String(product.id)],
    content_name: product.name,
    content_category: product.category,
    content_type: "product",
    value: initialPrice,
    currency: "EUR"
  });

  if (isMobileModal) {
    setProductModalVisible(true);
  } else {
    setProductModalVisible(false);
  }

  if (updateUrl) {
    const productUrl = getProductUrl(product);
    const hasRouteChanged = window.location.pathname !== productUrl;

    if (hasRouteChanged) {
      window.history.pushState(
        {
          playniceProductModal: true,
          productSlug: getProductSlug(product),
          productOriginView: changeView ? "shop" : view
        },
        "",
        productUrl
      );

      trackPageView(productUrl);
      trackMeta("PageView");
    }
  }

  if (!isMobileModal) {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setProductModalVisible(true);
      });
    });
  }
};

const getDiscoveryAnalyticsParams = (discovery, source = "manual") => {
  const intent = discovery?.intent || {};

  return {
    lang,
    search_source: source,
    result_count: discovery?.results?.length || 0,
    is_relevant: discovery?.isRelevant ? "yes" : "no",
    has_budget: intent.maxPrice != null ? "yes" : "no",
    has_reference: intent.referenceProduct ? "yes" : "no",
    category: intent.categories?.[0] || "none",
    gender: intent.gender || "none",
    contexts: intent.contexts?.length
      ? intent.contexts.join("|")
      : "none",
    modifiers: intent.referenceModifiers?.length
      ? intent.referenceModifiers.join("|")
      : "none",
    has_exclusions:
      intent.negativeTraits?.length ||
      intent.excludedNotes?.length ||
      intent.hardExcludedNotes?.length
        ? "yes"
        : "no",
  };
};

const handleDiscoverySearch = (
  queryOverride = discoveryQuery,
  source = "manual"
) => {
  const nextQuery = String(queryOverride || "").trim();

  if (!nextQuery) {
    setDiscoveryResults([]);
    setDiscoveryFeedback("");
    setDiscoveryPage(1);
    return;
  }

  const discovery = discoverFragrances({
    query: nextQuery,
    products,
    productCopy,
    productWearContext,
    discoveryProfiles,
    lang,
    limit: products.length,
  });

  const analyticsParams = getDiscoveryAnalyticsParams(
    discovery,
    source
  );

  discoverySearchContextRef.current = {
    ...analyticsParams,
    searchedAt: Date.now(),
  };

  trackEvent("discovery_search", analyticsParams);

  if (!discovery.results?.length) {
    trackEvent("discovery_no_results", analyticsParams);
  }

  setDiscoveryQuery(nextQuery);
  setDiscoveryResults(discovery.results);
  setDiscoveryFeedback(discovery.feedback || "");
  setDiscoveryPage(1);
};

const handleProductCardOpen = (product) => {
  openProductModal(product);

  if (!product?.isNew || !newProductsSignature) return;

  try {
    localStorage.setItem(
      SHOP_NEW_PRODUCTS_SEEN_KEY,
      newProductsSignature
    );
  } catch {}

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

useEffect(() => {
  const path = window.location.pathname;

  if (!path.startsWith("/journal/")) return;

  const matchedArticle = getJournalArticleFromCurrentUrl();

  if (matchedArticle) return;

  setJournalPageArticle(null);
  setView("journal");
  window.history.replaceState({}, "", "/journal");
}, []);

const PRODUCT_MODAL_CLOSE_DELAY = 180;
const PRODUCT_MODAL_CART_CLOSE_DELAY = 240;

const restoreProductModalScroll = () => {
  const targetScrollY = productModalScrollYRef.current;

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      window.scrollTo({
        top: targetScrollY,
        left: 0,
        behavior: "auto"
      });
    });
  });
};

const closeProductModal = (
  cleanupDelay = PRODUCT_MODAL_CLOSE_DELAY
) => {
  const isMobileModal = isMobileProductModal();
  const returnScrollY = productModalReturnScrollRef.current;

  if (Number.isFinite(returnScrollY)) {
    window.setTimeout(() => {
      window.scrollTo({ top: returnScrollY, left: 0, behavior: "auto" });
      productModalReturnScrollRef.current = null;
    }, cleanupDelay + 60);
  }

  setNoteMapOpen(false);
  setProductModalVisible(false);
  setHasUserPickedSize(false);
  setModalDiscountFlashKey(null);

  if (productModalAutoCloseTimeoutRef.current) {
    clearTimeout(productModalAutoCloseTimeoutRef.current);
    productModalAutoCloseTimeoutRef.current = null;
  }

  if (productModalCloseTimeoutRef.current) {
    clearTimeout(productModalCloseTimeoutRef.current);
    productModalCloseTimeoutRef.current = null;
  }

  const cleanupProductModal = () => {
    setSelectedProduct(null);
    setSelectedSize("");
    productModalCloseTimeoutRef.current = null;

    const triggerElement = productModalTriggerRef.current;
      productModalTriggerRef.current = null;

      requestAnimationFrame(() => {
        if (
          triggerElement &&
          document.contains(triggerElement)
        ) {
          triggerElement.focus({
            preventScroll: true
          });
        }
      });

    if (window.location.pathname.startsWith("/product/")) {
      const openedInsidePlayNice =
        window.history.state?.playniceProductModal === true;

      if (openedInsidePlayNice) {
        window.addEventListener(
          "popstate",
          restoreProductModalScroll,
          { once: true }
        );

        window.history.back();
      } else {
        window.history.replaceState({}, "", "/shop");
        setView("shop");
        trackPageView("/shop");
        trackMeta("PageView");
        restoreProductModalScroll();
      }
    } else {
      restoreProductModalScroll();
    }
  };

  if (isMobileModal) {
    cleanupProductModal();
    return;
  }

  productModalCloseTimeoutRef.current = setTimeout(() => {
    cleanupProductModal();
  }, cleanupDelay);
};

useEffect(() => {
  const handleGlobalEscape = (event) => {
    if (event.key !== "Escape") return;

    // Nested layer inside Product modal
    if (noteMapOpen) {
      setNoteMapOpen(false);
      return;
    }

    // Product modal is the highest regular layer
    if (selectedProduct) {
      closeProductModal();
      return;
    }

    if (discoveryBuilderOpen) {
      setDiscoveryBuilderOpen(false);
      return;
    }

    if (catalogPreview) {
      closeCatalogPreview();
      return;
    }

    if (checkoutOpen) {
      if (isSubmittingOrder) return;

      setCheckoutOpen(false);
      return;
    }

    if (cartOpen) {
      setCartOpen(false);
      return;
    }

    if (manifestoOpen) {
      setManifestoOpen(false);
      setActiveManifesto(null);
      return;
    }

    if (faqOpen) {
      setFaqOpen(false);
      setOpenFaqIndex(null);
      return;
    }

    if (howItWorksOpen) {
      setHowItWorksOpen(false);
      return;
    }

    if (storyOpen) {
      setStoryOpen(false);
      return;
    }

    if (privateSelectionOpen) {
      setPrivateSelectionOpen(false);
      return;
    }

    if (discoveryOpen) {
      setDiscoveryOpen(false);
    }
  };

  window.addEventListener("keydown", handleGlobalEscape);

  return () => {
    window.removeEventListener("keydown", handleGlobalEscape);
  };
}, [
  noteMapOpen,
  selectedProduct,
  discoveryBuilderOpen,
  catalogPreview,
  checkoutOpen,
  cartOpen,
  manifestoOpen,
  faqOpen,
  howItWorksOpen,
  storyOpen,
  privateSelectionOpen,
  discoveryOpen,
  isSubmittingOrder
]);

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

/* =========================================
   shouldScrollToGrid
========================================= */

useEffect(() => {
  if (!shouldScrollToGrid) return;

  const timer = setTimeout(() => {
    if (!productGridRef.current) return;

    const y =
      productGridRef.current.getBoundingClientRect().top +
      window.scrollY -
      160;

    window.scrollTo({
      top: y,
      behavior: "smooth"
    });

    setShouldScrollToGrid(false);
  }, 30);

  return () => clearTimeout(timer);
}, [currentPage, shouldScrollToGrid]);

/* =========================================
   SEO title/meta useEffect
========================================= */
  useEffect(() => {
  if (view === "journal" && !selectedProduct) {
    return;
  }

  const seoTitle = selectedProduct
    ? getProductSeoTitle(selectedProduct, lang)
    : view === "shop"
    ? lang === "en"
      ? "Shop | Premium fragrances and decants in Montenegro | PlayNice"
      : "Shop | Premium parfemi i dekanti u Crnoj Gori | PlayNice"
    : view === "journal"
    ? lang === "en"
      ? "Le Journal | Fragrance stories and recommendations | PlayNice"
      : "Le Journal | Mirisne priče i preporuke | PlayNice"
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
      ? "Le Journal by PlayNice brings short fragrance stories, recommendations and guides for choosing the right perfume."
      : "PlayNice rubrika Le Journal donosi kratke mirisne priče, preporuke i vodiče za bolji izbor parfema."
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
   HERO_MANIFESTOS
========================================= */

const HERO_MANIFESTOS = {
  "playnice-mission": {
    kicker: lang === "sr" ? "PLAYNICE MISSION" : "PLAYNICE MISSION",
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
            "Remember. PlayNice."
          ]
        : [
            "We choose moments that stay on the skin, in memory, and in the way you enter a room.",
            "PlayNice exists because of one simple idea: luxury should be experienced first — and bought after.",
            "Try before you buy.",
            "Remember. PlayNice."
          ],
    cta: lang === "sr" ? "Napravi svoj Discovery Set" : "Build your Discovery Set",
    action: "discovery"
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
            "Hvala što si deo PlayNice priče."
          ]
        : [
            "Every order passes through the same hands that choose the fragrances for the collection.",
            "Premium bottles. Gift samples. A thank-you card. Packaging that feels like a gift — even when you are buying it for yourself.",
            "We believe luxury does not begin when you open the fragrance.",
            "It begins when you open the box.",
            "Thank you for being part of the PlayNice story."
          ],
    cta: lang === "sr" ? "Otkrij kolekciju" : "Explore collection",
    action: "shop"
  },

  confidence: {
  kicker: "PLAYNICE CONFIDENCE",
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
          "Pronađi svoj potpis."
        ]
      : [
          "Some change the way you enter a room.",
          "We do not choose fragrances only for their notes. We choose them for the feeling they leave behind.",
          "Confidence. Presence. Character.",
          "That is why the PlayNice collection is not filled with hundreds of random perfumes.",
          "Only the ones that leave an impression.",
          "Find your signature."
        ],
  cta: lang === "sr" ? "Pronađi svoj potpis" : "Find your signature",
  action: "shop"
}
};

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
   JOURNAL SEO
========================================= */

useEffect(() => {
  if (view !== "journal" || selectedProduct) {
    return undefined;
  }

  const article = journalPageArticle || null;

  const title = getJournalSeoTitle(article, lang);
  const description = getJournalSeoDescription(article, lang);
  const canonicalUrl = getJournalSeoUrl(article);
  const imageUrl = getJournalSeoImage(article);

  const previousTitle = document.title;

  document.title = title;

  const upsertMeta = (selector, attributes) => {
    let element = document.head.querySelector(selector);

    const created = !element;

    if (!element) {
      element = document.createElement("meta");
      document.head.appendChild(element);
    }

    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });

    return {
      element,
      created
    };
  };

  const managedElements = [];

  managedElements.push(
    upsertMeta('meta[name="description"]', {
      name: "description",
      content: description
    })
  );

  managedElements.push(
    upsertMeta('meta[property="og:title"]', {
      property: "og:title",
      content: title
    })
  );

  managedElements.push(
    upsertMeta('meta[property="og:description"]', {
      property: "og:description",
      content: description
    })
  );

  managedElements.push(
    upsertMeta('meta[property="og:image"]', {
      property: "og:image",
      content: imageUrl
    })
  );

  managedElements.push(
    upsertMeta('meta[property="og:url"]', {
      property: "og:url",
      content: canonicalUrl
    })
  );

  managedElements.push(
    upsertMeta('meta[property="og:type"]', {
      property: "og:type",
      content: article ? "article" : "website"
    })
  );

  managedElements.push(
    upsertMeta('meta[name="twitter:card"]', {
      name: "twitter:card",
      content: "summary_large_image"
    })
  );

  managedElements.push(
    upsertMeta('meta[name="twitter:title"]', {
      name: "twitter:title",
      content: title
    })
  );

  managedElements.push(
    upsertMeta('meta[name="twitter:description"]', {
      name: "twitter:description",
      content: description
    })
  );

  managedElements.push(
    upsertMeta('meta[name="twitter:image"]', {
      name: "twitter:image",
      content: imageUrl
    })
  );

  let canonical = document.head.querySelector(
    'link[rel="canonical"]'
  );

  const canonicalCreated = !canonical;

  if (!canonical) {
    canonical = document.createElement("link");
    canonical.setAttribute("rel", "canonical");
    document.head.appendChild(canonical);
  }

  const previousCanonical =
    canonical.getAttribute("href") || "";

  canonical.setAttribute("href", canonicalUrl);

  const existingSchema = document.getElementById(
    "playnice-journal-schema"
  );

  if (existingSchema) {
    existingSchema.remove();
  }

  if (article) {
    const structuredData =
      getJournalStructuredData(article, lang);

    if (structuredData) {
      const script = document.createElement("script");

      script.id = "playnice-journal-schema";
      script.type = "application/ld+json";
      script.textContent =
        JSON.stringify(structuredData);

      document.head.appendChild(script);
    }
  }

  return () => {
    document.title = previousTitle;

    const schema = document.getElementById(
      "playnice-journal-schema"
    );

    schema?.remove();

    managedElements.forEach(({ element, created }) => {
      if (created) {
        element.remove();
      }
    });

    if (canonicalCreated) {
      canonical.remove();
    } else {
      canonical.setAttribute(
        "href",
        previousCanonical
      );
    }
  };
}, [view, journalPageArticle, lang, selectedProduct]);

/* =========================================
   SCENT REQUESTS USEEFFECT
========================================= */

useEffect(() => {
  try {
    localStorage.setItem(
      "playnice_scent_requests",
      JSON.stringify(communityRequests)
    );
  } catch (error) {
    console.error("Scent requests storage failed:", error);
  }
}, [communityRequests]);

/* =========================================
   SCENT REQUESTS COUNTER USEEFFECT
========================================= */

useEffect(() => {
  let isMounted = true;

  const loadScentRequests = async () => {
    try {
      const response = await fetch(
        "https://script.google.com/macros/s/AKfycby38XWvXcD6Cgw2_ExKEpegaYg-mgiuYLVXzDgcwefVSCZtyWVL2QvVQzmX7nrltene/exec"
      );

      const data = await response.json();

      if (!isMounted) return;

      if (data.status === "ok") {
      if (Array.isArray(data.requests) && data.requests.length > 0) {
      setCommunityRequests(data.requests);
      }

      if (
        Array.isArray(data.existingRequests) &&
        data.existingRequests.length > 0
      ) {
        setExistingCollectionRequests(data.existingRequests);

        try {
          localStorage.setItem(
            "playnice_existing_collection_requests_v1",
            JSON.stringify(data.existingRequests)
          );
        } catch {}
      } else {
        try {
          const cachedExistingRequests = JSON.parse(
            localStorage.getItem("playnice_existing_collection_requests_v1") || "[]"
          );

          setExistingCollectionRequests(
            Array.isArray(cachedExistingRequests) && cachedExistingRequests.length > 0
              ? cachedExistingRequests
              : Object.entries(EXISTING_COLLECTION_LOCKED_VOTES).map(([name, votes]) => ({
                  name,
                  votes,
                  lockedVotes: votes,
                }))
          );
        } catch {
          setExistingCollectionRequests(
            Object.entries(EXISTING_COLLECTION_LOCKED_VOTES).map(([name, votes]) => ({
              name,
              votes,
              lockedVotes: votes,
            }))
          );
        }
      }
    }
    } catch (error) {
      console.error("Failed to load scent requests:", error);

      try {
        const cachedExistingRequests = JSON.parse(
          localStorage.getItem("playnice_existing_collection_requests_v1") || "[]"
        );

        setExistingCollectionRequests(
          Array.isArray(cachedExistingRequests) && cachedExistingRequests.length > 0
            ? cachedExistingRequests
            : Object.entries(EXISTING_COLLECTION_LOCKED_VOTES).map(([name, votes]) => ({
                name,
                votes,
                lockedVotes: votes,
              }))
        );
      } catch {
        setExistingCollectionRequests(
          Object.entries(EXISTING_COLLECTION_LOCKED_VOTES).map(([name, votes]) => ({
            name,
            votes,
            lockedVotes: votes,
          }))
        );
      }
    }
  };

  loadScentRequests();

  return () => {
    isMounted = false;
  };
}, []);

/* =========================================
   VIBE TRACKER I RESOLVER
========================================= */

useEffect(() => {
  if (!selectedProduct) return;

  const moods = selectedProduct.moods || selectedProduct.scentMoods || [];

  setSmartCtaStats((prev) => {
    const next = { ...prev };

    moods.forEach((mood) => {
      if (next[mood] !== undefined) {
        next[mood] += 1;
      }
    });

    return next;
  });
}, [selectedProduct]);

useEffect(() => {
  if (cartCount > 0 || wishlist.length > 0) return;

  if (smartCtaStats.summer >= 3) {
    setSmartCtaVibe("summer");
    return;
  }

  if (smartCtaStats.clean >= 2 || smartCtaStats.soft >= 2) {
    setSmartCtaVibe("clean");
    return;
  }

  if (smartCtaStats.rich >= 2) {
    setSmartCtaVibe("rich");
    return;
  }

  if (smartCtaStats.date >= 2) {
    setSmartCtaVibe("date");
    return;
  }

  if (smartCtaStats.signature >= 2) {
    setSmartCtaVibe("signature");
  }
}, [smartCtaStats, cartCount, wishlist.length]);

/* =========================================
   INNER COMPONENTS
========================================= */
const ProductCard = ({
  product,
  wishlist,
  toggleWishlist,
  sprayingWishlistId,
  changeViewOnOpen = true
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

const displayedCardName = product.cardName || product.name;

const titleLengthClass =
  displayedCardName.length > 44
    ? "is-very-long-title"
    : displayedCardName.length > 32
    ? "is-long-title"
    : "";

  return (
  <article className="product-card premium-product-card">
    <button
      type="button"
      className="product-card-media clickable-media"
      onMouseDown={(e) => e.preventDefault()}
      onClick={() =>
        changeViewOnOpen
          ? handleProductCardOpen(product)
          : openProductModal(product, { changeView: false })
      }
      aria-label={product.name}
    >
      <img
        src={product.image || "/placeholder.png"}
        alt={product.name}
        className="product-card-image"
        loading="lazy"
      />

      {product.discount && (
  <span className="product-sale-badge">
    <span>SALE</span>
    <strong>-{product.discount.percent}%</strong>
  </span>
)}

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
  onMouseDown={(e) => {
    e.preventDefault();
    e.stopPropagation();
  }}
  onPointerDown={(e) => {
    e.stopPropagation();
  }}
  onClick={(e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  }}
  aria-label={
    isWishlisted
      ? lang === "sr"
        ? `Ukloni ${product.name} iz Private Selection`
        : `Remove ${product.name} from Private Selection`
      : lang === "sr"
      ? `Dodaj ${product.name} u Private Selection`
      : `Add ${product.name} to Private Selection`
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

  <div className="product-meta premium-product-meta">

    <div className="product-meta-top">
      <p className="product-category">{getCategoryLabel(product.category)}</p>
      <h3 className={`product-card-title ${titleLengthClass}`}>
        {displayedCardName}
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
  <button
    type="button"
    className="product-card-cta"
    onClick={() =>
      changeViewOnOpen
        ? handleProductCardOpen(product)
        : openProductModal(product, { changeView: false })
    }
  >
    {tr.productCardCta}
  </button>
      </div>
    </div>
  </div>

  <div className="size-buttons" onClick={(e) => e.stopPropagation()}>
  {Object.entries(product.sizes).map(([size, price]) => {
    const feedbackKey = `${product.id}-${size}`;
    const isJustAdded = inlineAddedKey === feedbackKey;
    const isRecommendedSize = product.discount
    ? size === product.discount.size
    : size === "5ml";
    const wearHint = getSizeWearHint(size);

    const discount = getProductDiscountForSize(product, size);
    const finalPrice = discount
      ? getDiscountedPrice(price, discount.percent)
      : price;

    const productForCart = discount
      ? {
          ...product,
          sizes: {
            ...product.sizes,
            [size]: finalPrice,
          },
        }
      : product;

    return (
      <button
        key={size}
        type="button"
        className={`size-chip ${isRecommendedSize ? "is-recommended" : ""} ${
          discount ? "has-discount" : ""
        }`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          e.currentTarget.blur();

          addToCart(productForCart, size, null, null, {
            showToast: false,
            showMiniPreview: true,
          });

          triggerInlineAddedFeedback(product.id, size);
        }}
      >
        <span className="size-chip-main-wrap">
          <span className="size-chip-main-row">
            <span className="size-chip-main">{size}</span>

          {discount ? (
            <span className="size-chip-discount-best">
             {tr.sizeBestChoice} -{discount.percent}%
            </span>
          ) : (
          isRecommendedSize && (
            <span className="size-chip-recommended">
              {tr.sizeBestChoice}
            </span>
            )
          )}

            {product.slug === "ysl-y-iced-cologne" && size === "10ml" && (
              <span className="size-chip-recommended">
                {lang === "sr" ? "+ UZORAK" : "+ FREE SAMPLE"}
              </span>
            )}
          </span>

          {wearHint && (
            <span className="size-chip-wear-hint">{wearHint}</span>
          )}
        </span>

        <span className={`size-chip-price ${discount ? "has-discount" : ""}`}>
          {discount ? (
            <>
              <span className="size-chip-old-price">{formatPrice(price)}</span>
              <span className="size-chip-new-price">
                {formatPrice(finalPrice)}
              </span>
            </>
          ) : (
            formatPrice(price)
          )}
        </span>

        <span
          className={`size-chip-flash ${isJustAdded ? "show" : ""}`}
          aria-hidden="true"
        >
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
  <div
    className={`app-shell ${
      view === "exhibition"
        ? "app-shell--exhibition"
        : view === "journal"
        ? "app-shell--journal"
        : ""
    }`}
  >

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

<div
  className={`header-system ${
    headerVariant === "next" ? "header-next-system" : ""
  }`}
>
  {headerVariant === "next" ? (
    <HeaderNext
      lang={lang}
      view={view}
      hasNewShopProducts={hasNewShopProducts}
      hasNewJournalArticle={hasNewJournalArticle}
      cartCount={cartCount}
      wishlistCount={wishlist.length}
      onHome={goHome}
      onShop={goToShop}
      onJournal={handleJournalOpen}
      onCommunity={() => goToHomeSection(".community-requests-section")}
      onExhibition={() => switchView("exhibition")}
      onCart={() => setCartOpen((prev) => !prev)}
      onWishlist={() => setPrivateSelectionOpen(true)}
      onLanguage={() => setLang(lang === "sr" ? "en" : "sr")}
      onHowItWorks={() => setHowItWorksOpen(true)}
      onDiscoverySets={() => goToHomeSection(".discovery-showcase", "center")}
      onWhyPlayNice={() => setStoryOpen(true)}
      onScentRequest={() => goToHomeSection(".scent-request-panel", "center")}
    />
  ) : (
  <header className="topbar topbar-enterprise">
    <span className="topbar-connector" aria-hidden="true" />

    <button
      className="brand enterprise-brand"
      type="button"
      onClick={goHome}
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
        onClick={goHome}
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

      <div className="language-compact">
  <button
    className="language-current"
    type="button"
    aria-label={lang === "sr" ? "Promeni jezik" : "Change language"}
    onClick={() => {
      setLang(lang === "sr" ? "en" : "sr");
    }}
  >
    <span key={lang}>{lang.toUpperCase()}</span>
  </button>
</div>
    </div>
  </header>
  )}

  {view !== "exhibition" && (
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
  )}
</div>

{addedFeedback && <div className="added-feedback">{addedFeedback}</div>}

      <main>
        {view === "journal" && !journalPageArticle && (
          <JournalPage
            lang={lang}
            articles={journalArticles}
            onOpenArticle={handleJournalArticleOpen}
          />
        )}

        {view === "journal" && journalPageArticle && (
          <JournalArticlePage
            lang={lang}
            article={journalPageArticle}
            previousArticle={previousJournalArticle}
            nextArticle={nextJournalArticle}
            relatedProducts={journalPageRelatedProducts}
            onBackToJournal={handleJournalPageBack}
            onOpenArticle={handleJournalArticleOpen}
            onArticleLink={handleJournalLinkClick}
            feedback={activeJournalFeedback}
            voteSuccess={journalVoteSuccess}
            feedbackSuccess={journalFeedbackSuccess}

            onFeedbackVote={(vote) =>
              handleJournalFeedbackVote(journalPageArticle, vote)
            }

            onFeedbackNoteChange={(value) =>
              handleJournalFeedbackNoteChange(journalPageArticle, value)
            }

            onFeedbackSubmit={() =>
              handleJournalFeedbackSubmit(journalPageArticle)
            }
            onOpenProduct={(product) => {
              openProductModal(product, {
                changeView: false,
              });
            }}
          />
        )}

        {view === "exhibition" && (
          <Exhibition
            lang={lang}
            onSeeLive={() => {
            switchView("home");

            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                });
              });
            });
          }}
        />
      )}

      {view === "home" && (
        <>
          <section
            className="hero hero-carousel"
            onMouseEnter={() => {
              heroHoveredRef.current = true;
              setHeroPaused(true);
            }}
            onMouseLeave={() => {
              heroHoveredRef.current = false;
              setHeroPaused(false);
            }}
            onTouchStart={handleHeroTouchStart}
            onTouchEnd={handleHeroTouchEnd}
          >
            <div className="hero-carousel-track">
             {heroSlides.map((slide, index) => {
      const isActive = index === currentHero;

      const previousHeroIndex =
        (currentHero - 1 + heroSlides.length) % heroSlides.length;

      const nextHeroIndex =
        (currentHero + 1) % heroSlides.length;

      const shouldLoadHeroImage =
        isActive ||
        index === previousHeroIndex ||
        index === nextHeroIndex;

      const isActionable =
        slide.actionPrimary === "shop" ||
        (
          slide.actionPrimary === "product" &&
          Boolean(slide.actionProductSlug)
        ) ||
        (
          slide.actionPrimary === "collection" &&
          Boolean(slide.actionCollection?.length)
        ) ||
        (
          slide.actionPrimary === "manifesto" &&
          Boolean(slide.manifestoType)
        );

      return (
        <article
          key={slide.id}
          className={`hero-slide ${isActive ? "active" : ""}`}
          aria-hidden={!isActive}
        >
          <div
            className={`hero-image-only ${
              isActionable ? "hero-image-clickable" : ""
            }`}
            role={isActionable ? "button" : undefined}
            tabIndex={isActionable && isActive ? 0 : undefined}
            aria-label={
              isActionable
                ? slide.actionLabel || slide.alt
                : undefined
            }
            onClick={() => {
              if (!isActionable || !isActive) return;

              handleHeroSlideAction(slide);
            }}
            onKeyDown={(event) => {
              if (!isActionable || !isActive) return;

              if (
                event.key !== "Enter" &&
                event.key !== " "
              ) {
                return;
              }

              event.preventDefault();
              handleHeroSlideAction(slide);
            }}
          >
            {shouldLoadHeroImage && (
              <picture>
                <source
                  media="(max-width: 768px)"
                  srcSet={slide.mobileImage || slide.image}
                />

                <img
                  className={`hero-image-only-img ${
                  isActive ? "is-active" : ""
                }`}
                  src={slide.desktopImage || slide.image}
                  alt={slide.alt || ""}
                  loading="eager"
                  fetchPriority={isActive ? "high" : "auto"}
                  draggable="false"
                />
             </picture>
            )}
          </div>
        </article>
      );
    })}
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
        {heroSlides.map((slide, index) => {
          const isActive = index === currentHero;

          return (
            <button
              key={slide.id}
              type="button"
              className={`hero-carousel-dot ${
                isActive ? "active" : ""
              }`}
              onClick={() => goToHeroSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
              aria-selected={isActive}
              role="tab"
            >
              <span className="hero-carousel-dot-pill" />
            </button>
          );
        })}
      </div>
    </>
  )}
</section>

<section className="value-strip">
  <div>{tr.valueTry}</div>
  <div>{tr.valuePremium}</div>
  <div>{tr.valueDelivery}</div>
</section>

{/* PLAYNICE FRAGRANCE INTELLIGENCE — V6 */}
<section
  className="playnice-discovery-portal section-wrap"
  aria-labelledby="playnice-discovery-trigger-label"
>
  <button
    type="button"
    className="playnice-discovery-trigger"
    onClick={() => {
      trackEvent("discovery_open", {
        lang,
        view,
      });

      setDiscoveryOpen(true);
    }}
    aria-expanded={discoveryOpen}
    aria-controls="playnice-discovery-panel"
  >
    <span className="playnice-discovery-orbit" aria-hidden="true">
      <span />
    </span>

    <span id="playnice-discovery-trigger-label">
      PLAYNICE FRAGRANCE INTELLIGENCE
    </span>

    <span className="playnice-discovery-trigger-arrow" aria-hidden="true">
      →
    </span>
  </button>

  {discoveryOpen && (
    <div
      className="playnice-discovery-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          setDiscoveryOpen(false);
        }
      }}
    >
      <div
        id="playnice-discovery-panel"
        className={`playnice-discovery-panel ${
          discoveryResults.length > 0 ? "has-results" : ""
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="playnice-discovery-title"
      >
        <div className="playnice-discovery-panel-glow" aria-hidden="true" />
        <div className="playnice-discovery-panel-glow-secondary" aria-hidden="true" />

        <button
          type="button"
          className="playnice-discovery-close"
          onClick={() => setDiscoveryOpen(false)}
          aria-label={
            lang === "sr"
              ? "Zatvori Fragrance Intelligence"
              : "Close Fragrance Intelligence"
          }
        >
          ×
        </button>

        <div className="playnice-discovery-panel-head">
          <div className="playnice-discovery-eyebrow">
            <span className="playnice-discovery-orbit" aria-hidden="true">
              <span />
            </span>
            PLAYNICE FRAGRANCE INTELLIGENCE
          </div>

          <h2 id="playnice-discovery-title">
            {lang === "sr"
              ? "Reci nam šta želiš. Pronaći ćemo miris."
              : "Tell us what you want. We'll find the scent."}
          </h2>

          <p>
            {lang === "sr"
              ? "Ne trebaju ti filteri ni parfemski termini. Napiši priliku, budžet, stil, parfem koji voliš — ili ono što ne želiš."
              : "No filters or fragrance vocabulary required. Tell us the occasion, budget, style, a scent you love — or what you want to avoid."}
          </p>

          <div className="playnice-discovery-ai-note">
            <span className="playnice-discovery-ai-dot" aria-hidden="true" />
            <span>
              {lang === "sr"
                ? "PlayNice Fragrance Intelligence analizira stil, budžet, atmosferu i kontekst nošenja."
                : "PlayNice Fragrance Intelligence reads style, budget, mood, and wear context in one pass."}
            </span>
          </div>
        </div>

        <form
          className="playnice-discovery-search"
          onSubmit={(event) => {
            event.preventDefault();
            handleDiscoverySearch();
          }}
        >
          <div className="playnice-discovery-input-wrap">
            <span className="playnice-discovery-search-icon" aria-hidden="true">
              ✦
            </span>

            <input
              type="text"
              value={discoveryQuery}
              onChange={(event) => setDiscoveryQuery(event.target.value)}
              placeholder={
                lang === "sr"
                  ? "Npr. nešto sveže za leto do 15 €, ali ne previše citrusno..."
                  : "E.g. something fresh for summer under €15, but not too citrusy..."
              }
              autoFocus={
                typeof window !== "undefined" &&
                !window.matchMedia("(max-width: 680px)").matches
              }
              aria-label={
                lang === "sr"
                  ? "Opiši kakav parfem tražiš"
                  : "Describe the fragrance you are looking for"
              }
            />

            {discoveryQuery && (
              <button
                type="button"
                className="playnice-discovery-clear"
                onClick={() => {
                    setDiscoveryQuery("");
                    setDiscoveryResults([]);
                    setDiscoveryPage(1);
                  }}
                aria-label={lang === "sr" ? "Obriši upit" : "Clear query"}
              >
                ×
              </button>
            )}
          </div>

          <button
            type="submit"
            className="playnice-discovery-submit"
            disabled={!discoveryQuery.trim()}
          >
            <span>{lang === "sr" ? "Pronađi" : "Find"}</span>
            <span aria-hidden="true">→</span>
          </button>
        </form>

        <div className="playnice-discovery-prompts">
          {[
            {
              sr: "Sveže za leto do 15 €",
              en: "Fresh for summer under €15",
            },
            {
              sr: "Nešto kao Naxos",
              en: "Something like Naxos",
            },
            {
              sr: "Čisto i elegantno za posao",
              en: "Clean and elegant for work",
            },
            {
              sr: "Za dejt, ali ne previše slatko",
              en: "Date night, not too sweet",
            },
          ].map((prompt) => {
            const promptText = lang === "sr" ? prompt.sr : prompt.en;

            return (
              <button
                key={prompt.en}
                type="button"
                className="playnice-discovery-prompt"
                onClick={() =>
                  handleDiscoverySearch(promptText, "prompt")
                }
              >
                <span>{promptText}</span>
                <span aria-hidden="true">↗</span>
              </button>
            );
          })}
        </div>

        {discoveryFeedback && (
          <div className="playnice-discovery-feedback" role="status">
            <span aria-hidden="true">✦</span>
            <p>{discoveryFeedback}</p>
          </div>
        )}

        {discoveryResults.length > 0 && (
          <div className="playnice-discovery-results">
            <div className="playnice-discovery-results-head">
              <div>
                <span className="playnice-discovery-results-kicker">
                  {lang === "sr" ? "ODABRANO ZA TEBE" : "SELECTED FOR YOU"}
                </span>

                <h3>
                  {lang === "sr"
                    ? "Najbolje rangirani mirisi za tvoj upit."
                    : "The best-ranked scents for your search."}
                </h3>
              </div>

              <button
                type="button"
                className="playnice-discovery-reset"
                onClick={() => {
                  setDiscoveryQuery("");
                  setDiscoveryResults([]);
                  setDiscoveryPage(1);
                }}
              >
                {lang === "sr" ? "Nova pretraga" : "New search"}
                <span aria-hidden="true">↻</span>
              </button>
            </div>

            <div
              key={discoveryPage}
              className="playnice-discovery-grid"
            >
              {visibleDiscoveryResults.map((result, index) => {
                const globalRank = discoveryPageStart + index + 1;
                const matchLabel =
                  result.match >= 92
                    ? lang === "sr"
                      ? "Najbolji izbor"
                      : "Best match"
                    : result.match >= 86
                      ? lang === "sr"
                        ? "Odličan izbor"
                        : "Excellent match"
                      : lang === "sr"
                        ? "Dobar izbor"
                        : "Good match";

                const sizeLabel = result.selectedSize?.size || "";
                const priceLabel = Number.isFinite(result.selectedSize?.price)
                  ? `€${Number(result.selectedSize.price).toFixed(
                      Number(result.selectedSize.price) % 1 === 0 ? 0 : 1
                    )}`
                  : "";
                const refinedReason = result.reason || "";

                return (
                  <article
                    key={result.product.id}
                    className="playnice-discovery-card"
                  >
                    <button
                      type="button"
                      className="playnice-discovery-card-main"
                      onClick={() => {
                        trackEvent("discovery_result_click", {
                          lang,
                          rank: globalRank,
                          product_id: String(result.product.id),
                          product_slug: result.product.slug || "",
                          product_name: result.product.name,
                          match: Number(result.match || 0),
                          selected_size: sizeLabel || "none",
                          selected_price: Number(result.selectedSize?.price || 0),
                          search_source:
                            discoverySearchContextRef.current?.search_source || "unknown",

                          has_budget:
                            discoverySearchContextRef.current?.has_budget || "no",

                          has_reference:
                            discoverySearchContextRef.current?.has_reference || "no",

                          category:
                            discoverySearchContextRef.current?.category || "none",

                          gender:
                            discoverySearchContextRef.current?.gender || "none",

                          has_exclusions:
                            discoverySearchContextRef.current?.has_exclusions || "no",
                        });

                        discoveryAttributionRef.current = {
                          productId: result.product.id,
                          rank: globalRank,
                          match: Number(result.match || 0),
                          selectedSize: sizeLabel || "",
                          clickedAt: Date.now(),
                          searchSource:
                            discoverySearchContextRef.current?.search_source || "unknown",

                          category:
                            discoverySearchContextRef.current?.category || "none",

                          gender:
                            discoverySearchContextRef.current?.gender || "none",

                          hasBudget:
                            discoverySearchContextRef.current?.has_budget || "no",

                          hasReference:
                            discoverySearchContextRef.current?.has_reference || "no",

                          hasExclusions:
                            discoverySearchContextRef.current?.has_exclusions || "no",
                        };

                        openProductModal(result.product, {
                          changeView: false,
                          preferredSize: sizeLabel,
                        });
                      }}
                      aria-label={
                        lang === "sr"
                          ? `Otvori ${result.product.name}`
                          : `Open ${result.product.name}`
                      }
                    >
                      <div className="playnice-discovery-card-topline">
                        <span className="playnice-discovery-rank">
                          {String(globalRank).padStart(2, "0")}
                        </span>

                        <span
                          className={`playnice-discovery-match ${
                            globalRank === 1 ? "is-best" : ""
                          }`}
                        >
                          <span aria-hidden="true" />
                          {matchLabel}
                        </span>
                      </div>

                      <div className="playnice-discovery-image">
                        <img
                          src={getProductThumbnail(result.product.image)}
                          alt={result.product.name}
                          loading="lazy"
                          decoding="async"
                        />
                        <span
                          className="playnice-discovery-image-aura"
                          aria-hidden="true"
                        />
                      </div>

                      <div className="playnice-discovery-card-copy">
                        <span className="playnice-discovery-category">
                          {result.product.category}
                        </span>

                        <h4>{result.product.name}</h4>

                        <p className="playnice-discovery-why">
                          {refinedReason}
                        </p>
                      </div>

                      <div className="playnice-discovery-card-foot">
                        <div className="playnice-discovery-price">
                          {sizeLabel && <strong>{sizeLabel}</strong>}
                          {priceLabel && <span>{priceLabel}</span>}
                        </div>

                        <span className="playnice-discovery-view">
                          {lang === "sr" ? "Pogledaj" : "View"}
                          <span aria-hidden="true">→</span>
                        </span>
                      </div>
                    </button>
                  </article>
                );
              })}
            </div>

            {discoveryTotalPages > 1 && (
              <div
                className="playnice-discovery-pagination"
                aria-label={
                  lang === "sr"
                    ? "Stranice rezultata Fragrance Intelligence"
                    : "Fragrance Intelligence result pages"
                }
              >
                <button
                  type="button"
                  className="playnice-discovery-page-button"
                  disabled={discoveryPage === 1}
                  onClick={() =>
                    setDiscoveryPage((current) =>
                      Math.max(1, current - 1)
                    )
                  }
                >
                  <span aria-hidden="true">←</span>
                  {lang === "sr" ? "Prethodno" : "Previous"}
                </button>

                <span
                  className="playnice-discovery-page-status"
                  aria-live="polite"
                >
                  <strong>
                    {discoveryPageStart + 1}–
                    {Math.min(
                      discoveryPageStart + DISCOVERY_RESULTS_PER_PAGE,
                      discoveryResults.length
                    )}
                  </strong>

                  <span>/</span>

                  <span>{discoveryResults.length}</span>
                </span>

                <button
                  type="button"
                  className="playnice-discovery-page-button"
                  disabled={discoveryPage === discoveryTotalPages}
                  onClick={() =>
                    setDiscoveryPage((current) =>
                      Math.min(discoveryTotalPages, current + 1)
                    )
                  }
                >
                  {lang === "sr" ? "Sledeće" : "Next"}
                  <span aria-hidden="true">→</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )}
</section>
{/* PLAYNICE FRAGRANCE INTELLIGENCE — V6 END */}

<section
  className="new-arrivals-section section-wrap"
  aria-labelledby="new-arrivals-title"
>
  <div className="new-arrivals-head">
    <h2 id="new-arrivals-title">
  {lang === "sr"
    ? "Upravo stiglo. Tvoj sledeći signature miris je možda baš ovde."
    : "Just landed. Your next signature scent is waiting."}
    </h2>

  <button
    type="button"
    className="new-arrivals-view-all"
    onClick={goToShop}
  >
    {lang === "sr"
      ? "Pogledaj sve novitete"
      : "Explore new arrivals"}

    <span aria-hidden="true">→</span>
  </button>
</div>

{newArrivalProducts.length > 0 && (
  <div
    className={`new-arrivals-marquee ${
      productModalVisible ? "is-product-modal-open" : ""
    }`}
  >
    <div className="new-arrivals-track">
      {[false, true].map((isClone, groupIndex) => (
        <div
          key={groupIndex}
          className="new-arrivals-group"
          aria-hidden={isClone ? "true" : undefined}
        >
          {newArrivalProducts.map((product) => {
            const minPrice = getMinPrice(product);
            const isWishlisted = wishlist.includes(product.id);

            return (
              <div
                key={`${groupIndex}-${product.id}`}
                className="new-arrival-card-shell"
              >
                <button
                  type="button"
                  className="new-arrival-card"
                  tabIndex={isClone ? -1 : 0}
                  onClick={() =>
                    openProductModal(product, {
                      changeView: false,
                    })
                  }
                  aria-label={
                    isClone
                      ? undefined
                      : lang === "sr"
                      ? `Otvori ${product.name}`
                      : `Open ${product.name}`
                  }
                >
                  <span className="new-arrival-card-badge">
                    {lang === "sr" ? "NOVO" : "JUST IN"}
                  </span>

                  <span className="new-arrival-card-image-wrap">
                    <img
                      src={getProductThumbnail(product.image)}
                      alt={isClone ? "" : product.name}
                      className="new-arrival-card-image"
                      loading="lazy"
                      decoding="async"
                      draggable="false"
                      onError={(event) => {
                        const image = event.currentTarget;

                        if (image.src.endsWith(".webp")) {
                          image.src = product.image;
                        }
                      }}
                    />
                  </span>

                  <span className="new-arrival-card-name">
                    {product.name}
                  </span>

                  <span className="new-arrival-card-price">
                    {lang === "sr" ? "Već od" : "From"} €{minPrice}
                  </span>
                </button>

                <button
                  type="button"
                  className={`wishlist-btn new-arrival-wishlist-btn ${
                    isWishlisted ? "active" : ""
                  }`}
                  tabIndex={isClone ? -1 : 0}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleWishlist(product.id);
                  }}
                  aria-label={
                    isWishlisted
                      ? lang === "sr"
                        ? `Ukloni ${product.name} iz Private Selection`
                        : `Remove ${product.name} from Private Selection`
                      : lang === "sr"
                      ? `Dodaj ${product.name} u Private Selection`
                      : `Add ${product.name} to Private Selection`
                  }
                >
                  <span className="heart-icon" aria-hidden="true">
                    ♥
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  </div>
)}
</section>

<section
  className="discovery-showcase section-wrap"
  aria-labelledby="discovery-showcase-title"
>
  <div className="discovery-showcase-head">
    <p className="section-kicker">Discovery Sets</p>

    <h2 id="discovery-showcase-title">
      {lang === "sr"
        ? "Izaberi svoj Discovery Set."
        : "Choose your Discovery Set."}
    </h2>

    <p>
      {lang === "sr"
        ? "Pet mirisa. Jedan set. Bez kupovine na slepo."
        : "Five fragrances. One set. No blind buying."}
    </p>
  </div>

  <div className="discovery-showcase-grid">
    <article className="discovery-showcase-card discovery-showcase-card-designer">
      <div className="discovery-showcase-copy">
        <span className="discovery-showcase-type">
          Designer &amp; Niche
        </span>

        <h3>
          {lang === "sr"
            ? "Napravi svoj signature set."
            : "Build your signature set."}
        </h3>

        <p>
          {lang === "sr"
            ? "5 × 2ml · 10% popusta · surprise sample"
            : "5 × 2ml · 10% off · surprise sample"}
        </p>
      </div>

      <button
        type="button"
        className="gold-button discovery-showcase-button discovery-pulse-button"
        onClick={() => openDiscoveryBuilder("designerNiche")}
      >
        {lang === "sr" ? "Napravi set" : "Build set"}
      </button>
    </article>

    <article className="discovery-showcase-card discovery-showcase-card-arabian">
      <div className="discovery-showcase-copy">
        <span className="discovery-showcase-type">
          Arabian
        </span>

        <h3>
          {lang === "sr"
            ? "Otkrij svet Arabian parfema."
            : "Discover Arabian perfumery."}
        </h3>

        <p>
          {lang === "sr"
            ? "5 × 5ml · 10% popusta · surprise sample"
            : "5 × 5ml · 10% off · surprise sample"}
        </p>
      </div>

      <button
        type="button"
        className="gold-button discovery-showcase-button discovery-pulse-button discovery-pulse-button-delayed"
        onClick={() => openDiscoveryBuilder("arabian")}
      >
        {lang === "sr" ? "Napravi set" : "Build set"}
      </button>
    </article>
  </div>
</section>

            <section className="homepage-shop-preview section-wrap">
              <div className="section-head">
                <p className="section-kicker">{tr.privateSelection}</p>
                <h2>{tr.bestsellersTitle}</h2>
                <p>{tr.bestsellersText}</p>
              </div>

              <div className="product-grid">
                {[27, 30, 36, 47]
                  .map((id) => products.find((product) => product.id === id))
                  .filter(Boolean)
                  .map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      wishlist={wishlist}
                      toggleWishlist={toggleWishlist}
                      sprayingWishlistId={sprayingWishlistId}
                      changeViewOnOpen={false}
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

            <section
  id="how-it-works"
  className="why-how-section section-wrap"
  aria-label={
    lang === "sr"
      ? "Zašto PlayNice postoji i kako funkcionišu dekanti"
      : "Why PlayNice exists and how decants work"
  }
>
  <article className="why-how-card why-how-card-identity identity-layer">
    <div className="identity-layer-inner">
      <p className="section-kicker identity-kicker">
        {lang === "sr"
          ? "Zašto PlayNice postoji"
          : "Why PlayNice exists"}
      </p>

      <div className="identity-layer-grid">
        <div className="identity-statement">
          <h2>
            {lang === "sr"
              ? "Luksuz treba da deluje lično pre nego što deluje skupo."
              : "Luxury should feel personal before it feels expensive."}
          </h2>

          <p className="identity-subline">
            {lang === "sr"
              ? "Neke bočice su skupe. Kupovina na slepo je skuplja."
              : "Some bottles are expensive. Blind buying is worse."}
          </p>
        </div>

        <div className="identity-copy">
          <p>
            {lang === "sr"
              ? "PlayNice je nastao za ljude koji žele da osete parfem pre nego što se vežu za celu bočicu."
              : "PlayNice was built for people who want to feel a fragrance before committing to a bottle."}
          </p>

          <p>
            {lang === "sr"
              ? "Ne kroz reklame ni hajp — već kroz vreme, kožu, sećanje i pravi trenutak."
              : "Not through ads or hype — through time, skin, memory and the right moment."}
          </p>

          <p className="identity-rhythm">
            {lang === "sr"
              ? "Jer najbolji parfemi ne mirišu skupo. Mirišu poznato."
              : "Because the best fragrances don’t smell expensive. They smell familiar."}
          </p>

          <div className="identity-signature">
            <span>
              {lang === "sr"
                ? "Probaj pre kupovine."
                : "Try before you buy."}
            </span>

            <strong>Remember. PlayNice.</strong>
          </div>
        </div>
      </div>
    </div>
  </article>

  <article className="why-how-card why-how-card-how how-request-panel how-request-panel-left">
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

    <div className="how-it-works-grid how-it-works-grid-compact">
      <article className="how-it-works-card">
        <span className="how-it-works-number">01</span>

        <h3>
          {lang === "sr" ? "Šta su dekanti?" : "What are decants?"}
        </h3>

        <p>
          {lang === "sr"
            ? "Manja, pažljivo presuta pakovanja originalnih parfema."
            : "Smaller, carefully decanted portions of original fragrances."}
        </p>
      </article>

      <article className="how-it-works-card">
        <span className="how-it-works-number">02</span>

        <h3>
          {lang === "sr" ? "Zašto su korisni?" : "Why they matter?"}
        </h3>

        <p>
          {lang === "sr"
            ? "Možeš da probaš miris na svojoj koži pre kupovine pune bočice."
            : "They let you test a fragrance on your skin before committing to a full bottle."}
        </p>
      </article>

      <article className="how-it-works-card">
        <span className="how-it-works-number">03</span>

        <h3>
          {lang === "sr"
            ? "Zašto je pametnije?"
            : "Why is it smarter?"}
        </h3>

        <p>
          {lang === "sr"
            ? "Manji rizik, manji trošak i više parfema za rotaciju."
            : "Lower risk, lower cost, and more room to build a fragrance rotation."}
        </p>
      </article>
    </div>

    <div className="how-it-works-cta how-it-works-cta-compact">
      <button
        className="ghost-button"
        type="button"
        onClick={() => setHowItWorksOpen(true)}
      >
        {lang === "sr" ? "Saznaj više" : "Learn more"}
      </button>
    </div>
  </article>
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

<section className="community-requests-section section-wrap">
  <div className="how-request-panel scent-request-panel community-request-panel-full">
  <p className="section-kicker scent-request-kicker">
    {lang === "sr" ? "Zahtevi zajednice" : "Community requests"}
  </p>

  <h2>
    {lang === "sr"
      ? "Koji parfem bi voleo da probaš?"
      : "What should we decant next?"}
  </h2>

  <p className="scent-request-copy">
    {lang === "sr"
      ? "Najbolji dropovi često krenu od jedne poruke."
      : "Some of our best drops started with a simple request."}
  </p>

  <form className="scent-request-form" onSubmit={handleScentRequestSubmit}>
    <input
      type="text"
      maxLength={120}
      value={scentRequestValue}
      onChange={(event) => setScentRequestValue(event.target.value)}
      placeholder={lang === "sr" ? "Npr. Xerjoff Naxos" : "E.g. Xerjoff Naxos"}
      aria-label={
        lang === "sr"
          ? "Ime parfema koji želiš da probaš"
          : "Name of the fragrance you want to try"
      }
    />

    <button type="submit" disabled={scentRequestSubmitting}>
      {scentRequestSubmitting
        ? lang === "sr"
          ? "Šaljemo..."
          : "Sending..."
        : lang === "sr"
          ? "Predloži parfem"
          : "Request this scent"}
      <span>→</span>
    </button>
  </form>

  {scentRequestStatus && (
    <p className="scent-request-status">{scentRequestStatus}</p>
  )}

  <div className="community-requests-box">
    <div className="community-requests-head">
      <span>
        {lang === "sr" ? "Zahtevi zajednice uživo" : "Live community requests"}
      </span>

      <small>{lang === "sr" ? "Najtraženije" : "Most wanted"}</small>
    </div>

    <div className="community-most-wanted-board">
  <div className="community-most-wanted-top">
    <button
  type="button"
  className="community-most-wanted-journal-link"
    onClick={() => {
    const communityArticle = journalArticles.find(
      (article) => article.id === 13
    );

    if (communityArticle) {
      handleJournalArticleOpen(communityArticle);
    }
  }}
>
  {lang === "sr"
    ? "Priča iza Community Requests"
    : "The story behind Community Requests"}
  <span>→</span>
  </button>

    <small>
  {lang === "sr"
    ? "Do 3 glasa u 24h · isti parfem ponovo nakon 3 dana"
    : "Up to 3 votes in 24h · same fragrance again after 3 days"}
    </small>
  </div>

  <div className="community-most-wanted-list">
    {communityRequests
      .filter((request) => !findExistingProductByRequest(request.name))
      .sort((a, b) => b.votes - a.votes)
      .map((request, index) => {

        const trend = communityRequestTrends[request.name] || "same";
        const rank = String(index + 1).padStart(2, "0");

        return (
          <button
            key={request.name}
            type="button"
            className={`community-most-wanted-item ${
              index === 0 ? "is-leading" : ""
            }`}
            onClick={() => handleCommunityRequestVote(request.name)}
          >
            <span className="community-most-wanted-rank">
              {rank}
            </span>

<div className="community-most-wanted-name-wrap">
  <span className="community-most-wanted-name">
    {request.name}
  </span>

  {isNewRequest(request) && (
    <span className="community-request-new-badge">
      NEW
    </span>
  )}

  {index === 0 ? (
    <span className="community-request-most-wanted-badge">
      👑 MOST WANTED
    </span>
  ) : communityTopThreeEntries[request.name] ? (
    <span className="community-request-top3-badge">
      🥉 TOP 3
    </span>
  ) : request.votes >= 3 && index > 2 ? (
    <span className="community-request-heating-badge">
      🔥 HEATING UP
    </span>
  ) : null}
</div>

<span
  className={`community-most-wanted-trend trend-${trend}`}
  aria-hidden="true"
>
  {trend === "up" ? "↗" : trend === "down" ? "↘" : "—"}
</span>

<strong>{request.votes}</strong>
          </button>
        );
      })}
  </div>
</div>

{sortedExistingCollectionRequests.length > 0 && (
  <div className="already-in-collection-strip">
    <div className="already-in-collection-head">
      <span className="already-in-collection-kicker">
        {lang === "sr"
          ? "Od zahteva do kolekcije ✦"
          : "From request to collection ✦"}
      </span>

      <p className="already-in-collection-intro">
        {lang === "sr"
          ? "Tražili ste ih. Neki su stigli."
          : "You asked. Some of them made it."}
      </p>
    </div>

    <div className="already-in-collection-list">
      {sortedExistingCollectionRequests.slice(0, 10).map((item, index) => {
        const product =
          item.product || findExistingProductByRequest(item.name);

        const lockedVotes = item.displayVotes;
        const rank = String(index + 1).padStart(2, "0");

        const editorialCopy =
          index === 0
            ? lang === "sr"
              ? "Teško je ignorisati toliko glasova."
              : "Hard to ignore."
            : index === 1
              ? lang === "sr"
                ? "Tražili ste. Pronašli smo ga."
                : "You asked. We found it."
              : index === 2
                ? lang === "sr"
                  ? "Zajednica je pogurala ovaj."
                  : "Community made this one happen."
                : "";

        return (
          <button
            key={item.name}
            type="button"
            className={`already-in-collection-item ${
              index < 3 ? "is-featured" : ""
            }`}
            onClick={() => {
              if (!product) return;

              setScentRequestStatus(
                lang === "sr"
                  ? `Otvaramo ${product.name}. Već je deo PlayNice kolekcije.`
                  : `Opening ${product.name}. Already in our collection.`
              );

              openProductFromRequest(product);
            }}
          >
            <span className="already-in-collection-rank">
              {rank}
            </span>

            <span className="already-in-collection-copy">
              <span className="already-in-collection-name">
                {item.name}
              </span>

              <span className="already-in-collection-meta">
                <strong>
                  {lockedVotes}{" "}
                  {lang === "sr" ? "glasova" : "requests"}
                </strong>

                {editorialCopy && (
                  <em>{editorialCopy}</em>
                )}
              </span>
            </span>

            <span
              className="already-in-collection-arrow"
              aria-hidden="true"
            >
              →
            </span>
          </button>
        );
      })}

      {sortedExistingCollectionRequests.length > 10 && (
        <span className="already-in-collection-more-wrap">
          <em className="already-in-collection-more">
            +{sortedExistingCollectionRequests.length - 10}{" "}
            {lang === "sr" ? "još" : "more"}
          </em>

          <span className="already-in-collection-tooltip">
            {sortedExistingCollectionRequests
              .slice(10)
              .map((item) => item.name)
              .join(" • ")}
          </span>
        </span>
      )}
    </div>
  </div>
)}
  </div>
    </div>
      </section>

            <div className="section-divider">
              <span />
            </div>

            <section className="featured-section section-wrap impact-split-section">
              <div className="impact-video-column">
                <div className="impact-video-frame" ref={videoFrameRef}>
  <video
    ref={videoRef}
    key={currentVideo}
    muted
    playsInline
    preload={shouldLoadVideo ? "metadata" : "none"}
    onEnded={goToNextVideo}
    onPlay={() => setIsVideoPaused(false)}
    onPause={() => setIsVideoPaused(true)}
  >
    {shouldLoadVideo && (
      <source src={heroVideos[currentVideo]} type="video/mp4" />
    )}
  </video>

  <div className="impact-video-badge">PLAYNICE FILM</div>

  <div className="impact-video-controls">
    <button type="button" onClick={goToPrevVideo} aria-label="Previous film">
      ‹
    </button>

    <button type="button" onClick={toggleVideoPlayback} aria-label="Play or pause film">
      {isVideoPaused ? "Play" : "Pause"}
    </button>

    <button type="button" onClick={goToNextVideo} aria-label="Next film">
      ›
    </button>
  </div>

  <div className="impact-video-dots">
    {heroVideos.map((_, index) => (
      <button
        key={index}
        type="button"
        className={index === currentVideo ? "is-active" : ""}
        onClick={() => selectVideo(index)}
        aria-label={`Go to film ${index + 1}`}
      />
    ))}
  </div>
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
            ? "Designer i niche parfemi često koštaju €80–€200+. Kod PlayNice možeš da ih upoznaš već od €3."
            : "Designer and niche bottles often cost €80–€200+. With PlayNice, you can get to know them from €3."}
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
    <label htmlFor="shop-search">
      {lang === "sr" ? "Brend ili parfem" : "Brand or fragrance"}
    </label>

    <div className="compact-search-shell">
      <span className="compact-search-icon" aria-hidden="true">
        ⌕
      </span>

      <input
        id="shop-search"
        type="text"
        placeholder={
          lang === "sr"
            ? "Npr. Prada, Mancera, Lattafa..."
            : "E.g. Prada, Mancera, Lattafa..."
        }
        value={searchTerm}
        onChange={(e) => {
  setSearchTerm(e.target.value);
  setHeroCollectionFilter(null);
  setHeroCollectionTitle("");
}}
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

<div
  className="scent-mood-filter"
  aria-label={lang === "sr" ? "Mood filter" : "Scent mood filter"}
>
  <div className="scent-mood-filter-header scent-mood-filter-header-inline">
  <span>{lang === "sr" ? "Biraj po osećaju" : "Browse by mood"}</span>

  {scentMood !== "All" ? (
    <div className="scent-mood-inline-description">
      <strong>
       {selectedScentMood.label}
      </strong>

      <i aria-hidden="true">→</i>

      <span>
        {{
          clean:
            lang === "sr"
              ? "Čisti, svakodnevni mirisi sa laganim i urednim karakterom."
              : "Fresh everyday scents with a clean and effortless feel.",

          summer:
            lang === "sr"
              ? "Sveži potpisi koji najbolje rade na višim temperaturama."
              : "Fresh signatures that work best in high temperatures.",

          date:
            lang === "sr"
              ? "Topliji, privlačniji i zavodljiviji parfemi za večernje trenutke."
              : "Closer, warmer and more seductive signature scents.",

          rich:
            lang === "sr"
              ? "Dublji, slađi i intenzivniji mirisi sa jakim karakterom."
              : "Deeper, sweeter and more intense fragrances with strong presence.",

          soft:
            lang === "sr"
              ? "Elegantni i mekši mirisi koji ostavljaju sofisticiran utisak."
              : "Elegant softer scents with a refined luxury feeling.",

          signature:
            lang === "sr"
              ? "Mirisi koje ljudi pamte i povezuju sa tobom."
              : "Scents people remember after you leave the room.",
        }[scentMood]}
      </span>
    </div>
  ) : (
    <small>
      {lang === "sr"
        ? "Ne traži note. Traži trenutak."
        : "Don’t search notes. Find the moment."}
    </small>
  )}
</div>

  <div className="scent-mood-scroll" role="list">
    {scentMoodOptions.map((option) => (
      <button
        key={option.value}
        type="button"
        className={`scent-mood-chip ${
          scentMood === option.value ? "active" : ""
        }`}
        onClick={() => setScentMood(option.value)}
      >
        <span className="scent-mood-icon" aria-hidden="true">
          {option.icon}
        </span>

        <span className="scent-mood-label">{option.label}</span>
      </button>
    ))}
  </div>
</div>

{(category !== "All" ||
  season !== "All" ||
  scentMood !== "All" ||
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

      {scentMood !== "All" && (
        <span className="active-filter-chip">
          {selectedScentMood.label}
        </span>
      )}

      {sortBy !== "featured" && (
        <span className="active-filter-chip">
          {selectedSortOption.label}
        </span>
      )}

      {searchTerm.trim() !== "" && (
        <span className="active-filter-chip">“{searchTerm.trim()}”</span>
      )}
    </div>

    <button
      type="button"
      className="clear-filters-button"
      onClick={() => {
        setCategory("All");
        setSeason("All");
        setScentMood("All");
        setSortBy("featured");
        setSearchTerm("");
      }}
    >
      {lang === "sr" ? "Obriši" : "Clear"}
    </button>
  </div>
)}

<div className="shop-pagination-row">
  {renderPagination("top")}

  <div
    className="products-per-page-buttons"
    aria-label={lang === "sr" ? "Broj proizvoda po strani" : "Products per page"}
  >
    <span>{lang === "sr" ? "Prikaži" : "Show"}</span>

    <div className="per-page-button-group">
      {PRODUCT_PAGE_SIZE_OPTIONS.map((option) => (
        <button
          key={option}
          type="button"
          className={`per-page-button ${
            productsPerPage === option ? "is-active" : ""
          }`}
          onClick={() => handleProductsPerPageChange(option)}
        >
          {option}
        </button>
      ))}
    </div>
  </div>
</div>

{heroCollectionTitle && (
  <div className="shop-collection-heading">
    <p className="section-kicker">
      {lang === "sr" ? "IZBOR SA HERO SLIKE" : "FEATURED HERO SELECTION"}
    </p>

    <h2>{heroCollectionTitle}</h2>
  </div>
)}

<div className="product-grid-anchor" ref={productGridRef}>
  <div className="product-grid">
  {paginatedProducts.length > 0 ? (
    paginatedProducts.map((product) => (
      <ProductCard
        key={product.id}
        product={product}
        wishlist={wishlist}
        toggleWishlist={toggleWishlist}
        sprayingWishlistId={sprayingWishlistId}
      />
    ))
  ) : (
    <div className="shop-empty-state" role="status">
      <strong>
        {lang === "sr"
          ? "Nema pronađenih parfema."
          : "No fragrances found."}
      </strong>

      <span>
        {lang === "sr"
          ? "Probaj drugi brend ili ukloni neki od aktivnih filtera."
          : "Try another brand or remove one of the active filters."}
      </span>

      <button
        type="button"
        className="clear-filters-button"
        onClick={() => {
          setCategory("All");
          setSeason("All");
          setScentMood("All");
          setSortBy("featured");
          setSearchTerm("");
          setCurrentPage(1);
        }}
      >
        {lang === "sr" ? "Obriši filtere" : "Clear filters"}
      </button>
    </div>
  )}
</div>
</div>

<div className="pagination-wrap">
  {renderPagination("bottom")}
</div>
</section>
</>
)}

{view !== "exhibition" && view !== "journal" && (
  <>
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

      <button
        type="button"
        className="footer-link"
        onClick={(event) => {
          event.currentTarget.blur();

          if (view === "home") {
            window.scrollTo({ top: 0, left: 0, behavior: "auto" });
            return;
          }

          goHome();
        }}
      >
        {lang === "sr" ? "Početna" : "Home"}
      </button>

      <button type="button" className="footer-link" onClick={goToShop}>
        Shop
      </button>

      <button type="button" className="footer-link" onClick={handleJournalOpen}>
        Le Journal
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

      <button type="button" className="footer-link" onClick={() => setFaqOpen(true)}>
        FAQ
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

      <a href="mailto:info@playniceshop.me" className="footer-mini-link">
        {lang === "sr" ? "Kontakt" : "Contact"}
      </a>
    </div>
  </div>
</footer>
</>
)}

        {discoveryBuilderOpen && (
  <div className="discovery-overlay" onClick={() => setDiscoveryBuilderOpen(false)}>
    <div
      className="discovery-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="discovery-builder-title"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        className="discovery-close"
        onClick={() => setDiscoveryBuilderOpen(false)}
        aria-label={
          lang === "sr"
            ? "Zatvori Discovery Builder"
            : "Close Discovery Builder"
        }
      >
        ×
      </button>

      <div className="discovery-head">
  <div className="discovery-head-copy">
    <p className="section-kicker">
      {discoveryType === "arabian"
        ? "Arabian Discovery Set"
        : "Designer & Niche Discovery Set"}
    </p>

    <h2 id="discovery-builder-title">
      {lang === "sr" ? "Izaberi svojih pet" : "Choose your five"}
    </h2>

    <p className="discovery-head-text">
      {discoveryType === "arabian"
        ? lang === "sr"
          ? "Izaberi pet Arabian mirisa u 5ml formatu. Set se otključava kada izabereš svih pet."
          : "Choose five Arabian fragrances in 5ml. The set unlocks when all five are selected."
        : lang === "sr"
          ? "Izaberi pet designer ili niche mirisa u 2ml formatu. Set se otključava kada izabereš svih pet."
          : "Choose five designer or niche fragrances in 2ml. The set unlocks when all five are selected."}
    </p>
  </div>

  <div
    className="discovery-progress"
    aria-label="Discovery Set progress"
  >
    {Array.from({ length: DISCOVERY_REQUIRED_COUNT }).map((_, index) => (
      <span
        key={index}
        className={`discovery-progress-dot ${
          index < discoverySelected.length ? "active" : ""
        }`}
      />
    ))}
  </div>
</div>

      <div className="discovery-grid">
        {discoveryProducts.map((product) => {
          const selected = discoverySelected.some((item) => item.id === product.id);

          return (
            <button
              key={product.id}
              type="button"
              className={`discovery-product ${selected ? "selected" : ""}`}
              onClick={() => toggleDiscoveryProduct(product)}
            >
              {selected && (
                <span className="discovery-selected-badge">
                  ✓ {lang === "sr" ? "Izabrano" : "Selected"}
                </span>
              )}

              <img src={product.image} alt={product.name} />

              <span>{product.shortName || product.name}</span>

              <small>
                {product.sizes[activeDiscoveryConfig.size]}€ /{" "}
                {activeDiscoveryConfig.size}
              </small>
            </button>
          );
        })}
      </div>

      <div className="discovery-bar">
        <div className="discovery-bar-copy">
          <strong>
            {discoverySelected.length === DISCOVERY_REQUIRED_COUNT
              ? lang === "sr"
                ? "Discovery Set otključan"
                : "Discovery Set unlocked"
              : lang === "sr"
                ? `${discoverySelected.length}/${DISCOVERY_REQUIRED_COUNT} izabrano`
                : `${discoverySelected.length}/${DISCOVERY_REQUIRED_COUNT} selected`}
          </strong>

          <span>
            {discoverySelected.length === DISCOVERY_REQUIRED_COUNT
              ? `${discoveryBundlePrice}€ · ${
                  lang === "sr"
                    ? `ušteda ${discoverySavings}€`
                    : `save ${discoverySavings}€`
                }`
              : lang === "sr"
                ? "Set cena, 10% popusta i bonus se otključavaju na petom mirisu."
                : "Bundle price, 10% off and bonus unlock with the fifth scent."}
          </span>

          {discoverySelected.length === DISCOVERY_REQUIRED_COUNT && (
            <div className="discovery-bonus-note">
              ✦ Complimentary surprise sample included
            </div>
          )}
        </div>

        <button
          type="button"
          className="gold-button discovery-add-button"
          disabled={discoverySelected.length !== DISCOVERY_REQUIRED_COUNT}
          onClick={addDiscoverySetToCart}
        >
          {lang === "sr" ? "Dodaj set" : "Add set"}
        </button>
      </div>
    </div>
  </div>
)}
  </main>

    <div
      className={`backdrop ${
        cartOpen ||
        checkoutOpen ||
        selectedProduct ||
        storyOpen ||
        howItWorksOpen ||
        manifestoOpen ||
        privateSelectionOpen
          ? "show"
          : ""
      }`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    />

      <aside
        className={`story-drawer ${storyOpen ? "open panel-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="story-drawer-title"
      >
        <div className="story-drawer-header panel-anim panel-anim-1">
          <div>
            <p className="section-kicker">
              {lang === "sr" ? "NAŠA PRIČA" : "OUR STORY"}
            </p>

            <h3 id="story-drawer-title">
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

      <aside
        className={`story-drawer faq-drawer ${faqOpen ? "open panel-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="faq-drawer-title"
      >
  <div className="story-drawer-header panel-anim panel-anim-1">
    <div>
      <p className="section-kicker">
        {lang === "sr" ? "FAQ" : "FAQ"}
      </p>

      <h3 id="faq-drawer-title">
        {lang === "sr"
          ? "Sve što treba da znaš pre prve porudžbine."
          : "Everything to know before your first order."}
      </h3>
    </div>

    <button
      className="close-button"
      type="button"
      onClick={() => {
        setFaqOpen(false);
        setOpenFaqIndex(null);
      }}
      aria-label={lang === "sr" ? "Zatvori FAQ panel" : "Close FAQ panel"}
    >
      ×
    </button>
  </div>

  <div className="story-drawer-body faq-drawer-body">
    {[
      {
        q: lang === "sr" ? "Da li su parfemi originalni?" : "Are the perfumes authentic?",
        a: lang === "sr"
          ? "Da. Svi parfemi u PlayNice kolekciji su originalni, a dekanti se pune iz originalnih bočica."
          : "Yes. All fragrances in the PlayNice collection are authentic, and decants are filled from original bottles."
      },
      {
        q: lang === "sr" ? "Šta je dekant?" : "What is a decant?",
        a: lang === "sr"
          ? "Dekant je manja količina originalnog parfema pretočena u kvalitetnu atomizer bočicu. Dobijaš isti miris, bez kupovine cele bočice."
          : "A decant is a smaller amount of original perfume transferred into a quality atomizer bottle."
      },
      {
        q: lang === "sr" ? "Koliko dugo traje 5ml?" : "How long does 5ml last?",
        a: lang === "sr"
          ? "U proseku oko 60–80 prskanja, zavisno od atomizera i načina korišćenja."
          : "On average, around 60–80 sprays, depending on the atomizer and how you use it."
      },
      {
        q: lang === "sr" ? "Koju veličinu da izaberem?" : "Which size should I choose?",
        a: lang === "sr"
          ? "2ml je za prvo upoznavanje, 5ml za nekoliko dana testiranja, 10ml za redovno nošenje, a 20ml za parfeme koje već voliš."
          : "2ml is for a first impression, 5ml for testing, 10ml for regular wear, and 20ml for fragrances you already love."
      },
      {
        q: lang === "sr" ? "Da li dostavljate širom Crne Gore?" : "Do you deliver across Montenegro?",
        a: lang === "sr"
          ? "Da. Dostava je dostupna širom Crne Gore."
          : "Yes. Delivery is available across Montenegro."
      },
      {
        q: lang === "sr" ? "Kako se plaća?" : "How do I pay?",
        a: lang === "sr"
          ? "Plaćanje se vrši pouzećem prilikom preuzimanja pošiljke."
          : "Payment is made by cash on delivery when the package arrives."
      },
      {
        q: lang === "sr" ? "Da li mogu da vratim parfem?" : "Can I return a perfume?",
        a: lang === "sr"
          ? "Zbog higijenskih razloga otvoreni dekanti i parfemi se ne vraćaju. Ako pošiljka stigne oštećena ili dođe do greške, kontaktiraj nas i pronaći ćemo rešenje."
          : "For hygiene reasons, opened decants and perfumes cannot be returned. If the package arrives damaged or there is an error, contact us and we will find a solution."
      },
      {
        q: lang === "sr" ? "Zašto PlayNice?" : "Why PlayNice?",
        a: lang === "sr"
          ? "Zato što verujemo da parfem treba prvo doživeti, a tek onda kupiti. PlayNice ti omogućava da pronađeš svoj sledeći potpis bez rizika kupovine pune bočice."
          : "Because we believe a fragrance should be experienced before it is bought. PlayNice helps you find your next signature without the risk of buying a full bottle first."
      }
    ].map((item, index) => {
      const isOpen = openFaqIndex === index;

      return (
        <div className={`faq-item ${isOpen ? "open" : ""}`} key={item.q}>
          <button
            type="button"
            className="faq-question"
            onClick={() => setOpenFaqIndex(isOpen ? null : index)}
          >
            <span>✦ {item.q}</span>
            <strong>{isOpen ? "−" : "+"}</strong>
          </button>

          <div className="faq-answer">
            <p>{item.a}</p>
          </div>
        </div>
      );
    })}
  </div>
</aside>

<aside
  className={`story-drawer manifesto-drawer ${manifestoOpen ? "open panel-open" : ""}`}
  role="dialog"
  aria-modal="true"
  aria-labelledby="manifesto-drawer-title"
>
  {activeManifesto && HERO_MANIFESTOS[activeManifesto] && (
    <>
      <div className="story-drawer-header panel-anim panel-anim-1">
        <div>
          <p className="section-kicker">
            {HERO_MANIFESTOS[activeManifesto].kicker}
          </p>

          <h3 id="manifesto-drawer-title">
            {HERO_MANIFESTOS[activeManifesto].title}
          </h3>
        </div>

        <button
          className="close-button"
          type="button"
          onClick={() => {
            setManifestoOpen(false);
            setActiveManifesto(null);
          }}
          aria-label={lang === "sr" ? "Zatvori PlayNice prozor" : "Close PlayNice window"}
        >
          ×
        </button>
      </div>

      <div className="story-drawer-body manifesto-drawer-body">
        {HERO_MANIFESTOS[activeManifesto].body.map((paragraph, index) => (
          <p
            key={paragraph}
            className={`manifesto-line manifesto-line-${index + 1}`}
          >
            {paragraph}
          </p>
        ))}

        <div className="story-drawer-footer manifesto-drawer-footer">
          <span className="story-drawer-signature">Remember. PlayNice.</span>

          <button
            className="gold-button small"
            type="button"
            onClick={() => {
  const action = HERO_MANIFESTOS[activeManifesto].action;

  setManifestoOpen(false);
  setActiveManifesto(null);

  if (action === "discovery") {
    openDiscoveryBuilder("designerNiche");
    return;
  }

  if (action === "shop") {
    goToShop();
  }
}}
          >
            {HERO_MANIFESTOS[activeManifesto].cta}
          </button>
        </div>
      </div>
    </>
  )}
</aside>

      <aside
        className={`how-it-works-drawer ${howItWorksOpen ? "open panel-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="how-it-works-drawer-title"
      >
  <div className="how-it-works-drawer-header panel-anim panel-anim-1">
    <div>
      <p className="section-kicker">HOW IT WORKS</p>
      <h3 id="how-it-works-drawer-title">
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
        role="dialog"
        aria-modal="true"
        aria-labelledby="private-selection-title"
      >
        <div className="private-selection-header panel-anim panel-anim-1">
          <div>
            <p className="section-kicker">
              {lang === "sr" ? "PRIVATE SELECTION" : "PRIVATE SELECTION"}
            </p>
            <h3 id="private-selection-title">
              {lang === "sr" ? "Tvoja selekcija" : "Your Private Selection"}
              {privateSelectionProducts.length > 0 && (
                <span className="private-selection-header-count">
                  {" · "}{privateSelectionProducts.length}
                </span>
              )}
            </h3>
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
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-drawer-title"
      >
  <div className="cart-drawer-header panel-anim panel-anim-1">
    <div>
  <p className="section-kicker">{tr.yourCart}</p>
    <h3 id="cart-drawer-title">
      {tr.selectedItems}
      <span className="cart-selected-count"> · {cart.length}</span>
    </h3>
  </div>

    <button
      className="close-button"
      type="button"
      onClick={() => setCartOpen(false)}
      aria-label={lang === "sr" ? "Zatvori korpu" : "Close cart"}
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
          {cart.map((item, index) => {
            const displayName = item.name;

            return (
              <div
                className={`cart-item panel-item-anim panel-item-${Math.min(
                  index + 1,
                  6
                )}`}
                key={item.key}
              >
                <div className="cart-item-main">
                  <div className="cart-item-thumb">
                    {item.image ? (
                      <img src={item.image} alt="" />
                    ) : (
                      <span aria-hidden="true">
                        {displayName?.charAt(0)}
                      </span>
                    )}
                  </div>

                  <div className="cart-item-info">
                    <h4>{displayName}</h4>

                    <p className="cart-item-meta">
                      {item.size} · {formatPrice(item.price)}
                    </p>
                  </div>
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
            );
          })}
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

          {subtotal < FREE_SHIPPING_THRESHOLD && (
            <div className="shipping-progress-card cart-shipping-note shipping-note-locked">
              <div className="shipping-note">
                {lang === "sr"
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
          )}

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
                  ? "Dostava za 1–2 radna dana"
                  : "Delivery in 1–2 working days"}
              </span>
            </div>

            <div className="cart-trust-item">
              <span>✔</span>
              <span>
                {lang === "sr" ? "Širom Crne Gore" : "Across Montenegro"}
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

        <div
          className={`cart-footer-shipping-status ${
            shipping === 0 ? "is-unlocked" : ""
          }`}
        >
          {shipping === 0
            ? lang === "sr"
              ? "✓ Besplatna dostava otključana"
              : "✓ Free delivery unlocked"
            : lang === "sr"
            ? `Uključuje ${formatPrice(shipping)} dostavu`
            : `Includes ${formatPrice(shipping)} delivery`}
        </div>

        <button
          className="gold-button checkout-button cart-checkout-button"
          type="button"
          onClick={openCheckout}
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

{selectedProduct && (
  <div
    className={`modal-overlay product-modal-layer ${
      productModalVisible ? "show" : ""
    }`}
    onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
    }}
  >
    <div
      ref={productModalRef}
      className={`product-modal ${productModalVisible ? "open panel-open" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-modal-title"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        ref={productModalCloseButtonRef}
        className="close-button"
        type="button"
        onClick={closeProductModal}
        aria-label={lang === "sr" ? "Zatvori prozor" : "Close modal"}
      >
        ×
      </button>

      <div className="modal-header panel-anim panel-anim-1">
        <span className="modal-eyebrow">PRIVATE DETAIL</span>
        <h2 id="product-modal-title">
          {selectedProduct.modalName || selectedProduct.name}
        </h2>

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

          <button
            type="button"
            className={`wishlist-btn modal-wishlist-btn ${
              wishlist.includes(selectedProduct.id) ? "active" : ""
            }`}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onPointerDown={(e) => {
              e.stopPropagation();
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist(selectedProduct.id);
            }}
            aria-label={
              wishlist.includes(selectedProduct.id)
                ? lang === "sr"
                  ? `Ukloni ${selectedProduct.name} iz Private Selection`
                  : `Remove ${selectedProduct.name} from Private Selection`
                : lang === "sr"
                ? `Dodaj ${selectedProduct.name} u Private Selection`
                : `Add ${selectedProduct.name} to Private Selection`
            }
          >
            <span className="heart-icon" aria-hidden="true">
              ♥
            </span>
          </button>

          {selectedProduct.badge && (
            <div
              className="modal-badge-stage panel-item-anim panel-item-1"
              role="img"
              aria-label={selectedProduct.badge}
            >
              <div
                className={`modal-badge-letters ${
                  selectedProduct.badge.length >= 14
                    ? "is-extra-long"
                    : selectedProduct.badge.length >= 11
                    ? "is-long"
                    : ""
                }`}
                aria-hidden="true"
              >
                {Array.from(selectedProduct.badge).map((character, index) => (
                  <span
                    key={`${selectedProduct.id}-${selectedProduct.badge}-${index}`}
                    className={`modal-badge-letter${
                      character === " " ? " is-space" : ""
                    }`}
                  >
                    {character === " " ? "\u00A0" : character}
                  </span>
                ))}
              </div>
            </div>
          )}

          {selectedProduct.slug === "ysl-y-iced-cologne" && (
            <div className="modal-sample-mini">
              <strong>
                🎁 {lang === "sr" ? "FREE UZORAK" : "FREE SAMPLE"}
              </strong>

              <small>
                {lang === "sr"
                  ? "Uz svaki 10ml. Limited stock."
                  : "Included with every 10ml. Limited stock."}
              </small>
            </div>
          )}

          <div
            className={`modal-image-wrap panel-item-anim panel-item-2 ${
              selectedProduct.noteMap ? "has-note-map" : ""
            } ${noteMapOpen ? "note-map-open" : ""}`}
          >
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

            {selectedProduct.noteMap && (
              <TheNoteMap
                notes={selectedProduct.noteMap}
                lang={lang}
                open={noteMapOpen}
                onToggle={() => setNoteMapOpen((current) => !current)}
              />
            )}

            {selectedProduct.noteMap && (
              <button
                type="button"
                className={`the-note-map__mobile-trigger ${
                  noteMapOpen ? "is-open" : ""
                }`}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setNoteMapOpen((current) => !current);
                }}
                aria-expanded={noteMapOpen}
              >
                <span>THE NOTE MAP</span>
                <strong aria-hidden="true">
                  {noteMapOpen ? "×" : "+"}
                </strong>
              </button>
            )}
          </div>

          {selectedProduct.recommendations?.length > 0 && (
            <div className="modal-same-energy panel-item-anim panel-item-3">
              <div className="modal-same-energy-list">
                {selectedProduct.recommendations
                  .map((slug) =>
                    products.find((product) => product.slug === slug)
                  )
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((product) => {
                    const copy =
                      product.copy?.[lang] || product.copy?.en || {};

                    return (
                      <button
                        key={product.id}
                        type="button"
                        className="modal-same-energy-item"
                        onClick={() => {
                          const productUrl = getProductUrl(product);
                          const productSlug = getProductSlug(product);
                          const hasRouteChanged =
                            window.location.pathname !== productUrl;

                          setSelectedProduct(product);
                          setSelectedSize(Object.keys(product.sizes)[0]);
                          setHasUserPickedSize(false);

                          if (hasRouteChanged) {
                            window.history.replaceState(
                              {
                                ...(window.history.state || {}),
                                productSlug,
                              },
                              "",
                              productUrl
                            );

                            trackPageView(productUrl);
                            trackMeta("PageView");
                          }
                        }}
                      >
                        <span className="modal-same-energy-img-wrap">
                          {product.image ? (
                            <img src={product.image} alt={product.name} />
                          ) : (
                            <span>{product.name.charAt(0)}</span>
                          )}
                        </span>

                        <span className="modal-same-energy-text">
                          <strong>
                            {product.shortName || product.name}
                          </strong>

                          <small>
                            {copy.card ||
                              copy.whyChoose ||
                              copy.dominantNotes?.join(" • ") ||
                              (lang === "sr"
                                ? "Sličan premium karakter."
                                : "Similar premium character.")}
                          </small>
                        </span>
                      </button>
                    );
                  })}
              </div>
            </div>
          )}

          <div
            className={`modal-media-meta panel-item-anim panel-item-3 ${
              selectedProduct.noteMap ? "has-note-map" : ""
            }`}
          >
            <div className="modal-media-meta-copy">
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
            {lang === "sr" ? "MIRISNI PROFIL" : "SCENT PROFILE"}
          </span>

          <strong>
            {selectedCopy.scentType ||
            (lang === "sr"
            ? "Svjež, citrusno-aromatičan karakter."
            : "Fresh citrus-aromatic character.")}
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
                {Object.entries(selectedProduct.sizes).map(([size, price], index) => {
                  const discount = getProductDiscountForSize(selectedProduct, size);

                  const finalPrice = discount
                    ? getDiscountedPrice(price, discount.percent)
                    : price;

                  const flashKey = `${selectedProduct.id}-${size}`;
                  const isDiscountFlashing = modalDiscountFlashKey === flashKey;

                  return (
                    <button
                      key={size}
                      type="button"
                      className={`modal-size ${
                        selectedSize === size ? "active" : ""
                      } ${
                        isDiscountFlashing ? "discount-flashing" : ""
                      } panel-item-anim panel-item-${Math.min(index + 1, 6)}`}
                      onClick={() => {
                        setSelectedSize(size);
                        setHasUserPickedSize(true);

                        if (discount) {
                          setModalDiscountFlashKey(flashKey);

                          setTimeout(() => {
                            setModalDiscountFlashKey((currentKey) =>
                              currentKey === flashKey ? null : currentKey
                            );
                          }, 1500);
                        }
                      }}
                    >
                {isDiscountFlashing ? (
                  <span className="modal-size-discount-flash">
                    -{discount.percent}%
                  </span>
                ) : (
                  <>
                    <span>{size}</span>

                    <strong>
                      {formatPrice(discount && selectedSize === size ? finalPrice : price)}
                    </strong>
                  </>
                )}
              </button>
                  );
                })}
              </div>
            </div>

            <div className="modal-purchase-bar panel-anim panel-anim-3">
              <div className="modal-price-box">
                <span>
                  {lang === "sr" ? "IZABRANA CENA" : "SELECTED PRICE"}
                </span>
                {(() => {
                  const activeSize =
                    selectedSize || Object.keys(selectedProduct.sizes)[0];

                  const activePrice =
                    selectedProduct.sizes[activeSize] ??
                    Object.values(selectedProduct.sizes)[0];

                  const discount = getProductDiscountForSize(selectedProduct, activeSize);

                  const finalPrice = discount
                    ? getDiscountedPrice(activePrice, discount.percent)
                    : activePrice;

                  return (
                    <strong className="modal-selected-price">
                    {formatPrice(finalPrice)}
                    </strong>
                  );
                })()}
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
              const activePrice = selectedProduct.sizes[activeSize];
              const discount = getProductDiscountForSize(selectedProduct, activeSize);

              const finalPrice = discount
                ? getDiscountedPrice(activePrice, discount.percent)
                : activePrice;

              const productForCart = discount
                ? {
                    ...selectedProduct,
                    sizes: {
                      ...selectedProduct.sizes,
                      [activeSize]: finalPrice,
                    },
                  }
                : selectedProduct;

              handleModalAddToCart(productForCart, activeSize);

              productModalAutoCloseTimeoutRef.current = setTimeout(() => {
                productModalAutoCloseTimeoutRef.current = null;
                closeProductModal(PRODUCT_MODAL_CART_CLOSE_DELAY);
              }, 950);
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

                      const activePrice = selectedProduct.sizes[activeSize];
                      const discount = getProductDiscountForSize(selectedProduct, activeSize);

                      const finalPrice = discount
                        ? getDiscountedPrice(activePrice, discount.percent)
                        : activePrice;

                      const productForCart = discount
                        ? {
                            ...selectedProduct,
                            sizes: {
                              ...selectedProduct.sizes,
                              [activeSize]: finalPrice,
                            },
                          }
                        : selectedProduct;

                      addToCart(productForCart, activeSize, null, null, {
                        showToast: false,
                        showMiniPreview: false,
                      });

                      setMiniCartPreview(null);
                      openCheckout();
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

      <div
        className={`checkout-modal ${checkoutOpen ? "open panel-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-modal-title"
      >
  <div className="checkout-header panel-anim panel-anim-1">
    <div>
      <p className="section-kicker">{tr.checkoutKicker}</p>
      <h3 id="checkout-modal-title">{tr.checkoutTitle}</h3>
      <p className="checkout-subnote">
        {lang === "sr"
          ? "Plaćanje pouzećem — potvrda narudžbine i detalji stižu na email."
          : "Cash on delivery — order confirmation and details will be sent by email."}
      </p>
    </div>
    <button
      className="close-button"
      type="button"
      onClick={() => {
        if (isSubmittingOrder) return;
        setCheckoutOpen(false);
      }}
      disabled={isSubmittingOrder}
      aria-label={lang === "sr" ? "Zatvori prozor" : "Close modal"}
    >
      ×
    </button>
  </div>

  <div className="checkout-grid">
    <div className="checkout-form panel-anim panel-anim-2">
      <div className="form-row two panel-item-anim panel-item-1">
        <label className="visually-hidden" htmlFor="checkout-first-name">
          {tr.firstName}
        </label>
        <input
          id="checkout-first-name"
          name="firstName"
          autoComplete="given-name"
          maxLength={80}
          placeholder={tr.firstName}
          value={checkoutForm.firstName}
          onChange={handleCheckoutInput}
        />
        <label className="visually-hidden" htmlFor="checkout-last-name">
          {tr.lastName}
        </label>
        <input
          id="checkout-last-name"
          name="lastName"
          autoComplete="family-name"
          maxLength={80}
          placeholder={tr.lastName}
          value={checkoutForm.lastName}
          onChange={handleCheckoutInput}
        />
      </div>

      <div className="form-row two panel-item-anim panel-item-2">
        <label className="visually-hidden" htmlFor="checkout-email">
          {tr.email}
        </label>
        <input
          id="checkout-email"
          name="email"
          type="email"
          autoComplete="email"
          maxLength={254}
          placeholder={tr.email}
          value={checkoutForm.email}
          onChange={handleCheckoutInput}
        />
        <label className="visually-hidden" htmlFor="checkout-phone">
          {tr.phone}
        </label>
        <input
          id="checkout-phone"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          maxLength={40}
          placeholder={tr.phone}
          value={checkoutForm.phone}
          onChange={handleCheckoutInput}
        />
      </div>

      <div className="form-row two panel-item-anim panel-item-3">
      <label className="visually-hidden" htmlFor="checkout-country">
        {lang === "sr" ? "Zemlja dostave" : "Delivery country"}
      </label>
      <select
        id="checkout-country"
        name="country"
        value={checkoutForm.country}
        onChange={handleCheckoutInput}
      >
    {checkoutCountryOptions.map((country) => (
      <option key={country.value} value={country.value}>
        {lang === "sr" ? country.sr : country.en}
      </option>
    ))}
  </select>

  <label className="visually-hidden" htmlFor="checkout-city">
    {tr.city}
  </label>
  <input
    id="checkout-city"
    name="city"
    autoComplete="address-level2"
    maxLength={100}
    placeholder={tr.city}
    value={checkoutForm.city}
    onChange={handleCheckoutInput}
  />
</div>

{checkoutForm.country === "OTHER" && (
  <div className="form-row panel-item-anim panel-item-3">
    <label className="visually-hidden" htmlFor="checkout-other-country">
      {lang === "sr" ? "Naziv zemlje" : "Country name"}
    </label>

    <input
      id="checkout-other-country"
      name="otherCountry"
      maxLength={100}
      placeholder={
        lang === "sr"
          ? "Unesite zemlju dostave"
          : "Enter delivery country"
      }
      value={checkoutForm.otherCountry || ""}
      onChange={handleCheckoutInput}
    />
  </div>
)}

<div className="form-row panel-item-anim panel-item-4">
  <label className="visually-hidden" htmlFor="checkout-address">
    {tr.address}
  </label>
  <input
    id="checkout-address"
    name="address"
    autoComplete="street-address"
    maxLength={200}
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
        <label className="visually-hidden" htmlFor="checkout-note">
          {tr.note}
        </label>
        <textarea
          id="checkout-note"
          name="note"
          maxLength={500}
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
          <div
            className="catalog-modal"
            role="dialog"
            aria-modal="true"
            aria-label={lang === "sr" ? "Pregled kataloga" : "Catalog preview"}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="catalog-modal-toolbar">
              <button
                className="catalog-modal-close"
                type="button"
                onClick={closeCatalogPreview}
                aria-label={
                  lang === "sr"
                    ? "Zatvori pregled kataloga"
                    : "Close catalog preview"
                }
              >
                ×
              </button>
            </div>

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

      {miniCartPreview && (
  <div
    key={miniCartPreviewId}
    className="mini-cart-preview"
    role="status"
    aria-live="polite"
  >
    <div className="mini-cart-preview-orb-text">
  <svg viewBox="0 0 160 160" aria-hidden="true">
    <defs>
      <path
  id="miniCartTextTop"
  d="M20,80 A60,60 0 0,1 140,80"
  />

      <path
  id="miniCartTextBottom"
  d="M20,82 A60,60 0 0,0 140,82"
  />
    </defs>

    <text className="mini-cart-text-top">
      <textPath href="#miniCartTextTop" startOffset="50%" textAnchor="middle">
        {miniCartPreview.name}
      </textPath>
    </text>

    <text className="mini-cart-text-bottom">
      <textPath href="#miniCartTextBottom" startOffset="50%" textAnchor="middle">
        {lang === "sr" ? "Dodato" : "Added"} · {miniCartPreview.size} · {formatPrice(miniCartPreview.price)}
      </textPath>
    </text>
  </svg>
</div>

    <div className="mini-cart-preview-media">
      {miniCartPreview.image && (
        <img src={miniCartPreview.image} alt={miniCartPreview.name} />
      )}
    </div>

    <div className="mini-cart-preview-body">
      <span className="mini-cart-preview-kicker">
        {lang === "sr" ? "Dodato u korpu" : "Added to cart"}
      </span>

      <strong>{miniCartPreview.name}</strong>

      <span>
        {miniCartPreview.size} · {formatPrice(miniCartPreview.price)}
      </span>
    </div>
  </div>
)}

{showBackToTop && !sideRailBlocked && (
  <button
    type="button"
    className="back-to-top"
    onClick={smoothScrollToTop}
    aria-label={
      lang === "sr"
        ? "Povratak na vrh stranice"
        : "Back to top"
    }
  >
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 19V5M6.5 10.5 12 5l5.5 5.5" />
    </svg>
  </button>
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
      </button>

      <button
        type="button"
        className={`sticky-cta-journal-link ${
        stickyCtaJournalHasNew ? "has-new" : ""
      }`}
        onClick={handleStickyCtaJournalClick}
        aria-label={lang === "sr" ? "Otvori Le Journal" : "Open Le Journal"}
      >
      <span className="sticky-cta-journal-action">
        {lang === "sr" ? "Pročitaj" : "Read"}
      </span>

      <span className="sticky-cta-journal-separator" aria-hidden="true">
        ·
      </span>

      <span className="sticky-cta-journal-name">
        Le Journal
      </span>

      <span className="sticky-cta-journal-arrow" aria-hidden="true">
        →
      </span>
      </button>
    </div>
  </div>
)}
    </div>
  );
}

export default App;
