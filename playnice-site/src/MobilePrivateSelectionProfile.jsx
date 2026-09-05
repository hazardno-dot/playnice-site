import { useEffect } from "react";
import { products } from "./data/products";
import { productCopy, fallbackCopy } from "./data/products/productCopy";

const PRIVATE_SELECTION_IDS = [27, 30, 36, 47];
const MOBILE_QUERY = "(max-width: 640px)";
const CARD_SELECTOR = ".homepage-shop-preview .product-card";

const getMiniTagText = (value = "") => String(value).trim();

export default function MobilePrivateSelectionProfile() {
  useEffect(() => {
    const media = window.matchMedia(MOBILE_QUERY);
    let frameId = 0;

    const syncProfiles = () => {
      frameId = 0;

      const cards = document.querySelectorAll(CARD_SELECTOR);
      if (!cards.length) return;

      const lang = localStorage.getItem("playnice_lang") === "en" ? "en" : "sr";

      cards.forEach((card, index) => {
        const label = card.querySelector(".product-category");
        if (!label) return;

        if (!label.dataset.mobilePrivateOriginal) {
          label.dataset.mobilePrivateOriginal = label.textContent || "";
        }

        const original = label.dataset.mobilePrivateOriginal;

        if (!media.matches || window.location.pathname !== "/") {
          if (label.textContent !== original) {
            label.textContent = original;
          }
          label.classList.remove("mobile-private-scent-profile");
          return;
        }

        const product = products.find(
          (item) => item.id === PRIVATE_SELECTION_IDS[index]
        );
        if (!product) return;

        const copy = productCopy[product.name] || fallbackCopy;
        const miniTag = copy?.miniTag?.[lang] || copy?.miniTag?.en || "";
        const mobileText = getMiniTagText(miniTag);

        if (mobileText && label.textContent !== mobileText) {
          label.textContent = mobileText;
        }

        if (!label.classList.contains("mobile-private-scent-profile")) {
          label.classList.add("mobile-private-scent-profile");
        }
      });
    };

    const scheduleSync = () => {
      if (frameId) return;
      frameId = window.requestAnimationFrame(syncProfiles);
    };

    syncProfiles();

    const observer = new MutationObserver(scheduleSync);
    observer.observe(document.body, { childList: true, subtree: true });

    media.addEventListener?.("change", scheduleSync);
    window.addEventListener("popstate", scheduleSync);

    return () => {
      observer.disconnect();
      media.removeEventListener?.("change", scheduleSync);
      window.removeEventListener("popstate", scheduleSync);

      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }

      document.querySelectorAll(CARD_SELECTOR).forEach((card) => {
        const label = card.querySelector(".product-category");
        if (!label) return;

        const original = label.dataset.mobilePrivateOriginal;
        if (original && label.textContent !== original) {
          label.textContent = original;
        }

        label.classList.remove("mobile-private-scent-profile");
        delete label.dataset.mobilePrivateOriginal;
      });
    };
  }, []);

  return null;
}
