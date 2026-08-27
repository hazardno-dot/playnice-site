import React, { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { supabase } from "./supabase";
import { getOverviewHealthState } from "./siteHealthFreshness.mjs";
import "./site-health-overview.css";

const fmtAge = (value) => {
  if (!value) return "no checks yet";
  const delta = Math.max(0, Date.now() - new Date(value).getTime());
  const minutes = Math.floor(delta / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

export default function SiteHealthOverviewBridge() {
  const [slot, setSlot] = useState(null);
  const [latest, setLatest] = useState(null);
  const [error, setError] = useState("");
  const [now, setNow] = useState(() => Date.now());

  const loadLatest = useCallback(async () => {
    const { data, error: loadError } = await supabase
      .from("site_health_history")
      .select("id,checked_at,overall,total_checks,healthy_checks,failed_checks,warning_checks,avg_response_ms,max_response_ms")
      .order("checked_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (loadError) {
      setError(loadError.message);
      return;
    }
    setError("");
    setLatest(data || null);
    setNow(Date.now());
  }, []);

  useEffect(() => {
    const mainStage = document.querySelector(".main-stage");
    if (!mainStage) return;
    const syncSlot = () => {
      const heading = mainStage.querySelector(".topbar h1")?.textContent?.trim();
      if (heading !== "Overview") { setSlot(null); return; }
      const cards = [...mainStage.querySelectorAll(".overview-card")];
      const firstCard = cards[0];
      const grid = firstCard?.parentElement;
      if (!grid) { setSlot(null); return; }
      let node = grid.querySelector("#site-health-overview-slot");
      if (!node) {
        node = document.createElement("div");
        node.id = "site-health-overview-slot";
        node.className = "site-health-overview-slot";
        grid.appendChild(node);
      }
      setSlot(node);
    };
    syncSlot();
    const observer = new MutationObserver(syncSlot);
    observer.observe(mainStage, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!slot) return;
    loadLatest();
    const channel = supabase
      .channel("site-health-overview-latest")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "site_health_history" }, loadLatest)
      .subscribe();
    const timer = window.setInterval(() => setNow(Date.now()), 60000);
    const onFocus = () => { setNow(Date.now()); loadLatest(); };
    window.addEventListener("focus", onFocus);
    return () => {
      supabase.removeChannel(channel);
      window.clearInterval(timer);
      window.removeEventListener("focus", onFocus);
    };
  }, [slot, loadLatest]);

  if (!slot) return null;

  const health = getOverviewHealthState(latest, error, now);
  const state = health.state;
  const detail = error
    ? "health history unavailable"
    : !latest
      ? "run Site Health to establish baseline"
      : health.stale
        ? `last known: ${(latest.overall || "unknown").toUpperCase()} · refresh health check required`
        : `${latest.healthy_checks}/${latest.total_checks} contracts · ${latest.avg_response_ms || 0} ms avg`;

  return createPortal(
    <article className={`overview-card site-health-overview-card ${state}`}>
      <span>SITE HEALTH</span>
      <strong>{state.toUpperCase()}</strong>
      <small>{detail}</small>
      <div className="site-health-overview-meta">
        <em>{latest?.failed_checks || 0} failed</em>
        <em>{latest?.warning_checks || 0} warnings</em>
        {health.stale ? <em className="stale-pill">24h+ stale</em> : null}
        <time>{fmtAge(latest?.checked_at)}</time>
      </div>
    </article>,
    slot,
  );
}
