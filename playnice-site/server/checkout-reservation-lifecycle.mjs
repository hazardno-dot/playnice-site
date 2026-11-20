// Design contract for future transactionally admitted inventory reservations.
// NOT connected to checkout, Control Center, or Production. No DB writes.
// Reservation state must be derived from authoritative order state and confirmed
// physical return, never a browser field, a tracking label, or COD payout.
const PRE_SHIPMENT = new Set(["NEW","PACKED"]);
const IN_TRANSIT = new Set(["SHIPPED","OUT_FOR_DELIVERY","DELIVERY_FAILED"]);
export function reservationDisposition(status,{returnRestocked=false,wasShipped=false}={}){
  if(typeof status!=="string")return "HOLD_UNKNOWN";
  if(PRE_SHIPMENT.has(status))return "RESERVE";
  if(IN_TRANSIT.has(status))return "COMMITTED";
  if(status==="DELIVERED")return "COMMITTED";
  if(status==="RETURNED")return returnRestocked===true?"RELEASED":"HOLD_RETURN";
  if(status==="CANCELLED")return wasShipped?"HOLD_RETURN":"RELEASED";
  if(status==="DUPLICATE")return "NO_RESERVATION";
  return "HOLD_UNKNOWN";
}
export function admittedOrderFootprint(rows,{includeUnknown=true}={}){
  if(!Array.isArray(rows))return {complete:false,committedMl:0};
  let cents=0;
  for(const row of rows){
    const disp=reservationDisposition(row?.status,{
      returnRestocked:row?.returnRestocked===true,
      wasShipped:row?.wasShipped===true
    });
    if(disp==="HOLD_UNKNOWN" && !includeUnknown)return {complete:false,committedMl:0};
    if(disp==="RELEASED"||disp==="NO_RESERVATION")continue;
    const qty=Number(row?.ml);
    if(!Number.isFinite(qty)||qty<=0||Math.abs(qty*100-Math.round(qty*100))>1e-6)
      return {complete:false,committedMl:0};
    cents+=Math.round(qty*100);
    if(!Number.isSafeInteger(cents))return {complete:false,committedMl:0};
  }
  return {complete:true,committedMl:cents/100};
}
