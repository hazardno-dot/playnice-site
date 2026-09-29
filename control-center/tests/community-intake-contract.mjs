import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const app = fs.readFileSync(path.join(root, "playnice-site/src/App.js"), "utf8");
const client = fs.readFileSync(
  path.join(root, "playnice-site/src/features/community/communityIntakeClient.js"),
  "utf8"
);
const intakeApi = fs.readFileSync(
  path.join(root, "playnice-site/api/community-intake.js"),
  "utf8"
);
const mirrorApi = fs.readFileSync(
  path.join(root, "playnice-site/api/community-mirror.js"),
  "utf8"
);
const ccApp = fs.readFileSync(path.join(root, "control-center/src/App.jsx"), "utf8");
const managers = fs.readFileSync(
  path.join(root, "control-center/src/ControlCenterManagers.jsx"),
  "utf8"
);

for (const token of [
  "submitCanonicalScentRequest",
  "submitCanonicalJournalFeedback",
  "loadScentRequestTotals"
]) {
  if (!app.includes(token)) {
    throw new Error("Storefront community intake contract missing: " + token);
  }
}

if (app.includes("navigator.sendBeacon")) {
  throw new Error("Journal feedback must wait for canonical acknowledgement.");
}

if (!client.includes("/api/community-intake")) {
  throw new Error("Storefront Community intake must use the same-origin canonical API.");
}
if (!client.includes("/api/community-mirror")) {
  throw new Error("Storefront Community mirror must be queued separately.");
}
if (!client.includes("void fetch")) {
  throw new Error("Sheets mirror must not block the storefront success path.");
}

for (const token of [
  "get_public_scent_request_totals",
  "submit_scent_request_v2",
  "upsert_journal_feedback"
]) {
  if (!intakeApi.includes(token)) {
    throw new Error("Community canonical API contract missing: " + token);
  }
}

for (const token of [
  "mark_scent_request_mirror",
  "mark_journal_feedback_mirror",
  "script.google.com"
]) {
  if (!mirrorApi.includes(token)) {
    throw new Error("Community mirror API contract missing: " + token);
  }
}

if (!ccApp.includes('modules: ["Commerce", "Inventory"]')) {
  throw new Error("Intelligence contract changed.");
}
if (!ccApp.includes('modules: ["Scent Requests", "Journal Feedback"]')) {
  throw new Error("Community modules missing.");
}
if (!managers.includes("<ScentRequestsManager />") || !managers.includes("<JournalFeedbackManager />")) {
  throw new Error("Community managers missing.");
}

console.log("PASS  Community canonical save is independent from Sheets mirror latency");
console.log("PASS  Google Sheets mirror runs through a separate same-origin API");
console.log("PASS  Community CC modules remain mounted");
