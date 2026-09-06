import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import "./MobileMenuContact.css";

function MobileMenuContact() {
  const [panelTarget, setPanelTarget] = useState(null);
  const [lang, setLang] = useState(
    typeof document !== "undefined" && document.documentElement.lang?.toLowerCase().startsWith("sr")
      ? "sr"
      : "en"
  );
  const [supportOpen, setSupportOpen] = useState(false);

  useEffect(() => {
    let frameId;

    const resolveTarget = () => {
      const panel = document.querySelector(".header-next-mobile-panel");

      if (panel) {
        setPanelTarget(panel);
        return;
      }

      frameId = window.requestAnimationFrame(resolveTarget);
    };

    resolveTarget();

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

  useEffect(() => {
    if (!panelTarget) return undefined;

    const observer = new MutationObserver(() => {
      const header = document.querySelector(".header-next");
      if (!header?.classList.contains("is-mobile-open")) {
        setSupportOpen(false);
      }
    });

    const header = document.querySelector(".header-next");
    if (header) {
      observer.observe(header, { attributes: true, attributeFilter: ["class"] });
    }

    return () => observer.disconnect();
  }, [panelTarget]);

  const closeMobileMenu = () => {
    const trigger = document.querySelector(".header-next-menu-trigger.is-open");
    trigger?.click();
  };

  const openFaq = () => {
    const faqButton = Array.from(document.querySelectorAll(".footer-link")).find(
      (button) => button.textContent?.trim() === "FAQ"
    );

    closeMobileMenu();
    window.requestAnimationFrame(() => faqButton?.click());
  };

  if (!panelTarget) return null;

  return createPortal(
    <section
      className={`header-next-mobile-support ${supportOpen ? "is-open" : ""}`}
      aria-label={lang === "sr" ? "Podrška" : "Support"}
    >
      <button
        type="button"
        className="header-next-mobile-support-trigger"
        aria-expanded={supportOpen}
        onClick={() => setSupportOpen((current) => !current)}
      >
        <span>{lang === "sr" ? "Podrška" : "Support"}</span>
        <strong aria-hidden="true">{supportOpen ? "−" : "+"}</strong>
      </button>

      <div className="header-next-mobile-support-panel" aria-hidden={!supportOpen}>
        <button type="button" onClick={openFaq}>
          <span>FAQ</span>
          <strong aria-hidden="true">→</strong>
        </button>

        <a href="mailto:info@playniceshop.me" onClick={closeMobileMenu}>
          <span>{lang === "sr" ? "Kontaktiraj nas" : "Contact Us"}</span>
          <small>info@playniceshop.me</small>
          <strong aria-hidden="true">→</strong>
        </a>
      </div>
    </section>,
    panelTarget
  );
}

export default MobileMenuContact;
