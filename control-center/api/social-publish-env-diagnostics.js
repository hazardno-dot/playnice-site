const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const json = (res, status, body) => res.status(status).json(body);
const safeFlag = (name) => String(process.env[name] || "").trim().toLowerCase() === "true";

async function safeJson(response) {
  const text = await response.text();
  if (!text) return null;
  try { return JSON.parse(text); } catch { return null; }
}

async function requireAdmin(req) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!token) return { error: "Missing admin session.", status: 401 };

  const response = await fetch(`${SUPABASE_URL}/rest/v1/admin_users?select=user_id&limit=1`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  const rows = await safeJson(response);
  if (!response.ok) return { error: `Invalid admin session (Supabase ${response.status}).`, status: 401 };
  if (!Array.isArray(rows) || !rows[0]?.user_id) return { error: "This account is not authorized.", status: 403 };
  return { ok: true };
}

export default async function handler(req, res) {
  if (req.method !== "GET") return json(res, 405, { error: "Method not allowed" });
  if (!SUPABASE_URL || !SUPABASE_KEY) return json(res, 500, { error: "Server configuration is incomplete." });

  const auth = await requireAdmin(req);
  if (auth.error) return json(res, auth.status, { error: auth.error });

  return json(res, 200, {
    ok: true,
    environment: {
      vercel_env: process.env.VERCEL_ENV || null,
      vercel_target_env: process.env.VERCEL_TARGET_ENV || null,
      git_ref: process.env.VERCEL_GIT_COMMIT_REF || null,
      git_sha: process.env.VERCEL_GIT_COMMIT_SHA || null,
    },
    flags: {
      instagram_feed: safeFlag("META_TEST_PUBLISH_INSTAGRAM_FEED_ENABLED"),
      instagram_story: safeFlag("META_TEST_PUBLISH_INSTAGRAM_STORY_ENABLED"),
      facebook: safeFlag("META_TEST_PUBLISH_FACEBOOK_ENABLED"),
    },
  });
}
