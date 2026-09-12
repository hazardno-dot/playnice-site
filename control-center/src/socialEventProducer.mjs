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

// Shadow producers are wired only after verified live publication boundaries:
// 1. product: sync-publish-status confirms the apply PR merged to main
// 2. hero: finalize-hero-apply completes post-merge safety verification + finalization
// 3. journal: sync-journal-publish-status verifies the merged article against the approved source block
// Meta publishing remains separately hard-locked by SOCIAL_SHADOW_MODE.
