export const getProductWorkflowState = (row) => {
  if (!row) return { label: "LIVE ONLY", tone: "live", detail: "No unpublished draft for this product." };
  if (row.preview_verified_at) return { label: "PREVIEW VERIFIED", tone: "verified", detail: "Preview was manually verified. Merge remains manual." };
  if (row.apply_pr_number) return { label: "PREVIEW CREATED", tone: "preview", detail: `PR #${row.apply_pr_number} is waiting for manual Preview verification.` };
  if (row.review_status === "approved" && row.prepared_at) return { label: "READY TO APPLY", tone: "ready", detail: "Approved and prepared. Controlled Apply can create a Preview branch." };
  if (row.review_status === "approved") return { label: "APPROVED", tone: "approved", detail: "Approved draft. Pre-publish preparation is still required." };
  if (row.review_status === "ready") return { label: "READY FOR REVIEW", tone: "review", detail: "Draft is ready for manual review." };
  return { label: "DRAFT", tone: "draft", detail: "Unpublished Supabase draft." };
};

export const getProductWorkflowActionLabel = (row) => {
  if (!row) return "";
  if (row.preview_verified_at) return "Open verified draft";
  if (row.apply_pr_number) return "Open draft";
  if (row.review_status === "approved" && row.prepared_at) return "Review apply";
  if (row.review_status === "approved") return "Prepare in Drafts";
  if (row.review_status === "ready") return "Review & approve";
  return "Review draft";
};

export const PRODUCT_WORKFLOW_ACTION_LABELS = Object.freeze({
  created: "Draft created",
  saved: "Draft saved",
  updated: "Draft updated",
  marked_ready: "Ready for review",
  approved: "Approved",
  returned_to_draft: "Returned to draft",
  prepared: "Prepared for apply",
  apply_created: "Preview branch created",
  preview_created: "Preview branch created",
  preview_verified: "Preview verified",
  published: "Published live",
  discarded: "Draft discarded",
});

export const getProductWorkflowHistoryLabel = (action) =>
  PRODUCT_WORKFLOW_ACTION_LABELS[action]
  || String(action || "Workflow event")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
