import fs from "node:fs";

const draftManager = fs.readFileSync("control-center/src/DraftManager.jsx", "utf8");

if (!draftManager.includes("if (!quiet) {\n        setDraftsAvailable(false);")) {
  throw new Error("Quiet draft refresh failures must not surface as blocking UI errors.");
}
if (!draftManager.includes("if (!quiet) setError(\"\");")) {
  throw new Error("Successful foreground draft loads must clear stale errors.");
}

console.log("PASS  transient realtime draft refresh failures do not show blocking errors");
