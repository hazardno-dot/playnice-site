import React, { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { supabase } from "./supabase";
import "./browser-qa.css";

const fmtTime = (value) => value
  ? new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(value))
  : "—";

const labelFor = (type) => type === "full" ? "FULL QA" : "DAILY HEALTH";

const qaPresentation = (row) => {
  if (!row) return { state: "unknown", label: "NO DATA", partial: false, notTestedCount: 0 };

  const failed = Number(row.failed_checks || 0);
  const warnings = Number(row.warning_checks || 0);
  const findingCount = Array.isArray(row.findings) ? row.findings.length : 0;
  const notTestedCount = Array.isArray(row.not_tested) ? row.not_tested.length : 0;

  if (failed > 0 || row.overall === "critical") {
    return { state: "critical", label: "ERROR", partial: false, notTestedCount };
  }

  if (notTestedCount > 0 && findingCount === 0) {
    return { state: "partial", label: "PARTIAL", partial: true, notTestedCount };
  }

  if (warnings > 0 || findingCount > 0 || row.overall === "warning") {
    return { state: "warning", label: "WARNING", partial: false, notTestedCount };
  }

  return { state: "healthy", label: "HEALTHY", partial: false, notTestedCount };
};

export default function BrowserQaSiteHealthBridge() {
  const [slot, setSlot] = useState(null);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const { data, error: loadError } = await supabase
      .from("browser_qa_history")
      .select("id,checked_at,check_type,overall,viewport,passed_checks,failed_checks,warning_checks,summary,findings,not_tested,production_changed")
      .order("checked_at", { ascending: false })
      .limit(30);
    if (loadError) {
      setError(loadError.message);
      return;
    }
    setError("");
    setRows(data || []);
  }, []);

  useEffect(() => {
    const mainStage = document.querySelector(".main-stage");
    if (!mainStage) return;
    const sync = () => {
      const heading = mainStage.querySelector(".topbar h1")?.textContent?.trim();
      const healthManager = mainStage.querySelector(".site-health-manager");
      if (heading !== "Site Health" || !healthManager) { setSlot(null); return; }
      let node = healthManager.querySelector("#browser-qa-site-health-slot");
      if (!node) {
        node = document.createElement("div");
        node.id = "browser-qa-site-health-slot";
        node.className = "browser-qa-site-health-slot";
        const trend = healthManager.querySelector(".site-health-trend");
        if (trend) healthManager.insertBefore(node, trend);
        else healthManager.appendChild(node);
      }
      setSlot(node);
    };
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(mainStage, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!slot) return;
    load();
    const channel = supabase
      .channel("browser-qa-site-health")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "browser_qa_history" }, load)
      .subscribe();
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener("focus", onFocus);
    };
  }, [slot, load]);

  const daily = useMemo(() => rows.find((row) => row.check_type === "daily") || null, [rows]);
  const full = useMemo(() => rows.find((row) => row.check_type === "full") || null, [rows]);

  if (!slot) return null;

  const SummaryCard = ({ title, row }) => {
    const presentation = qaPresentation(row);
    return (
      <div className={`browser-qa-summary-card ${presentation.state}`}>
        <span>{title}</span>
        <strong>{presentation.label}</strong>
        <small>{row ? fmtTime(row.checked_at) : "Waiting for first run"}</small>
        {row ? (
          <div className="browser-qa-summary-meta">
            <em>{row.failed_checks || 0} failed</em>
            {presentation.partial
              ? <em>{presentation.notTestedCount} not tested</em>
              : <em>{row.warning_checks || 0} warnings</em>}
            {row.viewport ? <em>{row.viewport}</em> : null}
          </div>
        ) : null}
        {row?.summary ? <p>{row.summary}</p> : null}
      </div>
    );
  };

  return createPortal(
    <article className="site-health-panel browser-qa-panel">
      <div className="site-health-panel-head">
        <div><span>CUSTOMER EXPERIENCE / BROWSER</span><h3>Production QA</h3></div>
        <small>Automated read-only browser checks</small>
      </div>

      {error ? <div className="site-health-history-warning">Browser QA history unavailable: {error}</div> : null}

      <div className="browser-qa-summary-grid">
        <SummaryCard title="DAILY SITE HEALTH" row={daily} />
        <SummaryCard title="15-DAY FULL QA" row={full} />
      </div>

      <div className="browser-qa-history-head"><span>RECENT RUNS</span><small>{rows.length ? `Last ${Math.min(rows.length, 10)} recorded checks` : "No browser QA history yet"}</small></div>
      <div className="browser-qa-history-list">
        {rows.length ? rows.slice(0, 10).map((row) => {
          const findingCount = Array.isArray(row.findings) ? row.findings.length : 0;
          const notTestedCount = Array.isArray(row.not_tested) ? row.not_tested.length : 0;
          const presentation = qaPresentation(row);
          return <div className="browser-qa-history-row" key={row.id}>
            <span className={`browser-qa-state-dot ${presentation.state}`} />
            <div><strong>{labelFor(row.check_type)}</strong><small>{row.summary || "No summary recorded"}</small></div>
            <div className="browser-qa-history-stats"><em>{presentation.label}</em><small>{row.failed_checks || 0} failed · {presentation.partial ? `${notTestedCount} not tested` : `${row.warning_checks || 0} warnings`} · {findingCount} findings{!presentation.partial && notTestedCount ? ` · ${notTestedCount} not tested` : ""}</small></div>
            <time dateTime={row.checked_at}>{fmtTime(row.checked_at)}</time>
          </div>;
        }) : <div className="health-empty">The first Daily Health run will create the browser QA baseline.</div>}
      </div>
    </article>,
    slot,
  );
}
