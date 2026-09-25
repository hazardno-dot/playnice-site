import { perfumers } from "../data/knowledge/perfumers";
import { fragrancePersonalities } from "../data/knowledge/fragrancePersonalities";
import { fragranceTerms } from "../data/knowledge/fragranceTerms";

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
  "sta je", "sta znaci", "objasni", "zasto", "zbog cega",
  "kako", "da li", "koja je razlika", "razlika izmedju",
  "what is", "what does", "explain", "why", "how", "is it",
  "difference between", "meaning of",
];

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

export const findFragrancePersonalityByQuery = (query) => {
  const matches = fragrancePersonalities
    .map((person) => ({ person, alias: getAliasMatch(query, person) }))
    .filter((item) => Boolean(item.alias))
    .sort((a, b) => b.alias.length - a.alias.length);
  return matches[0]?.person || null;
};

export const findFragranceTermByQuery = (query) => {
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
  const perfumer = findPerfumerByQuery(query);
  if (perfumer) {
    return {
      type: "perfumer",
      confidence: PERFUMER_CUES.some((cue) => text.includes(cue)) ? "high" : "medium",
      entity: perfumer,
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

export const resolveFragranceKnowledgeQuery = (query, lang = "sr") => {
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
    return {
      handled: true,
      type: "perfumer",
      confidence: classification.confidence,
      entity: classification.entity,
      answer: getPerfumerKnowledgeAnswer(classification.entity, lang),
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
