import fs from "node:fs";

const media = fs.readFileSync("control-center/server/create-hero-media-apply.js", "utf8");
const apply = fs.readFileSync("control-center/server/create-hero-apply.js", "utf8");

for (const token of [
  "rewriteSingleStageCommit",
  "/git/blobs",
  "/git/trees",
  "/git/commits",
  "force: true",
  "Stage Hero media: ${heroKey}",
  "commit_count: 1",
]) {
  if (!media.includes(token)) throw new Error(`Hero media batching contract missing: ${token}`);
}

if (media.includes("Stage Hero media: ${heroKey} ${replacement.label}")) {
  throw new Error("Hero desktop/mobile staging must not create one commit per media variant.");
}

for (const token of [
  "commitBatchToBranch",
  "applyEntries",
  "Apply Hero replacement + Exhibition archive",
  "apply_commit_sha",
  "expected_commit_count: hasMediaStage ? 2 : 1",
]) {
  if (!apply.includes(token)) throw new Error(`Hero apply batching contract missing: ${token}`);
}

for (const legacyMessage of [
  "message: `Archive replaced Hero visual: ${heroKey}`",
  "message: `Archive replaced Hero in Exhibition: ${heroKey}`",
]) {
  if (apply.includes(legacyMessage)) {
    throw new Error("Exhibition archive must be committed atomically with Hero apply.");
  }
}

console.log("PASS  Hero replacement uses one media-stage commit plus one atomic apply/Exhibition commit");
