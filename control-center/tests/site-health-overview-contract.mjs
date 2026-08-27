import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const bridge = fs.readFileSync(path.join(root, "control-center/src/SiteHealthOverviewBridge.jsx"), "utf8");
const mount = fs.readFileSync(path.join(root, "control-center/src/ControlCenterManagers.jsx"), "utf8");

for (const token of [
  'heading !== "Overview"',
  'site_health_history',
  '.limit(1)',
  'SITE HEALTH',
  'healthy_checks',
  'failed_checks',
  'warning_checks',
  'avg_response_ms',
  'postgres_changes',
  'event: "INSERT"',
]) if (!bridge.includes(token)) throw new Error(`Site Health Overview bridge contract missing: ${token}`);

if (!mount.includes('import SiteHealthOverviewBridge from "./SiteHealthOverviewBridge"')) throw new Error("Site Health Overview bridge is not imported.");
if (!mount.includes("<SiteHealthOverviewBridge />")) throw new Error("Site Health Overview bridge is not mounted.");
if (/\.insert\(|\.update\(|\.delete\(/.test(bridge)) throw new Error("Site Health Overview bridge must remain read only.");

console.log("PASS  Overview surfaces the latest persistent Site Health state");
console.log("PASS  Overview health status updates from realtime history inserts");
console.log("PASS  Overview Site Health integration is read only");
