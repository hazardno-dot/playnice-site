import assert from "node:assert/strict";
import fs from "node:fs";
import { IMAGE_OPTIMIZER_PRESETS } from "../src/imageOptimizer.mjs";

const optimizer = fs.readFileSync("control-center/src/imageOptimizer.mjs", "utf8");
const journalManager = fs.readFileSync("control-center/src/JournalManager.jsx", "utf8");
const journalApi = fs.readFileSync("control-center/api/create-journal-media-apply.js", "utf8");

const journal = IMAGE_OPTIMIZER_PRESETS.journal;
assert.equal(journal.outputType, "image/webp");
assert.equal(journal.maxEdge, 1600);
assert.equal(journal.maxBytes, 500_000);
assert.deepEqual(journal.scales, [1, 0.88, 0.76, 0.64]);
assert.deepEqual(journal.qualities, [0.84, 0.78, 0.72, 0.66]);

assert.ok(optimizer.includes("const fitScale = longest > preset.maxEdge ? preset.maxEdge / longest : 1;"), "shared optimizer must preserve Journal max-edge behavior");
assert.ok(optimizer.includes("const scales = (preset.scales || [1]).map"), "shared optimizer must preserve Journal downscale fallback behavior");
assert.ok(journalManager.includes("JPG / PNG / WebP → optimized WebP · max 1600px edge · target ≤ 500 KB"), "Journal UI contract must remain unchanged during shared-engine migration");
assert.ok(journalApi.includes("500_000"), "Journal backend must preserve <=500 KB WebP guard");
assert.ok(journalApi.includes("RIFF") && journalApi.includes("WEBP"), "Journal backend must keep WebP signature validation");

console.log("PASS  Shared Journal preset matches the proven Journal optimizer contract");
console.log("PASS  Journal max-edge, fallback scales and quality ladder are preserved exactly");
console.log("PASS  Journal staging backend keeps <=500 KB WebP validation");
console.log("Production untouched: yes (contract-only verification)");
