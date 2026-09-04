import React, { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { supabase } from "./supabase";
import "./browser-qa.css";

const fmtAge = (value) => {
  if (!value) return "no runs yet";
  const delta = Math.max(0, Date.now() - new Date(value).getTime());
  const minutes = Math.floor(delta / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

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

export default function BrowserQaOverviewBridge() {
  const [slot, setSlot] = useState(null);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [, setNow] = useState(() => Date.now());

  const load = useCallback(async () => {
    const { data, error: loadError } = await supabase
      .from("browser_qa_history")
      .select("id,checked_at,check_type,overall,failed_checks,warning_checks,summary,findings,not_tested")
      .order("checked_at", { ascending: false })
      .limit(20);
    if (loadError) {
      setError(loadError.message);
      return;
    }
    setError("");
    setRows(data || []);
    setNow(Date.now());
  }, []);

  useEffect(() => {
    const mainStage = document.querySelector(".main-stage");
    if (!mainStage) return;
    const sync = () => {
      const heading = mainStage.querySelector(".topbar h1")?.textContent?.trim();
      if (heading !== "Overview") { setSlot(null); return; }
      const firstCard = mainStage.querySelector(".overview-card");
      const grid = firstCard?.parentElement;
      if (!grid) { setSlot(null); return; }
      let node = grid.querySelector("#browser-qa-overview-slot");
      if (!node) {
        node = document.createElement("div");
        node.id = "browser-qa-overview-slot";
        node.className = "browser-qa-overview-slot";
        grid.appendChild(node);
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
      .channel("browser-qa-overview")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "browser_qa_history" }, load)
      .subscribe();
    const timer = window.setInterval(() => setNow(Date.now()), 60000);
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => {
      supabase.removeChannel(channel);
      window.clearInterval(timer);
      window.removeEventListener("focus", onFocus);
    };
  }, [slot, load]);

  const latest = rows[0] || null;
  const daily = useMemo(() => rows.find((row) => row.check_type === "daily") || null, [rows]);
  const full = useMemo(() => rows.find((row) => row.check_type === "full") || null, [rows]);

  if (!slot) return null;

  const presentation = error
    ? { state: "warning", label: "WARNING", partial: false, notTestedCount: 0 }
    : qaPresentation(latest);
  const dailyPresentation = qaPresentation(daily);
  const fullPresentation = qaPresentation(full);
  const detail = error
    ? "QA history unavailable"
    : !latest
      ? "waiting for first automated browser QA run"
      : `Daily ${dailyPresentation.label === "NO DATA" ? "—" : dailyPresentation.label} · Full ${fullPresentation.label === "NO DATA" ? "—" : fullPresentation.label}`;

  return createPortal(
    <article className={`overview-card browser-qa-overview-card ${presentation.state}`} role="status" aria-live="polite">
      <span>PRODUCTION QA</span>
      <strong>{presentation.label}</strong>
      <small>{detail}</small>
      <div className="browser-qa-overview-meta">
        <em>{latest?.failed_checks || 0} failed</em>
        {presentation.partial
          ? <em>{presentation.notTestedCount} not tested</em>
          : <em>{latest?.warning_checks || 0} warnings</em>}
        <time dateTime={latest?.checked_at || undefined}>{fmtAge(latest?.checked_at)}</time>
      </div>
    </article>,
    slot,
  );
}
