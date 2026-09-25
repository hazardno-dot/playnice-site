import { exhibitionItems } from "./exhibition";

describe("Exhibition asset contract", () => {
  test("all Exhibition assets use immutable Exhibition paths", () => {
    const assets = exhibitionItems.flatMap((item) => item.assets || []);
    expect(assets.length).toBeGreaterThan(0);

    for (const asset of assets) {
      expect(asset.src).toMatch(/^\/exhibition\//);
      expect(asset.src).not.toMatch(/^\/hero\//);
    }
  });

  test("retired Jasmine in the Sun Hero uses its archived canonical asset", () => {
    const item = exhibitionItems.find((entry) => entry.id === "hero-6");
    expect(item?.title).toBe("JASMINE IN THE SUN · Now at PlayNice");
    expect(item?.assets?.[0]?.src).toBe("/exhibition/2026/hero/jasmine-in-the-sun.jpg");
  });
});
