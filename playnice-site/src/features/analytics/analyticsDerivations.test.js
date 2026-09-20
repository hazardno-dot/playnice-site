import {
  buildEcommerceItem,
  buildEcommerceItems,
  getEcommerceValue,
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
});
