import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import TheNoteMap from "../../TheNoteMap";
import { products } from "../../data/products";
import { productCopy } from "../../data/products/productCopy";
import { productWearContext } from "../../data/products/productWearContext";

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

const getRatingStars = (rating) => {
  const normalizedRating = Math.max(0, Math.min(10, Number(rating) || 0));
  const filledStars = Math.round(normalizedRating);

  return Array.from({ length: 10 }, (_, index) =>
    index < filledStars ? "★" : "☆"
  ).join("");
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

export default function MobileProductPage({
  product,
  lang = "sr",
  selectedSize,
  onSelectSize,
  onAddToCart,
  onBuyNow,
  isWishlisted = false,
  onToggleWishlist,
  onOpenProduct,
  onBackToShop,
}) {
  const [noteMapOpen, setNoteMapOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const recommendationTrackRef = useRef(null);
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

    const track = recommendationTrackRef.current;
    if (track) {
      track.scrollTo({ left: 0, behavior: "auto" });
    }
  }, [product?.slug]);

  useEffect(() => {
    let cancelled = false;
    setProfile(null);
    setNoteMapOpen(false);

    if (!product?.slug) return undefined;

    import("../../data/products/discoveryProfiles").then(({ discoveryProfiles }) => {
      if (!cancelled) setProfile(discoveryProfiles?.[product.slug] || null);
    });

    return () => {
      cancelled = true;
    };
  }, [product?.slug]);

  const copy = product ? productCopy[product.name] || {} : {};
  const wearContext = product ? productWearContext[product.name]?.[lang] || "" : "";
  const recommendations = useMemo(() => getRecommendations(product), [product]);

  const sensoryHighlights = useMemo(() => {
    if (!profile) return [];

    return PROFILE_KEYS.map((key) => ({ key, value: Number(profile[key] || 0) }))
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 4);
  }, [profile]);

  if (!product) return null;

  const sizes = Object.entries(product.sizes || {});
  const activeSize = selectedSize || sizes[0]?.[0] || "";
  const selectedPrice = product.sizes?.[activeSize];
  const selectedDiscount = getProductDiscountForSize(product, activeSize);
  const selectedFinalPrice = selectedDiscount
    ? getDiscountedPrice(selectedPrice, selectedDiscount.percent)
    : selectedPrice;
  const type = getProductType(product.name);
  const characterLine = copy.card?.[lang] || copy.modal?.[lang] || "";
  const fullDescription = copy.modal?.[lang] || characterLine;
  const scentType = copy.scentType?.[lang] || "";

  return (
    <div className="mobile-product-page" data-product-slug={product.slug}>
      <section className="mobile-product-page__identity">
        <div className="mobile-product-page__identity-topline">
          <button type="button" className="mobile-product-page__back" onClick={onBackToShop}>
            ← SHOP
          </button>

          <button
            type="button"
            className={`mobile-product-page__wishlist ${isWishlisted ? "is-active" : ""}`}
            onClick={onToggleWishlist}
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

        {type && <span className="mobile-product-page__type">{type}</span>}

        <h1>{product.modalName || product.name}</h1>

        <div className="mobile-product-page__meta">
          {product.rating ? (
            <span className="mobile-product-page__rating">
              <span className="mobile-product-page__rating-stars" aria-hidden="true">{getRatingStars(product.rating)}</span>
              <span className="mobile-product-page__rating-score">
                {Number(product.rating).toFixed(1)} <small>/ 10 · {product.ratingLabel}</small>
              </span>
            </span>
          ) : null}

          {product.inspiredBy?.name ? (
            <span className="mobile-product-page__inspired">
              <strong>{lang === "sr" ? "INSPIRISANO" : "INSPIRED BY"}</strong>
              {product.inspiredBy.name}
            </span>
          ) : null}
        </div>
      </section>

      <section className="mobile-product-page__media">
        {product.badge ? (
          <div className="mobile-product-page__badge">{product.badge}</div>
        ) : null}

        <div
          className={`mobile-product-page__visual-frame ${noteMapOpen ? "is-note-map-open" : ""}`}
          onClickCapture={(event) => {
            if (!noteMapOpen) return;
            if (event.target.closest?.(".the-note-map__levels")) {
              setNoteMapOpen(false);
            }
          }}
        >
          {product.discount ? (
            <span className="mobile-product-page__sale-badge">
              SALE · {String(product.discount.size).toUpperCase()} · -{product.discount.percent}%
            </span>
          ) : null}

          <button
            type="button"
            className={`mobile-product-page__image-button ${product.noteMap ? "has-note-map" : ""}`}
            onClick={() => product.noteMap && setNoteMapOpen((current) => !current)}
            aria-label={
              product.noteMap
                ? noteMapOpen
                  ? lang === "sr"
                    ? "Vrati sliku parfema"
                    : "Show fragrance image"
                  : lang === "sr"
                  ? "Prikaži note parfema"
                  : "Show fragrance notes"
                : product.name
            }
          >
            {product.image ? (
              <img src={product.image} alt={product.name} />
            ) : (
              <span className="mobile-product-page__monogram">{product.name.charAt(0)}</span>
            )}
          </button>

          {product.noteMap ? (
            <TheNoteMap
              notes={product.noteMap}
              lang={lang}
              open={noteMapOpen}
              onToggle={() => setNoteMapOpen((current) => !current)}
            />
          ) : null}
        </div>
      </section>

      <section className="mobile-product-page__story">
        {characterLine ? <p className="mobile-product-page__lead">{characterLine}</p> : null}
        {scentType ? <span className="mobile-product-page__scent-type">{scentType}</span> : null}
      </section>

      <section className="mobile-product-page__purchase" aria-label={lang === "sr" ? "Kupovina" : "Purchase"}>
        <div className="mobile-product-page__section-head">
          <div>
            <span>{lang === "sr" ? "IZABERI VELIČINU" : "CHOOSE SIZE"}</span>
            <small>
              {(() => {
                const normalizedSize = String(activeSize || "").toLowerCase();

                if (!normalizedSize) {
                  return lang === "sr"
                    ? "Kreni manjom količinom. Nosi ga prvo."
                    : "Start small. Wear it first.";
                }

                if (normalizedSize.includes("2ml")) {
                  return lang === "sr" ? "Brzi test na koži." : "Quick skin test.";
                }

                if (normalizedSize.includes("5ml")) {
                  return (
                    <>
                      {lang === "sr" ? "Testiraj " : "Test it over "}
                      <strong>{lang === "sr" ? "nekoliko dana" : "a few days"}</strong>
                    </>
                  );
                }

                if (normalizedSize.includes("10ml")) {
                  return (
                    <>
                      {lang === "sr" ? "Savršen za " : "Perfect for "}
                      <strong>{lang === "sr" ? "svakodnevno nošenje" : "daily wear"}</strong>
                    </>
                  );
                }

                if (normalizedSize.includes("20ml")) {
                  return (
                    <>
                      {lang === "sr" ? "Skoro kao " : "Almost like a "}
                      <strong>{lang === "sr" ? "mala bočica" : "small bottle"}</strong>
                    </>
                  );
                }

                return lang === "sr" ? "Probaj. Nosi. Odluči." : "Try it. Wear it. Decide.";
              })()}
            </small>
          </div>
        </div>

        <div className="mobile-product-page__sizes">
          {sizes.map(([size, price]) => {
            const discount = getProductDiscountForSize(product, size);
            const finalPrice = discount
              ? getDiscountedPrice(price, discount.percent)
              : Number(price);

            return (
              <button
                key={size}
                type="button"
                className={`${size === activeSize ? "is-active" : ""} ${discount ? "has-discount" : ""}`.trim()}
                onClick={() => onSelectSize?.(size)}
              >
                <span className="mobile-product-page__size-topline">
                  <span>{size}</span>
                  {discount ? (
                    <em>-{discount.percent}%</em>
                  ) : null}
                </span>

                {discount ? (
                  <span className="mobile-product-page__size-price-discount">
                    <del>€{Number(price).toFixed(2)}</del>
                    <strong>€{finalPrice.toFixed(2)}</strong>
                  </span>
                ) : (
                  <strong>€{Number(price).toFixed(2)}</strong>
                )}
              </button>
            );
          })}
        </div>

        <div className="mobile-product-page__decision-row">
          <div className="mobile-product-page__price-box">
            <span>{lang === "sr" ? "IZABRANA CENA" : "SELECTED PRICE"}</span>
            {selectedDiscount && Number.isFinite(Number(selectedPrice)) ? (
              <span className="mobile-product-page__selected-discount">
                <del>€{Number(selectedPrice).toFixed(2)}</del>
                <strong>€{Number(selectedFinalPrice).toFixed(2)}</strong>
              </span>
            ) : (
              <strong>{Number.isFinite(Number(selectedFinalPrice)) ? `€${Number(selectedFinalPrice).toFixed(2)}` : "—"}</strong>
            )}
          </div>

          <div className="mobile-product-page__actions">
            <button
              type="button"
              className="mobile-product-page__add"
              disabled={!activeSize}
              onClick={() => onAddToCart?.(product, activeSize)}
            >
              {lang === "sr" ? "DODAJ U KORPU" : "ADD TO CART"}
            </button>

            <button
              type="button"
              className="mobile-product-page__buy-now"
              disabled={!activeSize}
              onClick={() => onBuyNow?.(product, activeSize)}
            >
              {lang === "sr" ? "KUPI ODMAH" : "BUY NOW"}
            </button>
          </div>
        </div>
      </section>

      {sensoryHighlights.length ? (
        <section className="mobile-product-page__glance">
          <div className="mobile-product-page__section-head">
            <div>
              <span>{lang === "sr" ? "MIRIS UKRATKO" : "AT A GLANCE"}</span>
              <small>{lang === "sr" ? "Najizraženije osobine" : "Most prominent traits"}</small>
            </div>
          </div>

          <div className="mobile-product-page__profile-list">
            {sensoryHighlights.map(({ key, value }) => (
              <div className="mobile-product-page__profile-row" key={key}>
                <div>
                  <span>{PROFILE_LABELS[key]?.[lang] || key}</span>
                  <strong>{value.toFixed(1)}</strong>
                </div>
                <i><span style={{ width: `${Math.min(100, value * 10)}%` }} /></i>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mobile-product-page__accordions">
        <details>
          <summary>{lang === "sr" ? "O mirisu" : "About the fragrance"}<span>+</span></summary>
          <p>{fullDescription}</p>
        </details>

        <details>
          <summary>{lang === "sr" ? "Mirisni profil" : "Scent profile"}<span>+</span></summary>
          <p>{scentType || (lang === "sr" ? "Pažljivo odabran mirisni profil." : "A carefully selected fragrance profile.")}</p>
        </details>

        <details>
          <summary>{lang === "sr" ? "Kada ga nositi" : "When to wear it"}<span>+</span></summary>
          <p>{wearContext || (lang === "sr" ? "Biraj ga prema raspoloženju, prilici i sezoni." : "Wear it according to mood, occasion and season.")}</p>
        </details>

        <details>
          <summary>{lang === "sr" ? "Dostava" : "Delivery"}<span>+</span></summary>
          <p>
            {lang === "sr"
              ? "Dostava širom Crne Gore. Plaćanje pouzećem. Besplatna dostava za porudžbine preko €39."
              : "Delivery across Montenegro. Cash on delivery. Free delivery on orders over €39."}
          </p>
        </details>
      </section>

      {recommendations.length ? (
        <section className="mobile-product-page__recommendations">
          <div className="mobile-product-page__section-head">
            <div>
              <span>{lang === "sr" ? "AKO TI SE OVO DOPADA" : "IF YOU LIKE THIS"}</span>
              <small>{lang === "sr" ? "Još dobrih pravaca" : "More directions to explore"}</small>
            </div>
          </div>

          <div ref={recommendationTrackRef} className="mobile-product-page__recommendation-track">
            {recommendations.map((recommendation) => {
              const minPrice = Math.min(...Object.values(recommendation.sizes || {}).filter(Number.isFinite));
              const recommendationCopy = productCopy[recommendation.name] || {};

              return (
                <button
                  key={recommendation.id}
                  type="button"
                  className="mobile-product-page__recommendation-card"
                  onClick={() => onOpenProduct?.(recommendation)}
                >
                  <span className="mobile-product-page__recommendation-image">
                    <img src={recommendation.image} alt="" loading="lazy" decoding="async" />
                  </span>
                  <strong>{recommendation.shortName || recommendation.name}</strong>
                  <small>{recommendationCopy.miniTag?.[lang] || recommendationCopy.scentType?.[lang] || ""}</small>
                  {Number.isFinite(minPrice) ? <em>{lang === "sr" ? "od" : "from"} €{minPrice}</em> : null}
                </button>
              );
            })}
          </div>
        </section>
      ) : null}

    </div>
  );
}
