const normalizeContinuityText = (value = "") =>
  String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "dj")
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9€]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const getProductBySlug = (products = [], slug = "") =>
  products.find((product) => product?.slug === slug) || null;

const getProductLabel = (product) =>
  product?.shortName || product?.name || "";

const hasExplicitProductReference = (query, products = []) => {
  const text = normalizeContinuityText(query);
  const compactText = text.replace(/\s+/g, "");

  return products.some((product) => {
    const aliases = [
      product?.name,
      product?.shortName,
      product?.slug?.replace(/-/g, " "),
    ]
      .filter(Boolean)
      .map(normalizeContinuityText)
      .filter((alias) => alias.length >= 4);

    return aliases.some((alias) => {
      const directMatch =
        text === alias ||
        text.startsWith(alias + " ") ||
        text.endsWith(" " + alias) ||
        text.includes(" " + alias + " ");

      if (directMatch) return true;
      if (!/\d/.test(alias)) return false;

      const compactAlias = alias.replace(/\s+/g, "");

      return (
        compactText === compactAlias ||
        compactText.startsWith(compactAlias) ||
        compactText.endsWith(compactAlias) ||
        compactText.includes(compactAlias)
      );
    });
  });
};

const PAIR_FOLLOW_UP_CUES = [
  "od ta dva",
  "od ova dva",
  "izmedju ta dva",
  "između ta dva",
  "koji od ta dva",
  "koji od ova dva",
  "which of those two",
  "between those two",
  "of those two",
];

const SINGLE_PRODUCT_FACT_CUES = [
  "koliko je",
  "koliko kosta",
  "koliko košta",
  "cena",
  "cijena",
  "price",
  "ima li",
  "imate li",
  "dostupan",
  "dostupna",
  "available",
  "koje velicine",
  "koje veličine",
  "koje ml",
  "size",
  "sizes",
  "note",
  "notes",
  "sastav",
  "dna",
  "inspired by",
  "sezona",
  "season",
];

const ADDITIVE_FOLLOW_UP_CUES = [
  "bez ",
  "without ",
  "ali ",
  "but ",
  "manje ",
  "less ",
  "vise ",
  "više ",
  "more ",
  "za posao",
  "for work",
  "za dejt",
  "for date",
  "za vece",
  "za veče",
  "for evening",
  "za leto",
  "za ljeto",
  "for summer",
  "za zimu",
  "for winter",
  "do ",
  "under ",
  "ispod ",
  "max ",
];

const CHEAPER_FOLLOW_UP_CUES = [
  "nesto jeftinije",
  "nešto jeftinije",
  "jeftinije",
  "cheaper",
  "something cheaper",
];

const containsAny = (text, cues = []) =>
  cues.some((cue) =>
    text.includes(normalizeContinuityText(cue))
  );

const getRequestedMl = (query) => {
  const match = String(query || "").match(
    /(^|\s)(\d{1,3})\s*ml\b/i
  );
  return match ? Number(match[2]) : null;
};

const getCheaperBudget = (context) => {
  const price = Number(
    context?.resultSnapshots?.[0]?.selectedPrice
  );

  if (!Number.isFinite(price) || price <= 1) {
    return null;
  }

  return Math.max(1, Math.ceil(price) - 1);
};

export const resolveDiscoveryFollowUp = ({
  query,
  context = null,
  products = [],
  lang = "sr",
}) => {
  const rawQuery = String(query || "").trim();

  if (!rawQuery || !context) {
    return {
      resolvedQuery: rawQuery,
      usedContext: false,
      kind: "none",
      sourceProductSlugs: [],
    };
  }

  if (hasExplicitProductReference(rawQuery, products)) {
    return {
      resolvedQuery: rawQuery,
      usedContext: false,
      kind: "explicit-product",
      sourceProductSlugs: [],
    };
  }

  const text = normalizeContinuityText(rawQuery);
  const productSlugs = Array.isArray(context.productSlugs)
    ? context.productSlugs.filter(Boolean)
    : [];

  if (
    productSlugs.length === 2 &&
    containsAny(text, PAIR_FOLLOW_UP_CUES)
  ) {
    const first = getProductBySlug(products, productSlugs[0]);
    const second = getProductBySlug(products, productSlugs[1]);

    if (first && second) {
      return {
        resolvedQuery:
          `${getProductLabel(first)} ili ${getProductLabel(second)} — ${rawQuery}`,
        usedContext: true,
        kind: "pair",
        sourceProductSlugs: productSlugs,
      };
    }
  }

  if (
    productSlugs.length === 1 &&
    (
      containsAny(text, SINGLE_PRODUCT_FACT_CUES) ||
      Number.isFinite(getRequestedMl(rawQuery))
    )
  ) {
    const product =
      getProductBySlug(products, productSlugs[0]);

    if (product) {
      return {
        resolvedQuery:
          `${getProductLabel(product)} — ${rawQuery}`,
        usedContext: true,
        kind: "single-product",
        sourceProductSlugs: productSlugs,
      };
    }
  }

  if (
    containsAny(text, CHEAPER_FOLLOW_UP_CUES) &&
    context?.resultSnapshots?.length
  ) {
    const anchorSlug =
      context.resultSnapshots[0]?.slug;
    const anchor =
      getProductBySlug(products, anchorSlug);
    const budget = getCheaperBudget(context);

    if (anchor && Number.isFinite(budget)) {
      const prefix =
        lang === "en" ? "Something like" : "Nešto kao";
      const budgetCue =
        lang === "en" ? "under" : "do";

      return {
        resolvedQuery:
          `${prefix} ${getProductLabel(anchor)} ${budgetCue} ${budget} €`,
        usedContext: true,
        kind: "cheaper-than-top-result",
        sourceProductSlugs: [anchorSlug],
      };
    }
  }

  if (
    context?.effectiveQuery &&
    containsAny(text, ADDITIVE_FOLLOW_UP_CUES)
  ) {
    return {
      resolvedQuery:
        `${context.effectiveQuery}. ${rawQuery}`,
      usedContext: true,
      kind: "additive-constraint",
      sourceProductSlugs:
        productSlugs.length
          ? productSlugs
          : (context.resultSnapshots || [])
              .slice(0, 3)
              .map((item) => item.slug)
              .filter(Boolean),
    };
  }

  return {
    resolvedQuery: rawQuery,
    usedContext: false,
    kind: "none",
    sourceProductSlugs: [],
  };
};

export const buildDiscoveryConversationContext = ({
  rawQuery = "",
  effectiveQuery = "",
  knowledge = null,
  discovery = null,
}) => {
  if (knowledge?.handled) {
    const productSlugs =
      knowledge?.entity?.productSlugs ||
      (
        knowledge?.entity?.productSlug
          ? [knowledge.entity.productSlug]
          : []
      );

    if (!productSlugs.length) return null;

    return {
      mode: "knowledge",
      rawQuery,
      effectiveQuery: effectiveQuery || rawQuery,
      productSlugs,
      resultSnapshots: [],
    };
  }

  if (
    discovery?.isRelevant &&
    Array.isArray(discovery?.results)
  ) {
    const resultSnapshots =
      discovery.results
        .slice(0, 5)
        .map((item) => ({
          slug: item?.product?.slug || "",
          selectedPrice:
            Number(item?.selectedSize?.price) || null,
        }))
        .filter((item) => item.slug);

    return {
      mode: "discovery",
      rawQuery,
      effectiveQuery: effectiveQuery || rawQuery,
      productSlugs: [],
      resultSnapshots,
    };
  }

  return null;
};
