function handleJournalFeedback(spreadsheet, data) {
  const article = String(data.article || "").trim();
  const deviceId = String(data.deviceId || "").trim();
  const vote = String(data.vote || "").trim().toLowerCase();
  const note = String(data.note || "").trim();
  // Cached clients sent vote + optional note without an operation.
  const operation = data.operation || (note ? "note" : "vote");
  const feedbackId = "journal_" + deviceId + "_" + article;
  if (!article || !deviceId || article.length > 200 || deviceId.length > 200 ||
      (vote !== "up" && vote !== "down") ||
      (operation !== "vote" && operation !== "note") ||
      (operation === "note" && (!note || note.length > 2000)) ||
      (data.feedbackId && String(data.feedbackId) !== feedbackId)) {
    return jsonResponse({ status: "error", message: "Invalid journal feedback" });
  }
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) {
    return jsonResponse({ status: "busy", message: "Please retry" });
  }
  let existingRow = 0;
  try {
    const sheet = spreadsheet.getSheetByName("Feedback");
    if (!sheet) throw new Error('Sheet "Feedback" not found');
    const count = sheet.getLastRow() - 1;
    if (count > 0) {
      const ids = sheet.getRange(2, 11, count, 1).getValues();
      for (let i = 0; i < ids.length; i++) {
        if (String(ids[i][0] || "").trim() === feedbackId) {
          existingRow = i + 2;
          break;
        }
      }
    }
    const now = new Date();
    const previousNote = existingRow ? sheet.getRange(existingRow, 5).getValue() : "";
    // Treat user strings as literal cell text, never spreadsheet formulas.
    const literal = function(value) {
      const text = String(value || "");
      return /^[=+@-]/.test(text) ? "'" + text : text;
    };
    const row = [
      now, literal(article), literal(data.articleTitle), vote,
      operation === "note" ? literal(note) : literal(previousNote),
      literal(data.lang), literal(data.page), "journal_feedback",
      vote === "up" ? 1 : -1,
      Utilities.formatDate(now, Session.getScriptTimeZone(), "M/d/yyyy"),
      feedbackId, literal(deviceId)
    ];
    if (!existingRow) sheet.insertRowBefore(2);
    sheet.getRange(existingRow || 2, 1, 1, row.length).setValues([row]);
    SpreadsheetApp.flush();
    // Serialize dashboard rebuilds too, so overlapping requests cannot clear each other's output.
    try { refreshJournalAnalytics(spreadsheet); }
    catch (error) { Logger.log("Journal analytics refresh error: " + error); }
  } finally {
    lock.releaseLock();
  }
  return jsonResponse({
    status: "ok", type: "journal", feedbackId: feedbackId,
    operation: operation, action: existingRow ? "updated" : "created"
  });
}
