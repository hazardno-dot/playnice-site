import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import DraftManager from "./DraftManager";
import InlineValidationBridge from "./InlineValidationBridge";
import ControlledApplyManager from "./ControlledApplyManager";
import ProductWorkflowBridge from "./ProductWorkflowBridge";
import ProductCatalogCountBridge from "./ProductCatalogCountBridge";
import JournalManager from "./JournalManager";
import JournalApplyManager from "./JournalApplyManager";
import NotesManager from "./NotesManager";
import NoteApplyManager from "./NoteApplyManager";
import AnalyticsManager from "./AnalyticsManager";
import SiteHealthManager from "./SiteHealthManager";
import SiteHealthOverviewBridge from "./SiteHealthOverviewBridge";
import BrowserQaSiteHealthBridge from "./BrowserQaSiteHealthBridge";
import BrowserQaOverviewBridge from "./BrowserQaOverviewBridge";
import HeroManager from "./HeroManager";
import HeroReviewBridge from "./HeroReviewBridge";
import HeroApplyBridge from "./HeroApplyBridge";
import "./header-layout.css";

export default function ControlCenterManagers() {
  const [slots, setSlots] = useState({ draft: null, apply: null });

  useEffect(() => {
    const topbar = document.querySelector(".main-stage .topbar");
    const mainStage = document.querySelector(".main-stage");
    const actions = topbar?.querySelector(".topbar-actions");
    const noPublish = actions?.querySelector(".read-only-badge") || topbar?.querySelector(".read-only-badge");
    if (!topbar || !mainStage || !actions || !noPublish) return;

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

  return <>
    {slots.draft ? createPortal(<DraftManager />, slots.draft) : <DraftManager />}
    <InlineValidationBridge />
    <ProductWorkflowBridge />
    <ProductCatalogCountBridge />
    <HeroManager />
    <HeroReviewBridge />
    <HeroApplyBridge />
    <JournalManager />
    <JournalApplyManager />
    <NotesManager />
    <NoteApplyManager />
    <AnalyticsManager />
    <SiteHealthManager />
    <SiteHealthOverviewBridge />
    <BrowserQaSiteHealthBridge />
    <BrowserQaOverviewBridge />
    {slots.apply ? createPortal(<ControlledApplyManager />, slots.apply) : <ControlledApplyManager />}
  </>;
}
