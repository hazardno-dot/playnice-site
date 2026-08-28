import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const SHIPPING_PRICE = 4;
const FREE_SHIPPING_THRESHOLD = 39;

const SHIPPING_PAUSE_ACTIVE = false;
const SHIPPING_RESUME_TEXT = "za 10 dana";

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
      price: Number(item?.price),

      bundleItems: Array.isArray(item?.bundleItems)
        ? item.bundleItems.map((bundleItem) => ({
            name: normalizeText(bundleItem?.name),
            size: normalizeText(bundleItem?.size),
          }))
        : [],
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
    .map((item, index) => {
      const bundleHtml =
        item.bundleItems?.length > 0
          ? `
            <div style="margin-top:8px;padding-top:8px;border-top:1px solid rgba(220,181,107,0.12);">
              ${item.bundleItems
                .map(
                  (bundleItem) => `
                    <div style="font-size:12px;color:rgba(247,242,232,0.68);line-height:1.7;">
                      ✦ ${escapeHtml(bundleItem.name)} (${escapeHtml(bundleItem.size)})
                    </div>
                  `
                )
                .join("")}
            </div>
          `
          : "";

      return `
        <tr>
          <td style="padding:12px;border-bottom:1px solid #2c2c2c;color:#f7f2e8;">
            ${index + 1}. ${escapeHtml(item.name)}
            ${bundleHtml}
          </td>

          <td style="padding:12px;border-bottom:1px solid #2c2c2c;color:#dcb56b;">
            ${escapeHtml(item.size)}
          </td>

          <td style="padding:12px;border-bottom:1px solid #2c2c2c;color:#f7f2e8;">
            ${Number(item.quantity)}
          </td>

          <td style="padding:12px;border-bottom:1px solid #2c2c2c;color:#f7f2e8;">
            ${formatPrice(Number(item.price))}
          </td>

          <td style="padding:12px;border-bottom:1px solid #2c2c2c;color:#dcb56b;font-weight:700;">
            ${formatPrice(Number(item.price) * Number(item.quantity))}
          </td>
        </tr>
      `;
    })
    .join("");
}

function buildItemsText(items) {
  return items
    .map((item, index) => {
      const bundleText =
        item.bundleItems?.length > 0
          ? `\nDiscovery set:\n${item.bundleItems
              .map(
                (bundleItem) =>
                  `   ✦ ${bundleItem.name} (${bundleItem.size})`
              )
              .join("\n")}`
          : "";

      return `${index + 1}. ${item.name}
Veličina: ${item.size}
Količina: ${Number(item.quantity)}
Cena: ${formatPrice(Number(item.price))}
Ukupno: ${formatPrice(Number(item.price) * Number(item.quantity))}${bundleText}`;
    })
    .join("\n\n");
}

function shippingPauseHtml() {
  if (!SHIPPING_PAUSE_ACTIVE) return "";

  return `
    <div style="padding:16px 18px;border-radius:18px;background:rgba(220,181,107,0.08);border:1px solid rgba(220,181,107,0.22);margin:0 0 20px;">
      <div style="color:#f3d69b;font-weight:700;margin-bottom:8px;">
        Važno obaveštenje o isporuci
      </div>

      <div style="color:rgba(247,242,232,0.82);line-height:1.8;">
        Trenutno ne šaljemo pošiljke zbog kratke pauze u radu.
        Tvoja porudžbina je uspešno primljena i biće pripremljena za slanje čim ponovo krenemo sa isporukama.
      </div>

      <div style="color:rgba(247,242,232,0.82);line-height:1.8;margin-top:8px;">
        Isporuke nastavljamo ${escapeHtml(SHIPPING_RESUME_TEXT)}.
      </div>

      <div style="color:rgba(247,242,232,0.68);line-height:1.8;margin-top:8px;font-size:14px;">
        Plaćanje je pouzećem, tako da ništa ne plaćaš unapred.
      </div>
    </div>
  `;
}

function shippingPauseText() {
  if (!SHIPPING_PAUSE_ACTIVE) return "";

  return `VAŽNO OBAVEŠTENJE O ISPORUCI

Trenutno ne šaljemo pošiljke zbog kratke pauze u radu.
Tvoja porudžbina je uspešno primljena i biće pripremljena za slanje čim ponovo krenemo sa isporukama.

Isporuke nastavljamo ${SHIPPING_RESUME_TEXT}.

Plaćanje je pouzećem, tako da ništa ne plaćaš unapred.`;
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

          ${shippingPauseHtml()}

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
  <div style="margin:0;padding:0;background:#0b0b0b;font-family:Inter,Arial,sans-serif;color:#f7f2e8;">
    <div style="max-width:720px;margin:0 auto;padding:32px 20px;">
      <div style="background:linear-gradient(180deg,#171717,#0f0f0f);border:1px solid rgba(220,181,107,0.22);border-radius:24px;overflow:hidden;">
        <div style="padding:28px 28px 18px;border-bottom:1px solid rgba(220,181,107,0.14);">
          <div style="letter-spacing:.35rem;font-weight:700;color:#f3d69b;font-size:18px;">PLAYNICE</div>
          <div style="color:rgba(247,242,232,0.65);font-size:12px;margin-top:8px;">Nova porudžbina</div>
        </div>

        <div style="padding:28px;">
          <h1 style="margin:0 0 14px;font-family:Georgia,serif;font-size:34px;line-height:1;color:#f3d69b;font-weight:600;">
            Nova porudžbina
          </h1>

          <div style="padding:16px 18px;border-radius:18px;background:rgba(255,255,255,0.04);border:1px solid rgba(220,181,107,0.12);margin-bottom:20px;">
            <div style="color:#f3d69b;font-weight:700;margin-bottom:8px;">Order details</div>
            <div style="color:rgba(247,242,232,0.78);line-height:1.8;">Order ID: ${escapeHtml(orderId)}</div>
            <div style="color:rgba(247,242,232,0.78);line-height:1.8;">Kupac: ${escapeHtml(fullName)}</div>
            <div style="color:rgba(247,242,232,0.78);line-height:1.8;">Email: ${escapeHtml(email)}</div>
            <div style="color:rgba(247,242,232,0.78);line-height:1.8;">Telefon: ${escapeHtml(phone)}</div>
            <div style="color:rgba(247,242,232,0.78);line-height:1.8;">Grad: ${escapeHtml(city)}</div>
            <div style="color:rgba(247,242,232,0.78);line-height:1.8;">Adresa: ${escapeHtml(address)}</div>
            ${note ? `<div style="color:rgba(247,242,232,0.78);line-height:1.8;">Napomena: ${escapeHtml(note)}</div>` : ""}
          </div>

          <table style="width:100%;border-collapse:collapse;border-spacing:0;margin-bottom:22px;background:rgba(255,255,255,0.02);border-radius:18px;overflow:hidden;">
            <thead>
              <tr>
                <th style="text-align:left;padding:12px;border-bottom:1px solid #2c2c2c;color:#f3d69b;">Proizvod</th>
                <th style="text-align:left;padding:12px;border-bottom:1px solid #2c2c2c;color:#f3d69b;">Veličina</th>
                <th style="text-align:left;padding:12px;border-bottom:1px solid #2c2c2c;color:#f3d69b;">Količina</th>
                <th style="text-align:left;padding:12px;border-bottom:1px solid #2c2c2c;color:#f3d69b;">Cena</th>
                <th style="text-align:left;padding:12px;border-bottom:1px solid #2c2c2c;color:#f3d69b;">Ukupno</th>
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
              <span>Dostava</span>
              <strong style="color:#f7f2e8;">${shipping === 0 ? "Besplatna" : formatPrice(shipping)}</strong>
            </div>
            <div style="display:flex;justify-content:space-between;gap:10px;padding-top:12px;border-top:1px solid #2c2c2c;color:#f3d69b;">
              <span style="font-weight:700;">Ukupno</span>
              <strong style="font-size:18px;color:#f3d69b;">${formatPrice(total)}</strong>
            </div>
          </div>
        </div>
      </div>
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

${shippingPauseText() ? `${shippingPauseText()}\n\n` : ""}Kupac: ${fullName}
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

function internationalAdminEmailHtml({
  enquiryId,
  fullName,
  email,
  phone,
  countryLabel,
  city,
  address,
  note,
  items,
  subtotal,
  page
}) {
  return `
  <div style="margin:0;padding:0;background:#0b0b0b;font-family:Inter,Arial,sans-serif;color:#f7f2e8;">
    <div style="max-width:720px;margin:0 auto;padding:32px 20px;">
      <div style="background:linear-gradient(180deg,#171717,#0f0f0f);border:1px solid rgba(159,207,154,0.28);border-radius:24px;overflow:hidden;">
        <div style="padding:28px 28px 18px;border-bottom:1px solid rgba(159,207,154,0.18);">
          <div style="letter-spacing:.35rem;font-weight:700;color:#9fcf9a;font-size:18px;">PLAYNICE</div>
          <div style="color:rgba(247,242,232,0.65);font-size:12px;margin-top:8px;">International delivery enquiry</div>
        </div>

        <div style="padding:28px;">
          <h1 style="margin:0 0 14px;font-family:Georgia,serif;font-size:34px;line-height:1;color:#9fcf9a;font-weight:600;">
            Upit za dostavu van Crne Gore
          </h1>

          <div style="padding:16px 18px;border-radius:18px;background:rgba(255,255,255,0.04);border:1px solid rgba(159,207,154,0.16);margin-bottom:20px;">
            <div style="color:#9fcf9a;font-weight:700;margin-bottom:8px;">Enquiry details</div>
            <div style="color:rgba(247,242,232,0.78);line-height:1.8;">Enquiry ID: ${escapeHtml(enquiryId)}</div>
            <div style="color:rgba(247,242,232,0.78);line-height:1.8;">Kupac: ${escapeHtml(fullName)}</div>
            <div style="color:rgba(247,242,232,0.78);line-height:1.8;">Email: ${escapeHtml(email)}</div>
            <div style="color:rgba(247,242,232,0.78);line-height:1.8;">Telefon: ${escapeHtml(phone)}</div>
            <div style="color:rgba(247,242,232,0.78);line-height:1.8;">Zemlja: ${escapeHtml(countryLabel)}</div>
            <div style="color:rgba(247,242,232,0.78);line-height:1.8;">Grad: ${escapeHtml(city)}</div>
            ${address ? `<div style="color:rgba(247,242,232,0.78);line-height:1.8;">Adresa: ${escapeHtml(address)}</div>` : ""}
            ${note ? `<div style="color:rgba(247,242,232,0.78);line-height:1.8;">Napomena: ${escapeHtml(note)}</div>` : ""}
            ${page ? `<div style="color:rgba(247,242,232,0.6);line-height:1.8;font-size:13px;">Page: ${escapeHtml(page)}</div>` : ""}
          </div>

          <table style="width:100%;border-collapse:collapse;border-spacing:0;margin-bottom:22px;background:rgba(255,255,255,0.02);border-radius:18px;overflow:hidden;">
            <thead>
              <tr>
                <th style="text-align:left;padding:12px;border-bottom:1px solid #2c2c2c;color:#9fcf9a;">Proizvod</th>
                <th style="text-align:left;padding:12px;border-bottom:1px solid #2c2c2c;color:#9fcf9a;">Veličina</th>
                <th style="text-align:left;padding:12px;border-bottom:1px solid #2c2c2c;color:#9fcf9a;">Količina</th>
                <th style="text-align:left;padding:12px;border-bottom:1px solid #2c2c2c;color:#9fcf9a;">Cena</th>
                <th style="text-align:left;padding:12px;border-bottom:1px solid #2c2c2c;color:#9fcf9a;">Ukupno</th>
              </tr>
            </thead>
            <tbody>
              ${buildItemsHtml(items)}
            </tbody>
          </table>

          <div style="padding:18px;border-radius:18px;background:rgba(255,255,255,0.04);border:1px solid rgba(159,207,154,0.16);">
            <div style="display:flex;justify-content:space-between;gap:10px;margin-bottom:10px;color:rgba(247,242,232,0.82);">
              <span>Products subtotal</span>
              <strong style="color:#f7f2e8;">${formatPrice(subtotal)}</strong>
            </div>
            <div style="display:flex;justify-content:space-between;gap:10px;margin-bottom:10px;color:rgba(247,242,232,0.82);">
              <span>Dostava</span>
              <strong style="color:#9fcf9a;">Proveriti posebno</strong>
            </div>
            <div style="display:flex;justify-content:space-between;gap:10px;padding-top:12px;border-top:1px solid #2c2c2c;color:#9fcf9a;">
              <span style="font-weight:700;">Final total</span>
              <strong style="font-size:18px;color:#9fcf9a;">Nije automatski potvrđeno</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  `;
}

function internationalAdminEmailText({
  enquiryId,
  fullName,
  email,
  phone,
  countryLabel,
  city,
  address,
  note,
  items,
  subtotal,
  page
}) {
  return `PlayNice - upit za dostavu van Crne Gore

Enquiry ID: ${enquiryId}

Kupac: ${fullName}
Email: ${email}
Telefon: ${phone}
Zemlja: ${countryLabel}
Grad: ${city}
Adresa: ${address || "Nije uneta"}
Napomena: ${note || "Nema"}
Page: ${page || "N/A"}

STAVKE
${buildItemsText(items)}

Products subtotal: ${formatPrice(subtotal)}
Dostava: proveriti posebno
Final total: nije automatski potvrđeno`;
}

function internationalCustomerEmailHtml({
  enquiryId,
  fullName,
  countryLabel,
  city,
  items,
  subtotal
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
            Delivery enquiry received
          </h1>

          <p style="margin:0 0 18px;color:rgba(247,242,232,0.82);line-height:1.8;">
            Zdravo ${escapeHtml(fullName)}, primili smo tvoj upit za dostavu van Crne Gore. Ovo nije automatska porudžbina — proverićemo mogućnost dostave i javiti ti se sa detaljima.
          </p>

          <div style="padding:16px 18px;border-radius:18px;background:rgba(255,255,255,0.04);border:1px solid rgba(220,181,107,0.12);margin-bottom:20px;">
            <div style="color:#f3d69b;font-weight:700;margin-bottom:8px;">Enquiry summary</div>
            <div style="color:rgba(247,242,232,0.78);line-height:1.8;">Enquiry ID: ${escapeHtml(enquiryId)}</div>
            <div style="color:rgba(247,242,232,0.78);line-height:1.8;">Zemlja: ${escapeHtml(countryLabel)}</div>
            <div style="color:rgba(247,242,232,0.78);line-height:1.8;">Grad: ${escapeHtml(city)}</div>
            <div style="color:rgba(247,242,232,0.78);line-height:1.8;">Products subtotal: ${formatPrice(subtotal)}</div>
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

          <p style="margin:22px 0 0;color:rgba(247,242,232,0.7);line-height:1.8;font-size:14px;">
            Dostava i finalna cena biće potvrđene naknadno.
          </p>
        </div>
      </div>
    </div>
  </div>
  `;
}

function internationalCustomerEmailText({
  enquiryId,
  fullName,
  countryLabel,
  city,
  items,
  subtotal
}) {
  return `PLAYNICE

Delivery enquiry received

Enquiry ID: ${enquiryId}

Zdravo ${fullName}, primili smo tvoj upit za dostavu van Crne Gore.
Ovo nije automatska porudžbina — proverićemo mogućnost dostave i javiti ti se sa detaljima.

Zemlja: ${countryLabel}
Grad: ${city}

STAVKE
${buildItemsText(items)}

Products subtotal: ${formatPrice(subtotal)}
Dostava: biće potvrđena naknadno
Final total: biće potvrđen naknadno

Remember. PlayNice.`;
}

async function saveOrderToGoogleSheets(orderData) {
  const url = process.env.GOOGLE_SCRIPT_ORDERS_URL;

  if (!url) {
    throw new Error("Missing GOOGLE_SCRIPT_ORDERS_URL");
  }

  const response = await fetch(url, {
    method: "POST",
    redirect: "follow",
    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    },
    body: JSON.stringify({
      source: "order",
      ...orderData
    })
  });

  const text = await response.text();

  let data;

  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(
      "Google Sheets returned invalid JSON: " + text
    );
  }

  if (
    !response.ok ||
    data.status !== "ok" ||
    !data.orderId
  ) {
    throw new Error(
      data.message ||
      "Failed to save order to Google Sheets"
    );
  }

  return {
    saved: true,
    orderId: data.orderId,
    trackingNumber: data.trackingNumber || "",
    duplicate: Boolean(data.duplicate)
  };
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

    const requestType = normalizeText(body.type);
    const firstName = normalizeText(customer.firstName);
    const lastName = normalizeText(customer.lastName);
    const fullName = normalizeText(`${firstName} ${lastName}`);
    const email = normalizeText(customer.email);
    const phone = normalizeText(customer.phone);
    const country = normalizeText(customer.country || "ME");
    const countryLabel = normalizeText(
      customer.countryLabel || (country === "ME" ? "Montenegro" : country)
    );
    const city = normalizeText(customer.city);
    const address = normalizeText(customer.address);
    const note = normalizeText(customer.note);
    const page = normalizeText(body.page);
    const items = sanitizeItems(body.items);

    const isInternationalEnquiry =
      requestType === "international_enquiry" || country !== "ME";

    if (
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      !country ||
      !city ||
      (!isInternationalEnquiry && !address)
    ) {
      return res.status(400).json({
        error: isInternationalEnquiry
          ? "Missing required enquiry fields"
          : "Missing required customer fields"
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "Invalid email address" });
    }

    if (items.length === 0) {
      return res.status(400).json({ error: "Cart is empty or invalid" });
    }

    const subtotal = getSubtotal(items);
    let orderId = isInternationalEnquiry
  ? generateOrderId().replace("PN-", "PN-INT-")
  : "";

let trackingNumber = "";

    const fromEmail = process.env.RESEND_FROM_EMAIL || "noreply@playniceshop.me";
    const adminEmail = process.env.ADMIN_ORDER_EMAIL || "order@playniceshop.me";

    if (isInternationalEnquiry) {
      let adminSendResult;

      try {
        adminSendResult = await resend.emails.send({
          from: `PlayNice <${fromEmail}>`,
          to: adminEmail,
          replyTo: email,
          subject: `PlayNice International Enquiry ${orderId} • ${countryLabel} • ${fullName} • ${formatPrice(subtotal)}`,
          html: internationalAdminEmailHtml({
            enquiryId: orderId,
            fullName,
            email,
            phone,
            countryLabel,
            city,
            address,
            note,
            items,
            subtotal,
            page
          }),
          text: internationalAdminEmailText({
            enquiryId: orderId,
            fullName,
            email,
            phone,
            countryLabel,
            city,
            address,
            note,
            items,
            subtotal,
            page
          })
        });
      } catch (adminError) {
        console.error("International enquiry admin email failed:", adminError);
        return res.status(500).json({
          error: "Failed to send international enquiry",
          details: adminError?.message || "Admin enquiry email failed"
        });
      }

      let customerEmailSent = false;
      let customerEmailError = null;

      try {
        await resend.emails.send({
          from: `PlayNice <${fromEmail}>`,
          to: email,
          replyTo: "info@playniceshop.me",
          subject: `PlayNice Delivery Enquiry Received • ${orderId}`,
          html: internationalCustomerEmailHtml({
            enquiryId: orderId,
            fullName,
            countryLabel,
            city,
            items,
            subtotal
          }),
          text: internationalCustomerEmailText({
            enquiryId: orderId,
            fullName,
            countryLabel,
            city,
            items,
            subtotal
          })
        });

        customerEmailSent = true;
      } catch (customerError) {
        customerEmailError = customerError?.message || "Customer enquiry email failed";
        console.error("Customer enquiry email failed:", customerError);
      }

      return res.status(200).json({
  success: true,
  enquiryReceived: true,
  orderPlaced: false,
  adminEmailSent: true,
  customerEmailSent,
  warning: customerEmailSent
    ? null
    : "Enquiry received, but customer email was not sent",
  adminMessageId: adminSendResult?.data?.id || null,
  customerEmailError,
  enquiryId: orderId
});
    }

    const shipping = getShipping(subtotal);
    const total = subtotal + shipping;

    const googleSheetsResult = await saveOrderToGoogleSheets({
      fullName,
      email,
      phone,
      city,
      address,
      note,
      items,
      subtotal,
      shipping,
      total,
      orderSource: "website"
    });

    orderId = googleSheetsResult.orderId;
    trackingNumber = googleSheetsResult.trackingNumber;

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
        replyTo: "info@playniceshop.me",
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
  enquiryReceived: false,
  adminEmailSent: true,
  customerEmailSent,
  warning: customerEmailSent ? null : "Order placed, but customer email was not sent",
  adminMessageId: adminSendResult?.data?.id || null,
  customerEmailError,
  googleSheetsOrderSaved: googleSheetsResult.saved,
  googleSheetsOrderError: googleSheetsResult.error || null,
  orderId
});
  } catch (error) {
    console.error("Checkout error:", error);
    return res.status(500).json({
      error: "Failed to process checkout request",
      details: error?.message || "Unknown error"
    });
  }
}