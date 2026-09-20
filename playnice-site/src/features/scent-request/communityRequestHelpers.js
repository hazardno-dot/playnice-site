export const EXISTING_COLLECTION_LOCKED_VOTES = {
  "Yves Saint Laurent Y Iced Cologne": 27,
  "Prada Paradigme Eau de Parfum": 25,
  "Valentino Uomo Born In Roma Coral Fantasy": 16,
  "Lattafa Khamrah Waha Eau de Parfum": 13,
  "Club De Nuit Intense Overdose": 12,
  "Carolina Herrera Bad Boy Cobalt Eau de Parfum": 5,
  "Rayhaan Azul Eau de Parfum": 3,
};

export const EXISTING_COLLECTION_EXCLUDED_SLUGS = new Set([
  "bois-imperial-essential-parfums",
]);

export const getVisibleCommunityRequests = (
  requests = [],
  getMatchResult
) =>
  requests
    .filter((request) => {
      const match = getMatchResult(request.name);
      return !match?.product && !match?.ambiguous;
    })
    .sort((a, b) => b.votes - a.votes);

export const mergeExistingCollectionRequests = (
  requests = [],
  existingRequests = [],
  {
    findExistingProductByRequest,
    normalizeScentName,
    lockedVotes = EXISTING_COLLECTION_LOCKED_VOTES,
    excludedSlugs = EXISTING_COLLECTION_EXCLUDED_SLUGS,
  }
) => {
  const merged = new Map();

  const addRequest = (item) => {
    if (!item?.name) return;

    const product = findExistingProductByRequest(item.name);
    if (!product) return;

    if (excludedSlugs.has(product.slug)) return;

    const key = String(
      product.id || product.slug || normalizeScentName(product.name)
    );

    const current = merged.get(key) || {
      name: product.name,
      product,
      votes: 0,
      firstSeen: item.firstSeen || null,
    };

    const nextFirstSeen =
      [current.firstSeen, item.firstSeen]
        .filter(Boolean)
        .sort(
          (a, b) => new Date(a).getTime() - new Date(b).getTime()
        )[0] || null;

    merged.set(key, {
      ...current,
      name: product.name,
      product,
      votes: Number(current.votes || 0) + Number(item.votes || 0),
      firstSeen: nextFirstSeen,
    });
  };

  existingRequests.forEach(addRequest);
  requests.forEach(addRequest);

  Object.entries(lockedVotes).forEach(([name, lockedVoteCount]) => {
    const product = findExistingProductByRequest(name);
    if (!product) return;

    const key = String(
      product.id || product.slug || normalizeScentName(product.name)
    );

    const current = merged.get(key) || {
      name: product.name,
      product,
      votes: 0,
      firstSeen: null,
    };

    merged.set(key, {
      ...current,
      name: product.name,
      product,
      lockedVotes: lockedVoteCount,
    });
  });

  return Array.from(merged.values());
};

export const sortExistingCollectionRequests = (
  existingRequests = [],
  lockedVotes = EXISTING_COLLECTION_LOCKED_VOTES
) =>
  existingRequests
    .map((item) => ({
      ...item,
      displayVotes:
        lockedVotes[item.name] ??
        item.lockedVotes ??
        item.votes ??
        1,
    }))
    .sort((a, b) => {
      if (b.displayVotes !== a.displayVotes) {
        return b.displayVotes - a.displayVotes;
      }

      return String(a.name).localeCompare(String(b.name));
    });

export const getOptimisticCommunityVoteState = (
  requests = [],
  requestName,
  getVisibleRequests
) => {
  const beforeSorted = getVisibleRequests(requests);

  const beforeRanks = beforeSorted.reduce((acc, item, index) => {
    acc[item.name] = index;
    return acc;
  }, {});

  const nextRequests = requests
    .map((item) =>
      item.name === requestName
        ? { ...item, votes: Number(item.votes || 0) + 1 }
        : item
    )
    .sort((a, b) => b.votes - a.votes);

  const afterSorted = getVisibleRequests(nextRequests);

  const trends = afterSorted.reduce((acc, item, index) => {
    const previousIndex = beforeRanks[item.name];

    if (previousIndex === undefined) {
      acc[item.name] = "same";
    } else if (index < previousIndex) {
      acc[item.name] = "up";
    } else if (index > previousIndex) {
      acc[item.name] = "down";
    } else {
      acc[item.name] = "same";
    }

    return acc;
  }, {});

  const topThreeEntries = afterSorted.reduce((acc, item, index) => {
    const previousIndex = beforeRanks[item.name];

    if (
      previousIndex !== undefined &&
      previousIndex > 2 &&
      index <= 2
    ) {
      acc[item.name] = true;
    }

    return acc;
  }, {});

  return {
    nextRequests,
    trends,
    topThreeEntries,
  };
};

export const rollbackCommunityVote = (
  requests = [],
  requestName
) =>
  requests
    .map((item) =>
      item.name === requestName
        ? {
            ...item,
            votes: Math.max(0, Number(item.votes || 0) - 1),
          }
        : item
    )
    .sort((a, b) => b.votes - a.votes);

export const upsertCommunityRequestVote = (
  requests = [],
  fragranceName,
  normalizeName
) => {
  const normalizedFragranceName = normalizeName(fragranceName);

  const existingRequest = requests.find(
    (item) => normalizeName(item.name) === normalizedFragranceName
  );

  if (existingRequest) {
    return requests
      .map((item) =>
        normalizeName(item.name) === normalizedFragranceName
          ? { ...item, votes: item.votes + 1 }
          : item
      )
      .sort((a, b) => b.votes - a.votes);
  }

  return [{ name: fragranceName, votes: 1 }, ...requests].sort(
    (a, b) => b.votes - a.votes
  );
};
