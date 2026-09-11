const getJournalText = (field, lang = "sr") => {
  if (!field) return "";

  if (typeof field === "string") return field;

  if (typeof field === "object") {
    return field[lang] || field.en || field.sr || "";
  }

  return "";
};

const getJournalArticleSlug = (article) => {
  if (!article) return "";

  const title =
    getJournalText(article.title, "en") ||
    getJournalText(article.title, "sr") ||
    `article-${article.id}`;

  const normalizedTitle = String(title)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${article.id}-${normalizedTitle}`;
};

export { getJournalArticleSlug, getJournalText };
