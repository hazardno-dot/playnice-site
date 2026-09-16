import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { products } from "../data/products";
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
    window.addEventListener("popstate", refreshRoute);
    window.addEventListener("playnice:product-route", refreshRoute);
    return () => {
      window.removeEventListener("popstate", refreshRoute);
      window.removeEventListener("playnice:product-route", refreshRoute);
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

    return () => {
      window.cancelAnimationFrame(frame);
      document.body.classList.remove("desktop-product-route-active");
    };
  }, [active, product?.slug]);

  useEffect(() => {
    if (!active) return undefined;

    const modal = document.querySelector(".product-modal");
    if (!modal) return undefined;

    const observer = new MutationObserver(() => {
      setIsWishlisted(getUnderlyingWishlistState());
    });

    observer.observe(modal, {
      subtree: true,
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
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

    setProduct(nextProduct);
    window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
    window.dispatchEvent(new Event("playnice:product-route"));
  };

  return createPortal(
    <div className="desktop-product-route-host">
      <DesktopProductPage
        product={selectedProduct}
        lang={lang}
        selectedSize={selectedSize}
        onSelectSize={handleSelectSize}
        onAddToCart={handleAddToCart}
        isWishlisted={isWishlisted}
        onToggleWishlist={handleToggleWishlist}
        onOpenProduct={handleOpenProduct}
        onBackToShop={handleBackToShop}
      />
    </div>,
    portalTarget
  );
}
