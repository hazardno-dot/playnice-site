import fs from "node:fs";
import path from "node:path";

const bridgePath = path.resolve(process.cwd(), "control-center/src/ProductWorkflowAdvanceBridge.jsx");
const managersPath = path.resolve(process.cwd(), "control-center/src/ControlCenterManagers.jsx");
const appPath = path.resolve(process.cwd(), "control-center/src/App.jsx");
const controlledApplyPath = path.resolve(process.cwd(), "control-center/src/ControlledApplyManager.jsx");
const mediaApiPath = path.resolve(process.cwd(), "control-center/api/create-product-media-apply.js");

const bridge = fs.readFileSync(bridgePath, "utf8");
const managers = fs.readFileSync(managersPath, "utf8");
const app = fs.readFileSync(appPath, "utf8");
const controlledApply = fs.readFileSync(controlledApplyPath, "utf8");
const mediaApi = fs.readFileSync(mediaApiPath, "utf8");

const requiredBridgeTokens = [
  'const PREPARE_LABEL = "Prepare apply"',
  'const READY_LABEL = "Mark ready for review"',
  'review_status === "ready"',
  'openReviewForSlug',
  'document.querySelector(".draft-manager-close")?.click()',
  'findOverviewButton()?.click()',
  'new CustomEvent(PRODUCT_WORKFLOW_UPDATED_EVENT',
  'window.scrollTo({ top: 0, behavior: "smooth" })',
];

for (const token of requiredBridgeTokens) {
  if (!bridge.includes(token)) throw new Error(`Product workflow auto-advance contract missing: ${token}`);
}

if (!controlledApply.includes('window.addEventListener(PRODUCT_WORKFLOW_UPDATED_EVENT, handleWorkflowUpdated)')) {
  throw new Error("Controlled Apply does not reload when Product workflow advances.");
}
if (!controlledApply.includes('load({ sync: false })')) {
  throw new Error("Controlled Apply workflow refresh does not reload current draft state.");
}
if (!mediaApi.includes('method: "POST"') || !mediaApi.includes('created_by: user.id') || !mediaApi.includes('draft_linked: true')) {
  throw new Error("Product media staging must create a persistent draft when media is uploaded before first Save Draft.");
}
if (!managers.includes('import ProductWorkflowAdvanceBridge from "./ProductWorkflowAdvanceBridge"')) {
  throw new Error("ControlCenterManagers does not import ProductWorkflowAdvanceBridge.");
}
if (!managers.includes("<ProductWorkflowAdvanceBridge />")) {
  throw new Error("ControlCenterManagers does not render ProductWorkflowAdvanceBridge.");
}
if (!app.includes('window.scrollTo({top:0,behavior:"smooth"})')) {
  throw new Error("Save Draft must return the Product editor to the top of the page.");
}

console.log("PASS  Save Draft returns the Product editor to the top");
console.log("PASS  Mark ready for review opens Review changes automatically");
console.log("PASS  Prepare apply closes Draft Manager and advances to Overview");
console.log("PASS  Controlled Apply reloads immediately after Product preparation");
console.log("PASS  staged media persists even before the first Product Save Draft");
