const timestamp = (value) => {
  if (!value) return null;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export function getPreviewWorkflowState(row = {}) {
  const hasPreview = Boolean(row.apply_branch && row.apply_pr_number);
  const preparedAt = timestamp(row.prepared_at);
  const previewCreatedAt = timestamp(row.apply_created_at);
  const verifiedAt = timestamp(row.preview_verified_at);

  const needsRefresh = Boolean(
    hasPreview &&
    preparedAt !== null &&
    (previewCreatedAt === null || preparedAt > previewCreatedAt)
  );

  if (!hasPreview) {
    return {
      id: "no-preview",
      hasPreview: false,
      needsRefresh: false,
      verified: false,
      qaAllowed: false,
      label: "APPROVED · READY TO APPLY",
    };
  }

  if (needsRefresh) {
    return {
      id: "refresh-required",
      hasPreview: true,
      needsRefresh: true,
      verified: false,
      qaAllowed: false,
      label: "DRAFT CHANGED AFTER PREVIEW · REFRESH REQUIRED",
    };
  }

  if (verifiedAt !== null) {
    return {
      id: "verified",
      hasPreview: true,
      needsRefresh: false,
      verified: true,
      qaAllowed: false,
      label: "PREVIEW VERIFIED · READY TO MERGE",
    };
  }

  return {
    id: "qa-required",
    hasPreview: true,
    needsRefresh: false,
    verified: false,
    qaAllowed: true,
    label: "PREVIEW CURRENT · VISUAL QA REQUIRED",
  };
}
