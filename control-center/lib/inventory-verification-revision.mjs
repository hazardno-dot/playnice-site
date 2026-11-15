// Immutable-event revision contract for future persisted inventory verification.
// Standalone pure model. No Supabase calls and not used for checkout enforcement.
//
// IMPORTANT: event IDs must come from authoritative server queries and include
// EVERY event that may affect sellable stock (order create, status transitions,
// gift changes, restocks, removals, corrections, returns, etc). Until the data
// source proves completeness, revision.status is INCOMPLETE and no confirmation
// can be considered current.
const normalize = (v) => String(v || "").trim().toLowerCase();

export function buildInventoryEventRevision({
  productKey, inventoryEvents, orderEvents, evidenceComplete = false
} = {}) {
  const key = normalize(productKey);
  if (!key || evidenceComplete !== true ||
      !Array.isArray(inventoryEvents) || !Array.isArray(orderEvents)) {
    return { status: "INCOMPLETE", revision: null };
  }
  const all = [];
  for (const [source, entries] of [["inventory",inventoryEvents],["order",orderEvents]]) {
    for (const event of entries) {
      if (!event || typeof event.id !== "string" ||
          !/^[a-zA-Z0-9_-]{1,128}$/.test(event.id) ||
          typeof event.productKey !== "string" ||
          !normalize(event.productKey)) return {status:"INCOMPLETE",revision:null};
      if (normalize(event.productKey) !== key) continue;
      all.push(source + ":" + event.id);
    }
  }
  const unique = new Set(all);
  if (unique.size !== all.length) return {status:"INCOMPLETE",revision:null};
  return { status: "COMPLETE", revision: JSON.stringify({
    productKey: key,
    sourceVersion: 1,
    eventIds: [...unique].sort()
  }) };
}

export function isInventoryReviewCurrent({
  reviewedSnapshot, currentSnapshot, reviewedRevision, currentRevision
} = {}) {
  return typeof reviewedSnapshot === "string" &&
    typeof currentSnapshot === "string" &&
    reviewedSnapshot === currentSnapshot &&
    reviewedRevision?.status === "COMPLETE" &&
    currentRevision?.status === "COMPLETE" &&
    reviewedRevision.revision === currentRevision.revision;
}
