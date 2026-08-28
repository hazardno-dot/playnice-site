const asArray = (value) => Array.isArray(value) ? value : [];

const diagnosticFor = (check = {}) =>
  asArray(check.issues)[0] ||
  asArray(check.warnings)[0] ||
  (check.latency === "slow" ? `Slow response: ${check.responseMs || 0} ms` : "Health contract degraded");

export function extractHealthSignals(row = {}) {
  const signals = [];
  for (const check of asArray(row.checks)) {
    if (!check?.key) continue;
    if (check.ok === false) {
      signals.push({
        id: `${check.key}:error`,
        checkKey: check.key,
        label: check.label || check.key,
        path: check.path || "",
        severity: "error",
        diagnostic: diagnosticFor(check),
      });
      continue;
    }
    if (asArray(check.warnings).length || check.latency === "slow") {
      signals.push({
        id: `${check.key}:warning`,
        checkKey: check.key,
        label: check.label || check.key,
        path: check.path || "",
        severity: "warning",
        diagnostic: diagnosticFor(check),
      });
    }
  }
  return signals;
}

export function deriveHealthIncidents(history = []) {
  const chronological = [...asArray(history)]
    .filter((row) => row?.checked_at)
    .sort((a, b) => new Date(a.checked_at) - new Date(b.checked_at));

  const active = new Map();
  const episodes = [];

  for (const row of chronological) {
    const timestamp = row.checked_at;
    const signals = extractHealthSignals(row);
    const present = new Set(signals.map((signal) => signal.id));

    for (const [id, episode] of active) {
      if (!present.has(id)) {
        episode.recoveredAt = timestamp;
        episode.status = "recovered";
        episodes.push(episode);
        active.delete(id);
      }
    }

    for (const signal of signals) {
      const existing = active.get(signal.id);
      if (existing) {
        existing.lastSeen = timestamp;
        existing.occurrences += 1;
        existing.diagnostic = signal.diagnostic;
        continue;
      }
      active.set(signal.id, {
        ...signal,
        firstSeen: timestamp,
        lastSeen: timestamp,
        recoveredAt: null,
        status: "active",
        occurrences: 1,
      });
    }
  }

  episodes.push(...active.values());
  return episodes.sort((a, b) => {
    if (a.status !== b.status) return a.status === "active" ? -1 : 1;
    return new Date(b.lastSeen) - new Date(a.lastSeen);
  });
}

export function summarizeHealthIncidents(history = []) {
  const incidents = deriveHealthIncidents(history);
  const active = incidents.filter((incident) => incident.status === "active");
  const recovered = incidents.filter((incident) => incident.status === "recovered");
  return {
    incidents,
    active,
    recovered,
    activeErrors: active.filter((incident) => incident.severity === "error").length,
    activeWarnings: active.filter((incident) => incident.severity === "warning").length,
    lastRecovered: recovered[0] || null,
  };
}
