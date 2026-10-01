import assert from "node:assert/strict";
import fs from "node:fs";

const notesManager = fs.readFileSync("control-center/src/NotesManager.jsx", "utf8");
const noteApplyManager = fs.readFileSync("control-center/src/NoteApplyManager.jsx", "utf8");
const reconcileApi = fs.readFileSync("control-center/server/reconcile-note-drafts.js", "utf8");

assert.ok(notesManager.includes('/api/reconcile-note-drafts'), "Notes Manager must reconcile merged apply PRs.");
assert.ok(notesManager.includes('window.addEventListener("focus", onFocus)'), "Notes reconciliation must run again when the admin returns to Control Center.");
assert.ok(noteApplyManager.includes("Close after merge"), "Notes apply UI must expose a manual close-after-merge fallback.");
assert.ok(noteApplyManager.includes('body: JSON.stringify({ note_key: noteKey })'), "Manual Notes cleanup must target the selected note.");
assert.ok(reconcileApi.includes("pr?.merged_at"), "Notes reconciliation must require GitHub merge evidence.");
assert.ok(reconcileApi.includes('method: "DELETE"'), "Merged Notes drafts must be removed from the active workflow table.");
assert.ok(reconcileApi.includes("PR #") && reconcileApi.includes("is not merged yet"), "Manual cleanup must refuse to close an unmerged PR.");

console.log("PASS  merged Notes PRs automatically leave the active draft workflow with a guarded manual fallback");
