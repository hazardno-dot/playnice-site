const SUPABASE_URL =
  process.env.SUPABASE_URL || "https://fsujznyfdrstinqexxgs.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY ||
  "sb_publishable_XzvxcEV7Cye44oF4bRWxtQ_VUq9gcNN";

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
      return res.status(502).json({
        status: "error",
        message: "Community totals unavailable"
      });
    }
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      status: "error",
      message: "Method not allowed"
    });
  }

  try {
    const input = req.body || {};

    if (input.type === "scent_request") {
      const payload = input.payload || {};

      const canonical = await rpc("submit_scent_request_v2", {
        p_fragrance: String(payload.fragrance || ""),
        p_language: String(payload.lang || ""),
        p_page: String(payload.page || ""),
        p_device_id: String(payload.deviceId || ""),
        p_request_token: String(input.requestToken || "")
      });

      return res.status(200).json(canonical);
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

      return res.status(200).json(canonical);
    }

    return res.status(400).json({
      status: "error",
      message: "Unsupported community intake type"
    });
  } catch (error) {
    console.error("Community intake API failed:", error);
    return res.status(500).json({
      status: "error",
      message: "Community intake failed"
    });
  }
};
