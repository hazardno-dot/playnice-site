import React from "react";
import { trackEvent } from "../../lib/ga";
import "./MobilePartnerSpotlight.css";

const FOREVER_URL =
  "https://foreverliving.com/shop/scg/sr-Cyrl-RS/drinks?fboId=360000920762&categoryId=1&title=Napici";

function MobilePartnerSpotlight({ lang = "sr" }) {
  const copy =
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
        };

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

  return (
    <section className="mobile-partner-spotlight" aria-label="PlayNice partner">
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
    </section>
  );
}

export default MobilePartnerSpotlight;
