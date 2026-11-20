// Deterministic, client-side-only PlayNice inventory lab.
// Uses synthetic stock and the pure reservation specification. Never contacts
// Supabase, invokes checkout, sends requests or modifies real orders.
// NOT a test of PostgreSQL locks or genuinely concurrent transactions.
import { ReservationSpecification } from "./inventory-reservation-simulator.mjs";

const item = (productKey, sizeMl, quantity = 1) => ({ productKey, sizeMl, quantity });
const order = (orderId, fingerprint, items) => ({ orderId, fingerprint, items });

export function runInventoryPreviewLab() {
  const scenarios = [];
  const record = (id, label, check, detail) => {
    let passed = false;
    try { passed = Boolean(check()); } catch { passed = false; }
    scenarios.push({ id, label, passed, detail });
  };

  {
    const lab = new ReservationSpecification({ "naxos-test": 80 });
    const a = lab.commitNewOrder(order("A", "fp-a", [item("naxos-test", 60)]));
    const b = lab.commitNewOrder(order("B", "fp-b", [item("naxos-test", 60)]));
    const state = lab.view("naxos-test");
    record("competing-60", "Dva kupca traže po 60 ml od ukupno 80 ml",
      () => a.ok === true && b.ok === false && b.reason === "INSUFFICIENT_AVAILABLE" &&
        state.reservedMl === 60 && state.availableMl === 20,
      "U sekvencijalnoj simulaciji samo prva rezervacija uspeva.");
  }
  {
    const lab = new ReservationSpecification({ "naxos-test": 80 });
    const a = lab.commitNewOrder(order("A", "fp-a", [item("naxos-test", 20, 2)]));
    const b = lab.commitNewOrder(order("B", "fp-b", [item("naxos-test", 20, 2)]));
    const c = lab.commitNewOrder(order("C", "fp-c", [item("naxos-test", 20)]));
    record("exact-capacity", "Dve rezervacije od 40 ml; treća se odbija",
      () => a.ok && b.ok && !c.ok && lab.view("naxos-test").reservedMl === 80,
      "Ne dozvoljava rezervacije preko 80 ml.");
  }
  {
    const lab = new ReservationSpecification({ "naxos-test": 80 });
    const a = lab.commitNewOrder(order("A", "fp-a",
      [item("naxos-test", 20), item("naxos-test", 10, 2)]));
    record("mixed-sizes", "20 + 10 + 10 ml istog parfema",
      () => a.ok && lab.view("naxos-test").reservedMl === 40,
      "Više veličina sabira se u jednu rezervaciju.");
  }
  {
    const lab = new ReservationSpecification({ "naxos-test": 80, "ginger-test": 30 });
    const result = lab.commitNewOrder(order("A", "fp-a",
      [item("naxos-test", 20), item("ginger-test", 20, 2)]));
    record("all-or-nothing", "Nedostupan parfem poništava celu mešovitu korpu",
      () => !result.ok && lab.view("naxos-test").reservedMl === 0 &&
        lab.view("ginger-test").reservedMl === 0,
      "Nema delimično sačuvanih rezervacija.");
  }
  {
    const lab = new ReservationSpecification({ "naxos-test": 80 });
    lab.commitNewOrder(order("A", "fp-a", [item("naxos-test", 20)]));
    const replay = lab.commitNewOrder(order("A-retry", "fp-a", [item("naxos-test", 20)]));
    record("idempotency", "Ponovljeni checkout ne rezerviše dva puta",
      () => replay.duplicate === true && replay.orderId === "A" &&
        lab.view("naxos-test").reservedMl === 20,
      "Fingerprint vraća postojeći ID.");
  }
  {
    const lab = new ReservationSpecification({ "naxos-test": 80 });
    lab.commitNewOrder(order("A", "fp-a", [item("naxos-test", 20)]));
    const packed = lab.packOrder("A");
    const repeated = lab.packOrder("A");
    const cancel = lab.cancelUnpacked("A");
    record("packed-once", "PACKED troši samo jednom; otkazivanje ne vraća pretočeno",
      () => packed.ok && repeated.duplicate && cancel.reason === "RECONCILIATION_REQUIRED" &&
        lab.view("naxos-test").physicalMl === 60 &&
        lab.view("naxos-test").reservedMl === 0,
      "Već pretočen parfem zahteva ručno usaglašavanje.");
  }
  {
    const lab = new ReservationSpecification({ "naxos-test": 80 });
    lab.commitNewOrder(order("A", "fp-a", [item("naxos-test", 20)]));
    const cancel = lab.cancelUnpacked("A");
    const again = lab.cancelUnpacked("A");
    record("cancel-new", "Otkazivanje NEW oslobađa rezervaciju samo jednom",
      () => cancel.ok && again.duplicate &&
        lab.view("naxos-test").availableMl === 80,
      "Fizičko stanje ostaje 80 ml.");
  }
  {
    const lab = new ReservationSpecification({ "naxos-test": 80 });
    const unknown = lab.commitNewOrder(order("A", "fp-a", [item("missing-test", 10)]));
    const preview = lab.commitNewOrder({
      ...order("P", "fp-p", [item("naxos-test", 10)]), environment: "preview"
    });
    record("unknown-and-preview", "Nepoznat inventar i Preview ne diraju realni ledger",
      () => unknown.reason === "UNVERIFIED_STOCK" &&
        preview.reason === "PREVIEW_SEPARATE_LEDGER_REQUIRED" &&
        lab.view("naxos-test").reservedMl === 0,
      "Nema pretpostavke da je neproveren parfem rasprodat.");
  }

  return {
    source: "SYNTHETIC_IN_MEMORY",
    databaseWrites: 0,
    actualPostgresConcurrencyTested: false,
    passed: scenarios.filter((scenario) => scenario.passed).length,
    total: scenarios.length,
    scenarios
  };
}
