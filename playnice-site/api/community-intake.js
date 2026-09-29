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
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("Supabase environment is not configured");
  }

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
    throw new Error(data?.message || data?.hint || `Supabase RPC failed (${response.status})`);
  }
  return data;
};

const fetchWithTimeout = async (url, options = {}, timeoutMs = 6000) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
};

const mirrorToSheets = async (payload) => {
  const response = await fetchWithTimeout(
    APPS_SCRIPT_URL,
    {
      method: "POST",
      redirect: "follow",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    },
    6000
  );
  const data = await safeJson(response);
  if (!response.ok || data?.status !== "ok") {
    const error = new Error(data?.message || `Sheets mirror failed (${response.status})`);
    error.payload = data;
    throw error;
  }
  return data;
};

const markScentMirror = (input) =>
  rpc("mark_scent_request_mirror", {
    p_id: Number(input.id),
    p_device_id: input.deviceId,
    p_request_token: input.requestToken,
    p_status: input.status,
    p_error: input.error || null
  });

const markJournalMirror = (input) =>
  rpc("mark_journal_feedback_mirror", {
    p_feedback_id: input.feedbackId,
    p_device_id: input.deviceId,
    p_status: input.status,
    p_error: input.error || null
  });

module.exports = async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const requests = await rpc("get_public_scent_request_totals", {});
      return res.status(200).json({
        status: "ok",
        source: "supabase",
        requests: Array.isArray(requests) ? requests : [],
        existingRequests: []
      });
    } catch (error) {
      console.error("Community totals failed:", error);
      return res.status(502).json({ status: "error", message: "Community totals unavailable" });
    }
  }

  if (req.method !== "POST") {
    return res.status(405).json({ status: "error", message: "Method not allowed" });
  }

  try {
    const input = req.body || {};

    if (input.type === "scent_request") {
      const payload = input.payload || {};
      const requestToken = String(input.requestToken || "").trim();
      const deviceId = String(payload.deviceId || "").trim();

      const canonical = await rpc("submit_scent_request_v2", {
        p_fragrance: String(payload.fragrance || ""),
        p_language: String(payload.lang || ""),
        p_page: String(payload.page || ""),
        p_device_id: deviceId,
        p_request_token: requestToken
      });

      if (canonical?.status !== "ok") {
        return res.status(200).json(canonical);
      }

      let mirrorStatus = canonical?.mirrorStatus || "pending";
      let mirrorWarning = null;

      try {
        await mirrorToSheets({
          timestamp: payload.timestamp || new Date().toISOString(),
          fragrance: String(payload.fragrance || ""),
          lang: String(payload.lang || ""),
          page: String(payload.page || ""),
          source: "scent_request",
          deviceId
        });

        await markScentMirror({
          id: canonical.id,
          deviceId,
          requestToken,
          status: "synced"
        });

        mirrorStatus = "synced";
      } catch (mirrorError) {
        mirrorWarning = String(mirrorError?.message || mirrorError).slice(0, 400);
        try {
          await markScentMirror({
            id: canonical.id,
            deviceId,
            requestToken,
            status: "failed",
            error: mirrorWarning
          });
          mirrorStatus = "failed";
        } catch (markError) {
          console.warn("Scent mirror audit mark failed:", markError);
        }
      }

      return res.status(200).json({ ...canonical, mirrorStatus, mirrorWarning });
    }

    if (input.type === "journal_feedback") {
      const payload = input.payload || {};
      const operation = String(input.operation || "vote").trim().toLowerCase();

      const canonical = await rpc("upsert_journal_feedback", {
        p_article: String(payload.article || ""),
        p_article_title: String(payload.articleTitle || ""),
        p_vote: String(payload.vote || ""),
        p_note: String(payload.note || ""),
        p_operation: operation,
        p_language: String(payload.lang || ""),
        p_page: String(payload.page || ""),
        p_device_id: String(payload.deviceId || ""),
        p_feedback_id: String(payload.feedbackId || "")
      });

      if (canonical?.status !== "ok") {
        return res.status(200).json(canonical);
      }

      let mirrorStatus = "pending";
      let mirrorWarning = null;

      try {
        await mirrorToSheets({ ...payload, source: "journal_feedback" });

        await markJournalMirror({
          feedbackId: String(payload.feedbackId || ""),
          deviceId: String(payload.deviceId || ""),
          status: "synced"
        });

        mirrorStatus = "synced";
      } catch (mirrorError) {
        mirrorWarning = String(mirrorError?.message || mirrorError).slice(0, 400);
        try {
          await markJournalMirror({
            feedbackId: String(payload.feedbackId || ""),
            deviceId: String(payload.deviceId || ""),
            status: "failed",
            error: mirrorWarning
          });
          mirrorStatus = "failed";
        } catch (markError) {
          console.warn("Journal mirror audit mark failed:", markError);
        }
      }

      return res.status(200).json({ ...canonical, mirrorStatus, mirrorWarning });
    }

    return res.status(400).json({ status: "error", message: "Unsupported community intake type" });
  } catch (error) {
    console.error("Community intake API failed:", error);
    return res.status(500).json({ status: "error", message: "Community intake failed" });
  }
};
