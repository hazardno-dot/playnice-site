import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const manager = fs.readFileSync(path.resolve(here, "../src/JournalApplyManager.jsx"), "utf8");
const api = fs.readFileSync(path.resolve(here, "../api/create-journal-apply.js"), "utf8");
for (const field of ["baseline_snapshot", "prepared_at", "apply_branch", "apply_pr_number"]) {
  assert.ok(manager.includes(field) || api.includes(field), `${field} must remain part of Journal apply state`);
}
console.log("PASS  Journal Controlled Apply persisted-state contract");
