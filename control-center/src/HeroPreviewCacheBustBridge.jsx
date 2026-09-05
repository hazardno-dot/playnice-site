import { useEffect } from "react";

const HERO_PREVIEW_HOSTS = new Set(["www.playniceshop.me", "playniceshop.me"]);

export default function HeroPreviewCacheBustBridge() {
  useEffect(() => {
    const mainStage = document.querySelector(".main-stage");
    if (!mainStage) return undefined;

    const version = String(Date.now());

    const refreshHeroPreviewImages = () => {
      const heading = mainStage.querySelector(".topbar h1");
      if (heading?.textContent?.trim() !== "Hero") return;

      mainStage.querySelectorAll(".hero-manager img").forEach((image) => {
        const raw = image.getAttribute("src") || "";
        if (!raw || raw.startsWith("blob:") || raw.startsWith("data:")) return;
        if (raw.startsWith("/api/hero-media-preview")) return;

        let url;
        try {
          url = new URL(raw, window.location.origin);
        } catch {
          return;
        }

        if (!HERO_PREVIEW_HOSTS.has(url.hostname)) return;
        if (!url.pathname.startsWith("/hero/")) return;

        const next = `/api/hero-media-preview?path=${encodeURIComponent(url.pathname)}&ccv=${version}`;
        if (raw === next) return;

        image.setAttribute("src", next);
      });
    };

    let raf = 0;
    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(refreshHeroPreviewImages);
    };

    schedule();
    const observer = new MutationObserver(schedule);
    observer.observe(mainStage, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["src", "class"],
    });

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, []);

  return null;
}
