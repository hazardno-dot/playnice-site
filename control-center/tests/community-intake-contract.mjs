import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const app = fs.readFileSync(path.join(root, "playnice-site/src/App.js"), "utf8");
const client = fs.readFileSync(
  path.join(root, "playnice-site/src/features/community/communityIntakeClient.js"),
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
  "loadScentRequestTotals",
  'operation = "vote"',
  '"note"'
]) {
  if (!app.includes(token)) throw new Error(`Storefront community intake contract missing: ${token}`);
}

if (app.includes("navigator.sendBeacon")) {
  throw new Error("Journal feedback must wait for canonical Supabase acknowledgement.");
}

for (const token of [
  "get_public_scent_request_totals",
  "submit_scent_request_v2",
  "upsert_journal_feedback",
  "mark_scent_request_mirror",
  "mark_journal_feedback_mirror",
  "google_sheets_fallback"
]) {
  if (!client.includes(token)) throw new Error(`Community intake client contract missing: ${token}`);
}

if (!ccApp.includes('modules: ["Commerce", "Inventory"]')) {
  throw new Error("Community work must not change the Intelligence contract.");
}
if (!ccApp.includes('modules: ["Scent Requests", "Journal Feedback"]')) {
  throw new Error("Community must contain Scent Requests and Journal Feedback.");
}
if (!managers.includes("<ScentRequestsManager />") || !managers.includes("<JournalFeedbackManager />")) {
  throw new Error("Both Community managers must remain mounted.");
}

console.log("PASS  Supabase is canonical for public Community intake");
console.log("PASS  Google Sheets remains a best-effort mirror/fallback");
console.log("PASS  Journal success waits for canonical acknowledgement");
console.log("PASS  Community CC modules stay mounted without changing Intelligence");
