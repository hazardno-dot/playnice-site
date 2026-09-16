import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { LOCATION_CHANGE_EVENT } from "../lib/locationEvents";
import { products } from "../data/products";
import { productCopy } from "../data/products/productCopy";
import "./DesktopProductPageNavigationPolish.css";

const PRODUCT_ROUTE = /^\/product\/([^/]+)\/?$/;
const RECOMMENDATIONS_PER_PAGE = 5;

const isDesktopProductRoute = () =>
  window.matchMedia("(min-width: 769px)").matches &&
  PRODUCT_ROUTE.test(window.location.pathname);

const getProductFromPath = () => {
  const match = window.location.pathname.match(PRODUCT_ROUTE);
  if (!match?.[1]) return null;

  const slug = decodeURIComponent(match[1]);
  return products.find((product) => String(product.slug || "") === slug) || null;
};

const getDesktopLanguage = () => {
  const headerLanguage = document
    .querySelector(".header-next-language span")
    ?.textContent?.trim()
    ?.toLowerCase();

  if (headerLanguage === "en" || headerLanguage === "sr") return headerLanguage;
  return document.documentElement.lang === "en" ? "en" : "sr";
};

const getRecommendations = (product) => {
  if (!product) return [];

  const seen = new Set([product.slug]);
  const result = [];

  const add = (candidate) => {
    if (!candidate?.slug || seen.has(candidate.slug)) return;
    seen.add(candidate.slug);
    result.push(candidate);
  };

  (product.recommendations || [])
    .map((slug) => products.find((item) => item.slug === slug))
    .filter(Boolean)
    .forEach(add);

  products
    .filter((item) => item.category === product.category)
    .sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0))
    .forEach(add);

  products
    .filter((item) => item.season === product.season)
    .sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0))
    .forEach(add);

  products
    .filter((item) => {
      const itemMoods = Array.isArray(item.moods) ? item.moods : [];
      const productMoods = Array.isArray(product.moods) ? product.moods : [];
      return itemMoods.some((mood) => productMoods.includes(mood));
    })
    .sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0))
    .forEach(add);

  return result.slice(0, 10);
};

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

const openProduct = (product) => {
  if (!product?.slug) return;

  const nextState = {
    ...(window.history.state || {}),
    playniceProductModal: true,
    productSlug: product.slug,
    productOriginView: "shop",
  };

  window.history.pushState(nextState, "", `/product/${product.slug}`);
  window.dispatchEvent(new PopStateEvent("popstate", { state: nextState }));
};

export default function DesktopProductPageNavigationPolish() {
  const [active, setActive] = useState(() => isDesktopProductRoute());
  const [showBackToTop, setShowBackToTop] = useState(
    () => isDesktopProductRoute() && window.scrollY > 600
  );
  const [product, setProduct] = useState(() => getProductFromPath());
  const [lang, setLang] = useState(() => getDesktopLanguage());
  const [recommendationPage, setRecommendationPage] = useState(0);
  const [recommendationTarget, setRecommendationTarget] = useState(null);

  const recommendations = useMemo(() => getRecommendations(product), [product]);
  const pageCount = Math.max(1, Math.ceil(recommendations.length / RECOMMENDATIONS_PER_PAGE));
  const visibleRecommendations = recommendations.slice(
    recommendationPage * RECOMMENDATIONS_PER_PAGE,
    recommendationPage * RECOMMENDATIONS_PER_PAGE + RECOMMENDATIONS_PER_PAGE
  );

  useEffect(() => {
    const refresh = () => {
      const nextActive = isDesktopProductRoute();
      setActive(nextActive);
      setShowBackToTop(nextActive && window.scrollY > 600);
      setProduct(getProductFromPath());
      setLang(getDesktopLanguage());
    };

    const handleScroll = () => {
      const nextActive = isDesktopProductRoute();
      if (nextActive !== active) setActive(nextActive);
      setShowBackToTop(nextActive && window.scrollY > 600);
    };

    const htmlObserver = new MutationObserver(() => setLang(getDesktopLanguage()));
    htmlObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["lang"],
    });

    window.addEventListener(LOCATION_CHANGE_EVENT, refresh);
    window.addEventListener("popstate", refresh);
    window.addEventListener("resize", refresh);
    window.addEventListener("scroll", handleScroll, { passive: true });
    refresh();

    return () => {
      htmlObserver.disconnect();
      window.removeEventListener(LOCATION_CHANGE_EVENT, refresh);
      window.removeEventListener("popstate", refresh);
      window.removeEventListener("resize", refresh);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [active]);

  useEffect(() => {
    setRecommendationPage(0);

    if (!active) {
      setRecommendationTarget(null);
      return undefined;
    }

    const findTarget = () => {
      const target = document.querySelector(".desktop-product-page__recommendations");
      if (target) setRecommendationTarget(target);
      return Boolean(target);
    };

    if (findTarget()) return undefined;

    const observer = new MutationObserver(() => {
      if (findTarget()) observer.disconnect();
    });

    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [active, product?.slug]);

  const carousel =
    active && recommendationTarget && recommendations.length
      ? createPortal(
          <div className="desktop-same-energy-carousel">
            <div className="desktop-same-energy-carousel__toolbar">
              <span>
                {recommendationPage + 1} / {pageCount}
              </span>
              <div>
                <button
                  type="button"
                  aria-label={lang === "sr" ? "Prethodni parfemi" : "Previous fragrances"}
                  onClick={() =>
                    setRecommendationPage((page) =>
                      page <= 0 ? pageCount - 1 : page - 1
                    )
                  }
                >
                  ←
                </button>
                <button
                  type="button"
                  aria-label={lang === "sr" ? "Sledeći parfemi" : "Next fragrances"}
                  onClick={() =>
                    setRecommendationPage((page) =>
                      page >= pageCount - 1 ? 0 : page + 1
                    )
                  }
                >
                  →
                </button>
              </div>
            </div>

            <div
              key={`${product?.slug || "product"}-${recommendationPage}`}
              className="desktop-same-energy-carousel__grid"
            >
              {visibleRecommendations.map((recommendation) => {
                const prices = Object.values(recommendation.sizes || {}).filter(Number.isFinite);
                const minPrice = prices.length ? Math.min(...prices) : null;
                const recommendationCopy = productCopy[recommendation.name] || {};
                const descriptor =
                  recommendationCopy.miniTag?.[lang] ||
                  recommendationCopy.scentType?.[lang] ||
                  recommendation.category ||
                  "";

                return (
                  <button
                    key={recommendation.slug}
                    type="button"
                    className="desktop-same-energy-carousel__card"
                    onClick={() => openProduct(recommendation)}
                  >
                    <span className="desktop-same-energy-carousel__image">
                      {recommendation.image ? (
                        <img
                          src={recommendation.image}
                          alt=""
                          loading="lazy"
                          decoding="async"
                        />
                      ) : null}
                    </span>
                    <strong>{recommendation.shortName || recommendation.modalName || recommendation.name}</strong>
                    <small>{descriptor}</small>
                    {Number.isFinite(minPrice) ? (
                      <em>{lang === "sr" ? "od" : "from"} €{Number(minPrice).toFixed(2)}</em>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>,
          recommendationTarget
        )
      : null;

  const backToTop =
    active && showBackToTop ? (
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
    ) : null;

  return (
    <>
      {carousel}
      {backToTop}
    </>
  );
}
