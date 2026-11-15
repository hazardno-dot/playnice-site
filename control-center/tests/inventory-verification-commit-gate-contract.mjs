import assert from "node:assert/strict";
import fs from "node:fs";
import { assessInventoryVerificationCommit } from "../lib/inventory-verification-commit-gate.mjs";
const complete={status:"COMPLETE",revision:"snapshot-revision-1"};
const ready={
  adminAuthenticated:true,serverRecomputed:true,canonicalMappingVerified:true,
  allOrderTypesCovered:true,noUnresolvedObligations:true,transactionalLocksHeld:true,
  revisionBefore:complete,revisionAtCommit:complete,
  balanceSnapshotBefore:"85.00",balanceSnapshotAtCommit:"85.00"
};
assert.deepEqual(assessInventoryVerificationCommit(ready),{permitted:true,reason:"PRECONDITIONS_MET"});
for(const field of ["adminAuthenticated","serverRecomputed","canonicalMappingVerified",
  "allOrderTypesCovered","noUnresolvedObligations","transactionalLocksHeld"]){
  assert.equal(assessInventoryVerificationCommit({...ready,[field]:false}).permitted,false,field);
}
assert.equal(assessInventoryVerificationCommit({...ready,revisionAtCommit:{status:"PARTIAL_REVISION_ONLY",revision:"snapshot-revision-1"}}).permitted,false);
assert.equal(assessInventoryVerificationCommit({...ready,revisionAtCommit:{status:"COMPLETE",revision:"changed"}}).permitted,false);
assert.equal(assessInventoryVerificationCommit({...ready,balanceSnapshotAtCommit:"86.00"}).permitted,false);
assert.equal(assessInventoryVerificationCommit().permitted,false);
const sql=fs.readFileSync("control-center/supabase/inventory_verification_revision_v1.sql","utf8");
for(const pattern of [/ADMIN_REQUIRED/,/get_control_center_inventory_global_revision/,
  /fragrance_inventory_events/,/checkout_orders/,/order_status_events/,
  /PARTIAL_REVISION_ONLY/,/'can_authorize_verification',false/,
  /'can_enforce_stock',false/,/revoke all on function/]) assert.match(sql,pattern);
assert.doesNotMatch(sql,/\b(update|insert into|delete from)\s+public\./i);
console.log("PASS admin verification preflight fails closed on missing history, locks and changed snapshot");
