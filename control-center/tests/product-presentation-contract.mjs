import assert from "node:assert/strict";
import { presentationLimit, NEW_PRODUCT_PRESENTATION_LIMITS, LEGACY_PRESENTATION_LIMITS } from "../src/productPresentationContract.mjs";
import { validateInlineFields } from "../src/inlineValidationRules.mjs";

assert.equal(presentationLimit("card", "en", { isNewProduct: true }), 72);
assert.equal(presentationLimit("modal", "en", { isNewProduct: true }), 160);
assert.equal(presentationLimit("whyChoose", "en", { isNewProduct: true }), 100);
assert.equal(presentationLimit("wear", "en", { isNewProduct: true }), 64);
assert.equal(presentationLimit("modal", "en", { isNewProduct: false }), 230);
assert.equal(NEW_PRODUCT_PRESENTATION_LIMITS.card.en < LEGACY_PRESENTATION_LIMITS.card.en, true);
assert.equal(NEW_PRODUCT_PRESENTATION_LIMITS.modal.en < LEGACY_PRESENTATION_LIMITS.modal.en, true);

const fields = [
  { name: "Name", value: "Contract Test", type: "text" },
  { name: "Short name", value: "Contract", type: "text" },
  { name: "Category", value: "Designer", type: "text" },
  { name: "Image path", value: "/products/contract-test.png", type: "text" },
  { name: "Rating", value: "8.5", type: "number" },
  { name: "Rating label", value: "Test Pick", type: "text" },
  { name: "Season", value: "all", type: "text" },
  { name: "Moods · comma separated", value: "clean, date, signature", type: "text" },
  { name: "2ml", value: "6.5", type: "number" },
  { name: "Top notes · comma separated", value: "bergamot", type: "text" },
  { name: "Heart notes · comma separated", value: "lavender", type: "text" },
  { name: "Base notes · comma separated", value: "vanilla", type: "text" },
  { name: "Recommendation slugs · 3 comma separated", value: "alpha, beta, gamma", type: "text" },
  { name: "Mini tag · SR", value: "Svež i moderan", type: "text" },
  { name: "Mini tag · EN", value: "Fresh and modern", type: "text" },
  { name: "Scent type · SR", value: "Aromatični amber", type: "text" },
  { name: "Scent type · EN", value: "Aromatic amber", type: "text" },
  { name: "Card copy · SR", value: "Bergamot, začini i topla vanila u modernom potpisu.", type: "textarea" },
  { name: "Card copy · EN", value: "Bergamot, spice and warm vanilla in a modern signature.", type: "textarea" },
  { name: "Modal copy · SR", value: "Svež bergamot i aromatični začini prelaze u lavandu, toplu vanilu i ambroksan, ostavljajući snažan i prepoznatljiv trag.", type: "textarea" },
  { name: "Modal copy · EN", value: "Fresh bergamot and aromatic spice move into lavender, warm vanilla and ambroxan, leaving a bold and distinctive trail.", type: "textarea" },
  { name: "Dominant notes · SR", value: "bergamot, lavanda, vanila, ambroksan", type: "text" },
  { name: "Dominant notes · EN", value: "bergamot, lavender, vanilla, ambroxan", type: "text" },
  { name: "Tags · SR", value: "svež, začinski, muževan", type: "text" },
  { name: "Tags · EN", value: "fresh, spicy, masculine", type: "text" },
  { name: "Why choose · SR", value: "Ako želiš snažan, prepoznatljiv i veoma svestran parfem.", type: "textarea" },
  { name: "Why choose · EN", value: "If you want a bold, recognizable and highly versatile fragrance.", type: "textarea" },
  { name: "Wear · SR", value: "Cijele godine; posao, grad, dejt i veče.", type: "textarea" },
  { name: "Wear · EN", value: "Year-round; work, city, dates and evenings.", type: "textarea" },
];

const options = {
  knownProductSlugs: ["alpha", "beta", "gamma"],
  knownNoteKeys: ["bergamot", "lavender", "vanilla"],
  selectedSlug: "contract-test",
  isNewProduct: true,
};

const cleanIssues = validateInlineFields(fields, options);
assert.equal(cleanIssues.filter((issue) => issue.level === "error").length, 0);

const tooLongCard = fields.map((field) => field.name === "Card copy · EN" ? { ...field, value: "x".repeat(73) } : field);
const newProductCardIssues = validateInlineFields(tooLongCard, options);
assert(newProductCardIssues.some((issue) => issue.field === "Card copy · EN" && issue.message.includes("at or below 72")));

const legacyCardIssues = validateInlineFields(tooLongCard, { ...options, isNewProduct: false });
assert.equal(legacyCardIssues.some((issue) => issue.field === "Card copy · EN" && issue.message.includes("at or below 72")), false);

const tooLongModal = fields.map((field) => field.name === "Modal copy · EN" ? { ...field, value: "x".repeat(161) } : field);
assert(validateInlineFields(tooLongModal, options).some((issue) => issue.field === "Modal copy · EN" && issue.message.includes("at or below 160")));

const tooLongWear = fields.map((field) => field.name === "Wear · EN" ? { ...field, value: "x".repeat(65) } : field);
assert(validateInlineFields(tooLongWear, options).some((issue) => issue.field === "Wear · EN" && issue.message.includes("at or below 64")));

console.log("PASS  new Product copy uses tighter card/modal/whyChoose/wear limits");
console.log("PASS  existing products retain legacy limits to avoid retroactive blocking");
console.log("PASS  Sauvage-sized concise copy remains within the new visual contract");
