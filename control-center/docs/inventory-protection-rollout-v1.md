# PlayNice Inventory Protection — audit and staged rollout v1

Status: **AUDIT / PREPARATION ONLY**. No customer blocking, reservations, database migration or live telemetry enabled by this change. Do not enable enforcement from a UI toggle before all gates pass.

## Approved customer-facing text (Serbian ekavian, Latin script)
- **Dostignuta je maksimalna količina za ovaj parfem.**
- **Možete nastaviti kupovinu sa već dodatom količinom.**
Never disclose physical milliliters, reservations or precise balance publicly. Do not falsely call this a per-customer limit.

## Verified code-level findings (main baseline, 2026-11-09)
- `control-center/server/orders.js`: `buildInventoryAnalytics` computes remaining stock from opening/restock, manual out and consumption **only for PACKED, SHIPPED, OUT_FOR_DELIVERY, DELIVERED, DELIVERY_FAILED**. NEW orders are not presently included as reservations.
- `control-center/supabase/inventory_consumption_v1.sql`: `fragrance_inventory_events` stores OPENING and RESTOCK events; stock RPC is admin-only. Public stock endpoint is not present in this migration.
- `control-center/server/orders.js`: canonicalization currently relies on product names and aliases; gift samples and bundles use special parsing.
- `control-center/supabase/functions/checkout-order-store/index.ts`: successful checkout calls `create_or_get_checkout_order`; order creation must be the single future transaction boundary for stock reservations and deduplication.
- `playnice-site/api/checkout.js`: on-site checkout uses Supabase-first persistence with timeouts/retries and email/Google Sheets handling. No stock-authoritative enforcement is visible in that wrapper.

## Critical safeguards required before activation
1. **Inventory audit:** inspect real records for every product. Establish stable product identifiers, confirmed measured baselines, consistent units and mapping, all restocks/outflows, stock status and exclusions (estimated, missing, mismatched, negative).
2. **Reservations:** reserve only on successful order creation, never on add-to-cart. Include NEW and other unfulfilled accepted orders in availability; transition reservation to physical consumption exactly once at PACKED. Define precise behavior for cancellation, delivery failures, returns, manual orders, gifts, promotions and partial edits.
3. **Concurrency:** inventory validation, reservation, idempotent checkout and order creation must be one atomic database transaction with appropriate row locking. Two simultaneous customers cannot both consume the same final milliliters.
4. **Resilience:** distinguish UNKNOWN/ERROR from OUT_OF_STOCK. Never turn a network timeout, unverified baseline, missing mapping or stale cache into a public stock-out assertion. An unverified add-to-cart may continue, but checkout must not confirm an unvalidated order.
5. **Privacy/security:** public APIs expose only allow/deny or neutral availability, never raw inventory balances, customer identity or admin RPCs. Rate-limit and log events without excessive personal data.
6. **Observability:** authenticated Control Center dashboard for checks, would-block decisions, unknowns/errors, stock mismatch, checkout conflicts, and timings. Instrument actual server requests and customer interactions; do not imply that a synthetic calculation alone represents live telemetry.
7. **Rollback:** separate flag for client-side restrictions; never silently bypass the server's stock consistency protections. Define a safe degraded checkout policy and escalation process.

## Stages and gates
- **1 Audit (current):** review source and real inventory data in read-only mode; document discrepancies and products ineligible for protection.
- **2 Shadow:** integrate the read-only evaluator on backend with admin-only event storage, privacy-safe dashboard and monitoring. No customer restrictions. Verify comparisons against real orders, actual stock and manually checked outcomes. This module alone is not a deployed shadow service.
- **3 Preview:** test 2/5/10/20 ml aggregation, repeated additions, bundles, stale cart, manual orders, gifts, refunds, duplicated submits, concurrent checkouts, network failure, unknown stock and deterministic rollback. Use PNTEST and ensure cleanup does not consume production order IDs or stock.
- **4 Graduated enforcement:** enable only for verified products after successful reviewed tests; monitor live rejects and unexpected failures; no automatic rollout to unverified products.

## Decision contract
The standalone read-only `lib/inventory-protection-shadow.mjs` evaluator produces ALLOW / WOULD_BLOCK / UNKNOWN. UNKNOWN must never be interpreted as zero stock. It accepts normalized stable product keys, not raw UI product names; integration requires verified identifiers and a trusted reservation source. It has no side effects, persists no events, and is not an actual enforcement mechanism.

## Manual checks required
- Live Supabase data accuracy and schema/function currently deployed versus migration files.
- Full SQL definition of `create_or_get_checkout_order`, order status transition RPCs and gift calculation; all must be reviewed before modifying transactional behavior.
- Review the existing CC dashboard hierarchy and authenticated API pattern before adding monitoring.
- Review Preview deployment and automated contracts before merge. **Do not merge or deploy automatically.**
