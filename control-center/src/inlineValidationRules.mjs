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

export const INLINE_DISCOVERY_FIELDS = new Set([
  "freshness",
  "sweetness",
  "warmth",
  "darkness",
  "airiness",
  "cleanliness",
  "creaminess",
  "dryness",
  "fruitiness",
  "spiciness",
  "woodiness",
  "aromaticity",
  "florality",
  "gourmandness",
  "citrus",
  "aquatic",
  "powdery",
  "projection",
  "longevity",
  "office",
  "casual",
  "date",
  "night",
  "summer",
  "winter",
]);

const numberInRange = (value, min, max) => {
  const number = Number(value);
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

  const add = (field, message, level = "error") => {
    issues.push({
      index: field?.index ?? -1,
      field: field?.name || "Editor",
      message,
      level,
    });
  };

  fields.forEach((field) => {
    const name = field.name.toLowerCase();
    const value = field.value.trim();

    if (name === "rating" && !numberInRange(value, 0, 10)) {
      add(field, "Rating must be a number from 0 to 10.");
    }

    if (INLINE_DISCOVERY_FIELDS.has(name) && field.type === "number" && !numberInRange(value, 0, 10)) {
      add(field, "Discovery values must be from 0 to 10.");
    }

    if (field.type === "number" && /ml$/i.test(field.name) && (!Number.isFinite(Number(value)) || Number(value) <= 0)) {
      add(field, "Price must be greater than 0.");
    }

    if (INLINE_REQUIRED_CORE_FIELDS.has(name) && !value) {
      add(field, `${field.name} is required.`);
    }

    if (name.startsWith("wear ·") && !value) {
      add(field, "Wear context is required in both languages.");
    }

    if ((name.includes("· sr") || name.includes("· en")) && INLINE_REQUIRED_COPY_PREFIXES.some((prefix) => name.startsWith(prefix)) && !value) {
      add(field, "Required bilingual copy is missing.");
    }

    if (name.includes("notes · comma separated")) {
      const notes = csv(value);
      if (!notes.length) {
        add(field, "Notes cannot be empty.");
      } else if (knownNoteKeys.size) {
        notes.forEach((note) => {
          if (!knownNoteKeys.has(note)) add(field, `Unknown note key: ${note}. Add it to the Note Library before review.`);
        });
      }
    }

    if (name.includes("recommendation slugs")) {
      const recommendations = csv(value);
      if (recommendations.length !== 3) {
        add(field, "Exactly 3 recommendation slugs are required.");
      } else {
        if (new Set(recommendations).size !== recommendations.length) {
          add(field, "Recommendation slugs must be unique.");
        }
        recommendations.forEach((slug) => {
          if (knownProductSlugs.size && !knownProductSlugs.has(slug)) add(field, `Unknown product slug: ${slug}.`);
          if (selectedSlug && slug === selectedSlug) add(field, "A product cannot recommend itself.");
        });
      }
    }

    if (name.includes("moods · comma separated") && !csv(value).length) {
      add(field, "At least one mood is required.");
    }
  });

  const priceFields = fields.filter((field) => field.type === "number" && /ml$/i.test(field.name));
  if (!priceFields.length) add(null, "At least one size and price is required.");

  return issues;
}
