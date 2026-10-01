const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO = "hazardno-dot/playnice-site";
const [OWNER, REPO_NAME] = REPO.split("/");

const json = (res, status, body) => res.status(status).json(body);

async function safeJson(response) {
  const text = await response.text();
  if (!text) return null;
  try { return JSON.parse(text); } catch { return { message: text.slice(0, 300) }; }
}

async function supabaseFetch(path, token, init = {}) {
  return fetch(`${SUPABASE_URL}${path}`, {
    ...init,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(init.headers || {}),
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
  const data = await safeJson(response);
  if (!response.ok) throw new Error(data?.message || `GitHub request failed (${response.status})`);
  return data || {};
}

async function authenticate(req) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!token) return { error: [401, "Missing admin session."] };

  const userRes = await supabaseFetch("/auth/v1/user", token);
  if (!userRes.ok) return { error: [401, "Invalid admin session."] };
  const user = await safeJson(userRes);

  const adminRes = await supabaseFetch(`/rest/v1/admin_users?user_id=eq.${encodeURIComponent(user.id)}&select=user_id&limit=1`, token);
  const admins = adminRes.ok ? await safeJson(adminRes) : [];
  if (!Array.isArray(admins) || !admins.length) return { error: [403, "This account is not authorized for Notes reconciliation."] };
  return { token };
}

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });
  if (!SUPABASE_URL || !SUPABASE_KEY) return json(res, 500, { error: "Supabase server configuration is missing." });
  if (!GITHUB_TOKEN) return json(res, 500, { error: "GITHUB_TOKEN is not configured on the Control Center project." });

  try {
    const auth = await authenticate(req);
    if (auth.error) return json(res, auth.error[0], { error: auth.error[1] });

    const noteKey = String(req.body?.note_key || "").trim().toLowerCase();
    if (noteKey && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(noteKey)) return json(res, 400, { error: "note_key must be a canonical lowercase slug." });

    const query = [
      "/rest/v1/note_drafts?select=note_key,review_status,apply_pr_number,apply_branch",
      "review_status=eq.approved",
      "apply_pr_number=not.is.null",
      noteKey ? `note_key=eq.${encodeURIComponent(noteKey)}` : "",
    ].filter(Boolean).join("&");

    const draftRes = await supabaseFetch(query, auth.token);
    const drafts = await safeJson(draftRes);
    if (!draftRes.ok || !Array.isArray(drafts)) return json(res, 502, { error: "Could not load Notes drafts for merge reconciliation." });

    if (noteKey && !drafts.length) {
      return json(res, 404, { error: "No approved Notes draft with an apply PR was found for this note." });
    }

    const reconciled = [];
    const pending = [];

    for (const draft of drafts) {
      const pr = await github(`/repos/${OWNER}/${REPO_NAME}/pulls/${draft.apply_pr_number}`);
      if (!pr?.merged_at) {
        pending.push({ note_key: draft.note_key, pr_number: draft.apply_pr_number, state: pr?.state || null });
        continue;
      }

      const deleteRes = await supabaseFetch(`/rest/v1/note_drafts?note_key=eq.${encodeURIComponent(draft.note_key)}`, auth.token, { method: "DELETE" });
      if (!deleteRes.ok) throw new Error(`PR #${draft.apply_pr_number} is merged, but the Notes draft could not be closed.`);

      reconciled.push({
        note_key: draft.note_key,
        pr_number: draft.apply_pr_number,
        merged_at: pr.merged_at,
        merge_commit_sha: pr.merge_commit_sha || null,
      });
    }

    if (noteKey && !reconciled.length) {
      const item = pending[0];
      return json(res, 409, {
        error: item ? `PR #${item.pr_number} is not merged yet. Merge it before closing this Notes draft.` : "This Notes draft is not ready to close.",
        pending,
      });
    }

    return json(res, 200, {
      ok: true,
      reconciled: reconciled.length,
      closed: reconciled,
      pending,
    });
  } catch (error) {
    return json(res, 500, { error: error?.message || "Notes merge reconciliation failed." });
  }
};
