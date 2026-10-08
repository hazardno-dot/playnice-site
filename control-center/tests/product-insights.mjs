import assert from "node:assert/strict";
import {deriveProductInsights} from "../src/productInsights.mjs";
const items=[
{name:"A",views:80,adds:0,purchased:0,revenue:0},
{name:"B",views:50,adds:8,purchased:0,revenue:0},
{name:"C",views:30,adds:7,purchased:1,revenue:100},
{name:"D",views:10,adds:1,purchased:2,revenue:200}
];
const x=deriveProductInsights(items);
assert.deepEqual(x.attention.map(x=>x.name),["A","B"]);
assert.deepEqual(x.cartInterest.map(x=>x.name),["B","C"]);
assert.deepEqual(x.views.map(x=>x.name),["A","B","C","D"]);
assert.deepEqual(deriveProductInsights([]).attention,[]);
console.log("PASS product insights classify descriptive GA4 item signals");
