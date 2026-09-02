import fs from "node:fs";
import path from "node:path";
import {
  approvalPayloadsEqual,
  getApprovalPayloadState,
  stablePayloadJson,
} from "../src/approvalSafety.mjs";

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const payload = {
  core: { name: "Test", rating: 8.4, moods: "clean, signature" },
  copy: { miniTag: { sr: "Čist", en: "Clean" } },
  discovery: { freshness: 8, longevity: 7 },
};

const sameDifferentKeyOrder = {
  discovery: { longevity: 7, freshness: 8 },
  copy: { miniTag: { en: "Clean", sr: "Čist" } },
  core: { moods: "clean, signature", rating: 8.4, name: "Test" },
};

assert(stablePayloadJson(payload) === stablePayloadJson(sameDifferentKeyOrder), "Object key order must not create false payload drift.");
assert(approvalPayloadsEqual(payload, sameDifferentKeyOrder), "Equivalent payloads should be aligned.");

const aligned = getApprovalPayloadState({
  review_status: "approved",
  prepared_at: "2026-08-26T20:00:00.000Z",
  payload,
  approved_payload: sameDifferentKeyOrder,
});
assert(aligned.safe && aligned.status === "aligned", "Approved prepared equivalent payload must be safe.");

const editedAfterApproval = structuredClone(payload);
editedAfterApproval.core.rating = 8.5;
const drifted = getApprovalPayloadState({
  review_status: "approved",
  prepared_at: "2026-08-26T20:00:00.000Z",
  payload: editedAfterApproval,
  approved_payload: payload,
});
assert(!drifted.safe && drifted.status === "payload-drift", "Editing payload after approval must block apply.");

const missingApproved = getApprovalPayloadState({
  review_status: "approved",
  prepared_at: "2026-08-26T20:00:00.000Z",
  payload,
  approved_payload: null,
});
assert(!missingApproved.safe && missingApproved.status === "missing-approved-payload", "Prepared approval without approved_payload must block apply.");

const notPrepared = getApprovalPayloadState({
  review_status: "approved",
  prepared_at: null,
  payload,
  approved_payload: payload,
});
assert(!notPrepared.safe && notPrepared.status === "not-prepared", "Unprepared approval must not be apply-safe.");

const arrayOrderChanged = {
  ...payload,
  core: { ...payload.core, recommendations: ["a", "b", "c"] },
};
const arrayOrderChangedApproved = {
  ...payload,
  core: { ...payload.core, recommendations: ["b", "a", "c"] },
};
assert(!approvalPayloadsEqual(arrayOrderChanged, arrayOrderChangedApproved), "Array order changes must count as payload drift.");

const root = process.cwd();
const existingApply = fs.readFileSync(path.join(root, "control-center/api/create-apply.js"), "utf8");
const newProductApply = fs.readFileSync(path.join(root, "control-center/api/create-new-product-engine.js"), "utf8");
const publishSync = fs.readFileSync(path.join(root, "control-center/api/sync-publish-status.js"), "utf8");
const vercelConfig = fs.readFileSync(path.join(root, "playnice-site/vercel.json"), "utf8");

for (const source of [existingApply, newProductApply]) {
  assert(source.includes("Approved snapshot is missing"), "Product apply APIs must require an explicit approved snapshot.");
  assert(source.includes("Approved payload no longer matches the current"), "Product apply APIs must block payload drift server-side.");
}
assert(!existingApply.includes("draft.approved_payload || draft.payload"), "Existing product apply must never fall back to mutable draft payload.");
assert(!newProductApply.includes("draft.approved_payload||draft.payload"), "New product apply must never fall back to mutable draft payload.");
assert(publishSync.includes('pr.base?.ref !== "main"'), "Publish sync must verify the tracked PR targets main.");
assert(publishSync.includes("pr.head?.ref !== draft.apply_branch"), "Publish sync must verify the tracked PR head branch.");
assert(vercelConfig.includes("git show -m --first-parent"), "Canonical Shop Vercel config must keep merge-safe diff detection.");
assert(vercelConfig.includes("grep -v '^control-center/'"), "Canonical Shop Vercel config must skip Control Center-only changes.");

console.log("PASS  approval payload equality ignores object key order");
console.log("PASS  approved + prepared aligned payload is apply-safe");
console.log("PASS  payload edits after approval are blocked");
console.log("PASS  missing approved payload is blocked");
console.log("PASS  preparation remains required");
console.log("PASS  array ordering remains significant");
console.log("PASS  product apply APIs enforce approved payload equality server-side");
console.log("PASS  publish sync verifies main base and stored apply head branch");
console.log("PASS  canonical Shop Vercel config keeps merge-safe Control Center skip guard");
console.log("Production untouched: yes (pure regression only)");
