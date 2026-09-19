import { productPublishedEvent, heroPublishedEvent, journalPublishedEvent } from "../src/socialEventProducer.mjs";
import { heroRowToSlide } from "../src/heroAudit.mjs";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO = "hazardno-dot/playnice-site";
const [OWNER, REPO_NAME] = REPO.split("/");
const JOURNAL_PATH = "playnice-site/src/data/journal/index.js";

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
  try { return JSON.parse(text); } catch { return { message: text.slice(0, 240) }; }
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
  if (!Array.isArray(admins) || !admins.length || !admins[0]?.user_id) return { error: "This account is not authorized.", status: 403 };
  return { token, user: { id: admins[0].user_id } };
}

async function github(path) {
  if (!GITHUB_TOKEN) throw new Error("GitHub server configuration is incomplete for Journal replay.");
  const response = await fetch(`https://api.github.com${path}`, {
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  const data = await safeJson(response);
  if (!response.ok) throw new Error(data?.message || `GitHub request failed (${response.status}).`);
  return data;
}

async function loadLiveJournalArticles() {
  const file = await github(`/repos/${OWNER}/${REPO_NAME}/contents/${JOURNAL_PATH}?ref=main`);
  if (!file?.content) throw new Error("Live Journal source is missing from GitHub main.");
  const source = Buffer.from(file.content, "base64").toString("utf8");
  const moduleUrl = `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`;
  const liveModule = await import(moduleUrl);
  if (!Array.isArray(liveModule?.journalArticles)) throw new Error("Live Journal source did not export journalArticles.");
  return liveModule.journalArticles;
}

async function createReplay({ auth, sourceType, canonicalId, event, metadata = {}, auditDetails = {}, manualPost = false }) {
  const replayId = manualPost
    ? `${canonicalId}--manual-social-${metadata.replay_key || Date.now()}`
    : `${canonicalId}--shadow-replay-${sourceType}-${metadata.replay_key || Date.now()}`;
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
        test: !manualPost,
        replay: !manualPost,
        replay_source_type: sourceType,
        canonical_source_id: String(canonicalId),
        producer: manualPost ? `social-manual-${sourceType}-post` : "social-shadow-replay",
        ...metadata,
      },
    }),
  });
  const createdRows = await safeJson(createRes);
  if (!createRes.ok) {
    const detail = String(createdRows?.message || createdRows?.hint || createdRows?.details || "unknown Supabase insert error").slice(0, 220);
    throw new Error(`Could not create ${sourceType} Social replay event (Supabase ${createRes.status}: ${detail}).`);
  }
  const created = Array.isArray(createdRows) ? createdRows[0] : null;

  await supabaseFetch("/rest/v1/social_audit_log", auth.token, {
    method: "POST",
    body: JSON.stringify({
      social_event_id: created?.id,
      actor_id: auth.user.id,
      action: manualPost ? `manual_${sourceType}_post_created` : `shadow_replay_created_from_${sourceType}`,
      details: { canonical_source_id: String(canonicalId), ...auditDetails },
    }),
  });

  return { status: "created", event: created, canonical_source_id: String(canonicalId) };
}

async function replayProduct(auth, options = {}) {
  const requestedSlug = String(options.productSlug || "").trim();
  const manualPayload = options.productPayload && typeof options.productPayload === "object" ? options.productPayload : null;
  if (requestedSlug) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(requestedSlug)) throw new Error("Invalid product slug for manual Social draft.");
    if (!manualPayload) throw new Error("Live product payload is required for a manual Social draft.");

    const core = manualPayload?.core && typeof manualPayload.core === "object" ? manualPayload.core : manualPayload;
    if (!String(core?.name || core?.shortName || "").trim()) throw new Error("Selected product is missing its live name.");
    if (!String(core?.image || manualPayload?.image || "").trim()) throw new Error("Selected product is missing its live source image.");

    const media = [];
    if (core.socialSquareImage || manualPayload.socialSquareImage) media.push({ src: core.socialSquareImage || manualPayload.socialSquareImage, format: "1:1" });
    if (core.socialStoryImage || manualPayload.socialStoryImage) media.push({ src: core.socialStoryImage || manualPayload.socialStoryImage, format: "9:16" });
    if (core.image || manualPayload.image) media.push({ src: core.image || manualPayload.image, format: "product_image" });

    const event = productPublishedEvent({ slug: requestedSlug, payload: manualPayload, media, sourceUrl: `/product/${requestedSlug}` });
    const manualKey = `manual-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    return createReplay({
      auth,
      sourceType: "product",
      canonicalId: requestedSlug,
      event,
      metadata: {
        replay_key: manualKey,
        manual_product_post: true,
        selected_from_live_catalog: true,
      },
      auditDetails: { manual_product_post: true, selected_from_live_catalog: true },
      manualPost: true,
    });
  }

  const historyRes = await supabaseFetch("/rest/v1/publish_history?select=product_slug,payload,approved_payload,apply_pr_number,published_at,published_commit_sha&order=published_at.desc&limit=1", auth.token);
  const history = await safeJson(historyRes);
  if (!historyRes.ok) {
    const detail = String(history?.message || history?.hint || history?.details || "unknown read error").slice(0, 180);
    throw new Error(`Could not load latest publish history (Supabase ${historyRes.status}: ${detail}).`);
  }
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

async function replayHero(auth, options = {}) {
  const requestedKey = String(options.heroKey || "").trim();
  const query = requestedKey
    ? `/rest/v1/hero_slides?select=id,hero_key,kind,enabled,pinned_first,position,image,desktop_image,mobile_image,alt,action_type,product_slug,preferred_size,collection_title,collection_slugs,manifesto_type,updated_at&hero_key=eq.${encodeURIComponent(requestedKey)}&limit=1`
    : "/rest/v1/hero_slides?select=id,hero_key,kind,enabled,pinned_first,position,image,desktop_image,mobile_image,alt,action_type,product_slug,preferred_size,collection_title,collection_slugs,manifesto_type,updated_at&enabled=eq.true&order=updated_at.desc&limit=1";

  const heroRes = await supabaseFetch(query, auth.token);
  const rows = await safeJson(heroRes);
  if (!heroRes.ok) {
    const detail = String(rows?.message || rows?.hint || rows?.details || "unknown Hero read error").slice(0, 220);
    throw new Error(`Could not load Hero slide (Supabase ${heroRes.status}: ${detail}).`);
  }
  const row = Array.isArray(rows) ? rows[0] : null;
  if (!row?.hero_key) throw new Error(requestedKey ? "Selected Hero slide was not found." : "No live Hero slide is available for replay.");

  const payload = heroRowToSlide(row);
  const media = [];
  if (payload.mobileImage) media.push({ src: payload.mobileImage, format: "hero_mobile" });
  if (payload.desktopImage || payload.image) media.push({ src: payload.desktopImage || payload.image, format: "hero_desktop" });
  const event = heroPublishedEvent({ heroKey: row.hero_key, payload, media, sourceUrl: "/" });

  if (requestedKey) {
    const manualKey = `manual-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    return createReplay({
      auth,
      sourceType: "hero",
      canonicalId: row.hero_key,
      event,
      metadata: { replay_key: manualKey, manual_hero_post: true, selected_from_hero_catalog: true, hero_id: row.id },
      auditDetails: { manual_hero_post: true, selected_from_hero_catalog: true, hero_id: row.id },
      manualPost: true,
    });
  }

  return createReplay({
    auth,
    sourceType: "hero",
    canonicalId: row.hero_key,
    event,
    metadata: { replay_key: row.updated_at || row.id, hero_id: row.id, live_updated_at: row.updated_at },
    auditDetails: { hero_id: row.id, live_updated_at: row.updated_at },
  });
}

async function replayJournal(auth, options = {}) {
  const journalArticles = await loadLiveJournalArticles();
  const requestedId = String(options.articleId || "").trim();
  const article = requestedId
    ? journalArticles.find((item) => String(item?.id) === requestedId)
    : [...journalArticles].sort((a, b) => Number(b?.id || 0) - Number(a?.id || 0))[0];

  if (!article?.id) throw new Error(requestedId ? "Selected Journal article was not found." : "No live Journal article is available for replay.");
  const media = article.image ? [{ src: article.image, format: "journal_cover" }] : [];
  const event = journalPublishedEvent({ articleId: article.id, payload: article, media, sourceUrl: `/journal/${article.id}` });

  if (requestedId) {
    const manualKey = `manual-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    return createReplay({
      auth,
      sourceType: "journal",
      canonicalId: article.id,
      event,
      metadata: { replay_key: manualKey, manual_journal_post: true, selected_from_journal_catalog: true, journal_article_id: article.id, source_branch: "main" },
      auditDetails: { manual_journal_post: true, selected_from_journal_catalog: true, journal_article_id: article.id, source_branch: "main" },
      manualPost: true,
    });
  }

  return createReplay({
    auth,
    sourceType: "journal",
    canonicalId: article.id,
    event,
    metadata: { replay_key: `article-${article.id}`, journal_article_id: article.id, source_branch: "main" },
    auditDetails: { journal_article_id: article.id, source_branch: "main" },
  });
}

export default async function handler(req, res) {
  if (!SUPABASE_URL || !SUPABASE_KEY) return json(res, 500, { error: "Server configuration is incomplete." });
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });

  try {
    const auth = await requireAdmin(req);
    if (auth.error) return json(res, auth.status, { error: auth.error });

    const sourceType = String(req.body?.source_type || "product").trim().toLowerCase();
    if (!["product", "hero", "journal"].includes(sourceType)) return json(res, 400, { error: "Unsupported replay source type." });

    const result = sourceType === "hero"
      ? await replayHero(auth, { heroKey: req.body?.hero_key })
      : sourceType === "journal"
        ? await replayJournal(auth, { articleId: req.body?.journal_article_id })
        : await replayProduct(auth, {
          productSlug: req.body?.product_slug,
          productPayload: req.body?.product_payload,
        });

    return json(res, 200, { ok: true, source_type: sourceType, ...result });
  } catch (error) {
    return json(res, 400, { error: error?.message || "Could not create Social shadow replay." });
  }
}
