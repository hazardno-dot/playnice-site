export const getProductSequenceNeighbors = (catalog, activeSlug) => {
  const items = Array.isArray(catalog)
    ? catalog.filter((item) => item?.slug)
    : [];

  if (!items.length || !activeSlug) {
    return {
      previousProduct: null,
      nextProduct: null,
      position: 0,
      total: items.length,
    };
  }

  const index = items.findIndex(
    (item) => String(item.slug) === String(activeSlug)
  );

  if (index < 0) {
    return {
      previousProduct: null,
      nextProduct: null,
      position: 0,
      total: items.length,
    };
  }

  if (items.length === 1) {
    return {
      previousProduct: null,
      nextProduct: null,
      position: 1,
      total: 1,
    };
  }

  return {
    previousProduct: items[(index - 1 + items.length) % items.length],
    nextProduct: items[(index + 1) % items.length],
    position: index + 1,
    total: items.length,
  };
};

export const getProductNavigationLabel = (product) =>
  product?.shortName || product?.modalName || product?.name || "";
