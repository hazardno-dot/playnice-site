import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import DraftManager from "./DraftManager";
import InlineValidationBridge from "./InlineValidationBridge";
import ControlledApplyManager from "./ControlledApplyManager";
import ProductWorkflowBridge from "./ProductWorkflowBridge";
import JournalManager from "./JournalManager";
import JournalApplyManager from "./JournalApplyManager";
import NotesManager from "./NotesManager";
import NoteApplyManager from "./NoteApplyManager";
import AnalyticsManager from "./AnalyticsManager";
import { supabase } from "./supabase";
import "./header-layout.css";

const getCloudDraftCard = () => [...document.querySelectorAll(".overview-card")].find((card) =>
  card.querySelector("span")?.textContent?.trim().toLowerCase() === "cloud drafts"
);

export default function ControlCenterManagers() {
  const [slots, setSlots] = useState({ draft: null, apply: null });

  useEffect(() => {
    const topbar = document.querySelector(".main-stage .topbar");
    const mainStage = document.querySelector(".main-stage");
    const noPublish = topbar?.querySelector(".read-only-badge");
    if (!topbar || !mainStage || !noPublish) return;

    let actions = topbar.querySelector(".topbar-actions");
    if (!actions) {
      actions = document.createElement("div");
      actions.className = "topbar-actions";
      topbar.appendChild(actions);
      actions.appendChild(noPublish);
    }

    let draftSlot = actions.querySelector("#draft-manager-trigger-slot");
    if (!draftSlot) {
      draftSlot = document.createElement("div");
      draftSlot.id = "draft-manager-trigger-slot";
      draftSlot.className = "draft-manager-trigger-slot";
      actions.insertBefore(draftSlot, noPublish);
    }

    let applySlot = mainStage.querySelector("#controlled-apply-slot");
    if (!applySlot) {
      applySlot = document.createElement("div");
      applySlot.id = "controlled-apply-slot";
      applySlot.className = "controlled-apply-slot";
      topbar.insertAdjacentElement("afterend", applySlot);
    }

    setSlots({ draft: draftSlot, apply: applySlot });
  }, []);

  useEffect(() => {
    let cancelled = false;
    let authoritativeCount = null;
    const mainStage = document.querySelector(".main-stage");
    if (!mainStage) return;

    const openDraftManager = () => {
      document.querySelector(".draft-manager-trigger")?.click();
    };

    const decorateCloudDraftCard = () => {
      const card = getCloudDraftCard();
      if (!card) return;

      card.setAttribute("role", "button");
      card.setAttribute("tabindex", "0");
      card.setAttribute("title", "Open Draft management");
      card.style.cursor = "pointer";
      card.style.transition = "border-color .18s ease, background .18s ease, transform .18s ease";

      card.onclick = openDraftManager;
      card.onkeydown = (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openDraftManager();
        }
      };

      if (authoritativeCount == null) return;
      const value = card.querySelector("strong");
      const detail = card.querySelector("small");
      const text = String(authoritativeCount);
      if (value && value.textContent !== text) value.textContent = text;
      const detailText = authoritativeCount ? "persistent unpublished drafts" : "no unpublished drafts";
      if (detail && detail.textContent !== detailText) detail.textContent = detailText;
      card.classList.toggle("warn", authoritativeCount > 0);
      card.classList.toggle("good", authoritativeCount === 0);
    };

    const refreshDraftCount = async () => {
      const { count, error } = await supabase
        .from("product_drafts")
        .select("product_slug", { count: "exact", head: true });
      if (cancelled || error) return;
      authoritativeCount = count || 0;
      decorateCloudDraftCard();
    };

    decorateCloudDraftCard();
    refreshDraftCount();

    const observer = new MutationObserver(() => decorateCloudDraftCard());
    observer.observe(mainStage, { childList: true, subtree: true });

    const draftChannel = supabase
      .channel("control-center-draft-count")
      .on("postgres_changes", { event: "*", schema: "public", table: "product_drafts" }, refreshDraftCount)
      .subscribe();

    const onFocus = () => refreshDraftCount();
    window.addEventListener("focus", onFocus);

    return () => {
      cancelled = true;
      observer.disconnect();
      supabase.removeChannel(draftChannel);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  return <>
    {slots.draft ? createPortal(<DraftManager />, slots.draft) : <DraftManager />}
    <InlineValidationBridge />
    <ProductWorkflowBridge />
    <JournalManager />
    <JournalApplyManager />
    <NotesManager />
    <NoteApplyManager />
    <AnalyticsManager />
    {slots.apply ? createPortal(<ControlledApplyManager />, slots.apply) : <ControlledApplyManager />}
  </>;
}
