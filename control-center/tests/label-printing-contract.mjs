import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");
const label = fs.readFileSync(path.resolve(root, "control-center/public/PlayNice-Label-Generator.html"), "utf8");

assert.ok(label.includes("size: 100mm 150mm"), "Shipping label must remain fixed at 100x150mm.");
assert.ok(label.includes('CC_LABEL_STORAGE_KEY = "PLAYNICE_CC_LABEL_ORDER"'), "Label generator must accept canonical Control Center order payload.");
assert.ok(label.includes("getControlCenterOrder()"), "Label generator must support direct Control Center loading.");
assert.ok(label.includes("order.subtotal"), "Label COD must preserve existing subtotal semantics.");
assert.ok(label.includes("order.shipping"), "Label must show shipping separately.");
assert.ok(label.includes("order.trackingNumber"), "Label must use the canonical order reference/tracking value.");

assert.ok(label.includes("function formatPhoneME(value)"), "Label generator must normalize Montenegro phone numbers.");
assert.ok(label.includes('return digits.slice(0, 3) + "/" + digits.slice(3, 6) + "-" + digits.slice(6);'), "Label phone output must use 0XX/XXX-XXX format.");

console.log("PASS label printing contract");
