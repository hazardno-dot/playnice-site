/* =========================================
   STATIC LABELS / PRODUCTS
========================================= */
export const categoryLabels = {
  Arabian: { en: "Arabian", sr: "Arapski" },
  Designer: { en: "Designer", sr: "Dizajner" },
  Niche: { en: "Niche", sr: "Niche" }
};

export const products = [
    {
    id: 1,
    slug: "afnan-9am",
    name: "Afnan 9 AM Eau de Parfum",
    shortName: "9 AM",
    category: "Arabian",
    image: "/products/afnan-9am.png",
    sizes: { "5ml": 4, "10ml": 7, "20ml": 13 },
    badge: "FRESH DROP",
    rating: 7.8,
    ratingLabel: "Well Loved",
    season: "summer",
    moods: ["clean", "summer", "signature"],
    recommendations: [
      "rasasi-hawas-ice",
      "lattafa-maahir-legacy",
      "french-avenue-ravine-ice"
    ],
    inspiredBy: {
      name: "Maison Francis Kurkdjian Aqua Vitae Forte",
      short: "Aqua Vitae Forte DNA"
    },
    noteMap: {
      top: ["mandarin", "cedrat", "cardamom"],
      heart: ["lavender", "orange-blossom", "rose"],
      base: ["cedarwood", "moss", "patchouli"]
    }
  },
  {
    id: 2,
    slug: "afnan-9pm-rebel",
    name: "Afnan 9 PM Rebel Eau de Parfum",
    shortName: "9 PM Rebel",
    category: "Arabian",
    image: "/products/9pm.png",
    sizes: { "5ml": 4, "10ml": 7, "20ml": 13 },
    badge: "TRENDING",
    rating: 8.6,
    ratingLabel: "Audience Favorite",
    season: "winter",
    moods: ["date", "rich", "signature"],
    recommendations: [
      "afnan-supremacy-collectors-edition",
      "armaf-club-de-nuit-intense",
      "lattafa-khamrah-qahwa"
    ],
    inspiredBy: {
      name: "Creed Aventus and Maison Francis Kurkdjian Baccarat Rouge 540",
      short: "Aventus / BR540 DNA"
    },
    noteMap: {
      top: ["mandarin", "pineapple", "green-apple"],
      heart: ["cedarwood", "oakmoss", "vanilla"],
      base: ["caramel", "dry-woods", "ambergris"]
    }
  },
  {
    id: 3,
    slug: "afnan-supremacy-collectors-edition",
    name: "Afnan Supremacy Collector's Edition Pour Homme Eau de Parfum",
    shortName: "Supremacy Collector's",
    category: "Arabian",
    image: "/products/afnan-supremacy.png",
    sizes: { "5ml": 5, "10ml": 9, "20ml": 17 },
    badge: "BESTSELLER",
    rating: 8.1,
    ratingLabel: "Audience Favorite",
    season: "all",
    moods: ["signature", "rich", "date"],
    recommendations: [
      "armaf-club-de-nuit-intense",
      "armaf-club-de-nuit-precieux-i",
      "creed-aventus-cologne"
    ],
    inspiredBy: {
      name: "Creed Absolu Aventus",
      short: "Absolu Aventus DNA"
    },
    noteMap: {
      top: ["pineapple", "bergamot", "apple"],
      heart: ["orange-blossom", "birch", "amber"],
      base: ["oakmoss", "musk", "ambergris"]
    }
  },
  {
    id: 4,
    slug: "afnan-turathi-blue",
    name: "Afnan Turathi Blue Homme Eau de Parfum",
    shortName: "Turathi Blue",
    category: "Arabian",
    image: "/products/afnan-turathi-blue.png",
    sizes: { "5ml": 5, "10ml": 9, "20ml": 17 },
    badge: "TRENDING",
    rating: 8.9,
    ratingLabel: "Audience Favorite",
    season: "summer",
    moods: ["clean", "summer", "signature"],
    recommendations: [
      "bleu-de-chanel-edp",
      "khadlaj-onyx-silver",
      "essential-parfums-nice-bergamote"
    ],
    inspiredBy: {
      name: "Bvlgari Tygar",
      short: "Tygar DNA"
    },
    noteMap: {
      top: ["bergamot", "mandarin"],
      heart: ["amber", "woody-notes"],
      base: ["musk", "patchouli", "fresh-spices"]
    }
  },
  {
    id: 5,
    slug: "arabiyat-prestige-marwa",
    name: "Arabiyat Prestige Marwa Eau de Parfum",
    shortName: "Prestige Marwa",
    category: "Arabian",
    image: "/products/marwa.png",
    sizes: { "5ml": 4.5, "10ml": 8, "20ml": 15 },
    badge: "CROWD FAVORITE",
    rating: 8.0,
    ratingLabel: "Audience Favorite",
    season: "summer",
    moods: ["clean", "summer", "signature"],
    recommendations: [
      "khadlaj-island-dreams",
      "mawj-moscow-mule",
      "khadlaj-shiyaaka-snow-edp"
    ],
    inspiredBy: {
      name: "Louis Vuitton Imagination",
      short: "Imagination DNA"
    },
    noteMap: {
      top: ["bergamot", "petitgrain", "ginger"],
      heart: ["geranium", "black-tea", "incense"],
      base: ["guaiac-wood", "ambroxan", "musk"]
    }
  },
  {
    id: 6,
    slug: "armaf-club-de-nuit-bling",
    name: "Armaf Club de Nuit Bling Eau de Parfum",
    shortName: "CDN Bling",
    category: "Arabian",
    image: "/products/Bling.png",
    sizes: { "5ml": 6, "10ml": 11, "20ml": 20 },
    badge: "ARABIAN GEM",
    rating: 7.7,
    ratingLabel: "Well Loved",
    season: "winter",
    moods: ["date", "rich", "signature"],
    recommendations: [
      "ysl-myslf-edp",
      "gisada-ambassador-men",
      "armaf-club-de-nuit-sillage"
    ],
    inspiredBy: {
      name: "Original Armaf creation",
      short: "Fruity Floral DNA"
    },
    noteMap: {
      top: ["citruses"],
      heart: ["flower-prism", "stardust"],
      base: ["vanilla", "velvet-wood"]
    }
  },
  {
    id: 7,
    slug: "armaf-club-de-nuit-intense",
    name: "Armaf Club de Nuit Intense Man Eau de Toilette",
    shortName: "CDN Intense Man",
    category: "Arabian",
    image: "/products/armaf-cdn-intense.png",
    sizes: { "5ml": 4, "10ml": 7, "20ml": 13 },
    badge: "BESTSELLER",
    rating: 8.8,
    ratingLabel: "Audience Favorite",
    season: "all",
    moods: ["signature", "date", "rich"],
    recommendations: [
      "creed-aventus-cologne",
      "afnan-supremacy-collectors-edition",
      "armaf-club-de-nuit-precieux-i"
    ],
    inspiredBy: {
      name: "Creed Aventus",
      short: "Aventus DNA"
    },
    noteMap: {
      top: ["lemon", "pineapple", "bergamot"],
      heart: ["rose", "birch", "jasmine"],
      base: ["musk", "ambergris", "patchouli"]
    }
  },
  {
    id: 8,
    slug: "armaf-club-de-nuit-sillage",
    name: "Armaf Club de Nuit Sillage Eau de Parfum",
    shortName: "CDN Sillage",
    category: "Arabian",
    image: "/products/CDN-Sillage.png",
    sizes: { "5ml": 4, "10ml": 7, "20ml": 13 },
    badge: "FRESH DROP",
    rating: 8.0,
    ratingLabel: "Audience Favorite",
    season: "summer",
    moods: ["clean", "summer", "signature"],
    recommendations: [
      "acqua-di-parma-colonia-essenza",
      "bois-imperial-essential-parfums",
      "armaf-club-de-nuit-bling"
    ],
    inspiredBy: {
      name: "Creed Silver Mountain Water",
      short: "Silver Mountain Water DNA"
    },
    noteMap: {
      top: ["bergamot", "lemon", "lime"],
      heart: ["jasmine", "iris", "rose"],
      base: ["sandalwood", "musk", "ambroxan"]
    }
  },
  {
    id: 9,
    slug: "french-avenue-vulcan-sable",
    name: "French Avenue Vulcan Sable Eau de Parfum",
    shortName: "Vulcan Sable",
    category: "Arabian",
    image: "/products/Vulcan-Sable.png",
    sizes: { "5ml": 5, "10ml": 9, "20ml": 17 },
    badge: "HIDDEN GEM",
    rating: 7.9,
    ratingLabel: "Well Loved",
    season: "winter",
    moods: ["rich", "date", "signature"],
    recommendations: [
      "tom-ford-noir-extreme",
      "lattafa-musamam-black-intense",
      "lattafa-khamrah-qahwa"
    ],
    inspiredBy: {
      name: "Stéphane Humbert Lucas 777 Sand Dance",
      short: "Sand Dance DNA"
    },
    noteMap: {
      top: ["whiskey", "coriander", "mandarin"],
      heart: ["sandalwood", "cashmeran"],
      base: ["tonka-bean", "benzoin", "vanilla"]
    }
  },
  {
    id: 10,
    slug: "haramain-signature-blue",
    name: "Haramain Signature Blue Eau de Parfum",
    shortName: "Signature Blue",
    category: "Arabian",
    image: "/products/Haramain-Signature-Blue.png",
    sizes: { "5ml": 3, "10ml": 5, "20ml": 10 },
    badge: "STAFF PICK",
    rating: 7.4,
    ratingLabel: "Popular Pick",
    season: "summer",
    moods: ["clean", "summer", "signature"],
    recommendations: [
      "bleu-de-chanel-edp",
      "rayhaan-nocturno-elixir",
      "lattafa-fakhar-black"
    ],
    inspiredBy: {
      name: "Bleu de Chanel Eau de Toilette",
      short: "Bleu de Chanel EDT DNA"
    },
    noteMap: {
      top: ["lemon", "bergamot", "grapefruit"],
      heart: ["geranium"],
      base: ["cedarwood", "vetiver", "patchouli"]
    }
  },
    {
    id: 11,
    slug: "khadlaj-island-dreams",
    name: "Khadlaj Island Dreams Extrait de Parfum",
    shortName: "Island Dreams",
    category: "Arabian",
    image: "/products/island.png",
    sizes: { "5ml": 4.5, "10ml": 8, "20ml": 15 },
    badge: "SUMMER HIT",
    rating: 8.7,
    ratingLabel: "Audience Favorite",
    season: "summer",
    moods: ["clean", "summer", "signature"],
    recommendations: [
      "arabiyat-prestige-marwa",
      "french-avenue-pinnace-oryn",
      "khadlaj-shiyaaka-snow-edp"
    ],
    inspiredBy: {
      name: "Louis Vuitton Symphony",
      short: "Symphony DNA"
    },
    noteMap: {
      top: ["bergamot", "ginger"],
      heart: ["grapefruit"],
      base: ["ambroxan", "musk"]
    }
  },
  {
    id: 12,
    slug: "lattafa-asad-elixir",
    name: "Lattafa Asad Elixir Eau de Parfum",
    shortName: "Asad Elixir",
    category: "Arabian",
    image: "/products/Lattafa-Asad-Elixir.png",
    sizes: { "5ml": 4.5, "10ml": 8, "20ml": 15 },
    badge: "SIGNATURE",
    rating: 8.4,
    ratingLabel: "Audience Favorite",
    season: "winter",
    moods: ["rich", "date", "signature"],
    recommendations: [
      "boss-the-scent-elixir",
      "tom-ford-noir-extreme",
      "rayhaan-crimson"
    ],
    inspiredBy: {
      name: "BOSS Bottled Absolu Parfum Intense",
      short: "Bottled Absolu DNA"
    },
    noteMap: {
      top: ["pink-pepper", "saffron", "grapefruit"],
      heart: ["tobacco", "cedarwood", "vanilla"],
      base: ["patchouli", "olibanum", "cashmeran"]
    }
  },
  {
    id: 13,
    slug: "lattafa-fakhar-black",
    name: "Lattafa Fakhar Black Eau de Parfum",
    shortName: "Fakhar Black",
    category: "Arabian",
    image: "/products/Lattafa-Fakhar-Black.png",
    sizes: { "5ml": 4, "10ml": 7, "20ml": 13 },
    badge: "CROWD FAVORITE",
    rating: 8.0,
    ratingLabel: "Audience Favorite",
    season: "all",
    moods: ["clean", "signature", "date"],
    recommendations: [
      "bleu-de-chanel-edp",
      "rayhaan-nocturno-elixir",
      "rasasi-hawas-ice"
    ],
    inspiredBy: {
      name: "Yves Saint Laurent Y Eau de Parfum",
      short: "Y Eau de Parfum DNA"
    },
    noteMap: {
      top: ["apple", "bergamot", "ginger"],
      heart: ["lavender", "sage", "juniper-berries"],
      base: ["tonka-bean", "cedarwood", "amberwood"]
    }
  },
  {
    id: 14,
    slug: "lattafa-khamrah-qahwa",
    name: "Lattafa Khamrah Qahwa Eau de Parfum",
    shortName: "Khamrah Qahwa",
    category: "Arabian",
    image: "/products/Lattafa-Khamrah-Qahwa.png",
    sizes: { "5ml": 5, "10ml": 9, "20ml": 17 },
    badge: "ARABIAN GEM",
    rating: 9.0,
    ratingLabel: "Top Rated",
    season: "winter",
    moods: ["rich", "date", "soft"],
    recommendations: [
      "afnan-9pm-night-out",
      "tom-ford-noir-extreme",
      "swiss-arabian-tobacco-01"
    ],
    inspiredBy: {
      name: "Original Lattafa creation",
      short: "Coffee Gourmand DNA"
    },
    noteMap: {
      top: ["ginger", "cinnamon", "cardamom"],
      heart: ["praline", "candied-fruits", "white-flowers"],
      base: ["coffee-arabica", "tonka-bean", "musk"]
    }
  },
  {
    id: 15,
    slug: "lattafa-musamam-black-intense",
    name: "Lattafa Musamam Black Intense Eau de Parfum",
    shortName: "Musamam Black Intense",
    category: "Arabian",
    image: "/products/Lattafa-Musamam-Black-Intense.png",
    sizes: { "5ml": 5, "10ml": 9, "20ml": 17 },
    badge: "ARABIAN GEM",
    rating: 7.8,
    ratingLabel: "Well Loved",
    season: "winter",
    moods: ["rich", "date", "signature"],
    recommendations: [
      "french-avenue-vulcan-sable",
      "arabiyat-prestige-fahad-gaze",
      "lattafa-asad-elixir"
    ],
    inspiredBy: {
      name: "Original Lattafa creation",
      short: "Spicy Woody DNA"
    },
    noteMap: {
      top: ["lavender", "nutmeg", "bergamot"],
      heart: ["geranium", "rosyfolia", "mahonial"],
      base: ["maple-wood", "cocoapulse", "ambrofix"]
    }
  },
  {
    id: 16,
    slug: "lattafa-qaed-al-fursan-untamed",
    name: "Lattafa Qaed Al Fursan Untamed Eau de Parfum",
    shortName: "Qaed Al Fursan Untamed",
    category: "Arabian",
    image: "/products/Lattafa-Qaed-Al-Fursan-Untamed.png",
    sizes: { "5ml": 3, "10ml": 5, "20ml": 10 },
    badge: "SIGNATURE",
    rating: 7.5,
    ratingLabel: "Well Loved",
    season: "all",
    moods: ["signature", "date", "rich"],
    recommendations: [
      "valentino-uomo-born-in-roma-coral-fantasy",
      "afnan-9pm-rebel",
      "rayhaan-crimson"
    ],
    inspiredBy: {
      name: "Versace Eros Najim Parfum",
      short: "Eros Najim DNA"
    },
    noteMap: {
      top: ["nutmeg", "cardamom", "mandarin"],
      heart: ["lavender", "clary-sage", "caramel"],
      base: ["cedarwood", "olibanum", "labdanum"]
    }
  },
  {
    id: 17,
    slug: "emir-trillium",
    name: "Paris Corner Emir Trillium Eau de Parfum",
    shortName: "Emir Trillium",
    category: "Arabian",
    image: "/products/Emir-Trillium.png",
    sizes: { "5ml": 4, "10ml": 7, "20ml": 13 },
    badge: "SUMMER HIT",
    rating: 7.6,
    ratingLabel: "Well Loved",
    season: "summer",
    moods: ["clean", "summer", "signature"],
    recommendations: [
      "emir-voux-zingy",
      "creed-aventus-cologne",
      "acqua-di-parma-colonia-essenza"
    ],
    inspiredBy: {
      name: "Roja Parfums Elysium Pour Homme Parfum Cologne",
      short: "Elysium DNA"
    },
    noteMap: {
      top: ["grapefruit", "bergamot", "thyme"],
      heart: ["vetiver", "juniper-berries", "black-currant"],
      base: ["ambergris", "leather", "vanilla"]
    }
  },
  {
    id: 18,
    slug: "emir-voux-elegante",
    name: "Paris Corner Emir Voux Elegante Eau de Parfum",
    shortName: "Voux Elegante",
    category: "Arabian",
    image: "/products/Emir-Voux-Elegante.png",
    sizes: { "5ml": 4, "10ml": 7, "20ml": 13 },
    badge: "CROWD FAVORITE",
    rating: 7.7,
    ratingLabel: "Well Loved",
    season: "winter",
    moods: ["rich", "date", "signature"],
    recommendations: [
      "swiss-arabian-tobacco-01",
      "tom-ford-noir-extreme",
      "givenchy-gentleman-reserve-privee"
    ],
    inspiredBy: {
      name: "Xerjoff Naxos",
      short: "Naxos DNA"
    },
    noteMap: {
      top: ["lavender", "bergamot"],
      heart: ["honey", "cashmeran", "cinnamon"],
      base: ["tobacco", "tonka-bean", "vanilla"]
    }
  },
  {
    id: 19,
    slug: "ministry-of-oud-oud-satin",
    name: "Paris Corner Ministry of Oud Oud Satin Extrait de Parfum",
    shortName: "Oud Satin",
    category: "Arabian",
    image: "/products/Ministry-of-Oud-Oud-Satin.png",
    sizes: { "5ml": 4, "10ml": 7, "20ml": 13 },
    badge: "HIDDEN GEM",
    rating: 8.1,
    ratingLabel: "Audience Favorite",
    season: "winter",
    moods: ["rich", "date", "soft"],
    recommendations: [
      "narciso-rodriguez-poudree",
      "ysl-black-opium-le-parfum",
      "chopard-oud-malaki"
    ],
    inspiredBy: {
      name: "Maison Francis Kurkdjian Oud Satin Mood Eau de Parfum",
      short: "Oud Satin Mood DNA"
    },
    noteMap: {
      top: ["oud", "rose"],
      heart: ["benzoin", "rose"],
      base: ["violet", "vanilla"]
    }
  },
  {
    id: 20,
    slug: "north-stag-expressions-ii-deux",
    name: "Paris Corner North Stag Expressions II Deux Extrait de Parfum",
    shortName: "North Stag II Deux",
    category: "Arabian",
    image: "/products/II-DEUX.png",
    sizes: { "5ml": 4, "10ml": 7, "20ml": 13 },
    badge: "ARABIAN GEM",
    rating: 7.9,
    ratingLabel: "Well Loved",
    season: "winter",
    moods: ["rich", "date", "signature"],
    recommendations: [
      "valentino-uomo-born-in-roma-coral-fantasy",
      "boss-the-scent-le-parfum",
      "afnan-9pm-night-out"
    ],
    inspiredBy: {
      name: "Parfums de Marly Layton",
      short: "Layton DNA"
    },
    noteMap: {
      top: ["apple", "lavender", "bergamot"],
      heart: ["geranium", "violet", "jasmine"],
      base: ["vanilla", "cardamom", "sandalwood"]
    }
  },
    {
    id: 21,
    slug: "rayhaan-aquatica",
    name: "Rayhaan Aquatica Eau de Parfum",
    shortName: "Aquatica",
    category: "Arabian",
    image: "/products/Rayhaan-AQUTICA.png",
    sizes: { "5ml": 4.5, "10ml": 8, "20ml": 15 },
    badge: "CROWD FAVORITE",
    rating: 7.8,
    ratingLabel: "Well Loved",
    season: "summer",
    moods: ["clean", "summer", "soft"],
    recommendations: [
      "jean-paul-gaultier-le-beau-edt",
      "rayhaan-pacific-aura",
      "khadlaj-island-dreams"
    ],
    inspiredBy: {
      name: "Creed Virgin Island Water",
      short: "Virgin Island Water DNA"
    },
    noteMap: {
      top: ["coconut", "lime", "bergamot", "mandarin"],
      heart: ["ginger", "ylang-ylang", "jasmine", "hibiscus"],
      base: ["white-rum", "sugar-cane", "musk"]
    }
  },
  {
    id: 22,
    slug: "rayhaan-pacific-aura",
    name: "Rayhaan Pacific Aura Eau de Parfum",
    shortName: "Pacific Aura",
    category: "Arabian",
    image: "/products/Rayhaan-Pacific-Aura.png",
    sizes: { "5ml": 4.5, "10ml": 8, "20ml": 15 },
    badge: "SUMMER HIT",
    rating: 7.9,
    ratingLabel: "Well Loved",
    season: "summer",
    moods: ["clean", "summer", "soft"],
    recommendations: [
      "french-avenue-safari-breeze",
      "rasasi-hawas-ice",
      "acqua-di-parma-fico-di-amalfi"
    ],
    inspiredBy: {
      name: "Louis Vuitton Pacific Chill",
      short: "Pacific Chill DNA"
    },
    noteMap: {
      top: [
        "citron",
        "mint",
        "orange",
        "lemon",
        "black-currant",
        "coriander"
      ],
      heart: ["apricot", "basil", "carrot-seeds", "may-rose"],
      base: ["fig", "dates", "ambrette"]
    }
  },
  {
    id: 23,
    slug: "swiss-arabian-tobacco-01",
    name: "Swiss Arabian Tobacco 01 Extrait de Parfum",
    shortName: "Tobacco 01",
    category: "Arabian",
    image: "/products/Swiss-Arabian-Tobacco01.png",
    sizes: { "2ml": 4.5, "5ml": 10, "10ml": 18 },
    badge: "TOP RATED",
    rating: 8.5,
    ratingLabel: "Audience Favorite",
    season: "winter",
    moods: ["rich", "date", "signature"],
    recommendations: [
      "emir-voux-elegante",
      "chopard-oud-malaki",
      "tom-ford-noir-extreme"
    ],
    inspiredBy: {
      name: "Original Swiss Arabian creation",
      short: "Sweet Spicy Tobacco DNA"
    },
    noteMap: {
      top: ["plum", "apple", "cumin", "pink-pepper", "licorice"],
      heart: ["labdanum", "amber", "ylang-ylang", "patchouli"],
      base: [
        "musk",
        "cashmere",
        "honey",
        "vanilla",
        "sandalwood",
        "tobacco"
      ]
    }
  },
  {
    id: 24,
    slug: "acqua-di-parma-fico-di-amalfi",
    name: "Acqua di Parma Blu Mediterraneo Fico di Amalfi Eau de Toilette",
    shortName: "Fico di Amalfi",
    category: "Niche",
    image: "/products/AdP-Fico.png",
    sizes: { "2ml": 6.5, "5ml": 15, "10ml": 27 },
    badge: "BESTSELLER",
    rating: 8.3,
    ratingLabel: "Audience Favorite",
    season: "summer",
    moods: ["clean", "summer", "soft"],
    recommendations: [
      "emir-voux-zingy",
      "essential-parfums-nice-bergamote",
      "french-avenue-safari-breeze"
    ],
    inspiredBy: {
      name: "Original Acqua di Parma creation",
      short: "Mediterranean Fig Citrus DNA"
    },
    noteMap: {
      top: ["italian-lemon", "italian-bergamot", "grapefruit"],
      heart: ["fig-nectar", "pink-pepper", "jasmine-petals"],
      base: ["fig-wood", "cedarwood", "benzoin"]
    }
  },
  {
    id: 25,
    slug: "acqua-di-parma-colonia-essenza",
    name: "Acqua di Parma Colonia Essenza Eau de Cologne",
    shortName: "Colonia Essenza",
    category: "Niche",
    image: "/products/AdP-Colonia-Essenza.png",
    sizes: { "2ml": 7, "5ml": 16, "10ml": 29 },
    badge: "LUXURY PICK",
    rating: 8.0,
    ratingLabel: "Audience Favorite",
    season: "summer",
    moods: ["clean", "summer", "signature"],
    recommendations: [
      "acqua-di-parma-colonia-pura",
      "terre-d-hermes-edt",
      "essential-parfums-nice-bergamote"
    ],
    inspiredBy: {
      name: "Original Acqua di Parma creation",
      short: "Citrus Woody Cologne DNA"
    },
    noteMap: {
      top: [
        "lemon",
        "orange",
        "bergamot",
        "mandarin",
        "grapefruit",
        "neroli",
        "petitgrain"
      ],
      heart: [
        "rosemary",
        "lily-of-the-valley",
        "rose",
        "jasmine",
        "cloves"
      ],
      base: ["vetiver", "patchouli", "white-musk", "amber"]
    },
    discount: {
      size: "5ml",
      percent: 15
    }
  },
  {
    id: 26,
    slug: "acqua-di-parma-colonia-pura",
    name: "Acqua di Parma Colonia Pura Eau de Cologne",
    shortName: "Colonia Pura",
    category: "Niche",
    image: "/products/AdP-Colonia-Pura.png",
    sizes: { "2ml": 6.5, "5ml": 15, "10ml": 27 },
    badge: "LUXURY PICK",
    rating: 7.8,
    ratingLabel: "Well Loved",
    season: "summer",
    moods: ["clean", "summer", "soft"],
    recommendations: [
      "acqua-di-parma-colonia-essenza",
      "calvin-klein-ck-all",
      "essential-parfums-nice-bergamote"
    ],
    inspiredBy: {
      name: "Original Acqua di Parma creation",
      short: "Fresh Citrus Musk DNA"
    },
    noteMap: {
      top: ["italian-bergamot", "italian-orange", "petitgrain"],
      heart: ["coriander-oil", "jasmine-sambac", "narcissus"],
      base: ["cedarwood", "patchouli", "musk"]
    }
  },
  {
    id: 27,
    slug: "bleu-de-chanel-edp",
    name: "Bleu de Chanel Eau de Parfum",
    shortName: "Bleu de Chanel",
    category: "Designer",
    image: "/products/BDC-EdP.png",
    sizes: { "2ml": 6.5, "5ml": 15, "10ml": 27 },
    badge: "BESTSELLER",
    rating: 9.2,
    ratingLabel: "Top Rated",
    season: "all",
    moods: ["signature", "clean", "date"],
    recommendations: [
      "rayhaan-nocturno-elixir",
      "afnan-turathi-blue",
      "prada-luna-rossa-ocean-edt"
    ],
    inspiredBy: {
      name: "Original Chanel creation",
      short: "Blue Aromatic Woody DNA"
    },
    noteMap: {
      top: ["grapefruit", "lemon", "mint"],
      heart: ["ginger", "nutmeg", "jasmine"],
      base: ["incense", "cedarwood", "sandalwood"]
    }
  },
  {
    id: 28,
    slug: "bois-imperial-essential-parfums",
    name: "Essential Parfums Bois Impérial Eau de Parfum",
    shortName: "Bois Impérial",
    category: "Niche",
    image: "/products/Bois-Impérial-by-Essential-Parfums.png",
    sizes: { "2ml": 4, "5ml": 9, "10ml": 16 },
    badge: "EDITOR'S CHOICE",
    rating: 8.9,
    ratingLabel: "Audience Favorite",
    season: "all",
    moods: ["signature", "clean", "rich"],
    recommendations: [
      "khadlaj-onyx-silver",
      "mancera-cedrat-boise",
      "essential-parfums-orange-x-santal"
    ],
    inspiredBy: {
      name: "Original Essential Parfums creation",
      short: "Modern Woody Spice DNA"
    },
    noteMap: {
      top: ["thai-basil", "timut-pepper"],
      heart: ["haitian-vetiver", "georgywood", "petalia"],
      base: ["akigalawood", "indonesian-patchouli", "ambrofix"]
    }
  },
  {
    id: 29,
    slug: "boss-bottled-beyond",
    name: "BOSS Bottled Beyond Eau de Parfum",
    shortName: "Bottled Beyond",
    category: "Designer",
    image: "/products/BOSS-Bottled-Beyond.png",
    sizes: { "2ml": 5.5, "5ml": 13, "10ml": 23 },
    badge: "TRENDING",
    rating: 7.7,
    ratingLabel: "Well Loved",
    season: "all",
    moods: ["signature", "date", "rich"],
    recommendations: [
      "boss-the-scent-elixir",
      "boss-the-scent-le-parfum",
      "ysl-lhomme-edp"
    ],
    inspiredBy: {
      name: "Original BOSS creation",
      short: "Ginger Leather DNA"
    },
    noteMap: {
      top: ["ginger"],
      heart: ["leather"],
      base: ["woody-notes"]
    },
    discount: {
      size: "10ml",
      percent: 15
    }
  },
  {
    id: 30,
    slug: "boss-the-scent-elixir",
    name: "BOSS The Scent Elixir Parfum Intense for Him",
    shortName: "The Scent Elixir",
    category: "Designer",
    image: "/products/BOSS-The-Scent-Elixir.png",
    sizes: { "2ml": 6.5, "5ml": 15, "10ml": 27 },
    badge: "LUXURY PICK",
    rating: 8.1,
    ratingLabel: "Audience Favorite",
    season: "winter",
    moods: ["date", "rich", "signature"],
    recommendations: [
      "boss-the-scent-le-parfum",
      "lattafa-asad-elixir",
      "rayhaan-crimson"
    ],
    inspiredBy: {
      name: "Original BOSS creation",
      short: "Spicy Ambery Woods DNA"
    },
    noteMap: {
      top: ["pimento"],
      heart: ["lavandin"],
      base: ["sandalwood"]
    }
  },
    {
    id: 31,
    slug: "boss-the-scent-le-parfum",
    name: "BOSS The Scent Le Parfum for Him",
    shortName: "The Scent Le Parfum",
    category: "Designer",
    image: "/products/BOSS-The-Scent-Le-Parfum.png",
    sizes: { "2ml": 6, "5ml": 14, "10ml": 25 },
    badge: "HIDDEN GEM",
    rating: 7.9,
    ratingLabel: "Well Loved",
    season: "winter",
    moods: ["date", "soft", "rich"],
    recommendations: [
      "boss-the-scent-elixir",
      "dolce-gabbana-the-one-for-men-edt",
      "givenchy-gentleman-reserve-privee"
    ],
    inspiredBy: {
      name: "Original BOSS creation",
      short: "Ambery Iris Leather DNA"
    },
    noteMap: {
      top: ["maninka"],
      heart: ["iris"],
      base: ["leather"]
    }
  },
  {
    id: 32,
    slug: "calvin-klein-ck-all",
    name: "Calvin Klein CK All Eau de Toilette",
    shortName: "CK All",
    category: "Designer",
    image: "/products/CK-All.png",
    sizes: { "2ml": 2.5, "5ml": 6, "10ml": 11 },
    badge: "STAFF PICK",
    rating: 7.3,
    ratingLabel: "Popular Pick",
    season: "summer",
    moods: ["clean", "summer", "soft"],
    recommendations: [
      "acqua-di-parma-colonia-pura",
      "essential-parfums-nice-bergamote",
      "rayhaan-azul-edp"
    ],
    inspiredBy: {
      name: "Original Calvin Klein creation",
      short: "Fresh Citrus Musk DNA"
    },
    noteMap: {
      top: ["bergamot", "mandarin", "grapefruit-blossom"],
      heart: ["jasmine", "rhubarb", "freesia", "lily"],
      base: ["musk", "amber", "vetiver"]
    }
  },
  {
    id: 33,
    slug: "calvin-klein-defy-edt",
    name: "Calvin Klein Defy Eau de Toilette",
    shortName: "Defy EDT",
    category: "Designer",
    image: "/products/CK-Defy-EdT.png",
    sizes: { "2ml": 3, "5ml": 7, "10ml": 12 },
    badge: "FRESH DROP",
    rating: 7.5,
    ratingLabel: "Well Loved",
    season: "summer",
    moods: ["clean", "signature", "summer"],
    recommendations: [
      "calvin-klein-defy-parfum",
      "prada-luna-rossa-ocean-edt",
      "jimmy-choo-man-blue"
    ],
    inspiredBy: {
      name: "Original Calvin Klein creation",
      short: "Fresh Aromatic Woods DNA"
    },
    noteMap: {
      top: ["bergamot", "mandarin", "cedar-leaf"],
      heart: ["lavender", "clary-sage", "violet-leaf"],
      base: ["vetiver", "amber", "musk"]
    }
  },
  {
    id: 34,
    slug: "calvin-klein-defy-parfum",
    name: "Calvin Klein Defy Parfum",
    shortName: "Defy Parfum",
    category: "Designer",
    image: "/products/CK-Defy-Parfum.png",
    sizes: { "2ml": 4.5, "5ml": 10, "10ml": 18 },
    badge: "HIDDEN GEM",
    rating: 7.6,
    ratingLabel: "Well Loved",
    season: "winter",
    moods: ["signature", "date", "soft"],
    recommendations: [
      "calvin-klein-defy-edt",
      "prada-paradigme-edp",
      "narciso-rodriguez-for-him-bleu-noir-edp"
    ],
    inspiredBy: {
      name: "Original Calvin Klein creation",
      short: "Aromatic Sandalwood DNA"
    },
    noteMap: {
      top: ["mandarin", "pink-pepper", "cardamom"],
      heart: ["lavender", "geranium", "ginger"],
      base: ["cocoa-shell", "vetiver", "sandalwood"]
    }
  },
  {
    id: 35,
    slug: "chopard-oud-malaki",
    name: "Chopard Oud Malaki Eau de Parfum",
    shortName: "Oud Malaki",
    category: "Designer",
    image: "/products/Chopard-Oud-Malaki-EdP.png",
    sizes: { "2ml": 5.5, "5ml": 13, "10ml": 23 },
    badge: "TOP RATED",
    rating: 8.0,
    ratingLabel: "Audience Favorite",
    season: "winter",
    moods: ["rich", "date", "signature"],
    recommendations: [
      "swiss-arabian-tobacco-01",
      "emir-voux-elegante",
      "bvlgari-man-in-black-edp"
    ],
    inspiredBy: {
      name: "Original Chopard creation",
      short: "Oud Tobacco Leather DNA"
    },
    noteMap: {
      top: ["grapefruit", "lavender", "artemisia"],
      heart: ["tobacco", "spices", "leather"],
      base: ["oud", "dark-woods", "ambergris"]
    }
  },
  {
    id: 36,
    slug: "creed-aventus-cologne",
    name: "Creed Aventus Cologne Eau de Parfum",
    shortName: "Aventus Cologne",
    category: "Niche",
    image: "/products/Creed-Aventus-Cologne.png",
    sizes: { "2ml": 13, "5ml": 29, "10ml": 52 },
    badge: "LUXURY PICK",
    rating: 9.3,
    ratingLabel: "Top Rated",
    season: "summer",
    moods: ["clean", "summer", "signature"],
    recommendations: [
      "armaf-club-de-nuit-intense",
      "mancera-cedrat-boise",
      "afnan-supremacy-collectors-edition"
    ],
    inspiredBy: {
      name: "Original Creed creation",
      short: "Fresh Aventus DNA"
    },
    noteMap: {
      top: [
        "calabrian-bergamot",
        "mandarin",
        "salty-marine-accord"
      ],
      heart: ["ginger", "pineapple", "pink-pepper"],
      base: ["musk", "patchouli", "birch"]
    }
  },
  {
    id: 37,
    slug: "giorgio-armani-acqua-di-gio-profondo-parfum",
    name: "Giorgio Armani Acqua di Giò Profondo Parfum",
    shortName: "ADG Profondo Parfum",
    category: "Designer",
    image: "/products/AcquadiGiò-Profondo-Parfum.png",
    sizes: { "2ml": 6.5, "5ml": 15, "10ml": 27 },
    badge: "FRESH DROP",
    rating: 8.8,
    ratingLabel: "Audience Favorite",
    season: "summer",
    moods: ["clean", "summer", "signature"],
    recommendations: [
      "lattafa-suqraat-edp",
      "rasasi-hawas-ice",
      "thomas-kosmala-no7-le-sel-de-la-terre"
    ],
    inspiredBy: {
      name: "Original Giorgio Armani creation",
      short: "Deep Marine Aromatic DNA"
    },
    noteMap: {
      top: ["marine-notes", "green-mandarin"],
      heart: ["mimosa"],
      base: ["patchouli", "labdanum"]
    }
  },
  {
    id: 38,
    slug: "gisada-ambassador-men",
    name: "Gisada Ambassador Men Eau de Parfum",
    shortName: "Ambassador Men",
    category: "Designer",
    image: "/products/Gisada-Ambassador-Men-EdP.png",
    sizes: { "2ml": 5, "5ml": 11, "10ml": 20 },
    badge: "EDITOR'S CHOICE",
    rating: 8.6,
    ratingLabel: "Audience Favorite",
    season: "winter",
    moods: ["date", "rich", "signature"],
    recommendations: [
      "montblanc-explorer-extreme",
      "armaf-club-de-nuit-bling",
      "afnan-9pm-rebel"
    ],
    inspiredBy: {
      name: "Original Gisada creation",
      short: "Sweet Fruity Aromatic DNA"
    },
    noteMap: {
      top: [
        "green-mandarin",
        "apple",
        "cardamom",
        "violet"
      ],
      heart: [
        "mango",
        "lavender",
        "black-pepper",
        "patchouli",
        "peony"
      ],
      base: [
        "vanilla",
        "amber",
        "teak-wood",
        "vetiver",
        "moss"
      ]
    }
  },
  {
    id: 39,
    slug: "givenchy-gentleman-reserve-privee",
    name: "Givenchy Gentleman Réserve Privée Eau de Parfum",
    shortName: "Gentleman Réserve Privée",
    category: "Designer",
    image: "/products/Givenchy-Gentleman-EdP-Réserve-Privée.png",
    sizes: { "2ml": 5, "5ml": 12, "10ml": 21 },
    badge: "LUXURY PICK",
    rating: 8.7,
    ratingLabel: "Audience Favorite",
    season: "winter",
    moods: ["rich", "date", "soft"],
    recommendations: [
      "lhomme-ideal-guerlain-edt",
      "tom-ford-noir-extreme",
      "boss-the-scent-le-parfum"
    ],
    inspiredBy: {
      name: "Original Givenchy creation",
      short: "Whisky Iris Amber DNA"
    },
    noteMap: {
      top: ["bergamot", "whisky"],
      heart: ["chestnut", "orris", "benzoin"],
      base: ["cedarwood", "vetiver", "patchouli"]
    }
  },
  {
    id: 40,
    slug: "jimmy-choo-man-blue",
    name: "Jimmy Choo Man Blue Eau de Toilette",
    shortName: "Man Blue",
    category: "Designer",
    image: "/products/Jimmy-Choo-Man-Blue-EdT.png",
    sizes: { "2ml": 3.5, "5ml": 8, "10ml": 14 },
    badge: "STAFF PICK",
    rating: 7.4,
    ratingLabel: "Popular Pick",
    season: "summer",
    moods: ["clean", "summer", "soft"],
    recommendations: [
      "versace-man-eau-fraiche",
      "calvin-klein-defy-edt",
      "prada-luna-rossa-ocean-edt"
    ],
    inspiredBy: {
      name: "Original Jimmy Choo creation",
      short: "Fresh Aromatic Leather DNA"
    },
    noteMap: {
      top: ["lavender", "black-pepper", "clary-sage", "bergamot"],
      heart: ["ambergris", "leather", "cypress", "apple", "pineapple"],
      base: ["vanilla", "sandalwood", "vetiver", "patchouli"]
    }
  },
    {
    id: 41,
    slug: "ysl-lhomme-edp",
    name: "Yves Saint Laurent L'Homme Eau de Parfum",
    shortName: "YSL L'Homme",
    category: "Designer",
    image: "/products/L'Homme-EdP-YSL.png",
    sizes: { "2ml": 5.5, "5ml": 13, "10ml": 23 },
    badge: "BESTSELLER",
    rating: 8.1,
    ratingLabel: "Audience Favorite",
    season: "all",
    moods: ["soft", "date", "signature"],
    recommendations: [
      "narciso-rodriguez-for-him-bleu-noir-edp",
      "terre-d-hermes-edt",
      "calvin-klein-defy-parfum"
    ],
    inspiredBy: {
      name: "Original Yves Saint Laurent creation",
      short: "Citrus Woody Amber DNA"
    },
    noteMap: {
      top: ["bitter-orange"],
      heart: ["oakwood"],
      base: ["vetiver"]
    },
    discount: {
      size: "10ml",
      percent: 20
    }
  },
  {
    id: 42,
    slug: "lhomme-ideal-guerlain-edt",
    name: "L'Homme Idéal de Guerlain Paris Eau de Toilette",
    shortName: "L'Homme Idéal",
    category: "Designer",
    image: "/products/L'Homme-Idéal-De-Guerlain-Paris-EDT.png",
    sizes: { "2ml": 4.5, "5ml": 10, "10ml": 18 },
    badge: "TOP RATED",
    rating: 8.4,
    ratingLabel: "Audience Favorite",
    season: "all",
    moods: ["soft", "date", "signature"],
    recommendations: [
      "givenchy-gentleman-reserve-privee",
      "tom-ford-noir-extreme",
      "bvlgari-man-in-black-edp"
    ],
    inspiredBy: {
      name: "Original Guerlain creation",
      short: "Almond Amaretto Woods DNA"
    },
    noteMap: {
      top: ["citruses", "rosemary", "orange-blossom"],
      heart: ["almond", "tonka-bean"],
      base: ["vetiver", "cedarwood", "leather"]
    }
  },
  {
    id: 43,
    slug: "mancera-cedrat-boise",
    name: "Mancera Cedrat Boise Eau de Parfum",
    shortName: "Cedrat Boise",
    category: "Niche",
    image: "/products/Mancera-Cedrat-Boise-EdP.png",
    sizes: { "2ml": 4.5, "5ml": 10, "10ml": 18 },
    badge: "BESTSELLER",
    rating: 9.0,
    ratingLabel: "Top Rated",
    season: "all",
    moods: ["signature", "summer", "clean"],
    recommendations: [
      "creed-aventus-cologne",
      "bois-imperial-essential-parfums",
      "montblanc-explorer-extreme"
    ],
    inspiredBy: {
      name: "Original Mancera creation",
      short: "Citrus Woody Leather DNA"
    },
    noteMap: {
      top: [
        "sicilian-citruses",
        "black-currant",
        "cold-spices"
      ],
      heart: ["aquatic-jasmine", "patchouli-leaves"],
      base: [
        "woody-notes",
        "leather",
        "oakmoss",
        "vanilla"
      ]
    }
  },
  {
    id: 44,
    slug: "montblanc-explorer-extreme",
    name: "Montblanc Explorer Extreme Parfum",
    shortName: "Explorer Extreme",
    category: "Designer",
    image: "/products/Montblanc-Explorer-Extreme-Parfum.png",
    sizes: { "2ml": 4.5, "5ml": 10, "10ml": 18 },
    badge: "SIGNATURE",
    rating: 7.8,
    ratingLabel: "Well Loved",
    season: "winter",
    moods: ["signature", "date", "rich"],
    recommendations: [
      "mancera-cedrat-boise",
      "armaf-club-de-nuit-precieux-i",
      "gisada-ambassador-men"
    ],
    inspiredBy: {
      name: "Original Montblanc creation",
      short: "Amber Leather Adventure DNA"
    },
    noteMap: {
      top: ["bergamot"],
      heart: ["patchouli"],
      base: ["amber"]
    }
  },
  {
    id: 45,
    slug: "narciso-rodriguez-for-him-bleu-noir-edp",
    name: "Narciso Rodriguez for Him Bleu Noir Eau de Parfum",
    shortName: "Bleu Noir",
    category: "Designer",
    image: "/products/Narciso-Rodriguez-for-Him-Bleu-Noir-EdP.png",
    sizes: { "2ml": 5.5, "5ml": 13, "10ml": 23 },
    badge: "LUXURY PICK",
    rating: 8.2,
    ratingLabel: "Audience Favorite",
    season: "all",
    moods: ["soft", "clean", "signature"],
    recommendations: [
      "ysl-lhomme-edp",
      "narciso-rodriguez-poudree",
      "calvin-klein-defy-parfum"
    ],
    inspiredBy: {
      name: "Original Narciso Rodriguez creation",
      short: "Dark Musky Woods DNA"
    },
    noteMap: {
      top: ["bergamot", "black-pepper"],
      heart: ["musk", "blue-cedar", "black-ebony"],
      base: ["vetiver", "amber"]
    }
  },
  {
    id: 46,
    slug: "terre-d-hermes-edt",
    name: "Terre d'Hermès Eau de Toilette",
    shortName: "Terre d'Hermès",
    category: "Designer",
    image: "/products/Terre-d'Hermès-EdT.png",
    sizes: { "2ml": 4.5, "5ml": 10, "10ml": 18 },
    badge: "TOP RATED",
    rating: 8.9,
    ratingLabel: "Audience Favorite",
    season: "summer",
    moods: ["signature", "clean", "soft"],
    recommendations: [
      "acqua-di-parma-colonia-essenza",
      "essential-parfums-orange-x-santal",
      "bois-imperial-essential-parfums"
    ],
    inspiredBy: {
      name: "Original Hermès creation",
      short: "Mineral Citrus Woods DNA"
    },
    noteMap: {
      top: ["grapefruit"],
      heart: ["flint"],
      base: ["cedarwood"]
    }
  },
  {
    id: 47,
    slug: "tom-ford-noir-extreme",
    name: "Tom Ford Noir Extreme Eau de Parfum",
    shortName: "Noir Extreme",
    category: "Designer",
    image: "/products/Tom-Ford-Noir-Extreme-EdP.png",
    sizes: { "2ml": 9, "5ml": 21, "10ml": 37 },
    badge: "LUXURY PICK",
    rating: 9.1,
    ratingLabel: "Top Rated",
    season: "winter",
    moods: ["rich", "date", "soft"],
    recommendations: [
      "givenchy-gentleman-reserve-privee",
      "boss-the-scent-elixir",
      "bvlgari-man-in-black-edp"
    ],
    inspiredBy: {
      name: "Original Tom Ford creation",
      short: "Amber Kulfi DNA"
    },
    noteMap: {
      top: [
        "neroli",
        "saffron",
        "cardamom",
        "mandarin",
        "nutmeg"
      ],
      heart: [
        "kulfi",
        "rose",
        "jasmine",
        "orange-blossom"
      ],
      base: [
        "sandalwood",
        "vanilla",
        "amber",
        "woody-notes"
      ]
    },
    discount: {
      size: "5ml",
      percent: 10
    }
  },
  {
    id: 48,
    slug: "afnan-9pm-night-out",
    name: "Afnan 9PM Night Out Extrait de Parfum",
    shortName: "9PM Night Out",
    category: "Arabian",
    image: "/products/9pm-night-out.png",
    sizes: { "5ml": 6, "10ml": 11, "20ml": 20 },
    badge: "NIGHT OUT",
    rating: 8.6,
    ratingLabel: "Night Beast",
    season: "winter",
    moods: ["date", "rich", "signature"],
    recommendations: [
      "afnan-9pm-rebel",
      "tom-ford-noir-extreme",
      "lattafa-khamrah-qahwa"
    ],
    inspiredBy: {
      name: "Original Afnan creation",
      short: "Sweet Boozy Nightlife DNA"
    },
    noteMap: {
      top: [
        "dragon-fruit",
        "bergamot",
        "cognac",
        "lavender",
        "apple"
      ],
      heart: [
        "cardamom",
        "mahonial",
        "suede",
        "toffee",
        "cedarwood"
      ],
      base: [
        "tonka-bean",
        "akigalawood",
        "ambrofix",
        "patchouli"
      ]
    }
  },
  {
    id: 49,
    slug: "rasasi-hawas-ice",
    name: "Rasasi Hawas Ice for Him Eau de Parfum",
    shortName: "Hawas Ice",
    category: "Arabian",
    image: "/products/rasasi-hawas-ice.png",
    sizes: { "5ml": 5, "10ml": 9, "20ml": 17 },
    badge: "CROWD FAVORITE",
    rating: 8.4,
    ratingLabel: "Fresh King",
    season: "summer",
    moods: ["clean", "summer", "signature"],
    recommendations: [
      "rayhaan-pacific-aura",
      "giorgio-armani-acqua-di-gio-profondo-parfum",
      "ysl-y-iced-cologne"
    ],
    inspiredBy: {
      name: "Paco Rabanne Invictus Aqua",
      short: "Invictus Aqua DNA"
    },
    noteMap: {
      top: [
        "frozen-apple",
        "italian-lemon",
        "sicilian-bergamot",
        "star-anise"
      ],
      heart: ["plum", "orange-blossom", "cardamom"],
      base: ["musk", "amber", "driftwood", "moss"]
    }
  },
  {
    id: 50,
    slug: "armaf-club-de-nuit-precieux-i",
    name: "Armaf Club de Nuit Precieux 1 Extrait de Parfum",
    shortName: "CDN Precieux 1",
    category: "Arabian",
    image: "/products/armaf-club-de-nuit-precieux.png",
    sizes: { "2ml": 4, "5ml": 9, "10ml": 16 },
    badge: "TOP RATED",
    rating: 9.1,
    ratingLabel: "Top Rated",
    season: "winter",
    moods: ["signature", "rich", "date"],
    recommendations: [
      "afnan-supremacy-collectors-edition",
      "armaf-club-de-nuit-intense",
      "creed-aventus-cologne"
    ],
    inspiredBy: {
      name: "Creed Absolu Aventus",
      short: "Absolu Aventus DNA"
    },
    noteMap: {
      top: [
        "pineapple",
        "lemon",
        "bergamot",
        "caramel",
        "pink-pepper",
        "pear",
        "black-pepper"
      ],
      heart: [
        "oakmoss",
        "white-woods",
        "jasmine",
        "lily-of-the-valley",
        "anise"
      ],
      base: [
        "ambroxan",
        "white-musk",
        "cedarwood",
        "patchouli",
        "amber",
        "leather",
        "vanilla"
      ]
    }
  },
    {
    id: 51,
    slug: "french-avenue-safari-breeze",
    name: "French Avenue Safari Breeze Eau de Parfum",
    shortName: "Safari Breeze",
    category: "Arabian",
    image: "/products/french-avenue-safari-breeze.png",
    sizes: { "5ml": 4.5, "10ml": 8, "20ml": 15 },
    badge: "SUMMER HIT",
    rating: 7.9,
    ratingLabel: "Well Loved",
    season: "summer",
    moods: ["clean", "summer", "soft"],
    recommendations: [
      "rayhaan-pacific-aura",
      "acqua-di-parma-fico-di-amalfi",
      "rayhaan-aquatica"
    ],
    inspiredBy: {
      name: "Tales from Zanzibar by Memoirs of a Perfume Collector",
      short: "Tales from Zanzibar DNA"
    },
    noteMap: {
      top: ["black-currant", "coconut", "grapefruit"],
      heart: ["spearmint", "jasmine"],
      base: ["vetiver", "amber", "oakmoss"]
    }
  },
  {
    id: 52,
    slug: "lattafa-dynasty",
    name: "Lattafa Dynasty Eau de Parfum",
    shortName: "Dynasty",
    category: "Arabian",
    image: "/products/lattafa-dynasty.png",
    sizes: { "5ml": 4, "10ml": 7, "20ml": 13 },
    badge: "CROWD FAVORITE",
    rating: 8.1,
    ratingLabel: "Popular Pick",
    season: "all",
    moods: ["signature", "rich", "date"],
    recommendations: [
      "khadlaj-onyx-silver",
      "calvin-klein-defy-parfum",
      "gisada-ambassador-men"
    ],
    inspiredBy: {
      name: "Clive Christian L Red Tea Vetiver",
      short: "Red Tea Vetiver DNA"
    },
    noteMap: {
      top: ["bergamot", "ginger", "clary-sage", "nutmeg", "raspberry"],
      heart: ["rooibos-tea", "suede"],
      base: ["amberwood", "cedarwood", "cashmeran"]
    }
  },
  {
    id: 53,
    slug: "dolce-gabbana-the-one-for-men-edt",
    name: "Dolce&Gabbana The One for Men Eau de Toilette",
    shortName: "The One for Men",
    category: "Designer",
    image: "/products/dolce-gabbana-the-one-edt.png",
    sizes: { "2ml": 3.5, "5ml": 8, "10ml": 14 },
    badge: "DATE NIGHT",
    rating: 8.7,
    ratingLabel: "Elegant Pick",
    season: "winter",
    moods: ["date", "soft", "signature"],
    recommendations: [
      "boss-the-scent-le-parfum",
      "givenchy-gentleman-reserve-privee",
      "tom-ford-noir-extreme"
    ],
    inspiredBy: {
      name: "Original Dolce&Gabbana creation",
      short: "Spicy Tobacco DNA"
    },
    noteMap: {
      top: ["grapefruit", "coriander", "basil"],
      heart: ["cardamom", "ginger", "orange-blossom"],
      base: ["amber", "tobacco", "cedarwood"]
    }
  },
  {
    id: 54,
    slug: "versace-man-eau-fraiche",
    name: "Versace Man Eau Fraîche Eau de Toilette",
    shortName: "Man Eau Fraîche",
    category: "Designer",
    image: "/products/versace-man-eau-fraiche.png",
    sizes: { "2ml": 3, "5ml": 7, "10ml": 12 },
    badge: "BESTSELLER",
    rating: 8.3,
    ratingLabel: "Fresh Favorite",
    season: "summer",
    moods: ["clean", "summer", "soft"],
    recommendations: [
      "jimmy-choo-man-blue",
      "acqua-di-parma-fico-di-amalfi",
      "dolce-gabbana-light-blue-pour-homme-2025"
    ],
    inspiredBy: {
      name: "Original Versace creation",
      short: "Fresh Mediterranean DNA"
    },
    noteMap: {
      top: ["white-lemon", "rosewood", "carambola"],
      heart: ["tarragon", "cedar-leaves", "clary-sage"],
      base: ["musk", "amber", "sycamore-wood"]
    }
  },
  {
    id: 55,
    slug: "emir-voux-zingy",
    name: "Paris Corner Emir Voux Zingy Eau de Parfum",
    shortName: "Voux Zingy",
    category: "Arabian",
    image: "/products/emir-voux-zingy.png",
    sizes: { "5ml": 3.5, "10ml": 6, "20ml": 12 },
    badge: "SUMMER HIT",
    rating: 8.0,
    ratingLabel: "Fresh Pick",
    season: "summer",
    moods: ["clean", "summer", "signature"],
    recommendations: [
      "lattafa-maahir-legacy",
      "essential-parfums-nice-bergamote",
      "acqua-di-parma-fico-di-amalfi"
    ],
    inspiredBy: {
      name: "Xerjoff Torino 21",
      short: "Torino 21 DNA"
    },
    noteMap: {
      top: ["basil", "bergamot", "italian-citron", "lemon"],
      heart: ["jasmine", "ambrettolide", "verbena"],
      base: ["musk"]
    }
  },
  {
    id: 56,
    slug: "rayhaan-crimson",
    name: "Rayhaan Crimson Eau de Parfum",
    shortName: "Crimson",
    category: "Arabian",
    image: "/products/rayhaan-crimson.png",
    sizes: { "5ml": 4, "10ml": 7, "20ml": 13 },
    badge: "HIDDEN GEM",
    rating: 8.4,
    ratingLabel: "Bold Choice",
    season: "winter",
    moods: ["date", "rich", "signature"],
    recommendations: [
      "lattafa-asad-elixir",
      "lattafa-qaed-al-fursan-untamed",
      "tom-ford-noir-extreme"
    ],
    inspiredBy: {
      name: "Creed Centaurus",
      short: "Centaurus DNA"
    },
    noteMap: {
      top: ["cinnamon", "cardamom", "pink-pepper"],
      heart: ["patchouli", "heliotropin"],
      base: ["benzoin", "vanilla", "tonka-bean"]
    }
  },
  {
    id: 57,
    slug: "rasasi-hawas-black",
    name: "Rasasi Hawas Black Eau de Parfum",
    shortName: "Hawas Black",
    category: "Arabian",
    image: "/products/rasasi-hawas-black.png",
    sizes: { "5ml": 4.5, "10ml": 8, "20ml": 15 },
    badge: "STAFF PICK",
    rating: 8.8,
    ratingLabel: "Top Seller",
    season: "all",
    moods: ["signature", "date", "rich"],
    recommendations: [
      "afnan-supremacy-collectors-edition",
      "armaf-club-de-nuit-intense",
      "mancera-cedrat-boise"
    ],
    inspiredBy: {
      name: "Nishane Hacivat",
      short: "Hacivat DNA"
    },
    noteMap: {
      top: ["pineapple", "grapefruit", "bergamot"],
      heart: ["cedarwood", "patchouli", "jasmine"],
      base: ["oakmoss", "woody-notes", "amber"]
    }
  },
  {
    id: 58,
    slug: "khadlaj-onyx-silver",
    name: "Khadlaj Onyx Silver Eau de Parfum",
    shortName: "Onyx Silver",
    category: "Arabian",
    image: "/products/khadlaj-onyx-silver.png",
    sizes: { "5ml": 4, "10ml": 7, "20ml": 13 },
    badge: "EDITOR'S CHOICE",
    rating: 8.2,
    ratingLabel: "Fresh Spicy",
    season: "all",
    moods: ["signature", "clean", "date"],
    recommendations: [
      "bois-imperial-essential-parfums",
      "khadlaj-shiyaaka-snow-edp",
      "calvin-klein-defy-parfum"
    ],
    inspiredBy: {
      name: "Parfums de Marly Castley",
      short: "Castley DNA"
    },
    noteMap: {
      top: ["bergamot", "ginger", "black-pepper"],
      heart: ["petitgrain", "cardamom"],
      base: ["patchouli", "labdanum", "benzoin", "tonka-bean"]
    }
  },
  {
    id: 59,
    slug: "arabiyat-prestige-fahad-gaze",
    name: "Arabiyat Prestige Fahad Gaze Eau de Parfum",
    shortName: "Fahad Gaze",
    category: "Arabian",
    image: "/products/arabiyat-prestige-fahad-gaze.png",
    sizes: { "5ml": 4.5, "10ml": 8, "20ml": 15 },
    badge: "HIDDEN GEM",
    rating: 8.4,
    ratingLabel: "Elegant Pick",
    season: "winter",
    moods: ["rich", "date", "signature"],
    recommendations: [
      "ysl-myslf-edp",
      "tom-ford-noir-extreme",
      "boss-the-scent-elixir"
    ],
    inspiredBy: {
      name: "Gucci Guilty Elixir de Parfum pour Homme",
      short: "Guilty Elixir DNA"
    },
    noteMap: {
      top: ["spices", "elemi", "metallic-notes"],
      heart: ["orange-blossom", "incense", "patchouli"],
      base: ["ambergris", "vanilla", "moss"]
    }
  },
  {
    id: 60,
    slug: "narciso-rodriguez-poudree",
    name: "Narciso Rodriguez NARCISO Poudrée Eau de Parfum",
    shortName: "NARCISO Poudrée",
    category: "Designer",
    image: "/products/narciso-rodriguez-poudree.png",
    sizes: { "2ml": 4.5, "5ml": 10, "10ml": 18 },
    badge: "SIGNATURE",
    rating: 8.9,
    ratingLabel: "Elegant Favorite",
    season: "all",
    moods: ["soft", "rich", "signature"],
    recommendations: [
      "narciso-rodriguez-for-him-bleu-noir-edp",
      "my-geisha-jasmine-in-the-sun",
      "ministry-of-oud-oud-satin"
    ],
    inspiredBy: {
      name: "Original Narciso Rodriguez creation",
      short: "Powdery Musk DNA"
    },
    noteMap: {
      top: ["white-jasmine", "bulgarian-rose"],
      heart: ["powdery-musk"],
      base: ["vetiver", "black-cedar", "white-cedar"]
    }
  },
    {
    id: 61,
    slug: "ysl-black-opium-le-parfum",
    name: "Yves Saint Laurent Black Opium Le Parfum",
    shortName: "Black Opium Le Parfum",
    category: "Designer",
    image: "/products/ysl-black-opium-le-parfum.png",
    sizes: { "2ml": 8, "5ml": 18, "10ml": 32 },
    badge: "SIGNATURE",
    rating: 9.0,
    ratingLabel: "Iconic Pick",
    season: "winter",
    moods: ["rich", "date", "signature"],
    recommendations: [
      "lattafa-khamrah-qahwa",
      "tom-ford-noir-extreme",
      "narciso-rodriguez-poudree"
    ],
    inspiredBy: {
      name: "Original Yves Saint Laurent creation",
      short: "Vanilla Coffee DNA"
    },
    noteMap: {
      top: ["pear", "cinnamon", "green-mandarin"],
      heart: ["jasmine-sambac", "solar-notes", "orange-blossom"],
      base: [
        "madagascar-vanilla",
        "bourbon-vanilla",
        "vanilla-absolute",
        "black-coffee",
        "vanilla-orchid",
        "patchouli"
      ]
    }
  },
  {
    id: 62,
    slug: "french-avenue-pinnace-oryn",
    name: "French Avenue Pinnace Oryn Eau de Parfum",
    shortName: "Pinnace Oryn",
    category: "Arabian",
    image: "/products/french-avenue-pinnace-oryn.png",
    sizes: { "5ml": 5, "10ml": 9, "20ml": 17 },
    badge: "ARABIAN GEM",
    rating: 8.7,
    ratingLabel: "Luxury Fresh",
    season: "summer",
    moods: ["clean", "signature", "summer"],
    recommendations: [
      "khadlaj-island-dreams",
      "acqua-di-parma-colonia-pura",
      "dolce-gabbana-light-blue-pour-homme-2025"
    ],
    inspiredBy: {
      name: "Louis Vuitton Afternoon Swim",
      short: "Afternoon Swim DNA"
    },
    noteMap: {
      top: ["bergamot", "orange", "mandarin"],
      heart: ["ginger"],
      base: ["ambergris"]
    }
  },
  {
    id: 63,
    slug: "riiffs-freeze-extrait",
    name: "RiiFFS Freeze Extrait de Parfum",
    shortName: "RiiFFS Freeze",
    category: "Arabian",
    image: "/products/riiffs-freeze-extrait.png",
    sizes: { "5ml": 4.5, "10ml": 8, "20ml": 15 },
    badge: "MOST WANTED",
    rating: 8.3,
    ratingLabel: "Fresh Favorite",
    season: "summer",
    moods: ["clean", "summer", "signature"],
    recommendations: [
      "ysl-y-iced-cologne",
      "french-avenue-ravine-ice",
      "lattafa-maahir-legacy"
    ],
    inspiredBy: {
      name: "Original RiiFFS creation",
      short: "Icy Citrus Mint DNA"
    },
    noteMap: {
      top: [
        "spearmint",
        "calabrian-bergamot",
        "lemon-zest",
        "grapefruit",
        "snow-accord"
      ],
      heart: ["ice-accord", "ginger", "tea", "sage"],
      base: ["peony", "ambermax", "cedarwood"]
    }
  },
  {
    id: 64,
    slug: "lattafa-maahir-legacy",
    name: "Lattafa Maahir Legacy Eau de Parfum",
    shortName: "Maahir Legacy",
    category: "Arabian",
    image: "/products/lattafa-maahir-legacy.png",
    sizes: { "5ml": 4, "10ml": 7, "20ml": 13 },
    badge: "FRESH DROP",
    rating: 8.5,
    ratingLabel: "Fresh Signature",
    season: "summer",
    moods: ["clean", "signature", "summer"],
    recommendations: [
      "emir-voux-zingy",
      "prada-luna-rossa-ocean-edt",
      "ysl-y-iced-cologne"
    ],
    inspiredBy: {
      name: "Parfums de Marly Sedley",
      short: "Sedley DNA"
    },
    noteMap: {
      top: ["lime", "grapefruit", "lavender", "spearmint", "pineapple"],
      heart: [
        "juniper-berries",
        "rosemary",
        "olibanum",
        "geranium",
        "black-pepper"
      ],
      base: ["vetiver", "cashmeran", "ambroxan", "oakmoss", "tonka-bean"]
    }
  },
  {
    id: 65,
    slug: "ysl-y-iced-cologne",
    name: "Yves Saint Laurent Y Iced Cologne Eau de Toilette Intense",
    shortName: "Y Iced Cologne",
    category: "Designer",
    image: "/products/ysl-y-iced-cologne.png",
    sizes: { "2ml": 6, "5ml": 14, "10ml": 25 },
    badge: "PLAYNICE PICK",
    rating: 8.8,
    ratingLabel: "Summer Hit",
    season: "summer",
    moods: ["clean", "summer", "signature"],
    recommendations: [
      "riiffs-freeze-extrait",
      "lattafa-maahir-legacy",
      "prada-luna-rossa-ocean-edt"
    ],
    inspiredBy: {
      name: "Original Yves Saint Laurent creation",
      short: "Iced Mint Y DNA"
    },
    noteMap: {
      top: ["iced-mint", "arcticle-accord"],
      heart: ["living-mint", "blue-sage"],
      base: ["ambroxan", "patchouli"]
    },
    isNew: true
  },
  {
    id: 66,
    slug: "valentino-uomo-born-in-roma-coral-fantasy",
    name: "Valentino Uomo Born in Roma Coral Fantasy Eau de Toilette",
    shortName: "Coral Fantasy",
    category: "Designer",
    image: "/products/valentino-coral-fantasy.png",
    sizes: { "2ml": 6, "5ml": 14, "10ml": 25 },
    badge: "PLAYNICE PICK",
    rating: 9.1,
    ratingLabel: "Crowd Favorite",
    season: "all",
    moods: ["date", "rich", "signature"],
    recommendations: [
      "afnan-9pm-rebel",
      "dolce-gabbana-the-one-for-men-edt",
      "gisada-ambassador-men"
    ],
    inspiredBy: {
      name: "Original Valentino creation",
      short: "Red Apple Tobacco DNA"
    },
    noteMap: {
      top: ["red-apple", "cardamom", "calabrian-bergamot"],
      heart: ["lavender", "bourbon-geranium", "clary-sage"],
      base: ["tobacco-leaf", "patchouli", "haitian-vetiver"]
    },
    isNew: true
  },
  {
    id: 67,
    slug: "dolce-gabbana-light-blue-pour-homme-2025",
    name: "Dolce&Gabbana Light Blue Pour Homme Eau de Toilette (2025)",
    shortName: "Light Blue Pour Homme",
    category: "Designer",
    image: "/products/dolce-gabbana-light-blue-2025.png",
    sizes: { "2ml": 4, "5ml": 9, "10ml": 16 },
    badge: "SUMMER HIT",
    rating: 8.8,
    ratingLabel: "Summer Icon",
    season: "summer",
    moods: ["clean", "summer", "signature"],
    recommendations: [
      "versace-man-eau-fraiche",
      "ysl-y-iced-cologne",
      "acqua-di-parma-fico-di-amalfi"
    ],
    inspiredBy: {
      name: "Original Dolce&Gabbana creation",
      short: "Mediterranean Citrus DNA"
    },
    noteMap: {
      top: ["lemon"],
      heart: ["rosemary"],
      base: ["patchouli"]
    },
    isNew: true
  },
  {
    id: 68,
    slug: "bvlgari-man-in-black-edp",
    name: "BVLGARI Man in Black Eau de Parfum",
    shortName: "Man in Black",
    category: "Designer",
    image: "/products/bvlgari-man-in-black-edp.png",
    sizes: { "2ml": 5, "5ml": 12, "10ml": 21 },
    badge: "DATE NIGHT",
    rating: 8.9,
    ratingLabel: "Bold Classic",
    season: "winter",
    moods: ["date", "rich", "signature"],
    recommendations: [
      "tom-ford-noir-extreme",
      "givenchy-gentleman-reserve-privee",
      "dolce-gabbana-the-one-for-men-edt"
    ],
    inspiredBy: {
      name: "Original BVLGARI creation",
      short: "Rum Leather DNA"
    },
    noteMap: {
      top: ["spices", "rum", "tobacco"],
      heart: ["leather", "iris", "tuberose"],
      base: ["tonka-bean", "guaiac-wood", "benzoin"]
    },
    isNew: true
  },
  {
    id: 69,
    slug: "mancera-aoud-lemon-mint",
    name: "Mancera Aoud Lemon Mint Eau de Parfum",
    shortName: "Aoud Lemon Mint",
    category: "Niche",
    image: "/products/mancera-aoud-lemon-mint.png",
    sizes: { "2ml": 5, "5ml": 11, "10ml": 20 },
    badge: "EDITOR'S CHOICE",
    rating: 8.7,
    ratingLabel: "Niche Favorite",
    season: "all",
    moods: ["summer", "rich", "signature"],
    recommendations: [
      "mancera-cedrat-boise",
      "north-stag-expressions-ii-deux",
      "chopard-oud-malaki"
    ],
    inspiredBy: {
      name: "Original Mancera creation",
      short: "Lemon Oud Mint DNA"
    },
    noteMap: {
      top: ["sicilian-lemon", "coriander", "black-pepper", "almond"],
      heart: ["oud", "jasmine", "patchouli-leaves", "fresh-mint"],
      base: ["leather", "amber", "vanilla", "haitian-vetiver", "white-musk"]
    },
    isNew: true
  },
  {
    id: 70,
    slug: "prada-paradigme-edp",
    name: "Prada Paradigme Eau de Parfum",
    shortName: "Paradigme",
    category: "Designer",
    image: "/products/prada-paradigme-edp.png",
    sizes: { "2ml": 6, "5ml": 14, "10ml": 25 },
    badge: "BESTSELLER",
    rating: 9.0,
    ratingLabel: "Luxury Pick",
    season: "all",
    moods: ["signature", "rich", "clean"],
    recommendations: [
      "prada-luna-rossa-ocean-edt",
      "ysl-lhomme-edp",
      "narciso-rodriguez-for-him-bleu-noir-edp"
    ],
    inspiredBy: {
      name: "Original Prada creation",
      short: "Amber Woods DNA"
    },
    noteMap: {
      top: ["calabrian-bergamot", "musk"],
      heart: ["bourbon-geranium", "rose-geranium"],
      base: ["peru-balsam", "benzoin", "guaiac-wood"]
    },
    isNew: true
  },
{
  id: 71,
  slug: "ysl-myslf-edp",
  name: "Yves Saint Laurent MYSLF Eau de Parfum",
  shortName: "YSL MYSLF",
  category: "Designer",
  image: "/products/ysl-myslf-edp.png",
  sizes: { "2ml": 5.5, "5ml": 13, "10ml": 23 },
  badge: "TOP RATED",
  rating: 8.8,
  ratingLabel: "Modern Signature",
  season: "all",
  moods: ["clean", "signature", "date"],
  recommendations: ["ysl-y-iced-cologne"],
  inspiredBy: {
  name: "Original Yves Saint Laurent creation",
  short: "Orange Blossom Woods DNA"
},
  noteMap: {
  top: ["bergamot"],
  heart: ["orange-blossom"],
  base: ["warm-woods", "patchouli", "ambrofix"]
},
  isNew: true,
},
{
  id: 72,
  slug: "carolina-herrera-bad-boy-cobalt-edp",
  name: "Carolina Herrera Bad Boy Cobalt Eau de Parfum",
  shortName: "Bad Boy Cobalt",
  category: "Designer",
  image: "/products/ch-bad-boy-cobalt-edp.png",
  sizes: { "2ml": 4.5, "5ml": 10, "10ml": 18 },
  badge: "PLAYNICE PICK",
  rating: 8.6,
  ratingLabel: "Fresh Bold",
  season: "all",
  moods: ["date", "signature", "clean"],
  recommendations: ["valentino-uomo-born-in-roma-coral-fantasy"],
  inspiredBy: {
  name: "Original Carolina Herrera creation",
  short: "Plum Aromatic DNA"
},
  noteMap: {
  top: ["pink-pepper", "lavender"],
  heart: ["geranium", "black-plum"],
  base: ["truffle", "vetiver", "cedarwood"]
},
  isNew: true,
},
{
  id: 73,
  slug: "prada-luna-rossa-ocean-edt",
  name: "Prada Luna Rossa Ocean Eau de Toilette",
  shortName: "Luna Rossa Ocean",
  category: "Designer",
  image: "/products/prada-luna-rossa-ocean-edt.png",
  sizes: { "2ml": 4.5, "5ml": 10, "10ml": 18 },
  badge: "SIGNATURE",
  rating: 8.5,
  ratingLabel: "Clean Favorite",
  season: "summer",
  moods: ["clean", "summer", "signature"],
  recommendations: ["ysl-myslf-edp"],
  inspiredBy: {
  name: "Original Prada creation",
  short: "Neo Fresh Ocean DNA"
},
  noteMap: {
  top: ["bergamot"],
  heart: ["lavender", "sage", "iris"],
  base: ["vetiver", "tonka-bean"]
},
  isNew: true,
},
{
  id: 74,
  slug: "thomas-kosmala-no7-le-sel-de-la-terre",
  name: "Thomas Kosmala No. 7 Le Sel de la Terre",
  shortName: "Le Sel de la Terre",
  category: "Niche",
  image: "/products/thomas-kosmala-no7-le-sel-de-la-terre.png",
  sizes: { "2ml": 6.5, "5ml": 15, "10ml": 27 },
  badge: "LUXURY PICK",
  rating: 9.2,
  ratingLabel: "Niche Masterpiece",
  season: "summer",
  moods: ["summer", "signature", "clean"],
  recommendations: [
    "dolce-gabbana-light-blue-pour-homme-2025",
    "acqua-di-gio-profondo-parfum"
  ],
  inspiredBy: {
  name: "Original Thomas Kosmala creation",
  short: "Marine Salt DNA"
},
  noteMap: {
  top: ["bergamot", "lemon", "marine-notes"],
  heart: ["watery-notes", "fresh-florals"],
  base: ["fresh-woods", "musk"]
},
  isNew: true,
},
{
  id: 75,
  slug: "jean-paul-gaultier-le-beau-edt",
  name: "Jean Paul Gaultier Le Beau Eau de Toilette",
  shortName: "JPG Le Beau",
  category: "Designer",
  image: "/products/jean-paul-gaultier-le-beau-edt.png",
  sizes: { "2ml": 5, "5ml": 12, "10ml": 21 },
  badge: "MOST WANTED",
  rating: 9.2,
  ratingLabel: "Summer Icon",
  season: "summer",
  moods: ["summer", "date", "signature"],
  recommendations: [
    "riiffs-freeze-extrait",
    "ysl-y-iced-cologne"
  ],
  inspiredBy: {
  name: "Original Jean Paul Gaultier creation",
  short: "Coconut Tonka DNA"
},
  noteMap: {
  top: ["bergamot"],
  heart: ["coconut-wood"],
  base: ["tonka-bean"]
},
  isNew: true,
},
{
  id: 76,
  slug: "rayhaan-azul-edp",
  name: "Rayhaan Azul Eau de Parfum",
  shortName: "Rayhaan Azul",
  category: "Arabian",
  image: "/products/rayhaan-azul.png",
  sizes: { "5ml": 4.5, "10ml": 8, "20ml": 15 },
  badge: "SUMMER HIT",
  rating: 8.8,
  ratingLabel: "Summer Favorite",
  season: "summer",
  moods: ["summer", "clean", "signature"],
  recommendations: [
    "ysl-y-iced-cologne"
  ],
  inspiredBy: {
  name: "Dior Homme Cologne",
  short: "Dior Homme Cologne DNA"
},
  noteMap: {
  top: ["bergamot", "lemon"],
  heart: ["grapefruit-blossom"],
  base: ["calone", "sandalwood"]
},
  isNew: true,
},
{
  id: 77,
  slug: "lattafa-suqraat-edp",
  name: "Lattafa Suqraat Eau de Parfum",
  shortName: "Lattafa Suqraat",
  category: "Arabian",
  image: "/products/lattafa-suqraat.png",
  sizes: { "5ml": 3.5, "10ml": 6, "20ml": 12 },
  badge: "HIDDEN GEM",
  rating: 8.5,
  ratingLabel: "Fresh Classic",
  season: "summer",
  moods: ["summer", "clean"],
  recommendations: [
    "dolce-gabbana-light-blue-pour-homme-2025"
  ],
  inspiredBy: {
  name: "Giorgio Armani Acqua di Giò Profumo",
  short: "Acqua di Giò Profumo DNA"
},
  noteMap: {
  top: ["bergamot", "ginger"],
  heart: ["lavender", "violet-leaf"],
  base: ["musk", "sandalwood", "amber"]
},
  isNew: true,
},
{
  id: 78,
  slug: "khadlaj-shiyaaka-snow-edp",
  name: "Khadlaj Shiyaaka Snow Eau de Parfum",
  shortName: "Shiyaaka Snow",
  category: "Arabian",
  image: "/products/khadlaj-shiyaaka-snow.png",
  sizes: { "5ml": 4.5, "10ml": 8, "20ml": 15 },
  badge: "MOST WANTED",
  rating: 8.8,
  ratingLabel: "Luxury Fresh",
  season: "summer",
  moods: ["clean", "signature", "summer"],
  recommendations: [
    "lattafa-maahir-legacy"
  ],
  inspiredBy: {
  name: "Louis Vuitton Météore",
  short: "Météore DNA"
},
  noteMap: {
  top: ["mandarin", "citruses", "bergamot"],
  heart: ["neroli", "nutmeg", "pink-pepper"],
  base: ["vetiver", "cardamom"]
},
  isNew: true,
},
{
  id: 79,
  slug: "french-avenue-ravine-ginger-edp",
  name: "French Avenue Ravine Ginger Extrait de Parfum",
  shortName: "Ravine Ginger",
  category: "Arabian",
  image: "/products/french-avenue-ravine-ginger.png",
  sizes: { "5ml": 5, "10ml": 9, "20ml": 17 },
  badge: "ARABIAN GEM",
  rating: 8.9,
  ratingLabel: "Signature Pick",
  season: "summer",
  moods: ["signature", "summer", "rich"],
  recommendations: [
    "french-avenue-pinnace-oryn"
  ],
  inspiredBy: {
  name: "Goldfield & Banks Ingenious Ginger",
  short: "Ingenious Ginger DNA"
},
  noteMap: {
  top: ["ginger", "lemon", "bergamot"],
  heart: ["orange-blossom", "magnolia", "jasmine"],
  base: ["vanilla", "sandalwood", "musk"]
},
  isNew: true,
},
{
  id: 80,
  slug: "lattafa-khamrah-waha-edp",
  name: "Lattafa Khamrah Waha Eau de Parfum",
  shortName: "Khamrah Waha",
  category: "Arabian",
  image: "/products/lattafa-khamrah-waha.png",
  sizes: { "5ml": 6, "10ml": 11, "20ml": 20 },
  badge: "TRENDING",
  rating: 9.0,
  ratingLabel: "Gourmand Star",
  season: "all",
  moods: ["rich", "date", "signature"],
  recommendations: [
    "jean-paul-gaultier-le-beau-edt"
  ],
  inspiredBy: {
  name: "Original Lattafa creation",
  short: "Fresh Woody Aromatic DNA"
},
  noteMap: {
  top: ["bergamot", "juniper-berries", "yuzu"],
  heart: ["iris", "cucumber", "sea-salt"],
  base: ["akigalawood", "tonka-bean", "ambrofix"]
},
  isNew: true,
},
{
  id: 81,
  slug: "rayhaan-nocturno-elixir",
  name: "Rayhaan Nocturno Elixir Eau de Parfum",
  shortName: "Nocturno Elixir",
  category: "Arabian",
  image: "/products/rayhaan-nocturno-elixir.png",
  sizes: { "5ml": 4.5, "10ml": 8, "20ml": 15 },
  badge: "SIGNATURE",
  rating: 8.9,
  ratingLabel: "Blue Favorite",
  season: "all",
  moods: ["clean", "signature", "date"],
  recommendations: [
    "rayhaan-azul-edp"
  ],
  inspiredBy: {
  name: "Bleu de Chanel Parfum",
  short: "Bleu de Chanel Parfum DNA"
},
  noteMap: {
  top: ["sandalwood"],
  heart: ["amber"],
  base: ["woody-notes", "labdanum"]
},
  isNew: true,
},
{
  id: 82,
  slug: "french-avenue-ravine-ice",
  name: "French Avenue Ravine Ice Extrait de Parfum",
  shortName: "Ravine Ice",
  category: "Arabian",
  image: "/products/french-avenue-ravine-ice.png",
  sizes: { "5ml": 5, "10ml": 9, "20ml": 17 },
  badge: "SUMMER HIT",
  rating: 9.0,
  ratingLabel: "Summer Star",
  season: "summer",
  moods: ["summer", "clean", "signature"],
  recommendations: [
    "french-avenue-pinnace-oryn"
  ],
  inspiredBy: {
  name: "Goldfield & Banks Pacific Rock Moss",
  short: "Pacific Rock Moss DNA"
},
  noteMap: {
  top: ["lemon", "geranium"],
  heart: ["sage", "lavender", "sea-salt"],
  base: ["moss", "cedarwood", "ambroxan"]
},
  isNew: true,
},
{
  id: 83,
  slug: "mawj-moscow-mule",
  name: "Paris Corner Mawj Moscow Mule Eau de Parfum",
  shortName: "Mawj Moscow Mule",
  category: "Arabian",
  image: "/products/mawj-moscow-mule.png",
  sizes: { "5ml": 4, "10ml": 7, "20ml": 13 },
  badge: "FRESH DROP",
  rating: 8.8,
  ratingLabel: "Fresh Pick",
  season: "summer",
  moods: ["summer", "clean", "signature"],
  recommendations: ["french-avenue-ravine-ginger-edp"],
  inspiredBy: {
  name: "Kilian Blue Moon Ginger Dash",
  short: "Blue Moon Ginger Dash DNA"
},
  noteMap: {
  top: ["lemon", "ginger", "bergamot"],
  heart: ["herbal-notes", "cypress", "mint"],
  base: ["ozonic-notes", "amber", "moss"]
},
  isNew: true,
},
{
  id: 84,
  slug: "my-geisha-jasmine-in-the-sun",
  name: "My Geisha Jasmine in the Sun Eau de Parfum",
  shortName: "Jasmine in the Sun",
  category: "Niche",
  image: "/products/my-geisha-jasmine-in-the-sun.png",
  sizes: { "2ml": 6, "5ml": 14, "10ml": 25 },
  badge: "NEW",
  rating: 9.1,
  ratingLabel: "Summer Bloom",
  season: "summer",
  moods: ["summer", "soft", "signature"],
  recommendations: [
    "narciso-rodriguez-poudree"
  ],
  inspiredBy: {
    name: "Original My Geisha creation",
    short: "Solar Jasmine DNA"
  },
  isNew: true,
},
{
  id: 85,
  slug: "essential-parfums-nice-bergamote",
  name: "Essential Parfums Nice Bergamote Eau de Parfum",
  shortName: "Nice Bergamote",
  category: "Niche",
  image: "/products/essential-parfums-nice-bergamote.png",
  sizes: { "2ml": 4, "5ml": 9, "10ml": 16 },
  badge: "NEW",
  rating: 8.9,
  ratingLabel: "Citrus Icon",
  season: "summer",
  moods: ["clean", "summer", "signature"],
  recommendations: [
    "dolce-gabbana-light-blue-pour-homme-2025"
  ],
  inspiredBy: {
    name: "Original Essential Parfums creation",
    short: "Natural Bergamot DNA"
  },
  isNew: true,
},
{
  id: 86,
  slug: "essential-parfums-orange-x-santal",
  name: "Essential Parfums Orange X Santal Eau de Parfum",
  shortName: "Orange X Santal",
  category: "Niche",
  image: "/products/essential-parfums-orange-x-santal.png",
  sizes: { "2ml": 4, "5ml": 9, "10ml": 16 },
  badge: "NEW",
  rating: 9.0,
  ratingLabel: "Modern Niche",
  season: "all",
  moods: ["signature", "clean", "rich"],
  recommendations: [
    "nice-bergamote"
  ],
  inspiredBy: {
    name: "Original Essential Parfums creation",
    short: "Orange Sandalwood DNA"
  },
  isNew: true,
},
];