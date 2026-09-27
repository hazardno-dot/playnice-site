import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function isAllowedGoogleScriptUrl(value: unknown) {
  try {
    const url = new URL(String(value || ""));
    return url.protocol === "https:" && url.hostname === "script.google.com" && url.pathname.startsWith("/macros/s/");
  } catch {
    return false;
  }
}


function roundMoney(value: unknown) {
  return Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;
}

function normalizePhoneDisplay(value: unknown) {
  const original = String(value || "").trim();
  if (!original) return "";

  let digits = original.replace(/\D/g, "");
  if (digits.startsWith("00382")) digits = digits.slice(5);
  else if (digits.startsWith("382")) digits = digits.slice(3);

  if (digits.length === 8 && !digits.startsWith("0")) digits = "0" + digits;

  if (/^0\d{8}$/.test(digits)) {
    return digits.slice(0, 3) + "/" + digits.slice(3, 6) + "-" + digits.slice(6);
  }

  return original;
}

function normalizePhoneKey(value: unknown) {
  const digits = normalizePhoneDisplay(value).replace(/\D/g, "");
  if (!digits) return "";
  return digits.length > 8 ? digits.slice(-8) : digits;
}

function normalizeManualOrderSource(value: unknown) {
  const source = String(value || "").trim().toLowerCase();
  const allowed = new Set(["instagram", "email", "whatsapp", "viber", "phone", "message", "manual"]);
  return allowed.has(source) ? source : "manual";
}

async function buildCheckoutFingerprint(order: any) {
  const canonicalItems = (Array.isArray(order?.items) ? order.items : []).map((item: any) => ({
    name: String(item?.name || "").trim().toLowerCase(),
    size: String(item?.size || "").trim().toLowerCase(),
    quantity: Number(item?.quantity || 0),
    price: roundMoney(item?.price || 0),
  }));

  const canonical = JSON.stringify({
    fullName: String(order?.fullName || "").trim().toLowerCase(),
    email: String(order?.email || "").trim().toLowerCase(),
    phone: normalizePhoneKey(order?.phone),
    city: String(order?.city || "").trim().toLowerCase(),
    address: String(order?.address || "").trim().toLowerCase(),
    note: String(order?.note || "").trim(),
    items: canonicalItems,
    subtotal: roundMoney(order?.subtotal || 0),
    shipping: roundMoney(order?.shipping || 0),
    total: roundMoney(order?.total || 0),
    orderSource: String(order?.orderSource || "").trim().toLowerCase(),
  });

  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(canonical));
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function markDelivery(admin: any, input: {
  orderId: string;
  syncToken: string;
  sheetStatus?: string | null;
  sheetError?: string | null;
  adminEmailSent?: boolean | null;
  customerEmailSent?: boolean | null;
}) {
  const { error } = await admin.rpc("mark_checkout_delivery_result", {
    p_order_id: input.orderId,
    p_sync_token: input.syncToken,
    p_sheet_status: input.sheetStatus ?? null,
    p_sheet_error: input.sheetError ?? null,
    p_admin_email_sent: input.adminEmailSent ?? null,
    p_customer_email_sent: input.customerEmailSent ?? null,
  });

  if (error) {
    console.error("checkout-order-store delivery mark failed", error);
    return false;
  }
  return true;
}

async function syncToGoogleSheets(admin: any, input: {
  syncUrl: string;
  payload: any;
  orderId: string;
  trackingNumber: string;
  syncToken: string;
}) {
  const startedAt = Date.now();

  try {
    const response = await fetch(input.syncUrl, {
      method: "POST",
      redirect: "follow",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        ...input.payload,
        orderId: input.orderId,
        trackingNumber: input.trackingNumber,
      }),
      signal: AbortSignal.timeout(45000),
    });

    const text = await response.text();
    let data: any = null;
    try { data = JSON.parse(text); } catch { data = null; }

    const ok = response.ok && data?.status === "ok" && data?.orderId === input.orderId;

    if (!ok) {
      const reason = data?.message || `Unexpected Google Apps Script response (${response.status})`;
      console.error("checkout-order-store sheet sync failed", {
        orderId: input.orderId,
        durationMs: Date.now() - startedAt,
        status: response.status,
        reason,
      });
      await markDelivery(admin, {
        orderId: input.orderId,
        syncToken: input.syncToken,
        sheetStatus: "failed",
        sheetError: reason,
      });
      return false;
    }

    await markDelivery(admin, {
      orderId: input.orderId,
      syncToken: input.syncToken,
      sheetStatus: "synced",
      sheetError: null,
    });

    console.info("checkout-order-store sheet sync ok", {
      orderId: input.orderId,
      durationMs: Date.now() - startedAt,
      duplicate: Boolean(data?.duplicate),
    });
    return true;
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    console.error("checkout-order-store sheet sync exception", {
      orderId: input.orderId,
      durationMs: Date.now() - startedAt,
      reason,
    });
    await markDelivery(admin, {
      orderId: input.orderId,
      syncToken: input.syncToken,
      sheetStatus: "failed",
      sheetError: reason,
    });
    return false;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json(405, { status: "error", message: "Method not allowed" });

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) return json(500, { status: "error", message: "Order store is not configured" });

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  let body: any;
  try { body = await req.json(); } catch { return json(400, { status: "error", message: "Invalid JSON" }); }

  const action = String(body?.action || "create");

  try {
    if (action === "create" || action === "manual_create") {
      const isManualCreate = action === "manual_create";

      if (isManualCreate) {
        const authHeader = req.headers.get("Authorization") || "";
        const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
        if (!token) return json(401, { status: "error", message: "Admin session required" });

        const { data: userData, error: userError } = await admin.auth.getUser(token);
        const userId = userData?.user?.id;
        if (userError || !userId) return json(401, { status: "error", message: "Invalid admin session" });

        const { data: adminRows, error: adminError } = await admin
          .from("admin_users")
          .select("user_id")
          .eq("user_id", userId)
          .limit(1);

        if (adminError) {
          console.error("checkout-order-store manual admin lookup failed", adminError);
          return json(500, { status: "error", message: "Admin lookup failed" });
        }
        if (!Array.isArray(adminRows) || !adminRows.length) {
          return json(403, { status: "error", message: "PlayNice admin access required" });
        }
      }
      const environment = isManualCreate
        ? "production"
        : (body?.environment === "preview" ? "preview" : "production");
      let payload = body?.payload;
      const syncUrl = String(body?.syncUrl || "");

      if (!payload || typeof payload !== "object" || Array.isArray(payload)) return json(400, { status: "error", message: "Invalid checkout payload" });
      if (!isAllowedGoogleScriptUrl(syncUrl)) return json(400, { status: "error", message: "Invalid sheet sync URL" });

      if (isManualCreate) {
        payload = {
          ...payload,
          source: "manual_order",
          orderSource: normalizeManualOrderSource(payload?.orderSource),
        };
      }

      const fingerprint = isManualCreate
        ? await buildCheckoutFingerprint(payload)
        : String(body?.fingerprint || "").trim().toLowerCase();

      if (!/^[0-9a-f]{64}$/.test(fingerprint)) return json(400, { status: "error", message: "Invalid checkout fingerprint" });

      const { data, error } = await admin.rpc("create_or_get_checkout_order", {
        p_payload: payload,
        p_fingerprint: fingerprint,
        p_environment: environment,
      });

      if (error) {
        console.error("checkout-order-store create failed", error);
        return json(500, { status: "error", message: "Failed to persist order" });
      }

      if (data?.orderId && data?.syncToken) {
        const { error: syncUrlError } = await admin
          .from("checkout_orders")
          .update({ sheet_sync_url: syncUrl })
          .eq("order_id", data.orderId)
          .eq("sync_token", data.syncToken);
        if (syncUrlError) console.error("checkout-order-store could not persist sheet sync URL", syncUrlError);
      }

      const shouldSync = !data?.duplicate && data?.sheetSyncStatus !== "synced";
      if (shouldSync && data?.orderId && data?.trackingNumber && data?.syncToken) {
        EdgeRuntime.waitUntil(syncToGoogleSheets(admin, {
          syncUrl,
          payload,
          orderId: data.orderId,
          trackingNumber: data.trackingNumber,
          syncToken: data.syncToken,
        }));
      }

      return json(200, {
        status: data?.status || "ok",
        type: "order",
        duplicate: Boolean(data?.duplicate),
        duplicateReason: data?.duplicateReason || null,
        orderId: data?.orderId,
        trackingNumber: data?.trackingNumber,
        recordId: data?.recordId,
        createdAt: data?.createdAt,
        sheetSyncStatus: data?.sheetSyncStatus || "pending",
        syncToken: data?.syncToken,
      });
    }

    if (action === "retry_pending") {
      const { data: rows, error } = await admin.rpc("claim_checkout_sheet_sync_batch", { p_limit: 5 });
      if (error) {
        console.error("checkout-order-store retry claim failed", error);
        return json(500, { status: "error", message: "Could not claim pending sheet syncs" });
      }

      const jobs = Array.isArray(rows) ? rows.filter((row: any) => isAllowedGoogleScriptUrl(row?.sheet_sync_url)) : [];
      if (jobs.length) {
        await Promise.all(jobs.map((row: any) => syncToGoogleSheets(admin, {
          syncUrl: row.sheet_sync_url,
          payload: row.source_payload,
          orderId: row.order_id,
          trackingNumber: row.tracking_number,
          syncToken: row.sync_token,
        })));
      }

      return json(200, { status: "ok", retried: jobs.length });
    }

    if (action === "mark_email") {
      const orderId = String(body?.orderId || "").trim();
      const syncToken = String(body?.syncToken || "").trim();
      const adminEmailSent = typeof body?.adminEmailSent === "boolean" ? body.adminEmailSent : null;
      const customerEmailSent = typeof body?.customerEmailSent === "boolean" ? body.customerEmailSent : null;

      if (!orderId || !syncToken) return json(400, { status: "error", message: "Missing delivery identity" });
      const ok = await markDelivery(admin, { orderId, syncToken, adminEmailSent, customerEmailSent });
      return ok
        ? json(200, { status: "ok", orderId })
        : json(500, { status: "error", message: "Failed to update email delivery status" });
    }

    return json(400, { status: "error", message: "Unsupported action" });
  } catch (error) {
    console.error("checkout-order-store unexpected error", error);
    return json(500, { status: "error", message: "Unexpected order store error" });
  }
});
