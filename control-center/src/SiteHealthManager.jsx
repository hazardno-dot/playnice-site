import React, { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { products } from "@shop/data/products/index.js";
import { journalArticles } from "@shop/data/journal/index.js";
import { auditProductNotes } from "./noteAudit.mjs";
import { supabase } from "./supabase";
import "./site-health-manager.css";

const fmtTime = (value) => value ? new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(new Date(value)) : "—";
const firstDiagnostic = (item) => item?.issues?.[0] || item?.warnings?.[0] || (item?.contractOk ? "Contract verified" : "Waiting for contract result");

export default function SiteHealthManager() {
  const [slot, setSlot] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const noteAudit = useMemo(() => auditProductNotes(products), []);

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

  const runCheck = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData?.session?.access_token) throw sessionError || new Error("Authenticated admin session is required.");
      const response = await fetch("/api/site-health", { headers: { Authorization: `Bearer ${sessionData.session.access_token}` } });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || `Site Health failed (${response.status}).`);
      setReport(payload);
    } catch (healthError) {
      setError(healthError?.message || String(healthError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!slot) return;
    runCheck();
    const onFocus = () => runCheck();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [slot, runCheck]);

  if (!slot) return null;

  const overall = report?.overall || (error ? "error" : "unknown");
  const checks = report?.checks || [];
  const pageChecks = checks.filter((item) => item.kind === "page");
  const assetChecks = checks.filter((item) => item.kind === "asset");

  const CheckRows = ({ items, empty }) => <div className="health-check-list">{items.length ? items.map((item) => <div className="health-check-row" key={item.key}>
    <span className={`health-dot ${item.ok ? (item.warnings?.length ? "warn" : "ok") : "bad"}`}/>
    <div><strong>{item.label}</strong><small>{item.path}</small><small className={`health-diagnostic ${item.ok ? (item.warnings?.length ? "warn" : "ok") : "bad"}`}>{firstDiagnostic(item)}</small></div>
    <em>{item.status || "ERR"}</em>
    <time className={item.latency === "slow" ? "slow" : ""}>{item.responseMs} ms</time>
  </div>) : <div className="health-empty">{empty}</div>}</div>;

  return createPortal(<section className="site-health-manager">
    <div className="site-health-head">
      <div><span>SYSTEM / LIVE PROBE</span><h2>PlayNice Site Health</h2><p>Read-only production availability + semantic contract checks. No request here can change Shop data or publish code.</p></div>
      <div className="site-health-head-actions"><span className={`site-health-state ${overall}`}>{loading ? "CHECKING" : overall.toUpperCase()}</span><button onClick={runCheck} disabled={loading}>{loading ? "Checking…" : "Run health check"}</button></div>
    </div>

    {error ? <div className="site-health-error">{error}</div> : null}

    <div className="site-health-kpis">
      <div><span>ENDPOINTS</span><strong>{report?.summary?.healthy ?? "—"}/{report?.summary?.total ?? "—"}</strong><small>healthy contracts</small></div>
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

    <article className="site-health-panel site-health-build"><div className="site-health-panel-head"><div><span>BUILD INTEGRITY</span><h3>Control Center source contract</h3></div><small>Current branch</small></div>
      <div className="health-build-grid"><div><span>PRODUCTS</span><strong>{products.length}</strong><small>catalog entries imported</small></div><div><span>JOURNAL</span><strong>{journalArticles.length}</strong><small>articles imported</small></div><div><span>NOTES</span><strong>{noteAudit.uniqueNotes}</strong><small>{noteAudit.placements} placements mapped</small></div><div><span>MAX RESPONSE</span><strong>{report?.summary?.maxResponseMs ?? "—"}</strong><small>milliseconds this run</small></div></div>
    </article>

    <article className="site-health-panel site-health-contract"><div className="site-health-panel-head"><div><span>WHAT THIS PROVES</span><h3>Health contract</h3></div><small>Read only</small></div>
      <div className="health-contract-grid"><div><strong>HTTP availability</strong><span>Home, Shop, Journal, Community and Exhibition return a successful PlayNice HTML shell.</span></div><div><strong>Semantic SEO</strong><span>robots.txt declares crawler access + sitemap, while sitemap.xml keeps a valid PlayNice URL contract.</span></div><div><strong>Build integrity</strong><span>Current Control Center build imports Products, Journal and Note Map data without structural failure.</span></div><div><strong>Not browser QA</strong><span>Clicks, drawers, checkout and console errors still require the scheduled full browser workflow test.</span></div></div>
    </article>
  </section>, slot);
}
