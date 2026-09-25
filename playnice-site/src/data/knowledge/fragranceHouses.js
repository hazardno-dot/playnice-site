/*
 * PLAYNICE FI KNOWLEDGE — HOUSES & BRANDS
 *
 * Curated fragrance-house knowledge. Keep house facts source-backed and
 * separate from recommendation scoring.
 */

export const fragranceHouses = [
  {
    id: "essential-parfums",
    name: "Essential Parfums",
    aliases: ["essential parfums", "essential perfumes"],
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
    aliases: ["maison francis kurkdjian", "mfk"],
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
    aliases: ["frederic malle", "frédéric malle", "editions de parfums frederic malle"],
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
    aliases: ["dior", "parfums christian dior", "christian dior"],
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
    aliases: ["givaudan"],
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
    aliases: ["dsm firmenich", "dsm-firmenich", "firmenich"],
    entityType: "fragrance-company",
    summary: {
      sr: "dsm-firmenich je globalna kompanija za parfimeriju, beauty i sastojke. Alberto Morillas i Nathalie Lorson su među njenim istaknutim Master Perfumerima.",
      en: "dsm-firmenich is a global perfumery, beauty and ingredients company. Alberto Morillas and Nathalie Lorson are among its prominent Master Perfumers.",
    },
    perfumerIds: ["alberto-morillas", "nathalie-lorson"],
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
