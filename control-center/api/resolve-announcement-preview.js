const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = "hazardno-dot";
const REPO = "playnice-site";

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

async function supabaseFetch(path, token) {
  return fetch(`${SUPABASE_URL}${path}`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed." });
  if (!SUPABASE_URL || !SUPABASE_KEY || !GITHUB_TOKEN) return json(res, 500, { error: "Preview resolver environment is incomplete." });

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

    const draftResponse = await supabaseFetch(`/rest/v1/announcement_drafts?announcement_key=eq.${encodeURIComponent(key)}&select=apply_pr_number,apply_branch&limit=1`, token);
    const drafts = await readJson(draftResponse, "Supabase Announcement draft");
    if (!draftResponse.ok) throw new Error(drafts?.message || "Could not read Announcement draft.");
    const draft = drafts?.[0];
    if (!draft?.apply_pr_number || !draft?.apply_branch) return json(res, 409, { error: "Announcement draft PR is missing." });

    const pr = await github(`/repos/${OWNER}/${REPO}/pulls/${draft.apply_pr_number}`);
    if (pr.head?.ref !== draft.apply_branch) return json(res, 409, { error: "Announcement PR branch no longer matches the draft." });

    const deployments = await github(`/repos/${OWNER}/${REPO}/deployments?sha=${encodeURIComponent(pr.head.sha)}&per_page=20`);
    for (const deployment of deployments || []) {
      const statuses = await github(`/repos/${OWNER}/${REPO}/deployments/${deployment.id}/statuses?per_page=20`);
      const ready = (statuses || []).find((status) => status.state === "success" && status.environment_url);
      if (ready?.environment_url) {
        return json(res, 200, {
          ok: true,
          preview_url: ready.environment_url,
          deployment_id: deployment.id,
          head_sha: pr.head.sha,
        });
      }
    }

    return json(res, 409, { error: "Preview is not ready yet. Wait for the Vercel preview deployment to finish." });
  } catch (error) {
    console.error("Announcement preview resolve failed", error);
    return json(res, error?.status && error.status < 500 ? error.status : 500, { error: error?.message || "Could not resolve Announcement Preview." });
  }
}
