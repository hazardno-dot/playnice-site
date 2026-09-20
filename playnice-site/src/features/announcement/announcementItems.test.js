import { buildAnnouncementItems } from "./announcementItems";

const tr = {
  announcementDynamicEmpty1: "empty1",
  announcementDynamicEmpty2: "empty2",
  announcementDynamicEmpty3: "empty3",
  announcementDynamicEmpty4: "empty4",
  announcementDynamicEmpty5: "empty5",
  announcementDynamicEmpty6: "empty6",
  announcementDynamicUnlocked: "unlocked",
  announcementDynamicLocked: "Spend {{amount}} more",
};

const formatPrice = (value) => `€${Number(value).toFixed(2)}`;

const baseArgs = {
  announcementItems: [],
  lang: "en",
  hasNewShopProducts: false,
  hasNewJournalArticle: false,
  latestJournalArticle: null,
  latestJournalTitle: "",
  foreverAloeUrl: "https://example.com",
  cartLength: 0,
  subtotal: 0,
  freeShippingThreshold: 39,
  amountLeftForFreeShipping: 39,
  tr,
  formatPrice,
};

describe("buildAnnouncementItems", () => {
  test("builds empty-cart announcements with Forever item", () => {
    const result = buildAnnouncementItems(baseArgs);

    expect(
      result.find((item) => item.id === "forever-announcement-logo")
    ).toMatchObject({
      href: "https://example.com",
      partner: "forever_living",
    });

    expect(result.map((item) => item.text)).toContain("empty1");
  });

  test("prepends enabled editorial items by priority and localizes text", () => {
    const result = buildAnnouncementItems({
      ...baseArgs,
      announcementItems: [
        {
          id: "later",
          enabled: true,
          priority: 20,
          text: { en: "Later", sr: "Kasnije" },
        },
        {
          id: "first",
          enabled: true,
          priority: 10,
          text: { en: "First", sr: "Prvo" },
        },
        {
          id: "disabled",
          enabled: false,
          priority: 1,
          text: { en: "Nope" },
        },
      ],
    });

    expect(result[0].id).toBe("first");
    expect(result[1].id).toBe("later");
    expect(result.some((item) => item.id === "disabled")).toBe(false);
  });

  test("adds shop and journal priority announcements when unread content exists", () => {
    const result = buildAnnouncementItems({
      ...baseArgs,
      hasNewShopProducts: true,
      hasNewJournalArticle: true,
      latestJournalArticle: { id: 20 },
      latestJournalTitle: "Nova priča",
      lang: "sr",
    });

    expect(
      result.find((item) => item.id === "new-shop-products-announcement")
    ).toMatchObject({ action: "openShop" });

    expect(
      result.find((item) => item.id === "latest-journal-announcement")
    ).toMatchObject({
      action: "openLatestJournalArticle",
      text: "Novo u rubrici Le Journal: Nova priča",
    });
  });

  test("uses unlocked message once free shipping threshold is reached", () => {
    const result = buildAnnouncementItems({
      ...baseArgs,
      cartLength: 1,
      subtotal: 39,
    });

    expect(result.some((item) => item.text === "unlocked")).toBe(true);
  });

  test("injects formatted remaining amount below threshold", () => {
    const result = buildAnnouncementItems({
      ...baseArgs,
      cartLength: 1,
      subtotal: 20,
      amountLeftForFreeShipping: 19,
    });

    expect(
      result.find((item) => item.tone === "warning")?.text
    ).toBe("Spend €19.00 more");
  });
});
