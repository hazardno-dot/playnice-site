import assert from "node:assert/strict";
import { createRequire } from "node:module";
import fs from "node:fs";
const require=createRequire(import.meta.url);
const path=require.resolve("../../playnice-site/api/purchase-policy.js");
const original={
  ref:process.env.VERCEL_GIT_COMMIT_REF,env:process.env.VERCEL_ENV,enabled:process.env.SHOP_PURCHASE_CAP_POLICY_PREVIEW_ENABLED,
  secret:process.env.SHOP_INVENTORY_READ_SECRET,fetch:global.fetch
};
function handlerFor(env,enabled,secret){
  process.env.VERCEL_ENV=env;
  process.env.SHOP_PURCHASE_CAP_POLICY_PREVIEW_ENABLED=enabled;
  process.env.SHOP_INVENTORY_READ_SECRET=secret;
  delete require.cache[path];
  return require(path);
}
async function run(handler,body){
  const headers={};
  const res={setHeader:(k,v)=>headers[k]=v,status(code){this.statusCode=code;return this;},json(payload){this.payload=payload;return this;}};
  await handler({method:"POST",body,headers:{"content-length":"50"}},res);
  return {statusCode:res.statusCode,payload:res.payload,headers};
}
try {
  const off=handlerFor("production","true","synthetic-test-secret");
  let calls=0;
  global.fetch=async()=>{calls++;throw Error("Production endpoint must not fetch");};
  assert.deepEqual((await run(off,{productName:"Naxos"})).payload,{status:"NOT_CONFIGURED"});
  assert.equal(calls,0);
  process.env.VERCEL_GIT_COMMIT_REF="feature/inventory-protection-audit-shadow-v1";
  const live=handlerFor("preview","true","synthetic-test-secret");
  global.fetch=async()=>({ok:true,json:async()=>({default_limit_ml:30,overrides:{Naxos:20}})});
  const selected=await run(live,{productName:"Naxos"});
  assert.deepEqual(selected.payload,{status:"READY",maximumMl:20});
  assert.equal(selected.headers["Cache-Control"],"private, no-store, max-age=0");
  assert.deepEqual((await run(live,{productName:"Other"})).payload,{status:"READY",maximumMl:30});
  global.fetch=async()=>({ok:false,status:404});
  assert.deepEqual((await run(live,{productName:"Naxos"})).payload,{status:"NOT_CONFIGURED"});
  global.fetch=async()=>({ok:true,json:async()=>({default_limit_ml:30,overrides:{Naxos:-5}})});
  assert.deepEqual((await run(live,{productName:"Naxos"})).payload,{status:"NOT_CONFIGURED"});
  const api=fs.readFileSync("playnice-site/api/purchase-policy.js","utf8");
  assert.match(api,/isPolicyEnabled\(process\.env\)/);
  assert.match(fs.readFileSync("playnice-site/server/inventory-rollout-gate.cjs","utf8"),/VERCEL_ENV==="preview"/);
  assert.doesNotMatch(api,/return res\.status\(200\)\.json\(policy\)/);
} finally {
  for(const [key,value] of [["VERCEL_ENV",original.env],["SHOP_PURCHASE_CAP_POLICY_PREVIEW_ENABLED",original.enabled],["SHOP_INVENTORY_READ_SECRET",original.secret]]){
    if(value===undefined)delete process.env[key];else process.env[key]=value;
  }
  if(original.ref===undefined)delete process.env.VERCEL_GIT_COMMIT_REF;else process.env.VERCEL_GIT_COMMIT_REF=original.ref;
  global.fetch=original.fetch;
  delete require.cache[path];
}
console.log("PASS Preview-only Shop purchase policy endpoint (fail-open, only requested cap)");
