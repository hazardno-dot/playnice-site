import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { supabase } from "./supabase";
import {
  getProductWorkflowActionLabel,
  getProductWorkflowHistoryLabel,
  getProductWorkflowState,
} from "./productWorkflowState.mjs";
import "./product-workflow-bridge.css";

const getSelectedSlug = () => {
  const slugNode = document.querySelector(".detail-panel .product-detail .slug");
  if (!slugNode) return "";
  return String(slugNode.textContent || "").split(" · ")[0].trim();
};

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

    loadDraft();

    const draftChannel = supabase
      .channel(`control-center-product-workflow-${slug}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "product_drafts", filter: `product_slug=eq.${slug}` }, loadDraft)
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(draftChannel);
    };
  }, [slug]);

  useEffect(() => {
    if (!slug || !historyOpen) return;
    let cancelled = false;

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

    loadHistory();

    const auditChannel = supabase
      .channel(`control-center-product-history-${slug}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "draft_audit_log", filter: `product_slug=eq.${slug}` }, loadHistory)
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(auditChannel);
    };
  }, [slug, historyOpen]);

  useEffect(() => {
    setHistory([]);
    setHistoryOpen(false);
  }, [slug]);

  const state = useMemo(() => getProductWorkflowState(row), [row]);
  const actionLabelText = useMemo(() => getProductWorkflowActionLabel(row), [row]);
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
            <div><strong>{getProductWorkflowHistoryLabel(item.action)}</strong><small>{formatHistoryDate(item.created_at)}</small></div>
          </div>)}
        </div>}
      </div> : null}
    </section>,
    slot
  );
}
