import fs from "node:fs";

const optimizer = fs.readFileSync("control-center/src/imageOptimizer.mjs", "utf8");

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

console.log("PASS  Social pattern uses centered full tiles without clipped edge cells");
