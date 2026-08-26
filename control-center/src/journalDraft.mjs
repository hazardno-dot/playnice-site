export const JOURNAL_REVIEW_STATUSES = Object.freeze(["draft", "ready", "approved"]);

export function normalizeJournalDraftPayload(article = {}) {
  const langPair = (value) => ({
    sr: String(value?.sr || ""),
    en: String(value?.en || ""),
  });
  const payload = {
    id: Number(article.id),
    date: langPair(article.date),
    image: String(article.image || ""),
    title: langPair(article.title),
    excerpt: langPair(article.excerpt),
    content: langPair(article.content),
  };
  if (article.series != null) payload.series = langPair(article.series);
  if (article.relatedProducts != null) payload.relatedProducts = Array.isArray(article.relatedProducts)
    ? article.relatedProducts.map((slug) => String(slug || "").trim()).filter(Boolean)
    : [];
  return payload;
}

export function getJournalDraftState(row) {
  if (!row) return { label: "LIVE ONLY", tone: "live" };
  if (row.review_status === "approved") return { label: "APPROVED", tone: "approved" };
  if (row.review_status === "ready") return { label: "READY FOR REVIEW", tone: "ready" };
  return { label: "DRAFT", tone: "draft" };
}

export function journalPayloadEquals(a, b) {
  return JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
}
