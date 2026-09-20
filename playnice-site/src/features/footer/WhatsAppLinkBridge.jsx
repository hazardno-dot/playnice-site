import { useEffect } from "react";

const WHATSAPP_HREF = "https://wa.me/38263232336";

export default function WhatsAppLinkBridge() {
  useEffect(() => {
    const syncLinks = () => {
      document
        .querySelectorAll('a[aria-label="PlayNice WhatsApp"]')
        .forEach((link) => {
          if (link.getAttribute("href") !== WHATSAPP_HREF) {
            link.setAttribute("href", WHATSAPP_HREF);
          }
        });
    };

    syncLinks();

    const observer = new MutationObserver(syncLinks);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  return null;
}
