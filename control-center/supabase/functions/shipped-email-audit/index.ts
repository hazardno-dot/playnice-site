// Authenticated callback from the existing Google Apps Script SHIPPED sender.
// This endpoint NEVER sends customer emails or mutates order fulfillment.
// Deploy with verify_jwt=false because Apps Script authenticates via secret.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status, headers: { "Content-Type":"application/json", "Cache-Control":"no-store" }
  });
}
async function constantTimeEqual(a: string, b: string) {
  const digest = async (value: string) => new Uint8Array(await crypto.subtle.digest(
    "SHA-256", new TextEncoder().encode(value)
  ));
  const [x,y] = await Promise.all([digest(a),digest(b)]);
  let difference = 0;
  for (let i=0; i<x.length; i++) difference |= x[i]^y[i];
  return difference === 0;
}
Deno.serve(async (req) => {
  if (req.method !== "POST") return json(405, { error:"Method not allowed" });
  const secret = Deno.env.get("PLAYNICE_SHIPPED_AUDIT_SECRET") || "";
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  const url = Deno.env.get("SUPABASE_URL") || "";
  if (!secret || secret.length < 32 || !key || !url) {
    return json(503, { error:"Audit not configured" });
  }
  const supplied = req.headers.get("x-playnice-audit-secret") || "";
  if (!supplied || !(await constantTimeEqual(supplied, secret))) {
    return json(401, { error:"Unauthorized" });
  }
  let body: any;
  try {
    const raw = await req.text();
    if (raw.length > 4096) return json(413, { error:"Payload too large" });
    body = JSON.parse(raw);
  } catch { return json(400, { error:"Invalid JSON" }); }
  const orderId = String(body?.orderId || "").trim();
  const messageId = String(body?.messageId || "").trim();
  if (!/^[A-Za-z0-9_-]{3,80}$/.test(orderId) ||
      !/^[A-Za-z0-9_-]{4,128}$/.test(messageId)) {
    return json(400, { error:"Invalid identifiers" });
  }
  const db = createClient(url, key, { auth: { autoRefreshToken:false, persistSession:false } });
  const { data: order, error: orderError } = await db.from("checkout_orders")
    .select("order_id,status").eq("order_id",orderId).eq("environment","production").maybeSingle();
  if (orderError) return json(503, { error:"Order lookup unavailable" });
  if (!order) return json(404, { error:"Order not found" });
  if (!["SHIPPED","OUT_FOR_DELIVERY","DELIVERED","DELIVERY_FAILED","RETURNED"].includes(order.status)) {
    return json(409, { error:"Order is not in a shipped lifecycle state" });
  }
  // A repeated callback can never create a second acceptance event.
  const { data: recorded, error: readError } = await db.from("order_email_events")
    .select("id,order_id").eq("provider_message_id",messageId).eq("state","accepted").limit(1);
  if (readError) return json(503, { error:"Audit lookup unavailable" });
  if (recorded?.length) {
    return recorded[0].order_id === orderId
      ? json(200, { status:"already_recorded" })
      : json(409, { error:"Message ID already belongs to another order" });
  }
  const { data: prior, error: priorError } = await db.from("order_email_events")
    .select("provider_message_id").eq("order_id",orderId)
    .eq("stage","SHIPPED").eq("recipient_role","customer").eq("state","accepted").limit(1);
  if (priorError) return json(503, { error:"Audit lookup unavailable" });
  if (prior?.length) return json(409, { error:"A different SHIPPED email is already accepted" });
  const { error } = await db.from("order_email_events").insert({
    order_id:orderId,stage:"SHIPPED",recipient_role:"customer",
    state:"accepted",source:"send_api",provider_message_id:messageId
  });
  if (error?.code === "23505") return json(200, { status:"already_recorded" });
  if (error) return json(503, { error:"Audit write unavailable" });
  return json(200, { status:"recorded" });
});