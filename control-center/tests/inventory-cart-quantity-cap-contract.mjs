import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
const src=fs.readFileSync("playnice-site/src/features/cart/cartQuantityCap.js","utf8")
  .replaceAll("export function ", "function ");
const context={Number,String,Array,Math,window:undefined,URLSearchParams};
vm.runInNewContext(src+"\nthis.assess=assessCartQuantityCap;this.preview=previewCapForProduct;",context);
const assess=context.assess;
const item=(size,quantity,id=4)=>({id,size,quantity});
for(let n=0;n<10;n++){
  const outcome=assess(n?[item("10ml",n)]:[],4,"10ml",100);
  assert.equal(outcome.blocked,false,"the first ten 10 ml additions must be allowed");
}
assert.equal(assess([item("10ml",10)],4,"10ml",100).blocked,true,"11th click blocked");
assert.equal(assess([item("10ml",15)],4,"10ml",100).blocked,true,"already over cap");
assert.equal(assess([item("5ml",4),item("10ml",6)],4,"20ml",100).blocked,false);
assert.equal(assess([item("5ml",4),item("10ml",6)],4,"20ml",99).blocked,true);
assert.equal(assess([item("10ml",10)],5,"10ml",100).blocked,false,"unrelated product");
assert.equal(assess([item("10ml",10)],4,"10ml",null).blocked,false,"missing cap fail-open");
assert.equal(assess([item("10ml",10)],4,"10ml",NaN).blocked,false);
assert.equal(assess([item("not a decant",1)],4,"10ml",100).blocked,false);
assert.equal(assess([item("10ml",2.5)],4,"10ml",100).blocked,false);
assert.equal(context.preview({slug:"xerjoff-naxos"}),null,"no window does not enable demo");
context.window={location:{hostname:"www.playniceshop.me",search:"?inventoryCapDemo=1"}};
assert.equal(context.preview({slug:"xerjoff-naxos"}),null,"production never uses fixture");
context.window={location:{hostname:"playnice-site-xyz.vercel.app",search:"?inventoryCapDemo=1"}};
assert.equal(context.preview({slug:"xerjoff-naxos"}),100);
assert.equal(context.preview({slug:"other"}),null);
context.window.location.search="";
assert.equal(context.preview({slug:"xerjoff-naxos"}),null,"off by default");
const app=fs.readFileSync("playnice-site/src/App.js","utf8");
assert.match(app,/disabled=\{assessCartQuantityCap/);
assert.match(app,/if \(assessCartQuantityCap\(prev, product\.id, size, addLimit\)\.blocked\) return prev/);
assert.match(app,/if \(increasing && target/);
assert.match(app,/return updateCartItemQuantity\(prev, key, delta\)/);
console.log("PASS Preview-only cart cap: ten clicks allowed, 11th stopped, mixed sizes, fail-open, unaffected checkout");
