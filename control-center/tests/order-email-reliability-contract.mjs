import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import vm from "node:vm";

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const checkout = read("playnice-site/api/checkout.js");
const packed = read("playnice-site/api/order-status-email.js");
const orders = read("control-center/server/orders.js");
const ui = read("control-center/src/OrdersManager.jsx");
const edge = read("control-center/supabase/functions/checkout-order-store/index.ts");
const schema = read("control-center/supabase/order_email_events_v1_DRAFT.sql");

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

console.log("PASS  Email reliability and CC visibility contract (no live emails or order writes)");
