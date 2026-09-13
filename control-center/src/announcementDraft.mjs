export const ANNOUNCEMENT_TONES = ["default", "new-shop", "success", "warning"];
export const ANNOUNCEMENT_ACTIONS = ["none", "openProduct", "openShop"];
export const ANNOUNCEMENT_REVIEW_STATES = ["draft", "ready", "approved"];

export function normalizeAnnouncementDraft(value = {}) {
  const action = ANNOUNCEMENT_ACTIONS.includes(value.action) ? value.action : "none";
  const tone = ANNOUNCEMENT_TONES.includes(value.tone) ? value.tone : "default";
  const priority = Number.isFinite(Number(value.priority)) ? Number(value.priority) : 10;
  return {
    id: String(value.id || "").trim(),
    enabled: value.enabled !== false,
    text: {
      sr: String(value.text?.sr || ""),
      en: String(value.text?.en || ""),
    },
    icon: String(value.icon || "→"),
    tone,
    action,
    slug: action === "openProduct" ? String(value.slug || "").trim() : "",
    priority,
  };
}

export function auditAnnouncementDraft(value = {}, existingIds = [], originalId = "") {
  const payload = normalizeAnnouncementDraft(value);
  const errors = [];
  if (!payload.id) errors.push("Announcement ID is required.");
  if (payload.id && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(payload.id)) errors.push("Announcement ID must use lowercase kebab-case.");
  if (payload.id && payload.id !== originalId && existingIds.includes(payload.id)) errors.push("Announcement ID already exists.");
  if (!payload.text.sr.trim()) errors.push("SR copy is required.");
  if (!payload.text.en.trim()) errors.push("EN copy is required.");
  if (!Number.isFinite(payload.priority)) errors.push("Priority must be a number.");
  if (payload.action === "openProduct" && !payload.slug) errors.push("Product slug is required for openProduct.");
  return { payload, errors };
}

export function getAnnouncementDraftState(row) {
  const status = String(row?.review_status || "draft").toLowerCase();
  return ANNOUNCEMENT_REVIEW_STATES.includes(status) ? status : "draft";
}
