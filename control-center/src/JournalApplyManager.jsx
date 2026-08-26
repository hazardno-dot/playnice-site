import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { journalArticles } from "@shop/data/journal/index.js";
import { journalPayloadEquals, normalizeJournalDraftPayload } from "./journalDraft.mjs";
import { supabase } from "./supabase";
import "./journal-apply.css";

const SELECT = "article_id,payload,approved_payload,review_status,baseline_snapshot,prepared_at,apply_branch,apply_pr_number,apply_created_at,updated_at";

const selectedArticleIdFromDom = () => {
  const heading = document.querySelector(".main-stage .topbar h1")?.textContent?.trim();
  if (heading !== "Journal") return null;
  const text = document.querySelector(".journal-detail-hero p")?.textContent || "";
  const match = text.match(/#(\d+)/);
  return match ? Number(match[1]) : null;
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
      setSlot(nextSlot);
    };
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(mainStage, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!articleId) { setRow(null); return; }
    let cancelled = false;
    const load = async () => {
      const { data, error: loadError } = await supabase.from("journal_drafts").select(SELECT).eq("article_id", articleId).maybeSingle();
      if (cancelled) return;
      if (loadError) { setError(loadError.message); return; }
      setRow(data || null);
    };
    load();
    const channel = supabase.channel(`journal-apply-${articleId}`).on("postgres_changes", { event: "*", schema: "public", table: "journal_drafts", filter: `article_id=eq.${articleId}` }, load).subscribe();
    return () => { cancelled = true; supabase.removeChannel(channel); };
  }, [articleId]);

  const liveArticle = useMemo(() => journalArticles.find((article) => Number(article.id) === Number(articleId)) || null, [articleId]);
  const noChanges = useMemo(() => {
    if (!liveArticle || !row?.payload) return false;
    return journalPayloadEquals(normalizeJournalDraftPayload(liveArticle), normalizeJournalDraftPayload(row.payload));
  }, [liveArticle, row]);

  if (!slot || !articleId || !row || row.review_status !== "approved") return null;

  const callApply = async (action) => {
    setBusy(true); setError("");
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData?.session?.access_token) throw sessionError || new Error("Authenticated admin session is required.");
      const response = await fetch("/api/create-journal-apply", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${sessionData.session.access_token}` },
        body: JSON.stringify({ article_id: articleId, action, ...(action === "prepare" ? { live_payload: normalizeJournalDraftPayload(liveArticle) } : {}) }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || `Journal Controlled Apply failed (${response.status}).`);
      const { data, error: reloadError } = await supabase.from("journal_drafts").select(SELECT).eq("article_id", articleId).single();
      if (reloadError) throw reloadError;
      setRow(data);
    } catch (applyError) { setError(applyError.message || String(applyError)); }
    finally { setBusy(false); }
  };

  const prepared = Boolean(row.prepared_at && row.baseline_snapshot?.source_block);
  const hasPr = Boolean(row.apply_branch && row.apply_pr_number);

  return createPortal(<section className={`journal-controlled-apply ${hasPr ? "pr" : prepared ? "prepared" : "approved"}`}>
    <div className="journal-controlled-copy"><span>JOURNAL CONTROLLED APPLY</span><strong>{hasPr ? `DRAFT PR #${row.apply_pr_number}` : prepared ? "READY TO CREATE DRAFT PR" : noChanges ? "NO LIVE CHANGES" : "APPROVED · PREPARE BASELINE"}</strong><small>Existing article only · exact source-block drift guard · no automatic merge.</small></div>
    <div className="journal-controlled-actions">
      {error ? <span className="journal-controlled-error">{error}</span> : null}
      {hasPr ? <a href={`https://github.com/hazardno-dot/playnice-site/pull/${row.apply_pr_number}`} target="_blank" rel="noreferrer">Open draft PR ↗</a> : prepared ? <button className="primary" disabled={busy} onClick={() => callApply("apply")}>{busy ? "Creating…" : "Create draft PR"}</button> : <button className="primary" disabled={busy || noChanges} onClick={() => callApply("prepare")}>{busy ? "Preparing…" : noChanges ? "No changes to apply" : "Prepare apply"}</button>}
    </div>
  </section>, slot);
}
