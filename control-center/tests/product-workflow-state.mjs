import assert from "node:assert/strict";
import {
  getProductWorkflowActionLabel,
  getProductWorkflowHistoryLabel,
  getProductWorkflowState,
} from "../src/productWorkflowState.mjs";

const cases = [
  { name: "live only", row: null, label: "LIVE ONLY", tone: "live", action: "" },
  { name: "draft", row: { review_status: "draft" }, label: "DRAFT", tone: "draft", action: "Review draft" },
  { name: "ready for review", row: { review_status: "ready" }, label: "READY FOR REVIEW", tone: "review", action: "Review & approve" },
  { name: "approved", row: { review_status: "approved" }, label: "APPROVED", tone: "approved", action: "Prepare in Drafts" },
  { name: "ready to apply", row: { review_status: "approved", prepared_at: "2026-08-26T18:00:00Z" }, label: "READY TO APPLY", tone: "ready", action: "Review apply" },
  { name: "preview created", row: { review_status: "approved", prepared_at: "2026-08-26T18:00:00Z", apply_pr_number: 38 }, label: "PREVIEW CREATED", tone: "preview", action: "Open draft" },
  { name: "preview verified wins over PR state", row: { review_status: "approved", prepared_at: "2026-08-26T18:00:00Z", apply_pr_number: 38, preview_verified_at: "2026-08-26T19:00:00Z" }, label: "PREVIEW VERIFIED", tone: "verified", action: "Open verified draft" },
];

for (const item of cases) {
  const state = getProductWorkflowState(item.row);
  assert.equal(state.label, item.label, `${item.name}: status label`);
  assert.equal(state.tone, item.tone, `${item.name}: status tone`);
  assert.equal(getProductWorkflowActionLabel(item.row), item.action, `${item.name}: action`);
}

assert.match(getProductWorkflowState({ apply_pr_number: 41 }).detail, /PR #41/, "preview detail must expose the actual PR number");
assert.equal(getProductWorkflowHistoryLabel("prepared"), "Prepared for apply");
assert.equal(getProductWorkflowHistoryLabel("preview_created"), "Preview branch created");
assert.equal(getProductWorkflowHistoryLabel("custom_event"), "Custom Event");
assert.equal(getProductWorkflowHistoryLabel(""), "Workflow Event");

console.log(`Products workflow regression: ${cases.length} lifecycle states + history labels OK`);
