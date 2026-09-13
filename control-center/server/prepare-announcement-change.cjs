const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO = "hazardno-dot/playnice-site";
const [OWNER, REPO_NAME] = REPO.split("/");
const SOURCE_PATH = "playnice-site/src/data/announcementConfig.generated.js";

const json = (res, status, body) => res.status(status).json(body);

const stableJson = (value) => {
  const normalize = (item) => {
    if (Array.isArray(item)) return item.map(normalize);
    if (item && typeof item === "object") return Object.keys(item).sort().reduce((out, key) => {
      if (typeof item[key] !== "undefined") out[key] = normalize(item[key]);
      return out;
    }, {});
    return item;
  };
  return JSON.stringify(normalize(value ?? null));
};

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
  const data = response.status === 204 ? null : await response.json().catch(() => ({}));
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
  if (!admins.length) return { error: [403, "This account is not authorized for Announcement prepare."] };
  return { token, user };
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });
  if (!SUPABASE_URL || !SUPABASE_KEY) return json(res, 500, { error: "Supabase server configuration is missing." });
  if (!GITHUB_TOKEN) return json(res, 500, { error: "GITHUB_TOKEN is not configured on the Control Center project." });

  try {
    const auth = await authenticate(req);
    if (auth.error) return json(res, auth.error[0], { error: auth.error[1] });
    const { token, user } = auth;
    const key = String(req.body?.announcement_key || "").trim();
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(key)) return json(res, 400, { error: "announcement_key must use lowercase kebab-case." });

    const draftRes = await supabaseFetch(`/rest/v1/announcement_drafts?announcement_key=eq.${encodeURIComponent(key)}&select=announcement_key,payload,approved_payload,review_status,baseline_snapshot,prepared_at&limit=1`, token);
    if (!draftRes.ok) return json(res, 500, { error: "Could not load Announcement draft." });
    const [draft] = await draftRes.json();
    if (!draft) return json(res, 404, { error: "Announcement draft not found." });
    if (draft.review_status !== "approved" || !draft.approved_payload) return json(res, 409, { error: "Announcement draft must be APPROVED first." });
    if (stableJson(draft.payload) !== stableJson(draft.approved_payload)) return json(res, 409, { error: "Approved payload no longer matches the current draft. Review and approve again." });

    const source = await github(`/repos/${OWNER}/${REPO_NAME}/contents/${SOURCE_PATH}?ref=main`);
    if (!source?.sha) return json(res, 500, { error: "Could not resolve live Announcement config SHA." });

    const baseline = {
      announcement_key: key,
      source_path: SOURCE_PATH,
      source_sha: source.sha,
      prepared_from: "main",
    };
    const patchRes = await supabaseFetch(`/rest/v1/announcement_drafts?announcement_key=eq.${encodeURIComponent(key)}`, token, {
      method: "PATCH",
      body: JSON.stringify({ baseline_snapshot: baseline, prepared_at: new Date().toISOString(), prepared_by: user.id }),
    });
    if (!patchRes.ok) return json(res, 500, { error: "Could not persist Announcement preparation baseline." });

    return json(res, 200, { ok: true, prepared: true, announcement_key: key, source_sha: source.sha });
  } catch (error) {
    return json(res, 500, { error: error.message || String(error) });
  }
};
