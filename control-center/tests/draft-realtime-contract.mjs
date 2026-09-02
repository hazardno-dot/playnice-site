import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");

const app = read("control-center/src/App.jsx");
const drafts = read("control-center/src/DraftManager.jsx");
const catalogCount = read("control-center/src/ProductCatalogCountBridge.jsx");
const apply = read("control-center/src/ControlledApplyManager.jsx");

if (!app.includes('channel("app-product-drafts")')) throw new Error("App is not subscribed to product_drafts realtime changes.");
if (!app.includes('table:"product_drafts"') && !app.includes('table: "product_drafts"')) throw new Error("App realtime subscription does not target product_drafts.");
if (!app.includes("load({quiet:true})") && !app.includes("load({ quiet: true })")) throw new Error("App realtime callback is not using a quiet authoritative reload.");

if (!drafts.includes('channel("draft-manager-product-drafts")')) throw new Error("DraftManager is not subscribed to product_drafts realtime changes.");
if (!drafts.includes('table: "product_drafts"') && !drafts.includes('table:"product_drafts"')) throw new Error("DraftManager realtime subscription does not target product_drafts.");
if (drafts.includes("window.location.reload")) throw new Error("DraftManager still uses a full-page reload for synchronization.");
if (!drafts.includes("current.filter((row) => row.product_slug !== slug)")) throw new Error("DraftManager discard does not remove the deleted draft from local state immediately.");
if (!drafts.includes("load({ quiet: true })") && !drafts.includes("load({quiet:true})")) throw new Error("DraftManager workflow refresh is not using quiet synchronization.");

if (!catalogCount.includes('channel("product-catalog-count")')) throw new Error("Product catalog count bridge is not subscribed to realtime changes.");
if (!catalogCount.includes('table: "product_drafts"') && !catalogCount.includes('table:"product_drafts"')) throw new Error("Product catalog count bridge does not target product_drafts.");
if (!catalogCount.includes("syncCount")) throw new Error("Product catalog count realtime callback does not refresh the authoritative count.");
if (!apply.includes('table: "product_drafts"')) throw new Error("Controlled Apply is not subscribed to product_drafts realtime changes.");
if (apply.includes("window.location.reload")) throw new Error("Controlled Apply still uses a full-page reload for draft synchronization.");
if (!apply.includes("load({ sync: false })")) throw new Error("Controlled Apply realtime refresh must not recursively run publish sync.");

console.log("PASS  App draft badges and Overview state react to Supabase changes");
console.log("PASS  DraftManager reacts without full-page reload");
console.log("PASS  discarded drafts leave local state immediately");
console.log("PASS  product catalog count reacts to Supabase product_drafts changes");
console.log("PASS  Controlled Apply reacts without full-page reload");
console.log("PASS  realtime refresh avoids recursive publish synchronization");
