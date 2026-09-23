import { products } from "./index";
import { getProductType } from "./productType";

describe("getProductType", () => {
  test.each([
    ["BOSS The Scent Elixir Parfum Intense for Him", "Parfum Intense"],
    ["BOSS The Scent Le Parfum for Him", "Le Parfum"],
    ["Yves Saint Laurent Y Iced Cologne Eau de Toilette Intense", "Eau de Toilette Intense"],
    ["Dolce&Gabbana Light Blue Pour Homme Eau de Toilette (2025)", "Eau de Toilette"],
    ["Carolina Herrera Bad Boy Cobalt Eau de Parfum Électrique", "Eau de Parfum Électrique"],
    ["Narciso Rodriguez for Him Bleu Noir Eau de Toilette Extreme", "Eau de Toilette Extreme"],
    ["Paris Corner North Stag Expressions II Deux Extrait de Parfum", "Extrait de Parfum"],
    ["Gisada Luxury Collection Royal Parfum", "Parfum"],
  ])("extracts %s as %s", (name, expected) => {
    expect(getProductType(name)).toBe(expected);
  });

  test("every catalog product resolves a PDP type label", () => {
    const missing = products
      .filter((product) => !getProductType(product.name))
      .map((product) => product.slug);

    expect(missing).toEqual([]);
  });
});
