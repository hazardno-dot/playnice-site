# PlayNice Inventory Protection — production checkout compatibility review

**2026-11-16 · Design checkpoint only · NO Production migration · PR #536**

## What the deployed Supabase functions actually do

Read-only SQL inspection found that `create_or_get_checkout_order`:

1. Takes a transaction-scoped advisory lock derived from `environment:fingerprint`.
2. Checks `checkout_orders` for an identical fingerprint **created in the previous 5 minutes** with status not CANCELLED.
3. Returns that existing order within the window, otherwise inserts a new order and returns the new record.
4. Does not lock product stock, reserve ml, or distinguish a verified zero from an unknown balance.

Live checkout table triggers include `checkout_order_items_mirror` (AFTER INSERT/UPDATE) and `checkout_orders_lifecycle_guard` (BEFORE UPDATE). These are part of the existing lock and side-effect graph, and require full inspection before a transaction rewrite.

## Why draft global revision triggers must NOT be deployed

The retired `inventory_verification_revision_lock_v2.sql` installs an AFTER statement trigger on checkout/order/inventory tables that updates a singleton revision row. It also suggests the admin verifier should lock the singleton before reading inventory/order data.

This can invert lock order:

- Checkout: fingerprint advisory lock → checkout row insert/row locks → AFTER trigger → global revision row.
- Admin verification: global revision row → checkout/inventory rows while recomputing.

If each transaction holds one lock while waiting for the other, they can deadlock. More generally, one global lock becomes a hot spot on every order/status mutation (even Preview test orders), and existing write paths do not explicitly obtain it first. **Do not apply or promote the v2 SQL.**

## Safer transactional contract for implementation

1. Define a single **database-level lock order** shared by checkout order creation, all inventory events, status transitions, manual order edits, admin confirmation and reconciliation. Enumerate full existing trigger and RPC dependencies first.
2. Prefer **canonical per-product balance rows** (environment + stable product ID) and acquire them in lexicographic key order, with appropriate measures for missing/unverified product rows. Do not trust names/slugs supplied by browser.
3. For a new checkout, acquire the existing fingerprint idempotency lock and then canonical product locks. Reserve all basket items in the **same database transaction** as order insert, or commit neither. Preview and PNTEST use an entirely separate ledger.
4. Persist an order-to-reservation association with a **unique order identity and durable idempotency key**. A 5-minute duplicate window is a UX convenience, not sufficient reservation idempotency. Reusing the same fingerprint for another legitimate order later requires a separate explicit order-intent identifier; do not conflate them.
5. At PACKED, convert the reserved ml to consumed exactly once. CANCELLED prior to packing releases exactly once; PACKED/RETURNED/DELIVERY_FAILED/rollback require explicit reconciliation.
6. Admin verification must read the authoritative **server-reconstructed** inventory while holding the same product lock, and persist a version valid only for that product and ledger state. An event-based revision should advance in the writer transaction under the same lock order.
7. Unknown or stale stock must never be treated as a verified zero; do not acknowledge a stock-dependent order while the authoritative stock state is unknown. UI may fail open for cart editing, while checkout fails safely without a false out-of-stock label.

## Required acceptance gate

- No change to Production checkout or existing inventory until there is a safe, transaction-backed implementation with genuine two-connection concurrent tests.
- Tests must include two different fingerprints for the last 20 ml, same-intent replay >5 minutes later, cross-product baskets in opposite order, mid-transaction failures, PACKED rollback, mixed gifts/bundles, old orders and cancellation.
- Browser-only Preview labs and Vercel build success **cannot** establish Postgres row-lock correctness.
- The user declined a paid Supabase development branch. Do not create one or apply test SQL to the Production project without new explicit approval.
- Keep PR #536 Draft and Shadow Mode disabled in Production.

## Current review decision

Retire the singleton AFTER-trigger draft, retain read-only analytics and synthetic tests, and treat the transactional stock ledger as a separately scoped implementation requiring real database validation. No live `Inventory Verified` flags or checkout blocking are authorized by this review.
