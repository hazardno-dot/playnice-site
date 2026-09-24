const ROUTES = {
  "attach-product-media-to-apply": () => import("../server/attach-product-media-to-apply.js"),
  "commerce-shipping": () => import("../server/commerce-shipping.js"),
  "create-announcement-apply-v2": () => import("../server/create-announcement-apply-v2.js"),
  "create-apply-router": () => import("../server/create-apply-router.js"),
  "create-apply": () => import("../server/create-apply.js"),
  "create-hero-apply": () => import("../server/create-hero-apply.js"),
  "create-hero-media-apply": () => import("../server/create-hero-media-apply.js"),
  "create-hero-retirement-apply": () => import("../server/create-hero-retirement-apply.js"),
  "create-journal-apply": () => import("../server/create-journal-apply.js"),
  "create-journal-media-apply": () => import("../server/create-journal-media-apply.js"),
  "create-new-product": () => import("../server/create-new-product.js"),
  "create-note-apply": () => import("../server/create-note-apply.js"),
  "create-note-media-apply": () => import("../server/create-note-media-apply.js"),
  "create-product-media-apply": () => import("../server/create-product-media-apply.js"),
  "finalize-announcement-apply": () => import("../server/finalize-announcement-apply.js"),
  "finalize-hero-apply": () => import("../server/finalize-hero-apply.js"),
  "hero-media-preview": () => import("../server/hero-media-preview.js"),
  "meta-connection-status": () => import("../server/meta-connection-status.js"),
  "prepare-announcement-change": () => import("../server/prepare-announcement-change.js"),
  "refresh-product-apply": () => import("../server/refresh-product-apply.js"),
  "replace-product-media": () => import("../server/replace-product-media.js"),
  "resolve-announcement-preview": () => import("../server/resolve-announcement-preview.js"),
  "site-health": () => import("../server/site-health.js"),
  "social-draft": () => import("../server/social-draft.js"),
  "social-event": () => import("../server/social-event.js"),
  "social-inbox-reply": () => import("../server/social-inbox-reply.js"),
  "social-inbox-sync": () => import("../server/social-inbox-sync.js"),
  "social-inbox-webhook-manage": () => import("../server/social-inbox-webhook-manage.js"),
  "social-inbox-webhook": () => import("../server/social-inbox-webhook.js"),
  "social-instagram-feed-test-publish": () => import("../server/social-instagram-feed-test-publish.js"),
  "social-media-event": () => import("../server/social-media-event.js"),
  "social-publish-dry-run": () => import("../server/social-publish-dry-run.js"),
  "social-publish-env-diagnostics": () => import("../server/social-publish-env-diagnostics.js"),
  "social-publish": () => import("../server/social-publish.js"),
  "social-reconcile-published": () => import("../server/social-reconcile-published.js"),
  "social-shadow-replay": () => import("../server/social-shadow-replay.js"),
  "social-source-catalog": () => import("../server/social-source-catalog.js"),
  "sync-journal-publish-status": () => import("../server/sync-journal-publish-status.js"),
  "sync-publish-status": () => import("../server/sync-publish-status.js"),
  "verify-product-preview": () => import("../server/verify-product-preview.js"),
};

export default async function handler(req, res) {
  const raw = String(req.query?.route || "").replace(/^\/+|\/+$/g, "");
  const route = raw.split("/")[0];
  const load = ROUTES[route];
  if (!load) return res.status(404).json({ error: "Unknown Control Center API route." });
  try {
    const mod = await load();
    return mod.default(req, res);
  } catch (error) {
    console.error("[cc-api-router]", route, error);
    return res.status(500).json({ error: "Control Center API route failed." });
  }
}
