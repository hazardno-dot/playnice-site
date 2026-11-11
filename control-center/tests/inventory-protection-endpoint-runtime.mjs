import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const endpoint = require("../../playnice-site/api/inventory-shadow.js");
const previous = { VERCEL_ENV: process.env.VERCEL_ENV, INVENTORY_SHADOW_RECEIVER_ENABLED: process.env.INVENTORY_SHADOW_RECEIVER_ENABLED };
const request = async ({method="POST", headers={}, body={source:"ADD_TO_CART",productKey:"afnan-9am",demandMl:20}} = {}) => {
  let status=200, json=null, ended=false;
  const res={
    setHeader(){return this;},
    status(code){status=code;return this;},
    json(data){json=data;return this;},
    end(){ended=true;return this;}
  };
  await endpoint({method,headers,body},res);
  return {status,json,ended};
};
try {
  process.env.VERCEL_ENV="production";
  process.env.INVENTORY_SHADOW_RECEIVER_ENABLED="true";
  assert.equal((await request()).status,204);
  process.env.VERCEL_ENV="preview";
  delete process.env.INVENTORY_SHADOW_RECEIVER_ENABLED;
  assert.equal((await request()).status,204);
  process.env.INVENTORY_SHADOW_RECEIVER_ENABLED="true";
  const valid=await request();
  assert.equal(valid.status,202);
  assert.equal(valid.json.decision,"UNKNOWN");
  assert.equal(valid.json.persisted,false);
  assert.equal(valid.json.enforced,false);
  assert.equal((await request({body:{source:"ADD_TO_CART",productKey:"afnan-9am",demandMl:-20}})).status,400);
  assert.equal((await request({body:{source:"ADD_TO_CART",productKey:"../invalid",demandMl:10}})).status,400);
  assert.equal((await request({body:{source:"CHECKOUT",productKey:"afnan-9am",demandMl:10}})).status,400);
  assert.equal((await request({headers:{"content-length":"600"}})).status,413);
  assert.equal((await request({method:"GET"})).status,405);
  console.log("PASS inventory shadow preview receiver runtime safety");
} finally {
  for (const [name,value] of Object.entries(previous)) {
    if (value === undefined) delete process.env[name];
    else process.env[name]=value;
  }
}
