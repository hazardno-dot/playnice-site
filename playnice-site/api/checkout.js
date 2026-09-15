// Checkout wrapper: Supabase-first durable order save + parallel email delivery.
const { AsyncLocalStorage } = require("node:async_hooks");
const { createHash } = require("node:crypto");
const resendModule = require("resend");

const checkoutContext = new AsyncLocalStorage();
const OriginalResend = resendModule.Resend;
const originalFetch = global.fetch;

// These are publishable Supabase credentials, not service-role secrets.
// Environment variables can override them without changing code.
const SUPABASE_URL =
  process.env.SUPABASE_URL || "https://fsujznyfdrstinqexxgs.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY ||
  "sb_publishable_XzvxcEV7Cye44oF4bRWxtQ_VUq9gcNN";
const ORDER_STORE_URL = `${SUPABASE_URL}/functions/v1/checkout-order-store`;
const ORDER_STORE_ATTEMPT_TIMEOUT_MS = 4000;
const ORDER_STORE_MAX_ATTEMPTS = 2;
const EMAIL_AUDIT_TIMEOUT_MS = 1500;

function isDomesticCheckout(req) {
  const body = req?.body || {};
  const customer = body.customer || {};
  const requestType = String(body.type || "").trim();
  const country = String(customer.country || "ME").trim();

  return requestType !== "international_enquiry" && country === "ME";
}

function safeErrorMessage(error, fallback) {
  return error?.message || fallback;
}

function roundMoney(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

function normalizePhoneDisplay(value) {
  const original = String(value || "").trim();
  if (!original) return "";

  let digits = original.replace(/\D/g, "");
  if (digits.indexOf("00382") === 0) {
    digits = digits.slice(5);
  } else if (digits.indexOf("382") === 0) {
    digits = digits.slice(3);
  }

  if (digits.length === 8 && digits.charAt(0) !== "0") {
    digits = "0" + digits;
  }

  if (/^0\d{8}$/.test(digits)) {
    return (
      digits.slice(0, 3) + "/" +
      digits.slice(3, 6) + "-" +
      digits.slice(6)
    );
  }

  return original;
}

function normalizePhoneKey(value) {
  const digits = normalizePhoneDisplay(value).replace(/\D/g, "");
  if (!digits) return "";
  return digits.length > 8 ? digits.slice(-8) : digits;
}

function buildCheckoutFingerprint(order) {
  const canonicalItems = (Array.isArray(order?.items) ? order.items : []).map(
    (item) => ({
      name: String(item?.name || "").trim().toLowerCase(),
      size: String(item?.size || "").trim().toLowerCase(),
      quantity: Number(item?.quantity || 0),
      price: roundMoney(item?.price || 0)
    })
  );

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
    orderSource: String(order?.orderSource || "").trim().toLowerCase()
  });

  return createHash("sha256").update(canonical, "utf8").digest("hex");
}

async function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await originalFetch(url, {
      ...(options || {}),
      signal: controller.signal
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function markEmailDeliveryStatus(context) {
  if (!context?.primaryStoreOrderId || !context?.primaryStoreSyncToken) return;

  const startedAt = Date.now();
  try {
    const response = await fetchWithTimeout(
      ORDER_STORE_URL,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          apikey: SUPABASE_ANON_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: "mark_email",
          orderId: context.primaryStoreOrderId,
          syncToken: context.primaryStoreSyncToken,
          adminEmailSent: context.adminEmailSent,
          customerEmailSent: context.customerEmailSent
        })
      },
      EMAIL_AUDIT_TIMEOUT_MS
    );

    if (!response.ok) {
      throw new Error(`Email audit returned HTTP ${response.status}`);
    }

    context.emailAuditMs = Date.now() - startedAt;
  } catch (error) {
    context.emailAuditMs = Date.now() - startedAt;
    context.emailAuditError = safeErrorMessage(error, "Email audit failed");
    console.warn("Checkout email audit failed:", context.emailAuditError);
  }
}

class CheckoutResend extends OriginalResend {
  constructor(...args) {
    super(...args);

    const originalSend = this.emails.send.bind(this.emails);

    this.emails.send = async (payload) => {
      const context = checkoutContext.getStore();

      if (!context?.parallelizeDomesticEmails) {
        return originalSend(payload);
      }

      if (context.primaryStoreDuplicate) {
        if (!context.pendingEmail) {
          const placeholder = { data: { id: null } };
          context.pendingEmail = { payload, placeholder };
          return placeholder;
        }

        context.pendingEmail = null;
        context.emailsMs = 0;
        context.emailDuplicateSuppressed = true;
        context.adminEmailSent = true;
        context.customerEmailSent = true;
        return { data: { id: null } };
      }

      if (!context.pendingEmail) {
        const placeholder = { data: { id: null } };
        context.pendingEmail = { payload, placeholder };
        return placeholder;
      }

      const firstEmail = context.pendingEmail;
      context.pendingEmail = null;
      const emailStart = Date.now();

      const [adminResult, customerResult] = await Promise.allSettled([
        originalSend(firstEmail.payload),
        originalSend(payload)
      ]);

      context.emailsMs = Date.now() - emailStart;

      if (adminResult.status === "fulfilled") {
        firstEmail.placeholder.data.id = adminResult.value?.data?.id || null;
        context.adminEmailSent = true;
      } else {
        context.adminEmailSent = false;
        context.adminEmailError = safeErrorMessage(
          adminResult.reason,
          "Admin email failed"
        );
        console.error("Admin email failed after order save:", adminResult.reason);
      }

      if (customerResult.status === "rejected") {
        context.customerEmailSent = false;
        context.customerEmailError = safeErrorMessage(
          customerResult.reason,
          "Customer email failed"
        );
      } else {
        context.customerEmailSent = true;
      }

      await markEmailDeliveryStatus(context);

      if (customerResult.status === "rejected") {
        throw customerResult.reason;
      }

      return customerResult.value;
    };
  }
}

resendModule.Resend = CheckoutResend;

async function saveOrderToPrimaryStore(args, context) {
  let orderPayload;
  try {
    orderPayload = JSON.parse(String(args?.[1]?.body || "{}"));
  } catch {
    throw new Error("Unable to parse validated checkout payload");
  }

  if (String(orderPayload?.source || "").trim() !== "order") {
    return originalFetch(...args);
  }

  const fingerprint = buildCheckoutFingerprint(orderPayload);
  const environment = process.env.VERCEL_ENV === "production" ? "production" : "preview";
  let lastError = null;

  for (let attempt = 1; attempt <= ORDER_STORE_MAX_ATTEMPTS; attempt += 1) {
    const attemptStartedAt = Date.now();

    try {
      const response = await fetchWithTimeout(
        ORDER_STORE_URL,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            apikey: SUPABASE_ANON_KEY,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            action: "create",
            payload: orderPayload,
            fingerprint,
            environment,
            syncUrl: String(args[0])
          })
        },
        ORDER_STORE_ATTEMPT_TIMEOUT_MS
      );

      const text = await response.text();
      let data = null;
      try {
        data = JSON.parse(text);
      } catch {
        data = null;
      }

      if (
        response.ok &&
        data?.status === "ok" &&
        data?.orderId &&
        data?.trackingNumber
      ) {
        context.primaryStoreAttempts = attempt;
        context.primaryStoreDuplicate = Boolean(data.duplicate);
        context.primaryStoreOrderId = data.orderId;
        context.primaryStoreSyncToken = data.syncToken || null;
        context.primaryStoreSheetSyncStatus = data.sheetSyncStatus || "pending";

        console.info(
          "[checkout-primary-store]",
          JSON.stringify({
            orderId: data.orderId,
            duplicate: Boolean(data.duplicate),
            environment,
            attempt,
            attemptMs: Date.now() - attemptStartedAt,
            sheetSyncStatus: data.sheetSyncStatus || "pending"
          })
        );

        return new Response(
          JSON.stringify({
            status: "ok",
            type: "order",
            duplicate: Boolean(data.duplicate),
            orderId: data.orderId,
            trackingNumber: data.trackingNumber,
            primaryStore: "supabase",
            sheetSyncQueued: true
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" }
          }
        );
      }

      lastError = new Error(
        data?.message || `Supabase order store returned HTTP ${response.status}`
      );
    } catch (error) {
      lastError = error;
    }

    console.warn(
      "Primary checkout store attempt failed:",
      JSON.stringify({
        attempt,
        attemptMs: Date.now() - attemptStartedAt,
        error: safeErrorMessage(lastError, "Unknown primary store error")
      })
    );
  }

  throw lastError || new Error("Failed to persist order in primary store");
}

global.fetch = async (...args) => {
  const context = checkoutContext.getStore();
  const target = typeof args[0] === "string" ? args[0] : args[0]?.url;
  const isLegacyOrderSave =
    context?.parallelizeDomesticEmails &&
    process.env.GOOGLE_SCRIPT_ORDERS_URL &&
    target === process.env.GOOGLE_SCRIPT_ORDERS_URL;

  if (!isLegacyOrderSave) {
    return originalFetch(...args);
  }

  const primaryStoreStartedAt = Date.now();
  try {
    return await saveOrderToPrimaryStore(args, context);
  } finally {
    context.primaryStoreMs = Date.now() - primaryStoreStartedAt;
  }
};

const legacyModule = require("../server/checkout-legacy");
const legacyHandler = legacyModule.default || legacyModule;

export default async function handler(req, res) {
  const context = {
    startedAt: Date.now(),
    parallelizeDomesticEmails: isDomesticCheckout(req),
    primaryStoreMs: null,
    primaryStoreAttempts: 0,
    primaryStoreDuplicate: false,
    primaryStoreOrderId: null,
    primaryStoreSyncToken: null,
    primaryStoreSheetSyncStatus: null,
    emailsMs: null,
    emailAuditMs: null,
    emailAuditError: null,
    emailDuplicateSuppressed: false,
    adminEmailSent: null,
    adminEmailError: null,
    customerEmailSent: null,
    customerEmailError: null
  };

  return checkoutContext.run(context, async () => {
    const originalJson = res.json.bind(res);

    res.json = (payload) => {
      const totalMs = Date.now() - context.startedAt;

      if (payload?.orderPlaced && context.parallelizeDomesticEmails) {
        if (context.adminEmailSent === false) {
          payload.adminEmailSent = false;
          payload.adminEmailError = context.adminEmailError;
          payload.warning =
            payload.warning || "Order placed, but admin email was not sent";
        }

        payload.orderPersistence = "supabase";
        payload.sheetSyncQueued = true;
        payload.duplicate = context.primaryStoreDuplicate;
        payload.emailDeliverySuppressedDuplicate = context.emailDuplicateSuppressed;
        payload.checkoutTimings = {
          primaryStoreMs: context.primaryStoreMs,
          emailsMs: context.emailsMs,
          emailAuditMs: context.emailAuditMs,
          totalMs,
          primaryStoreAttempts: context.primaryStoreAttempts
        };
      }

      console.info(
        "[checkout-timing]",
        JSON.stringify({
          orderId:
            payload?.orderId ||
            payload?.enquiryId ||
            context.primaryStoreOrderId ||
            null,
          orderPlaced: Boolean(payload?.orderPlaced),
          primaryStore: context.parallelizeDomesticEmails ? "supabase" : "legacy",
          primaryStoreMs: context.primaryStoreMs,
          primaryStoreAttempts: context.primaryStoreAttempts,
          primaryStoreDuplicate: context.primaryStoreDuplicate,
          sheetSyncStatusAtCreate: context.primaryStoreSheetSyncStatus,
          emailsMs: context.emailsMs,
          emailAuditMs: context.emailAuditMs,
          emailAuditError: context.emailAuditError,
          emailDuplicateSuppressed: context.emailDuplicateSuppressed,
          totalMs,
          adminEmailSent:
            payload?.adminEmailSent ?? context.adminEmailSent,
          customerEmailSent:
            payload?.customerEmailSent ?? context.customerEmailSent
        })
      );

      return originalJson(payload);
    };

    return legacyHandler(req, res);
  });
}
