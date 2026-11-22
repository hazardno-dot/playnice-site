# SHIPPED email tracking — Apps Script integration contract (DRAFT)

## Scope and prerequisites
The deployed Apps Script source is **not present** in this repository. Existing
`order-state-sync-v4.md` describes Google Sheets mirror/status behavior, not
the actual mail-sending implementation. The SHIPPED sender must first be located
and audited. This document is a contract, **not** a claim that Apps Script was edited.

## Goal
Continue to send exactly **one** SHIPPED customer email through the current
authoritative sender, then record the actual Resend acceptance result. Do not
create a parallel sender in Control Center.

## Safe integration contract
1. Find the current owner of the SHIPPED email (Apps Script, a webhook invoked by
   Apps Script, or another service). Inspect actual deployment/source, all triggers,
   and conditions before modifying.
2. Preserve the existing SHIPPED transition, tracking, Google Sheets mirror,
   checkout order, and courier settlement semantics.
3. When the existing sender calls Resend, distinguish:
   - `accepted`: Resend returned `data.id` and no `error`.
   - `failed`: Resend returned `error`, HTTP failure, or no provider ID.
   - `not attempted`: no SHIPPED send should have occurred.
   Do **not** treat an HTTP-completed SDK promise as delivery.
4. Record `order_id`, `SHIPPED`, `customer`, `accepted|failed`,
   `provider_message_id` (when accepted), and bounded error text through a
   **server-authenticated** endpoint. Do not expose a service-role or privileged
   API secret in the browser, shared Sheets, or GitHub.
5. Make repeated status sync/retries idempotent. A previously accepted
   SHIPPED mail may not be re-sent automatically even if later bounced.
6. Do not infer `Delivered` from Apps Script: verified Resend lifecycle webhooks
   must match the recorded provider message ID.
7. If delivery-event recording fails, the fulfillment state remains intact;
   persist a visible audit warning and **do not silently resend**.

## Before implementation
- Obtain the current full deployed Apps Script `.gs` source (not only the
  historical markdown contract), plus its relevant deployment/trigger configuration.
- Identify whether Apps Script actually sends email or merely updates a Sheet
  that triggers an external sender. Track only from the verified owner.
- Design and review authenticated callback + atomic idempotency claim before
  allowing any real send in a test.
- Verify Preview cannot generate a real customer notification.

## Validation matrix (offline first)
- NEW -> PACKED -> SHIPPED: exactly one SHIPPED email acceptance, one audit event.
- Repeated SHIPPED status sync: zero additional sends.
- Accepted but later bounced: state displays bounce, no automatic resend.
- Resend {error} 422: failed, not accepted, order state unchanged.
- Audit endpoint unavailable: order state unchanged, warning displayed, no duplicate.
- Invalid or missing customer address: log failure/skip as appropriate, no side effects.

**Current status:** blocked pending authoritative sender source; SHIPPED remains
`Not tracked` in the Control Center until implementation and verification.
