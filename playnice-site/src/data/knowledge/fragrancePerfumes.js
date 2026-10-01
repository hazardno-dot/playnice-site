/*
 * PLAYNICE FI KNOWLEDGE — PERFUMES
 *
 * Source-backed perfume authorship and house relationships.
 * playNiceCatalogSlug is verified against the current PlayNice catalog slug
 * and should be checked at runtime before claiming availability.
 */

export const fragrancePerfumes = [
  {
    id: "dior-new-look",
    name: "New Look",
    aliases: [
      "new look",
      "dior new look",
      "christian dior new look",
    ],
    entityType: "fragrance",
    houseId: "dior",
    perfumerIds: ["francis-kurkdjian"],
    playNiceCatalogSlug: null,
    summary: {
      sr: "New Look je Dior kompozicija Francisa Kurkdjiana iz La Collection Privée. Dior je gradi oko naglašene aldehidne svežine, tamjana i ambery akorda, kao savremenu reinterpretaciju New Look nasleđa kuće.",
      en: "New Look is a Dior composition by Francis Kurkdjian from La Collection Privée. Dior builds it around an emphasized aldehydic freshness, frankincense and an ambery accord as a contemporary reinterpretation of the house's New Look heritage.",
    },
    sources: [
      {
        label: "Dior — New Look",
        url: "https://www.dior.com/en_us/beauty/products/new-look-Y0997153.html",
        type: "brand-official",
      },
    ],
  },
  {
    id: "dior-dioriviera",
    name: "Dioriviera",
    aliases: [
      "dioriviera",
      "dior dioriviera",
      "christian dior dioriviera",
    ],
    entityType: "fragrance",
    houseId: "dior",
    perfumerIds: ["francis-kurkdjian"],
    playNiceCatalogSlug: null,
    summary: {
      sr: "Dioriviera je Dior kompozicija Francisa Kurkdjiana inspirisana jugom Francuske i Parizom. Kuća je opisuje kao floral-fruity spoj smokve i ruže sa svetlim, sunčanim i hedonističkim karakterom.",
      en: "Dioriviera is a Dior composition by Francis Kurkdjian inspired by the south of France and Paris. The house describes it as a floral-fruity pairing of fig and rose with a bright, solar and hedonistic character.",
    },
    sources: [
      {
        label: "Dior — Dioriviera",
        url: "https://www.dior.com/en_us/beauty/products/dioriviera-C099800164.html",
        type: "brand-official",
      },
    ],
  },

  {
    id: "frederic-malle-french-lover",
    name: "French Lover",
    aliases: [
      "french lover",
      "frederic malle french lover",
      "frédéric malle french lover",
    ],
    entityType: "fragrance",
    houseId: "frederic-malle",
    perfumerIds: ["pierre-bourdon"],
    playNiceCatalogSlug: null,
    summary: {
      sr: "French Lover je Frédéric Malle kompozicija Pierrea Bourdona. Kuća je opisuje kao duboku spicy-aromatic strukturu oko angelike, galbanuma, irisa, kedra, vetivera, pačulija, tamjana i belog mošusa.",
      en: "French Lover is a Frédéric Malle composition by Pierre Bourdon. The house describes it as a deep spicy-aromatic structure built around angelica, galbanum, iris, cedar, vetiver, patchouli, frankincense and white musk.",
    },
    sources: [
      {
        label: "Frédéric Malle — French Lover / Pierre Bourdon",
        url: "https://www.fredericmalle.com/product/19566/50222/parfums/french-lover/by-pierre-bourdon",
        type: "brand-official",
      },
    ],
  },
  {
    id: "frederic-malle-music-for-a-while",
    name: "Music for a While",
    aliases: [
      "music for a while",
      "frederic malle music for a while",
      "frédéric malle music for a while",
    ],
    entityType: "fragrance",
    houseId: "frederic-malle",
    perfumerIds: ["carlos-benaim"],
    playNiceCatalogSlug: null,
    summary: {
      sr: "Music for a While je Frédéric Malle kompozicija Carlosa Benaïma. Kuća je gradi kao fruity-gourmand kontrast lavande i vanile, sa citrusima, ananasom i pačulijem koji daju istovremeno hladan i topao karakter.",
      en: "Music for a While is a Frédéric Malle composition by Carlos Benaïm. The house builds it as a fruity-gourmand contrast of lavender and vanilla, with citrus, pineapple and patchouli creating a simultaneously cool and warm character.",
    },
    sources: [
      {
        label: "Frédéric Malle — Music for a While / Carlos Benaim",
        url: "https://www.fredericmalle.com/product/19566/57108/parfums/music-for-a-while/by-carlos-benaim",
        type: "brand-official",
      },
    ],
  },

  {
    id: "louis-vuitton-on-the-beach",
    name: "On the Beach",
    aliases: [
      "on the beach",
      "louis vuitton on the beach",
      "lv on the beach",
    ],
    entityType: "fragrance",
    houseId: "louis-vuitton",
    perfumerIds: ["jacques-cavallier-belletrud"],
    playNiceCatalogSlug: null,
    summary: {
      sr: "On the Beach je Louis Vuitton kompozicija Jacquesa Cavallier Belletruda. Kuća je gradi oko yuzu citrusa, nerolija, timijana, ruzmarina, pink bibera, karanfilića i čempresa kao olfaktornu sliku sunca, mora i toplog peska.",
      en: "On the Beach is a Louis Vuitton composition by Jacques Cavallier Belletrud. The house builds it around yuzu, neroli, thyme, rosemary, pink pepper, clove and cypress as an olfactory image of sun, sea and warm sand.",
    },
    sources: [
      {
        label: "Louis Vuitton — On the Beach",
        url: "https://us.louisvuitton.com/eng-us/products/on-the-beach-nvprod7440007v/LP0481",
        type: "brand-official",
      },
    ],
  },
  {
    id: "louis-vuitton-city-of-stars",
    name: "City of Stars",
    aliases: [
      "city of stars",
      "louis vuitton city of stars",
      "lv city of stars",
    ],
    entityType: "fragrance",
    houseId: "louis-vuitton",
    perfumerIds: ["jacques-cavallier-belletrud"],
    playNiceCatalogSlug: null,
    summary: {
      sr: "City of Stars je Louis Vuitton kompozicija Jacquesa Cavallier Belletruda inspirisana Los Anđelesom noću. Kuća ističe citrusni spoj limuna, blood orangea, crvene mandarine, bergamotke i limete, zatim tiare akord, sandalovinu i puderasti musk.",
      en: "City of Stars is a Louis Vuitton composition by Jacques Cavallier Belletrud inspired by Los Angeles at night. The house highlights a citrus blend of lemon, blood orange, red mandarin, bergamot and lime followed by tiare accord, sandalwood and powdery musk.",
    },
    sources: [
      {
        label: "Louis Vuitton — City of Stars",
        url: "https://eu.louisvuitton.com/eng-e1/products/city-of-stars-nvprod7340004v/LP0482",
        type: "brand-official",
      },
    ],
  },

  {
    id: "guerlain-tobacco-honey",
    name: "Tobacco Honey",
    aliases: [
      "tobacco honey",
      "guerlain tobacco honey",
      "tobacco honey guerlain",
    ],
    entityType: "fragrance",
    houseId: "guerlain",
    perfumerIds: ["delphine-jelk"],
    playNiceCatalogSlug: null,
    summary: {
      sr: "Tobacco Honey je Guerlain L’Art & La Matière kompozicija Delphine Jelk. Kuća ga opisuje kao ambery-woody interpretaciju tobacco akorda obavijenog medom, vanilom, tonkom i susamom, uz anis, karanfilić, sandalovinu i oud.",
      en: "Tobacco Honey is a Guerlain L’Art & La Matière composition by Delphine Jelk. The house describes it as an ambery-woody interpretation of a tobacco accord wrapped in honey, vanilla, tonka and sesame, with anise, clove, sandalwood and oud.",
    },
    sources: [
      {
        label: "Guerlain — Tobacco Honey",
        url: "https://www.guerlain.com/int/en-int/p/lart-la-matiere-tobacco-honey-eau-de-parfum-G014726.html",
        type: "brand-official",
      },
    ],
  },

  {
    id: "chanel-31-rue-cambon",
    name: "31 RUE CAMBON",
    aliases: [
      "31 rue cambon",
      "chanel 31 rue cambon",
      "31 cambon",
      "rue cambon chanel",
    ],
    entityType: "fragrance",
    houseId: "chanel",
    perfumerIds: ["jacques-polge"],
    playNiceCatalogSlug: null,
    summary: {
      sr: "31 RUE CAMBON je Les Exclusifs de CHANEL kompozicija Jacquesa Polgea iz 2007. Današnji Eau de Parfum kuća opisuje kroz kompleksan iris, crni biber i vetiver akord, kao woody-floral-spicy izraz CHANEL elegancije.",
      en: "31 RUE CAMBON is a Les Exclusifs de CHANEL composition created by Jacques Polge in 2007. The current Eau de Parfum is described by the house through a complex iris, black pepper and vetiver accord, expressing CHANEL elegance in a woody-floral-spicy form.",
    },
    sources: [
      {
        label: "CHANEL — 2000s / Les Exclusifs authorship",
        url: "https://www.chanel.com/sa-en/about-chanel/the-house-of-chanel/2000/",
        type: "brand-official",
      },
      {
        label: "CHANEL — 31 RUE CAMBON Eau de Parfum",
        url: "https://www.chanel.com/us/fragrance/p/122050/31-rue-cambon-eau-de-parfum-woody-floral-spicy/",
        type: "brand-official",
      },
    ],
  },
  {
    id: "chanel-la-pausa",
    name: "LA PAUSA",
    aliases: [
      "la pausa",
      "28 la pausa",
      "chanel la pausa",
      "chanel 28 la pausa",
    ],
    entityType: "fragrance",
    houseId: "chanel",
    perfumerIds: ["jacques-polge"],
    playNiceCatalogSlug: null,
    summary: {
      sr: "LA PAUSA je Les Exclusifs de CHANEL kompozicija Jacquesa Polgea, originalno lansirana u okviru kolekcije 2007. Savremeni Eau de Parfum stavlja dragoceni Iris pallida u centar, uz pink pepper i vetiver, u floralno-puderastoj i woody strukturi.",
      en: "LA PAUSA is a Les Exclusifs de CHANEL composition by Jacques Polge, originally launched within the collection in 2007. The current Eau de Parfum centers precious Iris pallida with pink pepper and vetiver in a floral, powdery and woody structure.",
    },
    sources: [
      {
        label: "CHANEL — 2000s / Les Exclusifs authorship",
        url: "https://www.chanel.com/sa-en/about-chanel/the-house-of-chanel/2000/",
        type: "brand-official",
      },
      {
        label: "CHANEL — LA PAUSA Eau de Parfum",
        url: "https://www.chanel.com/lu-fr/parfums/p/122270/la-pausa-eau-de-parfum-floral-poudre-boise/",
        type: "brand-official",
      },
    ],
  },

  {
    id: "hermes-galop-parfum",
    name: "Galop d’Hermès Parfum",
    aliases: [
      "galop d hermes",
      "galop d'hermes",
      "galop d’hermès",
      "hermes galop",
      "galop hermes parfum",
    ],
    entityType: "fragrance",
    houseId: "hermes",
    perfumerIds: ["christine-nagel"],
    playNiceCatalogSlug: null,
    summary: {
      sr: "Galop d’Hermès je parfem Christine Nagel iz 2016, inspirisan konjičkim univerzumom kuće. Hermès ga gradi oko kontrasta opulentne ruže i podatne kože, uz saffron, kao savremeno čitanje dva materijala snažno vezana za identitet kuće.",
      en: "Galop d’Hermès is a 2016 fragrance by Christine Nagel inspired by the house's equestrian universe. Hermès builds it around the contrast of opulent rose and supple leather with saffron, as a contemporary interpretation of two materials closely tied to the house.",
    },
    sources: [
      {
        label: "Hermès — Galop d’Hermès Parfum",
        url: "https://www.hermes.com/us/en/product/galop-d-hermes-parfum-V36824/",
        type: "brand-official",
      },
    ],
  },
  {
    id: "hermes-kelly-caleche-edt",
    name: "Kelly Calèche Eau de Toilette",
    aliases: [
      "kelly caleche",
      "kelly calèche",
      "hermes kelly caleche",
      "kelly caleche edt",
      "kelly calèche eau de toilette",
    ],
    entityType: "fragrance",
    houseId: "hermes",
    perfumerIds: ["jean-claude-ellena"],
    playNiceCatalogSlug: null,
    summary: {
      sr: "Kelly Calèche je Hermès kompozicija Jean-Claude Ellene iz 2007. Kuća je opisuje kao lagan floral-leather parfem u kojem se ruža i puderasti mimosa tonovi spajaju sa elegantnim vetiverom i uspomenom na Hermès leather biblioteku.",
      en: "Kelly Calèche is a 2007 Hermès composition by Jean-Claude Ellena. The house describes it as a light floral-leather fragrance where rose and powdery mimosa meet elegant vetiver and the memory of the Hermès leather library.",
    },
    sources: [
      {
        label: "Hermès — Kelly Calèche Eau de Toilette",
        url: "https://www.hermes.com/us/en/product/kelly-caleche-eau-de-toilette-V22217/",
        type: "brand-official",
      },
    ],
  },
  {
    id: "hermes-bel-ami-edt",
    name: "Bel Ami Eau de Toilette",
    aliases: [
      "bel ami",
      "hermes bel ami",
      "bel ami edt",
      "bel ami eau de toilette",
    ],
    entityType: "fragrance",
    houseId: "hermes",
    perfumerIds: ["jean-louis-sieuzac"],
    playNiceCatalogSlug: null,
    summary: {
      sr: "Bel Ami je Hermès leather-woody Eau de Toilette Jean-Louis Sieuzaca iz 1986. Kuća ga opisuje kao snažan susret patchoulija, duboke kože i cistus labdanuma, sa klasičnim i elegantnim karakterom.",
      en: "Bel Ami is a 1986 Hermès leathery-woody Eau de Toilette by Jean-Louis Sieuzac. The house describes it as a bold encounter of patchouli, deep leather and cistus labdanum with a classical, elegant character.",
    },
    sources: [
      {
        label: "Hermès — Bel Ami Eau de Toilette",
        url: "https://www.hermes.com/us/en/product/bel-ami-eau-de-toilette-V38274/",
        type: "brand-official",
      },
    ],
  },

  {
    id: "guerlain-lhomme-ideal-le-parfum",
    name: "L’Homme Idéal Le Parfum",
    aliases: [
      "l homme ideal le parfum",
      "l'homme ideal le parfum",
      "l’homme idéal le parfum",
      "guerlain l homme ideal parfum",
      "lhomme ideal le parfum",
    ],
    entityType: "fragrance",
    houseId: "guerlain",
    perfumerIds: ["delphine-jelk"],
    playNiceCatalogSlug: null,
    summary: {
      sr: "L’Homme Idéal Le Parfum je savremena Guerlain kreacija Delphine Jelk. Parfimerka ga opisuje kroz gorkasti amaretto efekat badema koji postaje drvenastiji i intenzivniji, uz naglašeniju dubinu u odnosu na svetlije verzije linije.",
      en: "L’Homme Idéal Le Parfum is a contemporary Guerlain creation by Delphine Jelk. She describes it through a bitter almond-to-amaretto effect that becomes woodier and more intense, with greater depth than the lighter interpretations in the line.",
    },
    sources: [
      {
        label: "Guerlain — L’Homme Idéal Le Parfum",
        url: "https://www.guerlain.com/us/en-us/p/l%E2%80%99homme-ideal-de-guerlain-paris-parfum-G030522.html",
        type: "brand-official",
      },
    ],
  },
  {
    id: "guerlain-aqua-allegoria-rosa-verde",
    name: "Aqua Allegoria Rosa Verde",
    aliases: [
      "rosa verde",
      "aqua allegoria rosa verde",
      "guerlain rosa verde",
      "guerlain aqua allegoria rosa verde",
    ],
    entityType: "fragrance",
    houseId: "guerlain",
    perfumerIds: ["delphine-jelk"],
    playNiceCatalogSlug: null,
    summary: {
      sr: "Aqua Allegoria Rosa Verde je Guerlain Eau de Toilette Delphine Jelk. Kuća je predstavlja kao osvežavajuću zelenu ružu koja evocira zaron u hladnu vodu, sa floralnim karakterom ruže postavljenim u izrazito fresh, watery kontekst.",
      en: "Aqua Allegoria Rosa Verde is a Guerlain Eau de Toilette by Delphine Jelk. The house presents it as a refreshing green rose evoking a plunge into cool water, placing rose in a distinctly fresh, watery context.",
    },
    sources: [
      {
        label: "Guerlain — Aqua Allegoria Rosa Verde",
        url: "https://www.guerlain.com/us/en-us/p/aqua-allegoria-rosa-verde---eau-de-toilette-P014913.html",
        type: "brand-official",
      },
    ],
  },

  {
    id: "chanel-paris-edimbourg",
    name: "PARIS-ÉDIMBOURG",
    aliases: [
      "paris edimbourg",
      "paris-edimbourg",
      "chanel paris edimbourg",
      "paris edinburgh chanel",
    ],
    entityType: "fragrance",
    houseId: "chanel",
    perfumerIds: ["olivier-polge"],
    playNiceCatalogSlug: null,
    summary: {
      sr: "PARIS-ÉDIMBOURG je CHANEL woody kompozicija Oliviera Polgea inspirisana škotskim Highlandsom. Kuća ističe snažan početak bobice kleke i čempresa koji prelazi u topao vetiver akord sa zemljanim i dimnim nijansama.",
      en: "PARIS-ÉDIMBOURG is a woody CHANEL composition by Olivier Polge inspired by the Scottish Highlands. The house highlights a powerful burst of juniper berry and cypress evolving into a warm vetiver accord with earthy and smoky nuances.",
    },
    sources: [
      {
        label: "CHANEL — PARIS-ÉDIMBOURG",
        url: "https://www.chanel.com/gb/fragrance/les-eaux-de-chanel/paris-edimbourg/",
        type: "brand-official",
      },
    ],
  },
  {
    id: "chanel-paris-venise",
    name: "PARIS-VENISE",
    aliases: [
      "paris venise",
      "paris-venise",
      "chanel paris venise",
      "paris venice chanel",
    ],
    entityType: "fragrance",
    houseId: "chanel",
    perfumerIds: ["olivier-polge"],
    playNiceCatalogSlug: null,
    summary: {
      sr: "PARIS-VENISE je CHANEL kompozicija Oliviera Polgea koja spaja svetlu neroli esenciju sa toplim ambery akordom vanile i tonke. Polge je opisuje kao svež parfem sa zaobljenom i mekom ekspresijom.",
      en: "PARIS-VENISE is a CHANEL composition by Olivier Polge pairing luminous neroli essence with a warm ambery accord of vanilla and tonka. Polge describes it as a fresh fragrance with a round and soft expression.",
    },
    sources: [
      {
        label: "CHANEL — PARIS-VENISE",
        url: "https://www.chanel.com/us/fragrance/les-eaux-de-chanel/paris-venise/",
        type: "brand-official",
      },
    ],
  },

  {
    id: "louis-vuitton-afternoon-swim",
    name: "Afternoon Swim",
    aliases: [
      "afternoon swim",
      "louis vuitton afternoon swim",
      "lv afternoon swim",
    ],
    entityType: "fragrance",
    houseId: "louis-vuitton",
    perfumerIds: ["jacques-cavallier-belletrud"],
    playNiceCatalogSlug: null,
    summary: {
      sr: "Afternoon Swim je Louis Vuitton citrusna kompozicija Jacquesa Cavallier Belletruda. Kuća je opisuje kao izrazito svež miris izgrađen oko sočne pomorandže, bergamotke i mandarine, sa efektom hladnog uranjanja tokom vrelog dana.",
      en: "Afternoon Swim is a Louis Vuitton citrus composition by Jacques Cavallier Belletrud. The house presents it as an intensely fresh fragrance built around juicy orange, bergamot and mandarin, evoking a cool plunge on a hot day.",
    },
    sources: [
      {
        label: "Louis Vuitton — Afternoon Swim",
        url: "https://us.louisvuitton.com/eng-us/products/afternoon-swim-nvprod7330060v/LP0484",
        type: "brand-official",
      },
    ],
  },
  {
    id: "louis-vuitton-pacific-chill",
    name: "Pacific Chill",
    aliases: [
      "pacific chill",
      "louis vuitton pacific chill",
      "lv pacific chill",
    ],
    entityType: "fragrance",
    houseId: "louis-vuitton",
    perfumerIds: ["jacques-cavallier-belletrud"],
    playNiceCatalogSlug: null,
    summary: {
      sr: "Pacific Chill je Louis Vuitton kreacija Jacquesa Cavallier Belletruda sa blackcurrant accordom, citronom, limunom, bosiljkom, mentom i citrusnim notama. Kuća ga predstavlja kao živu fruity-citrus interpretaciju jutarnje svežine.",
      en: "Pacific Chill is a Louis Vuitton creation by Jacques Cavallier Belletrud featuring blackcurrant accord, citron, lemon, basil, mint and citrus notes. The house presents it as a vibrant fruity-citrus interpretation of morning freshness.",
    },
    sources: [
      {
        label: "Louis Vuitton — Pacific Chill",
        url: "https://eu.louisvuitton.com/eng-e1/products/pacific-chill-nvprod7220018v/LP0461",
        type: "brand-official",
      },
    ],
  },

  {
    id: "essential-parfums-neroli-botanica",
    name: "Néroli Botanica",
    aliases: [
      "neroli botanica",
      "néroli botanica",
      "essential parfums neroli botanica",
    ],
    entityType: "fragrance",
    houseId: "essential-parfums",
    perfumerIds: ["anne-flipo"],
    playNiceCatalogSlug: null,
    summary: {
      sr: "Néroli Botanica je Essential Parfums Eau de Parfum Anne Flipo. Kompozicija stavlja orange blossom u centar, uz turmeric leaf, đumbir, pink i black pepper, neroli, sambac jasmin, vetiver i sandalovinu.",
      en: "Néroli Botanica is an Essential Parfums Eau de Parfum by Anne Flipo. It centers orange blossom with turmeric leaf, ginger, pink and black pepper, neroli, sambac jasmine, vetiver and sandalwood.",
    },
    sources: [
      {
        label: "Essential Parfums — Néroli Botanica",
        url: "https://www.essentialparfums.com/en/collections/neroli-botanica",
        type: "brand-official",
      },
    ],
  },
  {
    id: "essential-parfums-osmanthus-absolu",
    name: "Osmanthus Absolu",
    aliases: [
      "osmanthus absolu",
      "osmanthus absolute essential parfums",
      "essential parfums osmanthus absolu",
      "osmantus absolu",
    ],
    entityType: "fragrance",
    houseId: "essential-parfums",
    perfumerIds: ["mathieu-nardin"],
    playNiceCatalogSlug: null,
    summary: {
      sr: "Osmanthus Absolu je Essential Parfums Eau de Parfum Mathieua Nardina. Kompozicija reinterpretira tea akord kroz osmanthus sa peach/apricot i leathery facetama, smoky Ceylon black tea, bergamot, kardamom, cedar i vanilu.",
      en: "Osmanthus Absolu is an Essential Parfums Eau de Parfum by Mathieu Nardin. It reinterprets a tea accord through osmanthus with peach-apricot and leathery facets, smoky Ceylon black tea, bergamot, cardamom, cedarwood and vanilla.",
    },
    sources: [
      {
        label: "Essential Parfums — Osmanthus Absolu",
        url: "https://www.essentialparfums.com/en/collections/osmanthus-absolu",
        type: "brand-official",
      },
      {
        label: "Essential Parfums — Mathieu Nardin",
        url: "https://www.essentialparfums.com/pages/mathieu-nardin",
        type: "brand-official",
      },
    ],
  },

  {
    id: "chanel-gabrielle-edp",
    name: "GABRIELLE CHANEL Eau de Parfum",
    aliases: [
      "gabrielle chanel",
      "gabrielle chanel edp",
      "chanel gabrielle",
      "gabrielle eau de parfum",
    ],
    entityType: "fragrance",
    houseId: "chanel",
    perfumerIds: ["olivier-polge"],
    playNiceCatalogSlug: null,
    summary: {
      sr: "GABRIELLE CHANEL Eau de Parfum je kompozicija Oliviera Polgea. CHANEL je opisuje kao zamišljeni beli cvet izgrađen oko jasmina, ylang-ylanga, orange blossoma i tuberoze iz Grassea.",
      en: "GABRIELLE CHANEL Eau de Parfum is a composition by Olivier Polge. CHANEL describes it as an imaginary white flower built around jasmine, ylang-ylang, orange blossom and Grasse tuberose.",
    },
    sources: [
      {
        label: "CHANEL — GABRIELLE CHANEL Eau de Parfum",
        url: "https://www.chanel.com/us/fragrance/p/120425/gabrielle-chanel-eau-de-parfum-spray/",
        type: "brand-official",
      },
    ],
  },
  {
    id: "chanel-paris-deauville",
    name: "PARIS-DEAUVILLE",
    aliases: [
      "paris deauville",
      "paris-deauville",
      "chanel paris deauville",
      "les eaux de chanel paris deauville",
    ],
    entityType: "fragrance",
    houseId: "chanel",
    perfumerIds: ["olivier-polge"],
    playNiceCatalogSlug: null,
    summary: {
      sr: "PARIS-DEAUVILLE je CHANEL Eau de Toilette Oliviera Polgea. Kuća ga opisuje kao svežu, zelenu i aromatičnu kompoziciju koja spaja aromatične zelene facete bosiljka sa iskričavom sicilijanskom pomorandžom.",
      en: "PARIS-DEAUVILLE is a CHANEL Eau de Toilette by Olivier Polge. The house describes it as a fresh, green and aromatic composition pairing the aromatic green facets of basil with sparkling Sicilian orange.",
    },
    sources: [
      {
        label: "CHANEL — PARIS-DEAUVILLE",
        url: "https://www.chanel.com/us/fragrance/les-eaux-de-chanel/paris-deauville/",
        type: "brand-official",
      },
    ],
  },

  {
    id: "essential-parfums-ambre-latte",
    name: "Ambre Latte",
    aliases: [
      "ambre latte",
      "essential parfums ambre latte",
      "amber latte",
    ],
    entityType: "fragrance",
    houseId: "essential-parfums",
    perfumerIds: ["jordi-fernandez"],
    playNiceCatalogSlug: null,
    summary: {
      sr: "Ambre Latte je Essential Parfums Eau de Parfum Jordija Fernándeza. Kompozicija kombinuje almond-milk akord, roasted tonku, dulce de leche caramel, vanilu, benzoin i white musk sa Ambrofixom, Georgywoodom i Akigalawoodom.",
      en: "Ambre Latte is an Essential Parfums Eau de Parfum by Jordi Fernández. It combines an almond-milk accord, roasted tonka, dulce de leche caramel, vanilla, benzoin and white musk with Ambrofix, Georgywood and Akigalawood.",
    },
    sources: [
      {
        label: "Essential Parfums — Ambre Latte",
        url: "https://www.essentialparfums.com/en/products/ambre-latte-eau-de-parfum-natural-spray-refillable-100-ml",
        type: "brand-official",
      },
    ],
  },
  {
    id: "essential-parfums-velvet-iris",
    name: "Velvet Iris",
    aliases: [
      "velvet iris",
      "essential parfums velvet iris",
      "iris velvet essential parfums",
    ],
    entityType: "fragrance",
    houseId: "essential-parfums",
    perfumerIds: ["dominique-ropion"],
    playNiceCatalogSlug: null,
    summary: {
      sr: "Velvet Iris je Essential Parfums Eau de Parfum Dominiquea Ropiona. Kuća ga opisuje kao green woody iris sa pink pepperom, turmeric i buchu listom, galbanumom, iris concreteom, sandalovinom, labdanumom i Saffiano™ leather molekulom.",
      en: "Velvet Iris is an Essential Parfums Eau de Parfum by Dominique Ropion. The house describes it as a green woody iris with pink pepper, turmeric and buchu leaf, galbanum, iris concrete, sandalwood, labdanum and the Saffiano™ leather molecule.",
    },
    sources: [
      {
        label: "Essential Parfums — Velvet Iris",
        url: "https://www.essentialparfums.com/en/products/velvet-iris-eau-de-parfum-spray-10-ml",
        type: "brand-official",
      },
    ],
  },

  {
    id: "chanel-no19-edt",
    name: "CHANEL N°19 Eau de Toilette",
    aliases: [
      "chanel no 19",
      "chanel n19",
      "n 19 chanel",
      "n°19 chanel",
      "chanel number 19",
    ],
    entityType: "fragrance",
    houseId: "chanel",
    perfumerIds: ["henri-robert"],
    playNiceCatalogSlug: null,
    summary: {
      sr: "CHANEL N°19 je green floral kompozicija koju je Henri Robert kreirao za Gabrielle Chanel i koja je lansirana 1970. Ime nosi po njenom rođendanu, 19. avgustu, a CHANEL posebno ističe kontrast zelenog galbanuma i puderastog irisa.",
      en: "CHANEL N°19 is a green floral composition created by Henri Robert for Gabrielle Chanel and launched in 1970. It is named after her August 19 birthday, with CHANEL highlighting the contrast between green galbanum and powdery iris.",
    },
    sources: [
      {
        label: "CHANEL — 1970s / N°19",
        url: "https://www.chanel.com/rs/about-chanel/the-house-of-chanel/1970/",
        type: "brand-official",
      },
      {
        label: "CHANEL — N°19 Eau de Toilette",
        url: "https://www.chanel.com/gb/fragrance/p/119690/n19-eau-de-toilette-spray/",
        type: "brand-official",
      },
    ],
  },
  {
    id: "chanel-coco-mademoiselle-2001",
    name: "Coco Mademoiselle",
    aliases: [
      "coco mademoiselle",
      "chanel coco mademoiselle",
      "coco madmoazel",
      "coco mademoisel",
    ],
    entityType: "fragrance",
    houseId: "chanel",
    perfumerIds: ["jacques-polge"],
    playNiceCatalogSlug: null,
    summary: {
      sr: "Coco Mademoiselle je CHANEL parfem koji je Jacques Polge kreirao i koji je lansiran 2001. CHANEL ga u svojoj istoriji opisuje kao fresh oriental/chypre kompoziciju sa važnom ulogom frakcionisanog patchoulija.",
      en: "Coco Mademoiselle is a CHANEL fragrance created by Jacques Polge and launched in 2001. CHANEL's house history describes it as a fresh oriental/chypre composition in which fractional patchouli plays an important role.",
    },
    sources: [
      {
        label: "CHANEL — 2000s / Coco Mademoiselle",
        url: "https://www.chanel.com/ie/about-chanel/the-house-of-chanel/2000/",
        type: "brand-official",
      },
    ],
  },
  {
    id: "chanel-bleu-de-chanel-2010",
    name: "Bleu de CHANEL",
    aliases: [
      "bleu de chanel",
      "blue de chanel",
      "bleu chanel",
      "chanel bleu",
    ],
    entityType: "fragrance",
    houseId: "chanel",
    perfumerIds: ["jacques-polge"],
    playNiceCatalogSlug: null,
    summary: {
      sr: "Bleu de CHANEL je muški CHANEL parfem koji je Jacques Polge kreirao za lansiranje 2010. Kuća ga u svojoj zvaničnoj istoriji direktno navodi kao Polgeovu kreaciju.",
      en: "Bleu de CHANEL is a men's CHANEL fragrance created by Jacques Polge for its 2010 launch. The house directly credits the creation to Polge in its official history.",
    },
    sources: [
      {
        label: "CHANEL — 2010s / Bleu de CHANEL",
        url: "https://www.chanel.com/us/about-chanel/the-house-of-chanel/2010/",
        type: "brand-official",
      },
    ],
  },

  {
    id: "hermes-terre-eau-intense-vetiver",
    name: "Terre d’Hermès Eau Intense Vétiver",
    aliases: [
      "terre d hermes eau intense vetiver",
      "terre d'hermes eau intense vetiver",
      "terre d’hermès eau intense vétiver",
      "terre intense vetiver",
      "hermes eau intense vetiver",
    ],
    entityType: "fragrance",
    houseId: "hermes",
    perfumerIds: ["christine-nagel"],
    playNiceCatalogSlug: null,
    summary: {
      sr: "Terre d’Hermès Eau Intense Vétiver je Hermès Eau de Parfum koji je Christine Nagel kreirala 2018. Kompozicija stavlja vetiver u prvi plan, uz zelenu bergamotku i sichuan biber, kao svetliju i vegetabilniju interpretaciju Terre d’Hermès potpisa.",
      en: "Terre d’Hermès Eau Intense Vétiver is a Hermès Eau de Parfum created by Christine Nagel in 2018. It puts vetiver at the center with green bergamot and Sichuan pepper, offering a brighter, more vegetal interpretation of the Terre d’Hermès signature.",
    },
    sources: [
      {
        label: "Hermès — Terre d’Hermès Eau Intense Vétiver",
        url: "https://www.hermes.com/us/en/product/terre-d-hermes-eau-intense-vetiver-eau-de-parfum-V40946/",
        type: "brand-official",
      },
    ],
  },
  {
    id: "hermes-terre-eau-de-parfum-intense",
    name: "Terre d’Hermès Eau de Parfum Intense",
    aliases: [
      "terre d hermes eau de parfum intense",
      "terre d'hermes eau de parfum intense",
      "terre d’hermès eau de parfum intense",
      "terre hermes intense",
      "terre edp intense",
    ],
    entityType: "fragrance",
    houseId: "hermes",
    perfumerIds: ["christine-nagel"],
    playNiceCatalogSlug: null,
    summary: {
      sr: "Terre d’Hermès Eau de Parfum Intense je Hermès woody kompozicija Christine Nagel. Kuća je opisuje kroz spoj svetle bergamotke, užarenog drveta i mineralnog efekta lava kamena, kao intimniju i dublju interpretaciju Terre univerzuma.",
      en: "Terre d’Hermès Eau de Parfum Intense is a woody Hermès composition by Christine Nagel. The house describes it through bright bergamot, burning wood and the mineral effect of lava stone, as a more intimate and deeper interpretation of the Terre universe.",
    },
    sources: [
      {
        label: "Hermès — Terre d’Hermès Eau de Parfum Intense",
        url: "https://www.hermes.com/fr/fr/product/terre-d-hermes-eau-de-parfum-intense-V111230V0/",
        type: "brand-official",
      },
    ],
  },
  {
    id: "essential-parfums-bois-imperial-extrait",
    name: "Bois Impérial Extrait",
    aliases: [
      "bois imperial extrait",
      "bois impérial extrait",
      "essential parfums bois imperial extrait",
      "bois imperial extract",
    ],
    entityType: "fragrance",
    houseId: "essential-parfums",
    perfumerIds: ["quentin-bisch"],
    playNiceCatalogSlug: null,
    summary: {
      sr: "Bois Impérial Extrait je 32% extrait verzija Essential Parfums Bois Impériala koju potpisuje Quentin Bisch. Kuća ga opisuje kao tamniju i bogatiju interpretaciju originala, sa pojačanim kontrastima crnog bibera, ruže, Atlas cedra, fir balsama i labdanuma.",
      en: "Bois Impérial Extrait is the 32% extrait version of Essential Parfums Bois Impérial by Quentin Bisch. The house describes it as a darker, richer interpretation of the original, amplifying contrasts of black pepper, rose, Atlas cedar, fir balsam and labdanum.",
    },
    sources: [
      {
        label: "Essential Parfums — Bois Impérial Extrait",
        url: "https://www.essentialparfums.com/products/bois-imperial-extrait-de-parfum-vaporisateur-30-ml",
        type: "brand-official",
      },
    ],
  },

  {
    id: "essential-parfums-rose-magnetic",
    name: "Rose Magnetic",
    aliases: [
      "rose magnetic",
      "essential parfums rose magnetic",
      "magnetic rose essential parfums",
    ],
    entityType: "fragrance",
    houseId: "essential-parfums",
    perfumerIds: ["sophie-labbe"],
    playNiceCatalogSlug: null,
    summary: {
      sr: "Rose Magnetic je Essential Parfums Eau de Parfum Sophie Labbé. Kuća ga gradi oko Rose Essential i Turkish Rose Absolute, uz lychee akord, cedar, musk, madagaskarsku vanilu i tonku.",
      en: "Rose Magnetic is an Essential Parfums Eau de Parfum by Sophie Labbé. The house builds it around Rose Essential and Turkish Rose Absolute, with a lychee accord, cedar, musk, Madagascar vanilla and tonka bean.",
    },
    sources: [
      {
        label: "Essential Parfums — Rose Magnetic",
        url: "https://www.essentialparfums.com/en/collections/rose-magnetic",
        type: "brand-official",
      },
      {
        label: "Essential Parfums — Sophie Labbé",
        url: "https://www.essentialparfums.com/en/pages/sophie-labbe",
        type: "brand-official",
      },
    ],
  },
  {
    id: "essential-parfums-patchouli-mania",
    name: "Patchouli Mania",
    aliases: [
      "patchouli mania",
      "essential parfums patchouli mania",
      "patchuli mania",
    ],
    entityType: "fragrance",
    houseId: "essential-parfums",
    perfumerIds: ["fabrice-pellegrin"],
    playNiceCatalogSlug: null,
    summary: {
      sr: "Patchouli Mania je Essential Parfums kompozicija Fabricea Pellegrina. Davana, zeleni lešnik i korijander vode u cocoa/tea srce, dok bazu grade patchouli, Clearwood, vetiver i Cetalox.",
      en: "Patchouli Mania is an Essential Parfums composition by Fabrice Pellegrin. Davana, green hazelnut and coriander lead into a cocoa-and-tea heart, while patchouli, Clearwood, vetiver and Cetalox form the base.",
    },
    sources: [
      {
        label: "Essential Parfums — Patchouli Mania",
        url: "https://www.essentialparfums.com/en/collections/patchouli-mania",
        type: "brand-official",
      },
      {
        label: "Essential Parfums — Fabrice Pellegrin",
        url: "https://www.essentialparfums.com/en/pages/fabrice-pellegrin",
        type: "brand-official",
      },
    ],
  },

  {
    id: "essential-parfums-fig-infusion",
    name: "Fig Infusion",
    aliases: [
      "fig infusion",
      "essential parfums fig infusion",
      "figue infusion",
    ],
    entityType: "fragrance",
    houseId: "essential-parfums",
    perfumerIds: ["nathalie-lorson"],
    playNiceCatalogSlug: null,
    summary: {
      sr: "Fig Infusion je Essential Parfums Eau de Parfum Nathalie Lorson. Kompozicija gradi realističan fig akord i osvetljava ga mandarinom i klementinom, uz orange blossom, crni čaj, cedar, sandalovinu i benzoin.",
      en: "Fig Infusion is an Essential Parfums Eau de Parfum by Nathalie Lorson. It builds a realistic fig accord and brightens it with mandarin and clementine, supported by orange blossom, black tea, cedar, sandalwood and benzoin.",
    },
    sources: [
      {
        label: "Essential Parfums — Fig Infusion",
        url: "https://www.essentialparfums.com/en/collections/fig-infusion",
        type: "brand-official",
      },
      {
        label: "Essential Parfums — Nathalie Lorson",
        url: "https://www.essentialparfums.com/pages/nathalie-lorson",
        type: "brand-official",
      },
    ],
  },
  {
    id: "essential-parfums-the-musc",
    name: "The Musc",
    aliases: [
      "the musc",
      "the musk essential parfums",
      "essential parfums the musc",
      "essential parfums the musk",
    ],
    entityType: "fragrance",
    houseId: "essential-parfums",
    perfumerIds: ["calice-becker"],
    playNiceCatalogSlug: null,
    summary: {
      sr: "The Musc je Essential Parfums Eau de Parfum Calice Becker. Kuća ga opisuje kao obavijajući i utešan musk sa crvenim đumbirom, lavandinom, pčelinjim voskom, sandalovinom i sintetičkim musk materijalima Nirvanolide i Serenolide.",
      en: "The Musc is an Essential Parfums Eau de Parfum by Calice Becker. The house describes it as an enveloping, comforting musk with red ginger, lavandin, beeswax, sandalwood and the synthetic musks Nirvanolide and Serenolide.",
    },
    sources: [
      {
        label: "Essential Parfums — The Musc",
        url: "https://www.essentialparfums.com/en/collections/the-musc",
        type: "brand-official",
      },
      {
        label: "Essential Parfums — Calice Becker",
        url: "https://www.essentialparfums.com/pages/calice-becker",
        type: "brand-official",
      },
    ],
  },

  {
    id: "essential-parfums-mon-vetiver",
    name: "Mon Vetiver",
    aliases: [
      "mon vetiver",
      "essential parfums mon vetiver",
      "my vetiver essential parfums",
    ],
    entityType: "fragrance",
    houseId: "essential-parfums",
    perfumerIds: ["bruno-jovanovic"],
    playNiceCatalogSlug: null,
    summary: {
      sr: "Mon Vetiver je Essential Parfums Eau de Parfum Bruna Jovanovica. Kompozicija stavlja haićanski vetiver u centar i osvežava ga gin akordom sa meksičkom limetom i klekom, uz lavandin, gentian, cashmere wood i indonežanski patchouli.",
      en: "Mon Vetiver is an Essential Parfums Eau de Parfum by Bruno Jovanovic. It centers Haitian vetiver and refreshes it with a gin accord of Mexican lime and juniper, supported by lavandin, gentian, cashmere wood and Indonesian patchouli.",
    },
    sources: [
      {
        label: "Essential Parfums — Mon Vetiver",
        url: "https://www.essentialparfums.com/en/collections/mon-vetiver",
        type: "brand-official",
      },
    ],
  },
  {
    id: "essential-parfums-divine-vanille",
    name: "Divine Vanille",
    aliases: [
      "divine vanille",
      "essential parfums divine vanille",
      "divine vanilla essential parfums",
    ],
    entityType: "fragrance",
    houseId: "essential-parfums",
    perfumerIds: ["olivier-pescheux"],
    playNiceCatalogSlug: null,
    summary: {
      sr: "Divine Vanille je Essential Parfums kompozicija Oliviera Pescheuxa posvećena vanilla absolute materijalu sa Madagaskara. Kuća navodi i žalfiju, cimet, crni biber, osmanthus, incense, tonku, benzoin i patchouli kao ključne delove strukture.",
      en: "Divine Vanille is an Essential Parfums composition by Olivier Pescheux centered on Madagascar vanilla absolute. The house also highlights clary sage, cinnamon, black pepper, osmanthus, incense, tonka bean, benzoin and patchouli in the structure.",
    },
    sources: [
      {
        label: "Essential Parfums — Divine Vanille",
        url: "https://www.essentialparfums.com/en/collections/divine-vanille",
        type: "brand-official",
      },
    ],
  },

  {
    id: "frederic-malle-rose-tonnerre",
    name: "Rose Tonnerre",
    aliases: [
      "rose tonnerre",
      "frederic malle rose tonnerre",
      "frédéric malle rose tonnerre",
      "rose thunder frederic malle",
    ],
    entityType: "fragrance",
    houseId: "frederic-malle",
    perfumerIds: ["edouard-flechier"],
    playNiceCatalogSlug: null,
    summary: {
      sr: "Rose Tonnerre je Frédéric Malle kompozicija Édouarda Fléchiera. Kuća je opisuje kao tamnu i senzualnu ružu u kontrastu sa truffle akordom, vinskim talogom, medom i patchoulijem; istorijski je vezuje za kreaciju iz 2003.",
      en: "Rose Tonnerre is a Frédéric Malle composition by Édouard Fléchier. The house describes it as a dark, sensual rose contrasted with a truffle accord, wine lees, honey and patchouli, and places the creation historically in 2003.",
    },
    sources: [
      {
        label: "Frédéric Malle — Rose Tonnerre",
        url: "https://www.fredericmalle.com/product/19566/97338/parfums/rose-tonnerre/by-edouard-flechier",
        type: "brand-official",
      },
      {
        label: "Frédéric Malle — 25 years",
        url: "https://www.fredericmalle.com/perfume-reimagined",
        type: "brand-official",
      },
    ],
  },
  {
    id: "frederic-malle-noir-epices",
    name: "Noir Épices",
    aliases: [
      "noir epices",
      "noir épices",
      "frederic malle noir epices",
      "frédéric malle noir épices",
      "noir spices",
    ],
    entityType: "fragrance",
    houseId: "frederic-malle",
    perfumerIds: ["michel-roudnitska"],
    playNiceCatalogSlug: null,
    summary: {
      sr: "Noir Épices je jedna od originalnih kreacija kojima je Éditions de Parfums Frédéric Malle lansiran 2000, a autor je Michel Roudnitska. Kuća ga opisuje kao slojevitu začinsko-drvenastu kompoziciju sa pomorandžom, geranijumom, ružom, sandalovinom i patchoulijem.",
      en: "Noir Épices was one of the original creations launched with Éditions de Parfums Frédéric Malle in 2000 and was composed by Michel Roudnitska. The house describes it as a layered spicy-woody composition with orange, geranium, rose, sandalwood and patchouli.",
    },
    sources: [
      {
        label: "Frédéric Malle — 20 Year Anniversary",
        url: "https://ru.fredericmalle.com/20-year-anniversary/june-6",
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
    id: "frederic-malle-outrageous",
    name: "Outrageous",
    aliases: [
      "outrageous",
      "outrageous frederic malle",
      "frederic malle outrageous",
      "frédéric malle outrageous",
    ],
    entityType: "fragrance",
    houseId: "frederic-malle",
    perfumerIds: ["sophia-grojsman"],
    playNiceCatalogSlug: null,
    summary: {
      sr: "Outrageous je Frédéric Malle Eau de Toilette koju potpisuje Sophia Grojsman. Kuća je opisuje kao energičnu citrusno-aromatičnu kompoziciju sa bergamotom, mandarinom, zelenom jabukom, cimetom, belim mošusom i ambroxanom.",
      en: "Outrageous is a Frédéric Malle Eau de Toilette by Sophia Grojsman. The house describes it as an energetic aromatic-citrus composition with bergamot, mandarin, green apple, cinnamon, white musk and ambroxan.",
    },
    sources: [
      {
        label: "Frédéric Malle — Outrageous",
        url: "https://m.fredericmalle.com/product/19566/50288/parfums/outrageous/by-sophia-grojsman",
        type: "brand-official",
      },
    ],
  },
  {
    id: "frederic-malle-iris-poudre",
    name: "Iris Poudre",
    aliases: [
      "iris poudre",
      "frederic malle iris poudre",
      "frédéric malle iris poudre",
      "iris powder frederic malle",
    ],
    entityType: "fragrance",
    houseId: "frederic-malle",
    perfumerIds: ["pierre-bourdon"],
    playNiceCatalogSlug: null,
    summary: {
      sr: "Iris Poudre je Frédéric Malle floralno-aldehidna kompozicija Pierre Bourdon-a. Kuća je opisuje kao savremenu reinterpretaciju velikih aldehidnih florala 20. veka, sa irisom u centru i ružom, ljubičicom, tonkom, mošusom i aldehidima.",
      en: "Iris Poudre is a floral-aldehydic Frédéric Malle composition by Pierre Bourdon. The house presents it as a contemporary reinterpretation of the great twentieth-century aldehydic florals, centered on iris with rose, violet, tonka, musk and aldehydes.",
    },
    sources: [
      {
        label: "Frédéric Malle — Iris Poudre",
        url: "https://www.fredericmalle.com/product/19566/50168/parfums/iris-poudre/by-pierre-bourdon",
        type: "brand-official",
      },
    ],
  },

  {
    id: "frederic-malle-musc-ravageur",
    name: "Musc Ravageur",
    aliases: [
      "musc ravageur",
      "frederic malle musc ravageur",
      "frédéric malle musc ravageur",
      "musk ravageur",
    ],
    entityType: "fragrance",
    houseId: "frederic-malle",
    perfumerIds: ["maurice-roucel"],
    playNiceCatalogSlug: null,
    summary: {
      sr: "Musc Ravageur je Éditions de Parfums Frédéric Malle kompozicija Mauricea Roucela iz 2000. Kuća ga predstavlja kao ambarni parfem izgrađen oko bergamota, mandarine, vanile, sandalovine i belog mošusa, bez klasičnog floralnog srca.",
      en: "Musc Ravageur is an Éditions de Parfums Frédéric Malle composition by Maurice Roucel from 2000. The house presents it as an amber fragrance built around bergamot, mandarin, vanilla, sandalwood and white musk, without a conventional floral heart.",
    },
    sources: [
      {
        label: "Frédéric Malle — Musc Ravageur",
        url: "https://www.fredericmalle.com/product/19566/50126/parfums/musc-ravageur/by-maurice-roucel",
        type: "brand-official",
      },
      {
        label: "Frédéric Malle — 25 years",
        url: "https://www.fredericmalle.com/perfume-reimagined",
        type: "brand-official",
      },
    ],
  },
  {
    id: "frederic-malle-bigarade-concentree",
    name: "Bigarade Concentrée",
    aliases: [
      "bigarade concentree",
      "bigarade concentrée",
      "frederic malle bigarade concentree",
      "frédéric malle bigarade concentrée",
    ],
    entityType: "fragrance",
    houseId: "frederic-malle",
    perfumerIds: ["jean-claude-ellena"],
    playNiceCatalogSlug: null,
    summary: {
      sr: "Bigarade Concentrée je Frédéric Malle kompozicija Jean-Claude Ellene iz 2002. Kuća je opisuje kao reinterpretaciju eau de cologne strukture zasnovanu na posebno obrađenoj esenciji gorke pomorandže, uz kardamom, ružičasti biber i kedar.",
      en: "Bigarade Concentrée is a Frédéric Malle composition by Jean-Claude Ellena from 2002. The house describes it as a reinvention of the eau de cologne structure built around specially treated bitter-orange essence, with cardamom, pink pepper and cedar.",
    },
    sources: [
      {
        label: "Frédéric Malle — Bigarade Concentrée",
        url: "https://www.fredericmalle.com/product/19566/50181/parfums/bigarade-concentree/by-jean-claude-ellena",
        type: "brand-official",
      },
      {
        label: "Frédéric Malle — 25 years",
        url: "https://www.fredericmalle.com/perfume-reimagined",
        type: "brand-official",
      },
    ],
  },
  {
    id: "frederic-malle-cologne-indelebile",
    name: "Cologne Indélébile",
    aliases: [
      "cologne indelebile",
      "cologne indélébile",
      "frederic malle cologne indelebile",
      "frédéric malle cologne indélébile",
    ],
    entityType: "fragrance",
    houseId: "frederic-malle",
    perfumerIds: ["dominique-ropion"],
    playNiceCatalogSlug: null,
    summary: {
      sr: "Cologne Indélébile je Frédéric Malle kompozicija Dominiquea Ropiona iz 2015. Klasičnu citrusnu eau de cologne strukturu spaja sa veoma postojanom bazom belog mošusa, uz bergamot, cvet pomorandže i narcissus absolute.",
      en: "Cologne Indélébile is a Frédéric Malle composition by Dominique Ropion from 2015. It combines a classical citrus eau de cologne structure with a highly persistent white-musk base, alongside bergamot, orange blossom and narcissus absolute.",
    },
    sources: [
      {
        label: "Frédéric Malle — Cologne Indélébile",
        url: "https://www.fredericmalle.com/product/19566/50272/parfums/cologne-indelebile/by-dominique-ropion",
        type: "brand-official",
      },
      {
        label: "Frédéric Malle — 25 years",
        url: "https://www.fredericmalle.com/perfume-reimagined",
        type: "brand-official",
      },
    ],
  },

  {
    id: "hermes-barenia-edp",
    name: "Barénia Eau de Parfum",
    aliases: [
      "barenia",
      "barénia",
      "hermes barenia",
      "hermès barénia",
      "barenia eau de parfum",
      "barénia eau de parfum",
    ],
    entityType: "fragrance",
    houseId: "hermes",
    perfumerIds: ["christine-nagel"],
    playNiceCatalogSlug: null,
    summary: {
      sr: "Barénia Eau de Parfum je Hermès chypre kompozicija Christine Nagel. Hermès je predstavlja kao njen prvi chypre za kuću, građen oko butterfly lily akorda, miracle berry note, hrastovog drveta i patchoulija.",
      en: "Barénia Eau de Parfum is a Hermès chypre composition by Christine Nagel. Hermès presents it as her first chypre for the house, built around butterfly lily, miracle berry, oakwood and patchouli.",
    },
    sources: [
      {
        label: "Hermès — Barénia Eau de Parfum",
        url: "https://www.hermes.com/us/en/product/barenia-eau-de-parfum-V113537V0/",
        type: "brand-official",
      },
    ],
  },
  {
    id: "hermes-agar-ebene",
    name: "Agar Ebene",
    aliases: [
      "agar ebene",
      "agar ébène",
      "hermes agar ebene",
      "hermès agar ébène",
      "hermessence agar ebene",
    ],
    entityType: "fragrance",
    houseId: "hermes",
    perfumerIds: ["christine-nagel"],
    playNiceCatalogSlug: null,
    summary: {
      sr: "Agar Ebene je Hermessence kompozicija Christine Nagel koja istražuje agarwood/oud kroz topliji, balzamičan pristup. Hermès ističe spoj agar drveta i obavijajućih tonova jelovog balzama.",
      en: "Agar Ebene is a Hermessence composition by Christine Nagel exploring agarwood/oud through a warmer, balsamic direction. Hermès highlights the combination of agar wood with enveloping fir-balsam facets.",
    },
    sources: [
      {
        label: "Hermès — Agar Ebene",
        url: "https://www.hermes.com/us/en/product/agar-ebene-eau-de-toilette-V113482V0/",
        type: "brand-official",
      },
    ],
  },
  {
    id: "hermes-eau-de-basilic-pourpre",
    name: "Eau de basilic pourpre",
    aliases: [
      "eau de basilic pourpre",
      "basilic pourpre",
      "hermes basilic pourpre",
      "hermès eau de basilic pourpre",
      "purple basil hermes",
    ],
    entityType: "fragrance",
    houseId: "hermes",
    perfumerIds: ["christine-nagel"],
    playNiceCatalogSlug: null,
    summary: {
      sr: "Eau de basilic pourpre je Hermès Cologne koju je osmislila Christine Nagel. Kompozicija stavlja ljubičasti bosiljak u centar, uz zelenu bergamotku i geranijum, sa ciljem laganog i vazdušastog aromatičnog efekta.",
      en: "Eau de basilic pourpre is a Hermès Cologne conceived by Christine Nagel. It places purple basil at the center, supported by green bergamot and geranium for a light, airy aromatic effect.",
    },
    sources: [
      {
        label: "Hermès — Eau de basilic pourpre",
        url: "https://www.hermes.com/uk/en/product/eau-de-basilic-pourpre-eau-de-cologne-V105009V0/",
        type: "brand-official",
      },
    ],
  },

  {
    id: "hermes-un-jardin-sur-le-nil",
    name: "Un Jardin sur le Nil",
    aliases: [
      "un jardin sur le nil",
      "hermes un jardin sur le nil",
      "hermès un jardin sur le nil",
      "jardin sur le nil",
      "sur le nil",
    ],
    entityType: "fragrance",
    houseId: "hermes",
    perfumerIds: ["jean-claude-ellena"],
    playNiceCatalogSlug: null,
    summary: {
      sr: "Un Jardin sur le Nil je Hermès Eau de Toilette iz 2005. koji je kreirao Jean-Claude Ellena. Kuća ga opisuje kao zeleno-drvenastu kompoziciju izgrađenu oko zelene manga, lotosa i drveta sikomore, inspirisanu vrtovima uz Nil u Asuanu.",
      en: "Un Jardin sur le Nil is a Hermès Eau de Toilette created in 2005 by Jean-Claude Ellena. The house describes it as a green woody composition built around green mango, lotus and sycamore wood, inspired by the garden islands along the Nile in Aswan.",
    },
    sources: [
      {
        label: "Hermès — Un Jardin sur le Nil",
        url: "https://www.hermes.com/us/en/product/un-jardin-sur-le-nil-eau-de-toilette-V26993/",
        type: "brand-official",
      },
    ],
  },
  {
    id: "hermes-eau-de-rhubarbe-ecarlate",
    name: "Eau de rhubarbe écarlate",
    aliases: [
      "eau de rhubarbe ecarlate",
      "eau de rhubarbe écarlate",
      "rhubarbe ecarlate",
      "rhubarbe écarlate",
      "hermes rhubarbe ecarlate",
      "hermès eau de rhubarbe écarlate",
    ],
    entityType: "fragrance",
    houseId: "hermes",
    perfumerIds: ["christine-nagel"],
    playNiceCatalogSlug: null,
    summary: {
      sr: "Eau de rhubarbe écarlate je Hermès kolonjska voda koju je Christine Nagel kreirala 2016. Kuća je opisuje kao neočekivanu interpretaciju Cologne Hermès, sa kiselkastom svežinom rabarbare i mekšim belim mošusima u pozadini.",
      en: "Eau de rhubarbe écarlate is a Hermès Eau de Cologne created by Christine Nagel in 2016. The house describes it as an unexpected interpretation of Cologne Hermès, pairing tart rhubarb freshness with softer white-musky facets.",
    },
    sources: [
      {
        label: "Hermès — Eau de rhubarbe écarlate",
        url: "https://www.hermes.com/fr/fr/product/eau-de-rhubarbe-ecarlate-eau-de-cologne-V107161V0/",
        type: "brand-official",
      },
    ],
  },
  {
    id: "hermes-eau-de-citron-noir",
    name: "Eau de citron noir",
    aliases: [
      "eau de citron noir",
      "citron noir",
      "hermes citron noir",
      "hermès eau de citron noir",
      "eau de citron noire",
    ],
    entityType: "fragrance",
    houseId: "hermes",
    perfumerIds: ["christine-nagel"],
    playNiceCatalogSlug: null,
    summary: {
      sr: "Eau de citron noir je Hermès kolonjska voda koju je Christine Nagel kreirala 2018. Hermès je opisuje kao citrusno-drvenastu kompoziciju koja kombinuje oštar limun, drvenasti crni čaj i dimne note gvajak drveta.",
      en: "Eau de citron noir is a Hermès Eau de Cologne created by Christine Nagel in 2018. Hermès describes it as a citrus woody composition combining sharp lemon, woody black tea and smoky guaiac-wood facets.",
    },
    sources: [
      {
        label: "Hermès — Eau de citron noir",
        url: "https://www.hermes.com/us/en/product/eau-de-citron-noir-eau-de-cologne-V40411/",
        type: "brand-official",
      },
    ],
  },

  {
    id: "guerlain-eau-de-cologne-imperiale-1853",
    name: "Eau de Cologne Impériale",
    aliases: [
      "eau de cologne imperiale",
      "eau de cologne impériale",
      "guerlain eau de cologne imperiale",
      "cologne imperiale",
      "imperiale guerlain",
    ],
    entityType: "fragrance",
    houseId: "guerlain",
    perfumerIds: ["pierre-francois-pascal-guerlain"],
    playNiceCatalogSlug: null,
    summary: {
      sr: "Eau de Cologne Impériale je Guerlain kreacija iz 1853. koju je Pierre-François-Pascal Guerlain napravio po posebnoj porudžbini za caricu Eugénie. Kuća je opisuje kao svoju prvu kolonjsku vodu i jednu od temeljnih istorijskih kreacija.",
      en: "Eau de Cologne Impériale is Guerlain's 1853 creation by Pierre-François-Pascal Guerlain, made as a special commission for Empress Eugénie. The house describes it as its first Eau de Cologne and one of its foundational historic creations.",
    },
    sources: [
      {
        label: "Guerlain — Eau de Cologne Impériale",
        url: "https://www.guerlain.com/us/en-us/p/les-colognes-eau-de-cologne-imperiale-021766.html",
        type: "brand-official",
      },
    ],
  },
  {
    id: "guerlain-jicky-1889",
    name: "Jicky",
    aliases: [
      "jicky",
      "guerlain jicky",
      "jiki",
      "guerlain jiki",
    ],
    entityType: "fragrance",
    houseId: "guerlain",
    perfumerIds: ["aime-guerlain"],
    playNiceCatalogSlug: null,
    summary: {
      sr: "Jicky je Guerlain parfem koji je Aimé Guerlain kreirao 1889. Kuća ga predstavlja kao prelomnu kompoziciju moderne parfimerije jer spaja prirodne materijale sa tada novim sintetičkim molekulama, posebno kumarinom i vanilinom.",
      en: "Jicky is the Guerlain fragrance created by Aimé Guerlain in 1889. The house presents it as a turning point in modern perfumery because it combines natural materials with then-new synthetic molecules, especially coumarin and vanillin.",
    },
    sources: [
      {
        label: "Guerlain — Jicky",
        url: "https://www.guerlain.com/fr/fr-fr/p/les-legendaires-jicky---eau-de-parfum-G014315.html",
        type: "brand-official",
      },
      {
        label: "Guerlain — Art of Fragrance",
        url: "https://www.guerlain.com/us/en-us/c/art-of-fragrance.html",
        type: "brand-official",
      },
    ],
  },
  {
    id: "guerlain-eau-de-cologne-du-coq-1894",
    name: "Eau de Cologne du Coq",
    aliases: [
      "eau de cologne du coq",
      "cologne du coq",
      "guerlain du coq",
      "du coq",
    ],
    entityType: "fragrance",
    houseId: "guerlain",
    perfumerIds: ["aime-guerlain"],
    playNiceCatalogSlug: null,
    summary: {
      sr: "Eau de Cologne du Coq je Guerlain kolonjsku vodu Aimé Guerlain kreirao 1894. Kuća je navodi kao njegovu interpretaciju klasične citrusno-aromatične eau de cologne strukture.",
      en: "Eau de Cologne du Coq is Guerlain's Eau de Cologne created by Aimé Guerlain in 1894. The house presents it as his interpretation of the classic citrus-aromatic Eau de Cologne structure.",
    },
    sources: [
      {
        label: "Guerlain — Eau de Cologne du Coq",
        url: "https://www.guerlain.com/int/en-int/p/les-colognes-eau-de-cologne-du-coq-021746.html",
        type: "brand-official",
      },
    ],
  },

  {
    id: "guerlain-lheure-bleue-1912",
    name: "L’Heure Bleue (1912)",
    aliases: [
      "l heure bleue",
      "lheure bleue",
      "guerlain l heure bleue",
      "guerlain lheure bleue",
      "l heure bleue 1912",
    ],
    entityType: "fragrance",
    houseId: "guerlain",
    perfumerIds: ["jacques-guerlain"],
    playNiceCatalogSlug: null,
    summary: {
      sr: "Originalni L’Heure Bleue kreirao je Jacques Guerlain 1912. Današnja kuća jasno razlikuje istorijsku kompoziciju od savremene reinterpretacije Eau de Parfum koju potpisuje Delphine Jelk, pa FI ne spaja ta dva autorstva.",
      en: "The original L’Heure Bleue was created by Jacques Guerlain in 1912. Guerlain now clearly distinguishes that historic composition from the contemporary Eau de Parfum reinterpretation by Delphine Jelk, so FI does not conflate the two authorships.",
    },
    sources: [
      {
        label: "Guerlain — L’Heure Bleue",
        url: "https://www.guerlain.com/fr/fr-fr/p/lheure-bleue-eau-de-parfum-P062450.html",
        type: "brand-official",
      },
    ],
  },
  {
    id: "guerlain-mitsouko-1919",
    name: "Mitsouko",
    aliases: [
      "mitsouko",
      "guerlain mitsouko",
      "mitsuko",
      "guerlain mitsuko",
    ],
    entityType: "fragrance",
    houseId: "guerlain",
    perfumerIds: ["jacques-guerlain"],
    playNiceCatalogSlug: null,
    summary: {
      sr: "Mitsouko je Guerlain kompozicija Jacquesa Guerlaina iz 1919, istorijski poznata po spoju chypre strukture i izražene note breskve. Guerlain je i danas navodi kao jednu od ključnih kreacija kuće.",
      en: "Mitsouko is Jacques Guerlain's 1919 composition for Guerlain, historically notable for combining a chypre structure with a pronounced peach note. Guerlain still presents it as one of the house's landmark creations.",
    },
    sources: [
      {
        label: "Guerlain — Mitsouko",
        url: "https://www.guerlain.com/us/en-us/p/les-legendaires-mitsouko---eau-de-parfum-024104.html",
        type: "brand-official",
      },
      {
        label: "Guerlain — House history",
        url: "https://www.guerlain.com/int/en-int/c/history-int.html",
        type: "brand-official",
      },
    ],
  },
  {
    id: "hermes-caleche-edt",
    name: "Calèche Eau de Toilette",
    aliases: [
      "caleche",
      "calèche",
      "hermes caleche",
      "hermès calèche",
      "caleche edt",
      "calèche eau de toilette",
    ],
    entityType: "fragrance",
    houseId: "hermes",
    perfumerIds: ["guy-robert"],
    playNiceCatalogSlug: null,
    summary: {
      sr: "Calèche je prvi ženski parfem kuće Hermès, komponovan 1961. od strane Guy Roberta. Hermès ga opisuje kao floralno-aldehidnu kompoziciju sa jasminom i ružom i svrstava ga u istorijsku kolekciju Parfums-Fondateurs.",
      en: "Calèche was Hermès' first fragrance for women, composed by Guy Robert in 1961. Hermès describes it as a floral aldehydic composition with jasmine and rose and places it in the historic Parfums-Fondateurs collection.",
    },
    sources: [
      {
        label: "Hermès — Calèche Eau de Toilette",
        url: "https://www.hermes.com/us/en/product/caleche-eau-de-toilette-V107391V0/",
        type: "brand-official",
      },
    ],
  },

  {
    id: "dior-diorissimo",
    name: "Diorissimo",
    aliases: [
      "diorissimo",
      "dior diorissimo",
      "christian dior diorissimo",
    ],
    entityType: "fragrance",
    houseId: "dior",
    perfumerIds: ["edmond-roudnitska"],
    playNiceCatalogSlug: null,
    summary: {
      sr: "Diorissimo je Dior klasik koji je Edmond Roudnitska komponovao 1956. Kuća ga opisuje kao izrazito realističan olfaktorni portret đurđevka, uz jasmin, ružu, ylang-ylang i akord zumbula.",
      en: "Diorissimo is a Dior classic composed by Edmond Roudnitska in 1956. The house describes it as a highly realistic olfactory portrait of lily of the valley, supported by jasmine, rose, ylang-ylang and a hyacinth accord.",
    },
    sources: [
      {
        label: "Dior — Diorissimo",
        url: "https://www.dior.com/fr_be/beauty/products/diorissimo-Y0000409.html",
        type: "brand-official",
      },
    ],
  },

  {
    id: "chanel-no5-parfum",
    name: "CHANEL N°5 Parfum",
    aliases: ["chanel no 5", "chanel n5", "n°5 parfum", "no 5 parfum", "chanel no5 parfum"],
    entityType: "fragrance",
    houseId: "chanel",
    perfumerIds: ["ernest-beaux"],
    playNiceCatalogSlug: null,
    summary: {
      sr: "Originalni CHANEL N°5 nastao je 1921. kada je Gabrielle Chanel zatražila od Ernesta Beauxa novu kompoziciju. Kuća ga opisuje kao revolucionaran aldehidno-cvetni parfem; kasniji N°5 Eau de Parfum iz 1986. je reinterpretacija Jacquesa Polgea i nije isto autorstvo kao originalni Parfum.",
      en: "The original CHANEL N°5 dates to 1921, when Gabrielle Chanel asked Ernest Beaux for a new composition. The house describes it as a revolutionary aldehydic floral; the later 1986 N°5 Eau de Parfum is Jacques Polge's reinterpretation and should not be conflated with the authorship of the original Parfum.",
    },
    sources: [
      {
        label: "CHANEL — N°5 Eau de Parfum / history",
        url: "https://www.chanel.com/us/fragrance/p/125230/n5-eau-de-parfum-spray/",
        type: "brand-official",
      },
    ],
  },
  {
    id: "guerlain-shalimar",
    name: "Shalimar",
    aliases: ["shalimar", "guerlain shalimar", "shalimar guerlain"],
    entityType: "fragrance",
    houseId: "guerlain",
    perfumerIds: ["jacques-guerlain"],
    playNiceCatalogSlug: null,
    summary: {
      sr: "Shalimar je Guerlain ikona koju je Jacques Guerlain kreirao 1925. Kuća ga opisuje kao istorijski amber parfem snažno vezan za bergamot, iris, jasmin, ružu, tonku i vanilu.",
      en: "Shalimar is a Guerlain icon created by Jacques Guerlain in 1925. The house describes it as a historic amber fragrance strongly associated with bergamot, iris, jasmine, rose, tonka bean and vanilla.",
    },
    sources: [
      {
        label: "Guerlain — Shalimar",
        url: "https://www.guerlain.com/us/en-us/c/shalimar.html",
        type: "brand-official",
      },
    ],
  },
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
