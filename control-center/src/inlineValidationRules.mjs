const csv = (value) => String(value ?? "").split(",").map((part) => part.trim()).filter(Boolean);

export const INLINE_REQUIRED_CORE_FIELDS = new Set([
  "name",
  "short name",
  "category",
  "image path",
  "rating label",
  "season",
]);

export const INLINE_REQUIRED_COPY_PREFIXES = [
  "mini tag",
  "scent type",
  "card copy",
  "modal copy",
  "dominant notes",
  "tags",
  "why choose",
];

const PRESENTATION_LIMITS = [
  ["mini tag", 32],
  ["scent type", 42],
  ["card copy", { sr: 82, en: 92 }],
  ["modal copy", 230],
  ["why choose", 125],
];

export const INLINE_DISCOVERY_FIELDS = new Set([
  "freshness", "sweetness", "warmth", "darkness", "airiness", "cleanliness",
  "creaminess", "dryness", "fruitiness", "spiciness", "woodiness", "aromaticity",
  "florality", "gourmandness", "citrus", "aquatic", "powdery", "projection",
  "longevity", "office", "casual", "date", "evening", "elegance", "versatility",
  "masculine", "feminine", "unisex",
]);

const numberInRange = (value, min, max) => {
  const text = String(value ?? "").trim();
  if (!text) return false;
  const number = Number(text);
  return Number.isFinite(number) && number >= min && number <= max;
};

const normalizeField = (field, index) => ({
  index,
  name: String(field?.name || "Field").trim(),
  value: String(field?.value ?? ""),
  type: String(field?.type || "text").toLowerCase(),
});

export function validateInlineFields(rawFields, options = {}) {
  const fields = (rawFields || []).map(normalizeField);
  const issues = [];
  const knownProductSlugs = new Set(options.knownProductSlugs || []);
  const knownNoteKeys = new Set(options.knownNoteKeys || []);
  const selectedSlug = String(options.selectedSlug || "").trim();
  const isNewProduct = Boolean(options.isNewProduct);

  const add = (field, message, level = "error") => {
    issues.push({ index: field?.index ?? -1, field: field?.name || "Editor", message, level });
  };

  fields.forEach((field) => {
    const name = field.name.toLowerCase();
    const value = field.value.trim();

    if (name === "rating" && !numberInRange(value, 0, 10)) add(field, "Rating must be a number from 0 to 10.");
    if (INLINE_DISCOVERY_FIELDS.has(name) && field.type === "number" && !numberInRange(value, 0, 10)) add(field, "Discovery values must be explicitly entered from 0 to 10.");
    if (field.type === "number" && /ml$/i.test(field.name) && (!value || !Number.isFinite(Number(value)) || Number(value) <= 0)) add(field, "Price must be greater than 0.");
    if (INLINE_REQUIRED_CORE_FIELDS.has(name) && !value) add(field, `${field.name} is required.`);

    if (name === "image path" && value && (!value.startsWith("/products/") || value === "/products/" || value.endsWith("/"))) {
      add(field, "Use a specific product image file under /products/, not a directory placeholder.");
    }

    if (isNewProduct && name.startsWith("badge") && !value) add(field, "A new product must have a presentation badge.");
    if (isNewProduct && name.startsWith("inspired by") && name.includes("name") && !value) add(field, "A new product must define the modal reference/original-creation label.");

    if (name.startsWith("wear ·")) {
      if (!value) add(field, "Wear context is required in both languages.");
      if (value.length > 90) add(field, `Wear context is ${value.length} characters; keep it at or below 90.`);
    }

    if ((name.includes("· sr") || name.includes("· en")) && INLINE_REQUIRED_COPY_PREFIXES.some((prefix) => name.startsWith(prefix))) {
      if (!value) add(field, "Required bilingual copy is missing.");
      const lang = name.includes("· sr") ? "sr" : "en";
      PRESENTATION_LIMITS.forEach(([prefix, limit]) => {
        if (!name.startsWith(prefix) || !value) return;
        const max = typeof limit === "object" ? limit[lang] : limit;
        if (value.length > max) add(field, `Copy is ${value.length} characters; keep it at or below ${max}.`);
      });
    }

    if (name.includes("dominant notes") && csv(value).length !== 4) add(field, "Exactly 4 dominant notes are required.");
    if (name.startsWith("tags") && csv(value).length !== 3) add(field, "Exactly 3 tags are required.");

    const isPyramidNotes = name.startsWith("top notes") || name.startsWith("heart notes") || name.startsWith("base notes");
    if (isPyramidNotes) {
      const notes = csv(value);
      if (!notes.length) add(field, "Notes cannot be empty.");
      else if (knownNoteKeys.size) notes.forEach((note) => {
        if (!knownNoteKeys.has(note)) add(field, `Unknown note key: ${note}. Add it to the Note Library before review.`);
      });
    }

    if (name.includes("recommendation slugs")) {
      const recommendations = csv(value);
      if (recommendations.length !== 3) add(field, "Exactly 3 recommendation slugs are required.");
      else {
        if (new Set(recommendations).size !== recommendations.length) add(field, "Recommendation slugs must be unique.");
        recommendations.forEach((slug) => {
          if (knownProductSlugs.size && !knownProductSlugs.has(slug)) add(field, `Unknown product slug: ${slug}.`);
          if (selectedSlug && slug === selectedSlug) add(field, "A product cannot recommend itself.");
        });
      }
    }

    if (name.includes("moods · comma separated") && csv(value).length !== 3) add(field, "Exactly 3 moods are required.");
  });

  const priceFields = fields.filter((field) => field.type === "number" && /ml$/i.test(field.name));
  if (!priceFields.length) add(null, "At least one size and price is required.");

  return issues;
}
