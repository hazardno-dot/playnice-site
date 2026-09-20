export const getCommerceOverlayTransition = ({
  cartOpen = false,
  checkoutOpen = false,
  isSubmittingOrder = false,
  action,
}) => {
  if (
    isSubmittingOrder &&
    checkoutOpen &&
    action !== "close-cart"
  ) {
    return {
      cartOpen: false,
      checkoutOpen: true,
    };
  }

  switch (action) {
    case "toggle-cart":
      return {
        cartOpen: !cartOpen,
        checkoutOpen: false,
      };

    case "open-cart":
      return {
        cartOpen: true,
        checkoutOpen: false,
      };

    case "close-cart":
      return {
        cartOpen: false,
        checkoutOpen,
      };

    case "open-checkout":
      return {
        cartOpen: false,
        checkoutOpen: true,
      };

    case "close-checkout":
      return {
        cartOpen,
        checkoutOpen: false,
      };

    default:
      return {
        cartOpen,
        checkoutOpen,
      };
  }
};
