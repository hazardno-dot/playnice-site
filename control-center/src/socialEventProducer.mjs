import { normalizeSocialEvent } from "./socialEvent.mjs";

const publicUrl = (path) => path || null;

export function productPublishedEvent({ slug, payload = {}, media = [], sourceUrl } = {}) {
  return normalizeSocialEvent({
    event_type: "product_published",
    source_type: "product",
    source_id: slug,
    source_url: publicUrl(sourceUrl || (slug ? `/product/${slug}` : null)),
    payload,
    media,
  });
}

export function heroPublishedEvent({ heroKey, payload = {}, media = [], sourceUrl = "/" } = {}) {
  return normalizeSocialEvent({
    event_type: "hero_published",
    source_type: "hero",
    source_id: heroKey,
    source_url: publicUrl(sourceUrl),
    payload,
    media,
  });
}

export function journalPublishedEvent({ articleId, payload = {}, media = [], sourceUrl } = {}) {
  return normalizeSocialEvent({
    event_type: "journal_published",
    source_type: "journal",
    source_id: String(articleId || ""),
    source_url: publicUrl(sourceUrl || (articleId ? `/journal/${articleId}` : null)),
    payload,
    media,
  });
}

// Intentionally not wired to production publish flows in v1 shadow infrastructure.
// Future integration points:
// 1. product: after sync-publish-status confirms PR merged to main
// 2. hero: after hero apply finalization confirms live state
// 3. journal: after journal apply confirms live state
