# Inventory alerts and per-order purchase limits — staged v1

Approved requirements:
- CC-only low stock alert when Remaining <= 20 ml; critical <= 10 ml.
- Alerts are read-only projections of the existing CC Remaining; replenishment clears them automatically.
- 30 ml maximum for a single fragrance within one order, across mixed decant sizes.
- Admin-adjustable per-fragrance maximum (e.g. 20 ml for difficult-to-source niche fragrances).
- This is *not* a per-person or cross-order customer limit.
- Stock checking preserves fail-open; a separate, valid per-order purchase cap may apply when inventory is UNKNOWN.
- No values or low-stock details are disclosed to customers.

Staging: `inventory-purchase-policy.mjs` is a pure contract with a default cap and
per-fragrance override input. It is NOT wired to checkout or live Shop UI.
A shared, authenticated persistent CC settings store and a narrow, trusted
Shop policy read path must be implemented and tested before activation.
Never accept a shopper-supplied override as policy or rely on localStorage
to coordinate CC with Shop. Protect atomic order admission separately.

## 2026-11-17 — Supabase policy settings installation

The approved `inventory_purchase_caps_v1_admin_policy` migration was applied
successfully to the existing Control Center Supabase project. This is a
Production **configuration-schema change**, not a checkout or inventory
mutation. Direct post-migration read-only checks confirmed:
- 0 rows in `inventory_purchase_cap_overrides_v1` (all fragrances default to 30 ml).
- RLS enabled; neither `anon` nor `authenticated` has direct table SELECT.
- Authenticated role has EXECUTE on two admin-gated CC RPC functions.
- Only `service_role` has EXECUTE on the Shop policy RPC; `anon` and
  `authenticated` do not.
- The inventory event count remains 139 at verification time.

Preview policy endpoint still requires
`SHOP_PURCHASE_CAP_POLICY_PREVIEW_ENABLED=true` and a valid private
`SHOP_INVENTORY_READ_SECRET`. No Production Shop enforcement was enabled.
The UI editor can now query the CC RPC as an authenticated administrator
after the Preview deployment is READY. Per-fragrance write/read and reset
smoke tests were not performed against live data to avoid test overrides
in Production. Validate them in a controlled Preview session and remove
any temporary overrides when testing.
