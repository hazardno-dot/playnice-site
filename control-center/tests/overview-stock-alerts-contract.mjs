import assert from "node:assert/strict";
import fs from "node:fs";

const app=fs.readFileSync("control-center/src/App.jsx","utf8");
const css=fs.readFileSync("control-center/src/audit.css","utf8");
const inventory=fs.readFileSync("control-center/src/AnalyticsManager.jsx","utf8");

// Overview must use the SAME authenticated, read-only API as Inventory Watch.
assert.match(app,/fetch\("\/api\/orders\?view=analytics"/);
assert.match(app,/supabase\.auth\.getSession\(\)/);
assert.match(app,/Authorization:"Bearer "\+data\.session\.access_token/);
assert.match(app,/payload\.analytics\?\.inventory\?\.rows/);
assert.match(app,/cache:"no-store"/);

// Existing thresholds are authoritative; never mix them with 30ml purchase cap.
assert.match(inventory,/Number\(row\.remaining_ml\)\s*<=\s*20/);
assert.match(inventory,/Number\(row\.remaining_ml\)\s*<=\s*10/);
assert.match(app,/Number\(row\.remaining_ml\)<=20/);
assert.match(app,/row\.remaining<=10/);
assert.match(app,/row\.remaining===0/);
assert.doesNotMatch(app,/stockWatch\.remaining===30/);

// No invented zero-count on unavailable API, no new stock write path.
assert.match(app,/status:"unavailable"/);
assert.match(app,/stockWatch\.status==="ready"/);
assert.match(app,/onNavigate\("Inventory"\)/);
assert.doesNotMatch(app,/fetch\("\/api\/orders\?view=analytics",[\s\S]{0,200}method:"POST"/);

// Responsive and accessible.
assert.match(app,/aria-label="Inventory replenishment status"/);
assert.match(css,/\.overview-stock-watch-counts/);
assert.match(css,/@media\(max-width:850px\)/);
console.log("PASS CC Overview stock summary: authenticated, read-only, 20ml/10ml, unavailable not zero, responsive");
