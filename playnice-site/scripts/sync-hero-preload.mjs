import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const configPath = path.join(projectRoot, "src", "data", "heroSlides.generated.js");
const indexPath = path.join(projectRoot, "public", "index.html");

const configSource = fs.readFileSync(configPath, "utf8");
const marker = "export const BASE_HERO_SLIDES = ";
const markerIndex = configSource.indexOf(marker);

if (markerIndex < 0) {
  throw new Error("Hero preload sync: generated Hero config export was not found.");
}

const raw = configSource
  .slice(markerIndex + marker.length)
  .trim()
  .replace(/;\s*$/, "");

let slides;
try {
  slides = JSON.parse(raw);
} catch (error) {
  throw new Error(`Hero preload sync: could not parse generated Hero config (${error.message}).`);
}

const first = Array.isArray(slides) ? slides[0] : null;
const desktopImage = first?.desktopImage || first?.image;
const mobileImage = first?.mobileImage || desktopImage;

if (!first || !desktopImage || !mobileImage) {
  throw new Error("Hero preload sync: first runtime Hero is missing desktop/mobile media.");
}

const indexSource = fs.readFileSync(indexPath, "utf8");
const startMarker = "    <!-- HERO_PRELOAD_START -->";
const endMarker = "    <!-- HERO_PRELOAD_END -->";
const start = indexSource.indexOf(startMarker);
const end = indexSource.indexOf(endMarker);

if (start < 0 || end < 0 || end <= start) {
  throw new Error("Hero preload sync: preload markers were not found in public/index.html.");
}

const preloadBlock = [
  startMarker,
  "    <link",
  "      rel=\"preload\"",
  "      as=\"image\"",
  `      href=\"${mobileImage}\"`,
  "      media=\"(max-width: 768px)\"",
  "      fetchpriority=\"high\"",
  "    />",
  "    <link",
  "      rel=\"preload\"",
  "      as=\"image\"",
  `      href=\"${desktopImage}\"`,
  "      media=\"(min-width: 769px)\"",
  "      fetchpriority=\"high\"",
  "    />",
  endMarker,
].join("\n");

const nextIndex = indexSource.slice(0, start) + preloadBlock + indexSource.slice(end + endMarker.length);

if (nextIndex !== indexSource) {
  fs.writeFileSync(indexPath, nextIndex);
}

console.log(`Hero preload synced to slide ${first.id}: ${mobileImage} / ${desktopImage}`);
