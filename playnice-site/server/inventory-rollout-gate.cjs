// Inventory V2 rollout gate. SAFE BY DEFAULT.
// Production requires an explicit master switch AND a separate feature switch.
// Branch pin intentionally applies only to the audited Preview pilot.
const PREVIEW_BRANCH="feature/inventory-protection-audit-shadow-v1";
const on=value=>value==="true";
const preview=env=>env.VERCEL_ENV==="preview"&&
  env.VERCEL_GIT_COMMIT_REF===PREVIEW_BRANCH;
const production=env=>env.VERCEL_ENV==="production"&&
  on(env.SHOP_INVENTORY_PRODUCTION_ROLLOUT_ENABLED);

function isPolicyEnabled(env=process.env){
  return (preview(env)&&on(env.SHOP_PURCHASE_CAP_POLICY_PREVIEW_ENABLED))||
    (production(env)&&on(env.SHOP_PURCHASE_CAP_POLICY_PRODUCTION_ENABLED));
}
function isInventoryEnabled(env=process.env){
  return (preview(env)&&on(env.SHOP_INVENTORY_SOURCE_V2_ENABLED)&&
      on(env.SHOP_INVENTORY_CHECK_ENABLED))||
    (production(env)&&on(env.SHOP_INVENTORY_PRODUCTION_CHECK_ENABLED));
}
function isCheckoutPreflightEnabled(env=process.env){
  return isPolicyEnabled(env); // Stock is optional; purchase policy is independent.
}
function namesFor(env=process.env){
  if(production(env))return {
    approved:env.SHOP_INVENTORY_PRODUCTION_PARITY_APPROVED_NAMES,
    verified:env.SHOP_INVENTORY_PRODUCTION_VERIFIED_REMAINING_NAMES
  };
  if(preview(env))return {
    approved:env.SHOP_INVENTORY_PARITY_APPROVED_NAMES,
    verified:env.SHOP_INVENTORY_VERIFIED_REMAINING_NAMES
  };
  return {approved:"",verified:""};
}
module.exports={isPolicyEnabled,isInventoryEnabled,isCheckoutPreflightEnabled,namesFor};
