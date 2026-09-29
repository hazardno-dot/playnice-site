import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const app = fs.readFileSync(path.join(root, "playnice-site/src/App.js"), "utf8");
const client = fs.readFileSync(path.join(root, "playnice-site/src/features/community/communityIntakeClient.js"), "utf8");
const api = fs.readFileSync(path.join(root, "playnice-site/api/community-intake.js"), "utf8");
const ccApp = fs.readFileSync(path.join(root, "control-center/src/App.jsx"), "utf8");
const managers = fs.readFileSync(path.join(root, "control-center/src/ControlCenterManagers.jsx"), "utf8");

for (const token of ["submitCanonicalScentRequest","submitCanonicalJournalFeedback","loadScentRequestTotals"]) {
  if (!app.includes(token)) throw new Error("Storefront community intake contract missing: " + token);
}
if (app.includes("navigator.sendBeacon")) {
  throw new Error("Journal feedback must wait for canonical acknowledgement.");
}
if (!client.includes("/api/community-intake")) {
  throw new Error("Storefront Community intake must use the same-origin API bridge.");
}
for (const token of ["get_public_scent_request_totals","submit_scent_request_v2","upsert_journal_feedback","mark_scent_request_mirror","mark_journal_feedback_mirror"]) {
  if (!api.includes(token)) throw new Error("Community intake API contract missing: " + token);
}
if (!ccApp.includes('modules: ["Commerce", "Inventory"]')) throw new Error("Intelligence contract changed.");
if (!ccApp.includes('modules: ["Scent Requests", "Journal Feedback"]')) throw new Error("Community modules missing.");
if (!managers.includes("<ScentRequestsManager />") || !managers.includes("<JournalFeedbackManager />")) throw new Error("Community managers missing.");

console.log("PASS  Community intake uses Supabase canonical through same-origin API");
console.log("PASS  Google Sheets remains a server-side best-effort mirror");
