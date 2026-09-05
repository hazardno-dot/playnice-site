import { useEffect } from "react";

const MOBILE_QUERY = "(max-width: 640px)";
const CARD_SELECTOR = ".shop-section .product-grid > .product-card";
const GRID_SELECTOR = ".shop-section .product-grid";
const REVEAL_LINE = 0.92;

export default function MobileShopReveal() {
  useEffect(() => {
    const media = window.matchMedia(MOBILE_QUERY);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    let observer = null;
    let gridObserver = null;
    let observedGrid = null;
    let frame = 0;

    const revealCard = (card) => {
      if (!card) return;
      card.classList.add("mobile-shop-reveal-visible");
      card.classList.remove("mobile-shop-reveal-pending");
      observer?.unobserve(card);
    };

    const revealImmediately = () => {
      document.querySelectorAll(CARD_SELECTOR).forEach(revealCard);
    };

    const disconnect = () => {
      observer?.disconnect();
      gridObserver?.disconnect();
      observer = null;
      gridObserver = null;
      observedGrid = null;

      if (frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    };

    const revealCardsInViewport = () => {
      frame = 0;

      if (!media.matches || reduceMotion.matches || window.location.pathname !== "/shop") {
        revealImmediately();
        return;
      }

      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      const revealBottom = viewportHeight * REVEAL_LINE;

      document
        .querySelectorAll(`${CARD_SELECTOR}.mobile-shop-reveal-pending`)
        .forEach((card) => {
          const rect = card.getBoundingClientRect();

          if (rect.top <= revealBottom && rect.bottom >= 0) {
            revealCard(card);
          }
        });
    };

    const scheduleViewportCheck = () => {
      if (frame) return;
      frame = requestAnimationFrame(revealCardsInViewport);
    };

    const observeCards = () => {
      if (!media.matches || reduceMotion.matches || window.location.pathname !== "/shop") {
        revealImmediately();
        return;
      }

      if (!observer && "IntersectionObserver" in window) {
        observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) revealCard(entry.target);
            });
          },
          {
            root: null,
            rootMargin: "0px 0px -8% 0px",
            threshold: 0.01,
          }
        );
      }

      document.querySelectorAll(CARD_SELECTOR).forEach((card, index) => {
        if (card.classList.contains("mobile-shop-reveal-visible")) return;

        card.style.setProperty(
          "--mobile-shop-reveal-delay",
          `${index % 2 === 1 ? 70 : 0}ms`
        );
        card.classList.add("mobile-shop-reveal-pending");
        observer?.observe(card);
      });

      /*
        IntersectionObserver is an enhancement, never a dependency.
        Geometry check guarantees that cards already inside the viewport
        are revealed even in browser/devtools combinations where IO stalls.
      */
      scheduleViewportCheck();
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
      scheduleViewportCheck();
    };

    sync();

    media.addEventListener?.("change", sync);
    reduceMotion.addEventListener?.("change", sync);
    window.addEventListener("popstate", sync);
    window.addEventListener("playnice:locationchange", sync);
    window.addEventListener("scroll", scheduleViewportCheck, { passive: true });
    window.addEventListener("resize", scheduleViewportCheck, { passive: true });

    return () => {
      media.removeEventListener?.("change", sync);
      reduceMotion.removeEventListener?.("change", sync);
      window.removeEventListener("popstate", sync);
      window.removeEventListener("playnice:locationchange", sync);
      window.removeEventListener("scroll", scheduleViewportCheck);
      window.removeEventListener("resize", scheduleViewportCheck);
      disconnect();
      revealImmediately();
    };
  }, []);

  return null;
}
