// Pure preflight gate for future ADMIN verification. Not connected to writes.
// A snapshot equality check is not enough: the server must prove an atomic,
// complete, immutable event revision under the same inventory/order locks.
export function assessInventoryVerificationCommit({
  adminAuthenticated = false,
  serverRecomputed = false,
  canonicalMappingVerified = false,
  allOrderTypesCovered = false,
  noUnresolvedObligations = false,
  revisionBefore,
  revisionAtCommit,
  balanceSnapshotBefore,
  balanceSnapshotAtCommit,
  transactionalLocksHeld = false,
} = {}) {
  if (!adminAuthenticated) return { permitted: false, reason: "ADMIN_REQUIRED" };
  if (!serverRecomputed) return { permitted: false, reason: "SERVER_RECOMPUTE_REQUIRED" };
  if (!canonicalMappingVerified) return { permitted: false, reason: "MAPPING_UNVERIFIED" };
  if (!allOrderTypesCovered) return { permitted: false, reason: "ORDER_COVERAGE_INCOMPLETE" };
  if (!noUnresolvedObligations) return { permitted: false, reason: "UNRESOLVED_ORDER_OBLIGATIONS" };
  if (!transactionalLocksHeld) return { permitted: false, reason: "ATOMIC_LOCKS_REQUIRED" };
  if (!revisionBefore || !revisionAtCommit ||
      revisionBefore.status !== "COMPLETE" || revisionAtCommit.status !== "COMPLETE" ||
      !revisionBefore.revision || revisionBefore.revision !== revisionAtCommit.revision) {
    return { permitted: false, reason: "REVISION_INCOMPLETE_OR_CHANGED" };
  }
  if (typeof balanceSnapshotBefore !== "string" || !balanceSnapshotBefore ||
      balanceSnapshotBefore !== balanceSnapshotAtCommit) {
    return { permitted: false, reason: "BALANCE_CHANGED" };
  }
  return { permitted: true, reason: "PRECONDITIONS_MET" };
}
