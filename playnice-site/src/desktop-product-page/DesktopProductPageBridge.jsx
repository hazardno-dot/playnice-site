import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { products } from "../data/products";
import DesktopProductPage from "./DesktopProductPage";
import "./DesktopProductPageBridge.css";

const PRODUCT_ROUTE = /^\/product\/([^/]+)\/?$/;
const ROUTE_EVENT = "playnice:product-route";

const getProductFromPath = () => {
  const match = window.location.pathname.match(PRODUCT_ROUTE);
  if (!match?.[1]) return null;

  const slug = decodeURIComponent(match[1]);
  return products.find((product) => String(product.slug || "") === slug) || null;
};

const getDesktopLanguage = () => {
  const documentLang = document.documentElement.lang;
  if (documentLang === "en" || documentLang === "sr") return documentLang;

  try {
    const saved = window.localStorage.getItem("playnice_lang");
    return saved === "en" ? "en" : "sr";
  } catch {
    return "sr";
  }
};

const getModalSizeButton = (size) =>
  Array.from(document.querySelectorAll(".product-modal .modal-size")).find((button) => {
    const label = button.querySelector("span")?.textContent?.trim();
    return label === size;
  });

const syncUnderlyingSize = (size) => {
  if (!size) return;
  const button = getModalSizeButton(size);
  if (button && !button.classList.contains("active")) button.click();
};

const getUnderlyingWishlistState = () =>
  Boolean(document.querySelector(".product-modal .modal-wishlist-btn.active"));

export default function DesktopProductPageBridge() {
  const [product, setProduct] = useState(() => getProductFromPath());
  const [lang, setLang] = useState(() => getDesktopLanguage());
  const [selectedSize, setSelectedSize] = useState("");
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [portalTarget, setPortalTarget] = useState(null);
  const [isDesktop, setIsDesktop] = useState(() =>
    window.matchMedia("(min-width: 769px)").matches
  );

  const active = Boolean(isDesktop && product);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 769px)");
    const handleMedia = () => setIsDesktop(media.matches);
    media.addEventListener?.("change", handleMedia);
    return () => media.removeEventListener?.("change", handleMedia);
  }, []);

  useEffect(() => {
    const refreshRoute = () => setProduct(getProductFromPath());
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    const emitRouteChange = () => window.dispatchEvent(new Event(ROUTE_EVENT));

    window.history.pushState = function patchedPushState(...args) {
      const result = originalPushState.apply(this, args);
      emitRouteChange();
      return result;
    };

    window.history.replaceState = function patchedReplaceState(...args) {
      const result = originalReplaceState.apply(this, args);
      emitRouteChange();
      return result;
    };

    window.addEventListener("popstate", refreshRoute);
    window.addEventListener(ROUTE_EVENT, refreshRoute);
    refreshRoute();

    return () => {
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
      window.removeEventListener("popstate", refreshRoute);
      window.removeEventListener(ROUTE_EVENT, refreshRoute);
    };
  }, []);

  useEffect(() => {
    const main = document.querySelector("main");
    setPortalTarget(main || null);
  }, [active]);

  useEffect(() => {
    const observer = new MutationObserver(() => setLang(getDesktopLanguage()));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["lang"],
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!active) {
      document.body.classList.remove("desktop-product-route-active");
      return undefined;
    }

    document.body.classList.add("desktop-product-route-active");

    const firstSize = Object.keys(product?.sizes || {})[0] || "";
    setSelectedSize(firstSize);

    const frame = window.requestAnimationFrame(() => {
      setIsWishlisted(getUnderlyingWishlistState());
      syncUnderlyingSize(firstSize);
    });

    const delayedSync = window.setTimeout(() => {
      setIsWishlisted(getUnderlyingWishlistState());
      syncUnderlyingSize(firstSize);
    }, 140);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(delayedSync);
      document.body.classList.remove("desktop-product-route-active");
    };
  }, [active, product?.slug]);

  useEffect(() => {
    if (!active) return undefined;

    const observeModal = () => {
      const modal = document.querySelector(".product-modal");
      if (!modal) return null;

      const observer = new MutationObserver(() => {
        setIsWishlisted(getUnderlyingWishlistState());
      });

      observer.observe(modal, {
        subtree: true,
        attributes: true,
        attributeFilter: ["class"],
      });

      return observer;
    };

    let observer = observeModal();
    const timer = observer
      ? null
      : window.setTimeout(() => {
          observer = observeModal();
        }, 150);

    return () => {
      if (timer) window.clearTimeout(timer);
      observer?.disconnect();
    };
  }, [active, product?.slug]);

  useEffect(() => {
    if (!active) return undefined;

    let observer;
    const frame = window.requestAnimationFrame(() => {
      const sections = Array.from(
        document.querySelectorAll(
          ".desktop-product-page__intelligence, .desktop-product-page__context-grid, .desktop-product-page__recommendations"
        )
      );

      if (typeof IntersectionObserver === "undefined") {
        sections.forEach((section) => section.classList.add("is-in-view"));
        return;
      }

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-in-view");
            observer?.unobserve(entry.target);
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
      );

      sections.forEach((section) => observer.observe(section));
    });

    return () => {
      window.cancelAnimationFrame(frame);
      observer?.disconnect();
    };
  }, [active, product?.slug]);

  useEffect(() => {
    if (!active) return undefined;

    const handleHeaderNavigationCapture = (event) => {
      const navTarget = event.target.closest?.(
        ".header-next-brand, .header-next-link"
      );
      if (!navTarget) return;

      document.body.classList.add("desktop-product-route-leaving");

      const state = window.history.state || {};
      if (state.playniceProductModal) {
        const nextState = { ...state };
        delete nextState.playniceProductModal;
        window.history.replaceState(nextState, "", window.location.href);
      }

      const legacyCloseButton = document.querySelector(
        '.product-modal .close-button[aria-label="Zatvori prozor"], .product-modal .close-button[aria-label="Close modal"], .product-modal .close-button'
      );
      legacyCloseButton?.click();

      window.setTimeout(() => {
        document.body.classList.remove("desktop-product-route-leaving");
      }, 700);
    };

    document.addEventListener("click", handleHeaderNavigationCapture, true);
    return () => {
      document.removeEventListener("click", handleHeaderNavigationCapture, true);
      document.body.classList.remove("desktop-product-route-leaving");
    };
  }, [active]);

  useEffect(() => {
    if (!active) return undefined;

    const handleNoteMapClick = (event) => {
      const stage = event.target.closest?.(".desktop-product-page__note-map-stage");
      if (!stage) return;
      if (event.target.closest?.(".the-note-map__trigger")) return;

      document.querySelector(".desktop-product-page__note-map-trigger")?.click();
    };

    document.addEventListener("click", handleNoteMapClick);
    return () => document.removeEventListener("click", handleNoteMapClick);
  }, [active, product?.slug]);

  const selectedProduct = useMemo(() => product, [product]);

  if (!active || !selectedProduct || !portalTarget) return null;

  const handleSelectSize = (size) => {
    setSelectedSize(size);
    syncUnderlyingSize(size);
  };

  const handleAddToCart = (size) => {
    syncUnderlyingSize(size);
    window.requestAnimationFrame(() => {
      document.querySelector(".product-modal .modal-add-button")?.click();
    });
  };

  const handleBuyNow = (size) => {
    syncUnderlyingSize(size);
    window.requestAnimationFrame(() => {
      const button = document.querySelector(".product-modal .modal-buy-now");
      if (button) {
        button.click();
        return;
      }
      document.querySelector(".product-modal .modal-add-button")?.click();
    });
  };

  const handleToggleWishlist = () => {
    const button = document.querySelector(".product-modal .modal-wishlist-btn");
    if (!button) return;
    button.click();
    window.requestAnimationFrame(() => setIsWishlisted(getUnderlyingWishlistState()));
  };

  const handleBackToShop = () => {
    if (window.history.state?.playniceProductModal) {
      window.history.back();
      return;
    }

    window.history.pushState({}, "", "/shop");
    window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
  };

  const handleOpenProduct = (nextProduct) => {
    if (!nextProduct?.slug) return;

    const nextUrl = `/product/${nextProduct.slug}`;
    window.history.pushState(
      {
        ...(window.history.state || {}),
        playniceProductModal: true,
        productSlug: nextProduct.slug,
        productOriginView: "shop",
      },
      "",
      nextUrl
    );

    window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
  };

  const stickyPrice = Number(selectedProduct.sizes?.[selectedSize] || 0);

  const handleStickyClick = () => {
    document
      .querySelector(".desktop-product-page__purchase-column")
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return createPortal(
    <div className="desktop-product-route-host">
      <DesktopProductPage
        product={selectedProduct}
        lang={lang}
        selectedSize={selectedSize}
        onSelectSize={handleSelectSize}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
        isWishlisted={isWishlisted}
        onToggleWishlist={handleToggleWishlist}
        onOpenProduct={handleOpenProduct}
        onBackToShop={handleBackToShop}
      />

      <div className="desktop-product-pdp-sticky" aria-live="polite">
        <div className="sticky-cta-button">
          <button type="button" className="sticky-cta-main" onClick={handleStickyClick}>
            <span className="sticky-cta-copy">
              <strong>{lang === "sr" ? "Probaj pre cele bočice" : "Try before the full bottle"}</strong>
              <small>{selectedProduct.shortName || selectedProduct.modalName || selectedProduct.name} · {selectedSize || ""}</small>
            </span>
            <span className="desktop-product-pdp-sticky__price">€{stickyPrice.toFixed(2)}</span>
          </button>
        </div>
      </div>
    </div>,
    portalTarget
  );
}
