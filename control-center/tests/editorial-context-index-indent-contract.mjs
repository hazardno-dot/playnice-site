import fs from "node:fs";
import assert from "node:assert/strict";

const server = fs.readFileSync("control-center/server/create-apply.js", "utf8");
const wear = fs.readFileSync("playnice-site/src/data/products/productWearContext.js", "utf8");
const pattern = /^[ \t]{2,}("(?:\\.|[^"\\])*")[ \t]*:[ \t]*\{/gm;
const parseNames = (source) => [...source.matchAll(pattern)].map((match) => JSON.parse(match[1]));

// Regression: indentation alone must never change the index assigned to a product.
const fixture = '  "First": {\n    sr: "x"\n  },\n    "Indented": {\n      sr: "x"\n    },\n  "Last": {';
assert.deepEqual(parseNames(fixture), ["First", "Indented", "Last"]);

const names = parseNames(wear);
const oldName = "Dolce & Gabbana The One for Men Eau de Parfum";
const renamed = oldName + " (2025)";
const presentName = names.includes(renamed) ? renamed : oldName;
assert.ok(server.includes('^[ \\t]{2,}'), "server must accept variably-indented wear keys");
assert.ok(names.includes("Montblanc Explorer Extreme Parfum"), "indented Montblanc entry must not be skipped");
assert.ok(names.includes(presentName), "The One EDP must exist before or after its approved rename");
assert.ok(names.indexOf(presentName) > names.indexOf("Montblanc Explorer Extreme Parfum"));
assert.equal(new Set(names).size, names.length, "wear context must not have duplicate keys");
console.log("PASS editorial context index stable with uneven indentation and product renames");
