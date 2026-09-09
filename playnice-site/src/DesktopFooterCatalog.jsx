import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import "./DesktopFooterCatalog.css";

const getActiveLang = () => {
  const headerLang = document
    .querySelector(".header-next-language span")
    ?.textContent?.trim()
    .toLowerCase();

  if (headerLang === "sr" || headerLang === "en") return headerLang;

  const storedLang = window.localStorage.getItem("playnice_lang")?.toLowerCase();
  if (storedLang === "sr" || storedLang === "en") return storedLang;

  return document.documentElement.lang?.toLowerCase().startsWith("sr") ? "sr" : "en";
};

function DesktopFooterCatalog() {
  const [target, setTarget] = useState(null);
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState(() =>
    typeof document !== "undefined" ? getActiveLang() : "en"
  );

  useEffect(() => {
    let frameId;
    let mountNode = null;

    const resolveTarget = () => {
      const columns = Array.from(document.querySelectorAll(".footer-column"));
      const serviceColumn = columns.find((column) => {
        const heading = column.querySelector("h4")?.textContent?.trim().toLowerCase() || "";
        return heading === "service" || heading === "servis";
      });

      if (!serviceColumn) {
        frameId = window.requestAnimationFrame(resolveTarget);
        return;
      }

      const firstLink = serviceColumn.querySelector(".footer-link");
      if (!firstLink) {
        frameId = window.requestAnimationFrame(resolveTarget);
        return;
      }

      mountNode = document.createElement("div");
      mountNode.className = "desktop-footer-catalog-mount";
      firstLink.insertAdjacentElement("afterend", mountNode);
      setTarget(mountNode);
    };

    resolveTarget();

    const syncLang = () => setLang(getActiveLang());
    const languageObserver = new MutationObserver(syncLang);

    languageObserver.observe(document.body, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["lang", "class"]
    });

    window.addEventListener("storage", syncLang);

    return () => {
      window.cancelAnimationFrame(frameId);
      languageObserver.disconnect();
      window.removeEventListener("storage", syncLang);
      mountNode?.remove();
    };
  }, []);

  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (event) => {
      if (event.target.closest(".desktop-footer-catalog")) return;
      setOpen(false);
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  if (!target) return null;

  return createPortal(
    <div className={`desktop-footer-catalog ${open ? "is-open" : ""}`}>
      <button
        type="button"
        className="footer-link desktop-footer-catalog-trigger"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span>{lang === "sr" ? "Katalog" : "Catalog"}</span>
        <span className="desktop-footer-catalog-chevron" aria-hidden="true">
          {open ? "⌃" : "⌄"}
        </span>
      </button>

      <div className="desktop-footer-catalog-panel" aria-hidden={!open}>
        <a href="/catalog-clean.pdf" download onClick={() => setOpen(false)}>
          <span>English · Light</span>
          <span aria-hidden="true">↓</span>
        </a>
        <a href="/catalog-dark.pdf" download onClick={() => setOpen(false)}>
          <span>English · Dark</span>
          <span aria-hidden="true">↓</span>
        </a>
      </div>
    </div>,
    target
  );
}

export default DesktopFooterCatalog;
