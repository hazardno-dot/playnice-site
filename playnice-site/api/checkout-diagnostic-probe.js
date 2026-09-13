// Preview-only diagnostic endpoint for Google Apps Script checkout latency.
// Do not merge this file to production.

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default async function handler(req, res) {
  res.setHeader("Allow", ["GET"]);

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const url = process.env.GOOGLE_SCRIPT_ORDERS_URL;
  if (!url) {
    return res.status(500).json({ error: "Missing GOOGLE_SCRIPT_ORDERS_URL" });
  }

  const requestedCount = Number(req.query?.count || 5);
  const count = Math.max(1, Math.min(8, Number.isFinite(requestedCount) ? requestedCount : 5));
  const results = [];

  for (let index = 0; index < count; index += 1) {
    const startedAt = Date.now();

    try {
      const response = await fetch(url, {
        method: "POST",
        redirect: "follow",
        headers: {
          "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify({
          source: "checkout_diagnostic_probe"
        })
      });

      const text = await response.text();
      let data = null;

      try {
        data = JSON.parse(text);
      } catch {
        data = null;
      }

      results.push({
        index: index + 1,
        httpStatus: response.status,
        vercelRoundTripMs: Date.now() - startedAt,
        appsScript: data,
        rawPreview: data ? null : text.slice(0, 180)
      });
    } catch (error) {
      results.push({
        index: index + 1,
        vercelRoundTripMs: Date.now() - startedAt,
        error: error?.message || String(error)
      });
    }

    if (index < count - 1) {
      await sleep(500);
    }
  }

  const successful = results.filter((item) => item.appsScript?.status === "ok");
  const roundTrips = successful.map((item) => item.vercelRoundTripMs);
  const payload = {
    count,
    successful: successful.length,
    summary: roundTrips.length
      ? {
          minMs: Math.min(...roundTrips),
          maxMs: Math.max(...roundTrips),
          avgMs: Math.round(roundTrips.reduce((sum, value) => sum + value, 0) / roundTrips.length)
        }
      : null,
    results
  };

  console.info("[checkout-diagnostic-probe]", JSON.stringify(payload));

  return res.status(200).json(payload);
}
