import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const SHIPPING_PRICE = 3.5;
const FREE_SHIPPING_THRESHOLD = 39;

function formatPrice(value) {
  const num = Number(value || 0);
  return `${num.toFixed(2)}€`;
}

function getSubtotal(items) {
  return items.reduce((sum, item) => {
    return sum + Number(item.price) * Number(item.quantity);
  }, 0);
}

function getShipping(subtotal) {
  if (subtotal === 0) return 0;
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_PRICE;
}

function generateOrderId() {
  const now = new Date();

  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");
  const random = Math.floor(100 + Math.random() * 900);

  return `PN-${yyyy}${mm}${dd}-${hh}${min}${ss}-${random}`;
}

function escapeHtml(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizeText(value = "") {
  return String(value).trim();
}

function isValidEmail(email = "") {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
}

function sanitizeItems(items) {
  if (!Array.isArray(items)) return [];

  return items
    .map((item) => ({
      name: normalizeText(item?.name),
      size: normalizeText(item?.size),
      quantity: Number(item?.quantity),
      price: Number(item?.price)
    }))
    .filter(
      (item) =>
        item.name &&
        item.size &&
        Number.isFinite(item.quantity) &&
        item.quantity > 0 &&
        Number.isFinite(item.price) &&
        item.price >= 0
    );
}

function buildItemsHtml(items) {
  return items
    .map(
      (item, index) => `
        <tr>
          <td style="padding:12px;border-bottom:1px solid #2c2c2c;color:#f7f2e8;">${index + 1}. ${escapeHtml(item.name)}</td>
          <td style="padding:12px;border-bottom:1px solid #2c2c2c;color:#dcb56b;">${escapeHtml(item.size)}</td>
          <td style="padding:12px;border-bottom:1px solid #2c2c2c;color:#f7f2e8;">${Number(item.quantity)}</td>
          <td style="padding:12px;border-bottom:1px solid #2c2c2c;color:#f7f2e8;">${formatPrice(Number(item.price))}</td>
          <td style="padding:12px;border-bottom:1px solid #2c2c2c;color:#dcb56b;font-weight:700;">${formatPrice(Number(item.price) * Number(item.quantity))}</td>
        </tr>
      `
    )
    .join("");
}

function buildItemsText(items) {
  return items
    .map(
      (item, index) =>
        `${index + 1}. ${item.name}
Veličina: ${item.size}
Količina: ${Number(item.quantity)}
Cena: ${formatPrice(Number(item.price))}
Ukupno: ${formatPrice(Number(item.price) * Number(item.quantity))}`
    )
    .join("\n\n");
}

function customerEmailHtml({
  orderId,
  fullName,
  items,
  subtotal,
  shipping,
  total,
  note,
  city,
  address
}) {
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
            <div style="color:rgba(247,242,232,0.78);line-height:1.8;">Order ID: ${escapeHtml(orderId)}</div>
            <div style="color:rgba(247,242,232,0.78);line-height:1.8;">Kupac: ${escapeHtml(fullName)}</div>
            <div style="color:rgba(247,242,232,0.78);line-height:1.8;">Grad: ${escapeHtml(city)}</div>
            <div style="color:rgba(247,242,232,0.78);line-height:1.8;">Adresa: ${escapeHtml(address)}</div>
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
              ${buildItemsHtml(items)}
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

function adminEmailHtml({
  orderId,
  fullName,
  email,
  phone,
  city,
  address,
  note,
  items,
  subtotal,
  shipping,
  total
}) {
  return `
  <div style="font-family:Arial,sans-serif;background:#0b0b0b;color:#f7f2e8;padding:24px;">
    <h2 style="color:#f3d69b;">Nova porudžbina - PlayNice</h2>
    <p><strong>Order ID:</strong> ${escapeHtml(orderId)}</p>
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
        ${buildItemsHtml(items)}
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

function customerEmailText({
  orderId,
  fullName,
  city,
  address,
  note,
  items,
  subtotal,
  shipping,
  total
}) {
  return `PLAYNICE

Order ID: ${orderId}

Zdravo ${fullName}, hvala na kupovini.
Primili smo tvoju porudžbinu i uskoro ćemo ti se javiti sa potvrdom i detaljima isporuke.

Kupac: ${fullName}
Grad: ${city}
Adresa: ${address}
Napomena: ${note || "Nema"}

STAVKE
${buildItemsText(items)}

Subtotal: ${formatPrice(subtotal)}
Dostava: ${shipping === 0 ? "Besplatna" : formatPrice(shipping)}
Ukupno: ${formatPrice(total)}

Plaćanje: Pouzećem

Remember. PlayNice.`;
}

function adminEmailText({
  orderId,
  fullName,
  email,
  phone,
  city,
  address,
  note,
  items,
  subtotal,
  shipping,
  total
}) {
  return `Nova porudžbina - PlayNice

Order ID: ${orderId}

Kupac: ${fullName}
Email: ${email}
Telefon: ${phone}
Grad: ${city}
Adresa: ${address}
Napomena: ${note || "Nema"}

STAVKE
${buildItemsText(items)}

Subtotal: ${formatPrice(subtotal)}
Dostava: ${shipping === 0 ? "Besplatna" : formatPrice(shipping)}
Ukupno: ${formatPrice(total)}`;
}

export default async function handler(req, res) {
  res.setHeader("Allow", ["POST"]);

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!process.env.RESEND_API_KEY) {
    console.error("Missing RESEND_API_KEY");
    return res.status(500).json({ error: "Email service is not configured" });
  }

  try {
    const body = req.body || {};
    const customer = body.customer || {};

    const firstName = normalizeText(customer.firstName);
    const lastName = normalizeText(customer.lastName);
    const fullName = normalizeText(`${firstName} ${lastName}`);
    const email = normalizeText(customer.email);
    const phone = normalizeText(customer.phone);
    const city = normalizeText(customer.city);
    const address = normalizeText(customer.address);
    const note = normalizeText(customer.note);
    const items = sanitizeItems(body.items);

    if (!firstName || !lastName || !email || !phone || !city || !address) {
      return res.status(400).json({ error: "Missing required customer fields" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "Invalid email address" });
    }

    if (items.length === 0) {
      return res.status(400).json({ error: "Cart is empty or invalid" });
    }

    const subtotal = getSubtotal(items);
    const shipping = getShipping(subtotal);
    const total = subtotal + shipping;
    const orderId = generateOrderId();

    const fromEmail = process.env.RESEND_FROM_EMAIL || "noreply@playniceshop.me";
    const adminEmail = process.env.ADMIN_ORDER_EMAIL || "order@playniceshop.me";

    let adminSendResult;

    try {
      adminSendResult = await resend.emails.send({
        from: `PlayNice <${fromEmail}>`,
        to: adminEmail,
        replyTo: email,
        subject: `PlayNice Order ${orderId} • ${fullName} • ${formatPrice(total)}`,
        html: adminEmailHtml({
          orderId,
          fullName,
          email,
          phone,
          city,
          address,
          note,
          items,
          subtotal,
          shipping,
          total
        }),
        text: adminEmailText({
          orderId,
          fullName,
          email,
          phone,
          city,
          address,
          note,
          items,
          subtotal,
          shipping,
          total
        })
      });
    } catch (adminError) {
      console.error("Admin email failed:", adminError);
      return res.status(500).json({
        error: "Failed to place order",
        details: adminError?.message || "Admin email failed"
      });
    }

    let customerEmailSent = false;
    let customerEmailError = null;

    try {
      await resend.emails.send({
        from: `PlayNice <${fromEmail}>`,
        to: email,
        subject: `PlayNice Order Confirmation • ${orderId}`,
        html: customerEmailHtml({
          orderId,
          fullName,
          city,
          address,
          note,
          items,
          subtotal,
          shipping,
          total
        }),
        text: customerEmailText({
          orderId,
          fullName,
          city,
          address,
          note,
          items,
          subtotal,
          shipping,
          total
        })
      });

      customerEmailSent = true;
    } catch (customerError) {
      customerEmailError = customerError?.message || "Customer email failed";
      console.error("Customer email failed:", customerError);
    }

    return res.status(200).json({
      success: true,
      orderPlaced: true,
      adminEmailSent: true,
      customerEmailSent,
      warning: customerEmailSent ? null : "Order placed, but customer email was not sent",
      adminMessageId: adminSendResult?.data?.id || null,
      customerEmailError,
      orderId
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return res.status(500).json({
      error: "Failed to process order",
      details: error?.message || "Unknown error"
    });
  }
}