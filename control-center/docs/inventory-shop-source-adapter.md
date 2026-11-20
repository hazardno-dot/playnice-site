# Read-only Supabase source adapter for Shop / CC Remaining

This is an **unactivated** adapter in `lib/inventory-shop-source.mjs`.
It prepares rows from underlying inventory events, completed order-items,
and completed order gift metadata for the existing unchanged
`buildInventoryAnalytics` formula. It does not call Supabase or change
checkout, inventory tables or the live Shop RPC.

Source ingestion must be server-side using service-role credentials and
complete pagination. Never send orders, gifts, ledger events, or Remaining
to the customer. No limits are authorized until an exact per-fragrance
parity audit matches the real Control Center inventory reading.
Unknown events, incomplete pagination, missing/malformed items, ambiguous
gifts and ledger sign anomalies return an incomplete snapshot (UNKNOWN).
The historical CC analytics RPC uses `freeGift` legacy 2 ml gifts, while
modern orders may also have structured `giftSamples`; avoid double
counting. The present adapter intentionally refuses unexpected gift sizes.
For privacy do not log raw `source_payload` data.

Naxos 100 ml scenario is already tested using the old conservative RPC.
Do not replace that working Preview check before live parity evidence.
