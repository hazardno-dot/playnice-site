const unique = (items = []) =>
  Array.from(new Set(items.filter(Boolean)));

const normalizeSource = (source = {}) => {
  const url = String(source?.url || "").trim();
  const label = String(source?.label || "").trim();
  const type = String(source?.type || "reference").trim();

  if (!url && !label) return null;

  return {
    kind: "external-source",
    provenance: type || "reference",
    label,
    url,
    confidence:
      type === "brand-official"
        ? "high"
        : "medium",
  };
};

export const getEvidenceLevel = (
  evidence = []
) => {
  const provenances = new Set(
    evidence.map((item) => item?.provenance)
  );

  if (
    provenances.has("catalog-live") &&
    !provenances.has("playnice-fi-profile")
  ) {
    return "grounded";
  }

  if (
    provenances.has("brand-official") &&
    !provenances.has("playnice-fi-profile")
  ) {
    return "verified";
  }

  if (provenances.has("playnice-fi-profile")) {
    return "interpretive";
  }

  if (evidence.length) return "supported";
  return "unknown";
};

export const buildKnowledgeEvidence = (
  entity,
  fallbackConfidence = "medium"
) => {
  const sourceEvidence =
    (entity?.sources || [])
      .map(normalizeSource)
      .filter(Boolean);

  if (sourceEvidence.length) {
    return {
      evidence: sourceEvidence,
      evidenceLevel:
        getEvidenceLevel(sourceEvidence),
      provenance: unique(
        sourceEvidence.map(
          (item) => item.provenance
        )
      ),
      confidence: fallbackConfidence,
    };
  }

  return {
    evidence: [
      {
        kind: "knowledge-entry",
        provenance: "fi-knowledge",
        label: entity?.name || "",
        url: "",
        confidence: fallbackConfidence,
      },
    ],
    evidenceLevel: "supported",
    provenance: ["fi-knowledge"],
    confidence: fallbackConfidence,
  };
};

const FACTUAL_PRODUCT_CUES = [
  "koliko kosta", "koliko košta", "koliko je",
  "cena", "cijena", "price",
  "koje velicine", "koje veličine",
  "koje ml", "sizes", "size",
  "imate li", "ima li", "available",
  "note", "notes", "sastav",
  "inspired by", "dna",
  "sezona", "godisnje doba", "godišnje doba",
];

const normalizeText = (value = "") =>
  String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "dj")
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const hasAny = (text, cues = []) =>
  cues.some((cue) =>
    text.includes(normalizeText(cue))
  );

export const buildProductEvidence = ({
  query = "",
  type = "",
  products = [],
}) => {
  const text = normalizeText(query);
  const isExplicitFact =
    /\b\d{1,3}\s*ml\b/i.test(
      String(query || "")
    ) ||
    hasAny(text, FACTUAL_PRODUCT_CUES);

  const catalogEvidence = products
    .filter(Boolean)
    .map((product) => ({
      kind: "catalog-record",
      provenance: "catalog-live",
      label:
        product?.shortName ||
        product?.name ||
        product?.slug ||
        "",
      productSlug: product?.slug || "",
      confidence: "high",
    }));

  const usesProfile =
    type === "product-comparison" ||
    (
      type === "product-grounding" &&
      !isExplicitFact
    );

  const profileEvidence = usesProfile
    ? products
        .filter(Boolean)
        .map((product) => ({
          kind: "profile-inference",
          provenance: "playnice-fi-profile",
          label:
            product?.shortName ||
            product?.name ||
            product?.slug ||
            "",
          productSlug:
            product?.slug || "",
          confidence: "medium",
        }))
    : [];

  const evidence = [
    ...catalogEvidence,
    ...profileEvidence,
  ];

  return {
    evidence,
    evidenceLevel:
      getEvidenceLevel(evidence),
    provenance: unique(
      evidence.map(
        (item) => item.provenance
      )
    ),
    confidence:
      usesProfile ? "medium" : "high",
  };
};

export const buildDiscoveryEvidence = ({
  product,
  profile,
}) => {
  const evidence = [
    {
      kind: "catalog-record",
      provenance: "catalog-live",
      label:
        product?.shortName ||
        product?.name ||
        product?.slug ||
        "",
      productSlug: product?.slug || "",
      confidence: "high",
    },
    {
      kind: "ranking-inference",
      provenance: "playnice-fi-profile",
      label:
        profile?.hasManualProfile
          ? "Curated + derived FI profile"
          : "Derived FI profile",
      productSlug: product?.slug || "",
      confidence:
        profile?.hasManualProfile
          ? "medium-high"
          : "medium",
    },
  ];

  return {
    evidence,
    evidenceLevel: "interpretive",
    provenance: [
      "catalog-live",
      "playnice-fi-profile",
    ],
    confidence:
      profile?.hasManualProfile
        ? "medium-high"
        : "medium",
  };
};

export const attachEvidence = (
  result,
  envelope
) => ({
  ...result,
  evidence:
    envelope?.evidence || [],
  evidenceLevel:
    envelope?.evidenceLevel || "unknown",
  provenance:
    envelope?.provenance || [],
  evidenceConfidence:
    envelope?.confidence ||
    result?.confidence ||
    "low",
});
