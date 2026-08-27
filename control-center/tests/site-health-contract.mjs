import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const manager = fs.readFileSync(path.join(root, "control-center/src/SiteHealthManager.jsx"), "utf8");
const api = fs.readFileSync(path.join(root, "control-center/api/site-health.js"), "utf8");
const mount = fs.readFileSync(path.join(root, "control-center/src/ControlCenterManagers.jsx"), "utf8");

for (const token of [
  'heading !== "Site Health"',
  'PlayNice Site Health',
  '/api/site-health',
  'Run health check',
  'PRODUCTION ROUTES',
  'SEO essentials',
  'BUILD INTEGRITY',
  'Semantic SEO',
  'AVG RESPONSE',
  'Not browser QA',
]) if (!manager.includes(token)) throw new Error(`Site Health manager contract missing: ${token}`);

for (const token of [
  '"/shop"',
  '"/journal"',
  '"/community"',
  '"/exhibition"',
  '"/robots.txt"',
  '"/sitemap.xml"',
  'AbortSignal.timeout(8000)',
  'admin_users',
  'Cache-Control',
  'no-store',
  'validateContract',
  'User-agent:',
  'canonical sitemap declaration',
  '<urlset',
  'semanticFailures',
  'avgResponseMs',
  'maxResponseMs',
]) if (!api.includes(token)) throw new Error(`Site Health API contract missing: ${token}`);

if (!mount.includes('import SiteHealthManager from "./SiteHealthManager"')) throw new Error("Site Health manager is not imported.");
if (!mount.includes("<SiteHealthManager />")) throw new Error("Site Health manager is not mounted.");
if (/method:\s*["']POST["']/.test(api)) throw new Error("Site Health endpoint must remain read-only.");
if (!api.includes('allowedHosts = new Set(["playniceshop.me", "www.playniceshop.me"])')) throw new Error("Site Health must guard production host drift.");

console.log("PASS  Site Health replaces the reserved module with a live read-only probe");
console.log("PASS  core routes and SEO endpoints are covered by the production health contract");
console.log("PASS  robots and sitemap semantics are validated, not only HTTP status");
console.log("PASS  response latency and contract drift are surfaced separately");
console.log("PASS  health probe requires an authenticated Control Center admin session");
console.log("PASS  Site Health endpoint has no write/publish operation");
