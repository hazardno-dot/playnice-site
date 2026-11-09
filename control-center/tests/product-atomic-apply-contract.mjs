import fs from "node:fs";
import assert from "node:assert/strict";

const source = fs.readFileSync("control-center/server/create-apply.js", "utf8");
const applySource = source.slice(source.indexOf("export default async function handler("));
assert.ok(applySource.includes("const stagedFiles = new Map()"), "files must be buffered before Git publishing");
assert.ok(applySource.includes("stageFile(filePath, nextSource)"), "all approved files must be staged");
assert.ok(source.includes('async function patchEditorialContext(prefix, label, index, baselineContext, approvedContext, stageFile)'), "editorial context must be staged too");
assert.ok(source.includes("stageFile(filePath, nextSource);\n      return filePath;"), "editorial context must not create intermediate commits");
assert.equal((source.match(/method: "PUT"/g) || []).length, 0, "no per-file GitHub PUT commits allowed");
assert.ok(applySource.includes('git/blobs'), "changed sources must be recorded as Git blobs");
assert.ok(applySource.includes('git/trees'), "one combined Git tree required");
assert.ok(applySource.includes('git/commits'), "one atomic Git commit required");
assert.ok(applySource.includes('parents: [baseSha]'), "atomic commit must be based on verified main");
assert.ok(applySource.includes('latestMain.object.sha !== baseSha'), "concurrent main drift must be blocked before publishing");
assert.equal((applySource.match(/git\/refs/g) || []).length, 2, "only one ref update branch per path (new/refresh)");
assert.ok(applySource.indexOf("const commit = await github(") < applySource.indexOf("const changeLines = changes.map("), "commit must be constructed before PR metadata");
assert.ok(applySource.includes("force: true"), "existing preview branch refresh must remain supported");
for (const guard of ["draft.approved_payload", "stable(draft.payload) !== stable(draft.approved_payload)", "resolveEditorialContextIndex", "patchNoteMap", "patchCopyBlock", "patchDiscoveryBlock"]) {
  assert.ok(source.includes(guard), "missing existing safety validation: " + guard);
}
console.log("PASS existing-product Controlled Apply stages all changed files atomically");
console.log("PASS no intermediate Git ref update and one final Preview branch write");
console.log("PASS approval, editorial context and concurrent main drift checks remain present");
