const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const stableJson = (value) => {
  const normalize = (item) => {
    if (Array.isArray(item)) return item.map(normalize);
    if (item && typeof item === "object") return Object.keys(item).sort().reduce((out, key) => {
      if (typeof item[key] !== "undefined") out[key] = normalize(item[key]);
      return out;
    }, {});
    return item;
  };
  return JSON.stringify(normalize(value ?? null));
};

export function scanObject(source, braceStart, label = "object") {
  let depth = 0;
  let quote = "";
  let escaped = false;
  for (let index = braceStart; index < source.length; index += 1) {
    const ch = source[index];
    if (quote) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === quote) quote = "";
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") { quote = ch; continue; }
    if (ch === "{") depth += 1;
    else if (ch === "}") {
      depth -= 1;
      if (depth === 0) return { start: braceStart, end: index + 1, block: source.slice(braceStart, index + 1) };
    }
  }
  throw new Error(`Could not determine object boundary for ${label}.`);
}

export function findJournalArticleBlock(source, articleId) {
  const id = Number(articleId);
  if (!Number.isInteger(id) || id <= 0) throw new Error("article_id must be a positive integer.");
  const marker = new RegExp(`\\bid\\s*:\\s*${escapeRegex(id)}\\s*,`);
  const match = marker.exec(source);
  if (!match) throw new Error(`Could not locate Journal article #${id}.`);
  let start = source.lastIndexOf("\n  {", match.index);
  if (start >= 0) start += 3;
  else start = source.lastIndexOf("{", match.index);
  if (start < 0) throw new Error(`Could not locate Journal article object #${id}.`);
  return scanObject(source, start, `Journal article #${id}`);
}

const pair = (value) => ({ sr: String(value?.sr || ""), en: String(value?.en || "") });

export function normalizeJournalArticle(article = {}) {
  const result = {
    id: Number(article.id),
    date: pair(article.date),
    image: String(article.image || ""),
    title: pair(article.title),
    excerpt: pair(article.excerpt),
    content: pair(article.content),
  };
  if (article.series != null && (String(article.series?.sr || "").trim() || String(article.series?.en || "").trim())) result.series = pair(article.series);
  if (article.relatedProducts != null) result.relatedProducts = Array.isArray(article.relatedProducts)
    ? article.relatedProducts.map((slug) => String(slug || "").trim()).filter(Boolean)
    : [];
  return result;
}

const indentMultiline = (value, spaces) => String(value).replace(/\n/g, `\n${" ".repeat(spaces)}`);
const templateLiteral = (value) => `\`${String(value || "").replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${")}\``;

export function renderJournalArticle(article) {
  const value = normalizeJournalArticle(article);
  const lines = [
    "{",
    `    id: ${value.id},`,
    "    date: {",
    `      en: ${JSON.stringify(value.date.en)},`,
    `      sr: ${JSON.stringify(value.date.sr)}`,
    "    },",
    `    image: ${JSON.stringify(value.image)},`,
    "    title: {",
    `      en: ${JSON.stringify(value.title.en)},`,
    `      sr: ${JSON.stringify(value.title.sr)}`,
    "    },",
    "    excerpt: {",
    `      en: ${JSON.stringify(value.excerpt.en)},`,
    `      sr: ${JSON.stringify(value.excerpt.sr)}`,
    "    },",
    "    content: {",
    `      en: ${indentMultiline(templateLiteral(value.content.en), 6)},`,
    `      sr: ${indentMultiline(templateLiteral(value.content.sr), 6)}`,
    "    }",
  ];
  if (value.series) {
    lines[lines.length - 1] += ",";
    lines.push("    series: {", `      en: ${JSON.stringify(value.series.en)},`, `      sr: ${JSON.stringify(value.series.sr)}`, "    }");
  }
  if (Array.isArray(value.relatedProducts)) {
    lines[lines.length - 1] += ",";
    lines.push("    relatedProducts: [");
    value.relatedProducts.forEach((slug, index) => lines.push(`      ${JSON.stringify(slug)}${index === value.relatedProducts.length - 1 ? "" : ","}`));
    lines.push("    ]");
  }
  lines.push("  }");
  return lines.join("\n");
}

export function replaceJournalArticle(source, articleId, expectedSourceBlock, approvedArticle) {
  const located = findJournalArticleBlock(source, articleId);
  if (typeof expectedSourceBlock !== "string" || !expectedSourceBlock.length) throw new Error("Journal preparation baseline is missing source_block.");
  if (located.block !== expectedSourceBlock) throw new Error(`LIVE DRIFT: Journal article #${articleId} changed after preparation.`);
  const rendered = renderJournalArticle(approvedArticle);
  return {
    source: source.slice(0, located.start) + rendered + source.slice(located.end),
    before: located.block,
    after: rendered,
  };
}

export function getJournalArticleIds(source) {
  const ids = [];
  const pattern = /\n\s{4}id\s*:\s*(\d+)\s*,/g;
  for (const match of source.matchAll(pattern)) ids.push(Number(match[1]));
  return ids;
}

export function getNextJournalArticleId(source) {
  const ids = getJournalArticleIds(source);
  return (ids.length ? Math.max(...ids) : 0) + 1;
}

export function journalArticleExists(source, articleId) {
  return getJournalArticleIds(source).includes(Number(articleId));
}

export function insertJournalArticle(source, approvedArticle) {
  const value = normalizeJournalArticle(approvedArticle);
  const nextId = getNextJournalArticleId(source);
  if (!Number.isInteger(value.id) || value.id <= 0) throw new Error("New Journal article requires a positive integer id.");
  if (journalArticleExists(source, value.id)) throw new Error(`Journal article #${value.id} already exists.`);
  if (value.id !== nextId) throw new Error(`New Journal article id must be the next sequential id (${nextId}).`);
  const closeIndex = source.lastIndexOf("\n];");
  if (closeIndex < 0) throw new Error("Could not locate journalArticles array boundary.");
  const rendered = renderJournalArticle(value);
  return {
    source: source.slice(0, closeIndex) + ",\n  " + rendered + source.slice(closeIndex),
    after: rendered,
    articleId: value.id,
  };
}
