const PRODUCT_TYPE_PATTERNS = [
  ["Eau de Parfum Électrique", /\bEau de Parfum Électrique\b/i],
  ["Eau de Toilette Intense", /\bEau de Toilette Intense\b/i],
  ["Eau de Toilette Extreme", /\bEau de Toilette Extreme\b/i],
  ["Parfum Intense", /\bParfum Intense\b/i],
  ["Parfum Cologne", /\bParfum Cologne\b/i],
  ["Le Parfum", /\bLe Parfum\b/i],
  ["Extrait de Parfum", /\bExtrait de Parfum\b/i],
  ["Eau de Parfum", /\bEau de Parfum\b/i],
  ["Eau de Toilette", /\bEau de Toilette\b/i],
  ["Eau de Cologne", /\bEau de Cologne\b/i],
  ["Parfum", /\bParfum\b/i],
  ["Cologne", /\bCologne\b/i],
];

export const getProductType = (name = "") => {
  const value = String(name);

  for (const [label, pattern] of PRODUCT_TYPE_PATTERNS) {
    if (pattern.test(value)) return label;
  }

  return "";
};
