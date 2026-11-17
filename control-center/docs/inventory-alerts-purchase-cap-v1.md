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
