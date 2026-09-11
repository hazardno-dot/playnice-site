import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { products } from "../../data/products";
import { productCopy } from "../../data/products/productCopy";
import { productWearContext } from "../../data/products/productWearContext";
import TheNoteMap from "../../TheNoteMap";

const MOBILE_QUERY = "(max-width: 640px)";

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
  dryness: { sr: "Suvoća", en: "Dryness" },
  fruitiness: { sr: "Voćnost", en: "Fruitiness" },
  spiciness: { sr: "Začinskost", en: "Spiciness" },
  woodiness: { sr: "Drvenastost", en: "Woodiness" },
  aromaticity: { sr: "Aromatičnost", en: "Aromatic" },
  florality: { sr: "Cvetnost", en: "Floral" },
  gourmandness: { sr: "Gurmanski karakter", en: "Gourmand" },
  citrus: { sr: "Citrusi", en: "Citrus" },
  aquatic: { sr: "Vodeni karakter", en: "Aquatic" },
  powdery: { sr: "Puderastost", en: "Powdery" },
};

const getSlugFromLocation = () => {
  const match = window.location.pathname.match(/^\/product\/([^/]+)\/?$/);
  return match?.[1] ? decodeURIComponent(match[1]) : "";
};

const getLanguage = () => {
  const htmlLang = document.documentElement.lang;
  if (htmlLang === "en" || htmlLang === "sr") return htmlLang;

  try {
    return localStorage.getItem("playnice_lang") === "en" ? "en" : "sr";
  } catch {
    return "sr";
  }
};

const getProductType = (name = "") => {
  const matches = String(name).match(
    /(Extrait de Parfum|Eau de Parfum|Eau de Toilette|Parfum|Cologne)$/i
  );
  return matches?.[1] || "";
};

export default function MobileProductPageEnhancer() {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" && window.matchMedia(MOBILE_QUERY).matches
  );
  const [slug, setSlug] = useState(() =>
    typeof window !== "undefined" ? getSlugFromLocation() : ""
  );
  const [lang, setLang] = useState(() =>
    typeof document !== "undefined" ? getLanguage() : "sr"
  );
  const [mountNode, setMountNode] = useState(null);
  const [profile, setProfile] = useState(null);

  const product = useMemo(
    () => products.find((item) => item.slug === slug) || null,
    [slug]
  );

  const copy = product ? productCopy[product.name] || {} : {};
  const wearContext = product ? productWearContext[product.name]?.[lang] || "" : "";

  useEffect(() => {
    const media = window.matchMedia(MOBILE_QUERY);
    const syncMobile = () => setIsMobile(media.matches);
    syncMobile();
    media.addEventListener?.("change", syncMobile);
    return () => media.removeEventListener?.("change", syncMobile);
  }, []);

  useEffect(() => {
    const syncLocation = () => setSlug(getSlugFromLocation());
    window.addEventListener("popstate", syncLocation);

    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    const wrapHistory = (original) =>
      function wrappedHistory(...args) {
        const result = original.apply(this, args);
        window.dispatchEvent(new Event("playnice:locationchange"));
        return result;
      };

    window.history.pushState = wrapHistory(originalPushState);
    window.history.replaceState = wrapHistory(originalReplaceState);
    window.addEventListener("playnice:locationchange", syncLocation);

    return () => {
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
      window.removeEventListener("popstate", syncLocation);
      window.removeEventListener("playnice:locationchange", syncLocation);
    };
  }, []);

  useEffect(() => {
    const syncLanguage = () => setLang(getLanguage());
    syncLanguage();

    const observer = new MutationObserver(syncLanguage);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["lang"],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isMobile || !product) {
      setMountNode(null);
      return undefined;
    }

    const syncMountNode = () => {
      const node = document.querySelector(".product-modal .modal-content");
      setMountNode((current) => (current === node ? current : node));
    };

    syncMountNode();
    const observer = new MutationObserver(syncMountNode);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [isMobile, product]);

  useEffect(() => {
    let cancelled = false;
    setProfile(null);

    if (!isMobile || !product) return undefined;

    import("../../data/products/discoveryProfiles").then(({ discoveryProfiles }) => {
      if (!cancelled) setProfile(discoveryProfiles?.[product.slug] || null);
    });

    return () => {
      cancelled = true;
    };
  }, [isMobile, product]);

  useEffect(() => {
    if (!isMobile || !product) return undefined;

    const body = document.body;
    const modal = document.querySelector(".product-modal");
    const overlay = document.querySelector(".product-modal-layer");

    const releaseProductPageLock = () => {
      const otherBlockingLayer =
        document.querySelector(".cart-drawer.open") ||
        document.querySelector(".checkout-modal.open") ||
        document.querySelector(".private-selection-drawer.open");

      if (otherBlockingLayer) return;

      body.classList.add("mobile-product-page-active");
      body.style.position = "";
      body.style.top = "";
      body.style.left = "";
      body.style.right = "";
      body.style.width = "";
      body.style.overflow = "";

      if (modal) {
        modal.setAttribute("role", "main");
        modal.removeAttribute("aria-modal");
      }

      overlay?.setAttribute("role", "presentation");
    };

    releaseProductPageLock();
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });

    const observer = new MutationObserver(() => requestAnimationFrame(releaseProductPageLock));
    observer.observe(body, {
      attributes: true,
      attributeFilter: ["class", "style"],
      subtree: false,
    });

    return () => {
      observer.disconnect();
      body.classList.remove("mobile-product-page-active");
    };
  }, [isMobile, product]);

  useEffect(() => {
    if (!isMobile || !product) return undefined;

    let frame = null;
    const syncPurchaseButton = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const button = document.querySelector(".product-modal .modal-add-button");
        const label = button?.querySelector("span");
        const price = document.querySelector(".product-modal .modal-selected-price")?.textContent?.trim();

        if (!label || !price) return;
        const current = label.textContent || "";
        if (/DODATO|ADDED/i.test(current)) return;

        label.textContent =
          lang === "sr" ? `DODAJ U KORPU · ${price}` : `ADD TO CART · ${price}`;
      });
    };

    syncPurchaseButton();
    const modal = document.querySelector(".product-modal");
    if (!modal) return undefined;

    const observer = new MutationObserver(syncPurchaseButton);
    observer.observe(modal, { childList: true, subtree: true, characterData: true, attributes: true });

    return () => {
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [isMobile, product, lang]);

  if (!isMobile || !product || !mountNode) return null;

  const sensoryHighlights = PROFILE_KEYS.map((key) => ({
    key,
    value: Number(profile?.[key] || 0),
  }))
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 4);

  const recommendations = (product.recommendations || [])
    .map((recommendationSlug) => products.find((item) => item.slug === recommendationSlug))
    .filter(Boolean)
    .slice(0, 3);

  const characterLine = copy.card?.[lang] || copy.modal?.[lang] || "";
  const fullDescription = copy.modal?.[lang] || characterLine;
  const scentType = copy.scentType?.[lang] || "";
  const type = getProductType(product.name);

  const openRecommendation = (recommendation) => {
    window.history.pushState(
      {
        playniceProductModal: true,
        productSlug: recommendation.slug,
        productOriginView: "shop",
      },
      "",
      `/product/${recommendation.slug}`
    );
    window.dispatchEvent(new PopStateEvent("popstate"));
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  };

  return createPortal(
    <>
      <section className="mobile-pdp-character" aria-label={lang === "sr" ? "Kratak opis" : "Short description"}>
        {type && <span className="mobile-pdp-type">{type}</span>}
        {characterLine && <p>{characterLine}</p>}
      </section>

      <section className="mobile-pdp-after-purchase">
        {sensoryHighlights.length > 0 && (
          <div className="mobile-pdp-profile-card">
            <div className="mobile-pdp-section-head">
              <span>{lang === "sr" ? "MIRIS UKRATKO" : "AT A GLANCE"}</span>
              <small>{lang === "sr" ? "Najizraženije osobine" : "Most prominent traits"}</small>
            </div>

            <div className="mobile-pdp-profile-list">
              {sensoryHighlights.map(({ key, value }) => (
                <div className="mobile-pdp-profile-row" key={key}>
                  <div className="mobile-pdp-profile-meta">
                    <span>{PROFILE_LABELS[key]?.[lang] || key}</span>
                    <strong>{value.toFixed(1)}</strong>
                  </div>
                  <div className="mobile-pdp-profile-track" aria-hidden="true">
                    <i style={{ width: `${Math.min(100, Math.max(0, value * 10))}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {product.noteMap && (
          <div className="mobile-pdp-note-map">
            <div className="mobile-pdp-section-head">
              <span>THE NOTE MAP</span>
              <small>{lang === "sr" ? "Od otvaranja do baze" : "From opening to drydown"}</small>
            </div>
            <TheNoteMap notes={product.noteMap} lang={lang} open onToggle={() => {}} />
          </div>
        )}

        <div className="mobile-pdp-accordions">
          <details>
            <summary>{lang === "sr" ? "O mirisu" : "About the fragrance"}<span>+</span></summary>
            <p>{fullDescription}</p>
          </details>

          <details>
            <summary>{lang === "sr" ? "Scent profile" : "Scent profile"}<span>+</span></summary>
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
        </div>

        {recommendations.length > 0 && (
          <section className="mobile-pdp-recommendations">
            <div className="mobile-pdp-section-head">
              <span>{lang === "sr" ? "AKO TI SE OVO DOPADA" : "IF YOU LIKE THIS"}</span>
              <small>{lang === "sr" ? "Još tri dobra pravca" : "Three more directions"}</small>
            </div>

            <div className="mobile-pdp-recommendation-track">
              {recommendations.map((recommendation) => {
                const recommendationCopy = productCopy[recommendation.name] || {};
                const minPrice = Math.min(...Object.values(recommendation.sizes || {}).filter(Number.isFinite));

                return (
                  <button
                    key={recommendation.id}
                    type="button"
                    className="mobile-pdp-recommendation-card"
                    onClick={() => openRecommendation(recommendation)}
                  >
                    <span className="mobile-pdp-recommendation-image">
                      <img src={recommendation.image} alt="" loading="lazy" decoding="async" />
                    </span>
                    <span className="mobile-pdp-recommendation-copy">
                      <strong>{recommendation.shortName || recommendation.name}</strong>
                      <small>{recommendationCopy.miniTag?.[lang] || recommendationCopy.scentType?.[lang] || ""}</small>
                      {Number.isFinite(minPrice) && (
                        <em>{lang === "sr" ? "od" : "from"} €{minPrice}</em>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        )}
      </section>
    </>,
    mountNode
  );
}
