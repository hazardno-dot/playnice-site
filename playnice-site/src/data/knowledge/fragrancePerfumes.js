/*
 * PLAYNICE FI KNOWLEDGE — PERFUMES
 *
 * Source-backed perfume authorship and house relationships.
 * playNiceCatalogSlug is verified against the current PlayNice catalog slug
 * and should be checked at runtime before claiming availability.
 */

export const fragrancePerfumes = [
  {
    id: "louis-vuitton-imagination",
    name: "Imagination",
    aliases: ["imagination", "louis vuitton imagination", "lv imagination"],
    entityType: "fragrance",
    houseId: "louis-vuitton",
    perfumerIds: ["jacques-cavallier-belletrud"],
    playNiceCatalogSlug: null,
    summary: {
      sr: "Imagination je Louis Vuitton kompozicija Jacquesa Cavalliera Belletruda, građena oko kontrasta amberskog efekta i crnog čaja, uz citruse, začine i izražen Ambrox karakter.",
      en: "Imagination is a Louis Vuitton composition by Jacques Cavallier Belletrud, built around the contrast of an amber effect and black tea, with citrus, spices and a pronounced Ambrox character.",
    },
    sources: [
      {
        label: "Louis Vuitton — Imagination",
        url: "https://eu.louisvuitton.com/eng-e1/stories/imagination",
        type: "brand-official",
      },
    ],
  },
  {
    id: "hermes-h24-edt",
    name: "H24 Eau de Toilette",
    aliases: ["h24", "h24 edt", "hermes h24", "hermès h24"],
    entityType: "fragrance",
    houseId: "hermes",
    perfumerIds: ["christine-nagel"],
    playNiceCatalogSlug: null,
    summary: {
      sr: "H24 Eau de Toilette je Hermès kompozicija Christine Nagel. Kuća je opisuje kao aromatično-botanički miris sa žalfijom, narcisom, rosewoodom i toplim metalnim efektom sclarenea.",
      en: "H24 Eau de Toilette is an Hermès composition by Christine Nagel. The house describes it as an aromatic-botanical fragrance with clary sage, narcissus, rosewood and the warm metallic effect of sclarene.",
    },
    sources: [
      {
        label: "Hermès — H24 Eau de Toilette",
        url: "https://www.hermes.com/us/en/product/h24-eau-de-toilette-V101563V0/",
        type: "brand-official",
      },
    ],
  },
  {
    id: "hermes-h24-edp",
    name: "H24 Eau de Parfum",
    aliases: ["h24 edp", "h24 eau de parfum", "hermes h24 edp"],
    entityType: "fragrance",
    houseId: "hermes",
    perfumerIds: ["christine-nagel"],
    playNiceCatalogSlug: null,
    summary: {
      sr: "H24 Eau de Parfum je Hermès kompozicija Christine Nagel, drvenasto-aromatična interpretacija sa žalfijom, moss efektom i toplim sclarene karakterom.",
      en: "H24 Eau de Parfum is an Hermès composition by Christine Nagel, a woody-aromatic interpretation centered on sage, a moss effect and warm sclarene facets.",
    },
    sources: [
      {
        label: "Hermès — H24 Eau de Parfum",
        url: "https://www.hermes.com/us/en/product/h24-eau-de-parfum-V108422V0/",
        type: "brand-official",
      },
    ],
  },
  {
    id: "gentle-fluidity-gold",
    name: "Gentle Fluidity Gold",
    aliases: ["gentle fluidity gold", "mfk gentle fluidity gold"],
    entityType: "fragrance",
    houseId: "maison-francis-kurkdjian",
    perfumerIds: ["francis-kurkdjian"],
    playNiceCatalogSlug: null,
    summary: {
      sr: "Gentle Fluidity Gold je Maison Francis Kurkdjian Eau de Parfum iz Gentle Fluidity dua. Koristi isti osnovni set sastojaka kao Silver izdanje, ali ih raspoređuje ka mekšem mošusno-amberskom profilu sa vanilom.",
      en: "Gentle Fluidity Gold is a Maison Francis Kurkdjian Eau de Parfum from the Gentle Fluidity duo. It uses the same core ingredient set as the Silver edition but shapes them into a softer musky-amber profile with vanilla.",
    },
    sources: [
      {
        label: "Maison Francis Kurkdjian — Gentle Fluidity Gold",
        url: "https://www.franciskurkdjian.com/eu-en/p/gentle-fluidity-gold-edition---eau-de-parfum-RA122821.html",
        type: "brand-official",
      },
    ],
  },
  {
    id: "gentle-fluidity-silver",
    name: "Gentle Fluidity Silver",
    aliases: ["gentle fluidity silver", "mfk gentle fluidity silver"],
    entityType: "fragrance",
    houseId: "maison-francis-kurkdjian",
    perfumerIds: ["francis-kurkdjian"],
    playNiceCatalogSlug: null,
    summary: {
      sr: "Gentle Fluidity Silver je Maison Francis Kurkdjian Eau de Parfum iz istog dua kao Gold. Kuća ga klasifikuje kao woody aromatic, sa naglašenijim svežim, začinskim i aromatičnim licem zajedničkog seta sastojaka.",
      en: "Gentle Fluidity Silver is a Maison Francis Kurkdjian Eau de Parfum from the same duo as Gold. The house classifies it as woody aromatic, emphasizing the fresher, spicier and more aromatic side of the shared ingredient set.",
    },
    sources: [
      {
        label: "Maison Francis Kurkdjian — Gentle Fluidity Collection",
        url: "https://www.franciskurkdjian.com/us-en/gentle-fluidity-collection/landing-GentleFluidity.html",
        type: "brand-official",
      },
    ],
  },
  {
    id: "libre-edp",
    name: "Libre Eau de Parfum",
    aliases: [
      "libre",
      "libre edp",
      "ysl libre",
      "yves saint laurent libre",
    ],
    entityType: "fragrance",
    houseId: "yves-saint-laurent",
    perfumerIds: ["anne-flipo", "carlos-benaim"],
    playNiceCatalogSlug: null,
    summary: {
      sr: "Libre Eau de Parfum je YSL kompozicija koju su osmislili Master Perfumeri Anne Flipo i Carlos Benaïm. YSL ističe napetost između lavande i orange blossom akorda kao centralni potpis mirisa.",
      en: "Libre Eau de Parfum is a YSL composition conceived by Master Perfumers Anne Flipo and Carlos Benaïm. YSL highlights the tension between lavender and orange blossom as the fragrance's central signature.",
    },
    sources: [
      {
        label: "YSL Beauty — Libre / Diva Lavender Heart",
        url: "https://www.yslbeauty.com/int/diva-lavender-heart/ingredients-lavender.html",
        type: "brand-official",
      },
    ],
  },
  {
    id: "la-vie-est-belle-edp",
    name: "La Vie Est Belle Eau de Parfum",
    aliases: [
      "la vie est belle",
      "la vie est belle edp",
      "lancome la vie est belle",
    ],
    entityType: "fragrance",
    houseId: "lancome",
    perfumerIds: ["anne-flipo", "dominique-ropion"],
    playNiceCatalogSlug: null,
    summary: {
      sr: "La Vie Est Belle Eau de Parfum je Lancôme floralno-gourmand kompozicija koju aktuelna zvanična stranica proizvoda pripisuje Anne Flipo i Dominiqueu Ropionu, sa irisom, pačulijem, vanilom i spun-sugar efektom.",
      en: "La Vie Est Belle Eau de Parfum is a Lancôme floral-gourmand composition currently credited on the official product page to Anne Flipo and Dominique Ropion, with iris, patchouli, vanilla and a spun-sugar effect.",
    },
    sources: [
      {
        label: "Lancôme — La Vie Est Belle Eau de Parfum",
        url: "https://www.lancome-usa.com/fragrance/la-vie-est-belle-eau-de-parfum/3614273749381.html",
        type: "brand-official",
      },
    ],
  },
  {
    id: "ysl-jumpsuit",
    name: "Jumpsuit Eau de Parfum",
    aliases: [
      "jumpsuit",
      "ysl jumpsuit",
      "jumpsuit eau de parfum",
    ],
    entityType: "fragrance",
    houseId: "yves-saint-laurent",
    perfumerIds: ["carlos-benaim"],
    playNiceCatalogSlug: null,
    summary: {
      sr: "Jumpsuit Eau de Parfum iz YSL Le Vestiaire des Parfums kolekcije potpisuje Carlos Benaïm. YSL ga opisuje kao kompoziciju fokusiranu na magnoliju i bergamot.",
      en: "Jumpsuit Eau de Parfum from YSL's Le Vestiaire des Parfums collection is created by Carlos Benaïm. YSL describes it as a composition centered on magnolia and bergamot.",
    },
    sources: [
      {
        label: "YSL Beauty — Jumpsuit Eau de Parfum",
        url: "https://www.yslbeauty.com/int/fragrance/unisex-fragrances/jumpsuit-eau-de-parfum/3614274184952.html",
        type: "brand-official",
      },
    ],
  },
  {
    id: "chanel-paris-riviera",
    name: "PARIS-RIVIERA",
    aliases: ["paris riviera", "chanel paris riviera"],
    entityType: "fragrance",
    houseId: "chanel",
    perfumerIds: ["olivier-polge"],
    playNiceCatalogSlug: null,
    summary: {
      sr: "PARIS-RIVIERA je CHANEL kompozicija Oliviera Polgea, svetao floralni miris inspirisan Azurnom obalom, sa sicilijanskom narandžom, nerolijem, sandalovinom i mošusom.",
      en: "PARIS-RIVIERA is a CHANEL composition by Olivier Polge, a luminous floral fragrance inspired by the French Riviera with Sicilian orange, neroli, sandalwood and musk.",
    },
    sources: [
      {
        label: "CHANEL — PARIS-RIVIERA",
        url: "https://www.chanel.com/us/fragrance/les-eaux-de-chanel/paris-riviera/",
        type: "brand-official",
      },
    ],
  },
  {
    id: "chanel-paris-paris",
    name: "PARIS-PARIS",
    aliases: ["paris paris", "chanel paris paris"],
    entityType: "fragrance",
    houseId: "chanel",
    perfumerIds: ["olivier-polge"],
    playNiceCatalogSlug: null,
    summary: {
      sr: "PARIS-PARIS je CHANEL kompozicija Oliviera Polgea sa citrusima, damask ružom, pink pepperom i pačulijem, zamišljena kao mirisni portret Pariza.",
      en: "PARIS-PARIS is a CHANEL composition by Olivier Polge with citrus, Damask rose, pink pepper and patchouli, conceived as an olfactory portrait of Paris.",
    },
    sources: [
      {
        label: "CHANEL — PARIS-PARIS",
        url: "https://www.chanel.com/ae-en/fragrance/les-eaux-de-chanel/paris-paris/",
        type: "brand-official",
      },
    ],
  },
  {
    id: "baccarat-rouge-540-edp",
    name: "Baccarat Rouge 540 Eau de Parfum",
    aliases: [
      "baccarat rouge 540",
      "br540",
      "baccarat 540",
      "baccarat rouge 540 edp",
    ],
    entityType: "fragrance",
    houseId: "maison-francis-kurkdjian",
    perfumerIds: ["francis-kurkdjian"],
    playNiceCatalogSlug: null,
    summary: {
      sr: "Baccarat Rouge 540 Eau de Parfum je kreacija Francisa Kurkdjiana za Maison Francis Kurkdjian, nastala iz saradnje kuće sa Baccaratom. Kuća je opisuje kao drvenasto-ambrasto-cvetnu kompoziciju zasnovanu na kontrastu jasmina, šafrana, ambergris efekta i suvih drvenih tonova.",
      en: "Baccarat Rouge 540 Eau de Parfum is a creation by Francis Kurkdjian for Maison Francis Kurkdjian, born from the house's collaboration with Baccarat. The house describes it as a woody-amber-floral composition built around jasmine, saffron, an ambergris effect and dry woods.",
    },
    sources: [
      {
        label: "Maison Francis Kurkdjian — Baccarat Rouge 540",
        url: "https://www.franciskurkdjian.com/us-en/landing_page_baccarat-rouge-540.html",
        type: "brand-official",
      },
    ],
  },
  {
    id: "twilly-d-hermes-edp",
    name: "Twilly d’Hermès Eau de Parfum",
    aliases: [
      "twilly d hermes",
      "twilly d’hermès",
      "twilly d hermes edp",
      "twilly hermes",
    ],
    entityType: "fragrance",
    houseId: "hermes",
    perfumerIds: ["christine-nagel"],
    playNiceCatalogSlug: null,
    summary: {
      sr: "Twilly d’Hermès Eau de Parfum kreirala je Christine Nagel 2017. Hermès ga opisuje kao floralno-začinski parfem sa đumbirom, tuberozom i sandalovinom.",
      en: "Twilly d’Hermès Eau de Parfum was created by Christine Nagel in 2017. Hermès describes it as a floral-spicy fragrance built around ginger, tuberose and sandalwood.",
    },
    sources: [
      {
        label: "Hermès — Twilly d’Hermès Eau de Parfum",
        url: "https://www.hermes.com/us/en/product/twilly-d-hermes-eau-de-parfum-V107264V0/",
        type: "brand-official",
      },
    ],
  },
  {
    id: "tutti-twilly-d-hermes-edp",
    name: "Tutti Twilly d’Hermès Eau de Parfum",
    aliases: [
      "tutti twilly",
      "tutti twilly d hermes",
      "tutti twilly d’hermès",
    ],
    entityType: "fragrance",
    houseId: "hermes",
    perfumerIds: ["christine-nagel"],
    playNiceCatalogSlug: null,
    summary: {
      sr: "Tutti Twilly d’Hermès Eau de Parfum kreirala je Christine Nagel za Hermès. Kompozicija je floralno-voćna, sa đumbirovim cvetom, ličijem i mošusom.",
      en: "Tutti Twilly d’Hermès Eau de Parfum was created by Christine Nagel for Hermès. It is a floral-fruity composition built around ginger blossom, lychee and musk.",
    },
    sources: [
      {
        label: "Hermès — Tutti Twilly d’Hermès",
        url: "https://www.hermes.com/us/en/product/tutti-twilly-d-hermes-eau-de-parfum-V110826V0/",
        type: "brand-official",
      },
    ],
  },
  {
    id: "un-jardin-sur-la-lagune",
    name: "Un Jardin sur la Lagune",
    aliases: [
      "un jardin sur la lagune",
      "jardin sur la lagune",
    ],
    entityType: "fragrance",
    houseId: "hermes",
    perfumerIds: ["christine-nagel"],
    playNiceCatalogSlug: null,
    summary: {
      sr: "Un Jardin sur la Lagune je Hermès kompozicija Christine Nagel iz 2019. Hermès ga opisuje kao floralno-drvenast miris inspirisan skrivenim vrtom u Veneciji, sa magnolijom, pittosporumom i Madonna ljiljanom.",
      en: "Un Jardin sur la Lagune is a 2019 Hermès composition by Christine Nagel. Hermès describes it as a floral-woody fragrance inspired by a hidden garden in Venice, with magnolia, pittosporum and Madonna lily.",
    },
    sources: [
      {
        label: "Hermès — Un Jardin sur la Lagune",
        url: "https://www.hermes.com/ca/en/product/compose-your-own-set-of-4-travel-sizes-V4NOMADEGIFT/",
        type: "brand-official",
      },
    ],
  },
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
