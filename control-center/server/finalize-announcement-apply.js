const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = "hazardno-dot";
const REPO = "playnice-site";
const CONFIG_PATH = "playnice-site/src/data/announcementConfig.generated.js";

const json = (res, status, body) => res.status(status).json(body);

async function readJson(response, label) {
  const text = await response.text();
  try { return text ? JSON.parse(text) : null; }
  catch { throw new Error(`${label} returned a non-JSON response (${response.status}).`); }
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
  const data = await readJson(response, "GitHub API");
  if (!response.ok) {
    const error = new Error(data?.message || `GitHub request failed (${response.status})`);
    error.status = response.status;
    throw error;
  }
  return data;
}

async function githubGraphql(query, variables) {
  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });
  const data = await readJson(response, "GitHub GraphQL");
  if (!response.ok || data?.errors?.length) {
    throw new Error(data?.errors?.[0]?.message || `GitHub GraphQL failed (${response.status}).`);
  }
  return data.data;
}

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

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed." });
  if (!SUPABASE_URL || !SUPABASE_KEY || !GITHUB_TOKEN) return json(res, 500, { error: "Controlled Apply environment is incomplete." });

  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  const key = String(req.body?.announcement_key || "").trim();
  if (!token) return json(res, 401, { error: "Admin session required." });
  if (!key) return json(res, 400, { error: "announcement_key is required." });

  try {
    const userResponse = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${token}` } });
    const user = await readJson(userResponse, "Supabase Auth");
    if (!userResponse.ok || !user?.id) return json(res, 401, { error: "Admin session expired." });

    const adminResponse = await supabaseFetch(`/rest/v1/admin_users?user_id=eq.${encodeURIComponent(user.id)}&select=user_id`, token);
    const admins = await readJson(adminResponse, "Supabase admin lookup");
    if (!adminResponse.ok || !Array.isArray(admins) || !admins.length) return json(res, 403, { error: "PlayNice admin access required." });

    const draftResponse = await supabaseFetch(`/rest/v1/announcement_drafts?announcement_key=eq.${encodeURIComponent(key)}&select=announcement_key,baseline_snapshot,apply_branch,apply_pr_number,preview_verified_at,merged_at&limit=1`, token);
    const drafts = await readJson(draftResponse, "Supabase Announcement draft");
    if (!draftResponse.ok) throw new Error(drafts?.message || "Could not read Announcement draft.");
    const draft = drafts?.[0];
    if (!draft) return json(res, 404, { error: "Announcement draft not found." });
    if (draft.merged_at) return json(res, 409, { error: "Announcement apply is already merged." });
    if (!draft.apply_branch || !draft.apply_pr_number) return json(res, 409, { error: "Announcement draft PR is missing." });
    if (!draft.preview_verified_at) return json(res, 409, { error: "Preview must be verified before merge." });
    if (!draft.baseline_snapshot?.source_sha) return json(res, 409, { error: "Prepared baseline is missing." });

    const configFile = await github(`/repos/${OWNER}/${REPO}/contents/${CONFIG_PATH}?ref=main`);
    if (configFile.sha !== draft.baseline_snapshot.source_sha) {
      return json(res, 409, { error: "LIVE DRIFT: Announcement config changed on main after preparation. Do not merge this PR." });
    }

    const pr = await github(`/repos/${OWNER}/${REPO}/pulls/${draft.apply_pr_number}`);
    if (pr.state !== "open") return json(res, 409, { error: "Announcement PR is not open." });
    if (pr.head?.ref !== draft.apply_branch) return json(res, 409, { error: "Announcement PR branch no longer matches the prepared draft." });
    if (pr.base?.ref !== "main") return json(res, 409, { error: "Announcement PR no longer targets main." });

    const files = await github(`/repos/${OWNER}/${REPO}/pulls/${draft.apply_pr_number}/files?per_page=100`);
    if (!Array.isArray(files) || files.length !== 1 || files[0]?.filename !== CONFIG_PATH) {
      return json(res, 409, { error: "SAFETY BLOCK: Announcement PR must change only announcementConfig.generated.js." });
    }

    if (pr.draft) {
      await githubGraphql(
        `mutation($id: ID!) { markPullRequestReadyForReview(input: { pullRequestId: $id }) { pullRequest { id isDraft } } }`,
        { id: pr.node_id },
      );
    }

    const merge = await github(`/repos/${OWNER}/${REPO}/pulls/${draft.apply_pr_number}/merge`, {
      method: "PUT",
      body: JSON.stringify({
        sha: pr.head.sha,
        merge_method: "merge",
        commit_title: `Control Center Announcement: ${key} (#${draft.apply_pr_number})`,
        commit_message: "Verified in Preview and merged through PlayNice Control Center Announcement Controlled Apply.",
      }),
    });
    if (!merge?.merged || !merge?.sha) throw new Error(merge?.message || "GitHub did not merge the Announcement PR.");

    const patchResponse = await supabaseFetch(`/rest/v1/announcement_drafts?announcement_key=eq.${encodeURIComponent(key)}`, token, {
      method: "PATCH",
      body: JSON.stringify({ merged_at: new Date().toISOString(), merged_by: user.id, merged_commit_sha: merge.sha }),
    });
    if (!patchResponse.ok) {
      const patchBody = await readJson(patchResponse, "Supabase Announcement merge metadata");
      throw new Error(patchBody?.message || "PR merged, but merge metadata could not be saved.");
    }

    return json(res, 200, { ok: true, merged: true, pr_number: draft.apply_pr_number, merge_commit_sha: merge.sha });
  } catch (error) {
    console.error("Announcement finalize failed", error);
    return json(res, error?.status && error.status < 500 ? error.status : 500, { error: error?.message || "Announcement finalize failed." });
  }
}
