import { useEffect } from "react";
import "./MobileProductModalPagerCore.css";

const MOBILE_QUERY = "(max-width: 640px)";
const SWIPE_THRESHOLD = 54;

function MobileProductModalPager({
  modalRef,
  active,
  resetKey,
  page,
  setPage,
}) {
  useEffect(() => {
    if (!active) return undefined;

    const modal = modalRef?.current;
    if (!modal) return undefined;

    const media = window.matchMedia(MOBILE_QUERY);
    let cleanupCurrent = null;

    const markOriginalInspired = () => {
      modal.querySelectorAll(".modal-inspired-mini").forEach((block) => {
        const name =
          block.querySelector(".modal-inspired-mini-name")?.textContent?.trim() || "";
        block.classList.toggle("modal-inspired-original", /^original\\b/i.test(name));
      });
    };

    const fitPageOneTitle = () => {
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
          WebkitBoxOrient: "initial",
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

    const clearPager = () => {
      cleanupCurrent?.();
      cleanupCurrent = null;
      modal.classList.remove(
        "mobile-pager-enabled",
        "mobile-pager-page-1",
        "mobile-pager-page-2"
      );
      modal.style.removeProperty("--mobile-pager-page");
      modal.querySelector(".mobile-pager-page1-header")?.remove();
      modal
        .querySelectorAll(".mobile-pager-original-close")
        .forEach((node) => node.classList.remove("mobile-pager-original-close"));
    };

    const setupPager = () => {
      clearPager();
      markOriginalInspired();

      if (!media.matches || !active) return;

      const body = modal.querySelector(".modal-body");
      const mediaPanel = body?.querySelector(":scope > .modal-media");
      const contentPanel = body?.querySelector(":scope > .modal-content");
      const originalHeader = modal.querySelector(":scope > .modal-header");
      const originalClose =
        modal.querySelector(":scope > .close-button") ||
        originalHeader?.querySelector(".close-button");

      if (!body || !mediaPanel || !contentPanel || !originalHeader || !originalClose) {
        return;
      }

      originalClose.classList.add("mobile-pager-original-close");

      const pageOneHeader = originalHeader.cloneNode(true);
      pageOneHeader.classList.add("mobile-pager-page1-header");
      pageOneHeader.querySelector(".close-button")?.remove();
      mediaPanel.prepend(pageOneHeader);

      let startX = 0;
      let startY = 0;
      let tracking = false;

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
        if (
          Math.abs(dx) < SWIPE_THRESHOLD ||
          Math.abs(dx) < Math.abs(dy) * 1.25
        ) {
          return;
        }

        if (dx < 0) setPage((current) => (current === 0 ? 1 : current));
        if (dx > 0) setPage((current) => (current === 1 ? 0 : current));
      };

      body.addEventListener("touchstart", onTouchStart, { passive: true });
      body.addEventListener("touchend", onTouchEnd, { passive: true });
      window.addEventListener("resize", fitPageOneTitle, { passive: true });

      modal.classList.add("mobile-pager-enabled");
      setPage(0);
      fitPageOneTitle();

      cleanupCurrent = () => {
        body.removeEventListener("touchstart", onTouchStart);
        body.removeEventListener("touchend", onTouchEnd);
        window.removeEventListener("resize", fitPageOneTitle);
        originalClose.classList.remove("mobile-pager-original-close");
        pageOneHeader.remove();
      };
    };

    setupPager();
    media.addEventListener?.("change", setupPager);

    return () => {
      media.removeEventListener?.("change", setupPager);
      clearPager();
    };
  }, [active, modalRef, resetKey, setPage]);

  useEffect(() => {
    if (!active) return;

    const modal = modalRef?.current;
    if (!modal || !window.matchMedia(MOBILE_QUERY).matches) return;
    if (!modal.classList.contains("mobile-pager-enabled")) return;

    const body = modal.querySelector(".modal-body");
    const mediaPanel = body?.querySelector(":scope > .modal-media");
    const contentPanel = body?.querySelector(":scope > .modal-content");

    modal.style.setProperty("--mobile-pager-page", String(page));
    modal.classList.toggle("mobile-pager-page-1", page === 0);
    modal.classList.toggle("mobile-pager-page-2", page === 1);

    if (page === 0 && mediaPanel) mediaPanel.scrollTop = 0;
    if (page === 1 && contentPanel) contentPanel.scrollTop = 0;
  }, [active, modalRef, page]);

  return null;
}

export default MobileProductModalPager;
