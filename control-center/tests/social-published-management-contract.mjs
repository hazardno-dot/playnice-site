import fs from "node:fs";

const router = fs.readFileSync("control-center/api/router.js", "utf8");
const server = fs.readFileSync("control-center/server/social-published-management.js", "utf8");
const manager = fs.readFileSync("control-center/src/SocialManager.jsx", "utf8");

if (!router.includes('"social-published-management"')) {
  throw new Error("Published Social management API is not routed.");
}

for (const action of [
  "test_instagram_feed_published",
  "test_instagram_story_published",
  "test_facebook_published",
]) {
  if (!server.includes(action)) throw new Error(`Published management does not resolve ${action}.`);
}

for (const action of [
  "published_instagram_feed_deleted",
  "published_instagram_story_deleted",
  "published_facebook_deleted",
]) {
  if (!server.includes(action) || !manager.includes(action)) {
    throw new Error(`Published deletion audit contract is missing ${action}.`);
  }
}

if (!server.includes('action === "open"') || !server.includes('method: "DELETE"')) {
  throw new Error("Published management must support open and delete operations.");
}

if (!manager.includes("Open live post") || !manager.includes("Delete from Meta")) {
  throw new Error("Published management controls are missing from Social Manager.");
}

console.log("PASS  Published Social management exposes audited Open live post and Delete from Meta controls");
