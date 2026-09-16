import { useEffect, useState } from "react";
import { LOCATION_CHANGE_EVENT } from "../lib/locationEvents";
import "./DesktopProductPageNavigationPolish.css";

const PRODUCT_ROUTE = /^\/product\/[^/]+\/?$/;
const isDesktopProductRoute = () =>
  window.matchMedia("(min-width: 769px)").matches &&
  PRODUCT_ROUTE.test(window.location.pathname);

const smoothScrollToTop = () => {
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  window.scrollTo({
    top: 0,
    left: 0,
    behavior: reduceMotion ? "auto" : "smooth",
  });
};

export default function DesktopProductPageNavigationPolish() {
  const [active, setActive] = useState(() => isDesktopProductRoute());
  const [showBackToTop, setShowBackToTop] = useState(
    () => isDesktopProductRoute() && window.scrollY > 600
  );

  useEffect(() => {
    const refresh = () => {
      const nextActive = isDesktopProductRoute();
      setActive(nextActive);
      setShowBackToTop(nextActive && window.scrollY > 600);
    };

    const handleScroll = () => {
      const nextActive = isDesktopProductRoute();
      if (nextActive !== active) setActive(nextActive);
      setShowBackToTop(nextActive && window.scrollY > 600);
    };

    window.addEventListener(LOCATION_CHANGE_EVENT, refresh);
    window.addEventListener("popstate", refresh);
    window.addEventListener("resize", refresh);
    window.addEventListener("scroll", handleScroll, { passive: true });
    refresh();

    return () => {
      window.removeEventListener(LOCATION_CHANGE_EVENT, refresh);
      window.removeEventListener("popstate", refresh);
      window.removeEventListener("resize", refresh);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [active]);

  if (!active || !showBackToTop) return null;

  const lang = document.documentElement.lang === "en" ? "en" : "sr";

  return (
    <button
      type="button"
      className="back-to-top"
      onClick={smoothScrollToTop}
      aria-label={
        lang === "sr"
          ? "Povratak na vrh stranice"
          : "Back to top"
      }
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 19V5M6.5 10.5 12 5l5.5 5.5" />
      </svg>
    </button>
  );
}
