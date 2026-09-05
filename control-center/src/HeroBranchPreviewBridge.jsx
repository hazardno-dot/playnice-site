import { useEffect } from "react";

const LIVE_ORIGIN = "https://www.playniceshop.me";

function toBranchPreview(src) {
  if (!src || src.startsWith("blob:") || src.includes("/api/hero-media-preview?path=")) return src;
  try {
    const url = new URL(src, window.location.origin);
    if (url.origin !== LIVE_ORIGIN) return src;
    if (!url.pathname.startsWith("/hero/")) return src;
    return `/api/hero-media-preview?path=${encodeURIComponent(url.pathname)}&v=${Date.now()}`;
  } catch {
    return src;
  }
}

export default function HeroBranchPreviewBridge() {
  useEffect(() => {
    const mainStage = document.querySelector(".main-stage");
    if (!mainStage) return;

    const rewrite = () => {
      const heading = mainStage.querySelector(".topbar h1");
      if (heading?.textContent?.trim() !== "Hero") return;
      mainStage.querySelectorAll("img").forEach((img) => {
        const next = toBranchPreview(img.src);
        if (next && next !== img.src) img.src = next;
      });
    };

    let raf = 0;
    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(rewrite);
    };

    schedule();
    const observer = new MutationObserver(schedule);
    observer.observe(mainStage, { childList: true, subtree: true, attributes: true, attributeFilter: ["src", "class"] });
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, []);

  return null;
}
