# Inventory V2 — Production activation checkpoint (2026-11-21)

Inventory V2 is enabled for all individually verified PlayNice fragrance stock entries through explicit Vercel Production flags.

- Inventory source: sanitized read-only `get_shop_inventory_source_v1` RPC.
- Coverage at rollout: 120 distinct fragrance names with ledger baselines.
- Physical stock (Remaining ml): confirmed by shop operator for all fragrances.
- Per-order policy: 30 ml per fragrance unless admin override; verified stock may be more restrictive.
- Customer UI displays generic quantity notices, never private remaining balances.
- The checkout server validates the existing inventory source before saving.
- Safety rollback: disable `SHOP_INVENTORY_PRODUCTION_ROLLOUT_ENABLED` and redeploy.
- This is a non-atomic preflight; concurrent accepted orders are not transactionally reserved. No Production stock/order mutation was required for rollout setup.

SQL reservation prototypes remain dormant and are not to be applied to Production.
