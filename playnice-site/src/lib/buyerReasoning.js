const normalizeBuyerText = (value = "") =>
  String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "dj")
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const clampBuyer = (value, min = 0, max = 10) =>
  Math.max(min, Math.min(max, value));

const hasPhrase = (text, phrases = []) =>
  phrases.some((phrase) => {
    const cue = normalizeBuyerText(phrase);
    return (
      text === cue ||
      text.startsWith(cue + " ") ||
      text.endsWith(" " + cue) ||
      text.includes(" " + cue + " ")
    );
  });

const BUYER_PREFERENCE_RULES = [
  {
    key: "longevity",
    direction: "high",
    strength: "high",
    cues: [
      "dugo traje", "traje dugo", "traje ceo dan", "traje cijeli dan",
      "celodnevna trajnost", "cjelodnevna trajnost", "veoma postojan",
      "vrlo postojan", "jaka trajnost", "long lasting", "long-lasting",
      "lasts all day", "all day longevity", "strong longevity",
    ],
  },
  {
    key: "projection",
    direction: "high",
    strength: "high",
    cues: [
      "jaka projekcija", "velika projekcija", "jace projektuje",
      "jače projektuje", "da se primeti", "da se primijeti",
      "glasniji parfem", "loud fragrance", "strong projection",
      "projects strongly", "room filler",
    ],
  },
  {
    key: "projection",
    direction: "low",
    strength: "normal",
    cues: [
      "nije napadan", "ne bude napadan", "nenapadan", "diskretna projekcija",
      "diskretan parfem", "blizu koze", "blizu kože", "not loud",
      "not overpowering", "discreet projection", "close to skin", "skin scent",
    ],
  },
  {
    key: "darkness",
    direction: "high",
    strength: "normal",
    cues: [
      "mracan", "mračan", "taman miris", "tamni miris",
      "dark fragrance", "dark scent", "mysterious scent", "misteriozan",
    ],
  },
  {
    key: "darkness",
    direction: "low",
    strength: "normal",
    cues: [
      "bright scent", "bright fragrance", "vedar miris",
      "svetao miris", "svijetao miris",
    ],
  },
  {
    key: "airiness",
    direction: "high",
    strength: "normal",
    cues: [
      "prozracno", "prozračan", "prozračan miris", "airy",
      "airy scent", "transparent scent", "lagan i prozracan", "lagan i prozračan",
    ],
  },
  {
    key: "creaminess",
    direction: "high",
    strength: "normal",
    cues: ["kremast", "kremasto", "creamy", "creamy scent", "smooth creamy"],
  },
  {
    key: "dryness",
    direction: "high",
    strength: "normal",
    cues: ["suv miris", "suh miris", "suvo", "dry scent", "dry fragrance"],
  },
  {
    key: "fruitiness",
    direction: "high",
    strength: "normal",
    cues: ["vocan", "voćan", "vocno", "voćno", "fruity", "fruit forward", "fruity scent"],
  },
  {
    key: "versatility",
    direction: "high",
    strength: "normal",
    cues: [
      "easy reach", "easy to wear", "siguran izbor", "bez razmisljanja",
      "bez razmišljanja", "za sve prilike", "one fragrance for everything",
    ],
  },
  {
    key: "elegance",
    direction: "high",
    strength: "normal",
    cues: ["quiet luxury", "tihi luksuz", "diskretan luksuz"],
  },
  {
    key: "sweetness",
    direction: "low",
    strength: "normal",
    cues: ["manje sladak", "manje slatko", "less sweet", "not as sweet"],
  },
  {
    key: "sweetness",
    direction: "moderate",
    strength: "normal",
    cues: [
      "ne previse sladak", "ne previše sladak", "ne previse slatko",
      "ne previše slatko", "not too sweet", "sweet but not too sweet",
      "slatko ali ne previse", "slatko ali ne previše",
    ],
  },
];

const PROFILE_ALIASES = {
  sweetness: ["sweetness", "sweet"],
  warmth: ["warmth", "warm"],
  cleanliness: ["cleanliness", "clean"],
  woodiness: ["woodiness", "woody"],
  spiciness: ["spiciness", "spicy"],
  aromaticity: ["aromaticity", "aromatic"],
  florality: ["florality", "floral"],
  gourmandness: ["gourmandness", "gourmand"],
  projection: ["projection", "intensity"],
};

export const getBuyerProfileValue = (profile = {}, key) => {
  const aliases = PROFILE_ALIASES[key] || [key];
  for (const alias of aliases) {
    const value = Number(profile?.[alias]);
    if (Number.isFinite(value)) return value;
  }
  return 5;
};

const dedupePreferences = (preferences = []) => {
  const byKey = new Map();
  preferences.forEach((preference) => {
    const current = byKey.get(preference.key);
    if (!current) {
      byKey.set(preference.key, preference);
      return;
    }
    const priority = { moderate: 3, low: 2, high: 2 };
    const currentPriority = priority[current.direction] || 1;
    const nextPriority = priority[preference.direction] || 1;
    if (
      nextPriority > currentPriority ||
      (nextPriority === currentPriority && preference.strength === "high")
    ) {
      byKey.set(preference.key, preference);
    }
  });
  return Array.from(byKey.values());
};

export const parseBuyerReasoning = (query) => {
  const text = normalizeBuyerText(query);
  const preferences = [];

  BUYER_PREFERENCE_RULES.forEach((rule) => {
    const matchedCue = rule.cues.find((cue) => hasPhrase(text, [cue]));
    if (!matchedCue) return;
    preferences.push({
      key: rule.key,
      direction: rule.direction,
      strength: rule.strength,
      cue: normalizeBuyerText(matchedCue),
      provenance: "buyer-language",
    });
  });

  return {
    preferences: dedupePreferences(preferences),
    provenance: preferences.length ? ["buyer-language"] : [],
  };
};

const preferenceFit = (value, preference) => {
  if (preference.direction === "high") {
    return clampBuyer(value / 10, 0, 1);
  }
  if (preference.direction === "low") {
    return clampBuyer((10 - value) / 10, 0, 1);
  }
  const distance = Math.abs(value - 5.2);
  return clampBuyer(1 - distance / 5.2, 0, 1);
};

export const scoreBuyerReasoning = (profile = {}, buyerReasoning = {}) => {
  const preferences = buyerReasoning?.preferences || [];
  if (!preferences.length) {
    return { adjustment: 0, reasons: [], matches: [] };
  }

  let adjustment = 0;
  const reasons = [];
  const matches = [];

  preferences.forEach((preference) => {
    const value = getBuyerProfileValue(profile, preference.key);
    const fit = preferenceFit(value, preference);
    const multiplier = preference.strength === "high" ? 1.2 : 1;

    adjustment += (fit * 18 - 6) * multiplier;

    if (fit >= 0.58) {
      reasons.push(`buyer:${preference.key}:${preference.direction}`);
    }

    matches.push({
      key: preference.key,
      direction: preference.direction,
      fit,
      value,
      weight: multiplier,
    });
  });

  return { adjustment, reasons, matches };
};

export const getBuyerReasoningMatchComponents = (
  profile = {},
  buyerReasoning = {}
) =>
  (buyerReasoning?.preferences || []).map((preference) => {
    const value = getBuyerProfileValue(profile, preference.key);
    const fit = preferenceFit(value, preference);
    return {
      key: preference.key,
      direction: preference.direction,
      value: 58 + fit * 38,
      weight: preference.strength === "high" ? 1.3 : 1.05,
    };
  });

const BUYER_REASON_LABELS = {
  sr: {
    longevity: {
      high: "Trajnost je jak dio ovog profila.",
      low: "Profil ide ka kraćoj, lakšoj trajnosti.",
      moderate: "Trajnost ostaje u srednjem, nenametljivom rasponu.",
    },
    projection: {
      high: "Projekcija daje izraženiju prisutnost.",
      low: "Projekcija ostaje diskretnija i bliža koži.",
      moderate: "Projekcija ostaje kontrolisana.",
    },
    darkness: {
      high: "Tamniji karakter prati traženi mood.",
      low: "Profil ostaje svjetliji i vedriji.",
      moderate: "Tamniji tonovi ostaju uravnoteženi.",
    },
    airiness: {
      high: "Prozračnost drži miris laganim i otvorenim.",
      low: "Profil je puniji i manje prozračan.",
      moderate: "Prozračnost ostaje uravnotežena.",
    },
    creaminess: {
      high: "Kremastija tekstura prati traženi profil.",
      low: "Profil ostaje manje kremast.",
      moderate: "Kremastost ostaje umjerena.",
    },
    dryness: {
      high: "Suvlji karakter prati traženi profil.",
      low: "Profil ostaje mekši i manje suv.",
      moderate: "Suvoća ostaje uravnotežena.",
    },
    fruitiness: {
      high: "Voćni karakter je jasno prisutan.",
      low: "Voćnost ostaje povučena.",
      moderate: "Voćnost ostaje kontrolisana.",
    },
    versatility: {
      high: "Lako se uklapa u više prilika i svakodnevno nošenje.",
      low: "Profil je namjenski i manje univerzalan.",
      moderate: "Svestranost ostaje u srednjem rasponu.",
    },
    elegance: {
      high: "Uglađeniji karakter prati traženi osjećaj luksuza.",
      low: "Profil je opušteniji i manje formalan.",
      moderate: "Elegancija ostaje odmjerena.",
    },
    sweetness: {
      high: "Slatkoća je naglašen dio profila.",
      low: "Slatkoća je povučenija.",
      moderate: "Slatkoća ostaje kontrolisana, bez preterivanja.",
    },
  },
  en: {
    longevity: {
      high: "Longevity is a strong part of this profile.",
      low: "The profile leans toward lighter, shorter wear.",
      moderate: "Longevity stays in a controlled middle range.",
    },
    projection: {
      high: "Projection gives it a more noticeable presence.",
      low: "Projection stays discreet and closer to the skin.",
      moderate: "Projection stays controlled.",
    },
    darkness: {
      high: "Its darker character follows the requested mood.",
      low: "The profile stays brighter and more open.",
      moderate: "The darker facets stay balanced.",
    },
    airiness: {
      high: "Its airiness keeps the scent light and open.",
      low: "The profile is fuller and less airy.",
      moderate: "Airiness stays balanced.",
    },
    creaminess: {
      high: "Its creamier texture follows the requested profile.",
      low: "The profile stays less creamy.",
      moderate: "Creaminess stays moderate.",
    },
    dryness: {
      high: "Its drier character follows the requested profile.",
      low: "The profile stays softer and less dry.",
      moderate: "Dryness stays balanced.",
    },
    fruitiness: {
      high: "Its fruity character is clearly present.",
      low: "Fruitiness stays restrained.",
      moderate: "Fruitiness stays controlled.",
    },
    versatility: {
      high: "It fits easily across occasions and everyday wear.",
      low: "The profile is more purpose-built and less universal.",
      moderate: "Versatility stays in the middle range.",
    },
    elegance: {
      high: "Its polished character follows the requested luxury feel.",
      low: "The profile is more relaxed and less formal.",
      moderate: "Elegance stays measured.",
    },
    sweetness: {
      high: "Sweetness is a pronounced part of the profile.",
      low: "Sweetness stays more restrained.",
      moderate: "Sweetness stays controlled without going too far.",
    },
  },
};

export const describeBuyerReasoningFit = (
  profile = {},
  buyerReasoning = {},
  lang = "sr"
) => {
  const preferences = buyerReasoning?.preferences || [];
  if (!preferences.length) return "";

  const ranked = preferences
    .map((preference) => ({
      preference,
      fit: preferenceFit(
        getBuyerProfileValue(profile, preference.key),
        preference
      ),
    }))
    .sort((a, b) => {
      const strengthDifference =
        (b.preference.strength === "high" ? 1 : 0) -
        (a.preference.strength === "high" ? 1 : 0);
      if (strengthDifference !== 0) return strengthDifference;
      return b.fit - a.fit;
    });

  const best = ranked[0]?.preference;
  if (!best) return "";

  const safeLang = lang === "en" ? "en" : "sr";
  return BUYER_REASON_LABELS[safeLang]?.[best.key]?.[best.direction] || "";
};
