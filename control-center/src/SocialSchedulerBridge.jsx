import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { supabase } from "./supabase";

export default function SocialSchedulerBridge() {
  const [slot, setSlot] = useState(null);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    let observer;
    const sync = () => {
      const social = document.querySelector(".social-manager");
      const dryRun = social?.querySelector(".social-dry-run");
      if (!social || !dryRun) {
        setSlot(null);
        return;
      }
      let node = social.querySelector("#social-shadow-scheduler-slot");
      if (!node) {
        node = document.createElement("div");
        node.id = "social-shadow-scheduler-slot";
        dryRun.insertAdjacentElement("afterend", node);
      }
      setSlot(node);
    };
    sync();
    observer = new MutationObserver(sync);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  const token = async () => {
    const { data: refreshData } = await supabase.auth.refreshSession().catch(() => ({ data: null }));
    if (refreshData?.session?.access_token) return refreshData.session.access_token;
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    const value = sessionData?.session?.access_token || "";
    if (!value) throw new Error("Authenticated admin session is required.");
    return value;
  };

  const refreshAfterMutation = (payload) => {
    window.dispatchEvent(new CustomEvent("playnice:social-scheduler-updated", { detail: payload }));
    window.setTimeout(() => window.location.reload(), 650);
  };

  const runOnce = async () => {
    if (running) return;
    setRunning(true);
    setResult(null);
    try {
      const accessToken = await token();
      const response = await fetch("/api/social-scheduler-shadow", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || `Shadow scheduler failed (${response.status}).`);

      if (!payload.executed) {
        setResult({ ok: true, text: "NO DUE SHADOW EVENT · nothing executed" });
      } else {
        const shortId = String(payload.event?.id || "").slice(0, 8);
        setResult({ ok: true, text: `SHADOW EXECUTION COMPLETE · ${shortId}… · 0 Meta requests` });
        refreshAfterMutation(payload);
      }
    } catch (error) {
      setResult({ ok: false, text: error?.message || String(error) });
    } finally {
      setRunning(false);
    }
  };

  if (!slot) return null;
  return createPortal(
    <section style={{ marginTop: 12, border: "1px solid #2b4537", background: "#101813", padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
      <div style={{ display: "grid", gap: 4 }}>
        <span style={{ fontSize: 10, letterSpacing: ".13em", color: "#7ea38c" }}>SHADOW SCHEDULER</span>
        <strong style={{ fontSize: 14, fontWeight: 500, color: result ? (result.ok ? "#9fd5b1" : "#e0a3a3") : "#d6ded8" }}>{result?.text || "Manual shadow execution · due SCHEDULED events only"}</strong>
        <small style={{ color: "#7f9186" }}>Atomic lease · idempotent completion · retry backoff · Meta transport remains locked</small>
      </div>
      <button type="button" disabled={running} onClick={runOnce} style={{ minWidth: 190, padding: "10px 13px", border: "1px solid #456150", background: "#122019", color: "#b8ddc4", cursor: running ? "wait" : "pointer" }}>
        {running ? "Running…" : "Run shadow scheduler once"}
      </button>
    </section>,
    slot,
  );
}
