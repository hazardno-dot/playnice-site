import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const cronPath = path.join(root, "control-center", "api", "social-scheduler-cron.js");
const vercelPath = path.join(root, "control-center", "vercel.json");

const cron = fs.readFileSync(cronPath, "utf8");
const vercel = JSON.parse(fs.readFileSync(vercelPath, "utf8"));

assert.match(cron, /process\.env\.CRON_SECRET/);
assert.match(cron, /process\.env\.SUPABASE_SERVICE_ROLE_KEY/);
assert.match(cron, /req\.headers\.authorization !== `Bearer \$\{CRON_SECRET\}`/);
assert.match(cron, /p_publish_mode:\s*"shadow"/);
assert.match(cron, /network_requested:\s*false/);
assert.match(cron, /meta_publish_requested:\s*false/);
assert.match(cron, /MAX_EVENTS_PER_RUN\s*=\s*10/);
assert.match(cron, /req\.method !== "GET"/);

const schedule = Array.isArray(vercel.crons)
  ? vercel.crons.find((entry) => entry.path === "/api/social-scheduler-cron")
  : null;
assert.ok(schedule, "Vercel cron must target /api/social-scheduler-cron");
assert.equal(schedule.schedule, "* * * * *");

console.log("PASS  automatic Social scheduler cron remains CRON_SECRET-protected and shadow-only");
