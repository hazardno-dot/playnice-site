import {
  getJournalText,
  getJournalAvatarLetter,
  getJournalArticleKey,
  getRelatedJournalProducts,
  sortJournalArticles,
  getJournalNavigation,
  getLatestJournalState,
  findJournalArticleBySlug,
} from "./journalDerivations";

describe("journalDerivations", () => {
  test("resolves localized text with en/sr fallback", () => {
    expect(
      getJournalText(
        { sr: "Ćao", en: "Hello" },
        "sr"
      )
    ).toBe("Ćao");

    expect(
      getJournalText(
        { en: "Hello" },
        "sr"
      )
    ).toBe("Hello");

    expect(
      getJournalText("Plain", "sr")
    ).toBe("Plain");
  });

  test("returns language-specific avatar letter", () => {
    expect(
      getJournalAvatarLetter("sr")
    ).toBe("Č");
    expect(
      getJournalAvatarLetter("en")
    ).toBe("C");
  });

  test("builds stable article key by existing precedence", () => {
    expect(
      getJournalArticleKey({
        id: 12,
        slug: "slug",
      })
    ).toBe(12);

    expect(
      getJournalArticleKey({
        slug: "slug",
      })
    ).toBe("slug");

    expect(
      getJournalArticleKey({
        title: {
          en: "English",
          sr: "Srpski",
        },
      })
    ).toBe("English");
  });

  test("resolves related products by slug then exact normalized name", () => {
    const products = [
      {
        id: 1,
        slug: "one",
        name: "Product One",
      },
      {
        id: 2,
        slug: "two",
        name: "Product Two",
      },
    ];

    const result =
      getRelatedJournalProducts({
        article: {
          relatedProducts: [
            "one",
            "Product Two",
            "missing",
          ],
        },
        products,
        getProductSlug: (product) =>
          product.slug,
      });

    expect(result.map((p) => p.id))
      .toEqual([1, 2]);
  });

  test("sorts articles newest id first", () => {
    expect(
      sortJournalArticles([
        { id: 2 },
        { id: 10 },
        { id: 4 },
      ]).map((article) => article.id)
    ).toEqual([10, 4, 2]);
  });

  test("derives previous and next journal neighbors", () => {
    const sortedArticles = [
      { id: 10 },
      { id: 9 },
      { id: 8 },
    ];

    expect(
      getJournalNavigation({
        sortedArticles,
        activeArticle: { id: 9 },
      })
    ).toEqual({
      activeIndex: 1,
      previousArticle: { id: 8 },
      nextArticle: { id: 10 },
    });

    expect(
      getJournalNavigation({
        sortedArticles,
        activeArticle: { id: 10 },
      })
    ).toEqual({
      activeIndex: 0,
      previousArticle: { id: 9 },
      nextArticle: null,
    });
  });

  test("derives latest article and unread state", () => {
    const sortedArticles = [
      { id: 20 },
      { id: 19 },
    ];

    expect(
      getLatestJournalState({
        sortedArticles,
        seenLatestJournalKey: "19",
      })
    ).toEqual({
      latestArticle: { id: 20 },
      latestArticleKey: "20",
      hasNewArticle: true,
      unreadCount: 1,
    });

    expect(
      getLatestJournalState({
        sortedArticles,
        seenLatestJournalKey: "20",
      }).hasNewArticle
    ).toBe(false);
  });

  test("finds article by generated slug", () => {
    const articles = [
      { id: 1, slug: "first" },
      { id: 2, slug: "second" },
    ];

    expect(
      findJournalArticleBySlug({
        articles,
        slug: "second",
        getArticleSlug: (article) =>
          article.slug,
      })
    ).toEqual({
      id: 2,
      slug: "second",
    });
  });
});
