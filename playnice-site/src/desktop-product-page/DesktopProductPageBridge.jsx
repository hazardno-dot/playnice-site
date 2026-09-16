import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { products } from "../data/products";
import { LOCATION_CHANGE_EVENT } from "../lib/locationEvents";
import {
  getProductActions,
  subscribeProductActions,
} from "../lib/productActionsGateway";
import DesktopProductPage from "./DesktopProductPage";
import "./DesktopProductPageBridge.css";

const PRODUCT_ROUTE = /^\/product\/([^/]+)\/?$/;

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

  const documentLang = document.documentElement.lang;
  if (documentLang === "en" || documentLang === "sr") return documentLang;

  try {
    const saved = window.localStorage.getItem("playnice_lang");
    return saved === "en" ? "en" : "sr";
  } catch {
    return "sr";
  }
};

const getNoteKeys = (noteMap) => {
  if (!noteMap || typeof noteMap !== "object") return [];

  return Array.from(
    new Set(
      Object.values(noteMap)
        .flatMap((value) => (Array.isArray(value) ? value : []))
        .filter((value) => typeof value === "string" && value.trim())
        .map((value) => value.trim())
    )
  );
};

const preloadProductNoteMap = (product) => {
  if (!product?.noteMap) return;

  import("../TheNoteMapImpl").catch(() => {});

  getNoteKeys(product.noteMap).forEach((noteKey) => {
    const image = new Image();
    image.decoding = "async";
    image.src = `/note-map/${noteKey}.webp`;
  });
};

const getGatewayWishlistState = (productId) => {
  const actions = getProductActions();
  if (typeof actions?.isWishlisted !== "function") return false;
  return Boolean(actions.isWishlisted(productId));
};

const closeLegacyProductModalAfterNavigation = () => {
  window.setTimeout(() => {
    if (window.location.pathname.startsWith("/product/")) return;

    const legacyCloseButton = document.querySelector(
      '.product-modal .close-button[aria-label="Zatvori prozor"], .product-modal .close-button[aria-label="Close modal"], .product-modal .close-button'
    );

    legacyCloseButton?.click();
  }, 0);
};

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

    window.addEventListener("popstate", refreshRoute);
    window.addEventListener(LOCATION_CHANGE_EVENT, refreshRoute);
    refreshRoute();

    return () => {
      window.removeEventListener("popstate", refreshRoute);
      window.removeEventListener(LOCATION_CHANGE_EVENT, refreshRoute);
    };
  }, []);

  useEffect(() => {
    const main = document.querySelector("main");
    setPortalTarget(main || null);
  }, [active]);

  useEffect(() => {
    const syncLanguage = () => setLang(getDesktopLanguage());
    const htmlObserver = new MutationObserver(syncLanguage);
    const headerObserver = new MutationObserver(syncLanguage);

    htmlObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["lang"],
    });

    const observeHeaderLanguage = () => {
      const languageButton = document.querySelector(".header-next-language");
      if (!languageButton) return false;

      headerObserver.observe(languageButton, {
        subtree: true,
        childList: true,
        characterData: true,
      });
      return true;
    };

    let retryTimer = null;
    if (!observeHeaderLanguage()) {
      retryTimer = window.setTimeout(() => {
        observeHeaderLanguage();
        syncLanguage();
      }, 120);
    }

    window.addEventListener("focus", syncLanguage);
    syncLanguage();

    return () => {
      htmlObserver.disconnect();
      headerObserver.disconnect();
      if (retryTimer) window.clearTimeout(retryTimer);
      window.removeEventListener("focus", syncLanguage);
    };
  }, [active]);

  useEffect(() => {
    if (!active || !product) return;
    preloadProductNoteMap(product);
  }, [active, product?.slug]);

  useEffect(() => {
    if (!active) {
      document.body.classList.remove("desktop-product-route-active");
      return undefined;
    }

    document.body.classList.add("desktop-product-route-active");

    return () => {
      document.body.classList.remove("desktop-product-route-active");
    };
  }, [active]);

  useEffect(() => {
    if (!active || !product) return undefined;

    const firstSize = Object.keys(product.sizes || {})[0] || "";
    setSelectedSize(firstSize);

    const syncWishlist = () => {
      setIsWishlisted(getGatewayWishlistState(product.id));
    };

    const frame = window.requestAnimationFrame(syncWishlist);
    const delayedSync = window.setTimeout(syncWishlist, 140);
    const unsubscribe = subscribeProductActions(syncWishlist);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(delayedSync);
      unsubscribe();
    };
  }, [active, product?.id, product?.slug]);

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
      const navigationTarget = event.target.closest?.(
        ".header-next-brand, .header-next-link"
      );

      if (!navigationTarget) return;

      document.body.classList.add("desktop-product-route-leaving");

      const state = window.history.state || {};
      if (state.playniceProductModal) {
        const nextState = { ...state };
        delete nextState.playniceProductModal;
        window.history.replaceState(nextState, "", window.location.href);
      }

      closeLegacyProductModalAfterNavigation();

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

  const selectedProduct = useMemo(() => product, [product]);

  if (!active || !selectedProduct || !portalTarget) return null;

  const handleSelectSize = (size) => {
    setSelectedSize(size);

    const actions = getProductActions();
    actions?.selectSize?.(selectedProduct, size);
  };

  const handleAddToCart = (size) => {
    const actions = getProductActions();
    actions?.addToCart?.(selectedProduct, size);
  };

  const handleBuyNow = (size) => {
    const actions = getProductActions();
    actions?.buyNow?.(selectedProduct, size);
  };

  const handleToggleWishlist = () => {
    const actions = getProductActions();
    actions?.toggleWishlist?.(selectedProduct.id);

    window.requestAnimationFrame(() => {
      setIsWishlisted(getGatewayWishlistState(selectedProduct.id));
    });
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
