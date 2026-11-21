import assert from "node:assert/strict";
import fs from "node:fs";
import { runInventorySafetyLab, classifyShadowDependencyResult } from "../lib/inventory-preview-safety-lab.mjs";

const result = runInventorySafetyLab();
assert.equal(result.source, "SYNTHETIC_IN_MEMORY");
assert.equal(result.total, 8);
assert.equal(result.passed, 8, JSON.stringify(result.scenarios.filter(x => !x.passed)));
assert.equal(result.databaseWrites, 0);
assert.equal(result.networkRequests, 0);
assert.equal(result.realNetworkFailureTested, false);
assert.equal(result.realPostgresConcurrencyTested, false);
assert.equal(new Set(result.scenarios.map(x => x.id)).size, 8);
assert.equal(classifyShadowDependencyResult(() => { throw Error("offline"); }, {}).decision, "UNKNOWN");

const ui = fs.readFileSync("control-center/src/AnalyticsManager.jsx", "utf8");
const css = fs.readFileSync("control-center/src/analytics-manager.css", "utf8");
assert.match(ui, /Run 8 safety scenarios/);
assert.match(ui, /runInventorySafetyLab/);
assert.match(ui, /inventory-lab-run/);
assert.match(ui, /REAL NETWORK \/ DATABASE/);
assert.match(css, /\.inventory-intelligence \.inventory-lab-run/);
assert.match(css, /\.inventory-intelligence \.inventory-lab-run:focus-visible/);
console.log("PASS 8/8 synthetic inventory safety scenarios (not real network/database tests)");
