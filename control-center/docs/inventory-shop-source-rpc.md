# Shop Remaining — service-role source draft

The only shopper-visible result remains the existing locked button and friendly
message. The Shop browser must never access inventory events or raw balances.

The Control Center `Remaining` is NOT stored in one Supabase column. It is
computed in Node from `get_control_center_inventory_stock`,
`get_control_center_order_analytics` and `get_control_center_orders`.
Those are admin-only and currently the orders RPC is capped at 250 orders.

Direct REST SELECT cannot simply be used for Shop:
`fragrance_inventory_events` and `checkout_orders` have RLS enabled and
no SELECT grants for authenticated users or service_role. DO NOT relax RLS.

The draft service-role-only `get_shop_inventory_source_v1` supplies only
the inventory ledger, order status/time and item/gift fields to a trusted
SERVER; no customer names, emails, addresses, phones or payment records.
It returns `complete:false` instead of truncating the input. The server
must recompute via the exact existing CC `buildInventoryAnalytics` and the
staged `inventory-shop-source.mjs` adapter, and must compare parity against
CC before returning a blocking decision. SQL returns no public endpoint:
only the server with the private secret may call it.

**Not applied, not enabled.** Additional work:
- install only after explicit review/approval;
- implement Shop server-side source consumption and byte-for-byte shared
  accounting logic with a code parity test;
- audit all 115 products against existing CC Remaining (including gifts,
  bundled sales, returns, full bottles, and aliases);
- enable only matching products; unknowns always fail-open;
- preserve old conservative RPC as fallback until that audit passes.
No checkout changes.

## 2026-11-16: inactive Shop backend bridge

The Shop server has a private read-only path to Supabase RPC
`get_shop_inventory_source_v1` and uses exact byte-for-byte copies of the
CC `inventory-accounting.mjs`, `inventory-shop-source.mjs`, and
`inventory-remaining-bridge.mjs`. Contract tests fail if copies diverge.
This is necessary because the two Vercel projects have separate project roots.

**No new stock gating is active:** `SHOP_INVENTORY_SOURCE_V2_ENABLED` is
unset/false, and `SHOP_INVENTORY_PARITY_APPROVED_NAMES` defaults empty.
The existing conservative Shop RPC remains in use on Preview. Even if
V2 is deliberately enabled, only semicolon-separated exact product names
in the approved list can return a blocking decision; any other request
returns UNKNOWN (allow shopping).

The proposed source RPC is still a draft, NOT installed. Next steps: review
and explicitly approve SQL installation, run read-only exact CC parity
audit across all 115 products including bundles/gifts/aliases, then
activate Preview for approved products. Checkout untouched.

## 2026-11-17: source freshness guard (still inactive)

The uninstalled SQL draft includes `snapshot_at` from the database statement timestamp.
The private Shop server rejects absent/invalid, older-than-30-second, or more-than-5-second-future timestamps as `UNKNOWN`. This is a freshness safeguard, **not** proof of accurate stock balances or per-product CC parity.

The source RPC has not been installed, the V2 feature switch has not been enabled,
and no products have been added to the parity approval allowlist in this change.
The 115-product exact Remaining audit and independently verified physical stock
criteria remain mandatory before widening Preview blocking. No checkout changes.

## 2026-11-17: separate Preview verification gate (inactive)

Numerical parity does not independently certify physical Remaining. The private
V2 decision now also requires explicit, per-product operational verification:
`SHOP_INVENTORY_VERIFIED_REMAINING_NAMES` is a semicolon-separated Preview-only
allowlist, separate from `SHOP_INVENTORY_PARITY_APPROVED_NAMES`.
Both lists must contain the exact requested product name, and V2 must be
enabled, before the server permits a blocking decision.
Empty/unset verification list always returns `UNKNOWN` (fail-open).
The pure Remaining decision requires `verifiedRemaining: true`; the public
request cannot provide this field, which is set solely in the private API.
No variable was set during this change. Do not interpret the merchant's
historical baseline acknowledgment as automatic approval to enable V2.
Existing conservative Shop RPC continues unaffected when V2 is disabled.
