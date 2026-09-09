import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { journalArticles } from "@shop/data/journal/index.js";
import { journalPayloadEquals, normalizeJournalDraftPayload } from "./journalDraft.mjs";
import { supabase } from "./supabase";
import "./journal-apply.css";

const SELECT = "article_id,payload,approved_payload,review_status,reviewed_at,baseline_snapshot,prepared_at,apply_branch,apply_pr_number,apply_created_at,updated_at";
const REPO_PULLS_URL = "https://api.github.com/repos/hazardno-dot/playnice-site/pulls";

const selectedArticleIdFromDom = () => {
  const heading = document.querySelector(".main-stage .topbar h1")?.textContent?.trim();
  if (heading !== "Journal") return null;
  const text = document.querySelector(".journal-detail-hero p")?.textContent || "";
  const match = text.match(/#(\d+)/);
  return match ? Number(match[1]) : null;
};

const comparablePayload = (article) => {
  const normalized = normalizeJournalDraftPayload(article);
  if (!normalized) return normalized;
  const { mediaStage: _mediaStage, ...comparable } = normalized;
  return comparable;
};

export default function JournalApplyManager() {
  const [slot, setSlot] = useState(null);
  const [articleId, setArticleId] = useState(null);
  const [row, setRow] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const mainStage = document.querySelector(".main-stage");
    if (!mainStage) return;
    const sync = () => {
      const nextId = selectedArticleIdFromDom();
      setArticleId((current) => current === nextId ? current : nextId);
      const workflow = mainStage.querySelector(".journal-workflow");
      if (!workflow || !nextId) { setSlot(null); return; }
      let nextSlot = mainStage.querySelector("#journal-apply-slot");
      if (!nextSlot || !nextSlot.isConnected) {
        nextSlot = document.createElement("div");
        nextSlot.id = "journal-apply-slot";
        nextSlot.className = "journal-apply-slot";
        workflow.insertAdjacentElement("afterend", nextSlot);
      }
      setSlot((current) => current === nextSlot ? current : nextSlot);
    };
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(mainStage, { childList: true, subtree: true, characterData: true });
    const interval = window.setInterval(sync, 500);
    const onFocus = () => sync();
    window.addEventListener("focus", onFocus);
    return () => {
      observer.disconnect();
      window.clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  useEffect(() => {
    if (!articleId) { setRow(null); return; }
    let cancelled = false;
    const load = async () => {
      const { data, error: loadError } = await supabase.from("journal_drafts").select(SELECT).eq("article_id", articleId).maybeSingle();
      if (cancelled) return;
      if (loadError) { setError(loadError.message); return; }
      setError("");
      setRow(data || null);
    };
    load();
    const channel = supabase.channel(`journal-apply-${articleId}`).on("postgres_changes", { event: "*", schema: "public", table: "journal_drafts", filter: `article_id=eq.${articleId}` }, load).subscribe();
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);

    const workflow = document.querySelector(".main-stage .journal-workflow");
    const workflowObserver = workflow
      ? new MutationObserver(() => load())
      : null;
    workflowObserver?.observe(workflow, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => {
      cancelled = true;
      workflowObserver?.disconnect();
      supabase.removeChannel(channel);
      window.removeEventListener("focus", onFocus);
    };
  }, [articleId]);

  const liveArticle = useMemo(() => journalArticles.find((article) => Number(article.id) === Number(articleId)) || null, [articleId]);
  const noChanges = useMemo(() => {
    if (!liveArticle || !row?.payload) return false;
    return journalPayloadEquals(comparablePayload(liveArticle), comparablePayload(row.payload));
  }, [liveArticle, row]);

  useEffect(() => {
    if (!articleId || !row || row.review_status !== "approved" || !row.apply_pr_number || !noChanges) return;
    let cancelled = false;

    const reconcilePublishedDraft = async () => {
      try {
        const response = await fetch(`${REPO_PULLS_URL}/${row.apply_pr_number}`, {
          headers: { Accept: "application/vnd.github+json" },
        });
        if (!response.ok) return;
        const pr = await response.json();
        if (pr.state !== "closed" && !pr.merged_at) return;

        const { error: deleteError } = await supabase
          .from("journal_drafts")
          .delete()
          .eq("article_id", articleId)
          .eq("apply_pr_number", row.apply_pr_number);
        if (deleteError || cancelled) return;
        setRow(null);
        window.location.reload();
      } catch {
        // Reconciliation is best-effort. A transient GitHub/network failure leaves the draft intact.
      }
    };

    reconcilePublishedDraft();
    return () => { cancelled = true; };
  }, [articleId, noChanges, row]);

  if (!slot || !articleId || !row || row.review_status !== "approved") return null;

  const callApply = async (action) => {
    setBusy(true); setError("");
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData?.session?.access_token) throw sessionError || new Error("Authenticated admin session is required.");
      const response = await fetch("/api/create-journal-apply", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${sessionData.session.access_token}` },
        body: JSON.stringify({ article_id: articleId, action, ...(action === "prepare" && liveArticle ? { live_payload: normalizeJournalDraftPayload(liveArticle) } : {}) }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || `Journal Controlled Apply failed (${response.status}).`);
      const { data, error: reloadError } = await supabase.from("journal_drafts").select(SELECT).eq("article_id", articleId).single();
      if (reloadError) throw reloadError;
      setRow(data);
    } catch (applyError) { setError(applyError.message || String(applyError)); }
    finally { setBusy(false); }
  };

  const preparationShapeValid = Boolean(row.prepared_at && (row.baseline_snapshot?.source_block || row.baseline_snapshot?.mode === "insert"));
  const prepared = Boolean(preparationShapeValid && (!row.reviewed_at || new Date(row.prepared_at).getTime() >= new Date(row.reviewed_at).getTime()));
  const hasPr = Boolean(row.apply_branch && row.apply_pr_number);
  const stateLabel = hasPr
    ? prepared ? `DRAFT PR #${row.apply_pr_number} · READY TO REFRESH` : `DRAFT PR #${row.apply_pr_number} · PREPARE REFRESH`
    : prepared ? "READY TO CREATE DRAFT PR" : noChanges ? "NO LIVE CHANGES" : liveArticle ? "APPROVED · PREPARE BASELINE" : "NEW ARTICLE · PREPARE INSERT";

  return createPortal(<section className={`journal-controlled-apply ${hasPr ? "pr" : prepared ? "prepared" : "approved"}`}>
    <div className="journal-controlled-copy"><span>JOURNAL CONTROLLED APPLY</span><strong>{stateLabel}</strong><small>{liveArticle ? "Existing article · exact source-block drift guard" : "New article · sequential ID + exact Journal source SHA guard"} · no automatic merge.</small></div>
    <div className="journal-controlled-actions">
      {error ? <span className="journal-controlled-error">{error}</span> : null}
      {hasPr ? <>
        <a href={`https://github.com/hazardno-dot/playnice-site/pull/${row.apply_pr_number}`} target="_blank" rel="noreferrer">Open draft PR ↗</a>
        {prepared
          ? <button className="primary" disabled={busy} onClick={() => callApply("refresh")}>{busy ? "Refreshing…" : "Refresh draft PR"}</button>
          : <button className="primary" disabled={busy || noChanges} onClick={() => callApply("prepare")}>{busy ? "Preparing…" : noChanges ? "No changes to apply" : "Prepare refresh"}</button>}
      </> : prepared ? <button className="primary" disabled={busy} onClick={() => callApply("apply")}>{busy ? "Creating…" : "Create draft PR"}</button> : <button className="primary" disabled={busy || noChanges} onClick={() => callApply("prepare")}>{busy ? "Preparing…" : noChanges ? "No changes to apply" : "Prepare apply"}</button>}
    </div>
  </section>, slot);
}
