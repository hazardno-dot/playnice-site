import fs from "node:fs";

for (const path of [
  "control-center/src/SocialInstagramTestPublishBridge.jsx",
  "control-center/src/SocialFacebookTestPublishBridge.jsx",
]) {
  const source = fs.readFileSync(path, "utf8");
  if (!source.includes('String(event?.metadata?.producer || "") === "sync-publish-status"')) {
    throw new Error(`Canonical product publish events are not eligible for manual Meta publishing in ${path}`);
  }
}

console.log("PASS  canonical sync-publish-status product events can use manual Instagram/Facebook controls");
