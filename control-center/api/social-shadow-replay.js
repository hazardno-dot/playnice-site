import { productPublishedEvent } from "../src/socialEventProducer.mjs";

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

async function safeJson(response) {
  const text = await response.text();
  if (!text) return null;
  try { return JSON.parse(text); } catch { return { message: text.slice(0, 180) }; }
}

async function requireAdmin(req) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!token) return { error: "Missing admin session.", status: 401 };
  const adminRes = await supabaseFetch("/rest/v1/admin_users?select=user_id&limit=1", token);
  const admins = await safeJson(adminRes);
  if (!adminRes.ok) return { error: `Invalid admin session (Supabase ${adminRes.status}).`, status: 401 };
  if (!Array.isArray(admins) || !admins.length || !admins[0]?.user_id) return { error: "This account is not authorized.", status: 403 };
  return { token, user: { id: admins[0].user_id } };
}

export default async function handler(req, res) {
  if (!SUPABASE_URL || !SUPABASE_KEY) return json(res, 500, { error: "Server configuration is incomplete." });
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });

  try {
    const auth = await requireAdmin(req);
    if (auth.error) return json(res, auth.status, { error: auth.error });

    const historyRes = await supabaseFetch("/rest/v1/publish_history?select=product_slug,payload,approved_payload,apply_pr_number,published_at,published_commit_sha&order=published_at.desc&limit=1", auth.token);
    const history = await safeJson(historyRes);
    if (!historyRes.ok) return json(res, 400, { error: "Could not load latest publish history." });
    const latest = Array.isArray(history) ? history[0] : null;
    if (!latest?.product_slug) return json(res, 404, { error: "No published product history is available for replay." });

    const payload = latest.approved_payload || latest.payload || {};
    const core = payload?.core && typeof payload.core === "object" ? payload.core : payload;
    const media = [];
    if (core.socialSquareImage || payload.socialSquareImage) media.push({ src: core.socialSquareImage || payload.socialSquareImage, format: "1:1" });
    if (core.socialStoryImage || payload.socialStoryImage) media.push({ src: core.socialStoryImage || payload.socialStoryImage, format: "9:16" });
    if (core.image || payload.image) media.push({ src: core.image || payload.image, format: "product_image" });

    const replayId = `${latest.product_slug}--shadow-replay-${latest.apply_pr_number || Date.now()}`;
    const event = productPublishedEvent({
      slug: replayId,
      payload,
      media,
      sourceUrl: `/product/${latest.product_slug}`,
    });

    const existingRes = await supabaseFetch(`/rest/v1/social_events?event_type=eq.product_published&source_type=eq.product&source_id=eq.${encodeURIComponent(replayId)}&select=id&limit=1`, auth.token);
    const existing = existingRes.ok ? await safeJson(existingRes) : [];
    if (Array.isArray(existing) && existing.length) return json(res, 200, { ok: true, status: "deduped", event_id: existing[0].id, source_id: replayId });

    const createRes = await supabaseFetch("/rest/v1/social_events", auth.token, {
      method: "POST",
      body: JSON.stringify({
        ...event,
        created_by: auth.user.id,
        metadata: {
          test: true,
          replay: true,
          canonical_product_slug: latest.product_slug,
          publish_history_pr_number: latest.apply_pr_number,
          published_at: latest.published_at,
          published_commit_sha: latest.published_commit_sha,
          producer: "social-shadow-replay",
        },
      }),
    });
    const createdRows = await safeJson(createRes);
    if (!createRes.ok) return json(res, 400, { error: `Could not create Social replay event (${createRes.status}).` });
    const created = Array.isArray(createdRows) ? createdRows[0] : null;

    await supabaseFetch("/rest/v1/social_audit_log", auth.token, {
      method: "POST",
      body: JSON.stringify({
        social_event_id: created?.id,
        actor_id: auth.user.id,
        action: "shadow_replay_created_from_publish_history",
        details: {
          product_slug: latest.product_slug,
          apply_pr_number: latest.apply_pr_number,
          published_commit_sha: latest.published_commit_sha,
        },
      }),
    });

    return json(res, 200, {
      ok: true,
      status: "created",
      event: created,
      canonical_product_slug: latest.product_slug,
    });
  } catch (error) {
    return json(res, 400, { error: error?.message || "Could not create Social shadow replay." });
  }
}
