import "./TheNoteMap.css";

const NOTE_LIBRARY = {
  lemon: {
    sr: "Limun",
    en: "Lemon",
    image: "/note-map/lemon.webp",
    fallback: "🍋",
  },
  ginger: {
    sr: "Đumbir",
    en: "Ginger",
    image: "/note-map/ginger.webp",
    fallback: "🫚",
  },
  bergamot: {
    sr: "Bergamot",
    en: "Bergamot",
    image: "/note-map/bergamot.webp",
    fallback: "🍋",
  },
  "herbal-notes": {
    sr: "Biljne note",
    en: "Herbal notes",
    image: "/note-map/herbal-notes.webp",
    fallback: "🌿",
  },
  cypress: {
    sr: "Čempres",
    en: "Cypress",
    image: "/note-map/cypress.webp",
    fallback: "🌲",
  },
  mint: {
    sr: "Menta",
    en: "Mint",
    image: "/note-map/mint.webp",
    fallback: "🌱",
  },
  "ozonic-notes": {
    sr: "Ozonske note",
    en: "Ozonic notes",
    image: "/note-map/ozonic-notes.webp",
    fallback: "🌬️",
  },
  amber: {
    sr: "Amber",
    en: "Amber",
    image: "/note-map/amber.webp",
    fallback: "🟠",
  },
  moss: {
    sr: "Mahovina",
    en: "Moss",
    image: "/note-map/moss.webp",
    fallback: "🌿",
  },
};

const NOTE_LEVELS = [
  {
    key: "top",
    sr: "GORNJE NOTE",
    en: "TOP NOTES",
  },
  {
    key: "heart",
    sr: "SRCE MIRISA",
    en: "HEART NOTES",
  },
  {
    key: "base",
    sr: "BAZNE NOTE",
    en: "BASE NOTES",
  },
];

const getNoteData = (noteKey) =>
  NOTE_LIBRARY[noteKey] || {
    sr: noteKey,
    en: noteKey,
    image: "",
    fallback: "✦",
  };

export default function TheNoteMap({
  notes,
  lang = "sr",
  open = false,
  onToggle,
}) {
  const hasNotes = NOTE_LEVELS.some(
    ({ key }) => Array.isArray(notes?.[key]) && notes[key].length > 0
  );

  if (!hasNotes) return null;

  return (
  <div className={`the-note-map ${open ? "is-open" : ""}`}>
    <button
      type="button"
      className="the-note-map__trigger"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onToggle?.();
      }}
      aria-expanded={open}
      aria-controls="product-note-map-panel"
    >
      <span>THE NOTE MAP</span>
      <strong aria-hidden="true">{open ? "×" : "+"}</strong>
    </button>

    <div
      id="product-note-map-panel"
      className="the-note-map__panel"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="the-note-map__levels">
        {NOTE_LEVELS.map((level, rowIndex) => {
          const levelNotes = notes?.[level.key] || [];

          if (!levelNotes.length) return null;

          return (
            <div className="the-note-map__level" key={level.key}>
              {levelNotes.map((noteKey, noteIndex) => {
                const note = getNoteData(noteKey);
                const noteLabel = note[lang] || note.en;

                return (
                  <span
                    className="the-note-map__note"
                    key={noteKey}
                    role="img"
                    aria-label={noteLabel}
                    style={{
                      "--note-delay": `${
                        rowIndex * 220 + noteIndex * 75
                      }ms`,
                    }}
                  >
                    <span className="the-note-map__thumb">
  <span
    className={`the-note-map__fallback ${
      note.image ? "" : "is-visible"
    }`}
  >
    {note.fallback}
  </span>

  {note.image && (
    <img
      src={note.image}
      alt=""
      loading="lazy"
      onError={(event) => {
        event.currentTarget.style.display = "none";

        const fallback =
          event.currentTarget.previousElementSibling;

        fallback?.classList.add("is-visible");
      }}
    />
  )}
</span>

                    <span className="the-note-map__name">
                      {noteLabel}
                    </span>

                  </span>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  </div>
);
}