import fs from "node:fs";

const css = fs.readFileSync("control-center/src/inline-validation.css", "utf8");

for (const token of [
  ".inline-validation-floating-head span{font-size:10px",
  ".inline-validation-floating-head strong{font-size:10px",
  ".inline-validation-floating-issues strong{font-size:10px",
  ".inline-validation-floating-issues span{font-size:9px",
  "padding:11px 14px",
]) {
  if (!css.includes(token)) throw new Error(`Live Validation readability contract missing: ${token}`);
}

console.log("PASS  Live Validation uses readable title, status and issue typography");
