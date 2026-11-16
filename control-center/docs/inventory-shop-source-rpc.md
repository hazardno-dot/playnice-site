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
