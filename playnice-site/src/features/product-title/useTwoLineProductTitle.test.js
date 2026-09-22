import { getProductTitleCandidates } from "./useTwoLineProductTitle";

describe("getProductTitleCandidates", () => {
  test("prefers the full product name, then an explicit modal name", () => {
    expect(
      getProductTitleCandidates({
        name: "My Geisha Unseen Extrait de Parfum",
        modalName: "My Geisha Unseen Extrait",
        shortName: "Unseen",
      })
    ).toEqual([
      "My Geisha Unseen Extrait de Parfum",
      "My Geisha Unseen Extrait",
      "Unseen",
    ]);
  });

  test("builds a compact concentration fallback when modalName is absent", () => {
    expect(
      getProductTitleCandidates({
        name: "Essential Parfums Orange X Santal Eau de Parfum",
        shortName: "Orange X Santal",
      })
    ).toEqual([
      "Essential Parfums Orange X Santal Eau de Parfum",
      "Essential Parfums Orange X Santal EDP",
      "Orange X Santal",
    ]);
  });

  test("deduplicates equivalent title candidates", () => {
    expect(
      getProductTitleCandidates({
        name: "Nishane Hacivat X Extrait de Parfum",
        modalName: "Nishane Hacivat X Extrait de Parfum",
        shortName: "Hacivat X",
      })
    ).toEqual([
      "Nishane Hacivat X Extrait de Parfum",
      "Nishane Hacivat X Extrait",
      "Hacivat X",
    ]);
  });
});
