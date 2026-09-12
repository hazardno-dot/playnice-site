import { getPreviewWorkflowState } from "../src/previewWorkflowState.mjs";

const same = (actual, expected, label) => {
  if (actual !== expected) throw new Error(`${label}: expected ${expected}, received ${actual}`);
};

let state = getPreviewWorkflowState({
  prepared_at: "2026-09-07T20:00:00.000Z",
});
same(state.id, "no-preview", "Prepared draft without preview");
same(state.label, "APPROVED · READY TO APPLY", "No-preview label");

state = getPreviewWorkflowState({
  prepared_at: "2026-09-07T20:00:00.000Z",
  apply_created_at: "2026-09-07T20:01:00.000Z",
  apply_branch: "cc-create-test",
  apply_pr_number: 115,
});
same(state.id, "qa-required", "Fresh preview");
same(state.qaAllowed, true, "Fresh preview enables QA");

state = getPreviewWorkflowState({
  prepared_at: "2026-09-07T20:05:00.000Z",
  apply_created_at: "2026-09-07T20:01:00.000Z",
  apply_branch: "cc-create-test",
  apply_pr_number: 115,
  preview_verified_at: "2026-09-07T20:02:00.000Z",
});
same(state.id, "refresh-required", "Re-prepared draft invalidates old preview");
same(state.verified, false, "Stale preview cannot remain verified");
same(state.qaAllowed, false, "Stale preview blocks QA");

state = getPreviewWorkflowState({
  prepared_at: "2026-09-07T20:00:00.000Z",
  apply_created_at: "2026-09-07T20:01:00.000Z",
  apply_branch: "cc-create-test",
  apply_pr_number: 115,
  preview_verified_at: "2026-09-07T20:03:00.000Z",
});
same(state.id, "verified", "Verified current preview");
same(state.label, "PREVIEW VERIFIED · READY TO MERGE", "Verified label");

state = getPreviewWorkflowState({
  prepared_at: "2026-09-07T20:05:00.000Z",
  apply_branch: "cc-create-test",
  apply_pr_number: 115,
});
same(state.id, "refresh-required", "Preview metadata without apply_created_at is stale");

console.log("PASS  Product preview workflow distinguishes no-preview, current, stale and verified states");
console.log("PASS  re-preparing a draft after preview forces Refresh preview branch before QA");
console.log("PASS  stale preview can never retain verified merge state");
