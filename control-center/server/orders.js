import { supabaseRestHeaders } from "../lib/supabase-server-auth.mjs";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const SUPABASE_SECRET_KEY = String(process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();

const ORDER_SELECT = [
  "id","order_id","tracking_number","status","source_payload","created_at","updated_at",
  "packed_at","shipped_at","out_for_delivery_at","delivered_at","cancelled_at",
  "courier_payment_status","courier_paid_at","courier_batch_id"
].join(",");

const STATUSES = new Set([
  "NEW","PACKED","SHIPPED","OUT_FOR_DELIVERY","DELIVERED","DELIVERY_FAILED","RETURNED","CANCELLED"
]);

const TRANSITIONS = {
  NEW: new Set(["PACKED","CANCELLED"]),
  PACKED: new Set(["SHIPPED","CANCELLED"]),
  SHIPPED: new Set(["OUT_FOR_DELIVERY","DELIVERED","DELIVERY_FAILED","RETURNED"]),
  OUT_FOR_DELIVERY: new Set(["DELIVERED","DELIVERY_FAILED","RETURNED"]),
  DELIVERY_FAILED: new Set(["OUT_FOR_DELIVERY","RETURNED"]),
  DELIVERED: new Set([]),
  RETURNED: new Set([]),
  CANCELLED: new Set([])
};

const STATUS_TIMESTAMP = {
  PACKED: "packed_at",
  SHIPPED: "shipped_at",
  OUT_FOR_DELIVERY: "out_for_delivery_at",
  DELIVERED: "delivered_at",
  CANCELLED: "cancelled_at"
};

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

async function serverFetch(path, init = {}) {
  return fetch(SUPABASE_URL + path, {
    ...init,
    headers: supabaseRestHeaders({
      token: SUPABASE_SECRET_KEY,
      publishableKey: SUPABASE_KEY,
      serverKey: SUPABASE_SECRET_KEY,
      extra: init.headers || {}
    })
  });
}

async function authenticate(req) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!token) return { error: [401, "Missing admin session."] };

  const userResponse = await userFetch("/auth/v1/user", token, { method: "GET" });
  const user = await safeJson(userResponse);
  if (!userResponse.ok || !user?.id) return { error: [401, "Invalid admin session."] };

  const adminResponse = await userFetch(
    "/rest/v1/admin_users?user_id=eq." + encodeURIComponent(user.id) + "&select=user_id&limit=1",
    token,
    { method: "GET" }
  );
  const admins = await safeJson(adminResponse);
  if (!adminResponse.ok || !Array.isArray(admins) || !admins.length) {
    return { error: [403, "This account is not authorized for Orders."] };
  }
  return { token, user };
}

async function readOrders() {
  const ordersResponse = await serverFetch(
    "/rest/v1/checkout_orders?select=" + encodeURIComponent(ORDER_SELECT) +
    "&environment=eq.production&order=created_at.desc&limit=250",
    { method: "GET" }
  );
  const orders = await safeJson(ordersResponse);
  if (!ordersResponse.ok) throw new Error("Could not load orders (Supabase " + ordersResponse.status + ").");

  const eventsResponse = await serverFetch(
    "/rest/v1/order_status_events?select=id,order_id,status,note,source,created_at&order=created_at.asc&limit=1000",
    { method: "GET" }
  );
  const events = await safeJson(eventsResponse);
  if (!eventsResponse.ok) throw new Error("Could not load order timeline (Supabase " + eventsResponse.status + ").");

  return {
    orders: Array.isArray(orders) ? orders : [],
    events: Array.isArray(events) ? events : []
  };
}

async function readOrder(id) {
  const response = await serverFetch(
    "/rest/v1/checkout_orders?id=eq." + encodeURIComponent(id) + "&select=" + encodeURIComponent(ORDER_SELECT) + "&limit=1",
    { method: "GET" }
  );
  const rows = await safeJson(response);
  if (!response.ok) throw new Error("Could not read order (Supabase " + response.status + ").");
  return Array.isArray(rows) ? rows[0] || null : null;
}

async function patchOrder(id, patch) {
  const response = await serverFetch(
    "/rest/v1/checkout_orders?id=eq." + encodeURIComponent(id),
    {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify(patch)
    }
  );
  const rows = await safeJson(response);
  if (!response.ok) throw new Error("Could not update order (Supabase " + response.status + ").");
  return Array.isArray(rows) ? rows[0] || null : null;
}

async function addEvent(orderId, status, userId, note = null) {
  const response = await serverFetch("/rest/v1/order_status_events", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({
      order_id: orderId,
      status,
      note: note ? String(note).slice(0, 500) : null,
      source: "control_center",
      created_by: userId
    })
  });
  if (!response.ok) throw new Error("Order changed but timeline event could not be saved.");
}

async function setStatus(body, user) {
  const id = String(body?.id || "").trim();
  const next = String(body?.status || "").trim().toUpperCase();
  if (!id || !STATUSES.has(next)) throw new Error("Invalid order status request.");

  const current = await readOrder(id);
  if (!current) throw new Error("Order not found.");
  if (current.status === next) return current;

  const allowed = TRANSITIONS[current.status] || new Set();
  if (!allowed.has(next)) {
    throw new Error("Status cannot move from " + current.status + " to " + next + ".");
  }

  const now = new Date().toISOString();
  const patch = { status: next, updated_at: now };
  if (STATUS_TIMESTAMP[next]) patch[STATUS_TIMESTAMP[next]] = now;
  const updated = await patchOrder(id, patch);
  await addEvent(id, next, user.id, body?.note || null);
  return updated;
}

async function saveTracking(body) {
  const id = String(body?.id || "").trim();
  const tracking = String(body?.tracking_number || "").trim().slice(0, 120);
  if (!id) throw new Error("Missing order id.");
  return patchOrder(id, {
    tracking_number: tracking,
    updated_at: new Date().toISOString()
  });
}

async function setCourierPayment(body) {
  const id = String(body?.id || "").trim();
  const status = String(body?.status || "").trim().toUpperCase();
  if (!id || !["PENDING","PAID"].includes(status)) throw new Error("Invalid courier payment status.");
  return patchOrder(id, {
    courier_payment_status: status,
    courier_paid_at: status === "PAID" ? new Date().toISOString() : null,
    updated_at: new Date().toISOString()
  });
}

export default async function handler(req, res) {
  if (!["GET","POST"].includes(req.method)) return json(res, 405, { error: "Method not allowed" });
  if (!SUPABASE_URL || !SUPABASE_KEY || !SUPABASE_SECRET_KEY) {
    return json(res, 500, { error: "Supabase server configuration is incomplete." });
  }

  const auth = await authenticate(req);
  if (auth.error) return json(res, auth.error[0], { error: auth.error[1] });

  try {
    if (req.method === "GET") {
      const data = await readOrders();
      return json(res, 200, { ok: true, ...data });
    }

    const action = String(req.body?.action || "").trim();
    let order = null;
    if (action === "set_status") order = await setStatus(req.body, auth.user);
    else if (action === "save_tracking") order = await saveTracking(req.body);
    else if (action === "set_courier_payment") order = await setCourierPayment(req.body);
    else return json(res, 400, { error: "Unknown order action." });

    const data = await readOrders();
    return json(res, 200, { ok: true, order, ...data });
  } catch (error) {
    return json(res, 400, { error: String(error?.message || error).slice(0, 400) });
  }
}
