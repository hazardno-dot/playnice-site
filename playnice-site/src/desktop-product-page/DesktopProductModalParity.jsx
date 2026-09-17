import React from "react";
import { productCopy } from "../data/products/productCopy";
import { getCharacterVisual } from "../data/products/characterVisuals";
import "./DesktopProductModalParity.css";

export default function DesktopProductModalParity({ product, lang = "sr" }) {
  if (!product) return null;

  const copy = productCopy[product.name] || {};
  const miniTag = copy.miniTag?.[lang] || "";
  const whyChoose = copy.whyChoose?.[lang] || "";
  const dominantNotes = Array.isArray(copy.dominantNotes?.[lang])
    ? copy.dominantNotes[lang]
    : [];
  const tags = Array.isArray(copy.tags?.[lang]) ? copy.tags[lang] : [];

  if (!miniTag && !whyChoose && !dominantNotes.length && !tags.length) return null;

  return (
    <section className="desktop-product-modal-parity" aria-label={lang === "sr" ? "Brzi detalji parfema" : "Fragrance quick facts"}>
      <div className="desktop-product-modal-parity__inner">
        <div className="desktop-product-modal-parity__intro">
          <span className="desktop-product-modal-parity__kicker">PLAYNICE DETAILS</span>
          {miniTag ? <div className="desktop-product-modal-parity__tag">{miniTag}</div> : null}
          <h2>{lang === "sr" ? "Ono bitno, bez kataloškog jezika." : "The useful part, without catalogue language."}</h2>
        </div>

        <div className="desktop-product-modal-parity__grid">
          {dominantNotes.length ? (
            <article>
              <span>{lang === "sr" ? "DOMINANTNE NOTE" : "DOMINANT NOTES"}</span>
              <strong>{dominantNotes.join(" · ")}</strong>
            </article>
          ) : null}

          {whyChoose ? (
            <article>
              <span>{lang === "sr" ? "ZAŠTO GA BIRAJU" : "WHY PEOPLE CHOOSE IT"}</span>
              <strong>{whyChoose}</strong>
            </article>
          ) : null}

          {tags.length ? (
            <article className="desktop-product-modal-parity__character-card">
              <span>{lang === "sr" ? "KARAKTER" : "CHARACTER"}</span>
              <div className="desktop-product-modal-parity__character-grid">
                {tags.map((tag, index) => (
                  <div className="desktop-product-modal-parity__character-item" key={tag}>
                    <span className="desktop-product-modal-parity__character-visual" aria-hidden="true">
                      <img src={getCharacterVisual(tag, index)} alt="" loading="lazy" decoding="async" />
                    </span>
                    <strong>{tag}</strong>
                  </div>
                ))}
              </div>
            </article>
          ) : null}
        </div>
      </div>
    </section>
  );
}
