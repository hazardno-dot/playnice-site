// Checkout wrapper: parallel email delivery + timing + ambiguous Apps Script recovery.
const { AsyncLocalStorage } = require("node:async_hooks");
const { createHash } = require("node:crypto");
const resendModule = require("resend");

const checkoutContext = new AsyncLocalStorage();
const OriginalResend = resendModule.Resend;
const originalFetch = global.fetch;

const SHEETS_POST_TIMEOUT_MS = 10000;
const SHEETS_RECOVERY_LOOKUP_TIMEOUT_MS = 4000;
const SHEETS_RECOVERY_LOOKUP_ATTEMPTS = 5;
const SHEETS_RECOVERY_LOOKUP_DELAY_MS = 1500;

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

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
  const normalized = normalizePhoneDisplay(value);
  const digits = String(normalized || "").replace(/\D/g, "");

  if (!digits) return "";
  return digits.length > 8 ? digits.slice(-8) : digits;
}

function buildCheckoutFingerprintFromFetchArgs(args) {
  try {
    const rawBody = args?.[1]?.body;
    if (!rawBody) return "";

    const data = JSON.parse(String(rawBody));
    if (String(data.source || "").trim() !== "order") return "";

    const orderSource = String(
      data.orderSource || (data.source === "order" ? "website" : "")
    ).trim();

    const canonicalItems = (Array.isArray(data.items) ? data.items : []).map((item) => ({
      name: String(item?.name || "").trim().toLowerCase(),
      size: String(item?.size || "").trim().toLowerCase(),
      quantity: Number(item?.quantity || 0),
      price: roundMoney(item?.price || 0)
    }));

    const canonical = JSON.stringify({
      fullName: String(data.fullName || "").trim().toLowerCase(),
      email: String(data.email || "").trim().toLowerCase(),
      phone: normalizePhoneKey(data.phone),
      city: String(data.city || "").trim().toLowerCase(),
      address: String(data.address || "").trim().toLowerCase(),
      note: String(data.note || "").trim(),
      items: canonicalItems,
      subtotal: roundMoney(data.subtotal || 0),
      shipping: roundMoney(data.shipping || 0),
      total: roundMoney(data.total || 0),
      orderSource: orderSource.toLowerCase()
    });

    return createHash("sha256").update(canonical, "utf8").digest("hex");
  } catch (error) {
    console.error("Unable to build checkout recovery fingerprint:", error);
    return "";
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

      if (!context.pendingEmail) {
        const placeholder = { data: { id: null } };
        context.pendingEmail = {
          payload,
          placeholder
        };
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
        throw customerResult.reason;
      }

      context.customerEmailSent = true;
      return customerResult.value;
    };
  }
}

resendModule.Resend = CheckoutResend;

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

async function lookupRecoveredOrder(checkoutFingerprint, context) {
  if (!checkoutFingerprint || !process.env.GOOGLE_SCRIPT_ORDERS_URL) {
    return null;
  }

  const recoveryUrl = new URL(process.env.GOOGLE_SCRIPT_ORDERS_URL);
  recoveryUrl.searchParams.set("action", "findRecentOrderByFingerprint");
  recoveryUrl.searchParams.set("checkoutFingerprint", checkoutFingerprint);

  for (
    let attempt = 1;
    attempt <= SHEETS_RECOVERY_LOOKUP_ATTEMPTS;
    attempt += 1
  ) {
    await delay(SHEETS_RECOVERY_LOOKUP_DELAY_MS);
    context.appsScriptRecoveryAttempts = attempt;

    try {
      const response = await fetchWithTimeout(
        recoveryUrl.toString(),
        { method: "GET", redirect: "follow" },
        SHEETS_RECOVERY_LOOKUP_TIMEOUT_MS
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
        data?.found === true &&
        data?.orderId
      ) {
        context.appsScriptDuplicate = true;
        context.appsScriptRecovered = true;

        console.warn(
          "Recovered checkout after ambiguous Apps Script result:",
          JSON.stringify({
            attempt,
            orderId: data.orderId
          })
        );

        return new Response(
          JSON.stringify({
            status: "ok",
            type: "order",
            duplicate: true,
            duplicateReason: "ambiguous_result_recovery",
            orderId: data.orderId,
            trackingNumber: data.trackingNumber || ""
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" }
          }
        );
      }
    } catch (lookupError) {
      console.warn(
        "Apps Script recovery lookup failed:",
        safeErrorMessage(lookupError, "Unknown recovery lookup error")
      );
    }
  }

  return null;
}

async function fetchOrdersSheetWithRecovery(args, context) {
  const checkoutFingerprint = buildCheckoutFingerprintFromFetchArgs(args);
  context.checkoutFingerprintAvailable = Boolean(checkoutFingerprint);

  let firstResponse = null;
  let firstError = null;

  try {
    firstResponse = await fetchWithTimeout(
      args[0],
      args[1] || {},
      SHEETS_POST_TIMEOUT_MS
    );

    let clonedData = null;

    try {
      const clonedText = await firstResponse.clone().text();
      clonedData = JSON.parse(clonedText);
      context.appsScriptTimings = clonedData?.timings || null;
      context.appsScriptDuplicate = Boolean(clonedData?.duplicate);
      context.appsScriptTimingParseError = null;
    } catch (timingParseError) {
      context.appsScriptTimingParseError = safeErrorMessage(
        timingParseError,
        "Unable to parse Apps Script timing payload"
      );
    }

    const isValidOrderResponse =
      firstResponse.ok &&
      clonedData?.status === "ok" &&
      Boolean(clonedData?.orderId);

    if (isValidOrderResponse) {
      return firstResponse;
    }

    console.warn(
      "Ambiguous Apps Script order response; starting read-only recovery:",
      JSON.stringify({
        status: firstResponse.status,
        dataStatus: clonedData?.status || null,
        message: clonedData?.message || null
      })
    );
  } catch (error) {
    firstError = error;
    console.warn(
      "Apps Script order request timed out or failed; starting read-only recovery:",
      safeErrorMessage(error, "Unknown Apps Script error")
    );
  }

  const recoveredResponse = await lookupRecoveredOrder(
    checkoutFingerprint,
    context
  );

  if (recoveredResponse) {
    return recoveredResponse;
  }

  if (firstResponse) {
    return firstResponse;
  }

  throw firstError || new Error("Apps Script order request failed");
}

global.fetch = async (...args) => {
  const context = checkoutContext.getStore();
  const target = typeof args[0] === "string" ? args[0] : args[0]?.url;
  const isOrdersSheetRequest =
    context &&
    process.env.GOOGLE_SCRIPT_ORDERS_URL &&
    target === process.env.GOOGLE_SCRIPT_ORDERS_URL;

  if (!isOrdersSheetRequest) {
    return originalFetch(...args);
  }

  const sheetsStart = Date.now();

  try {
    return await fetchOrdersSheetWithRecovery(args, context);
  } finally {
    context.sheetsMs = Date.now() - sheetsStart;
  }
};

const legacyModule = require("../server/checkout-legacy");
const legacyHandler = legacyModule.default || legacyModule;

export default async function handler(req, res) {
  const context = {
    startedAt: Date.now(),
    parallelizeDomesticEmails: isDomesticCheckout(req),
    sheetsMs: null,
    emailsMs: null,
    adminEmailSent: null,
    adminEmailError: null,
    customerEmailSent: null,
    customerEmailError: null,
    appsScriptTimings: null,
    appsScriptDuplicate: false,
    appsScriptTimingParseError: null,
    appsScriptRecoveryAttempts: 0,
    appsScriptRecovered: false,
    checkoutFingerprintAvailable: false
  };

  return checkoutContext.run(context, async () => {
    const originalJson = res.json.bind(res);

    res.json = (payload) => {
      const totalMs = Date.now() - context.startedAt;

      if (payload?.orderPlaced) {
        if (context.adminEmailSent === false) {
          payload.adminEmailSent = false;
          payload.adminEmailError = context.adminEmailError;
          payload.warning = payload.warning || "Order placed, but admin email was not sent";
        }

        payload.checkoutTimings = {
          sheetsMs: context.sheetsMs,
          emailsMs: context.emailsMs,
          totalMs,
          appsScript: context.appsScriptTimings,
          appsScriptRecoveryAttempts: context.appsScriptRecoveryAttempts,
          appsScriptRecovered: context.appsScriptRecovered
        };
      }

      console.info("[checkout-timing]", JSON.stringify({
        orderId: payload?.orderId || payload?.enquiryId || null,
        orderPlaced: Boolean(payload?.orderPlaced),
        sheetsMs: context.sheetsMs,
        emailsMs: context.emailsMs,
        totalMs,
        appsScriptTimings: context.appsScriptTimings,
        appsScriptDuplicate: context.appsScriptDuplicate,
        appsScriptTimingParseError: context.appsScriptTimingParseError,
        appsScriptRecoveryAttempts: context.appsScriptRecoveryAttempts,
        appsScriptRecovered: context.appsScriptRecovered,
        checkoutFingerprintAvailable: context.checkoutFingerprintAvailable,
        adminEmailSent: payload?.adminEmailSent ?? context.adminEmailSent,
        customerEmailSent: payload?.customerEmailSent ?? context.customerEmailSent
      }));

      return originalJson(payload);
    };

    return legacyHandler(req, res);
  });
}
