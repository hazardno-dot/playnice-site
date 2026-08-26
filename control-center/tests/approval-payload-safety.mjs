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

console.log("PASS  approval payload equality ignores object key order");
console.log("PASS  approved + prepared aligned payload is apply-safe");
console.log("PASS  payload edits after approval are blocked");
console.log("PASS  missing approved payload is blocked");
console.log("PASS  preparation remains required");
console.log("PASS  array ordering remains significant");
console.log("Production untouched: yes (pure regression only)");
