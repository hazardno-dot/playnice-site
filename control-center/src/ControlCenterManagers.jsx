import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import DraftManager from "./DraftManager";
import InlineValidationBridge from "./InlineValidationBridge";
import ControlledApplyManager from "./ControlledApplyManager";
import "./header-layout.css";

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

  return <>
    {slots.draft ? createPortal(<DraftManager />, slots.draft) : <DraftManager />}
    <InlineValidationBridge />
    {slots.apply ? createPortal(<ControlledApplyManager />, slots.apply) : <ControlledApplyManager />}
  </>;
}
