const ENDPOINT = "https://script.google.com/macros/s/AKfycby38XWvXcD6Cgw2_ExKEpegaYg-mgiuYLVXzDgcwefVSCZtyWVL2QvVQzmX7nrltene/exec";

export async function submitJournalFeedback(payload, fetchImpl = fetch) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetchImpl(ENDPOINT, {
      method: "POST",
      mode: "cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    const result = await response.json();
    if (!response.ok || result.status !== "ok" ||
        result.feedbackId !== payload.feedbackId || result.operation !== payload.operation) {
      throw new Error("Journal feedback was not acknowledged");
    }
    return result;
  } finally {
    clearTimeout(timer);
  }
}
