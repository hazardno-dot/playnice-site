export const getCartSummary = ({
  cart = [],
  freeShippingThreshold,
  shippingCost,
}) => {
  const cartCount = cart.reduce(
    (sum, item) =>
      sum + Number(item.quantity || 0),
    0
  );

  const subtotal = cart.reduce(
    (sum, item) =>
      sum +
      Number(item.price || 0) *
        Number(item.quantity || 0),
    0
  );

  const shipping =
    cart.length === 0
      ? 0
      : subtotal >= freeShippingThreshold
      ? 0
      : shippingCost;

  const total = subtotal + shipping;

  const amountLeftForFreeShipping =
    Math.max(
      0,
      freeShippingThreshold - subtotal
    );

  const freeShippingProgress = Math.min(
    100,
    Math.max(
      0,
      (subtotal / freeShippingThreshold) *
        100
    )
  );

  return {
    cartCount,
    subtotal,
    shipping,
    total,
    amountLeftForFreeShipping,
    freeShippingProgress,
  };
};

export const getOverlayVisibility = ({
  cartOpen,
  checkoutOpen,
  storyOpen,
  howItWorksOpen,
  faqOpen,
  privateSelectionOpen,
  catalogPreview,
  manifestoOpen,
  discoveryOpen,
  isHomeDiscoverySuspendedForProduct,
  discoveryBuilderOpen,
  view,
}) => {
  const hasBlockingOverlay =
    Boolean(cartOpen) ||
    Boolean(checkoutOpen) ||
    Boolean(storyOpen) ||
    Boolean(howItWorksOpen) ||
    Boolean(faqOpen) ||
    Boolean(privateSelectionOpen) ||
    Boolean(catalogPreview) ||
    Boolean(manifestoOpen) ||
    (Boolean(discoveryOpen) &&
      !Boolean(
        isHomeDiscoverySuspendedForProduct
      )) ||
    Boolean(discoveryBuilderOpen);

  return {
    hasBlockingOverlay,
    showStickyCta:
      !hasBlockingOverlay &&
      (view === "home" ||
        view === "shop"),
  };
};

export const buildManagedShopUrl = ({
  pathname,
  search = "",
  view,
  category,
  searchTerm,
  season,
  scentMood,
  sortBy,
  currentPage,
}) => {
  const params =
    new URLSearchParams(search);

  params.delete("view");
  params.delete("category");
  params.delete("search");
  params.delete("season");
  params.delete("mood");
  params.delete("sort");
  params.delete("page");

  if (
    pathname === "/" &&
    view !== "home"
  ) {
    params.set("view", view);
  }

  if (view === "shop") {
    if (category !== "All") {
      params.set(
        "category",
        category
      );
    }

    const trimmedSearch =
      String(searchTerm || "").trim();

    if (trimmedSearch) {
      params.set(
        "search",
        trimmedSearch
      );
    }

    if (season !== "All") {
      params.set(
        "season",
        season
      );
    }

    if (scentMood !== "All") {
      params.set(
        "mood",
        scentMood
      );
    }

    if (sortBy !== "featured") {
      params.set(
        "sort",
        sortBy
      );
    }

    if (currentPage > 1) {
      params.set(
        "page",
        String(currentPage)
      );
    }
  }

  const query = params.toString();

  return query
    ? `${pathname}?${query}`
    : pathname;
};


export const getProductOriginView = (
  historyState
) => {
  const originView =
    historyState?.productOriginView;

  return [
    "home",
    "shop",
    "journal",
    "exhibition",
  ].includes(originView)
    ? originView
    : "shop";
};
