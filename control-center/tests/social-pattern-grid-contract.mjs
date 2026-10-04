import fs from "node:fs";

const optimizer = fs.readFileSync("control-center/src/imageOptimizer.mjs", "utf8");
const controlCenterLogo = fs.readFileSync("control-center/public/playnice-header-logo.svg", "utf8");
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

if (!optimizer.includes("/playnice-header-logo.svg")) {
  throw new Error("Social presets must use the canonical PlayNice header logo.");
}

if (optimizer.includes("/playnice-social-pattern.svg")) {
  throw new Error("Synthetic Social pattern asset must not be referenced.");
}

if (controlCenterLogo !== siteHeaderLogo) {
  throw new Error("Control Center Social logo must exactly match the production site header logo.");
}

console.log("PASS  Social pattern uses centered full tiles with the canonical PlayNice header logo");
