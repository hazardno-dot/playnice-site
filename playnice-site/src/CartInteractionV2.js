import { useEffect } from "react";

const CART_CONFIRMATION_DURATION = 5000;
const LEGACY_MINI_CART_DURATION = 1700;
const PRODUCT_MODAL_AUTO_CLOSE_DELAY = 950;

const isModalAddToCartButton = (target) => {
  const button = target?.closest?.("button");
  if (!button || !button.closest(".product-modal")) return false;

  const label = String(button.textContent || "")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();

  return (
    label.includes("ADD TO CART") ||
    label.includes("DODAJ U KORPU") ||
    label.includes("ADDED") ||
    label.includes("DODATO")
  );
};

export default function CartInteractionV2() {
  useEffect(() => {
    const originalSetTimeout = window.setTimeout.bind(window);
    let suppressProductModalAutoCloseUntil = 0;

    const handleClickCapture = (event) => {
      if (isModalAddToCartButton(event.target)) {
        suppressProductModalAutoCloseUntil = Date.now() + 1600;
      }
    };

    window.setTimeout = (callback, delay, ...args) => {
      if (delay === LEGACY_MINI_CART_DURATION) {
        return originalSetTimeout(callback, CART_CONFIRMATION_DURATION, ...args);
      }

      if (
        delay === PRODUCT_MODAL_AUTO_CLOSE_DELAY &&
        Date.now() < suppressProductModalAutoCloseUntil &&
        document.querySelector(".product-modal")
      ) {
        return null;
      }

      return originalSetTimeout(callback, delay, ...args);
    };

    document.addEventListener("click", handleClickCapture, true);

    return () => {
      document.removeEventListener("click", handleClickCapture, true);
      window.setTimeout = originalSetTimeout;
    };
  }, []);

  return null;
}
