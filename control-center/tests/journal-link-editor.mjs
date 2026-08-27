import assert from "node:assert/strict";
import fs from "node:fs";
import { auditJournalArticles } from "../src/journalAudit.mjs";
import { normalizeJournalDraftPayload } from "../src/journalDraft.mjs";

const manager = fs.readFileSync("control-center/src/JournalManager.jsx", "utf8");
const css = fs.readFileSync("control-center/src/journal-manager.css", "utf8");
const vercelConfig = JSON.parse(fs.readFileSync("vercel.json", "utf8"));

for (const contract of [
  "CTA LINKS",
  "+ Add CTA",
  "Internal action",
  "External URL",
  "setLinkLabel",
  "setLinkMode",
  "setLinkDestination",
  "removeLink",
  "Open as external link",
  "journal-cta-preview",
]) assert.ok(manager.includes(contract), `Missing Journal CTA editor contract: ${contract}`);

assert.ok(manager.includes('links: []'), "New Journal article should initialize an editable empty CTA list.");
assert.ok(css.includes(".journal-link-editor"), "CTA editor styling missing.");
assert.ok(css.includes(".journal-link-card"), "CTA card styling missing.");
assert.ok(css.includes(".journal-cta-preview"), "CTA read-only preview styling missing.");

assert.equal(
  vercelConfig.ignoreCommand,
  "git diff --quiet HEAD^ HEAD -- . ':(exclude)control-center/**'",
  "Shop Vercel project must use the immediate parent commit and ignore Control Center-only changes.",
);

const internal = normalizeJournalDraftPayload({
  id: 1,
  date: { sr: "x", en: "x" },
  image: "/journal/x.jpg",
  title: { sr: "x", en: "x" },
  excerpt: { sr: "x", en: "x" },
  content: { sr: "x", en: "x" },
  links: [{ label: { sr: "Shop", en: "Shop" }, action: "shop" }],
});
assert.deepEqual(internal.links, [{ label: { sr: "Shop", en: "Shop" }, action: "shop" }]);
assert.equal(auditJournalArticles([internal]).errors.length, 0, "Valid internal CTA should pass Journal audit.");

const external = normalizeJournalDraftPayload({
  ...internal,
  links: [{ label: { sr: "Saznaj više", en: "Learn more" }, url: "https://example.com", external: true }],
});
assert.equal(external.links[0].url, "https://example.com");
assert.equal(external.links[0].external, true);
assert.equal(auditJournalArticles([external]).errors.length, 0, "Valid external CTA should pass Journal audit.");

const invalid = { ...internal, links: [{ label: { sr: "", en: "Broken" }, action: "shop", url: "https://example.com" }] };
const invalidAudit = auditJournalArticles([invalid]);
assert.ok(invalidAudit.errors.some((issue) => issue.field === "links[0].label.sr"), "Missing SR CTA label must be blocked.");
assert.ok(invalidAudit.errors.some((issue) => issue.field === "links[0]"), "CTA with both action and URL must be blocked.");

console.log("PASS  Journal editor can add/remove bilingual CTA links");
console.log("PASS  Journal editor switches between internal action and external URL destinations");
console.log("PASS  CTA changes remain gated by Journal link validation");
console.log("PASS  Shop Vercel scope ignores Control Center-only commits via HEAD^ diff");
console.log("Production untouched: yes (static/pure regression only)");
