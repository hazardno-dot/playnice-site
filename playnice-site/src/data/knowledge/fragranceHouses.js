/*
 * PLAYNICE FI KNOWLEDGE — HOUSES & BRANDS
 *
 * Curated fragrance-house knowledge. Keep house facts source-backed and
 * separate from recommendation scoring.
 */

export const fragranceHouses = [
  {
    id: "chanel",
    name: "CHANEL",
    aliases: ["chanel", "šanel", "chanel parfums"],
    entityType: "fragrance-house",
    summary: {
      sr: "CHANEL je francuska luksuzna kuća sa dugom autorskom tradicijom u parfimeriji. Olivier Polge je njen savremeni In-House Perfumer Creator.",
      en: "CHANEL is a French luxury house with a long authorial tradition in perfumery. Olivier Polge is its contemporary In-House Perfumer Creator.",
    },
    perfumerIds: ["olivier-polge"],
    sourceLinks: [
      {
        label: "CHANEL — Parfumeur",
        url: "https://www.chanel.com/ba/fragrance/chanel-parfumeur/i-am-a-nose/",
        type: "brand-official",
      },
    ],
  },
  {
    id: "yves-saint-laurent",
    name: "Yves Saint Laurent",
    aliases: [
      "yves saint laurent",
      "ysl",
      "ysl beauty",
      "saint laurent",
    ],
    entityType: "fragrance-house",
    summary: {
      sr: "Yves Saint Laurent Beauty je beauty i parfemski ogranak kuće Yves Saint Laurent. U savremenom portfoliju sarađuje sa vodećim parfimerima kao što su Anne Flipo i Carlos Benaïm.",
      en: "Yves Saint Laurent Beauty is the beauty and fragrance arm of Yves Saint Laurent. Its contemporary portfolio includes work by leading perfumers such as Anne Flipo and Carlos Benaïm.",
    },
    perfumerIds: ["anne-flipo", "carlos-benaim"],
    sourceLinks: [
      {
        label: "YSL Beauty — Diva Lavender Heart / Libre",
        url: "https://www.yslbeauty.com/int/diva-lavender-heart/ingredients-lavender.html",
        type: "brand-official",
      },
    ],
  },
  {
    id: "lancome",
    name: "Lancôme",
    aliases: ["lancome", "lancôme"],
    entityType: "fragrance-house",
    summary: {
      sr: "Lancôme je francuska beauty kuća sa velikim parfemskim portfoliom. Među parfimerima koji su potpisali njena najpoznatija izdanja su Anne Flipo i Dominique Ropion.",
      en: "Lancôme is a French beauty house with a major fragrance portfolio. Perfumers behind some of its best-known creations include Anne Flipo and Dominique Ropion.",
    },
    perfumerIds: ["anne-flipo", "dominique-ropion"],
    sourceLinks: [
      {
        label: "Lancôme — Meet Our Perfumers",
        url: "https://www.lancome-usa.com/our-perfumers.html",
        type: "brand-official",
      },
    ],
  },
  {
    id: "marc-antoine-barrois",
    name: "Marc-Antoine Barrois",
    aliases: [
      "marc antoine barrois",
      "marc-antoine barrois",
      "mab",
    ],
    entityType: "fragrance-house",
    summary: {
      sr: "Marc-Antoine Barrois je francuska kuća koja je izgradila prepoznatljiv parfemski univerzum u saradnji sa parfimerom Quentinom Bischem. Ganymede je jedan od najpoznatijih rezultata te saradnje.",
      en: "Marc-Antoine Barrois is a French house that built a distinctive fragrance universe in collaboration with perfumer Quentin Bisch. Ganymede is one of the best-known results of that partnership.",
    },
    perfumerIds: ["quentin-bisch"],
    sourceLinks: [
      {
        label: "Marc-Antoine Barrois — Ganymede / Quentin Bisch",
        url: "https://marcantoinebarrois.com/en/products/ganymede",
        type: "brand-official",
      },
    ],
  },
  {
    id: "hermes",
    name: "Hermès",
    aliases: ["hermes", "hermès", "hermes parfums"],
    entityType: "fragrance-house",
    summary: {
      sr: "Hermès je francuska luksuzna kuća sa snažnom autorskom parfemskom tradicijom. Jean-Claude Ellena je 2004. postao njen prvi kućni parfimer, a Christine Nagel je kasnije preuzela vodeću kreativnu ulogu.",
      en: "Hermès is a French luxury house with a strong authorial fragrance tradition. Jean-Claude Ellena became its first in-house perfumer in 2004, and Christine Nagel later took over the leading creative role.",
    },
    perfumerIds: ["jean-claude-ellena", "christine-nagel"],
    sourceLinks: [
      {
        label: "Hermès — Jean-Claude Ellena",
        url: "https://www.hermes.com/us/en/content/106191-jean-claude-ellena/",
        type: "brand-official",
      },
      {
        label: "Hermès — Christine Nagel",
        url: "https://www.hermes.com/us/en/content/106192-christine-nagel/",
        type: "brand-official",
      },
    ],
  },
  {
    id: "jean-paul-gaultier",
    name: "Jean Paul Gaultier",
    aliases: ["jean paul gaultier", "jpg", "gaultier"],
    entityType: "fragrance-house",
    summary: {
      sr: "Jean Paul Gaultier je francuska modna kuća sa velikim parfemskim portfoliom. Francis Kurkdjian je kao vrlo mlad parfimer kreirao originalni Le Male, koji je postao jedno od najpoznatijih izdanja kuće.",
      en: "Jean Paul Gaultier is a French fashion house with a major fragrance portfolio. Francis Kurkdjian created the original Le Male early in his career, which became one of the house's best-known releases.",
    },
    perfumerIds: ["francis-kurkdjian"],
    sourceLinks: [
      {
        label: "Dior — Francis Kurkdjian biography / Le Male",
        url: "https://www.dior.com/en_us/beauty/fragrance/dlp-franciskurkdjian.html",
        type: "industry-official",
      },
    ],
  },
  {
    id: "iff",
    name: "IFF",
    aliases: [
      "iff",
      "iff-u",
      "iffu",
      "international flavors fragrances",
      "international flavors and fragrances",
    ],
    entityType: "fragrance-company",
    summary: {
      sr: "IFF (International Flavors & Fragrances) je globalna kompanija za mirise i sastojke. Među njenim Master Perfumerima u ovoj bazi su Anne Flipo, Carlos Benaïm i Dominique Ropion.",
      en: "IFF (International Flavors & Fragrances) is a global fragrance and ingredients company. Master Perfumers represented in this knowledge base include Anne Flipo, Carlos Benaïm and Dominique Ropion.",
    },
    perfumerIds: [
      "anne-flipo",
      "carlos-benaim",
      "dominique-ropion",
    ],
    sourceLinks: [
      {
        label: "IFF — Fine Fragrances",
        url: "https://www.iff.com/scent/fine-fragrances/",
        type: "employer-official",
      },
    ],
  },
  {
    id: "essential-parfums",
    name: "Essential Parfums",
    aliases: [
      "essential parfums",
      "essential perfumes",
      "essential parfumsu",
      "essential parfums-u",
    ],
    entityType: "fragrance-house",
    summary: {
      sr: "Essential Parfums je francuska parfemska kuća osnovana 2018. sa idejom da fokus vrati na parfemere i kvalitet sirovina. Kuća javno ističe autore svake kompozicije i sarađuje sa poznatim parfimerima poput Quentina Bischa, Nathalie Lorson i drugih.",
      en: "Essential Parfums is a French fragrance house founded in 2018 with the idea of putting perfumers and quality materials back at the center. The house prominently credits the perfumer behind each composition and works with notable creators such as Quentin Bisch and Nathalie Lorson.",
    },
    perfumerIds: ["quentin-bisch", "nathalie-lorson"],
    sourceLinks: [
      {
        label: "Essential Parfums — About",
        url: "https://www.essentialparfums.com/pages/about-us",
        type: "brand-official",
      },
    ],
  },
  {
    id: "maison-francis-kurkdjian",
    name: "Maison Francis Kurkdjian",
    aliases: [
      "maison francis kurkdjian",
      "maison francis kurkdjianu",
      "mfk",
      "mfk-u",
      "mfku",
    ],
    entityType: "fragrance-house",
    summary: {
      sr: "Maison Francis Kurkdjian je parfemska kuća koju su 2009. osnovali Francis Kurkdjian i Marc Chaya. Kuća je izgrađena oko Kurkdjianovog autorskog pristupa parfimeriji i danas je deo LVMH grupe.",
      en: "Maison Francis Kurkdjian is a fragrance house founded in 2009 by Francis Kurkdjian and Marc Chaya. The house is built around Kurkdjian's authorial approach to perfumery and is now part of the LVMH group.",
    },
    perfumerIds: ["francis-kurkdjian"],
    sourceLinks: [
      {
        label: "Maison Francis Kurkdjian — The House",
        url: "https://www.franciskurkdjian.com/int-en/maison-francis-kurkdjian.html",
        type: "brand-official",
      },
    ],
  },
  {
    id: "frederic-malle",
    name: "Éditions de Parfums Frédéric Malle",
    aliases: [
      "frederic malle",
      "frédéric malle",
      "frederic malleu",
      "editions de parfums frederic malle",
    ],
    entityType: "fragrance-house",
    summary: {
      sr: "Éditions de Parfums Frédéric Malle je kuća pokrenuta 2000. sa uredničkim pristupom: parfimerima daje autorski prostor i jasno ih potpisuje uz svaku kompoziciju. Dominique Ropion je jedan od najvažnijih saradnika kuće.",
      en: "Éditions de Parfums Frédéric Malle launched in 2000 with an editorial approach: perfumers are given authorship and are prominently credited with each composition. Dominique Ropion is one of the house's major collaborators.",
    },
    perfumerIds: ["dominique-ropion"],
    sourceLinks: [
      {
        label: "Frédéric Malle — About",
        url: "https://www.fredericmalle.com/about-us",
        type: "brand-official",
      },
    ],
  },
  {
    id: "dior",
    name: "Dior",
    aliases: [
      "dior",
      "dioru",
      "parfums christian dior",
      "christian dior",
    ],
    entityType: "fragrance-house",
    summary: {
      sr: "Parfums Christian Dior je parfemski ogranak kuće Dior. Francis Kurkdjian je 2021. imenovan za Perfume Creation Director i vodi savremeni kreativni pravac parfema kuće.",
      en: "Parfums Christian Dior is Dior's fragrance division. Francis Kurkdjian was appointed Perfume Creation Director in 2021 and leads the house's contemporary fragrance creation.",
    },
    perfumerIds: ["francis-kurkdjian"],
    sourceLinks: [
      {
        label: "Dior — Francis Kurkdjian",
        url: "https://www.dior.com/en_gb/beauty/fragrance/dlp-franciskurkdjian.html",
        type: "brand-official",
      },
    ],
  },
  {
    id: "givaudan",
    name: "Givaudan",
    aliases: [
      "givaudan",
      "givaudanu",
    ],
    entityType: "fragrance-company",
    summary: {
      sr: "Givaudan je jedna od najvećih svetskih kompanija za mirise i ukuse i zapošljava veliki broj vodećih parfumera. Quentin Bisch radi u Givaudanu kao parfimer.",
      en: "Givaudan is one of the world's largest fragrance and flavor companies and employs many leading perfumers. Quentin Bisch works at Givaudan as a perfumer.",
    },
    perfumerIds: ["quentin-bisch"],
    sourceLinks: [
      {
        label: "Givaudan — Perfumers",
        url: "https://www.givaudan.com/fragrance-beauty/perfumery-school/perfumers",
        type: "employer-official",
      },
    ],
  },
  {
    id: "dsm-firmenich",
    name: "dsm-firmenich",
    aliases: [
      "dsm firmenich",
      "dsm-firmenich",
      "dsm firmenichu",
      "dsm-firmenichu",
      "firmenich",
      "firmenichu",
    ],
    entityType: "fragrance-company",
    summary: {
      sr: "dsm-firmenich je globalna kompanija za parfimeriju, beauty i sastojke. Alberto Morillas i Nathalie Lorson su među njenim istaknutim Master Perfumerima.",
      en: "dsm-firmenich is a global perfumery, beauty and ingredients company. Alberto Morillas and Nathalie Lorson are among its prominent Master Perfumers.",
    },
    perfumerIds: [
      "alberto-morillas",
      "nathalie-lorson",
      "olivier-cresp",
      "hamid-merati-kashani",
    ],
    sourceLinks: [
      {
        label: "dsm-firmenich — Fine Fragrance People",
        url: "https://www.dsm-firmenich.com/en/businesses/perfumery-beauty/perfumery/fine-fragrance/people.html",
        type: "employer-official",
      },
    ],
  },
];

export default fragranceHouses;
