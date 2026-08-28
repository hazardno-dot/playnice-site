const canonicalize = (value) => {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    return Object.keys(value).sort().reduce((out, key) => {
      const next = value[key];
      if (typeof next !== "undefined") out[key] = canonicalize(next);
      return out;
    }, {});
  }
  return value;
};

export const stablePayloadJson = (value) => JSON.stringify(canonicalize(value ?? null));

export const approvalPayloadsEqual = (payload, approvedPayload) =>
  stablePayloadJson(payload) === stablePayloadJson(approvedPayload);

export function getApprovalPayloadState(row) {
  if (!row) return { status: "missing-row", safe: false };
  if (row.review_status !== "approved" || !row.prepared_at) {
    return { status: "not-prepared", safe: false };
  }
  if (!row.approved_payload) {
    return { status: "missing-approved-payload", safe: false };
  }
  if (!approvalPayloadsEqual(row.payload, row.approved_payload)) {
    return { status: "payload-drift", safe: false };
  }
  return { status: "aligned", safe: true };
}
