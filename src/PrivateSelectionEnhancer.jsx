import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { products } from "./data/products";
import "./PrivateSelectionEnhancer.css";

const WISHLIST_KEY = "playnice_wishlist";

const readWishlist = () => {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(WISHLIST_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const normalizeMood = (mood) => String(mood || "").trim().toLowerCase();

const MOOD_LABELS = {
  clean: { sr: "Clean", en: "Clean" },
  summer: { sr: "Fresh", en: "Fresh" },
  date: { sr: "Date", en: "Date" },
  rich: { sr: "Rich", en: "Rich" },
  soft: { sr: "Soft", en: "Soft" },
  signature: { sr: "Signature", en: "Signature" }
};

const getLanguage = () => {
  try {
    return window.localStorage.getItem("playnice_lang") === "en" ? "en" : "sr";
  } catch {
    return "sr";
  }
};

const getMinPrice = (product) => {
  const prices = Object.values(product?.sizes || {}).map(Number).filter(Number.isFinite);
  return prices.length ? Math.min(...prices) : null;
};

const formatPrice = (value) => {
  if (!Number.isFinite(value)) return "";
  return Number.isInteger(value) ? `€${value}` : `€${value.toFixed(1)}`;
};

const getProfile = (selected, lang) => {
  const categoryCounts = new Map();
  const moodCounts = new Map();

  selected.forEach((product) => {
    if (product.category) {
      categoryCounts.set(product.category, (categoryCounts.get(product.category) || 0) + 1);
    }

    (product.moods || product.scentMoods || []).forEach((mood) => {
      const key = normalizeMood(mood);
      if (!key) return;
      moodCounts.set(key, (moodCounts.get(key) || 0) + 1);
    });
  });

  const categories = [...categoryCounts.entries()].sort((a, b) => b[1] - a[1]);
  const moods = [...moodCounts.entries()].sort((a, b) => b[1] - a[1]);

  const topCategory = categories[0]?.[0] || "";
  const topMoods = moods.slice(0, 2).map(([mood]) => MOOD_LABELS[mood]?.[lang] || mood);

  const categoryLabel = topCategory
    ? lang === "sr"
      ? `${topCategory} naginje`
      : `${topCategory} leaning`
    : lang === "sr"
      ? "Lični izbor"
      : "Personal selection";

  return {
    count: selected.length,
    categoryLabel,
    topMoods,
    moodKeys: moods.map(([mood]) => mood),
    categoryCounts
  };
};

const getRecommendations = (selected, wishlistIds, profile) => {
  if (!selected.length) return [];

  const directRecommendationCounts = new Map();

  selected.forEach((product) => {
    (product.recommendations || []).forEach((slug) => {
      if (!slug) return;
      directRecommendationCounts.set(slug, (directRecommendationCounts.get(slug) || 0) + 1);
    });
  });

  const selectedMoodSet = new Set(profile.moodKeys.slice(0, 4));
  const dominantCategory = [...profile.categoryCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];

  return products
    .filter((product) => !wishlistIds.includes(product.id))
    .map((product) => {
      const productMoods = (product.moods || product.scentMoods || []).map(normalizeMood);
      const moodOverlap = productMoods.filter((mood) => selectedMoodSet.has(mood));
      const directScore = (directRecommendationCounts.get(product.slug) || 0) * 10;
      const moodScore = moodOverlap.length * 3;
      const categoryScore = dominantCategory && product.category === dominantCategory ? 1 : 0;
      const ratingScore = Number(product.rating || 0) / 20;

      return {
        product,
        score: directScore + moodScore + categoryScore + ratingScore,
        direct: directScore > 0,
        sharedMoods: moodOverlap
      };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2);
};

function PrivateSelectionEnhancer() {
  const [drawer, setDrawer] = useState(null);
  const [wishlistIds, setWishlistIds] = useState(() => readWishlist());
  const [lang, setLang] = useState(() => getLanguage());

  useEffect(() => {
    const sync = () => {
      setDrawer(document.querySelector(".private-selection-drawer"));
      setWishlistIds(readWishlist());
      setLang(getLanguage());
    };

    sync();

    const observer = new MutationObserver(sync);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class"]
    });

    window.addEventListener("storage", sync);

    return () => {
      observer.disconnect();
      window.removeEventListener("storage", sync);
    };
  }, []);

  const selectedProducts = useMemo(
    () => products.filter((product) => wishlistIds.includes(product.id)),
    [wishlistIds]
  );

  const profile = useMemo(
    () => getProfile(selectedProducts, lang),
    [selectedProducts, lang]
  );

  const recommendations = useMemo(
    () => getRecommendations(selectedProducts, wishlistIds, profile),
    [selectedProducts, wishlistIds, profile]
  );

  if (!drawer || selectedProducts.length === 0) return null;

  const openRecommendation = (product) => {
    drawer.querySelector(".private-selection-header .close-button")?.click();

    window.setTimeout(() => {
      const nextUrl = `/product/${product.slug}`;
      window.history.pushState(
        {
          playniceProductModal: true,
          productSlug: product.slug,
          productOriginView: "shop"
        },
        "",
        nextUrl
      );
      window.dispatchEvent(new PopStateEvent("popstate"));
    }, 80);
  };

  return createPortal(
    <section className="private-selection-personal" aria-label={lang === "sr" ? "Tvoj mirisni profil" : "Your scent profile"}>
      <div className="private-selection-profile">
        <div className="private-selection-personal-head">
          <span>{lang === "sr" ? "TVOJ MIRISNI PROFIL" : "YOUR SCENT PROFILE"}</span>
          <small>{profile.count} {profile.count === 1 ? (lang === "sr" ? "parfem" : "fragrance") : (lang === "sr" ? "parfema" : "fragrances")}</small>
        </div>

        <div className="private-selection-profile-line">
          <strong>{profile.categoryLabel}</strong>
          {profile.topMoods.length > 0 && (
            <span>{profile.topMoods.join(" · ")}</span>
          )}
        </div>

        <p>
          {lang === "sr"
            ? "Tvoj izbor se razvija dok čuvaš parfeme — PlayNice koristi samo karakteristike mirisa iz tvoje selekcije."
            : "Your profile evolves as you save fragrances — PlayNice only uses fragrance traits from your selection."}
        </p>
      </div>

      {recommendations.length > 0 && (
        <div className="private-selection-recommendations">
          <div className="private-selection-personal-head">
            <span>{lang === "sr" ? "NA OSNOVU TVOG IZBORA" : "BASED ON YOUR SELECTION"}</span>
            <small>{lang === "sr" ? "2 predloga" : "2 picks"}</small>
          </div>

          <div className="private-selection-recommendation-list">
            {recommendations.map(({ product, direct, sharedMoods }) => {
              const minPrice = getMinPrice(product);
              const sharedLabel = sharedMoods
                .slice(0, 2)
                .map((mood) => MOOD_LABELS[mood]?.[lang] || mood)
                .join(" / ");

              const reason = direct
                ? lang === "sr"
                  ? "Povezan sa parfemima koje si sačuvao."
                  : "Connected to fragrances you saved."
                : sharedLabel
                  ? lang === "sr"
                    ? `Prati tvoj ${sharedLabel} pravac.`
                    : `Matches your ${sharedLabel} direction.`
                  : lang === "sr"
                    ? "Blizak karakter tvojoj selekciji."
                    : "Close to the character of your selection.";

              return (
                <button
                  key={product.id}
                  type="button"
                  className="private-selection-recommendation"
                  onClick={() => openRecommendation(product)}
                >
                  <span className="private-selection-recommendation-media">
                    <img src={product.image || "/placeholder.png"} alt="" loading="lazy" />
                  </span>

                  <span className="private-selection-recommendation-copy">
                    <strong>{product.shortName || product.cardName || product.name}</strong>
                    <small>{reason}</small>
                  </span>

                  <span className="private-selection-recommendation-meta">
                    {minPrice !== null && <small>{lang === "sr" ? "od" : "from"} {formatPrice(minPrice)}</small>}
                    <span>{lang === "sr" ? "Pogledaj" : "View"} →</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </section>,
    drawer
  );
}

export default PrivateSelectionEnhancer;
