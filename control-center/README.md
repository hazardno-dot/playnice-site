# PlayNice Control Center

Internal PlayNice back-office application.

## Current architecture

PlayNice Control Center is a production operations application. Supabase is the canonical source for operational state; Google Sheets is retained as a backup / historical mirror for Orders.

Primary modules:

- Overview
- Manage: Products, Hero, Announcement, Journal, Notes, Exhibition
- Operations: Orders and fulfillment
- Social: publisher and Facebook Inbox
- Intelligence: Commerce and Inventory
- System: Site Health and Workflow

## Orders architecture

Orders use Supabase as the canonical source.

The Control Center supports:

- website and manual order intake
- fulfillment lifecycle: NEW → PACKED → SHIPPED → OUT_FOR_DELIVERY → DELIVERED
- delivery-failure / returned handling
- COD settlement batches
- courier payout accounting
- gift / sample history
- inventory consumption
- 100×150 mm shipping-label printing
- Google Sheets backup mirroring with visible sync failures

The generated `tracking_number` field is treated in the Control Center as an internal **Order Reference**. It is read-only in the UI and is also used by the shipping label / barcode workflow. The legacy `save_tracking` Control Center write path is intentionally not exposed.

## Google Sheets compatibility

Sheets is not the canonical order database.

Compatibility fields such as `legacyStatus`, `trackingNumber`, `courierPaid`, `deliveryIssue` and `freeGift` remain in the mirror contract because historical Sheets rows and backup workflows still consume them.

Lifecycle down-mapping is intentional:

- PACKED → legacy NEW
- OUT_FOR_DELIVERY / DELIVERED → legacy SHIPPED

Do not remove these mappings unless the Google Sheets backup contract is retired.

## Write-through safety

Operational writes are enabled only when the server-side Sheets mirror configuration is present. If that backup configuration is unavailable, Supabase remains canonical but Control Center write actions are disabled rather than silently falling back to a second primary system.

## Development

```bash
cd control-center
npm install
npm run dev
```

Build and contract tests:

```bash
npm run build
```

## Deployment

The Control Center is deployed as a separate Vercel project with `control-center` as its Root Directory and is served in production from `control.playniceshop.me`.

## Safety principles

- Supabase operational state is canonical.
- Google Sheets is backup / historical compatibility only.
- Do not make generated Order Reference editable as courier tracking.
- Do not collapse SHIPPED into DELIVERED without a real delivery signal; courier settlement may confirm delivery when live courier status is unavailable.
- Do not bypass lifecycle RPCs or settlement batch integrity.
- Production publishing / merge remains controlled and explicit.
