import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import TheNoteMap from "../TheNoteMap";
import { products } from "../data/products";
import { productCopy } from "../data/products/productCopy";
import { productWearContext } from "../data/products/productWearContext";
import { productDoNotWearContext } from "../data/products/productDoNotWearContext";
import { productWhatToWearContext } from "../data/products/productWhatToWearContext";
import DesktopProductModalParity from "./DesktopProductModalParity";
import "./DesktopProductPage.css";

const PROFILE_KEYS = [
  "freshness",
  "sweetness",
  "warmth",
  "darkness",
  "airiness",
  "cleanliness",
  "creaminess",
  "dryness",
  "fruitiness",
  "spiciness",
  "woodiness",
  "aromaticity",
  "florality",
  "gourmandness",
  "citrus",
  "aquatic",
  "powdery",
];

const PROFILE_LABELS = {
  freshness: { sr: "Svežina", en: "Freshness" },
  sweetness: { sr: "Slatkoća", en: "Sweetness" },
  warmth: { sr: "Toplina", en: "Warmth" },
  darkness: { sr: "Tamniji karakter", en: "Darkness" },
  airiness: { sr: "Prozračnost", en: "Airiness" },
  cleanliness: { sr: "Čistoća", en: "Cleanliness" },
  creaminess: { sr: "Kremastost", en: "Creaminess" },
  dryness: { sr: "Suvi karakter", en: "Dryness" },
  fruitiness: { sr: "Voćni karakter", en: "Fruitiness" },
  spiciness: { sr: "Začinske note", en: "Spiciness" },
  woodiness: { sr: "Drvenasti karakter", en: "Woodiness" },
  aromaticity: { sr: "Aromatičnost", en: "Aromatic" },
  florality: { sr: "Cvetni karakter", en: "Floral" },
  gourmandness: { sr: "Gurmanski karakter", en: "Gourmand" },
  citrus: { sr: "Citrusni karakter", en: "Citrus" },
  aquatic: { sr: "Vodeni karakter", en: "Aquatic" },
  powdery: { sr: "Puderasti karakter", en: "Powdery" },
};

const getProductType = (name = "") => {
  const match = String(name).match(
    /(Extrait de Parfum|Eau de Parfum|Eau de Toilette|Parfum|Cologne)$/i
  );
  return match?.[1] || "";
};

const getDiscountedPrice = (price, percent) =>
  Number((Number(price) * (1 - Number(percent) / 100)).toFixed(2));

const getProductDiscountForSize = (product, size) => {
  if (!product?.discount) return null;
  return product.discount.size === size ? product.discount : null;
};

const getRatingStarCount = (rating) => {
  const normalizedRating = Math.max(0, Math.min(10, Number(rating) || 0));
  return Math.round(normalizedRating);
};

const getSizeHelper = (size, lang) => {
  const normalized = String(size || "").toLowerCase();

  if (!normalized) {
    return lang === "sr"
      ? "Kreni manjom količinom. Nosi ga prvo."
      : "Start small. Wear it first.";
  }

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

  return result.slice(0, 4);
};

export default function DesktopProductPage({
  product,
  lang = "sr",
  selectedSize,
  onSelectSize,
  onAddToCart,
  onBuyNow,
  isWishlisted = false,
  onToggleWishlist,
  onOpenProduct,
  onFindSimilar,
  onBackToShop,
}) {
  const [noteMapOpen, setNoteMapOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [addedCartKey, setAddedCartKey] = useState("");
  const addedCartTimeoutRef = useRef(null);
  const previousProductSlugRef = useRef(null);

  useLayoutEffect(() => {
    if (!product?.slug) return;

    const previousSlug = previousProductSlugRef.current;
    const isProductToProductNavigation =
      Boolean(previousSlug) && previousSlug !== product.slug;

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: isProductToProductNavigation ? "smooth" : "auto",
    });

    previousProductSlugRef.current = product.slug;
  }, [product?.slug]);

  useEffect(() => {
    return () => {
      if (addedCartTimeoutRef.current) {
        window.clearTimeout(addedCartTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setProfile(null);
    setNoteMapOpen(false);

    if (!product?.slug) return undefined;

    import("../data/products/discoveryProfiles").then(({ discoveryProfiles }) => {
      if (!cancelled) setProfile(discoveryProfiles?.[product.slug] || null);
    });

    return () => {
      cancelled = true;
    };
  }, [product?.slug]);

  const copy = product ? productCopy[product.name] || {} : {};
  const wearContext = product ? productWearContext[product.name]?.[lang] || "" : "";
  const doNotWearContext = product ? productDoNotWearContext[product.name]?.[lang] || "" : "";
  const whatToWearContext = product ? productWhatToWearContext[product.name]?.[lang] || "" : "";
  const recommendations = useMemo(() => getRecommendations(product), [product]);

  const sensoryHighlights = useMemo(() => {
    if (!profile) return [];
    return PROFILE_KEYS.map((key) => ({ key, value: Number(profile[key] || 0) }))
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [profile]);

  if (!product) return null;

  const sizes = Object.entries(product.sizes || {});
  const activeSize = selectedSize || sizes[0]?.[0] || "";
  const selectedPrice = Number(product.sizes?.[activeSize] || 0);
  const selectedDiscount = getProductDiscountForSize(product, activeSize);
  const selectedFinalPrice = selectedDiscount
    ? getDiscountedPrice(selectedPrice, selectedDiscount.percent)
    : selectedPrice;
  const type = getProductType(product.name);
  const characterLine = copy.card?.[lang] || copy.modal?.[lang] || "";
  const fullDescription = copy.modal?.[lang] || characterLine;
  const scentType = copy.scentType?.[lang] || "";
  const ratingStars = getRatingStarCount(product.rating);
  const sizeHelper = getSizeHelper(activeSize, lang);
  const activeCartKey = `${product.id}-${activeSize}`;
  const isJustAdded = addedCartKey === activeCartKey;

  const handleAddToCartClick = () => {
    if (!activeSize) return;

    onAddToCart?.(activeSize);
    setAddedCartKey(activeCartKey);

    if (addedCartTimeoutRef.current) {
      window.clearTimeout(addedCartTimeoutRef.current);
    }

    addedCartTimeoutRef.current = window.setTimeout(() => {
      setAddedCartKey("");
      addedCartTimeoutRef.current = null;
    }, 800);
  };

  return (
    <article className="desktop-product-page" data-product-slug={product.slug}>
      <div className="desktop-product-page__shell">
        <nav className="desktop-product-page__breadcrumb" aria-label="Breadcrumb">
          <button type="button" onClick={onBackToShop}>SHOP</button>
          <span>/</span>
          <span>{product.category}</span>
          <span>/</span>
          <span>{product.modalName || product.name}</span>
        </nav>

        <section className="desktop-product-page__hero">
          <div className="desktop-product-page__media-column">
            <div className={`desktop-product-page__visual ${noteMapOpen ? "is-note-map-open" : ""}`}>
              {!noteMapOpen && product.badge ? (
                <span className="desktop-product-page__badge">{product.badge}</span>
              ) : null}
              {!noteMapOpen && product.discount ? (
                <span className="desktop-product-page__sale">-{product.discount.percent}% · {String(product.discount.size).toUpperCase()}</span>
              ) : null}

              {!noteMapOpen ? (
                <button
                  type="button"
                  className="desktop-product-page__image-button"
                  onClick={() => product.noteMap && setNoteMapOpen(true)}
                  aria-label={product.noteMap
                    ? lang === "sr" ? "Prikaži note parfema" : "Show fragrance notes"
                    : product.name}
                >
                  {product.image ? (
                    <img src={product.image} alt={product.name} />
                  ) : (
                    <span>{product.name.charAt(0)}</span>
                  )}
                </button>
              ) : null}

              {product.noteMap && noteMapOpen ? (
                <div className="desktop-product-page__note-map-stage">
                  <TheNoteMap
                    notes={product.noteMap}
                    lang={lang}
                    open
                    onToggle={() => setNoteMapOpen(false)}
                  />
                </div>
              ) : null}
            </div>

            {product.noteMap ? (
              <button
                type="button"
                className="desktop-product-page__note-map-trigger"
                onClick={() => setNoteMapOpen((current) => !current)}
              >
                {noteMapOpen
                  ? lang === "sr" ? "← NAZAD NA PARFEM" : "← BACK TO FRAGRANCE"
                  : lang === "sr" ? "POGLEDAJ NOTE →" : "EXPLORE NOTES →"}
              </button>
            ) : null}

            <DesktopProductModalParity product={product} lang={lang} />
          </div>

          <div className="desktop-product-page__purchase-column">
            <div className="desktop-product-page__eyebrow">
              {type ? <span>{type}</span> : null}
              {scentType ? <span>{scentType}</span> : null}
            </div>

            <div className="desktop-product-page__title-row">
              <div>
                <h1>{product.modalName || product.name}</h1>
                {product.inspiredBy?.name ? (
                  <p className="desktop-product-page__inspired">
                    <strong>{lang === "sr" ? "INSPIRISANO" : "INSPIRED BY"}</strong> {product.inspiredBy.name}
                  </p>
                ) : null}
              </div>

              <button
                type="button"
                className={`desktop-product-page__wishlist ${isWishlisted ? "is-active" : ""}`}
                onClick={onToggleWishlist}
                aria-label={
                  isWishlisted
                    ? lang === "sr" ? "Ukloni iz Private Selection" : "Remove from Private Selection"
                    : lang === "sr" ? "Dodaj u Private Selection" : "Add to Private Selection"
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
              <div className="desktop-product-page__rating">
                <span className="desktop-product-page__rating-stars" aria-hidden="true">
                  <span className="is-filled">{"★".repeat(ratingStars)}</span>
                  <span className="is-empty">{"★".repeat(10 - ratingStars)}</span>
                </span>
                <span className="desktop-product-page__rating-score">
                  <strong>{Number(product.rating).toFixed(1)}</strong>
                  <small>/ 10{product.ratingLabel ? ` · ${product.ratingLabel}` : ""}</small>
                </span>
              </div>
            ) : null}

            {characterLine ? <p className="desktop-product-page__lead">{characterLine}</p> : null}

            <div className="desktop-product-page__divider" />

            <div className="desktop-product-page__size-head">
              <div>
                <span>{lang === "sr" ? "IZABERI VELIČINU" : "CHOOSE SIZE"}</span>
                <small className="desktop-product-page__size-helper">{sizeHelper}</small>
              </div>
              <div className="desktop-product-page__current-price">
                {selectedDiscount ? <del>€{selectedPrice.toFixed(2)}</del> : null}
                <strong>€{Number(selectedFinalPrice).toFixed(2)}</strong>
              </div>
            </div>

            <div className="desktop-product-page__sizes">
              {sizes.map(([size, price]) => {
                const discount = getProductDiscountForSize(product, size);
                const finalPrice = discount ? getDiscountedPrice(price, discount.percent) : Number(price);
                return (
                  <button
                    key={size}
                    type="button"
                    className={size === activeSize ? "is-active" : ""}
                    onClick={() => onSelectSize?.(size)}
                  >
                    <span>{size}</span>
                    <strong>€{finalPrice.toFixed(2)}</strong>
                    {discount ? <small>-{discount.percent}%</small> : null}
                  </button>
                );
              })}
            </div>

            <div className="desktop-product-page__actions">
              <button
                type="button"
                className={`desktop-product-page__add ${isJustAdded ? "is-added" : ""}`}
                onClick={handleAddToCartClick}
                aria-live="polite"
              >
                {isJustAdded
                  ? lang === "sr"
                    ? "DODATO ✓"
                    : "ADDED ✓"
                  : lang === "sr"
                  ? "DODAJ U KORPU"
                  : "ADD TO CART"}
              </button>
              {onBuyNow ? (
                <button type="button" className="desktop-product-page__buy" onClick={() => onBuyNow(activeSize)}>
                  {lang === "sr" ? "KUPI ODMAH" : "BUY NOW"}
                </button>
              ) : null}
            </div>

            <div className="desktop-product-page__trust">
              <span>{lang === "sr" ? "Originalni parfem · pažljivo pretočen" : "Original fragrance · carefully decanted"}</span>
              <span>{lang === "sr" ? "Plaćanje pouzećem" : "Cash on delivery"}</span>
              <span>{lang === "sr" ? "Dostava širom Crne Gore" : "Delivery across Montenegro"}</span>
            </div>

            <section className="desktop-product-page__intelligence desktop-product-page__intelligence--inline">
              <div className="desktop-product-page__section-copy">
                <span className="desktop-product-page__kicker">
                  {lang === "sr" ? "MIRISNI PROFIL" : "SCENT PROFILE"}
                </span>
                <h2>{lang === "sr" ? "Kako ovaj parfem zaista radi." : "How this fragrance actually wears."}</h2>
                {fullDescription ? <p>{fullDescription}</p> : null}
              </div>

              {sensoryHighlights.length ? (
                <div className="desktop-product-page__profile-grid">
                  {sensoryHighlights.map(({ key, value }) => (
                    <div key={key} className="desktop-product-page__profile-item">
                      <div>
                        <span>{PROFILE_LABELS[key]?.[lang] || key}</span>
                        <strong>{value}/10</strong>
                      </div>
                      <div className="desktop-product-page__profile-track">
                        <span style={{ width: `${Math.min(100, value * 10)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </section>
          </div>
        </section>

        {onFindSimilar ? (
          <section className="desktop-product-page__find-similar-band">
            <button
              type="button"
              className="desktop-product-page__find-similar"
              onClick={() => onFindSimilar(product)}
            >
              <span className="desktop-product-page__find-similar-orbit" aria-hidden="true">
                <i />
              </span>

              <span className="desktop-product-page__find-similar-copy">
                <small>FI / MATCH ENGINE</small>
                <strong>
                  {lang === "sr"
                    ? "PRONAĐI SLIČNE MIRISE"
                    : "FIND SIMILAR SCENTS"}
                </strong>
              </span>

              <span className="desktop-product-page__find-similar-arrow" aria-hidden="true">↗</span>
            </button>
          </section>
        ) : null}

        <section className="desktop-product-page__context-grid">
          <article className="desktop-product-page__context-card">
            <span>01</span>
            <h3>{lang === "sr" ? "Kada ga nositi" : "Best moments"}</h3>
            <p>{wearContext || (lang === "sr" ? "Biraj ga prema raspoloženju, prilici i sezoni." : "Wear it according to mood, occasion and season.")}</p>
          </article>

          {doNotWearContext ? (
            <article className="desktop-product-page__context-card desktop-product-page__context-card--warning">
              <span>02</span>
              <h3>{lang === "sr" ? "Kada ga preskočiti" : "Skip it when…"}</h3>
              <p>{doNotWearContext}</p>
            </article>
          ) : null}

          {whatToWearContext ? (
            <article className="desktop-product-page__context-card desktop-product-page__context-card--wear">
              <span>03</span>
              <h3>{lang === "sr" ? "Šta obući" : "Dress the part"}</h3>
              <p>{whatToWearContext}</p>
            </article>
          ) : null}
        </section>

        {recommendations.length ? (
          <section className="desktop-product-page__recommendations">
            <div className="desktop-product-page__recommendations-head">
              <span className="desktop-product-page__kicker">SAME ENERGY</span>
              <h2>{lang === "sr" ? "Ako ti ovo radi, probaj i ove." : "If this works for you, try these."}</h2>
            </div>
            <div className="desktop-product-page__recommendation-grid">
              {recommendations.map((item) => (
                <button key={item.slug} type="button" onClick={() => onOpenProduct?.(item)}>
                  <div>{item.image ? <img src={item.image} alt="" loading="lazy" /> : null}</div>
                  <span>{item.modalName || item.name}</span>
                  <small>{item.category}</small>
                </button>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </article>
  );
}