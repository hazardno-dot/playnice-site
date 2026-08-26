import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { journalArticles } from "../../src/data/journal/index.js";
import { findJournalArticleBlock, normalizeJournalArticle, renderJournalArticle, replaceJournalArticle, stableJson } from "../api/journal-apply-engine.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const journalPath = path.resolve(here, "../../src/data/journal/index.js");
const source = fs.readFileSync(journalPath, "utf8");
const beforeDisk = Buffer.from(source);
const article = journalArticles.find((item) => Number(item.id) === 20) || journalArticles[journalArticles.length - 1];
assert.ok(article, "Journal fixture article is required");

const located = findJournalArticleBlock(source, article.id);
assert.ok(located.block.includes(`id: ${article.id}`), "existing article block must be located by id");
console.log("PASS  existing Journal article resolves from live source");

const approved = normalizeJournalArticle(article);
approved.title = { ...approved.title, en: `${approved.title.en} [controlled apply regression]` };
const result = replaceJournalArticle(source, article.id, located.block, approved);
assert.notEqual(result.source, source, "approved change must produce a source change");
assert.ok(result.after.includes("controlled apply regression"), "approved title must render into article block");
assert.equal(result.source.slice(0, located.start), source.slice(0, located.start), "bytes before target article must remain unchanged");
assert.equal(result.source.slice(located.start + result.after.length), source.slice(located.end), "bytes after target article must remain unchanged");
console.log("PASS  existing article replacement is isolated to one Journal object");

assert.throws(() => replaceJournalArticle(source, article.id, `${located.block}\n// stale`, approved), /LIVE DRIFT/, "stale source baseline must be blocked");
console.log("PASS  exact source-block drift guard blocks stale preparation");

const tricky = normalizeJournalArticle(article);
tricky.content = { ...tricky.content, en: "Backtick ` and interpolation ${must-not-run} stay text." };
const rendered = renderJournalArticle(tricky);
assert.ok(rendered.includes("\\`"), "backticks must be escaped in template literals");
assert.ok(rendered.includes("\\${must-not-run}"), "template interpolation must be escaped");
console.log("PASS  Journal renderer escapes template-literal hazards");

assert.equal(stableJson(normalizeJournalArticle(article)), stableJson(normalizeJournalArticle(article)), "stable comparison must be deterministic");
assert.deepEqual(fs.readFileSync(journalPath), beforeDisk, "regression must not modify live Journal data on disk");
console.log("Production untouched: yes (in-memory Journal apply regression only)");
