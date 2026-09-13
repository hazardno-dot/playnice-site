import assert from "node:assert/strict";
import { auditAnnouncementDraft } from "../src/announcementDraft.mjs";

const missingSr = auditAnnouncementDraft({ id: "promo-one", enabled: true, text: { sr: "", en: "Hello" }, priority: 10 });
assert.ok(missingSr.errors.includes("SR copy is required."));

const missingSlug = auditAnnouncementDraft({ id: "promo-one", text: { sr: "Ćao", en: "Hello" }, action: "openProduct", priority: 10 });
assert.ok(missingSlug.errors.includes("Product slug is required for openProduct."));

const valid = auditAnnouncementDraft({ id: "promo-one", text: { sr: "Ćao", en: "Hello" }, action: "none", priority: 10 });
assert.deepEqual(valid.errors, []);

console.log("PASS  announcement draft validation contract");
