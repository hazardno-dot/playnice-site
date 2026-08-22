/* =========================================
   PLAYNICE DISCOVERY ENGINE — V3.0
   Deterministic, local, zero-API-cost ranking.
   Uses products + productCopy + productWearContext.
========================================= */

const normalizeText = (value = "") =>
  String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9€]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const includesAny = (text, values = []) =>
  values.some((value) => text.includes(normalizeText(value)));

const clamp = (value, min = 0, max = 10) =>
  Math.max(min, Math.min(max, value));

const unique = (items = []) => [...new Set(items.filter(Boolean))];

const flattenNotes = (product) =>
  unique([
    ...(product?.noteMap?.top || []),
    ...(product?.noteMap?.heart || []),
    ...(product?.noteMap?.base || []),
  ]);

const getAvailableSizes = (product) =>
  Object.entries(product?.sizes || {})
    .filter(([, price]) => Number.isFinite(Number(price)))
    .map(([size, price]) => ({
      size,
      price: Number(price),
      ml: Number.parseFloat(size) || 0,
    }))
    .sort((a, b) => a.price - b.price || a.ml - b.ml);

const chooseSizeForBudget = (product, maxPrice) => {
  const sizes = getAvailableSizes(product);
  if (!sizes.length) return null;
  if (!Number.isFinite(maxPrice)) return sizes[0];

  const affordable = sizes.filter((item) => item.price <= maxPrice);
  if (!affordable.length) return null;

  return [...affordable].sort((a, b) => b.ml - a.ml || b.price - a.price)[0];
};

const NOTE_GROUPS = {
  citrus: new Set([
    "bergamot", "calabrian-bergamot", "italian-bergamot", "sicilian-bergamot",
    "lemon", "italian-lemon", "sicilian-lemon", "white-lemon", "lemon-zest",
    "lime", "grapefruit", "pink-grapefruit", "mandarin", "mandarin-orange",
    "green-mandarin", "orange", "bitter-orange", "italian-orange", "citron",
    "italian-citron", "cedrat", "citruses", "citrus-notes", "sicilian-citruses",
    "yuzu", "petitgrain", "neroli", "orange-blossom", "grapefruit-blossom",
    "bergamot-blossom"
  ]),
  aquatic: new Set([
    "marine-notes", "fresh-marine-notes", "watery-notes", "aqua-accord",
    "salty-marine-accord", "sea-salt", "sea-salt-accord", "calone",
    "ozonic-notes", "ice", "ice-accord", "snow", "snow-accord", "driftwood",
    "cucumber"
  ]),
  sweet: new Set([
    "vanilla", "bourbon-vanilla", "madagascar-vanilla", "vanilla-absolute",
    "vanilla-orchid", "vanilla-flower", "caramel", "toffee", "praline",
    "candied-fruits", "honey", "sugar-cane", "dates", "tonka-bean", "kulfi",
    "chestnut", "maple-wood", "cocoapulse", "cognac", "rum", "white-rum"
  ]),
  woody: new Set([
    "cedarwood", "cedar-leaf", "cedar-leaves", "white-cedar", "black-cedar",
    "blue-cedar", "sandalwood", "oakwood", "rosewood", "guaiac-wood",
    "fig-wood", "teak-wood", "sycamore-wood", "ebony", "black-ebony",
    "woody-notes", "dry-woods", "dark-woods", "warm-woods", "fresh-woods",
    "white-woods", "coconut-wood", "velvet-wood", "maple-wood", "cashmeran",
    "georgywood", "akigalawood"
  ]),
  spicy: new Set([
    "cardamom", "cinnamon", "cloves", "coriander", "coriander-oil", "cumin",
    "nutmeg", "pink-pepper", "black-pepper", "timut-pepper", "pimento",
    "fresh-spices", "cold-spices", "spices", "saffron", "star-anise", "anise"
  ]),
  aromatic: new Set([
    "lavender", "lavandin", "sage", "clary-sage", "blue-sage", "rosemary",
    "thyme", "basil", "thai-basil", "tarragon", "mint", "fresh-mint",
    "living-mint", "iced-mint", "spearmint", "herbal-notes", "aromatic-notes",
    "juniper-berries", "artemisia", "verbena", "geranium", "rose-geranium",
    "bourbon-geranium"
  ]),
  floral: new Set([
    "rose", "bulgarian-rose", "may-rose", "damask-rose", "jasmine",
    "white-jasmine", "jasmine-sambac", "jasmine-petals", "tuberose", "peony",
    "freesia", "magnolia", "lily", "lily-of-the-valley", "narcissus",
    "ylang-ylang", "hibiscus", "mimosa", "violet", "carnation", "heliotrope",
    "white-flowers", "fresh-florals", "flower-prism", "aquatic-jasmine"
  ]),
  warm: new Set([
    "amber", "amberwood", "ambergris", "ambermax", "ambroxan", "ambrofix",
    "benzoin", "labdanum", "styrax", "olibanum", "incense", "tobacco",
    "tobacco-leaf", "leather", "suede", "oud", "cognac", "whiskey", "whisky",
    "rum", "white-rum", "warm-woods", "cashmeran"
  ]),
  gourmand: new Set([
    "vanilla", "bourbon-vanilla", "madagascar-vanilla", "vanilla-absolute",
    "caramel", "toffee", "praline", "honey", "coffee-arabica", "black-coffee",
    "cocoa-shell", "cocoapulse", "chestnut", "kulfi", "dates", "sugar-cane",
    "licorice", "almond"
  ]),
  clean: new Set([
    "musk", "white-musk", "powdery-musk", "ambrettolide", "ambrette",
    "ozonic-notes", "watery-notes", "aqua-accord", "fresh-woods",
    "fresh-florals", "fresh-marine-notes", "marine-notes", "tea", "black-tea",
    "iris", "orris", "violet-leaf", "cucumber"
  ]),
  powdery: new Set([
    "iris", "orris", "powdery-notes", "powdery-musk", "heliotrope", "heliotropin",
    "violet", "vanilla", "almond", "musk", "white-musk"
  ]),
};

const noteGroupScore = (notes, group) => {
  if (!notes.length) return 0;
  const set = NOTE_GROUPS[group];
  if (!set) return 0;
  const matches = notes.filter((note) => set.has(note)).length;
  return clamp((matches / Math.max(2, notes.length)) * 24, 0, 10);
};

const TEXT_SIGNALS = {
  fresh: ["fresh", "svez", "sveze", "bright", "radiant", "cool", "icy", "refreshing", "blistav", "vedar", "hladan", "osvez"],
  clean: ["clean", "polished", "uredan", "cist", "cisto", "refined", "prozrac", "airy", "smooth"],
  sweet: ["sweet", "slad", "gourmand", "gurman", "caramel", "karamel", "praline", "pralina", "vanilla", "vanila", "honey", "med"],
  warm: ["warm", "topao", "topla", "toplo", "dense", "gust", "resinous", "smol", "cozy", "creamy", "kremast"],
  rich: ["rich", "bogat", "raskos", "opulent", "luxurious", "luksuz", "deep", "dubok"],
  soft: ["soft", "mekan", "meko", "gentle", "nezan", "nezno", "light", "lagan", "subtle", "diskret", "understated", "effortless", "nenametljiv"],
  bold: ["bold", "powerful", "strong", "intense", "snaž", "snaz", "mocan", "moćan", "upečat", "upecat", "attention grabbing", "striking", "commanding"],
  elegant: ["elegant", "eleganc", "refined", "profinjen", "ugladjen", "uglađen", "polished", "sophisticated", "sofistic", "classy", "mature", "zreo"],
  modern: ["modern", "moderan", "savremen", "contemporary", "urban"],
  versatile: ["versatile", "svestran", "everyday", "svaki dan", "daily", "all day", "celodnev", "dependable", "pouzdan"],
  seductive: ["seductive", "zavodljiv", "sensual", "senzual", "attractive", "privlacan", "privlačan", "intimate", "intim"],
};

const signalCount = (text, aliases = []) =>
  aliases.reduce((sum, alias) => sum + (text.includes(normalizeText(alias)) ? 1 : 0), 0);

const getCopyText = (product, productCopy = {}) => {
  const copy = productCopy?.[product?.name] || {};
  const values = [
    copy?.miniTag?.sr, copy?.miniTag?.en,
    copy?.card?.sr, copy?.card?.en,
    copy?.modal?.sr, copy?.modal?.en,
    copy?.scentType?.sr, copy?.scentType?.en,
    ...(copy?.dominantNotes?.sr || []), ...(copy?.dominantNotes?.en || []),
    ...(copy?.tags?.sr || []), ...(copy?.tags?.en || []),
    copy?.whyChoose?.sr, copy?.whyChoose?.en,
  ];
  return normalizeText(values.filter(Boolean).join(" "));
};

const getWearText = (product, productWearContext = {}) => {
  const wear = productWearContext?.[product?.name] || {};
  return normalizeText([wear?.sr, wear?.en].filter(Boolean).join(" "));
};

const buildProductProfile = (product, productCopy = {}, productWearContext = {}, discoveryProfiles = {}) => {
  const notes = flattenNotes(product);
  const moods = new Set(product?.moods || []);
  const copyText = getCopyText(product, productCopy);
  const wearText = getWearText(product, productWearContext);
  const semanticText = `${copyText} ${wearText}`.trim();

  const profile = {
    citrus: noteGroupScore(notes, "citrus"),
    aquatic: noteGroupScore(notes, "aquatic"),
    sweet: noteGroupScore(notes, "sweet"),
    woody: noteGroupScore(notes, "woody"),
    spicy: noteGroupScore(notes, "spicy"),
    aromatic: noteGroupScore(notes, "aromatic"),
    floral: noteGroupScore(notes, "floral"),
    warm: noteGroupScore(notes, "warm"),
    gourmand: noteGroupScore(notes, "gourmand"),
    clean: noteGroupScore(notes, "clean"),
    powdery: noteGroupScore(notes, "powdery"),
  };

  // Existing curated PlayNice moods remain high-confidence signals.
  if (moods.has("clean")) profile.clean = Math.max(profile.clean, 8);
  if (moods.has("summer")) {
    profile.aquatic = Math.max(profile.aquatic, 4);
    profile.warm = Math.min(profile.warm, 6);
  }
  if (moods.has("rich")) {
    profile.warm = Math.max(profile.warm, 7);
    profile.sweet = Math.max(profile.sweet, 4);
  }
  if (moods.has("soft")) {
    profile.clean = Math.max(profile.clean, 5);
    profile.warm = Math.min(profile.warm, 6);
  }

  // Product copy enriches the raw note-map fingerprint.
  if (signalCount(semanticText, TEXT_SIGNALS.clean) > 0) profile.clean = Math.max(profile.clean, 7.2);
  if (signalCount(semanticText, TEXT_SIGNALS.sweet) > 0) profile.sweet = Math.max(profile.sweet, 6.4);
  if (signalCount(semanticText, TEXT_SIGNALS.warm) > 0) profile.warm = Math.max(profile.warm, 6.6);
  if (signalCount(semanticText, TEXT_SIGNALS.rich) > 0) profile.warm = Math.max(profile.warm, 7.2);

  const freshness = clamp(
    profile.citrus * 0.30 +
      profile.aquatic * 0.24 +
      profile.aromatic * 0.16 +
      profile.clean * 0.22 -
      profile.gourmand * 0.12 -
      profile.warm * 0.08 +
      Math.min(signalCount(semanticText, TEXT_SIGNALS.fresh) * 0.9, 2.2)
  );

  const elegance = clamp(
    3.2 +
      profile.woody * 0.18 +
      profile.clean * 0.18 +
      profile.aromatic * 0.10 +
      Math.min(signalCount(semanticText, TEXT_SIGNALS.elegant) * 1.25, 4.2) -
      Math.max(0, profile.gourmand - 7) * 0.18
  );

  const intensity = clamp(
    4.5 +
      profile.warm * 0.22 +
      profile.woody * 0.08 +
      Math.min(signalCount(semanticText, TEXT_SIGNALS.bold) * 1.0, 3.8) -
      Math.min(signalCount(semanticText, TEXT_SIGNALS.soft) * 0.9, 3.0)
  );

  const versatility = clamp(
    4.2 +
      profile.clean * 0.18 +
      freshness * 0.14 +
      Math.min(signalCount(semanticText, TEXT_SIGNALS.versatile) * 1.1, 3.8) -
      Math.max(0, profile.warm - 8) * 0.25
  );

  const seduction = clamp(
    2.8 +
      profile.warm * 0.22 +
      profile.sweet * 0.14 +
      Math.min(signalCount(semanticText, TEXT_SIGNALS.seductive) * 1.25, 4.0)
  );

  const office = clamp(
    3.0 +
      profile.clean * 0.32 +
      freshness * 0.18 +
      versatility * 0.20 +
      (includesAny(wearText, ["work", "posao", "office", "kancelarija", "meeting", "sastanak"]) ? 3.2 : 0) -
      Math.max(0, intensity - 7.2) * 0.55 -
      Math.max(0, profile.gourmand - 6.5) * 0.35
  );

  const evening = clamp(
    2.8 +
      profile.warm * 0.24 +
      intensity * 0.20 +
      seduction * 0.20 +
      (includesAny(wearText, ["evening", "night", "vece", "vecer", "izlazak", "dejt", "date"]) ? 2.8 : 0)
  );

  const automaticProfile = {
    ...profile,
    freshness,
    elegance,
    intensity,
    projection: intensity,
    longevity: 5.5,
    versatility,
    seduction,
    office,
    casual: versatility,
    date: clamp(seduction * 0.72 + evening * 0.28),
    evening,
    masculine: 5,
    feminine: 5,
    unisex: 5,
    notes,
    semanticText,
    wearText,
  };

  const manual = discoveryProfiles?.[product?.slug] || {};

  if (!manual || !Object.keys(manual).length) {
    return automaticProfile;
  }

  // Manual profiles are selective overrides, never full replacements.
  // Friendly schema aliases are normalized to the engine's internal fields.
  const normalizedManual = {
    ...manual,
    ...(Number.isFinite(manual.sweetness) ? { sweet: manual.sweetness } : {}),
    ...(Number.isFinite(manual.warmth) ? { warm: manual.warmth } : {}),
    ...(Number.isFinite(manual.woodiness) ? { woody: manual.woodiness } : {}),
    ...(Number.isFinite(manual.spiciness) ? { spicy: manual.spiciness } : {}),
    ...(Number.isFinite(manual.aromaticity) ? { aromatic: manual.aromaticity } : {}),
    ...(Number.isFinite(manual.florality) ? { floral: manual.florality } : {}),
    ...(Number.isFinite(manual.gourmandness) ? { gourmand: manual.gourmandness } : {}),
    ...(Number.isFinite(manual.cleanliness) ? { clean: manual.cleanliness } : {}),
    ...(Number.isFinite(manual.projection)
      ? { intensity: manual.projection, projection: manual.projection }
      : {}),
  };

  return {
    ...automaticProfile,
    ...normalizedManual,
    notes,
    semanticText,
    wearText,
    hasManualProfile: true,
  };
};

const QUERY_DICTIONARY = {
  season: {
    summer: ["leto", "ljeto", "letnji", "ljetnji", "letnje", "ljetnje", "summer", "vrucina", "vruce", "hot weather", "more", "plaza", "beach"],
    winter: ["zima", "zimu", "zime", "zimski", "zimsko", "winter", "hladno", "cold weather"],
    spring: ["prolece", "proljece", "spring"],
    autumn: ["jesen", "autumn", "fall"],
  },
  category: {
    Arabian: ["arabian", "arapski", "arapski parfem", "middle eastern"],
    Designer: ["designer", "dizajnerski", "dizajner"],
    Niche: ["niche", "nisni", "nisni parfem"],
  },
  mood: {
    clean: ["clean", "cisto", "cist", "cista", "cistoca", "fresh laundry", "uredno"],
    summer: ["summer", "leto", "ljeto", "letnji", "ljetnji", "more", "plaza", "beach"],
    date: ["date", "dejt", "romantic", "romanticno"],
    rich: ["rich", "bogato", "raskosno", "luksuzno", "opulent"],
    soft: ["soft", "nezan", "nezno", "blag", "blago", "subtle", "diskretno", "nenapadno", "not loud"],
    signature: ["signature", "svaki dan", "everyday", "daily", "versatile", "univerzalno"],
  },
  trait: {
    freshness: ["fresh", "sveze", "svez", "sveza", "osvezavajuce", "refreshing", "hladnije", "fresher"],
    citrus: ["citrus", "citrusno", "citrusni"],
    aquatic: ["aquatic", "vodeno", "vodeni", "marine", "morski", "more", "ozonic"],
    sweet: ["sweet", "slatko", "sladak", "slatka"],
    woody: ["woody", "drven", "drveno", "drvenast", "drvenasto"],
    spicy: ["spicy", "zacin", "zacinski", "zacinjeno"],
    aromatic: ["aromatic", "aromaticno", "aromatican", "biljno", "herbal"],
    floral: ["floral", "cvetno", "cvjetno", "cvetni", "cvjetni"],
    warm: ["warm", "toplo", "topao", "topla", "amber", "tezak", "tesko", "heavy"],
    gourmand: ["gourmand", "gurmanski", "jestivo", "dessert", "desert"],
    clean: ["clean", "cisto", "cist", "cista", "sapunski", "soapy"],
    powdery: ["powdery", "puderast", "puderasto", "puderasti"],
    elegance: ["elegant", "elegantno", "elegantan", "elegantna", "classy", "sofisticirano", "sophisticated", "ugladjeno", "uglađeno"],
    intensity: ["jako", "snazno", "snažno", "powerful", "strong", "intense", "upečatljivo", "upecatljivo"],
    versatility: ["svestran", "svestrano", "versatile", "za sve", "all round"],
    seduction: ["zavodljiv", "zavodljivo", "seductive", "sensual", "sexy", "privlacan", "privlačan"],
  },
};

const NEGATION_MARKERS = [
  "ne previse", "ne previše", "nije previse", "nije previše", "not too",
  "bez", "without", "izbegni", "izbjegni", "avoid", "ne volim", "dont like",
  "do not like", "nikako", "no ", "ne bude", "da ne bude", "nije", "not"
].map(normalizeText);

const HARD_NEGATION_MARKERS = [
  "bez", "without", "izbegni", "izbjegni", "avoid", "ne volim", "dont like",
  "do not like", "nikako", "no "
].map(normalizeText);

const INTENSIFIERS = ["veoma", "bas", "baš", "jako", "very", "really", "extra"].map(normalizeText);

const parseBudget = (text) => {
  const patterns = [
    /(?:do|max|maks(?:imalno)?|under|below|up to)\s*€?\s*(\d+(?:[.,]\d+)?)/i,
    /€\s*(\d+(?:[.,]\d+)?)\s*(?:max|ili manje)?/i,
    /(\d+(?:[.,]\d+)?)\s*(?:€|eur|eura)\s*(?:ili manje|or less|max)?/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) return Number(match[1].replace(",", "."));
  }
  return null;
};

const detectNegativeTrait = (text, aliases) => {
  for (const alias of aliases) {
    const normalizedAlias = normalizeText(alias);
    const index = text.indexOf(normalizedAlias);
    if (index === -1) continue;
    const before = text.slice(Math.max(0, index - 28), index).trim();
    if (NEGATION_MARKERS.some((marker) => before.includes(marker))) return true;
  }
  return false;
};

const detectHardNegative = (text, aliases) => {
  for (const alias of aliases) {
    const normalizedAlias = normalizeText(alias);
    const index = text.indexOf(normalizedAlias);
    if (index === -1) continue;
    const before = text.slice(Math.max(0, index - 28), index).trim();
    if (HARD_NEGATION_MARKERS.some((marker) => before.includes(marker))) return true;
  }
  return false;
};

const detectPositiveTrait = (text, aliases) => {
  if (!includesAny(text, aliases)) return false;
  return !detectNegativeTrait(text, aliases);
};

const detectIntensity = (text, aliases) => {
  for (const alias of aliases) {
    const normalizedAlias = normalizeText(alias);
    const index = text.indexOf(normalizedAlias);
    if (index === -1) continue;
    const around = text.slice(Math.max(0, index - 20), index + normalizedAlias.length + 20);
    if (INTENSIFIERS.some((item) => around.includes(item))) return "high";
  }
  return "normal";
};

const NOTE_ALIASES = {
  vanilla: ["vanila", "vanilu", "vanile", "vanilla"],
  oud: ["oud", "agarwood"],
  tobacco: ["duvan", "tobacco"],
  honey: ["med", "honey"],
  lavender: ["lavanda", "lavender"],
  rose: ["ruza", "ruža", "rose"],
  jasmine: ["jasmin", "jasmine"],
  coconut: ["kokos", "coconut"],
  leather: ["koza", "koža", "leather"],
  coffee: ["kafa", "coffee"],
  iris: ["iris", "orris"],
  musk: ["mosus", "mošus", "musk"],
  bergamot: ["bergamot"],
  lemon: ["limun", "lemon"],
  grapefruit: ["grejp", "grejpfrut", "grapefruit"],
  sandalwood: ["sandalovina", "sandalwood"],
};

const noteAliasToKeys = {
  vanilla: ["vanilla", "bourbon-vanilla", "madagascar-vanilla", "vanilla-absolute", "vanilla-orchid", "vanilla-flower"],
  oud: ["oud"],
  tobacco: ["tobacco", "tobacco-leaf"],
  honey: ["honey"],
  lavender: ["lavender", "lavandin"],
  rose: ["rose", "bulgarian-rose", "may-rose", "damask-rose"],
  jasmine: ["jasmine", "white-jasmine", "jasmine-sambac", "jasmine-petals", "aquatic-jasmine"],
  coconut: ["coconut", "coconut-wood"],
  leather: ["leather", "suede"],
  coffee: ["coffee-arabica", "black-coffee"],
  iris: ["iris", "orris"],
  musk: ["musk", "white-musk", "powdery-musk"],
  bergamot: ["bergamot", "calabrian-bergamot", "italian-bergamot", "sicilian-bergamot", "bergamot-blossom"],
  lemon: ["lemon", "italian-lemon", "sicilian-lemon", "white-lemon", "lemon-zest"],
  grapefruit: ["grapefruit", "pink-grapefruit", "grapefruit-blossom"],
  sandalwood: ["sandalwood"],
};

const REFERENCE_CUES = [
  "svidja mi se", "sviđa mi se", "volim", "nesto kao", "nešto kao", "kao ",
  "alternativa za", "alternative to", "something like", "similar to", "i like", "love "
].map(normalizeText);

const REFERENCE_STOPWORDS = new Set([
  "original", "creation", "parfum", "perfume", "eau", "toilette", "extrait",
  "citrus", "fresh", "woody", "musk", "amber", "dna", "pour", "homme", "femme"
]);

const parseQuery = (rawQuery, products = []) => {
  const text = normalizeText(rawQuery);
  const intent = {
    raw: rawQuery,
    text,
    maxPrice: parseBudget(text),
    seasons: [],
    categories: [],
    moods: [],
    positiveTraits: [],
    negativeTraits: [],
    requiredNotes: [],
    excludedNotes: [],
    hardExcludedNotes: [],
    contexts: [],
    gender: null,
    referenceProduct: null,
    referenceModifiers: [],
  };

  Object.entries(QUERY_DICTIONARY.season).forEach(([key, aliases]) => {
    if (includesAny(text, aliases)) intent.seasons.push(key);
  });

  Object.entries(QUERY_DICTIONARY.category).forEach(([key, aliases]) => {
    if (includesAny(text, aliases)) intent.categories.push(key);
  });

  Object.entries(QUERY_DICTIONARY.mood).forEach(([key, aliases]) => {
    if (detectPositiveTrait(text, aliases)) intent.moods.push(key);
  });

  Object.entries(QUERY_DICTIONARY.trait).forEach(([key, aliases]) => {
    if (detectNegativeTrait(text, aliases)) {
      intent.negativeTraits.push({ key, strength: "soft" });
    } else if (detectPositiveTrait(text, aliases)) {
      intent.positiveTraits.push({ key, strength: detectIntensity(text, aliases) });
    }
  });

  if (includesAny(text, ["office", "posao", "kancelarija", "work", "workplace", "sastanak", "meeting"])) intent.contexts.push("office");
  if (includesAny(text, ["elegantno", "elegantan", "elegantna", "elegant", "classy", "sofisticirano", "sophisticated"])) intent.contexts.push("elegant");
  if (includesAny(text, ["vece", "uvece", "vecernji", "vecernje", "evening", "night", "izlazak"])) intent.contexts.push("evening");
  if (includesAny(text, ["dejt", "date", "romantic", "romanticno"])) intent.contexts.push("date");
  if (includesAny(text, ["svaki dan", "everyday", "daily", "celodnevno", "all day"])) intent.contexts.push("everyday");
  if (
  includesAny(text, [
    "muski",
    "muški",
    "masculine",
    "for him",
    "za njega"
  ])
) {
  intent.gender = "masculine";
} else if (
  includesAny(text, [
    "zenski",
    "ženski",
    "feminine",
    "for her",
    "za nju"
  ])
) {
  intent.gender = "feminine";
} else if (
  includesAny(text, [
    "unisex"
  ])
) {
  intent.gender = "unisex";
}

  // "slatko ali ne previše" = moderate target, not negative sweetness.
  Object.entries(QUERY_DICTIONARY.trait).forEach(([key, aliases]) => {
    for (const alias of aliases) {
      const a = normalizeText(alias);
      const idx = text.indexOf(a);
      if (idx === -1) continue;
      const after = text.slice(idx + a.length, idx + a.length + 28);
      if (/(ali )?(ne previse|not too)/.test(after)) {
        intent.positiveTraits = intent.positiveTraits.filter((item) => item.key !== key);
        intent.negativeTraits = intent.negativeTraits.filter((item) => item.key !== key);
        intent.positiveTraits.push({ key, strength: "moderate" });
      }
    }
  });

  Object.entries(NOTE_ALIASES).forEach(([aliasKey, aliases]) => {
    if (!includesAny(text, aliases)) return;
    const keys = noteAliasToKeys[aliasKey] || [aliasKey];

    if (detectHardNegative(text, aliases)) {
      intent.hardExcludedNotes.push(...keys);
      return;
    }

    if (detectNegativeTrait(text, aliases)) {
      intent.excludedNotes.push(...keys);
    } else {
      intent.requiredNotes.push(...keys);
    }
  });

  let bestReference = null;
  let bestReferenceScore = 0;
  const wantsReference = REFERENCE_CUES.some((cue) => text.includes(cue));

  if (wantsReference) {
    products.forEach((product) => {
      const candidates = [
        { value: product?.name, weight: 120 },
        { value: product?.shortName, weight: 140 },
        { value: product?.inspiredBy?.name, weight: 90 },
        { value: product?.inspiredBy?.short, weight: 80 },
      ];

      candidates.forEach(({ value, weight }) => {
        const candidate = normalizeText(value);
        if (candidate.length < 4) return;

        const tokens = candidate
          .split(" ")
          .filter((token) => token.length >= 5 && !REFERENCE_STOPWORDS.has(token));

        const exactCandidate = text.includes(candidate);
        const matchedTokens = tokens.filter((token) => text.includes(token)).length;
        if (!exactCandidate && matchedTokens === 0) return;

        const score = weight + (exactCandidate ? 60 : 0) + matchedTokens * 8 + Math.min(candidate.length, 40) * 0.1;
        if (score > bestReferenceScore) {
          bestReference = product;
          bestReferenceScore = score;
        }
      });
    });
  }

  intent.referenceProduct = bestReference;

  if (bestReference) {
    if (includesAny(text, ["svezije", "svežije", "fresher"])) intent.referenceModifiers.push("fresher");
    if (includesAny(text, ["manje slatko", "less sweet", "not as sweet"])) intent.referenceModifiers.push("less-sweet");
    if (includesAny(text, ["lakse", "lakše", "lighter", "manje tesko", "manje teško"])) intent.referenceModifiers.push("lighter");
    if (includesAny(text, ["jace", "jače", "stronger", "more powerful"])) intent.referenceModifiers.push("stronger");
    if (includesAny(text, ["elegantnije", "more elegant", "classier"])) intent.referenceModifiers.push("more-elegant");
  }

  intent.seasons = unique(intent.seasons);
  intent.categories = unique(intent.categories);
  intent.moods = unique(intent.moods);
  intent.requiredNotes = unique(intent.requiredNotes);
  intent.excludedNotes = unique(intent.excludedNotes);
  intent.hardExcludedNotes = unique(intent.hardExcludedNotes);
  intent.contexts = unique(intent.contexts);
  intent.referenceModifiers = unique(intent.referenceModifiers);

  return intent;
};

const setSimilarity = (a = [], b = []) => {
  const setA = new Set(a);
  const setB = new Set(b);
  const union = new Set([...setA, ...setB]);
  if (!union.size) return 0;
  const intersection = [...setA].filter((value) => setB.has(value)).length;
  return intersection / union.size;
};

const VECTOR_KEYS = [
  "freshness", "sweetness", "warmth", "darkness", "airiness", "cleanliness",
  "creaminess", "dryness", "fruitiness", "spiciness", "woodiness",
  "aromaticity", "florality", "gourmandness", "citrus", "aquatic", "powdery",
  "projection", "longevity", "office", "casual", "date", "evening",
  "elegance", "versatility"
];

const getVectorValue = (profile, key) => {
  const aliases = {
    sweetness: "sweet",
    warmth: "warm",
    cleanliness: "clean",
    woodiness: "woody",
    spiciness: "spicy",
    aromaticity: "aromatic",
    florality: "floral",
    gourmandness: "gourmand",
  };
  const direct = profile?.[key];
  if (Number.isFinite(direct)) return direct;
  const alias = aliases[key];
  return alias && Number.isFinite(profile?.[alias]) ? profile[alias] : 0;
};

const vectorSimilarity = (a, b, keys = VECTOR_KEYS) => {
  if (!keys.length) return 0;
  let squared = 0;
  let weightTotal = 0;

  const weights = {
    freshness: 1.35, sweetness: 1.20, warmth: 1.15,
    darkness: 0.95, airiness: 0.90, cleanliness: 1.05,
    creaminess: 0.75, dryness: 0.75, fruitiness: 0.80,
    spiciness: 0.85, woodiness: 1.00, aromaticity: 1.10,
    florality: 0.80, gourmandness: 0.95, citrus: 0.90, aquatic: 0.85,
    powdery: 0.65, projection: 0.70, longevity: 0.55,
    office: 0.55, casual: 0.45, date: 0.55, evening: 0.55,
    elegance: 0.75, versatility: 0.60,
  };

  keys.forEach((key) => {
    const weight = weights[key] || 1;
    const diff = getVectorValue(a, key) - getVectorValue(b, key);
    squared += diff * diff * weight;
    weightTotal += weight;
  });

  const rms = Math.sqrt(squared / Math.max(weightTotal, 1));
  return clamp(1 - rms / 7.2, 0, 1);
};

const buildReferenceTarget = (anchorProfile, modifiers = []) => {
  const target = {};
  VECTOR_KEYS.forEach((key) => {
    target[key] = getVectorValue(anchorProfile, key);
  });

  if (modifiers.includes("fresher")) {
    target.freshness = clamp(target.freshness + 3.0);
    target.airiness = clamp(target.airiness + 1.8);
    target.cleanliness = clamp(target.cleanliness + 1.3);
    target.warmth = clamp(target.warmth - 1.7);
    target.sweetness = clamp(target.sweetness - 1.2);
    target.darkness = clamp(target.darkness - 1.4);
  }

  if (modifiers.includes("less-sweet")) {
    target.sweetness = clamp(target.sweetness - 2.4);
    target.gourmandness = clamp(target.gourmandness - 1.5);
    target.airiness = clamp(target.airiness + 0.7);
  }

  if (modifiers.includes("lighter")) {
    target.projection = clamp(target.projection - 1.8);
    target.darkness = clamp(target.darkness - 1.2);
    target.airiness = clamp(target.airiness + 1.2);
  }

  if (modifiers.includes("stronger")) {
    target.projection = clamp(target.projection + 1.8);
    target.longevity = clamp(target.longevity + 1.2);
  }

  if (modifiers.includes("more-elegant")) {
    target.elegance = clamp(target.elegance + 1.8);
    target.cleanliness = clamp(target.cleanliness + 0.8);
    target.versatility = clamp(target.versatility + 0.5);
  }

  return target;
};

const profileSimilarity = (a, b) => vectorSimilarity(a, b);

const scoreProduct = (product, intent, productCopy, productWearContext, discoveryProfiles) => {
  const profile = buildProductProfile(product, productCopy, productWearContext, discoveryProfiles);
  const notes = profile.notes;
  const reasons = [];
  const penalties = [];
  let score = 38;

  const selectedSize = chooseSizeForBudget(product, intent.maxPrice);
  if (Number.isFinite(intent.maxPrice) && !selectedSize) {
    return { score: -Infinity, selectedSize: null, profile, reasons: [], penalties: ["over-budget"] };
  }

  // Explicit hard note exclusions are truly hard.
  if (intent.hardExcludedNotes.some((note) => notes.includes(note))) {
    return { score: -Infinity, selectedSize: null, profile, reasons: [], penalties: ["hard-excluded-note"] };
  }

  if (Number.isFinite(intent.maxPrice)) {
    score += 12;
    reasons.push("budget");
  }

  if (intent.categories.length) {
    if (intent.categories.includes(product.category)) {
      score += 18;
      reasons.push("category");
    } else {
      score -= 24;
      penalties.push("category");
    }
  }

  if (intent.seasons.length) {
    const seasonMatch = intent.seasons.includes(product.season) || product.season === "all";
    if (seasonMatch) {
      score += product.season === "all" ? 9 : 16;
      reasons.push("season");
    } else {
      score -= 24;
      penalties.push("season");
    }
  }

  intent.moods.forEach((mood) => {
    if (product?.moods?.includes(mood)) {
      score += 12;
      reasons.push(`mood:${mood}`);
    } else {
      score -= 3;
    }
  });

  intent.positiveTraits.forEach(({ key, strength }) => {
    const value = profile[key] || 0;

    if (strength === "moderate") {
      // "Sweet, but not too sweet" needs a real target band rather than
      // a generic middle-of-the-road bonus. Too dry and too sugary both lose.
      if (key === "sweet") {
        const target = 5.2;
        const distance = Math.abs(value - target);
        score += Math.max(0, 18 - distance * 4.2);

        if (value < 3.6) {
          score -= (3.6 - value) * 7.0;
          penalties.push("not-sweet-enough");
        } else if (value > 6.4) {
          score -= (value - 6.4) * 10.0;
          penalties.push("too-sweet");
        } else {
          reasons.push(`balanced:${key}`);
        }
        return;
      }

      const target = 5.5;
      const distance = Math.abs(value - target);
      score += Math.max(0, 12 - distance * 3.0);
      if (value >= 3.8 && value <= 7.0) reasons.push(`balanced:${key}`);
      return;
    }

    const targetWeight = strength === "high" ? 2.15 : 1.55;
    score += value * targetWeight;
    if (value >= 5.5) reasons.push(`trait:${key}`);
  });

  intent.negativeTraits.forEach(({ key }) => {
    const value = profile[key] || 0;
    if (value > 5.5) {
      score -= (value - 5.5) * 9;
      penalties.push(`too:${key}`);
    } else {
      score += 5;
      reasons.push(`balanced:${key}`);
    }
  });

  if (intent.requiredNotes.length) {
    const matches = notes.filter((note) => intent.requiredNotes.includes(note)).length;
    score += matches * 10;
    if (matches) reasons.push("notes");
  }

  if (intent.excludedNotes.length) {
    const matches = notes.filter((note) => intent.excludedNotes.includes(note)).length;
    if (matches) {
      score -= matches * 34;
      penalties.push("excluded-note");
    } else {
      score += 6;
      reasons.push("avoids-note");
    }
  }

  // Wear-context is now a first-class signal, not an inferred afterthought.
  if (intent.contexts.includes("office")) {
    score += profile.office * 3.0;
    if (includesAny(profile.wearText, ["work", "posao", "office", "meeting", "sastanak"])) score += 12;
    if (profile.intensity > 8.3) score -= 10;
    reasons.push("context:office");
  }

  if (intent.contexts.includes("elegant")) {
    score += profile.elegance * 2.6;
    if (includesAny(profile.semanticText, TEXT_SIGNALS.elegant)) score += 8;
    reasons.push("context:elegant");
  }

  if (intent.contexts.includes("evening")) {
    score += profile.evening * 2.4;
    if (includesAny(profile.wearText, ["evening", "night", "vece", "vecer", "izlazak"])) score += 8;
    reasons.push("context:evening");
  }

  if (intent.contexts.includes("date")) {
    score += (profile.date ?? profile.seduction) * 2.4 + profile.seduction * 0.8 + profile.evening * 0.7;
    if (includesAny(profile.wearText, ["date", "dejt", "romantic"])) score += 12;
    reasons.push("context:date");
  }

  if (intent.contexts.includes("everyday")) {
    score += profile.versatility * 1.7 + (profile.casual ?? profile.versatility) * 0.9;
    if (includesAny(profile.wearText, ["everyday", "svaki dan", "daily", "all day", "celodnev"])) score += 10;
    reasons.push("context:everyday");
  }

  if (intent.gender === "masculine") {
  const masculine = profile.masculine ?? 5;
  const feminine = profile.feminine ?? 5;

  score += masculine * 3.4;
  score -= feminine * 1.5;

  if (masculine >= feminine) {
    reasons.push("gender:masculine");
  }
}

if (intent.gender === "feminine") {
  const masculine = profile.masculine ?? 5;
  const feminine = profile.feminine ?? 5;

  score += feminine * 3.4;
  score -= masculine * 1.5;

  if (feminine >= masculine) {
    reasons.push("gender:feminine");
  }
}

if (intent.gender === "unisex") {
  const masculine = profile.masculine ?? 5;
  const feminine = profile.feminine ?? 5;
  const unisex = profile.unisex ?? 5;
  const genderGap = Math.abs(masculine - feminine);

  score += unisex * 3.0;
  score -= genderGap * 3.0;

  if (genderGap <= 3.5) {
    reasons.push("gender:unisex");
  }
}

  if (intent.referenceProduct) {
    const anchor = intent.referenceProduct;
    const anchorProfile = buildProductProfile(anchor, productCopy, productWearContext, discoveryProfiles);
    const noteSimilarity = setSimilarity(notes, anchorProfile.notes);
    const moodSimilarity = setSimilarity(product?.moods || [], anchor?.moods || []);
    const scentSimilarity = profileSimilarity(profile, anchorProfile);
    const referenceTarget = buildReferenceTarget(anchorProfile, intent.referenceModifiers);
    const targetSimilarity = vectorSimilarity(profile, referenceTarget);
    const isAnchor = product.id === anchor.id;

    // The reference is the measuring stick, not a recommendation.
    // If the user asks for "something like X", X itself must never appear.
    if (isAnchor) {
      return {
        score: -Infinity,
        selectedSize: null,
        profile,
        reasons: [],
        penalties: ["reference-anchor"],
      };
    }

    const curatedForward = anchor?.recommendations?.includes(product.slug);
    const curatedReverse = product?.recommendations?.includes(anchor.slug);

    // V3: similarity is measured as a fragrance vector, while note overlap and
    // curated relationships preserve recognizable DNA. Relative modifiers are
    // applied to the reference vector itself (e.g. Naxos -> fresher target).
    if (intent.referenceModifiers.length > 0) {
      const anchorRetention = Math.max(
        scentSimilarity,
        noteSimilarity * 1.15,
        curatedForward || curatedReverse ? 0.72 : 0
      );

      if (anchorRetention < 0.44) {
        return {
          score: -Infinity,
          selectedSize: null,
          profile,
          reasons: [],
          penalties: ["weak-reference-retention"],
        };
      }
    }

    score += noteSimilarity * 24;
    score += moodSimilarity * 7;
    score += scentSimilarity * (intent.referenceModifiers.length ? 20 : 36);
    score += targetSimilarity * (intent.referenceModifiers.length ? 54 : 8);

    if (noteSimilarity >= 0.16 || curatedForward || curatedReverse) {
      reasons.push("similar-profile");
    }

    if (curatedForward) {
      score += 14;
      reasons.push("curated-related");
    }
    if (curatedReverse) score += 8;

    // Relative modifiers are now target-vector transformations.
    if (intent.referenceModifiers.includes("fresher")) {
      const delta = profile.freshness - anchorProfile.freshness;
      const targetFreshness = referenceTarget.freshness;

      if (delta < 0.75) {
        return {
          score: -Infinity,
          selectedSize: null,
          profile,
          reasons: [],
          penalties: ["not-fresher-than-reference"],
        };
      }

      // Reward being near the transformed target, not simply being maximally fresh.
      const freshDistance = Math.abs(profile.freshness - targetFreshness);
      score += Math.max(0, 18 - freshDistance * 4.0);
      reasons.push("modifier:fresher");

      if (getVectorValue(profile, "warmth") > getVectorValue(anchorProfile, "warmth") + 0.25) score -= 14;
      if (getVectorValue(profile, "sweetness") > getVectorValue(anchorProfile, "sweetness") + 0.25) score -= 14;
    }

    if (intent.referenceModifiers.includes("less-sweet")) {
      const delta = getVectorValue(anchorProfile, "sweetness") - getVectorValue(profile, "sweetness");
      if (delta < 0.8) score -= 16;
      else score += Math.min(delta * 3.5, 14);
    }

    if (intent.referenceModifiers.includes("lighter")) {
      const delta = getVectorValue(anchorProfile, "projection") - getVectorValue(profile, "projection");
      if (delta < 0.6) score -= 14;
      else score += Math.min(delta * 3.5, 14);
    }

    if (intent.referenceModifiers.includes("stronger")) {
      const delta = getVectorValue(profile, "projection") - getVectorValue(anchorProfile, "projection");
      if (delta < 0.6) score -= 14;
      else score += Math.min(delta * 3.5, 14);
    }

    if (intent.referenceModifiers.includes("more-elegant")) {
      const delta = profile.elegance - anchorProfile.elegance;
      if (delta < 0.5) score -= 12;
      else score += Math.min(delta * 3.5, 12);
    }
  }

  if (Number.isFinite(Number(product.rating))) {
    score += (Number(product.rating) - 7) * 1.2;
  }

  return {
    score,
    selectedSize: selectedSize || chooseSizeForBudget(product, null),
    profile,
    reasons: unique(reasons),
    penalties: unique(penalties),
  };
};


// ============================================================
// PLAYNICE FRAGRANCE INTELLIGENCE — INTENT GUARD V2
// Replace the current block from:
//   const DISCOVERY_DOMAIN_CUES = [
// through the end of:
//   const discoveryQueryFeedback = (...)
// Keep humanReason(...) immediately after this block.
// ============================================================

const EXPLICIT_FRAGRANCE_CUES = [
  "parfem", "parfema", "parfemi", "miris", "mirisa", "mirisi",
  "fragrance", "fragrances", "perfume", "perfumes", "scent", "scents",
  "dekant", "dekanti", "decant", "decants"
];

const TECHNICAL_FRAGRANCE_CUES = [
  "projekcija", "projection", "trajnost", "longevity",
  "signature scent", "signature miris", "sillage"
];

const GENDER_DISCOVERY_CUES = [
  "muski", "muški", "zenski", "ženski", "unisex",
  "za njega", "za nju", "for him", "for her"
];

const GIFT_DISCOVERY_CUES = [
  "poklon", "gift"
];

// These are not blanket-banned words. They only lower confidence when the
// query has no strong fragrance anchor. So "perfume for a summer vacation"
// still works, while "summer vacation in Greece" does not.
const NON_FRAGRANCE_CUES = [
  "chair", "stolica", "sto", "table",
  "laptop", "telefon", "phone", "mobile", "tablet",
  "tv", "televizor", "monitor",
  "patike", "cipele", "shoes", "majica", "shirt",
  "hotel", "restaurant", "restoran",
  "weather", "vreme", "vrijeme", "forecast", "prognoza",
  "football", "fudbal", "soccer", "basketball", "kosarka", "košarka",
  "recipe", "recept", "palacinke", "palačinke",
  "vacation", "odmor", "letovanje", "ljetovanje",
  "greece", "grcka", "grčka",
  "srbija", "serbia",
  "trava", "grass",
  "car", "auto", "automobil",
  "tyre", "tyres", "tire", "tires", "guma", "gume",
];

const includesWholeCue = (text, values = []) =>
  values.some((value) => {
    const cue = normalizeText(value);

    return (
      text === cue ||
      text.startsWith(`${cue} `) ||
      text.endsWith(` ${cue}`) ||
      text.includes(` ${cue} `)
    );
  });

const hasDiscoveryIntent = (intent) => {
  if (!intent) return false;

  return Boolean(
    intent.referenceProduct ||
    intent.gender ||
    intent.maxPrice != null ||
    intent.seasons?.length ||
    intent.categories?.length ||
    intent.moods?.length ||
    intent.positiveTraits?.length ||
    intent.negativeTraits?.length ||
    intent.requiredNotes?.length ||
    intent.excludedNotes?.length ||
    intent.hardExcludedNotes?.length ||
    intent.contexts?.length ||
    intent.referenceModifiers?.length
  );
};

const getDiscoveryIntentConfidence = (rawQuery, intent) => {
  const text = normalizeText(rawQuery);
  let score = 0;

  const hasExplicitFragranceCue = includesAny(text, EXPLICIT_FRAGRANCE_CUES);
  const hasTechnicalCue = includesAny(text, TECHNICAL_FRAGRANCE_CUES);
  const hasGenderCue = includesAny(text, GENDER_DISCOVERY_CUES);
  const hasGiftCue = includesAny(text, GIFT_DISCOVERY_CUES);
  const hasNonFragranceCue = includesWholeCue(text, NON_FRAGRANCE_CUES);

  const traitCount =
    (intent?.positiveTraits?.length || 0) +
    (intent?.negativeTraits?.length || 0);

  const noteCount =
    (intent?.requiredNotes?.length || 0) +
    (intent?.excludedNotes?.length || 0) +
    (intent?.hardExcludedNotes?.length || 0);

  if (hasExplicitFragranceCue) score += 5;
  if (intent?.referenceProduct) score += 5;
  if (noteCount) score += 3;
  if (intent?.categories?.length) score += 3;

  score += Math.min(4, traitCount * 1.8);
  score += Math.min(3, (intent?.moods?.length || 0) * 1.5);
  score += Math.min(3, (intent?.contexts?.length || 0) * 1.5);
  score += Math.min(2, (intent?.seasons?.length || 0) * 1.0);

  if (intent?.maxPrice != null) score += 0.8;
  if (intent?.referenceModifiers?.length) score += 1.5;
  if (hasTechnicalCue) score += 2.2;
  if (hasGenderCue) score += 1.5;
  if (hasGiftCue) score += 1.3;

  const hasStrongFragranceAnchor = Boolean(
    hasExplicitFragranceCue ||
    intent?.referenceProduct ||
    noteCount ||
    intent?.categories?.length ||
    hasTechnicalCue
  );

  if (hasNonFragranceCue) {
    score -= hasStrongFragranceAnchor ? 0.5 : 5.5;
  }

  return {
    score,
    isRelevant: score >= 1.5,
    hasExplicitFragranceCue,
    hasNonFragranceCue,
  };
};

const discoveryQueryFeedback = (rawQuery, intent, lang = "sr") => {
  const trimmed = String(rawQuery || "").trim();

  if (trimmed.length < 3) {
    return lang === "sr"
      ? "Napiši malo više — stil, priliku, budžet, note ili miris koji voliš."
      : "Tell us a little more — style, occasion, budget, notes, or a scent you love.";
  }

  const confidence = getDiscoveryIntentConfidence(rawQuery, intent);

  if (hasDiscoveryIntent(intent) && confidence.isRelevant) {
    return "";
  }

  // Explicit fragrance language is also enough even when the parser does not
  // recognize a more specific scoring signal.
  if (confidence.hasExplicitFragranceCue && !confidence.hasNonFragranceCue) {
    return "";
  }

  return lang === "sr"
    ? "Ovo ne liči na zahtev za parfem. Probaj: prilika, stil, budžet, note ili miris koji već voliš."
    : "That doesn't look like a fragrance request. Try an occasion, style, budget, notes, or a scent you already love.";
};

const humanReason = (product, result, intent, lang = "sr", rankIndex = 0) => {
  const p = result.profile || {};
  const reasonSet = new Set(result.reasons || []);

  const traits = [
    ["freshness", p.freshness],
    ["clean", p.clean ?? p.cleanliness],
    ["elegance", p.elegance],
    ["woody", p.woody ?? p.woodiness],
    ["aromatic", p.aromatic ?? p.aromaticity],
    ["aquatic", p.aquatic],
    ["warm", p.warm ?? p.warmth],
    ["sweet", p.sweet ?? p.sweetness],
    ["projection", p.projection ?? p.intensity],
    ["versatility", p.versatility],
  ]
    .filter(([, value]) => Number.isFinite(value))
    .sort((a, b) => b[1] - a[1]);

  const primary = traits[0]?.[0] || "versatility";
  const secondary = traits.find(([key]) => key !== primary)?.[0] || "elegance";

  const traitLine = {
    sr: {
      freshness: "Svežiji profil daje mu lakoću i energiju.",
      clean: "Čist, uredan karakter čini ga vrlo lakim za nošenje.",
      elegance: "Uglađen karakter mu daje ozbiljniji, premium utisak.",
      woody: "Drvenasta osnova daje mu stabilnost i karakter.",
      aromatic: "Aromatični profil ga čini modernim i prepoznatljivim.",
      aquatic: "Vodena svežina daje mu prozračan, čist utisak.",
      warm: "Topliji profil daje mu dubinu i prisutnost.",
      sweet: "Kontrolisana slatkoća donosi dopadljivost bez preterivanja.",
      projection: "Ima dovoljno prisutnosti da se primeti bez grubosti.",
      versatility: "Svestran profil ga čini sigurnim izborom u više situacija.",
    },
    en: {
      freshness: "Its fresher profile brings lift and energy.",
      clean: "A clean, polished character keeps it effortless to wear.",
      elegance: "Its refined character gives it a more premium presence.",
      woody: "A woody backbone gives it structure and character.",
      aromatic: "Its aromatic profile feels modern and distinctive.",
      aquatic: "Aquatic freshness keeps it airy and clean.",
      warm: "A warmer profile adds depth and presence.",
      sweet: "Controlled sweetness adds appeal without becoming heavy.",
      projection: "It has enough presence to be noticed without feeling loud.",
      versatility: "Its versatility makes it an easy choice across different settings.",
    },
  };

  const contextLine = [];
  if (reasonSet.has("modifier:fresher")) {
    contextLine.push(
      lang === "sr"
        ? "Čuva deo karaktera reference, ali ide primetno svežije."
        : "It keeps part of the reference DNA while moving noticeably fresher."
    );
  }
  if (reasonSet.has("similar-profile")) {
    contextLine.push(
      lang === "sr"
        ? "Mirisni profil ostaje blizak onome što tražiš."
        : "Its scent profile stays close to what you asked for."
    );
  }
  if (reasonSet.has("context:office")) {
    contextLine.push(
      lang === "sr"
        ? "Odlično se uklapa u posao i dnevno nošenje."
        : "It fits work and daytime wear especially well."
    );
  }
  if (reasonSet.has("context:date")) {
    contextLine.push(
      lang === "sr"
        ? "Ima dobar balans privlačnosti i elegancije za dejt."
        : "It balances attraction and polish nicely for a date."
    );
  }
  if (reasonSet.has("context:evening")) {
    contextLine.push(
      lang === "sr"
        ? "Ima dovoljno dubine i prisutnosti za večernje nošenje."
        : "It has enough depth and presence for evening wear."
    );
  }
  if (reasonSet.has("context:elegant")) {
    contextLine.push(
      lang === "sr"
        ? "Uglađeniji karakter odgovara elegantnijem briefu."
        : "Its polished character suits a more elegant brief."
    );
  }
  if (reasonSet.has("season")) {
    contextLine.push(
      lang === "sr"
        ? "Profil dobro odgovara traženoj sezoni."
        : "Its profile suits the requested season well."
    );
  }
  if (reasonSet.has("balanced:citrus")) {
    contextLine.push(
      lang === "sr"
        ? "Ostaje svež bez preterane citrusnosti."
        : "It stays fresh without leaning too citrus-heavy."
    );
  }
  if (reasonSet.has("balanced:sweet")) {
    contextLine.push(
      lang === "sr"
        ? "Slatkoća ostaje pod kontrolom."
        : "Its sweetness stays nicely controlled."
    );
  }
  if (reasonSet.has("avoids-note")) {
    contextLine.push(
      lang === "sr"
        ? "Izbegava notu koju si isključio."
        : "It avoids the note you excluded."
    );
  }
  if (reasonSet.has("budget") && result.selectedSize) {
    contextLine.push(
      lang === "sr"
        ? `${result.selectedSize.size} ostaje unutar budžeta.`
        : `${result.selectedSize.size} stays inside your budget.`
    );
  }

  const context = contextLine[rankIndex % Math.max(contextLine.length, 1)] || "";
  const trait = traitLine[lang]?.[primary] || traitLine.en[primary];
  const trait2 = traitLine[lang]?.[secondary] || traitLine.en[secondary];

  const lines = [context, trait, trait2].filter(Boolean);
  return lines.slice(0, 2).join(" ");
};

export const discoverFragrances = ({
  query,
  products,
  productCopy = {},
  productWearContext = {},
  discoveryProfiles = {},
  lang = "sr",
  limit = 5,
}) => {
  const intent = parseQuery(query, products);
  const feedback = discoveryQueryFeedback(query, intent, lang);

  if (feedback) {
    return {
      query,
      intent,
      results: [],
      feedback,
      isRelevant: false,
    };
  }

  const scored = products
    .map((product) => {
      const result = scoreProduct(
        product,
        intent,
        productCopy,
        productWearContext,
        discoveryProfiles
      );

      return { product, ...result };
    })
    .filter((item) => Number.isFinite(item.score))
    .sort((a, b) => b.score - a.score);

  const bestScore = scored[0]?.score ?? 0;

  const relevanceFloor = Math.max(
    42,
    bestScore * 0.72
  );

  cconst relevant = scored.filter(
    (item, index) =>
      index < 5 ||
      item.score >= relevanceFloor
  );

  const ranked = relevant
    .slice(0, Math.max(1, limit))
    .map((item, index, all) => {
      const bestScore = all[0]?.score || item.score;
      const normalizedMatch = clamp(
        72 + (item.score / Math.max(bestScore, 1)) * 24 - index * 1.5,
        58,
        96
      );

      return {
        product: item.product,
        score: Number(item.score.toFixed(2)),
        match: Math.round(normalizedMatch),
        selectedSize: item.selectedSize,
        reason: humanReason(item.product, item, intent, lang, index),
        profile: item.profile,
        signals: item.reasons,
      };
    });

  return {
    query,
    intent,
    results: ranked,
    feedback: "",
    isRelevant: true,
  };
};

export { buildProductProfile, parseQuery };