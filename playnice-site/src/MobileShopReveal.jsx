import { useEffect } from "react";

const MOBILE_QUERY = "(max-width: 640px)";
const CARD_SELECTOR = ".shop-section .product-grid > .product-card";
const GRID_SELECTOR = ".shop-section .product-grid";

export default function MobileShopReveal() {
  useEffect(() => {
    const media = window.matchMedia(MOBILE_QUERY);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    let observer = null;
    let gridObserver = null;
    let observedGrid = null;

    const disconnect = () => {
      observer?.disconnect();
      gridObserver?.disconnect();
      observer = null;
      gridObserver = null;
      observedGrid = null;
    };

    const revealImmediately = () => {
      document.querySelectorAll(CARD_SELECTOR).forEach((card) => {
        card.classList.remove("mobile-shop-reveal-pending");
        card.classList.add("mobile-shop-reveal-visible");
      });
    };

    const observeCards = () => {
      if (!media.matches || reduceMotion.matches || window.location.pathname !== "/shop") {
        revealImmediately();
        return;
      }

      if (!observer) {
        observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting) return;

              const card = entry.target;
              card.classList.add("mobile-shop-reveal-visible");
              card.classList.remove("mobile-shop-reveal-pending");
              observer.unobserve(card);
            });
          },
          {
            root: null,
            rootMargin: "0px 0px -8% 0px",
            threshold: 0.08,
          }
        );
      }

      document.querySelectorAll(CARD_SELECTOR).forEach((card, index) => {
        if (card.classList.contains("mobile-shop-reveal-visible")) return;

        card.style.setProperty("--mobile-shop-reveal-delay", `${index % 2 === 1 ? 70 : 0}ms`);
        card.classList.add("mobile-shop-reveal-pending");
        observer.observe(card);
      });
    };

    const bindGrid = () => {
      const grid = document.querySelector(GRID_SELECTOR);
      if (!grid) return;

      if (grid === observedGrid) {
        observeCards();
        return;
      }

      gridObserver?.disconnect();
      observedGrid = grid;

      gridObserver = new MutationObserver(() => {
        requestAnimationFrame(observeCards);
      });

      gridObserver.observe(grid, {
        childList: true,
      });

      observeCards();
    };

    const sync = () => {
      if (!media.matches || reduceMotion.matches || window.location.pathname !== "/shop") {
        disconnect();
        revealImmediately();
        return;
      }

      requestAnimationFrame(bindGrid);
    };

    sync();

    media.addEventListener?.("change", sync);
    reduceMotion.addEventListener?.("change", sync);
    window.addEventListener("popstate", sync);
    window.addEventListener("playnice:locationchange", sync);

    return () => {
      media.removeEventListener?.("change", sync);
      reduceMotion.removeEventListener?.("change", sync);
      window.removeEventListener("popstate", sync);
      window.removeEventListener("playnice:locationchange", sync);
      disconnect();
      revealImmediately();
    };
  }, []);

  return null;
}
