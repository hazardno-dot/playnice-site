export const JOURNAL_REVIEW_STATUSES = Object.freeze(["draft", "ready", "approved"]);

const langPair = (value) => ({
  sr: String(value?.sr || ""),
  en: String(value?.en || ""),
});

const normalizeLink = (link = {}) => {
  const value = { label: langPair(link?.label) };
  const action = String(link?.action || "").trim();
  const url = String(link?.url || "").trim();
  if (action) value.action = action;
  if (url) value.url = url;
  if (link?.external != null) value.external = Boolean(link.external);
  return value;
};

const normalizeMediaStage = (stage) => {
  if (!stage || typeof stage !== "object") return null;
  const branch = String(stage.branch || "").trim();
  const baseSha = String(stage.baseSha || "").trim();
  const file = String(stage.file || "").trim();
  const assetPath = String(stage.assetPath || "").trim();
  const stagedAt = String(stage.stagedAt || "").trim();
  if (!branch || !baseSha || !file || !assetPath) return null;
  return { branch, baseSha, file, assetPath, ...(stagedAt ? { stagedAt } : {}) };
};

export function normalizeJournalDraftPayload(article = {}) {
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
  if (article.links != null) payload.links = Array.isArray(article.links)
    ? article.links.map(normalizeLink)
    : [];
  const mediaStage = normalizeMediaStage(article.mediaStage);
  if (mediaStage) payload.mediaStage = mediaStage;
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
