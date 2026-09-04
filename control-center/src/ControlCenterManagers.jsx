import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import DraftManager from "./DraftManager";
import InlineValidationBridge from "./InlineValidationBridge";
import DiscoveryBulkPasteBridge from "./DiscoveryBulkPasteBridge";
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
import HeroMediaUploadBridge from "./HeroMediaUploadBridge";
import HeroBranchPreviewBridge from "./HeroBranchPreviewBridge";
import HeroReviewBridge from "./HeroReviewBridge";
import HeroApplyBridge from "./HeroApplyBridge";
import HeroPreviewCacheBustBridge from "./HeroPreviewCacheBustBridge";
import "./header-layout.css";

const ACTIVE_MODULE_KEY = "playnice_cc_active_module";

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

  useEffect(() => {
    const nav = document.querySelector(".sidebar nav");
    const mainStage = document.querySelector(".main-stage");
    if (!nav || !mainStage) return;

    const rememberModule = (event) => {
      const button = event.target.closest("button");
      if (!button || !nav.contains(button)) return;
      const moduleName = button.textContent?.trim();
      if (moduleName) window.sessionStorage.setItem(ACTIVE_MODULE_KEY, moduleName);
    };
    nav.addEventListener("click", rememberModule);

    const persisted = window.sessionStorage.getItem(ACTIVE_MODULE_KEY);
    let restoreTimer = null;
    if (persisted === "Hero") {
      let attempts = 0;
      restoreTimer = window.setInterval(() => {
        attempts += 1;
        const heading = mainStage.querySelector(".topbar h1");
        if (heading?.textContent?.trim() === "Hero") {
          window.clearInterval(restoreTimer);
          return;
        }
        const heroButton = nav.querySelector("[data-hero-manager-nav='true']");
        if (heroButton) heroButton.click();
        if (attempts >= 40) window.clearInterval(restoreTimer);
      }, 50);
    }

    return () => {
      nav.removeEventListener("click", rememberModule);
      if (restoreTimer) window.clearInterval(restoreTimer);
    };
  }, []);

  return <>
    {slots.draft ? createPortal(<DraftManager />, slots.draft) : <DraftManager />}
    <InlineValidationBridge />
    <DiscoveryBulkPasteBridge />
    <ProductWorkflowBridge />
    <ProductCatalogCountBridge />
    <HeroManager />
    <HeroMediaUploadBridge />
    <HeroBranchPreviewBridge />
    <HeroReviewBridge />
    <HeroApplyBridge />
    <HeroPreviewCacheBustBridge />
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
