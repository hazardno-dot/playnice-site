import assert from "node:assert/strict";
import { deriveHealthIncidents, extractHealthSignals, summarizeHealthIncidents } from "../src/siteHealthIncidents.mjs";

const history = [
  {
    checked_at: "2026-08-27T19:20:00.000Z",
    checks: [
      { key: "journal", label: "Journal", path: "/journal", ok: true, latency: "normal", responseMs: 80, issues: [], warnings: [] },
      { key: "bundle-js", label: "Application JavaScript", path: "/static/js/a.js", ok: true, latency: "normal", responseMs: 40, issues: [], warnings: [] },
    ],
  },
  {
    checked_at: "2026-08-27T19:10:00.000Z",
    checks: [
      { key: "journal", label: "Journal", path: "/journal", ok: false, latency: "failed", responseMs: 90, issues: ["HTTP 500"], warnings: [] },
      { key: "bundle-js", label: "Application JavaScript", path: "/static/js/a.js", ok: true, latency: "slow", responseMs: 3100, issues: [], warnings: [] },
    ],
  },
  {
    checked_at: "2026-08-27T19:00:00.000Z",
    checks: [
      { key: "journal", label: "Journal", path: "/journal", ok: false, latency: "failed", responseMs: 100, issues: ["HTTP 500"], warnings: [] },
      { key: "bundle-js", label: "Application JavaScript", path: "/static/js/a.js", ok: true, latency: "normal", responseMs: 50, issues: [], warnings: [] },
    ],
  },
];

const signals = extractHealthSignals(history[1]);
assert.equal(signals.length, 2);
assert.equal(signals.find((item) => item.id === "journal:error")?.severity, "error");
assert.equal(signals.find((item) => item.id === "bundle-js:warning")?.diagnostic, "Slow response: 3100 ms");

const incidents = deriveHealthIncidents(history);
const journal = incidents.find((item) => item.id === "journal:error");
assert.equal(journal.status, "recovered");
assert.equal(journal.firstSeen, "2026-08-27T19:00:00.000Z");
assert.equal(journal.lastSeen, "2026-08-27T19:10:00.000Z");
assert.equal(journal.recoveredAt, "2026-08-27T19:20:00.000Z");
assert.equal(journal.occurrences, 2);

const bundle = incidents.find((item) => item.id === "bundle-js:warning");
assert.equal(bundle.status, "recovered");
assert.equal(bundle.firstSeen, "2026-08-27T19:10:00.000Z");
assert.equal(bundle.recoveredAt, "2026-08-27T19:20:00.000Z");

const activeHistory = [{
  checked_at: "2026-08-27T20:00:00.000Z",
  checks: [{ key: "sitemap", label: "sitemap.xml", path: "/sitemap.xml", ok: true, latency: "normal", responseMs: 70, issues: [], warnings: ["Missing /journal URL"] }],
}];
const summary = summarizeHealthIncidents(activeHistory);
assert.equal(summary.activeWarnings, 1);
assert.equal(summary.activeErrors, 0);
assert.equal(summary.active[0].id, "sitemap:warning");

console.log("PASS  Site Health derives discrete incident episodes from retained check history");
console.log("PASS  incidents preserve first seen, last seen, recovery and occurrence context");
console.log("PASS  failures and non-blocking warning/latency signals remain distinct");
