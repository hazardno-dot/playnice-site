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

async function readInventoryStock(token) {
  const rows = await rpc("get_control_center_inventory_stock", token, {});
  return Array.isArray(rows) ? rows : [];
}

const PRODUCT_ALIASES = new Map([
  ["thomas kosmala no. 4 après l'amour edp", "Thomas Kosmala No. 4 Après l'Amour Eau de Parfum"],
  ["thomas kosmala no. 4 après l'amour eau de parfum", "Thomas Kosmala No. 4 Après l'Amour Eau de Parfum"],
  ["thomas kosmala no. 7 le sel de la terre", "Thomas Kosmala No. 7 Le Sel de la Terre Eau de Parfum"],
  ["thomas kosmala no. 7 le sel de la terre eau de parfum", "Thomas Kosmala No. 7 Le Sel de la Terre Eau de Parfum"],
  ["afnan supremacy collector's edition pour homme", "Afnan Supremacy Collector's Edition Pour Homme Eau de Parfum"],
  ["afnan supremacy collector's edition pour homme eau de parfum", "Afnan Supremacy Collector's Edition Pour Homme Eau de Parfum"],
  ["afnan turathi blue", "Afnan Turathi Blue Homme Eau de Parfum"],
  ["afnan turathi blue homme eau de parfum", "Afnan Turathi Blue Homme Eau de Parfum"],
  ["arabiat prestige marwa edp", "Arabiyat Prestige Marwa"],
  ["arabiyat p. marwa", "Arabiyat Prestige Marwa"],
  ["arabiyat prestige marwa", "Arabiyat Prestige Marwa"],
  ["french avenue ravine ginger edp", "French Avenue Ravine Ginger Extrait de Parfum"],
  ["the french avenue ravine ginger extrait de parfum", "French Avenue Ravine Ginger Extrait de Parfum"],
  ["french avenue ravine ginger extrait de parfum", "French Avenue Ravine Ginger Extrait de Parfum"],
  ["my geisha jasmine in the sun extrait de parfum", "My Geisha Jasmine in the Sun Extrait de Parfum"],
  ["rayhaan pacific aura", "Rayhaan Pacific Aura Eau de Parfum"],
  ["rayhaan pacific aura eau de parfum", "Rayhaan Pacific Aura Eau de Parfum"],
  ["afnan 9am", "Afnan 9 AM Eau de Parfum"],
  ["afnan 9 am eau de parfum", "Afnan 9 AM Eau de Parfum"],
  ["kadlaj island dreams", "Khadlaj Island Dreams"]
]);

function canonicalProductName(value) {
  const name = String(value || "").trim();
  return PRODUCT_ALIASES.get(name.toLowerCase()) || name;
}

function parseMl(value) {
  const match = String(value || "").match(/([0-9]+(?:\.[0-9]+)?)\s*ml/i);
  return match ? Number(match[1]) : 0;
}

function inventorySaleItems(items) {
  const out = [];
  for (const item of Array.isArray(items) ? items : []) {
    const qty = Math.max(1, Number(item?.quantity || 1));
    const bundles = Array.isArray(item?.bundleItems) ? item.bundleItems : [];
    if (bundles.length) {
      for (const bundle of bundles) {
        const sizeMl = parseMl(bundle?.size);
        if (sizeMl > 0 && sizeMl < 50) out.push({ product_name: canonicalProductName(bundle?.name), ml: sizeMl * qty });
      }
      continue;
    }
    const sizeMl = Number(item?.sizeMl || 0) || parseMl(item?.size);
    if (sizeMl > 0 && sizeMl < 50) out.push({ product_name: canonicalProductName(item?.name), ml: sizeMl * qty });
  }
  return out;
}

function inventoryGiftItems(payload) {
  const samples = Array.isArray(payload?.giftSamples) ? payload.giftSamples : [];
  if (samples.length) {
    return samples.map((sample) => ({
      product_name: canonicalProductName(sample?.name),
      ml: Number(sample?.sizeMl || 0) || parseMl(sample?.size)
    })).filter((sample) => sample.product_name && sample.ml > 0);
  }

  const legacy = String(payload?.freeGift || "").trim().match(/^(.*?)\s*[-–—]\s*([0-9]+(?:\.[0-9]+)?)\s*ml/i);
  return legacy ? [{ product_name: canonicalProductName(legacy[1]), ml: Number(legacy[2]) }] : [];
}

function buildInventoryAnalytics(orders, stockRows) {
  const tracked = new Map((Array.isArray(stockRows) ? stockRows : []).map((row) => [
    canonicalProductName(row.product_name).toLowerCase(),
    {
      ...row,
      product_name: canonicalProductName(row.product_name),
      tracking_started_at: row.tracking_started_at,
      opening_balance_ml: Number(row.opening_balance_ml || 0),
      restock_ml: Number(row.restock_ml || 0),
      stock_in_ml: Number(row.stock_in_ml || 0),
      consumed_since_tracking_ml: 0
    }
  ]));

  for (const order of Array.isArray(orders) ? orders : []) {
    if (!["PACKED","SHIPPED","OUT_FOR_DELIVERY","DELIVERED","DELIVERY_FAILED","RETURNED"].includes(order.status)) continue;
    const consumedAt = order.packed_at || order.shipped_at || order.updated_at || order.created_at;
    if (!consumedAt) continue;
    const payload = order.source_payload || {};
    const entries = [...inventorySaleItems(payload.items), ...inventoryGiftItems(payload)];
    for (const entry of entries) {
      const row = tracked.get(String(entry.product_name || "").toLowerCase());
      if (!row || new Date(consumedAt) < new Date(row.tracking_started_at)) continue;
      row.consumed_since_tracking_ml += Number(entry.ml || 0);
    }
  }

  const rows = [...tracked.values()].map((row) => {
    const consumed = Math.round((row.consumed_since_tracking_ml + Number.EPSILON) * 100) / 100;
    const remaining = Math.round((row.stock_in_ml - consumed + Number.EPSILON) * 100) / 100;
    return {
      ...row,
      consumed_since_tracking_ml: consumed,
      remaining_ml: remaining,
      stock_status: remaining <= 0 ? "DEPLETED" : remaining <= 20 ? "LOW" : "OK"
    };
  }).sort((a, b) => a.remaining_ml - b.remaining_ml || a.product_name.localeCompare(b.product_name));

  return {
    tracked_count: rows.length,
    low_count: rows.filter((row) => row.stock_status === "LOW").length,
    depleted_count: rows.filter((row) => row.stock_status === "DEPLETED").length,
    remaining_total_ml: Math.round((rows.reduce((sum, row) => sum + Math.max(0, row.remaining_ml), 0) + Number.EPSILON) * 100) / 100,
    rows
  };
}

async function readOrderAnalytics(token) {
  const [analytics, inventoryStock, orderData] = await Promise.all([
    rpc("get_control_center_order_analytics", token, {}),
    readInventoryStock(token),
    readOrders(token)
  ]);
  return {
    ...(analytics || {}),
    inventory: buildInventoryAnalytics(orderData.orders, inventoryStock)
  };
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
    courierPaid: order.courier_payment_status || "N/A",
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

  const mutation = await rpc("update_control_center_order", token, {
    p_record_id: id,
    p_action: action,
    p_value: value,
    p_note: body?.note ? String(body.note).slice(0, 500) : null
  });

  if (!mutation?.order?.id || !mutation?.mirror) throw new Error("Supabase order mutation returned an incomplete result.");

  const mirrorResult = await mirrorWithAudit(token, mutation.order, mutation.mirror);
  const emailResult = action === "set_status"
    ? await sendPackedStatusEmail(token, mutation.order, previousStatus)
    : { status_email_status: "not_applicable", status_email_warning: null };

  return {
    order: mutation.order,
    ...mirrorResult,
    ...emailResult
  };
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

    const action = String(req.body?.action || "").trim();

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
          : action === "set_gift_sample"
            ? await updateGiftSample(auth.token, req.body)
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
