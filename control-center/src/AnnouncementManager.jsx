import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { ANNOUNCEMENT_ITEMS } from "@shop/data/announcementConfig.generated.js";
import { products } from "@shop/data/products/index.js";
import { supabase } from "./supabase";
import { ANNOUNCEMENT_ACTIONS, ANNOUNCEMENT_TONES, auditAnnouncementDraft, getAnnouncementDraftState, normalizeAnnouncementDraft } from "./announcementDraft.mjs";
import "./announcement-manager.css";
import "./announcement-draft.css";

const DRAFT_SELECT = "announcement_key,payload,review_status,approved_payload,reviewed_at,reviewed_by,baseline_snapshot,prepared_at,prepared_by,updated_at";

function AnnouncementPreview({ item, lang }) {
  const text = item.text?.[lang] || item.text?.en || item.text?.sr || "";
  return <div className={`announcement-preview tone-${item.tone || "default"}`}>
    <span className="announcement-preview-icon">{item.icon || "•"}</span>
    <span>{text}</span>
  </div>;
}

function AnnouncementEditor({ initial, isNew, existingIds, saving, onCancel, onSave }) {
  const [draft, setDraft] = useState(() => normalizeAnnouncementDraft(initial));
  const audit = useMemo(() => auditAnnouncementDraft(draft, existingIds, isNew ? "" : initial.id), [draft, existingIds, initial.id, isNew]);
  const setText = (lang, value) => setDraft((current) => ({ ...current, text: { ...current.text, [lang]: value } }));
  return <div className="announcement-editor">
    <div className="announcement-editor-head">
      <div><span>ANNOUNCEMENT / DRAFT EDITOR</span><h2>{draft.id || "New announcement"}</h2><p>Supabase draft only · storefront generated config remains unchanged.</p></div>
      <div className="announcement-editor-actions"><button onClick={onCancel} disabled={saving}>Cancel</button><button className="primary" onClick={() => onSave(audit.payload)} disabled={saving || audit.errors.length > 0}>{saving ? "Saving…" : audit.errors.length ? "Fix validation" : "Save draft"}</button></div>
    </div>
    <div className={`announcement-editor-validation ${audit.errors.length ? "blocked" : "ok"}`}><strong>{audit.errors.length ? `${audit.errors.length} validation error${audit.errors.length === 1 ? "" : "s"}` : "VALIDATION PASSED"}</strong><span>{audit.errors.length ? audit.errors.join(" · ") : "Bilingual copy and action contract are valid."}</span></div>
    <div className="announcement-editor-grid">
      <label><span>ID {isNew ? "" : "· locked"}</span><input value={draft.id} disabled={!isNew} onChange={(e) => setDraft((current) => ({ ...current, id: e.target.value }))} placeholder="autumn-promo" /></label>
      <label><span>Priority</span><input type="number" value={draft.priority} onChange={(e) => setDraft((current) => ({ ...current, priority: e.target.value }))} /></label>
      <label className="announcement-editor-wide"><span>SR copy</span><textarea value={draft.text.sr} onChange={(e) => setText("sr", e.target.value)} /></label>
      <label className="announcement-editor-wide"><span>EN copy</span><textarea value={draft.text.en} onChange={(e) => setText("en", e.target.value)} /></label>
      <label><span>Icon</span><input value={draft.icon} onChange={(e) => setDraft((current) => ({ ...current, icon: e.target.value }))} /></label>
      <label><span>Tone</span><select value={draft.tone} onChange={(e) => setDraft((current) => ({ ...current, tone: e.target.value }))}>{ANNOUNCEMENT_TONES.map((tone) => <option key={tone} value={tone}>{tone}</option>)}</select></label>
      <label><span>Action</span><select value={draft.action} onChange={(e) => setDraft((current) => ({ ...current, action: e.target.value, slug: e.target.value === "openProduct" ? current.slug : "" }))}>{ANNOUNCEMENT_ACTIONS.map((action) => <option key={action} value={action}>{action}</option>)}</select></label>
      <label><span>Product slug</span><select value={draft.slug} disabled={draft.action !== "openProduct"} onChange={(e) => setDraft((current) => ({ ...current, slug: e.target.value }))}><option value="">Select product…</option>{products.map((product) => <option key={product.slug} value={product.slug}>{product.shortName || product.name}</option>)}</select></label>
      <label className="announcement-enabled-field"><input type="checkbox" checked={draft.enabled} onChange={(e) => setDraft((current) => ({ ...current, enabled: e.target.checked }))} /><span>Enabled</span></label>
    </div>
    <div className="announcement-editor-preview"><span>DRAFT PREVIEW</span><AnnouncementPreview item={audit.payload} lang="sr" /><AnnouncementPreview item={audit.payload} lang="en" /></div>
  </div>;
}

export default function AnnouncementManager() {
  const [slot, setSlot] = useState(null);
  const [draftRows, setDraftRows] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [newSeed, setNewSeed] = useState(null);
  const [saving, setSaving] = useState(false);
  const [workflowBusy, setWorkflowBusy] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const mainStage = document.querySelector(".main-stage");
    if (!mainStage) return;
    const sync = () => {
      const heading = mainStage.querySelector(".topbar h1");
      const placeholder = mainStage.querySelector(".placeholder-panel");
      if (!placeholder || heading?.textContent?.trim() !== "Announcement") { setSlot(null); return; }
      let nextSlot = placeholder.querySelector("#announcement-manager-slot");
      if (!nextSlot) {
        placeholder.classList.add("announcement-module-active");
        nextSlot = document.createElement("div");
        nextSlot.id = "announcement-manager-slot";
        nextSlot.className = "announcement-manager-slot";
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
      const { data, error: loadError } = await supabase.from("announcement_drafts").select(DRAFT_SELECT).order("updated_at", { ascending: false });
      if (cancelled) return;
      if (loadError) { setError(loadError.message); return; }
      setDraftRows(Object.fromEntries((data || []).map((row) => [row.announcement_key, row])));
    };
    load();
    const channel = supabase.channel("announcement-drafts-manager").on("postgres_changes", { event: "*", schema: "public", table: "announcement_drafts" }, load).subscribe();
    return () => { cancelled = true; supabase.removeChannel(channel); };
  }, []);

  const liveRows = useMemo(() => [...ANNOUNCEMENT_ITEMS].sort((a, b) => Number(a.priority || 0) - Number(b.priority || 0)), []);
  const liveIds = useMemo(() => liveRows.map((item) => item.id), [liveRows]);
  const rows = useMemo(() => {
    const live = liveRows.map((item) => draftRows[item.id]?.payload ? { ...normalizeAnnouncementDraft(draftRows[item.id].payload), __draft: true, __live: item } : item);
    const liveSet = new Set(liveIds);
    const draftOnly = Object.values(draftRows).filter((row) => !liveSet.has(row.announcement_key)).map((row) => ({ ...normalizeAnnouncementDraft(row.payload), __draft: true, __draftOnly: true }));
    return [...live, ...draftOnly].sort((a, b) => Number(a.priority || 0) - Number(b.priority || 0));
  }, [draftRows, liveIds, liveRows]);
  const enabledCount = rows.filter((item) => item.enabled).length;

  const startEdit = (item) => { setEditingId(item.id); setNewSeed(null); setError(""); };
  const startNew = () => { setEditingId(null); setNewSeed({ id: "", enabled: true, text: { sr: "", en: "" }, icon: "→", tone: "default", action: "none", slug: "", priority: 10 }); setError(""); };
  const cancelEdit = () => { setEditingId(null); setNewSeed(null); };

  const saveDraft = async (payload) => {
    setSaving(true); setError("");
    try {
      const existingIds = [...new Set([...liveIds, ...Object.keys(draftRows)])];
      const validation = auditAnnouncementDraft(payload, existingIds, editingId || "");
      if (validation.errors.length) throw new Error(validation.errors.join(" "));
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData?.user?.id) throw authError || new Error("Authenticated user is required.");
      const { data, error: saveError } = await supabase.from("announcement_drafts").upsert({ announcement_key: validation.payload.id, payload: validation.payload, created_by: authData.user.id }, { onConflict: "announcement_key" }).select(DRAFT_SELECT).single();
      if (saveError) throw saveError;
      setDraftRows((current) => ({ ...current, [data.announcement_key]: data }));
      cancelEdit();
    } catch (saveError) { setError(saveError.message || String(saveError)); } finally { setSaving(false); }
  };

  const discardDraft = async (id) => {
    const { error: deleteError } = await supabase.from("announcement_drafts").delete().eq("announcement_key", id);
    if (deleteError) { setError(deleteError.message); return; }
    setDraftRows((current) => { const next = { ...current }; delete next[id]; return next; });
  };

  const setReviewStatus = async (id, nextStatus) => {
    const row = draftRows[id];
    if (!row) return;
    setWorkflowBusy(`${id}:${nextStatus}`); setError("");
    try {
      const validation = auditAnnouncementDraft(row.payload, [...new Set([...liveIds, ...Object.keys(draftRows)])], id);
      if (validation.errors.length) throw new Error(validation.errors.join(" "));
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData?.user?.id) throw authError || new Error("Authenticated user is required.");
      const patch = nextStatus === "approved"
        ? { review_status: "approved", reviewed_at: new Date().toISOString(), reviewed_by: authData.user.id, approved_payload: row.payload, baseline_snapshot: null, prepared_at: null, prepared_by: null }
        : nextStatus === "ready"
          ? { review_status: "ready", reviewed_at: null, reviewed_by: null, approved_payload: null, baseline_snapshot: null, prepared_at: null, prepared_by: null }
          : { review_status: "draft", reviewed_at: null, reviewed_by: null, approved_payload: null, baseline_snapshot: null, prepared_at: null, prepared_by: null };
      const { data, error: updateError } = await supabase.from("announcement_drafts").update(patch).eq("announcement_key", id).select(DRAFT_SELECT).single();
      if (updateError) throw updateError;
      setDraftRows((current) => ({ ...current, [id]: data }));
    } catch (workflowError) { setError(workflowError.message || String(workflowError)); }
    finally { setWorkflowBusy(""); }
  };

  const prepareChange = async (id) => {
    setWorkflowBusy(`${id}:prepare`);
    setError("");

    try {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError || !sessionData?.session?.access_token) {
        throw sessionError || new Error("Authenticated admin session is required.");
      }

      const response = await fetch("/api/create-apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionData.session.access_token}`,
        },
        body: JSON.stringify({
          announcement_key: id,
        }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          payload.error || `Announcement prepare failed (${response.status}).`
        );
      }

      const { data, error: reloadError } = await supabase
        .from("announcement_drafts")
        .select(DRAFT_SELECT)
        .eq("announcement_key", id)
        .single();

      if (reloadError) throw reloadError;

      setDraftRows((current) => ({
        ...current,
        [id]: data,
      }));
    } catch (prepareError) {
      setError(prepareError.message || String(prepareError));
    } finally {
      setWorkflowBusy("");
    }
  };

  if (!slot) return null;
  const editingItem = newSeed || (editingId ? (draftRows[editingId]?.payload || liveRows.find((item) => item.id === editingId)) : null);
  if (editingItem) return createPortal(<section className="announcement-manager"><AnnouncementEditor initial={editingItem} isNew={Boolean(newSeed)} existingIds={[...new Set([...liveIds, ...Object.keys(draftRows)])]} saving={saving} onCancel={cancelEdit} onSave={saveDraft} />{error ? <div className="announcement-error">{error}</div> : null}</section>, slot);

  return createPortal(<section className="announcement-manager">
    <div className="announcement-audit-strip"><div><span>EDITORIAL ANNOUNCEMENTS</span><strong>{enabledCount} enabled · {rows.length} total · {Object.keys(draftRows).length} drafts</strong></div><div className="announcement-audit-note">CONTROLLED DRAFT · generated config unchanged</div></div>
    {error ? <div className="announcement-error">{error}</div> : null}
    <div className="announcement-manager-grid">
      <div className="announcement-list-panel">
        <div className="announcement-section-head"><div><span>MANAGED ITEMS</span><h2>Current promo announcements</h2></div><div className="announcement-head-actions"><span className="announcement-count">{rows.length}</span><button onClick={startNew}>+ New</button></div></div>
        <div className="announcement-list">{rows.map((item) => {
          const draftRow = draftRows[item.id] || null;
          const state = getAnnouncementDraftState(draftRow);
          const prepared = Boolean(draftRow?.prepared_at && draftRow?.baseline_snapshot?.source_sha);
          return <article className="announcement-row" key={item.id}>
            <div className="announcement-row-top"><div><span className={`announcement-status ${item.enabled ? "enabled" : "disabled"}`}>{item.enabled ? "ENABLED" : "DISABLED"}</span>{item.__draft ? <span className={`announcement-draft-badge state-${state}`}>{state.toUpperCase()}</span> : null}{prepared ? <span className="announcement-prepared-badge">PREPARED</span> : null}<code>{item.id}</code></div><strong>Priority {item.priority ?? 0}</strong></div>
            <div className="announcement-copy-block"><span>SR</span><p>{item.text?.sr || "—"}</p></div><div className="announcement-copy-block"><span>EN</span><p>{item.text?.en || "—"}</p></div>
            <div className="announcement-meta-row"><span>Icon <strong>{item.icon || "—"}</strong></span><span>Tone <strong>{item.tone || "default"}</strong></span><span>Action <strong>{item.action || "none"}</strong></span>{item.slug ? <span>Slug <strong>{item.slug}</strong></span> : null}</div>
            <div className="announcement-row-actions">
              <button onClick={() => startEdit(item)}>{item.__draft ? "Edit draft" : "Create draft"}</button>
              {draftRow && state === "draft" ? <button className="workflow" disabled={Boolean(workflowBusy)} onClick={() => setReviewStatus(item.id, "ready")}>{workflowBusy === `${item.id}:ready` ? "Updating…" : "Mark ready"}</button> : null}
              {draftRow && state === "ready" ? <><button disabled={Boolean(workflowBusy)} onClick={() => setReviewStatus(item.id, "draft")}>Back to draft</button><button className="workflow primary" disabled={Boolean(workflowBusy)} onClick={() => setReviewStatus(item.id, "approved")}>{workflowBusy === `${item.id}:approved` ? "Approving…" : "Approve"}</button></> : null}
              {draftRow && state === "approved" ? (
                <>
                  <button
                    disabled={Boolean(workflowBusy)}
                    onClick={() => setReviewStatus(item.id, "draft")}
                  >
                    Back to draft
                  </button>

                  {!prepared ? (
                    <button
                      className="workflow primary"
                      disabled={Boolean(workflowBusy)}
                      onClick={() => prepareChange(item.id)}
                    >
                      {workflowBusy === `${item.id}:prepare`
                        ? "Preparing…"
                        : "Prepare change"}
                    </button>
                  ) : null}
                </>
              ) : null}
              {item.__draft ? <button className="danger" disabled={Boolean(workflowBusy)} onClick={() => discardDraft(item.id)}>Discard draft</button> : null}
            </div>
            {draftRow ? <div className="announcement-workflow-note"><span>WORKFLOW</span><strong>{prepared ? "APPROVED → PREPARED" : state === "approved"
  ? "APPROVED → prepare next" : state === "ready" ? "READY → approval next" : "DRAFT → ready next"}</strong>{prepared ? <small>Baseline SHA {String(draftRow.baseline_snapshot.source_sha).slice(0, 10)}… captured from main.</small> : null}</div> : null}
          </article>;
        })}{!rows.length ? <div className="announcement-empty">No editorial announcements in generated config.</div> : null}</div>
      </div>
      <aside className="announcement-preview-panel"><div className="announcement-section-head"><div><span>WORKING COPY PREVIEW</span><h2>Storefront text</h2></div></div><div className="announcement-preview-group"><span>SR</span>{rows.filter((item) => item.enabled).map((item) => <AnnouncementPreview key={`sr-${item.id}`} item={item} lang="sr" />)}</div><div className="announcement-preview-group"><span>EN</span>{rows.filter((item) => item.enabled).map((item) => <AnnouncementPreview key={`en-${item.id}`} item={item} lang="en" />)}</div><div className="announcement-scope-note"><strong>V1 SCOPE</strong><p>Draft, review and prepare affect only editorial/promo items. Automatic New Products, Latest Journal, Forever sponsored content and cart/shipping system messages stay outside this module.</p></div></aside>
    </div>
  </section>, slot);
}
