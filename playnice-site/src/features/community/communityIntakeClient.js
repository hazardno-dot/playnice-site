const SUPABASE_URL = "https://fsujznyfdrstinqexxgs.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_XzvxcEV7Cye44oF4bRWxtQ_VUq9gcNN";
const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycby38XWvXcD6Cgw2_ExKEpegaYg-mgiuYLVXzDgcwefVSCZtyWVL2QvVQzmX7nrltene/exec";

const safeJson = async (response) => {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return { message: text.slice(0, 300) };
  }
};

const rpc = async (name, body = {}) => {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/rpc/${encodeURIComponent(name)}`,
    {
      method: "POST",
      headers: {
        apikey: SUPABASE_PUBLISHABLE_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    }
  );

  const data = await safeJson(response);

  if (!response.ok) {
    throw new Error(
      data?.message ||
      data?.hint ||
      `Community intake RPC failed (${response.status}).`
    );
  }

  return data;
};

const mirrorToSheets = async (payload) => {
  const response = await fetch(APPS_SCRIPT_URL, {
    method: "POST",
    mode: "cors",
    keepalive: true,
    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    },
    body: JSON.stringify(payload)
  });

  const data = await safeJson(response);

  if (!response.ok || data?.status !== "ok") {
    const error = new Error(
      data?.message ||
      `Google Sheets mirror failed (${response.status}).`
    );
    error.payload = data;
    throw error;
  }

  return data;
};

const markScentMirror = async ({
  id,
  deviceId,
  requestToken,
  status,
  error = null
}) => {
  try {
    await rpc("mark_scent_request_mirror", {
      p_id: Number(id),
      p_device_id: deviceId,
      p_request_token: requestToken,
      p_status: status,
      p_error: error
    });
  } catch (markError) {
    console.warn("Scent request mirror audit mark failed:", markError);
  }
};

const markJournalMirror = async ({
  feedbackId,
  deviceId,
  status,
  error = null
}) => {
  try {
    await rpc("mark_journal_feedback_mirror", {
      p_feedback_id: feedbackId,
      p_device_id: deviceId,
      p_status: status,
      p_error: error
    });
  } catch (markError) {
    console.warn("Journal feedback mirror audit mark failed:", markError);
  }
};

const requestToken = () =>
  window.crypto?.randomUUID?.() ||
  `pn_request_${Date.now()}_${Math.random().toString(36).slice(2)}`;

export const loadScentRequestTotals = async () => {
  try {
    const requests = await rpc("get_public_scent_request_totals", {});

    return {
      status: "ok",
      source: "supabase",
      requests: Array.isArray(requests) ? requests : [],
      existingRequests: []
    };
  } catch (canonicalError) {
    console.warn(
      "Supabase scent request totals unavailable; using Sheets fallback.",
      canonicalError
    );

    const response = await fetch(APPS_SCRIPT_URL);
    const data = await safeJson(response);

    if (!response.ok || data?.status !== "ok") {
      throw new Error(
        data?.message ||
        `Scent request fallback failed (${response.status}).`
      );
    }

    return {
      ...data,
      source: "google_sheets_fallback"
    };
  }
};

export const submitCanonicalScentRequest = async ({
  fragrance,
  lang,
  page,
  deviceId
}) => {
  const token = requestToken();
  const payload = {
    timestamp: new Date().toISOString(),
    fragrance,
    lang,
    page,
    source: "scent_request",
    deviceId
  };

  const canonical = await rpc("submit_scent_request_v2", {
    p_fragrance: fragrance,
    p_language: lang,
    p_page: page,
    p_device_id: deviceId,
    p_request_token: token
  });

  if (canonical?.status !== "ok") return canonical;

  try {
    const mirror = await mirrorToSheets(payload);
    await markScentMirror({
      id: canonical.id,
      deviceId,
      requestToken: token,
      status: "synced"
    });

    return {
      ...canonical,
      mirrorStatus: "synced",
      mirror
    };
  } catch (mirrorError) {
    const mirrorPayload = mirrorError?.payload;
    const duplicateAlreadyMirrored =
      canonical?.duplicate === true &&
      mirrorPayload?.status === "blocked" &&
      mirrorPayload?.blockReason === "same_fragrance";

    if (duplicateAlreadyMirrored) {
      await markScentMirror({
        id: canonical.id,
        deviceId,
        requestToken: token,
        status: "synced"
      });

      return {
        ...canonical,
        mirrorStatus: "synced"
      };
    }

    const message = String(mirrorError?.message || mirrorError).slice(0, 400);

    await markScentMirror({
      id: canonical.id,
      deviceId,
      requestToken: token,
      status: "failed",
      error: message
    });

    console.warn(
      "Scent request saved in Supabase, but Sheets mirror failed:",
      mirrorError
    );

    return {
      ...canonical,
      mirrorStatus: "failed",
      mirrorWarning: message
    };
  }
};

export const submitCanonicalJournalFeedback = async (
  payload,
  operation = "vote"
) => {
  const canonical = await rpc("upsert_journal_feedback", {
    p_article: String(payload?.article || ""),
    p_article_title: String(payload?.articleTitle || ""),
    p_vote: String(payload?.vote || ""),
    p_note: String(payload?.note || ""),
    p_operation: operation,
    p_language: String(payload?.lang || ""),
    p_page: String(payload?.page || ""),
    p_device_id: String(payload?.deviceId || ""),
    p_feedback_id: String(payload?.feedbackId || "")
  });

  if (canonical?.status !== "ok") return canonical;

  try {
    const mirror = await mirrorToSheets(payload);

    await markJournalMirror({
      feedbackId: payload.feedbackId,
      deviceId: payload.deviceId,
      status: "synced"
    });

    return {
      ...canonical,
      mirrorStatus: "synced",
      mirror
    };
  } catch (mirrorError) {
    const message = String(mirrorError?.message || mirrorError).slice(0, 400);

    await markJournalMirror({
      feedbackId: payload.feedbackId,
      deviceId: payload.deviceId,
      status: "failed",
      error: message
    });

    console.warn(
      "Journal feedback saved in Supabase, but Sheets mirror failed:",
      mirrorError
    );

    return {
      ...canonical,
      mirrorStatus: "failed",
      mirrorWarning: message
    };
  }
};
