/* =========================================
   PLAYNICE DISCOVERY ENGINE — V1.1
   Deterministic, local, zero-API-cost ranking.
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

const buildProductProfile = (product) => {
  const notes = flattenNotes(product);
  const moods = new Set(product?.moods || []);

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

  // Existing curated PlayNice moods are strong signals and should outweigh raw note inference.
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

  const freshness = clamp(
    profile.citrus * 0.34 +
      profile.aquatic * 0.28 +
      profile.aromatic * 0.18 +
      profile.clean * 0.2 -
      profile.gourmand * 0.14 -
      profile.warm * 0.08
  );

  return {
    ...profile,
    freshness,
    notes,
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
    date: ["date", "dejt", "izlazak", "vecernji izlazak", "vecernje", "vece", "uvece", "evening", "night out", "romantic", "romanticno"],
    rich: ["rich", "bogato", "luksuzno", "luxury", "opulent", "mocno", "powerful", "jako", "strong"],
    soft: ["soft", "nezan", "nezno", "blag", "blago", "subtle", "diskretno", "nenapadno", "not loud"],
    signature: ["signature", "svaki dan", "everyday", "daily", "versatile", "univerzalno"],
  },
  trait: {
    freshness: ["fresh", "sveze", "svez", "sveza", "osvezavajuce", "refreshing"],
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
  },
};

const NEGATION_MARKERS = [
  "ne previse", "ne previše", "nije previse", "nije previše", "not too",
  "bez", "without", "izbegni", "izbjegni", "avoid", "ne volim", "dont like",
  "do not like", "nikako", "no ", "ne bude", "da ne bude", "nije", "not"
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

    const before = text.slice(0, index).trim().split(" ").slice(-2).join(" ");
    if (NEGATION_MARKERS.some((marker) => before.includes(marker))) return true;
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
    contexts: [],
    referenceProduct: null,
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

  if (includesAny(text, ["office", "posao", "kancelarija", "work", "workplace"])) intent.contexts.push("office");
  if (includesAny(text, ["elegantno", "elegantan", "elegantna", "elegant", "classy", "sofisticirano", "sophisticated"])) intent.contexts.push("elegant");
  if (includesAny(text, ["vece", "uvece", "vecernji", "vecernje", "evening", "night"])) intent.contexts.push("evening");

  // Phrases such as "slatko ali ne previše" mean "some sweetness, but controlled".
  Object.entries(QUERY_DICTIONARY.trait).forEach(([key, aliases]) => {
    for (const alias of aliases) {
      const a = normalizeText(alias);
      const idx = text.indexOf(a);
      if (idx === -1) continue;
      const after = text.slice(idx + a.length, idx + a.length + 24);
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

    if (detectNegativeTrait(text, aliases)) {
      intent.excludedNotes.push(...keys);
    } else {
      intent.requiredNotes.push(...keys);
    }
  });

  // Reference matching activates only when the query actually expresses
  // similarity/liking intent. Exact catalogue names/short names outrank inspired-by DNA.
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
  intent.seasons = unique(intent.seasons);
  intent.categories = unique(intent.categories);
  intent.moods = unique(intent.moods);
  intent.requiredNotes = unique(intent.requiredNotes);
  intent.excludedNotes = unique(intent.excludedNotes);
  intent.contexts = unique(intent.contexts);

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

const profileSimilarity = (a, b) => {
  const keys = ["freshness", "citrus", "aquatic", "sweet", "woody", "spicy", "aromatic", "floral", "warm", "gourmand", "clean", "powdery"];
  const distance = keys.reduce((sum, key) => sum + Math.abs((a[key] || 0) - (b[key] || 0)), 0);
  return clamp(10 - distance / keys.length, 0, 10) / 10;
};

const scoreProduct = (product, intent) => {
  const profile = buildProductProfile(product);
  const notes = profile.notes;
  const reasons = [];
  const penalties = [];
  let score = 42;

  const selectedSize = chooseSizeForBudget(product, intent.maxPrice);
  if (Number.isFinite(intent.maxPrice) && !selectedSize) {
    return { score: -Infinity, selectedSize: null, profile, reasons: [], penalties: ["over-budget"] };
  }

  if (Number.isFinite(intent.maxPrice)) {
    score += 12;
    reasons.push("budget");
  }

  if (intent.categories.length) {
    if (intent.categories.includes(product.category)) {
      score += 16;
      reasons.push("category");
    } else {
      score -= 18;
      penalties.push("category");
    }
  }

  if (intent.seasons.length) {
    const seasonMatch = intent.seasons.includes(product.season) || product.season === "all";
    if (seasonMatch) {
      score += product.season === "all" ? 10 : 15;
      reasons.push("season");
    } else {
      score -= 20;
      penalties.push("season");
    }
  }

  intent.moods.forEach((mood) => {
    if (product?.moods?.includes(mood)) {
      score += 11;
      reasons.push(`mood:${mood}`);
    } else {
      score -= 3;
    }
  });

  intent.positiveTraits.forEach(({ key, strength }) => {
    const value = profile[key] || 0;

    if (strength === "moderate") {
      // Reward a noticeable amount of the trait, but penalize excess.
      score += Math.min(value, 6.5) * 1.4;
      if (value > 7) score -= (value - 7) * 7;
      if (value >= 3.5 && value <= 7) reasons.push(`balanced:${key}`);
      return;
    }

    const targetWeight = strength === "high" ? 1.8 : 1.35;
    score += value * targetWeight;
    if (value >= 5.5) reasons.push(`trait:${key}`);
  });

  intent.negativeTraits.forEach(({ key }) => {
    const value = profile[key] || 0;
    // "not too X" is a soft ceiling, not a hard exclusion.
    if (value > 6.0) {
      score -= (value - 6.0) * 7;
      penalties.push(`too:${key}`);
    } else {
      score += 4;
      reasons.push(`balanced:${key}`);
    }

    // Existing curated mood data is a stronger signal than raw note counts.
    if (key === "warm" && product?.moods?.includes("rich")) score -= 14;
    if (key === "sweet" && product?.moods?.includes("rich") && value >= 5) score -= 7;
  });

  if (intent.requiredNotes.length) {
    const matches = notes.filter((note) => intent.requiredNotes.includes(note)).length;
    score += matches * 8;
    if (matches) reasons.push("notes");
  }

  if (intent.excludedNotes.length) {
    const matches = notes.filter((note) => intent.excludedNotes.includes(note)).length;
    if (matches) {
      score -= matches * 28;
      penalties.push("excluded-note");
    } else {
      score += 5;
      reasons.push("avoids-note");
    }
  }

  if (intent.contexts.includes("office")) {
    score += profile.clean * 1.25 + profile.freshness * 0.7;
    if (product?.moods?.includes("soft")) score += 8;
    if (product?.moods?.includes("clean")) score += 8;
    if (product?.moods?.includes("rich")) score -= 10;
    if (profile.warm > 7) score -= 8;
    reasons.push("context:office");
  }

  if (intent.contexts.includes("elegant")) {
    score += profile.woody * 0.55 + profile.clean * 0.55 + profile.aromatic * 0.35;
    if (product?.moods?.includes("signature")) score += 6;
    if (profile.gourmand > 7.5) score -= 5;
    reasons.push("context:elegant");
  }

  if (intent.contexts.includes("evening")) {
    if (product?.moods?.includes("date")) score += 10;
    if (product?.moods?.includes("rich")) score += 5;
    score += profile.warm * 0.45 + profile.woody * 0.25;
    reasons.push("context:evening");
  }

  if (intent.referenceProduct) {
    const anchor = intent.referenceProduct;
    const anchorProfile = buildProductProfile(anchor);
    const noteSimilarity = setSimilarity(notes, anchorProfile.notes);
    const moodSimilarity = setSimilarity(product?.moods || [], anchor?.moods || []);
    const scentSimilarity = profileSimilarity(profile, anchorProfile);
    const isAnchor = product.id === anchor.id;

    score += noteSimilarity * 34;
    score += moodSimilarity * 20;
    score += scentSimilarity * 18;

    if (isAnchor) {
      // When the user asks for something like a fragrance, prioritize alternatives
      // rather than simply returning the anchor itself as the first answer.
      score -= 18;
      reasons.push("reference-anchor");
    } else if (noteSimilarity >= 0.22 || moodSimilarity >= 0.65) {
      reasons.push("similar-profile");
    }

    if (anchor?.recommendations?.includes(product.slug)) {
      score += 18;
      reasons.push("curated-related");
    }

    if (product?.recommendations?.includes(anchor.slug)) {
      score += 8;
    }
  }

  // Rating is only a tie-breaker; it must never overpower scent fit.
  if (Number.isFinite(Number(product.rating))) {
    score += (Number(product.rating) - 7) * 1.6;
  }

  return {
    score,
    selectedSize: selectedSize || chooseSizeForBudget(product, null),
    profile,
    reasons: unique(reasons),
    penalties: unique(penalties),
  };
};

const humanReason = (product, result, intent, lang = "sr") => {
  const p = result.profile;
  const reasonSet = new Set(result.reasons);
  const pieces = [];

  if (reasonSet.has("reference-anchor")) {
    pieces.push(
      lang === "sr"
        ? `Najdirektnija veza sa ${intent.referenceProduct?.inspiredBy?.name || intent.referenceProduct?.shortName || intent.referenceProduct?.name}.`
        : `The closest direct link to ${intent.referenceProduct?.inspiredBy?.name || intent.referenceProduct?.shortName || intent.referenceProduct?.name}.`
    );
  } else if (reasonSet.has("similar-profile")) {
    pieces.push(lang === "sr" ? "Vrlo sličan mirisni karakter traženom profilu." : "A closely related scent profile.");
  }

  if (reasonSet.has("season")) {
    pieces.push(lang === "sr" ? "Odgovara traženoj sezoni." : "Fits the requested season.");
  }

  if (reasonSet.has("mood:date")) pieces.push(lang === "sr" ? "Dobar izbor za veče i izlazak." : "Well suited to evenings and dates.");
  if (reasonSet.has("mood:clean")) pieces.push(lang === "sr" ? "Čist, uredan karakter." : "Clean, polished character.");
  if (reasonSet.has("mood:soft")) pieces.push(lang === "sr" ? "Ne ide u agresivnom smeru." : "Keeps the profile restrained rather than loud.");
  if (reasonSet.has("context:office")) pieces.push(lang === "sr" ? "Uredan profil za posao i zatvoren prostor." : "A polished profile for work and indoor wear.");
  if (reasonSet.has("context:elegant")) pieces.push(lang === "sr" ? "Deluje elegantno i sređeno." : "Reads polished and elegant.");
  if (reasonSet.has("context:evening")) pieces.push(lang === "sr" ? "Ima više prisustva za večernje nošenje." : "Carries more presence for evening wear.");
  if (reasonSet.has("trait:freshness")) pieces.push(lang === "sr" ? "Visoka svežina." : "Strong freshness.");
  if (reasonSet.has("trait:woody")) pieces.push(lang === "sr" ? "Izražen drvenasti karakter." : "A clear woody character.");
  if (reasonSet.has("trait:aquatic")) pieces.push(lang === "sr" ? "Vodeno/morski karakter." : "Aquatic/marine character.");
  if (reasonSet.has("balanced:citrus")) pieces.push(lang === "sr" ? "Svež bez preterane citrusnosti." : "Fresh without becoming overly citrus-driven.");
  if (reasonSet.has("balanced:sweet")) pieces.push(lang === "sr" ? "Slatkoća ostaje pod kontrolom." : "Sweetness stays under control.");
  if (reasonSet.has("avoids-note")) pieces.push(lang === "sr" ? "Izbegava notu koju si isključio." : "Avoids the note you excluded.");
  if (reasonSet.has("category")) pieces.push(lang === "sr" ? `Pogađa traženu ${product.category} kategoriju.` : `Matches the requested ${product.category} category.`);
  if (reasonSet.has("budget") && result.selectedSize) pieces.push(lang === "sr" ? `${result.selectedSize.size} ostaje unutar budžeta.` : `${result.selectedSize.size} stays within budget.`);

  if (!pieces.length) {
    const dominant = [
      ["freshness", p.freshness], ["clean", p.clean], ["woody", p.woody],
      ["aromatic", p.aromatic], ["warm", p.warm], ["sweet", p.sweet]
    ].sort((a, b) => b[1] - a[1])[0]?.[0];

    const fallback = {
      sr: {
        freshness: "Svež i lako nosiv profil.", clean: "Čist i uredan profil.", woody: "Drvenast i stabilan karakter.",
        aromatic: "Aromatičan i nosiv karakter.", warm: "Topao i bogat karakter.", sweet: "Mekši, slađi karakter."
      },
      en: {
        freshness: "Fresh and easy-wearing profile.", clean: "Clean and polished profile.", woody: "A grounded woody character.",
        aromatic: "Aromatic and wearable character.", warm: "Warm, rich character.", sweet: "A softer, sweeter character."
      }
    };
    pieces.push(fallback[lang]?.[dominant] || fallback.en[dominant] || "Strong overall match.");
  }

  return pieces.slice(0, 3).join(" ");
};

export const discoverFragrances = ({
  query,
  products,
  lang = "sr",
  limit = 5,
}) => {
  const intent = parseQuery(query, products);

  const ranked = products
    .map((product) => {
      const result = scoreProduct(product, intent);
      return { product, ...result };
    })
    .filter((item) => Number.isFinite(item.score))
    .sort((a, b) => b.score - a.score)
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
        reason: humanReason(item.product, item, intent, lang),
        profile: item.profile,
        signals: item.reasons,
      };
    });

  return {
    query,
    intent,
    results: ranked,
  };
};

export { buildProductProfile, parseQuery };