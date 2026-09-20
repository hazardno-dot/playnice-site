import { getCommerceOverlayTransition } from "./commerceOverlayState";

describe("commerceOverlayState", () => {
  test("cart and checkout never open together through supported transitions", () => {
    expect(
      getCommerceOverlayTransition({
        cartOpen: true,
        checkoutOpen: false,
        action: "open-checkout",
      })
    ).toEqual({
      cartOpen: false,
      checkoutOpen: true,
    });

    expect(
      getCommerceOverlayTransition({
        cartOpen: false,
        checkoutOpen: true,
        action: "open-cart",
      })
    ).toEqual({
      cartOpen: true,
      checkoutOpen: false,
    });

    expect(
      getCommerceOverlayTransition({
        cartOpen: false,
        checkoutOpen: true,
        action: "toggle-cart",
      })
    ).toEqual({
      cartOpen: true,
      checkoutOpen: false,
    });
  });

  test("active checkout submission cannot be replaced by cart", () => {
    expect(
      getCommerceOverlayTransition({
        cartOpen: false,
        checkoutOpen: true,
        isSubmittingOrder: true,
        action: "toggle-cart",
      })
    ).toEqual({
      cartOpen: false,
      checkoutOpen: true,
    });

    expect(
      getCommerceOverlayTransition({
        cartOpen: false,
        checkoutOpen: true,
        isSubmittingOrder: true,
        action: "close-checkout",
      })
    ).toEqual({
      cartOpen: false,
      checkoutOpen: true,
    });
  });

  test("closing checkout preserves cart state when not submitting", () => {
    expect(
      getCommerceOverlayTransition({
        cartOpen: false,
        checkoutOpen: true,
        action: "close-checkout",
      })
    ).toEqual({
      cartOpen: false,
      checkoutOpen: false,
    });
  });
});
