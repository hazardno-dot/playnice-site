import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const NO_BUILD_PREFIXES = [".github/", "docs/"];
const NO_BUILD_EXACT = new Set([
  "README.md",
  ".gitignore",
  "scripts/vercel-ignore-build.test.mjs",
]);

const ROUTER_SOURCE = "scripts/vercel-ignore-build.mjs";
const CC_EXTERNAL_PRODUCT_PREFIX = "playnice-site/src/data/products/";
const CC_EXTERNAL_EXCLUDE = /^playnice-site\/src\/data\/products\/product(?:DoNotWear|WhatToWear)Context(?:\.part[0-9]+)?\.js$/;

const normalize = (value) => String(value || "").trim().replace(/^\.\//, "").replace(/\\/g, "/");

export function classifyPath(path) {
  const file = normalize(path);
  if (!file) return { storefront: false, controlCenter: false, reason: "empty" };

  if (NO_BUILD_EXACT.has(file) || NO_BUILD_PREFIXES.some((prefix) => file.startsWith(prefix))) {
    return { storefront: false, controlCenter: false, reason: "non-deploying" };
  }

  if (file === ROUTER_SOURCE) {
    return { storefront: true, controlCenter: true, reason: "routing-infrastructure" };
  }

  if (file.startsWith("control-center/")) {
    return { storefront: false, controlCenter: true, reason: "control-center" };
  }

  if (file.startsWith("playnice-site/")) {
    const controlCenter = file.startsWith(CC_EXTERNAL_PRODUCT_PREFIX) && !CC_EXTERNAL_EXCLUDE.test(file);
    return { storefront: true, controlCenter, reason: controlCenter ? "shared-product-data" : "storefront" };
  }

  // Unknown root-level files are treated conservatively. A new shared config should
  // build both projects until it is explicitly classified above.
  return { storefront: true, controlCenter: true, reason: "unknown-shared-root" };
}

export function shouldBuild(target, changedFiles) {
  if (!["storefront", "control-center"].includes(target)) {
    throw new Error(`Unknown Vercel deployment target: ${target}`);
  }
  return changedFiles.some((file) => {
    const classification = classifyPath(file);
    return target === "storefront" ? classification.storefront : classification.controlCenter;
  });
}

function git(args) {
  return execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
}

export function changedFilesFromGit(env = process.env) {
  const current = env.VERCEL_GIT_COMMIT_SHA || "HEAD";
  const previous = String(env.VERCEL_GIT_PREVIOUS_SHA || "").trim();

  if (previous && !/^0+$/.test(previous)) {
    try {
      const output = git(["diff", "--name-only", previous, current]);
      return [...new Set(output.split(/\r?\n/).map(normalize).filter(Boolean))];
    } catch {
      // Fall through to a single-commit diff. Vercel can use a shallow checkout
      // where the last successful deployment SHA is not available locally.
    }
  }

  try {
    const output = git(["show", "-m", "--first-parent", "--pretty=", "--name-only", current]);
    return [...new Set(output.split(/\r?\n/).map(normalize).filter(Boolean))];
  } catch {
    // Fail open: if Git history cannot be inspected, force a build rather than
    // silently skipping a potentially important production change.
    return ["__VERCEL_ROUTING_GIT_FALLBACK__"];
  }
}

function runCli() {
  const target = process.argv[2];
  const files = changedFilesFromGit();
  const build = shouldBuild(target, files);
  const action = build ? "BUILD" : "SKIP";
  console.log(`[vercel-routing] ${target}: ${action} (${files.length} changed file${files.length === 1 ? "" : "s"})`);
  for (const file of files) console.log(`[vercel-routing] - ${file}`);

  // Vercel ignoreCommand contract: exit 0 = skip build, exit 1 = continue build.
  process.exit(build ? 1 : 0);
}

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) runCli();
