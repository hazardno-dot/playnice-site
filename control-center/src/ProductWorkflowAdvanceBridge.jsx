import { useEffect, useRef } from "react";
import { supabase } from "./supabase";

const PREPARE_LABEL = "Prepare apply";

function findOverviewButton() {
  return Array.from(document.querySelectorAll(".sidebar nav button"))
    .find((button) => button.textContent?.trim() === "Overview") || null;
}

function getCardSlug(button) {
  const card = button.closest(".draft-manager-card");
  const slug = card?.querySelector(".draft-manager-card-top > div:first-child > span")?.textContent?.trim();
  return slug || "";
}

export default function ProductWorkflowAdvanceBridge() {
  const pendingSlug = useRef("");
  const pollTimer = useRef(null);

  useEffect(() => {
    const clearPoll = () => {
      if (pollTimer.current) window.clearInterval(pollTimer.current);
      pollTimer.current = null;
    };

    const advanceToOverview = (slug) => {
      if (!slug || pendingSlug.current !== slug) return;
      pendingSlug.current = "";
      clearPoll();
      document.querySelector(".draft-manager-close")?.click();
      findOverviewButton()?.click();
      window.dispatchEvent(new Event("focus"));
      window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
    };

    const confirmPrepared = async (slug) => {
      const { data } = await supabase
        .from("product_drafts")
        .select("product_slug,prepared_at")
        .eq("product_slug", slug)
        .maybeSingle();
      if (data?.prepared_at) advanceToOverview(slug);
    };

    const handleClick = (event) => {
      const button = event.target.closest("button");
      if (!button || button.textContent?.trim() !== PREPARE_LABEL) return;
      const slug = getCardSlug(button);
      if (!slug) return;
      pendingSlug.current = slug;
      clearPoll();
      let attempts = 0;
      pollTimer.current = window.setInterval(() => {
        attempts += 1;
        confirmPrepared(slug);
        if (attempts >= 24) {
          clearPoll();
          pendingSlug.current = "";
        }
      }, 250);
    };

    document.addEventListener("click", handleClick, true);
    const channel = supabase
      .channel("product-workflow-advance")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "product_drafts" }, (payload) => {
        const row = payload.new || {};
        if (row.product_slug === pendingSlug.current && row.prepared_at) advanceToOverview(row.product_slug);
      })
      .subscribe();

    return () => {
      clearPoll();
      document.removeEventListener("click", handleClick, true);
      supabase.removeChannel(channel);
    };
  }, []);

  return null;
}
