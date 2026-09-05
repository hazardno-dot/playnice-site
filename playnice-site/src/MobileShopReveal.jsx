import { useEffect } from "react";

const MOBILE_QUERY = "(max-width: 640px)";
const CARD_SELECTOR = ".shop-section .product-grid > .product-card";
const GRID_SELECTOR = ".shop-section .product-grid";
const REVEAL_LINE = 0.84;

export default function MobileShopReveal() {
  useEffect(() => {
    const media = window.matchMedia(MOBILE_QUERY);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    let gridObserver = null;
    let observedGrid = null;
    let frame = 0;

    const getCards = () => Array.from(document.querySelectorAll(CARD_SELECTOR));

    const revealCard = (card, immediate = false) => {
      if (!card || card.dataset.mobileShopRevealed === "true") return;

      card.dataset.mobileShopRevealed = "true";
      card.classList.remove("mobile-shop-reveal-pending");

      if (immediate) {
        card.classList.add("mobile-shop-reveal-static");
        return;
      }

      card.classList.add("mobile-shop-reveal-visible");
    };

    const revealRow = (cards, rowIndex, immediate = false) => {
      const start = rowIndex * 2;
      revealCard(cards[start], immediate);
      revealCard(cards[start + 1], immediate);
    };

    const revealImmediately = () => {
      getCards().forEach((card) => revealCard(card, true));
    };

    const prepareRows = () => {
      if (!media.matches || reduceMotion.matches || window.location.pathname !== "/shop") {
        revealImmediately();
        return;
      }

      const cards = getCards();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

      for (let row = 0; row < Math.ceil(cards.length / 2); row += 1) {
        const firstCard = cards[row * 2];
        if (!firstCard) continue;

        const rowTop = firstCard.getBoundingClientRect().top;

        /*
          Anything already inside the initial viewport is rendered stable.
          Motion is reserved for rows the user actually scrolls toward.
        */
        if (rowTop < viewportHeight) {
          revealRow(cards, row, true);
          continue;
        }

        [cards[row * 2], cards[row * 2 + 1]].forEach((card) => {
          if (!card || card.dataset.mobileShopRevealed === "true") return;
          card.classList.remove("mobile-shop-reveal-visible", "mobile-shop-reveal-static");
          card.classList.add("mobile-shop-reveal-pending");
        });
      }
    };

    const revealRowsAtLine = () => {
      frame = 0;

      if (!media.matches || reduceMotion.matches || window.location.pathname !== "/shop") {
        revealImmediately();
        return;
      }

      const cards = getCards();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      const revealLine = viewportHeight * REVEAL_LINE;

      for (let row = 0; row < Math.ceil(cards.length / 2); row += 1) {
        const firstCard = cards[row * 2];
        if (!firstCard || firstCard.dataset.mobileShopRevealed === "true") continue;

        const rect = firstCard.getBoundingClientRect();
        if (rect.top <= revealLine) revealRow(cards, row, false);
      }
    };

    const scheduleRevealCheck = () => {
      if (frame) return;
      frame = requestAnimationFrame(revealRowsAtLine);
    };

    const bindGrid = () => {
      const grid = document.querySelector(GRID_SELECTOR);
      if (!grid) return;

      if (grid !== observedGrid) {
        gridObserver?.disconnect();
        observedGrid = grid;

        gridObserver = new MutationObserver(() => {
          requestAnimationFrame(() => {
            prepareRows();
            scheduleRevealCheck();
          });
        });

        gridObserver.observe(grid, { childList: true });
      }

      prepareRows();
      scheduleRevealCheck();
    };

    const disconnect = () => {
      gridObserver?.disconnect();
      gridObserver = null;
      observedGrid = null;

      if (frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
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
    window.addEventListener("scroll", scheduleRevealCheck, { passive: true });
    window.addEventListener("resize", sync, { passive: true });

    return () => {
      media.removeEventListener?.("change", sync);
      reduceMotion.removeEventListener?.("change", sync);
      window.removeEventListener("popstate", sync);
      window.removeEventListener("playnice:locationchange", sync);
      window.removeEventListener("scroll", scheduleRevealCheck);
      window.removeEventListener("resize", sync);
      disconnect();
      revealImmediately();
    };
  }, []);

  return null;
}
