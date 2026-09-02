import assert from "node:assert/strict";
import fs from "node:fs";
import { journalArticles } from "../../playnice-site/src/data/journal/index.js";
import { auditJournalArticles } from "../src/journalAudit.mjs";
import { normalizeJournalDraftPayload } from "../src/journalDraft.mjs";
import {
  findJournalArticleBlock,
  normalizeJournalArticle,
  renderJournalArticle,
  replaceJournalArticle,
} from "../api/journal-apply-engine.mjs";

const journalPath = new URL("../../playnice-site/src/data/journal/index.js", import.meta.url);
const source = fs.readFileSync(journalPath, "utf8");
const beforeDisk = Buffer.from(source);

const linked = journalArticles.find((article) => Array.isArray(article.links) && article.links.length);
assert.ok(linked, "Journal fixture with CTA links is required");

const expectedLinks = linked.links.map((link) => {
  const normalized = {
    label: {
      sr: String(link?.label?.sr || ""),
      en: String(link?.label?.en || ""),
    },
  };
  if (String(link?.action || "").trim()) normalized.action = String(link.action).trim();
  if (String(link?.url || "").trim()) normalized.url = String(link.url).trim();
  if (link?.external != null) normalized.external = Boolean(link.external);
  return normalized;
});

const draftPayload = normalizeJournalDraftPayload(linked);
assert.deepEqual(draftPayload.links, expectedLinks, "draft normalization must preserve Journal CTA/link metadata");

const applyPayload = normalizeJournalArticle(linked);
assert.deepEqual(applyPayload.links, expectedLinks, "Controlled Apply normalization must preserve Journal CTA/link metadata");

const rendered = renderJournalArticle(applyPayload);
assert.match(rendered, /links:\s*\[/, "renderer must emit Journal links");
if (expectedLinks.some((link) => link.action)) assert.match(rendered, /action:\s*"/, "renderer must emit internal action destinations");
if (expectedLinks.some((link) => link.url)) assert.match(rendered, /url:\s*"https?:\/\//, "renderer must emit external URL destinations");

const located = findJournalArticleBlock(source, linked.id);
const edited = normalizeJournalArticle(linked);
edited.title = { ...edited.title, en: `${edited.title.en} [metadata audit]` };
const replaced = replaceJournalArticle(source, linked.id, located.block, edited);
assert.match(replaced.after, /links:\s*\[/, "existing article replacement must retain links");
for (const link of expectedLinks) {
  const destination = link.action || link.url;
  if (destination) assert.ok(replaced.after.includes(JSON.stringify(destination)), `replacement lost Journal destination: ${destination}`);
}

const base = {
  id: 9999,
  date: { sr: "1 Sep", en: "1 Sep" },
  image: "/journal/test.jpg",
  title: { sr: "Test", en: "Test" },
  excerpt: { sr: "Test", en: "Test" },
  content: { sr: "Test", en: "Test" },
};

const missingLabel = auditJournalArticles([{ ...base, links: [{ action: "shop", label: { sr: "Idi" } }] }]);
assert.ok(missingLabel.errors.some((issue) => issue.field === "links[0].label.en"), "missing bilingual link label must be blocked");

const ambiguousDestination = auditJournalArticles([{ ...base, links: [{ label: { sr: "Idi", en: "Go" }, action: "shop", url: "https://example.com" }] }]);
assert.ok(ambiguousDestination.errors.some((issue) => issue.field === "links[0]"), "link with action + url must be blocked");

const badUrl = auditJournalArticles([{ ...base, links: [{ label: { sr: "Idi", en: "Go" }, url: "javascript:alert(1)", external: true }] }]);
assert.ok(badUrl.errors.some((issue) => issue.field === "links[0].url"), "non-http Journal URL must be blocked");

assert.deepEqual(fs.readFileSync(journalPath), beforeDisk, "final Journal audit must not modify live source on disk");
console.log(`PASS  Journal article #${linked.id} CTA/link metadata survives draft normalization`);
console.log("PASS  Journal Controlled Apply preserves action and external URL link shapes");
console.log("PASS  Journal audit blocks malformed link labels and destinations");
console.log("Production untouched: yes (in-memory/static final Journal audit only)");
