import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { products } from "@shop/data/products/index.js";
import noteMapSource from "@shop/TheNoteMap.jsx?raw";
import { auditProductNotes } from "./noteAudit.mjs";
import { auditNoteLabels } from "./noteLabelAudit.mjs";
import { normalizeNoteDraftPayload } from "./noteDraft.mjs";
import { supabase } from "./supabase";
import "./note-apply.css";

const SELECT = "note_key,payload,approved_payload,review_status,baseline_snapshot,prepared_at,apply_branch,apply_pr_number,apply_created_at,updated_at";

const selectedNoteKeyFromDom = () => {
  const detailKey = document.querySelector(".main-stage .notes-detail-hero code")?.textContent?.trim();
  if (detailKey) return detailKey;
  const activeMeta = document.querySelector(".main-stage .notes-list button.active small")?.textContent || "";
  const match = activeMeta.match(/^([^·]+)\s*·/);
  return match ? match[1].trim() : null;
};

const stable = (value) => JSON.stringify(Object.keys(value || {}).sort().reduce((out, key) => { out[key] = value[key]; return out; }, {}));

export default function NoteApplyManager() {
  const [slot, setSlot] = useState(null);
  const [noteKey, setNoteKey] = useState(null);
  const [row, setRow] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const liveRows = useMemo(() => {
    const structural = auditProductNotes(products);
    return auditNoteLabels(structural.rows, noteMapSource).rows;
  }, []);
  const liveNote = useMemo(() => liveRows.find((item) => item.key === noteKey) || null, [liveRows, noteKey]);

  useEffect(() => {
    const mainStage = document.querySelector(".main-stage");
    if (!mainStage) return;
    const sync = () => {
      const nextKey = selectedNoteKeyFromDom();
      setNoteKey((current) => current === nextKey ? current : nextKey);
      const workflow = mainStage.querySelector(".notes-workflow");
      if (!workflow || !nextKey) { setSlot(null); return; }
      let nextSlot = mainStage.querySelector("#note-apply-slot");
      if (!nextSlot || !nextSlot.isConnected) {
        nextSlot = document.createElement("div");
        nextSlot.id = "note-apply-slot";
        nextSlot.className = "note-apply-slot";
        workflow.insertAdjacentElement("afterend", nextSlot);
      }
      setSlot((current) => current === nextSlot ? current : nextSlot);
    };
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(mainStage, { childList: true, subtree: true, characterData: true });
    const interval = window.setInterval(sync, 350);
    const onFocus = () => sync();
    window.addEventListener("focus", onFocus);
    return () => { observer.disconnect(); window.clearInterval(interval); window.removeEventListener("focus", onFocus); };
  }, []);

  useEffect(() => {
    if (!noteKey) { setRow(null); return; }
    let cancelled = false;
    const load = async () => {
      const { data, error: loadError } = await supabase.from("note_drafts").select(SELECT).eq("note_key", noteKey).maybeSingle();
      if (cancelled) return;
      if (loadError) { setError(loadError.message); setRow(null); return; }
      setError("");
      setRow(data || null);
    };
    load();
    const channel = supabase.channel(`note-apply-${noteKey}`).on("postgres_changes", { event: "*", schema: "public", table: "note_drafts", filter: `note_key=eq.${noteKey}` }, load).subscribe();
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => { cancelled = true; supabase.removeChannel(channel); window.removeEventListener("focus", onFocus); };
  }, [noteKey]);

  const noChanges = useMemo(() => {
    if (!liveNote || !row?.payload) return false;
    const livePayload = normalizeNoteDraftPayload({ key: liveNote.key, srLabel: liveNote.srLabel, enLabel: liveNote.enLabel, assetPath: liveNote.assetPath });
    return stable(livePayload) === stable(normalizeNoteDraftPayload(row.payload));
  }, [liveNote, row]);

  if (!slot || !noteKey) return null;
  if (!row || row.review_status !== "approved") {
    return error ? createPortal(<section className="note-controlled-apply approved"><div className="note-controlled-copy"><span>NOTES CONTROLLED APPLY</span><strong>APPLY STATE UNAVAILABLE</strong><small>{error}</small></div></section>, slot) : null;
  }

  const callApply = async (action) => {
    setBusy(true); setError("");
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData?.session?.access_token) throw sessionError || new Error("Authenticated admin session is required.");
      const response = await fetch("/api/create-note-apply", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${sessionData.session.access_token}` },
        body: JSON.stringify({ note_key: noteKey, action }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || `Notes Controlled Apply failed (${response.status}).`);
      const { data, error: reloadError } = await supabase.from("note_drafts").select(SELECT).eq("note_key", noteKey).single();
      if (reloadError) throw reloadError;
      setRow(data);
    } catch (applyError) { setError(applyError.message || String(applyError)); }
    finally { setBusy(false); }
  };

  const prepared = Boolean(row.prepared_at && row.baseline_snapshot?.source_sha);
  const hasPr = Boolean(row.apply_branch && row.apply_pr_number);

  return createPortal(<section className={`note-controlled-apply ${hasPr ? "pr" : prepared ? "prepared" : "approved"}`}>
    <div className="note-controlled-copy">
      <span>NOTES CONTROLLED APPLY</span>
      <strong>{hasPr ? `DRAFT PR #${row.apply_pr_number}` : prepared ? "READY TO CREATE DRAFT PR" : noChanges ? "NO LIVE CHANGES" : liveNote ? "APPROVED · PREPARE BASELINE" : "NEW NOTE · PREPARE INSERT"}</strong>
      <small>{liveNote ? "Existing note" : "New note"} · exact TheNoteMap.jsx SHA guard · asset must exist on main · no automatic merge.</small>
    </div>
    <div className="note-controlled-actions">
      {error ? <span className="note-controlled-error">{error}</span> : null}
      {hasPr ? <a href={`https://github.com/hazardno-dot/playnice-site/pull/${row.apply_pr_number}`} target="_blank" rel="noreferrer">Open draft PR ↗</a>
        : prepared ? <button className="primary" disabled={busy} onClick={() => callApply("apply")}>{busy ? "Creating…" : "Create draft PR"}</button>
          : <button className="primary" disabled={busy || noChanges} onClick={() => callApply("prepare")}>{busy ? "Preparing…" : noChanges ? "No changes to apply" : "Prepare apply"}</button>}
    </div>
  </section>, slot);
}
