import { generateSocialDraft } from "../src/socialDraft.mjs";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const json = (res, status, body) => res.status(status).json(body);

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

async function requireAdmin(req) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!token) return { error: "Missing admin session.", status: 401 };
  const userRes = await supabaseFetch("/auth/v1/user", token);
  if (!userRes.ok) return { error: "Invalid admin session.", status: 401 };
  const user = await userRes.json();
  const adminRes = await supabaseFetch(`/rest/v1/admin_users?user_id=eq.${encodeURIComponent(user.id)}&select=user_id&limit=1`, token);
  const admins = adminRes.ok ? await adminRes.json() : [];
  if (!admins.length) return { error: "This account is not authorized.", status: 403 };
  return { token, user };
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

export default async function handler(req, res) {
  if (!SUPABASE_URL || !SUPABASE_KEY) return json(res, 500, { error: "Server configuration is incomplete." });
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });

  try {
    const auth = await requireAdmin(req);
    if (auth.error) return json(res, auth.status, { error: auth.error });

    const id = String(req.body?.id || "").trim();
    const action = String(req.body?.action || "save").trim();
    if (!id) return json(res, 400, { error: "Social event id is required." });
    if (!["save", "ready", "reopen"].includes(action)) return json(res, 400, { error: "Unsupported Social draft action." });

    const eventRes = await supabaseFetch(`/rest/v1/social_events?id=eq.${encodeURIComponent(id)}&select=*&limit=1`, auth.token);
    if (!eventRes.ok) return json(res, 400, { error: "Could not load Social event." });
    const [event] = await eventRes.json();
    if (!event) return json(res, 404, { error: "Social event not found." });
    if (["published", "cancelled"].includes(event.status)) return json(res, 409, { error: `Social event is ${event.status} and cannot be edited.` });

    const generated = generateSocialDraft(event);
    const captions = normalizeCaptions(req.body?.content || event.draft_content || generated);
    const draftContent = mergeDraft(generated, captions);
    const now = new Date().toISOString();

    const patch = action === "reopen"
      ? { status: "draft", draft_content: draftContent, approved_content: null, approved_by: null, approved_at: null }
      : action === "ready"
        ? { status: "ready", draft_content: draftContent, approved_content: draftContent, approved_by: auth.user.id, approved_at: now }
        : { status: event.status === "ready" ? "draft" : event.status, draft_content: draftContent, approved_content: event.status === "ready" ? null : event.approved_content, approved_by: event.status === "ready" ? null : event.approved_by, approved_at: event.status === "ready" ? null : event.approved_at };

    const updateRes = await supabaseFetch(`/rest/v1/social_events?id=eq.${encodeURIComponent(id)}`, auth.token, {
      method: "PATCH",
      body: JSON.stringify(patch),
    });
    if (!updateRes.ok) throw new Error(`Could not update Social draft (${updateRes.status}).`);
    const [updated] = await updateRes.json();

    await supabaseFetch("/rest/v1/social_audit_log", auth.token, {
      method: "POST",
      body: JSON.stringify({
        social_event_id: id,
        actor_id: auth.user.id,
        action: action === "ready" ? "draft_marked_ready" : action === "reopen" ? "draft_reopened" : "draft_saved",
        details: { previous_status: event.status, next_status: updated?.status || patch.status },
      }),
    });

    return json(res, 200, { ok: true, event: updated });
  } catch (error) {
    return json(res, 400, { error: error?.message || "Could not update Social draft." });
  }
}
