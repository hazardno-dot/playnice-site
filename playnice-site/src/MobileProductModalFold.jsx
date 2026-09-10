import { useEffect } from "react";
import "./MobileProductModalFold.css";

const MOBILE_QUERY = "(max-width: 640px)";
const SWIPE_THRESHOLD = 54;

function MobileProductModalFold() {
  useEffect(() => {
    const media = window.matchMedia(MOBILE_QUERY);
    const cleanupMap = new WeakMap();

    const getLang = () =>
      document.documentElement.lang?.toLowerCase().startsWith("sr") ? "sr" : "en";

    const clearPager = (modal) => {
      if (!modal) return;

      const cleanup = cleanupMap.get(modal);
      cleanup?.();
      cleanupMap.delete(modal);

      modal.classList.remove("mobile-pager-enabled", "mobile-pager-page-1", "mobile-pager-page-2");
      modal.style.removeProperty("--mobile-pager-page");
      modal.querySelector(".mobile-modal-pager-chrome")?.remove();
      modal.querySelector(".mobile-pager-decision-intro")?.remove();
      modal.querySelector(".mobile-pager-page1-header")?.remove();
    };

    const setupPager = () => {
      document.querySelectorAll(".product-modal").forEach((modal) => {
        if (!media.matches || !modal.classList.contains("open")) {
          clearPager(modal);
          return;
        }

        const body = modal.querySelector(".modal-body");
        const mediaPanel = body?.querySelector(":scope > .modal-media");
        const contentPanel = body?.querySelector(":scope > .modal-content");
        const originalHeader = modal.querySelector(":scope > .modal-header");
        const originalClose = originalHeader?.querySelector(".close-button") || modal.querySelector(".close-button");
        if (!body || !mediaPanel || !contentPanel || !originalHeader) return;
        if (modal.classList.contains("mobile-pager-enabled")) return;

        const lang = getLang();
        let page = 0;
        let startX = 0;
        let startY = 0;
        let tracking = false;

        // Page 01 gets its own header inside the swipe track so title/rating/close travel with the page.
        const pageOneHeader = originalHeader.cloneNode(true);
        pageOneHeader.classList.add("mobile-pager-page1-header");
        mediaPanel.prepend(pageOneHeader);
        const pageOneClose = pageOneHeader.querySelector(".close-button");

        const intro = document.createElement("div");
        intro.className = "mobile-pager-decision-intro";
        intro.innerHTML = lang === "sr"
          ? '<span>02 · IZABERI SVOJ DEKANT</span><h3>Probaj ga na svoj način.</h3><p>Detalji, veličina i kupovina — bez žurbe.</p>'
          : '<span>02 · CHOOSE YOUR DECANT</span><h3>Try it your way.</h3><p>Details, size and purchase — with room to decide.</p>';
        contentPanel.prepend(intro);

        const chrome = document.createElement("div");
        chrome.className = "mobile-modal-pager-chrome";
        chrome.innerHTML = `
          <button type="button" class="mobile-pager-close" aria-label="${lang === "sr" ? "Zatvori prozor" : "Close modal"}">×</button>
          <button type="button" class="mobile-pager-edge mobile-pager-edge-left" aria-label="${lang === "sr" ? "Prethodna strana" : "Previous page"}">‹</button>
          <div class="mobile-pager-status" aria-live="polite">
            <span class="mobile-pager-status-label">01 / 02</span>
            <span class="mobile-pager-dots" aria-hidden="true"><i class="is-active"></i><i></i></span>
          </div>
          <button type="button" class="mobile-pager-edge mobile-pager-edge-right" aria-label="${lang === "sr" ? "Sledeća strana" : "Next page"}">›</button>
          <button type="button" class="mobile-pager-hint" aria-label="${lang === "sr" ? "Pređi na izbor veličine" : "Continue to size selection"}">
            <span>${lang === "sr" ? "Prevuci za izbor" : "Swipe to choose"}</span><b aria-hidden="true">→</b>
          </button>
        `;
        modal.appendChild(chrome);

        const statusLabel = chrome.querySelector(".mobile-pager-status-label");
        const dots = Array.from(chrome.querySelectorAll(".mobile-pager-dots i"));
        const left = chrome.querySelector(".mobile-pager-edge-left");
        const right = chrome.querySelector(".mobile-pager-edge-right");
        const hint = chrome.querySelector(".mobile-pager-hint");
        const close = chrome.querySelector(".mobile-pager-close");

        const setPage = (nextPage) => {
          page = Math.max(0, Math.min(1, nextPage));
          modal.style.setProperty("--mobile-pager-page", String(page));
          modal.classList.toggle("mobile-pager-page-1", page === 0);
          modal.classList.toggle("mobile-pager-page-2", page === 1);
          statusLabel.textContent = page === 0 ? "01 / 02" : "02 / 02";
          dots.forEach((dot, index) => dot.classList.toggle("is-active", index === page));

          if (page === 0) mediaPanel.scrollTop = 0;
          if (page === 1) contentPanel.scrollTop = 0;
        };

        const onTouchStart = (event) => {
          const touch = event.touches?.[0];
          if (!touch) return;
          startX = touch.clientX;
          startY = touch.clientY;
          tracking = true;
        };

        const onTouchEnd = (event) => {
          if (!tracking) return;
          tracking = false;
          const touch = event.changedTouches?.[0];
          if (!touch) return;

          const dx = touch.clientX - startX;
          const dy = touch.clientY - startY;
          if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) < Math.abs(dy) * 1.25) return;

          if (dx < 0 && page === 0) setPage(1);
          if (dx > 0 && page === 1) setPage(0);
        };

        const goNext = () => setPage(1);
        const goBack = () => setPage(0);
        const closeModal = () => originalClose?.click();

        left.addEventListener("click", goBack);
        right.addEventListener("click", goNext);
        hint.addEventListener("click", goNext);
        close.addEventListener("click", closeModal);
        pageOneClose?.addEventListener("click", closeModal);
        body.addEventListener("touchstart", onTouchStart, { passive: true });
        body.addEventListener("touchend", onTouchEnd, { passive: true });

        modal.classList.add("mobile-pager-enabled");
        setPage(0);

        cleanupMap.set(modal, () => {
          left.removeEventListener("click", goBack);
          right.removeEventListener("click", goNext);
          hint.removeEventListener("click", goNext);
          close.removeEventListener("click", closeModal);
          pageOneClose?.removeEventListener("click", closeModal);
          body.removeEventListener("touchstart", onTouchStart);
          body.removeEventListener("touchend", onTouchEnd);
        });
      });
    };

    let scheduled = false;
    const scheduleSetup = () => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => {
        scheduled = false;
        setupPager();
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
      document.querySelectorAll(".product-modal").forEach(clearPager);
    };
  }, []);

  return null;
}

export default MobileProductModalFold;
