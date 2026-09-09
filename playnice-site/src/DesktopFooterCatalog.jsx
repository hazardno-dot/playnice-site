import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import "./DesktopFooterCatalog.css";

function DesktopFooterCatalog() {
  const [target, setTarget] = useState(null);
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState(
    typeof document !== "undefined" && document.documentElement.lang?.toLowerCase().startsWith("sr")
      ? "sr"
      : "en"
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
      mountNode?.remove();
    };
  }, []);

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
        <a href="/catalog-clean.pdf" download>
          <span>English · Light</span>
          <span aria-hidden="true">↓</span>
        </a>
        <a href="/catalog-dark.pdf" download>
          <span>English · Dark</span>
          <span aria-hidden="true">↓</span>
        </a>
      </div>
    </div>,
    target
  );
}

export default DesktopFooterCatalog;
