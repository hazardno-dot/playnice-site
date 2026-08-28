const LEVELS = ["top", "heart", "base"];

export const formatNoteKey = (value) => String(value || "")
  .split("-")
  .filter(Boolean)
  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
  .join(" ");

export function normalizeNoteKey(value) {
  const raw = typeof value === "string"
    ? value
    : value && typeof value === "object"
      ? value.key || value.slug || value.note || value.name || ""
      : "";
  return String(raw || "").trim().toLowerCase();
}

const normalizeEntries = (value) => Array.isArray(value)
  ? value
  : typeof value === "string"
    ? value.split(",")
    : value == null
      ? []
      : [value];

export function auditProductNotes(products = []) {
  const notes = new Map();
  const issues = [];
  let placements = 0;
  let productsWithNotes = 0;

  for (const product of Array.isArray(products) ? products : []) {
    const productNotes = [];
    for (const level of LEVELS) {
      const seenInLevel = new Set();
      for (const entry of normalizeEntries(product?.noteMap?.[level])) {
        const key = normalizeNoteKey(entry);
        if (!key) {
          issues.push({ level: "error", product: product?.slug || product?.name || "unknown", field: `noteMap.${level}`, message: "Empty or unsupported note entry." });
          continue;
        }
        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(key)) {
          issues.push({ level: "error", product: product?.slug || product?.name || "unknown", field: `noteMap.${level}`, note: key, message: "Note key is not a canonical lowercase slug." });
        }
        if (seenInLevel.has(key)) {
          issues.push({ level: "warning", product: product?.slug || product?.name || "unknown", field: `noteMap.${level}`, note: key, message: "Duplicate note in the same level." });
        }
        seenInLevel.add(key);
        placements += 1;
        productNotes.push(key);

        let row = notes.get(key);
        if (!row) {
          row = {
            key,
            label: formatNoteKey(key),
            assetPath: `/note-map/${key}.webp`,
            uses: 0,
            tiers: { top: 0, heart: 0, base: 0 },
            products: new Map(),
          };
          notes.set(key, row);
        }
        row.uses += 1;
        row.tiers[level] += 1;
        const productKey = product?.slug || product?.name || "unknown";
        const linked = row.products.get(productKey) || { slug: product?.slug || "", name: product?.name || productKey, tiers: new Set() };
        linked.tiers.add(level);
        row.products.set(productKey, linked);
      }
    }
    if (productNotes.length) productsWithNotes += 1;
  }

  const rows = [...notes.values()].map((row) => ({
    ...row,
    products: [...row.products.values()].map((product) => ({ ...product, tiers: [...product.tiers] })),
    productCount: row.products.size,
  })).sort((a, b) => b.uses - a.uses || a.label.localeCompare(b.label));

  return {
    rows,
    uniqueNotes: rows.length,
    placements,
    productsWithNotes,
    productsWithoutNotes: Math.max(0, (Array.isArray(products) ? products.length : 0) - productsWithNotes),
    issues,
    errors: issues.filter((issue) => issue.level === "error"),
    warnings: issues.filter((issue) => issue.level === "warning"),
  };
}
