import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { trackEvent } from "./lib/ga";
import "./MobilePartnerSpotlight.css";

const FOREVER_URL =
  "https://foreverliving.com/shop/scg/sr-Cyrl-RS/drinks?fboId=360000920762&categoryId=1&title=Napici";

const getLanguage = () => {
  try {
    return window.localStorage.getItem("playnice_lang") === "en" ? "en" : "sr";
  } catch {
    return "sr";
  }
};

const isHomePath = () => window.location.pathname === "/";

function MobilePartnerSpotlight() {
  const [host, setHost] = useState(null);
  const [lang, setLang] = useState(() => getLanguage());
  const [visible, setVisible] = useState(
    () => typeof window !== "undefined" && window.innerWidth <= 640 && isHomePath()
  );

  useEffect(() => {
    const sync = () => {
      setLang(getLanguage());
      setVisible(window.innerWidth <= 640 && isHomePath());
    };

    const ensureHost = () => {
      const closing = document.querySelector(".closing-section");
      const footer = document.querySelector(".site-footer");
      const anchor = closing || footer;

      if (!anchor) {
        setHost(null);
        return;
      }

      let nextHost = document.querySelector(".mobile-partner-spotlight-host");
      if (!nextHost) {
        nextHost = document.createElement("div");
        nextHost.className = "mobile-partner-spotlight-host";
        anchor.parentNode?.insertBefore(nextHost, anchor);
      } else if (nextHost.nextElementSibling !== anchor) {
        anchor.parentNode?.insertBefore(nextHost, anchor);
      }

      setHost(nextHost);
    };

    const run = () => {
      sync();
      ensureHost();
    };

    run();

    const observer = new MutationObserver(run);
    observer.observe(document.body, { childList: true, subtree: true });

    window.addEventListener("resize", sync);
    window.addEventListener("popstate", run);
    window.addEventListener("storage", sync);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", sync);
      window.removeEventListener("popstate", run);
      window.removeEventListener("storage", sync);
      document.querySelector(".mobile-partner-spotlight-host")?.remove();
    };
  }, []);

  const copy = useMemo(
    () =>
      lang === "sr"
        ? {
            eyebrow: "PLAYNICE PARTNER",
            sponsored: "SPONZORISANO",
            title: "Forever Living",
            subtitle: "Aloe vera napici",
            body: "Istraži Forever Living aloe vera napitke — diskretno izdvojeno za PlayNice zajednicu.",
            cta: "Pogledaj ponudu",
          }
        : {
            eyebrow: "PLAYNICE PARTNER",
            sponsored: "SPONSORED",
            title: "Forever Living",
            subtitle: "Aloe vera drinks",
            body: "Explore Forever Living aloe vera drinks — a discreet partner pick for the PlayNice community.",
            cta: "Explore range",
          },
    [lang]
  );

  if (!host || !visible) return null;

  const handleClick = () => {
    trackEvent("sponsored_ad_click", {
      partner: "forever_living",
      sellerId: "360000920762",
      campaign: "aloe_drinks",
      placement: "mobile_partner_spotlight",
      lang,
      view: "home",
    });
  };

  return createPortal(
    <section className="mobile-partner-spotlight" aria-label={lang === "sr" ? "PlayNice partner" : "PlayNice partner"}>
      <a
        className="mobile-partner-spotlight-card"
        href={FOREVER_URL}
        target="_blank"
        rel="sponsored noopener noreferrer"
        onClick={handleClick}
      >
        <div className="mobile-partner-spotlight-head">
          <span className="mobile-partner-spotlight-eyebrow">{copy.eyebrow}</span>
          <span className="mobile-partner-spotlight-sponsored">{copy.sponsored}</span>
        </div>

        <div className="mobile-partner-spotlight-brand">
          <div className="mobile-partner-spotlight-copy">
            <p>{copy.title}</p>
            <h3>{copy.subtitle}</h3>
            <span>{copy.body}</span>
          </div>

          <img
            src="/partners/forever-logo.png"
            alt="Forever Living"
            loading="lazy"
            decoding="async"
          />
        </div>

        <div className="mobile-partner-spotlight-cta">
          <span>{copy.cta}</span>
          <span aria-hidden="true">↗</span>
        </div>
      </a>
    </section>,
    host
  );
}

export default MobilePartnerSpotlight;
