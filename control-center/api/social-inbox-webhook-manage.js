import { createHmac } from "node:crypto";
import { metaCredentialState, resolveMetaPageAccessToken } from "../lib/meta-page-token.mjs";
import { sendAssistantTelegramTest, telegramAssistantState } from "../lib/social-inbox-notify.mjs";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const SUPABASE_SERVICE_ROLE_KEY = String(process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
const GITHUB_TOKEN = String(process.env.GITHUB_TOKEN || "").trim();
const META_GRAPH_API_VERSION = String(process.env.META_GRAPH_API_VERSION || "v26.0").trim();
const META_APP_ID = String(process.env.META_APP_ID || "").trim();
const META_APP_SECRET = String(process.env.META_APP_SECRET || "").trim();
const META_FACEBOOK_PAGE_ID = String(process.env.META_FACEBOOK_PAGE_ID || "").trim();

const json = (res, status, body) => res.status(status).json(body);

async function safeJson(response) {
  const text = await response.text();
  if (!text) return null;
  try { return JSON.parse(text); } catch { return { message: text.slice(0, 400) }; }
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

  const response = await supabaseFetch("/rest/v1/admin_users?select=user_id&limit=1", token);
  const admins = await safeJson(response);
  if (!response.ok) return { error: `Invalid admin session (Supabase ${response.status}).`, status: 401 };
  if (!Array.isArray(admins) || !admins[0]?.user_id) return { error: "This account is not authorized.", status: 403 };
  return { token };
}

function webhookToken() {
  if (!META_APP_SECRET || !META_FACEBOOK_PAGE_ID) return "";
  return createHmac("sha256", META_APP_SECRET)
    .update(`playnice-social-inbox-v2:${META_FACEBOOK_PAGE_ID}`)
    .digest("hex");
}

function baseUrl(req) {
  const configured = String(process.env.PLAYNICE_CONTROL_CENTER_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL || "").trim();
  if (configured) return configured.startsWith("http") ? configured.replace(/\/$/, "") : `https://${configured.replace(/\/$/, "")}`;
  const host = String(req.headers["x-forwarded-host"] || req.headers.host || "").trim();
  const proto = String(req.headers["x-forwarded-proto"] || "https").split(",")[0].trim();
  return host ? `${proto}://${host}` : "";
}

async function metaRequest(path, { method = "GET", token = "", form = null } = {}) {
  const url = new URL(`https://graph.facebook.com/${META_GRAPH_API_VERSION}/${path.replace(/^\/+/, "")}`);
  const init = {
    method,
    headers: { Accept: "application/json" },
  };
  if (token) init.headers.Authorization = `Bearer ${token}`;
  if (form) {
    init.headers["Content-Type"] = "application/x-www-form-urlencoded";
    init.body = new URLSearchParams(form).toString();
  }
  const response = await fetch(url, init);
  const payload = await safeJson(response);
  if (!response.ok) {
    const error = new Error(payload?.error?.message || payload?.message || `Meta Graph returned HTTP ${response.status}`);
    error.status = response.status;
    error.metaCode = payload?.error?.code || null;
    throw error;
  }
  return payload || {};
}

async function appAccessToken() {
  if (!META_APP_ID || !META_APP_SECRET) throw new Error("META_APP_ID / META_APP_SECRET are not configured.");
  const url = new URL(`https://graph.facebook.com/${META_GRAPH_API_VERSION}/oauth/access_token`);
  url.searchParams.set("client_id", META_APP_ID);
  url.searchParams.set("client_secret", META_APP_SECRET);
  url.searchParams.set("grant_type", "client_credentials");
  const response = await fetch(url, { headers: { Accept: "application/json" } });
  const payload = await safeJson(response);
  if (!response.ok || !payload?.access_token) {
    throw new Error(payload?.error?.message || payload?.message || "Could not obtain Meta App access token.");
  }
  return String(payload.access_token);
}

async function subscriptionState(req) {
  const telegram = telegramAssistantState();
  const credential = metaCredentialState();
  const env = {
    production: process.env.VERCEL_ENV === "production",
    supabase_service_role: Boolean(SUPABASE_SERVICE_ROLE_KEY),
    github_catalog: Boolean(GITHUB_TOKEN),
    meta_app_id: Boolean(META_APP_ID),
    meta_app_secret: Boolean(META_APP_SECRET),
    facebook_page_id: Boolean(META_FACEBOOK_PAGE_ID),
    meta_page_credential: Boolean(credential.system_user_token || credential.page_access_token),
    telegram: telegram.configured,
  };

  const result = {
    env,
    callback_path: "/api/social-inbox-webhook",
    app_subscription: false,
    page_subscription: false,
    fields: ["messages"],
    status_errors: [],
  };

  if (!env.meta_app_id || !env.meta_app_secret || !env.facebook_page_id || !env.meta_page_credential) {
    return result;
  }

  try {
    const appToken = await appAccessToken();
    const subscriptions = await metaRequest(`${encodeURIComponent(META_APP_ID)}/subscriptions`, { token: appToken });
    const expectedBase = `${baseUrl(req)}/api/social-inbox-webhook`;
    result.app_subscription = (Array.isArray(subscriptions?.data) ? subscriptions.data : []).some((item) => {
      const callback = String(item?.callback_url || "");
      const fields = Array.isArray(item?.fields) ? item.fields : [];
      return item?.object === "page" && callback.startsWith(expectedBase) && fields.includes("messages");
    });
  } catch (error) {
    result.status_errors.push(`App subscription: ${String(error?.message || error).slice(0, 180)}`);
  }

  try {
    const page = await resolveMetaPageAccessToken();
    const subscriptions = await metaRequest(
      `${encodeURIComponent(META_FACEBOOK_PAGE_ID)}/subscribed_apps?fields=id,name,subscribed_fields`,
      { token: page.token }
    );
    result.page_subscription = (Array.isArray(subscriptions?.data) ? subscriptions.data : []).some((item) => {
      const fields = Array.isArray(item?.subscribed_fields) ? item.subscribed_fields : [];
      return String(item?.id || "") === META_APP_ID && fields.includes("messages");
    });
  } catch (error) {
    result.status_errors.push(`Page subscription: ${String(error?.message || error).slice(0, 180)}`);
  }

  return result;
}

async function activate(req) {
  if (process.env.VERCEL_ENV !== "production") {
    const error = new Error("Webhook activation is allowed only from the production Control Center.");
    error.status = 409;
    throw error;
  }
  const secret = webhookToken();
  const root = baseUrl(req);
  if (!secret || !root) throw new Error("Webhook callback configuration is incomplete.");

  const callbackUrl = `${root}/api/social-inbox-webhook?k=${encodeURIComponent(secret)}`;
  const appToken = await appAccessToken();

  await metaRequest(`${encodeURIComponent(META_APP_ID)}/subscriptions`, {
    method: "POST",
    token: appToken,
    form: {
      object: "page",
      callback_url: callbackUrl,
      fields: "messages",
      verify_token: secret,
      include_values: "true",
    },
  });

  const page = await resolveMetaPageAccessToken();
  await metaRequest(`${encodeURIComponent(META_FACEBOOK_PAGE_ID)}/subscribed_apps`, {
    method: "POST",
    token: page.token,
    form: { subscribed_fields: "messages" },
  });

  return subscriptionState(req);
}

export default async function handler(req, res) {
  if (!["GET", "POST"].includes(req.method)) return json(res, 405, { error: "Method not allowed" });
  if (!SUPABASE_URL || !SUPABASE_KEY) return json(res, 500, { error: "Server configuration is incomplete." });

  const auth = await requireAdmin(req);
  if (auth.error) return json(res, auth.status, { error: auth.error });

  if (req.method === "GET") {
    const state = await subscriptionState(req);
    return json(res, 200, {
      ok: true,
      ...state,
      assistant_ready: Boolean(
        state.env.supabase_service_role &&
        state.env.github_catalog &&
        state.env.facebook_page_id &&
        state.env.meta_page_credential
      ),
      webhook_ready: Boolean(
        state.env.supabase_service_role &&
        state.env.github_catalog &&
        state.env.meta_app_id &&
        state.env.meta_app_secret &&
        state.env.facebook_page_id &&
        state.env.meta_page_credential
      ),
      notification_ready: state.env.telegram,
      automation_active: Boolean(state.app_subscription && state.page_subscription),
      auto_send: false,
    });
  }

  if (String(req.body?.action || "") === "test_telegram") {
    const result = await sendAssistantTelegramTest({ baseUrl: baseUrl(req) });
    if (!result.ok) return json(res, 400, { ...result, auto_send: false });
    return json(res, 200, { ...result, auto_send: false });
  }

  try {
    const state = await activate(req);
    return json(res, 200, {
      ok: true,
      ...state,
      assistant_ready: Boolean(
        state.env.supabase_service_role &&
        state.env.github_catalog &&
        state.env.facebook_page_id &&
        state.env.meta_page_credential
      ),
      webhook_ready: Boolean(
        state.env.supabase_service_role &&
        state.env.github_catalog &&
        state.env.meta_app_id &&
        state.env.meta_app_secret &&
        state.env.facebook_page_id &&
        state.env.meta_page_credential
      ),
      notification_ready: state.env.telegram,
      automation_active: Boolean(state.app_subscription && state.page_subscription),
      auto_send: false,
    });
  } catch (error) {
    return json(res, error?.status || 400, {
      error: String(error?.message || error).slice(0, 300),
      meta_code: error?.metaCode || null,
      auto_send: false,
    });
  }
}
