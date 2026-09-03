from pathlib import Path

path = Path('playnice-site/src/App.js')
text = path.read_text(encoding='utf-8')

start = text.index('const handleCommunityRequestVote = async (requestName) => {')
end = text.index('const handleScentRequestSubmit = async (event) => {')

new_handler = r'''const handleCommunityRequestVote = async (requestName) => {
  if (communityVoteInFlightRef.current.has(requestName)) return;

  communityVoteInFlightRef.current.add(requestName);

  const rollbackOptimisticVote = () => {
    setCommunityRequests((prev) =>
      prev
        .map((item) =>
          item.name === requestName
            ? { ...item, votes: Math.max(0, Number(item.votes || 0) - 1) }
            : item
        )
        .sort((a, b) => b.votes - a.votes)
    );
  };

  try {
    const existingProduct = findExistingProductByRequest(requestName);

    if (existingProduct) {
      setScentRequestStatus(
        lang === "sr"
          ? `Već deo PlayNice kolekcije ✦ Otvaramo ${existingProduct.name}.`
          : `Already in our collection ✦ Opening ${existingProduct.name}.`
      );

      openProductFromRequest(existingProduct);
      return;
    }

    if (isAmbiguousScentRequest(requestName)) {
      setScentRequestStatus(getAmbiguousScentRequestMessage());
      return;
    }

    // List voting is optimistic: the vote appears instantly in the UI while
    // Apps Script confirms it in the background. If the backend blocks or
    // rejects it, we roll the local count back and show the real reason.
    setCommunityRequests((prev) => {
      const beforeSorted = getVisibleCommunityRequests(prev);
      const beforeRanks = beforeSorted.reduce((acc, item, index) => {
        acc[item.name] = index;
        return acc;
      }, {});

      const next = prev
        .map((item) =>
          item.name === requestName
            ? { ...item, votes: Number(item.votes || 0) + 1 }
            : item
        )
        .sort((a, b) => b.votes - a.votes);

      const afterSorted = getVisibleCommunityRequests(next);

      const nextTrends = afterSorted.reduce((acc, item, index) => {
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

      const nextTopThreeEntries = afterSorted.reduce((acc, item, index) => {
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

      setCommunityRequestTrends(nextTrends);
      setCommunityTopThreeEntries(nextTopThreeEntries);

      return next;
    });

    setScentRequestStatus(
      lang === "sr"
        ? `Glas za ${requestName} je primljen ✦`
        : `Your vote for ${requestName} was received ✦`
    );

    const result = await sendScentRequest(requestName);

    if (result?.status === "blocked") {
      rollbackOptimisticVote();
      setScentRequestStatus(
        result.blockReason === "daily_limit"
          ? lang === "sr"
            ? `Iskoristio si 3 glasa u poslednja 24 sata. Novi glas možeš dodati za ${result.remainingHours || 1} h.`
            : `You've used 3 votes in the last 24 hours. You can vote again in ${result.remainingHours || 1}h.`
          : getVoteCooldownMessage(requestName, result.remainingDays)
      );
      return;
    }

    if (result?.status !== "ok") {
      rollbackOptimisticVote();
      setScentRequestStatus(
        lang === "sr"
          ? "Glas nije prošao. Probaj ponovo."
          : "Vote was not saved. Please try again."
      );
      return;
    }

    setScentRequestValue("");
  } finally {
    communityVoteInFlightRef.current.delete(requestName);
  }
};

'''

text = text[:start] + new_handler + text[end:]
path.write_text(text, encoding='utf-8')
