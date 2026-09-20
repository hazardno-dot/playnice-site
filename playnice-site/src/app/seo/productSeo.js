import { products } from "../../data/products";
import { productCopy } from "../../data/products/productCopy";

export const SITE_BASE_URL = "https://www.playniceshop.me";

export const cleanSeoProductName = (name = "") =>
  String(name)
    .replace(/\s+NEW\s*$/i, "")
    .replace(/\s+/g, " ")
    .trim();

export const getProductSlug = (product) => {
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

export const getProductUrl = (product) => {
  const slug = getProductSlug(product);
  return slug ? `/product/${slug}` : "/shop";
};

export const getSeoProductUrl = (product) => {
  const url = getProductUrl(product);
  if (!url) return SITE_BASE_URL;
  if (url.startsWith("http")) return url;
  return `${SITE_BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
};

export const getProductFromCurrentUrl = () => {
  const path = window.location.pathname;
  const match = path.match(/^\/product\/([^/]+)$/);
  if (!match?.[1]) return null;

  const slugFromUrl = decodeURIComponent(match[1]);
  return products.find((product) => getProductSlug(product) === slugFromUrl) || null;
};

export const getSeoProductImage = (product) => {
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
  return prices.length ? Math.min(...prices) : null;
};

const getSeoCategoryLabel = (category, lang = "sr") => {
  const labels = {
    Arabian: { sr: "arapski parfem", en: "Arabian fragrance" },
    Designer: { sr: "dizajnerski parfem", en: "designer fragrance" },
    Niche: { sr: "niche parfem", en: "niche fragrance" }
  };

  return labels?.[category]?.[lang] || (lang === "en" ? "fragrance" : "parfem");
};

const getSeoSeasonText = (season, lang = "sr") => {
  const labels = {
    summer: { sr: "Posebno dobar izbor za toplije dane.", en: "Especially suited for warmer days." },
    winter: { sr: "Posebno dobar izbor za hladnije dane.", en: "Especially suited for colder days." },
    all: { sr: "Lako nosiv tokom cijele godine.", en: "Easy to wear all year round." },
    spring: { sr: "Odličan izbor za proljeće.", en: "A great choice for spring." },
    autumn: { sr: "Odličan izbor za jesen.", en: "A great choice for autumn." }
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

const getEnglishArticle = (text = "") => {
  const firstLetter = String(text).trim().charAt(0).toLowerCase();
  return ["a", "e", "i", "o", "u"].includes(firstLetter) ? "an" : "a";
};

export const getProductSeoTitle = (product, lang = "sr") => {
  const name = cleanSeoProductName(product?.name);
  return lang === "en"
    ? `${name} decants | Try before you buy | PlayNice`
    : `${name} dekanti | Probaj prije kupovine | PlayNice`;
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
    ].filter(Boolean).join(" ");
  }

  return [
    `${name} je dostupan u PlayNice ponudi kao ${category} u ${sizeText} dekantima${lowestPrice ? ` već od €${lowestPrice}` : ""}.`,
    productCopyText,
    seasonText,
    "Probaj parfem prije kupovine cijele bočice, uz dostavu širom Crne Gore i plaćanje pouzećem."
  ].filter(Boolean).join(" ");
};

export const getProductMetaDescription = (product, lang = "sr") => {
  const description = getProductSeoDescription(product, lang);
  return description.length <= 160
    ? description
    : `${description.slice(0, 157).trim()}...`;
};

export const getProductStructuredData = (product, lang = "sr") => {
  if (!product) return null;

  const name = cleanSeoProductName(product.name);
  const productUrl = getSeoProductUrl(product);
  const imageUrl = getSeoProductImage(product);
  const description = getProductSeoDescription(product, lang);
  const sizes = product?.sizes || {};

  const shippingDetails = {
    "@type": "OfferShippingDetails",
    shippingRate: { "@type": "MonetaryAmount", value: 4, currency: "EUR" },
    shippingDestination: { "@type": "DefinedRegion", addressCountry: "ME" },
    deliveryTime: {
      "@type": "ShippingDeliveryTime",
      handlingTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 1, unitCode: "DAY" },
      transitTime: { "@type": "QuantitativeValue", minValue: 1, maxValue: 3, unitCode: "DAY" }
    }
  };

  const hasMerchantReturnPolicy = {
    "@type": "MerchantReturnPolicy",
    applicableCountry: "ME",
    returnPolicyCountry: "ME",
    returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
    merchantReturnDays: 14,
    itemCondition: ["https://schema.org/NewCondition", "https://schema.org/DamagedCondition"],
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
      seller: { "@type": "Organization", name: "PlayNice", url: SITE_BASE_URL }
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
    brand: { "@type": "Brand", name: name.split(" ")[0] },
    offers
  };
};
