import { useEffect, useRef } from "react";
import { supabase } from "./supabase";

const PREPARE_LABEL = "Prepare apply";
const READY_LABEL = "Mark ready for review";
const PRODUCT_WORKFLOW_UPDATED_EVENT = "playnice:product-workflow-updated";

function findOverviewButton() {
  return Array.from(document.querySelectorAll(".sidebar nav button"))
    .find((button) => button.textContent?.trim() === "Overview") || null;
}

function getCard(button) {
  return button?.closest(".draft-manager-card") || null;
}

function getCardSlug(button) {
  const card = getCard(button);
  const slug = card?.querySelector(".draft-manager-card-top > div:first-child > span")?.textContent?.trim();
  return slug || "";
}

function openReviewForSlug(slug) {
  const card = Array.from(document.querySelectorAll(".draft-manager-card")).find((item) =>
    item.querySelector(".draft-manager-card-top > div:first-child > span")?.textContent?.trim() === slug
  );
  if (!card) return false;
  const button = Array.from(card.querySelectorAll(".draft-manager-actions button"))
    .find((candidate) => candidate.textContent?.trim() === "Review changes");
  if (!button) return false;
  button.click();
  return true;
}

export default function ProductWorkflowAdvanceBridge() {
  const pendingPrepareSlug = useRef("");
  const pendingReviewSlug = useRef("");
  const preparePollTimer = useRef(null);
  const reviewPollTimer = useRef(null);

  useEffect(() => {
    const clearPreparePoll = () => {
      if (preparePollTimer.current) window.clearInterval(preparePollTimer.current);
      preparePollTimer.current = null;
    };
    const clearReviewPoll = () => {
      if (reviewPollTimer.current) window.clearInterval(reviewPollTimer.current);
      reviewPollTimer.current = null;
    };

    const advanceToOverview = (slug) => {
      if (!slug || pendingPrepareSlug.current !== slug) return;
      pendingPrepareSlug.current = "";
      clearPreparePoll();
      document.querySelector(".draft-manager-close")?.click();
      findOverviewButton()?.click();
      window.dispatchEvent(new CustomEvent(PRODUCT_WORKFLOW_UPDATED_EVENT, { detail: { productSlug: slug, prepared: true } }));
      window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
    };

    const revealReview = (slug) => {
      if (!slug || pendingReviewSlug.current !== slug) return;
      if (!openReviewForSlug(slug)) return;
      pendingReviewSlug.current = "";
      clearReviewPoll();
    };

    const confirmPrepared = async (slug) => {
      const { data } = await supabase
        .from("product_drafts")
        .select("product_slug,prepared_at")
        .eq("product_slug", slug)
        .maybeSingle();
      if (data?.prepared_at) advanceToOverview(slug);
    };

    const confirmReady = async (slug) => {
      const { data } = await supabase
        .from("product_drafts")
        .select("product_slug,review_status")
        .eq("product_slug", slug)
        .maybeSingle();
      if (data?.review_status === "ready") revealReview(slug);
    };

    const handleClick = (event) => {
      const button = event.target.closest("button");
      if (!button) return;
      const label = button.textContent?.trim();
      const slug = getCardSlug(button);
      if (!slug) return;

      if (label === PREPARE_LABEL) {
        pendingPrepareSlug.current = slug;
        clearPreparePoll();
        let attempts = 0;
        preparePollTimer.current = window.setInterval(() => {
          attempts += 1;
          confirmPrepared(slug);
          if (attempts >= 24) {
            clearPreparePoll();
            pendingPrepareSlug.current = "";
          }
        }, 250);
      }

      if (label === READY_LABEL) {
        pendingReviewSlug.current = slug;
        clearReviewPoll();
        let attempts = 0;
        reviewPollTimer.current = window.setInterval(() => {
          attempts += 1;
          confirmReady(slug);
          if (attempts >= 24) {
            clearReviewPoll();
            pendingReviewSlug.current = "";
          }
        }, 150);
      }
    };

    document.addEventListener("click", handleClick, true);
    const channel = supabase
      .channel("product-workflow-advance")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "product_drafts" }, (payload) => {
        const row = payload.new || {};
        if (row.product_slug === pendingPrepareSlug.current && row.prepared_at) advanceToOverview(row.product_slug);
        if (row.product_slug === pendingReviewSlug.current && row.review_status === "ready") revealReview(row.product_slug);
      })
      .subscribe();

    return () => {
      clearPreparePoll();
      clearReviewPoll();
      document.removeEventListener("click", handleClick, true);
      supabase.removeChannel(channel);
    };
  }, []);

  return null;
}
