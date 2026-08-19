import React, { useEffect, useMemo, useState } from "react";
import "./Exhibition.css";
import { exhibitionItems } from "./data/exhibition";

const getText = (value, lang) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value[lang] || value.en || value.sr || "";
};

const EXHIBITION_PERIODS = [
  { id: "feb-apr-2026", label: "FEB — APR", year: 2026 },
  { id: "may-aug-2026", label: "MAY — AUG", year: 2026 },
  { id: "sep-dec-2026", label: "SEP — DEC", year: 2026 },
];

const DEFAULT_PERIOD = "may-aug-2026";

function Exhibition({ lang = "en", onSeeLive }) {
  const [activeIndex, setActiveIndex] = useState(null);

  const publishedItems = useMemo(
    () =>
      exhibitionItems.filter(
        (item) => item.published !== false && item.status !== "active"
      ),
    []
  );

  const availablePeriods = useMemo(() => {
    const periodIds = new Set(
      publishedItems.map((item) => item.period || DEFAULT_PERIOD)
    );

    return EXHIBITION_PERIODS.filter((period) => periodIds.has(period.id));
  }, [publishedItems]);

  const [activePeriod, setActivePeriod] = useState(
    () =>
      availablePeriods[availablePeriods.length - 1]?.id ||
      DEFAULT_PERIOD
  );

  useEffect(() => {
    if (!availablePeriods.some((period) => period.id === activePeriod)) {
      setActivePeriod(
        availablePeriods[availablePeriods.length - 1]?.id ||
          DEFAULT_PERIOD
      );
    }
  }, [activePeriod, availablePeriods]);

  const copy =
    lang === "sr"
      ? {
          eyebrow: "PLAYNICE ARHIVA",
          title: "STILL GREAT IDEAS.",
          line1: "Kampanja je završena.",
          line2: "Ideja nije.",
          archive: "Vizuelna arhiva",
          close: "Zatvori",
          previous: "Prethodno",
          next: "Sljedeće",
          download: "Preuzmi original",
          open: "Otvori",
        }
      : {
          eyebrow: "PLAYNICE ARCHIVE",
          title: "STILL GREAT IDEAS.",
          line1: "The campaign is over.",
          line2: "The idea isn't.",
          archive: "Visual archive",
          close: "Close",
          previous: "Previous",
          next: "Next",
          download: "Download original",
          open: "Open",
        };

  const exhibits = useMemo(
    () =>
      publishedItems
        .filter((item) => (item.period || DEFAULT_PERIOD) === activePeriod)
        .flatMap((item) =>
          item.assets.map((asset) => ({
          ...asset,
          campaignId: item.id,
          title: item.title,
          year: item.year,
          kind: item.kind,
          status: item.status,
          label: getText(item.label, lang),
          line: getText(item.line, lang),
        }))
      ),
    [activePeriod, lang, publishedItems]
  );

  const activePeriodMeta =
    availablePeriods.find((period) => period.id === activePeriod) ||
    EXHIBITION_PERIODS.find((period) => period.id === DEFAULT_PERIOD);

  useEffect(() => {
    setActiveIndex(null);
  }, [activePeriod]);

  useEffect(() => {
    document.body.classList.add("exhibition-active");

    return () => {
      document.body.classList.remove("exhibition-active");
    };
  }, []);

  const active = activeIndex === null ? null : exhibits[activeIndex];

  const move = (direction) => {
    setActiveIndex((current) => {
      if (current === null || !exhibits.length) return current;
      return (current + direction + exhibits.length) % exhibits.length;
    });
  };

  useEffect(() => {
    if (activeIndex === null) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setActiveIndex(null);
      if (event.key === "ArrowLeft") move(-1);
      if (event.key === "ArrowRight") move(1);
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeIndex, exhibits.length]);

  return (
    <main className="exhibition-page">
      <section className="exhibition-intro" aria-labelledby="exhibition-title">
        <p className="exhibition-eyebrow">{copy.eyebrow}</p>

        <h1 id="exhibition-title">{copy.title}</h1>

        <p className="exhibition-manifesto">
          <span>{copy.line1}</span>
          <span>{copy.line2}</span>
        </p>

        <div className="exhibition-index exhibition-index--periods">
          <span>{copy.archive}</span>

          <div className="exhibition-periods" aria-label="Exhibition period">
            {availablePeriods.map((period) => (
              <button
                key={period.id}
                type="button"
                className={`exhibition-period${
                  period.id === activePeriod ? " is-active" : ""
                }`}
                onClick={() => setActivePeriod(period.id)}
                aria-pressed={period.id === activePeriod}
              >
                {period.label}
              </button>
            ))}
          </div>

          <span>{activePeriodMeta?.year || 2026}</span>
        </div>
      </section>

      <section className="exhibition-wall" aria-label={copy.archive}>
        {exhibits.map((item, index) => (
          <button
            className={`exhibition-tile exhibition-tile--${(index % 5) + 1}`}
            key={item.id}
            type="button"
            onClick={() => setActiveIndex(index)}
            aria-label={`${copy.open}: ${item.title}`}
          >
            {item.type === "video" ? (
              <video src={item.src} muted playsInline preload="metadata" />
            ) : (
              <img src={item.src} alt={item.alt || item.title} loading="lazy" />
            )}

            <span className="exhibition-tile-shade" />

            <span className="exhibition-tile-meta">
              <span>
                <strong>{item.title}</strong>
                <small>{item.label}</small>
              </span>
              <small>{item.year}</small>
            </span>
          </button>
        ))}
      </section>

      <section className="exhibition-outro">
        <span className="exhibition-outro-kicker">
          {lang === "sr" ? "KRAJ IZLOŽBE" : "END OF EXHIBITION"}
        </span>

        <button
          type="button"
          className="exhibition-outro-link"
          onClick={onSeeLive}
        >
          {lang === "sr" ? "Pogledaj šta je sada aktuelno" : "See what’s live now"}
          <span aria-hidden="true">→</span>
        </button>
      </section>

      {active && (
        <div
          className="exhibition-viewer"
          role="dialog"
          aria-modal="true"
          aria-label={active.title}
        >
          <button
            className="exhibition-viewer-close"
            type="button"
            onClick={() => setActiveIndex(null)}
            aria-label={copy.close}
          >
            ×
          </button>

          <button
            className="exhibition-viewer-nav exhibition-viewer-nav--prev"
            type="button"
            onClick={() => move(-1)}
            aria-label={copy.previous}
          >
            ←
          </button>

          <div className="exhibition-viewer-stage">
            {active.type === "video" ? (
              <video src={active.src} controls autoPlay playsInline />
            ) : (
              <img src={active.src} alt={active.alt || active.title} />
            )}
          </div>

          <button
            className="exhibition-viewer-nav exhibition-viewer-nav--next"
            type="button"
            onClick={() => move(1)}
            aria-label={copy.next}
          >
            →
          </button>

          <div className="exhibition-viewer-footer">
            <div>
              <strong>{active.title}</strong>
              <span>
                {active.label} · {active.year}
              </span>
              {active.line && <em>{active.line}</em>}
            </div>

            <div className="exhibition-viewer-counter">
              {String(activeIndex + 1).padStart(2, "0")} /{" "}
              {String(exhibits.length).padStart(2, "0")}
            </div>

            <a href={active.src} download>
              ↓ {copy.download}
            </a>
          </div>
        </div>
      )}
    </main>
  );
}

export default Exhibition;