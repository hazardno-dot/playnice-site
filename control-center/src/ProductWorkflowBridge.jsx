import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { supabase } from "./supabase";
import "./product-workflow-bridge.css";

const getSelectedSlug = () => {
  const slugNode = document.querySelector(".detail-panel .product-detail .slug");
  if (!slugNode) return "";
  return String(slugNode.textContent || "").split(" · ")[0].trim();
};

const getWorkflowLabel = (row) => {
  if (!row) return { label: "LIVE ONLY", tone: "live", detail: "No unpublished draft for this product." };
  if (row.preview_verified_at) return { label: "PREVIEW VERIFIED", tone: "verified", detail: "Preview was manually verified. Merge remains manual." };
  if (row.apply_pr_number) return { label: "PREVIEW CREATED", tone: "preview", detail: `PR #${row.apply_pr_number} is waiting for manual Preview verification.` };
  if (row.review_status === "approved" && row.prepared_at) return { label: "READY TO APPLY", tone: "ready", detail: "Approved and prepared. Controlled Apply can create a Preview branch." };
  if (row.review_status === "approved") return { label: "APPROVED", tone: "approved", detail: "Approved draft. Pre-publish preparation is still required." };
  if (row.review_status === "ready") return { label: "READY FOR REVIEW", tone: "review", detail: "Draft is ready for manual review." };
  return { label: "DRAFT", tone: "draft", detail: "Unpublished Supabase draft." };
};

const getWorkflowActionLabel = (row) => {
  if (!row) return "";
  if (row.preview_verified_at) return "Open verified draft";
  if (row.apply_pr_number) return "Open draft";
  if (row.review_status === "approved" && row.prepared_at) return "Review apply";
  if (row.review_status === "approved") return "Prepare in Drafts";
  if (row.review_status === "ready") return "Review & approve";
  return "Review draft";
};

const ACTION_LABELS = {
  created: "Draft created",
  saved: "Draft saved",
  updated: "Draft updated",
  marked_ready: "Ready for review",
  approved: "Approved",
  returned_to_draft: "Returned to draft",
  prepared: "Prepared for apply",
  apply_created: "Preview branch created",
  preview_created: "Preview branch created",
  preview_verified: "Preview verified",
  published: "Published live",
  discarded: "Draft discarded",
};

const actionLabel = (action) => ACTION_LABELS[action] || String(action || "Workflow event").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
const formatHistoryDate = (value) => {
  if (!value) return "";
  try {
    return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
  } catch {
    return "";
  }
};

export default function ProductWorkflowBridge() {
  const [slot, setSlot] = useState(null);
  const [slug, setSlug] = useState("");
  const [row, setRow] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  useEffect(() => {
    const mainStage = document.querySelector(".main-stage");
    if (!mainStage) return;

    const syncSlot = () => {
      const detail = document.querySelector(".detail-panel .product-detail");
      const hero = detail?.querySelector(".detail-hero");
      const nextSlug = getSelectedSlug();
      if (!detail || !hero || !nextSlug) {
        setSlot(null);
        setSlug("");
        return;
      }

      let nextSlot = detail.querySelector("#product-workflow-slot");
      if (!nextSlot) {
        nextSlot = document.createElement("div");
        nextSlot.id = "product-workflow-slot";
        nextSlot.className = "product-workflow-slot";
        hero.insertAdjacentElement("afterend", nextSlot);
      }
      setSlot(nextSlot);
      setSlug((current) => current === nextSlug ? current : nextSlug);
    };

    syncSlot();
    const observer = new MutationObserver(syncSlot);
    observer.observe(mainStage, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!slug) {
      setRow(null);
      setHistory([]);
      setHistoryOpen(false);
      return;
    }
    let cancelled = false;

    const loadDraft = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("product_drafts")
        .select("product_slug,review_status,prepared_at,apply_branch,apply_pr_number,preview_verified_at,updated_at")
        .eq("product_slug", slug)
        .maybeSingle();
      if (cancelled) return;
      setRow(error ? null : data || null);
      setLoading(false);
    };

    const loadHistory = async () => {
      setHistoryLoading(true);
      const { data, error } = await supabase
        .from("draft_audit_log")
        .select("id,action,details,created_at")
        .eq("product_slug", slug)
        .order("created_at", { ascending: false })
        .limit(8);
      if (cancelled) return;
      setHistory(error ? [] : data || []);
      setHistoryLoading(false);
    };

    loadDraft();
    loadHistory();

    const draftChannel = supabase
      .channel(`control-center-product-workflow-${slug}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "product_drafts", filter: `product_slug=eq.${slug}` }, loadDraft)
      .subscribe();

    const auditChannel = supabase
      .channel(`control-center-product-history-${slug}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "draft_audit_log", filter: `product_slug=eq.${slug}` }, loadHistory)
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(draftChannel);
      supabase.removeChannel(auditChannel);
    };
  }, [slug]);

  const state = useMemo(() => getWorkflowLabel(row), [row]);
  const actionLabelText = useMemo(() => getWorkflowActionLabel(row), [row]);
  if (!slot || !slug) return null;

  const openDraftWorkflow = () => {
    document.querySelector(".draft-manager-trigger")?.click();
    window.setTimeout(() => {
      const card = [...document.querySelectorAll(".draft-manager-card")].find((item) =>
        String(item.textContent || "").includes(slug)
      );
      if (!card) return;
      const reviewButton = [...card.querySelectorAll("button")].find((button) =>
        button.textContent?.trim() === "Review changes"
      );
      reviewButton?.click();
      card.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 180);
  };

  const openPr = row?.apply_pr_number
    ? () => window.open(`https://github.com/hazardno-dot/playnice-site/pull/${row.apply_pr_number}`, "_blank", "noopener,noreferrer")
    : null;

  return createPortal(
    <section className={`product-workflow-shell ${state.tone}`}>
      <div className="product-workflow-strip">
        <div className="product-workflow-copy">
          <span>CONTROL CENTER WORKFLOW</span>
          <div><strong>{loading ? "CHECKING…" : state.label}</strong><small>{loading ? "Reading Supabase draft state." : state.detail}</small></div>
        </div>
        <div className="product-workflow-actions">
          {row ? <button type="button" onClick={openDraftWorkflow}>{actionLabelText}</button> : null}
          {openPr ? <button type="button" onClick={openPr}>Open PR #{row.apply_pr_number}</button> : null}
          <button className="workflow-history-toggle" type="button" onClick={() => setHistoryOpen((value) => !value)} aria-expanded={historyOpen}>
            History {historyLoading ? "…" : history.length ? `· ${history.length}` : ""}
          </button>
        </div>
      </div>
      {historyOpen ? <div className="product-workflow-history">
        <div className="product-workflow-history-head"><span>RECENT LIFECYCLE</span><small>Read only · newest first</small></div>
        {historyLoading ? <div className="product-workflow-history-empty">Loading history…</div> : !history.length ? <div className="product-workflow-history-empty">No recorded workflow events for this product yet.</div> : <div className="product-workflow-history-list">
          {history.map((item) => <div className="product-workflow-history-item" key={item.id}>
            <span className="workflow-history-dot" />
            <div><strong>{actionLabel(item.action)}</strong><small>{formatHistoryDate(item.created_at)}</small></div>
          </div>)}
        </div>}
      </div> : null}
    </section>,
    slot
  );
}
