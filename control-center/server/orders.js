// Production redeploy trigger: env refresh.
import { supabaseRestHeaders } from "../lib/supabase-server-auth.mjs";
import { inventoryVerificationSnapshot } from "../lib/inventory-verification-v1.mjs";
import { buildInventoryAnalytics } from "../lib/inventory-accounting.mjs";

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
const ORDER_STORE_URL = SUPABASE_URL ? SUPABASE_URL + "/functions/v1/checkout-order-store" : "";
const SHIPPING_PRICE = 4;
const FREE_SHIPPING_THRESHOLD = 49;
const COURIER_FEE = 4;
const STATUS_EMAIL_URL = String(
  process.env.ORDER_STATUS_EMAIL_URL ||
  "https://www.playniceshop.me/api/order-status-email"
).trim();
const STATUS_EMAIL_ENABLED = process.env.VERCEL_ENV === "production"; // Customer status emails are sent only from production.
const MANUAL_ORDER_SOURCES = new Set(["instagram", "email", "whatsapp", "viber", "phone", "message", "manual"]);

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

async function readCustomerWatches(token) {
  const rows = await rpc("get_control_center_customer_watches", token, {});
  return Array.isArray(rows) ? rows : [];
}

async function readEmailEvents(token) {
  const response = await userFetch(
    "/rest/v1/order_email_events?select=order_id,stage,recipient_role,state,provider_message_id,error_message,created_at&order=created_at.desc&limit=500",
    token, { method: "GET" }
  );
  if (response.status === 404) return { events: [], ready: false }; // migration not applied yet
  const rows = await safeJson(response);
  if (!response.ok) {
    console.warn("Order email audit read unavailable", response.status);
    return { events: [], ready: false };
  }
  return { events: Array.isArray(rows) ? rows : [], ready: true };
}

async function recordEmailEvent(token, orderId, result) {
  if (!["sent", "failed"].includes(result?.status_email_status)) return null;
  const record = {
    order_id: orderId,
    stage: "PACKED",
    recipient_role: "customer",
    state: result.status_email_status === "sent" ? "accepted" : "failed",
    provider_message_id: result.status_email_message_id || null,
    error_message: result.status_email_status === "failed"
      ? String(result.status_email_warning || "Resend request failed").slice(0, 300) : null
  };
  const response = await userFetch("/rest/v1/order_email_events", token, {
    method: "POST",
    headers: { "Content-Type": "application/json", Prefer: "return=minimal" },
    body: JSON.stringify(record)
  });
  if (!response.ok) throw new Error("Email audit write returned HTTP " + response.status);
  return record.state;
}

async function readOrdersWorkspace(token) {
  const [orderData, customerWatches, emailAudit] = await Promise.all([
    readOrders(token),
    readCustomerWatches(token),
    readEmailEvents(token)
  ]);
  return { ...orderData, customer_watches: customerWatches,
    email_events: emailAudit.events, email_tracking_ready: emailAudit.ready };
}

function normalizeWatchEmail(value) {
  return String(value || "").trim().toLowerCase().replace(/\s+/g, "");
}

function normalizeWatchPhone(value) {
  const digits = String(value || "").replace(/\D/g, "");
  return digits.length >= 8 ? digits.slice(-8) : "";
}

function findCustomerWatch(order, watches) {
  const payload = order?.source_payload || {};
  const emailKey = normalizeWatchEmail(payload.email);
  const phoneKey = normalizeWatchPhone(payload.phone);
  return (Array.isArray(watches) ? watches : []).find((watch) =>
    (emailKey && watch.email_key === emailKey) ||
    (phoneKey && watch.phone_key === phoneKey)
  ) || null;
}

async function readInventoryStock(token) {
  const rows = await rpc("get_control_center_inventory_stock", token, {});
  return Array.isArray(rows) ? rows : [];
}

async function readOrderAnalytics(token) {
  const [analytics, inventoryStock, orderData] = await Promise.all([
    rpc("get_control_center_order_analytics", token, {}),
    readInventoryStock(token),
    readOrders(token)
  ]);
  return {
    ...(analytics || {}),
    inventory: buildInventoryAnalytics(orderData.orders, inventoryStock, analytics)
  };
}

async function recordInventoryManualOut(token, body) {
  const quantityMl = Number(body?.quantity_ml);
  if (!Number.isFinite(quantityMl) || quantityMl <= 0 || quantityMl > 5000) throw new Error("Invalid manual removal quantity.");
  return rpc("record_control_center_inventory_manual_out", token, {
    p_product_name: cleanText(body?.product_name, 180),
    p_quantity_ml: quantityMl,
    p_reason: cleanText(body?.reason, 40),
    p_note: cleanText(body?.note, 260) || null
  });
}
async function recordInventoryStock(token, body) {
  const productName = cleanText(body?.product_name, 180);
  const quantityMl = Number(body?.quantity_ml);
  const note = cleanText(body?.note, 300);
  if (!productName) throw new Error("Select a fragrance.");
  if (!Number.isFinite(quantityMl) || quantityMl <= 0 || quantityMl > 5000) throw new Error("Stock quantity must be between 0 and 5000 ml.");
  return rpc("record_control_center_inventory_stock", token, {
    p_product_name: productName,
    p_quantity_ml: quantityMl,
    p_note: note || null
  });
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
    courierPaid: order.status === "CANCELLED" && order.courier_payment_status !== "PAID" ? "CANCELLED" : (order.courier_payment_status || "N/A"),
    courierPaidAt: order.courier_paid_at || null,
    deliveryIssue: order.delivery_issue || "",
    freeGift: String(order.source_payload?.freeGift || ""),
    giftSyncVersion: Array.isArray(order.source_payload?.giftSamples) || Array.isArray(order.source_payload?.giftExtras) ? 1 : null,
    stateVersion: Number(order.sheet_state_version || 0)
  };
}

async function syncMirror(mirror) {
  const response = await fetch(SHEET_SYNC_URL, {
    method: "POST",
    redirect: "follow",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ ...mirror, syncSecret: SHEET_SYNC_SECRET }),
    signal: AbortSignal.timeout(30000)
  });
  const data = await safeJson(response);
  if (
    !response.ok ||
    data?.status !== "ok" ||
    data?.type !== "order_state_sync" ||
    data?.orderId !== mirror.orderId ||
    Number(data?.stateVersion) !== Number(mirror.stateVersion) ||
    (mirror.giftSyncVersion && Number(data?.giftSyncVersion) !== Number(mirror.giftSyncVersion))
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

async function sendPackedStatusEmail(token, order, previousStatus) {
  if (previousStatus !== "NEW" || order?.status !== "PACKED") {
    return { status_email_status: "not_applicable", status_email_warning: null };
  }

  if (!STATUS_EMAIL_ENABLED) {
    return { status_email_status: "preview_skipped", status_email_warning: null };
  }

  const payload = order?.source_payload || {};
  const email = cleanText(payload.email, 180).toLowerCase();
  const fullName = cleanText(payload.fullName, 160);
  const language = payload.language === "en" ? "en" : "sr";
  const items = Array.isArray(payload.items)
    ? payload.items.slice(0, 30).map((item) => ({
        name: cleanText(item?.name, 220),
        size: cleanText(item?.size, 60),
        quantity: Math.max(1, Math.min(99, Number(item?.quantity) || 1))
      })).filter((item) => item.name)
    : [];

  if (!email || !fullName) {
    return {
      status_email_status: "skipped_missing_customer_email",
      status_email_warning: "Order was packed, but the customer status email was skipped because customer email data is incomplete."
    };
  }

  try {
    const response = await fetch(STATUS_EMAIL_URL, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        status: "PACKED",
        orderId: order.order_id,
        fullName,
        email,
        language,
        items
      }),
      signal: AbortSignal.timeout(12000)
    });

    const result = await safeJson(response);
    if (!response.ok || result?.ok !== true) {
      throw new Error(result?.error || `Status email returned HTTP ${response.status}`);
    }

    return {
      status_email_status: "sent",
      status_email_warning: null,
      status_email_message_id: result.messageId || null
    };
  } catch (error) {
    const message = String(error?.message || error).slice(0, 300);
    console.error("Packed status email failed", message);
    return {
      status_email_status: "failed",
      status_email_warning: "Order was packed successfully, but the customer status email could not be sent: " + message
    };
  }
}

async function mutateOrder(token, body) {
  const action = String(body?.action || "").trim();
  const id = String(body?.id || "").trim();
  if (!id) throw new Error("Missing order id.");

  let value = "";
  if (action === "set_status") value = String(body?.status || "").trim();
  else if (action === "set_courier_payment") value = String(body?.status || "").trim();
  else if (action === "set_delivery_issue") value = String(body?.delivery_issue || "").trim();
  else throw new Error("Unknown order action.");

  let currentOrder = null;
  if (action === "set_status" || (action === "set_courier_payment" && value === "PENDING")) {
    const current = await readOrders(token);
    currentOrder = current.orders.find((item) => item.id === id) || null;
  }

  if (action === "set_courier_payment" && value === "PENDING" && currentOrder?.courier_batch_id) {
    throw new Error("Batched courier settlements cannot be reopened per order.");
  }

  const previousStatus = currentOrder?.status || null;

  if (action === "set_status" && ["PACKED","SHIPPED"].includes(value) && currentOrder) {
    const watch = findCustomerWatch(currentOrder, await readCustomerWatches(token));
    if (watch && watch.level !== "WATCH" && body?.customer_watch_acknowledged !== true) {
      throw new Error("Customer Watch acknowledgement is required before packing or shipping this order.");
    }
  }

  const mutation = await rpc("update_control_center_order", token, {
    p_record_id: id,
    p_action: action,
    p_value: value,
    p_note: body?.note ? String(body.note).slice(0, 500) : null
  });

  if (!mutation?.order?.id || !mutation?.mirror) throw new Error("Supabase order mutation returned an incomplete result.");

  const mirrorResult = await mirrorWithAudit(token, mutation.order, buildMirror(mutation.order));
  const emailResult = action === "set_status"
    ? await sendPackedStatusEmail(token, mutation.order, previousStatus)
    : { status_email_status: "not_applicable", status_email_warning: null };

  // Audit is best-effort: never revert a successful PACKED status or re-send an
  // accepted email because the audit database is temporarily unavailable.
  if (emailResult.status_email_status === "sent" || emailResult.status_email_status === "failed") {
    try {
      await recordEmailEvent(token, mutation.order.order_id, emailResult);
    } catch (auditError) {
      console.error("Email outcome audit failed", String(auditError?.message || auditError));
      emailResult.status_email_audit_warning = "Email send outcome could not be recorded. Check Resend before retrying.";
    }
  }

  return {
    order: mutation.order,
    ...mirrorResult,
    ...emailResult
  };
}

async function saveCustomerWatch(token, body) {
  const id = String(body?.id || "").trim();
  const level = cleanText(body?.level, 80).toUpperCase();
  const reason = cleanText(body?.reason, 500);
  if (!id) throw new Error("Missing order id.");

  const watch = await rpc("upsert_control_center_customer_watch", token, {
    p_record_id: id,
    p_level: level,
    p_reason: reason
  });

  return { customer_watch: watch };
}

async function clearCustomerWatch(token, body) {
  const watchId = String(body?.watch_id || "").trim();
  if (!watchId) throw new Error("Missing customer watch id.");

  const watch = await rpc("deactivate_control_center_customer_watch", token, {
    p_watch_id: watchId
  });

  return { customer_watch: watch };
}

async function updateGiftSample(token, body) {
  const id = String(body?.id || "").trim();
  if (!id) throw new Error("Missing order id.");

  const sampleName = cleanText(body?.sample_name, 180);
  const sampleSize = cleanText(body?.sample_size, 40);
  const extraGift = cleanText(body?.extra_gift, 120);

  const mutation = await rpc("update_control_center_order_gift", token, {
    p_record_id: id,
    p_sample_name: sampleName,
    p_sample_size: sampleSize,
    p_extra_gift: extraGift
  });

  if (!mutation?.order?.id || !mutation?.mirror) {
    throw new Error("Supabase gift mutation returned an incomplete result.");
  }

  mutation.mirror.giftSyncVersion = 1;
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

  const timeoutUnknown =
    order.sheet_state_sync_status === "failed" &&
    /aborted due to timeout|timeout/i.test(String(order.sheet_state_sync_error || "")) &&
    order.delivery_issue === "UNREACHABLE" &&
    !order.delivery_alert_email_status;

  if (timeoutUnknown) {
    throw new Error("Backup acknowledgement timed out for an UNREACHABLE alert. Verify the Google Sheets row before retrying so the customer email is not sent twice.");
  }

  return {
    order,
    ...(await mirrorWithAudit(token, order, buildMirror(order)))
  };
}

async function confirmMirrorAfterTimeout(token, body) {
  const id = String(body?.id || "").trim();
  const alertEmailSent = String(body?.alert_email_sent || "").trim().toUpperCase();
  if (!id) throw new Error("Missing order id.");

  const current = await readOrders(token);
  const order = current.orders.find((item) => item.id === id);
  if (!order) throw new Error("Order not found.");

  const timeoutUnknown =
    order.sheet_state_sync_status === "failed" &&
    /aborted due to timeout|timeout/i.test(String(order.sheet_state_sync_error || ""));

  if (!timeoutUnknown) {
    throw new Error("Manual reconciliation is only available after a backup acknowledgement timeout.");
  }

  if (order.delivery_issue === "UNREACHABLE" && alertEmailSent !== "YES") {
    throw new Error("Confirm alertEmailSent=YES in Google Sheets before reconciling an UNREACHABLE alert.");
  }

  await markMirror(
    token,
    order.id,
    Number(order.sheet_state_version || 0),
    "synced",
    null,
    order.delivery_issue === "UNREACHABLE" ? "YES" : null
  );

  return {
    order,
    mirror_status: "synced",
    mirror_warning: null,
    reconciled_from_sheet: true
  };
}

function roundMoney(value) {
  return Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;
}

function cleanText(value, max = 300) {
  return String(value || "").trim().slice(0, max);
}

function sanitizeManualItems(items) {
  if (!Array.isArray(items)) return [];
  return items.map((item) => ({
    name: cleanText(item?.name, 180),
    size: cleanText(item?.size, 40),
    quantity: Number(item?.quantity),
    price: roundMoney(item?.price)
  })).filter((item) =>
    item.name &&
    item.size &&
    Number.isInteger(item.quantity) &&
    item.quantity > 0 &&
    item.quantity <= 50 &&
    Number.isFinite(item.price) &&
    item.price >= 0
  );
}

async function createManualOrder(token, body) {
  const input = body?.order && typeof body.order === "object" ? body.order : {};
  const fullName = cleanText(input.fullName, 160);
  const email = cleanText(input.email, 180).toLowerCase();
  const phone = cleanText(input.phone, 60);
  const city = cleanText(input.city, 120);
  const address = cleanText(input.address, 220);
  const note = cleanText(input.note, 500);
  const instagramUsername = cleanText(input.instagramUsername, 120);
  const freeGift = cleanText(input.freeGift, 220);
  const language = input.language === "en" ? "en" : "sr";
  const source = MANUAL_ORDER_SOURCES.has(String(input.orderSource || "").trim().toLowerCase())
    ? String(input.orderSource).trim().toLowerCase()
    : "manual";
  const items = sanitizeManualItems(input.items);

  if (!fullName || !phone || !city || !address) {
    throw new Error("Full name, phone, city and address are required.");
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Email address is not valid.");
  }
  if (!items.length || items.length !== (Array.isArray(input.items) ? input.items.length : 0)) {
    throw new Error("Manual order contains an invalid item.");
  }

  const subtotal = roundMoney(items.reduce((sum, item) => sum + item.price * item.quantity, 0));
  if (subtotal <= 0) throw new Error("Manual order subtotal must be greater than zero.");
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_PRICE;
  const total = roundMoney(subtotal + shipping);

  const payload = {
    source: "manual_order",
    fullName,
    email,
    phone,
    city,
    address,
    note,
    items,
    subtotal,
    shipping,
    total,
    orderSource: source,
    instagramUsername,
    regularSubtotal: subtotal,
    discount: 0,
    freeGift,
    language,
    recommendations: []
  };

  const response = await fetch(ORDER_STORE_URL, {
    method: "POST",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: "Bearer " + token,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      action: "manual_create",
      payload,
      syncUrl: SHEET_SYNC_URL
    }),
    signal: AbortSignal.timeout(15000)
  });
  const result = await safeJson(response);
  if (!response.ok || result?.status !== "ok" || !result?.orderId || !result?.recordId) {
    throw new Error(result?.message || "Manual order could not be created.");
  }

  return {
    manual_order: {
      order_id: result.orderId,
      record_id: result.recordId,
      tracking_number: result.trackingNumber || "",
      duplicate: Boolean(result.duplicate),
      duplicate_reason: result.duplicateReason || null,
      sheet_sync_status: result.sheetSyncStatus || "pending",
      subtotal,
      shipping,
      total
    }
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

  const grossTotal = batchOrders.reduce((sum, order) => sum + Number(order?.source_payload?.total || 0), 0);
  const courierFeeTotal = batchOrders.length * COURIER_FEE;
  const payoutTotal = Math.max(0, Math.round((grossTotal - courierFeeTotal + Number.EPSILON) * 100) / 100);

  return {
    settlement: {
      batch_id: settlement.batch_id,
      settled_at: settlement.settled_at,
      order_count: settlement.order_count,
      gross_total: grossTotal,
      courier_fee_total: courierFeeTotal,
      total: payoutTotal
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
      if (String(req.query?.view || "").trim().toLowerCase() === "inventory_verification_preflight") {
        // Read-only, authenticated admin snapshot, computed from the same source
        // as Inventory Watch. It is not a durable revision or verified stock.
        const productName = cleanText(req.query?.product_name, 180);
        if (!productName || productName.length < 2) return json(res, 400, { error: "Valid fragrance name required." });
        const analytics = await readOrderAnalytics(auth.token);
        const matches = (analytics?.inventory?.rows || [])
          .filter((row) => String(row.product_name || "").trim().toLowerCase() === productName.toLowerCase());
        if (matches.length !== 1) return json(res, 200, {
          ok: true, product_name: productName, status: "UNKNOWN_MAPPING",
          eligible_for_review: false, can_persist_verification: false, can_enforce_stock: false
        });
        const checked = inventoryVerificationSnapshot(matches[0]);
        return json(res, 200, {
          ok: true, product_name: matches[0].product_name,
          status: checked.eligible ? "REVIEWABLE_PARTIAL" : "NEEDS_REVIEW",
          reason: checked.reason,
          eligible_for_review: checked.eligible,
          remaining_ml: checked.eligible ? checked.remainingMl : null,
          snapshot: checked.eligible ? checked.snapshot : null,
          event_history_complete: false,
          can_persist_verification: false,
          can_enforce_stock: false
        });
      }
      if (String(req.query?.view || "").trim().toLowerCase() === "analytics") {
        return json(res, 200, {
          ok: true,
          analytics: await readOrderAnalytics(auth.token)
        });
      }

      const data = await readOrdersWorkspace(auth.token);
      return json(res, 200, {
        ok: true,
        mode: WRITE_THROUGH_ENABLED ? "write_through_v1" : "read_only_migration",
        write_enabled: WRITE_THROUGH_ENABLED,
        canonical_source: "supabase",
        backup_source: "google_sheets",
        ...data
      });
    }

    const action = String(req.body?.action || "").trim();

    if (action === "manual_inventory_out") {
      const inventory_event = await recordInventoryManualOut(auth.token, req.body);
      return json(res, 200, { ok: true, inventory_event, analytics: await readOrderAnalytics(auth.token) });
    }
    if (action === "verify_inventory_baseline") {
      const productName = cleanText(req.body?.product_name, 180);
      const quantityMl = Number(req.body?.quantity_ml);
      if (!productName || !Number.isFinite(quantityMl) || quantityMl <= 0 || quantityMl > 5000) throw new Error("Invalid baseline ml.");
      const inventory_event = await rpc("set_control_center_inventory_baseline", auth.token, {
        p_product_name: productName,
        p_quantity_ml: quantityMl,
        p_note: cleanText(req.body?.note, 250) || null
      });
      return json(res, 200, {ok:true, inventory_event, analytics:await readOrderAnalytics(auth.token)});
    }
    if (action === "add_estimated_inventory_bottle") {
      const productName = cleanText(req.body?.product_name, 180);
      const quantityMl = Number(req.body?.quantity_ml);
      if (!productName || !Number.isFinite(quantityMl) || quantityMl <= 0 || quantityMl > 5000) throw new Error("Invalid bottle quantity.");
      const inventory_event = await rpc("record_control_center_estimated_bottle", auth.token, {
        p_product_name: productName,
        p_quantity_ml: quantityMl,
        p_note: cleanText(req.body?.note, 300) || null
      });
      return json(res, 200, { ok: true, inventory_event, analytics: await readOrderAnalytics(auth.token) });
    }
    if (action === "add_inventory_stock") {
      const inventory_event = await recordInventoryStock(auth.token, req.body);
      return json(res, 200, {
        ok: true,
        canonical_source: "supabase",
        inventory_event,
        analytics: await readOrderAnalytics(auth.token)
      });
    }

    if (!WRITE_THROUGH_ENABLED) {
      return json(res, 409, {
        error: "Order write-through is not enabled yet. Configure the Google Sheets mirror before changing orders in Control Center."
      });
    }

    const result = action === "retry_sheet_sync"
      ? await retryMirror(auth.token, req.body)
      : action === "confirm_sheet_sync"
        ? await confirmMirrorAfterTimeout(auth.token, req.body)
        : action === "settle_courier_batch"
        ? await settleCourierBatch(auth.token, req.body)
        : action === "create_manual_order"
          ? await createManualOrder(auth.token, req.body)
          : action === "set_customer_watch"
            ? await saveCustomerWatch(auth.token, req.body)
            : action === "clear_customer_watch"
              ? await clearCustomerWatch(auth.token, req.body)
              : action === "set_gift_sample"
                ? await updateGiftSample(auth.token, req.body)
                : await mutateOrder(auth.token, req.body);
    const data = await readOrdersWorkspace(auth.token);

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
