const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = "hazardno-dot";
const REPO_NAME = "playnice-site";
const JOURNAL_PATH = "playnice-site/src/data/journal/index.js";

const json = (res, status, body) => res.status(status).json(body);

async function safeJson(response) {
  const text = await response.text();
  if (!text) return null;
  try { return JSON.parse(text); } catch { return null; }
}

async function supabaseFetch(path, token, init = {}) {
  return fetch(`${SUPABASE_URL}${path}`, {
    ...init,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
}

async function requireAdmin(req) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!token) return { error: "Missing admin session.", status: 401 };
  const response = await supabaseFetch("/rest/v1/admin_users?select=user_id&limit=1", token);
  const rows = await safeJson(response);
  if (!response.ok || !Array.isArray(rows) || !rows[0]?.user_id) return { error: "This account is not authorized.", status: 403 };
  return { token };
}

async function github(path) {
  if (!GITHUB_TOKEN) throw new Error("GitHub server configuration is incomplete for Journal catalog.");
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

async function loadJournalArticles() {
  const file = await github(`/repos/${OWNER}/${REPO_NAME}/contents/${JOURNAL_PATH}?ref=main`);
  const source = Buffer.from(file.content || "", "base64").toString("utf8");
  const moduleUrl = `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`;
  const liveModule = await import(moduleUrl);
  return Array.isArray(liveModule?.journalArticles) ? liveModule.journalArticles : [];
}

export default async function handler(req, res) {
  if (req.method !== "GET") return json(res, 405, { error: "Method not allowed" });
  if (!SUPABASE_URL || !SUPABASE_KEY) return json(res, 500, { error: "Server configuration is incomplete." });

  try {
    const auth = await requireAdmin(req);
    if (auth.error) return json(res, auth.status, { error: auth.error });

    const sourceType = String(req.query?.source_type || "").trim().toLowerCase();
    if (sourceType === "hero") {
      const response = await supabaseFetch("/rest/v1/hero_slides?select=id,hero_key,kind,enabled,image,desktop_image,mobile_image,alt,updated_at&order=updated_at.desc&limit=200", auth.token);
      const rows = await safeJson(response);
      if (!response.ok) throw new Error(`Could not load Hero catalog (${response.status}).`);
      const items = (Array.isArray(rows) ? rows : []).map((row) => ({
        id: row.id,
        key: row.hero_key,
        title: row.alt || row.hero_key,
        subtitle: [row.kind, row.enabled ? "LIVE" : "OFF"].filter(Boolean).join(" · "),
        image: row.mobile_image || row.desktop_image || row.image || "",
        updated_at: row.updated_at,
      }));
      return json(res, 200, { ok: true, source_type: "hero", items });
    }

    if (sourceType === "journal") {
      const articles = await loadJournalArticles();
      const items = [...articles]
        .sort((a, b) => Number(b?.id || 0) - Number(a?.id || 0))
        .map((article) => ({
          id: String(article.id),
          key: String(article.id),
          title: article?.title?.sr || article?.title?.en || `Journal #${article.id}`,
          subtitle: article?.date?.sr || article?.date?.en || "",
          image: article.image || "",
        }));
      return json(res, 200, { ok: true, source_type: "journal", items });
    }

    return json(res, 400, { error: "Unsupported Social source catalog." });
  } catch (error) {
    return json(res, 400, { error: error?.message || "Could not load Social source catalog." });
  }
}
