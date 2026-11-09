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
