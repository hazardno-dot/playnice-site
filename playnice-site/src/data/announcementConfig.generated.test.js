import { ANNOUNCEMENT_ITEMS } from "./announcementConfig.generated";

describe("announcementConfig.generated", () => {
  test("keeps editorial announcement items structurally valid", () => {
    expect(Array.isArray(ANNOUNCEMENT_ITEMS)).toBe(true);

    const ids = new Set();

    ANNOUNCEMENT_ITEMS.forEach((item) => {
      expect(item.id).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      expect(ids.has(item.id)).toBe(false);
      ids.add(item.id);

      expect(typeof item.enabled).toBe("boolean");
      expect(Number.isFinite(Number(item.priority))).toBe(true);
      expect(item.text?.sr?.trim()).toBeTruthy();
      expect(item.text?.en?.trim()).toBeTruthy();
      expect(typeof item.icon).toBe("string");
      expect(typeof item.tone).toBe("string");
      expect(typeof item.action).toBe("string");

      if (item.action === "openProduct") {
        expect(item.slug?.trim()).toBeTruthy();
      }
    });
  });

  test("requires both SR and EN copy for enabled editorial announcements", () => {
    ANNOUNCEMENT_ITEMS.filter((item) => item.enabled).forEach((item) => {
      expect(item.id).toBeTruthy();
      expect(item.text?.sr?.trim()).toBeTruthy();
      expect(item.text?.en?.trim()).toBeTruthy();
    });
  });
});
