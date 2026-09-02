import fs from "node:fs";
import path from "node:path";
import { noteExists, normalizeNotePayload, resolveLiveNote, stableJson, upsertLibraryNote } from "../api/note-apply-engine.mjs";

const root = process.cwd();
const sourcePath = path.join(root, "playnice-site/src/TheNoteMap.jsx");
const source = fs.readFileSync(sourcePath, "utf8");
const api = fs.readFileSync(path.join(root, "control-center/api/create-note-apply.js"), "utf8");
const manager = fs.readFileSync(path.join(root, "control-center/src/NoteApplyManager.jsx"), "utf8");

const bergamot = resolveLiveNote(source, "bergamot");
if (!bergamot || bergamot.payload.srLabel !== "Bergamot" || bergamot.payload.enLabel !== "Bergamot") throw new Error("NOTE_LIBRARY live note resolution failed.");
const edited = upsertLibraryNote(source, { ...bergamot.payload, srLabel: "Bergamot SR Test" });
if (edited.source === source || !edited.source.includes('sr: "Bergamot SR Test"')) throw new Error("Existing NOTE_LIBRARY replacement failed.");
if (!edited.source.includes('ginger: {') || !edited.source.includes('const NOTE_SR = {')) throw new Error("Existing note replacement damaged adjacent source.");

const mandarin = resolveLiveNote(source, "mandarin");
if (!mandarin || mandarin.payload.srLabel !== "Mandarina") throw new Error("NOTE_SR live note resolution failed.");
const promoted = upsertLibraryNote(source, { ...mandarin.payload, enLabel: "Mandarin Orange" });
const promotedLive = resolveLiveNote(promoted.source, "mandarin");
if (!promotedLive || promotedLive.payload.enLabel !== "Mandarin Orange" || promotedLive.payload.srLabel !== "Mandarina") throw new Error("NOTE_SR to NOTE_LIBRARY promotion failed.");

const testKey = "control-center-note-test";
if (noteExists(source, testKey)) throw new Error("Regression test note unexpectedly exists in live source.");
const inserted = upsertLibraryNote(source, { key: testKey, srLabel: "Test nota", enLabel: "Control Center Note Test", assetPath: `/note-map/${testKey}.webp` });
if (!noteExists(inserted.source, testKey)) throw new Error("New NOTE_LIBRARY insertion failed.");
if (stableJson(normalizeNotePayload({ key: testKey, srLabel: "Test nota", enLabel: "Control Center Note Test" })) !== stableJson(resolveLiveNote(inserted.source, testKey).payload)) throw new Error("Inserted note payload does not round-trip.");

for (const token of ["approved_payload", "source_sha", "LIVE DRIFT", "playnice-site/public/note-map", "draft: true", "apply_branch", "apply_pr_number"]) {
  if (!api.includes(token)) throw new Error(`Notes apply API contract missing: ${token}`);
}
for (const token of ["NOTES CONTROLLED APPLY", "/api/create-note-apply", "Prepare apply", "Create draft PR", "NO LIVE CHANGES", "postgres_changes"]) {
  if (!manager.includes(token)) throw new Error(`Notes apply UI contract missing: ${token}`);
}
if (fs.readFileSync(sourcePath, "utf8") !== source) throw new Error("Notes apply regression modified TheNoteMap.jsx on disk.");

console.log("PASS  Notes Controlled Apply resolves NOTE_LIBRARY and NOTE_SR live metadata");
console.log("PASS  existing notes replace/promote safely without collateral source changes");
console.log("PASS  new notes insert as isolated NOTE_LIBRARY entries");
console.log("PASS  asset existence + approved payload + exact source SHA + draft PR guards are present");
console.log("Production untouched: yes (in-memory/static Notes apply regression only)");
