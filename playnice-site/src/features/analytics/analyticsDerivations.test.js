import {
  buildEcommerceItem,
  buildEcommerceItems,
  getEcommerceValue,
  buildProductListEvent,
  buildProductSelectionEvent,
} from "./analyticsDerivations";

describe("analyticsDerivations", () => {
  test("builds one stable GA4 ecommerce item shape", () => {
    expect(
      buildEcommerceItem({
        id: 7,
        name: "Test Product",
        size: "10ml",
        category: "Niche",
        price: "14.4",
        quantity: "2",
      })
    ).toEqual({
      item_id: "7",
      item_name: "Test Product",
      item_variant: "10ml",
      item_category: "Niche",
      price: 14.4,
      quantity: 2,
    });
  });

  test("preserves per-item list and source attribution", () => {
    expect(
      buildEcommerceItem({
        id: 9,
        name: "Attributed",
        size: "5ml",
        price: 8,
        quantity: 1,
        analyticsListId: "home-just-in",
        analyticsListName: "Home Just In",
        analyticsListIndex: 4,
        analyticsOrigin: "home-just-in",
      })
    ).toEqual(
      expect.objectContaining({
        item_list_id: "home-just-in",
        item_list_name: "Home Just In",
        index: 4,
        item_source: "home-just-in",
      })
    );
  });

  test("falls back to cart key and omits missing category", () => {
    expect(
      buildEcommerceItem({
        key: "discovery-set",
        name: "Discovery Set",
        size: "5 × 2ml",
        price: 29,
        quantity: 1,
      })
    ).toEqual({
      item_id: "discovery-set",
      item_name: "Discovery Set",
      item_variant: "5 × 2ml",
      price: 29,
      quantity: 1,
    });
  });

  test("builds item arrays and exact cart value", () => {
    const items = [
      {
        id: 1,
        name: "One",
        size: "5ml",
        price: 10,
        quantity: 2,
      },
      {
        id: 2,
        name: "Two",
        size: "2ml",
        price: 4.5,
        quantity: 1,
      },
    ];

    expect(
      buildEcommerceItems(items)
    ).toHaveLength(2);

    expect(
      getEcommerceValue(items)
    ).toBe(24.5);
  });

  test("builds GA4 product-list payloads with stable list context", () => {
    const products = [
      {
        id: 1,
        name: "One",
        category: "Designer",
      },
      {
        id: 2,
        name: "Two",
        category: "Niche",
      },
    ];

    expect(
      buildProductListEvent({
        products,
        listId: "shop-grid",
        listName: "Shop Grid",
        getPrice: (product) =>
          product.id === 1 ? 5 : 9,
      })
    ).toEqual({
      item_list_id: "shop-grid",
      item_list_name: "Shop Grid",
      items: [
        expect.objectContaining({
          item_id: "1",
          item_name: "One",
          item_list_id: "shop-grid",
          item_list_name: "Shop Grid",
          index: 1,
          price: 5,
        }),
        expect.objectContaining({
          item_id: "2",
          item_name: "Two",
          item_list_id: "shop-grid",
          item_list_name: "Shop Grid",
          index: 2,
          price: 9,
        }),
      ],
    });
  });

  test("builds select_item payload for one clicked list product", () => {
    expect(
      buildProductSelectionEvent({
        product: {
          id: 7,
          name: "Clicked",
          category: "Arabian",
        },
        index: 3,
        listId: "home-just-in",
        listName: "Home Just In",
        price: 6,
      })
    ).toEqual({
      item_list_id: "home-just-in",
      item_list_name: "Home Just In",
      items: [
        expect.objectContaining({
          item_id: "7",
          item_name: "Clicked",
          item_list_id: "home-just-in",
          item_list_name: "Home Just In",
          index: 3,
          price: 6,
        }),
      ],
    });
  });
});
