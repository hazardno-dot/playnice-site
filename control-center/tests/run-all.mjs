import fs from "node:fs";
import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const controlCenterDir = path.resolve(here, "..");
const repoRoot = path.resolve(controlCenterDir, "..");

// Vercel builds this project with control-center as Root Directory, while a
// number of existing contracts intentionally resolve files from the monorepo
// root via process.cwd(). Run the suite from that same canonical root so local
// and Vercel execution have identical path semantics. This process-level cwd
// change does not affect the following `vite build` shell command.
process.chdir(repoRoot);

const self = path.basename(fileURLToPath(import.meta.url));
const files = fs.readdirSync(here)
  .filter((name) => name.endsWith(".mjs") && name !== self)
  .sort();

let passed = 0;
for (const file of files) {
  process.stdout.write(`\n=== ${file} ===\n`);
  await import(`${pathToFileURL(path.join(here, file)).href}?run=${Date.now()}-${passed}`);
  passed += 1;
}

console.log(`\nPASS  ${passed} Control Center contract test files`);
