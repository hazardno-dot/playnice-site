// Synthetic, local-only fault-injection lab. This does NOT simulate a real
// network request, checkout, or Postgres concurrency. No database access.
import { evaluateInventoryShadow } from "./inventory-protection-shadow.mjs";
import { classifyInventoryObligation } from "./inventory-reservation-lifecycle.mjs";
import { ReservationSpecification } from "./inventory-reservation-simulator.mjs";

const stock = {
  productKey: "naxos-test",
  physicalMl: 80,
  currentBalanceVerified: true,
  snapshotConsistent: true,
  mappingVerified: true,
  estimated: false
};
const input = (overrides = {}) => ({
  productKey: "naxos-test",
  items: [{ productKey: "naxos-test", sizeMl: 20, quantity: 1 }],
  stock: { ...stock },
  reservedMl: 0,
  ...overrides
});

// Defensive *specification* for a future server dependency. It must not be
// mistaken for a network handler or a production fallback policy.
export function classifyShadowDependencyResult(readSnapshot, request) {
  try {
    const snapshot = readSnapshot();
    if (!snapshot || snapshot.status !== "READY") {
      return { decision: "UNKNOWN", reason: "SOURCE_UNAVAILABLE" };
    }
    return evaluateInventoryShadow({ ...request, stock: snapshot.stock, reservedMl: snapshot.reservedMl });
  } catch {
    return { decision: "UNKNOWN", reason: "SOURCE_ERROR" };
  }
}

export function runInventorySafetyLab() {
  const scenarios = [];
  const record = (id, label, passed, detail) =>
    scenarios.push({ id, label, passed: Boolean(passed), detail });

  {
    const result = evaluateInventoryShadow(input({ stock: null }));
    record("missing-stock", "Nedostaju podaci o zalihama",
      result.decision === "UNKNOWN" && result.reason === "NO_MATCHING_STOCK",
      "Nedostajuće stanje nije isto što i rasprodato.");
  }
  {
    const result = evaluateInventoryShadow(input({
      stock: { ...stock, physicalMl: 0, currentBalanceVerified: false }
    }));
    record("unverified-zero", "Nepotvrđena nula ne zaključava parfem",
      result.decision === "UNKNOWN",
      "Neproverena nula ne sme da postane WOULD_BLOCK.");
  }
  {
    const result = evaluateInventoryShadow(input({
      stock: { ...stock, physicalMl: 0 }
    }));
    record("verified-zero", "Potvrđena nula daje samo hipotetički WOULD_BLOCK",
      result.decision === "WOULD_BLOCK",
      "Samo provereno stanje može dati negativnu odluku u Shadow Mode-u.");
  }
  {
    const result = evaluateInventoryShadow(input({
      stock: { ...stock, snapshotConsistent: false }
    }));
    record("stale-snapshot", "Neusaglašena/stara slika inventara",
      result.decision === "UNKNOWN",
      "Ne dozvoljavamo odluku iz nekonzistentnih podataka.");
  }
  {
    const result = evaluateInventoryShadow(input({
      stock: { ...stock, mappingVerified: false }
    }));
    record("unknown-mapping", "Nepouzdan identitet parfema",
      result.decision === "UNKNOWN",
      "Ne zaključavamo kupovinu kada mapiranje nije provereno.");
  }
  {
    const result = evaluateInventoryShadow(input({ reservedMl: 81 }));
    record("over-reservation", "Rezervacije veće od raspoloživog stanja",
      result.decision === "UNKNOWN" && result.reason === "INCONSISTENT_STOCK",
      "Nedosledan ledger zahteva proveru umesto automatskog blokiranja.");
  }
  {
    const unavailable = classifyShadowDependencyResult(() => ({ status: "DOWN" }), input());
    const throws = classifyShadowDependencyResult(() => { throw Error("Synthetic timeout"); }, input());
    record("source-failures", "Nedostupan servis i simulirani timeout",
      unavailable.decision === "UNKNOWN" && throws.decision === "UNKNOWN" &&
        throws.reason === "SOURCE_ERROR",
      "Ovo proverava čistu fallback logiku, ne stvarnu mrežnu grešku.");
  }
  {
    const lab = new ReservationSpecification({ "naxos-test": 80 });
    lab.commitNewOrder({
      orderId: "A", fingerprint: "fp-a",
      items: [{ productKey: "naxos-test", sizeMl: 20, quantity: 1 }]
    });
    const packed = lab.packOrder("A");
    const cancelledAfterPack = lab.cancelUnpacked("A");
    const rollbackStatus = classifyInventoryObligation("NEW", { everPacked: true });
    record("rollback-after-pack", "Vraćanje PACKED → NEW ne vraća potrošene mililitre",
      packed.ok && cancelledAfterPack.reason === "RECONCILIATION_REQUIRED" &&
        rollbackStatus === "RECONCILIATION_REQUIRED" &&
        lab.view("naxos-test").physicalMl === 60,
      "Već pretočeno stanje zahteva eksplicitno usaglašavanje.");
  }
  return {
    source: "SYNTHETIC_IN_MEMORY",
    databaseWrites: 0,
    networkRequests: 0,
    realNetworkFailureTested: false,
    realPostgresConcurrencyTested: false,
    passed: scenarios.filter(row => row.passed).length,
    total: scenarios.length,
    scenarios
  };
}
