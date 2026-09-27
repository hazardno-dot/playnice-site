# PlayNice Apps Script order_state_sync v4

Required before Gift / Sample Editor v1 is merged.

Starting point: PlayNice-Apps-Script-write-through-v3-delivery-failed.gs.

## 1. Legacy status options

Add `RETURNED` to `ORDER_STATUS_OPTIONS`.

## 2. Canonical fulfillment options

Replace the `allowedFulfillment` list inside `handleOrderStateSync` with:

```js
const allowedFulfillment = [
  "NEW",
  "PACKED",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "DELIVERY_FAILED",
  "RETURNED",
  "CANCELLED"
];
```

## 3. Read gift mirror fields

After `deliveryIssue`, add:

```js
const freeGift = String(data && data.freeGift || "").trim();
const giftSyncVersion = Number(data && data.giftSyncVersion || 0);
```

## 4. Mirror the freeGift column only for structured gift sync

After writing `DELIVERY_ISSUE`, add:

```js
if (giftSyncVersion > 0) {
  sheet.getRange(rowNumber, ORDER_COL.FREE_GIFT).setValue(freeGift);
}
```

## 5. Acknowledge the gift contract

Add this property to the successful `responsePayload`:

```js
giftSyncVersion: giftSyncVersion > 0 ? giftSyncVersion : 0
```

The Control Center server requires the same giftSyncVersion acknowledgement before marking a gift/sample mirror as synced. This prevents silent Supabase/Sheets divergence.
