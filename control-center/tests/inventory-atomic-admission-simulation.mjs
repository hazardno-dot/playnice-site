import assert from "node:assert/strict";
import fs from "node:fs";
import {admitAtomicCheckout} from "../../playnice-site/server/inventory-atomic-admission-contract.mjs";
const fragrance="Naxos Eau de Parfum";
const fp=(c)=>c.repeat(64);
const item=quantity=>({name:fragrance,size:"10ml",quantity});
const clone=state=>({
  remaining:new Map(state.remaining),
  orders:new Map(state.orders),
  reservations:new Map(state.reservations)
});
let state={remaining:new Map([[fragrance.toLowerCase(),40]]),
 orders:new Map(),reservations:new Map()};
let queue=Promise.resolve(), sequence=0, failReservationWrite=false, inventoryUnknown=false;
const traces=[];
const store={async transaction(fn){
  let release;
  const prev=queue;
  queue=new Promise(resolve=>{release=resolve});
  await prev;
  const candidate=clone(state);
  const tx={
    async lockFingerprint(environment,fingerprint){
      traces.push("fingerprint:"+environment+":"+fingerprint.slice(0,1));
    },
    async getExistingByFingerprint(environment,fingerprint){
      traces.push("dedupe");
      return candidate.orders.get(environment+":"+fingerprint)||null;
    },
    async lockFragrances(environment,names){
      assert.deepEqual(names,[...names].sort((a,b)=>a.localeCompare(b,"en")));
      traces.push("lock:"+names.join(","));
    },
    async getPolicyCap(){return {status:"READY",maximumMl:30}},
    async getRemaining(name){return inventoryUnknown ? {status:"UNKNOWN"} : {status:"VERIFIED",remainingMl:candidate.remaining.get(name)}},
    async insertCheckoutOrder({fingerprint,environment}){
      const order={id:"PNTEST-"+(++sequence)};
      candidate.orders.set(environment+":"+fingerprint,order);
      traces.push("insert");
      return order;
    },
    async insertReservationLines(id,demand){
      const ml=demand.reduce((s,x)=>s+x.requestedMl,0);
      for(const row of demand){
        const old=candidate.remaining.get(row.productName);
        candidate.remaining.set(row.productName,old-row.requestedMl);
      }
      candidate.reservations.set(id,ml);
      traces.push("reserve");
      if(failReservationWrite)throw new Error("Simulated transactional reservation INSERT failure");
    }
  };
  try{
    const answer=await fn(tx);
    if(answer.decision==="ACCEPTED")state=candidate;
    return answer;
  }finally{release()}
}};
const orderA={items:[item(3)]};
const orderB={items:[item(3)]};
const [a,b]=await Promise.all([
  admitAtomicCheckout({store,payload:orderA,environment:"preview",fingerprint:fp("a")}),
  admitAtomicCheckout({store,payload:orderB,environment:"preview",fingerprint:fp("b")})
]);
assert.deepEqual([a.decision,b.decision],["ACCEPTED","STOCK_LIMIT_REACHED"]);
assert.equal(state.remaining.get(fragrance.toLowerCase()),10);
assert.equal(state.reservations.size,1);
const retry=await admitAtomicCheckout({store,payload:orderA,environment:"preview",fingerprint:fp("a")});
assert.equal(retry.decision,"DUPLICATE");
assert.deepEqual(retry.order,a.order);
assert.equal(state.reservations.size,1);
assert.equal(state.remaining.get(fragrance.toLowerCase()),10);
assert.equal(traces.indexOf("dedupe")<traces.indexOf("lock:"+fragrance.toLowerCase()),true,
 "deduplication must precede inventory lock");
// A verified per-order cap is independent of availability; bad payload fails
// before transaction creation. Unknown stock follows explicit fail-open.
assert.equal((await admitAtomicCheckout({store,payload:{items:[item(4)]},
  environment:"preview",fingerprint:fp("c")})).decision,"PURCHASE_CAP_REACHED");
assert.equal((await admitAtomicCheckout({store,payload:{items:[{name:fragrance,size:"oops",quantity:1}]},
  environment:"preview",fingerprint:fp("d")})).decision,"INVALID_ORDER");
// The order INSERT may succeed before reservation INSERT fails. The adapter
// must abort the transaction, so neither the order nor its footprint survives.
failReservationWrite=true;
const beforeOrders=state.orders.size,beforeReservations=state.reservations.size;
const beforeRemaining=state.remaining.get(fragrance.toLowerCase());
const failure=await admitAtomicCheckout({store,payload:{items:[item(1)]},
  environment:"preview",fingerprint:fp("e")});
assert.equal(failure.decision,"UNAVAILABLE");
assert.equal(state.orders.size,beforeOrders,"failed reservation must roll back order INSERT");
assert.equal(state.reservations.size,beforeReservations,"failed reservation leaves no ghost hold");
assert.equal(state.remaining.get(fragrance.toLowerCase()),beforeRemaining);
failReservationWrite=false;
// Fail-open UNKNOWN is allowed only for stock, not for policy cap.
inventoryUnknown=true;
const failOpen=await admitAtomicCheckout({store,payload:{items:[item(1)]},
  environment:"preview",fingerprint:fp("f")});
assert.equal(failOpen.decision,"ACCEPTED");
assert.equal(state.reservations.size,beforeReservations+1);
inventoryUnknown=false;
const checkout=fs.readFileSync("playnice-site/api/checkout.js","utf8");
assert.doesNotMatch(checkout,/inventory-atomic-admission-contract/,
 "Simulation must remain outside live checkout until SQL integration is reviewed");
console.log("PASS isolated transaction simulation: two buyers, duplicate retry, cap, invalid demand, atomic rollback, inventory UNKNOWN fail-open");
