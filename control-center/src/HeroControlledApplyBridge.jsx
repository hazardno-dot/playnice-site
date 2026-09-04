import { useEffect } from "react";

export default function HeroControlledApplyBridge() {
  useEffect(() => {
    const mainStage = document.querySelector(".main-stage");
    if (!mainStage) return;

    let restoring = false;

    const sync = () => {
      if (restoring) return;
      const topbar = mainStage.querySelector(".topbar");
      const heading = topbar?.querySelector("h1")?.textContent?.trim();
      const applySlot = mainStage.querySelector("#controlled-apply-slot");
      const heroSlot = mainStage.querySelector("#hero-manager-slot");
      if (!topbar || !applySlot) return;

      restoring = true;
      try {
        // Keep the Controlled Apply portal container as a direct main-stage child.
        // HeroManager hides normal main-stage children while Hero is open, so we
        // only restore this slot's visibility instead of moving it into heroSlot.
        // Moving the portal container into heroSlot interferes with HeroOverview's
        // own React portal lifecycle and can blank the Hero manager.
        if (applySlot.parentElement !== mainStage || applySlot.previousElementSibling !== topbar) {
          topbar.insertAdjacentElement("afterend", applySlot);
        }

        const heroOpen = heading === "Hero" && heroSlot && heroSlot.style.display !== "none";
        if (heroOpen) {
          applySlot.style.display = "";
          delete applySlot.dataset.heroPreviousDisplay;
        }
      } finally {
        restoring = false;
      }
    };

    sync();
    const observer = new MutationObserver(sync);
    observer.observe(mainStage, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["style"],
    });

    return () => observer.disconnect();
  }, []);

  return null;
}
