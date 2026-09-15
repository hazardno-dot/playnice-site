import { metaCredentialState, resolveMetaPageAccessToken } from "../lib/meta-page-token.mjs";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const META_GRAPH_API_VERSION = String(process.env.META_GRAPH_API_VERSION || "").trim();
const META_APP_ID = String(process.env.META_APP_ID || "").trim();
const META_APP_SECRET = String(process.env.META_APP_SECRET || "").trim();
const META_FACEBOOK_PAGE_ID = String(process.env.META_FACEBOOK_PAGE_ID || "").trim();
const META_INSTAGRAM_ACCOUNT_ID = String(process.env.META_INSTAGRAM_ACCOUNT_ID || "").trim();

const REQUIRED_PERMISSIONS = [
  "pages_show_list",
  "pages_read_engagement",
  "pages_manage_posts",
  "instagram_basic",
  "instagram_content_publish",
];

const json = (res, status, body) => res.status(status).json(body);

async function safeJson(response) {
  const text = await response.text();
  if (!text) return null;
  try { return JSON.parse(text); } catch { return { message: text.slice(0, 220) }; }
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

async function requireAdmin(req) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!token) return { error: "Missing admin session.", status: 401 };
  const adminRes = await supabaseFetch("/rest/v1/admin_users?select=user_id&limit=1", token);
  const admins = await safeJson(adminRes);
  if (!adminRes.ok) return { error: `Invalid admin session (Supabase ${adminRes.status}).`, status: 401 };
  if (!Array.isArray(admins) || !admins[0]?.user_id) return { error: "This account is not authorized.", status: 403 };
  return { token, userId: admins[0].user_id };
}

function envState() {
  const credential = metaCredentialState();
  const values = {
    graph_api_version: Boolean(META_GRAPH_API_VERSION),
    app_id: Boolean(META_APP_ID),
    app_secret: Boolean(META_APP_SECRET),
    facebook_page_id: Boolean(META_FACEBOOK_PAGE_ID),
    system_user_access_token: credential.system_user_token,
    page_access_token: credential.page_access_token,
    instagram_account_id: Boolean(META_INSTAGRAM_ACCOUNT_ID),
  };
  const connectionReady = values.graph_api_version && values.facebook_page_id && (values.system_user_access_token || values.page_access_token);
  const oauthReady = values.graph_api_version && values.app_id && values.app_secret;
  return { values, connectionReady, oauthReady };
}

async function graph(path, token) {
  const separator = path.includes("?") ? "&" : "?";
  const response = await fetch(`https://graph.facebook.com/${META_GRAPH_API_VERSION}/${path}${separator}access_token=${encodeURIComponent(token)}`, {
    headers: { Accept: "application/json" },
  });
  const payload = await safeJson(response);
  return { response, payload };
}

export default async function handler(req, res) {
  if (req.method !== "GET") return json(res, 405, { error: "Method not allowed" });
  if (!SUPABASE_URL || !SUPABASE_KEY) return json(res, 500, { error: "Server configuration is incomplete." });

  const auth = await requireAdmin(req);
  if (auth.error) return json(res, auth.status, { error: auth.error });

  const env = envState();
  const base = {
    ok: true,
    mode: "connection_test_only",
    publish_enabled: false,
    required_permissions: REQUIRED_PERMISSIONS,
    env: env.values,
  };

  if (!env.connectionReady) {
    return json(res, 200, {
      ...base,
      status: env.oauthReady ? "partial" : "not_configured",
      graph_verified: false,
      credential_source: null,
      facebook_page: null,
      instagram_account: null,
    });
  }

  try {
    const resolved = await resolveMetaPageAccessToken();
    const fields = "id,name,instagram_business_account{id,username}";
    const { response, payload } = await graph(`${encodeURIComponent(META_FACEBOOK_PAGE_ID)}?fields=${encodeURIComponent(fields)}`, resolved.token);
    if (!response.ok) {
      return json(res, 200, {
        ...base,
        status: "invalid_connection",
        graph_verified: false,
        credential_source: resolved.source,
        graph_error: {
          status: response.status,
          code: payload?.error?.code || null,
          type: payload?.error?.type || null,
          message: String(payload?.error?.message || "Meta Graph request failed.").slice(0, 220),
        },
      });
    }

    const instagram = payload?.instagram_business_account || null;
    const expectedMatches = !META_INSTAGRAM_ACCOUNT_ID || String(instagram?.id || "") === META_INSTAGRAM_ACCOUNT_ID;
    const connected = Boolean(payload?.id && instagram?.id && expectedMatches);

    return json(res, 200, {
      ...base,
      status: connected ? "connected" : "partial",
      graph_verified: true,
      credential_source: resolved.source,
      facebook_page: payload?.id ? { id: String(payload.id), name: String(payload.name || "") } : null,
      instagram_account: instagram?.id ? { id: String(instagram.id), username: String(instagram.username || "") } : null,
      instagram_expected_match: expectedMatches,
    });
  } catch (error) {
    return json(res, 200, {
      ...base,
      status: "invalid_connection",
      graph_verified: false,
      credential_source: metaCredentialState().system_user_token ? "system_user" : "page_env_fallback",
      graph_error: { message: String(error?.message || error).slice(0, 220) },
    });
  }
}
