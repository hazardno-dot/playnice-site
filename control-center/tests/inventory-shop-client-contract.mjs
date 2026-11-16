import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
const src=fs.readFileSync("playnice-site/src/features/cart/shopInventoryDecision.js","utf8")
  .replaceAll("export function ","function ").replace("export async function ","async function ");
const ctx={window:undefined,Date,Map,Set,Number,String,Array,Math,AbortController,setTimeout,clearTimeout};
vm.runInNewContext(src+"\nthis.calc=requestedCartTotalMl;this.isBlocked=isStockDecisionBlocked;this.warm=warmStockDecision;",ctx);
const product={id:114,name:"Xerjoff Naxos Eau de Parfum"};
assert.equal(ctx.calc([{id:114,size:"10ml",quantity:9}],114,"10ml"),100);
assert.equal(ctx.calc([{id:114,size:"5ml",quantity:4},{id:114,size:"10ml",quantity:6}],114,"20ml"),100);
assert.equal(ctx.calc([{id:114,size:"broken",quantity:1}],114,"10ml"),null);
assert.equal(ctx.isBlocked(product,[], "10ml"),false);
await ctx.warm(product,[],"10ml");
assert.equal(ctx.isBlocked(product,[],"10ml"),false);
assert.match(src,/fail open|fail-open/i);
assert.doesNotMatch(src,/SUPABASE_SECRET|SERVICE_ROLE|remaining_ml/);
const app=fs.readFileSync("playnice-site/src/App.js","utf8");
assert.match(app,/warmInventoryDecision:/);
assert.match(app,/isStockDecisionBlocked/);
const api=fs.readFileSync("playnice-site/api/inventory-check.js","utf8");
assert.match(api,/decision:"UNKNOWN"/);
// Same-origin credentials are mandatory on Vercel SSO-protected Preview
// domains. A protected endpoint otherwise redirects to login and silently
// produces UNKNOWN. Simulate the real async response without Supabase writes.
assert.match(src,/credentials:"same-origin"/);
const sent=[];
ctx.window={
  location:{hostname:"playnice-site-preview.vercel.app"},
  dispatchEvent:()=>{}
};
ctx.Event=class Event{constructor(type){this.type=type;}};
ctx.fetch=async(url,options)=>{
  sent.push({url,options});
  return {ok:true,json:async()=>({decision:"LIMIT_REACHED"})};
};
const tenDecants=[{id:114,size:"10ml",quantity:10}];
assert.equal(ctx.isBlocked(product,tenDecants,"10ml"),false);
await ctx.warm(product,tenDecants,"10ml");
assert.equal(ctx.isBlocked(product,tenDecants,"10ml"),true,"next 10 ml must lock");
assert.equal(sent.length,1);
assert.equal(sent[0].url,"/api/inventory-check");
assert.equal(sent[0].options.credentials,"same-origin");
assert.equal(JSON.parse(sent[0].options.body).requestedTotalMl,110);
assert.equal(ctx.isBlocked(product,[{id:114,size:"10ml",quantity:9}],"10ml"),false);

console.log("PASS preview-only async decision client: mixed decants, unknown/open, private server call");

const quickUi=fs.readFileSync("playnice-site/src/desktop-product-page/DesktopQuickView.jsx","utf8");
const mobileUi=fs.readFileSync("playnice-site/src/mobile-v2/product-page/MobileProductPage.jsx","utf8");
const style=fs.readFileSync("playnice-site/src/App.css","utf8");
for(const source of [app,quickUi,mobileUi]){
  assert.match(source,/Dostignuta je maksimalna količina za ovaj parfem\. Možete nastaviti kupovinu sa već dodatom količinom\./);
  assert.match(source,/inventory-limit-message/);
}
assert.match(style,/\.inventory-limit-message/);

const qView=fs.readFileSync("playnice-site/src/desktop-product-page/DesktopQuickView.jsx","utf8");
const qReturn=qView.indexOf("if (!product) return null;");
const qWarm=qView.indexOf("if(!product) return;");
assert.ok(qWarm>0 && qWarm<qReturn,"Quick View hooks must precede conditional return");
assert.match(qView,/playnice:stock-decision-updated/);
assert.match(src,/blockedByProduct=new Map\(\)/);
assert.match(src,/blockedByProduct\.set\(pid/);
assert.match(src,/blockedByProduct\.delete\(pid\)/);
assert.match(app,/setInterval\(refresh,8000\)/);
assert.match(app,/inventory-limit-message--cart/);
assert.doesNotMatch(app,/inventory-limit-message--pdp/,"Product cards must not display a stock alert that changes card height");
assert.match(app,/inventory-limit-message--cart/);

const desktopPage=fs.readFileSync("playnice-site/src/desktop-product-page/DesktopProductPage.jsx","utf8");
const desktopBridge=fs.readFileSync("playnice-site/src/desktop-product-page/DesktopProductPageBridge.jsx","utf8");
assert.match(desktopPage,/disabled=\{capReached\}/);
assert.match(desktopPage,/inventory-limit-message--pdp/);
assert.match(desktopBridge,/canAddToCart=\{\(item,size\)/);
assert.match(desktopBridge,/playnice:stock-decision-updated/);

// The stock warning is intentionally absent from catalog cards to preserve
// uniform card height. PDP, cart, and Quick View retain their notice.
assert.doesNotMatch(app,/Object\.entries\(product\.sizes\)\.some\(\(\[size\]\) => \{/);

const current=fs.readFileSync("playnice-site/src/features/cart/shopInventoryDecision.js","utf8");
assert.match(current,/networkOutageUntil=Date\.now\(\)\+30000/);
assert.match(current,/blockedByProduct\.clear\(\)/);
assert.match(current,/responses\.clear\(\)/);
assert.match(current,/noteInventoryCartClick/);
assert.match(current,/CLICK_PAUSE_MS=480/);
assert.match(app,/isStockDecisionPending\(product\)/);
assert.match(app,/noteInventoryCartClick\(product\)/);
assert.match(app,/isAtStockLimit\(product,size\)/);

const desktopStyle=fs.readFileSync("playnice-site/src/desktop-product-page/DesktopProductPage.css","utf8");
const quickStyle=fs.readFileSync("playnice-site/src/desktop-product-page/DesktopQuickView.css","utf8");
const mobileStyle=fs.readFileSync("playnice-site/src/mobile-v2/product-page/MobileProductPage.css","utf8");
assert.match(desktopStyle,/\.desktop-product-page__add:disabled/);
assert.match(quickStyle,/\.desktop-quick-view__add:disabled/);
assert.match(mobileStyle,/\.mobile-product-page__add:disabled/);
assert.match(style,/\.qty-control button:disabled/);
assert.match(desktopStyle,/box-shadow: none/);
