import React, { useEffect, useMemo } from "react";
import "./JournalPage.css";

const getJournalText = (field, lang = "sr") => {
  if (!field) return "";

  if (typeof field === "string") return field;

  if (typeof field === "object") {
    return field[lang] || field.en || field.sr || "";
  }

  return "";
};

const getJournalArticleSlug = (article) => {
  if (!article) return "";

  const title =
    getJournalText(article.title, "en") ||
    getJournalText(article.title, "sr") ||
    `article-${article.id}`;

  const normalizedTitle = String(title)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${article.id}-${normalizedTitle}`;
};

function JournalPage({
  lang = "sr",
  articles = [],
  onOpenArticle,
}) {

    useEffect(() => {
        document.body.classList.add("journal-active");

        return () => {
            document.body.classList.remove("journal-active");
        };
        }, []);
  const sortedArticles = useMemo(() => {
    if (!Array.isArray(articles)) return [];

    return [...articles].sort(
      (a, b) => Number(b?.id || 0) - Number(a?.id || 0)
    );
  }, [articles]);

  const featuredArticle = sortedArticles[0] || null;
  const archiveArticles = sortedArticles.slice(1);

  const copy =
    lang === "en"
      ? {
          eyebrow: "PlayNice Editorial",
          title: "Le Journal",
          intro:
            "Fragrance, people, questionable decisions and the stories that somehow connect them.",
          latest: "Latest Story",
          archive: "From the Archive",
          read: "Read story",
          empty: "No stories yet.",
        }
      : {
          eyebrow: "PlayNice Editorial",
          title: "Le Journal",
          intro:
            "Parfemi, ljudi, sumnjive odluke i priče koje ih nekako povezuju.",
          latest: "Najnovija priča",
          archive: "Iz arhive",
          read: "Pročitaj priču",
          empty: "Još nema priča.",
        };

  const handleArticleOpen = (article) => {
    if (!article) return;

    if (typeof onOpenArticle === "function") {
      onOpenArticle(article, getJournalArticleSlug(article));
    }
  };

  const handleArticleKeyDown = (event, article) => {
    if (event.key !== "Enter" && event.key !== " ") return;

    event.preventDefault();
    handleArticleOpen(article);
  };

  if (!featuredArticle) {
    return (
      <main className="journal-page">
        <section className="journal-page-empty">
          <span className="journal-page-eyebrow">{copy.eyebrow}</span>
          <h1>
            <span>Le</span>
            <span className="journal-page-title-journal">Journal</span>
          </h1>
          <p>{copy.empty}</p>
        </section>
      </main>
    );
  }

  return (
    <main className="journal-page">
      <section className="journal-page-intro">
        <div className="journal-page-intro-inner">
          <span className="journal-page-eyebrow">{copy.eyebrow}</span>

          <h1>
            <span>Le</span>
            <span className="journal-page-title-journal">Journal</span>
          </h1>

          <p>{copy.intro}</p>
        </div>
      </section>

      <section className="journal-page-featured-section">
        <div className="journal-page-section-label">
          <span>{copy.latest}</span>
          <i aria-hidden="true" />
        </div>

        <article
          className="journal-page-featured"
          role="link"
          tabIndex={0}
          onClick={() => handleArticleOpen(featuredArticle)}
          onKeyDown={(event) =>
            handleArticleKeyDown(event, featuredArticle)
          }
          aria-label={`${copy.read}: ${getJournalText(
            featuredArticle.title,
            lang
          )}`}
        >
          <div
            className={`journal-page-featured-media journal-page-featured-media--${featuredArticle.id}`}
          >
            {featuredArticle.image && (
              <img
                src={featuredArticle.image}
                alt={getJournalText(featuredArticle.title, lang)}
                loading="eager"
                decoding="async"
              />
            )}

            <div
              className="journal-page-featured-media-shade"
              aria-hidden="true"
            />
          </div>

          <div className="journal-page-featured-copy">
            <div className="journal-page-featured-meta">
              <span>{getJournalText(featuredArticle.date, lang)}</span>

              {featuredArticle.series && (
                <>
                  <i aria-hidden="true" />
                  <span>
                    {getJournalText(featuredArticle.series, lang)}
                  </span>
                </>
              )}
            </div>

            <h2>{getJournalText(featuredArticle.title, lang)}</h2>

            <p>{getJournalText(featuredArticle.excerpt, lang)}</p>

            <span className="journal-page-read-link">
              <span>{copy.read}</span>
              <span aria-hidden="true">↗</span>
            </span>
          </div>
        </article>
      </section>

      {archiveArticles.length > 0 && (
        <section className="journal-page-archive">
          <div className="journal-page-section-label">
            <span>{copy.archive}</span>
            <i aria-hidden="true" />
          </div>

          <div className="journal-page-grid">
            {archiveArticles.map((article, index) => (
              <article
                key={article.id}
                className={`journal-page-card ${
                  index === 0 ? "journal-page-card--lead" : ""
                }`}
                role="link"
                tabIndex={0}
                onClick={() => handleArticleOpen(article)}
                onKeyDown={(event) =>
                  handleArticleKeyDown(event, article)
                }
                aria-label={`${copy.read}: ${getJournalText(
                  article.title,
                  lang
                )}`}
              >
                <div className="journal-page-card-media">
                  {article.image && (
                    <img
                      src={article.image}
                      alt={getJournalText(article.title, lang)}
                      loading="lazy"
                      decoding="async"
                    />
                  )}

                  <div
                    className="journal-page-card-media-shade"
                    aria-hidden="true"
                  />
                </div>

                <div className="journal-page-card-copy">
                  <div className="journal-page-card-meta">
                    <span>{getJournalText(article.date, lang)}</span>

                    {article.series && (
                      <>
                        <i aria-hidden="true" />
                        <span>
                          {getJournalText(article.series, lang)}
                        </span>
                      </>
                    )}
                  </div>

                  <h2>{getJournalText(article.title, lang)}</h2>

                  <p>{getJournalText(article.excerpt, lang)}</p>

                  <span className="journal-page-card-link">
                    <span>{copy.read}</span>
                    <span aria-hidden="true">→</span>
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
        <footer className="journal-page-editorial-footer">
          <span>PlayNice Editorial</span>
          <i aria-hidden="true" />
          <strong>Remember. PlayNice.</strong>
        </footer>
    </main>
  );
}

export { getJournalArticleSlug };
export default JournalPage;