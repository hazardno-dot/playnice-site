import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { supabase } from "./supabase";
import {
  COMMERCE_KEY,
  auditCommerceShippingDraft,
  formatCommerceMoney,
  getCommerceCopyPreview,
  getCommerceDraftState,
  normalizeCommerceShippingDraft,
} from "./commerceShippingDraft.mjs";
import "./commerce-shipping-manager.css";

const DRAFT_SELECT = "commerce_key,payload,review_status,approved_payload,reviewed_at,reviewed_by,baseline_snapshot,prepared_at,prepared_by,apply_branch,apply_pr_number,apply_created_at,apply_created_by,preview_verified_at,preview_verified_by,merged_at,merged_by,merged_commit_sha,updated_at";
const PR_BASE = "https://github.com/hazardno-dot/playnice-site/pull/";

async function getSessionToken() {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data?.session?.access_token) throw error || new Error("Authenticated admin session is required.");
  return data.session.access_token;
}

async function commerceApi(action, extra = {}) {
  const token = await getSessionToken();
  const response = await fetch("/api/commerce-shipping", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ commerce_key: COMMERCE_KEY, commerce_action: action, ...extra }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || `Commerce workflow failed (${response.status}).`);
  return payload;
}

export default function CommerceShippingManager() {
  const [slot, setSlot] = useState(null);
  const [live, setLive] = useState(null);
  const [row, setRow] = useState(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ shippingPrice: 4, freeShippingThreshold: 39 });
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const mainStage = document.querySelector(".main-stage");
    if (!mainStage) return;
    const sync = () => {
      const heading = mainStage.querySelector(".topbar h1");
      const placeholder = mainStage.querySelector(".placeholder-panel");
      if (!placeholder || heading?.textContent?.trim() !== "Announcement") { setSlot(null); return; }
      let nextSlot = placeholder.querySelector("#commerce-shipping-manager-slot");
      if (!nextSlot) {
        nextSlot = document.createElement("div");
        nextSlot.id = "commerce-shipping-manager-slot";
        nextSlot.className = "commerce-shipping-manager-slot";
        const announcementSlot = placeholder.querySelector("#announcement-manager-slot");
        if (announcementSlot) announcementSlot.insertAdjacentElement("afterend", nextSlot);
        else placeholder.appendChild(nextSlot);
      }
      setSlot(nextSlot);
    };
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(mainStage, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, []);

  const loadLive = async () => {
    try {
      const result = await commerceApi("read_live");
      setLive(result.live);
      if (!row && !editing) setDraft(result.live);
    } catch (loadError) {
      setError(loadError.message || String(loadError));
    }
  };

  const loadDraft = async () => {
    const { data, error: loadError } = await supabase
      .from("commerce_drafts")
      .select(DRAFT_SELECT)
      .eq("commerce_key", COMMERCE_KEY)
      .maybeSingle();
    if (loadError) { setError(loadError.message); return; }
    setRow(data || null);
    if (data?.payload && !editing) setDraft(normalizeCommerceShippingDraft(data.payload));
  };

  useEffect(() => {
    loadLive();
    loadDraft();
    const channel = supabase
      .channel("commerce-shipping-drafts-manager")
      .on("postgres_changes", { event: "*", schema: "public", table: "commerce_drafts" }, loadDraft)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const working = row?.payload ? normalizeCommerceShippingDraft(row.payload) : live;
  const audit = useMemo(() => auditCommerceShippingDraft(draft), [draft]);
  const copyPreview = useMemo(() => getCommerceCopyPreview(editing ? draft : working || {}), [draft, editing, working]);
  const state = getCommerceDraftState(row);
  const prepared = Boolean(row?.prepared_at && row?.baseline_snapshot?.files);
  const hasApply = Boolean(row?.apply_branch && row?.apply_pr_number);
  const verified = Boolean(row?.preview_verified_at);
  const merged = Boolean(row?.merged_at && row?.merged_commit_sha);

  const startEdit = () => {
    setError("");
    setDraft(normalizeCommerceShippingDraft(row?.payload || live || { shippingPrice: 4, freeShippingThreshold: 39 }));
    setEditing(true);
  };

  const saveDraft = async () => {
    if (audit.errors.length) return;
    setBusy("save"); setError("");
    try {
      const { data: auth, error: authError } = await supabase.auth.getUser();
      if (authError || !auth?.user?.id) throw authError || new Error("Authenticated user is required.");
      const { data, error: saveError } = await supabase
        .from("commerce_drafts")
        .upsert({ commerce_key: COMMERCE_KEY, payload: audit.payload, created_by: auth.user.id }, { onConflict: "commerce_key" })
        .select(DRAFT_SELECT)
        .single();
      if (saveError) throw saveError;
      setRow(data); setEditing(false);
    } catch (saveError) { setError(saveError.message || String(saveError)); }
    finally { setBusy(""); }
  };

  const discardDraft = async () => {
    setBusy("discard"); setError("");
    try {
      const { error: deleteError } = await supabase.from("commerce_drafts").delete().eq("commerce_key", COMMERCE_KEY);
      if (deleteError) throw deleteError;
      setRow(null); setEditing(false);
      if (live) setDraft(live);
    } catch (discardError) { setError(discardError.message || String(discardError)); }
    finally { setBusy(""); }
  };

  const setReviewStatus = async (nextStatus) => {
    if (!row) return;
    setBusy(nextStatus); setError("");
    try {
      const validation = auditCommerceShippingDraft(row.payload);
      if (validation.errors.length) throw new Error(validation.errors.join(" "));
      const { data: auth, error: authError } = await supabase.auth.getUser();
      if (authError || !auth?.user?.id) throw authError || new Error("Authenticated user is required.");
      const reset = {
        baseline_snapshot: null, prepared_at: null, prepared_by: null,
        apply_branch: null, apply_pr_number: null, apply_created_at: null, apply_created_by: null,
        preview_verified_at: null, preview_verified_by: null,
        merged_at: null, merged_by: null, merged_commit_sha: null,
      };
      const patch = nextStatus === "approved"
        ? { ...reset, review_status: "approved", approved_payload: row.payload, reviewed_at: new Date().toISOString(), reviewed_by: auth.user.id }
        : nextStatus === "ready"
          ? { ...reset, review_status: "ready", approved_payload: null, reviewed_at: null, reviewed_by: null }
          : { ...reset, review_status: "draft", approved_payload: null, reviewed_at: null, reviewed_by: null };
      const { data, error: updateError } = await supabase
        .from("commerce_drafts")
        .update(patch)
        .eq("commerce_key", COMMERCE_KEY)
        .select(DRAFT_SELECT)
        .single();
      if (updateError) throw updateError;
      setRow(data);
    } catch (workflowError) { setError(workflowError.message || String(workflowError)); }
    finally { setBusy(""); }
  };

  const runAndReload = async (action, busyKey) => {
    setBusy(busyKey); setError("");
    try {
      const result = await commerceApi(action);
      await loadDraft();
      if (action === "merge_apply") await loadLive();
      return result;
    } catch (workflowError) { setError(workflowError.message || String(workflowError)); return null; }
    finally { setBusy(""); }
  };

  const openPreview = async () => {
    const popup = window.open("", "_blank");
    const result = await runAndReload("resolve_preview", "preview");
    if (!result?.preview_url) { if (popup) popup.close(); return; }
    if (popup) { popup.opener = null; popup.location.href = result.preview_url; }
    else window.open(result.preview_url, "_blank", "noopener,noreferrer");
  };

  const markPreviewVerified = async () => {
    if (!row?.apply_pr_number) return;
    setBusy("verify"); setError("");
    try {
      const { data: auth, error: authError } = await supabase.auth.getUser();
      if (authError || !auth?.user?.id) throw authError || new Error("Authenticated user is required.");
      const { data, error: updateError } = await supabase
        .from("commerce_drafts")
        .update({ preview_verified_at: new Date().toISOString(), preview_verified_by: auth.user.id })
        .eq("commerce_key", COMMERCE_KEY)
        .select(DRAFT_SELECT)
        .single();
      if (updateError) throw updateError;
      setRow(data);
    } catch (verifyError) { setError(verifyError.message || String(verifyError)); }
    finally { setBusy(""); }
  };

  if (!slot) return null;

  const panel = <section className="commerce-shipping-manager">
    <div className="commerce-shipping-head">
      <div>
        <span className="commerce-kicker">COMMERCE / SHIPPING</span>
        <h2>Delivery settings</h2>
        <p>One controlled change updates storefront, checkout, SEO and bilingual free-shipping copy together.</p>
      </div>
      <div className="commerce-live-pill">{live ? "LIVE SOURCE VERIFIED" : "READING LIVE…"}</div>
    </div>

    {error ? <div className="commerce-error">{error}</div> : null}

    <div className="commerce-grid">
      <div className="commerce-card">
        <span>STANDARD DELIVERY</span>
        <strong>{formatCommerceMoney(working?.shippingPrice)}</strong>
        <small>Charged below the free-shipping threshold.</small>
      </div>
      <div className="commerce-card">
        <span>FREE SHIPPING FROM</span>
        <strong>{formatCommerceMoney(working?.freeShippingThreshold)}</strong>
        <small>Used by cart, checkout and announcement system copy.</small>
      </div>
      <div className="commerce-card commerce-copy-card">
        <span>AUTO-GENERATED COPY</span>
        <strong>SR · {copyPreview.sr}</strong>
        <strong>EN · {copyPreview.en}</strong>
        <small>Copy follows the threshold automatically; it is not edited separately.</small>
      </div>
    </div>

    {editing ? <div className="commerce-editor">
      <label><span>Shipping price €</span><input type="number" min="0" step="0.5" value={draft.shippingPrice} onChange={(e) => setDraft((current) => ({ ...current, shippingPrice: e.target.value }))} /></label>
      <label><span>Free shipping threshold €</span><input type="number" min="0.01" step="1" value={draft.freeShippingThreshold} onChange={(e) => setDraft((current) => ({ ...current, freeShippingThreshold: e.target.value }))} /></label>
      <div className={`commerce-validation ${audit.errors.length ? "blocked" : "ok"}`}>
        {audit.errors.length ? audit.errors.join(" · ") : "VALIDATION PASSED · shipping contract is internally consistent."}
      </div>
      <div className="commerce-actions"><button onClick={() => setEditing(false)} disabled={Boolean(busy)}>Cancel</button><button className="primary" onClick={saveDraft} disabled={Boolean(busy) || audit.errors.length > 0}>{busy === "save" ? "Saving…" : "Save draft"}</button></div>
    </div> : <>
      <div className="commerce-badges">
        {row ? <span>DRAFT</span> : <span>LIVE ONLY</span>}
        {state === "ready" ? <span>READY</span> : null}
        {state === "approved" ? <span>APPROVED</span> : null}
        {prepared ? <span>PREPARED</span> : null}
        {hasApply ? <span>PR #{row.apply_pr_number}</span> : null}
        {verified ? <span>VERIFIED</span> : null}
        {merged ? <span>MERGED</span> : null}
      </div>

      <div className="commerce-actions">
        <button onClick={startEdit} disabled={Boolean(busy)}>Edit settings</button>
        {row && state === "draft" ? <button className="primary" onClick={() => setReviewStatus("ready")} disabled={Boolean(busy)}>Mark ready</button> : null}
        {row && state === "ready" ? <><button onClick={() => setReviewStatus("draft")} disabled={Boolean(busy)}>Back to draft</button><button className="primary" onClick={() => setReviewStatus("approved")} disabled={Boolean(busy)}>Approve</button></> : null}
        {row && state === "approved" && !prepared ? <><button onClick={() => setReviewStatus("draft")} disabled={Boolean(busy)}>Back to draft</button><button className="primary" onClick={() => runAndReload("prepare", "prepare")} disabled={Boolean(busy)}>{busy === "prepare" ? "Preparing…" : "Prepare change"}</button></> : null}
        {row && prepared && !hasApply ? <button className="primary" onClick={() => runAndReload("create_apply", "apply")} disabled={Boolean(busy)}>{busy === "apply" ? "Creating PR…" : "Create draft PR"}</button> : null}
        {hasApply ? <a href={`${PR_BASE}${row.apply_pr_number}`} target="_blank" rel="noreferrer">Open draft PR #{row.apply_pr_number}</a> : null}
        {hasApply && !merged ? <button onClick={openPreview} disabled={Boolean(busy)}>{busy === "preview" ? "Resolving Preview…" : "Open Preview"}</button> : null}
        {hasApply && !verified && !merged ? <button className="primary" onClick={markPreviewVerified} disabled={Boolean(busy)}>{busy === "verify" ? "Verifying…" : "Mark preview verified"}</button> : null}
        {hasApply && verified && !merged ? <button className="primary" onClick={() => runAndReload("merge_apply", "merge")} disabled={Boolean(busy)}>{busy === "merge" ? "Merging…" : `Merge verified PR #${row.apply_pr_number}`}</button> : null}
        {row && !merged ? <button className="danger" onClick={discardDraft} disabled={Boolean(busy)}>Discard draft</button> : null}
      </div>
    </>}

    {row ? <div className="commerce-workflow">
      <span>WORKFLOW</span>
      <strong>{merged ? `PR #${row.apply_pr_number} → MERGED` : verified ? `DRAFT PR #${row.apply_pr_number} → PREVIEW VERIFIED` : hasApply ? `PREPARED → DRAFT PR #${row.apply_pr_number}` : prepared ? "APPROVED → PREPARED" : state === "approved" ? "APPROVED → prepare next" : state === "ready" ? "READY → approve next" : "DRAFT → review next"}</strong>
      {row.baseline_snapshot?.live ? <small>Prepared from main · live baseline: delivery {formatCommerceMoney(row.baseline_snapshot.live.shippingPrice)}, free from {formatCommerceMoney(row.baseline_snapshot.live.freeShippingThreshold)}.</small> : null}
      {row.merged_commit_sha ? <small>Merge commit {row.merged_commit_sha.slice(0, 12)}…</small> : null}
    </div> : null}
  </section>;

  return createPortal(panel, slot);
}
