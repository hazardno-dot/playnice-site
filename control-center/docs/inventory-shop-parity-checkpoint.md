# Inventory Shop parity — staged audit, not an active stock gate

Date: 2026-11-16. PR #536 remains Draft. No checkout modifications.

## Evidence from read-only production audit
- 115 inventory products, all classified historical/estimated by the existing inventory RPC. The merchant has confirmed the calculated Remaining shown in CC is correct.
- 117 BASELINE_SET events, 14 MANUAL_OUT events (negative quantities across 12 products), 4 OPENING, 4 RESTOCK.
- 45 delivered production orders; 18 have structured giftSamples; 40 have freeGift containing a size; one bundle item was observed in order_items. Some gift representations are alternative formats; do not subtract twice.
- The existing Shop SQL service-role RPC is intentionally conservative and does not cover the historical order products. Do not reinterpret UNKNOWN as out-of-stock.
- Manual-out events must be flipped to positive removal when calculating CC Remaining. Raw negative SUM must not be blindly subtracted.

## Shared accounting and hard acceptance gate
Control Center has a single pure implementation in `lib/inventory-accounting.mjs` (moved unchanged from `server/orders.js`).
Before expanding Shop coverage, a server-side, read-only ingestion must generate an independently recomputed Shop balance using the same accounting semantics. It must never expose order PII or full stock rows to shoppers. Compare exact centi-ml for every product to the CC calculation, and additionally verify:
1. Complete order history across the applicable status set; no 250-row truncation that would affect stock totals.
2. Delivered historical sales + gifts + bundles + resale bottles align with CC commerce totals, including canonical aliases.
3. OPENING/BASELINE_SET selects the same canonical event as CC, RESTOCK and negative MANUAL_OUT signs match.
4. No duplicate product-name mapping or unknown event types; a missing product or mismatch is UNKNOWN.
5. Data source is fresh and both estimates are made independently on server, not with client-provided figures.
6. The existing code's NEW orders are admin advisory only; not subtracted from Remaining or treated as atomic reservations.
7. A zero physical balance is not enough to block unless independently verified and fresh.
8. For any mismatch, timeout, missing data, or partial snapshot, fail open, preserve normal cart and checkout.

The new pure `inventory-shop-parity.mjs` gate is a *contract*, not connected to the active shop RPC. No schema migrations or Vercel variable changes in this step. When connected, expose only `ALLOW` / `LIMIT_REACHED` / `UNKNOWN` from the server, never Remaining.

## 2026-11-16 — Single Remaining decision contract
The checkout remains independent and functional when inventory is unavailable.
An exact pure adapter now consumes the existing `buildInventoryAnalytics(...).rows` values
and produces only `ALLOW`, `LIMIT_REACHED`, or `UNKNOWN`. It does NOT recompute stock,
does not send ml quantities to the browser, and does not call the DB by itself.

Next, a service-role-only **server-side source** must assemble those exact rows from complete
Supabase inputs. It must reject partial order pagination (current CC RPC caps at 250 orders),
unknown status history, ambiguous aliases and missing gifts. Do not wire it into Shop until
a parity audit confirms the server's `Remaining` equals the CC display for every product.
The existing live Shop RPC still serves conservative decisions. No new Production write,
schema deployment or checkout change is authorized by this adapter.

## 2026-11-17 — Direct read-only Supabase inventory audit

Queried live production metadata via read-only SELECT, with no writes or RPC installation:
- 115 distinct inventory names, 139 inventory events.
- Events: 117 BASELINE_SET, 14 MANUAL_OUT, 4 OPENING, 4 RESTOCK;
  no unexpected event types and no positive MANUAL_OUT quantities.
- 54 production orders, 45 DELIVERED, 119 order_items in production,
  47 orders in consumption-relevant status set.
- 18 DELIVERED orders with structured giftSamples; 41 DELIVERED orders
  with a nonempty freeGift; 18 have both formats.
- 40 delivered freeGift texts use the legacy dash + 2 ml pattern.
  The remaining freeGift text is only "olovka" (stationery, no fragrance ml).
- 1 order_item has structured bundleItems.
- get_shop_inventory_source_v1 does NOT exist in the database.
- Current production order count is below CC's 250-row order limit;
  this is only today's observation, not future completeness proof.

The adapter contract now explicitly tests the dual-format 2 ml gift (never
double count) and stationery-only gift (zero perfume depletion).
No actual 115-row cross-system numerical parity report has been produced yet:
do not mark any new product as verified or add it to the Preview allowlist.
A successful source-schema/count audit does not establish per-product Remaining parity.
The account's existing operational Remaining values remain untouched.

## 2026-11-17 — Numeric ledger parity stage and legacy bundle correction

Live read-only SQL independently reconstructed opening/baseline, restock,
manual-out and tracking start against the exact existing
get_control_center_inventory_stock selection logic:
**115 of 115 products matched, 0 ledger-field differences.**
This is inventory-ledger-only parity, NOT a full Remaining parity pass.

The completed-order audit found one historical DELIVERED item with product
name containing four fragrances, size_label "5ml × 4", and null size_ml.
The previously staged Shop source adapter rejected it as INVALID_SALE_ITEM,
causing snapshot-wide fail-open. The inactive adapter now accepts this
specific recognized multi-name bundle label and delegates expansion to
the existing shared inventorySaleItems parser (four x 5 ml).
The Shop and Control Center copies remain byte-identical; a contract test
covers the historical shape. No production order was edited.

Additional audit observations:
- Three DELIVERED order items have size_ml >= 50 (full bottles).
- The one structured bundleItems production row is in RETURNED status,
  not DELIVERED; this should not be reclassified as delivered consumption.
- Full Remaining parity is still unverified, particularly historical
  commerce canonical-name aliases and order-stage semantics.
- Do not enable V2 nor approve any product names from this partial check.

## 2026-11-17 — Historical consumption cross-check

Read-only production data examined: 139 inventory ledger events, 54 production
orders, 119 order items, 115 distinct inventory fragrances. The installed
get_control_center_order_analytics SQL's top_products and full_bottles
projections were compared against the staged Shop historical commerce adapter
on the same production snapshot, without executing any write or installing
get_shop_inventory_source_v1.

- 64 historical commerce product names compared.
- 3 full-bottle product lines included in the comparison.
- The inactive adapter recognized the current delivered sales and gift formats;
  zero invalid delivered items in this audit.
- The sole difference was 5 ml attributed to historical bundle name
  "Al Haramain Signature Blue" instead of the tracked
  "Haramain Signature Blue Eau de Parfum".
- Added this missing alias to both byte-identical CC/Shop accounting copies,
  and added a focused legacy-bundle contract assertion.
- Prior independent ledger field parity: 115/115 with 0 differences.
- After mapping the single 5 ml discrepancy to the canonical inventory
  fragrance, the historical consumption comparison has no remaining
  known per-product numerical variance; CI and deployed runtime must still
  confirm the updated commit before treating the parity gate as complete.

This is a calculation parity result, not a physical count or concurrency-safe
inventory reservation guarantee. All 115 baselines remain classified as
historical/estimated in the current CC model, even though merchant confirms
the displayed Remaining values. No Preview allowlist was populated and
V2 was not activated. Do not merge until checks and further Preview QA pass.

## 2026-11-18 — Service-only read-only source installed, enforcement remains OFF

Applied the `shop_inventory_source_v1_readonly_service_role` Supabase migration.
It contains no inventory/order DML, creates only the source RPC, and has a
transactional CREATE/REVOKE/GRANT. The RPC is executable by `service_role`,
not `anon` or `authenticated`. Its completeness cap is 250 production orders,
matching the current CC history window; above that it returns incomplete
rather than guessing Remaining.

A read-only transaction using a service-role JWT claim confirmed a successful
fresh source snapshot: `complete=true`, 141 inventory events,
54 production orders and 119 order items on 2026-11-18. Source data stayed
inside the private database verification; no raw balances or customer data were
returned to a public endpoint.

**This verifies the source feed, not full Shop enforcement.** The
`SHOP_INVENTORY_SOURCE_V2_ENABLED` source switch and per-fragrance
`SHOP_INVENTORY_PARITY_APPROVED_NAMES` +
`SHOP_INVENTORY_VERIFIED_REMAINING_NAMES` gates remain unset/unapproved.
No stock blocking is activated for Naxos, Dolce & Gabbana, or the remaining
catalog. Runtime Preview testing still required. Production Shop/checkout
and existing inventory rows were not changed.

## 2026-11-18 — Full live 115-fragrance parity audit (47 delivered / 1 shipped)

Read-only snapshots and the installed CC SQL function bodies were used to
independently compare the live Shop source adapter's inputs with the existing
Control Center calculations, without altering Production inventory/orders.

- Service-only source: `complete=true`, **141 inventory events**, **54 Production
  orders**, **119 items**, **115 distinct inventory names**.
- Installed CC ledger logic: **115/115 exact matches** in baseline/opening,
  restock, manual-out, and stock-in, including repeat BASELINE_SET histories.
- Installed CC delivered-commerce SQL: **65/65 product names** and three
  full-bottle totals match the staged Shop adapter, including legacy multi-name
  bundles, canonical aliases and gifts. **Zero ml differences** for the
  current CC definition of Remaining across all 115 rows.
- Two unmatched historical commerce names are legacy gifts only:
  `El Dorado French Avenue` and
  `Maison Alhambra Jean Lowe Immortel Eau De Parfum`. Neither is a
  currently tracked inventory name; do not guess a catalog mapping.
- All 115 CC stock rows are marked estimated/historical-baseline. Numerical
  parity is **not** a physical stock verification.

**Important semantic issue detected:** one Production order is now SHIPPED,
but the installed CC historical commerce RPC counts only DELIVERED. Its
source_payload records Rayhaan Nocturno Elixir 20 ml plus a structured
2 ml Lattafa Qaed Al Fursan Untamed gift; the legacy freeGift is an
alternative representation of the same gift. These two tracked fragrances
were therefore overstated by 20 ml and 2 ml respectively while the parcel
was SHIPPED, despite 115/115 mathematical parity with the current CC view.

Staged correction in the shared byte-identical CC/Shop inventory accounting:
for historical-baseline rows, add active PACKED / SHIPPED /
OUT_FOR_DELIVERY items and gifts to the delivered-only historical totals,
without double-counting those shipments once they become DELIVERED.
Exclude NEW (advisory only), RETURNED and CANCELLED. Tests explicitly
assert shipped item+gift debit and exactly-once DELIVERED transition.
GitHub Control Center Regression #1140 passed on this fix.

**Do not expand the V2 verification allowlist to 115 automatically.** The
installed SQL source requires further Preview QA of the revised CC display,
physical/operational verification policy, and checkout concurrency before
catalog-wide enforcement. The existing Preview V2 pilot remains scoped to
Naxos and Dolce & Gabbana; production Shop is unchanged.
