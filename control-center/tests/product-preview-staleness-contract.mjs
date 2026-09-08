import { getPreviewWorkflowState } from "../src/previewWorkflowState.mjs";

const base = {
  apply_branch: "cc-apply-test",
  apply_pr_number: 123,
  preview_verified_at: null,
};

const reprepareOnly = getPreviewWorkflowState({
  ...base,
  payload: { core: { savedAt: "2026-09-08T01:42:12.084Z" } },
  apply_created_at: "2026-09-08T01:58:16.921Z",
  prepared_at: "2026-09-08T02:02:54.654Z",
});

if (reprepareOnly.needsRefresh || !reprepareOnly.qaAllowed || reprepareOnly.id !== "qa-required") {
  throw new Error("Re-preparing unchanged draft content must not invalidate a current preview.");
}

const changedAfterPreview = getPreviewWorkflowState({
  ...base,
  payload: { core: { savedAt: "2026-09-08T02:03:00.000Z" } },
  apply_created_at: "2026-09-08T01:58:16.921Z",
  prepared_at: "2026-09-08T02:03:01.000Z",
});

if (!changedAfterPreview.needsRefresh || changedAfterPreview.id !== "refresh-required") {
  throw new Error("A draft content save after preview creation must require preview refresh.");
}

const legacyFallback = getPreviewWorkflowState({
  ...base,
  payload: { core: {} },
  apply_created_at: "2026-09-08T01:58:16.921Z",
  prepared_at: "2026-09-08T02:03:01.000Z",
});

if (!legacyFallback.needsRefresh) {
  throw new Error("Legacy drafts without savedAt must retain prepared_at fallback safety.");
}

console.log("PASS  product preview staleness follows draft content savedAt, not re-prepare time");
