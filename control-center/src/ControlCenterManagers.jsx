import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import DraftManager from "./DraftManager";
import InlineValidationBridge from "./InlineValidationBridge";
import ProductBulkPasteBridge from "./ProductBulkPasteBridge";
import ProductMediaUploadBridge from "./ProductMediaUploadBridge";
import ProductMediaReplaceBridge from "./ProductMediaReplaceBridge";
import ProductMediaStatusBridge from "./ProductMediaStatusBridge";
import DiscoveryBulkPasteBridge from "./DiscoveryBulkPasteBridge";
import ControlledApplyManager from "./ControlledApplyManager";
import ProductWorkflowBridge from "./ProductWorkflowBridge";
import ProductWorkflowAdvanceBridge from "./ProductWorkflowAdvanceBridge";
import ProductCatalogCountBridge from "./ProductCatalogCountBridge";
import ProductCardCopyAuditBridge from "./ProductCardCopyAuditBridge";
import JournalManager from "./JournalManager";
import JournalApplyManager from "./JournalApplyManager";
import NotesManager from "./NotesManager";
import NoteMediaUploadBridge from "./NoteMediaUploadBridge";
import NoteApplyManager from "./NoteApplyManager";
import NoteWorkflowAdvanceBridge from "./NoteWorkflowAdvanceBridge";
import AnalyticsManager from "./AnalyticsManager";
import ScentRequestsManager from "./ScentRequestsManager";
import WorkflowManager from "./WorkflowManager";
import SiteHealthManager from "./SiteHealthManager";
import SiteHealthOverviewBridge from "./SiteHealthOverviewBridge";
import BrowserQaSiteHealthBridge from "./BrowserQaSiteHealthBridge";
import BrowserQaOverviewBridge from "./BrowserQaOverviewBridge";
import HeroManager from "./HeroManager";
import HeroMediaUploadBridge from "./HeroMediaUploadBridge";
import HeroReviewBridge from "./HeroReviewBridge";
import HeroApplyBridge from "./HeroApplyBridge";
import ExhibitionManager from "./ExhibitionManager";
import AnnouncementManager from "./AnnouncementManager";
import CommerceShippingManager from "./CommerceShippingManager";
import OrdersManager from "./OrdersManager";
import SocialManager from "./SocialManager";
import SocialInboxManager from "./SocialInboxManager";
import SocialMediaOverrideBridge from "./SocialMediaOverrideBridge";
import SocialReadinessBridge from "./SocialReadinessBridge";
import SocialInstagramTestPublishBridge from "./SocialInstagramTestPublishBridge";
import SocialFacebookTestPublishBridge from "./SocialFacebookTestPublishBridge";
import SocialInstagramStoryTestPublishBridge from "./SocialInstagramStoryTestPublishBridge";
import MetaConnectionBridge from "./MetaConnectionBridge";
import "./header-layout.css";
import "./social-dry-run.css";

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

    const applySlot = mainStage.querySelector("#controlled-apply-slot");
    if (!applySlot) return;

    setSlots({ draft: draftSlot, apply: applySlot });
  }, []);

  useEffect(() => {
    const nav = document.querySelector(".cc-navigation");
    const mainStage = document.querySelector(".main-stage");
    if (!nav || !mainStage) return;

    const resetModuleScroll = () => {
      const reset = () => {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
        mainStage.scrollTop = 0;
        mainStage.scrollLeft = 0;
      };
      reset();
      window.requestAnimationFrame(reset);
    };

    const rememberModule = (event) => {
      const button = event.target.closest("button");
      if (!button || !nav.contains(button)) return;
      const moduleName = button.textContent?.trim();
      if (moduleName) window.sessionStorage.setItem(ACTIVE_MODULE_KEY, moduleName);
      resetModuleScroll();
    };
    nav.addEventListener("click", rememberModule, true);

    const persisted = window.sessionStorage.getItem(ACTIVE_MODULE_KEY);
    const restoreTarget = persisted === "Hero"
      ? { group: "Manage", selector: "[data-hero-manager-nav='true']" }
      : persisted === "Exhibition"
        ? { group: "Manage", selector: "[data-exhibition-manager-nav='true']" }
        : persisted === "Social"
          ? { group: "Social", selector: "[data-social-manager-nav='true']" }
          : persisted === "Inbox"
            ? { group: "Social", selector: "[data-social-inbox-manager-nav='true']" }
            : null;

    let restoreTimer = null;
    if (restoreTarget) {
      let attempts = 0;
      restoreTimer = window.setInterval(() => {
        attempts += 1;
        const heading = mainStage.querySelector(".topbar h1");
        if (heading?.textContent?.trim() === persisted) {
          window.clearInterval(restoreTimer);
          return;
        }

        const moduleButton = nav.querySelector(restoreTarget.selector);
        if (moduleButton) {
          moduleButton.click();
        } else {
          const groupButton = [...nav.querySelectorAll(".cc-primary-nav button")]
            .find((button) => button.textContent?.trim() === restoreTarget.group);
          groupButton?.click();
        }

        if (attempts >= 40) window.clearInterval(restoreTimer);
      }, 50);
    }

    return () => {
      nav.removeEventListener("click", rememberModule, true);
      if (restoreTimer) window.clearInterval(restoreTimer);
    };
  }, []);

  return <>
    {slots.draft ? createPortal(<DraftManager />, slots.draft) : <DraftManager />}
    <InlineValidationBridge />
    <ProductMediaUploadBridge />
    <ProductMediaReplaceBridge />
    <ProductMediaStatusBridge />
    <ProductBulkPasteBridge />
    <DiscoveryBulkPasteBridge />
    <ProductWorkflowBridge />
    <ProductWorkflowAdvanceBridge />
    <ProductCatalogCountBridge />
    <ProductCardCopyAuditBridge />
    <HeroManager />
    <HeroMediaUploadBridge />
    <HeroReviewBridge />
    <HeroApplyBridge />
    <ExhibitionManager />
    <AnnouncementManager />
    <CommerceShippingManager />
    <OrdersManager />
    <SocialManager />
    <SocialInboxManager />
    <SocialMediaOverrideBridge />
    <SocialReadinessBridge />
    <SocialInstagramTestPublishBridge />
    <SocialFacebookTestPublishBridge />
    <SocialInstagramStoryTestPublishBridge />
    <MetaConnectionBridge />
    <JournalManager />
    <JournalApplyManager />
    <NotesManager />
    <NoteMediaUploadBridge />
    <NoteApplyManager />
    <NoteWorkflowAdvanceBridge />
    <AnalyticsManager />
    <ScentRequestsManager />
    <WorkflowManager />
    <SiteHealthManager />
    <SiteHealthOverviewBridge />
    <BrowserQaSiteHealthBridge />
    <BrowserQaOverviewBridge />
    {slots.apply ? createPortal(<ControlledApplyManager />, slots.apply) : <ControlledApplyManager />}
  </>;
}