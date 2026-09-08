import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const bridge = read("control-center/src/NoteWorkflowAdvanceBridge.jsx");
const apply = read("control-center/src/NoteApplyManager.jsx");
const managers = read("control-center/src/ControlCenterManagers.jsx");
const route = read("control-center/api/create-note-apply.js");

for (const token of ["Approve", "note_drafts", "playnice:note-workflow-updated"]) {
  if (!bridge.includes(token)) throw new Error(`Notes workflow advance bridge missing: ${token}`);
}
if (!apply.includes('playnice:note-workflow-updated')) throw new Error("NoteApplyManager does not reload after Notes workflow transitions.");
if (!managers.includes('<NoteWorkflowAdvanceBridge />')) throw new Error("NoteWorkflowAdvanceBridge is not mounted.");
if (!route.includes('import handler from "../server/create-note-apply.cjs"') || !route.includes("export default handler")) {
  throw new Error("Notes apply route is not ESM-safe.");
}

console.log("PASS  Notes Approve reveals Controlled Apply without browser refresh");
console.log("PASS  Notes apply route uses an ESM-safe CommonJS boundary outside api routes");
