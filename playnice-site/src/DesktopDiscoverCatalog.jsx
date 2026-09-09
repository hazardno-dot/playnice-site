import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import "./DesktopDiscoverCatalog.css";

function DesktopDiscoverCatalog() {
  const [panelTarget, setPanelTarget] = useState(null);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [lang, setLang] = useState(
    typeof document !== "undefined" && document.documentElement.lang?.toLowerCase().startsWith("sr")
      ? "sr"
      : "en"
  );

  useEffect(() => {
    let frameId;
    let hiddenButton = null;

    const resolveTarget = () => {
      const panel = document.querySelector(".header-next-discover-panel");

      if (!panel) {
        frameId = window.requestAnimationFrame(resolveTarget);
        return;
      }

      const buttons = Array.from(panel.querySelectorAll(":scope > button"));
      hiddenButton = buttons.find((button) => {
        const text = button.textContent?.trim().toLowerCase() || "";
        return text.includes("scent request") || text.includes("predloži parfem");
      });

      if (hiddenButton) {
        hiddenButton.dataset.desktopCatalogReplaced = "true";
        hiddenButton.style.display = "none";
      }

      setPanelTarget(panel);
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

      if (hiddenButton) {
        delete hiddenButton.dataset.desktopCatalogReplaced;
        hiddenButton.style.display = "";
      }
    };
  }, []);

  useEffect(() => {
    if (!panelTarget) return undefined;

    const discover = panelTarget.closest(".header-next-discover");
    if (!discover) return undefined;

    const observer = new MutationObserver(() => {
      if (!discover.classList.contains("is-open")) {
        setCatalogOpen(false);
      }
    });

    observer.observe(discover, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, [panelTarget]);

  const closeDiscover = () => {
    const trigger = document.querySelector(".header-next-discover-trigger");
    const discover = trigger?.closest(".header-next-discover");

    if (discover?.classList.contains("is-open")) {
      trigger?.click();
    }
  };

  if (!panelTarget) return null;

  return createPortal(
    <section className={`header-next-desktop-catalog ${catalogOpen ? "is-open" : ""}`}>
      <button
        type="button"
        className="header-next-desktop-catalog-trigger"
        aria-expanded={catalogOpen}
        onClick={() => setCatalogOpen((current) => !current)}
      >
        <span>{lang === "sr" ? "Katalog" : "Catalog"}</span>
        <span className="header-next-desktop-catalog-arrow" aria-hidden="true">
          {catalogOpen ? "⌃" : "→"}
        </span>
      </button>

      <div className="header-next-desktop-catalog-panel" aria-hidden={!catalogOpen}>
        <a href="/catalog-clean.pdf" download onClick={closeDiscover}>
          <span>English · Light</span>
          <span aria-hidden="true">↓</span>
        </a>
        <a href="/catalog-dark.pdf" download onClick={closeDiscover}>
          <span>English · Dark</span>
          <span aria-hidden="true">↓</span>
        </a>
      </div>
    </section>,
    panelTarget
  );
}

export default DesktopDiscoverCatalog;
