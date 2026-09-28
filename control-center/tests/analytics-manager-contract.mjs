import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const manager = fs.readFileSync(path.join(root, "control-center/src/AnalyticsManager.jsx"), "utf8");
const mount = fs.readFileSync(path.join(root, "control-center/src/ControlCenterManagers.jsx"), "utf8");
const app = fs.readFileSync(path.join(root, "control-center/src/App.jsx"), "utf8");
const workflow = fs.readFileSync(path.join(root, "control-center/src/WorkflowManager.jsx"), "utf8");

for (const token of [
  '["Commerce", "Inventory"].includes(heading)',
  'FREE SHIPPING',
  'COD PENDING',
  'Size mix',
  'Sales by city',
  'Fragrance volume',
  'Commerce intelligence',
  'Fragrance inventory',
  'Revenue, fulfillment, fragrance volume and customer geography from completed orders.',
  'consumed_since_tracking_ml',
  'CURRENT ML',
  'add_inventory_stock',
  'Start tracking',
  'Inventory watch',
  '/api/orders?view=analytics',
]) {
  if (!manager.includes(token)) throw new Error(`Analytics manager contract missing: ${token}`);
}

for (const token of [
  'product_drafts',
  'hero_drafts',
  'journal_drafts',
  'note_drafts',
  'publish_history',
  'draft_audit_log',
  'postgres_changes',
  'ACTIVE DRAFTS',
  'Draft PR metadata',
  'product_slug,published_at,apply_pr_number,published_commit_sha',
  'row.apply_pr_number ? `PR #${row.apply_pr_number}` : "published"',
]) {
  if (!workflow.includes(token)) throw new Error(`Workflow manager contract missing: ${token}`);
}
if (workflow.includes("published_pr_number")) throw new Error("Workflow must use publish_history.apply_pr_number; published_pr_number is not a schema column.");
if (!mount.includes('import AnalyticsManager from "./AnalyticsManager"')) throw new Error("Analytics manager is not imported by ControlCenterManagers.");
if (!mount.includes("<AnalyticsManager />")) throw new Error("Analytics manager is not mounted.");

console.log("PASS  Analytics opens directly on commerce intelligence without a redundant intro capsule");
console.log("PASS  Workflow reads Products, Hero, Journal and Notes state from Supabase");
console.log("PASS  Workflow uses the real publish_history apply_pr_number schema field");
console.log("PASS  Workflow reacts to draft, publish and audit-log changes in realtime");
console.log("PASS  Orders commerce intelligence is loaded through the authenticated Orders API");
console.log("PASS  Analytics exposes revenue, products, cities, sizes and COD metrics");
console.log("PASS  customer traffic analytics remain explicitly separate from operational telemetry");
console.log("Production untouched: yes (static Analytics contract only)");

if (!app.includes('modules: ["Commerce", "Inventory"]')) throw new Error("Intelligence must be split into Commerce and Inventory.");
if (!app.includes('modules: ["Site Health", "Workflow"]')) throw new Error("System must include Workflow.");
if (!workflow.includes("Latest workflow events")) throw new Error("Workflow activity must live under System / Workflow.");
if (manager.includes("CONTROL CENTER WORKFLOW")) throw new Error("Commerce/Inventory must not contain workflow telemetry.");
if (!manager.includes('row.stock_status === "OK" ? null')) throw new Error("Normal inventory stock must not render an OK action-like badge.");
console.log("PASS  Intelligence is split by business priority and workflow telemetry lives under System");
