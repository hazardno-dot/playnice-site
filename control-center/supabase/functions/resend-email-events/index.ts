// Signed Resend lifecycle webhook. Deploy with verify_jwt=false ONLY because
// every request is authenticated using Svix HMAC over the unmodified body.
// Required secret: RESEND_WEBHOOK_SECRET (whsec_... from Resend).
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const states: Record<string, string> = {
  "email.delivered": "delivered",
  "email.bounced": "bounced",
  "email.delivery_delayed": "delayed",
  "email.failed": "failed",
  "email.complained": "complained",
};

function response(code: number, data: Record<string, unknown>) {
  return new Response(JSON.stringify(data), {
    status: code,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

async function verifyResendSignature(rawBody: string, headers: Headers, secret: string) {
  const id = headers.get("svix-id") || "";
  const timestamp = headers.get("svix-timestamp") || "";
  const signatures = headers.get("svix-signature") || "";
  const timestampSeconds = Number(timestamp);
  if (!id || !Number.isInteger(timestampSeconds) || !signatures || !secret.startsWith("whsec_")) return false;
  if (Math.abs(Date.now() / 1000 - timestampSeconds) > 300) return false;
  let keyBytes: Uint8Array;
  try {
    keyBytes = Uint8Array.from(atob(secret.slice(6)), (char) => char.charCodeAt(0));
  } catch { return false; }
  const key = await crypto.subtle.importKey("raw", keyBytes, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const digest = new Uint8Array(await crypto.subtle.sign(
    "HMAC", key, new TextEncoder().encode(id + "." + timestamp + "." + rawBody)
  ));
  // Svix signatures are 'v1,<base64>' possibly with more than one signature.
  return signatures.split(" ").some((part) => {
    const [version, encoded] = part.split(",");
    if (version !== "v1" || !encoded) return false;
    let supplied: Uint8Array;
    try { supplied = Uint8Array.from(atob(encoded), (char) => char.charCodeAt(0)); }
    catch { return false; }
    if (supplied.length !== digest.length) return false;
    let difference = 0;
    for (let i = 0; i < digest.length; i++) difference |= supplied[i] ^ digest[i];
    return difference === 0;
  });
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return response(405, { error: "Method not allowed" });
  const secret = Deno.env.get("RESEND_WEBHOOK_SECRET") || "";
  const url = Deno.env.get("SUPABASE_URL") || "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  if (!secret || !url || !serviceKey) return response(503, { error: "Webhook not configured" });

  let rawBody: string;
  try { rawBody = await req.text(); } catch { return response(400, { error: "Invalid body" }); }
  if (rawBody.length > 128000) return response(413, { error: "Payload too large" });
  if (!(await verifyResendSignature(rawBody, req.headers, secret))) {
    return response(401, { error: "Invalid signature" });
  }

  let event: any;
  try { event = JSON.parse(rawBody); } catch { return response(400, { error: "Invalid JSON" }); }
  const state = states[String(event?.type || "")];
  if (!state) return response(200, { status: "ignored_event_type" });
  const providerId = String(event?.data?.email_id || "").trim();
  const eventId = String(req.headers.get("svix-id") || "").trim();
  if (!providerId || !eventId || providerId.length > 128 || eventId.length > 128) {
    return response(400, { error: "Missing email or event identity" });
  }

  const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
  // Never link a webhook to an order by recipient address or untrusted subject.
  // Only a message ID previously accepted and audited by PlayNice can be updated.
  const { data: matches, error: lookupError } = await admin.from("order_email_events")
    .select("order_id,stage,recipient_role")
    .eq("provider_message_id", providerId)
    .eq("state", "accepted")
    .order("created_at", { ascending: false })
    .limit(1);
  if (lookupError) return response(503, { error: "Event lookup unavailable" });
  if (!matches?.length) {
    // A Resend delivery event may race the checkout acceptance audit.
    // Ask Resend to retry the fresh event once; older untracked messages
    // are acknowledged without altering unrelated orders.
    const eventAge = Date.now() - Date.parse(event?.created_at || "");
    if (Number.isFinite(eventAge) && eventAge >= 0 && eventAge < 60000) {
      return response(503, { status: "awaiting_acceptance_record" });
    }
    return response(200, { status: "untracked_message" });
  }

  const match = matches[0];
  // Store receipt time for chronological UI ordering. Provider events may
  // have occurred before the acceptance audit committed and can be retried.
  const createdAt = new Date().toISOString();
  const { error: insertError } = await admin.from("order_email_events").insert({
    order_id: match.order_id,
    stage: match.stage,
    recipient_role: match.recipient_role,
    state,
    source: "resend_webhook",
    provider_event_id: eventId,
    provider_message_id: providerId,
    error_message: (state === "bounced" || state === "failed" || state === "complained" || state === "delayed")
      ? String(event?.data?.bounce?.message || event?.data?.reason || event?.type || "").slice(0, 300)
      : null,
    created_at: createdAt || new Date().toISOString(),
  });
  if (insertError?.code === "23505") return response(200, { status: "already_recorded" });
  if (insertError) return response(503, { error: "Event write unavailable" });
  return response(200, { status: "recorded" });
});
