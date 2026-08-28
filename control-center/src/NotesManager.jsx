import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { products } from "@shop/data/products/index.js";
import noteMapSource from "@shop/TheNoteMap.jsx?raw";
import { auditProductNotes, formatNoteKey } from "./noteAudit.mjs";
import { auditNoteLabels } from "./noteLabelAudit.mjs";
import { auditNoteDraftPayload, getNoteDraftState, normalizeNoteDraftPayload } from "./noteDraft.mjs";
import { supabase } from "./supabase";
import "./notes-manager.css";

const SHOP_ORIGIN = "https://www.playniceshop.me";

function NoteEditor({ initial, liveKeys, isNew, saving, onCancel, onSave }) {
  const [draft, setDraft] = useState(() => normalizeNoteDraftPayload(initial));
  const audit = useMemo(() => auditNoteDraftPayload(draft, liveKeys), [draft, liveKeys]);
  const setKey = (value) => {
    const key = String(value || "").trim().toLowerCase();
    setDraft((current) => ({ ...current, key, assetPath: key ? `/note-map/${key}.webp` : "", enLabel: current.enLabel || formatNoteKey(key) }));
  };
  return <div className="note-editor">
    <div className="note-editor-head"><div><span>NOTE / DRAFT EDITOR</span><h2>{draft.enLabel || draft.key || "New note"}</h2><p>Supabase draft only · Shop source remains unchanged.</p></div><div className="note-editor-actions"><button onClick={onCancel} disabled={saving}>Cancel</button><button className="primary" onClick={() => onSave(audit.payload)} disabled={saving || audit.errors.length > 0}>{saving ? "Saving…" : audit.errors.length ? "Fix validation" : "Save draft"}</button></div></div>
    <div className={`note-editor-validation ${audit.errors.length ? "blocked" : "ok"}`}><strong>{audit.errors.length ? `${audit.errors.length} validation error${audit.errors.length === 1 ? "" : "s"}` : "VALIDATION PASSED"}</strong><span>{audit.errors.length ? "Fix required fields before saving." : "Canonical key, bilingual labels and asset contract are valid."}</span></div>
    {audit.issues.length ? <div className="note-editor-issues">{audit.issues.map((issue, index) => <div key={`${issue.field}-${index}`} className={issue.level}><strong>{issue.field}</strong><span>{issue.message}</span></div>)}</div> : null}
    <div className="note-editor-grid">
      <label><span>Canonical key {isNew ? "" : "· locked"}</span><input value={draft.key} disabled={!isNew} onChange={(event) => setKey(event.target.value)} placeholder="pink-grapefruit" /></label>
      <label><span>Asset path · canonical</span><input value={draft.assetPath} disabled /></label>
      <label><span>SR label</span><input value={draft.srLabel} onChange={(event) => setDraft((current) => ({ ...current, srLabel: event.target.value }))} /></label>
      <label><span>EN label</span><input value={draft.enLabel} onChange={(event) => setDraft((current) => ({ ...current, enLabel: event.target.value }))} /></label>
    </div>
    <div className="note-editor-help"><strong>ASSET CONTRACT</strong><span>The matching WebP must ultimately exist at {draft.assetPath || "/note-map/<key>.webp"}. Controlled Apply will enforce this before any source change.</span></div>
  </div>;
}

export default function NotesManager() {
  const [slot, setSlot] = useState(null);
  const [query, setQuery] = useState("");
  const structuralAudit = useMemo(() => auditProductNotes(products), []);
  const labelAudit = useMemo(() => auditNoteLabels(structuralAudit.rows, noteMapSource), [structuralAudit.rows]);
  const baseRows = useMemo(() => labelAudit.rows, [labelAudit.rows]);
  const liveKeys = useMemo(() => baseRows.map((row) => row.key), [baseRows]);
  const [draftRows, setDraftRows] = useState({});
  const [selectedKey, setSelectedKey] = useState(baseRows[0]?.key || null);
  const [editing, setEditing] = useState(false);
  const [newSeed, setNewSeed] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [assetState, setAssetState] = useState("idle");

  useEffect(() => {
    const mainStage = document.querySelector(".main-stage");
    if (!mainStage) return;
    const sync = () => {
      const heading = mainStage.querySelector(".topbar h1");
      const placeholder = mainStage.querySelector(".placeholder-panel");
      if (!placeholder || heading?.textContent?.trim() !== "Notes") { setSlot(null); return; }
      let nextSlot = placeholder.querySelector("#notes-manager-slot");
      if (!nextSlot) {
        placeholder.classList.add("notes-module-active");
        nextSlot = document.createElement("div");
        nextSlot.id = "notes-manager-slot";
        nextSlot.className = "notes-manager-slot";
        placeholder.appendChild(nextSlot);
      }
      setSlot(nextSlot);
    };
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(mainStage, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const { data, error: loadError } = await supabase.from("note_drafts").select("note_key,payload,review_status,reviewed_at,updated_at,approved_payload").order("updated_at", { ascending: false });
      if (cancelled) return;
      if (loadError) { setError(loadError.message); return; }
      setDraftRows(Object.fromEntries((data || []).map((row) => [row.note_key, row])));
    };
    load();
    const channel = supabase.channel("note-drafts-manager").on("postgres_changes", { event: "*", schema: "public", table: "note_drafts" }, load).subscribe();
    return () => { cancelled = true; supabase.removeChannel(channel); };
  }, []);

  const audit = useMemo(() => ({ ...structuralAudit, rows: baseRows, errors: [...structuralAudit.errors, ...labelAudit.errors], warnings: [...structuralAudit.warnings, ...labelAudit.warnings] }), [structuralAudit, baseRows, labelAudit]);
  const workingRows = useMemo(() => {
    const live = baseRows.map((row) => {
      const payload = draftRows[row.key]?.payload;
      return payload ? { ...row, srLabel: payload.srLabel, enLabel: payload.enLabel, assetPath: payload.assetPath, __draft: true } : row;
    });
    const liveSet = new Set(baseRows.map((row) => row.key));
    const draftOnly = Object.values(draftRows).filter((row) => !liveSet.has(row.note_key) && row.payload).map((row) => ({
      key: row.note_key, label: row.payload.enLabel || formatNoteKey(row.note_key), srLabel: row.payload.srLabel || "", enLabel: row.payload.enLabel || formatNoteKey(row.note_key), assetPath: row.payload.assetPath || `/note-map/${row.note_key}.webp`, uses: 0, productCount: 0, tiers: { top: 0, heart: 0, base: 0 }, products: [], srSource: "DRAFT", enSource: "DRAFT", customLibrary: row.payload.enLabel !== formatNoteKey(row.note_key), __draft: true, __draftOnly: true,
    }));
    return [...live, ...draftOnly].sort((a, b) => b.uses - a.uses || a.enLabel.localeCompare(b.enLabel));
  }, [baseRows, draftRows]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return workingRows;
    return workingRows.filter((row) => [row.key, row.label, row.srLabel, row.enLabel, ...row.products.flatMap((product) => [product.name, product.slug])].some((value) => String(value || "").toLowerCase().includes(needle)));
  }, [workingRows, query]);

  useEffect(() => { if (filtered.length && !filtered.some((row) => row.key === selectedKey)) setSelectedKey(filtered[0].key); }, [filtered, selectedKey]);
  const selected = workingRows.find((row) => row.key === selectedKey) || filtered[0] || null;
  const selectedDraftRow = selected ? draftRows[selected.key] || null : null;
  const workflow = getNoteDraftState(selectedDraftRow);
  useEffect(() => { setAssetState(selected ? "loading" : "idle"); }, [selected?.key]);

  const startNew = () => { const seed = { key: "", srLabel: "", enLabel: "", assetPath: "" }; setNewSeed(seed); setSelectedKey(null); setEditing(true); setError(""); };
  const startEdit = () => { if (!selected) return; setNewSeed(null); setEditing(true); setError(""); };
  const saveDraft = async (payload) => {
    setSaving(true); setError("");
    try {
      const validation = auditNoteDraftPayload(payload, liveKeys);
      if (validation.errors.length) throw new Error("Note draft has validation errors.");
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData?.user?.id) throw authError || new Error("Authenticated user is required.");
      const key = validation.payload.key;
      const liveExists = liveKeys.includes(key);
      const rowExists = Boolean(draftRows[key]);
      if (!liveExists && !rowExists && workingRows.some((row) => row.key === key)) throw new Error("This note key already exists.");
      const query = !liveExists && !rowExists
        ? supabase.from("note_drafts").insert({ note_key: key, payload: validation.payload, created_by: authData.user.id })
        : supabase.from("note_drafts").upsert({ note_key: key, payload: validation.payload, created_by: authData.user.id }, { onConflict: "note_key" });
      const { data, error: saveError } = await query.select("note_key,payload,review_status,reviewed_at,updated_at,approved_payload").single();
      if (saveError) throw saveError;
      setDraftRows((current) => ({ ...current, [data.note_key]: data }));
      setSelectedKey(data.note_key); setNewSeed(null); setEditing(false);
    } catch (saveError) { setError(saveError.message || String(saveError)); } finally { setSaving(false); }
  };
  const setReviewStatus = async (nextStatus) => {
    if (!selectedDraftRow || !selected) return;
    setError("");
    const validation = auditNoteDraftPayload(selectedDraftRow.payload, liveKeys);
    if (validation.errors.length) { setError("Fix note validation errors before review."); return; }
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData?.user?.id) { setError(authError?.message || "Authenticated user is required."); return; }
    const patch = nextStatus === "approved" ? { review_status: "approved", reviewed_at: new Date().toISOString(), reviewed_by: authData.user.id, approved_payload: selectedDraftRow.payload }
      : nextStatus === "ready" ? { review_status: "ready", reviewed_at: null, reviewed_by: null, approved_payload: null }
      : { review_status: "draft", reviewed_at: null, reviewed_by: null, approved_payload: null };
    const { data, error: updateError } = await supabase.from("note_drafts").update(patch).eq("note_key", selected.key).select("note_key,payload,review_status,reviewed_at,updated_at,approved_payload").single();
    if (updateError) { setError(updateError.message); return; }
    setDraftRows((current) => ({ ...current, [data.note_key]: data }));
  };
  const discardDraft = async () => {
    if (!selectedDraftRow || !selected) return;
    const { error: deleteError } = await supabase.from("note_drafts").delete().eq("note_key", selected.key);
    if (deleteError) { setError(deleteError.message); return; }
    setDraftRows((current) => { const next = { ...current }; delete next[selected.key]; return next; });
    if (selected.__draftOnly) setSelectedKey(baseRows[0]?.key || null);
  };

  if (!slot) return null;
  if (editing) {
    const initial = newSeed || selectedDraftRow?.payload || (selected ? { key: selected.key, srLabel: selected.srLabel, enLabel: selected.enLabel, assetPath: selected.assetPath } : {});
    return createPortal(<section className="notes-manager"><NoteEditor key={initial.key || "new-note"} initial={initial} liveKeys={liveKeys} isNew={Boolean(newSeed)} saving={saving} onCancel={() => { setEditing(false); setNewSeed(null); }} onSave={saveDraft} />{error ? <div className="notes-error">{error}</div> : null}</section>, slot);
  }

  return createPortal(<section className="notes-manager">
    <div className="notes-audit-strip"><div><span>NOTE MAP AUDIT</span><strong>{audit.uniqueNotes} unique notes · {audit.placements} placements</strong></div><div className="notes-audit-metrics"><span>{audit.productsWithNotes} products mapped</span><span>SR {labelAudit.srCovered}/{audit.uniqueNotes}</span><span>EN {labelAudit.enCovered}/{audit.uniqueNotes}</span><span>{Object.keys(draftRows).length} drafts</span><span>{audit.errors.length} errors</span><span>{audit.warnings.length} warnings</span></div></div>
    {error ? <div className="notes-error">{error}</div> : null}
    <div className="notes-manager-grid">
      <aside className="notes-catalog"><div className="notes-catalog-head"><div><span>NOTE LIBRARY / USED</span><strong>{audit.uniqueNotes} referenced keys</strong></div><div className="notes-catalog-actions"><span>{filtered.length}</span><button onClick={startNew}>+ New note</button></div></div><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search note, key, product…" /><div className="notes-list">{filtered.map((row) => <button key={row.key} className={row.key === selected?.key ? "active" : ""} onClick={() => setSelectedKey(row.key)}><span className={`notes-status-dot ${row.__draft ? "draft" : row.srSource === "FALLBACK" ? "warn" : ""}`} /><div><strong>{row.enLabel}</strong><small>{row.key} · {row.uses} placement{row.uses === 1 ? "" : "s"}{draftRows[row.key] ? ` · ${getNoteDraftState(draftRows[row.key]).toUpperCase()}` : ""}</small></div><em>{row.productCount}</em></button>)}</div></aside>
      <article className="notes-detail">{!selected ? <div className="notes-empty">No notes match this search.</div> : <>
        <div className="notes-detail-hero"><div><span>{selectedDraftRow ? "NOTE / DRAFT PREVIEW" : "NOTE / READ ONLY"}</span><h2>{selected.enLabel}</h2><code>{selected.key}</code><div className="notes-detail-actions">{selectedDraftRow ? <><button onClick={startEdit}>Edit draft</button><button className="danger" onClick={discardDraft}>Discard draft</button></> : <button onClick={startEdit}>Create draft</button>}</div></div><div className={`notes-asset-preview ${assetState}`}><img src={`${SHOP_ORIGIN}${selected.assetPath}`} alt={selected.enLabel} onLoad={() => setAssetState("ok")} onError={() => setAssetState("missing")} /><small>{assetState === "missing" ? "ASSET MISSING" : assetState === "ok" ? "ASSET LOADED" : "CHECKING ASSET…"}</small></div></div>
        <div className={`notes-workflow ${selectedDraftRow ? workflow : "live"}`}><div><span>NOTE WORKFLOW</span><strong>{selectedDraftRow ? workflow.toUpperCase() : "LIVE ONLY"}</strong></div><div>{selectedDraftRow && workflow === "draft" ? <button onClick={() => setReviewStatus("ready")}>Mark ready</button> : null}{selectedDraftRow && workflow === "ready" ? <><button onClick={() => setReviewStatus("draft")}>Return to draft</button><button className="primary" onClick={() => setReviewStatus("approved")}>Approve</button></> : null}{selectedDraftRow && workflow === "approved" ? <button onClick={() => setReviewStatus("draft")}>Return to draft</button> : null}</div></div>
        <div className="notes-language-contract"><div><span>SR LABEL</span><strong>{selected.srLabel}</strong><small>{selectedDraftRow ? "DRAFT" : selected.srSource}</small></div><div><span>EN LABEL</span><strong>{selected.enLabel}</strong><small>{selectedDraftRow ? "DRAFT" : selected.enSource}</small></div><div><span>LIBRARY</span><strong>{selected.customLibrary ? "CUSTOM" : "CANONICAL"}</strong><small>{selected.customLibrary ? "NOTE_LIBRARY override" : "key + NOTE_SR"}</small></div></div>
        <div className="notes-integrity"><div><span>ASSET CONTRACT</span><strong>{selected.assetPath}</strong></div><p>Every canonical note key expects a matching WebP asset. CI verifies all note assets referenced by products.</p></div>
        <section className="notes-usage"><span>USAGE</span><div className="notes-tier-grid"><div><small>TOP</small><strong>{selected.tiers.top}</strong></div><div><small>HEART</small><strong>{selected.tiers.heart}</strong></div><div><small>BASE</small><strong>{selected.tiers.base}</strong></div><div><small>PRODUCTS</small><strong>{selected.productCount}</strong></div></div></section>
        <section className="notes-products"><span>USED IN PRODUCTS</span>{selected.products.length ? <div>{selected.products.map((product) => <div key={product.slug || product.name}><strong>{product.name}</strong><code>{product.slug || "—"}</code><small>{product.tiers.join(" · ").toUpperCase()}</small></div>)}</div> : <p>No product references yet.</p>}</section>
      </>}</article>
    </div>
  </section>, slot);
}
