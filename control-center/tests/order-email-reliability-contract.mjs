import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import vm from "node:vm";
import { createHmac, webcrypto } from "node:crypto";

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const checkout = read("playnice-site/api/checkout.js");
const packed = read("playnice-site/api/order-status-email.js");
const orders = read("control-center/server/orders.js");
const ui = read("control-center/src/OrdersManager.jsx");
const edge = read("control-center/supabase/functions/checkout-order-store/index.ts");
const schema = read("control-center/supabase/order_email_events_v1_DRAFT.sql");
const webhook = read("control-center/supabase/functions/resend-email-events/index.ts");

assert.ok(checkout.includes("originalSend(adminPayload).then(requireResendAccepted)"), "Admin Resend response must be validated.");
assert.ok(checkout.includes("originalSend(payload).then(requireResendAccepted)"), "Customer Resend response must be validated independently.");
assert.ok(checkout.includes("result?.error || !result?.data?.id"), "HTTP 422 response may resolve with Resend SDK error.");
assert.ok(checkout.includes('!localPart.endsWith(".")'), "Trailing dot in customer local-part must not block merchant notification.");
assert.ok(checkout.includes("delete adminPayload.replyTo"), "Invalid admin Reply-To must be omitted.");
assert.ok(checkout.includes("context.adminEmailSent = null"), "Duplicate suppression cannot report a message as sent.");
assert.ok(packed.includes("if (result?.error || !result?.data?.id)"), "PACKED email must require Resend acknowledgement.");
assert.ok(orders.includes("recordEmailEvent"), "PACKED acceptance must be auditable.");
assert.ok(orders.includes('"skipped_missing_customer_email"'), "Missing customer email must produce actionable PACKED failed audit.");
assert.ok(orders.includes("packedEmailAlreadyAccepted"), "PACKED re-entry must check for prior acceptance.");
assert.ok(orders.includes('status_email_status: "already_accepted"'), "Previously accepted PACKED email must not be resent.");
assert.ok(orders.includes('status_email_status: "audit_unavailable"'), "PACKED send must fail closed when its acceptance audit cannot be consulted.");
assert.ok(orders.includes('status_email_audit_warning'), "Audit write failures must be disclosed without re-sending.");
assert.ok(ui.includes("Unverified") && ui.includes("Not tracked"), "Historical and shipped statuses must not be represented as delivered.");
assert.ok(ui.includes("Accepted means Resend acknowledged"), "Accepted must not be represented as delivered.");
assert.ok(edge.includes('eq("sync_token", syncToken)'), "Email audit writes must verify order-specific sync token.");
assert.ok(schema.includes("enable row level security"), "Email events table must enforce RLS.");
assert.ok(!orders.includes('sendShippedStatusEmail('), "Do not duplicate existing SHIPPED messaging flow.");


const acceptanceSrc = checkout.match(/function requireResendAccepted\(result\) \{[\s\S]*?\n\}/)?.[0];
const replySrc = checkout.match(/function validReplyTo\(value\) \{[\s\S]*?\n\}/)?.[0];
assert.ok(acceptanceSrc && replySrc, "Email acceptance helpers must exist.");
const helpers = vm.runInNewContext(acceptanceSrc + "\n" + replySrc + "\n({ requireResendAccepted, validReplyTo })");
assert.equal(helpers.requireResendAccepted({ data: { id: "msg_123" }, error: null }).data.id, "msg_123");
assert.throws(() => helpers.requireResendAccepted({ data: null, error: { message: "Invalid reply_to field" } }), /Invalid reply_to/);
assert.throws(() => helpers.requireResendAccepted({ data: null, error: null }), /did not accept/);
assert.equal(helpers.validReplyTo("buyer.@gmail.com"), false);
assert.equal(helpers.validReplyTo(".buyer@gmail.com"), false);
assert.equal(helpers.validReplyTo("buyer@gmail.com"), true);

assert.ok(schema.includes("provider_event_id"), "Webhook event IDs must be unique for replay safety.");
assert.ok(schema.includes("claim_packed_email_retry"), "Manual retry requires an atomic admin claim.");
assert.ok(schema.includes("enable row level security"), "Email audit is admin-only.");
assert.ok(schema.includes("state='accepted'"), "A provider-accepted message cannot be retried, including bounced mail.");
assert.ok(orders.includes('action === "retry_packed_email"'), "Retry is routed through authenticated Orders API.");
assert.ok(orders.includes("packedEmailAlreadyAccepted"), "Retry must check existing accepted events.");
assert.ok(orders.includes("STATUS_EMAIL_ENABLED && WRITE_THROUGH_ENABLED && emailAudit.ready"), "Retry UI must be disabled in Preview.");
assert.ok(webhook.includes('req.headers.get("svix-id")') && webhook.includes("verifyResendSignature"), "Signed webhook must validate Svix headers.");
assert.ok(webhook.includes('.eq("provider_message_id", providerId)') && webhook.includes('.eq("state", "accepted")'), "Webhook must match known provider ID, not recipient address.");
assert.ok(webhook.includes('insertError?.code === "23505"'), "Duplicate provider events must be idempotent.");

const verifierSource = webhook.match(/async function verifyResendSignature\\([\\s\\S]*?\\n\\}/)?.[0];
assert.ok(verifierSource, "Signature verifier must be present.");
const verifierJs = verifierSource.replace(/:\\s*(?:string|Headers|Uint8Array)/g, "");
const verifySignature = vm.runInNewContext(verifierJs + "\\nverifyResendSignature", {
  crypto: webcrypto, Uint8Array, Date, TextEncoder, atob
});
const raw = JSON.stringify({ type: "email.delivered", data: { email_id: "msg_test" } });
const keyBytes = Buffer.from("playnice-test-webhook-signature-key");
const secret = "whsec_" + keyBytes.toString("base64");
const id = "msg_local_test";
const timestamp = String(Math.trunc(Date.now()/1000));
const signature = createHmac("sha256",keyBytes).update(id + "." + timestamp + "." + raw).digest("base64");
const headers = new Headers({ "svix-id":id, "svix-timestamp":timestamp, "svix-signature":"v1," + signature });
assert.equal(await verifySignature(raw, headers, secret), true, "Valid signed event must verify.");
assert.equal(await verifySignature(raw + " ", headers, secret), false, "Modified body must fail verification.");
assert.equal(await verifySignature(raw, new Headers({ "svix-id":id, "svix-timestamp":"1", "svix-signature":"v1," + signature }), secret), false, "Stale signatures must fail verification.");

console.log("PASS  Email reliability, webhook signature and retry claim contracts (no live sends or writes)");
