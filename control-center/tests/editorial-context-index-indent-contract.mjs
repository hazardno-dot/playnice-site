import fs from "node:fs";
import assert from "node:assert/strict";

const server = fs.readFileSync("control-center/server/create-apply.js", "utf8");
const wear = fs.readFileSync("playnice-site/src/data/products/productWearContext.js", "utf8");
const pattern = /^[ \\t]{2,}("(?:\\\\.|[^"\\\\])*")[ \\t]*:[ \\t]*\\{/gm;
const names = [...wear.matchAll(pattern)].map((match) => JSON.parse(match[1]));
const name = "Dolce & Gabbana The One for Men Eau de Parfum";
assert.ok(server.includes('^[ \\t]{2,}'), "server must accept variably-indented wear keys");
assert.ok(names.includes("Montblanc Explorer Extreme Parfum"), "indented entry must not be skipped");
assert.equal(names.indexOf(name), names.length - 1, "The One EDP remains last in wear context");
assert.equal(names.length, 115, "all 115 live wear contexts must be indexed");
assert.equal(names.indexOf(name), 114, "The One must keep the same baseline index as Object.keys()");
console.log("PASS editorial context index remains stable despite variable indentation");
