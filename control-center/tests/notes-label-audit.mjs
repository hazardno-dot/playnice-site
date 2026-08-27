import fs from "node:fs";
import { products } from "../../src/data/products/index.js";
import { auditProductNotes } from "../src/noteAudit.mjs";
import { auditNoteLabels, parseNoteLabels } from "../src/noteLabelAudit.mjs";

const source = fs.readFileSync(new URL("../../src/TheNoteMap.jsx", import.meta.url), "utf8");
const structural = auditProductNotes(products);
const parsed = parseNoteLabels(source);
const labels = auditNoteLabels(structural.rows, source);

if (!Object.keys(parsed.library).length) throw new Error("NOTE_LIBRARY parser returned no entries.");
if (!Object.keys(parsed.sr).length) throw new Error("NOTE_SR parser returned no entries.");
if (labels.rows.length !== structural.uniqueNotes) throw new Error("Label audit lost referenced note rows.");
if (labels.enCovered !== structural.uniqueNotes) throw new Error(`English label coverage is incomplete: ${labels.enCovered}/${structural.uniqueNotes}.`);
if (labels.fallbackSrCount) throw new Error(`Serbian label coverage has ${labels.fallbackSrCount} fallback key(s).`);
if (labels.errors.length) throw new Error(`Note label audit has ${labels.errors.length} error(s).`);

console.log(`PASS  Notes labels cover SR ${labels.srCovered}/${structural.uniqueNotes} and EN ${labels.enCovered}/${structural.uniqueNotes}`);
console.log(`PASS  ${labels.customLibraryCount} referenced notes use NOTE_LIBRARY overrides`);
console.log(`INFO  ${labels.orphanSr.length} NOTE_SR keys and ${labels.orphanLibrary.length} NOTE_LIBRARY keys are currently unused by products`);
console.log(`INFO  Notes label audit: ${labels.errors.length} errors, ${labels.warnings.length} warnings`);
