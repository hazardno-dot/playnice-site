// Checkout hotfix wrapper: parallel email delivery + timing instrumentation.
const { AsyncLocalStorage } = require("node:async_hooks");
const resendModule = require("resend");

const checkoutContext = new AsyncLocalStorage();
const OriginalResend = resendModule.Resend;
const originalFetch = global.fetch;
const SHEETS_ATTEMPT_TIMEOUT_MS = 10000;
const SHEETS_MAX_ATTEMPTS = 2;

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

async function fetchOrdersSheetWithRecovery(args, context) {
  let lastError = null;

  for (let attempt = 1; attempt <= SHEETS_MAX_ATTEMPTS; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), SHEETS_ATTEMPT_TIMEOUT_MS);
    const requestOptions = {
      ...(args[1] || {}),
      signal: controller.signal
    };

    try {
      const response = await originalFetch(args[0], requestOptions);
      let clonedData = null;

      try {
        const clonedText = await response.clone().text();
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
        response.ok &&
        clonedData?.status === "ok" &&
        Boolean(clonedData?.orderId);

      if (isValidOrderResponse || attempt === SHEETS_MAX_ATTEMPTS) {
        context.appsScriptRecoveryAttempts = attempt - 1;
        return response;
      }

      context.appsScriptRecoveryAttempts = attempt;
      console.warn(
        "Unexpected Apps Script order response; retrying once:",
        JSON.stringify({
          attempt,
          status: response.status,
          dataStatus: clonedData?.status || null,
          message: clonedData?.message || null
        })
      );
    } catch (error) {
      lastError = error;
      context.appsScriptRecoveryAttempts = attempt;

      if (attempt === SHEETS_MAX_ATTEMPTS) {
        throw error;
      }

      console.warn(
        "Apps Script order request failed or timed out; retrying once:",
        safeErrorMessage(error, "Unknown Apps Script error")
      );
    } finally {
      clearTimeout(timeout);
    }
  }

  throw lastError || new Error("Apps Script order request failed");
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
    appsScriptRecoveryAttempts: 0
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
          appsScriptRecoveryAttempts: context.appsScriptRecoveryAttempts
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
        adminEmailSent: payload?.adminEmailSent ?? context.adminEmailSent,
        customerEmailSent: payload?.customerEmailSent ?? context.customerEmailSent
      }));

      return originalJson(payload);
    };

    return legacyHandler(req, res);
  });
}
