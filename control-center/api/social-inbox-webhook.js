import { createHmac, timingSafeEqual } from "node:crypto";
import { resolveMetaPageAccessToken } from "../lib/meta-page-token.mjs";
import { syncPlatform } from "./social-inbox-sync.js";
import { prepareAssistantDrafts } from "../lib/social-inbox-assistant.mjs";
import { notifyAssistantDrafts } from "../lib/social-inbox-notify.mjs";

const SUPABASE_URL = String(process.env.VITE_SUPABASE_URL || "").trim();
const SUPABASE_SECRET_KEY = String(process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
const META_APP_SECRET = String(process.env.META_APP_SECRET || "").trim();
const META_FACEBOOK_PAGE_ID = String(process.env.META_FACEBOOK_PAGE_ID || "").trim();

const json = (res, status, body) => res.status(status).json(body);

function webhookToken() {
  if (!META_APP_SECRET || !META_FACEBOOK_PAGE_ID) return "";
  return createHmac("sha256", META_APP_SECRET)
    .update(`playnice-social-inbox-v2:${META_FACEBOOK_PAGE_ID}`)
    .digest("hex");
}

function secureEqual(left, right) {
  const a = Buffer.from(String(left || ""));
  const b = Buffer.from(String(right || ""));
  return a.length === b.length && a.length > 0 && timingSafeEqual(a, b);
}

async function recordWebhookState(patch = {}) {
  if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) return;
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/social_inbox_webhook_state?on_conflict=platform`,
      {
        method: "POST",
        headers: {
          apikey: SUPABASE_SECRET_KEY,
          Authorization: `Bearer ${SUPABASE_SECRET_KEY}`,
          "Content-Type": "application/json",
          Prefer: "resolution=merge-duplicates,return=minimal",
        },
        body: JSON.stringify({
          platform: "facebook",
          updated_at: new Date().toISOString(),
          ...patch,
        }),
      }
    );
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn("[social-inbox-webhook-heartbeat]", response.status, detail.slice(0, 240));
    }
  } catch (error) {
    console.warn("[social-inbox-webhook-heartbeat]", String(error?.message || error).slice(0, 240));
  }
}

function requestBaseUrl(req) {
  const configured = String(process.env.PLAYNICE_CONTROL_CENTER_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL || "").trim();
  if (configured) return configured.startsWith("http") ? configured.replace(/\/$/, "") : `https://${configured.replace(/\/$/, "")}`;
  const host = String(req.headers["x-forwarded-host"] || req.headers.host || "").trim();
  const proto = String(req.headers["x-forwarded-proto"] || "https").split(",")[0].trim();
  return host ? `${proto}://${host}` : "";
}

function inboundSenderIds(body) {
  if (body?.object !== "page") return [];
  const ids = [];
  for (const entry of Array.isArray(body?.entry) ? body.entry : []) {
    if (META_FACEBOOK_PAGE_ID && String(entry?.id || "") !== META_FACEBOOK_PAGE_ID) continue;
    for (const event of Array.isArray(entry?.messaging) ? entry.messaging : []) {
      const sender = String(event?.sender?.id || "").trim();
      const recipient = String(event?.recipient?.id || "").trim();
      const isEcho = Boolean(event?.message?.is_echo);
      if (sender && recipient === META_FACEBOOK_PAGE_ID && !isEcho) ids.push(sender);
    }
  }
  return [...new Set(ids)].slice(0, 8);
}

export default async function handler(req, res) {
  const expected = webhookToken();

  if (req.method === "GET") {
    const mode = String(req.query?.["hub.mode"] || "");
    const challenge = String(req.query?.["hub.challenge"] || "");
    const verifyToken = String(req.query?.["hub.verify_token"] || "");
    const callbackKey = String(req.query?.k || "");

    if (
      mode === "subscribe" &&
      challenge &&
      expected &&
      secureEqual(verifyToken, expected) &&
      secureEqual(callbackKey, expected)
    ) {
      res.status(200).send(challenge);
      return;
    }
    return res.status(403).send("Forbidden");
  }

  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });
  if (!expected || !SUPABASE_SECRET_KEY) {
    return json(res, 503, { ok: false, accepted: false, error: "Webhook server configuration is incomplete." });
  }

  const callbackKey = String(req.query?.k || "");
  if (!secureEqual(callbackKey, expected)) return json(res, 401, { ok: false, accepted: false });

  const senderIds = inboundSenderIds(req.body);
  const entryCount = Array.isArray(req.body?.entry) ? req.body.entry.length : 0;
  await recordWebhookState({
    last_received_at: new Date().toISOString(),
    last_event_object: String(req.body?.object || "").slice(0, 80),
    last_entry_count: entryCount,
    last_sender_count: senderIds.length,
    last_processed: 0,
    last_reason: senderIds.length ? "received" : "no_inbound_message",
    last_error: null,
  });
  if (!senderIds.length) return json(res, 200, { ok: true, accepted: true, processed: 0, reason: "no_inbound_message" });

  try {
    const resolved = await resolveMetaPageAccessToken();
    const threadIds = new Set();
    const syncResults = [];
    let targetedFailed = false;

    for (const participantId of senderIds) {
      try {
        const result = await syncPlatform("facebook", resolved.token, SUPABASE_SECRET_KEY, { participantId });
        syncResults.push({ participant_id: participantId, ...result });
        for (const id of result?.thread_ids || []) threadIds.add(id);
        if (!result?.conversations) targetedFailed = true;
      } catch (error) {
        targetedFailed = true;
        syncResults.push({
          participant_id: participantId,
          error: String(error?.message || error).slice(0, 220),
        });
      }
    }

    if (targetedFailed || !threadIds.size) {
      const fallback = await syncPlatform("facebook", resolved.token, SUPABASE_SECRET_KEY);
      syncResults.push({ fallback_full_sync: true, ...fallback });
      for (const id of fallback?.thread_ids || []) threadIds.add(id);
    }

    const assistant = await prepareAssistantDrafts(SUPABASE_SECRET_KEY, {
      threadIds: [...threadIds],
      limit: Math.max(8, threadIds.size + 2),
    });

    const notifications = await notifyAssistantDrafts(
      SUPABASE_SECRET_KEY,
      assistant.notification_candidates,
      {
        baseUrl: requestBaseUrl(req),
        enabled: process.env.VERCEL_ENV === "production",
      }
    );

    await recordWebhookState({
      last_sender_count: senderIds.length,
      last_processed: senderIds.length,
      last_reason: "processed",
      last_error: null,
    });

    return json(res, 200, {
      ok: true,
      accepted: true,
      processed: senderIds.length,
      sync: syncResults,
      assistant: {
        created: assistant.created.length,
        skipped: assistant.skipped.length,
        auto_send: false,
      },
      notifications,
    });
  } catch (error) {
    console.error("[social-inbox-webhook]", error);
    await recordWebhookState({
      last_sender_count: senderIds.length,
      last_processed: 0,
      last_reason: "error",
      last_error: String(error?.message || error).slice(0, 300),
    });
    // Acknowledge a valid Meta webhook to avoid a retry storm. Manual Sync now remains the recovery path.
    return json(res, 200, {
      ok: false,
      accepted: true,
      processed: senderIds.length,
      auto_send: false,
      error: String(error?.message || error).slice(0, 300),
    });
  }
}
