import assert from "node:assert/strict";
import fs from "node:fs";
import { runInventoryPreviewLab } from "../lib/inventory-preview-lab.mjs";

const result = runInventoryPreviewLab();
assert.equal(result.source, "SYNTHETIC_IN_MEMORY");
assert.equal(result.databaseWrites, 0);
assert.equal(result.actualPostgresConcurrencyTested, false);
assert.equal(result.total, 8);
assert.equal(result.passed, 8, JSON.stringify(result.scenarios.filter((row) => !row.passed)));
assert.equal(new Set(result.scenarios.map((row) => row.id)).size, 8);

const ui = fs.readFileSync("control-center/src/AnalyticsManager.jsx", "utf8");
assert.match(ui, /runInventoryPreviewLab/);
assert.match(ui, /Run 8 synthetic scenarios/);
assert.match(ui, /REAL DB CONCURRENCY/);
assert.match(ui, /NOT TESTED/);
assert.match(ui, /no Supabase writes/);
console.log("PASS 8/8 synthetic inventory Preview lab contracts (not real database concurrency)");
