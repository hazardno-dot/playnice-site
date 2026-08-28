import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");

const app = read("control-center/src/App.jsx");
const draft = read("control-center/src/DraftManager.jsx");
const nav = read("control-center/src/productNavigation.mjs");

if (!draft.includes('requestOpenProduct(row.product_slug)')) throw new Error("Draft Manager does not use the explicit product navigation bridge.");
if (draft.includes('document.querySelector') || draft.includes('HTMLInputElement.prototype') || draft.includes('setTimeout(() => document.querySelector')) throw new Error("Draft Manager still simulates DOM navigation.");
if (!app.includes('window.addEventListener(OPEN_PRODUCT_EVENT,handleOpenProduct)')) throw new Error("App does not subscribe to explicit product navigation events.");
if (!app.includes('setActive("Products")')) throw new Error("Product navigation does not activate Products directly.");
if (!app.includes('setQuery(slug)')) throw new Error("Product navigation does not align the catalog query with the requested slug.");
if (!app.includes('const live=products.find((p)=>p.slug===slug)')) throw new Error("Product navigation does not resolve live products directly.");
if (!app.includes('const savedDraft=drafts[slug]')) throw new Error("Product navigation does not support draft-only new products.");
if (!app.includes('setEditing(true)')) throw new Error("Draft-only product navigation does not open the editor.");
if (!nav.includes('new CustomEvent(OPEN_PRODUCT_EVENT, { detail: { slug: normalized } })')) throw new Error("Navigation bridge does not carry the product slug explicitly.");

console.log("PASS  Draft Manager uses explicit product navigation");
console.log("PASS  DOM click/search simulation removed from Open product");
console.log("PASS  live and draft-only products resolve through App state");
