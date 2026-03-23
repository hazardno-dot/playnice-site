import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const SHIPPING_PRICE = 4;
const FREE_SHIPPING_THRESHOLD = 39;

function formatPrice(value) {
  return `${Number(value).toFixed(value % 1 === 0 ? 0 : 1)}€`;
}

function getSubtotal(cart) {
  return cart.reduce((sum, item) => sum + Number(item.price) * Number(item.qty), 0);
}

function getShipping(subtotal) {
  if (subtotal === 0) return 0;
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_PRICE;
}

function escapeHtml(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function buildItemsHtml(cart) {
  return cart
    .map(
      (item, index) => `
        <tr>
          <td style="padding:12px;border-bottom:1px solid #2c2c2c;color:#f7f2e8;">${index + 1}. ${escapeHtml(item.name)}</td>
          <td style="padding:12px;border-bottom:1px solid #2c2c2c;color:#dcb56b;">${escapeHtml(item.size)}</td>
          <td style="padding:12px;border-bottom:1px solid #2c2c2c;color:#f7f2e8;">${item.qty}</td>
          <td style="padding:12px;border-bottom:1px solid #2c2c2c;color:#f7f2e8;">${formatPrice(item.price)}</td>
          <td style="padding:12px;border-bottom:1px solid #2c2c2c;color:#dcb56b;font-weight:700;">${formatPrice(item.price * item.qty)}</td>
        </tr>
      `
    )
    .join("");
}

function customerEmailHtml({ fullName, cart, subtotal, shipping, total, note }) {
  return `
  <div style="margin:0;padding:0;background:#0b0b0b;font-family:Inter,Arial,sans-serif;color:#f7f2e8;">
    <div style="max-width:720px;margin:0 auto;padding:32px 20px;">
      <div style="background:linear-gradient(180deg,#171717,#0f0f0f);border:1px solid rgba(220,181,107,0.22);border-radius:24px;overflow:hidden;">
        <div style="padding:28px 28px 18px;border-bottom:1px solid rgba(220,181,107,0.14);">
          <div style="letter-spacing:.35rem;font-weight:700;color:#f3d69b;font-size:18px;">PLAYNICE</div>
          <div style="color:rgba(247,242,232,0.65);font-size:12px;margin-top:8px;">Remember. PlayNice.</div>
        </div>

        <div style="padding:28px;">
          <h1 style="margin:0 0 14px;font-family:Georgia,serif;font-size:34px;line-height:1;color:#f3d69b;font-weight:600;">
            Order received
          </h1>

          <p style="margin:0 0 18px;color:rgba(247,242,232,0.82);line-height:1.8;">
            Zdravo ${escapeHtml(fullName)}, hvala na kupovini. Primili smo tvoju porudžbinu i uskoro ćemo ti se javiti sa potvrdom i detaljima isporuke.
          </p>

          <div style="padding:16px 18px;border-radius:18px;background:rgba(255,255,255,0.04);border:1px solid rgba(220,181,107,0.12);margin-bottom:20px;">
            <div style="color:#f3d69b;font-weight:700;margin-bottom:8px;">Order summary</div>
            <div style="color:rgba(247,242,232,0.78);line-height:1.8;">Kupac: ${escapeHtml(fullName)}</div>
            ${note ? `<div style="color:rgba(247,242,232,0.78);line-height:1.8;">Napomena: ${escapeHtml(note)}</div>` : ""}
          </div>

          <table style="width:100%;border-collapse:collapse;border-spacing:0;margin-bottom:22px;background:rgba(255,255,255,0.02);border-radius:18px;overflow:hidden;">
            <thead>
              <tr>
                <th style="text-align:left;padding:12px;border-bottom:1px solid #2c2c2c;color:#f3d69b;">Fragrance</th>
                <th style="text-align:left;padding:12px;border-bottom:1px solid #2c2c2c;color:#f3d69b;">Size</th>
                <th style="text-align:left;padding:12px;border-bottom:1px solid #2c2c2c;color:#f3d69b;">Qty</th>
                <th style="text-align:left;padding:12px;border-bottom:1px solid #2c2c2c;color:#f3d69b;">Price</th>
                <th style="text-align:left;padding:12px;border-bottom:1px solid #2c2c2c;color:#f3d69b;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${buildItemsHtml(cart)}
            </tbody>
          </table>

          <div style="padding:18px;border-radius:18px;background:rgba(255,255,255,0.04);border:1px solid rgba(220,181,107,0.12);">
            <div style="display:flex;justify-content:space-between;gap:10px;margin-bottom:10px;color:rgba(247,242,232,0.82);">
              <span>Subtotal</span>
              <strong style="color:#f7f2e8;">${formatPrice(subtotal)}</strong>
            </div>
            <div style="display:flex;justify-content:space-between;gap:10px;margin-bottom:10px;color:rgba(247,242,232,0.82);">
              <span>Shipping</span>
              <strong style="color:#f7f2e8;">${shipping === 0 ? "Free" : formatPrice(shipping)}</strong>
            </div>
            <div style="display:flex;justify-content:space-between;gap:10px;padding-top:12px;border-top:1px solid #2c2c2c;color:#f3d69b;">
              <span style="font-weight:700;">Total</span>
              <strong style="font-size:18px;color:#f3d69b;">${formatPrice(total)}</strong>
            </div>
          </div>

          <p style="margin:22px 0 0;color:rgba(247,242,232,0.7);line-height:1.8;font-size:14px;">
            Payment method: Cash on delivery
          </p>
        </div>
      </div>
    </div>
  </div>
  `;
}

function adminEmailHtml({ fullName, email, phone, city, address, note, cart, subtotal, shipping, total }) {
  return `
  <div style="font-family:Arial,sans-serif;background:#0b0b0b;color:#f7f2e8;padding:24px;">
    <h2 style="color:#f3d69b;">Nova porudžbina - PlayNice</h2>
    <p><strong>Kupac:</strong> ${escapeHtml(fullName)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    <p><strong>Telefon:</strong> ${escapeHtml(phone)}</p>
    <p><strong>Grad:</strong> ${escapeHtml(city)}</p>
    <p><strong>Adresa:</strong> ${escapeHtml(address)}</p>
    <p><strong>Napomena:</strong> ${escapeHtml(note || "Nema")}</p>

    <table style="width:100%;border-collapse:collapse;margin-top:20px;">
      <thead>
        <tr>
          <th style="text-align:left;padding:10px;border-bottom:1px solid #333;color:#f3d69b;">Proizvod</th>
          <th style="text-align:left;padding:10px;border-bottom:1px solid #333;color:#f3d69b;">Veličina</th>
          <th style="text-align:left;padding:10px;border-bottom:1px solid #333;color:#f3d69b;">Količina</th>
          <th style="text-align:left;padding:10px;border-bottom:1px solid #333;color:#f3d69b;">Cena</th>
          <th style="text-align:left;padding:10px;border-bottom:1px solid #333;color:#f3d69b;">Ukupno</th>
        </tr>
      </thead>
      <tbody>
        ${buildItemsHtml(cart)}
      </tbody>
    </table>

    <div style="margin-top:20px;">
      <p><strong>Subtotal:</strong> ${formatPrice(subtotal)}</p>
      <p><strong>Dostava:</strong> ${shipping === 0 ? "Besplatna" : formatPrice(shipping)}</p>
      <p><strong>Ukupno:</strong> ${formatPrice(total)}</p>
    </div>
  </div>
  `;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      fullName,
      email,
      phone,
      city,
      address,
      note,
      cart,
    } = req.body || {};

    if (!fullName || !email || !phone || !city || !address) {
      return res.status(400).json({ error: "Missing required customer fields" });
    }

    if (!Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    const subtotal = getSubtotal(cart);
    const shipping = getShipping(subtotal);
    const total = subtotal + shipping;

    const fromEmail = process.env.RESEND_FROM_EMAIL || "orders@playniceshop.me";
    const adminEmail = "order@playniceshop.me";

    await resend.emails.send({
      from: `PlayNice <${fromEmail}>`,
      to: email,
      subject: `PlayNice order confirmation - ${formatPrice(total)}`,
      html: customerEmailHtml({
        fullName,
        cart,
        subtotal,
        shipping,
        total,
        note,
      }),
    });

    await resend.emails.send({
      from: `PlayNice <${fromEmail}>`,
      to: adminEmail,
      subject: `Nova porudžbina - ${fullName} - ${formatPrice(total)}`,
      html: adminEmailHtml({
        fullName,
        email,
        phone,
        city,
        address,
        note,
        cart,
        subtotal,
        shipping,
        total,
      }),
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Checkout email error:", error);
    return res.status(500).json({ error: "Failed to send order emails" });
  }
}
