import assert from "node:assert/strict";
import fs from "node:fs";
import { IMAGE_OPTIMIZER_PRESETS, IMAGE_SOURCE_MAX_BYTES } from "../src/imageOptimizer.mjs";

const uploader = fs.readFileSync("control-center/src/NoteMediaUploadBridge.jsx", "utf8");
const optimizer = fs.readFileSync("control-center/src/imageOptimizer.mjs", "utf8");

assert.equal(IMAGE_SOURCE_MAX_BYTES, 8_000_000);
assert.equal(IMAGE_OPTIMIZER_PRESETS.notes.outputType, "image/webp");
assert.equal(IMAGE_OPTIMIZER_PRESETS.notes.width, 256);
assert.equal(IMAGE_OPTIMIZER_PRESETS.notes.height, 256);
assert.equal(IMAGE_OPTIMIZER_PRESETS.notes.fit, "cover");
assert.equal(IMAGE_OPTIMIZER_PRESETS.notes.maxBytes, 20_000);
assert.ok(optimizer.includes("function drawCover"), "optimizer must provide canonical center-crop cover rendering");
assert.ok(optimizer.includes('if (preset.fit === "cover") drawCover(ctx, image, width, height)'), "fixed-size Notes preset must use cover crop");
assert.ok(optimizer.includes('blob.size <= preset.maxBytes'), "optimizer must gate output by preset byte target");
assert.ok(uploader.includes('optimizeImage(nextFile, NOTE_PRESET)'), "Notes must use the shared optimizer");
assert.ok(uploader.includes('accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"'), "Notes must accept JPG, PNG and WebP sources");
assert.ok(uploader.includes('256 × 256 WebP'), "Notes UI must expose the canonical 256x256 output contract");
assert.ok(uploader.includes('center crop'), "Notes UI must make automatic square crop explicit");
assert.ok(uploader.includes('Stage optimized asset'), "Notes UI must make optimized staging explicit");
assert.ok(!uploader.includes('Note image must be WebP.'), "Notes must no longer require pre-optimized WebP input");

console.log("PASS  shared image optimizer exposes canonical 256x256 Notes WebP preset");
console.log("PASS  Notes accept JPG/PNG/WebP and auto crop/resize/compress before staging");
