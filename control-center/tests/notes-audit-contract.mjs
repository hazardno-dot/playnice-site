import fs from "node:fs";
import { products } from "../../src/data/products/index.js";
import { auditProductNotes, normalizeNoteKey } from "../src/noteAudit.mjs";

const audit = auditProductNotes(products);
if (!audit.uniqueNotes) throw new Error("Notes audit found no referenced note keys.");
if (audit.placements < audit.uniqueNotes) throw new Error("Notes placement count is inconsistent.");
if (!audit.productsWithNotes) throw new Error("Notes audit found no products with note maps.");
if (audit.errors.length) throw new Error(`Notes audit contains structural errors: ${audit.errors.map((issue) => `${issue.product}:${issue.field}:${issue.note || "empty"}`).join(", ")}`);

const missingAssets = audit.rows.filter((row) => !fs.existsSync(`public${row.assetPath}`));
if (missingAssets.length) throw new Error(`Missing note-map assets: ${missingAssets.map((row) => row.key).join(", ")}`);

if (normalizeNoteKey({ key: "Pink-Pepper" }) !== "pink-pepper") throw new Error("Object note-key normalization regressed.");
const synthetic = auditProductNotes([{ slug: "test", name: "Test", noteMap: { top: ["bad key"], heart: ["rose", "rose"], base: [] } }]);
if (!synthetic.errors.some((issue) => issue.note === "bad key")) throw new Error("Non-canonical note keys are not blocked by the audit.");
if (!synthetic.warnings.some((issue) => issue.note === "rose")) throw new Error("Duplicate same-level notes are not reported.");

console.log(`PASS  Notes audit covers ${audit.uniqueNotes} unique notes across ${audit.placements} placements`);
console.log(`PASS  ${audit.productsWithNotes}/${products.length} products contain note-map data`);
console.log(`PASS  all ${audit.uniqueNotes} referenced notes have matching public/note-map WebP assets`);
console.log(`INFO  Notes structural audit: ${audit.errors.length} errors, ${audit.warnings.length} warnings`);
