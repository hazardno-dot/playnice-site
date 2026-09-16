import { normalizeSocialEvent, socialEventDedupeKey } from "../src/socialEvent.mjs";

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

export default async function handler(req, res) {
  if (!SUPABASE_URL || !SUPABASE_KEY) return json(res, 500, { error: "Server configuration is incomplete." });
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });

  try {
    const auth = await requireAdmin(req);
    if (auth.error) return json(res, auth.status, { error: auth.error });

    const event = normalizeSocialEvent(req.body || {});
    const dedupeKey = socialEventDedupeKey(event);
    const existingRes = await supabaseFetch(`/rest/v1/social_events?event_type=eq.${encodeURIComponent(event.event_type)}&source_type=eq.${encodeURIComponent(event.source_type)}&source_id=eq.${encodeURIComponent(event.source_id)}&select=*&limit=1`, auth.token);
    const existing = existingRes.ok ? await existingRes.json() : [];
    if (existing.length) return json(res, 200, { ok: true, created: false, dedupe_key: dedupeKey, event: existing[0] });

    const createRes = await supabaseFetch("/rest/v1/social_events", auth.token, {
      method: "POST",
      body: JSON.stringify({ ...event, created_by: auth.user.id }),
    });
    if (!createRes.ok) throw new Error(`Could not create social event (${createRes.status}).`);
    const [created] = await createRes.json();

    await supabaseFetch("/rest/v1/social_audit_log", auth.token, {
      method: "POST",
      body: JSON.stringify({
        social_event_id: created.id,
        actor_id: auth.user.id,
        action: "shadow_event_created",
        details: { dedupe_key: dedupeKey, publish_mode: "shadow" },
      }),
    });

    return json(res, 201, { ok: true, created: true, dedupe_key: dedupeKey, event: created });
  } catch (error) {
    return json(res, 400, { error: error?.message || "Could not create social event." });
  }
}
