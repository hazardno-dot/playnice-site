# Inventory Protection — atomic reservation transaction design v1

**STATUS: DESIGN ONLY / DO NOT APPLY TO PRODUCTION.** This document is not a migration. The pure `inventory-reservation-simulator.mjs` models expected outcomes but **does not prove actual concurrent database isolation**.

## Read-only verified findings
- Existing checkout RPC `create_or_get_checkout_order` locks by environment + fingerprint. It prevents duplicate requests with the *same* fingerprint, but two different customers with different fingerprints do **not** contend on a fragrance lock.
- Live Supabase has `checkout_orders`, `order_status_events`, and `fragrance_inventory_events`. It has no currently deployed per-product reservation ledger.
- Original bottle `BASELINE_SET` is an inventory estimate, not verified current available ml. Current CC stock models may contain historical consumption, manual removals, and estimated baselines.
- Order status transitions can move PACKED back to NEW while clearing `packed_at`. Historical PACKED records exist in `order_status_events`; a persistent ever-packed fact is needed.
- An accepted order can contain multiple sizes of the same fragrance and multiple fragrances; bundles, gifts, manual orders and direct bottle sales need normalized rules.

## Proposed database model — **not created**
- `inventory_products`: immutable canonical `product_key` and catalog mapping, `current_balance_verified`, latest physical reconciliation checkpoint, version and review state. Keep verified balance separate from bottle capacity.
- `inventory_balances`: one row per **environment and product_key**, numeric nonnegative physical ml and reserved ml, version and update timestamp. Neither value exposed publicly. Preview ledger must be isolated and synthetic; never use Production stock to reserve PNTEST.
- `inventory_reservations`: unique `order_record_id + product_key`, ml, status RESERVED/CONSUMED/RELEASED/RECONCILIATION_REQUIRED, immutable order association, timestamps, and event/outbox audit. A unique idempotency key must be scoped to environment.
- `inventory_reconciliation_events`: explicit readjustment with admin identity, reason, stock snapshot, positive or negative delta and audit trail. Never silently restore already prepared ml on returned/cancelled orders.

## Transaction: checkout creation + reservation in **one** Postgres transaction
1. Validate the request server-side and normalize every product into stable catalog key; sum all sizes per product in integer **centi-milliliters** (or exact NUMERIC). Reject unsupported/ambiguous bundles; never trust browser-supplied availability or raw price.
2. Resolve deduplication under the existing fingerprint lock. A retry returning an existing order must return the **existing reservation**, not reserve stock a second time.
3. Lock affected `inventory_balances` rows with `SELECT ... FOR UPDATE`, **sorted in canonical product_key order** to avoid deadlocks. Because missing rows cannot be locked, require pre-provisioned verified rows before enabling a product; otherwise raise `UNKNOWN_STOCK`, not `OUT_OF_STOCK`.
4. Re-check inventory verification, reconciliation version, `physical_ml - reserved_ml >= requested_ml`, and order state **inside the transaction after acquiring locks**.
5. Insert the order and its per-product reservations, and increase reserved ml, all inside the same ACID transaction. If any validation fails, roll back **all** writes (no partially accepted basket).
6. Return a typed decision: `OK`, `INSUFFICIENT_AVAILABLE` only from verified stock, `UNKNOWN_STOCK` for mapping/data errors, `RETRYABLE_ERROR` for temporary failures. Never confirm a checkout on `UNKNOWN`.
7. Keep existing email, Sheets synchronization and customer notification **after commit**, with idempotent outbox/sync tokens. A retry must not send duplicate customer communications.

### Order lifecycle
- NEW: reservation held; physical balance unchanged.
- PACKED: in same atomic transaction as status transition, convert RESERVED to CONSUMED; reduce both physical and reserved **once**.
- PACKED → NEW: do not restore ml automatically; flag RECONCILIATION_REQUIRED. When audited as physically prepared, it remains consumed.
- CANCELLED before packing: release reservation exactly once.
- CANCELLED after packing or RETURNED/DELIVERY_FAILED: remain consumed until an operator performs a separate, justified reconciliation for usable ml.
- Legacy/manual orders, gifts and bundle items: normalize into the same canonical ledger or keep protection disabled for affected products.
- Editing a held order: compute positive/negative delta under product row locks. Never allocate or release based only on a stale UI snapshot.

## Critical requirements before any database changes
- Inspect full live status transition SQL and gift/bundle/manual order paths.
- Validate canonical catalog mapping for every product; protect against aliases/duplicate names and historical names.
- Complete a real physical reconciliation for a small pilot group; explicitly record whether balance is measured/current or inferred. `baseline_verified` is insufficient.
- Implement separate Preview test fixtures and transaction-backed integration tests with two independent concurrent clients, retry/replay, failure injection and rollback verification.
- Deploy Shadow Mode *first*, instrumented with actual server evaluations and privacy-limited events. Keep both receiver flags disabled until endpoint, telemetry RPC and security have passed tests.
- Introduce a server enforcement flag only after positive sign-off; a client-side toggle cannot bypass server-side consistency.
- Design recovery and admin alerting before turning enforcement on. Product fail-safe policy should treat verified 0 ml differently from missing/unverified data, and never claim out-of-stock on an infrastructure failure.

## Example acceptance scenarios (specification only)
1. Verified 80 ml. Two independent orders request 40 ml each: both accepted and the third 20 ml attempt rejected for verified insufficiency.
2. Verified 80 ml. Two independent orders each request 60 ml: exactly one accepted, regardless of interleaving.
3. One basket requests 20 ml A and 40 ml B; B has only 30 ml: **neither** reservation nor order is committed.
4. Retry same successful fingerprint: same order returned; ml not reserved again.
5. Packed transition repeated twice: only one physical deduction.
6. Cancelled NEW: reservation released once; packed, returned or rolled-back NEW: no silent stock restoration.
7. Unknown baseline/missing mapping: no stock-out assertion or product lock from speculative data.
8. PNTEST/Preview: entirely separate ledger and sequence. Never touch Production reservations.

Do not interpret pure simulator tests as proof of serializable behavior in the real database.

## Isolated PostgreSQL test harness — added to PR #536
Files:
- `control-center/tests/fixtures/inventory-reservation-lab.sql`: synthetic tables and two *lab-only* stored functions in schema `inventory_protection_lab`, with ordered row locking, unique fingerprint, atomic reserve, PACK and CANCEL.
- `control-center/tests/fixtures/inventory-reservation-lab-scenarios.sql`: functional assertions for idempotency, mixed baskets, transitions, unverified inventory and rollback-only test transactions.
- `control-center/tests/inventory-reservation-postgres-lab-contract.mjs`: source-contract guard to prevent direct access to production tables or broad public grants.

**These SQL files are not migrations and have not been executed.** They must only be installed in a **separate disposable Supabase development branch or isolated local PostgreSQL database**, never on the production project. Development branches may incur costs and must receive approval through the Supabase tooling.

### Actual two-session concurrency acceptance (not yet run)
Run the following using two separate test connections against the isolated lab **after installing fixture**:
1. Reset synthetic `naxos-test` to 8000 centi-ml with 0 reserved and remove all lab orders/lines.
2. Session A: `BEGIN; SELECT inventory_protection_lab.reserve('PNTEST-A','fpa','[{"product_key":"naxos-test","centi_ml":6000}]');` then hold transaction open.
3. Session B simultaneously: `BEGIN; SELECT inventory_protection_lab.reserve('PNTEST-B','fpb','[{"product_key":"naxos-test","centi_ml":6000}]');` should wait for A's row lock and never acknowledge reservation before A commits.
4. Commit A. B must fail `INSUFFICIENT_AVAILABLE` and roll back; verify one order and 6000 reserved. Re-run with A rollback: B may succeed.
5. Repeat with two-product baskets in opposite item orders to confirm canonical lock ordering prevents a deadlock. Run true parallel requests with independent connections, not sequential simulated calls.
6. Confirm old production code paths have not been changed; the lab tables have no relation to real `checkout_orders` or inventory.

The lab deliberately uses synthetic `naxos-test` and `ginger-test` keys. Do not seed it with the Production inventory counts. Real production implementation needs separately reviewed auth/RLS, gift/sample/legacy handling, queue/retry semantics, recovery alerts and explicit inventory verification.

## No-cost Vercel Preview test mode (2026-11-15)
- User chose to **decline paid Supabase branching**. No development branch was created.
- `control-center/lib/inventory-preview-lab.mjs` executes eight deterministic, synthetic, browser-memory-only scenarios; `control-center/src/AnalyticsManager.jsx` exposes an on-demand test button under Inventory.
- This uses **no database connections, writes, real carts or orders**. Results appear only in the current browser session; production stock cannot be affected. The 8 scenarios include competing demand, full capacity, aggregate ml, mixed cart atomicity, fingerprint replay, PACKED/cancellation, NEW cancellation, and unknown/Preview isolation.
- These tests validate the **pure specification model**, not real PostgreSQL locking, ACID atomicity, or independent concurrent connections. Full acceptance remains blocked until isolated database tests can be conducted without touching Production.
- Do not turn on live enforcement based on passing 8/8 tests.

## Preview synthetic safety expansion — 2026-11-15
- `control-center/lib/inventory-preview-safety-lab.mjs` adds eight synthetic fault scenarios: missing stock, unverified zero, verified zero, stale snapshot, unmapped product, over-reservation, simulated source outage/exception, and PACKED-to-NEW reconciliation.
- `Intelligence → Inventory` now has separate styled buttons for the original eight reservation scenarios and eight safety scenarios. All 16 execute locally in the browser with zero database writes.
- The simulated source outage and exception are **pure-function fault injections**, not real network tests. Neither this Preview lab nor the simulator can prove PostgreSQL atomic concurrency or the behavior of real Production services.
- Failures in the future inventory service must never be interpreted as a verified zero, and must not result in false stock-out messaging. Checkout order acknowledgment must remain authoritative.

## Inventory Verification review without re-entering ml (2026-11-15)
- User confirmed the displayed Inventory Watch Total / Out / Remaining have been reconciled to physical bottles. Do not reset or manually re-enter all 115 product balances.
- `control-center/lib/inventory-verification-v1.mjs` inspects current Remaining calculation and returns eligibility for review; `Inventory → Existing Remaining balance` provides a read-only selection view using the inventory row already present.
- The status `READY FOR ADMIN REVIEW` means preliminary arithmetic/identity requirements pass, NOT that a persistent verified flag exists. `BASELINE_SET` (original bottle capacity) remains distinct from a verified current sellable balance.
- `control-center/supabase/inventory_verification_v1.sql` is a **draft only**, not applied. It has admin-only read access and no write RPC by design. No verification records exist until a subsequent reviewed migration and explicit admin action.
- Before implementing persisted verification, the snapshot must include a server-derived, monotonically increasing ledger/order revision (not just the calculated values), with server-side compare-and-set under relevant inventory locks. Equal net balances after two offsetting events must not silently preserve a stale verification. Include all manual adjustments, gifts, status rollbacks and pending orders. Confirm canonical product slug mapping.
- A verification is never itself an enforceable reservation. Existing Remaining is not to be reduced twice for PACKED/DELIVERED; NEW reservations are a separate concern.

## Inventory-first CC layout and preview review (2026-11-15)
- Inventory Watch and stock entry are now first on the Inventory page. Previous Audit/Verification/Pending/Shadow/Synthetic panels are inside a collapsed `Inventory Protection diagnostics` section.
- The Existing Remaining verification card now displays selected fragrance details as separate rows with readable spacing.
- An eligible row has a **Preview-only** `Review current balance` action. It stores the reviewed calculation fingerprint only in React memory for the current browser session, displays explicitly `Not persisted`, and changes to `Review expired` when the displayed calculation no longer matches.
- The Preview-only action does **not** call any API, create a database verification record, grant stock eligibility or authorize checkout enforcement. It is a user-flow prototype, not durable verification.
- Future persisted verification requires an admin-only transactional write RPC, server-side recomputed ledger **revision** and immediate invalidation on orders, manual outs, gifts and restocks; this remains unimplemented, and no SQL migration was applied.

## Durable verification prerequisite: immutable event revision (2026-11-15)
- Added pure model `control-center/lib/inventory-verification-revision.mjs` with `buildInventoryEventRevision` and `isInventoryReviewCurrent`. Reviews depend on *both* the calculated Remaining snapshot and a complete authoritative immutable event revision; unproven event coverage yields `INCOMPLETE` and never verifies stock.
- New contract tests cover restock, manual-out, status changes, same-net-balance offsetting events, duplicates, missing inputs and unknown evidence completeness.
- Read-only Supabase audit: 53 checkout orders in production at the time checked, one NEW order has no `order_status_events` row. A NEW order can legitimately lack a status transition, so missing status-event rows are not themselves a broken order. However **a complete reconstruction of pack/rollback history must not be assumed** from the mere presence of the orders table. Need durable ever-packed evidence and coverage rules for legacy imports.
- Live admin verification remains unimplemented. Existing `Review current balance (Preview only)` checks displayed arithmetic only, NOT event revisions; UI copy explicitly says `NOT VERIFIED`. Do not merge this prototype with live enforcement.
- Before applying the draft `inventory_verification_v1.sql`: design server-side snapshot generation from all inventory events, all relevant order creations/status changes/gifts/returns and documented product aliases, then compare+set with a durable revision inside a database transaction. A name-keyed event list assembled in a browser is insufficient.

## Admin verification preflight / partial server revision (2026-11-15)
- Prepared (NOT applied) admin-only read RPC `control-center/supabase/inventory_verification_revision_v1.sql`. The database computes a global change detector from inventory events, production order rows and status history, including order payload *internally*; only a digest and counts would be returned. All reviews would conservatively become stale when any covered event changes.
- The draft deliberately returns `PARTIAL_REVISION_ONLY`, `mapping_verified=false`, `atomic_with_checkout=false`, `can_authorize_verification=false`, and `can_enforce_stock=false`. It omits external/mapping revisions and has no transaction-level lock shared with order creation/status changes, so **this is not an authoritative verification snapshot**.
- Added `assessInventoryVerificationCommit` pure preflight. Future persisted admin confirmation must require administrator authentication, server-computed balance, canonical mapping, complete order/gift history, resolved order obligations, transaction locks, complete identical before/commit revisions and matching balance. Missing evidence fails closed.
- Contract tests assert that a partial revision, missing locks, missing coverage or changed balance/revision never authorizes persistence. **No confirmation write RPC has been installed, no database schema change made, no verified flag set.**
- Real activation still depends on an exact catalog mapping contract and a single transactional source of truth for both order/inventory mutation and verification. The global change detector is a research aid, not the final authorization mechanism.

## Authenticated server-side Remaining preflight (2026-11-15)
- `GET /api/orders?view=inventory_verification_preflight&product_name=...` now recomputes the selected existing Remaining from the same backend `readOrderAnalytics` used by Inventory Watch. It inherits the existing admin authentication and returns **only one** selected row's read-only review verdict. Ambiguous/unmatched names return `UNKNOWN_MAPPING`.
- In Preview, the button `Check Remaining on server (Preview)` fetches that authoritative *calculation* and compares the returned exact snapshot and Remaining ml against the on-screen selection. Mismatches and network errors report NO verification. No database write occurs.
- This is **NOT** a durable inventory confirmation or verified checkout eligibility: endpoint explicitly returns `event_history_complete=false`, `can_persist_verification=false` and `can_enforce_stock=false`.
- The server and UI comparison may still race with an order placed after its read; a transaction-level revision lock shared with checkout and status changes is required before persisting a Verified record. No Supabase migration applied.

## Transactional review revision draft (2026-11-15)
- `inventory-verification-transaction-lab.mjs` simulates a revision-locked admin confirmation. Each stock-affecting event increments an immutable revision and invalidates the stored review even if the net Remaining returns to the previous number. The model rejects missing admin, mapping, order coverage, obligation clearance or shared lock.
- `inventory_verification_revision_lock_v2.sql` is a **NOT APPLIED** migration proposal: a single internal revision row and statement-level triggers on `fragrance_inventory_events`, `checkout_orders` and `order_status_events`. All trigger bumps participate in the original DB transaction. A future confirm RPC would have to lock the revision row BEFORE recomputing canonical Remaining and writing verification in the same transaction.
- **Caveat:** global row serialization may cause lock contention or deadlocks with existing order/checkout routines; review lock ordering and perform true two-session tests before deploying. Trigger set does not cover external Sheets/catalog edits or prove event mapping completeness. The prototype intentionally omits confirmation RPC and cannot mark any production stock verified.
- Existing Vercel Preview synthetic tests are not real database transaction tests. The Production database has not been changed by this work.
