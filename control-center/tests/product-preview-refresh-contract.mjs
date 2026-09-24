import fs from "node:fs";

const repoRoot = process.cwd();
const refreshSource = fs.readFileSync(`${repoRoot}/control-center/server/refresh-product-apply.js`, "utf8");
const routerSource = fs.readFileSync(`${repoRoot}/control-center/server/create-apply-router.js`, "utf8");
const stateSource = fs.readFileSync(`${repoRoot}/control-center/src/previewWorkflowState.mjs`, "utf8");
const managerSource = fs.readFileSync(`${repoRoot}/control-center/src/ControlledApplyManager.jsx`, "utf8");
const engineSource = fs.readFileSync(`${repoRoot}/control-center/lib/create-new-product-engine.mjs`, "utf8");

const requiredRefreshTokens = [
  "apply_branch_refreshed",
  "preview_verified_at: null",
  "apply_created_at: refreshedAt",
  "git/trees",
  "git/commits",
  "force: true",
  "pr.head?.ref !== draft.apply_branch",
  "pr.base?.ref !== \"main\"",
  "base_tree: mainCommit.tree.sha",
  "(?:^|\\\\n|\\\\{|,)",
];
for (const token of requiredRefreshTokens) {
  if (!refreshSource.includes(token)) throw new Error(`Product preview refresh contract missing: ${token}`);
}

if (!routerSource.includes("state?.apply_branch && state?.apply_pr_number")) {
  throw new Error("Product apply router must detect an existing preview branch.");
}
if (!routerSource.includes("refreshProductApply(req, res)")) {
  throw new Error("Product apply router must route existing previews through refresh.");
}
if (!routerSource.includes("createApply(req, res)")) {
  throw new Error("Product apply router must preserve the established new-preview path.");
}
if (!stateSource.includes("row.payload?.core?.savedAt")) {
  throw new Error("Preview freshness must use the actual draft save timestamp when available.");
}

if (!managerSource.includes("const hasExistingPreview = Boolean(row.apply_branch && row.apply_pr_number);")) {
  throw new Error("Controlled Apply UI must still detect an existing preview for workflow state.");
}
if (!managerSource.includes('const isNewProduct = row.baseline_snapshot?.kind === "new_product";')) {
  throw new Error("Controlled Apply UI must distinguish new-product refreshes from live-product refreshes.");
}
if (!managerSource.includes('const endpoint = isNewProduct\n        ? "/api/create-new-product"\n        : "/api/create-apply";')) {
  throw new Error("New products must refresh through /api/create-new-product so the existing PR is rebuilt by the new-product engine.");
}
if (!engineSource.includes("if (draft.apply_branch && draft.apply_pr_number)")) {
  throw new Error("New-product engine must preserve its existing-branch refresh path.");
}
if (!engineSource.includes("new_product_preview_refreshed")) {
  throw new Error("New-product engine must audit preview refreshes.");
}

// Regression fixture: productCopy frequently renders short bilingual groups on one line.
// The refresh parser must recognize a property after a comma, not only after { or a newline.
const inlineMiniTag = '{ sr: "🍊 Citrusni / Čist", en: "🍊 Citrus / Clean" }';
const inlineEn = new RegExp('(?:^|\\n|\\{|,)\\s*(?:["\']en["\']|en)\\s*:\\s*').exec(inlineMiniTag);
if (!inlineEn) {
  throw new Error("Product preview refresh parser must support inline bilingual fields such as miniTag.en.");
}
const inlineValueStart = inlineEn.index + inlineEn[0].length;
const inlineValueEnd = inlineMiniTag.indexOf('}', inlineValueStart);
const inlineValue = inlineMiniTag.slice(inlineValueStart, inlineValueEnd).trim().replace(/,$/, "").trim();
if (inlineValue !== '"🍊 Citrus / Clean"') {
  throw new Error("Inline miniTag.en parser regression fixture did not resolve the expected value.");
}

const { getPreviewWorkflowState } = await import(`../src/previewWorkflowState.mjs?refresh-contract=${Date.now()}`);
const base = {
  apply_branch: "cc-apply-test",
  apply_pr_number: 999,
  prepared_at: "2026-09-08T02:10:00.000Z",
  apply_created_at: "2026-09-08T02:05:00.000Z",
  preview_verified_at: null,
};

const unchangedReprepare = getPreviewWorkflowState({
  ...base,
  payload: { core: { savedAt: "2026-09-08T02:00:00.000Z" } },
});
if (unchangedReprepare.needsRefresh) {
  throw new Error("Re-preparing unchanged draft content must not invalidate a current preview.");
}

const changedAfterPreview = getPreviewWorkflowState({
  ...base,
  payload: { core: { savedAt: "2026-09-08T02:06:00.000Z" } },
});
if (!changedAfterPreview.needsRefresh) {
  throw new Error("A draft saved after preview generation must require preview refresh.");
}

console.log("PASS  Product preview refresh keeps the same PR, routes new products through their dedicated refresh engine, rebuilds live products atomically from main, supports inline bilingual fields and tracks real draft freshness");
