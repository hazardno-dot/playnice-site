import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import "./MobileMenuContact.css";

function MobileMenuContact() {
  const [panelTarget, setPanelTarget] = useState(null);
  const [discoverTarget, setDiscoverTarget] = useState(null);
  const [lang, setLang] = useState(
    typeof document !== "undefined" && document.documentElement.lang?.toLowerCase().startsWith("sr")
      ? "sr"
      : "en"
  );

  useEffect(() => {
    let frameId;

    const resolveTargets = () => {
      const panel = document.querySelector(".header-next-mobile-panel");
      const discover = document.querySelector(".header-next-mobile-discover > div");

      if (panel) setPanelTarget(panel);
      if (discover) setDiscoverTarget(discover);

      if (!panel || !discover) {
        frameId = window.requestAnimationFrame(resolveTargets);
      }
    };

    resolveTargets();

    const languageObserver = new MutationObserver(() => {
      setLang(
        document.documentElement.lang?.toLowerCase().startsWith("sr") ? "sr" : "en"
      );
    });

    languageObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["lang"]
    });

    return () => {
      window.cancelAnimationFrame(frameId);
      languageObserver.disconnect();
    };
  }, []);

  const openFaq = () => {
    const faqButton = Array.from(document.querySelectorAll(".footer-link")).find(
      (button) => button.textContent?.trim() === "FAQ"
    );

    faqButton?.click();
  };

  if (!panelTarget && !discoverTarget) return null;

  return (
    <>
      {discoverTarget &&
        createPortal(
          <button type="button" onClick={openFaq}>
            FAQ
          </button>,
          discoverTarget
        )}

      {panelTarget &&
        createPortal(
          <section
            className="header-next-mobile-contact"
            aria-label={lang === "sr" ? "Kontakt" : "Contact Us"}
          >
            <p>{lang === "sr" ? "Kontakt" : "Contact Us"}</p>
            <div className="header-next-mobile-contact-links">
              <a href="mailto:info@playniceshop.me">info@playniceshop.me</a>
              <a
                href="https://www.instagram.com/playnice.me/"
                target="_blank"
                rel="noreferrer"
              >
                @playnice.me
              </a>
            </div>
          </section>,
          panelTarget
        )}
    </>
  );
}

export default MobileMenuContact;
