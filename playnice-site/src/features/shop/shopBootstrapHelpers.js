export const JUST_IN_LIMIT = 16;

export const getMinPrice = (product) =>
  Math.min(...Object.values(product.sizes));

export const getProductCopy = (
  product,
  lang,
  productCopy,
  fallbackCopy
) => {
  const copy =
    productCopy[product.name] || fallbackCopy;

  return {
    miniTag:
      copy.miniTag?.[lang] ||
      copy.miniTag?.en ||
      fallbackCopy.miniTag[lang],
    card:
      copy.card?.[lang] ||
      copy.card?.en ||
      fallbackCopy.card[lang],
    modal:
      copy.modal?.[lang] ||
      copy.modal?.en ||
      fallbackCopy.modal[lang],
    scentType:
      copy.scentType?.[lang] ||
      copy.scentType?.en ||
      fallbackCopy.scentType[lang],
    dominantNotes:
      copy.dominantNotes?.[lang] ||
      copy.dominantNotes?.en ||
      fallbackCopy.dominantNotes[lang],
    tags:
      copy.tags?.[lang] ||
      copy.tags?.en ||
      fallbackCopy.tags[lang],
    whyChoose:
      copy.whyChoose?.[lang] ||
      copy.whyChoose?.en ||
      fallbackCopy.whyChoose[lang],
  };
};

export const getInitialViewFromLocation = ({
  pathname = "",
  search = "",
}) => {
  if (pathname === "/shop") return "shop";

  if (
    pathname === "/journal" ||
    pathname.startsWith("/journal/")
  ) {
    return "journal";
  }

  if (pathname === "/exhibition") {
    return "exhibition";
  }

  if (pathname.startsWith("/product/")) {
    return "shop";
  }

  const params = new URLSearchParams(search);
  const urlView = params.get("view");

  return [
    "home",
    "shop",
    "journal",
    "exhibition",
  ].includes(urlView)
    ? urlView
    : "home";
};

export const getJustInProducts = (
  items = [],
  limit = JUST_IN_LIMIT
) =>
  [...items]
    .filter((product) => Boolean(product?.addedAt))
    .sort((a, b) => {
      const dateDifference =
        new Date(b.addedAt).getTime() -
        new Date(a.addedAt).getTime();

      return (
        dateDifference ||
        Number(b.id || 0) - Number(a.id || 0)
      );
    })
    .slice(0, limit);

export const getNewProductsSignature = (
  items = [],
  limit = JUST_IN_LIMIT
) =>
  getJustInProducts(items, limit)
    .map((product) => String(product.id))
    .join("|");

export const createJustInProductIdSet = (
  items = [],
  limit = JUST_IN_LIMIT
) =>
  new Set(
    getJustInProducts(items, limit).map((product) =>
      String(product.id)
    )
  );

export const isProductInIdSet = (
  product,
  productIdSet
) =>
  productIdSet.has(
    String(product?.id ?? "")
  );

export const getInitialShopStateFromSearch = (
  search = ""
) => {
  const defaults = {
    category: "All",
    searchTerm: "",
    currentPage: 1,
    sortBy: "featured",
    season: "All",
    scentMood: "All",
  };

  const params = new URLSearchParams(search);

  const category = params.get("category");
  const searchTerm = params.get("search") || "";
  const sortBy = params.get("sort");
  const season = params.get("season");
  const scentMood = params.get("mood");
  const parsedPage = Number(params.get("page"));

  return {
    category: [
      "All",
      "Arabian",
      "Designer",
      "Niche",
    ].includes(category)
      ? category
      : defaults.category,

    searchTerm,

    currentPage:
      Number.isInteger(parsedPage) &&
      parsedPage > 0
        ? parsedPage
        : defaults.currentPage,

    sortBy: [
      "featured",
      "rating",
      "priceLow",
      "priceHigh",
      "name",
    ].includes(sortBy)
      ? sortBy
      : defaults.sortBy,

    season: [
      "All",
      "summer",
      "winter",
    ].includes(season)
      ? season
      : defaults.season,

    scentMood: [
      "clean",
      "summer",
      "date",
      "rich",
      "soft",
      "signature",
    ].includes(scentMood)
      ? scentMood
      : defaults.scentMood,
  };
};
