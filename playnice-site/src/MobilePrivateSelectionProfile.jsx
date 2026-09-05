import { useEffect } from "react";
import { products } from "./data/products";
import { productCopy, fallbackCopy } from "./data/products/productCopy";

const PRIVATE_SELECTION_IDS = [27, 30, 36, 47];

const cleanMiniTag = (value = "") =>
  String(value)
    .replace(/^\s*[^\p{L}\p{N}]+/u, "")
    .trim();

export default function MobilePrivateSelectionProfile() {
  useEffect(() => {
    const applyProfiles = () => {
      if (window.innerWidth > 640 || window.location.pathname !== "/") return;

      const lang = localStorage.getItem("playnice_lang") === "en" ? "en" : "sr";
      const cards = document.querySelectorAll(
        ".homepage-shop-preview .product-card"
      );

      cards.forEach((card, index) => {
        const product = products.find(
          (item) => item.id === PRIVATE_SELECTION_IDS[index]
        );
        if (!product) return;

        const label = card.querySelector(".product-category");
        if (!label) return;

        const copy = productCopy[product.name] || fallbackCopy;
        const miniTag = copy?.miniTag?.[lang] || copy?.miniTag?.en || "";

        label.textContent = cleanMiniTag(miniTag);
        label.classList.add("mobile-private-scent-profile");
      });
    };

    applyProfiles();

    const observer = new MutationObserver(applyProfiles);
    observer.observe(document.body, { childList: true, subtree: true });

    window.addEventListener("resize", applyProfiles);
    window.addEventListener("popstate", applyProfiles);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", applyProfiles);
      window.removeEventListener("popstate", applyProfiles);
    };
  }, []);

  return null;
}
