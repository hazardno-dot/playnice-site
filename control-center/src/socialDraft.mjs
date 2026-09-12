const SITE_ORIGIN = "https://www.playniceshop.me";
const DEFAULT_TAGS = ["#playnice", "#parfemi", "#montenegro"];

const compact = (parts = []) => parts.map((value) => String(value || "").trim()).filter(Boolean);
const siteUrl = (path = "") => /^https?:\/\//.test(path) ? path : `${SITE_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
const mediaSrc = (item) => String(item?.url || item?.src || "").trim();
const mediaFormat = (item) => String(item?.format || "").trim().toLowerCase();
const productCore = (payload = {}) => payload?.core && typeof payload.core === "object" ? payload.core : payload;

const CHANNEL_MEDIA_PRIORITIES = {
  instagram_feed: ["1:1", "square", "product", "product_image", "journal_cover", "hero_square", "4:3", "hero_mobile", "hero_desktop"],
  instagram_story: ["9:16", "9:15", "story", "vertical", "hero_story", "hero_mobile", "4:3", "journal_cover", "product", "product_image", "1:1", "hero_desktop"],
  facebook: ["1:1", "square", "hero_square", "journal_cover", "product", "product_image", "4:3", "hero_mobile", "hero_desktop"],
};

function normalizeMedia(media = []) {
  return (Array.isArray(media) ? media : [])
    .filter((item) => mediaSrc(item))
    .map((item) => ({ ...item, src: mediaSrc(item), format: item?.format || "unknown" }));
}

export function selectSocialMedia(media = [], channel = "instagram_feed") {
  const items = normalizeMedia(media);
  if (!items.length) return null;
  const priorities = CHANNEL_MEDIA_PRIORITIES[channel] || CHANNEL_MEDIA_PRIORITIES.instagram_feed;
  for (const preferred of priorities) {
    const match = items.find((item) => mediaFormat(item) === preferred);
    if (match) return { ...match, selection: preferred === mediaFormat(items[0]) ? "preferred" : "channel_priority" };
  }
  return { ...items[0], selection: "fallback" };
}

function payloadMedia(payload = {}, sourceType = "") {
  const media = [];
  const add = (src, format) => { if (String(src || "").trim()) media.push({ src: String(src).trim(), format }); };
  if (sourceType === "product") {
    const core = productCore(payload);
    add(core.socialSquareImage || payload.socialSquareImage, "1:1");
    add(core.socialStoryImage || payload.socialStoryImage, "9:16");
    add(core.image || payload.image, "product_image");
  }
  if (sourceType === "hero") {
    add(payload.socialSquareImage || payload.squareImage, "1:1");
    add(payload.socialStoryImage || payload.storyImage, "9:16");
    add(payload.mobileImage, "hero_mobile");
    add(payload.desktopImage || payload.image, "hero_desktop");
  }
  if (sourceType === "journal") add(payload.image, "journal_cover");
  return media;
}

export function resolveEventMedia(event = {}) {
  const explicit = normalizeMedia(event.media || []);
  const fallback = payloadMedia(event.payload || {}, event.source_type);
  const seen = new Set();
  return [...explicit, ...fallback].filter((item) => {
    const key = `${mediaSrc(item)}|${mediaFormat(item)}`;
    if (!mediaSrc(item) || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function channelMedia(event, channel) {
  return selectSocialMedia(resolveEventMedia(event), channel);
}

function productDraft(event) {
  const payload = event.payload || {};
  const core = productCore(payload);
  const name = core.shortName || core.name || payload.shortName || payload.name || event.source_id;
  const mini = payload.copy?.miniTag?.sr || core.miniTag || payload.miniTag || "Novo u PlayNice.";
  const scent = payload.copy?.card?.sr || payload.copy?.scentType?.sr || core.description || payload.description || "";
  const sizes = Object.entries(core.sizes || payload.sizes || {}).map(([size, price]) => `${size} · €${price}`).join("\n");
  const link = event.source_url ? siteUrl(event.source_url) : siteUrl(`/product/${event.source_id}`);
  const caption = compact([mini.toUpperCase(), name, scent, sizes, link, DEFAULT_TAGS.join(" ")]).join("\n\n");
  return {
    headline: name,
    instagram_feed: { caption, media: channelMedia(event, "instagram_feed") },
    instagram_story: { caption: compact([name, mini, link]).join("\n"), media: channelMedia(event, "instagram_story") },
    facebook: { caption: compact([mini, name, scent, sizes, link]).join("\n\n"), media: channelMedia(event, "facebook") },
  };
}

function heroDraft(event) {
  const payload = event.payload || {};
  const headline = payload.headline?.sr || payload.headline || payload.title || event.source_id;
  const body = payload.copy?.sr || payload.copy || payload.subtitle?.sr || payload.subtitle || "";
  const link = event.source_url ? siteUrl(event.source_url) : SITE_ORIGIN;
  return {
    headline,
    instagram_feed: { caption: compact([headline, body, link, DEFAULT_TAGS.join(" ")]).join("\n\n"), media: channelMedia(event, "instagram_feed") },
    instagram_story: { caption: compact([headline, body, link]).join("\n"), media: channelMedia(event, "instagram_story") },
    facebook: { caption: compact([headline, body, link]).join("\n\n"), media: channelMedia(event, "facebook") },
  };
}

function journalDraft(event) {
  const payload = event.payload || {};
  const title = payload.title?.sr || payload.title || event.source_id;
  const teaser = payload.teaser?.sr || payload.teaser || payload.excerpt?.sr || payload.excerpt || "";
  const link = event.source_url ? siteUrl(event.source_url) : siteUrl(`/journal/${event.source_id}`);
  return {
    headline: title,
    instagram_feed: { caption: compact([title, teaser, `Čitaj na ${link}`, "#playnice #lejournal"]).join("\n\n"), media: channelMedia(event, "instagram_feed") },
    instagram_story: { caption: compact([title, "Le Journal", link]).join("\n"), media: channelMedia(event, "instagram_story") },
    facebook: { caption: compact([title, teaser, link]).join("\n\n"), media: channelMedia(event, "facebook") },
  };
}

export function generateSocialDraft(event = {}) {
  if (event.source_type === "product") return productDraft(event);
  if (event.source_type === "hero") return heroDraft(event);
  if (event.source_type === "journal") return journalDraft(event);
  throw new Error(`No social draft generator for ${event.source_type || "unknown source"}`);
}

export { SITE_ORIGIN, productCore };
