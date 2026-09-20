export const SMART_CTA_INITIAL_STATS = {
  summer: 0,
  clean: 0,
  rich: 0,
  date: 0,
  soft: 0,
  signature: 0,
};

export const resolveSmartCtaVibe = ({
  stats,
  cartCount,
  wishlistCount,
}) => {
  if (cartCount > 0 || wishlistCount > 0) return null;

  if (stats.summer >= 3) return "summer";

  if (stats.clean >= 2 || stats.soft >= 2) {
    return "clean";
  }

  if (stats.rich >= 2) return "rich";

  if (stats.date >= 2) return "date";

  if (stats.signature >= 2) return "signature";

  return null;
};

export const incrementSmartCtaStats = (
  stats,
  moods = []
) => {
  const next = { ...stats };

  moods.forEach((mood) => {
    if (next[mood] !== undefined) {
      next[mood] += 1;
    }
  });

  return next;
};

export const getSmartStickyCopy = (vibe, lang) => {
  const smartStickyCopy = {
    summer: {
      label:
        lang === "sr"
          ? "Treba ti letnji starter?"
          : "Need a summer starter?",
      sublabel:
        lang === "sr"
          ? "Otvori Summer Heat izbor"
          : "Open Summer Heat picks",
      moodId: "summer",
    },
    clean: {
      label:
        lang === "sr"
          ? "Kreni od čistih potpisa"
          : "Start with clean signatures",
      sublabel:
        lang === "sr"
          ? "Otvori Clean Everyday izbor"
          : "Open Clean Everyday picks",
      moodId: "clean",
    },
    rich: {
      label:
        lang === "sr"
          ? "Idi malo dublje"
          : "Go deeper",
      sublabel:
        lang === "sr"
          ? "Otvori Rich & Addictive izbor"
          : "Open Rich & Addictive picks",
      moodId: "rich",
    },
    date: {
      label:
        lang === "sr"
          ? "Nešto za veče?"
          : "Something for after dark?",
      sublabel:
        lang === "sr"
          ? "Otvori Date Night izbor"
          : "Open Date Night picks",
      moodId: "date",
    },
    signature: {
      label:
        lang === "sr"
          ? "Pronađi svoj potpis"
          : "Find your signature",
      sublabel:
        lang === "sr"
          ? "Otvori Signature Energy izbor"
          : "Open Signature Energy picks",
      moodId: "signature",
    },
  };

  return vibe ? smartStickyCopy[vibe] || null : null;
};

export const buildStickyCtaData = ({
  cartCount,
  total,
  wishlistCount,
  view,
  filteredProductsCount,
  tr,
  lang,
  smartCtaVibe,
  formatPrice,
  onCheckout,
  onOpenPrivateSelection,
  onSmartClick,
}) => {
  if (cartCount > 0) {
    return {
      label: tr.stickyCheckout,
      sublabel: `${cartCount} ${
        cartCount === 1 ? tr.stickyItem : tr.stickyItems
      } • ${formatPrice(total)}`,
      onClick: onCheckout,
    };
  }

  if (wishlistCount > 0 && view === "shop") {
    return {
      label: tr.stickySaved,
      sublabel: `${wishlistCount} ${
        wishlistCount === 1
          ? tr.stickyItem
          : tr.stickyItems
      }`,
      onClick: onOpenPrivateSelection,
    };
  }

  const smartCopy = getSmartStickyCopy(
    smartCtaVibe,
    lang
  );

  return {
    label: smartCopy?.label || tr.stickyExplore,
    sublabel:
      smartCopy?.sublabel ||
      (view === "shop"
        ? `${filteredProductsCount} ${
            lang === "sr" ? "parfema" : "fragrances"
          }`
        : tr.privateSelection),
    onClick: () => onSmartClick(smartCopy?.moodId),
  };
};
