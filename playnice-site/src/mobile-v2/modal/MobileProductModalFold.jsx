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

    const markOriginalInspired = (modal) => {
      modal.querySelectorAll(".modal-inspired-mini").forEach((block) => {
        const name = block.querySelector(".modal-inspired-mini-name")?.textContent?.trim() || "";
        block.classList.toggle("modal-inspired-original", /^original\b/i.test(name));
      });
    };

    const getNoteMapButtons = (modal) =>
      Array.from(modal.querySelectorAll("button")).filter((button) =>
        button.textContent?.toUpperCase().includes("THE NOTE MAP")
      );

    const suppressNoteMapButtons = (modal) => {
      const buttons = getNoteMapButtons(modal);
      buttons.forEach((button) => button.classList.add("mobile-note-map-source"));
      return buttons;
    };

    const fitPageOneTitle = (modal) => {
      const title = modal.querySelector(".mobile-pager-page1-header h2");
      if (!title) return;

      requestAnimationFrame(() => {
        title.style.removeProperty("--mobile-pager-title-size");

        const width = title.getBoundingClientRect().width;
        if (!width) return;

        const computed = getComputedStyle(title);
        const baseSize = parseFloat(computed.fontSize);
        const minSize = Math.max(20, baseSize * 0.78);

        const probe = title.cloneNode(true);
        probe.removeAttribute("id");
        Object.assign(probe.style, {
          position: "absolute",
          left: "-9999px",
          top: "0",
          width: `${width}px`,
          maxWidth: "none",
          height: "auto",
          visibility: "hidden",
          pointerEvents: "none",
          display: "block",
          overflow: "visible",
          WebkitLineClamp: "unset",
          WebkitBoxOrient: "initial"
        });
        title.parentElement?.appendChild(probe);

        let size = baseSize;
        const fitsTwoLines = () => {
          probe.style.fontSize = `${size}px`;
          const probeStyle = getComputedStyle(probe);
          const lineHeight = parseFloat(probeStyle.lineHeight);
          return probe.scrollHeight <= lineHeight * 2 + 1;
        };

        while (size > minSize && !fitsTwoLines()) {
          size -= 0.5;
        }

        title.style.setProperty("--mobile-pager-title-size", `${size}px`);
        probe.remove();
      });
    };

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
      modal.querySelectorAll(".mobile-pager-page-close").forEach((node) => node.remove());
      modal.querySelector(".mobile-note-map-hit")?.remove();
      modal.querySelectorAll(".mobile-note-map-source").forEach((node) =>
        node.classList.remove("mobile-note-map-source")
      );
      modal.querySelectorAll(".mobile-pager-original-close").forEach((node) =>
        node.classList.remove("mobile-pager-original-close")
      );
    };

    const setupPager = () => {
      document.querySelectorAll(".product-modal").forEach((modal) => {
        markOriginalInspired(modal);

        if (!media.matches || !modal.classList.contains("open")) {
          clearPager(modal);
          return;
        }

        // React can replace the Note Map trigger after the first interaction.
        // Re-suppress every replacement even when the pager itself is already mounted.
        suppressNoteMapButtons(modal);

        if (modal.classList.contains("mobile-pager-enabled")) {
          fitPageOneTitle(modal);
          return;
        }

        const body = modal.querySelector(".modal-body");
        const mediaPanel = body?.querySelector(":scope > .modal-media");
        const contentPanel = body?.querySelector(":scope > .modal-content");
        const originalHeader = modal.querySelector(":scope > .modal-header");
        const originalClose = modal.querySelector(":scope > .close-button") || originalHeader?.querySelector(".close-button");
        if (!body || !mediaPanel || !contentPanel || !originalHeader || !originalClose) return;

        originalClose.classList.add("mobile-pager-original-close");

        const lang = getLang();
        let page = 0;
        let startX = 0;
        let startY = 0;
        let tracking = false;

        const pageOneHeader = originalHeader.cloneNode(true);
        pageOneHeader.classList.add("mobile-pager-page1-header");
        pageOneHeader.querySelector(".close-button")?.remove();
        mediaPanel.prepend(pageOneHeader);

        const makePageClose = (pageIndex) => {
          const button = document.createElement("button");
          button.type = "button";
          button.className = `mobile-pager-page-close mobile-pager-page-close-${pageIndex}`;
          button.setAttribute("aria-label", lang === "sr" ? "Zatvori prozor" : "Close modal");
          button.textContent = "×";
          return button;
        };

        const pageOneClose = makePageClose(1);
        const pageTwoClose = makePageClose(2);
        mediaPanel.appendChild(pageOneClose);
        contentPanel.appendChild(pageTwoClose);

        const intro = document.createElement("div");
        intro.className = "mobile-pager-decision-intro";
        intro.innerHTML = lang === "sr"
          ? '<span>02 · IZABERI SVOJ DEKANT</span><h3>Probaj ga na svoj način.</h3><p>Detalji, veličina i kupovina — bez žurbe.</p>'
          : '<span>02 · CHOOSE YOUR DECANT</span><h3>Try it your way.</h3><p>Details, size and purchase — with room to decide.</p>';
        contentPanel.prepend(intro);

        const chrome = document.createElement("div");
        chrome.className = "mobile-modal-pager-chrome";
        chrome.innerHTML = `
          <button type="button" class="mobile-pager-edge mobile-pager-edge-left" aria-label="${lang === "sr" ? "Prethodna strana" : "Previous page"}">‹</button>
          <div class="mobile-pager-status" aria-live="polite">
            <span class="mobile-pager-status-label">01 / 02</span>
            <span class="mobile-pager-dots" aria-hidden="true"><i class="is-active"></i><i></i></span>
          </div>
          <button type="button" class="mobile-pager-edge mobile-pager-edge-right" aria-label="${lang === "sr" ? "Sledeća strana" : "Next page"}">›</button>
        `;
        modal.appendChild(chrome);

        const statusLabel = chrome.querySelector(".mobile-pager-status-label");
        const dots = Array.from(chrome.querySelectorAll(".mobile-pager-dots i"));
        const left = chrome.querySelector(".mobile-pager-edge-left");
        const right = chrome.querySelector(".mobile-pager-edge-right");

        const noteMapSources = suppressNoteMapButtons(modal);
        const imageWrap = mediaPanel.querySelector(".modal-image-wrap");
        let noteMapHit = null;

        if (noteMapSources.length && imageWrap) {
          noteMapHit = document.createElement("button");
          noteMapHit.type = "button";
          noteMapHit.className = "mobile-note-map-hit";
          noteMapHit.setAttribute(
            "aria-label",
            lang === "sr" ? "Prikaži note parfema" : "Show fragrance notes"
          );
          noteMapHit.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();
            const currentSource = getNoteMapButtons(modal).find(
              (button) => button !== noteMapHit
            );
            currentSource?.click();
            suppressNoteMapButtons(modal);
          });
          imageWrap.appendChild(noteMapHit);
        }

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
        const closeModal = () => originalClose.click();

        left.addEventListener("click", goBack);
        right.addEventListener("click", goNext);
        pageOneClose.addEventListener("click", closeModal);
        pageTwoClose.addEventListener("click", closeModal);
        body.addEventListener("touchstart", onTouchStart, { passive: true });
        body.addEventListener("touchend", onTouchEnd, { passive: true });

        modal.classList.add("mobile-pager-enabled");
        fitPageOneTitle(modal);
        setPage(0);

        cleanupMap.set(modal, () => {
          left.removeEventListener("click", goBack);
          right.removeEventListener("click", goNext);
          pageOneClose.removeEventListener("click", closeModal);
          pageTwoClose.removeEventListener("click", closeModal);
          body.removeEventListener("touchstart", onTouchStart);
          body.removeEventListener("touchend", onTouchEnd);
          noteMapHit?.remove();
          modal.querySelectorAll(".mobile-note-map-source").forEach((button) =>
            button.classList.remove("mobile-note-map-source")
          );
          originalClose.classList.remove("mobile-pager-original-close");
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
