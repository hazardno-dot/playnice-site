# PlayNice — Email Reliability v1 rollout checklist (PR #569)

**Status:** staged in GitHub only. No production changes, no real emails sent by this work.

## Boundaries
- Checkout: independent merchant and customer Resend acceptance; order persistence does not depend on email.
- PACKED: one send on NEW → PACKED; auditable result and *at most one* explicit operator retry after confirmed failure. No auto retry. Previously accepted emails must not be re-sent, including bounced/delayed deliveries.
- SHIPPED: **not integrated**. Current message is sent by external Google Apps Script / courier workflow, whose source is not in this repository or accessible Drive search. Do not add a second SHIPPED sender or imply it is tracked. To finish SHIPPED, obtain the deployed Apps Script source and add a callback reporting the actual Resend message ID (or move ownership through a separately reviewed change).
- Provider states: `accepted` means Resend API accepted, **not** mailbox delivery; signed webhook reports `delivered`, `delayed`, `bounced`, `failed`, and `complained`.
- Historical `admin_email_sent=true` / `customer_email_sent=true` flags cannot prove delivery; show **Unverified** until an authenticated provider record exists.

## Required rollout order (single coordinated release; no intermediate Vercel Preview deploys)
1. Review SQL `control-center/supabase/order_email_events_v1_DRAFT.sql` (admin-only RLS, event dedup, retry claims). Apply to the correct Supabase project only after code + tests have been approved. This is not applied automatically by merging.
2. Verify Supabase function `checkout-order-store` deployed source matches new `mark_email` contract, then deploy updated `control-center/supabase/functions/checkout-order-store/index.ts` after schema. The Shop checkout expects `emailAuditRecorded`; if unavailable it logs a warning but never blocks order persistence.
3. Deploy `resend-email-events` Edge Function from `control-center/supabase/functions/resend-email-events/index.ts`, with **JWT verification disabled only for this signed webhook**. It authenticates *every* call via Svix HMAC. Ensure Supabase secrets `RESEND_WEBHOOK_SECRET`, `SUPABASE_URL`, and `SUPABASE_SERVICE_ROLE_KEY` exist; never expose them in React or commit them.
4. In Resend dashboard configure one webhook endpoint at the deployed `/functions/v1/resend-email-events`, selecting `email.delivered`, `email.delivery_delayed`, `email.bounced`, `email.failed`, `email.complained`. Save signing secret as the Supabase function secret. No webhook is created in the dashboard by this PR.
5. Trigger one final **coordinated Preview deployment** of the same final Git SHA for PlayNice Shop and Control Center (two Vercel projects, one tested revision). Respect Vercel build limit; don't change Production yet.
6. Verify builds and automated contract tests, then test manually in Preview **without checkout submission or real customer email sends**. Check empty audit fallback, current order display, mobile/desktop alignment, suppressed retry button in Preview, authentication denial, rejection of unsigned/tampered/stale webhook fixtures, and independent error handling.
7. Coordinate Production rollout and full read-only QA. Real end-to-end email acceptance and provider delivery cannot be confirmed without a controlled, explicitly approved send after deploy. Do not silently replay PN2611-1084.

## Operational safety
- Do **not** touch inventory logic, courier status, customer data or Google Sheets mirror.
- The webhook matches solely audited provider message IDs and uses signed events; it does not guess by subject or recipient.
- The endpoint deduplicates webhook events by `svix-id` and returns 503 on temporary storage failures to permit provider retry.
- An uncertain manual retry is intentionally consumed once; verify Resend before any further corrective action.
- Do not merge PR #569 or change Production environment until SHIPPED ownership is understood and the remaining tests pass.
