const SUPABASE_URL =
  process.env.SUPABASE_URL || "https://fsujznyfdrstinqexxgs.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY ||
  "sb_publishable_XzvxcEV7Cye44oF4bRWxtQ_VUq9gcNN";
const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycby38XWvXcD6Cgw2_ExKEpegaYg-mgiuYLVXzDgcwefVSCZtyWVL2QvVQzmX7nrltene/exec";

const safeJson = async (response) => {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return { raw: text.slice(0, 300) };
  }
};

const rpc = async (name, body = {}) => {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/rpc/${encodeURIComponent(name)}`,
    {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
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
      `Supabase RPC failed (${response.status})`
    );
  }

  return data;
};

const mirrorToSheets = async (payload) => {
  const response = await fetch(APPS_SCRIPT_URL, {
    method: "POST",
    redirect: "follow",
    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    },
    body: JSON.stringify(payload)
  });

  const data = await safeJson(response);

  if (!response.ok || data?.status !== "ok") {
    const error = new Error(
      data?.message ||
      `Google Sheets mirror failed (${response.status})`
    );
    error.payload = data;
    throw error;
  }

  return data;
};

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      status: "error",
      message: "Method not allowed"
    });
  }

  const input = req.body || {};
  const payload = input.payload || {};

  try {
    if (input.type === "scent_request") {
      await mirrorToSheets({
        timestamp: payload.timestamp || new Date().toISOString(),
        fragrance: String(payload.fragrance || ""),
        lang: String(payload.lang || ""),
        page: String(payload.page || ""),
        source: "scent_request",
        deviceId: String(payload.deviceId || "")
      });

      await rpc("mark_scent_request_mirror", {
        p_id: Number(input.canonicalId),
        p_device_id: String(payload.deviceId || ""),
        p_request_token: String(input.requestToken || ""),
        p_status: "synced",
        p_error: null
      });

      return res.status(200).json({
        status: "ok",
        mirrorStatus: "synced"
      });
    }

    if (input.type === "journal_feedback") {
      await mirrorToSheets({
        ...payload,
        source: "journal_feedback"
      });

      await rpc("mark_journal_feedback_mirror", {
        p_feedback_id: String(payload.feedbackId || ""),
        p_device_id: String(payload.deviceId || ""),
        p_status: "synced",
        p_error: null
      });

      return res.status(200).json({
        status: "ok",
        mirrorStatus: "synced"
      });
    }

    return res.status(400).json({
      status: "error",
      message: "Unsupported community mirror type"
    });
  } catch (error) {
    const message = String(error?.message || error).slice(0, 400);

    try {
      if (input.type === "scent_request") {
        await rpc("mark_scent_request_mirror", {
          p_id: Number(input.canonicalId),
          p_device_id: String(payload.deviceId || ""),
          p_request_token: String(input.requestToken || ""),
          p_status: "failed",
          p_error: message
        });
      } else if (input.type === "journal_feedback") {
        await rpc("mark_journal_feedback_mirror", {
          p_feedback_id: String(payload.feedbackId || ""),
          p_device_id: String(payload.deviceId || ""),
          p_status: "failed",
          p_error: message
        });
      }
    } catch (markError) {
      console.warn("Community mirror audit mark failed:", markError);
    }

    console.warn("Community Sheets mirror failed:", error);

    return res.status(502).json({
      status: "error",
      mirrorStatus: "failed"
    });
  }
};
