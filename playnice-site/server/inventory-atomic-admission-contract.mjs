// Inactive transaction orchestrator for the future Supabase checkout admission RPC.
// Adapter calls MUST execute under one real PostgreSQL transaction; never call
// this with separate REST/RPC requests as that would lose lock atomicity.
// The client cannot provide policy, Remaining, duplicate status or reservations.
import { collectOrderFragranceMl } from "./inventory-checkout-guard.mjs";
const cleanFingerprint=(x)=>typeof x==="string"&&/^[0-9a-f]{64}$/.test(x)?x:null;
const normalizeAvailability=(value)=>{
  if(value==null||value?.status==="UNKNOWN")return {status:"UNKNOWN"};
  if(value.status!=="VERIFIED" || typeof value.remainingMl!=="number" ||
     !Number.isFinite(value.remainingMl)||value.remainingMl<0)
    return {status:"UNKNOWN"};
  return value;
};
export async function admitAtomicCheckout({store,payload,fingerprint,environment}){
  if(!store?.transaction || !cleanFingerprint(fingerprint) ||
     !["preview","production"].includes(environment))
    return {decision:"INVALID_ORDER"};
  const parsed=collectOrderFragranceMl(payload?.items);
  if(parsed.status!=="VALID")return {decision:"INVALID_ORDER"};
  const demand=parsed.totals.slice().sort((a,b)=>
    a.productName.localeCompare(b.productName,"en"));
  try{
    return await store.transaction(async tx=>{
      // This sequence is contractual: dedupe lock -> existing order check ->
      // sorted fragrance locks -> trusted policy -> stock -> INSERT+reservation.
      await tx.lockFingerprint(environment,fingerprint);
      const previous=await tx.getExistingByFingerprint(environment,fingerprint);
      if(previous)return {decision:"DUPLICATE",order:previous};
      await tx.lockFragrances(environment,demand.map(x=>x.productName));
      for(const item of demand){
        const policy=await tx.getPolicyCap(item.productName);
        if(policy?.status==="READY"){
          const cap=Number(policy.maximumMl);
          if(!Number.isFinite(cap)||cap<=0)
            return {decision:"UNAVAILABLE"};
          if(Math.round(item.requestedMl*100)>Math.round(cap*100))
            return {decision:"PURCHASE_CAP_REACHED"};
        }else if(policy?.status!=="UNKNOWN"){
          return {decision:"UNAVAILABLE"};
        }
        const stock=normalizeAvailability(await tx.getRemaining(item.productName));
        if(stock.status==="VERIFIED" &&
          Math.round(item.requestedMl*100)>Math.round(stock.remainingMl*100))
          return {decision:"STOCK_LIMIT_REACHED"};
      }
      // These operations must roll back together if any insert fails.
      const order=await tx.insertCheckoutOrder({payload,fingerprint,environment});
      await tx.insertReservationLines(order.id,demand);
      return {decision:"ACCEPTED",order};
    });
  }catch{
    // Never claim acceptance on transaction errors.
    return {decision:"UNAVAILABLE"};
  }
}
