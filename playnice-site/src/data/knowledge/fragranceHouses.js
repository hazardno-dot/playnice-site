/*
 * PLAYNICE FI KNOWLEDGE — HOUSES & BRANDS
 *
 * Curated fragrance-house knowledge. Keep house facts source-backed and
 * separate from recommendation scoring.
 */

export const fragranceHouses = [
  {
    id: "guerlain",
    name: "Guerlain",
    aliases: ["guerlain", "gerlen"],
    entityType: "fragrance-house",
    summary: {
      sr: "Guerlain je istorijska francuska parfemska kuća osnovana 1828. Njena višegeneracijska autorska tradicija obuhvata Pierre-François-Pascala Guerlaina, Aiméa Guerlaina i Jacquesa Guerlaina, od Eau de Cologne Impériale i Jickyja do Shalimara.",
      en: "Guerlain is a historic French perfume house founded in 1828. Its multigenerational authorial tradition includes Pierre-François-Pascal Guerlain, Aimé Guerlain and Jacques Guerlain, from Eau de Cologne Impériale and Jicky to Shalimar.",
    },
    perfumerIds: [
      "pierre-francois-pascal-guerlain",
      "aime-guerlain",
      "jacques-guerlain",
      "delphine-jelk",
    ],
    sourceLinks: [
      {
        label: "Guerlain — House history",
        url: "https://www.guerlain.com/uk/en-uk/c/history.html",
        type: "brand-official",
      },
      {
        label: "Guerlain — Art of Fragrance",
        url: "https://www.guerlain.com/us/en-us/c/art-of-fragrance.html",
        type: "brand-official",
      },
      {
        label: "Guerlain — Olfactory Symphonies / Delphine Jelk",
        url: "https://www.guerlain.com/us/en-us/c/olfactory-symphonies.html",
        type: "brand-official",
      },
    ],
  },
  {
    id: "louis-vuitton",
    name: "Louis Vuitton",
    aliases: ["louis vuitton", "lv parfums", "lv perfumes"],
    entityType: "fragrance-house",
    summary: {
      sr: "Louis Vuitton je francuska luksuzna kuća čiji savremeni parfemski univerzum vodi Master Perfumer Jacques Cavallier Belletrud. Kuća ga direktno potpisuje kao autora svojih savremenih mirisnih kolekcija.",
      en: "Louis Vuitton is a French luxury house whose contemporary fragrance universe is led by Master Perfumer Jacques Cavallier Belletrud. The house directly credits him as the author behind its modern fragrance collections.",
    },
    perfumerIds: ["jacques-cavallier-belletrud"],
    sourceLinks: [
      {
        label: "Louis Vuitton — Perfumes",
        url: "https://us.louisvuitton.com/eng-us/stories/lvperfumes",
        type: "brand-official",
      },
    ],
  },
  {
    id: "chanel",
    name: "CHANEL",
    aliases: ["chanel", "šanel", "chanel parfums"],
    entityType: "fragrance-house",
    summary: {
      sr: "CHANEL je francuska luksuzna kuća sa višegeneracijskom autorskom parfemskom tradicijom. Ernest Beaux, Henri Robert, Jacques Polge i Olivier Polge predstavljaju ključne etape te linije od N°5 i N°19 do Coco Mademoiselle, Bleu de CHANEL i savremenih kreacija kuće.",
      en: "CHANEL is a French luxury house with a multigenerational fragrance authorship tradition. Ernest Beaux, Henri Robert, Jacques Polge and Olivier Polge represent key stages in that lineage, from N°5 and N°19 to Coco Mademoiselle, Bleu de CHANEL and the house's contemporary creations.",
    },
    perfumerIds: ["ernest-beaux", "henri-robert", "jacques-polge", "olivier-polge"],
    sourceLinks: [
      {
        label: "CHANEL — 1970s / Henri Robert and Jacques Polge",
        url: "https://www.chanel.com/ba/about-chanel/the-house-of-chanel/1970/",
        type: "brand-official",
      },
      {
        label: "CHANEL — 2000s / Coco Mademoiselle",
        url: "https://www.chanel.com/ie/about-chanel/the-house-of-chanel/2000/",
        type: "brand-official",
      },
      {
        label: "CHANEL — 2010s / Bleu de CHANEL",
        url: "https://www.chanel.com/us/about-chanel/the-house-of-chanel/2010/",
        type: "brand-official",
      },
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
    perfumerIds: ["guy-robert", "jean-claude-ellena", "christine-nagel", "jean-louis-sieuzac"],
    sourceLinks: [
      {
        label: "Hermès — Calèche / Guy Robert",
        url: "https://www.hermes.com/us/en/product/caleche-eau-de-toilette-V107391V0/",
        type: "brand-official",
      },
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
      {
        label: "Hermès — Galop d’Hermès / Christine Nagel",
        url: "https://www.hermes.com/us/en/product/galop-d-hermes-parfum-V36824/",
        type: "brand-official",
      },
      {
        label: "Hermès — Kelly Calèche / Jean-Claude Ellena",
        url: "https://www.hermes.com/us/en/product/kelly-caleche-eau-de-toilette-V22217/",
        type: "brand-official",
      },
      {
        label: "Hermès — Bel Ami / Jean-Louis Sieuzac",
        url: "https://www.hermes.com/us/en/product/bel-ami-eau-de-toilette-V38274/",
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
    perfumerIds: [
      "quentin-bisch",
      "nathalie-lorson",
      "antoine-maisondieu",
      "natalie-gracia-cetto",
      "bruno-jovanovic",
      "olivier-pescheux",
      "calice-becker",
      "sophie-labbe",
      "fabrice-pellegrin",
      "dominique-ropion",
      "jordi-fernandez",
      "mathieu-nardin",
      "anne-flipo",
    ],
    sourceLinks: [
      {
        label: "Essential Parfums — About",
        url: "https://www.essentialparfums.com/pages/about-us",
        type: "brand-official",
      },
      {
        label: "Essential Parfums — Nice Bergamote / Antoine Maisondieu",
        url: "https://www.essentialparfums.com/en/collections/nice-bergamote",
        type: "brand-official",
      },
      {
        label: "Essential Parfums — Orange X Santal / Natalie Gracia-Cetto",
        url: "https://www.essentialparfums.com/en/collections/orange-x-santal",
        type: "brand-official",
      },
      {
        label: "Essential Parfums — Mon Vetiver / Bruno Jovanovic",
        url: "https://www.essentialparfums.com/en/collections/mon-vetiver",
        type: "brand-official",
      },
      {
        label: "Essential Parfums — Divine Vanille / Olivier Pescheux",
        url: "https://www.essentialparfums.com/en/collections/divine-vanille",
        type: "brand-official",
      },
      {
        label: "Essential Parfums — Fig Infusion / Nathalie Lorson",
        url: "https://www.essentialparfums.com/en/collections/fig-infusion",
        type: "brand-official",
      },
      {
        label: "Essential Parfums — The Musc / Calice Becker",
        url: "https://www.essentialparfums.com/en/collections/the-musc",
        type: "brand-official",
      },
      {
        label: "Essential Parfums — Rose Magnetic / Sophie Labbé",
        url: "https://www.essentialparfums.com/en/collections/rose-magnetic",
        type: "brand-official",
      },
      {
        label: "Essential Parfums — Patchouli Mania / Fabrice Pellegrin",
        url: "https://www.essentialparfums.com/en/collections/patchouli-mania",
        type: "brand-official",
      },
      {
        label: "Essential Parfums — Velvet Iris / Dominique Ropion",
        url: "https://www.essentialparfums.com/en/collections/velvet-iris",
        type: "brand-official",
      },
      {
        label: "Essential Parfums — Ambre Latte / Jordi Fernández",
        url: "https://www.essentialparfums.com/en/products/ambre-latte-eau-de-parfum-natural-spray-refillable-100-ml",
        type: "brand-official",
      },
      {
        label: "Essential Parfums — Néroli Botanica / Anne Flipo",
        url: "https://www.essentialparfums.com/en/collections/neroli-botanica",
        type: "brand-official",
      },
      {
        label: "Essential Parfums — Osmanthus Absolu / Mathieu Nardin",
        url: "https://www.essentialparfums.com/en/collections/osmanthus-absolu",
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
    perfumerIds: [
      "dominique-ropion",
      "jean-claude-ellena",
      "maurice-roucel",
      "sophia-grojsman",
      "pierre-bourdon",
      "carlos-benaim",
      "edouard-flechier",
      "michel-roudnitska",
    ],
    sourceLinks: [
      {
        label: "Frédéric Malle — About",
        url: "https://www.fredericmalle.com/about-us",
        type: "brand-official",
      },
      {
        label: "Frédéric Malle — Jean-Claude Ellena",
        url: "https://www.fredericmalle.com/perfumer/jean-claude-ellena",
        type: "brand-official",
      },
      {
        label: "Frédéric Malle — Maurice Roucel",
        url: "https://www.fredericmalle.com/perfumer/maurice-roucel",
        type: "brand-official",
      },
      {
        label: "Frédéric Malle — Sophia Grojsman",
        url: "https://www.fredericmalle.com/perfumer/sophia-grojsman",
        type: "brand-official",
      },
      {
        label: "Frédéric Malle — Iris Poudre / Pierre Bourdon",
        url: "https://www.fredericmalle.com/product/19566/50168/parfums/iris-poudre/by-pierre-bourdon",
        type: "brand-official",
      },
      {
        label: "Frédéric Malle — Music for a While / Carlos Benaim",
        url: "https://www.fredericmalle.com/product/19566/57108/parfums/music-for-a-while/by-carlos-benaim",
        type: "brand-official",
      },
      {
        label: "Frédéric Malle — Édouard Fléchier",
        url: "https://www.fredericmalle.com/perfumer/edouard-flechier",
        type: "brand-official",
      },
      {
        label: "Frédéric Malle — Michel Roudnitska",
        url: "https://www.fredericmalle.com/perfumer/michel-roudnitska",
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
    perfumerIds: ["edmond-roudnitska", "francis-kurkdjian"],
    sourceLinks: [
      {
        label: "Dior — Diorissimo / Edmond Roudnitska",
        url: "https://www.dior.com/fr_be/beauty/products/diorissimo-Y0000409.html",
        type: "brand-official",
      },
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
