const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

// Shared production asset used across PlayNice customer emails.

const SUPABASE_URL =
  process.env.SUPABASE_URL || "https://fsujznyfdrstinqexxgs.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY ||
  "sb_publishable_XzvxcEV7Cye44oF4bRWxtQ_VUq9gcNN";

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

async function authenticateAdmin(req) {
  const authHeader = String(req.headers.authorization || "");
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!token) return false;

  const userResponse = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${token}`
    }
  });

  if (!userResponse.ok) return false;
  const user = await userResponse.json();
  if (!user?.id) return false;

  const adminResponse = await fetch(
    `${SUPABASE_URL}/rest/v1/admin_users?user_id=eq.${encodeURIComponent(user.id)}&select=user_id&limit=1`,
    {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${token}`
      }
    }
  );

  if (!adminResponse.ok) return false;
  const admins = await adminResponse.json();
  return Array.isArray(admins) && admins.length > 0;
}

function getCopy(language = "sr") {
  return language === "en"
    ? {
        kicker: "ORDER UPDATE",
        title: "Your order is ready to ship",
        salutation: (fullName) => "Dear " + escapeHtml(fullName) + ",",
        intro: () => "Your PlayNice order has been packed and is ready to ship.",
        detail:
          "It is currently waiting to be collected by the courier. Once the shipment has been collected, we’ll update you with the next status.",
        thanks: "Thank you for choosing PlayNice.",
        progress: ["ORDER RECEIVED", "PREPARING", "WITH COURIER"],
        orderId: "Order ID",
        explore: "Explore PlayNice",
        contact: "Contact"
      }
    : {
        kicker: "STATUS PORUDŽBINE",
        title: "Vaša porudžbina je spremna za slanje",
        salutation: (fullName) => "Poštovani " + escapeHtml(fullName) + ",",
        intro: () => "Vaša PlayNice porudžbina je spakovana i spremna za slanje.",
        detail:
          "Trenutno čeka preuzimanje od strane kurirske službe. Kada pošiljka bude preuzeta, obavestićemo Vas o sledećem statusu.",
        thanks: "Hvala Vam što ste izabrali PlayNice.",
        progress: ["PORUDŽBINA PRIMLJENA", "PRIPREMA", "KOD KURIRA"],
        orderId: "Broj porudžbine",
        explore: "Istražite PlayNice",
        contact: "Kontakt"
      };
}

function buildOrderProgressHtml(language = "sr") {
  const c = getCopy(language);
  const activeStep = 2;

  return `
    <div style="margin:0 0 20px;padding:12px 14px;border-radius:16px;background:rgba(255,255,255,0.025);border:1px solid rgba(220,181,107,0.13);">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;table-layout:fixed;">
        <tr>
          ${c.progress.map((label, index) => {
            const stepNumber = index + 1;
            const isDone = stepNumber < activeStep;
            const isActive = stepNumber === activeStep;
            const marker = isDone ? "✓" : isActive ? "●" : "○";
            const color = isDone || isActive
              ? "#9fcf9a"
              : "rgba(247,242,232,0.38)";

            return `
              <td width="33.33%" valign="middle" style="padding:${index === 0 ? "0 8px 0 0" : index === 2 ? "0 0 0 8px" : "0 8px"};${index > 0 ? "border-left:1px solid rgba(220,181,107,0.10);" : ""}">
                <div style="font-size:10px;line-height:1.35;letter-spacing:.07em;color:${color};white-space:normal;">
                  <span style="font-weight:700;">0${stepNumber} ${marker}</span>
                  <span style="margin-left:4px;">${label}</span>
                </div>
              </td>
            `;
          }).join("")}
        </tr>
      </table>
    </div>
  `;
}

function buildFooterHtml(language = "sr") {
  const c = getCopy(language);

  return `
    <div style="margin-top:22px;text-align:center;">
      <a href="https://www.playniceshop.me/shop"
         style="display:inline-block;padding:12px 20px;border-radius:999px;background:#121212;border:1px solid rgba(226,190,112,0.40);color:#edcf88;text-decoration:none;font-size:13px;font-weight:700;letter-spacing:.04em;">
        ${c.explore} →
      </a>

      <div style="margin-top:18px;font-size:12px;color:rgba(247,242,232,0.52);">
        <a href="https://www.instagram.com/playnice.me/" style="color:rgba(247,242,232,0.66);text-decoration:none;">Instagram</a>
        <span style="padding:0 8px;color:rgba(220,181,107,0.30);">·</span>
        <a href="https://www.playniceshop.me/journal" style="color:rgba(247,242,232,0.66);text-decoration:none;">Le Journal</a>
        <span style="padding:0 8px;color:rgba(220,181,107,0.30);">·</span>
        <a href="mailto:info@playniceshop.me" style="color:rgba(247,242,232,0.66);text-decoration:none;">${c.contact}</a>
      </div>

      <div style="margin-top:18px;color:#edcf88;font-size:12px;font-weight:600;letter-spacing:.04em;">
        Remember. PlayNice.
      </div>
    </div>
  `;
}

function packedEmailHtml({ orderId, fullName, language = "sr" }) {
  const c = getCopy(language);

  return `
  <div style="margin:0;padding:0;background:#0b0b0b;font-family:Inter,Arial,sans-serif;color:#f7f2e8;">
    <div style="max-width:720px;margin:0 auto;padding:32px 20px;">
      <div style="background:linear-gradient(180deg,#171717,#0f0f0f);border:1px solid rgba(220,181,107,0.22);border-radius:24px;overflow:hidden;box-shadow:0 24px 60px rgba(0,0,0,0.28);">
        <div style="padding:24px 28px 18px;border-bottom:1px solid rgba(220,181,107,0.14);">
          <img src="https://www.playniceshop.me/playnice-header-logo.svg" width="190" alt="PlayNice Premium Fragrance House" style="display:block;width:190px;max-width:100%;height:auto;border:0;outline:none;text-decoration:none;">
          <div style="color:rgba(247,242,232,0.58);font-size:12px;margin-top:8px;">Remember. PlayNice.</div>
        </div>

        <div style="padding:28px;">
          <div style="font-size:11px;letter-spacing:.18em;font-weight:600;color:rgba(247,242,232,0.52);margin-bottom:10px;">
            ${c.kicker}
          </div>

          <h1 style="margin:0 0 14px;font-family:Georgia,serif;font-size:36px;line-height:1.04;color:#edcf88;font-weight:600;">
            ${c.title}
          </h1>

          <p style="margin:0 0 8px;color:#f7f2e8;line-height:1.7;font-size:15px;font-weight:600;">
            ${c.salutation(fullName)}
          </p>
          <p style="margin:0 0 12px;color:rgba(247,242,232,0.82);line-height:1.85;font-size:15px;font-weight:400;">
            ${c.intro(fullName)}
          </p>

          <p style="margin:0 0 20px;color:rgba(247,242,232,0.72);line-height:1.85;font-size:15px;font-weight:400;">
            ${c.detail}
          </p>

          ${buildOrderProgressHtml(language)}

          <div style="padding:16px 18px;border-radius:18px;background:rgba(255,255,255,0.025);border:1px solid rgba(220,181,107,0.11);">
            <div style="color:#edcf88;font-size:14px;font-weight:600;margin-bottom:8px;">${c.orderId}</div>
            <div style="color:rgba(247,242,232,0.72);line-height:1.8;font-size:14px;font-weight:400;">
              ${escapeHtml(orderId)}
            </div>
          </div>

          <p style="margin:20px 0 0;color:rgba(247,242,232,0.72);line-height:1.8;font-size:14px;">
            ${c.thanks}
          </p>

          ${buildFooterHtml(language)}
        </div>
      </div>
    </div>
  </div>
  `;
}

function packedEmailText({ orderId, fullName, language = "sr" }) {
  const c = getCopy(language);

  return language === "en"
    ? `PLAYNICE
Remember. PlayNice.

YOUR ORDER IS READY TO SHIP

Hello ${fullName},

Your PlayNice order has been packed and is ready to ship.

It is currently waiting to be collected by the courier. Once the shipment has been collected, we’ll update you with the next status.

01 — ${c.progress[0]} ✓
02 — ${c.progress[1]} ●
03 — ${c.progress[2]} ○

${c.orderId}: ${orderId}

Thank you for choosing PlayNice.

Remember. PlayNice.`
    : `PLAYNICE
Remember. PlayNice.

PORUDŽBINA JE SPREMNA ZA SLANJE

Zdravo ${fullName},

Vaša PlayNice porudžbina je spakovana i spremna za slanje.

Trenutno čeka preuzimanje od strane kurirske službe. Kada pošiljka bude preuzeta, obavestićemo Vas o sledećem statusu.

01 — ${c.progress[0]} ✓
02 — ${c.progress[1]} ●
03 — ${c.progress[2]} ○

${c.orderId}: ${orderId}

Hvala Vam što ste izabrali PlayNice.

Remember. PlayNice.`;
}

module.exports = async function handler(req, res) {
  res.setHeader("Allow", ["POST"]);

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  if (!process.env.RESEND_API_KEY) {
    return res.status(500).json({ ok: false, error: "Email service is not configured" });
  }

  if (!(await authenticateAdmin(req))) {
    return res.status(401).json({ ok: false, error: "Admin authentication required" });
  }

  try {
    const body = req.body || {};
    const orderId = normalizeText(body.orderId);
    const fullName = normalizeText(body.fullName);
    const email = normalizeText(body.email).toLowerCase();
    const language = normalizeText(body.language) === "en" ? "en" : "sr";
    const status = normalizeText(body.status).toUpperCase();

    if (status !== "PACKED") {
      return res.status(400).json({ ok: false, error: "Unsupported order status email" });
    }

    if (!orderId || !fullName || !isValidEmail(email)) {
      return res.status(400).json({ ok: false, error: "Missing or invalid customer email data" });
    }

    const fromEmail = process.env.RESEND_FROM_EMAIL || "noreply@playniceshop.me";

    const result = await resend.emails.send({
      from: `PlayNice <${fromEmail}>`,
      to: email,
      replyTo: "info@playniceshop.me",
      subject: language === "en"
        ? `Your PlayNice order is ready to ship • ${orderId}`
        : `Vaša PlayNice porudžbina je spremna za slanje • ${orderId}`,
      html: packedEmailHtml({ orderId, fullName, language }),
      text: packedEmailText({ orderId, fullName, language })
    });

    return res.status(200).json({
      ok: true,
      status: "PACKED",
      messageId: result?.data?.id || null
    });
  } catch (error) {
    console.error("Packed status email failed:", error);
    return res.status(500).json({
      ok: false,
      error: error?.message || "Failed to send packed status email"
    });
  }
};
