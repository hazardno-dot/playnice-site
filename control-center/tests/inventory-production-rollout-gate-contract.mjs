import assert from "node:assert/strict";
import {createRequire} from "node:module";
import fs from "node:fs";
const require=createRequire(import.meta.url);
const {isPolicyEnabled,isInventoryEnabled,isCheckoutPreflightEnabled,namesFor}=
 require("../../playnice-site/server/inventory-rollout-gate.cjs");
const preview={VERCEL_ENV:"preview",
 VERCEL_GIT_COMMIT_REF:"feature/inventory-protection-audit-shadow-v1",
 SHOP_PURCHASE_CAP_POLICY_PREVIEW_ENABLED:"true",
 SHOP_INVENTORY_SOURCE_V2_ENABLED:"true",SHOP_INVENTORY_CHECK_ENABLED:"true",
 SHOP_INVENTORY_PARITY_APPROVED_NAMES:"Preview Fragrance",
 SHOP_INVENTORY_VERIFIED_REMAINING_NAMES:"Preview Fragrance"};
assert.equal(isPolicyEnabled(preview),true);
assert.equal(isInventoryEnabled(preview),true);
assert.equal(isCheckoutPreflightEnabled(preview),true);
assert.equal(namesFor(preview).approved,"Preview Fragrance");
assert.equal(isPolicyEnabled({...preview,VERCEL_GIT_COMMIT_REF:"main"}),false);
assert.equal(isInventoryEnabled({...preview,VERCEL_GIT_COMMIT_REF:"main"}),false);
for(const missing of [
 {},{SHOP_INVENTORY_PRODUCTION_ROLLOUT_ENABLED:"true"},
 {SHOP_PURCHASE_CAP_POLICY_PRODUCTION_ENABLED:"true"},
 {SHOP_INVENTORY_PRODUCTION_CHECK_ENABLED:"true"}]){
 const prod={...preview,VERCEL_ENV:"production",...missing};
 assert.equal(isPolicyEnabled(prod),false,"Production cap must default OFF");
 assert.equal(isInventoryEnabled(prod),false,"Production stock must default OFF");
 assert.equal(isCheckoutPreflightEnabled(prod),false);
}
const prod={VERCEL_ENV:"production",
 SHOP_INVENTORY_PRODUCTION_ROLLOUT_ENABLED:"true",
 SHOP_PURCHASE_CAP_POLICY_PRODUCTION_ENABLED:"true",
 SHOP_INVENTORY_PRODUCTION_CHECK_ENABLED:"true",
 SHOP_INVENTORY_PRODUCTION_PARITY_APPROVED_NAMES:"Production Approved",
 SHOP_INVENTORY_PRODUCTION_VERIFIED_REMAINING_NAMES:"Production Verified"};
assert.equal(isPolicyEnabled(prod),true);
assert.equal(isInventoryEnabled(prod),true);
assert.equal(namesFor(prod).approved,"Production Approved");
assert.equal(namesFor(prod).verified,"Production Verified");
assert.equal(isInventoryEnabled({...prod,SHOP_INVENTORY_PRODUCTION_CHECK_ENABLED:"false"}),false);
assert.equal(isPolicyEnabled({...prod,SHOP_PURCHASE_CAP_POLICY_PRODUCTION_ENABLED:"false"}),false);
assert.equal(isInventoryEnabled({...prod,VERCEL_ENV:"preview"}),false);
assert.equal(isPolicyEnabled({...prod,VERCEL_ENV:"preview"}),false);
const api=fs.readFileSync("playnice-site/api/checkout.js","utf8");
assert.match(api,/isCheckoutPreflightEnabled\(process\.env\)/);
assert.ok(api.indexOf("checkPreviewCheckout(req.body)") < api.indexOf("return legacyHandler(req, res)"));
const endpoints=["playnice-site/api/inventory-check.js","playnice-site/api/purchase-policy.js"];
for(const path of endpoints){
 const source=fs.readFileSync(path,"utf8");
 assert.match(source,/inventory-rollout-gate\.cjs/);
 assert.match(source,/SHOP_INVENTORY_READ_SECRET/);
}
console.log("PASS rollout safety gate: Preview branch remains, Production default OFF, independent caps and verified names");
