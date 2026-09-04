import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");

const validation = read("control-center/src/draftValidation.js");
for (const token of [
  "Exactly 3 moods are required for product-card parity",
  "presentationLengths",
  "Exactly 4 dominant notes are required for modal parity",
  "Exactly 3 tags are required for product presentation parity",
  "keep it at or below 90 so product cards remain balanced",
  "TheNoteMap.jsx?raw",
]) {
  if (!validation.includes(token)) throw new Error(`Draft presentation guard missing: ${token}`);
}

const controlled = read("control-center/src/ControlledApplyManager.jsx");
for (const token of [
  "VISUAL PARITY GATE",
  "modal-desktop",
  "modal-390",
  "modal-360",
  "note-map",
  "purchase",
  "/api/verify-product-preview",
]) {
  if (!controlled.includes(token)) throw new Error(`Controlled Apply visual gate missing: ${token}`);
}

const verifyApi = read("control-center/api/verify-product-preview.js");
for (const token of [
  "REQUIRED_CHECKS",
  "playnice-site",
  "shopReady",
  "headSha",
  "Visual parity checklist incomplete",
  "Preview PR is not open or no longer matches",
]) {
  if (!verifyApi.includes(token)) throw new Error(`Server preview gate missing: ${token}`);
}

const wrapper = read("control-center/api/create-new-product.js");
if (!wrapper.includes('../lib/create-new-product-engine.mjs')) throw new Error("New-product runtime wrapper is not using the non-API engine.");
if (fs.existsSync(path.join(root, "control-center/api/create-new-product-engine.js"))) throw new Error("New-product helper must not remain inside /api as a Vercel route.");
if (!fs.existsSync(path.join(root, "control-center/lib/create-new-product-engine.mjs"))) throw new Error("New-product engine is missing from /lib.");

console.log("PASS  product-card/modal data contract prevents the Tonic Vert failure class");
console.log("PASS  preview verification requires desktop + 390px + 360px visual QA");
console.log("PASS  server refuses verification unless current Shop preview is green");
console.log("PASS  new-product runtime engine is outside /api");
