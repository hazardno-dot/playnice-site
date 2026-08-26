import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const api = fs.readFileSync(path.resolve(here, "../api/create-journal-apply.js"), "utf8");
const manager = fs.readFileSync(path.resolve(here, "../src/JournalApplyManager.jsx"), "utf8");

assert.match(api, /review_status !== "approved"/, "server must require approval");
assert.match(api, /Approved payload no longer matches/, "server must block stale approved payloads");
assert.match(api, /action === "prepare"/, "server must have explicit preparation stage");
assert.match(api, /source_block/, "preparation must persist exact source block");
assert.match(api, /LIVE DRIFT|replaceJournalArticle/, "apply must enforce live drift protection");
assert.match(api, /draft: true/, "GitHub PR must be created as draft");
assert.match(api, /no automatic merge/, "PR contract must explicitly remain no-auto-merge");
assert.doesNotMatch(api, /\/merges\b|merge_pull|merge_method/, "Journal apply API must not merge PRs");
assert.match(manager, /No changes to apply/, "client must block no-change preparation");
assert.match(manager, /Create draft PR/, "client must expose draft PR creation only after prepare");
console.log("PASS  Journal Controlled Apply approval + prepare + drift + draft-PR contract");
