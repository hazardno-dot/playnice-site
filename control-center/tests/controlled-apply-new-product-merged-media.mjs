import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const source = fs.readFileSync(path.join(root, "control-center/lib/create-new-product-engine.mjs"), "utf8");
const { __test } = await import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`);
const slug = "rayhaan-vantage";
const stageBranch = "cc-product-media-stage-rayhaan-vantage-202611172231";
const mergedSha = "94a285c54bd8736406641a186cfc68a060e97266";
const files = __test.expectedMediaPaths(slug);
const product = { slug, mediaStage: { branch: stageBranch, files, baseSha: "base" } };
const previousFetch = globalThis.fetch;

async function withMock(mode, run) {
  const calls = [];
  globalThis.fetch = async (url) => {
    const u = new URL(url);
    calls.push(u.pathname + u.search);
    const respond = (status, body) => ({ ok: status < 400, status, json: async () => body });
    if (u.pathname.includes("/git/ref/heads/")) return respond(mode === "present" ? 200 : 404, mode === "present" ? { object: { sha: "staged" } } : { message: "Not Found" });
    if (u.pathname.endsWith("/pulls")) {
      return respond(200, mode === "unmerged" ? [] : [{
        number: 555,
        merged_at: "2026-11-17T22:39:51Z",
        head: { ref: stageBranch },
        base: { ref: "main" },
        merge_commit_sha: mergedSha
      }]);
    }
    if (u.pathname.endsWith("/pulls/555/files")) return respond(200,
      (mode === "missing-image" ? files.slice(0, 1) : files).map(filename => ({ filename, status: "added" }))
    );
    if (u.pathname.includes("/contents/")) {
      const isMain = u.searchParams.get("ref") === "main";
      return respond(200, { sha: mode === "changed-image" && isMain ? "different" : "matching-blob" });
    }
    throw new Error(`Unexpected GitHub request: ${u.pathname}`);
  };
  try { return await run(calls); } finally { globalThis.fetch = previousFetch; }
}

await withMock("present", async calls => {
  assert.equal(await __test.resolveMediaSourceRef(product), stageBranch);
  assert.equal(calls.length, 1, "Normal staged media should not inspect merged PRs");
});
await withMock("merged", async calls => {
  assert.equal(await __test.resolveMediaSourceRef(product), "main");
  assert(calls.some(x => x.includes("/pulls?")), "Must validate merged PR");
  assert(calls.some(x => x.includes("/pulls/555/files")), "Must validate media paths");
});
for (const [mode, expected] of [
  ["unmerged", /without a verified merge/],
  ["missing-image", /does not contain both/],
  ["changed-image", /changed on main/]
]) {
  await withMock(mode, async () => {
    await assert.rejects(__test.resolveMediaSourceRef(product), expected);
  });
}
await withMock("merged", async () => {
  await assert.rejects(__test.resolveMediaSourceRef({
    ...product, mediaStage: { ...product.mediaStage, branch: "untrusted-branch" }
  }), /missing or invalid/);
});
console.log("PASS merged media-stage fallback accepts only verified, unchanged Shop + Just In assets");
console.log("PASS missing/unmerged/altered assets remain blocked");
