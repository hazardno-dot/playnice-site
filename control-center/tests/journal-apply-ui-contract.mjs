import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const source = fs.readFileSync(path.resolve(here, "../src/JournalApplyManager.jsx"), "utf8");
assert.match(source, /review_status !== "approved"/, "apply controls must only render for approved drafts");
assert.match(source, /prepared_at/, "UI must distinguish prepared state");
assert.match(source, /apply_pr_number/, "UI must expose created PR state");
assert.match(source, /action === "prepare"/, "UI must send explicit prepare action");
assert.match(source, /Create draft PR/, "UI must expose draft PR creation");
assert.match(source, /target="_blank"/, "created PR must be directly openable");
console.log("PASS  Journal Controlled Apply UI state contract");
