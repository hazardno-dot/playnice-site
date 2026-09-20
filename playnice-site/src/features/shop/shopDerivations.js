export const normalizeShopSearch = (value = "") =>
  String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();

export const filterAndSortProducts = ({
  products = [],
  heroCollectionFilter = null,
  category = "All",
  searchTerm = "",
  season = "All",
  scentMood = "All",
  sortBy = "featured",
  getMinPrice,
}) => {
  const sourceProducts = heroCollectionFilter?.length
    ? heroCollectionFilter
        .map((slug) =>
          products.find((product) => product.slug === slug)
        )
        .filter(Boolean)
    : products;

  const normalizedSearchTerm =
    normalizeShopSearch(searchTerm);

  const result = sourceProducts.filter((product) => {
    const categoryMatch =
      category === "All" ||
      product.category === category;

    const searchableProductText =
      normalizeShopSearch(
        [product.brand, product.name]
          .filter(Boolean)
          .join(" ")
      );

    const searchMatch =
      normalizedSearchTerm === "" ||
      searchableProductText.includes(
        normalizedSearchTerm
      );

    const selectedSeason = String(
      season || ""
    ).toLowerCase();

    const productSeason = String(
      product.season || ""
    ).toLowerCase();

    const seasonMatch =
      selectedSeason === "all" ||
      productSeason === "all" ||
      productSeason === selectedSeason;

    const selectedMood = String(
      scentMood || ""
    ).toLowerCase();

    const productMoods = Array.isArray(
      product.moods
    )
      ? product.moods.map((mood) =>
          String(mood).toLowerCase()
        )
      : [];

    const moodMatch =
      selectedMood === "all" ||
      productMoods.includes(selectedMood);

    return (
      categoryMatch &&
      searchMatch &&
      seasonMatch &&
      moodMatch
    );
  });

  const newestFirstTieBreak = (a, b) =>
    Number(b.id || 0) - Number(a.id || 0);

  switch (sortBy) {
    case "rating":
      return [...result].sort((a, b) => {
        const ratingDifference =
          Number(b.rating || 0) -
          Number(a.rating || 0);

        return (
          ratingDifference ||
          newestFirstTieBreak(a, b)
        );
      });

    case "priceLow":
      return [...result].sort((a, b) => {
        const priceDifference =
          getMinPrice(a) - getMinPrice(b);

        return (
          priceDifference ||
          newestFirstTieBreak(a, b)
        );
      });

    case "priceHigh":
      return [...result].sort((a, b) => {
        const priceDifference =
          getMinPrice(b) - getMinPrice(a);

        return (
          priceDifference ||
          newestFirstTieBreak(a, b)
        );
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
              Number(b.id || 0) -
              Number(a.id || 0)
          );
  }
};

export const getCategoryOptions = (lang) => [
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
    label:
      lang === "sr" ? "Dizajner" : "Designer",
  },
  {
    value: "Niche",
    label: "Niche",
  },
];

export const getScentMoodOptions = (lang) => [
  {
    value: "All",
    label:
      lang === "sr"
        ? "Svi moodovi"
        : "All moods",
    icon: "✦",
    hint: "Explore Collection",
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

export const getSeasonOptions = (tr) => [
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

export const getSortOptions = (tr) => [
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

export const getSelectedOption = (
  options,
  value
) =>
  options.find(
    (option) => option.value === value
  ) || options[0];

export const getPaginationData = ({
  filteredProducts = [],
  currentPage,
  productsPerPage,
}) => {
  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredProducts.length /
        productsPerPage
    )
  );

  const start =
    (currentPage - 1) * productsPerPage;

  return {
    totalPages,
    paginatedProducts:
      filteredProducts.slice(
        start,
        start + productsPerPage
      ),
  };
};

export const getProductThumbnail = (
  image = ""
) =>
  image
    .replace(
      "/products/",
      "/products/thumbs/"
    )
    .replace(/\.png$/i, ".webp");
