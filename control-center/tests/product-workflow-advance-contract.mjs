import fs from "node:fs";
import path from "node:path";

const bridgePath = path.resolve(process.cwd(), "control-center/src/ProductWorkflowAdvanceBridge.jsx");
const managersPath = path.resolve(process.cwd(), "control-center/src/ControlCenterManagers.jsx");
const appPath = path.resolve(process.cwd(), "control-center/src/App.jsx");

const bridge = fs.readFileSync(bridgePath, "utf8");
const managers = fs.readFileSync(managersPath, "utf8");
const app = fs.readFileSync(appPath, "utf8");

const requiredBridgeTokens = [
  'const PREPARE_LABEL = "Prepare apply"',
  'prepared_at',
  'document.querySelector(".draft-manager-close")?.click()',
  'findOverviewButton()?.click()',
  'window.dispatchEvent(new Event("focus"))',
  'window.scrollTo({ top: 0, behavior: "smooth" })',
];

for (const token of requiredBridgeTokens) {
  if (!bridge.includes(token)) throw new Error(`Product workflow auto-advance contract missing: ${token}`);
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
console.log("PASS  Prepare apply closes Draft Manager and advances to Overview");
console.log("PASS  workflow state refresh is requested after Product preparation");
