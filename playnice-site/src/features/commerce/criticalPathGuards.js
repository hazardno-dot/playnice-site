export const readStoredArray = (
  storage,
  key
) => {
  if (!storage || !key) return [];

  try {
    const raw = storage.getItem(key);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const isConfirmedOrderResult = (
  result
) =>
  Boolean(
    result?.success &&
      result?.orderPlaced &&
      result?.orderId
  );

export const acquireSubmissionLock = (
  lockRef
) => {
  if (!lockRef || lockRef.current) {
    return false;
  }

  lockRef.current = true;
  return true;
};

export const releaseSubmissionLock = (
  lockRef
) => {
  if (lockRef) {
    lockRef.current = false;
  }
};
