import { perfumers } from "../data/knowledge/perfumers";
import { fragrancePersonalities } from "../data/knowledge/fragrancePersonalities";
import { fragranceTerms } from "../data/knowledge/fragranceTerms";
import { fragranceHouses } from "../data/knowledge/fragranceHouses";
import { fragrancePerfumes } from "../data/knowledge/fragrancePerfumes";

export const normalizeKnowledgeText = (value = "") =>
  String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "dj")
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const PERFUMER_CUES = [
  "ko je", "who is", "parfimer", "perfumer", "nos",
  "potpisuje", "napravio", "napravila", "created", "creator", "nose",
];

const KNOWLEDGE_CUES = [
  "sta je", "sta su", "sta znaci", "objasni", "zasto", "zbog cega",
  "kako", "koliko", "da li", "koja je razlika", "razlika izmedju",
  "what is", "what does", "explain", "why", "how", "is it",
  "difference between", "meaning of",
];

const RECOMMENDATION_CUES = [
  "preporuci", "preporuka", "predlozi", "trazim", "treba mi",
  "hocu", "zelim", "daj mi", "koji parfem", "koji miris",
  "za posao", "za dejt", "za izlazak", "za leto", "za ljeto",
  "za zimu", "za prolece", "za proljece", "za jesen",
  "za svadbu", "za kancelariju", "za more", "za svaki dan",
  "recommend", "suggest", "looking for", "i want", "i need",
  "which perfume", "which fragrance", "for work", "for date",
  "for summer", "for winter", "for office", "for wedding",
];

const ENTITY_RECOMMENDATION_CUES = [
  "preporuci", "preporuka", "predlozi", "trazim", "treba mi",
  "hocu", "zelim", "daj mi", "nesto kao", "nešto kao",
  "slican", "sličan", "alternativa za", "zamena za", "zamjena za",
  "za posao", "za dejt", "za izlazak", "za leto", "za ljeto",
  "za zimu", "za prolece", "za proljece", "za jesen",
  "za svadbu", "za kancelariju", "za more", "za svaki dan",
  "recommend", "suggest", "looking for", "i want", "i need",
  "parfem kao", "miris kao",
  "something like", "similar to", "alternative to",
  "for work", "for date", "for summer", "for winter",
  "for office", "for wedding",
];

const hasBudgetSignal = (text) =>
  /(^|\s)(do|ispod|under|max|maximum|budget|budzet)\s*€?\s*\d+/i.test(text) ||
  /€\s*\d+|\d+\s*€/.test(text);

const isRecommendationStyleQuery = (query) => {
  const text = normalizeKnowledgeText(query);

  return (
    RECOMMENDATION_CUES.some((cue) =>
      text.includes(normalizeKnowledgeText(cue))
    ) ||
    hasBudgetSignal(String(query || ""))
  );
};

const isEntityRecommendationStyleQuery = (query) => {
  const text = normalizeKnowledgeText(query);

  return (
    ENTITY_RECOMMENDATION_CUES.some((cue) =>
      text.includes(normalizeKnowledgeText(cue))
    ) ||
    hasBudgetSignal(String(query || ""))
  );
};

const containsOrderedTokens = (
  queryText,
  aliasText
) => {
  const queryTokens = queryText
    .split(" ")
    .filter(Boolean);
  const aliasTokens = aliasText
    .split(" ")
    .filter(Boolean);

  if (!aliasTokens.length) return false;

  let queryIndex = 0;

  for (const aliasToken of aliasTokens) {
    while (
      queryIndex < queryTokens.length &&
      queryTokens[queryIndex] !== aliasToken
    ) {
      queryIndex += 1;
    }

    if (queryIndex >= queryTokens.length) {
      return false;
    }

    queryIndex += 1;
  }

  return true;
};

const getAliasMatch = (query, entity) => {
  const normalizedQuery =
    normalizeKnowledgeText(query);

  return (entity.aliases || [])
    .map(normalizeKnowledgeText)
    .filter(Boolean)
    .sort((a, b) => b.length - a.length)
    .find((alias) =>
      normalizedQuery === alias ||
      normalizedQuery.startsWith(alias + " ") ||
      normalizedQuery.endsWith(" " + alias) ||
      normalizedQuery.includes(" " + alias + " ") ||
      containsOrderedTokens(
        normalizedQuery,
        alias
      )
    );
};

export const findPerfumerByQuery = (query) => {
  const matches = perfumers
    .map((perfumer) => ({ perfumer, alias: getAliasMatch(query, perfumer) }))
    .filter((item) => Boolean(item.alias))
    .sort((a, b) => b.alias.length - a.alias.length);
  return matches[0]?.perfumer || null;
};

export const findPerfumeByQuery = (query) => {
  const matches = fragrancePerfumes
    .map((fragrance) => ({
      fragrance,
      alias: getAliasMatch(query, fragrance),
    }))
    .filter((item) => Boolean(item.alias))
    .sort((a, b) => b.alias.length - a.alias.length);

  return matches[0]?.fragrance || null;
};

export const findFragranceHouseByQuery = (query) => {
  const matches = fragranceHouses
    .map((house) => ({
      house,
      alias: getAliasMatch(query, house),
    }))
    .filter((item) => Boolean(item.alias))
    .sort((a, b) => b.alias.length - a.alias.length);

  return matches[0]?.house || null;
};

export const findFragrancePersonalityByQuery = (query) => {
  const matches = fragrancePersonalities
    .map((person) => ({ person, alias: getAliasMatch(query, person) }))
    .filter((item) => Boolean(item.alias))
    .sort((a, b) => b.alias.length - a.alias.length);
  return matches[0]?.person || null;
};

export const findFragranceTermByQuery = (query) => {
  if (isRecommendationStyleQuery(query)) {
    return null;
  }

  const text = normalizeKnowledgeText(query);
  const hasKnowledgeCue = KNOWLEDGE_CUES.some((cue) =>
    text.includes(normalizeKnowledgeText(cue))
  );
  if (!hasKnowledgeCue) return null;

  const matches = fragranceTerms
    .map((term) => ({ term, alias: getAliasMatch(query, term) }))
    .filter((item) => Boolean(item.alias))
    .sort((a, b) => b.alias.length - a.alias.length);

  return matches[0]?.term || null;
};

export const classifyFragranceKnowledgeQuery = (query) => {
  const text = normalizeKnowledgeText(query);

  if (isEntityRecommendationStyleQuery(query)) {
    return { type: "unknown", confidence: "low", entity: null };
  }
  const perfumer = findPerfumerByQuery(query);
  if (perfumer) {
    return {
      type: "perfumer",
      confidence: PERFUMER_CUES.some((cue) => text.includes(cue)) ? "high" : "medium",
      entity: perfumer,
    };
  }

  const fragrance = findPerfumeByQuery(query);
  if (fragrance) {
    return {
      type: "fragrance",
      confidence: "high",
      entity: fragrance,
    };
  }

  const house = findFragranceHouseByQuery(query);
  if (house) {
    return {
      type: house.entityType || "fragrance-house",
      confidence: "high",
      entity: house,
    };
  }

  const personality = findFragrancePersonalityByQuery(query);
  if (personality) {
    return {
      type: "fragrance-personality",
      confidence: "high",
      entity: personality,
    };
  }

  const term = findFragranceTermByQuery(query);
  if (term) {
    return {
      type: "fragrance-term",
      confidence: "high",
      entity: term,
    };
  }

  return { type: "unknown", confidence: "low", entity: null };
};

export const getPerfumerKnowledgeAnswer = (perfumer, lang = "sr") => {
  if (!perfumer) return "";
  const safeLang = lang === "en" ? "en" : "sr";
  const summary = perfumer.summary?.[safeLang] || perfumer.summary?.en || "";
  const namedSummary = summary ? `${perfumer.name} — ${summary}` : perfumer.name;
  const works = (perfumer.notableWorks || [])
    .filter((work) => work.verified)
    .slice(0, 3)
    .map((work) => `${work.name} — ${work.brand}`);
  if (!works.length) return namedSummary;
  return safeLang === "en"
    ? `${namedSummary} Verified works in this knowledge set include: ${works.join(", ")}.`
    : `${namedSummary} Među potvrđenim radovima u ovoj bazi su: ${works.join(", ")}.`;
};

const getLinkedPerfumerNames = (house) =>
  (house?.perfumerIds || [])
    .map((id) =>
      perfumers.find((perfumer) => perfumer.id === id)
    )
    .filter(Boolean)
    .map((perfumer) => perfumer.name);

const HOUSE_RELATION_CUES = [
  "ko radi u",
  "koji parfimeri",
  "koji parfimer",
  "ko radi za",
  "who works at",
  "which perfumers",
  "which perfumer",
  "perfumers at",
];

const HOUSE_WORK_CUES = [
  "koje parfeme ima", "koje parfeme pravi", "koje parfeme potpisuje",
  "what fragrances does", "what perfumes does"
];

const HOUSE_CATALOG_CUES = [
  "sta imamo od", "sta imate od", "imate li od",
  "u ponudi od", "u katalogu od",
  "what do you have from", "what do you carry from"
];

const FRAGRANCE_HOUSE_CUES = [
  "ciji je", "koja kuca pravi", "koja kuca stoji iza",
  "koji brend pravi", "which house makes", "which brand makes"
];

const PERFUMER_RELATION_CUES = [
  "gde radi",
  "gdje radi",
  "za koga radi",
  "u kojoj kuci",
  "u kojoj kući",
  "which house",
  "where does",
  "works for",
];

const getHouseWorksAnswer = (query, house, lang = "sr") => {
  const text = normalizeKnowledgeText(query);
  if (!HOUSE_WORK_CUES.some((cue) => text.includes(normalizeKnowledgeText(cue)))) return "";
  const works = fragrancePerfumes.filter((fragrance) => fragrance.houseId === house.id);
  if (!works.length) return lang === "en"
    ? `I don't yet have verified fragrance works recorded for ${house.name}.`
    : `Za ${house.name} još nemam zabeležene potvrđene parfeme u ovoj knowledge bazi.`;
  const names = works.map((fragrance) => fragrance.name);
  return lang === "en"
    ? `Verified fragrances currently recorded for ${house.name}: ${names.join(", ")}.`
    : `Potvrđeni parfemi koje trenutno imam zabeležene za ${house.name}: ${names.join(", ")}.`;
};

const getHouseCatalogAnswer = (query, house, lang = "sr", products = []) => {
  const text = normalizeKnowledgeText(query);
  if (!HOUSE_CATALOG_CUES.some((cue) => text.includes(normalizeKnowledgeText(cue)))) return "";
  const available = fragrancePerfumes
    .filter((fragrance) => fragrance.houseId === house.id)
    .filter((fragrance) => isCatalogFragranceAvailable(fragrance, products));
  if (!available.length) return lang === "en"
    ? `I don't currently have a verified PlayNice catalog fragrance from ${house.name} in this knowledge set.`
    : `Trenutno nemam potvrđen PlayNice katalog parfem kuće ${house.name} u ovoj knowledge bazi.`;
  const names = available.map((fragrance) => fragrance.name);
  return lang === "en"
    ? `Currently verified in the PlayNice catalog from ${house.name}: ${names.join(", ")}.`
    : `Trenutno potvrđeno u PlayNice katalogu od kuće ${house.name}: ${names.join(", ")}.`;
};

const getHouseRelationshipAnswer = (
  query,
  house,
  lang = "sr"
) => {
  const text = normalizeKnowledgeText(query);
  const isRelationQuestion =
    HOUSE_RELATION_CUES.some((cue) =>
      text.includes(normalizeKnowledgeText(cue))
    );

  if (!isRelationQuestion) return "";

  const names = getLinkedPerfumerNames(house);
  if (!names.length) {
    return lang === "en"
      ? `I don't have a verified perfumer relationship recorded for ${house.name} yet.`
      : `Za ${house.name} još nemam zabeleženu potvrđenu vezu sa parfimerom.`;
  }

  return lang === "en"
    ? `Verified perfumer relationships recorded for ${house.name}: ${names.join(", ")}.`
    : `Potvrđene veze sa parfimerima koje trenutno imam za ${house.name}: ${names.join(", ")}.`;
};

const getPerfumerRelationshipAnswer = (
  query,
  perfumer,
  lang = "sr"
) => {
  const text = normalizeKnowledgeText(query);
  const isRelationQuestion =
    PERFUMER_RELATION_CUES.some((cue) =>
      text.includes(normalizeKnowledgeText(cue))
    );

  if (!isRelationQuestion) return "";

  const houses = fragranceHouses.filter((house) =>
    (house.perfumerIds || []).includes(perfumer.id)
  );

  if (!houses.length) {
    return lang === "en"
      ? `I don't have a verified house or company relationship recorded for ${perfumer.name} yet.`
      : `Za ${perfumer.name} još nemam zabeleženu potvrđenu vezu sa kućom ili kompanijom.`;
  }

  const names = houses.map((house) => house.name);

  return lang === "en"
    ? `Verified house/company relationships recorded for ${perfumer.name}: ${names.join(", ")}.`
    : `Potvrđene veze sa kućama ili kompanijama koje trenutno imam za ${perfumer.name}: ${names.join(", ")}.`;
};

const getPerfumeAuthors = (fragrance) =>
  (fragrance?.perfumerIds || [])
    .map((id) =>
      perfumers.find((perfumer) => perfumer.id === id)
    )
    .filter(Boolean);

const getPerfumeHouse = (fragrance) =>
  fragranceHouses.find(
    (house) => house.id === fragrance?.houseId
  ) || null;

const isCatalogFragranceAvailable = (
  fragrance,
  products = []
) => {
  if (!fragrance?.playNiceCatalogSlug) return false;

  return products.some(
    (product) =>
      String(product?.slug || "") ===
      fragrance.playNiceCatalogSlug
  );
};

const PERFUME_AUTHOR_CUES = [
  "ko je napravio",
  "ko je napravila",
  "ko je parfimer",
  "ko je autor",
  "ko potpisuje",
  "who made",
  "who created",
  "who is the perfumer",
  "perfumer of",
];

const PERFUMER_CATALOG_CUES = [
  "sta imamo od",
  "sta imate od",
  "imate li nesto od",
  "imate li nešto od",
  "imate li parfem od",
  "imate li parfeme od",
  "u ponudi od",
  "u katalogu od",
  "what do you have by",
  "do you have anything by",
  "in your catalog by",
];

const PERFUMER_WORK_CUES = [
  "koje parfeme je napravio",
  "koje parfeme je napravila",
  "koje parfeme potpisuje",
  "koje parfeme je kreirao",
  "koje parfeme je kreirala",
  "koji parfemi su njegovi",
  "koji parfemi su njeni",
  "sta je napravio",
  "sta je napravila",
  "sta je kreirao",
  "sta je kreirala",
  "what perfumes did",
  "what fragrances did",
  "which perfumes did",
  "which fragrances did",
  "what did",
];

const getPerfumeHouseAnswer = (query, fragrance, lang = "sr") => {
  const text = normalizeKnowledgeText(query);
  if (!FRAGRANCE_HOUSE_CUES.some((cue) => text.includes(normalizeKnowledgeText(cue)))) return "";
  const house = getPerfumeHouse(fragrance);
  if (!house) return "";
  return lang === "en"
    ? `${fragrance.name} is from ${house.name}.`
    : `${fragrance.name} je parfem kuće ${house.name}.`;
};

const getPerfumeRelationshipAnswer = (
  query,
  fragrance,
  lang = "sr"
) => {
  const text = normalizeKnowledgeText(query);
  const asksAuthor = PERFUME_AUTHOR_CUES.some(
    (cue) =>
      text.includes(
        normalizeKnowledgeText(cue)
      )
  );

  if (!asksAuthor) return "";

  const authors = getPerfumeAuthors(fragrance);
  if (!authors.length) return "";

  const names = authors.map((author) => author.name);

  return lang === "en"
    ? `${fragrance.name} was created by ${names.join(", ")}.`
    : `${fragrance.name} potpisuje ${names.join(", ")}.`;
};

const getPerfumerWorksAnswer = (
  query,
  perfumer,
  lang = "sr"
) => {
  const text = normalizeKnowledgeText(query);
  const asksWorks = PERFUMER_WORK_CUES.some(
    (cue) =>
      text.includes(
        normalizeKnowledgeText(cue)
      )
  );

  if (!asksWorks) return "";

  const linked = fragrancePerfumes.filter(
    (fragrance) =>
      (fragrance.perfumerIds || []).includes(
        perfumer.id
      )
  );

  const byName = new Map();

  (perfumer.notableWorks || [])
    .filter((work) => work.verified)
    .forEach((work) => {
      byName.set(
        normalizeKnowledgeText(work.name),
        `${work.name} — ${work.brand}`
      );
    });

  linked.forEach((fragrance) => {
    const house = getPerfumeHouse(fragrance);
    byName.set(
      normalizeKnowledgeText(fragrance.name),
      house
        ? `${fragrance.name} — ${house.name}`
        : fragrance.name
    );
  });

  const works = Array.from(byName.values());

  if (!works.length) {
    return lang === "en"
      ? `I don't yet have verified fragrance works recorded for ${perfumer.name} in this knowledge base.`
      : `Za ${perfumer.name} još nemam zabeležene potvrđene parfeme u ovoj knowledge bazi.`;
  }

  return lang === "en"
    ? `Verified fragrance works currently recorded for ${perfumer.name}: ${works.join(", ")}.`
    : `Potvrđeni parfemi koje trenutno imam zabeležene za ${perfumer.name}: ${works.join(", ")}.`;
};

const getPerfumerCatalogAnswer = (
  query,
  perfumer,
  lang = "sr",
  products = []
) => {
  const text = normalizeKnowledgeText(query);
  const asksCatalog = PERFUMER_CATALOG_CUES.some(
    (cue) =>
      text.includes(
        normalizeKnowledgeText(cue)
      )
  );

  if (!asksCatalog) return "";

  const available = fragrancePerfumes
    .filter((fragrance) =>
      (fragrance.perfumerIds || []).includes(
        perfumer.id
      )
    )
    .filter((fragrance) =>
      isCatalogFragranceAvailable(
        fragrance,
        products
      )
    );

  if (!available.length) {
    return lang === "en"
      ? `I don't currently have a verified PlayNice catalog fragrance by ${perfumer.name} in this knowledge set.`
      : `Trenutno nemam potvrđen PlayNice katalog parfem od ${perfumer.name} u ovoj knowledge bazi.`;
  }

  const names = available.map(
    (fragrance) => fragrance.name
  );

  return lang === "en"
    ? `Currently verified in the PlayNice catalog by ${perfumer.name}: ${names.join(", ")}.`
    : `Trenutno potvrđeno u PlayNice katalogu od ${perfumer.name}: ${names.join(", ")}.`;
};

export const getFragranceKnowledgeAnswer = (
  fragrance,
  lang = "sr"
) => {
  if (!fragrance) return "";

  const safeLang = lang === "en" ? "en" : "sr";
  const summary =
    fragrance.summary?.[safeLang] ||
    fragrance.summary?.en ||
    "";
  const house = getPerfumeHouse(fragrance);
  const authors = getPerfumeAuthors(fragrance);

  const relations = [
    house?.name,
    authors.length
      ? authors.map((author) => author.name).join(", ")
      : "",
  ].filter(Boolean);

  if (!relations.length) return summary;

  return safeLang === "en"
    ? `${fragrance.name} — ${summary} House / perfumer: ${relations.join(" — ")}.`
    : `${fragrance.name} — ${summary} Kuća / parfimer: ${relations.join(" — ")}.`;
};

export const getFragranceHouseKnowledgeAnswer = (
  house,
  lang = "sr"
) => {
  if (!house) return "";
  const safeLang = lang === "en" ? "en" : "sr";
  const summary =
    house.summary?.[safeLang] ||
    house.summary?.en ||
    "";

  return summary
    ? `${house.name} — ${summary}`
    : house.name;
};

export const getFragrancePersonalityKnowledgeAnswer = (person, lang = "sr") => {
  if (!person) return "";
  const safeLang = lang === "en" ? "en" : "sr";
  const summary = person.summary?.[safeLang] || person.summary?.en || "";
  return summary ? `${person.name} — ${summary}` : person.name;
};

export const getFragranceTermKnowledgeAnswer = (term, lang = "sr") => {
  if (!term) return "";
  const safeLang = lang === "en" ? "en" : "sr";
  return term.answer?.[safeLang] || term.answer?.en || "";
};

export const resolveFragranceKnowledgeQuery = (
  query,
  lang = "sr",
  context = {}
) => {
  const classification = classifyFragranceKnowledgeQuery(query);

  if (!classification.entity) {
    return {
      handled: false,
      type: "unknown",
      confidence: "low",
      entity: null,
      answer: "",
    };
  }

  if (classification.type === "perfumer") {
    const catalogAnswer =
      getPerfumerCatalogAnswer(
        query,
        classification.entity,
        lang,
        context.products || []
      );

    const worksAnswer =
      getPerfumerWorksAnswer(
        query,
        classification.entity,
        lang
      );

    const relationshipAnswer =
      getPerfumerRelationshipAnswer(
        query,
        classification.entity,
        lang
      );

    return {
      handled: true,
      type: "perfumer",
      confidence: classification.confidence,
      entity: classification.entity,
      answer:
        catalogAnswer ||
        worksAnswer ||
        relationshipAnswer ||
        getPerfumerKnowledgeAnswer(
          classification.entity,
          lang
        ),
    };
  }

  if (classification.type === "fragrance") {
    const houseAnswer = getPerfumeHouseAnswer(query, classification.entity, lang);
    const relationshipAnswer =
      getPerfumeRelationshipAnswer(
        query,
        classification.entity,
        lang
      );

    return {
      handled: true,
      type: "fragrance",
      confidence: classification.confidence,
      entity: classification.entity,
      answer:
        houseAnswer ||
        relationshipAnswer ||
        getFragranceKnowledgeAnswer(
          classification.entity,
          lang
        ),
    };
  }

  if (
    classification.type === "fragrance-house" ||
    classification.type === "fragrance-company"
  ) {
    const catalogAnswer = getHouseCatalogAnswer(
      query, classification.entity, lang, context.products || []
    );
    const worksAnswer = getHouseWorksAnswer(query, classification.entity, lang);
    const relationshipAnswer =
      getHouseRelationshipAnswer(
        query,
        classification.entity,
        lang
      );

    return {
      handled: true,
      type: classification.type,
      confidence: classification.confidence,
      entity: classification.entity,
      answer:
        catalogAnswer ||
        worksAnswer ||
        relationshipAnswer ||
        getFragranceHouseKnowledgeAnswer(
          classification.entity,
          lang
        ),
    };
  }

  if (classification.type === "fragrance-personality") {
    return {
      handled: true,
      type: "fragrance-personality",
      confidence: classification.confidence,
      entity: classification.entity,
      answer: getFragrancePersonalityKnowledgeAnswer(classification.entity, lang),
    };
  }

  if (classification.type === "fragrance-term") {
    return {
      handled: true,
      type: "fragrance-term",
      confidence: classification.confidence,
      entity: classification.entity,
      answer: getFragranceTermKnowledgeAnswer(classification.entity, lang),
    };
  }

  return {
    handled: false,
    type: "unknown",
    confidence: "low",
    entity: null,
    answer: "",
  };
};
