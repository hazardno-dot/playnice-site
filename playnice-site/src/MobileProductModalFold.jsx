import { useEffect } from "react";
import "./MobileProductModalFold.css";

const MOBILE_QUERY = "(max-width: 640px)";

function MobileProductModalFold() {
  useEffect(() => {
    const media = window.matchMedia(MOBILE_QUERY);

    const clearFold = (modal) => {
      if (!modal) return;
      modal.classList.remove("mobile-fold-collapsed", "mobile-fold-expanded");
      modal.querySelector(".mobile-modal-fold")?.remove();
    };

    const setupFold = () => {
      const modals = Array.from(document.querySelectorAll(".product-modal"));

      modals.forEach((modal) => {
        if (!media.matches || !modal.classList.contains("open")) {
          clearFold(modal);
          return;
        }

        const body = modal.querySelector(".modal-body");
        const content = modal.querySelector(".modal-content");
        if (!body || !content) return;

        if (modal.querySelector(".mobile-modal-fold")) return;

        const fold = document.createElement("div");
        fold.className = "mobile-modal-fold";
        fold.setAttribute("aria-hidden", "false");

        const button = document.createElement("button");
        button.type = "button";
        button.className = "mobile-modal-fold-trigger";
        button.setAttribute("aria-expanded", "false");
        button.setAttribute("aria-label", "Continue to fragrance details and purchase options");
        button.innerHTML = '<span>Continue</span><span class="mobile-modal-fold-arrow" aria-hidden="true">⌄</span>';

        fold.appendChild(button);
        body.insertBefore(fold, content);

        modal.classList.remove("mobile-fold-expanded");
        modal.classList.add("mobile-fold-collapsed");

        button.addEventListener("click", () => {
          if (!modal.classList.contains("mobile-fold-collapsed")) return;

          modal.classList.remove("mobile-fold-collapsed");
          modal.classList.add("mobile-fold-expanded");
          button.setAttribute("aria-expanded", "true");

          const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
          window.requestAnimationFrame(() => {
            const targetTop = Math.max(0, fold.offsetTop - 8);
            modal.scrollTo({
              top: targetTop,
              behavior: reducedMotion ? "auto" : "smooth"
            });
          });
        });
      });
    };

    let scheduled = false;
    const scheduleSetup = () => {
      if (scheduled) return;
      scheduled = true;
      window.requestAnimationFrame(() => {
        scheduled = false;
        setupFold();
      });
    };

    const observer = new MutationObserver(scheduleSetup);
    observer.observe(document.body, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["class"]
    });

    media.addEventListener?.("change", scheduleSetup);
    window.addEventListener("resize", scheduleSetup);
    scheduleSetup();

    return () => {
      observer.disconnect();
      media.removeEventListener?.("change", scheduleSetup);
      window.removeEventListener("resize", scheduleSetup);
      document.querySelectorAll(".product-modal").forEach(clearFold);
    };
  }, []);

  return null;
}

export default MobileProductModalFold;
