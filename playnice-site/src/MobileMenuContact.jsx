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
  const [supportOpen, setSupportOpen] = useState(false);
  const [catalogOpen, setCatalogOpen] = useState(false);

  useEffect(() => {
    let frameId;

    const resolveTarget = () => {
      const panel = document.querySelector(".header-next-mobile-panel");
      const discover = document.querySelector(".header-next-mobile-discover > div");

      if (panel && discover) {
        setPanelTarget(panel);
        setDiscoverTarget(discover);
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
        setCatalogOpen(false);
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

  if (!panelTarget || !discoverTarget) return null;

  const catalog = createPortal(
    <section className={`header-next-mobile-catalog ${catalogOpen ? "is-open" : ""}`}>
      <button
        type="button"
        className="header-next-mobile-catalog-trigger"
        aria-expanded={catalogOpen}
        onClick={() => {
          setCatalogOpen((current) => !current);
          setSupportOpen(false);
        }}
      >
        <span>{lang === "sr" ? "Katalog" : "Catalog"}</span>
        <svg
          className="header-next-mobile-catalog-chevron"
          viewBox="0 0 16 16"
          aria-hidden="true"
        >
          <path d="M4.75 6.25 8 9.5l3.25-3.25" />
        </svg>
      </button>

      <div className="header-next-mobile-catalog-panel" aria-hidden={!catalogOpen}>
        <a href="/catalog-clean.pdf" download onClick={closeMobileMenu}>
          <span>English · Light</span>
        </a>
        <a href="/catalog-dark.pdf" download onClick={closeMobileMenu}>
          <span>English · Dark</span>
        </a>
      </div>
    </section>,
    discoverTarget
  );

  const support = createPortal(
    <section
      className={`header-next-mobile-support ${supportOpen ? "is-open" : ""}`}
      aria-label={lang === "sr" ? "Podrška" : "Support"}
    >
      <button
        type="button"
        className="header-next-mobile-support-trigger"
        aria-expanded={supportOpen}
        onClick={() => {
          setSupportOpen((current) => !current);
          setCatalogOpen(false);
        }}
      >
        <span className="header-next-mobile-support-label">
          <span>{lang === "sr" ? "Podrška" : "Support"}</span>
          <svg
            className="header-next-mobile-support-chevron"
            viewBox="0 0 16 16"
            aria-hidden="true"
          >
            <path d="M4.75 6.25 8 9.5l3.25-3.25" />
          </svg>
        </span>
      </button>

      <div className="header-next-mobile-support-panel" aria-hidden={!supportOpen}>
        <button type="button" onClick={openFaq}>
          <span>FAQ</span>
        </button>

        <a href="mailto:info@playniceshop.me" onClick={closeMobileMenu}>
          <span>Contact</span>
        </a>
      </div>
    </section>,
    panelTarget
  );

  return (
    <>
      {catalog}
      {support}
    </>
  );
}

export default MobileMenuContact;
