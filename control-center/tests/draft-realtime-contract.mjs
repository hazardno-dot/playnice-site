import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");

const managers = read("control-center/src/ControlCenterManagers.jsx");
const apply = read("control-center/src/ControlledApplyManager.jsx");

if (!managers.includes('table: "product_drafts"')) throw new Error("Draft count bridge is not subscribed to product_drafts realtime changes.");
if (!managers.includes("refreshDraftCount")) throw new Error("Draft count realtime callback does not refresh the authoritative count.");
if (!apply.includes('table: "product_drafts"')) throw new Error("Controlled Apply is not subscribed to product_drafts realtime changes.");
if (apply.includes("window.location.reload")) throw new Error("Controlled Apply still uses a full-page reload for draft synchronization.");
if (!apply.includes("load({ sync: false })")) throw new Error("Controlled Apply realtime refresh must not recursively run publish sync.");

console.log("PASS  draft count reacts to Supabase product_drafts changes");
console.log("PASS  Controlled Apply reacts without full-page reload");
console.log("PASS  realtime refresh avoids recursive publish synchronization");
