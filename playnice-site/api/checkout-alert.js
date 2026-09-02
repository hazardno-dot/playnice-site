// api/checkout-alert.js

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.error("Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID");
    return res.status(500).json({ ok: false, error: "Telegram is not configured" });
  }

  try {
    const {
      subtotal = 0,
      total = 0,
      shipping = 0,
      language = "",
      source = "shop",
      items = []
    } = req.body || {};

    const safeItems = Array.isArray(items) ? items.slice(0, 8) : [];

    const itemLines = safeItems.length
      ? safeItems
          .map((item) => {
            const name = String(item?.name || "Unknown fragrance").trim();
            const size = String(item?.size || "").trim();
            const quantity = Number(item?.quantity || 1);

            return `• ${name}${size ? ` · ${size}` : ""}${quantity > 1 ? ` × ${quantity}` : ""}`;
          })
          .join("\n")
      : "• Cart items unavailable";

    const message = [
      "🔔 PLAYNICE · CHECKOUT STARTED",
      "",
      itemLines,
      "",
      `Subtotal: €${Number(subtotal || 0).toFixed(2)}`,
      `Shipping: €${Number(shipping || 0).toFixed(2)}`,
      `Cart total: €${Number(total || subtotal || 0).toFixed(2)}`,
      `Language: ${String(language || "").toUpperCase() || "N/A"}`,
      `Source: ${source}`
    ].join("\n");

    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          disable_web_page_preview: true
        })
      }
    );

    const telegramResult = await telegramResponse.json();

    if (!telegramResponse.ok || !telegramResult?.ok) {
      console.error("Telegram checkout alert failed:", telegramResult);
      return res.status(502).json({ ok: false, error: "Telegram send failed" });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Checkout alert error:", error);
    return res.status(500).json({ ok: false, error: "Checkout alert failed" });
  }
};