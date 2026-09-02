import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  findJournalArticleBlock,
  getJournalArticleIds,
  getNextJournalArticleId,
  insertJournalArticle,
  journalArticleExists,
} from "../api/journal-apply-engine.mjs";

const source = await readFile(new URL("../../playnice-site/src/data/journal/index.js", import.meta.url), "utf8");
const ids = getJournalArticleIds(source);
assert.ok(ids.length >= 20, "expected current Journal catalog");
assert.equal(new Set(ids).size, ids.length, "Journal ids must be unique");

const nextId = getNextJournalArticleId(source);
assert.equal(nextId, Math.max(...ids) + 1);

const article = {
  id: nextId,
  date: { sr: "27 Avg", en: "27 Aug" },
  image: "/journal/control-center-new-article-test.jpg",
  title: { sr: "Novi članak", en: "New article" },
  excerpt: { sr: "Test novog članka.", en: "New article test." },
  content: {
    sr: "Prvi red.\nDrugi red sa `backtick` i ${placeholder}.",
    en: "First line.\nSecond line with `backtick` and ${placeholder}.",
  },
  relatedProducts: [],
};

const inserted = insertJournalArticle(source, article);
assert.ok(journalArticleExists(inserted.source, nextId));
assert.equal(getNextJournalArticleId(inserted.source), nextId + 1);
const located = findJournalArticleBlock(inserted.source, nextId);
assert.match(located.block, new RegExp(`id:\\s*${nextId}`));
assert.match(located.block, /control-center-new-article-test\.jpg/);
assert.match(located.block, /\\`backtick\\`/);
assert.match(located.block, /\\\$\{placeholder\}/);

const closeIndex = source.lastIndexOf("\n];");
assert.ok(closeIndex > 0);
assert.ok(inserted.source.startsWith(source.slice(0, closeIndex)), "existing Journal source before array close must stay byte-identical");
assert.ok(inserted.source.endsWith(source.slice(closeIndex)), "array closing suffix must stay byte-identical");

assert.throws(() => insertJournalArticle(inserted.source, article), /already exists|next sequential/i);
assert.throws(() => insertJournalArticle(source, { ...article, id: nextId + 1 }), /next sequential id/i);

const manager = await readFile(new URL("../src/JournalManager.jsx", import.meta.url), "utf8");
const applyManager = await readFile(new URL("../src/JournalApplyManager.jsx", import.meta.url), "utf8");
const api = await readFile(new URL("../api/create-journal-apply.js", import.meta.url), "utf8");

assert.match(manager, /const nextArticleId = useMemo/);
assert.match(manager, /\+ New article/);
assert.match(manager, /draftOnly/);
assert.match(manager, /\.insert\(\{ article_id: articleId, payload, created_by: authData\.user\.id \}\)/);
assert.match(applyManager, /action === "prepare" && liveArticle/);
assert.match(applyManager, /baseline_snapshot\?\.mode === "insert"/);
assert.match(api, /mode: "insert"/);
assert.match(api, /file\.sha !== draft\.baseline_snapshot\.source_sha/);
assert.match(api, /getNextJournalArticleId\(source\) !== articleId/);
assert.match(api, /insertJournalArticle\(source, approved\)/);

console.log(`PASS  new Journal article uses automatic sequential id #${nextId}`);
console.log("PASS  first save inserts a distinct draft without overwriting an existing article id");
console.log("PASS  new article Controlled Apply uses exact source SHA + sequential-id drift guards");
console.log("Production untouched: yes (in-memory/static regression only)");
