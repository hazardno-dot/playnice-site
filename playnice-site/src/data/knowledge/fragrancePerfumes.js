/*
 * PLAYNICE FI KNOWLEDGE — PERFUMES
 *
 * Source-backed perfume authorship and house relationships.
 * playNiceCatalogSlug is verified against the current PlayNice catalog slug
 * and should be checked at runtime before claiming availability.
 */

export const fragrancePerfumes = [
  {
    id: "bois-imperial",
    name: "Bois Impérial",
    aliases: [
      "bois imperial",
      "bois impérial",
      "bois imperial essential parfums",
    ],
    entityType: "fragrance",
    houseId: "essential-parfums",
    perfumerIds: ["quentin-bisch"],
    playNiceCatalogSlug: "bois-imperial-essential-parfums",
    summary: {
      sr: "Bois Impérial je Essential Parfums kompozicija Quentina Bischa, izgrađena oko začinsko-drvenastog karaktera Akigalawooda, tajlandskog bosiljka, Timut bibera, vetivera i pačulija.",
      en: "Bois Impérial is an Essential Parfums composition by Quentin Bisch, built around the spicy-woody character of Akigalawood with Thai basil, Timut pepper, vetiver and patchouli.",
    },
    sources: [
      {
        label: "Essential Parfums — Bois Impérial",
        url: "https://www.essentialparfums.com/en/collections/bois-imperial",
        type: "brand-official",
      },
    ],
  },
  {
    id: "nice-bergamote",
    name: "Nice Bergamote",
    aliases: [
      "nice bergamote",
      "nice bergamot",
      "nice bergamote essential parfums",
    ],
    entityType: "fragrance",
    houseId: "essential-parfums",
    perfumerIds: ["antoine-maisondieu"],
    playNiceCatalogSlug: "essential-parfums-nice-bergamote",
    summary: {
      sr: "Nice Bergamote je Essential Parfums kompozicija Antoinea Maisondieua, zamišljena kao svetao omaž kalabrijskom bergamotu uz ružu, jasmin, drvene note i tonku.",
      en: "Nice Bergamote is an Essential Parfums composition by Antoine Maisondieu, conceived as a bright tribute to Calabrian bergamot with rose, jasmine, woods and tonka bean.",
    },
    sources: [
      {
        label: "Essential Parfums — Nice Bergamote",
        url: "https://www.essentialparfums.com/en/collections/nice-bergamote",
        type: "brand-official",
      },
    ],
  },
  {
    id: "orange-x-santal",
    name: "Orange X Santal",
    aliases: [
      "orange x santal",
      "orange and santal",
      "orange x sandal",
      "orange x santal essential parfums",
    ],
    entityType: "fragrance",
    houseId: "essential-parfums",
    perfumerIds: ["natalie-gracia-cetto"],
    playNiceCatalogSlug: "essential-parfums-orange-x-santal",
    summary: {
      sr: "Orange X Santal je Essential Parfums kompozicija Natalie Gracia-Cetto, građena na kontrastu gorke italijanske narandže i mekog, kremastog australijskog sandalovog drveta.",
      en: "Orange X Santal is an Essential Parfums composition by Natalie Gracia-Cetto, built around the contrast between Italian bitter orange and soft, creamy Australian sandalwood.",
    },
    sources: [
      {
        label: "Essential Parfums — Orange X Santal",
        url: "https://www.essentialparfums.com/en/collections/orange-x-santal",
        type: "brand-official",
      },
    ],
  },
];

export default fragrancePerfumes;
