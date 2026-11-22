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
  // Signed request already authenticated above. The service-only RPC resolves
  // the provider ID against a previously recorded acceptance; never guess.
  const { data: auditStatus, error: auditError } = await admin.rpc("record_resend_lifecycle_event", {
    p_message_id: providerId,
    p_event_id: eventId,
    p_state: state,
    p_error: (state === "bounced" || state === "failed" || state === "complained" || state === "delayed")
      ? String(event?.data?.bounce?.message || event?.data?.reason || event?.type || "").slice(0, 300)
      : null
  });
  if (auditError) return response(503, { error: "Event audit unavailable" });
  if (auditStatus === "untracked_message") {
    const eventAge = Date.now() - Date.parse(event?.created_at || "");
    if (Number.isFinite(eventAge) && eventAge >= 0 && eventAge < 60000)
      return response(503, { status: "awaiting_acceptance_record" });
    return response(200, { status: "untracked_message" });
  }
  if (auditStatus !== "recorded" && auditStatus !== "already_recorded")
    return response(503, { error: "Unexpected event audit status" });
  return response(200, { status: auditStatus });
});
