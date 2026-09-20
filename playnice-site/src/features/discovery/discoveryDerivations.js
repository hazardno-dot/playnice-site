import { getDiscoveryMatchTier as getDiscoveryMatchTierFromEngine } from "../../lib/discoveryEngine";

export const getDiscoveryMatchTier = (
  match
) =>
  getDiscoveryMatchTierFromEngine(match);

export const orderDiscoveryResultsForPresentation = (
  results = []
) =>
  results
    .map((result, originalIndex) => ({
      result,
      originalIndex,
    }))
    .sort((a, b) => {
      const tierDifference =
        getDiscoveryMatchTier(b.result?.match) -
        getDiscoveryMatchTier(a.result?.match);

      if (tierDifference !== 0) {
        return tierDifference;
      }

      const matchDifference =
        Number(b.result?.match || 0) -
        Number(a.result?.match || 0);

      if (matchDifference !== 0) {
        return matchDifference;
      }

      return a.originalIndex - b.originalIndex;
    })
    .map(({ result }) => result);

export const DISCOVERY_PROMPTS = [
  {
    sr: "Sveže za leto do 15 €",
    en: "Fresh for summer under €15",
  },
  {
    sr: "Nešto kao Naxos",
    en: "Something like Naxos",
  },
  {
    sr: "Čisto i elegantno za posao",
    en: "Clean and elegant for work",
  },
  {
    sr: "Za dejt, ali ne previše slatko",
    en: "Date night, not too sweet",
  },
];

export const getDiscoveryAnalyticsParams = (
  discovery,
  {
    lang,
    source = "manual",
  }
) => {
  const intent = discovery?.intent || {};

  return {
    lang,
    search_source: source,
    result_count: discovery?.results?.length || 0,
    is_relevant: discovery?.isRelevant ? "yes" : "no",
    has_budget: intent.maxPrice != null ? "yes" : "no",
    has_reference: intent.referenceProduct
      ? "yes"
      : "no",
    category: intent.categories?.[0] || "none",
    gender: intent.gender || "none",
    contexts: intent.contexts?.length
      ? intent.contexts.join("|")
      : "none",
    modifiers: intent.referenceModifiers?.length
      ? intent.referenceModifiers.join("|")
      : "none",
    has_exclusions:
      intent.negativeTraits?.length ||
      intent.excludedNotes?.length ||
      intent.hardExcludedNotes?.length
        ? "yes"
        : "no",
  };
};

export const getDiscoveryReferenceQuery = (
  product,
  lang
) => {
  if (!product) return "";

  return lang === "sr"
    ? `nešto kao ${product.name}`
    : `something like ${product.name}`;
};

export const getDiscoveryMatchLabel = (
  match,
  lang
) => {
  if (match >= 92) {
    return lang === "sr"
      ? "Najbolji izbor"
      : "Best match";
  }

  if (match >= 86) {
    return lang === "sr"
      ? "Odličan izbor"
      : "Excellent match";
  }

  return lang === "sr"
    ? "Dobar izbor"
    : "Good match";
};

export const formatDiscoveryPrice = (price) => {
  if (!Number.isFinite(price)) return "";

  const numericPrice = Number(price);

  return `€${numericPrice.toFixed(
    numericPrice % 1 === 0 ? 0 : 1
  )}`;
};

export const getDiscoveryResultPresentation = (
  result,
  lang
) => ({
  matchLabel: getDiscoveryMatchLabel(
    Number(result?.match || 0),
    lang
  ),
  sizeLabel: result?.selectedSize?.size || "",
  priceLabel: formatDiscoveryPrice(
    result?.selectedSize?.price
  ),
  refinedReason: result?.reason || "",
});

export const buildDiscoveryResultClickParams = ({
  result,
  rank,
  lang,
  searchContext,
}) => ({
  lang,
  rank,
  product_id: String(result.product.id),
  product_slug: result.product.slug || "",
  product_name: result.product.name,
  match: Number(result.match || 0),
  selected_size:
    result.selectedSize?.size || "none",
  selected_price: Number(
    result.selectedSize?.price || 0
  ),
  search_source:
    searchContext?.search_source || "unknown",
  has_budget:
    searchContext?.has_budget || "no",
  has_reference:
    searchContext?.has_reference || "no",
  category:
    searchContext?.category || "none",
  gender:
    searchContext?.gender || "none",
  has_exclusions:
    searchContext?.has_exclusions || "no",
});

export const buildDiscoveryAttribution = ({
  result,
  rank,
  clickedAt,
  searchContext,
}) => ({
  productId: result.product.id,
  rank,
  match: Number(result.match || 0),
  selectedSize:
    result.selectedSize?.size || "",
  clickedAt,
  searchSource:
    searchContext?.search_source || "unknown",
  category:
    searchContext?.category || "none",
  gender:
    searchContext?.gender || "none",
  hasBudget:
    searchContext?.has_budget || "no",
  hasReference:
    searchContext?.has_reference || "no",
  hasExclusions:
    searchContext?.has_exclusions || "no",
});
