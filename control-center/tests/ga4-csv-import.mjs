import assert from "node:assert/strict";
import {parseGa4EventCsv} from "../src/ga4CsvImport.mjs";
const sample=`# Start date: 20260910\n# End date: 20261007\nEvent name,Event count,Total users,Event count per active user,Total revenue\npage_view,6067,986,6.4,0\nsession_start,1560,987,1.6,0\n"purchase",23,17,1.3,607.000002\n`;
const r=parseGa4EventCsv(sample,"2026-10-08T12:00:00Z");
assert.equal(r.start,"2026-09-10");assert.equal(r.end,"2026-10-07");
assert.equal(r.events.purchase.count,23);assert.equal(r.events.purchase.revenue,607.000002);
assert.throws(()=>parseGa4EventCsv(sample.replace("session_start","purchase")),/Duplicate event/);
assert.throws(()=>parseGa4EventCsv("wrong file"),/Expected Google Analytics/);
console.log("PASS GA4 CSV import accepts standard exports and rejects invalid files");
