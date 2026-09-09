import assert from "node:assert/strict";
import fs from "node:fs";
import { IMAGE_OPTIMIZER_PRESETS, IMAGE_SOURCE_MAX_BYTES } from "../src/imageOptimizer.mjs";

const uploader = fs.readFileSync("control-center/src/NoteMediaUploadBridge.jsx", "utf8");
const optimizer = fs.readFileSync("control-center/src/imageOptimizer.mjs", "utf8");

assert.equal(IMAGE_SOURCE_MAX_BYTES, 8_000_000);
assert.equal(IMAGE_OPTIMIZER_PRESETS.notes.outputType, "image/webp");
assert.equal(IMAGE_OPTIMIZER_PRESETS.notes.maxEdge, 1024);
assert.equal(IMAGE_OPTIMIZER_PRESETS.notes.maxBytes, 200_000);
assert.ok(optimizer.includes('ctx.drawImage(image, 0, 0, width, height)'), "optimizer must preserve aspect ratio through fit resize");
assert.ok(optimizer.includes('blob.size <= preset.maxBytes'), "optimizer must gate output by preset byte target");
assert.ok(uploader.includes('optimizeImage(nextFile, NOTE_PRESET)'), "Notes must use the shared optimizer");
assert.ok(uploader.includes('accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"'), "Notes must accept JPG, PNG and WebP sources");
assert.ok(uploader.includes('Stage optimized asset'), "Notes UI must make optimized staging explicit");
assert.ok(!uploader.includes('Note image must be WebP.'), "Notes must no longer require pre-optimized WebP input");

console.log("PASS  shared image optimizer exposes a Notes WebP preset");
console.log("PASS  Notes accept JPG/PNG/WebP and auto resize/compress before staging");
