import fs from "node:fs";
import path from "node:path";

const source = fs.readFileSync(path.join(process.cwd(), "control-center/src/ProductBulkPasteBridge.jsx"), "utf8");

for (const token of [
  'donotwearsr: "do_not_wear_sr"',
  'donotwearen: "do_not_wear_en"',
  'whattowearsr: "what_to_wear_sr"',
  'whattowearen: "what_to_wear_en"',
  'doNotWearSR: ...',
  'whatToWearEN: ...',
  'action.fieldKey === "image_path" && current === "/products/"',
]) {
  if (!source.includes(token)) throw new Error(`Bulk editorial context contract missing: ${token}`);
}

console.log("PASS  Bulk product input recognizes Do Not Wear and What To Wear bilingual aliases");
console.log("PASS  New-product /products/ image placeholder is fill-empty eligible");
