import fs from "node:fs";

const optimizer = fs.readFileSync("control-center/src/imageOptimizer.mjs", "utf8");
const controlCenterLogo = fs.readFileSync("control-center/public/playnice-header-logo.svg", "utf8");
const socialPattern = fs.readFileSync("control-center/public/playnice-social-pattern.svg", "utf8");
const siteHeaderLogo = fs.readFileSync("playnice-site/public/playnice-header-logo.svg", "utf8");

for (const required of [
  "patternGridPadding",
  "usableWidth",
  "usableHeight",
  "matrixWidth",
  "matrixHeight",
  "widthFromColumns",
  "widthFromRows",
]) {
  if (!optimizer.includes(required)) {
    throw new Error(`Social pattern full-tile grid is missing ${required}.`);
  }
}

if (optimizer.includes("Math.ceil(targetWidth / panelWidth) + 2")) {
  throw new Error("Social pattern must not overscan columns beyond the canvas.");
}

if (optimizer.includes("Math.ceil(targetHeight / panelHeight) + 2")) {
  throw new Error("Social pattern must not overscan rows beyond the canvas.");
}

if (!optimizer.includes("const startX = Math.round((targetWidth - matrixWidth) / 2);") ||
    !optimizer.includes("const startY = Math.round((targetHeight - matrixHeight) / 2);")) {
  throw new Error("Social pattern matrix must remain centered after full-tile fitting.");
}

const patternReference = 'backgroundPattern: "/playnice-social-pattern.svg"';
if (optimizer.split(patternReference).length - 1 !== 3) {
  throw new Error("All three Social presets must use the composed PlayNice pattern asset.");
}

for (const required of ["Remember. PlayNice.", "www.playniceshop.me"]) {
  if (!socialPattern.includes(required)) {
    throw new Error(`Social pattern is missing complete brand copy: ${required}`);
  }
}

if (socialPattern.includes("M0 -14 7 -7") ||
    socialPattern.includes('Arial, Helvetica, sans-serif" font-size="20"')) {
  throw new Error("Social pattern must not restore the old synthetic/fake logo artwork.");
}

const extractPath = (svg) => {
  const start = svg.indexOf("<path ");
  if (start < 0) return "";
  const end = svg.indexOf("/>", start);
  return end < 0 ? "" : svg.slice(start, end + 2);
};
const normalizeLogoPath = (value = "") =>
  value.replace('fill="url(#g)"', 'fill="url(#gold)"')
       .replace('fill="url(#brandGold)"', 'fill="url(#gold)"');

const canonicalPath = extractPath(siteHeaderLogo);
const patternPath = extractPath(socialPattern);
if (!canonicalPath || !patternPath || normalizeLogoPath(canonicalPath) !== normalizeLogoPath(patternPath)) {
  throw new Error("Social pattern must embed the exact canonical PlayNice header logo geometry.");
}

if (controlCenterLogo !== siteHeaderLogo) {
  throw new Error("Control Center Social logo must exactly match the production site header logo.");
}

console.log("PASS  Social pattern uses centered full tiles with canonical logo geometry and complete brand copy");
