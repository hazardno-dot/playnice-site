import React, { useMemo } from "react";
import "./JournalArticlePage.css";

const getJournalText = (field, lang = "sr") => {
  if (!field) return "";

  if (typeof field === "string") return field;

  if (typeof field === "object") {
    return field[lang] || field.en || field.sr || "";
  }

  return "";
};

const estimateReadingTime = (content = "") => {
  const words = String(content)
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  return Math.max(1, Math.ceil(words / 210));
};

function JournalArticlePage({
  lang = "sr",
  article,
  previousArticle = null,
  nextArticle = null,
  relatedProducts = [],
  onBackToJournal,
  onOpenArticle,
  onOpenProduct,
  onArticleLink,
}) {
  const title = getJournalText(article?.title, lang);
  const excerpt = getJournalText(article?.excerpt, lang);
  const content = getJournalText(article?.content, lang);
  const date = getJournalText(article?.date, lang);
  const series = getJournalText(article?.series, lang);

  const readingTime = useMemo(
    () => estimateReadingTime(content),
    [content]
  );

  const paragraphs = useMemo(() => {
    if (!content) return [];

    return String(content)
      .split(/\n\s*\n/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);
  }, [content]);

  const copy =
    lang === "en"
      ? {
          editorial: "PlayNice Editorial",
          minRead: "min read",
          author: "Charlie",
          authorRole: "PlayNice Editorial",
          related: "Related Fragrances",
          previous: "Previous Story",
          next: "Next Story",
          back: "Back to Le Journal",
          explore: "Explore fragrance",
        }
      : {
          editorial: "PlayNice Editorial",
          minRead: "min čitanja",
          author: "Čarli",
          authorRole: "PlayNice Editorial",
          related: "Povezani parfemi",
          previous: "Prethodna priča",
          next: "Sledeća priča",
          back: "Nazad na Le Journal",
          explore: "Pogledaj parfem",
        };

  if (!article) {
    return null;
  }

  return (
    <main className="journal-article-page">
      <article className="journal-article-shell">
        <header className="journal-article-header">
          <button
            type="button"
            className="journal-article-back-top"
            onClick={onBackToJournal}
          >
            <span aria-hidden="true">←</span>
            <span>{copy.back}</span>
          </button>

          <div className="journal-article-heading">
            <span className="journal-article-eyebrow">
              {copy.editorial}
            </span>

            <div className="journal-article-meta">
              {date && <span>{date}</span>}

              <i aria-hidden="true" />

              <span>
                {readingTime} {copy.minRead}
              </span>

              {series && (
                <>
                  <i aria-hidden="true" />
                  <span>{series}</span>
                </>
              )}
            </div>

            <h1>{title}</h1>

            {excerpt && (
              <p className="journal-article-deck">
                {excerpt}
              </p>
            )}

            <div className="journal-article-author">
              <div
                className="journal-article-author-avatar"
                aria-hidden="true"
              >
                {lang === "sr" ? "Č" : "C"}
              </div>

              <div>
                <strong>{copy.author}</strong>
                <span>{copy.authorRole}</span>
              </div>
            </div>
          </div>
        </header>

        {article.image && (
          <figure className="journal-article-hero">
            <img
              src={article.image}
              alt={title}
              loading="eager"
              decoding="async"
            />
          </figure>
        )}

        <div className="journal-article-content-wrap">
          <div className="journal-article-content">
            {paragraphs.map((paragraph, index) => {
              const isSignature =
                paragraph === "— Charlie" ||
                paragraph === "— Čarli" ||
                paragraph === "- Charlie" ||
                paragraph === "- Čarli";

              if (isSignature) {
                return (
                  <div
                    className="journal-article-signature"
                    key={`${paragraph}-${index}`}
                  >
                    <span>{paragraph}</span>
                    <small>{copy.authorRole}</small>
                  </div>
                );
              }

              if (
                paragraph === "—" ||
                paragraph === "-"
              ) {
                return (
                  <div
                    key={`divider-${index}`}
                    className="journal-article-divider"
                    aria-hidden="true"
                  >
                    <span />
                  </div>
                );
              }

              return (
                <p key={`${paragraph.slice(0, 24)}-${index}`}>
                  {paragraph}
                </p>
              );
            })}
          </div>
        </div>

        {(relatedProducts.length > 0 || article.links?.length > 0) && (
            <section className="journal-article-related">
                <div className="journal-article-section-head">
                <span>
                    {relatedProducts.length > 0
                    ? copy.related
                    : lang === "sr"
                    ? "Iz priče"
                    : "From the Story"}
                </span>

                <i aria-hidden="true" />
                </div>

                <div className="journal-article-related-grid">
                {relatedProducts.map((product) => (
                    <button
                    key={product.id || product.slug || product.name}
                    type="button"
                    className="journal-article-related-card"
                    onClick={() => onOpenProduct?.(product)}
                    >
                    <div className="journal-article-related-media">
                        <img
                        src={product.image}
                        alt={product.name}
                        loading="lazy"
                        />
                    </div>

                    <div className="journal-article-related-copy">
                        <span>
                        {product.category || "Fragrance"}
                        </span>

                        <h3>
                        {product.cardName || product.name}
                        </h3>

                        <small>
                        {copy.explore}
                        <span aria-hidden="true">→</span>
                        </small>
                    </div>
                    </button>
                ))}

                {article.links?.map((link, index) => {
                    const label = getJournalText(link.label, lang);

                    const isExternal =
                    Boolean(link.url) &&
                    /^https?:\/\//i.test(link.url);

                    let sourceLabel =
                    lang === "sr" ? "Iz priče" : "From the Story";

                    if (link.url?.includes("youtube.com")) {
                    sourceLabel = "YouTube";
                    } else if (link.url?.includes("imdb.com")) {
                    sourceLabel = "IMDb";
                    } else if (link.action === "shop") {
                    sourceLabel = "PlayNice";
                    } else if (link.action === "scent-request") {
                    sourceLabel =
                        lang === "sr" ? "Zajednica" : "Community";
                    }

                    const linkContent = (
                    <>
                        <div className="journal-article-story-link-mark">
                        <span>{sourceLabel}</span>
                        <strong aria-hidden="true">
                            {isExternal ? "↗" : "→"}
                        </strong>
                        </div>

                        <div className="journal-article-story-link-copy">
                        <span>
                            {lang === "sr"
                            ? "POVEZANO SA PRIČOM"
                            : "FROM THE STORY"}
                        </span>

                        <h3>{label}</h3>

                        <small>
                            {isExternal
                            ? lang === "sr"
                                ? "Otvori link"
                                : "Open link"
                            : lang === "sr"
                            ? "Nastavi"
                            : "Continue"}

                            <span aria-hidden="true">
                            {isExternal ? "↗" : "→"}
                            </span>
                        </small>
                        </div>
                    </>
                    );

                    if (isExternal) {
                    return (
                        <a
                        key={`${label}-${index}`}
                        className="journal-article-story-link-card"
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        >
                        {linkContent}
                        </a>
                    );
                    }

                    return (
                    <button
                        key={`${label}-${index}`}
                        type="button"
                        className="journal-article-story-link-card"
                        onClick={() => onArticleLink?.(link)}
                    >
                        {linkContent}
                    </button>
                    );
                })}
                </div>
            </section>
            )}

        <nav
          className="journal-article-navigation"
          aria-label="Journal article navigation"
        >
          <div className="journal-article-navigation-side">
            {previousArticle && (
              <button
                type="button"
                className="journal-article-nav-button is-previous"
                onClick={() =>
                  onOpenArticle?.(previousArticle)
                }
              >
                <span className="journal-article-nav-label">
                  ← {copy.previous}
                </span>

                <strong>
                  {getJournalText(
                    previousArticle.title,
                    lang
                  )}
                </strong>
              </button>
            )}
          </div>

          <button
            type="button"
            className="journal-article-back-bottom"
            onClick={onBackToJournal}
          >
            {copy.back}
          </button>

          <div className="journal-article-navigation-side is-right">
            {nextArticle && (
              <button
                type="button"
                className="journal-article-nav-button is-next"
                onClick={() =>
                  onOpenArticle?.(nextArticle)
                }
              >
                <span className="journal-article-nav-label">
                  {copy.next} →
                </span>

                <strong>
                  {getJournalText(
                    nextArticle.title,
                    lang
                  )}
                </strong>
              </button>
            )}
          </div>
        </nav>

        <footer className="journal-article-editorial-footer">
          <span>PlayNice Editorial</span>
          <i aria-hidden="true" />
          <strong>Remember. PlayNice.</strong>
        </footer>
      </article>
    </main>
  );
}

export default JournalArticlePage;