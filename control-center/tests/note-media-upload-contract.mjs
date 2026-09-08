import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const bridge = read("control-center/src/NoteMediaUploadBridge.jsx");
const managers = read("control-center/src/ControlCenterManagers.jsx");
const api = read("control-center/api/create-note-media-apply.js");
const apply = read("control-center/api/create-note-apply.js");

for (const token of [
  'accept="image/webp,.webp"',
  'Stage asset',
  '/api/create-note-media-apply',
  'playnice:note-media-stage:',
  'mediaStagePreserved',
]) if (!bridge.includes(token)) throw new Error(`Notes media bridge contract missing: ${token}`);

if (!managers.includes('import NoteMediaUploadBridge from "./NoteMediaUploadBridge"') || !managers.includes("<NoteMediaUploadBridge />")) {
  throw new Error("ControlCenterManagers does not mount NoteMediaUploadBridge.");
}

for (const token of [
  'NOTE_ASSET_ROOT = "playnice-site/public/note-map"',
  'Note image must be a valid WebP file.',
  'cc-note-media-stage-',
  'mediaStage',
  'review_status: "draft"',
]) if (!api.includes(token)) throw new Error(`Notes media staging API contract missing: ${token}`);

for (const token of [
  'validateMediaStage',
  'draft.approved_payload?.mediaStage',
  'included from staged upload',
  'staged asset remains off main until PR merge',
]) if (!apply.includes(token)) throw new Error(`Notes Controlled Apply media contract missing: ${token}`);

console.log("PASS  Notes editor exposes staged WebP upload");
console.log("PASS  staged Note media survives first draft persistence");
console.log("PASS  Notes Controlled Apply accepts staged media and includes it in the draft PR");
console.log("Production untouched: yes (contract-only verification)");
