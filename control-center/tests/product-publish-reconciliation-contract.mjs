import fs from "node:fs";

const controlledApply = fs.readFileSync("control-center/src/ControlledApplyManager.jsx", "utf8");
const syncPublish = fs.readFileSync("control-center/server/sync-publish-status.js", "utf8");

if (!controlledApply.includes("row.apply_pr_number && row.apply_branch")) {
  throw new Error("Controlled Apply must sync every tracked preview, including manually merged unverified PRs.");
}
if (syncPublish.includes("!draft.preview_verified_at) return json")) {
  throw new Error("Merged PR reconciliation is still blocked by missing preview_verified_at.");
}
if (!syncPublish.includes("reconciledWithoutPreviewVerification")) {
  throw new Error("Publish sync does not record merged-without-Visual-QA reconciliation.");
}
if (!syncPublish.includes("reconciled_without_preview_verification")) {
  throw new Error("Publish response/audit does not expose reconciliation state.");
}

console.log("PASS  merged Product PRs reconcile and clear stale drafts even if formal Visual QA sync was skipped");
