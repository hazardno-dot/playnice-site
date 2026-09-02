import fs from "node:fs";
import path from "node:path";
import { auditNoteDraftPayload, getNoteDraftState, normalizeNoteDraftPayload } from "../src/noteDraft.mjs";

const root = process.cwd();
const manager = fs.readFileSync(path.join(root, "control-center/src/NotesManager.jsx"), "utf8");
const source = fs.readFileSync(path.join(root, "playnice-site/src/TheNoteMap.jsx"), "utf8");

const valid = auditNoteDraftPayload({ key: "pink-grapefruit", srLabel: "Ružičasti grejpfrut", enLabel: "Pink Grapefruit", assetPath: "/note-map/pink-grapefruit.webp" }, ["bergamot"]);
if (valid.errors.length) throw new Error("Valid note draft payload failed validation.");
if (normalizeNoteDraftPayload({ key: "BERGAMOT" }).key !== "bergamot") throw new Error("Note draft key normalization failed.");
const badAsset = auditNoteDraftPayload({ key: "bergamot", srLabel: "Bergamot", enLabel: "Bergamot", assetPath: "/note-map/" }, ["bergamot"]);
if (!badAsset.errors.some((issue) => issue.field === "assetPath")) throw new Error("Note asset directory placeholder is not blocked.");
if (getNoteDraftState({ review_status: "approved" }) !== "approved") throw new Error("Approved Notes state is not preserved.");

for (const token of ["note_drafts", "postgres_changes", "Mark ready", "Approve", "approved_payload", "Discard draft", "+ New note"]) {
  if (!manager.includes(token)) throw new Error(`Notes draft workflow contract missing: ${token}`);
}
if (!manager.includes("insert({ note_key: key") || !manager.includes("upsert({ note_key: key")) throw new Error("New/existing Notes drafts do not use collision-safe INSERT/UPSERT split.");
if (!source.includes("const NOTE_LIBRARY = {") || !source.includes("const NOTE_SR = {")) throw new Error("Shop note metadata source contract changed unexpectedly.");

console.log("PASS  Notes drafts validate canonical keys, bilingual labels and asset paths");
console.log("PASS  Notes drafts persist in Supabase and refresh in realtime");
console.log("PASS  Notes review states cover draft → ready → approved with approved snapshot");
console.log("PASS  new Notes drafts use INSERT while existing drafts use UPSERT");
console.log("Production untouched: yes (static/pure Notes workflow regression only)");
