import { buildShadowExecution, retryPlan } from "../src/socialScheduler.mjs";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const CRON_SECRET = process.env.CRON_SECRET;
const MAX_EVENTS_PER_RUN = 10;

const json = (res, status, body) => res.status(status).json(body);

async function supabaseFetch(path, options = {}) {
  return fetch(`${SUPABASE_URL}${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(options.headers || {}),
    },
  });
}

async function claimOne(now) {
  const response = await supabaseFetch("/rest/v1/rpc/claim_due_social_event", {
    method: "POST",
    body: JSON.stringify({
      p_now: now.toISOString(),
      p_lease_seconds: 120,
      p_publish_mode: "shadow",
    }),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Could not claim due Social event (${response.status})${detail ? `: ${detail}` : ""}`);
  }
  const rows = await response.json();
  return rows?.[0] || null;
}

async function patchClaimedEvent(event, patch) {
  const tokenFilter = encodeURIComponent(event.execution_token || "");
  const response = await supabaseFetch(`/rest/v1/social_events?id=eq.${encodeURIComponent(event.id)}&execution_token=eq.${tokenFilter}&select=*`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
  if (!response.ok) throw new Error(`Could not finalize scheduler lease (${response.status}).`);
  const rows = await response.json();
  if (!rows.length) throw new Error("Scheduler lease was lost before finalization.");
  return rows[0];
}

async function writeAudit(eventId, action, details) {
  const response = await supabaseFetch("/rest/v1/social_audit_log", {
    method: "POST",
    body: JSON.stringify({
      social_event_id: eventId,
      actor_id: null,
      action,
      details,
    }),
  });
  return response.ok;
}

async function executeClaimed(event, now) {
  try {
    const execution = buildShadowExecution(event, now);
    const updated = await patchClaimedEvent(event, {
      shadow_executed_at: execution.executed_at,
      execution_token: null,
      execution_lease_until: null,
      next_retry_at: null,
      retry_count: 0,
      last_error: null,
    });

    const auditOk = await writeAudit(event.id, "scheduler_shadow_executed", {
      idempotency_key: execution.idempotency_key,
      scheduled_for: execution.scheduled_for,
      executed_at: execution.executed_at,
      channels: execution.channels.map(({ channel, action }) => ({ channel, action })),
      network_requested: false,
      meta_publish_requested: false,
      automatic: true,
    });

    return {
      ok: true,
      event_id: updated.id,
      status: updated.status,
      shadow_executed_at: updated.shadow_executed_at,
      audit_warning: auditOk ? null : "Shadow execution completed but audit insert failed.",
    };
  } catch (error) {
    const plan = retryPlan(event.retry_count, now);
    const message = error?.message || "Automatic shadow scheduler failed.";
    let updated = null;

    try {
      updated = await patchClaimedEvent(event, {
        status: plan.exhausted ? "failed" : "scheduled",
        execution_token: null,
        execution_lease_until: null,
        retry_count: plan.retry_count,
        next_retry_at: plan.next_retry_at,
        last_error: message,
      });
    } catch {
      // Lease expiry leaves the event recoverable if finalization itself fails.
    }

    await writeAudit(event.id, plan.exhausted ? "scheduler_shadow_failed" : "scheduler_shadow_retry_scheduled", {
      error: message,
      retry_count: plan.retry_count,
      next_retry_at: plan.next_retry_at,
      exhausted: plan.exhausted,
      network_requested: false,
      meta_publish_requested: false,
      automatic: true,
    }).catch(() => false);

    return {
      ok: false,
      event_id: event.id,
      error: message,
      retry: plan,
      status: updated?.status || null,
    };
  }
}

export default async function handler(req, res) {
  if (req.method !== "GET") return json(res, 405, { error: "Method not allowed" });
  if (!CRON_SECRET || req.headers.authorization !== `Bearer ${CRON_SECRET}`) {
    return json(res, 401, { error: "Unauthorized" });
  }
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return json(res, 500, { error: "Automatic scheduler server configuration is incomplete." });
  }

  const results = [];
  for (let index = 0; index < MAX_EVENTS_PER_RUN; index += 1) {
    const now = new Date();
    let claimed = null;
    try {
      claimed = await claimOne(now);
    } catch (error) {
      return json(res, 500, {
        ok: false,
        processed: results.length,
        results,
        error: error?.message || String(error),
        network_requested: false,
        meta_publish_requested: false,
      });
    }

    if (!claimed) break;
    results.push(await executeClaimed(claimed, now));
  }

  return json(res, 200, {
    ok: true,
    mode: "shadow",
    automatic: true,
    processed: results.length,
    results,
    network_requested: false,
    meta_publish_requested: false,
  });
}
