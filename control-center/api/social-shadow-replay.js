import { productPublishedEvent, heroPublishedEvent, journalPublishedEvent } from "../src/socialEventProducer.mjs";
import { heroRowToSlide } from "../src/heroAudit.mjs";
import { journalArticles } from "../../playnice-site/src/data/journal/index.js";

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

async function createReplay({ auth, sourceType, canonicalId, event, metadata = {}, auditDetails = {} }) {
  const replayId = `${canonicalId}--shadow-replay-${sourceType}-${metadata.replay_key || Date.now()}`;
  event.source_id = replayId;

  const existingRes = await supabaseFetch(
    `/rest/v1/social_events?event_type=eq.${encodeURIComponent(event.event_type)}&source_type=eq.${encodeURIComponent(sourceType)}&source_id=eq.${encodeURIComponent(replayId)}&select=id&limit=1`,
    auth.token,
  );
  const existing = existingRes.ok ? await safeJson(existingRes) : [];
  if (Array.isArray(existing) && existing.length) {
    return { status: "deduped", event_id: existing[0].id, source_id: replayId };
  }

  const createRes = await supabaseFetch("/rest/v1/social_events", auth.token, {
    method: "POST",
    body: JSON.stringify({
      ...event,
      created_by: auth.user.id,
      metadata: {
        test: true,
        replay: true,
        replay_source_type: sourceType,
        canonical_source_id: String(canonicalId),
        producer: "social-shadow-replay",
        ...metadata,
      },
    }),
  });
  const createdRows = await safeJson(createRes);
  if (!createRes.ok) throw new Error(`Could not create ${sourceType} Social replay event (${createRes.status}).`);
  const created = Array.isArray(createdRows) ? createdRows[0] : null;

  await supabaseFetch("/rest/v1/social_audit_log", auth.token, {
    method: "POST",
    body: JSON.stringify({
      social_event_id: created?.id,
      actor_id: auth.user.id,
      action: `shadow_replay_created_from_${sourceType}`,
      details: { canonical_source_id: String(canonicalId), ...auditDetails },
    }),
  });

  return { status: "created", event: created, canonical_source_id: String(canonicalId) };
}

async function replayProduct(auth) {
  const historyRes = await supabaseFetch("/rest/v1/publish_history?select=product_slug,payload,approved_payload,apply_pr_number,published_at,published_commit_sha&order=published_at.desc&limit=1", auth.token);
  const history = await safeJson(historyRes);
  if (!historyRes.ok) throw new Error("Could not load latest publish history.");
  const latest = Array.isArray(history) ? history[0] : null;
  if (!latest?.product_slug) throw new Error("No published product history is available for replay.");

  const payload = latest.approved_payload || latest.payload || {};
  const core = payload?.core && typeof payload.core === "object" ? payload.core : payload;
  const media = [];
  if (core.socialSquareImage || payload.socialSquareImage) media.push({ src: core.socialSquareImage || payload.socialSquareImage, format: "1:1" });
  if (core.socialStoryImage || payload.socialStoryImage) media.push({ src: core.socialStoryImage || payload.socialStoryImage, format: "9:16" });
  if (core.image || payload.image) media.push({ src: core.image || payload.image, format: "product_image" });

  const event = productPublishedEvent({ slug: latest.product_slug, payload, media, sourceUrl: `/product/${latest.product_slug}` });
  return createReplay({
    auth,
    sourceType: "product",
    canonicalId: latest.product_slug,
    event,
    metadata: {
      replay_key: latest.apply_pr_number || latest.published_commit_sha || "latest",
      publish_history_pr_number: latest.apply_pr_number,
      published_at: latest.published_at,
      published_commit_sha: latest.published_commit_sha,
    },
    auditDetails: { apply_pr_number: latest.apply_pr_number, published_commit_sha: latest.published_commit_sha },
  });
}

async function replayHero(auth) {
  const heroRes = await supabaseFetch("/rest/v1/hero_slides?select=id,hero_key,kind,enabled,pinned_first,position,image,desktop_image,mobile_image,alt,action_type,product_slug,preferred_size,collection_title,collection_slugs,manifesto_type,updated_at&enabled=eq.true&order=updated_at.desc&limit=1", auth.token);
  const rows = await safeJson(heroRes);
  if (!heroRes.ok) throw new Error("Could not load latest live Hero slide.");
  const row = Array.isArray(rows) ? rows[0] : null;
  if (!row?.hero_key) throw new Error("No live Hero slide is available for replay.");

  const payload = heroRowToSlide(row);
  const media = [];
  if (payload.mobileImage) media.push({ src: payload.mobileImage, format: "hero_mobile" });
  if (payload.desktopImage || payload.image) media.push({ src: payload.desktopImage || payload.image, format: "hero_desktop" });
  const event = heroPublishedEvent({ heroKey: row.hero_key, payload, media, sourceUrl: "/" });

  return createReplay({
    auth,
    sourceType: "hero",
    canonicalId: row.hero_key,
    event,
    metadata: { replay_key: row.updated_at || row.id, hero_id: row.id, live_updated_at: row.updated_at },
    auditDetails: { hero_id: row.id, live_updated_at: row.updated_at },
  });
}

async function replayJournal(auth) {
  const latest = [...journalArticles].sort((a, b) => Number(b?.id || 0) - Number(a?.id || 0))[0];
  if (!latest?.id) throw new Error("No live Journal article is available for replay.");
  const media = latest.image ? [{ src: latest.image, format: "journal_cover" }] : [];
  const event = journalPublishedEvent({ articleId: latest.id, payload: latest, media, sourceUrl: `/journal/${latest.id}` });

  return createReplay({
    auth,
    sourceType: "journal",
    canonicalId: latest.id,
    event,
    metadata: { replay_key: `article-${latest.id}`, journal_article_id: latest.id },
    auditDetails: { journal_article_id: latest.id },
  });
}

export default async function handler(req, res) {
  if (!SUPABASE_URL || !SUPABASE_KEY) return json(res, 500, { error: "Server configuration is incomplete." });
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });

  try {
    const auth = await requireAdmin(req);
    if (auth.error) return json(res, auth.status, { error: auth.error });

    const sourceType = String(req.body?.source_type || "product").trim().toLowerCase();
    if (!['product', 'hero', 'journal'].includes(sourceType)) return json(res, 400, { error: "Unsupported replay source type." });

    const result = sourceType === "hero"
      ? await replayHero(auth)
      : sourceType === "journal"
        ? await replayJournal(auth)
        : await replayProduct(auth);

    return json(res, 200, { ok: true, source_type: sourceType, ...result });
  } catch (error) {
    return json(res, 400, { error: error?.message || "Could not create Social shadow replay." });
  }
}
