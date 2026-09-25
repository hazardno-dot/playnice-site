import { perfumers } from "./perfumers";
import { fragranceHouses } from "./fragranceHouses";
import { fragrancePerfumes } from "./fragrancePerfumes";
import { fragranceTerms } from "./fragranceTerms";

const normalize = (value = "") =>
  String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "dj")
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const expectUniqueField = (items, field, label) => {
  const values = items.map((item) => item?.[field]).filter(Boolean);
  expect(new Set(values).size).toBe(values.length);
  values.forEach((value) => {
    expect(String(value).trim()).toBeTruthy();
  });
};

const expectSources = (items, sourceField, label) => {
  items.forEach((item) => {
    const sources = item?.[sourceField] || [];
    expect(Array.isArray(sources)).toBe(true);
    expect(sources.length).toBeGreaterThan(0);
    sources.forEach((source) => {
      expect(source?.label).toBeTruthy();
      expect(source?.url).toMatch(/^https?:\/\//);
      expect(source?.type).toBeTruthy();
    });
  });
};

describe("FI Ultra knowledge data contract", () => {
  test("all entity IDs are unique within their collections", () => {
    expectUniqueField(perfumers, "id", "perfumers");
    expectUniqueField(fragranceHouses, "id", "houses");
    expectUniqueField(fragrancePerfumes, "id", "perfumes");
    expectUniqueField(fragranceTerms, "id", "terms");
  });

  test("perfumers keep source-backed records", () => {
    perfumers.forEach((perfumer) => {
      expect(perfumer.name).toBeTruthy();
      expect(Array.isArray(perfumer.aliases)).toBe(true);
      expect(perfumer.aliases.length).toBeGreaterThan(0);
      expect(perfumer.summary?.sr || perfumer.summary?.en).toBeTruthy();
    });
    expectSources(perfumers, "sources", "perfumers");
  });

  test("houses keep source-backed records", () => {
    fragranceHouses.forEach((house) => {
      expect(house.name).toBeTruthy();
      expect(Array.isArray(house.aliases)).toBe(true);
      expect(house.aliases.length).toBeGreaterThan(0);
      expect(house.summary?.sr || house.summary?.en).toBeTruthy();
    });
    expectSources(fragranceHouses, "sourceLinks", "houses");
  });

  test("terms keep source-backed records", () => {
    fragranceTerms.forEach((term) => {
      expect(term.name).toBeTruthy();
      expect(Array.isArray(term.aliases)).toBe(true);
      expect(term.aliases.length).toBeGreaterThan(0);
      expect(term.answer?.sr || term.answer?.en).toBeTruthy();
    });
    expectSources(fragranceTerms, "sources", "terms");
  });

  test("perfume relationships point to known houses and perfumers", () => {
    const houseIds = new Set(fragranceHouses.map((house) => house.id));
    const perfumerIds = new Set(perfumers.map((perfumer) => perfumer.id));

    fragrancePerfumes.forEach((fragrance) => {
      expect(fragrance.name).toBeTruthy();
      expect(houseIds.has(fragrance.houseId)).toBe(true);
      expect(Array.isArray(fragrance.perfumerIds)).toBe(true);
      expect(fragrance.perfumerIds.length).toBeGreaterThan(0);
      fragrance.perfumerIds.forEach((id) => {
        expect(perfumerIds.has(id)).toBe(true);
      });
    });
  });

  test("house perfumer relationships point to known perfumers", () => {
    const perfumerIds = new Set(perfumers.map((perfumer) => perfumer.id));

    fragranceHouses.forEach((house) => {
      (house.perfumerIds || []).forEach((id) => {
        expect(perfumerIds.has(id)).toBe(true);
      });
    });
  });

  test("normalized aliases do not collide across perfume entities", () => {
    const seen = new Map();

    fragrancePerfumes.forEach((fragrance) => {
      (fragrance.aliases || []).forEach((alias) => {
        const key = normalize(alias);
        expect(key).toBeTruthy();

        const previous = seen.get(key);
        if (previous) {
          expect(previous).toBe(fragrance.id);
        } else {
          seen.set(key, fragrance.id);
        }
      });
    });
  });

  test("normalized aliases do not collide across fragrance terms", () => {
    const seen = new Map();

    fragranceTerms.forEach((term) => {
      (term.aliases || []).forEach((alias) => {
        const key = normalize(alias);
        expect(key).toBeTruthy();

        const previous = seen.get(key);
        if (previous) {
          expect(previous).toBe(term.id);
        } else {
          seen.set(key, term.id);
        }
      });
    });
  });

  test("PlayNice catalog mappings are unique when present", () => {
    const slugs = fragrancePerfumes
      .map((fragrance) => fragrance.playNiceCatalogSlug)
      .filter(Boolean);

    expect(new Set(slugs).size).toBe(slugs.length);
  });
});
