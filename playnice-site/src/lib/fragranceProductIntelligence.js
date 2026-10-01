import { discoveryProfiles } from "../data/products/discoveryProfiles";

export const normalizeProductIntelText = (value = "") =>
  String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "dj")
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const CONCENTRATION_WORDS = [
  "extrait de parfum",
  "eau de parfum",
  "eau de toilette",
  "parfum",
  "extrait",
  "edp",
  "edt",
];

const normalizeProductName = (value = "") => {
  let text = normalizeProductIntelText(value);
  CONCENTRATION_WORDS.forEach((word) => {
    text = text.replace(
      new RegExp(`(^|\\s)${normalizeProductIntelText(word)}(?=\\s|$)`, "g"),
      " "
    );
  });
  return text.replace(/\s+/g, " ").trim();
};

const isUsefulAlias = (alias) =>
  alias.length >= 4 || /^(9am|9pm|h24)$/.test(alias);

const getProductAliases = (product) => {
  const candidates = [
    product?.name,
    product?.shortName,
    product?.cardName,
    product?.modalName,
    String(product?.slug || "").replace(/-/g, " "),
  ]
    .filter(Boolean)
    .flatMap((value) => {
      const normalized = normalizeProductIntelText(value);
      const withoutConcentration = normalizeProductName(value);
      const compact = [normalized, withoutConcentration]
        .filter((alias) => /\d/.test(alias))
        .map((alias) => alias.replace(/\s+/g, ""));

      return [
        normalized,
        withoutConcentration,
        ...compact,
      ];
    })
    .filter(isUsefulAlias);

  return Array.from(new Set(candidates)).sort(
    (a, b) => b.length - a.length
  );
};

const hasBoundedAlias = (queryText, alias) => {
  const compactQuery = /\d/.test(alias)
    ? queryText.replace(/\s+/g, "")
    : "";

  return (
    queryText === alias ||
    queryText.startsWith(alias + " ") ||
    queryText.endsWith(" " + alias) ||
    queryText.includes(" " + alias + " ") ||
    (
      compactQuery &&
      (
        compactQuery === alias ||
        compactQuery.startsWith(alias) ||
        compactQuery.endsWith(alias) ||
        compactQuery.includes(alias)
      )
    )
  );
};

export const findCatalogProductsByQuery = (
  query,
  products = []
) => {
  const text = normalizeProductIntelText(query);

  const matches = products
    .map((product) => {
      const alias = getProductAliases(product).find((candidate) =>
        hasBoundedAlias(text, candidate)
      );
      return alias ? { product, alias } : null;
    })
    .filter(Boolean)
    .sort((a, b) => b.alias.length - a.alias.length);

  const seen = new Set();
  return matches
    .filter(({ product }) => {
      if (!product?.slug || seen.has(product.slug)) return false;
      seen.add(product.slug);
      return true;
    })
    .map(({ product }) => product);
};

const COMPARISON_CUES = [
  " ili ",
  " vs ",
  " versus ",
  "uporedi",
  "usporedi",
  "poredi",
  "razlika",
  "difference",
  "compare",
  "which is",
  "koji je",
  "koja je",
  "bolji",
  "bolja",
  "better",
];

const GROUNDING_CUES = [
  "koliko kosta",
  "koliko košta",
  "cena",
  "cijena",
  "price",
  "koliko je",
  "koje velicine",
  "koje veličine",
  "koje ml",
  "sizes",
  "size",
  "imate li",
  "ima li",
  "dostupan",
  "dostupna",
  "available",
  "note",
  "notes",
  "sastav",
  "sezona",
  "godisnje doba",
  "godišnje doba",
  "inspired by",
  "dna",
  "na sta lici",
  "na šta liči",
];

const SUITABILITY_CUES = [
  "za posao",
  "za kancelariju",
  "for work",
  "for office",
  "za dejt",
  "for date",
  "za izlazak",
  "for evening",
  "za vece",
  "za veče",
  "za svaki dan",
  "for everyday",
];

const containsAny = (text, cues) =>
  cues.some((cue) =>
    text.includes(normalizeProductIntelText(cue))
  );

const formatPrice = (value) => {
  const amount = Number(value);
  return Number.isInteger(amount)
    ? `${amount} €`
    : `${amount.toFixed(2).replace(".", ",")} €`;
};

const getSortedSizes = (product) =>
  Object.entries(product?.sizes || {}).sort(
    ([a], [b]) =>
      Number.parseInt(a, 10) - Number.parseInt(b, 10)
  );

const getRequestedMl = (query) => {
  const match = String(query || "").match(
    /(^|\s)(\d{1,3})\s*ml\b/i
  );
  return match ? `${Number(match[2])}ml` : "";
};

const getProfile = (product) =>
  discoveryProfiles[product?.slug] || null;

const DIMENSIONS = [
  {
    key: "freshness",
    cues: ["svjez", "svez", "fresh"],
    sr: "svježiji",
    en: "fresher",
  },
  {
    key: "sweetness",
    cues: ["sladak", "sladji", "slat", "sweet"],
    sr: "slađi",
    en: "sweeter",
  },
  {
    key: "projection",
    cues: ["projekc", "projection", "jace projekt"],
    sr: "izraženiji u projekciji",
    en: "stronger in projection",
  },
  {
    key: "longevity",
    cues: ["trajn", "traj", "longevity", "last longer"],
    sr: "dugotrajniji",
    en: "longer-lasting",
  },
  {
    key: "office",
    cues: ["za posao", "kancelar", "office", "for work"],
    sr: "prikladniji za posao",
    en: "better suited to work",
  },
  {
    key: "date",
    cues: ["dejt", "date"],
    sr: "prikladniji za dejt",
    en: "better suited to a date",
  },
  {
    key: "evening",
    cues: ["izlazak", "vece", "evening", "night out"],
    sr: "prikladniji za veče/izlazak",
    en: "better suited to evening/night out",
  },
  {
    key: "versatility",
    cues: ["svestran", "versatil", "versatile", "svaki dan", "everyday"],
    sr: "svestraniji",
    en: "more versatile",
  },
  {
    key: "elegance",
    cues: ["elegant"],
    sr: "elegantniji",
    en: "more elegant",
  },
  {
    key: "cleanliness",
    cues: ["cist", "čist", "clean"],
    sr: "čistiji",
    en: "cleaner",
  },
  {
    key: "warmth",
    cues: ["topao", "topl", "warm"],
    sr: "topliji",
    en: "warmer",
  },
  {
    key: "darkness",
    cues: ["taman", "mracan", "mračan", "dark"],
    sr: "tamniji",
    en: "darker",
  },
];

const findRequestedDimension = (query) => {
  const text = normalizeProductIntelText(query);
  return DIMENSIONS.find((dimension) =>
    dimension.cues.some((cue) =>
      text.includes(normalizeProductIntelText(cue))
    )
  ) || null;
};

const asksForLower = (query) => {
  const text = normalizeProductIntelText(query);
  return [
    "manje",
    "less",
    "nije toliko",
    "ne toliko",
    "blazi",
    "blazi",
  ].some((cue) => text.includes(cue));
};

const describeDimensionWinner = (
  first,
  second,
  dimension,
  query,
  lang
) => {
  const firstValue = getProfile(first)?.[dimension.key];
  const secondValue = getProfile(second)?.[dimension.key];

  if (
    !Number.isFinite(firstValue) ||
    !Number.isFinite(secondValue)
  ) {
    return "";
  }

  const inverse = asksForLower(query);
  const difference = firstValue - secondValue;

  if (Math.abs(difference) < 0.75) {
    return lang === "en"
      ? `On ${dimension.en}, ${first.shortName || first.name} and ${second.shortName || second.name} are very close in the PlayNice FI profile.`
      : `Po kriterijumu „${dimension.sr}“, ${first.shortName || first.name} i ${second.shortName || second.name} su vrlo blizu u PlayNice FI profilu.`;
  }

  const firstWins = inverse ? difference < 0 : difference > 0;
  const winner = firstWins ? first : second;
  const loser = firstWins ? second : first;

  if (lang === "en") {
    return inverse
      ? `${winner.shortName || winner.name} is the lower-intensity choice for this criterion than ${loser.shortName || loser.name}, based on the PlayNice FI profile.`
      : `${winner.shortName || winner.name} is ${dimension.en} than ${loser.shortName || loser.name}, based on the PlayNice FI profile.`;
  }

  return inverse
    ? `${winner.shortName || winner.name} je blaži izbor po ovom kriterijumu od ${loser.shortName || loser.name}, prema PlayNice FI profilu.`
    : `${winner.shortName || winner.name} je ${dimension.sr} od ${loser.shortName || loser.name}, prema PlayNice FI profilu.`;
};

const getCommonSizePriceLines = (first, second) => {
  const firstSizes = Object.fromEntries(getSortedSizes(first));
  const secondSizes = Object.fromEntries(getSortedSizes(second));

  return Object.keys(firstSizes)
    .filter((size) =>
      Object.prototype.hasOwnProperty.call(secondSizes, size)
    )
    .sort(
      (a, b) =>
        Number.parseInt(a, 10) - Number.parseInt(b, 10)
    )
    .map(
      (size) =>
        `${size}: ${first.shortName || first.name} ${formatPrice(
          firstSizes[size]
        )} / ${second.shortName || second.name} ${formatPrice(
          secondSizes[size]
        )}`
    );
};

const buildPriceComparison = (
  query,
  first,
  second,
  lang
) => {
  const requestedMl = getRequestedMl(query);
  const firstSizes = Object.fromEntries(getSortedSizes(first));
  const secondSizes = Object.fromEntries(getSortedSizes(second));

  if (
    requestedMl &&
    firstSizes[requestedMl] !== undefined &&
    secondSizes[requestedMl] !== undefined
  ) {
    const firstPrice = Number(firstSizes[requestedMl]);
    const secondPrice = Number(secondSizes[requestedMl]);

    if (firstPrice === secondPrice) {
      return lang === "en"
        ? `At ${requestedMl}, both are ${formatPrice(firstPrice)}.`
        : `U ${requestedMl}, oba su ${formatPrice(firstPrice)}.`;
    }

    const cheaper =
      firstPrice < secondPrice ? first : second;
    const cheaperPrice = Math.min(firstPrice, secondPrice);
    const otherPrice = Math.max(firstPrice, secondPrice);

    return lang === "en"
      ? `At ${requestedMl}, ${cheaper.shortName || cheaper.name} is cheaper: ${formatPrice(cheaperPrice)} vs ${formatPrice(otherPrice)}.`
      : `U ${requestedMl}, povoljniji je ${cheaper.shortName || cheaper.name}: ${formatPrice(cheaperPrice)} naspram ${formatPrice(otherPrice)}.`;
  }

  const lines = getCommonSizePriceLines(first, second);
  if (!lines.length) return "";

  return lang === "en"
    ? `Current PlayNice prices — ${lines.join("; ")}.`
    : `Aktuelne PlayNice cijene — ${lines.join("; ")}.`;
};

const PRICE_COMPARISON_CUES = [
  "jeftin",
  "povoljn",
  "cena",
  "cijena",
  "price",
  "cheaper",
  "cost",
];

const NEUTRAL_COMPARISON_KEYS = [
  "freshness",
  "sweetness",
  "cleanliness",
  "warmth",
  "projection",
  "longevity",
  "office",
  "date",
  "evening",
  "versatility",
  "elegance",
];

const DIMENSION_BY_KEY = Object.fromEntries(
  DIMENSIONS.map((dimension) => [dimension.key, dimension])
);

const buildNeutralComparison = (first, second, lang) => {
  const firstProfile = getProfile(first);
  const secondProfile = getProfile(second);
  if (!firstProfile || !secondProfile) return "";

  const differences = NEUTRAL_COMPARISON_KEYS
    .map((key) => ({
      key,
      delta:
        Number(firstProfile[key] || 0) -
        Number(secondProfile[key] || 0),
    }))
    .filter(({ delta }) => Math.abs(delta) >= 1)
    .sort(
      (a, b) =>
        Math.abs(b.delta) - Math.abs(a.delta)
    )
    .slice(0, 3);

  if (!differences.length) {
    return lang === "en"
      ? `${first.shortName || first.name} and ${second.shortName || second.name} are unusually close across the main PlayNice FI buyer signals.`
      : `${first.shortName || first.name} i ${second.shortName || second.name} su neobično blizu po glavnim PlayNice FI buyer signalima.`;
  }

  const clauses = differences.map(({ key, delta }) => {
    const dimension = DIMENSION_BY_KEY[key];
    const winner = delta > 0 ? first : second;
    return lang === "en"
      ? `${winner.shortName || winner.name} is ${dimension.en}`
      : `${winner.shortName || winner.name} je ${dimension.sr}`;
  });

  return lang === "en"
    ? `Main trade-offs: ${clauses.join("; ")}.`
    : `Glavne razlike: ${clauses.join("; ")}.`;
};

const buildComparisonAnswer = (
  query,
  first,
  second,
  lang
) => {
  const text = normalizeProductIntelText(query);
  const dimension = findRequestedDimension(query);
  const asksPrice = PRICE_COMPARISON_CUES.some((cue) =>
    text.includes(normalizeProductIntelText(cue))
  );

  const parts = [];

  if (dimension) {
    parts.push(
      describeDimensionWinner(
        first,
        second,
        dimension,
        query,
        lang
      )
    );
  } else if (!asksPrice) {
    parts.push(buildNeutralComparison(first, second, lang));
  }

  if (asksPrice || !dimension) {
    parts.push(
      buildPriceComparison(query, first, second, lang)
    );
  }

  return parts.filter(Boolean).join(" ");
};

const buildSizeAnswer = (query, product, lang) => {
  const sizes = getSortedSizes(product);
  if (!sizes.length) return "";

  const requestedMl = getRequestedMl(query);

  if (requestedMl) {
    const found = sizes.find(([size]) => size === requestedMl);

    if (found) {
      return lang === "en"
        ? `${product.name}: ${requestedMl} is currently listed at ${formatPrice(found[1])} in the PlayNice catalog.`
        : `${product.name}: ${requestedMl} je trenutno u PlayNice katalogu po cijeni ${formatPrice(found[1])}.`;
    }

    const available = sizes.map(([size]) => size).join(", ");
    return lang === "en"
      ? `${product.name} is not currently listed in ${requestedMl}. Available sizes: ${available}.`
      : `${product.name} trenutno nije naveden u ${requestedMl}. Dostupne veličine su: ${available}.`;
  }

  const formatted = sizes
    .map(([size, price]) => `${size} — ${formatPrice(price)}`)
    .join(", ");

  return lang === "en"
    ? `${product.name}: current PlayNice sizes and prices are ${formatted}.`
    : `${product.name}: aktuelne PlayNice veličine i cijene su ${formatted}.`;
};

const buildNotesAnswer = (product, lang) => {
  const noteMap = product?.noteMap;
  if (!noteMap) return "";

  const top = (noteMap.top || []).join(", ");
  const heart = (noteMap.heart || []).join(", ");
  const base = (noteMap.base || []).join(", ");

  if (lang === "en") {
    return `${product.name} — catalog note map: top: ${top || "—"}; heart: ${heart || "—"}; base: ${base || "—"}.`;
  }

  return `${product.name} — note iz PlayNice kataloga: otvaranje: ${top || "—"}; srce: ${heart || "—"}; baza: ${base || "—"}.`;
};

const buildInspiredByAnswer = (product, lang) => {
  if (!product?.inspiredBy?.name) return "";

  return lang === "en"
    ? `${product.name} is catalogued with the reference/DNA: ${product.inspiredBy.name}.`
    : `${product.name} je u PlayNice katalogu povezan sa referencom/DNA: ${product.inspiredBy.name}.`;
};

const buildSeasonAnswer = (product, lang) => {
  if (!product?.season) return "";

  const labels = {
    all: { sr: "sve sezone", en: "all seasons" },
    summer: { sr: "ljeto", en: "summer" },
    winter: { sr: "zima", en: "winter" },
    spring: { sr: "proljeće", en: "spring" },
    autumn: { sr: "jesen", en: "autumn" },
    fall: { sr: "jesen", en: "autumn" },
  };

  const value =
    labels[product.season]?.[lang === "en" ? "en" : "sr"] ||
    product.season;

  return lang === "en"
    ? `${product.name} is currently tagged for ${value} in the PlayNice catalog.`
    : `${product.name} je trenutno u PlayNice katalogu označen za: ${value}.`;
};

const buildSuitabilityAnswer = (
  query,
  product,
  lang
) => {
  const dimension = findRequestedDimension(query);
  if (
    !dimension ||
    !["office", "date", "evening", "versatility"].includes(
      dimension.key
    )
  ) {
    return "";
  }

  const value = getProfile(product)?.[dimension.key];
  if (!Number.isFinite(value)) return "";

  const fit =
    value >= 8
      ? lang === "en"
        ? "strong"
        : "vrlo jak"
      : value >= 6
        ? lang === "en"
          ? "good"
          : "dobar"
        : value >= 4
          ? lang === "en"
            ? "moderate"
            : "umjeren"
          : lang === "en"
            ? "limited"
            : "slabiji";

  return lang === "en"
    ? `${product.name} has a ${fit} ${dimension.en} fit in the PlayNice FI profile.`
    : `${product.name} ima ${fit} fit za kriterijum „${dimension.sr}“ u PlayNice FI profilu.`;
};

const buildGroundingAnswer = (
  query,
  product,
  lang
) => {
  const text = normalizeProductIntelText(query);

  if (
    /\b\d{1,3}\s*ml\b/i.test(String(query || "")) ||
    containsAny(text, [
      "koliko kosta",
      "koliko košta",
      "cena",
      "cijena",
      "price",
      "koliko je",
      "koje velicine",
      "koje veličine",
      "koje ml",
      "sizes",
      "size",
      "imate li",
      "ima li",
      "dostupan",
      "dostupna",
      "available",
    ])
  ) {
    return buildSizeAnswer(query, product, lang);
  }

  if (
    containsAny(text, [
      "note",
      "notes",
      "sastav",
      "koje note",
    ])
  ) {
    return buildNotesAnswer(product, lang);
  }

  if (
    containsAny(text, [
      "inspired by",
      "dna",
      "na sta lici",
      "na šta liči",
    ])
  ) {
    return buildInspiredByAnswer(product, lang);
  }

  if (
    containsAny(text, [
      "sezona",
      "godisnje doba",
      "godišnje doba",
    ])
  ) {
    return buildSeasonAnswer(product, lang);
  }

  if (containsAny(text, SUITABILITY_CUES)) {
    return buildSuitabilityAnswer(query, product, lang);
  }

  return "";
};

export const resolveCatalogProductIntelligenceQuery = (
  query,
  lang = "sr",
  context = {}
) => {
  const products = context.products || [];
  if (!products.length) {
    return {
      handled: false,
      type: "unknown",
      confidence: "low",
      entity: null,
      answer: "",
    };
  }

  const text = normalizeProductIntelText(query);
  const matches = findCatalogProductsByQuery(
    query,
    products
  );

  if (
    matches.length >= 2 &&
    containsAny(text, COMPARISON_CUES)
  ) {
    const first = matches[0];
    const second = matches[1];
    const answer = buildComparisonAnswer(
      query,
      first,
      second,
      lang === "en" ? "en" : "sr"
    );

    if (answer) {
      return {
        handled: true,
        type: "product-comparison",
        confidence: "high",
        entity: {
          id: `${first.slug}::${second.slug}`,
          productSlugs: [first.slug, second.slug],
        },
        answer,
      };
    }
  }

  if (
    matches.length === 1 &&
    (
      containsAny(text, GROUNDING_CUES) ||
      containsAny(text, SUITABILITY_CUES) ||
      /\b\d{1,3}\s*ml\b/i.test(String(query || ""))
    )
  ) {
    const product = matches[0];
    const answer = buildGroundingAnswer(
      query,
      product,
      lang === "en" ? "en" : "sr"
    );

    if (answer) {
      return {
        handled: true,
        type: "product-grounding",
        confidence: "high",
        entity: {
          id: product.slug,
          productSlug: product.slug,
        },
        answer,
      };
    }
  }

  return {
    handled: false,
    type: "unknown",
    confidence: "low",
    entity: null,
    answer: "",
  };
};
