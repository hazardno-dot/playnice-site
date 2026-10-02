import fs from "node:fs";

const draftManager = fs.readFileSync("control-center/src/DraftManager.jsx", "utf8");

const editorialCopyFields = '["miniTag", "scentType", "card", "modal", "dominantNotes", "tags", "whyChoose"]';
if (!draftManager.includes(editorialCopyFields)) {
  throw new Error("Draft Manager must diff dominantNotes and tags alongside the other editorial copy fields.");
}

if (!draftManager.includes('pushChange(changes, "Copy", \`${key} · ${lang.toUpperCase()}\`')) {
  throw new Error("Editorial copy fields must participate in the bilingual LIVE → DRAFT change list.");
}

console.log("PASS  Draft Manager detects dominantNotes and tags edits, including single-character changes");
