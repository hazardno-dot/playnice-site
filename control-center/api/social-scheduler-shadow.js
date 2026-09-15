import { buildShadowExecution, retryPlan } from "../src/socialScheduler.mjs";

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

async function writeAudit(token, userId, eventId, action, details) {
  const response = await supabaseFetch("/rest/v1/social_audit_log", token, {
    method: "POST",
    body: JSON.stringify({ social_event_id: eventId, actor_id: userId, action, details }),
  });
  return response.ok;
}

async function patchClaimedEvent(token, event, patch) {
  const tokenFilter = encodeURIComponent(event.execution_token || "");
  const response = await supabaseFetch(`/rest/v1/social_events?id=eq.${encodeURIComponent(event.id)}&execution_token=eq.${tokenFilter}&select=*`, token, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
  if (!response.ok) throw new Error(`Could not finalize scheduler lease (${response.status}).`);
  const rows = await response.json();
  if (!rows.length) throw new Error("Scheduler lease was lost before finalization.");
  return rows[0];
}

export default async function handler(req, res) {
  if (!SUPABASE_URL || !SUPABASE_KEY) return json(res, 500, { error: "Server configuration is incomplete." });
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });

  const auth = await requireAdmin(req);
  if (auth.error) return json(res, auth.status, { error: auth.error });

  const now = new Date();
  let claimed = null;
  try {
    const claimRes = await supabaseFetch("/rest/v1/rpc/claim_due_social_event", auth.token, {
      method: "POST",
      body: JSON.stringify({ p_now: now.toISOString(), p_lease_seconds: 120, p_publish_mode: "shadow" }),
    });
    if (!claimRes.ok) {
      const detail = await claimRes.text().catch(() => "");
      return json(res, 400, { error: `Could not claim due Social event (${claimRes.status}).`, detail });
    }
    const rows = await claimRes.json();
    claimed = rows?.[0] || null;
    if (!claimed) return json(res, 200, { ok: true, executed: false, reason: "no_due_shadow_event" });

    const execution = buildShadowExecution(claimed, now);
    const updated = await patchClaimedEvent(auth.token, claimed, {
      shadow_executed_at: execution.executed_at,
      execution_token: null,
      execution_lease_until: null,
      next_retry_at: null,
      retry_count: 0,
      last_error: null,
    });

    const auditOk = await writeAudit(auth.token, auth.user.id, claimed.id, "scheduler_shadow_executed", {
      idempotency_key: execution.idempotency_key,
      scheduled_for: execution.scheduled_for,
      executed_at: execution.executed_at,
      channels: execution.channels.map(({ channel, action }) => ({ channel, action })),
      network_requested: false,
      meta_publish_requested: false,
    });

    return json(res, 200, {
      ok: true,
      executed: true,
      mode: "shadow",
      event: updated,
      execution,
      audit_warning: auditOk ? null : "Shadow execution completed but audit insert failed.",
    });
  } catch (error) {
    if (!claimed?.id || !claimed?.execution_token) return json(res, 400, { error: error?.message || "Shadow scheduler failed." });

    const plan = retryPlan(claimed.retry_count, now);
    const message = error?.message || "Shadow scheduler failed.";
    let updated = null;
    try {
      updated = await patchClaimedEvent(auth.token, claimed, {
        status: plan.exhausted ? "failed" : "scheduled",
        execution_token: null,
        execution_lease_until: null,
        retry_count: plan.retry_count,
        next_retry_at: plan.next_retry_at,
        last_error: message,
      });
    } catch {
      // Lease expiry will allow recovery if finalization itself fails.
    }

    await writeAudit(auth.token, auth.user.id, claimed.id, plan.exhausted ? "scheduler_shadow_failed" : "scheduler_shadow_retry_scheduled", {
      error: message,
      retry_count: plan.retry_count,
      next_retry_at: plan.next_retry_at,
      exhausted: plan.exhausted,
      network_requested: false,
      meta_publish_requested: false,
    }).catch(() => false);

    return json(res, plan.exhausted ? 422 : 409, {
      ok: false,
      executed: false,
      error: message,
      retry: plan,
      event: updated,
    });
  }
}
