import { useEffect } from "react";

function isSaveDraftButton(target) {
  const button = target?.closest?.("button");
  if (!button) return false;
  const text = String(button.textContent || "").trim().toLowerCase();
  return text === "save draft" || text === "saving…" || text === "saving...";
}

export default function SaveDraftScrollBridge() {
  useEffect(() => {
    let pending = false;
    let timeoutId = 0;
    let frameId = 0;

    const clearPending = () => {
      pending = false;
      window.clearTimeout(timeoutId);
      timeoutId = 0;
    };

    const onClick = (event) => {
      if (!isSaveDraftButton(event.target)) return;
      pending = true;
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(clearPending, 15000);
    };

    const maybeScroll = () => {
      if (!pending) return;
      const readOnly = document.querySelector(".product-detail:not(.edit-mode)");
      const savedBadge = readOnly?.querySelector(".draft-badge");
      if (!readOnly || !savedBadge) return;

      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(() => {
        readOnly.scrollIntoView({ behavior: "smooth", block: "start" });
        clearPending();
      });
    };

    document.addEventListener("click", onClick, true);
    const root = document.querySelector(".main-stage") || document.body;
    const observer = new MutationObserver(maybeScroll);
    observer.observe(root, { childList: true, subtree: true });

    return () => {
      document.removeEventListener("click", onClick, true);
      observer.disconnect();
      window.clearTimeout(timeoutId);
      window.cancelAnimationFrame(frameId);
    };
  }, []);

  return null;
}
