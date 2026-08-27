import { formatNoteKey } from "./noteAudit.mjs";

export const NOTE_REVIEW_STATES = ["draft", "ready", "approved"];

export const normalizeNoteDraftPayload = (value = {}) => {
  const key = String(value.key || value.note_key || "").trim().toLowerCase();
  return {
    key,
    srLabel: String(value.srLabel || value.sr || "").trim(),
    enLabel: String(value.enLabel || value.en || formatNoteKey(key)).trim(),
    assetPath: String(value.assetPath || (key ? `/note-map/${key}.webp` : "")).trim(),
  };
};

export function auditNoteDraftPayload(value = {}, liveKeys = []) {
  const payload = normalizeNoteDraftPayload(value);
  const issues = [];
  const keyPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  if (!payload.key || !keyPattern.test(payload.key)) issues.push({ level: "error", field: "key", message: "Use a canonical lowercase note key such as pink-grapefruit." });
  if (!payload.srLabel) issues.push({ level: "error", field: "srLabel", message: "Serbian label is required." });
  if (!payload.enLabel) issues.push({ level: "error", field: "enLabel", message: "English label is required." });
  const expectedAsset = payload.key ? `/note-map/${payload.key}.webp` : "";
  if (payload.assetPath !== expectedAsset) issues.push({ level: "error", field: "assetPath", message: `Asset path must be ${expectedAsset || "/note-map/<key>.webp"}.` });
  const canonicalEn = formatNoteKey(payload.key);
  if (payload.enLabel && payload.enLabel !== canonicalEn) issues.push({ level: "warning", field: "enLabel", message: "Custom English label requires a NOTE_LIBRARY override during Controlled Apply." });
  return {
    payload,
    isExisting: new Set(liveKeys).has(payload.key),
    issues,
    errors: issues.filter((issue) => issue.level === "error"),
    warnings: issues.filter((issue) => issue.level === "warning"),
  };
}

export function getNoteDraftState(row) {
  const status = String(row?.review_status || "draft").toLowerCase();
  return NOTE_REVIEW_STATES.includes(status) ? status : "draft";
}
