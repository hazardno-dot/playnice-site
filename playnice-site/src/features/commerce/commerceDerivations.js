export const getDiscoveryProducts = (
  products = [],
  config
) => {
  if (!config) return [];

  return products.filter(
    (product) =>
      config.categories.includes(product.category) &&
      product.sizes?.[config.size]
  );
};

export const calculateDiscoverySetTotals = (
  selectedProducts = [],
  config,
  discountRate
) => {
  if (!config) {
    return {
      subtotal: 0,
      bundlePrice: 0,
      savings: 0,
    };
  }

  const subtotal = selectedProducts.reduce(
    (sum, product) =>
      sum + Number(product.sizes?.[config.size] || 0),
    0
  );

  const bundlePrice = Number(
    (subtotal * (1 - discountRate)).toFixed(2)
  );

  const savings = Number(
    (subtotal - bundlePrice).toFixed(2)
  );

  return {
    subtotal,
    bundlePrice,
    savings,
  };
};

export const toggleDiscoverySelection = (
  selectedProducts = [],
  product,
  requiredCount
) => {
  const exists = selectedProducts.some(
    (item) => item.id === product.id
  );

  if (exists) {
    return selectedProducts.filter(
      (item) => item.id !== product.id
    );
  }

  if (selectedProducts.length >= requiredCount) {
    return selectedProducts;
  }

  return [...selectedProducts, product];
};

export const buildDiscoveryBundleItem = ({
  selectedProducts = [],
  config,
  requiredCount,
  bundlePrice,
}) => {
  if (!config) return null;

  const bundleKey =
    `discovery-set-${config.key}-${selectedProducts
      .map((product) => product.id)
      .sort((a, b) => a - b)
      .join("-")}`;

  const bundleSize =
    `${requiredCount} × ${config.size}`;

  return {
    key: bundleKey,
    id: bundleKey,
    type: "bundle",
    name: config.cartName,
    image: selectedProducts[0]?.image,
    size: bundleSize,
    price: bundlePrice,
    quantity: 1,
    bundleItems: selectedProducts.map((product) => ({
      id: product.id,
      name: product.name,
      image: product.image,
      size: config.size,
      price: product.sizes[config.size],
    })),
  };
};

export const addOrIncrementCartItem = (
  cart = [],
  item
) => {
  const existing = cart.find(
    (cartItem) => cartItem.key === item.key
  );

  if (existing) {
    return cart.map((cartItem) =>
      cartItem.key === item.key
        ? {
            ...cartItem,
            quantity: cartItem.quantity + 1,
          }
        : cartItem
    );
  }

  return [...cart, item];
};

export const getDirectPurchaseProduct = (
  product,
  size,
  getDiscountForSize,
  getDiscountedPrice
) => {
  if (!product || !size) return product;

  const activePrice = product.sizes?.[size];
  const discount = getDiscountForSize(product, size);

  if (!discount || activePrice == null) return product;

  const finalPrice = getDiscountedPrice(
    activePrice,
    discount.percent
  );

  return {
    ...product,
    sizes: {
      ...product.sizes,
      [size]: finalPrice,
    },
  };
};

export const buildCheckoutEmailRecommendations = (
  cart = [],
  products = [],
  limit = 3
) => {
  const purchasedProductSlugs = new Set(
    cart
      .map((item) =>
        products.find(
          (product) =>
            String(product.id) === String(item.id)
        )
      )
      .filter(Boolean)
      .map((product) => product.slug)
  );

  const recommendationSlugs = [];

  cart.forEach((item) => {
    const sourceProduct = products.find(
      (product) =>
        String(product.id) === String(item.id)
    );

    (sourceProduct?.recommendations || []).forEach(
      (slug) => {
        if (
          slug &&
          !purchasedProductSlugs.has(slug) &&
          !recommendationSlugs.includes(slug)
        ) {
          recommendationSlugs.push(slug);
        }
      }
    );
  });

  return recommendationSlugs
    .slice(0, limit)
    .map((slug) =>
      products.find(
        (product) => product.slug === slug
      )
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
      category: product.category,
    }));
};
