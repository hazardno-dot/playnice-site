const SITE_ORIGIN = "https://www.playniceshop.me";
const DEFAULT_TAGS = ["#playnice", "#parfemi", "#montenegro"];

const compact = (parts = []) => parts.map((value) => String(value || "").trim()).filter(Boolean);
const siteUrl = (path = "") => /^https?:\/\//.test(path) ? path : `${SITE_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;

function productDraft(event) {
  const payload = event.payload || {};
  const name = payload.shortName || payload.name || event.source_id;
  const mini = payload.copy?.miniTag?.sr || payload.miniTag || "Novo u PlayNice.";
  const scent = payload.copy?.card?.sr || payload.copy?.scentType?.sr || payload.description || "";
  const sizes = Object.entries(payload.sizes || {}).map(([size, price]) => `${size} · €${price}`).join("\n");
  const link = event.source_url ? siteUrl(event.source_url) : siteUrl(`/product/${event.source_id}`);
  const caption = compact([mini.toUpperCase(), name, scent, sizes, link, DEFAULT_TAGS.join(" ")]).join("\n\n");
  return {
    headline: name,
    instagram_feed: { caption, media: event.media?.[0] || null },
    instagram_story: { caption: `${name}\n${mini}\n${link}`, media: event.media?.find((item) => item.format === "9:16") || event.media?.[0] || null },
    facebook: { caption: compact([mini, name, scent, sizes, link]).join("\n\n"), media: event.media?.[0] || null },
  };
}

function heroDraft(event) {
  const payload = event.payload || {};
  const headline = payload.headline?.sr || payload.headline || payload.title || event.source_id;
  const body = payload.copy?.sr || payload.copy || payload.subtitle?.sr || payload.subtitle || "";
  const link = event.source_url ? siteUrl(event.source_url) : SITE_ORIGIN;
  return {
    headline,
    instagram_feed: { caption: compact([headline, body, link, DEFAULT_TAGS.join(" ")]).join("\n\n"), media: event.media?.find((item) => item.format === "1:1") || event.media?.[0] || null },
    instagram_story: { caption: compact([headline, body, link]).join("\n"), media: event.media?.find((item) => item.format === "9:16") || event.media?.[0] || null },
    facebook: { caption: compact([headline, body, link]).join("\n\n"), media: event.media?.find((item) => item.format === "1:1") || event.media?.[0] || null },
  };
}

function journalDraft(event) {
  const payload = event.payload || {};
  const title = payload.title?.sr || payload.title || event.source_id;
  const teaser = payload.teaser?.sr || payload.teaser || payload.excerpt?.sr || payload.excerpt || "";
  const link = event.source_url ? siteUrl(event.source_url) : siteUrl(`/journal/${event.source_id}`);
  return {
    headline: title,
    instagram_feed: { caption: compact([title, teaser, `Čitaj na ${link}`, "#playnice #lejournal"]).join("\n\n"), media: event.media?.[0] || null },
    instagram_story: { caption: compact([title, "Le Journal", link]).join("\n"), media: event.media?.find((item) => item.format === "9:16") || event.media?.[0] || null },
    facebook: { caption: compact([title, teaser, link]).join("\n\n"), media: event.media?.[0] || null },
  };
}

export function generateSocialDraft(event = {}) {
  if (event.source_type === "product") return productDraft(event);
  if (event.source_type === "hero") return heroDraft(event);
  if (event.source_type === "journal") return journalDraft(event);
  throw new Error(`No social draft generator for ${event.source_type || "unknown source"}`);
}

export { SITE_ORIGIN };
