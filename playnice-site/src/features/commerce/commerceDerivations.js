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


export const normalizeCartQuantity = (
  quantity
) => {
  const value = Number(quantity);

  if (
    !Number.isFinite(value) ||
    value <= 0
  ) {
    return 0;
  }

  return Math.max(
    1,
    Math.floor(value)
  );
};

export const updateCartItemQuantity = (
  cart = [],
  key,
  delta
) =>
  cart
    .map((item) => {
      if (item.key !== key) return item;

      return {
        ...item,
        quantity: normalizeCartQuantity(
          Number(item.quantity || 0) +
            Number(delta || 0)
        ),
      };
    })
    .filter(
      (item) =>
        normalizeCartQuantity(
          item.quantity
        ) > 0
    );

export const removeCartItem = (
  cart = [],
  key
) =>
  cart.filter(
    (item) => item.key !== key
  );

export const rehydrateCart = (
  items = [],
  catalog = []
) => {
  const catalogById = new Map(
    catalog.map((product) => [
      String(product.id),
      product,
    ])
  );

  const byKey = new Map();

  for (const rawItem of items) {
    const key = String(
      rawItem?.key || ""
    ).trim();

    const quantity =
      normalizeCartQuantity(
        rawItem?.quantity
      );

    if (!key || quantity <= 0) {
      continue;
    }

    const catalogProduct =
      rawItem?.id != null
        ? catalogById.get(
            String(rawItem.id)
          )
        : null;

    const hasCatalogSize =
      catalogProduct &&
      rawItem?.size &&
      catalogProduct.sizes?.[
        rawItem.size
      ] != null;

    let item = {
      ...rawItem,
      quantity,
    };

    if (hasCatalogSize) {
      const selection =
        getProductPurchaseSelection(
          catalogProduct,
          rawItem.size
        );

      item = {
        ...item,
        id: catalogProduct.id,
        name: catalogProduct.name,
        image: catalogProduct.image,
        price: selection.finalPrice,
      };
    } else {
      const price = Number(
        rawItem?.price
      );

      if (
        !Number.isFinite(price) ||
        price < 0
      ) {
        continue;
      }

      item.price = price;
    }

    const existing = byKey.get(key);

    if (existing) {
      byKey.set(key, {
        ...item,
        quantity:
          normalizeCartQuantity(
            existing.quantity
          ) + quantity,
      });
    } else {
      byKey.set(key, item);
    }
  }

  return Array.from(
    byKey.values()
  );
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


export const getProductPurchaseSelection = (
  product,
  preferredSize = ""
) => {
  const sizes = product?.sizes || {};
  const activeSize =
    preferredSize && sizes[preferredSize] != null
      ? preferredSize
      : Object.keys(sizes)[0] || "";

  const basePrice =
    activeSize && sizes[activeSize] != null
      ? Number(sizes[activeSize])
      : 0;

  const discount =
    product?.discount?.size === activeSize
      ? product.discount
      : null;

  const finalPrice = discount
    ? Number(
        (
          basePrice *
          (1 - Number(discount.percent) / 100)
        ).toFixed(2)
      )
    : basePrice;

  const productForCart =
    discount && activeSize
      ? {
          ...product,
          sizes: {
            ...sizes,
            [activeSize]: finalPrice,
          },
        }
      : product;

  return {
    activeSize,
    basePrice,
    discount,
    finalPrice,
    productForCart,
  };
};

export const getDirectPurchaseProduct = (
  product,
  size
) =>
  getProductPurchaseSelection(
    product,
    size
  ).productForCart;

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
