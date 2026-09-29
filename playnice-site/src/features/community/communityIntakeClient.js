const requestToken = () =>
  window.crypto?.randomUUID?.() ||
  `pn_request_${Date.now()}_${Math.random().toString(36).slice(2)}`;

const apiJson = async (response) => {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return { message: text.slice(0, 300) };
  }
};

const callCommunityApi = async (options = {}) => {
  const response = await fetch("/api/community-intake", options);
  const data = await apiJson(response);

  if (!response.ok) {
    throw new Error(
      data?.message ||
      `Community intake API failed (${response.status}).`
    );
  }

  return data;
};

const queueCommunityMirror = (body) => {
  void fetch("/api/community-mirror", {
    method: "POST",
    keepalive: true,
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  }).catch((error) => {
    console.warn("Community Sheets mirror request failed:", error);
  });
};

export const loadScentRequestTotals = async () =>
  callCommunityApi({ method: "GET" });

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
    deviceId
  };

  const canonical = await callCommunityApi({
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      type: "scent_request",
      requestToken: token,
      payload
    })
  });

  if (canonical?.status === "ok") {
    queueCommunityMirror({
      type: "scent_request",
      canonicalId: canonical.id,
      requestToken: token,
      payload
    });
  }

  return canonical;
};

export const submitCanonicalJournalFeedback = async (
  payload,
  operation = "vote"
) => {
  const canonical = await callCommunityApi({
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      type: "journal_feedback",
      operation,
      payload
    })
  });

  if (canonical?.status === "ok") {
    queueCommunityMirror({
      type: "journal_feedback",
      payload
    });
  }

  return canonical;
};
