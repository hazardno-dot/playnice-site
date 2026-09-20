import {
  getDiscoveryProducts,
  calculateDiscoverySetTotals,
  toggleDiscoverySelection,
  buildDiscoveryBundleItem,
  addOrIncrementCartItem,
  normalizeCartQuantity,
  updateCartItemQuantity,
  removeCartItem,
  rehydrateCart,
  getDirectPurchaseProduct,
  getProductPurchaseSelection,
  buildCheckoutEmailRecommendations,
} from "./commerceDerivations";

const config = {
  key: "designer-niche",
  size: "2ml",
  categories: ["Designer", "Niche"],
  cartName: "Discovery Set",
};

const products = [
  {
    id: 1,
    name: "One",
    slug: "one",
    category: "Designer",
    image: "/one.webp",
    sizes: { "2ml": 4, "5ml": 8 },
    recommendations: ["three", "two"],
  },
  {
    id: 2,
    name: "Two",
    slug: "two",
    category: "Niche",
    image: "/two.webp",
    sizes: { "2ml": 6 },
    recommendations: ["three"],
  },
  {
    id: 3,
    name: "Three",
    slug: "three",
    category: "Arabian",
    image: "/three.webp",
    sizes: { "5ml": 5 },
    cardName: "Three Card",
  },
];

describe("commerceDerivations", () => {
  test("filters Discovery Set products by category and configured size", () => {
    expect(
      getDiscoveryProducts(products, config).map(
        (product) => product.id
      )
    ).toEqual([1, 2]);
  });

  test("calculates discovery subtotal, bundle price and savings", () => {
    expect(
      calculateDiscoverySetTotals(
        [products[0], products[1]],
        config,
        0.1
      )
    ).toEqual({
      subtotal: 10,
      bundlePrice: 9,
      savings: 1,
    });
  });

  test("toggles discovery selection and enforces required count", () => {
    const selected = toggleDiscoverySelection(
      [products[0]],
      products[1],
      2
    );

    expect(selected).toHaveLength(2);

    expect(
      toggleDiscoverySelection(
        selected,
        products[2],
        2
      )
    ).toBe(selected);

    expect(
      toggleDiscoverySelection(
        selected,
        products[0],
        2
      ).map((product) => product.id)
    ).toEqual([2]);
  });

  test("builds stable discovery bundle key independent of selection order", () => {
    const item = buildDiscoveryBundleItem({
      selectedProducts: [products[1], products[0]],
      config,
      requiredCount: 2,
      bundlePrice: 9,
    });

    expect(item.key).toBe(
      "discovery-set-designer-niche-1-2"
    );
    expect(item.size).toBe("2 × 2ml");
    expect(item.bundleItems).toHaveLength(2);
  });


  test("rehydrates persisted cart with current catalog price and merges duplicate keys", () => {
    const catalog = [
      {
        id: 9,
        name: "Current Product",
        image: "/current.webp",
        sizes: {
          "5ml": 10,
          "10ml": 18,
        },
        discount: {
          size: "10ml",
          percent: 20,
        },
      },
    ];

    expect(
      rehydrateCart(
        [
          {
            key: "9-10ml-",
            id: 9,
            name: "Old Name",
            image: "/old.webp",
            size: "10ml",
            price: 99,
            quantity: 1,
          },
          {
            key: "9-10ml-",
            id: 9,
            name: "Old Name",
            image: "/old.webp",
            size: "10ml",
            price: 99,
            quantity: 2,
          },
        ],
        catalog
      )
    ).toEqual([
      expect.objectContaining({
        key: "9-10ml-",
        id: 9,
        name: "Current Product",
        image: "/current.webp",
        size: "10ml",
        price: 14.4,
        quantity: 3,
      }),
    ]);
  });

  test("preserves valid custom items and drops malformed persisted entries", () => {
    expect(
      rehydrateCart(
        [
          {
            key: "discovery-set",
            size: "2 × 2ml",
            price: "9",
            quantity: "2",
          },
          {
            key: "",
            price: 5,
            quantity: 1,
          },
          {
            key: "bad-price",
            price: "oops",
            quantity: 1,
          },
          {
            key: "bad-quantity",
            price: 5,
            quantity: 0,
          },
        ],
        []
      )
    ).toEqual([
      expect.objectContaining({
        key: "discovery-set",
        price: 9,
        quantity: 2,
      }),
    ]);
  });

  test("normalizes quantity updates and removes an item at zero", () => {
    expect(
      normalizeCartQuantity("2.8")
    ).toBe(2);

    expect(
      normalizeCartQuantity("bad")
    ).toBe(0);

    expect(
      updateCartItemQuantity(
        [
          {
            key: "one",
            quantity: 1,
          },
        ],
        "one",
        -1
      )
    ).toEqual([]);

    expect(
      updateCartItemQuantity(
        [
          {
            key: "one",
            quantity: 2,
          },
        ],
        "one",
        1
      )
    ).toEqual([
      {
        key: "one",
        quantity: 3,
      },
    ]);

    expect(
      removeCartItem(
        [
          { key: "one" },
          { key: "two" },
        ],
        "one"
      )
    ).toEqual([
      { key: "two" },
    ]);
  });

  test("increments an existing cart bundle instead of duplicating it", () => {
    const existing = {
      key: "bundle",
      quantity: 1,
    };

    expect(
      addOrIncrementCartItem(
        [existing],
        { ...existing, quantity: 1 }
      )
    ).toEqual([
      {
        key: "bundle",
        quantity: 2,
      },
    ]);
  });

  test("resolves one canonical purchase selection for size, discount and cart price", () => {
    const product = {
      id: 9,
      sizes: { "5ml": 10, "10ml": 18 },
      discount: {
        size: "10ml",
        percent: 20,
      },
    };

    expect(
      getProductPurchaseSelection(
        product,
        "10ml"
      )
    ).toEqual({
      activeSize: "10ml",
      basePrice: 18,
      discount: product.discount,
      finalPrice: 14.4,
      productForCart: {
        ...product,
        sizes: {
          "5ml": 10,
          "10ml": 14.4,
        },
      },
    });

    expect(
      getProductPurchaseSelection(
        product,
        ""
      ).activeSize
    ).toBe("5ml");

    expect(
      getDirectPurchaseProduct(
        product,
        "10ml"
      ).sizes["10ml"]
    ).toBe(14.4);
  });

  test("builds unique checkout recommendations and excludes purchased products", () => {
    const catalog = [
      products[0],
      products[1],
      {
        ...products[2],
        category: "Arabian",
      },
    ];

    const result = buildCheckoutEmailRecommendations(
      [
        { id: 1 },
        { id: 2 },
      ],
      catalog
    );

    expect(result).toEqual([
      {
        name: "Three",
        shortName: "Three Card",
        slug: "three",
        image: "/three.webp",
        category: "Arabian",
      },
    ]);
  });
});
