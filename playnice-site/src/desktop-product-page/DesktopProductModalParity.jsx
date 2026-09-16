import React from "react";
import { productCopy } from "../data/products/productCopy";
import "./DesktopProductModalParity.css";

const CHARACTER_VISUALS = [
  { match: /clean|čist/i, image: "/note-map/white-musk.webp" },
  { match: /night|noć|dark|tamn/i, image: "/note-map/incense.webp" },
  { match: /wood|drven/i, image: "/note-map/cedarwood.webp" },
  { match: /citrus|citrusn|fresh|svež/i, image: "/note-map/bergamot.webp" },
  { match: /floral|cvet/i, image: "/note-map/rose.webp" },
  { match: /soft|mek/i, image: "/note-map/musk.webp" },
  { match: /warm|topl/i, image: "/note-map/amber.webp" },
  { match: /spic|začin/i, image: "/note-map/pink-pepper.webp" },
  { match: /sweet|slatk/i, image: "/note-map/vanilla.webp" },
  { match: /rich|bogat|elegant|signature|potpis/i, image: "/note-map/sandalwood.webp" },
  { match: /aquatic|marine|vod|morsk/i, image: "/note-map/sea-salt.webp" },
  { match: /unisex/i, image: "/note-map/iris.webp" },
];

const getCharacterVisual = (tag, index) => {
  const matched = CHARACTER_VISUALS.find((item) => item.match.test(String(tag || "")));
  if (matched) return matched.image;

  const fallbacks = [
    "/note-map/bergamot.webp",
    "/note-map/cedarwood.webp",
    "/note-map/iris.webp",
  ];

  return fallbacks[index % fallbacks.length];
};

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
