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

export default function ProductWorkflowBridge() {
  const [slot, setSlot] = useState(null);
  const [slug, setSlug] = useState("");
  const [row, setRow] = useState(null);
  const [loading, setLoading] = useState(false);

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
    if (!slug) { setRow(null); return; }
    let cancelled = false;
    const load = async () => {
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
    load();

    const channel = supabase
      .channel(`control-center-product-workflow-${slug}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "product_drafts", filter: `product_slug=eq.${slug}` }, load)
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [slug]);

  const state = useMemo(() => getWorkflowLabel(row), [row]);
  const actionLabel = useMemo(() => getWorkflowActionLabel(row), [row]);
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
    <section className={`product-workflow-strip ${state.tone}`}>
      <div className="product-workflow-copy">
        <span>CONTROL CENTER WORKFLOW</span>
        <div><strong>{loading ? "CHECKING…" : state.label}</strong><small>{loading ? "Reading Supabase draft state." : state.detail}</small></div>
      </div>
      <div className="product-workflow-actions">
        {row ? <button type="button" onClick={openDraftWorkflow}>{actionLabel}</button> : null}
        {openPr ? <button type="button" onClick={openPr}>Open PR #{row.apply_pr_number}</button> : null}
      </div>
    </section>,
    slot
  );
}
