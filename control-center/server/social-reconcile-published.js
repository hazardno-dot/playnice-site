const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const json = (res, status, body) => res.status(status).json(body);

async function safeJson(response) {
  const text = await response.text();
  if (!text) return null;
  try { return JSON.parse(text); } catch { return null; }
}

async function supabaseFetch(path, token, init = {}) {
  return fetch(`${SUPABASE_URL}${path}`, {
    ...init,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(init.headers || {}),
    },
  });
}

async function requireAdmin(req) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!token) return { error: "Missing admin session.", status: 401 };
  const response = await supabaseFetch("/rest/v1/admin_users?select=user_id&limit=1", token);
  const rows = await safeJson(response);
  if (!response.ok || !Array.isArray(rows) || !rows[0]?.user_id) return { error: "This account is not authorized.", status: 403 };
  return { token, user: { id: rows[0].user_id } };
}

const ACTIONS = new Set([
  "test_instagram_feed_published",
  "test_instagram_story_published",
  "test_facebook_published",
]);

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });
  if (!SUPABASE_URL || !SUPABASE_KEY) return json(res, 500, { error: "Server configuration is incomplete." });

  try {
    const auth = await requireAdmin(req);
    if (auth.error) return json(res, auth.status, { error: auth.error });

    const eventsRes = await supabaseFetch("/rest/v1/social_events?select=id,status,published_at&status=in.(draft,ready,scheduled,cancelled)&limit=100", auth.token);
    const events = await safeJson(eventsRes);
    if (!eventsRes.ok || !Array.isArray(events)) throw new Error("Could not load active Social events.");

    let reconciled = 0;
    for (const event of events) {
      const auditRes = await supabaseFetch(
        `/rest/v1/social_audit_log?social_event_id=eq.${encodeURIComponent(event.id)}&select=action,created_at&order=created_at.asc&limit=100`,
        auth.token,
      );
      const rows = await safeJson(auditRes);
      if (!auditRes.ok || !Array.isArray(rows)) continue;

      const publishedRows = rows.filter((row) => ACTIONS.has(row.action));
      const channels = new Set(publishedRows.map((row) => row.action));
      if (channels.size !== ACTIONS.size) continue;

      const publishedAt = publishedRows.map((row) => row.created_at).filter(Boolean).sort().at(-1) || new Date().toISOString();
      const patchRes = await supabaseFetch(`/rest/v1/social_events?id=eq.${encodeURIComponent(event.id)}`, auth.token, {
        method: "PATCH",
        body: JSON.stringify({ status: "published", published_at: publishedAt, scheduled_for: null }),
      });
      if (!patchRes.ok) continue;

      await supabaseFetch("/rest/v1/social_audit_log", auth.token, {
        method: "POST",
        body: JSON.stringify({
          social_event_id: event.id,
          actor_id: auth.user.id,
          action: "social_event_reconciled_published",
          details: { previous_status: event.status, next_status: "published", published_at: publishedAt },
        }),
      });
      reconciled += 1;
    }

    return json(res, 200, { ok: true, reconciled });
  } catch (error) {
    return json(res, 400, { error: error?.message || "Could not reconcile Social publishing state." });
  }
}
