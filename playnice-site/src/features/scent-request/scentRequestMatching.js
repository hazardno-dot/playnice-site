const SCENT_NAME_NOISE_WORDS = new Set([
  "eau", "de", "parfum", "perfume", "edp", "edt", "cologne",
  "extrait", "extract", "spray",
]);

export const normalizeScentName = (value = "") =>
  String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .filter((token) => !SCENT_NAME_NOISE_WORDS.has(token))
    .join(" ")
    .trim();

const getScentNameTokens = (value = "") =>
  normalizeScentName(value).split(" ").filter(Boolean);

const getScentTokenDistance = (left = "", right = "") => {
  if (left === right) return 0;
  if (!left || !right) return Math.max(left.length, right.length);

  const previous = Array.from({ length: right.length + 1 }, (_, index) => index);

  for (let i = 1; i <= left.length; i += 1) {
    let diagonal = previous[0];
    previous[0] = i;

    for (let j = 1; j <= right.length; j += 1) {
      const above = previous[j];
      const substitutionCost = left[i - 1] === right[j - 1] ? 0 : 1;
      previous[j] = Math.min(
        previous[j] + 1,
        previous[j - 1] + 1,
        diagonal + substitutionCost
      );
      diagonal = above;
    }
  }

  return previous[right.length];
};

const scentTokensMatch = (requestToken, candidateToken) => {
  if (requestToken === candidateToken) return true;
  if (Math.min(requestToken.length, candidateToken.length) < 5) return false;
  return getScentTokenDistance(requestToken, candidateToken) <= 1;
};

const getProductRequestNames = (product) =>
  [
    product.shortName,
    product.cardName,
    product.name,
    product.brand && product.shortName ? `${product.brand} ${product.shortName}` : "",
    product.slug,
    ...(Array.isArray(product.aliases) ? product.aliases : []),
  ]
    .map(normalizeScentName)
    .filter(Boolean);

export const getScentRequestMatchScore = (requestName, product) => {
  const normalizedRequest = normalizeScentName(requestName);
  if (!normalizedRequest) return 0;

  const requestTokens = getScentNameTokens(normalizedRequest);
  const candidates = getProductRequestNames(product);
  let bestScore = 0;

  candidates.forEach((candidate) => {
    if (candidate === normalizedRequest) {
      bestScore = Math.max(bestScore, 100);
      return;
    }

    if (
      normalizedRequest.length >= 4 &&
      (candidate.includes(normalizedRequest) || normalizedRequest.includes(candidate))
    ) {
      bestScore = Math.max(bestScore, 90);
    }

    const candidateTokens = getScentNameTokens(candidate);
    const allMatch = requestTokens.length > 0 && requestTokens.every((requestToken) =>
      candidateTokens.some((candidateToken) => scentTokensMatch(requestToken, candidateToken))
    );

    if (!allMatch) return;

    bestScore = Math.max(
      bestScore,
      requestTokens.length === 1 ? 60 : 70 + Math.min(requestTokens.length, 9)
    );
  });

  return bestScore;
};

export const getScentRequestMatchResult = (requestName, products = []) => {
  const rankedMatches = products
    .map((product) => ({ product, score: getScentRequestMatchScore(requestName, product) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  if (!rankedMatches.length) {
    return { product: null, ambiguous: false };
  }

  const bestScore = rankedMatches[0].score;
  const topMatches = rankedMatches.filter((item) => item.score === bestScore);

  if (topMatches.length > 1) {
    return { product: null, ambiguous: true };
  }

  return { product: rankedMatches[0].product, ambiguous: false };
};
