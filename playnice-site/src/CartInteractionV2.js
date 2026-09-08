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
    const originalSetTimeout = window.setTimeout;

    const handleClickCapture = (event) => {
      const keepProductModalOpen = isModalAddToCartButton(event.target);
      const previousSetTimeout = window.setTimeout;

      window.setTimeout = (callback, delay, ...args) => {
        if (delay === LEGACY_MINI_CART_DURATION) {
          return originalSetTimeout(callback, CART_CONFIRMATION_DURATION, ...args);
        }

        if (keepProductModalOpen && delay === PRODUCT_MODAL_AUTO_CLOSE_DELAY) {
          return null;
        }

        return originalSetTimeout(callback, delay, ...args);
      };

      queueMicrotask(() => {
        if (window.setTimeout !== previousSetTimeout) {
          window.setTimeout = previousSetTimeout;
        }
      });
    };

    document.addEventListener("click", handleClickCapture, true);

    return () => {
      document.removeEventListener("click", handleClickCapture, true);
      window.setTimeout = originalSetTimeout;
    };
  }, []);

  return null;
}
