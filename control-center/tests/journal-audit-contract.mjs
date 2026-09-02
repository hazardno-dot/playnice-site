import { journalArticles } from "../../playnice-site/src/data/journal/index.js";
import { products } from "../../playnice-site/src/data/products/index.js";
import { auditJournalArticles } from "../src/journalAudit.mjs";

const audit = auditJournalArticles(journalArticles, products.map((product) => product.slug));
if (audit.total !== journalArticles.length) throw new Error("Journal audit lost article rows.");
if (!audit.total) throw new Error("Journal library is empty.");
if (audit.rows.some((row) => !Number.isInteger(row.id) || row.id <= 0)) throw new Error("Journal contains invalid ids.");
if (new Set(audit.rows.map((row) => row.id)).size !== audit.rows.length) throw new Error("Journal ids are not unique.");

const badImage = auditJournalArticles([{ id: 999, date: { sr: "x", en: "x" }, title: { sr: "x", en: "x" }, excerpt: { sr: "x", en: "x" }, content: { sr: "x", en: "x" }, image: "/journal/" }]);
if (!badImage.errors.some((issue) => issue.field === "image")) throw new Error("Journal image directory placeholder is not blocked.");

const badRelated = auditJournalArticles([{ id: 1000, date: { sr: "x", en: "x" }, title: { sr: "x", en: "x" }, excerpt: { sr: "x", en: "x" }, content: { sr: "x", en: "x" }, image: "/journal/test.webp", relatedProducts: ["missing-product"] }], ["known-product"]);
if (!badRelated.errors.some((issue) => issue.field === "relatedProducts")) throw new Error("Unknown Journal related product is not blocked.");

console.log(`PASS  Journal audit covers ${audit.total} articles`);
console.log(`PASS  ${audit.complete}/${audit.total} current articles are structurally complete`);
console.log(`INFO  current Journal audit: ${audit.errors.length} errors, ${audit.warnings.length} warnings`);
