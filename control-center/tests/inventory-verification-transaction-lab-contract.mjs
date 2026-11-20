import assert from "node:assert/strict";
import { InventoryVerificationTransactionLab } from "../lib/inventory-verification-transaction-lab.mjs";
const all={admin:true,mapping:true,ordersComplete:true,obligationsResolved:true,sharedLock:true};
const lab=new InventoryVerificationTransactionLab({naxos:80,ginger:50});
const original=lab.snapshot("naxos");
assert.equal(lab.verify("naxos",original).reason,"ADMIN_REQUIRED");
for(const key of Object.keys(all)){
  assert.equal(lab.verify("naxos",original,{...all,[key]:false}).ok,false,key);
}
assert.equal(lab.verify("naxos",original,all).ok,true);
assert.equal(lab.verificationStatus("naxos"),"REVIEWED");
assert.equal(lab.change("naxos",5).ok,true);
assert.equal(lab.verificationStatus("naxos"),"NOT_VERIFIED");
assert.equal(lab.change("naxos",-5).ok,true);
assert.equal(lab.snapshot("naxos").remainingMl,original.remainingMl);
assert.equal(lab.verify("naxos",original,all).reason,"STALE_SNAPSHOT");
const fresh=lab.snapshot("naxos");
assert.equal(lab.verify("naxos",fresh,all).ok,true);
assert.equal(lab.change("naxos",-80).ok,true);
assert.equal(lab.verificationStatus("naxos"),"NOT_VERIFIED");
assert.equal(lab.verify("naxos",fresh,all).reason,"STALE_SNAPSHOT");
assert.equal(lab.verify("ginger",lab.snapshot("ginger"),{...all,sharedLock:false}).reason,"ATOMIC_LOCK_REQUIRED");
assert.equal(lab.verify("ginger",lab.snapshot("ginger"),all).ok,true);
assert.equal(lab.verificationStatus("ginger"),"REVIEWED");
assert.equal(lab.change("naxos",100,{reason:"RESTOCK"}).ok,true);
assert.equal(lab.verificationStatus("ginger"),"REVIEWED");
console.log("PASS isolated revision verification simulator: stale, offsetting events, shared lock, per-product invalidation");
