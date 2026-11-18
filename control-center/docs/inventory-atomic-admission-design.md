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

## Conservation invariant (no double debits or double credits)
The existing historical accounting already treats DELIVERED and active SHIPPED
parcels as stock consumed. An order reservation must only be counted toward
Remaining while its demand is **not yet** included in those ledgers, otherwise
one order removes stock twice. Similarly, changing a RETURNED reservation
to RELEASED and also inserting a positive RESTOCK event for the same physical
returned millilitres would credit inventory twice. Choose and prove exactly
one accounting mechanism per lifecycle stage, using immutable movement IDs
and a reconciliation invariant for every order/product pair.

Historical order records without new reservations must continue to be counted
through the legacy delivered and in-transit paths, while newly admitted orders
must have a single authoritative movement source. Preview and Production order
namespaces must not consume each other's inventory.

## Proof-level distinctions
- A deterministic in-memory transaction adapter verifies control flow but is
  **not** a PostgreSQL concurrency proof.
- A pair of read-only PostgreSQL advisory-lock calls through a serializing
  connector verifies lock syntax, **not** overlapping sessions or contention.
- Real acceptance requires two concurrent DB sessions calling the actual
  guarded admission procedure, observed serializability, rollback, lock
  ordering, idempotency and preservation of production order IDs.

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

## 2026-11-18 — First isolated, real PostgreSQL admission proof

A temporary SQL harness at
`control-center/supabase/checkout_atomic_temp_proof_ROLLBACK.sql`
was executed against the Supabase PostgreSQL engine and returned
`PASS, remaining_test_ml=10.00, test_orders=1, test_reservations=1`.
It used only `pg_temp` tables/functions, exclusively synthetic Naxos
stock and synthetic fingerprints, and ended with `ROLLBACK`.
No PlayNice customer data, production inventory/order rows, sequences, or
permanent schema objects were mutated.

The procedure verified in one PostgreSQL session:
- 40 ml test stock, first 30 ml acceptance, second different 30 ml rejection;
- fingerprint retry returned DUPLICATE with no extra reservation;
- deliberate reservation failure caused subtransaction rollback of
  attempted stock and order writes.

**Not yet verified:** concurrent, overlapping PostgreSQL sessions;
integrated admission in `create_or_get_checkout_order`; canonical aliases,
gift/bundle accounting and lifecycle transitions; production ready toggles.
An earlier pair of read-only advisory-lock calls did not prove session
overlap due connector scheduling.

The separate `checkout_inventory_reservations_v1_DRAFT.sql` now
grants only SELECT (not direct INSERT/UPDATE) to service_role in the draft.
Real mutations must be mediated by a reviewed, locked RPC. Neither SQL
file was installed as permanent schema.
