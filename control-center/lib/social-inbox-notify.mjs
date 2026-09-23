import { supabaseRestHeaders } from "./supabase-server-auth.mjs";
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const SUPABASE_SECRET_KEY = String(process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
const TELEGRAM_BOT_TOKEN = String(process.env.TELEGRAM_BOT_TOKEN || "").trim();
const TELEGRAM_CHAT_ID = String(process.env.TELEGRAM_CHAT_ID || "").trim();

async function safeJson(response) {
  const text = await response.text();
  if (!text) return null;
  try { return JSON.parse(text); } catch { return { message: text.slice(0, 300) }; }
}

async function supabaseFetch(path, token, init = {}) {
  return fetch(`${SUPABASE_URL}${path}`, {
    ...init,
    headers: supabaseRestHeaders({
      token,
      publishableKey: SUPABASE_KEY,
      serverKey: SUPABASE_SECRET_KEY,
      extra: init.headers || {},
    }),
  });
}

const clip = (value, max) => {
  const text = String(value || "").trim();
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
};

export function telegramAssistantState() {
  return {
    configured: Boolean(TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID),
    bot_token: Boolean(TELEGRAM_BOT_TOKEN),
    chat_id: Boolean(TELEGRAM_CHAT_ID),
  };
}

function notificationText(draft, baseUrl) {
  const ready = draft?.status === "ready" && String(draft?.body || "").trim();
  const customer = String(draft?.participant_name || "Facebook customer").trim();
  const source = clip(draft?.customer_message || "", 320) || "[media / no text]";
  const reply = ready ? clip(draft.body, 650) : "";

  const lines = [
    ready ? "📩 PLAYNICE · ODGOVOR JE SPREMAN" : "⚠️ PLAYNICE · PORUKA TRAŽI PREGLED",
    "",
    customer,
    `Kupac: ${source}`,
  ];

  if (ready) lines.push("", `Predlog:\n${reply}`);
  else lines.push("", `Razlog: ${clip(draft?.reason || "Assistant nije mogao bezbedno da pripremi odgovor.", 260)}`);

  if (baseUrl && draft?.thread_id) {
    lines.push("", `Otvori Inbox: ${baseUrl.replace(/\/$/, "")}/?inbox=${encodeURIComponent(draft.thread_id)}`);
  }

  lines.push("", "Ništa nije poslato kupcu. Approve & Send ostaje obavezan.");
  return lines.join("\n");
}

async function patchDraft(token, draftId, patch) {
  if (!draftId) return null;
  const response = await supabaseFetch(
    `/rest/v1/social_inbox_drafts?id=eq.${encodeURIComponent(draftId)}`,
    token,
    {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify(patch),
    }
  );
  const payload = await safeJson(response);
  if (!response.ok) throw new Error(`Could not update Assistant notification state (Supabase ${response.status}).`);
  return Array.isArray(payload) ? payload[0] || null : payload;
}

async function claimDraftNotification(token, draftId) {
  if (!draftId) return null;
  const claimedAt = new Date().toISOString();
  const response = await supabaseFetch(
    `/rest/v1/social_inbox_drafts?id=eq.${encodeURIComponent(draftId)}&notified_at=is.null&status=in.(ready,needs_review)`,
    token,
    {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({ notified_at: claimedAt, notification_error: null }),
    }
  );
  const payload = await safeJson(response);
  if (!response.ok) throw new Error(`Could not claim Assistant notification (Supabase ${response.status}).`);
  const row = Array.isArray(payload) ? payload[0] || null : payload;
  return row ? { ...row, notified_at: claimedAt } : null;
}

export async function detectAssistantTelegramChats() {
  const state = telegramAssistantState();
  if (!state.bot_token) {
    return { ok: false, configured: false, chats: [], error: "TELEGRAM_BOT_TOKEN is not configured." };
  }

  const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates?limit=50&timeout=0`);
  const payload = await safeJson(response);
  if (!response.ok || !payload?.ok) {
    return {
      ok: false,
      configured: state.configured,
      chats: [],
      error: payload?.description || `Telegram getUpdates returned HTTP ${response.status}`,
    };
  }

  const byId = new Map();
  for (const update of Array.isArray(payload?.result) ? payload.result : []) {
    const chat = update?.message?.chat || update?.edited_message?.chat || update?.callback_query?.message?.chat || null;
    if (!chat?.id) continue;
    const id = String(chat.id);
    byId.set(id, {
      id,
      type: String(chat.type || ""),
      name: [chat.first_name, chat.last_name].filter(Boolean).join(" ").trim() || chat.title || "",
      username: chat.username ? `@${chat.username}` : "",
    });
  }

  const chats = [...byId.values()]
    .sort((a, b) => (a.type === "private" ? -1 : 1) - (b.type === "private" ? -1 : 1))
    .slice(0, 10);

  return {
    ok: true,
    configured: state.configured,
    chats,
    hint: chats.length
      ? "Use the ID for your personal/private chat with the PlayNice bot."
      : "Open the PlayNice bot in Telegram, press Start or send 'test', then detect again.",
  };
}

export async function sendAssistantTelegramTest({ baseUrl = "" } = {}) {
  const state = telegramAssistantState();
  if (!state.configured) {
    return { ok: false, configured: false, error: "Telegram is not configured for Control Center." };
  }

  const meResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe`);
  const mePayload = await safeJson(meResponse);
  if (!meResponse.ok || !mePayload?.ok) {
    return {
      ok: false,
      configured: true,
      error: mePayload?.description || `Telegram getMe returned HTTP ${meResponse.status}`,
    };
  }
  if (String(mePayload?.result?.id || "") === TELEGRAM_CHAT_ID) {
    return {
      ok: false,
      configured: true,
      error: "TELEGRAM_CHAT_ID is the bot's own ID. Use the chat ID of your personal Telegram conversation with the bot.",
    };
  }

  const lines = [
    "✅ PLAYNICE · ASSISTANT V2",
    "",
    "Telegram obavještenja su povezana i spremna.",
    "Kada stigne nova Facebook poruka, ovdje će stići kupčeva poruka i pripremljen odgovor.",
    "",
    "Ništa se ne šalje kupcu automatski."
  ];
  if (baseUrl) lines.push("", `Control Center: ${baseUrl.replace(/\/$/, "")}/?inbox=latest`);

  const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: lines.join("\n"),
      disable_web_page_preview: true,
    }),
  });
  const payload = await safeJson(response);
  if (!response.ok || !payload?.ok) {
    return {
      ok: false,
      configured: true,
      error: payload?.description || `Telegram returned HTTP ${response.status}`,
    };
  }

  return { ok: true, configured: true };
}

export async function notifyAssistantDrafts(token, drafts, { baseUrl = "", enabled = true } = {}) {
  const state = telegramAssistantState();
  const rows = (Array.isArray(drafts) ? drafts : []).filter((draft) => draft?.id && !draft?.notified_at);

  if (!enabled || !rows.length) {
    return { configured: state.configured, sent: 0, failed: 0, skipped: rows.length };
  }
  if (!state.configured) {
    return { configured: false, sent: 0, failed: 0, skipped: rows.length };
  }

  let sent = 0;
  let failed = 0;
  let skipped = 0;
  const errors = [];

  for (const draft of rows) {
    let claimed = null;
    try {
      claimed = await claimDraftNotification(token, draft.id);
      if (!claimed) {
        skipped += 1;
        continue;
      }

      const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: notificationText(draft, baseUrl),
          disable_web_page_preview: true,
        }),
      });
      const payload = await safeJson(response);
      if (!response.ok || !payload?.ok) {
        throw new Error(payload?.description || `Telegram returned HTTP ${response.status}`);
      }

      sent += 1;
    } catch (error) {
      failed += 1;
      const message = String(error?.message || error).slice(0, 260);
      errors.push({ draft_id: draft.id, error: message });
      if (claimed) {
        await patchDraft(token, draft.id, {
          notified_at: null,
          notification_error: message,
        }).catch(() => {});
      }
    }
  }

  return { configured: true, sent, failed, skipped, errors };
}
