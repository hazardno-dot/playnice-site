# Atomic Inventory Admission — design checkpoint (NOT active)

Status: **Draft / security review.** No new SQL installed, no checkout hook, no
orders written, no Preview or Production enforcement enabled by this design.

## Verified legacy integration boundaries (read-only inspection)
- Browser submits `/api/checkout`; server wrapper invokes
  `checkout-order-store` Edge Function.
- `checkout-order-store` v9 calls `create_or_get_checkout_order`.
- Existing SQL uses `pg_advisory_xact_lock(hashtextextended(environment || ':' ||
  fingerprint,0))` and looks for matching fingerprints within five minutes.
  This guarantees same-fingerprint idempotency, **not** different-fingerprint
  inventory admission.
- The actual INSERT occurs in `create_or_get_checkout_order`.
- CC status transitions use `update_control_center_order`; courier COD
  settlement also transitions orders via `settle_control_center_courier_batch`.
- All three write paths must participate in one canonical reservation lifecycle
  once deployed. Never build a separate customer-facing order database.

## Required atomic transaction, not two API calls
A replacement, service-role-authorized **checkout admission RPC** must:
1. Validate the entire order payload (including bundles, canonical perfume IDs,
   quantities, and the authoritative per-fragrance cap) on the server.
2. Take deterministic transaction-scoped product locks (sorted canonical
   product IDs) **before reading available inventory**. Deduplication by
   fingerprint must occur inside the same admission transaction and take
   precedence over new stock reservations.
3. Compute current remaining from the exact same validated ledger and historical
   rules as CC; include all currently committed shipments and all still-active
   accepted NEW reservations. Unverified stock stays UNKNOWN/fail-open, but
   malformed demand is INVALID_ORDER; a verified policy cap is independent.
4. Reject any known overdraw with a generic non-disclosing reason. If allowable,
   insert the real order **and** its per-fragrance reservation rows in the **same
   database transaction**. Any exception rolls back *both*. Response and
   fingerprint must remain backward compatible with existing PN/PNTEST IDs.
5. Only after commit, the Edge Function may enqueue Sheets mirror and send
   existing emails. Retries return the same order without allocating more stock.
6. CC status transitions must update reservation disposition in the same
   transaction that updates order status. Never double subtract both a
   SHIPPED parcel and the reservation for that same parcel.
7. CANCELLED before shipping may release. DELIVERY_FAILED and a RETURNED
   tracking label do **not** imply goods are available. Return release requires
   confirmed physical inspection/restock. COD settlement itself is **not** a
   stock movement.
8. Any side channel (manual order, admin mutation, legacy Edge Function
   revision, direct SQL) that bypasses reservation locks invalidates the
   concurrency guarantee. Rollout requires migrating/auditing these writers.

## Isolation and deployment gates
- Preview first; preview PNTEST must not consume Production stock or order
  sequence. Real Production reservations must never be created by Preview QA.
- Secrets stay on server/Edge Function; no user supplied `remaining_ml`,
  policy cap, trusted availability flag, or reservation identifier is accepted.
- Compare all 115 computed Remaining rows against CC after status lifecycle
  adjustments. A read-only parity proof is *not* a physical-count certificate.
- Prove two different simultaneous fingerprints for one 40 ml fragrance cannot
  both commit 30 ml, including tests with transaction delays and retries.
- Prove same-fingerprint retry returns one reservation, cancellation before
  ship frees it, delivery does not double charge, DELIVERY_FAILED retains it,
  and physical restock after return frees it once.
- Require a backup/rollback strategy and schema/security review. Production
  activation, SQL install, merge and status migration each require explicit
  separate approval.

## Current implementation boundary
Pure validation: `playnice-site/server/inventory-checkout-guard.mjs`
Pure lifecycle contract: `playnice-site/server/checkout-reservation-lifecycle.mjs`
These modules are **not connected** to `/api/checkout`; they are not an
atomic reservation or a live enforcement mechanism.
