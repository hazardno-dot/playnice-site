// Synthetic transactional verification specification; NO DB, network or checkout.
// Models optimistic revision checks under one product lock. In a real database
// the order, inventory and verification writers must share the same lock.
// This lab does NOT demonstrate actual PostgreSQL isolation or completeness.
export class InventoryVerificationTransactionLab {
  constructor(initial = {}) {
    this.rows = new Map();
    for (const [key, remainingMl] of Object.entries(initial)) {
      if (typeof remainingMl !== "number" || !Number.isFinite(remainingMl) || remainingMl < 0)
        throw new Error("INVALID_OPENING_BALANCE");
      this.rows.set(key,{remainingMl,revision:0,verification:null});
    }
  }
  snapshot(productKey) {
    const row = this.rows.get(productKey);
    return row ? {productKey,remainingMl:row.remainingMl,revision:row.revision}:null;
  }
  change(productKey,deltaMl,{reason="INVENTORY_EVENT"}={}) {
    const row=this.rows.get(productKey);
    if (!row || typeof deltaMl!=="number" || !Number.isFinite(deltaMl) ||
        !Number.isSafeInteger(Math.round(deltaMl*100)) ||
        row.remainingMl+deltaMl<0) return {ok:false,reason:"INVALID_CHANGE"};
    row.remainingMl=Math.round((row.remainingMl+deltaMl)*100)/100;
    row.revision++;
    row.verification=null; // even +5, -5 must not preserve a prior verification
    return {ok:true,reason,revision:row.revision};
  }
  verify(productKey,reviewed,{admin=false,mapping=false,ordersComplete=false,
    obligationsResolved=false,sharedLock=false}={}) {
    const row=this.rows.get(productKey);
    if (!row || !reviewed || reviewed.productKey!==productKey)
      return {ok:false,reason:"UNKNOWN_PRODUCT"};
    if (!admin) return {ok:false,reason:"ADMIN_REQUIRED"};
    if (!mapping) return {ok:false,reason:"MAPPING_UNVERIFIED"};
    if (!ordersComplete) return {ok:false,reason:"ORDER_COVERAGE_INCOMPLETE"};
    if (!obligationsResolved) return {ok:false,reason:"UNRESOLVED_ORDER_OBLIGATIONS"};
    if (!sharedLock) return {ok:false,reason:"ATOMIC_LOCK_REQUIRED"};
    if (reviewed.revision!==row.revision || reviewed.remainingMl!==row.remainingMl)
      return {ok:false,reason:"STALE_SNAPSHOT"};
    row.verification={revision:row.revision,remainingMl:row.remainingMl};
    return {ok:true,reason:"VERIFIED_FOR_REVIEW_ONLY"};
  }
  verificationStatus(productKey) {
    const row=this.rows.get(productKey);
    if (!row || !row.verification) return "NOT_VERIFIED";
    return row.verification.revision===row.revision &&
      row.verification.remainingMl===row.remainingMl?"REVIEWED":"STALE";
  }
}
