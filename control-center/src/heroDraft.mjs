export function cloneHeroSlide(slide = {}) {
  return {
    ...slide,
    id: Number(slide.id || 0),
    heroKey: String(slide.heroKey || ""),
    kind: slide.kind || "imageOnly",
    enabled: slide.enabled !== false,
    pinnedFirst: Boolean(slide.pinnedFirst),
    position: Number(slide.position || 0),
    image: slide.image || slide.desktopImage || "",
    desktopImage: slide.desktopImage || slide.image || "",
    mobileImage: slide.mobileImage || slide.image || "",
    alt: String(slide.alt || ""),
    actionPrimary: slide.actionPrimary || "none",
    actionProductSlug: slide.actionProductSlug || "",
    preferredSize: slide.preferredSize || "",
    collectionTitle: slide.collectionTitle || "",
    actionCollection: Array.isArray(slide.actionCollection) ? [...slide.actionCollection] : [],
    manifestoType: slide.manifestoType || ""
  };
}

export function normalizeHeroDraftPayload(payload = {}, baseline = {}) {
  const merged = cloneHeroSlide({ ...baseline, ...payload });
  if (merged.actionPrimary !== "product") {
    merged.actionProductSlug = "";
    merged.preferredSize = "";
  }
  if (merged.actionPrimary !== "collection") {
    merged.collectionTitle = "";
    merged.actionCollection = [];
  }
  if (merged.actionPrimary !== "manifesto") merged.manifestoType = "";
  return merged;
}

export function mergeHeroDrafts(baselineSlides = [], draftRows = {}) {
  return baselineSlides.map((slide) => {
    const row = draftRows[slide.heroKey];
    return row?.payload ? normalizeHeroDraftPayload(row.payload, slide) : cloneHeroSlide(slide);
  });
}

export function heroDraftChanged(draft, baseline) {
  return JSON.stringify(normalizeHeroDraftPayload(draft, baseline)) !== JSON.stringify(cloneHeroSlide(baseline));
}
