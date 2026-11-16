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
