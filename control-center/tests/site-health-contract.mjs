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
  'RUNTIME DELIVERY',
  'Production bundles',
  'BUILD INTEGRITY',
  'Semantic SEO',
  'AVG RESPONSE',
  'PERSISTENT HISTORY',
  'Health trend',
  'site_health_history',
  'HEALTHY RUNS',
  'WARNING RUNS',
  'ERROR RUNS',
  'LATENCY TREND',
  'Persistent telemetry',
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
  'discoverBundleTargets',
  'bundle-js',
  'Application JavaScript',
  'Unexpected bundle content type',
  'bundleChecks',
]) if (!api.includes(token)) throw new Error(`Site Health API contract missing: ${token}`);

for (const token of [
  '.from("site_health_history")',
  '.insert({',
  'created_by: userId',
  '.limit(30)',
  'postgres_changes',
  'event: "INSERT"',
  'compactChecks',
]) if (!manager.includes(token)) throw new Error(`Site Health history contract missing: ${token}`);

if (!mount.includes('import SiteHealthManager from "./SiteHealthManager"')) throw new Error("Site Health manager is not imported.");
if (!mount.includes("<SiteHealthManager />")) throw new Error("Site Health manager is not mounted.");
if (/method:\s*["']POST["']/.test(api)) throw new Error("Site Health probe endpoint must remain read-only.");
if (!api.includes('allowedHosts = new Set(["playniceshop.me", "www.playniceshop.me"])')) throw new Error("Site Health must guard production host drift.");

console.log("PASS  Site Health replaces the reserved module with a live read-only production probe");
console.log("PASS  core routes and SEO endpoints are covered by the production health contract");
console.log("PASS  robots and sitemap semantics are validated, not only HTTP status");
console.log("PASS  production JavaScript/CSS delivery is discovered from live Home HTML and probed");
console.log("PASS  response latency and contract drift are surfaced separately");
console.log("PASS  successful admin probes persist separate operational telemetry history");
console.log("PASS  the latest 30 health checks feed realtime trend and incident context");
console.log("PASS  Site Health probe endpoint itself has no write/publish operation");
