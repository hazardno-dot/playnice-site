import {
  products,
} from "./index";
import {
  productCopy,
} from "./productCopy";
import {
  productWearContext,
} from "./productWearContext";
import {
  assertProductCatalogContract,
  validateProduct,
  validateProductCatalog,
  validateProductCopy,
  validateProductWearContext,
} from "./productContract";

describe("Product Data Contract v2", () => {
  test("the real catalog satisfies the contract", () => {
    expect(() =>
      assertProductCatalogContract({
        products,
        productCopy,
        productWearContext,
      })
    ).not.toThrow();
  });

  test("rejects duplicate catalog identity fields", () => {
    const base = {
      id: 1,
      slug: "one",
      name: "One",
      shortName: "One",
      category: "Niche",
      image: "/products/one.png",
      sizes: { "5ml": 10 },
      badge: "PICK",
      rating: 8,
      ratingLabel: "Good",
      season: "all",
      moods: ["clean"],
      recommendations: ["one"],
      noteMap: {
        top: ["bergamot"],
        heart: ["iris"],
        base: ["musk"],
      },
    };

    const copy = {
      miniTag: {
        sr: "Tag",
        en: "Tag",
      },
      card: {
        sr: "Card",
        en: "Card",
      },
      modal: {
        sr: "Modal",
        en: "Modal",
      },
      scentType: {
        sr: "Tip",
        en: "Type",
      },
      dominantNotes: {
        sr: ["bergamot"],
        en: ["bergamot"],
      },
      tags: {
        sr: ["Svež"],
        en: ["Fresh"],
      },
      whyChoose: {
        sr: "Zašto",
        en: "Why",
      },
    };

    const errors =
      validateProductCatalog({
        products: [
          base,
          { ...base },
        ],
        productCopy: {
          One: copy,
        },
        productWearContext: {
          One: {
            sr: "Svaki dan.",
            en: "Every day.",
          },
        },
      });

    expect(errors).toEqual(
      expect.arrayContaining([
        expect.stringContaining(
          "id must be unique"
        ),
        expect.stringContaining(
          "slug must be unique"
        ),
        expect.stringContaining(
          "name must be unique"
        ),
      ])
    );
  });

  test("rejects malformed product core fields", () => {
    const errors = validateProduct({
      id: 0,
      slug: "",
      name: "",
      shortName: "",
      category: "Unknown",
      image: "",
      sizes: {
        "five": 0,
      },
      badge: "",
      rating: 0,
      ratingLabel: "",
      season: "spring",
      moods: [],
      recommendations: [],
      noteMap: {
        top: [],
        heart: [],
        base: [],
      },
    });

    expect(errors.length).toBeGreaterThan(
      10
    );
  });

  test("requires complete bilingual product copy", () => {
    const product = {
      slug: "test",
      name: "Test",
    };

    expect(
      validateProductCopy(product, {
        miniTag: {
          sr: "Tag",
        },
      })
    ).toEqual(
      expect.arrayContaining([
        expect.stringContaining(
          "miniTag.en"
        ),
        expect.stringContaining(
          "card.sr"
        ),
      ])
    );
  });

  test("requires bilingual wear context", () => {
    expect(
      validateProductWearContext(
        {
          slug: "test",
          name: "Test",
        },
        {
          sr: "Svaki dan.",
        }
      )
    ).toEqual([
      expect.stringContaining(
        "productWearContext.en"
      ),
    ]);
  });
});
