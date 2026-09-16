const META_GRAPH_API_VERSION = String(process.env.META_GRAPH_API_VERSION || "v26.0").trim();
const META_FACEBOOK_PAGE_ID = String(process.env.META_FACEBOOK_PAGE_ID || "").trim();
const META_SYSTEM_USER_ACCESS_TOKEN = String(process.env.META_SYSTEM_USER_ACCESS_TOKEN || "").trim();
const META_PAGE_ACCESS_TOKEN = String(process.env.META_PAGE_ACCESS_TOKEN || "").trim();

async function safeJson(response) {
  const text = await response.text();
  if (!text) return null;
  try { return JSON.parse(text); } catch { return { message: text.slice(0, 300) }; }
}

export function metaCredentialState() {
  return {
    system_user_token: Boolean(META_SYSTEM_USER_ACCESS_TOKEN),
    page_access_token: Boolean(META_PAGE_ACCESS_TOKEN),
    facebook_page_id: Boolean(META_FACEBOOK_PAGE_ID),
    graph_api_version: Boolean(META_GRAPH_API_VERSION),
  };
}

export async function resolveMetaPageAccessToken() {
  if (!META_FACEBOOK_PAGE_ID) throw new Error("META_FACEBOOK_PAGE_ID is not configured.");

  if (META_SYSTEM_USER_ACCESS_TOKEN) {
    const fields = "id,name,access_token,instagram_business_account{id,username}";
    const url = new URL(`https://graph.facebook.com/${META_GRAPH_API_VERSION}/${encodeURIComponent(META_FACEBOOK_PAGE_ID)}`);
    url.searchParams.set("fields", fields);
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${META_SYSTEM_USER_ACCESS_TOKEN}`,
        Accept: "application/json",
      },
    });
    const payload = await safeJson(response);
    if (!response.ok) {
      const message = payload?.error?.message || payload?.message || `Meta Graph returned HTTP ${response.status}`;
      const code = payload?.error?.code ? ` (code ${payload.error.code})` : "";
      throw new Error(`Could not derive Page access token from System User: ${message}${code}`);
    }
    if (String(payload?.id || "") !== META_FACEBOOK_PAGE_ID) throw new Error("Derived Meta Page does not match META_FACEBOOK_PAGE_ID.");
    const token = String(payload?.access_token || "").trim();
    if (!token) throw new Error("System User can reach the Page but Meta did not return a Page access token.");
    return {
      token,
      source: "system_user",
      page: { id: String(payload.id), name: String(payload.name || "") },
      instagram_account: payload?.instagram_business_account || null,
    };
  }

  if (META_PAGE_ACCESS_TOKEN) {
    return {
      token: META_PAGE_ACCESS_TOKEN,
      source: "page_env_fallback",
      page: { id: META_FACEBOOK_PAGE_ID, name: "" },
      instagram_account: null,
    };
  }

  throw new Error("No Meta Page credential is configured. Set META_SYSTEM_USER_ACCESS_TOKEN or META_PAGE_ACCESS_TOKEN.");
}
