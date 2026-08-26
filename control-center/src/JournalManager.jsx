import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { journalArticles } from "@shop/data/journal/index.js";
import { products } from "@shop/data/products/index.js";
import { auditJournalArticles, getJournalAuditText } from "./journalAudit.mjs";
import { getJournalDraftState, normalizeJournalDraftPayload } from "./journalDraft.mjs";
import { supabase } from "./supabase";
import "./journal-manager.css";

const SHOP_ORIGIN = "https://www.playniceshop.me";
const productSlugs = products.map((product) => product.slug);

const langPair = (value) => ({ sr: String(value?.sr || ""), en: String(value?.en || "") });
const csvList = (value) => Array.isArray(value) ? value : String(value || "").split(",").map((item) => item.trim()).filter(Boolean);

function JournalEditor({ initial, onCancel, onSave, saving }) {
  const [draft, setDraft] = useState(() => normalizeJournalDraftPayload(initial));
  const setPair = (field, lang, value) => setDraft((current) => ({ ...current, [field]: { ...langPair(current[field]), [lang]: value } }));
  const setSimple = (field, value) => setDraft((current) => ({ ...current, [field]: value }));
  const setSeries = (lang, value) => setDraft((current) => ({ ...current, series: { ...langPair(current.series), [lang]: value } }));
  const audit = useMemo(() => auditJournalArticles([draft], productSlugs), [draft]);
  const blocked = audit.errors.length > 0;

  return <div className="journal-editor">
    <div className="journal-editor-head">
      <div><span>ARTICLE / DRAFT EDITOR</span><h2>#{draft.id} · {draft.title?.sr || draft.title?.en || "Untitled"}</h2><p>Supabase draft only · live Journal remains unchanged.</p></div>
      <div className="journal-editor-actions"><button onClick={onCancel} disabled={saving}>Cancel</button><button className="primary" onClick={() => onSave(draft)} disabled={saving || blocked}>{saving ? "Saving…" : blocked ? "Fix validation" : "Save draft"}</button></div>
    </div>

    <div className={`journal-editor-validation ${blocked ? "blocked" : "ok"}`}>
      <strong>{blocked ? `${audit.errors.length} validation error${audit.errors.length === 1 ? "" : "s"}` : "VALIDATION PASSED"}</strong>
      <span>{blocked ? "Fix required fields before saving this draft." : "Bilingual copy, image path and related product links are valid."}</span>
    </div>

    {audit.issues.length ? <div className="journal-editor-issues">{audit.issues.map((issue, index) => <div key={`${issue.field}-${index}`} className={issue.level}><strong>{issue.field}</strong><span>{issue.message}</span></div>)}</div> : null}

    <section className="journal-editor-section"><span>IDENTITY</span><div className="journal-editor-grid"><label><span>Article ID · locked</span><input value={draft.id} disabled /></label><label><span>Image path</span><input value={draft.image || ""} onChange={(event) => setSimple("image", event.target.value)} /></label><label><span>Date · SR</span><input value={draft.date?.sr || ""} onChange={(event) => setPair("date", "sr", event.target.value)} /></label><label><span>Date · EN</span><input value={draft.date?.en || ""} onChange={(event) => setPair("date", "en", event.target.value)} /></label></div></section>

    {["title", "excerpt", "content"].map((field) => <section className="journal-editor-section" key={field}><span>{field.toUpperCase()}</span><div className="journal-editor-lang"><label><span>{field} · SR</span><textarea value={draft[field]?.sr || ""} onChange={(event) => setPair(field, "sr", event.target.value)} /></label><label><span>{field} · EN</span><textarea value={draft[field]?.en || ""} onChange={(event) => setPair(field, "en", event.target.value)} /></label></div></section>)}

    <section className="journal-editor-section"><span>OPTIONAL METADATA</span><div className="journal-editor-grid"><label><span>Series · SR</span><input value={draft.series?.sr || ""} onChange={(event) => setSeries("sr", event.target.value)} /></label><label><span>Series · EN</span><input value={draft.series?.en || ""} onChange={(event) => setSeries("en", event.target.value)} /></label><label className="wide"><span>Related product slugs · comma separated</span><input value={(draft.relatedProducts || []).join(", ")} onChange={(event) => setSimple("relatedProducts", csvList(event.target.value))} /></label></div></section>

    <div className="journal-editor-actions bottom"><button onClick={onCancel} disabled={saving}>Cancel</button><button className="primary" onClick={() => onSave(draft)} disabled={saving || blocked}>{saving ? "Saving…" : blocked ? "Fix validation" : "Save draft"}</button></div>
  </div>;
}

export default function JournalManager() {
  const [slot, setSlot] = useState(null);
  const [query, setQuery] = useState("");
  const sorted = useMemo(() => [...journalArticles].sort((a, b) => Number(b?.id || 0) - Number(a?.id || 0)), []);
  const [selectedId, setSelectedId] = useState(sorted[0]?.id || null);
  const [draftRows, setDraftRows] = useState({});
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const audit = useMemo(() => auditJournalArticles(journalArticles, productSlugs), []);

  useEffect(() => {
    const mainStage = document.querySelector(".main-stage");
    if (!mainStage) return;
    const sync = () => {
      const heading = mainStage.querySelector(".topbar h1");
      const placeholder = mainStage.querySelector(".placeholder-panel");
      if (!placeholder || heading?.textContent?.trim() !== "Journal") { setSlot(null); return; }
      let nextSlot = placeholder.querySelector("#journal-manager-slot");
      if (!nextSlot) {
        placeholder.classList.add("journal-module-active");
        nextSlot = document.createElement("div");
        nextSlot.id = "journal-manager-slot";
        nextSlot.className = "journal-manager-slot";
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
      const { data, error: loadError } = await supabase.from("journal_drafts").select("article_id,payload,review_status,reviewed_at,updated_at,approved_payload").order("updated_at", { ascending: false });
      if (cancelled) return;
      if (loadError) { setError(loadError.message); return; }
      setDraftRows(Object.fromEntries((data || []).map((row) => [Number(row.article_id), row])));
    };
    load();
    const channel = supabase.channel("journal-drafts-manager").on("postgres_changes", { event: "*", schema: "public", table: "journal_drafts" }, load).subscribe();
    return () => { cancelled = true; supabase.removeChannel(channel); };
  }, []);

  const workingArticles = useMemo(() => sorted.map((article) => draftRows[article.id]?.payload || article), [sorted, draftRows]);
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return workingArticles;
    return workingArticles.filter((article) => [article.id, getJournalAuditText(article.title, "sr"), getJournalAuditText(article.title, "en"), getJournalAuditText(article.date, "sr")].some((value) => String(value || "").toLowerCase().includes(needle)));
  }, [query, workingArticles]);

  useEffect(() => {
    if (filtered.length && !filtered.some((article) => article.id === selectedId)) setSelectedId(filtered[0].id);
  }, [filtered, selectedId]);

  if (!slot) return null;

  const liveSelected = journalArticles.find((article) => article.id === selectedId) || null;
  const selectedRow = draftRows[selectedId] || null;
  const selected = selectedRow?.payload || liveSelected || filtered[0] || sorted[0] || null;
  const selectedAudit = selected ? auditJournalArticles([selected], productSlugs).rows[0] : null;
  const workflow = getJournalDraftState(selectedRow);

  const saveDraft = async (payload) => {
    setSaving(true); setError("");
    try {
      const validation = auditJournalArticles([payload], productSlugs);
      if (validation.errors.length) throw new Error("Journal draft has validation errors.");
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData?.user?.id) throw authError || new Error("Authenticated user is required.");
      const { data, error: saveError } = await supabase.from("journal_drafts").upsert({ article_id: Number(payload.id), payload, created_by: authData.user.id }, { onConflict: "article_id" }).select("article_id,payload,review_status,reviewed_at,updated_at,approved_payload").single();
      if (saveError) throw saveError;
      setDraftRows((current) => ({ ...current, [Number(data.article_id)]: data }));
      setEditing(false);
    } catch (saveError) { setError(saveError.message || String(saveError)); }
    finally { setSaving(false); }
  };

  const setReviewStatus = async (nextStatus) => {
    if (!selectedRow || !selected) return;
    setError("");
    const validation = auditJournalArticles([selected], productSlugs);
    if (validation.errors.length) { setError("Fix Journal validation errors before review."); return; }
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData?.user?.id) { setError(authError?.message || "Authenticated user is required."); return; }
    const patch = nextStatus === "approved"
      ? { review_status: "approved", reviewed_at: new Date().toISOString(), reviewed_by: authData.user.id, approved_payload: selectedRow.payload }
      : nextStatus === "ready"
        ? { review_status: "ready", reviewed_at: null, reviewed_by: null, approved_payload: null }
        : { review_status: "draft", reviewed_at: null, reviewed_by: null, approved_payload: null };
    const { data, error: updateError } = await supabase.from("journal_drafts").update(patch).eq("article_id", selectedId).select("article_id,payload,review_status,reviewed_at,updated_at,approved_payload").single();
    if (updateError) { setError(updateError.message); return; }
    setDraftRows((current) => ({ ...current, [selectedId]: data }));
  };

  const discardDraft = async () => {
    if (!selectedRow) return;
    const { error: deleteError } = await supabase.from("journal_drafts").delete().eq("article_id", selectedId);
    if (deleteError) { setError(deleteError.message); return; }
    setDraftRows((current) => { const next = { ...current }; delete next[selectedId]; return next; });
    setEditing(false);
  };

  return createPortal(<section className="journal-manager">
    <div className="journal-audit-strip">
      <div><span>JOURNAL DATA AUDIT</span><strong>{audit.complete}/{audit.total} structurally complete</strong></div>
      <div className="journal-audit-metrics"><span>{audit.errors.length} errors</span><span>{audit.warnings.length} warnings</span><span>{Object.keys(draftRows).length} drafts</span></div>
    </div>

    {error ? <div className="journal-manager-error">{error}</div> : null}

    <div className="journal-manager-grid">
      <aside className="journal-catalog">
        <div className="journal-catalog-head"><div><span>EDITORIAL LIBRARY</span><strong>{journalArticles.length} articles</strong></div><span>{filtered.length}</span></div>
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search id, title, date…" />
        <div className="journal-list">{filtered.map((article) => {
          const row = draftRows[article.id];
          const structural = auditJournalArticles([article], productSlugs).rows[0];
          return <button key={article.id} className={article.id === selected?.id ? "active" : ""} onClick={() => { setSelectedId(article.id); setEditing(false); }}>
            <span className={`journal-status-dot ${structural?.complete ? "ok" : "warn"}`} />
            <div><strong>#{article.id} · {getJournalAuditText(article.title, "sr") || getJournalAuditText(article.title, "en") || "Untitled"}</strong><small>{getJournalAuditText(article.date, "sr") || "No date"}{row ? ` · ${getJournalDraftState(row).label}` : ""}</small></div>
          </button>;
        })}</div>
      </aside>

      <article className="journal-detail">
        {!selected ? <div className="journal-empty">No Journal articles.</div> : editing ? <JournalEditor key={`${selected.id}-${selectedRow?.updated_at || "live"}`} initial={selected} onCancel={() => setEditing(false)} onSave={saveDraft} saving={saving} /> : <>
          <div className="journal-detail-hero">
            <div><span>ARTICLE / {selectedRow ? "DRAFT PREVIEW" : "READ ONLY"}</span><h2>{getJournalAuditText(selected.title, "sr") || getJournalAuditText(selected.title, "en")}</h2><p>#{selected.id} · {getJournalAuditText(selected.date, "sr")}</p><div className="journal-detail-actions"><button onClick={() => setEditing(true)}>{selectedRow ? "Edit draft" : "Create draft"}</button>{selectedRow ? <button className="danger" onClick={discardDraft}>Discard draft</button> : null}</div></div>
            {selected.image && !selected.image.endsWith("/") ? <img src={`${SHOP_ORIGIN}${selected.image}`} alt="" /> : null}
          </div>

          <div className={`journal-workflow ${workflow.tone}`}><div><span>JOURNAL WORKFLOW</span><strong>{workflow.label}</strong></div>{selectedRow ? <div className="journal-workflow-actions">{selectedRow.review_status === "draft" ? <button onClick={() => setReviewStatus("ready")}>Mark ready</button> : null}{selectedRow.review_status === "ready" ? <><button onClick={() => setReviewStatus("draft")}>Return to draft</button><button className="primary" onClick={() => setReviewStatus("approved")}>Approve</button></> : null}{selectedRow.review_status === "approved" ? <button onClick={() => setReviewStatus("draft")}>Return to draft</button> : null}</div> : <span>Live article has no unpublished draft.</span>}</div>

          <div className={`journal-integrity ${selectedAudit?.complete ? "ok" : "warn"}`}><strong>{selectedAudit?.complete ? "STRUCTURE COMPLETE" : `${selectedAudit?.errors.length || 0} STRUCTURE ERROR${selectedAudit?.errors.length === 1 ? "" : "S"}`}</strong><span>Bilingual date, title, excerpt, content, image and linked products checked.</span></div>

          {selectedAudit?.issues.length ? <section className="journal-issues"><span>DATA ISSUES</span>{selectedAudit.issues.map((item, index) => <div key={`${item.field}-${index}`} className={item.level}><strong>{item.field}</strong><p>{item.message}</p></div>)}</section> : null}
          <section className="journal-copy-audit"><span>SR / EN COPY</span>{["title", "excerpt", "content"].map((field) => <div key={field}><strong>{field}</strong><p>{getJournalAuditText(selected[field], "sr") || "—"}</p><small>{getJournalAuditText(selected[field], "en") || "—"}</small></div>)}</section>
          <section className="journal-related"><span>RELATED PRODUCTS</span>{Array.isArray(selected.relatedProducts) && selected.relatedProducts.length ? <div>{selected.relatedProducts.map((slug) => <span key={slug}>{products.find((product) => product.slug === slug)?.name || slug}</span>)}</div> : <p>No related products configured.</p>}</section>
        </>}
      </article>
    </div>
  </section>, slot);
}
