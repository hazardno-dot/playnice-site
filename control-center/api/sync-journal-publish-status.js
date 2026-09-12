import { findJournalArticleBlock, normalizeJournalArticle, stableJson } from "./journal-apply-engine.mjs";
import { journalPublishedEvent } from "../src/socialEventProducer.mjs";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO = "hazardno-dot/playnice-site";
const [OWNER, REPO_NAME] = REPO.split("/");
const JOURNAL_PATH = "playnice-site/src/data/journal/index.js";

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

async function github(path) {
  const response = await fetch(`https://api.github.com${path}`, {
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.message || `GitHub request failed (${response.status})`);
  return data;
}

async function authenticate(req) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!token) return { error: [401, "Missing admin session."] };
  const userRes = await supabaseFetch("/auth/v1/user", token);
  if (!userRes.ok) return { error: [401, "Invalid admin session."] };
  const user = await userRes.json();
  const adminRes = await supabaseFetch(`/rest/v1/admin_users?user_id=eq.${encodeURIComponent(user.id)}&select=user_id&limit=1`, token);
  const admins = adminRes.ok ? await adminRes.json() : [];
  if (!admins.length) return { error: [403, "This account is not authorized."] };
  return { token, user };
}

async function createJournalSocialShadowEvent({ articleId, payload, token, userId, pr }) {
  try {
    const media = payload?.image ? [{ src: payload.image, format: "journal_cover" }] : [];
    const event = journalPublishedEvent({
      articleId,
      payload,
      media,
      sourceUrl: `/journal/${articleId}`,
    });

    const existingRes = await supabaseFetch(
      `/rest/v1/social_events?event_type=eq.${encodeURIComponent(event.event_type)}&source_type=eq.${encodeURIComponent(event.source_type)}&source_id=eq.${encodeURIComponent(event.source_id)}&select=id&limit=1`,
      token,
    );
    if (!existingRes.ok) return { status: "schema_unavailable" };
    const existing = await existingRes.json();
    if (existing.length) return { status: "deduped", id: existing[0].id };

    const createRes = await supabaseFetch("/rest/v1/social_events", token, {
      method: "POST",
      body: JSON.stringify({
        ...event,
        created_by: userId,
        metadata: {
          ...(event.metadata || {}),
          apply_pr_number: pr.number,
          merge_commit_sha: pr.merge_commit_sha,
          merged_at: pr.merged_at,
          producer: "sync-journal-publish-status",
        },
      }),
    });
    if (!createRes.ok) return { status: "create_failed" };
    const [created] = await createRes.json();

    await supabaseFetch("/rest/v1/social_audit_log", token, {
      method: "POST",
      body: JSON.stringify({
        social_event_id: created.id,
        actor_id: userId,
        action: "shadow_event_created_from_journal_publish",
        details: { article_id: articleId, apply_pr_number: pr.number, merge_commit_sha: pr.merge_commit_sha },
      }),
    });

    return { status: "created", id: created.id };
  } catch (error) {
    console.warn("Journal Social shadow event creation skipped", error);
    return { status: "skipped" };
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });
  if (!SUPABASE_URL || !SUPABASE_KEY || !GITHUB_TOKEN) return json(res, 500, { error: "Server configuration is incomplete." });

  try {
    const auth = await authenticate(req);
    if (auth.error) return json(res, auth.error[0], { error: auth.error[1] });
    const { token, user } = auth;
    const articleId = Number(req.body?.article_id);
    if (!Number.isInteger(articleId) || articleId <= 0) return json(res, 400, { error: "article_id must be a positive integer." });

    const draftRes = await supabaseFetch(`/rest/v1/journal_drafts?article_id=eq.${articleId}&select=article_id,payload,approved_payload,review_status,apply_branch,apply_pr_number&limit=1`, token);
    if (!draftRes.ok) return json(res, 400, { error: "Could not load Journal draft." });
    const [draft] = await draftRes.json();
    if (!draft) return json(res, 200, { ok: true, status: "no_active_draft" });
    if (draft.review_status !== "approved" || !draft.approved_payload) return json(res, 200, { ok: true, status: "not_ready" });
    if (!draft.apply_pr_number || !draft.apply_branch) return json(res, 200, { ok: true, status: "not_ready" });

    const pr = await github(`/repos/${OWNER}/${REPO_NAME}/pulls/${draft.apply_pr_number}`);
    if (pr.base?.ref !== "main") return json(res, 409, { error: "Tracked Journal apply PR does not target main." });
    if (pr.head?.ref !== draft.apply_branch) return json(res, 409, { error: "Tracked Journal apply PR head no longer matches the stored apply branch." });
    if (!pr.merged_at) return json(res, 200, { ok: true, status: "not_merged", pr_number: draft.apply_pr_number });

    const file = await github(`/repos/${OWNER}/${REPO_NAME}/contents/${JOURNAL_PATH}?ref=main`);
    const source = Buffer.from(file.content, "base64").toString("utf8");
    const located = findJournalArticleBlock(source, articleId);
    if (!located?.block) return json(res, 409, { error: `POST-MERGE SAFETY BLOCK: Journal article #${articleId} is missing from main.` });

    const live = normalizeJournalArticle(located.article || located.value || located.payload || {});
    const approved = normalizeJournalArticle(draft.approved_payload);
    if (stableJson(live) !== stableJson(approved)) {
      return json(res, 409, { error: `POST-MERGE SAFETY BLOCK: Journal article #${articleId} does not match the approved snapshot.` });
    }

    const social = await createJournalSocialShadowEvent({ articleId, payload: approved, token, userId: user.id, pr });

    const deleteRes = await supabaseFetch(`/rest/v1/journal_drafts?article_id=eq.${articleId}&apply_pr_number=eq.${draft.apply_pr_number}`, token, { method: "DELETE" });
    if (!deleteRes.ok) throw new Error("Published Journal article was verified, but active draft could not be cleared.");

    return json(res, 200, {
      ok: true,
      status: "published",
      article_id: articleId,
      pr_number: draft.apply_pr_number,
      merge_commit_sha: pr.merge_commit_sha,
      published_at: pr.merged_at,
      social_shadow_event: social,
    });
  } catch (error) {
    return json(res, 500, { error: error?.message || "Journal publish status sync failed." });
  }
}
