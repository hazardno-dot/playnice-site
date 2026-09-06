import { useEffect } from "react";

const MOBILE_QUERY = "(max-width: 640px)";
const TITLE_SELECTOR = ".discovery-showcase-card h3";

function MobileDiscoveryTextPolish() {
  useEffect(() => {
    const media = window.matchMedia(MOBILE_QUERY);

    const syncTitles = () => {
      document.querySelectorAll(TITLE_SELECTOR).forEach((title) => {
        const original = title.dataset.mobileDiscoveryOriginal || title.textContent || "";

        if (!title.dataset.mobileDiscoveryOriginal) {
          title.dataset.mobileDiscoveryOriginal = original;
        }

        if (media.matches) {
          const mobileText = original.trim().replace(/[.]$/, "");
          if (title.textContent !== mobileText) title.textContent = mobileText;
        } else if (title.textContent !== original) {
          title.textContent = original;
        }
      });
    };

    syncTitles();

    const observer = new MutationObserver(syncTitles);
    observer.observe(document.body, { childList: true, subtree: true });

    media.addEventListener?.("change", syncTitles);

    return () => {
      observer.disconnect();
      media.removeEventListener?.("change", syncTitles);

      document.querySelectorAll(TITLE_SELECTOR).forEach((title) => {
        const original = title.dataset.mobileDiscoveryOriginal;
        if (original) title.textContent = original;
        delete title.dataset.mobileDiscoveryOriginal;
      });
    };
  }, []);

  return null;
}

export default MobileDiscoveryTextPolish;
