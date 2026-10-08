import fs from "node:fs";
import assert from "node:assert/strict";

const source = fs.readFileSync("control-center/server/create-note-apply.cjs", "utf8");
assert.match(source, /git\/blobs/);
assert.match(source, /git\/trees/);
assert.match(source, /git\/commits/);
assert.match(source, /base_tree: baseCommit\.tree\.sha/);
assert.match(source, /encoding: "base64"/);
assert.match(source, /parents: \[parentSha\]/);
assert.match(source, /sha: commit\.sha/);
assert.doesNotMatch(source, /message: `Control Center Notes asset:/);
assert.doesNotMatch(source, /message: `Control Center Notes apply: \$\{noteKey\}`, content:/);
console.log("PASS Notes source and staged WebP share one atomic Git preview commit");
