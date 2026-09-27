// Production redeploy trigger: env refresh.
import { supabaseRestHeaders } from "../lib/supabase-server-auth.mjs";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const SHEET_SYNC_URL = String(
  process.env.ORDERS_SHEET_SYNC_URL ||
  process.env.GOOGLE_SCRIPT_ORDERS_URL ||
  ""
).trim();
const SHEET_SYNC_SECRET = String(process.env.ORDERS_SHEET_SYNC_SECRET || "").trim();
const WRITE_THROUGH_ENABLED =
  String(process.env.ORDERS_WRITE_THROUGH_ENABLED || "").trim().toLowerCase() === "true" &&
  Boolean(SHEET_SYNC_URL) &&
  Boolean(SHEET_SYNC_SECRET);

const json = (res, status, body) => {
  res.setHeader("Cache-Control", "no-store");
  return res.status(status).json(body);
};

async function safeJson(response) {
  const text = await response.text();
  if (!text) return null;
  try { return JSON.parse(text); }
  catch { return { message: text.slice(0, 300) }; }
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
  if (!adminResponse.ok) return { error: [401, `Admin lookup failed (Supabase ${adminResponse.status}).`] };
  if (!Array.isArray(admins) || !admins.length) return { error: [403, "PlayNice admin access required."] };
  return { token, user };
}

async function rpc(name, token, body = {}) {
  const response = await userFetch(
    "/rest/v1/rpc/" + encodeURIComponent(name),
    token,
    { method: "POST", body: JSON.stringify(body) }
  );
  const data = await safeJson(response);
  if (!response.ok) throw new Error(data?.message || data?.hint || `${name} failed (Supabase ${response.status}).`);
  return data;
}

async function readOrders(token) {
  const data = await rpc("get_control_center_orders", token, {});
  return {
    orders: Array.isArray(data?.orders) ? data.orders : [],
    events: Array.isArray(data?.events) ? data.events : []
  };
}

async function readOrderAnalytics(token) {
  return rpc("get_control_center_order_analytics", token, {});
}

function legacyStatusFor(status) {
  if (status === "PACKED") return "NEW";
  if (status === "DELIVERED" || status === "OUT_FOR_DELIVERY") return "SHIPPED";
  return status;
}

function buildMirror(order) {
  return {
    source: "order_state_sync",
    orderId: order.order_id,
    checkoutFingerprint: order.checkout_fingerprint || "",
    fulfillmentStatus: order.status,
    legacyStatus: legacyStatusFor(order.status),
    trackingNumber: order.tracking_number || "",
    courierPaid: order.courier_payment_status || "N/A",
    courierPaidAt: order.courier_paid_at || null,
    deliveryIssue: order.delivery_issue || "",
    stateVersion: Number(order.sheet_state_version || 0)
  };
}

async function syncMirror(mirror) {
  const response = await fetch(SHEET_SYNC_URL, {
    method: "POST",
    redirect: "follow",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ ...mirror, syncSecret: SHEET_SYNC_SECRET }),
    signal: AbortSignal.timeout(15000)
  });
  const data = await safeJson(response);
  if (
    !response.ok ||
    data?.status !== "ok" ||
    data?.type !== "order_state_sync" ||
    data?.orderId !== mirror.orderId ||
    Number(data?.stateVersion) !== Number(mirror.stateVersion)
  ) {
    throw new Error(data?.message || `Google Sheets mirror returned an unexpected response (${response.status}).`);
  }
  return data;
}

async function markMirror(token, orderId, stateVersion, status, error = null, alertEmailStatus = null) {
  return rpc("mark_control_center_order_sheet_sync", token, {
    p_record_id: orderId,
    p_state_version: Number(stateVersion),
    p_status: status,
    p_error: error,
    p_alert_email_status: alertEmailStatus
  });
}

async function mirrorWithAudit(token, order, mirror) {
  try {
    const sheetResult = await syncMirror(mirror);
    await markMirror(token, order.id, mirror.stateVersion, "synced", null, sheetResult?.alertEmailSent || null);
    return { mirror_status: "synced", mirror_warning: null };
  } catch (error) {
    const message = String(error?.message || error).slice(0, 400);
    try {
      await markMirror(token, order.id, mirror.stateVersion, "failed", message);
    } catch (markError) {
      console.error("Orders mirror audit mark failed", markError);
    }
    return {
      mirror_status: "failed",
      mirror_warning: "Supabase was updated, but Google Sheets backup sync failed: " + message
    };
  }
}

async function mutateOrder(token, body) {
  const action = String(body?.action || "").trim();
  const id = String(body?.id || "").trim();
  if (!id) throw new Error("Missing order id.");

  let value = "";
  if (action === "set_status") value = String(body?.status || "").trim();
  else if (action === "save_tracking") value = String(body?.tracking_number || "").trim();
  else if (action === "set_courier_payment") value = String(body?.status || "").trim();
  else if (action === "set_delivery_issue") value = String(body?.delivery_issue || "").trim();
  else throw new Error("Unknown order action.");

  if (action === "set_courier_payment" && value === "PENDING") {
    const current = await readOrders(token);
    const currentOrder = current.orders.find((item) => item.id === id);
    if (currentOrder?.courier_batch_id) {
      throw new Error("Batched courier settlements cannot be reopened per order.");
    }
  }

  const mutation = await rpc("update_control_center_order", token, {
    p_record_id: id,
    p_action: action,
    p_value: value,
    p_note: body?.note ? String(body.note).slice(0, 500) : null
  });

  if (!mutation?.order?.id || !mutation?.mirror) throw new Error("Supabase order mutation returned an incomplete result.");

  return {
    order: mutation.order,
    ...(await mirrorWithAudit(token, mutation.order, mutation.mirror))
  };
}

async function retryMirror(token, body) {
  const id = String(body?.id || "").trim();
  if (!id) throw new Error("Missing order id.");
  const current = await readOrders(token);
  const order = current.orders.find((item) => item.id === id);
  if (!order) throw new Error("Order not found.");
  return {
    order,
    ...(await mirrorWithAudit(token, order, buildMirror(order)))
  };
}

async function settleCourierBatch(token, body) {
  const orderIds = Array.isArray(body?.order_ids)
    ? [...new Set(body.order_ids.map((id) => String(id || "").trim()).filter(Boolean))]
    : [];
  if (!orderIds.length) throw new Error("Select at least one delivered COD order.");

  const settlement = await rpc("settle_control_center_courier_batch", token, {
    p_order_ids: orderIds
  });
  const batchOrders = Array.isArray(settlement?.orders) ? settlement.orders : [];
  if (!settlement?.batch_id || batchOrders.length !== orderIds.length) {
    throw new Error("Courier settlement returned an incomplete result.");
  }

  const mirrorWarnings = [];
  for (const order of batchOrders) {
    const mirrorResult = await mirrorWithAudit(token, order, buildMirror(order));
    if (mirrorResult.mirror_warning) mirrorWarnings.push(order.order_id + ": " + mirrorResult.mirror_warning);
  }

  return {
    settlement: {
      batch_id: settlement.batch_id,
      settled_at: settlement.settled_at,
      order_count: settlement.order_count,
      total: settlement.total
    },
    mirror_status: mirrorWarnings.length ? "partial" : "synced",
    mirror_warning: mirrorWarnings.length
      ? "Settlement saved in Supabase, but some Google Sheets mirrors need retry: " + mirrorWarnings.join(" | ")
      : null
  };
}

export default async function handler(req, res) {
  if (!["GET", "POST"].includes(req.method)) return json(res, 405, { error: "Method not allowed." });
  if (!SUPABASE_URL || !SUPABASE_KEY) return json(res, 500, { error: "Supabase server configuration is incomplete." });

  const auth = await authenticate(req);
  if (auth.error) return json(res, auth.error[0], { error: auth.error[1] });

  try {
    if (req.method === "GET") {
      if (String(req.query?.view || "").trim().toLowerCase() === "analytics") {
        return json(res, 200, {
          ok: true,
          analytics: await readOrderAnalytics(auth.token)
        });
      }

      const data = await readOrders(auth.token);
      return json(res, 200, {
        ok: true,
        mode: WRITE_THROUGH_ENABLED ? "write_through_v1" : "read_only_migration",
        write_enabled: WRITE_THROUGH_ENABLED,
        canonical_source: "supabase",
        backup_source: "google_sheets",
        ...data
      });
    }

    if (!WRITE_THROUGH_ENABLED) {
      return json(res, 409, {
        error: "Order write-through is not enabled yet. Configure the Google Sheets mirror before changing orders in Control Center."
      });
    }

    const action = String(req.body?.action || "").trim();
    const result = action === "retry_sheet_sync"
      ? await retryMirror(auth.token, req.body)
      : action === "settle_courier_batch"
        ? await settleCourierBatch(auth.token, req.body)
        : await mutateOrder(auth.token, req.body);
    const data = await readOrders(auth.token);

    return json(res, 200, {
      ok: true,
      mode: "write_through_v1",
      write_enabled: true,
      canonical_source: "supabase",
      backup_source: "google_sheets",
      ...result,
      ...data
    });
  } catch (error) {
    return json(res, 400, { error: String(error?.message || error).slice(0, 500) });
  }
}
