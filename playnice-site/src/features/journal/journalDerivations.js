export const getJournalText = (
  field,
  lang
) => {
  if (!field) return "";

  if (typeof field === "string") {
    return field;
  }

  if (typeof field === "object") {
    return (
      field[lang] ||
      field.en ||
      field.sr ||
      ""
    );
  }

  return "";
};

export const getJournalAvatarLetter = (
  lang
) => (lang === "sr" ? "Č" : "C");

export const getJournalArticleKey = (
  article
) => {
  if (!article) return "";

  return (
    article.id ||
    article.slug ||
    article.title?.en ||
    article.title?.sr ||
    article.title ||
    ""
  );
};

export const getRelatedJournalProducts = ({
  article,
  products = [],
  getProductSlug,
}) => {
  if (!article?.relatedProducts?.length) {
    return [];
  }

  return article.relatedProducts
    .map((relatedRef) => {
      const normalizedRef = String(
        relatedRef || ""
      ).trim();

      if (!normalizedRef) return null;

      return (
        products.find(
          (product) =>
            getProductSlug(product) ===
            normalizedRef
        ) ||
        products.find(
          (product) =>
            product.name
              ?.trim()
              .toLowerCase() ===
            normalizedRef.toLowerCase()
        ) ||
        null
      );
    })
    .filter(Boolean);
};

export const sortJournalArticles = (
  articles = []
) => {
  if (!articles?.length) return [];

  return [...articles].sort((a, b) => {
    const aId = Number(a?.id || 0);
    const bId = Number(b?.id || 0);

    return bId - aId;
  });
};

export const getJournalNavigation = ({
  sortedArticles = [],
  activeArticle,
}) => {
  const activeIndex = activeArticle
    ? sortedArticles.findIndex(
        (article) =>
          String(article.id) ===
          String(activeArticle.id)
      )
    : -1;

  return {
    activeIndex,
    previousArticle:
      activeIndex >= 0
        ? sortedArticles[
            activeIndex + 1
          ] || null
        : null,
    nextArticle:
      activeIndex > 0
        ? sortedArticles[
            activeIndex - 1
          ] || null
        : null,
  };
};

export const getLatestJournalState = ({
  sortedArticles = [],
  seenLatestJournalKey = "",
}) => {
  const latestArticle =
    sortedArticles[0] || null;

  const latestArticleKey =
    latestArticle?.id != null
      ? String(latestArticle.id)
      : "";

  const hasNewArticle =
    Boolean(latestArticleKey) &&
    String(seenLatestJournalKey) !==
      latestArticleKey;

  return {
    latestArticle,
    latestArticleKey,
    hasNewArticle,
    unreadCount: hasNewArticle ? 1 : 0,
  };
};

export const findJournalArticleBySlug = ({
  articles = [],
  slug,
  getArticleSlug,
}) => {
  if (!slug) return null;

  return (
    articles.find(
      (article) =>
        getArticleSlug(article) === slug
    ) || null
  );
};
