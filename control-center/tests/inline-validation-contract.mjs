import assert from "node:assert/strict";
import { validateInlineFields } from "../src/inlineValidationRules.mjs";

const baseFields = [
  { name: "Name", value: "Example", type: "text" },
  { name: "Short name", value: "Example", type: "text" },
  { name: "Category", value: "Niche", type: "text" },
  { name: "Image path", value: "/products/example.webp", type: "text" },
  { name: "Rating", value: "8.5", type: "number" },
  { name: "Rating label", value: "Audience Favorite", type: "text" },
  { name: "Season", value: "all", type: "text" },
  { name: "Moods · comma separated", value: "clean, signature", type: "text" },
  { name: "5ml", value: "9", type: "number" },
  { name: "Top notes · comma separated", value: "bergamot", type: "text" },
  { name: "Heart notes · comma separated", value: "ginger", type: "text" },
  { name: "Base notes · comma separated", value: "moss", type: "text" },
  { name: "Recommendation slugs · 3 comma separated", value: "alpha, beta, gamma", type: "text" },
  { name: "Mini tag · SR", value: "sr", type: "text" },
  { name: "Mini tag · EN", value: "en", type: "text" },
  { name: "Scent type · SR", value: "sr", type: "text" },
  { name: "Scent type · EN", value: "en", type: "text" },
  { name: "Card copy · SR", value: "sr", type: "textarea" },
  { name: "Card copy · EN", value: "en", type: "textarea" },
  { name: "Modal copy · SR", value: "sr", type: "textarea" },
  { name: "Modal copy · EN", value: "en", type: "textarea" },
  { name: "Dominant notes · SR", value: "sr", type: "text" },
  { name: "Dominant notes · EN", value: "en", type: "text" },
  { name: "Tags · SR", value: "sr", type: "text" },
  { name: "Tags · EN", value: "en", type: "text" },
  { name: "Why choose · SR", value: "sr", type: "textarea" },
  { name: "Why choose · EN", value: "en", type: "textarea" },
  { name: "Wear · SR", value: "sr", type: "textarea" },
  { name: "Wear · EN", value: "en", type: "textarea" },
  { name: "Freshness", value: "8", type: "number" },
  { name: "Longevity", value: "7", type: "number" },
];

const options = {
  knownProductSlugs: ["alpha", "beta", "gamma", "current"],
  knownNoteKeys: ["bergamot", "ginger", "moss"],
  selectedSlug: "current",
};

assert.deepEqual(validateInlineFields(baseFields, options), []);

const missingEditorial = baseFields.map((field) =>
  field.name === "Dominant notes · SR" || field.name === "Tags · EN" ? { ...field, value: "" } : field
);
const editorialIssues = validateInlineFields(missingEditorial, options);
assert.equal(editorialIssues.filter((issue) => issue.message === "Required bilingual copy is missing.").length, 2);

const badRecommendations = baseFields.map((field) =>
  field.name.startsWith("Recommendation slugs") ? { ...field, value: "current, alpha, unknown" } : field
);
const recommendationIssues = validateInlineFields(badRecommendations, options);
assert(recommendationIssues.some((issue) => issue.message === "A product cannot recommend itself."));
assert(recommendationIssues.some((issue) => issue.message === "Unknown product slug: unknown."));

const duplicateRecommendations = baseFields.map((field) =>
  field.name.startsWith("Recommendation slugs") ? { ...field, value: "alpha, alpha, gamma" } : field
);
assert(validateInlineFields(duplicateRecommendations, options).some((issue) => issue.message === "Recommendation slugs must be unique."));

const unknownNote = baseFields.map((field) =>
  field.name.startsWith("Top notes") ? { ...field, value: "bergamot, imaginary-note" } : field
);
assert(validateInlineFields(unknownNote, options).some((issue) => issue.message.includes("Unknown note key: imaginary-note")));

const invalidRating = baseFields.map((field) => field.name === "Rating" ? { ...field, value: "11" } : field);
assert(validateInlineFields(invalidRating, options).some((issue) => issue.message === "Rating must be a number from 0 to 10."));

const withoutPrices = baseFields.filter((field) => !/ml$/i.test(field.name));
assert(validateInlineFields(withoutPrices, options).some((issue) => issue.message === "At least one size and price is required."));

console.log("inline validation contract: ok");
