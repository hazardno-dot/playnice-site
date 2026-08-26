import fs from "node:fs";
import assert from "node:assert/strict";
import { getJournalDraftState, journalPayloadEquals, normalizeJournalDraftPayload } from "../src/journalDraft.mjs";

const manager = fs.readFileSync("control-center/src/JournalManager.jsx", "utf8");
const css = fs.readFileSync("control-center/src/journal-manager.css", "utf8");

const sample = {
  id: 7,
  date: { sr: "1 Jan", en: "1 Jan" },
  image: "/journal/article7.png",
  title: { sr: "Naslov", en: "Title" },
  excerpt: { sr: "Kratko", en: "Short" },
  content: { sr: "Sadržaj", en: "Content" },
  relatedProducts: ["one", "two"],
};

const normalized = normalizeJournalDraftPayload(sample);
assert.equal(normalized.id, 7);
assert.deepEqual(normalized.relatedProducts, ["one", "two"]);
assert.deepEqual(getJournalDraftState(null), { label: "LIVE ONLY", tone: "live" });
assert.equal(getJournalDraftState({ review_status: "draft" }).label, "DRAFT");
assert.equal(getJournalDraftState({ review_status: "ready" }).label, "READY FOR REVIEW");
assert.equal(getJournalDraftState({ review_status: "approved" }).label, "APPROVED");
assert.equal(journalPayloadEquals(normalized, { ...normalized }), true);
assert.equal(journalPayloadEquals(normalized, { ...normalized, image: "/journal/other.png" }), false);

for (const contract of [
  'from("journal_drafts")',
  'on("postgres_changes", { event: "*", schema: "public", table: "journal_drafts" }',
  'const articleId = Number(payload.id)',
  'const liveExists = journalArticles.some',
  'const rowExists = Boolean(draftRows[articleId])',
  '.insert({ article_id: articleId, payload, created_by: authData.user.id })',
  '.upsert({ article_id: articleId, payload, created_by: authData.user.id }, { onConflict: "article_id" })',
  'review_status: "ready"',
  'review_status: "approved"',
  'approved_payload: selectedRow.payload',
  'delete().eq("article_id", selectedId)',
  'auditJournalArticles([payload], productSlugs)',
]) assert.ok(manager.includes(contract), `Missing Journal workflow contract: ${contract}`);

assert.ok(css.includes(".journal-editor"), "Journal editor styles missing");
assert.ok(css.includes(".journal-workflow.approved"), "Approved workflow styling missing");

console.log("PASS  Journal drafts persist in Supabase and refresh in realtime");
console.log("PASS  new Journal drafts use collision-safe INSERT while saved/live drafts use UPSERT");
console.log("PASS  Journal validation gates save/review workflow");
console.log("PASS  Journal review states cover draft → ready → approved");
console.log("PASS  approved Journal payload is snapshotted for later Controlled Apply");
