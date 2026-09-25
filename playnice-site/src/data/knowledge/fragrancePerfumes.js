/*
 * PLAYNICE FI KNOWLEDGE — PERFUMES
 *
 * Source-backed perfume authorship and house relationships.
 * playNiceCatalogSlug is verified against the current PlayNice catalog slug
 * and should be checked at runtime before claiming availability.
 */

export const fragrancePerfumes = [
  {
    id: "ganymede",
    name: "Ganymede",
    aliases: ["ganymede", "ganymede marc antoine barrois"],
    entityType: "fragrance",
    houseId: "marc-antoine-barrois",
    perfumerIds: ["quentin-bisch"],
    playNiceCatalogSlug: null,
    summary: {
      sr: "Ganymede je parfem kuće Marc-Antoine Barrois koji potpisuje Quentin Bisch. Kuća ga opisuje kao savremenu, mineralno-kožnu kompoziciju sa mandarinom, ljubičicom, osmantusom, šafranom i veoma prepoznatljivim zračenjem.",
      en: "Ganymede is a Marc-Antoine Barrois fragrance created by Quentin Bisch. The house presents it as a contemporary mineral-leather composition with mandarin, violet, osmanthus, saffron and a highly distinctive radiance.",
    },
    sources: [
      {
        label: "Marc-Antoine Barrois — Ganymede",
        url: "https://marcantoinebarrois.com/en/products/ganymede",
        type: "brand-official",
      },
    ],
  },
  {
    id: "terre-d-hermes-edt",
    name: "Terre d’Hermès Eau de Toilette",
    aliases: [
      "terre d hermes",
      "terre d hermes edt",
      "terre d’hermès",
      "terre d’hermès edt",
    ],
    entityType: "fragrance",
    houseId: "hermes",
    perfumerIds: ["jean-claude-ellena"],
    playNiceCatalogSlug: null,
    summary: {
      sr: "Terre d’Hermès Eau de Toilette je 2006. kreirao Jean-Claude Ellena. Hermès ga opisuje kao mineralno-drvenast parfem koji spaja kedar, grejpfrut i efekat kremena.",
      en: "Terre d’Hermès Eau de Toilette was created in 2006 by Jean-Claude Ellena. Hermès describes it as a mineral-woody fragrance combining cedar, grapefruit and a flint accord.",
    },
    sources: [
      {
        label: "Hermès — Terre d’Hermès Eau de Toilette",
        url: "https://www.hermes.com/us/en/product/terre-d-hermes-eau-de-toilette-V107188V0/",
        type: "brand-official",
      },
    ],
  },
  {
    id: "le-male",
    name: "Le Male",
    aliases: [
      "le male",
      "jean paul gaultier le male",
      "jpg le male",
    ],
    entityType: "fragrance",
    houseId: "jean-paul-gaultier",
    perfumerIds: ["francis-kurkdjian"],
    playNiceCatalogSlug: null,
    summary: {
      sr: "Originalni Jean Paul Gaultier Le Male kreirao je Francis Kurkdjian sa 25 godina, prema njegovoj zvaničnoj biografiji na Dioru.",
      en: "The original Jean Paul Gaultier Le Male was created by Francis Kurkdjian at age 25, according to his official Dior biography.",
    },
    sources: [
      {
        label: "Dior — Francis Kurkdjian biography / Le Male",
        url: "https://www.dior.com/en_us/beauty/fragrance/dlp-franciskurkdjian.html",
        type: "industry-official",
      },
    ],
  },
  {
    id: "portrait-of-a-lady",
    name: "Portrait of a Lady",
    aliases: [
      "portrait of a lady",
      "frederic malle portrait of a lady",
    ],
    entityType: "fragrance",
    houseId: "frederic-malle",
    perfumerIds: ["dominique-ropion"],
    playNiceCatalogSlug: null,
    summary: {
      sr: "Portrait of a Lady je Frédéric Malle kompozicija Dominiquea Ropiona, poznata po bogatom ružičasto-pačuli karakteru i snažnoj strukturi.",
      en: "Portrait of a Lady is a Frédéric Malle composition by Dominique Ropion, known for its rich rose-patchouli character and powerful structure.",
    },
    sources: [
      {
        label: "Frédéric Malle — Dominique Ropion",
        url: "https://www.fredericmalle.com/perfumer/dominique-ropion",
        type: "brand-official",
      },
    ],
  },
  {
    id: "carnal-flower",
    name: "Carnal Flower",
    aliases: [
      "carnal flower",
      "frederic malle carnal flower",
    ],
    entityType: "fragrance",
    houseId: "frederic-malle",
    perfumerIds: ["dominique-ropion"],
    playNiceCatalogSlug: null,
    summary: {
      sr: "Carnal Flower je Frédéric Malle kompozicija Dominiquea Ropiona, izgrađena kao intenzivna i vrlo prirodna interpretacija tuberoze.",
      en: "Carnal Flower is a Frédéric Malle composition by Dominique Ropion, built as an intense and highly naturalistic interpretation of tuberose.",
    },
    sources: [
      {
        label: "Frédéric Malle — Dominique Ropion",
        url: "https://www.fredericmalle.com/perfumer/dominique-ropion",
        type: "brand-official",
      },
    ],
  },
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
