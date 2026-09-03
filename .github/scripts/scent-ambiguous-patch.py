from pathlib import Path

path = Path('playnice-site/src/App.js')
text = path.read_text(encoding='utf-8')

old = """const findExistingProductByRequest = (requestName) => {
  const rankedMatches = products
    .map((product) => ({ product, score: getScentRequestMatchScore(requestName, product) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  if (!rankedMatches.length) return null;
  const [bestMatch, secondMatch] = rankedMatches;

  // Do not guess when a short request matches multiple variants equally well.
  if (secondMatch && secondMatch.score === bestMatch.score) return null;
  return bestMatch.product;
};"""

new = """const getScentRequestMatchResult = (requestName) => {
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

const findExistingProductByRequest = (requestName) =>
  getScentRequestMatchResult(requestName).product;

const isAmbiguousScentRequest = (requestName) =>
  getScentRequestMatchResult(requestName).ambiguous;

const getAmbiguousScentRequestMessage = () =>
  lang === \"sr\"
    ? \"Naziv je preširok — postoji više mogućih parfema. Unesite tačan naziv parfema koji tražite.\"
    : \"This name is too broad — it could refer to several fragrances. Please enter the exact fragrance name.\";"""

if 'const getScentRequestMatchResult =' not in text:
    if old not in text:
        raise SystemExit('finder marker not found')
    text = text.replace(old, new, 1)

old_visible = """const getVisibleCommunityRequests = (requests) =>
  requests
    .filter((request) => !findExistingProductByRequest(request.name))
    .sort((a, b) => b.votes - a.votes);"""
new_visible = """const getVisibleCommunityRequests = (requests) =>
  requests
    .filter(
      (request) =>
        !findExistingProductByRequest(request.name) &&
        !isAmbiguousScentRequest(request.name)
    )
    .sort((a, b) => b.votes - a.votes);"""
if old_visible in text:
    text = text.replace(old_visible, new_visible, 1)

marker = '  const result = await sendScentRequest(requestName);'
insert = """  if (isAmbiguousScentRequest(requestName)) {
    setScentRequestStatus(getAmbiguousScentRequestMessage());
    return;
  }

  const result = await sendScentRequest(requestName);"""
if 'if (isAmbiguousScentRequest(requestName))' not in text:
    if marker not in text:
        raise SystemExit('community marker not found')
    text = text.replace(marker, insert, 1)

marker = '    const result = await sendScentRequest(fragranceName);'
insert = """    if (isAmbiguousScentRequest(fragranceName)) {
      setScentRequestStatus(getAmbiguousScentRequestMessage());
      return;
    }

    const result = await sendScentRequest(fragranceName);"""
if 'if (isAmbiguousScentRequest(fragranceName))' not in text:
    if marker not in text:
        raise SystemExit('form marker not found')
    text = text.replace(marker, insert, 1)

path.write_text(text, encoding='utf-8')
