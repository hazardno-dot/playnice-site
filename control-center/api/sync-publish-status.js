const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO = "hazardno-dot/playnice-site";
const [OWNER, REPO_NAME] = REPO.split("/");

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

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });
  if (!SUPABASE_URL || !SUPABASE_KEY || !GITHUB_TOKEN) return json(res, 500, { error: "Server configuration is incomplete." });

  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    if (!token) return json(res, 401, { error: "Missing admin session." });

    const userRes = await supabaseFetch("/auth/v1/user", token);
    if (!userRes.ok) return json(res, 401, { error: "Invalid admin session." });
    const user = await userRes.json();

    const adminRes = await supabaseFetch(`/rest/v1/admin_users?user_id=eq.${encodeURIComponent(user.id)}&select=user_id&limit=1`, token);
    const admins = adminRes.ok ? await adminRes.json() : [];
    if (!admins.length) return json(res, 403, { error: "This account is not authorized." });

    const slug = String(req.body?.product_slug || "").trim();
    if (!slug) return json(res, 400, { error: "product_slug is required." });

    const draftRes = await supabaseFetch(`/rest/v1/product_drafts?product_slug=eq.${encodeURIComponent(slug)}&select=product_slug,payload,approved_payload,baseline_snapshot,apply_branch,apply_pr_number,preview_verified_at&limit=1`, token);
    if (!draftRes.ok) return json(res, 400, { error: "Could not load draft." });
    const [draft] = await draftRes.json();
    if (!draft) return json(res, 200, { ok: true, status: "no_active_draft" });
    if (!draft.apply_pr_number || !draft.preview_verified_at) return json(res, 200, { ok: true, status: "not_ready" });

    const pr = await github(`/repos/${OWNER}/${REPO_NAME}/pulls/${draft.apply_pr_number}`);
    if (!pr.merged_at) return json(res, 200, { ok: true, status: "not_merged", pr_number: draft.apply_pr_number });

    const existingRes = await supabaseFetch(`/rest/v1/publish_history?apply_pr_number=eq.${draft.apply_pr_number}&select=id&limit=1`, token);
    const existing = existingRes.ok ? await existingRes.json() : [];

    if (!existing.length) {
      const historyRes = await supabaseFetch("/rest/v1/publish_history", token, {
        method: "POST",
        body: JSON.stringify({
          product_slug: draft.product_slug,
          payload: draft.payload,
          approved_payload: draft.approved_payload,
          baseline_snapshot: draft.baseline_snapshot,
          apply_branch: draft.apply_branch,
          apply_pr_number: draft.apply_pr_number,
          preview_verified_at: draft.preview_verified_at,
          published_at: pr.merged_at,
          published_commit_sha: pr.merge_commit_sha,
          published_by: user.id,
        }),
      });
      if (!historyRes.ok) throw new Error("Could not archive published change.");

      await supabaseFetch("/rest/v1/draft_audit_log", token, {
        method: "POST",
        body: JSON.stringify({
          product_slug: draft.product_slug,
          actor_id: user.id,
          action: "published_live",
          details: {
            pr_number: draft.apply_pr_number,
            branch: draft.apply_branch,
            merge_commit_sha: pr.merge_commit_sha,
            merged_at: pr.merged_at,
          },
        }),
      });
    }

    const deleteRes = await supabaseFetch(`/rest/v1/product_drafts?product_slug=eq.${encodeURIComponent(slug)}`, token, { method: "DELETE" });
    if (!deleteRes.ok) throw new Error("Published change was archived but active draft could not be cleared.");

    return json(res, 200, {
      ok: true,
      status: "published",
      product_slug: slug,
      pr_number: draft.apply_pr_number,
      merge_commit_sha: pr.merge_commit_sha,
      published_at: pr.merged_at,
    });
  } catch (error) {
    return json(res, 500, { error: error?.message || "Publish status sync failed." });
  }
}
