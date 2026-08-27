import React, { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { products } from "@shop/data/products/index.js";
import { journalArticles } from "@shop/data/journal/index.js";
import { auditProductNotes } from "./noteAudit.mjs";
import { summarizeHealthIncidents } from "./siteHealthIncidents.mjs";
import { supabase } from "./supabase";
import "./site-health-manager.css";

const fmtTime = (value) => value ? new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(new Date(value)) : "—";
const firstDiagnostic = (item) => item?.issues?.[0] || item?.warnings?.[0] || (item?.contractOk ? "Contract verified" : "Waiting for contract result");
const compactChecks = (checks = []) => checks.map(({ key, label, path, kind, ok, status, responseMs, latency, issues, warnings }) => ({ key, label, path, kind, ok, status, responseMs, latency, issues: issues || [], warnings: warnings || [] }));

export default function SiteHealthManager() {
  const [slot, setSlot] = useState(null);
  const [report, setReport] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [historyError, setHistoryError] = useState("");
  const noteAudit = useMemo(() => auditProductNotes(products), []);
  const incidentSummary = useMemo(() => summarizeHealthIncidents(history), [history]);

  useEffect(() => {
    const mainStage = document.querySelector(".main-stage");
    if (!mainStage) return;
    const sync = () => {
      const heading = mainStage.querySelector(".topbar h1")?.textContent?.trim();
      const placeholder = mainStage.querySelector(".placeholder-panel");
      if (!placeholder || heading !== "Site Health") { setSlot(null); return; }
      let nextSlot = placeholder.querySelector("#site-health-manager-slot");
      if (!nextSlot) {
        placeholder.classList.add("site-health-module-active");
        nextSlot = document.createElement("div");
        nextSlot.id = "site-health-manager-slot";
        nextSlot.className = "site-health-manager-slot";
        placeholder.appendChild(nextSlot);
      }
      setSlot(nextSlot);
    };
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(mainStage, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, []);

  const loadHistory = useCallback(async () => {
    const { data, error: loadError } = await supabase
      .from("site_health_history")
      .select("id,checked_at,overall,total_checks,healthy_checks,failed_checks,warning_checks,slow_checks,avg_response_ms,max_response_ms,checks")
      .order("checked_at", { ascending: false })
      .limit(30);
    if (loadError) {
      setHistoryError(loadError.message);
      return;
    }
    setHistoryError("");
    setHistory(data || []);
  }, []);

  const persistHistory = useCallback(async (payload, userId) => {
    const summary = payload?.summary || {};
    const { error: insertError } = await supabase.from("site_health_history").insert({
      checked_at: payload.checkedAt,
      overall: payload.overall,
      total_checks: summary.total || 0,
      healthy_checks: summary.healthy || 0,
      failed_checks: summary.failed || 0,
      warning_checks: summary.warnings || 0,
      slow_checks: summary.slow || 0,
      avg_response_ms: summary.avgResponseMs || 0,
      max_response_ms: summary.maxResponseMs || 0,
      checks: compactChecks(payload.checks || []),
      created_by: userId,
    });
    if (insertError) throw new Error(`Health check completed, but history could not be saved: ${insertError.message}`);
  }, []);

  const runCheck = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      const session = sessionData?.session;
      if (sessionError || !session?.access_token || !session?.user?.id) throw sessionError || new Error("Authenticated admin session is required.");
      const response = await fetch("/api/site-health", { headers: { Authorization: `Bearer ${session.access_token}` } });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || `Site Health failed (${response.status}).`);
      setReport(payload);
      await persistHistory(payload, session.user.id);
      await loadHistory();
    } catch (healthError) {
      setError(healthError?.message || String(healthError));
    } finally {
      setLoading(false);
    }
  }, [loadHistory, persistHistory]);

  useEffect(() => {
    if (!slot) return;
    loadHistory();
    runCheck();
    const channel = supabase
      .channel("site-health-history")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "site_health_history" }, loadHistory)
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [slot, loadHistory, runCheck]);

  if (!slot) return null;

  const overall = report?.overall || (error ? "error" : "unknown");
  const checks = report?.checks || [];
  const pageChecks = checks.filter((item) => item.kind === "page");
  const assetChecks = checks.filter((item) => item.kind === "asset");
  const bundleChecks = checks.filter((item) => item.kind === "bundle");
  const healthyRuns = history.filter((row) => row.overall === "healthy").length;
  const warningRuns = history.filter((row) => row.overall === "warning").length;
  const errorRuns = history.filter((row) => row.overall === "error").length;
  const availabilityRate = history.length ? Math.round((healthyRuns / history.length) * 100) : null;
  const lastIncident = history.find((row) => row.overall !== "healthy") || null;
  const previousRun = history.find((row) => row.checked_at !== report?.checkedAt) || null;
  const latencyDelta = report && previousRun ? (report.summary?.avgResponseMs || 0) - (previousRun.avg_response_ms || 0) : null;
  const latencyTrend = latencyDelta == null ? "—" : latencyDelta === 0 ? "FLAT" : latencyDelta < 0 ? `${Math.abs(latencyDelta)} ms faster` : `${latencyDelta} ms slower`;
  const incidentRows = incidentSummary.incidents.slice(0, 8);

  const CheckRows = ({ items, empty }) => <div className="health-check-list">{items.length ? items.map((item) => <div className="health-check-row" key={item.key}>
    <span className={`health-dot ${item.ok ? (item.warnings?.length ? "warn" : "ok") : "bad"}`}/>
    <div><strong>{item.label}</strong><small>{item.path}</small><small className={`health-diagnostic ${item.ok ? (item.warnings?.length ? "warn" : "ok") : "bad"}`}>{firstDiagnostic(item)}</small></div>
    <em>{item.status || "ERR"}</em>
    <time className={item.latency === "slow" ? "slow" : ""}>{item.responseMs} ms</time>
  </div>) : <div className="health-empty">{empty}</div>}</div>;

  return createPortal(<section className="site-health-manager">
    <div className="site-health-head">
      <div><span>SYSTEM / LIVE PROBE</span><h2>PlayNice Site Health</h2><p>Production availability + semantic + runtime asset checks. Health telemetry is stored separately; no check can change Shop data or publish code.</p></div>
      <div className="site-health-head-actions"><span className={`site-health-state ${overall}`}>{loading ? "CHECKING" : overall.toUpperCase()}</span><button onClick={runCheck} disabled={loading}>{loading ? "Checking…" : "Run health check"}</button></div>
    </div>

    {error ? <div className="site-health-error">{error}</div> : null}
    {historyError ? <div className="site-health-history-warning">History unavailable: {historyError}</div> : null}

    <div className="site-health-kpis">
      <div><span>CHECKS</span><strong>{report?.summary?.healthy ?? "—"}/{report?.summary?.total ?? "—"}</strong><small>healthy contracts</small></div>
      <div><span>FAILED</span><strong>{report?.summary?.failed ?? "—"}</strong><small>HTTP or contract failures</small></div>
      <div><span>WARNINGS</span><strong>{report?.summary?.warnings ?? "—"}</strong><small>non-blocking drift</small></div>
      <div><span>AVG RESPONSE</span><strong>{report?.summary?.avgResponseMs ?? "—"}</strong><small>milliseconds</small></div>
      <div><span>PRODUCTS</span><strong>{products.length}</strong><small>catalog loaded in build</small></div>
      <div><span>NOTE MAP</span><strong>{noteAudit.uniqueNotes}</strong><small>{noteAudit.placements} placements</small></div>
    </div>

    <div className="site-health-grid">
      <article className="site-health-panel"><div className="site-health-panel-head"><div><span>PRODUCTION ROUTES</span><h3>Core pages</h3></div><small>{report ? `Checked ${fmtTime(report.checkedAt)}` : "Waiting for probe"}</small></div>
        <CheckRows items={pageChecks} empty={loading ? "Checking production routes…" : "No route report yet."}/>
      </article>

      <article className="site-health-panel"><div className="site-health-panel-head"><div><span>PUBLIC CONTRACT</span><h3>SEO essentials</h3></div><small>{report ? `${report.summary?.semanticFailures || 0} semantic failures` : "Production"}</small></div>
        <CheckRows items={assetChecks} empty={loading ? "Checking public assets…" : "No public asset report yet."}/>
      </article>
    </div>

    <article className="site-health-panel"><div className="site-health-panel-head"><div><span>RUNTIME DELIVERY</span><h3>Production bundles</h3></div><small>{report ? `${report.summary?.bundleChecks || 0} discovered assets` : "From Home HTML"}</small></div>
      <CheckRows items={bundleChecks} empty={loading ? "Discovering production bundles…" : "No production bundle report yet."}/>
    </article>

    <article className="site-health-panel site-health-trend"><div className="site-health-panel-head"><div><span>PERSISTENT HISTORY</span><h3>Health trend</h3></div><small>{history.length ? `Last ${history.length} checks` : "History starts with the next successful probe"}</small></div>
      <div className="health-trend-kpis"><div><span>HEALTHY RUNS</span><strong>{history.length ? healthyRuns : "—"}</strong><small>{history.length ? `${availabilityRate}% clean checks` : "no history yet"}</small></div><div><span>WARNING RUNS</span><strong>{history.length ? warningRuns : "—"}</strong><small>non-blocking degradation</small></div><div><span>ERROR RUNS</span><strong>{history.length ? errorRuns : "—"}</strong><small>failed contracts</small></div><div><span>LATENCY TREND</span><strong className={latencyDelta > 0 ? "trend-warn" : latencyDelta < 0 ? "trend-good" : ""}>{latencyTrend}</strong><small>vs previous recorded check</small></div></div>
      <div className="health-history-strip">{history.length ? history.slice(0, 12).reverse().map((row) => <div className={`health-history-point ${row.overall}`} key={row.id} title={`${fmtTime(row.checked_at)} · ${row.overall} · ${row.avg_response_ms || 0} ms`}><span/><small>{row.avg_response_ms || 0}</small></div>) : <div className="health-empty">No persistent health history yet.</div>}</div>
      <div className="health-history-meta"><span>Newest check: <strong>{history[0] ? fmtTime(history[0].checked_at) : "—"}</strong></span><span>Last incident: <strong>{lastIncident ? `${lastIncident.overall.toUpperCase()} · ${fmtTime(lastIncident.checked_at)}` : history.length ? "none in retained history" : "—"}</strong></span></div>
    </article>

    <article className="site-health-panel site-health-incidents"><div className="site-health-panel-head"><div><span>INCIDENT INTELLIGENCE</span><h3>Incident timeline</h3></div><small>{history.length ? `${incidentSummary.active.length} active · ${incidentSummary.recovered.length} recovered` : "Waiting for retained history"}</small></div>
      <div className="health-incident-kpis"><div><span>ACTIVE ERRORS</span><strong>{history.length ? incidentSummary.activeErrors : "—"}</strong><small>blocking health failures</small></div><div><span>ACTIVE WARNINGS</span><strong>{history.length ? incidentSummary.activeWarnings : "—"}</strong><small>degraded but reachable</small></div><div><span>RECOVERED</span><strong>{history.length ? incidentSummary.recovered.length : "—"}</strong><small>resolved episodes retained</small></div><div><span>LAST RECOVERY</span><strong className="incident-recovery-time">{incidentSummary.lastRecovered?.recoveredAt ? fmtTime(incidentSummary.lastRecovered.recoveredAt) : "—"}</strong><small>first healthy run after incident</small></div></div>
      <div className="health-incident-list">{incidentRows.length ? incidentRows.map((incident) => <div className={`health-incident-row ${incident.severity} ${incident.status}`} key={`${incident.id}-${incident.firstSeen}`}>
        <span className={`health-incident-badge ${incident.status}`}>{incident.status === "active" ? "ACTIVE" : "RECOVERED"}</span>
        <div><strong>{incident.label}</strong><small>{incident.path || incident.checkKey}</small><p>{incident.diagnostic}</p></div>
        <div className="health-incident-times"><span>First seen <strong>{fmtTime(incident.firstSeen)}</strong></span><span>Last seen <strong>{fmtTime(incident.lastSeen)}</strong></span><span>{incident.status === "recovered" ? "Recovered" : "Occurrences"} <strong>{incident.status === "recovered" ? fmtTime(incident.recoveredAt) : incident.occurrences}</strong></span></div>
      </div>) : <div className="health-empty">{history.length ? "No incidents detected in retained health history." : "Incident intelligence starts after health history is recorded."}</div>}</div>
    </article>

    <article className="site-health-panel site-health-build"><div className="site-health-panel-head"><div><span>BUILD INTEGRITY</span><h3>Control Center source contract</h3></div><small>Current branch</small></div>
      <div className="health-build-grid"><div><span>PRODUCTS</span><strong>{products.length}</strong><small>catalog entries imported</small></div><div><span>JOURNAL</span><strong>{journalArticles.length}</strong><small>articles imported</small></div><div><span>NOTES</span><strong>{noteAudit.uniqueNotes}</strong><small>{noteAudit.placements} placements mapped</small></div><div><span>MAX RESPONSE</span><strong>{report?.summary?.maxResponseMs ?? "—"}</strong><small>milliseconds this run</small></div></div>
    </article>

    <article className="site-health-panel site-health-contract"><div className="site-health-panel-head"><div><span>WHAT THIS PROVES</span><h3>Health contract</h3></div><small>Production remains read only</small></div>
      <div className="health-contract-grid"><div><strong>HTTP availability</strong><span>Home, Shop, Journal, Community and Exhibition return a successful PlayNice HTML shell.</span></div><div><strong>Semantic SEO</strong><span>robots.txt declares crawler access + sitemap, while sitemap.xml keeps a valid PlayNice URL contract.</span></div><div><strong>Runtime delivery</strong><span>The application JavaScript bundle discovered from production Home is reachable with the expected content type; stylesheet delivery is checked when present.</span></div><div><strong>Persistent telemetry</strong><span>Each successful admin probe records its health result separately so regressions, recoveries and latency drift become visible over time.</span></div></div>
    </article>
  </section>, slot);
}
