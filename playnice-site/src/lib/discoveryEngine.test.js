// PLAYNICE FRAGRANCE INTELLIGENCE — extended automated QA benchmark
// Save as: src/lib/discoveryEngine.test.js
// package.json:
//   "build": "npm test && react-scripts build"
//   "test": "react-scripts test --watchAll=false"

import { products } from "../data/products";
import { productCopy } from "../data/products/productCopy";
import { productWearContext } from "../data/products/productWearContext";
import { discoveryProfiles } from "../data/products/discoveryProfiles";
import {
  buildProductProfile,
  discoverFragrances,
  parseQuery,
} from "./discoveryEngine";

const run = (query, lang = "en") =>
  discoverFragrances({
    query,
    products,
    productCopy,
    productWearContext,
    discoveryProfiles,
    lang,
    limit: 5,
  });

const profileOf = (product) =>
  buildProductProfile(
    product,
    productCopy,
    productWearContext,
    discoveryProfiles
  );

const expectRelevantWithResults = (query, lang = "en") => {
  const output = run(query, lang);
  expect(output.isRelevant).toBe(true);
  expect(output.results.length).toBeGreaterThan(0);
  return output;
};

const expectRejected = (query, lang = "en") => {
  const output = run(query, lang);
  expect(output.isRelevant).toBe(false);
  expect(output.results).toEqual([]);
  expect(output.feedback.length).toBeGreaterThan(0);
};

describe("Fragrance Intelligence — intent guard", () => {
  test.each([
    "Trava raste",
    "Srbijaaaa",
    "office chair do 100 €",
    "summer vacation in Greece",
    "weather tomorrow",
    "football tonight",
    "laptop do 900 €",
    "recept za palačinke",
    "restaurant near me",
    "phone under €500",
    "winter tyres do 200 €",
    "gift card for a hotel",
  ])("rejects unrelated input: %s", (query) => {
    expectRejected(query);
  });

  test.each([
    "Nešto diskretno za posao",
    "Office do 10 €",
    "Fresh for summer under €15",
    "Slatko ali ne previše",
    "Ne volim vanilu, hoću nešto za dejt",
    "Arabian, čist i moderan, do 15 €",
    "Something like Bleu de Chanel",
    "Nešto kao Naxos, ali svežije",
    "Muški parfem za leto",
    "Unisex miris za posao",
    "Poklon za nju do 20 €",
    "Niche elegant evening scent",
    "Designer fresh office fragrance",
    "Jak zimski parfem",
  ])("accepts fragrance intent: %s", (query) => {
    expectRelevantWithResults(query);
  });

  test("short query gets guidance instead of random results", () => {
    const output = run("ok");
    expect(output.isRelevant).toBe(false);
    expect(output.results).toEqual([]);
    expect(output.feedback.length).toBeGreaterThan(0);
  });

  test("explicit fragrance wording is enough for an otherwise broad brief", () => {
    expectRelevantWithResults("Treba mi parfem");
  });

  test("fragrance + travel context remains relevant", () => {
    expectRelevantWithResults("Perfume for a summer vacation in Greece");
  });
});

describe("Fragrance Intelligence — budget invariants", () => {
  test.each([
    ["Office do 10 €", 10],
    ["Fresh for summer under €15", 15],
    ["Arabian, clean and modern, under €15", 15],
    ["Poklon za nju do 20 €", 20],
    ["Designer perfume under €12", 12],
  ])("never breaks budget: %s", (query, budget) => {
    const output = expectRelevantWithResults(query);
    output.results.forEach((item) => {
      expect(item.selectedSize.price).toBeLessThanOrEqual(budget);
    });
  });

  test("budget-only fragrance query remains relevant even if nothing is affordable", () => {
    const output = run("Parfem do 1 €");
    expect(output.isRelevant).toBe(true);
    expect(output.results).toEqual([]);
  });

  test("selected decant is the largest affordable size", () => {
    const output = expectRelevantWithResults("Fresh perfume under €15");
    output.results.forEach((item) => {
      const affordable = Object.entries(item.product.sizes || {})
        .map(([size, price]) => ({
          size,
          price: Number(price),
          ml: Number.parseFloat(size) || 0,
        }))
        .filter((entry) => Number.isFinite(entry.price) && entry.price <= 15)
        .sort((a, b) => b.ml - a.ml || b.price - a.price);

      expect(affordable.length).toBeGreaterThan(0);
      expect(item.selectedSize.size).toBe(affordable[0].size);
      expect(item.selectedSize.price).toBe(affordable[0].price);
    });
  });
});

describe("Fragrance Intelligence — exclusions and moderation", () => {
  test("hard vanilla exclusion is respected", () => {
    const output = expectRelevantWithResults("Ne volim vanilu, hoću nešto za dejt");
    const vanillaKeys = [
      "vanilla",
      "bourbon-vanilla",
      "madagascar-vanilla",
      "vanilla-absolute",
      "vanilla-orchid",
      "vanilla-flower",
    ];

    output.results.forEach((item) => {
      expect(
        (item.profile?.notes || []).some((note) => vanillaKeys.includes(note))
      ).toBe(false);
    });
  });

  test("multiple hard note exclusions are respected together", () => {
    const output = expectRelevantWithResults(
      "Parfem za dejt bez vanile i kokosa"
    );
    const excluded = new Set([
      "vanilla",
      "bourbon-vanilla",
      "madagascar-vanilla",
      "vanilla-absolute",
      "vanilla-orchid",
      "vanilla-flower",
      "coconut",
      "coconut-wood",
    ]);

    output.results.forEach((item) => {
      expect(
        (item.profile?.notes || []).some((note) => excluded.has(note))
      ).toBe(false);
    });
  });

  test("not-too-sweet targets a moderate sweetness band", () => {
    const output = expectRelevantWithResults("Date night, sweet but not too sweet");
    const top3 = output.results.slice(0, 3);
    top3.forEach((item) => {
      const sweetness = item.profile.sweet ?? item.profile.sweetness ?? 0;
      expect(sweetness).toBeGreaterThanOrEqual(3.3);
      expect(sweetness).toBeLessThanOrEqual(7.0);
    });
  });

  test("not-too-citrusy does not return a citrus-dominated top 3", () => {
    const output = expectRelevantWithResults(
      "Fresh for summer under €15, but not too citrusy"
    );
    output.results.slice(0, 3).forEach((item) => {
      expect(item.profile.citrus ?? 0).toBeLessThanOrEqual(8);
    });
  });
});

describe("Fragrance Intelligence — reference matching", () => {
  test("reference anchor never recommends itself", () => {
    const output = expectRelevantWithResults("Something like Bleu de Chanel");
    expect(output.intent.referenceProduct).toBeTruthy();
    expect(
      output.results.some(
        (item) => item.product.id === output.intent.referenceProduct.id
      )
    ).toBe(false);
  });

  test("Naxos fresher modifier is parsed", () => {
    const intent = parseQuery("Nešto kao Naxos, ali svežije", products);
    expect(intent.referenceProduct).toBeTruthy();
    expect(intent.referenceModifiers).toContain("fresher");
  });

  test.each([
    ["Something like Naxos, but less sweet", "less-sweet"],
    ["Something like Naxos, but lighter", "lighter"],
    ["Something like Naxos, but stronger", "stronger"],
    ["Something like Naxos, but more elegant", "more-elegant"],
  ])("parses reference modifier: %s", (query, modifier) => {
    const intent = parseQuery(query, products);
    expect(intent.referenceProduct).toBeTruthy();
    expect(intent.referenceModifiers).toContain(modifier);
  });

  test("fresher reference results are actually fresher than the anchor", () => {
    const output = expectRelevantWithResults("Nešto kao Naxos, ali svežije");
    const anchorProfile = profileOf(output.intent.referenceProduct);

    output.results.forEach((item) => {
      expect(item.profile.freshness).toBeGreaterThan(
        anchorProfile.freshness + 0.7
      );
    });
  });

  test("less-sweet reference top result moves in the requested direction", () => {
    const output = expectRelevantWithResults(
      "Something like Naxos, but less sweet"
    );
    const anchorProfile = profileOf(output.intent.referenceProduct);
    const top = output.results[0];

    expect(top.profile.sweet ?? top.profile.sweetness ?? 0).toBeLessThan(
      anchorProfile.sweet ?? anchorProfile.sweetness ?? 0
    );
  });

  test("lighter reference top result moves in the requested direction", () => {
    const output = expectRelevantWithResults("Something like Naxos, but lighter");
    const anchorProfile = profileOf(output.intent.referenceProduct);
    const top = output.results[0];

    expect(top.profile.projection ?? top.profile.intensity ?? 0).toBeLessThan(
      anchorProfile.projection ?? anchorProfile.intensity ?? 0
    );
  });

  test("stronger reference top result moves in the requested direction", () => {
    const output = expectRelevantWithResults("Something like Naxos, but stronger");
    const anchorProfile = profileOf(output.intent.referenceProduct);
    const top = output.results[0];

    expect(top.profile.projection ?? top.profile.intensity ?? 0).toBeGreaterThan(
      anchorProfile.projection ?? anchorProfile.intensity ?? 0
    );
  });

  test("more-elegant reference top result moves in the requested direction", () => {
    const output = expectRelevantWithResults(
      "Something like Naxos, but more elegant"
    );
    const anchorProfile = profileOf(output.intent.referenceProduct);
    const top = output.results[0];

    expect(top.profile.elegance).toBeGreaterThan(anchorProfile.elegance);
  });
});

describe("Fragrance Intelligence — category, season and context", () => {
  test("summer brief strongly prefers summer/all", () => {
    const output = expectRelevantWithResults(
      "Fresh for summer under €15, but not too citrusy"
    );
    const compatible = output.results.filter((item) =>
      ["summer", "all"].includes(item.product.season)
    );
    expect(compatible.length).toBeGreaterThanOrEqual(4);
  });

  test("winter brief strongly prefers winter/all", () => {
    const output = expectRelevantWithResults("Strong and rich for winter");
    const compatible = output.results.filter((item) =>
      ["winter", "all"].includes(item.product.season)
    );
    expect(compatible.length).toBeGreaterThanOrEqual(4);
  });

  test("Arabian category dominates an explicit Arabian brief", () => {
    const output = expectRelevantWithResults(
      "Arabian, clean and modern, under €15"
    );
    expect(
      output.results.slice(0, 3).filter((item) => item.product.category === "Arabian")
        .length
    ).toBeGreaterThanOrEqual(2);
  });

  test("Niche category dominates an explicit niche brief", () => {
    const output = expectRelevantWithResults("Niche elegant evening scent");
    expect(
      output.results.slice(0, 3).filter((item) => item.product.category === "Niche")
        .length
    ).toBeGreaterThanOrEqual(2);
  });

  test("Designer category dominates an explicit designer brief", () => {
    const output = expectRelevantWithResults("Designer fresh office fragrance");
    expect(
      output.results
        .slice(0, 3)
        .filter((item) => item.product.category === "Designer").length
    ).toBeGreaterThanOrEqual(2);
  });

  test("office top 3 are office-capable", () => {
    const output = expectRelevantWithResults("Clean and elegant for work");
    output.results.slice(0, 3).forEach((item) => {
      expect(item.profile.office).toBeGreaterThanOrEqual(7);
    });
  });

  test("date-night top results are date-capable", () => {
    const output = expectRelevantWithResults("Date night, not too sweet");
    output.results.slice(0, 3).forEach((item) => {
      expect(item.profile.date ?? 0).toBeGreaterThanOrEqual(5.5);
    });
  });

  test("strong rich winter brief returns reasonably projecting scents", () => {
    const output = expectRelevantWithResults("Jako i bogato za zimu");
    output.results.slice(0, 3).forEach((item) => {
      expect(item.profile.projection ?? item.profile.intensity ?? 0).toBeGreaterThanOrEqual(6);
    });
  });
});

describe("Fragrance Intelligence — language parity", () => {
  test.each([
    [
      "Sveže za leto do 15 €, ali ne previše citrusno",
      "Fresh for summer under €15, but not too citrusy",
    ],
    [
      "Čisto i elegantno za posao",
      "Clean and elegant for work",
    ],
    [
      "Ne volim vanilu, hoću nešto za dejt",
      "I don't like vanilla, I want something for a date",
    ],
  ])("SR and EN equivalent briefs substantially overlap", (srQuery, enQuery) => {
    const sr = expectRelevantWithResults(srQuery, "sr");
    const en = expectRelevantWithResults(enQuery, "en");

    const srSlugs = new Set(sr.results.map((item) => item.product.slug));
    const overlap = en.results.filter((item) => srSlugs.has(item.product.slug));

    expect(overlap.length).toBeGreaterThanOrEqual(2);
  });
});

describe("Fragrance Intelligence — result quality invariants", () => {
  test("reasons are not five identical generic sentences", () => {
    const output = expectRelevantWithResults("Clean and elegant for work");
    expect(new Set(output.results.map((item) => item.reason)).size).toBeGreaterThanOrEqual(3);
  });

  test.each([
    "Date night, not too sweet",
    "Fresh for summer under €15",
    "Strong and rich for winter",
    "Arabian, clean and modern, under €15",
  ])("five returned products are unique: %s", (query) => {
    const output = expectRelevantWithResults(query);
    expect(output.results).toHaveLength(5);
    expect(new Set(output.results.map((item) => item.product.slug)).size).toBe(5);
  });

  test("match scores stay inside the public UI range", () => {
    const output = expectRelevantWithResults("Clean and elegant for work");
    output.results.forEach((item) => {
      expect(item.match).toBeGreaterThanOrEqual(58);
      expect(item.match).toBeLessThanOrEqual(96);
    });
  });

  test("results are ordered by descending engine score", () => {
    const output = expectRelevantWithResults("Clean and elegant for work");
    for (let i = 1; i < output.results.length; i += 1) {
      expect(output.results[i - 1].score).toBeGreaterThanOrEqual(
        output.results[i].score
      );
    }
  });

  test("every result has a selected decant and a human reason", () => {
    const output = expectRelevantWithResults("Fresh for summer under €15");
    output.results.forEach((item) => {
      expect(item.selectedSize).toBeTruthy();
      expect(item.reason).toEqual(expect.any(String));
      expect(item.reason.length).toBeGreaterThan(10);
    });
  });
});

describe("Fragrance Intelligence — gender direction", () => {
  test("masculine brief should prefer masculine-leaning profiles", () => {
    const output = expectRelevantWithResults("Muški parfem za leto");
    output.results.slice(0, 3).forEach((item) => {
      expect(item.profile.masculine ?? 5).toBeGreaterThanOrEqual(
        item.profile.feminine ?? 5
      );
    });
  });

  test("feminine brief should prefer feminine-leaning profiles", () => {
    const output = expectRelevantWithResults("Ženski parfem za veče");
    output.results.slice(0, 3).forEach((item) => {
      expect(item.profile.feminine ?? 5).toBeGreaterThanOrEqual(
        item.profile.masculine ?? 5
      );
    });
  });

  test("unisex brief should avoid strongly one-sided profiles", () => {
    const output = expectRelevantWithResults("Unisex miris za svaki dan");
    output.results.slice(0, 3).forEach((item) => {
      const masculine = item.profile.masculine ?? 5;
      const feminine = item.profile.feminine ?? 5;
      expect(Math.abs(masculine - feminine)).toBeLessThanOrEqual(4);
    });
  });
});

describe("Fragrance Intelligence — catalog coverage", () => {
  test("every product has an explicit discovery profile", () => {
    const missing = products
      .filter((product) => !discoveryProfiles[product.slug])
      .map((product) => product.slug);

    expect(missing).toEqual([]);
  });

  test("catalog slugs are unique", () => {
    const slugs = products.map((product) => product.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  test("every product has at least one valid decant price", () => {
    const invalid = products
      .filter((product) => {
        const prices = Object.values(product.sizes || {}).map(Number);
        return !prices.some((price) => Number.isFinite(price) && price > 0);
      })
      .map((product) => product.slug);

    expect(invalid).toEqual([]);
  });
});