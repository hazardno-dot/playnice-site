import { supabaseRestHeaders } from "../lib/supabase-server-auth.mjs";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const json = (res, status, body) => {
  res.setHeader("Cache-Control", "no-store");
  return res.status(status).json(body);
};

async function safeJson(response) {
  const text = await response.text();
  if (!text) return null;
  try { return JSON.parse(text); } catch { return { message: text.slice(0, 300) }; }
}

async function userFetch(path, token, init = {}) {
  return fetch(SUPABASE_URL + path, {
    ...init,
    headers: supabaseRestHeaders({
      token,
      publishableKey: SUPABASE_KEY,
      extra: init.headers || {}
    })
  });
}


async function authenticate(req) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!token) return { error: [401, "Admin session required."] };

  const userResponse = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${token}` }
  });
  const user = await safeJson(userResponse);
  if (!userResponse.ok || !user?.id) return { error: [401, "Admin session expired."] };

  const adminResponse = await userFetch(
    `/rest/v1/admin_users?user_id=eq.${encodeURIComponent(user.id)}&select=user_id&limit=1`,
    token,
    { method: "GET" }
  );
  const admins = await safeJson(adminResponse);
  if (!adminResponse.ok) {
    return { error: [401, `Admin lookup failed (Supabase ${adminResponse.status}).`] };
  }
  if (!Array.isArray(admins) || !admins.length) {
    return { error: [403, "PlayNice admin access required."] };
  }
  return { token, user };
}

async function readOrders(token) {
  const response = await userFetch(
    "/rest/v1/rpc/get_control_center_orders",
    token,
    { method: "POST", body: "{}" }
  );
  const data = await safeJson(response);
  if (!response.ok) {
    throw new Error(data?.message || data?.hint || "Could not load orders (Supabase " + response.status + ").");
  }
  return {
    orders: Array.isArray(data?.orders) ? data.orders : [],
    events: Array.isArray(data?.events) ? data.events : []
  };
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return json(res, 409, {
      error: "Orders are read-only during the Supabase migration phase. Operational edits still belong in Google Sheets."
    });
  }
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return json(res, 500, { error: "Supabase server configuration is incomplete." });
  }

  const auth = await authenticate(req);
  if (auth.error) return json(res, auth.error[0], { error: auth.error[1] });

  try {
    const data = await readOrders(auth.token);
    return json(res, 200, {
      ok: true,
      mode: "read_only_migration",
      canonical_source: "supabase",
      backup_source: "google_sheets",
      ...data
    });
  } catch (error) {
    return json(res, 500, { error: String(error?.message || error).slice(0, 400) });
  }
}
