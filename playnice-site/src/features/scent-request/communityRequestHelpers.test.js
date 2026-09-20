import {
  EXISTING_COLLECTION_LOCKED_VOTES,
  getVisibleCommunityRequests,
  mergeExistingCollectionRequests,
  sortExistingCollectionRequests,
  getOptimisticCommunityVoteState,
  rollbackCommunityVote,
  upsertCommunityRequestVote,
} from "./communityRequestHelpers";

const normalizeName = (value = "") =>
  String(value).toLowerCase().trim();

const products = [
  { id: 1, name: "Existing One", slug: "existing-one" },
  { id: 2, name: "Existing Two", slug: "existing-two" },
  {
    id: 3,
    name: "Bois Imperial",
    slug: "bois-imperial-essential-parfums",
  },
];

const findExistingProductByRequest = (name) =>
  products.find(
    (product) => normalizeName(product.name) === normalizeName(name)
  ) || null;

describe("communityRequestHelpers", () => {
  test("filters existing and ambiguous requests from the public list", () => {
    const requests = [
      { name: "Wanted A", votes: 3 },
      { name: "Existing One", votes: 9 },
      { name: "Ambiguous", votes: 7 },
      { name: "Wanted B", votes: 5 },
    ];

    const result = getVisibleCommunityRequests(
      requests,
      (name) => ({
        product: findExistingProductByRequest(name),
        ambiguous: name === "Ambiguous",
      })
    );

    expect(result.map((item) => item.name)).toEqual([
      "Wanted B",
      "Wanted A",
    ]);
  });

  test("merges existing collection requests and preserves earliest firstSeen", () => {
    const result = mergeExistingCollectionRequests(
      [
        {
          name: "Existing One",
          votes: 2,
          firstSeen: "2026-09-10T10:00:00.000Z",
        },
        { name: "Bois Imperial", votes: 99 },
      ],
      [
        {
          name: "Existing One",
          votes: 3,
          firstSeen: "2026-09-01T10:00:00.000Z",
        },
      ],
      {
        findExistingProductByRequest,
        normalizeScentName: normalizeName,
        lockedVotes: {},
      }
    );

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Existing One");
    expect(result[0].votes).toBe(5);
    expect(result[0].firstSeen).toBe(
      "2026-09-01T10:00:00.000Z"
    );
  });

  test("applies locked vote counts as display priority", () => {
    const lockedVotes = {
      "Existing One": 27,
    };

    const result = sortExistingCollectionRequests(
      [
        { name: "Existing Two", votes: 50 },
        { name: "Existing One", votes: 2 },
      ],
      lockedVotes
    );

    expect(result[0].name).toBe("Existing Two");
    expect(result[0].displayVotes).toBe(50);
    expect(result[1].displayVotes).toBe(27);
  });

  test("calculates optimistic vote rank movement and top-three entry", () => {
    const requests = [
      { name: "A", votes: 10 },
      { name: "B", votes: 9 },
      { name: "C", votes: 8 },
      { name: "D", votes: 8 },
    ];

    const visible = (items) =>
      [...items].sort((a, b) => b.votes - a.votes);

    const result = getOptimisticCommunityVoteState(
      requests,
      "D",
      visible
    );

    expect(result.nextRequests.find((item) => item.name === "D").votes).toBe(9);
    expect(result.trends.D).toBe("up");
    expect(result.topThreeEntries.D).toBe(true);
  });

  test("rolls back an optimistic vote without going below zero", () => {
    expect(
      rollbackCommunityVote(
        [
          { name: "A", votes: 0 },
          { name: "B", votes: 2 },
        ],
        "A"
      ).find((item) => item.name === "A").votes
    ).toBe(0);
  });

  test("upserts a normalized community request vote", () => {
    const updated = upsertCommunityRequestVote(
      [{ name: "Wanted A", votes: 2 }],
      " wanted a ",
      normalizeName
    );

    expect(updated).toEqual([{ name: "Wanted A", votes: 3 }]);
  });

  test("keeps the production locked-vote contract", () => {
    expect(
      EXISTING_COLLECTION_LOCKED_VOTES["Yves Saint Laurent Y Iced Cologne"]
    ).toBe(27);
  });
});
