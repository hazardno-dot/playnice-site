import { ANNOUNCEMENT_ITEMS } from "./announcementConfig.generated";

describe("announcementConfig.generated", () => {
  test("preserves the current Thomas Kosmala editorial announcement contract", () => {
    expect(ANNOUNCEMENT_ITEMS).toEqual([
      {
        id: "thomas-kosmala-no4-announcement",
        enabled: true,
        text: {
          sr: "✦ NOVO: Thomas Kosmala No. 4 Après l'Amour 10ml + Mystery Designer Sample • Limited Stock",
          en: "✦ NEW: Thomas Kosmala No. 4 Après l'Amour 10ml + Mystery Designer Sample • Limited Stock",
        },
        icon: "→",
        tone: "new-shop",
        action: "openProduct",
        slug: "thomas-kosmala-no-4-apres-lamour",
        priority: 10,
      },
    ]);
  });

  test("requires both SR and EN copy for enabled editorial announcements", () => {
    ANNOUNCEMENT_ITEMS.filter((item) => item.enabled).forEach((item) => {
      expect(item.id).toBeTruthy();
      expect(item.text?.sr?.trim()).toBeTruthy();
      expect(item.text?.en?.trim()).toBeTruthy();
    });
  });
});
