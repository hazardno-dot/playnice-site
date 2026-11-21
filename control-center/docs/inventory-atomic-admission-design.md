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

## 2026-11-18 — PostgreSQL fixture actually executed (rollback-only)

`control-center/supabase/checkout_atomic_admission_fixture_ROLLBACK.sql`
was executed in one PostgreSQL session inside an explicit transaction, using
temporary tables and a temporary-schema function. The test exited without
errors after asserting:
- 40 ml synthetic stock admits 30 ml under one fingerprint;
- a *different* fingerprint requesting another 30 ml is rejected;
- identical fingerprint retry returns DUPLICATE without double reservation;
- 31 ml is rejected by the configured 30 ml per-order cap;
- a deliberately injected failure after synthetic order INSERT rolls back the
  order together with the attempted reservation;
- a final conservation assertion sees exactly one 30 ml reservation.

The script ends with `ROLLBACK`. A separate read-only post-check confirmed
there is no persistent `public.fixture_inventory_stock`,
`public.fixture_checkout_orders`, `public.fixture_stock_reservations`,
`public.try_admit_inventory_fixture`, or active
`public.checkout_inventory_reservations_v1` table. No actual PlayNice orders
or inventory events were inserted or updated. CI #1160 passed on the fixture
contract, and both Preview deployments succeeded on SHA
`aef9728fa3ec1afec30f94cc59a419e304762479`.

**Scope limitation:** these SQL assertions run in a single session. They
validate real PostgreSQL syntax, transaction-savepoint rollback and sequential
admission decisions. They do **not** demonstrate two simultaneously active
sessions contending on the same advisory lock. The current Supabase project
has no development branch; creating one may incur additional compute charges
and requires explicit user approval. Do not install the draft reservation
table or replace the existing production checkout RPC on this evidence alone.

## Next real concurrency acceptance script (development database only)

With TWO independent DB connections to an isolated development PostgreSQL
database, seed one synthetic 40 ml fragrance, then:
1. Connection A: BEGIN; acquire the shared sorted product advisory lock;
   read 40 ml; insert the synthetic 30 ml order and reservation; hold
   the transaction open before COMMIT.
2. Connection B: concurrently BEGIN; request the same product using a
   different 64-character fingerprint; demonstrate actual lock waiting
   on A using `pg_stat_activity` / `pg_locks` while A is open.
3. COMMIT A. B must resume, see 10 ml and refuse its 30 ml request
   without allocating an order number or reservation. Assert one admission
   and exactly 30 ml committed across both sessions.
4. Repeat with same fingerprint across both sessions; only one order and
   one reservation may exist. Repeat with A ROLLBACK before B resumes;
   B must then be able to accept 30 ml. Include reverse-order multi-product
   requests to prove no deadlock.
5. Verify lifecycle and exact-once accounting separately before deploying
   any real order-store integration.

Never use public Production order or inventory tables for this fixture.

## Two-session concurrency harness prepared (NOT yet executed)

For a **local, isolated PostgreSQL** instance, create a separate database
`playnice_atomic_test`; never reuse the PlayNice Supabase project or import
real customer data. Install PostgreSQL client `psql` and use:

```bash
export PLAYNICE_ATOMIC_TEST_DSN='postgresql://local_test_user:password@localhost:5432/playnice_atomic_test'
export PLAYNICE_ATOMIC_TEST_ACK=ISOLATED_LOCAL_DATABASE
python3 control-center/tests/checkout-atomic-concurrency-DEV-ONLY.py
```

The Python runner explicitly refuses non-local database hosts or names other
than `playnice_atomic_test`. It installs
`control-center/supabase/checkout_atomic_concurrency_DEV_ONLY.sql`, containing
only `pn_inventory_concurrency_fixture` synthetic objects, then starts
two independently connected `psql` clients. The first holds a PostgreSQL
transaction advisory lock while sleeping; the second must be observed waiting
with `pg_stat_activity.wait_event='advisory'`. After the first commits,
the second must see only 10 ml remaining and reject its separate 30 ml order.
It also tests fingerprint retry, a 30 ml purchase cap and rollback after a
simulated reservation insert failure, then drops the fixture schema in
`finally`.

**Safety gate:** GitHub contract checks only prove that the scripts and guards
are present. Until that command actually succeeds on an isolated PostgreSQL
database with two distinct live connections, concurrency remains UNVERIFIED.
The harness is intentionally separate from `/api/checkout`, does not install
permanent PlayNice schema or invoke the Production checkout RPC. The local
test proves the *fixture* lock protocol, not full merchant checkout
integration; an end-to-end isolated test remains necessary.
