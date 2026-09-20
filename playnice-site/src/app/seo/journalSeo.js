import { getJournalArticleSlug } from "../../lib/journalSlug";
import { SITE_BASE_URL } from "./productSeo";

const getJournalText = (field, lang) => {
  if (!field) return "";
  if (typeof field === "string") return field;
  if (typeof field === "object") return field[lang] || field.en || field.sr || "";
  return "";
};

export const getJournalSeoUrl = (article = null) => {
  if (!article) return `${SITE_BASE_URL}/journal`;
  const slug = getJournalArticleSlug(article);
  return slug ? `${SITE_BASE_URL}/journal/${slug}` : `${SITE_BASE_URL}/journal`;
};

export const getJournalSeoImage = (article = null) => {
  const image = article?.image;
  if (!image) return `${SITE_BASE_URL}/og-image.jpg`;
  if (/^https?:\/\//i.test(image)) return image;
  return `${SITE_BASE_URL}${image.startsWith("/") ? "" : "/"}${image}`;
};

export const getJournalSeoTitle = (article, lang = "sr") => {
  if (!article) {
    return lang === "en"
      ? "Le Journal | Stories, fragrance & culture | PlayNice"
      : "Le Journal | Priče, parfemi i kultura | PlayNice";
  }

  return `${getJournalText(article.title, lang)} | Le Journal | PlayNice`;
};

export const getJournalSeoDescription = (article, lang = "sr") => {
  if (!article) {
    return lang === "en"
      ? "Le Journal by PlayNice — stories about fragrance, people, culture, questionable decisions and everything that somehow connects them."
      : "Le Journal by PlayNice — priče o parfemima, ljudima, kulturi, sumnjivim odlukama i svemu što ih nekako povezuje.";
  }

  const excerpt = getJournalText(article.excerpt, lang).trim();
  if (!excerpt) {
    return lang === "en"
      ? "Read the latest story from Le Journal by PlayNice."
      : "Pročitaj priču iz PlayNice Le Journala.";
  }

  return excerpt.length <= 160 ? excerpt : `${excerpt.slice(0, 157).trim()}...`;
};

export const getJournalStructuredData = (article, lang = "sr") => {
  if (!article) return null;

  const title = getJournalText(article.title, lang);
  const description = getJournalSeoDescription(article, lang);
  const url = getJournalSeoUrl(article);
  const image = getJournalSeoImage(article);

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    image: [image],
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    author: { "@type": "Person", name: lang === "sr" ? "Čarli" : "Charlie" },
    publisher: { "@type": "Organization", name: "PlayNice", url: SITE_BASE_URL },
    inLanguage: lang === "sr" ? "sr" : "en",
    isPartOf: { "@type": "Blog", name: "Le Journal", url: `${SITE_BASE_URL}/journal` }
  };
};
