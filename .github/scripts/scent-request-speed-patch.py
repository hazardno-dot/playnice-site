from pathlib import Path

path = Path('playnice-site/src/App.js')
text = path.read_text(encoding='utf-8')

old_send = '''const sendScentRequest = async (
  fragranceName,
  source = "scent_request"
) => {
  try {
    const response = await fetch(
      "https://script.google.com/macros/s/AKfycby38XWvXcD6Cgw2_ExKEpegaYg-mgiuYLVXzDgcwefVSCZtyWVL2QvVQzmX7nrltene/exec",
      {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          fragrance: fragranceName,
          lang,
          page: window.location.pathname,
          source,
          deviceId: getPlayNiceDeviceId()
        })
      }
    );

    return await response.json();
  } catch (error) {
    console.error("Scent request submit failed:", error);

    return {
      status: "error",
      message: String(error)
    };
  }
};'''

new_send = '''const sendScentRequest = async (
  fragranceName,
  source = "scent_request"
) => {
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const response = await fetch(
        "https://script.google.com/macros/s/AKfycby38XWvXcD6Cgw2_ExKEpegaYg-mgiuYLVXzDgcwefVSCZtyWVL2QvVQzmX7nrltene/exec",
        {
          method: "POST",
          mode: "cors",
          headers: {
            "Content-Type": "text/plain;charset=utf-8"
          },
          body: JSON.stringify({
            timestamp: new Date().toISOString(),
            fragrance: fragranceName,
            lang,
            page: window.location.pathname,
            source,
            deviceId: getPlayNiceDeviceId()
          })
        }
      );

      const result = await response.json();
      const isServerBusy =
        result?.status === "busy" || result?.blockReason === "server_busy";

      if (!isServerBusy || attempt === maxAttempts) {
        return result;
      }

      await new Promise((resolve) => setTimeout(resolve, 400 * attempt));
    } catch (error) {
      if (attempt === maxAttempts) {
        console.error("Scent request submit failed:", error);
        return {
          status: "error",
          message: String(error)
        };
      }

      await new Promise((resolve) => setTimeout(resolve, 400 * attempt));
    }
  }

  return {
    status: "error",
    message: "Scent request retry limit reached"
  };
};'''

if old_send not in text:
    raise SystemExit('sendScentRequest marker not found')
text = text.replace(old_send, new_send, 1)

# Clear the form only after a genuinely successful new scent request.
needle = '''  if (result?.status !== "ok") {
    setScentRequestStatus(
      lang === "sr"
        ? "Glas nije prošao. Probaj ponovo."
        : "Vote was not saved. Please try again."
    );

    return;
  }

  setCommunityRequests((prev) => {'''
replacement = '''  if (result?.status !== "ok") {
    setScentRequestStatus(
      lang === "sr"
        ? "Glas nije prošao. Probaj ponovo."
        : "Vote was not saved. Please try again."
    );

    return;
  }

  setScentRequestValue("");

  setCommunityRequests((prev) => {'''
if needle not in text:
    raise SystemExit('successful submit marker not found')
text = text.replace(needle, replacement, 1)

path.write_text(text, encoding='utf-8')
