export const buildAnnouncementItems = ({
  announcementItems = [],
  lang,
  hasNewShopProducts,
  hasNewJournalArticle,
  latestJournalArticle,
  latestJournalTitle,
  foreverAloeUrl,
  cartLength,
  subtotal,
  freeShippingThreshold,
  amountLeftForFreeShipping,
  tr,
  formatPrice,
}) => {
  const editorialAnnouncementItems = announcementItems
    .filter((item) => item.enabled)
    .sort(
      (a, b) =>
        Number(a.priority || 0) - Number(b.priority || 0)
    )
    .map((item) => ({
      ...item,
      text:
        item.text?.[lang] ||
        item.text?.en ||
        item.text?.sr ||
        "",
    }))
    .filter((item) => item.text);

  const shopNewAnnouncementItem = hasNewShopProducts
    ? {
        id: "new-shop-products-announcement",
        text:
          lang === "sr"
            ? "Novi parfemi su stigli u PlayNice"
            : "New fragrances just arrived at PlayNice",
        icon: "→",
        tone: "new-shop",
        action: "openShop",
      }
    : null;

  const journalAnnouncementItem =
    hasNewJournalArticle &&
    latestJournalArticle &&
    latestJournalTitle
      ? {
          id: "latest-journal-announcement",
          text:
            lang === "sr"
              ? `Novo u rubrici Le Journal: ${latestJournalTitle}`
              : `New in Le Journal: ${latestJournalTitle}`,
          icon: "→",
          tone: "journal",
          action: "openLatestJournalArticle",
        }
      : null;

  const foreverAnnouncementItem = {
    id: "forever-announcement-logo",
    type: "logoLink",
    text: "Forever Living Products",
    icon: "★",
    tone: "forever",
    href: foreverAloeUrl,
    logoSrc: "/partners/forever-logo-wide.png",
    logoAlt: "Forever Living Products",
    partner: "forever_living",
    sellerId: "360000920762",
    campaign: "aloe_drinks",
  };

  const withPriorityAnnouncements = (items) => [
    ...editorialAnnouncementItems,
    ...(shopNewAnnouncementItem
      ? [shopNewAnnouncementItem]
      : []),
    ...(journalAnnouncementItem
      ? [journalAnnouncementItem]
      : []),
    foreverAnnouncementItem,
    ...items,
  ];

  if (cartLength === 0) {
    return withPriorityAnnouncements([
      { text: tr.announcementDynamicEmpty1, icon: "🚚" },
      { text: tr.announcementDynamicEmpty2, icon: "✓" },
      { text: tr.announcementDynamicEmpty3, icon: "🔥" },
      { text: tr.announcementDynamicEmpty4, icon: "🔥" },
      { text: tr.announcementDynamicEmpty5, icon: "🚚" },
      { text: tr.announcementDynamicEmpty6, icon: "★" },
    ]);
  }

  if (subtotal >= freeShippingThreshold) {
    return withPriorityAnnouncements([
      {
        text: tr.announcementDynamicUnlocked,
        icon: "✓",
        tone: "success",
      },
      { text: tr.announcementDynamicEmpty3, icon: "🔥" },
      { text: tr.announcementDynamicEmpty4, icon: "🔥" },
      { text: tr.announcementDynamicEmpty5, icon: "🚚" },
      { text: tr.announcementDynamicEmpty6, icon: "★" },
    ]);
  }

  return withPriorityAnnouncements([
    {
      text: tr.announcementDynamicLocked.replace(
        "{{amount}}",
        formatPrice(amountLeftForFreeShipping)
      ),
      icon: "🚚",
      tone: "warning",
    },
    { text: tr.announcementDynamicEmpty2, icon: "✓" },
    { text: tr.announcementDynamicEmpty3, icon: "🔥" },
    { text: tr.announcementDynamicEmpty4, icon: "🔥" },
    { text: tr.announcementDynamicEmpty6, icon: "★" },
  ]);
};
