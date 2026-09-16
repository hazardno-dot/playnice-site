import { useEffect, useState } from "react";
import "./DesktopProductPageNavigationPolish.css";

const PRODUCT_ROUTE = /^\/product\/[^/]+\/?$/;
const isDesktopProductRoute = () =>
  window.matchMedia("(min-width: 769px)").matches &&
  PRODUCT_ROUTE.test(window.location.pathname);

const smoothToTop = () => {
  window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
};

export default function DesktopProductPageNavigationPolish() {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [active, setActive] = useState(() => isDesktopProductRoute());

  useEffect(() => {
    const refresh = () => {
      const nextActive = isDesktopProductRoute();
      setActive(nextActive);
      setShowBackToTop(nextActive && window.scrollY > 520);
    };

    const handleScroll = () => {
      if (!isDesktopProductRoute()) {
        setShowBackToTop(false);
        return;
      }
      setShowBackToTop(window.scrollY > 520);
    };

    window.addEventListener("popstate", refresh);
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", refresh);
    refresh();

    return () => {
      window.removeEventListener("popstate", refresh);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", refresh);
    };
  }, []);

  useEffect(() => {
    if (!active) return undefined;

    let animationFrame = null;
    let fallbackTimer = null;

    const handleRecommendationClick = (event) => {
      const button = event.target.closest?.(
        ".desktop-product-page__recommendation-grid button"
      );
      if (!button || !isDesktopProductRoute()) return;

      if (button.dataset.pdpSmoothReady === "true") {
        delete button.dataset.pdpSmoothReady;
        return;
      }

      if (window.scrollY <= 20) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation?.();

      smoothToTop();

      const startedAt = performance.now();
      let released = false;

      const releaseClick = () => {
        if (released) return;
        released = true;

        if (animationFrame) {
          window.cancelAnimationFrame(animationFrame);
          animationFrame = null;
        }
        if (fallbackTimer) {
          window.clearTimeout(fallbackTimer);
          fallbackTimer = null;
        }
        if (!document.contains(button)) return;

        button.dataset.pdpSmoothReady = "true";
        button.click();
      };

      const waitForTop = () => {
        if (window.scrollY <= 12 || performance.now() - startedAt > 1100) {
          releaseClick();
          return;
        }
        animationFrame = window.requestAnimationFrame(waitForTop);
      };

      animationFrame = window.requestAnimationFrame(waitForTop);
      fallbackTimer = window.setTimeout(releaseClick, 1250);
    };

    document.addEventListener("click", handleRecommendationClick, true);

    return () => {
      document.removeEventListener("click", handleRecommendationClick, true);
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      if (fallbackTimer) window.clearTimeout(fallbackTimer);
    };
  }, [active]);

  if (!active) return null;

  const lang = document.documentElement.lang === "en" ? "en" : "sr";

  return (
    <button
      type="button"
      className={`desktop-pdp-back-to-top ${showBackToTop ? "is-visible" : ""}`}
      onClick={smoothToTop}
      aria-label={lang === "sr" ? "Nazad na vrh" : "Back to top"}
      title={lang === "sr" ? "Nazad na vrh" : "Back to top"}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6.5 14.5 12 9l5.5 5.5" />
      </svg>
    </button>
  );
}
