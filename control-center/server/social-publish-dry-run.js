import { buildInstagramFeedDryRun } from "../src/metaPublishAdapter.mjs";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const json = (res, status, body) => res.status(status).json(body);
const TRANSIENT_SUPABASE_STATUSES = new Set([502, 503, 504]);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function safeJson(response) {
  const text = await response.text();
  if (!text) return null;
  try { return JSON.parse(text); } catch { return { message: text.slice(0, 180) }; }
}

async function fetchAdminUser(token) {
  const run = () => fetch(`${SUPABASE_URL}/rest/v1/admin_users?select=user_id&limit=1`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  let response = await run();
  if (TRANSIENT_SUPABASE_STATUSES.has(response.status)) {
    await sleep(350);
    response = await run();
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
  if (!Array.isArray(admins) || !admins.length || !admins[0]?.user_id) {
    return { error: "This account is not authorized.", status: 403 };
  }
  return { user: { id: admins[0].user_id } };
}

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });

  const admin = await requireAdmin(req);
  if (admin.error) return json(res, admin.status, { error: admin.error });

  try {
    const content = req.body?.content;
    if (!content || typeof content !== "object") return json(res, 400, { error: "Instagram Feed content is required." });

    const dryRun = buildInstagramFeedDryRun({ content: { instagram_feed: content } });
    return json(res, 200, {
      ok: true,
      mode: "dry_run",
      publish_enabled: false,
      dry_run: dryRun,
    });
  } catch (error) {
    return json(res, 400, { error: error?.message || String(error) });
  }
}
