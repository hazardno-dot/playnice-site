import { findJournalArticleBlock, getNextJournalArticleId, insertJournalArticle, journalArticleExists, normalizeJournalArticle, replaceJournalArticle, stableJson } from "./journal-apply-engine.mjs";

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

async function github(path, options = {}) {
  const response = await fetch(`https://api.github.com${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const data = response.status === 204 ? null : await response.json();
  if (!response.ok) throw new Error(data?.message || `GitHub request failed (${response.status})`);
  return data;
}

const validPair = (value) => Boolean(String(value?.sr || "").trim() && String(value?.en || "").trim());
function validateExistingArticle(article, articleId) {
  const value = normalizeJournalArticle(article);
  if (value.id !== articleId) throw new Error("Approved article id does not match article_id.");
  if (!validPair(value.date) || !validPair(value.title) || !validPair(value.excerpt) || !validPair(value.content)) throw new Error("Journal article requires complete SR/EN date, title, excerpt and content.");
  if (!value.image.startsWith("/journal/") || value.image.endsWith("/")) throw new Error("Journal image must be a specific file under /journal/.");
  return value;
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
  if (!admins.length) return { error: [403, "This account is not authorized for Journal controlled apply."] };
  return { token, user };
}

async function loadDraft(articleId, token) {
  const select = "article_id,payload,approved_payload,review_status,reviewed_at,baseline_snapshot,prepared_at,apply_branch,apply_pr_number";
  const response = await supabaseFetch(`/rest/v1/journal_drafts?article_id=eq.${articleId}&select=${select}&limit=1`, token);
  if (!response.ok) throw new Error("Could not load Journal draft.");
  const [draft] = await response.json();
  return draft || null;
}

async function readMainJournal() {
  const file = await github(`/repos/${OWNER}/${REPO_NAME}/contents/${JOURNAL_PATH}?ref=main`);
  return { file, source: Buffer.from(file.content, "base64").toString("utf8") };
}

function hasFreshPreparation(draft) {
  const preparationMode = draft.baseline_snapshot?.mode || (draft.baseline_snapshot?.source_block ? "replace" : null);
  if (!draft.prepared_at || !preparationMode) return false;
  if (!draft.reviewed_at) return true;
  return new Date(draft.prepared_at).getTime() >= new Date(draft.reviewed_at).getTime();
}

function buildPreparedChange(source, fileSha, draft, approved, articleId) {
  const preparationMode = draft.baseline_snapshot?.mode || (draft.baseline_snapshot?.source_block ? "replace" : null);
  if (!hasFreshPreparation(draft)) throw new Error("Journal draft must be prepared after the latest approval before Controlled Apply.");

  if (preparationMode === "insert") {
    if (fileSha !== draft.baseline_snapshot.source_sha) throw new Error("LIVE DRIFT: Journal source changed after new-article preparation. Prepare again.");
    if (journalArticleExists(source, articleId)) throw new Error(`LIVE DRIFT: Journal article #${articleId} now exists on main.`);
    if (getNextJournalArticleId(source) !== articleId) throw new Error("LIVE DRIFT: Journal next article id changed after preparation.");
    return { preparationMode, changed: insertJournalArticle(source, approved) };
  }

  if (preparationMode === "replace") {
    return { preparationMode, changed: replaceJournalArticle(source, articleId, draft.baseline_snapshot.source_block, approved) };
  }

  throw new Error("Unsupported Journal preparation mode. Prepare again.");
}

async function createBlob(source) {
  const blob = await github(`/repos/${OWNER}/${REPO_NAME}/git/blobs`, {
    method: "POST",
    body: JSON.stringify({ content: Buffer.from(source, "utf8").toString("base64"), encoding: "base64" }),
  });
  return blob.sha;
}

async function createJournalCommitOnMainBase(source, message) {
  const mainRef = await github(`/repos/${OWNER}/${REPO_NAME}/git/ref/heads/main`);
  const baseSha = mainRef.object.sha;
  const mainCommit = await github(`/repos/${OWNER}/${REPO_NAME}/git/commits/${baseSha}`);
  const blobSha = await createBlob(source);
  const tree = await github(`/repos/${OWNER}/${REPO_NAME}/git/trees`, {
    method: "POST",
    body: JSON.stringify({
      base_tree: mainCommit.tree.sha,
      tree: [{ path: JOURNAL_PATH, mode: "100644", type: "blob", sha: blobSha }],
    }),
  });
  const commit = await github(`/repos/${OWNER}/${REPO_NAME}/git/commits`, {
    method: "POST",
    body: JSON.stringify({ message, tree: tree.sha, parents: [baseSha] }),
  });
  return { baseSha, commit };
}

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });
  if (!SUPABASE_URL || !SUPABASE_KEY) return json(res, 500, { error: "Supabase server configuration is missing." });
  if (!GITHUB_TOKEN) return json(res, 500, { error: "GITHUB_TOKEN is not configured on the Control Center project." });

  try {
    const auth = await authenticate(req);
    if (auth.error) return json(res, auth.error[0], { error: auth.error[1] });
    const { token, user } = auth;
    const articleId = Number(req.body?.article_id);
    const action = String(req.body?.action || "apply");
    if (!Number.isInteger(articleId) || articleId <= 0) return json(res, 400, { error: "article_id must be a positive integer." });

    const draft = await loadDraft(articleId, token);
    if (!draft) return json(res, 404, { error: "Journal draft not found." });
    if (draft.review_status !== "approved" || !draft.approved_payload) return json(res, 409, { error: "Journal draft must be APPROVED first." });
    if (stableJson(draft.payload) !== stableJson(draft.approved_payload)) return json(res, 409, { error: "Approved payload no longer matches the current Journal draft. Review and approve again." });
    const approved = validateExistingArticle(draft.approved_payload, articleId);
    const hasAnyPrIdentity = Boolean(draft.apply_branch || draft.apply_pr_number);
    const hasPr = Boolean(draft.apply_branch && draft.apply_pr_number);
    if (hasAnyPrIdentity && !hasPr) return json(res, 409, { error: "Journal draft has incomplete PR metadata. Repair or clear the apply identity before continuing." });

    if (action === "prepare") {
      const { file, source } = await readMainJournal();
      const existsOnMain = journalArticleExists(source, articleId);
      let baseline;

      if (existsOnMain) {
        const livePayload = validateExistingArticle(req.body?.live_payload, articleId);
        if (stableJson(livePayload) === stableJson(approved)) return json(res, 409, { error: "No approved Journal changes remain to apply." });
        const located = findJournalArticleBlock(source, articleId);
        baseline = { mode: "replace", article_id: articleId, source_block: located.block, source_sha: file.sha, live_payload: livePayload };
      } else {
        const nextArticleId = getNextJournalArticleId(source);
        if (articleId !== nextArticleId) return json(res, 409, { error: `New Journal article id must be the next sequential id (${nextArticleId}).` });
        baseline = { mode: "insert", article_id: articleId, source_sha: file.sha, previous_max_id: nextArticleId - 1 };
      }

      const response = await supabaseFetch(`/rest/v1/journal_drafts?article_id=eq.${articleId}`, token, {
        method: "PATCH",
        body: JSON.stringify({ baseline_snapshot: baseline, prepared_at: new Date().toISOString(), prepared_by: user.id }),
      });
      if (!response.ok) throw new Error("Could not persist Journal preparation baseline.");
      return json(res, 200, { ok: true, prepared: true, refresh: hasPr, article_id: articleId, mode: baseline.mode, branch: draft.apply_branch || null, pr_number: draft.apply_pr_number || null });
    }

    if (action !== "apply" && action !== "refresh") return json(res, 400, { error: "Unsupported Journal apply action." });

    if (action === "refresh") {
      if (!hasPr) return json(res, 409, { error: "No existing Journal draft PR to refresh." });
      const pr = await github(`/repos/${OWNER}/${REPO_NAME}/pulls/${draft.apply_pr_number}`);
      if (pr.state !== "open") return json(res, 409, { error: `PR #${draft.apply_pr_number} is not open.` });
      if (pr.head?.ref !== draft.apply_branch) return json(res, 409, { error: `PR #${draft.apply_pr_number} no longer points to ${draft.apply_branch}.` });
      if (pr.base?.ref !== "main") return json(res, 409, { error: `PR #${draft.apply_pr_number} no longer targets main.` });

      const { file, source } = await readMainJournal();
      const { preparationMode, changed } = buildPreparedChange(source, file.sha, draft, approved, articleId);
      if (changed.source === source) return json(res, 409, { error: "No Journal source change was produced." });

      const { baseSha, commit } = await createJournalCommitOnMainBase(changed.source, `Control Center Journal refresh: article #${articleId}`);
      await github(`/repos/${OWNER}/${REPO_NAME}/git/refs/heads/${encodeURIComponent(draft.apply_branch)}`, {
        method: "PATCH",
        body: JSON.stringify({ sha: commit.sha, force: true }),
      });

      const refreshedAt = new Date().toISOString();
      const update = await supabaseFetch(`/rest/v1/journal_drafts?article_id=eq.${articleId}`, token, {
        method: "PATCH",
        body: JSON.stringify({ apply_created_at: refreshedAt, apply_created_by: user.id }),
      });
      if (!update.ok) throw new Error("Journal PR branch was refreshed, but its draft metadata could not be updated.");

      return json(res, 200, {
        ok: true,
        refreshed: true,
        existing: true,
        article_id: articleId,
        branch: draft.apply_branch,
        pr_number: draft.apply_pr_number,
        pr_url: `https://github.com/${REPO}/pull/${draft.apply_pr_number}`,
        file: JOURNAL_PATH,
        operation: preparationMode,
        base_sha: baseSha,
        commit_sha: commit.sha,
        refreshed_at: refreshedAt,
        version: "journal-v3-refresh",
      });
    }

    if (hasPr) return json(res, 200, { ok: true, existing: true, branch: draft.apply_branch, pr_number: draft.apply_pr_number, pr_url: `https://github.com/${REPO}/pull/${draft.apply_pr_number}` });

    const { file, source } = await readMainJournal();
    const { preparationMode, changed } = buildPreparedChange(source, file.sha, draft, approved, articleId);
    if (changed.source === source) return json(res, 409, { error: "No Journal source change was produced." });

    const mainRef = await github(`/repos/${OWNER}/${REPO_NAME}/git/ref/heads/main`);
    const baseSha = mainRef.object.sha;
    const stamp = new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 12);
    const branch = `cc-journal-${articleId}-${stamp}`;
    await github(`/repos/${OWNER}/${REPO_NAME}/git/refs`, { method: "POST", body: JSON.stringify({ ref: `refs/heads/${branch}`, sha: baseSha }) });
    await github(`/repos/${OWNER}/${REPO_NAME}/contents/${JOURNAL_PATH}`, {
      method: "PUT",
      body: JSON.stringify({
        message: `Control Center Journal apply: article #${articleId}`,
        content: Buffer.from(changed.source, "utf8").toString("base64"),
        sha: file.sha,
        branch,
      }),
    });

    const title = String(approved.title?.en || approved.title?.sr || `Article ${articleId}`);
    const pr = await github(`/repos/${OWNER}/${REPO_NAME}/pulls`, {
      method: "POST",
      body: JSON.stringify({
        title: `Control Center Journal: #${articleId} · ${title}`,
        head: branch,
        base: "main",
        draft: true,
        body: [
          "Generated by PlayNice Control Center Journal Controlled Apply v1.",
          "",
          `- Journal article: #${articleId}`,
          `- Title: ${title}`,
          `- File: ${JOURNAL_PATH}`,
          "- Source: approved + prepared Supabase Journal draft",
          `- Operation: ${preparationMode === "insert" ? "insert new article" : "replace existing article"}`,
          preparationMode === "insert" ? "- Safety: exact prepared Journal source SHA drift guard" : "- Safety: exact prepared source-block drift guard",
          "- Safety: draft PR only; no automatic merge",
        ].join("\n"),
      }),
    });

    const update = await supabaseFetch(`/rest/v1/journal_drafts?article_id=eq.${articleId}`, token, {
      method: "PATCH",
      body: JSON.stringify({ apply_branch: branch, apply_pr_number: pr.number, apply_created_at: new Date().toISOString(), apply_created_by: user.id }),
    });
    if (!update.ok) throw new Error("Journal PR was created, but its draft metadata could not be persisted.");

    return json(res, 200, { ok: true, article_id: articleId, branch, pr_number: pr.number, pr_url: pr.html_url, file: JOURNAL_PATH, version: "journal-v3-refresh" });
  } catch (error) {
    const message = error?.message || "Journal Controlled Apply failed.";
    const expectedConflict = /^(LIVE DRIFT:|Journal draft must be prepared|No Journal source change|Unsupported Journal preparation mode)/.test(message);
    return json(res, expectedConflict ? 409 : 500, { error: message });
  }
}
