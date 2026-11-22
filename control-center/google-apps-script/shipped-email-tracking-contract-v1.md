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


## Confirmed against current Apps Script source (22 Nov 2026)
The user supplied the full 4,709-line Apps Script. Actual sender functions are:
- `handleOrderStateSync` mirrors `SHIPPED` and calls `processShippedOrders()` on the first transition to legacy `SHIPPED`.
- `processShippedOrders()` scans Orders rows; column F `shippedEmailSent` stores `YES`/`NO_EMAIL`/`ERROR`; column G `shippedAt` stores the send timestamp.
- `sendShippedEmail(order)` calls `https://api.resend.com/emails` using UrlFetchApp, checks HTTP 2xx AND returned Resend `id`. Existing sender already has correct acceptance validation.
- There is also a separate `processDeliveryAlertEmails()` path; DO NOT change it with the SHIPPED patch.

### Prepared Apps Script change (NOT installed)
A complete modified `.gs` draft was prepared from the supplied source. It:
1. Uses a script lock for the complete SHIPPED scan to guard concurrent sends.
2. Marks `SENDING` before HTTP; `ERROR`/`SENDING` are **not automatically retried** because a network timeout may hide a successful acceptance.
3. Persists `YES` and the Resend message ID in the cell note immediately after accepted send. Audit failure never changes YES.
4. Sends a separate authenticated acceptance-only callback to `shipped-email-audit` without sending an email again.
5. Stores `Audit: PENDING` in the cell note when callback is unavailable; later scan may retry **only the callback**, never Resend.
6. Releases the lock before calling `processDeliveryAlertEmails()`, which has its own lock.

The draft App Script must be manually reviewed/pasted/deployed as a deliberate separate step; updating this repository does NOT update the active Apps Script.

### Required script properties (do not commit values)
- `PLAYNICE_SHIPPED_AUDIT_URL`: deployed HTTPS Supabase `/functions/v1/shipped-email-audit` endpoint.
- `PLAYNICE_SHIPPED_AUDIT_SECRET`: long random secret (at least 32 chars), the same secret set in Supabase Edge Function environment.
- Existing `RESEND_API_KEY` and `RESEND_FROM_EMAIL` remain unchanged.

### Supabase receiver (GitHub staged)
- `control-center/supabase/functions/shipped-email-audit/index.ts`
- Never sends a message or changes order status.
- Requires the secret header, matches a production order already in shipped lifecycle, and appends a provider acceptance event; duplicate callback is idempotent.
- Deploy with JWT verification disabled **only because the function independently authenticates** with its secret.
- Deploy schema + receiver before switching the live Apps Script. Do not invoke any callback with real order data until the configuration is approved.
