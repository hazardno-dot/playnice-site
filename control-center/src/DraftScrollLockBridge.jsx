import { useEffect } from "react";

export default function DraftScrollLockBridge() {
  useEffect(() => {
    const body = document.body;
    const html = document.documentElement;
    let locked = false;
    let previousBodyOverflow = "";
    let previousHtmlOverflow = "";

    const sync = () => {
      const shouldLock = Boolean(document.querySelector(".draft-manager-backdrop"));
      if (shouldLock === locked) return;

      if (shouldLock) {
        previousBodyOverflow = body.style.overflow;
        previousHtmlOverflow = html.style.overflow;
        body.style.overflow = "hidden";
        html.style.overflow = "hidden";
        locked = true;
      } else {
        body.style.overflow = previousBodyOverflow;
        html.style.overflow = previousHtmlOverflow;
        locked = false;
      }
    };

    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      if (locked) {
        body.style.overflow = previousBodyOverflow;
        html.style.overflow = previousHtmlOverflow;
      }
    };
  }, []);

  return null;
}
