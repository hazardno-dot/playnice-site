const { Resend } = require("resend");

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


function sanitizeRecommendations(recommendations) {
  if (!Array.isArray(recommendations)) return [];

  const seen = new Set();

  return recommendations
    .map((item) => ({
      name: normalizeText(item?.name),
      shortName: normalizeText(item?.shortName),
      slug: normalizeText(item?.slug),
      image: normalizeText(item?.image),
      category: normalizeText(item?.category)
    }))
    .filter((item) => {
      if (!item.name || !item.slug || seen.has(item.slug)) return false;
      seen.add(item.slug);
      return true;
    })
    .slice(0, 3);
}

function getEmailCopy(language = "sr") {
  const isEn = language === "en";

  return isEn
    ? {
        title: "Order received",
        intro: (fullName, orderId) =>
          `${escapeHtml(fullName)}, thank you for choosing PlayNice. Your order <strong style="color:#edcf88;">${escapeHtml(orderId)}</strong> is safely with us. We’ll take care of the details and let you know as soon as it is ready for the courier.`,
        progress: ["ORDER RECEIVED", "PREPARING", "WITH COURIER"],
        summary: "Order summary",
        orderId: "Order ID",
        customer: "Customer",
        city: "City",
        address: "Address",
        note: "Note",
        fragrance: "Fragrance",
        size: "Size",
        qty: "Qty",
        price: "Price",
        total: "Total",
        subtotal: "Subtotal",
        shipping: "Shipping",
        free: "Free",
        nextTitle: "What happens next",
        nextText: "It’s over to us now. We’ll check the details and prepare your order with care. As soon as it is handed to the courier, we’ll send you another email with delivery information.",
        payment: "Payment on delivery",
        recommendationsTitle: "YOU MAY ALSO LIKE",
        recommendationsKicker: "A few scents worth discovering next.",
        viewFragrance: "View fragrance",
        explore: "Explore PlayNice",
        instagram: "Instagram",
        journal: "Le Journal",
        contact: "Contact",
        pauseTitle: "Important delivery update",
        pause1: "We are currently taking a short pause from shipping. Your order has been received successfully and will be prepared as soon as deliveries resume.",
        pause2: "Deliveries resume",
        pause3: "Payment is on delivery, so nothing is charged in advance."
      }
    : {
        title: "Porudžbina je primljena",
        intro: (fullName, orderId) =>
          `${escapeHtml(fullName)}, hvala Vam što ste izabrali PlayNice. Vaša porudžbina <strong style="color:#edcf88;">${escapeHtml(orderId)}</strong> je uspešno primljena. Mi ćemo se pobrinuti za detalje i javiti Vam se čim bude spremna za kurira.`,
        progress: ["PORUDŽBINA PRIMLJENA", "PRIPREMA", "KOD KURIRA"],
        summary: "Pregled porudžbine",
        orderId: "Broj porudžbine",
        customer: "Kupac",
        city: "Grad",
        address: "Adresa",
        note: "Napomena",
        fragrance: "Parfem",
        size: "Veličina",
        qty: "Kol.",
        price: "Cena",
        total: "Ukupno",
        subtotal: "Međuzbir",
        shipping: "Dostava",
        free: "Besplatna",
        nextTitle: "Šta sledi",
        nextText: "Sada je red na nama. Proverićemo sve detalje i pažljivo pripremiti Vašu porudžbinu. Čim je predamo kuriru, stići će Vam novi mejl sa informacijama o isporuci.",
        payment: "Plaćanje pouzećem",
        recommendationsTitle: "MOŽDA ĆE VAM SE DOPASTI",
        recommendationsKicker: "Još nekoliko mirisa koje vredi otkriti.",
        viewFragrance: "Pogledajte parfem",
        explore: "Istražite PlayNice",
        instagram: "Instagram",
        journal: "Le Journal",
        contact: "Kontakt",
        pauseTitle: "Važno obaveštenje o isporuci",
        pause1: "Trenutno imamo kratku pauzu u slanju. Vaša porudžbina je uspešno primljena i biće pripremljena čim ponovo krenemo sa isporukama.",
        pause2: "Isporuke nastavljamo",
        pause3: "Plaćanje je pouzećem, tako da ništa ne plaćate unapred."
      };
}

function buildRecommendationsHtml(recommendations, language = "sr") {
  if (!recommendations?.length) return "";

  const c = getEmailCopy(language);
  const baseUrl = "https://www.playniceshop.me";

  const rows = recommendations.map((item, index) => {
    const productUrl = `${baseUrl}/product/${encodeURIComponent(item.slug)}`;
    const imageUrl = item.image
      ? (item.image.startsWith("http") ? item.image : `${baseUrl}${item.image.startsWith("/") ? "" : "/"}${item.image}`)
      : "";

    return `
      <tr>
        <td style="padding:${index === 0 ? "0" : "14px 0 0"};">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
            <tr>
              ${imageUrl ? `
              <td width="72" valign="middle" style="padding-right:14px;">
                <a href="${productUrl}" style="text-decoration:none;">
                  <img src="${escapeHtml(imageUrl)}" width="64" height="64" alt="${escapeHtml(item.name)}" style="display:block;width:64px;height:64px;object-fit:contain;border-radius:14px;background:#111915;border:1px solid rgba(72,126,94,0.24);">
                </a>
              </td>` : ""}
              <td valign="middle">
                <div style="font-size:14px;font-weight:700;line-height:1.4;color:#f7f2e8;">
                  ${escapeHtml(item.shortName || item.name)}
                </div>
                ${item.category ? `<div style="margin-top:4px;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:rgba(159,207,154,0.72);">${escapeHtml(item.category)}</div>` : ""}
                <div style="margin-top:7px;">
                  <a href="${productUrl}" style="font-size:12px;color:#9fcf9a;text-decoration:none;font-weight:700;">
                    ${c.viewFragrance} →
                  </a>
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    `;
  }).join("");

  return `
    <div style="margin-top:22px;padding:20px;border-radius:20px;background:linear-gradient(180deg,rgba(12,32,24,0.78),rgba(7,20,15,0.84));border:1px solid rgba(72,126,94,0.30);box-shadow:inset 0 1px 0 rgba(255,255,255,0.035);">
      <div style="font-size:11px;letter-spacing:.18em;font-weight:800;color:#9fcf9a;">
        ${c.recommendationsTitle}
      </div>
      <div style="margin-top:7px;color:rgba(247,242,232,0.68);font-size:13px;line-height:1.6;">
        ${c.recommendationsKicker}
      </div>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:18px;border-collapse:collapse;">
        ${rows}
      </table>
    </div>
  `;
}

function buildEmailFooterHtml(language = "sr") {
  const c = getEmailCopy(language);

  return `
    <div style="margin-top:22px;text-align:center;">
      <a href="https://www.playniceshop.me/shop"
         style="display:inline-block;padding:12px 20px;border-radius:999px;background:#121212;border:1px solid rgba(226,190,112,0.40);color:#edcf88;text-decoration:none;font-size:13px;font-weight:700;letter-spacing:.04em;">
        ${c.explore} →
      </a>

      <div style="margin-top:18px;font-size:12px;color:rgba(247,242,232,0.52);">
        <a href="https://www.instagram.com/playnice.me/" style="color:rgba(247,242,232,0.66);text-decoration:none;">${c.instagram}</a>
        <span style="padding:0 8px;color:rgba(220,181,107,0.30);">·</span>
        <a href="https://www.playniceshop.me/journal" style="color:rgba(247,242,232,0.66);text-decoration:none;">${c.journal}</a>
        <span style="padding:0 8px;color:rgba(220,181,107,0.30);">·</span>
        <a href="mailto:info@playniceshop.me" style="color:rgba(247,242,232,0.66);text-decoration:none;">${c.contact}</a>
      </div>

      <div style="margin-top:18px;color:#edcf88;font-size:12px;font-weight:600;letter-spacing:.04em;">
        Remember. PlayNice.
      </div>
    </div>
  `;
}

function buildOrderProgressHtml(activeStep = 1, language = "sr") {
  const c = getEmailCopy(language);

  const steps = [
    { number: "01", label: c.progress[0] },
    { number: "02", label: c.progress[1] },
    { number: "03", label: c.progress[2] }
  ];

  return `
    <div style="margin:0 0 20px;padding:12px 14px;border-radius:16px;background:rgba(255,255,255,0.025);border:1px solid rgba(220,181,107,0.13);">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;table-layout:fixed;">
        <tr>
          ${steps.map((step, index) => {
            const stepNumber = index + 1;
            const isDone = stepNumber < activeStep;
            const isActive = stepNumber === activeStep;
            const marker = isDone ? "✓" : isActive ? "●" : "○";
            const color = isDone
              ? "#9fcf9a"
              : isActive
                ? "#edcf88"
                : "rgba(247,242,232,0.38)";

            return `
              <td width="33.33%" valign="middle" style="padding:${index === 0 ? "0 8px 0 0" : index === 2 ? "0 0 0 8px" : "0 8px"};${index > 0 ? "border-left:1px solid rgba(220,181,107,0.10);" : ""}">
                <div style="font-size:10px;line-height:1.35;letter-spacing:.07em;color:${color};white-space:normal;">
                  <span style="font-weight:700;">${step.number} ${marker}</span>
                  <span style="margin-left:4px;">${step.label}</span>
                </div>
              </td>
            `;
          }).join("")}
        </tr>
      </table>
    </div>
  `;
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
  address,
  language = "sr",
  recommendations = []
}) {
  const c = getEmailCopy(language);

  return `
  <div style="margin:0;padding:0;background:#0b0b0b;font-family:Inter,Arial,sans-serif;color:#f7f2e8;">
    <div style="max-width:720px;margin:0 auto;padding:32px 20px;">
      <div style="background:linear-gradient(180deg,#171717,#0f0f0f);border:1px solid rgba(220,181,107,0.22);border-radius:24px;overflow:hidden;box-shadow:0 24px 60px rgba(0,0,0,0.28);">
        <div style="padding:28px 28px 18px;border-bottom:1px solid rgba(220,181,107,0.14);">
          <div style="letter-spacing:.35rem;font-weight:700;color:#edcf88;font-size:18px;">PLAYNICE</div>
          <div style="color:rgba(247,242,232,0.58);font-size:12px;margin-top:8px;">Remember. PlayNice.</div>
        </div>

        <div style="padding:28px;">
          <div style="font-size:11px;letter-spacing:.18em;font-weight:600;color:rgba(247,242,232,0.52);margin-bottom:10px;">
            ${language === "en" ? "ORDER UPDATE" : "PORUDŽBINA"}
          </div>

          <h1 style="margin:0 0 14px;font-family:Georgia,serif;font-size:36px;line-height:1.04;color:#edcf88;font-weight:600;">
            ${c.title}
          </h1>

          <p style="margin:0 0 20px;color:rgba(247,242,232,0.82);line-height:1.85;font-size:15px;font-weight:400;">
            ${c.intro(fullName, orderId)}
          </p>

          ${buildOrderProgressHtml(1, language)}
          ${shippingPauseHtml(language)}

          <div style="padding:16px 18px;border-radius:18px;background:rgba(255,255,255,0.025);border:1px solid rgba(220,181,107,0.11);margin-bottom:20px;">
            <div style="color:#edcf88;font-size:14px;font-weight:600;margin-bottom:8px;">${c.summary}</div>
            <div style="color:rgba(247,242,232,0.68);line-height:1.8;font-size:14px;font-weight:400;">${c.orderId}: ${escapeHtml(orderId)}</div>
            <div style="color:rgba(247,242,232,0.68);line-height:1.8;font-size:14px;font-weight:400;">${c.customer}: ${escapeHtml(fullName)}</div>
            <div style="color:rgba(247,242,232,0.68);line-height:1.8;font-size:14px;font-weight:400;">${c.city}: ${escapeHtml(city)}</div>
            <div style="color:rgba(247,242,232,0.68);line-height:1.8;font-size:14px;font-weight:400;">${c.address}: ${escapeHtml(address)}</div>
            ${note ? `<div style="color:rgba(247,242,232,0.68);line-height:1.8;font-size:14px;font-weight:400;">${c.note}: ${escapeHtml(note)}</div>` : ""}
          </div>

          <table style="width:100%;border-collapse:collapse;border-spacing:0;margin-bottom:22px;background:rgba(255,255,255,0.018);border-radius:18px;overflow:hidden;">
            <thead>
              <tr>
                <th style="text-align:left;padding:12px;border-bottom:1px solid #2c2c2c;color:#edcf88;font-size:12px;font-weight:600;">${c.fragrance}</th>
                <th style="text-align:left;padding:12px;border-bottom:1px solid #2c2c2c;color:#edcf88;font-size:12px;font-weight:600;">${c.size}</th>
                <th style="text-align:left;padding:12px;border-bottom:1px solid #2c2c2c;color:#edcf88;font-size:12px;font-weight:600;">${c.qty}</th>
                <th style="text-align:left;padding:12px;border-bottom:1px solid #2c2c2c;color:#edcf88;font-size:12px;font-weight:600;">${c.price}</th>
                <th style="text-align:left;padding:12px;border-bottom:1px solid #2c2c2c;color:#edcf88;font-size:12px;font-weight:600;">${c.total}</th>
              </tr>
            </thead>
            <tbody>
              ${buildItemsHtml(items)}
            </tbody>
          </table>

          <div style="padding:18px;border-radius:18px;background:rgba(255,255,255,0.025);border:1px solid rgba(220,181,107,0.11);">
            <div style="display:flex;justify-content:space-between;gap:10px;margin-bottom:10px;color:rgba(247,242,232,0.72);font-weight:400;">
              <span>${c.subtotal}</span>
              <span>${formatPrice(subtotal)}</span>
            </div>
            <div style="display:flex;justify-content:space-between;gap:10px;margin-bottom:10px;color:rgba(247,242,232,0.72);font-weight:400;">
              <span>${c.shipping}</span>
              <span>${shipping === 0 ? c.free : formatPrice(shipping)}</span>
            </div>
            <div style="display:flex;justify-content:space-between;gap:10px;padding-top:12px;border-top:1px solid #2c2c2c;color:#edcf88;">
              <span style="font-weight:600;">${c.total}</span>
              <strong style="font-size:18px;color:#edcf88;font-weight:700;">${formatPrice(total)}</strong>
            </div>
          </div>

          <div style="margin-top:20px;padding:18px;border-radius:18px;background:rgba(255,255,255,0.020);border:1px solid rgba(220,181,107,0.10);">
            <div style="color:#edcf88;font-size:14px;font-weight:600;margin-bottom:8px;">${c.nextTitle}</div>
            <div style="color:rgba(247,242,232,0.76);line-height:1.85;font-size:14px;font-weight:400;">
              ${c.nextText}
            </div>
          </div>

          <p style="margin:20px 0 0;color:rgba(247,242,232,0.62);line-height:1.8;font-size:14px;font-weight:400;">
            ${c.payment}
          </p>

          ${buildRecommendationsHtml(recommendations, language)}
          ${buildEmailFooterHtml(language)}
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
  total,
  language = "sr",
  recommendations = []
}) {
  const c = getEmailCopy(language);

  const recommendationText = recommendations.length
    ? `

${c.recommendationsTitle}
${recommendations.map((item) =>
  `• ${item.shortName || item.name} — https://www.playniceshop.me/product/${item.slug}`
).join("\n")}

${c.explore}: https://www.playniceshop.me/shop`
    : "";

  return `PLAYNICE
Remember. PlayNice.

${c.title.toUpperCase()}

${language === "en"
  ? `${fullName}, thank you for choosing PlayNice.
Your order ${orderId} is safely with us. We’ll take care of the details and let you know as soon as it is ready for the courier.`
  : `${fullName}, hvala Vam što ste izabrali PlayNice.
Vaša porudžbina ${orderId} je uspešno primljena. Mi ćemo se pobrinuti za detalje i javiti Vam se čim bude spremna za kurira.`}

01 — ${c.progress[0]} ●
02 — ${c.progress[1]} ○
03 — ${c.progress[2]} ○

${shippingPauseText(language) ? `${shippingPauseText(language)}\n\n` : ""}${c.summary.toUpperCase()}
${c.orderId}: ${orderId}
${c.customer}: ${fullName}
${c.city}: ${city}
${c.address}: ${address}
${c.note}: ${note || (language === "en" ? "None" : "Nema")}

${language === "en" ? "ITEMS" : "STAVKE"}
${buildItemsText(items)}

${c.subtotal}: ${formatPrice(subtotal)}
${c.shipping}: ${shipping === 0 ? c.free : formatPrice(shipping)}
${c.total}: ${formatPrice(total)}

${c.nextTitle.toUpperCase()}
${c.nextText}

${c.payment}${recommendationText}

Instagram: https://www.instagram.com/playnice.me/
Le Journal: https://www.playniceshop.me/journal
${c.contact}: info@playniceshop.me

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
    const language = normalizeText(body.language) === "en" ? "en" : "sr";
    const items = sanitizeItems(body.items);
    const recommendations = sanitizeRecommendations(body.recommendations);

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
      orderSource: "website",
      language,
      recommendations
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
        subject: language === "en"
          ? `PlayNice Order Confirmation • ${orderId}`
          : `PlayNice potvrda porudžbine • ${orderId}`,
        html: customerEmailHtml({
          orderId,
          fullName,
          city,
          address,
          note,
          items,
          subtotal,
          shipping,
          total,
          language,
          recommendations
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
          total,
          language,
          recommendations
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