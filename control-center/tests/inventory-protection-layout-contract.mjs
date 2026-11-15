import fs from "node:fs";
import assert from "node:assert/strict";
const ui = fs.readFileSync("control-center/src/AnalyticsManager.jsx","utf8");
const css = fs.readFileSync("control-center/src/analytics-manager.css","utf8");

const grid = ui.indexOf('<div className="sales-grid inventory-grid">');
const diagnostics = ui.indexOf('<details className="inventory-protection-diagnostics">');
const audit = ui.indexOf("INVENTORY PROTECTION / AUDIT");
assert.ok(diagnostics > 0 && grid > diagnostics && audit > diagnostics && audit < grid,
  "Collapsed Inventory Protection diagnostics must appear first, before Inventory Watch");
assert.match(ui, /className="inventory-list inventory-catalog-scroll" role="region" aria-label="Fragrance inventory list" tabIndex=\{0\}/);
assert.match(css, /\.inventory-panel \.inventory-catalog-scroll\s*\{[^}]*overflow-y:auto/);
assert.match(css, /\.inventory-panel \.inventory-catalog-scroll:focus-visible/);
assert.match(ui, /<summary>Inventory Protection diagnostics/);
assert.match(ui, /setPreviewReview\(/);
assert.match(ui, /previewReview\.snapshot === selectedVerification\.snapshot/);
assert.match(ui, /Reviewed in this browser session only\. Not persisted/);
assert.match(ui, /Review expired: inventory calculation changed/);
assert.match(ui, /Izaberi parfem u Inventory Watch listi/);
assert.match(css, /\.inventory-protection-diagnostics>summary:focus-visible/);
assert.match(css, /\.inventory-verification-selected\s*\{[^}]*flex-direction:column/);
assert.doesNotMatch(ui, /action:\s*["']verify_inventory_balance["']/);
console.log("PASS diagnostics-first layout, scrollable catalog and preview-only review contract");
