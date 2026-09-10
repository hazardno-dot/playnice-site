import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import "./MobileMenuContact.css";

const getActiveLang = () => {
  const storedLang = window.localStorage.getItem("playnice_lang")?.toLowerCase();
  if (storedLang === "sr" || storedLang === "en") return storedLang;

  return document.documentElement.lang?.toLowerCase().startsWith("sr") ? "sr" : "en";
};

function MobileMenuContact() {
  const [panelTarget, setPanelTarget] = useState(null);
  const [discoverTarget, setDiscoverTarget] = useState(null);
  const [lang, setLang] = useState(() =>
    typeof document !== "undefined" ? getActiveLang() : "en"
  );
  const [supportOpen, setSupportOpen] = useState(false);
  const [catalogOpen, setCatalogOpen] = useState(false);

  useEffect(() => {
    setPanelTarget(document.querySelector(".header-next-mobile-panel"));
    setDiscoverTarget(document.querySelector(".header-next-mobile-discover > div"));

    const syncLang = () => setLang(getActiveLang());
    const languageObserver = new MutationObserver(syncLang);

    languageObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["lang"]
    });

    window.addEventListener("storage", syncLang);

    return () => {
      languageObserver.disconnect();
      window.removeEventListener("storage", syncLang);
    };
  }, []);

  useEffect(() => {
    if (!panelTarget) return undefined;

    const trigger = document.querySelector(".header-next-menu-trigger");
    if (!trigger) return undefined;

    const resetSubmenus = () => {
      setSupportOpen(false);
      setCatalogOpen(false);
    };

    trigger.addEventListener("click", resetSubmenus);

    return () => trigger.removeEventListener("click", resetSubmenus);
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
          <span>{lang === "sr" ? "Kontakt" : "Contact"}</span>
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
