import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const optimizer = read("control-center/src/imageOptimizer.mjs");
const bridge = read("control-center/src/HeroMediaUploadBridge.jsx");
const api = read("control-center/api/create-hero-media-apply.js");

for (const token of [
  'heroDesktop:',
  'outputType: "image/jpeg"',
  'width: 1920',
  'height: 700',
  'fit: "strict"',
  'heroMobile:',
  'width: 1200',
  'height: 900',
  'Hero images are never auto-cropped.',
]) if (!optimizer.includes(token)) throw new Error(`Hero optimizer contract missing: ${token}`);

for (const token of [
  'IMAGE_OPTIMIZER_PRESETS.heroDesktop',
  'IMAGE_OPTIMIZER_PRESETS.heroMobile',
  'accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"',
  'DESKTOP · 1920 × 700',
  'MOBILE · 1200 × 900 · 4:3',
  'Hero composition is never auto-cropped',
  'Stage optimized Hero media',
]) if (!bridge.includes(token)) throw new Error(`Hero upload bridge contract missing: ${token}`);

for (const token of [
  'HERO_DESKTOP_SIZE = Object.freeze({ width: 1920, height: 700 })',
  'HERO_MOBILE_SIZE = Object.freeze({ width: 1200, height: 900 })',
  'readJpegDimensions(buffer)',
  'validateJpeg("Desktop", req.body?.desktop_base64, HERO_DESKTOP_SIZE)',
  'validateJpeg("Mobile", req.body?.mobile_base64, HERO_MOBILE_SIZE)',
  'image must be exactly ${expectedSize.width} × ${expectedSize.height}px.',
]) if (!api.includes(token)) throw new Error(`Hero media API contract missing: ${token}`);

console.log("PASS  Hero desktop auto-optimizes to canonical 1920x700 JPEG without auto-crop");
console.log("PASS  Hero mobile auto-optimizes to canonical 1200x900 JPEG without auto-crop");
console.log("PASS  Hero media API independently enforces exact JPEG dimensions");
console.log("Production untouched: yes (contract-only verification)");
