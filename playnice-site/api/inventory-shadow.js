// Inventory Protection v1 — dormant, nonblocking Preview diagnostic receiver.
// Does not claim authoritative stock decisions, persist events or alter orders.
// Activation of DB writes requires reviewed service-role-only integration.
const MAX_BODY_BYTES = 512;
const SOURCES = new Set(["ADD_TO_CART", "CART_QUANTITY"]);
const PRODUCT_KEY = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  if (req.method !== "POST") return res.status(405).json({ status: "method_not_allowed" });

  // Independent server-side gate, separate from the client build flag.
  // No production event collection, even if an incorrect client bundle enables it.
  if (process.env.VERCEL_ENV !== "preview" ||
      process.env.INVENTORY_SHADOW_RECEIVER_ENABLED !== "true") {
    return res.status(204).end();
  }

  const rawLength = Number(req.headers["content-length"] || 0);
  if (rawLength > MAX_BODY_BYTES) return res.status(413).json({ status: "invalid_request" });
  const body = req.body;
  if (!body || typeof body !== "object" || Array.isArray(body) ||
      Buffer.byteLength(JSON.stringify(body), "utf8") > MAX_BODY_BYTES) {
    return res.status(400).json({ status: "invalid_request" });
  }
  const { source, productKey, demandMl } = body;
  if (!SOURCES.has(source) ||
      typeof productKey !== "string" || productKey.length > 100 ||
      !PRODUCT_KEY.test(productKey) ||
      typeof demandMl !== "number" || !Number.isFinite(demandMl) ||
      demandMl <= 0 || demandMl > 5000 || Math.round(demandMl * 100) !== demandMl * 100) {
    return res.status(400).json({ status: "invalid_request" });
  }

  // The server does not yet have trusted validated reservations and physical
  // stock. Return UNKNOWN instead of incorrectly asserting stock availability.
  // No logging of customer identity, headers, cart data or detailed stock.
  return res.status(202).json({
    status: "shadow_diagnostic_only",
    decision: "UNKNOWN",
    reason: "AUTHORITATIVE_STOCK_NOT_CONFIGURED",
    persisted: false,
    enforced: false
  });
};
