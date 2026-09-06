import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import "./MobileMenuContact.css";

function MobileMenuContact() {
  const [target, setTarget] = useState(null);
  const [lang, setLang] = useState(
    typeof document !== "undefined" && document.documentElement.lang?.toLowerCase().startsWith("sr")
      ? "sr"
      : "en"
  );

  useEffect(() => {
    let frameId;

    const resolveTarget = () => {
      const panel = document.querySelector(".header-next-mobile-panel");
      if (panel) {
        setTarget(panel);
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

  if (!target) return null;

  return createPortal(
    <section className="header-next-mobile-contact" aria-label={lang === "sr" ? "Kontakt" : "Contact Us"}>
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
    target
  );
}

export default MobileMenuContact;
