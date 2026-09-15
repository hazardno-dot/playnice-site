import { generateSocialDraft, validateSocialDraftMedia } from "../src/socialDraft.mjs";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const json = (res, status, body) => res.status(status).json(body);
const TRANSIENT_SUPABASE_STATUSES = new Set([502, 503, 504]);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function supabaseFetch(path, token, options = {}) {
  return fetch(`${SUPABASE_URL}${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(options.headers || {}),
    },
  });
}

async function safeJson(response) {
  const text = await response.text();
  if (!text) return null;
  try { return JSON.parse(text); } catch { return { message: text.slice(0, 180) }; }
}

async function fetchAdminUser(token) {
  let response = await supabaseFetch("/rest/v1/admin_users?select=user_id&limit=1", token);
  if (TRANSIENT_SUPABASE_STATUSES.has(response.status)) {
    await sleep(350);
    response = await supabaseFetch("/rest/v1/admin_users?select=user_id&limit=1", token);
  }
  return response;
}

async function requireAdmin(req) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!token) return { error: "Missing admin session.", status: 401 };

  const adminRes = await fetchAdminUser(token);
  const admins = await safeJson(adminRes);
  if (!adminRes.ok) {
    const detail = String(admins?.message || admins?.hint || admins?.details || "request rejected by Supabase").slice(0, 180);
    if (TRANSIENT_SUPABASE_STATUSES.has(adminRes.status)) {
      return { error: `Supabase is temporarily unavailable (${adminRes.status}: ${detail}). Please try again.`, status: 503 };
    }
    return { error: `Invalid admin session (Supabase ${adminRes.status}: ${detail}).`, status: 401 };
  }
  if (!Array.isArray(admins) || !admins.length || !admins[0]?.user_id) {
    return { error: "This account is not authorized.", status: 403 };
  }

  return { token, user: { id: admins[0].user_id } };
}

const CHANNELS = ["instagram_feed", "instagram_story", "facebook"];
function normalizeCaptions(value = {}) {
  const out = {};
  for (const channel of CHANNELS) {
    const caption = String(value?.[channel]?.caption ?? "").trim();
    if (caption.length > 2200) throw new Error(`${channel} caption exceeds 2200 characters.`);
    out[channel] = { caption };
  }
  return out;
}

function mergeDraft(generated, captions) {
  const next = { ...generated };
  for (const channel of CHANNELS) {
    next[channel] = {
      ...(generated[channel] || {}),
      caption: captions[channel].caption,
    };
  }
  return next;
}

function isTestEvent(event = {}) {
  const metadata = event.metadata && typeof event.metadata === "object" ? event.metadata : {};
  const sourceId = String(event.source_id || "");
  return metadata.test === true || metadata.replay === true || sourceId.includes("--shadow-test-") || sourceId.includes("--shadow-replay-");
}

const channelLabel = (channel) => ({
  instagram_feed: "Instagram Feed",
  instagram_story: "Instagram Story",
  facebook: "Facebook",
}[channel] || channel);

function normalizeScheduledFor(value) {
  const raw = String(value || "").trim();
  if (!raw) throw new Error("Choose a date and time before scheduling.");
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) throw new Error("Scheduled date/time is invalid.");
  if (date.getTime() <= Date.now()) throw new Error("Scheduled date/time must be in the future.");
  return date.toISOString();
}

async function probePublicImage(url) {
  let parsed;
  try { parsed = new URL(String(url || "")); } catch { return { ok: false, reason: "invalid URL" }; }
  if (parsed.protocol !== "https:") return { ok: false, reason: "asset must use HTTPS" };

  const request = async (method) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 7000);
    try {
      return await fetch(parsed.toString(), {
        method,
        redirect: "follow",
        signal: controller.signal,
        headers: method === "GET" ? { Range: "bytes=0-0" } : undefined,
      });
    } finally {
      clearTimeout(timer);
    }
  };

  try {
    let response = await request("HEAD");
    if (!response.ok || response.status === 405 || response.status === 501) response = await request("GET");
    if (!response.ok) return { ok: false, reason: `HTTP ${response.status}` };
    const contentType = String(response.headers.get("content-type") || "").toLowerCase();
    if (!contentType.startsWith("image/")) return { ok: false, reason: `unexpected content type ${contentType || "unknown"}` };
    return { ok: true, content_type: contentType };
  } catch (error) {
    return { ok: false, reason: error?.name === "AbortError" ? "request timed out" : String(error?.message || error) };
  }
}

function validateVisualApprovals(event, draftContent) {
  const metadata = event?.metadata && typeof event.metadata === "object" ? event.metadata : {};
  const approvals = metadata.social_media_approval && typeof metadata.social_media_approval === "object"
    ? metadata.social_media_approval
    : {};
  const missing = [];
  const verified = {};

  for (const channel of CHANNELS) {
    const src = String(draftContent?.[channel]?.media?.src || draftContent?.[channel]?.media?.url || "").trim();
    const approval = approvals?.[channel];
    const approved = Boolean(approval?.approved) && String(approval?.src || "").trim() === src;
    verified[channel] = approved;
    if (!approved) missing.push(channel);
  }

  if (missing.length) {
    throw new Error(`READY blocked: visual approval required for ${missing.map(channelLabel).join(", ")}. Review each channel asset and approve it before Mark ready.`);
  }
  return { ok: true, channels: verified };
}

async function validateReadyMedia(event, draftContent) {
  const selection = validateSocialDraftMedia(draftContent);
  if (!selection.ok) {
    throw new Error(`READY blocked: missing media for ${selection.blocking.map(channelLabel).join(", ")}.`);
  }

  const visualApproval = validateVisualApprovals(event, draftContent);
  const remote = {};
  for (const channel of CHANNELS) {
    const src = draftContent?.[channel]?.media?.src || draftContent?.[channel]?.media?.url || "";
    remote[channel] = await probePublicImage(src);
  }
  const failed = CHANNELS.filter((channel) => !remote[channel]?.ok);
  if (failed.length) {
    const details = failed.map((channel) => `${channelLabel(channel)} (${remote[channel].reason})`).join(", ");
    throw new Error(`READY blocked: media is not publicly usable for ${details}.`);
  }
  return { selection, visual_approval: visualApproval, remote };
}

export default async function handler(req, res) {
  if (!SUPABASE_URL || !SUPABASE_KEY) return json(res, 500, { error: "Server configuration is incomplete." });
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });

  try {
    const auth = await requireAdmin(req);
    if (auth.error) return json(res, auth.status, { error: auth.error });

    const id = String(req.body?.id || "").trim();
    const action = String(req.body?.action || "save").trim();
    if (!id) return json(res, 400, { error: "Social event id is required." });
    if (!["save", "ready", "reopen", "schedule", "unschedule", "discard_test"].includes(action)) return json(res, 400, { error: "Unsupported Social draft action." });

    const eventRes = await supabaseFetch(`/rest/v1/social_events?id=eq.${encodeURIComponent(id)}&select=*&limit=1`, auth.token);
    if (!eventRes.ok) return json(res, 400, { error: "Could not load Social event." });
    const [event] = await eventRes.json();
    if (!event) return json(res, 404, { error: "Social event not found." });

    if (action === "discard_test") {
      if (!isTestEvent(event)) return json(res, 409, { error: "Only explicit shadow test/replay events can be discarded." });
      const deleteRes = await supabaseFetch(`/rest/v1/social_events?id=eq.${encodeURIComponent(id)}`, auth.token, { method: "DELETE" });
      if (!deleteRes.ok) throw new Error(`Could not discard Social test event (${deleteRes.status}).`);
      return json(res, 200, { ok: true, discarded: true, id });
    }

    if (["published", "cancelled"].includes(event.status)) return json(res, 409, { error: `Social event is ${event.status} and cannot be edited.` });
    if (event.status === "scheduled" && action !== "unschedule") return json(res, 409, { error: "Scheduled events must be unscheduled before they can be changed." });
    if (action === "schedule" && event.status !== "ready") return json(res, 409, { error: "Only READY events can be scheduled." });
    if (action === "unschedule" && event.status !== "scheduled") return json(res, 409, { error: "Only scheduled events can be unscheduled." });

    const generated = generateSocialDraft(event);
    const captions = normalizeCaptions(req.body?.content || event.draft_content || event.approved_content || generated);
    const draftContent = mergeDraft(generated, captions);
    const now = new Date().toISOString();
    const mediaValidation = action === "ready" ? await validateReadyMedia(event, draftContent) : null;
    const scheduledFor = action === "schedule" ? normalizeScheduledFor(req.body?.scheduled_for) : null;

    const patch = action === "reopen"
      ? { status: "draft", scheduled_for: null, draft_content: draftContent, approved_content: null, approved_by: null, approved_at: null }
      : action === "ready"
        ? { status: "ready", scheduled_for: null, draft_content: draftContent, approved_content: draftContent, approved_by: auth.user.id, approved_at: now }
        : action === "schedule"
          ? { status: "scheduled", scheduled_for: scheduledFor, draft_content: event.draft_content || draftContent, approved_content: event.approved_content || draftContent }
          : action === "unschedule"
            ? { status: "ready", scheduled_for: null }
            : { status: event.status === "ready" ? "draft" : event.status, scheduled_for: null, draft_content: draftContent, approved_content: event.status === "ready" ? null : event.approved_content, approved_by: event.status === "ready" ? null : event.approved_by, approved_at: event.status === "ready" ? null : event.approved_at };

    const updateRes = await supabaseFetch(`/rest/v1/social_events?id=eq.${encodeURIComponent(id)}`, auth.token, {
      method: "PATCH",
      body: JSON.stringify(patch),
    });
    if (!updateRes.ok) throw new Error(`Could not update Social draft (${updateRes.status}).`);
    const [updated] = await updateRes.json();

    const auditAction = action === "ready"
      ? "draft_marked_ready"
      : action === "reopen"
        ? "draft_reopened"
        : action === "schedule"
          ? "draft_scheduled"
          : action === "unschedule"
            ? "draft_unscheduled"
            : "draft_saved";

    await supabaseFetch("/rest/v1/social_audit_log", auth.token, {
      method: "POST",
      body: JSON.stringify({
        social_event_id: id,
        actor_id: auth.user.id,
        action: auditAction,
        details: {
          previous_status: event.status,
          next_status: updated?.status || patch.status,
          ...(scheduledFor ? { scheduled_for: scheduledFor } : {}),
          ...(action === "unschedule" && event.scheduled_for ? { previous_scheduled_for: event.scheduled_for } : {}),
          ...(mediaValidation ? {
            media_validation: {
              fallback_channels: mediaValidation.selection.fallback,
              visual_approval_verified: mediaValidation.visual_approval.ok,
              public_media_verified: true,
            },
          } : {}),
        },
      }),
    });

    return json(res, 200, { ok: true, event: updated, media_validation: mediaValidation });
  } catch (error) {
    return json(res, 400, { error: error?.message || "Could not update Social draft." });
  }
}
