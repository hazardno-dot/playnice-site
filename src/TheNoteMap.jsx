import { useId, useState } from "react";
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
  arctical: {
    sr: "Arctical™",
    en: "Arctical™",
    image: "/note-map/arctical.webp",
    fallback: "❄️",
  },
};

const NOTE_SR = {
  mandarin: "Mandarina",
  cedrat: "Cedrat",
  cardamom: "Kardamom",
  lavender: "Lavanda",
  "orange-blossom": "Cvet narandže",
  rose: "Ruža",
  cedarwood: "Kedar",
  patchouli: "Pačuli",
  pineapple: "Ananas",
  "green-apple": "Zelena jabuka",
  oakmoss: "Hrastova mahovina",
  vanilla: "Vanila",
  caramel: "Karamela",
  "dry-woods": "Suve drvene note",
  ambergris: "Siva ambra",
  apple: "Jabuka",
  birch: "Breza",
  musk: "Mošus",
  "woody-notes": "Drvene note",
  "fresh-spices": "Sveži začini",
  orange: "Narandža",
  cinnamon: "Cimet",
  neroli: "Neroli",
  ambroxan: "Ambroksan",
  "black-tea": "Crni čaj",
  "guaiac-wood": "Gvajakovo drvo",
  citruses: "Citrusne note",
  "flower-prism": "Cvetna prizma",
  stardust: "Zvezdana prašina",
  "velvet-wood": "Baršunasto drvo",
  jasmine: "Jasmin",
  lime: "Limeta",
  iris: "Iris",
  sandalwood: "Sandalovina",
  whiskey: "Viski",
  "tonka-bean": "Tonka",
  cashmeran: "Kašmeran",
  styrax: "Stiraks",
  benzoin: "Benzoinska smola",
  grapefruit: "Grejpfrut",
  geranium: "Geranijum",
  vetiver: "Vetiver",
  "pink-pepper": "Ružičasti biber",
  saffron: "Šafran",
  tobacco: "Duvan",
  olibanum: "Tamjan",
  sage: "Žalfija",
  "juniper-berries": "Bobice kleke",
  amberwood: "Amberwood",
  praline: "Pralina",
  "candied-fruits": "Kandirano voće",
  "white-flowers": "Belo cveće",
  "coffee-arabica": "Arabika kafa",
  nutmeg: "Muškatni oraščić",
  rosyfolia: "Rosyfolia",
  mahonial: "Mahonial",
  "maple-wood": "Javorovo drvo",
  cocoapulse: "Cocoapulse",
  ambrofix: "Ambrofix",
  "clary-sage": "Muškatna žalfija",
  labdanum: "Labdanum",
  thyme: "Majčina dušica",
  "black-currant": "Crna ribizla",
  leather: "Koža",
  honey: "Med",
  oud: "Oud",
  violet: "Ljubičica",
  coconut: "Kokos",
  "ylang-ylang": "Ylang-ylang",
  hibiscus: "Hibiskus",
  "white-rum": "Beli rum",
  "sugar-cane": "Šećerna trska",
  apricot: "Kajsija",
  basil: "Bosiljak",
  "carrot-seeds": "Seme šargarepe",
  fig: "Smokva",
  dates: "Urme",
  ambrette: "Ambreta",
  plum: "Šljiva",
  "fig-wood": "Drvo smokve",
  petitgrain: "Petitgrain",
  rosemary: "Ruzmarin",
  "lily-of-the-valley": "Đurđevak",
  cloves: "Karanfilić",
  coriander: "Korijander",
  narcissus: "Narcis",
  incense: "Tamjan",
  "thai-basil": "Tajlandski bosiljak",
  "timut-pepper": "Timut biber",
  georgywood: "Georgywood",
  petalia: "Petalia",
  akigalawood: "Akigalawood",
  pimento: "Pimento",
  lavandin: "Lavandin",
  maninka: "Maninka",
  "grapefruit-blossom": "Cvet grejpfruta",
  rhubarb: "Rabarbara",
  freesia: "Frezija",
  "cedar-leaf": "List kedra",
  "violet-leaf": "List ljubičice",
  "cocoa-shell": "Ljuska kakaoa",
  artemisia: "Artemizija",
  spices: "Začini",
  "dark-woods": "Tamne drvene note",
  "marine-notes": "Morske note",
  "green-mandarin": "Zelena mandarina",
  mimosa: "Mimoza",
  mango: "Mango",
  "black-pepper": "Crni biber",
  chestnut: "Kesten",
  "bitter-orange": "Gorka narandža",
  oakwood: "Hrastovo drvo",
  almond: "Badem",
  "cold-spices": "Hladni začini",
  "aquatic-jasmine": "Vodeni jasmin",
  "warm-woods": "Tople drvene note",
  "blue-cedar": "Plavi kedar",
  ebony: "Ebanovina",
  flint: "Kremen",
  kulfi: "Kulfi",
  "dragon-fruit": "Zmajevo voće",
  cognac: "Konjak",
  suede: "Antilop koža",
  toffee: "Tofi karamela",
  "frozen-apple": "Smrznuta jabuka",
  driftwood: "Naplavljeno drvo",
  pear: "Kruška",
  anise: "Anis",
  spearmint: "Zelena nana",
  "rooibos-tea": "Rooibos čaj",
  rosewood: "Ružino drvo",
  carambola: "Karambola",
  tarragon: "Estragon",
  "sycamore-wood": "Drvo sikomore",
  ambrettolide: "Ambretolid",
  verbena: "Verbena",
  heliotropin: "Heliotropin",
  elemi: "Elemi",
  "metallic-notes": "Metalne note",
  "solar-notes": "Solarne note",
  "jasmine-sambac": "Sambak jasmin",
  "black-coffee": "Crna kafa",
  "vanilla-orchid": "Orhideja vanile",
  snow: "Sneg",
  ice: "Led",
  tea: "Čaj",
  peony: "Božur",
  ambermax: "Ambermax",
  "iced-mint": "Ledena nana",
  "red-apple": "Crvena jabuka",
  rum: "Rum",
  tuberose: "Tuberoza",
  "peru-balsam": "Peruanski balzam",
  "black-plum": "Crna šljiva",
  truffle: "Tartuf",
  "watery-notes": "Vodene note",
  "fresh-florals": "Sveže cvetne note",
  "fresh-woods": "Sveže drvene note",
  "coconut-wood": "Kokosovo drvo",
  calone: "Calone",
  magnolia: "Magnolija",
  yuzu: "Juzu",
  cucumber: "Krastavac",
  "sea-salt": "Morska so",
    "aqua-accord": "Vodeni akord",
  "black-cedar": "Crni kedar",
  "black-ebony": "Crna ebanovina",
  "blue-sage": "Plava žalfija",
  "bourbon-geranium": "Burbonski geranijum",
  "bourbon-vanilla": "Burbonska vanila",
  "bulgarian-rose": "Bugarska ruža",
  "calabrian-bergamot": "Kalabrijski bergamot",
  cashmere: "Kašmir",
  "cedar-leaves": "Listovi kedra",
  citron: "Citron",
  "citrus-notes": "Citrusne note",
  "coriander-oil": "Ulje korijandera",
  cumin: "Kumin",
  "fig-nectar": "Nektar smokve",
  "fresh-marine-notes": "Sveže morske note",
  "fresh-mint": "Sveža nana",
  "haitian-vetiver": "Haićanski vetiver",
  "ice-accord": "Ledeni akord",
  "indonesian-patchouli": "Indonežanski pačuli",
  "indonesian-vetiver-oil": "Ulje indonežanskog vetivera",
  "italian-bergamot": "Italijanski bergamot",
  "italian-citron": "Italijanski citron",
  "italian-lemon": "Italijanski limun",
  "italian-orange": "Italijanska narandža",
  "jasmine-petals": "Latice jasmina",
  "lemon-zest": "Limunova korica",
  licorice: "Sladić",
  lily: "Ljiljan",
  "living-mint": "Living Mint",
  "madagascar-vanilla": "Madagaskarska vanila",
  "mandarin-orange": "Mandarina",
  "may-rose": "Majska ruža",
  orris: "Koren irisa",
  "patchouli-leaves": "Listovi pačulija",
  "powdery-musk": "Puderasti mošus",
  raspberry: "Malina",
  "rose-geranium": "Ružin geranijum",
  "salty-marine-accord": "Slani morski akord",
  "sea-salt-accord": "Akord morske soli",
  "sicilian-bergamot": "Sicilijanski bergamot",
  "sicilian-citruses": "Sicilijanski citrusi",
  "sicilian-lemon": "Sicilijanski limun",
  "snow-accord": "Snežni akord",
  "star-anise": "Zvezdasti anis",
  "teak-wood": "Drvo tikovine",
  "tobacco-leaf": "List duvana",
  "truffle-accord": "Akord tartufa",
  "tunisian-orange-blossom-absolute": "Apsolut tuniskog cveta narandže",
  "vanilla-absolute": "Apsolut vanile",
  whisky: "Viski",
  "white-cedar": "Beli kedar",
  "white-jasmine": "Beli jasmin",
  "white-lemon": "Beli limun",
  "white-musk": "Beli mošus",
  "white-woods": "Bele drvene note",
  "crystal-notes": "Kristalne note",
  "vanilla-flower": "Cvet vanile",
  "powdery-notes": "Puderaste note",
  "pink-grapefruit": "Ružičasti grejpfrut",
  heliotrope: "Heliotrop",
  carnation: "Karanfil",
  "damask-rose": "Damaščanska ruža",
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

const normalizeNoteKeys = (value) => {
  if (!Array.isArray(value)) return [];

  return value
    .filter((noteKey) => typeof noteKey === "string")
    .map((noteKey) => noteKey.trim())
    .filter(Boolean);
};

const formatNoteLabel = (noteKey) =>
  noteKey
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const getNoteData = (noteKey) => {
  const savedNote = NOTE_LIBRARY[noteKey];
  const defaultLabel = formatNoteLabel(noteKey);

  return {
    sr: savedNote?.sr || NOTE_SR[noteKey] || defaultLabel,
    en: savedNote?.en || defaultLabel,
    image: savedNote?.image || `/note-map/${noteKey}.webp`,
    fallback: savedNote?.fallback || "✦",
  };
};

function NoteMapItem({ noteKey, lang, delay }) {
  const [imageFailed, setImageFailed] = useState(false);
  const note = getNoteData(noteKey);
  const noteLabel = note[lang] || note.en;
  const showImage = Boolean(note.image) && !imageFailed;

  return (
    <span
      className="the-note-map__note"
      role="listitem"
      style={{ "--note-delay": `${delay}ms` }}
    >
      <span className="the-note-map__thumb" aria-hidden="true">
        <span
          className={`the-note-map__fallback ${
            showImage ? "" : "is-visible"
          }`}
        >
          {note.fallback}
        </span>

        {showImage && (
          <img
            src={note.image}
            alt=""
            loading="lazy"
            decoding="async"
            draggable="false"
            onError={() => setImageFailed(true)}
          />
        )}
      </span>

      <span className="the-note-map__name">{noteLabel}</span>
    </span>
  );
}

export default function TheNoteMap({
  notes,
  lang = "sr",
  open = false,
  onToggle,
}) {
  const componentId = useId().replace(/:/g, "");
  const triggerId = `product-note-map-trigger-${componentId}`;
  const panelId = `product-note-map-panel-${componentId}`;
  const activeLang = lang === "sr" ? "sr" : "en";

  const hasNotes = NOTE_LEVELS.some(
    ({ key }) => normalizeNoteKeys(notes?.[key]).length > 0
  );

  if (!hasNotes) return null;

  return (
    <div className={`the-note-map ${open ? "is-open" : ""}`}>
      <button
        id={triggerId}
        type="button"
        className="the-note-map__trigger"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onToggle?.();
        }}
        aria-expanded={Boolean(open)}
        aria-controls={panelId}
      >
        <span>THE NOTE MAP</span>
        <strong aria-hidden="true">{open ? "×" : "+"}</strong>
      </button>

      <div
        id={panelId}
        className="the-note-map__panel"
        role="region"
        aria-labelledby={triggerId}
        aria-hidden={!open}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="the-note-map__levels">
          {NOTE_LEVELS.map((level, rowIndex) => {
            const levelNotes = normalizeNoteKeys(notes?.[level.key]);

            if (!levelNotes.length) return null;

            return (
              <div
                className="the-note-map__level"
                key={level.key}
                role="list"
                aria-label={level[activeLang]}
              >
                {levelNotes.map((noteKey, noteIndex) => (
                  <NoteMapItem
                    key={`${level.key}-${noteKey}-${noteIndex}`}
                    noteKey={noteKey}
                    lang={activeLang}
                    delay={rowIndex * 220 + noteIndex * 75}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}