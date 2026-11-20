# PlayNice Inventory V2 — Production rollout checklist

STATUS: Draft PR #536 only. Production enforcement is OFF. Checkout database writes and order IDs are unchanged.

## Safe deployment
1. Merge only after separately approved. Deploy the current Shop and Control Center; no Production enforcement flags are currently set.
2. Smoke-check live pages and read-only disabled API responses; do not submit a Production order.
3. Obtain independent physical stock confirmation for each Production fragrance, not merely numeric CC/source parity.
4. Add individual Production allowlists and server-only secret, then activate the purchase cap, and separately the stock check. Retain a kill switch.
5. Watch checkout errors and UNKNOWN fallback. Roll back via master switch and redeploy if necessary.

## Explicit Production switches (absent = OFF)
- SHOP_INVENTORY_PRODUCTION_ROLLOUT_ENABLED: master switch; must equal true for either Production feature.
- SHOP_PURCHASE_CAP_POLICY_PRODUCTION_ENABLED: purchase caps and precheckout guard; requires master switch.
- SHOP_INVENTORY_PRODUCTION_CHECK_ENABLED: stock guard; requires master switch.
- SHOP_INVENTORY_PRODUCTION_PARITY_APPROVED_NAMES: semicolon-separated Production-only names.
- SHOP_INVENTORY_PRODUCTION_VERIFIED_REMAINING_NAMES: separately verified Production-only names.
- SHOP_INVENTORY_READ_SECRET: server-side credential only; no browser exposure.
- REACT_APP_SHOP_INVENTORY_PRODUCTION_UI_ENABLED: explicit build-time UI switch for playniceshop.me and www.playniceshop.me.

No Production names are inherited from Preview. Only names present in both Production lists can trigger a verified stock block. Unknown/stale inventory source fails open. The 30 ml policy is independently sourced.

## Preview and safety
The original audit Preview branch retains its existing settings. Other Preview branches do not automatically inherit them. The Preview checkout and PNTEST cleanup (PNTEST-2611-0007) succeeded. All SQL reservation scripts in this PR remain drafts or test fixtures; none is a Production migration or active RPC. Checkout preflight is non-atomic: it does not guarantee that overlapping distinct orders cannot both consume the same available balance. The user has accepted this low-volume concurrency risk and declined an additional development database.

## Rollback
Disable SHOP_INVENTORY_PRODUCTION_ROLLOUT_ENABLED and redeploy Shop Production. For UI rollback, unset REACT_APP_SHOP_INVENTORY_PRODUCTION_UI_ENABLED and redeploy. Never try to reverse or delete actual Production orders as part of a software rollback.
