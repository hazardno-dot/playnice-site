import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { products } from "../data/products";
import { productCopy } from "../data/products/productCopy";
import { getProductActions } from "../lib/productActionsGateway";
import "./DesktopQuickView.css";

export const DESKTOP_QUICK_VIEW_EVENT = "playnice:desktop-quick-view";

const getLanguage = () => {
  const headerLanguage = document
    .querySelector(".header-next-language span")
    ?.textContent?.trim()
    ?.toLowerCase();

  if (headerLanguage === "en" || headerLanguage === "sr") return headerLanguage;
  return document.documentElement.lang === "en" ? "en" : "sr";
};

const getDiscountedPrice = (price, percent) =>
  Number((Number(price) * (1 - Number(percent) / 100)).toFixed(2));

const getDiscount = (product, size) =>
  product?.discount?.size === size ? product.discount : null;

const getCategoryLabel = (category, lang) => {
  const labels = {
    Designer: { sr: "DIZAJNERSKI", en: "DESIGNER" },
    Niche: { sr: "NICHE", en: "NICHE" },
    Arabian: { sr: "ARAPSKI", en: "ARABIAN" },
  };

  return labels?.[category]?.[lang] || String(category || "").toUpperCase();
};

const getMiniTag = (copy, lang) => {
  if (typeof copy?.miniTag === "string") return copy.miniTag;
  return copy?.miniTag?.[lang] || copy?.miniTag?.en || copy?.miniTag?.sr || "";
};

const getMiniTagImage = (product) => {
  const noteKey =
    product?.noteMap?.top?.[0] ||
    product?.noteMap?.heart?.[0] ||
    product?.noteMap?.base?.[0] ||
    "";

  return noteKey ? `/note-map/${noteKey}.webp` : "";
};

const getRatingStarCount = (rating) => {
  const normalizedRating = Math.max(0, Math.min(10, Number(rating) || 0));
  return Math.round(normalizedRating);
};

const getSizeHelper = (size, lang) => {
  const normalized = String(size || "").toLowerCase();

  if (normalized.includes("2ml")) {
    return lang === "sr" ? "Brzi test na koži." : "Quick skin test.";
  }

  if (normalized.includes("5ml")) {
    return lang === "sr" ? "Testiraj nekoliko dana." : "Test it over a few days.";
  }

  if (normalized.includes("10ml")) {
    return lang === "sr" ? "Savršen za svakodnevno nošenje." : "Perfect for daily wear.";
  }

  if (normalized.includes("20ml")) {
    return lang === "sr" ? "Skoro kao mala bočica." : "Almost like a small bottle.";
  }

  return lang === "sr" ? "Probaj. Nosi. Odluči." : "Try it. Wear it. Decide.";
};

export default function DesktopQuickView() {
  const [product, setProduct] = useState(null);
  const [lang, setLang] = useState(() => getLanguage());
  const [selectedSize, setSelectedSize] = useState("");
  const [source, setSource] = useState("");
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    const openQuickView = (event) => {
      if (!window.matchMedia("(min-width: 769px)").matches) return;

      const productId = event?.detail?.productId;
      const nextProduct = products.find(
        (item) => String(item.id) === String(productId)
      );

      if (!nextProduct) return;

      const firstSize = Object.keys(nextProduct.sizes || {})[0] || "";
      setProduct(nextProduct);
      setSelectedSize(firstSize);
      setSource(event?.detail?.source || "");
      setLang(getLanguage());
      setIsAdded(false);

      const actions = getProductActions();
      setIsWishlisted(Boolean(actions?.isWishlisted?.(nextProduct.id)));
    };

    window.addEventListener(DESKTOP_QUICK_VIEW_EVENT, openQuickView);
    return () => window.removeEventListener(DESKTOP_QUICK_VIEW_EVENT, openQuickView);
  }, []);

  useEffect(() => {
    if (!product) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event) => {
      if (event.key === "Escape") setProduct(null);
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [product]);

  const copy = useMemo(
    () => (product ? productCopy[product.name] || {} : {}),
    [product]
  );

  if (!product) return null;

  const sizes = Object.entries(product.sizes || {});
  const activeSize = selectedSize || sizes[0]?.[0] || "";
  const basePrice = Number(product.sizes?.[activeSize] || 0);
  const discount = getDiscount(product, activeSize);
  const finalPrice = discount
    ? getDiscountedPrice(basePrice, discount.percent)
    : basePrice;

  const shortCopy = copy.card?.[lang] || copy.modal?.[lang] || "";
  const scentType = copy.scentType?.[lang] || "";
  const miniTag = getMiniTag(copy, lang);
  const miniTagImage = getMiniTagImage(product);
  const ratingStars = getRatingStarCount(product.rating);
  const sizeHelper = getSizeHelper(activeSize, lang);

  const close = () => setProduct(null);

  const selectSize = (size) => {
    setSelectedSize(size);
    getProductActions()?.selectSize?.(product, size);
  };

  const addToCart = () => {
    getProductActions()?.addToCart?.(product, activeSize);
    setIsAdded(true);
    window.setTimeout(() => setIsAdded(false), 1200);
  };

  const toggleWishlist = () => {
    const actions = getProductActions();
    actions?.toggleWishlist?.(product.id);

    window.requestAnimationFrame(() => {
      setIsWishlisted(Boolean(getProductActions()?.isWishlisted?.(product.id)));
    });
  };

  const openFullProduct = () => {
    const nextUrl = `/product/${product.slug}`;
    const originView = window.location.pathname.startsWith("/shop") ? "shop" : "home";

    window.dispatchEvent(
      new CustomEvent("playnice:desktop-quick-view-full-product", {
        detail: {
          productId: product.id,
          source,
        }
      })
    );

    close();

    const nextState = {
      ...(window.history.state || {}),
      productSlug: product.slug,
      productOriginView: originView,
    };

    if (source === "discovery") {
      nextState.playniceDiscoveryOpen = false;
      nextState.productOriginSurface = "discovery";
    } else {
      delete nextState.playniceDiscoveryOpen;
      delete nextState.productOriginSurface;
    }

    window.history.pushState(
      nextState,
      "",
      nextUrl
    );

    window.dispatchEvent(
      new PopStateEvent("popstate", { state: window.history.state })
    );
  };

  return createPortal(
    <div className="desktop-quick-view-layer" role="presentation">
      <button
        type="button"
        className="desktop-quick-view-backdrop"
        aria-label={lang === "sr" ? "Zatvori brzi pregled" : "Close quick view"}
        onClick={close}
      />

      <section
        className="desktop-quick-view"
        role="dialog"
        aria-modal="true"
        aria-labelledby="desktop-quick-view-title"
      >
        <button
          type="button"
          className="desktop-quick-view__close"
          onClick={close}
          aria-label={lang === "sr" ? "Zatvori" : "Close"}
        >
          ×
        </button>

        <div className="desktop-quick-view__media">
          <div className="desktop-quick-view__image-stage">
            {product.image ? (
              <img src={product.image} alt={product.name} />
            ) : (
              <span>{product.name.charAt(0)}</span>
            )}
          </div>
        </div>

        <div className="desktop-quick-view__content">
          <div className="desktop-quick-view__eyebrow">
            <span>{getCategoryLabel(product.category, lang)}</span>
            {scentType ? <span>{scentType}</span> : null}
          </div>

          <div className="desktop-quick-view__title-row">
            <h2 id="desktop-quick-view-title">
              {product.modalName || product.name}
            </h2>

            <button
              type="button"
              className={`desktop-quick-view__wishlist ${isWishlisted ? "is-active" : ""}`}
              onClick={toggleWishlist}
              aria-label={
                isWishlisted
                  ? lang === "sr"
                    ? "Ukloni iz Private Selection"
                    : "Remove from Private Selection"
                  : lang === "sr"
                    ? "Dodaj u Private Selection"
                    : "Add to Private Selection"
              }
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  className={isWishlisted ? "is-filled" : "is-outline"}
                  d="M20.8 5.9c-1.8-2.1-5.1-2.2-7-.3L12 7.4l-1.8-1.8c-1.9-1.9-5.2-1.8-7 .3-1.7 2-1.4 5 .5 6.9L12 21l8.3-8.2c1.9-1.9 2.2-4.9.5-6.9Z"
                />
              </svg>
            </button>
          </div>

          {product.rating ? (
            <div className="desktop-quick-view__rating">
              <span className="desktop-quick-view__rating-stars" aria-hidden="true">
                <span className="is-filled">{"★".repeat(ratingStars)}</span>
                <span className="is-empty">{"★".repeat(10 - ratingStars)}</span>
              </span>
              <span className="desktop-quick-view__rating-score">
                <strong>{Number(product.rating).toFixed(1)}</strong>
                <small>/ 10{product.ratingLabel ? ` · ${product.ratingLabel}` : ""}</small>
              </span>
            </div>
          ) : null}

          {shortCopy ? (
            <p className="desktop-quick-view__description">{shortCopy}</p>
          ) : null}

          {miniTag ? (
            <div className="desktop-quick-view__mini-tag">
              {miniTagImage ? (
                <span className="desktop-quick-view__mini-tag-image" aria-hidden="true">
                  <img src={miniTagImage} alt="" />
                </span>
              ) : null}
              <span>{miniTag}</span>
            </div>
          ) : null}

          <div className="desktop-quick-view__purchase-head">
            <div>
              <span>{lang === "sr" ? "IZABERI VELIČINU" : "CHOOSE SIZE"}</span>
              <small>{sizeHelper}</small>
            </div>
            <div className="desktop-quick-view__price">
              {discount ? <del>€{basePrice.toFixed(2)}</del> : null}
              <strong>€{finalPrice.toFixed(2)}</strong>
            </div>
          </div>

          <div className="desktop-quick-view__sizes">
            {sizes.map(([size, price]) => {
              const sizeDiscount = getDiscount(product, size);
              const sizePrice = sizeDiscount
                ? getDiscountedPrice(price, sizeDiscount.percent)
                : Number(price);

              return (
                <button
                  key={size}
                  type="button"
                  className={size === activeSize ? "is-active" : ""}
                  onClick={() => selectSize(size)}
                >
                  <span className="desktop-quick-view__size-label">{size}</span>
                  <span className="desktop-quick-view__size-price-wrap">
                    <strong>€{sizePrice.toFixed(2)}</strong>
                    {sizeDiscount ? <small>-{sizeDiscount.percent}%</small> : null}
                  </span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            className={`desktop-quick-view__add ${isAdded ? "is-added" : ""}`}
            onClick={addToCart}
          >
            {isAdded
              ? lang === "sr"
                ? "DODATO ✓"
                : "ADDED ✓"
              : lang === "sr"
                ? "DODAJ U KORPU"
                : "ADD TO CART"}
          </button>

          <button
            type="button"
            className="desktop-quick-view__full-link"
            onClick={openFullProduct}
          >
            {lang === "sr" ? "POGLEDAJ CELU STRANICU PROIZVODA →" : "VIEW FULL PRODUCT PAGE →"}
          </button>
        </div>
      </section>
    </div>,
    document.body
  );
}
