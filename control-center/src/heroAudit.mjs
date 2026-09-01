const ACTIONS = new Set(["none", "shop", "product", "collection", "manifesto"]);
const MANIFESTOS = new Set(["confidence", "playnice-mission", "details"]);

export function heroRowToSlide(row) {
  return {
    id: Number(row.id),
    heroKey: row.hero_key,
    kind: row.kind,
    enabled: row.enabled !== false,
    pinnedFirst: Boolean(row.pinned_first),
    position: Number(row.position || 0),
    image: row.image,
    desktopImage: row.desktop_image,
    mobileImage: row.mobile_image,
    alt: row.alt,
    actionPrimary: row.action_type,
    actionProductSlug: row.product_slug || undefined,
    preferredSize: row.preferred_size || undefined,
    collectionTitle: row.collection_title || undefined,
    actionCollection: Array.isArray(row.collection_slugs) ? row.collection_slugs : [],
    manifestoType: row.manifesto_type || undefined
  };
}

const parityShape = (slide) => ({
  id: Number(slide.id),
  kind: slide.kind || "imageOnly",
  pinnedFirst: Boolean(slide.pinnedFirst),
  image: slide.image || slide.desktopImage || "",
  desktopImage: slide.desktopImage || slide.image || "",
  mobileImage: slide.mobileImage || slide.image || "",
  alt: slide.alt || "",
  actionPrimary: slide.actionPrimary || "none",
  actionProductSlug: slide.actionProductSlug || "",
  preferredSize: slide.preferredSize || "",
  collectionTitle: slide.collectionTitle || "",
  actionCollection: Array.isArray(slide.actionCollection) ? slide.actionCollection : [],
  manifestoType: slide.manifestoType || ""
});

export function auditHeroSlides(slides, { productSlugs = [], baseline = [] } = {}) {
  const issues = [];
  const productSet = new Set(productSlugs);
  const ids = new Set();
  const keys = new Set();
  const positions = new Set();

  if (!slides.length) issues.push({ level: "error", field: "slides", message: "No active Hero slides found." });

  slides.forEach((slide, index) => {
    const label = `#${slide.id || index + 1}`;
    if (!slide.id || ids.has(slide.id)) issues.push({ level: "error", field: `${label}.id`, message: "Hero ID is missing or duplicated." });
    ids.add(slide.id);
    if (!slide.heroKey || keys.has(slide.heroKey)) issues.push({ level: "error", field: `${label}.heroKey`, message: "Hero key is missing or duplicated." });
    keys.add(slide.heroKey);
    if (!slide.position || positions.has(slide.position)) issues.push({ level: "error", field: `${label}.position`, message: "Hero position is missing or duplicated." });
    positions.add(slide.position);
    if (!slide.desktopImage) issues.push({ level: "error", field: `${label}.desktopImage`, message: "Desktop image is required." });
    if (!slide.mobileImage) issues.push({ level: "error", field: `${label}.mobileImage`, message: "Mobile image is required." });
    if (!String(slide.alt || "").trim()) issues.push({ level: "error", field: `${label}.alt`, message: "Alt text is required." });
    if (!ACTIONS.has(slide.actionPrimary)) issues.push({ level: "error", field: `${label}.action`, message: `Unsupported action: ${slide.actionPrimary}` });
    if (slide.actionPrimary === "product" && !productSet.has(slide.actionProductSlug)) issues.push({ level: "error", field: `${label}.product`, message: `Product slug is not in the live catalog: ${slide.actionProductSlug || "missing"}` });
    if (slide.actionPrimary === "collection") {
      if (!slide.actionCollection?.length) issues.push({ level: "error", field: `${label}.collection`, message: "Collection must contain at least one product." });
      (slide.actionCollection || []).filter((slug) => !productSet.has(slug)).forEach((slug) => issues.push({ level: "error", field: `${label}.collection`, message: `Collection product is not in the live catalog: ${slug}` }));
    }
    if (slide.actionPrimary === "manifesto" && !MANIFESTOS.has(slide.manifestoType)) issues.push({ level: "error", field: `${label}.manifesto`, message: `Unsupported manifesto type: ${slide.manifestoType || "missing"}` });
  });

  const pinned = slides.filter((slide) => slide.pinnedFirst);
  if (pinned.length !== 1) issues.push({ level: "error", field: "pinnedFirst", message: `Exactly one slide must be pinned first; found ${pinned.length}.` });

  if (baseline.length) {
    const baselineMap = new Map(baseline.map((slide) => [Number(slide.id), parityShape(slide)]));
    slides.forEach((slide) => {
      const expected = baselineMap.get(Number(slide.id));
      if (!expected) {
        issues.push({ level: "warning", field: `#${slide.id}.parity`, message: "Supabase slide does not exist in the current live snapshot." });
        return;
      }
      if (JSON.stringify(parityShape(slide)) !== JSON.stringify(expected)) issues.push({ level: "warning", field: `#${slide.id}.parity`, message: "Supabase data differs from the current live Hero snapshot." });
    });
    baseline.forEach((slide) => {
      if (!slides.some((item) => Number(item.id) === Number(slide.id))) issues.push({ level: "warning", field: `#${slide.id}.parity`, message: "Live snapshot slide is missing from Supabase." });
    });
  }

  const errors = issues.filter((issue) => issue.level === "error");
  const warnings = issues.filter((issue) => issue.level === "warning");
  return { issues, errors, warnings, healthy: errors.length === 0 && warnings.length === 0 };
}
