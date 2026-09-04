import { useEffect } from "react";

export default function HeroControlledApplyBridge() {
  useEffect(() => {
    const mainStage = document.querySelector(".main-stage");
    if (!mainStage) return;

    const sync = () => {
      const topbar = mainStage.querySelector(".topbar");
      const heading = topbar?.querySelector("h1")?.textContent?.trim();
      const applySlot = document.querySelector("#controlled-apply-slot");
      const heroSlot = mainStage.querySelector("#hero-manager-slot");
      if (!topbar || !applySlot) return;

      if (heading === "Hero" && heroSlot && heroSlot.style.display !== "none") {
        if (applySlot.parentElement !== heroSlot || heroSlot.firstElementChild !== applySlot) {
          heroSlot.insertBefore(applySlot, heroSlot.firstChild);
        }
        applySlot.style.display = "";
        return;
      }

      if (applySlot.parentElement !== mainStage || applySlot.previousElementSibling !== topbar) {
        topbar.insertAdjacentElement("afterend", applySlot);
      }
      applySlot.style.display = "";
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
