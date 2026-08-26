const text = (field, lang) => {
  if (typeof field === "string") return field.trim();
  return String(field?.[lang] || "").trim();
};

const makeIssue = (level, articleId, field, message) => ({ level, articleId, field, message });

export function auditJournalArticles(articles = [], knownProductSlugs = []) {
  const issues = [];
  const ids = new Set();
  const productSlugs = new Set(knownProductSlugs);
  const rows = articles.map((article, index) => {
    const articleId = Number(article?.id);
    const rowIssues = [];
    const add = (level, field, message) => {
      const item = makeIssue(level, articleId || `row-${index + 1}`, field, message);
      issues.push(item);
      rowIssues.push(item);
    };

    if (!Number.isInteger(articleId) || articleId <= 0) add("error", "id", "Article id must be a positive integer.");
    else if (ids.has(articleId)) add("error", "id", `Duplicate article id: ${articleId}.`);
    else ids.add(articleId);

    for (const field of ["date", "title", "excerpt", "content"]) {
      for (const lang of ["sr", "en"]) {
        if (!text(article?.[field], lang)) add("error", `${field}.${lang}`, `${field}.${lang} is required.`);
      }
    }

    const image = String(article?.image || "").trim();
    if (!image) add("error", "image", "Journal image is required.");
    else if (!image.startsWith("/journal/") || image.endsWith("/")) add("error", "image", "Use a specific image file under /journal/.");

    if (article?.series && typeof article.series === "object") {
      for (const lang of ["sr", "en"]) if (!text(article.series, lang)) add("warning", `series.${lang}`, "Series label is only present in one language.");
    }

    if (article?.relatedProducts != null) {
      if (!Array.isArray(article.relatedProducts)) add("error", "relatedProducts", "relatedProducts must be an array of product slugs.");
      else {
        const seen = new Set();
        for (const slug of article.relatedProducts) {
          const value = String(slug || "").trim();
          if (!value) add("error", "relatedProducts", "Related product slug cannot be empty.");
          else if (seen.has(value)) add("warning", "relatedProducts", `Duplicate related product: ${value}.`);
          else seen.add(value);
          if (value && productSlugs.size && !productSlugs.has(value)) add("error", "relatedProducts", `Unknown product slug: ${value}.`);
        }
      }
    }

    return {
      id: articleId,
      article,
      issues: rowIssues,
      errors: rowIssues.filter((item) => item.level === "error"),
      warnings: rowIssues.filter((item) => item.level === "warning"),
      complete: !rowIssues.some((item) => item.level === "error"),
    };
  });

  return {
    rows,
    issues,
    errors: issues.filter((item) => item.level === "error"),
    warnings: issues.filter((item) => item.level === "warning"),
    complete: rows.filter((row) => row.complete).length,
    total: rows.length,
  };
}

export { text as getJournalAuditText };
