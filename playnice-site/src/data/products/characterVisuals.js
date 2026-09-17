export const CHARACTER_VISUALS = [
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

const CHARACTER_VISUAL_FALLBACKS = [
  "/note-map/bergamot.webp",
  "/note-map/cedarwood.webp",
  "/note-map/iris.webp",
];

export const getCharacterVisual = (tag, index = 0) => {
  const matched = CHARACTER_VISUALS.find((item) =>
    item.match.test(String(tag || ""))
  );

  if (matched) return matched.image;

  const safeIndex = Number.isFinite(Number(index)) ? Number(index) : 0;
  return CHARACTER_VISUAL_FALLBACKS[
    Math.abs(safeIndex) % CHARACTER_VISUAL_FALLBACKS.length
  ];
};
