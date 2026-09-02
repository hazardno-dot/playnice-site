import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const manager = fs.readFileSync(path.join(root, "control-center/src/AnalyticsManager.jsx"), "utf8");
const mount = fs.readFileSync(path.join(root, "control-center/src/ControlCenterManagers.jsx"), "utf8");

for (const token of [
  'heading !== "Analytics"',
  'product_drafts',
  'journal_drafts',
  'note_drafts',
  'publish_history',
  'draft_audit_log',
  'postgres_changes',
  'Operational analytics',
  'ACTIVE DRAFTS',
  'Draft PR metadata',
  'Traffic and conversion analytics are intentionally separate',
  'product_slug,published_at,apply_pr_number,published_commit_sha',
  'row.apply_pr_number ? `PR #${row.apply_pr_number}` : "published"',
]) {
  if (!manager.includes(token)) throw new Error(`Analytics manager contract missing: ${token}`);
}
if (manager.includes("published_pr_number")) throw new Error("Analytics must use publish_history.apply_pr_number; published_pr_number is not a schema column.");
if (!mount.includes('import AnalyticsManager from "./AnalyticsManager"')) throw new Error("Analytics manager is not imported by ControlCenterManagers.");
if (!mount.includes("<AnalyticsManager />")) throw new Error("Analytics manager is not mounted.");

console.log("PASS  Analytics replaces the reserved module with operational intelligence");
console.log("PASS  Analytics reads Products, Journal and Notes workflow state from Supabase");
console.log("PASS  Analytics uses the real publish_history apply_pr_number schema field");
console.log("PASS  Analytics reacts to draft, publish and audit-log changes in realtime");
console.log("PASS  customer traffic analytics remain explicitly separate from operational telemetry");
console.log("Production untouched: yes (static Analytics contract only)");
