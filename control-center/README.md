# PlayNice Control Center

Internal PlayNice back-office application.

## Foundation build

Current scope is intentionally read-only:

- Control Center navigation shell
- Products module
- Live import from the existing PlayNice product catalog
- Search across the catalog
- Product detail inspection
- Commerce, classification, Note Map and recommendation preview

The customer-facing PlayNice application is not modified by this app.

## Run locally

```bash
cd control-center
npm install
npm run dev
```

## Deployment model

The intended deployment is a separate Vercel project using `control-center` as its Root Directory, eventually served from `admin.playniceshop.me`.

## Safety rule

No edit or publish action is enabled in the foundation build. Database migration and write access will be introduced only after catalog parity validation.
