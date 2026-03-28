import React, { useEffect, useLayoutEffect, useMemo, useState } from "react";
import "./App.css";

const translations = {
  en: {
    navHome: "Home",
    navShop: "Shop",
    cart: "Cart",
    heroEyebrow: "Luxury Fragrance Curation",
    heroTitleLine1: "Desire begins",
    heroTitleLine2: "in the dark.",
    heroText:
      "Discover designer, niche and Arabian fragrances through a premium decant experience. Test on skin. Wear with intent. Own the moment.",
    heroNow: "Now €34.90",
    heroOffer: "Afnan 9PM Rebel 100ml full bottle",
    exploreCollection: "Explore Collection",
    claimOffer: "Claim the Offer",
    valueTry: "✔ Try before you buy",
    valuePremium: "✔ Only premium fragrances",
    valueDelivery: "✔ Delivery across Montenegro",
    highlightsKicker: "Current Highlights",
    highlightsTitle: "Selected for impact",
    highlightsText:
      "Curated bottles and standout decants chosen for performance, compliment factor and identity.",
    campaignPick: "Campaign Pick",
    summerHit: "Summer Hit",
    arabianEdge: "Arabian Edge",
    rebelCardText:
      "A bold full-bottle offer with serious value. The current hero of the season.",
    islandDreamsText:
      "Bright, addictive and made for warm weather. Easy reach, high reward.",
    marwaText:
      "Smooth character, strong identity and standout value in decant format.",
    add100ml: "Add 100ml for €34.90",
    privateSelection: "Private Selection",
    bestsellersTitle: "Best sellers & signature picks",
    bestsellersText:
      "Premium decants that let customers discover the right fragrance before committing to a full bottle.",
    viewFullCollection: "View Full Collection",
    discoverTitle: "Discover Your Signature",
    discoverText: "Test before you commit. Find what truly fits you.",
    shopKicker: "Shop",
    shopTitle: "PlayNice Collection",
    shopText:
      "Premium decants and selected bottles. Built for discovery, style and smart buying.",
    searchLabel: "Search",
    searchPlaceholder: "Search fragrance...",
    categoryLabel: "Category",
    all: "All",
    from: "From",
    openDetails: "Open details",
    luxuryModal: "Luxury modal",
    yourCart: "Your Cart",
    selectedItems: "Selected items",
    cartEmpty: "Your cart is empty.",
    goToShop: "Go to Shop",
    subtotal: "Subtotal",
    shipping: "Shipping",
    freeShippingNote: "Free shipping over €39",
    freeShippingUnlocked: "Free shipping unlocked",
    freeShippingLeft: "left to free shipping",
    freeShippingProgress: "You’re {{amount}} away from free shipping",
    total: "Total",
    continueCheckout: "Continue to Checkout",
    checkoutKicker: "Checkout",
    checkoutTitle: "Complete your order",
    firstName: "First name",
    lastName: "Last name",
    email: "Email",
    phone: "Phone",
    city: "City",
    address: "Address",
    note: "Order note (optional)",
    placeOrder: "Place Order",
    placingOrder: "Placing order...",
    orderSuccess: "Order sent successfully.",
    orderError: "There was an error sending your order. Please try again.",
    fillRequired: "Please fill in all required fields.",
    emptyCartAlert: "Your cart is empty.",
    orderSummary: "Order summary",
    noItemsCart: "No items in cart.",
    privateSelectionModal: "Private Selection",
    whyChoose: "Why customers choose this",
    whyChooseText:
      "Strong identity, premium feel and excellent value in decant format.",
    chooseSize: "Choose size",
    selectedPrice: "Selected price",
    addToCart: "Add to Cart",
    modalNote:
      "Try before you buy. Premium fragrance discovery, delivered across Montenegro.",
    page: "Page",
    remove: "Remove",
    addedToCart: "added to cart",
    justAdded: "Added ✓",
    announcement1: "Free shipping over €39",
    announcement2: "Try before you buy — 2ml, 5ml, 10ml & 20ml decants",
    announcement3: "Premium niche & designer fragrances",
    announcement4: "Limited stock drops — don’t miss out",
    announcement5: "Delivery across Montenegro",
    announcementDynamicLocked: "Add {{amount}} more to unlock free shipping",
    announcementDynamicUnlocked: "Free shipping unlocked ✓",
    announcementDynamicEmpty1: "Free shipping over €39",
    announcementDynamicEmpty2: "Try before you buy — 2ml, 5ml, 10ml & 20ml decants",
    announcementDynamicEmpty3: "Premium niche & designer fragrances",
    announcementDynamicEmpty4: "Limited stock drops — don’t miss out",
    announcementDynamicEmpty5: "Delivery across Montenegro",
  },
  sr: {
    navHome: "Početna",
    navShop: "Shop",
    cart: "Korpa",
    heroEyebrow: "Luksuzna selekcija parfema",
    heroTitleLine1: "Želja počinje",
    heroTitleLine2: "u tami.",
    heroText:
      "Otkrij dizajnerske, niche i arapske parfeme kroz premium decant iskustvo. Isprobaj na koži. Nosi sa stavom. Osvoji trenutak.",
    heroNow: "Sada €34.90",
    heroOffer: "Afnan 9PM Rebel 100ml puna bočica",
    exploreCollection: "Pogledaj kolekciju",
    claimOffer: "Uzmi ponudu",
    valueTry: "✔ Probaj pre kupovine",
    valuePremium: "✔ Samo premium parfemi",
    valueDelivery: "✔ Dostava širom Crne Gore",
    highlightsKicker: "Aktuelno izdvojeno",
    highlightsTitle: "Odabrano da ostavi utisak",
    highlightsText:
      "Pažljivo odabrane bočice i dekanti koji se izdvajaju performansama, komplimentima i karakterom.",
    campaignPick: "Glavna ponuda",
    summerHit: "Letnji hit",
    arabianEdge: "Arapski karakter",
    rebelCardText:
      "Moćna full bottle ponuda sa ozbiljnom vrednošću. Trenutni heroj sezone.",
    islandDreamsText:
      "Svetao, zarazan i stvoren za toplo vreme. Lak izbor, jak efekat.",
    marwaText:
      "Uglađen karakter, snažan identitet i odlična vrednost u decant formatu.",
    add100ml: "Dodaj 100ml za €34.90",
    privateSelection: "Private Selection",
    bestsellersTitle: "Bestseleri i signature izbor",
    bestsellersText:
      "Premium dekanti koji kupcima omogućavaju da pronađu pravi parfem pre nego što se odluče za punu bočicu.",
    viewFullCollection: "Pogledaj celu kolekciju",
    discoverTitle: "Pronađi svoj signature miris",
    discoverText: "Isprobaj pre odluke. Pronađi ono što ti zaista pristaje.",
    shopKicker: "Shop",
    shopTitle: "PlayNice kolekcija",
    shopText:
      "Premium dekanti i pažljivo odabrane bočice. Stvoreno za otkrivanje, stil i pametnu kupovinu.",
    searchLabel: "Pretraga",
    searchPlaceholder: "Pretraži parfem...",
    categoryLabel: "Kategorija",
    all: "Sve",
    from: "Od",
    openDetails: "Otvori detalje",
    luxuryModal: "Premium prikaz",
    yourCart: "Tvoja korpa",
    selectedItems: "Odabrani proizvodi",
    cartEmpty: "Tvoja korpa je trenutno prazna.",
    goToShop: "Idi na shop",
    subtotal: "Međuzbir",
    shipping: "Dostava",
    freeShippingNote: "Besplatna dostava preko 39€",
    freeShippingUnlocked: "Besplatna dostava otključana",
    freeShippingLeft: "do besplatne dostave",
    freeShippingProgress: "Nedostaje ti {{amount}} do besplatne dostave",
    total: "Ukupno",
    continueCheckout: "Nastavi ka porudžbini",
    checkoutKicker: "Poručivanje",
    checkoutTitle: "Još samo korak do tvoje porudžbine",
    firstName: "Ime",
    lastName: "Prezime",
    email: "Email adresa",
    phone: "Broj telefona",
    city: "Grad",
    address: "Adresa",
    note: "Napomena uz porudžbinu (opciono)",
    placeOrder: "Potvrdi i pošalji porudžbinu",
    placingOrder: "Šalje se porudžbina...",
    orderSuccess: "Porudžbina je uspešno poslata.",
    orderError: "Došlo je do greške pri slanju porudžbine. Pokušaj ponovo.",
    fillRequired: "Molimo popuni sva obavezna polja.",
    emptyCartAlert: "Korpa je prazna.",
    orderSummary: "Pregled porudžbine",
    noItemsCart: "Nema proizvoda u korpi.",
    privateSelectionModal: "Private Selection",
    whyChoose: "Zašto kupci biraju ovaj parfem",
    whyChooseText:
      "Jak identitet, premium utisak i odlična vrednost u decant formatu.",
    chooseSize: "Izaberi veličinu",
    selectedPrice: "Izabrana cena",
    addToCart: "Dodaj u korpu",
    modalNote:
      "Probaj pre kupovine. Otkrij premium parfeme uz dostavu širom Crne Gore.",
    page: "Strana",
    remove: "Ukloni",
    addedToCart: "je dodat u korpu",
    justAdded: "Dodato ✓",
    announcement1: "Besplatna dostava preko 55€",
    announcement2: "Probaj pre kupovine — 5ml i 10ml dekanti",
    announcement3: "Premium niche i dizajnerski parfemi",
    announcement4: "Ograničene količine — ne propusti",
    announcement5: "Dostava širom Crne Gore",
    announcementDynamicLocked: "Dodaj još {{amount}} za besplatnu dostavu",
    announcementDynamicUnlocked: "Besplatna dostava otključana ✓",
    announcementDynamicEmpty1: "Besplatna dostava preko 39€",
    announcementDynamicEmpty2: "Probaj pre kupovine — 2ml, 5ml, 10ml i 20ml dekanti",
    announcementDynamicEmpty3: "Premium niche i dizajnerski parfemi",
    announcementDynamicEmpty4: "Ograničene količine — ne propusti",
    announcementDynamicEmpty5: "Dostava širom Crne Gore",
  }
};

const categoryLabels = {
  Arabian: { en: "Arabian", sr: "Arapski" },
  Designer: { en: "Designer", sr: "Dizajner" },
  Niche: { en: "Niche", sr: "Niche" },
  Summer: { en: "Summer", sr: "Letnji" }
};

const products = [
  { id: 1, name: "Afnan 9AM", category: "Arabian", image: "/afnan-9am.png", sizes: { "5ml": 4, "10ml": 7, "20ml": 13 } },
  { id: 2, name: "Afnan 9PM Rebel", category: "Arabian", image: "/9pm.png", sizes: { "5ml": 4, "10ml": 7, "20ml": 13 }, badge: "BESTSELLER" },
  { id: 3, name: "Afnan Supremacy Collector's Edition Pour Homme", category: "Arabian", image: "/afnan-supremacy.png", sizes: { "5ml": 5, "10ml": 9, "20ml": 17 } },
  { id: 4, name: "Afnan Turathi Blue", category: "Arabian", image: "/afnan-turathi-blue.png", sizes: { "5ml": 5, "10ml": 9, "20ml": 17 }, badge: "BESTSELLER" },
  { id: 5, name: "Arabiyat Prestige Marwa", category: "Arabian", image: "/marwa.png", sizes: { "5ml": 4.5, "10ml": 8, "20ml": 15 } },
  { id: 6, name: "Armaf Club De Nuit Bling", category: "Designer", sizes: { "5ml": 6, "10ml": 11, "20ml": 20 } },
  { id: 7, name: "Armaf Club de Nuit Intense", category: "Designer", image: "/armaf-cdn-intense.png", sizes: { "5ml": 4, "10ml": 7, "20ml": 13 }, badge: "BESTSELLER" },
  { id: 8, name: "Armaf Club de Nuit Sillage", category: "Designer", sizes: { "5ml": 4, "10ml": 7, "20ml": 13 } },
  { id: 9, name: "French Avenue Vulcan Sable by Fragrance World", category: "Arabian", sizes: { "5ml": 5, "10ml": 9, "20ml": 17 } },
  { id: 10, name: "Haramain Signature Blue", category: "Arabian", sizes: { "5ml": 3, "10ml": 5, "20ml": 10 } },
  { id: 11, name: "Khadlaj Island Dreams Extrait de Parfum", category: "Summer", image: "/island.png", sizes: { "5ml": 4.5, "10ml": 8, "20ml": 15 }, badge: "BESTSELLER" },
  { id: 12, name: "Lattafa Asad Elixir", category: "Arabian", sizes: { "5ml": 4.5, "10ml": 8, "20ml": 15 }, badge: "BESTSELLER" },
  { id: 13, name: "Lattafa Fakhar Black", category: "Arabian", sizes: { "5ml": 4, "10ml": 7, "20ml": 13 } },
  { id: 14, name: "Lattafa Khamrah Qahwa", category: "Arabian", sizes: { "5ml": 5, "10ml": 9, "20ml": 17 }, badge: "BESTSELLER" },
  { id: 15, name: "Lattafa Musamam Black Intense", category: "Arabian", sizes: { "5ml": 5, "10ml": 9, "20ml": 17 } },
  { id: 16, name: "Lattafa Qaed Al Fursan Untamed", category: "Arabian", sizes: { "5ml": 3, "10ml": 5, "20ml": 10 } },
  { id: 17, name: "Paris Corner Emir Trillium", category: "Arabian", sizes: { "5ml": 4, "10ml": 7, "20ml": 13 } },
  { id: 18, name: "Paris Corner Emir Voux Elegante", category: "Arabian", sizes: { "5ml": 4, "10ml": 7, "20ml": 13 } },
  { id: 19, name: "Paris Corner Ministry of Oud - Oud Satin", category: "Arabian", sizes: { "5ml": 4, "10ml": 7, "20ml": 13 } },
  { id: 20, name: "Paris Corner Perfumes North Stag Expressions II DEUX", category: "Arabian", sizes: { "5ml": 4, "10ml": 7, "20ml": 13 } },
  { id: 21, name: "Rayhaan Aquatica", category: "Summer", sizes: { "5ml": 4.5, "10ml": 8, "20ml": 15 } },
  { id: 22, name: "Rayhaan Pacific Aura", category: "Summer", sizes: { "5ml": 4.5, "10ml": 8, "20ml": 15 } },
  { id: 23, name: "Swiss Arabian Tobacco 01 Extrait de Parfum", category: "Arabian", sizes: { "5ml": 10, "10ml": 18, "20ml": 34 } },
  { id: 24, name: "Acqua di Parma Blu Mediterraneo Fico di Amalfi Eau de Toilette", category: "Designer", sizes: { "2ml": 6.5, "5ml": 15, "10ml": 27 } },
  { id: 25, name: "Acqua di Parma Colonia Essenza Eau de Cologne", category: "Designer", sizes: { "2ml": 7, "5ml": 16, "10ml": 29 } },
  { id: 26, name: "Acqua di Parma Colonia Pura Eau de Cologne", category: "Designer", sizes: { "2ml": 6.5, "5ml": 15, "10ml": 27 } },
  { id: 27, name: "BLEU DE CHANEL Eau de Parfum Spray", category: "Designer", sizes: { "2ml": 6.5, "5ml": 15, "10ml": 27 }, badge: "BESTSELLER" },
  { id: 28, name: "Bois Impérial by Essential Parfums", category: "Niche", sizes: { "2ml": 4, "5ml": 9, "10ml": 16 }, badge: "BESTSELLER" },
  { id: 29, name: "BOSS Bottled Beyond Eau de Parfum", category: "Designer", sizes: { "2ml": 5.5, "5ml": 13, "10ml": 23 } },
  { id: 30, name: "BOSS The Scent Elixir Parfum Intense for Him", category: "Designer", sizes: { "2ml": 6.5, "5ml": 15, "10ml": 27 } },
  { id: 31, name: "BOSS The Scent Le Parfum for Him", category: "Designer", sizes: { "2ml": 6, "5ml": 14, "10ml": 25 } },
  { id: 32, name: "Calvin Klein CK All Eau de Toilette", category: "Designer", sizes: { "2ml": 2.5, "5ml": 6, "10ml": 11 } },
  { id: 33, name: "Calvin Klein Defy Eau de Toilette", category: "Designer", sizes: { "2ml": 3, "5ml": 7, "10ml": 12 } },
  { id: 34, name: "Calvin Klein Defy Parfum", category: "Designer", sizes: { "2ml": 4.5, "5ml": 10, "10ml": 18 } },
  { id: 35, name: "Chopard Oud Malaki Eau de Parfum", category: "Designer", sizes: { "2ml": 5.5, "5ml": 13, "10ml": 23 } },
  { id: 36, name: "Creed Aventus Cologne", category: "Niche", sizes: { "2ml": 13, "5ml": 29, "10ml": 52 }, badge: "BESTSELLER" },
  { id: 37, name: "Giorgio Armani Acqua di Giò Profondo Parfum", category: "Designer", sizes: { "2ml": 6.5, "5ml": 15, "10ml": 27 }, badge: "BESTSELLER" },
  { id: 38, name: "Gisada Ambassador Men Eau de Parfum", category: "Designer", sizes: { "2ml": 5, "5ml": 11, "10ml": 20 }, badge: "BESTSELLER" },
  { id: 39, name: "Givenchy Gentleman Eau de Parfum Réserve Privée", category: "Designer", sizes: { "2ml": 5, "5ml": 12, "10ml": 21 } },
  { id: 40, name: "Jimmy Choo Man Blue Eau de Toilette", category: "Designer", sizes: { "2ml": 3.5, "5ml": 8, "10ml": 14 } },
  { id: 41, name: "L'Homme Eau de Parfum by Yves Saint Laurent", category: "Designer", sizes: { "2ml": 5.5, "5ml": 13, "10ml": 23 } },
  { id: 42, name: "L'Homme Idéal De Guerlain Paris Eau De Toilette", category: "Designer", sizes: { "2ml": 4.5, "5ml": 10, "10ml": 18 } },
  { id: 43, name: "Mancera Cedrat Boise Eau de Parfum", category: "Niche", sizes: { "2ml": 4.5, "5ml": 10, "10ml": 18 }, badge: "BESTSELLER" },
  { id: 44, name: "Montblanc Explorer Extreme Parfum", category: "Designer", sizes: { "2ml": 4.5, "5ml": 10, "10ml": 18 } },
  { id: 45, name: "Narciso Rodriguez for Him Bleu Noir Eau de Parfum", category: "Designer", sizes: { "2ml": 5.5, "5ml": 13, "10ml": 23 } },
  { id: 46, name: "Terre d'Hermès Eau de Toilette", category: "Designer", sizes: { "2ml": 4.5, "5ml": 10, "10ml": 18 } },
  { id: 47, name: "Tom Ford Noir Extreme Eau de Parfum", category: "Niche", sizes: { "2ml": 9, "5ml": 21, "10ml": 37 } }
];

const productCopy = {
  "Afnan 9AM": {
    miniTag: { sr: "❄️ Fresh / Daily", en: "❄️ Fresh / Daily" },
    card: {
      sr: "Svež i energičan — citrusi, lavanda i čista drvena baza.",
      en: "Fresh and energetic — citrus, lavender and a clean woody base."
    },
    modal: {
      sr: "Miris čistog starta. Citrusna svežina, blaga lavanda i lagano drvo daju moderan, uredan i veoma nosiv karakter.",
      en: "The scent of a clean start. Citrus freshness, soft lavender and light woods create a modern, polished and highly wearable character."
    },
    scentType: { sr: "Fresh citrus woody", en: "Fresh citrus woody" },
    dominantNotes: {
      sr: ["citrusi", "lavanda", "bergamot", "drveni tonovi"],
      en: ["citrus", "lavender", "bergamot", "woody notes"]
    },
    tags: { sr: ["Fresh", "Daily", "Clean"], en: ["Fresh", "Daily", "Clean"] }
    whyChoose: {
  sr: "Savršen izbor za večernje izlaske, komplimente i sve koji vole sladak, gust i zavodljiv trag.",
  en: "A perfect pick for nights out, compliments and anyone who loves a sweet, rich and seductive trail."
}
  },

  "Afnan 9PM Rebel": {
    miniTag: { sr: "🔥 Bestseller", en: "🔥 Bestseller" },
    card: {
      sr: "Sladak i zavodljiv — vanila, amber i voćna toplina.",
      en: "Sweet and seductive — vanilla, amber and fruity warmth."
    },
    modal: {
      sr: "Noć koja ne traži dozvolu. Sladak, gust i zavodljiv — vanila i amber nose ceo miris, uz voćni sjaj koji ostaje u vazduhu.",
      en: "A night that does not ask for permission. Sweet, rich and seductive — vanilla and amber lead the scent, with a fruity glow that lingers in the air."
    },
    scentType: { sr: "Sweet amber fruity", en: "Sweet amber fruity" },
    dominantNotes: {
      sr: ["vanila", "amber", "voćne note", "slatki tonovi"],
      en: ["vanilla", "amber", "fruity notes", "sweet accords"]
    },
    tags: { sr: ["Sweet", "Night", "Compliment"], en: ["Sweet", "Night", "Compliment"] }
  },

  "Afnan Supremacy Collector's Edition Pour Homme": {
    miniTag: { sr: "💎 Luxury / Signature", en: "💎 Luxury / Signature" },
    card: {
      sr: "Voćno-dimni luksuz — ananas, dim i mošus.",
      en: "Fruity-smoky luxury — pineapple, smoke and musk."
    },
    modal: {
      sr: "Smela elegancija sa karakterom. Sočan ananas, suptilan dim i čista mošusna dubina daju skup i upečatljiv trag.",
      en: "Bold elegance with character. Juicy pineapple, subtle smoke and clean musky depth create an expensive and memorable trail."
    },
    scentType: { sr: "Fruity smoky musky", en: "Fruity smoky musky" },
    dominantNotes: {
      sr: ["ananas", "dim", "mošus", "drveni tonovi"],
      en: ["pineapple", "smoke", "musk", "woody notes"]
    },
    tags: { sr: ["Luxury", "Signature", "Bold"], en: ["Luxury", "Signature", "Bold"] }
  },

  "Afnan Turathi Blue": {
    miniTag: { sr: "🔥 Bestseller", en: "🔥 Bestseller" },
    card: {
      sr: "Citrusno-aromatičan — bergamot, amber i elegantno drvo.",
      en: "Citrus-aromatic — bergamot, amber and elegant woods."
    },
    modal: {
      sr: "Svežina sa ozbiljnim karakterom. Bergamot otvara miris svetlo i čisto, dok amber i drvo daju dubinu i trajnost.",
      en: "Freshness with real character. Bergamot opens bright and clean, while amber and woods add depth and staying power."
    },
    scentType: { sr: "Citrus aromatic amber", en: "Citrus aromatic amber" },
    dominantNotes: {
      sr: ["bergamot", "citrusi", "amber", "drveni tonovi"],
      en: ["bergamot", "citrus", "amber", "woody notes"]
    },
    tags: { sr: ["Fresh", "Elegant", "Versatile"], en: ["Fresh", "Elegant", "Versatile"] }
  },

  "Arabiyat Prestige Marwa": {
    miniTag: { sr: "💎 Luxury / Signature", en: "💎 Luxury / Signature" },
    card: {
      sr: "Orijentalan i raskošan — ruža, slatki začini i topla baza.",
      en: "Oriental and rich — rose, sweet spices and a warm base."
    },
    modal: {
      sr: "Bogata orijentalna elegancija. Predivan miris ruže i toplih začina otvara luksuzan, zavodljiv i veoma upečatljiv trag.",
      en: "Rich oriental elegance. A beautiful rose accord and warm spices create a luxurious, seductive and highly memorable trail."
    },
    scentType: { sr: "Oriental floral spicy", en: "Oriental floral spicy" },
    dominantNotes: {
      sr: ["ruža", "slatki začini", "amber", "topli tonovi"],
      en: ["rose", "sweet spices", "amber", "warm accords"]
    },
    tags: { sr: ["Oriental", "Rose", "Luxury"], en: ["Oriental", "Rose", "Luxury"] }
  },

  "Armaf Club De Nuit Bling": {
    miniTag: { sr: "🍯 Sweet / Date Night", en: "🍯 Sweet / Date Night" },
    card: {
      sr: "Sladak i glamurozan — voće, ruža i meka vanila.",
      en: "Sweet and glamorous — fruit, rose and soft vanilla."
    },
    modal: {
      sr: "Sjaj koji privlači pažnju. Voćna slatkoća, ruža i kremasta vanila daju moderan, blistav i vrlo primetan miris.",
      en: "A shine that pulls attention. Fruity sweetness, rose and creamy vanilla create a modern, luminous and highly noticeable scent."
    },
    scentType: { sr: "Fruity floral sweet", en: "Fruity floral sweet" },
    dominantNotes: {
      sr: ["voćne note", "ruža", "vanila", "slatki tonovi"],
      en: ["fruity notes", "rose", "vanilla", "sweet accords"]
    },
    tags: { sr: ["Sweet", "Floral", "Attention"], en: ["Sweet", "Floral", "Attention"] }
  },

  "Armaf Club de Nuit Intense": {
    miniTag: { sr: "🔥 Bestseller", en: "🔥 Bestseller" },
    card: {
      sr: "Oštar i dimno-citrusan — limun, dim i tamno drvo.",
      en: "Sharp and smoky-citrus — lemon, smoke and dark woods."
    },
    modal: {
      sr: "Prvi utisak koji ostaje. Oštar citrusni opening brzo prelazi u dimnu, muževnu i veoma prepoznatljivu dubinu.",
      en: "A first impression that lasts. The sharp citrus opening quickly turns into a smoky, masculine and highly recognizable depth."
    },
    scentType: { sr: "Citrus smoky woody", en: "Citrus smoky woody" },
    dominantNotes: {
      sr: ["limun", "citrusi", "dim", "drveni tonovi"],
      en: ["lemon", "citrus", "smoke", "woody notes"]
    },
    tags: { sr: ["Bold", "Signature", "Night"], en: ["Bold", "Signature", "Night"] }
  },

  "Armaf Club de Nuit Sillage": {
    miniTag: { sr: "❄️ Fresh / Daily", en: "❄️ Fresh / Daily" },
    card: {
      sr: "Metalno-svež — citrusi, mošus i hladni cvetni tonovi.",
      en: "Metallic-fresh — citrus, musk and cool floral tones."
    },
    modal: {
      sr: "Hladna elegancija sa potpisom. Citrusna čistina, mošus i metalno-svež karakter daju sofisticiran i drugačiji miris.",
      en: "Cool elegance with a signature. Citrus clarity, musk and a metallic-fresh character create a sophisticated and distinctive scent."
    },
    scentType: { sr: "Fresh musky metallic", en: "Fresh musky metallic" },
    dominantNotes: {
      sr: ["citrusi", "mošus", "hladni cvetni tonovi", "drveni tonovi"],
      en: ["citrus", "musk", "cool floral tones", "woody notes"]
    },
    tags: { sr: ["Fresh", "Elegant", "Unique"], en: ["Fresh", "Elegant", "Unique"] }
  },

  "French Avenue Vulcan Sable by Fragrance World": {
    miniTag: { sr: "💎 Luxury / Signature", en: "💎 Luxury / Signature" },
    card: {
      sr: "Topao i taman — začini, amber i duboka drvena baza.",
      en: "Warm and dark — spices, amber and a deep woody base."
    },
    modal: {
      sr: "Miris sa mračnim luksuzom. Topli začini, amber i tamno drvo daju bogat, skup i ozbiljno zavodljiv karakter.",
      en: "A scent with dark luxury. Warm spices, amber and dark woods create a rich, expensive and seriously seductive character."
    },
    scentType: { sr: "Warm spicy amber woody", en: "Warm spicy amber woody" },
    dominantNotes: {
      sr: ["začini", "amber", "drveni tonovi", "tamni akordi"],
      en: ["spices", "amber", "woody notes", "dark accords"]
    },
    tags: { sr: ["Luxury", "Dark", "Evening"], en: ["Luxury", "Dark", "Evening"] }
  },

  "Haramain Signature Blue": {
    miniTag: { sr: "❄️ Fresh / Daily", en: "❄️ Fresh / Daily" },
    card: {
      sr: "Čist i svetao — citrusi, aromatične note i lagano drvo.",
      en: "Clean and bright — citrus, aromatic notes and light woods."
    },
    modal: {
      sr: "Lako nosiva svežina za svaki dan. Citrusni i aromatični tonovi daju čist, prijatan i uredan utisak.",
      en: "An easy-wearing freshness for every day. Citrus and aromatic notes create a clean, pleasant and polished impression."
    },
    scentType: { sr: "Fresh aromatic citrus", en: "Fresh aromatic citrus" },
    dominantNotes: {
      sr: ["citrusi", "aromatične note", "lagano drvo", "čisti tonovi"],
      en: ["citrus", "aromatic notes", "light woods", "clean accords"]
    },
    tags: { sr: ["Fresh", "Daily", "Easy"], en: ["Fresh", "Daily", "Easy"] }
  },

  "Khadlaj Island Dreams Extrait de Parfum": {
    miniTag: { sr: "🔥 Bestseller", en: "🔥 Bestseller" },
    card: {
      sr: "Letnji i zarazan — tropsko voće, kremasti tonovi i sunčana svežina.",
      en: "Summery and addictive — tropical fruit, creamy tones and sunny freshness."
    },
    modal: {
      sr: "Miris odmora na koži. Tropsko voće i mekani kremasti akordi daju srećan, lagan i veoma privlačan letnji vibe.",
      en: "Holiday mood on skin. Tropical fruit and soft creamy accords create a happy, easy and highly attractive summer vibe."
    },
    scentType: { sr: "Tropical fruity creamy", en: "Tropical fruity creamy" },
    dominantNotes: {
      sr: ["tropsko voće", "kremasti tonovi", "slatke note", "sveži akordi"],
      en: ["tropical fruit", "creamy tones", "sweet notes", "fresh accords"]
    },
    tags: { sr: ["Summer", "Tropical", "Easy"], en: ["Summer", "Tropical", "Easy"] }
  },

  "Lattafa Asad Elixir": {
    miniTag: { sr: "🔥 Bestseller", en: "🔥 Bestseller" },
    card: {
      sr: "Sladak i začinski — vanila, amber i toplo drvo.",
      en: "Sweet and spicy — vanilla, amber and warm woods."
    },
    modal: {
      sr: "Tamna slatkoća sa snagom. Vanila, amber i začini stvaraju gust, moćan i vrlo privlačan večernji miris.",
      en: "Dark sweetness with power. Vanilla, amber and spices create a rich, bold and very attractive evening scent."
    },
    scentType: { sr: "Sweet spicy amber", en: "Sweet spicy amber" },
    dominantNotes: {
      sr: ["vanila", "amber", "začini", "drveni tonovi"],
      en: ["vanilla", "amber", "spices", "woody notes"]
    },
    tags: { sr: ["Sweet", "Bold", "Night"], en: ["Sweet", "Bold", "Night"] }
  },

  "Lattafa Fakhar Black": {
    miniTag: { sr: "❄️ Fresh / Daily", en: "❄️ Fresh / Daily" },
    card: {
      sr: "Aromatično svež — jabuka, lavanda i elegantna drvena baza.",
      en: "Aromatic-fresh — apple, lavender and an elegant woody base."
    },
    modal: {
      sr: "Čist, moderan i veoma nosiv. Sveža jabuka i lavanda otvaraju miris svetlo, dok drvena baza daje muževan finiš.",
      en: "Clean, modern and highly wearable. Fresh apple and lavender open bright, while the woody base gives a masculine finish."
    },
    scentType: { sr: "Aromatic fresh woody", en: "Aromatic fresh woody" },
    dominantNotes: {
      sr: ["jabuka", "lavanda", "citrusi", "drveni tonovi"],
      en: ["apple", "lavender", "citrus", "woody notes"]
    },
    tags: { sr: ["Fresh", "Modern", "Versatile"], en: ["Fresh", "Modern", "Versatile"] }
  },

  "Lattafa Khamrah Qahwa": {
    miniTag: { sr: "🔥 Bestseller", en: "🔥 Bestseller" },
    card: {
      sr: "Topao i sladak — kafa, cimet i kremasta vanila.",
      en: "Warm and sweet — coffee, cinnamon and creamy vanilla."
    },
    modal: {
      sr: "Zavodljiva toplina u punom sjaju. Bogata kafa, cimet i vanila stvaraju gust, sladak i addictive trag.",
      en: "Seductive warmth at full power. Rich coffee, cinnamon and vanilla create a dense, sweet and addictive trail."
    },
    scentType: { sr: "Gourmand coffee spicy", en: "Gourmand coffee spicy" },
    dominantNotes: {
      sr: ["kafa", "cimet", "vanila", "slatki začini"],
      en: ["coffee", "cinnamon", "vanilla", "sweet spices"]
    },
    tags: { sr: ["Gourmand", "Sweet", "Winter"], en: ["Gourmand", "Sweet", "Winter"] }
  },

  "Lattafa Musamam Black Intense": {
    miniTag: { sr: "💎 Luxury / Signature", en: "💎 Luxury / Signature" },
    card: {
      sr: "Tamno i luksuzno — začini, dim i bogato drvo.",
      en: "Dark and luxurious — spices, smoke and rich woods."
    },
    modal: {
      sr: "Dubok i ozbiljan miris sa orijentalnim potpisom. Začini, dimni tonovi i bogata drvena baza daju snažan karakter.",
      en: "A deep and serious scent with an oriental signature. Spices, smoky tones and a rich woody base give it strong character."
    },
    scentType: { sr: "Dark spicy woody", en: "Dark spicy woody" },
    dominantNotes: {
      sr: ["začini", "dim", "drveni tonovi", "amber"],
      en: ["spices", "smoke", "woody notes", "amber"]
    },
    tags: { sr: ["Dark", "Luxury", "Evening"], en: ["Dark", "Luxury", "Evening"] }
  },

  "Lattafa Qaed Al Fursan Untamed": {
    miniTag: { sr: "🍯 Sweet / Date Night", en: "🍯 Sweet / Date Night" },
    card: {
      sr: "Voćno-dimni twist — ananas, začini i topla baza.",
      en: "A fruity-smoky twist — pineapple, spices and a warm base."
    },
    modal: {
      sr: "Sočno, smelo i upečatljivo. Voćni opening sa ananasom prelazi u začinsku toplinu i snažan orijentalni trag.",
      en: "Juicy, bold and memorable. A fruity opening with pineapple moves into spicy warmth and a strong oriental trail."
    },
    scentType: { sr: "Fruity spicy smoky", en: "Fruity spicy smoky" },
    dominantNotes: {
      sr: ["ananas", "začini", "dim", "topli tonovi"],
      en: ["pineapple", "spices", "smoke", "warm accords"]
    },
    tags: { sr: ["Bold", "Sweet", "Exotic"], en: ["Bold", "Sweet", "Exotic"] }
  },

  "Paris Corner Emir Trillium": {
    miniTag: { sr: "❄️ Fresh / Daily", en: "❄️ Fresh / Daily" },
    card: {
      sr: "Čisto i moderno — citrusi, aromatične note i svetlo drvo.",
      en: "Clean and modern — citrus, aromatic notes and light woods."
    },
    modal: {
      sr: "Miris urednosti i lakoće. Citrusna i aromatična svežina sa svetlom drvenom bazom čini ga veoma nosivim.",
      en: "A scent of neatness and ease. Citrus and aromatic freshness over a light woody base make it highly wearable."
    },
    scentType: { sr: "Fresh aromatic woody", en: "Fresh aromatic woody" },
    dominantNotes: {
      sr: ["citrusi", "aromatične note", "drveni tonovi", "čisti akordi"],
      en: ["citrus", "aromatic notes", "woody notes", "clean accords"]
    },
    tags: { sr: ["Fresh", "Clean", "Daily"], en: ["Fresh", "Clean", "Daily"] }
  },

  "Paris Corner Emir Voux Elegante": {
    miniTag: { sr: "💎 Luxury / Signature", en: "💎 Luxury / Signature" },
    card: {
      sr: "Elegantno kremast — začini, cvetni tonovi i meko drvo.",
      en: "Elegantly creamy — spices, floral tones and soft woods."
    },
    modal: {
      sr: "Sofisticiran i uglađen. Kremasti začinski tonovi i meka drvena osnova daju elegantan, fin i luksuzan utisak.",
      en: "Sophisticated and polished. Creamy spicy tones and a soft woody base create an elegant, refined and luxurious impression."
    },
    scentType: { sr: "Elegant spicy woody", en: "Elegant spicy woody" },
    dominantNotes: {
      sr: ["začini", "cvetni tonovi", "drveni tonovi", "meki akordi"],
      en: ["spices", "floral tones", "woody notes", "soft accords"]
    },
    tags: { sr: ["Elegant", "Luxury", "Refined"], en: ["Elegant", "Luxury", "Refined"] }
  },

  "Paris Corner Ministry of Oud - Oud Satin": {
    miniTag: { sr: "💎 Luxury / Signature", en: "💎 Luxury / Signature" },
    card: {
      sr: "Baršunast i raskošan — oud, ruža i slatka toplina.",
      en: "Velvety and rich — oud, rose and sweet warmth."
    },
    modal: {
      sr: "Luksuz sa orijentalnim potpisom. Oud i ruža u baršunastoj, slatko-toploj bazi daju bogat i skup utisak.",
      en: "Luxury with an oriental signature. Oud and rose in a velvety, sweet-warm base create a rich and expensive impression."
    },
    scentType: { sr: "Oud rose oriental", en: "Oud rose oriental" },
    dominantNotes: {
      sr: ["oud", "ruža", "slatki tonovi", "amber"],
      en: ["oud", "rose", "sweet accords", "amber"]
    },
    tags: { sr: ["Oud", "Luxury", "Signature"], en: ["Oud", "Luxury", "Signature"] }
  },

  "Paris Corner Perfumes North Stag Expressions II DEUX": {
    miniTag: { sr: "❄️ Fresh / Daily", en: "❄️ Fresh / Daily" },
    card: {
      sr: "Svetao i energičan — citrusi, đumbir i čisto drvo.",
      en: "Bright and energetic — citrus, ginger and clean woods."
    },
    modal: {
      sr: "Pun energije i kretanja. Citrusi i nota đumbira daju živ start, dok drvena osnova drži miris elegantnim.",
      en: "Full of energy and movement. Citrus and a touch of ginger create a lively start, while the woody base keeps it elegant."
    },
    scentType: { sr: "Citrus spicy woody", en: "Citrus spicy woody" },
    dominantNotes: {
      sr: ["citrusi", "đumbir", "drveni tonovi", "aromatične note"],
      en: ["citrus", "ginger", "woody notes", "aromatic notes"]
    },
    tags: { sr: ["Fresh", "Energetic", "Modern"], en: ["Fresh", "Energetic", "Modern"] }
  },

  "Rayhaan Aquatica": {
    miniTag: { sr: "❄️ Fresh / Daily", en: "❄️ Fresh / Daily" },
    card: {
      sr: "Vodeno svež — morski tonovi, citrusi i čista baza.",
      en: "Water-fresh — marine notes, citrus and a clean base."
    },
    modal: {
      sr: "Miris hladne svežine i lakoće. Morski akordi i citrusi daju osećaj čiste, prozračne i letnje energije.",
      en: "A scent of cool freshness and ease. Marine accords and citrus create a clean, airy and summery energy."
    },
    scentType: { sr: "Aquatic fresh citrus", en: "Aquatic fresh citrus" },
    dominantNotes: {
      sr: ["morski tonovi", "citrusi", "čisti akordi", "lagano drvo"],
      en: ["marine notes", "citrus", "clean accords", "light woods"]
    },
    tags: { sr: ["Aquatic", "Fresh", "Summer"], en: ["Aquatic", "Fresh", "Summer"] }
  },

  "Rayhaan Pacific Aura": {
    miniTag: { sr: "❄️ Fresh / Daily", en: "❄️ Fresh / Daily" },
    card: {
      sr: "Pacifički svež — voćni citrusi, morski tonovi i lagana toplina.",
      en: "Pacific-fresh — fruity citrus, marine notes and light warmth."
    },
    modal: {
      sr: "Letnji miris sa vedrim karakterom. Sveži voćni tonovi i morska prozračnost stvaraju čist i privlačan trag.",
      en: "A summer scent with a bright character. Fresh fruity notes and marine airiness create a clean and attractive trail."
    },
    scentType: { sr: "Fresh aquatic fruity", en: "Fresh aquatic fruity" },
    dominantNotes: {
      sr: ["morski tonovi", "voćne note", "citrusi", "čisti tonovi"],
      en: ["marine notes", "fruity notes", "citrus", "clean accords"]
    },
    tags: { sr: ["Summer", "Fresh", "Easy"], en: ["Summer", "Fresh", "Easy"] }
  },

  "Swiss Arabian Tobacco 01 Extrait de Parfum": {
    miniTag: { sr: "💎 Luxury / Signature", en: "💎 Luxury / Signature" },
    card: {
      sr: "Bogat i sladak — duvan, med i topli začini.",
      en: "Rich and sweet — tobacco, honey and warm spices."
    },
    modal: {
      sr: "Teška elegancija sa toplinom. Duvan, med i začini grade gust, luksuzan i duboko privlačan miris.",
      en: "Heavy elegance with warmth. Tobacco, honey and spices build a rich, luxurious and deeply attractive scent."
    },
    scentType: { sr: "Tobacco sweet spicy", en: "Tobacco sweet spicy" },
    dominantNotes: {
      sr: ["duvan", "med", "začini", "topli akordi"],
      en: ["tobacco", "honey", "spices", "warm accords"]
    },
    tags: { sr: ["Tobacco", "Rich", "Evening"], en: ["Tobacco", "Rich", "Evening"] }
  },

  "Acqua di Parma Blu Mediterraneo Fico di Amalfi Eau de Toilette": {
    miniTag: { sr: "❄️ Fresh / Daily", en: "❄️ Fresh / Daily" },
    card: {
      sr: "Mediteranski svež — smokva, citrusi i nežni zeleni tonovi.",
      en: "Mediterranean fresh — fig, citrus and delicate green tones."
    },
    modal: {
      sr: "Miris sunčanog juga. Smokva i citrusi daju lagan, prirodan i elegantan letnji karakter pun lakoće.",
      en: "The scent of the sunny south. Fig and citrus bring a light, natural and elegant summer character full of ease."
    },
    scentType: { sr: "Fresh fruity citrus", en: "Fresh fruity citrus" },
    dominantNotes: {
      sr: ["smokva", "citrusi", "zeleni tonovi", "lagana baza"],
      en: ["fig", "citrus", "green tones", "light base"]
    },
    tags: { sr: ["Fresh", "Summer", "Elegant"], en: ["Fresh", "Summer", "Elegant"] }
  },

  "Acqua di Parma Colonia Essenza Eau de Cologne": {
    miniTag: { sr: "💎 Luxury / Signature", en: "💎 Luxury / Signature" },
    card: {
      sr: "Klasično elegantan — citrusi, neroli i čista drvena baza.",
      en: "Classically elegant — citrus, neroli and a clean woody base."
    },
    modal: {
      sr: "Italijanska elegancija u čistom obliku. Svetli citrusi, neroli i besprekorna baza daju sofisticiran i bezvremenski utisak.",
      en: "Italian elegance in pure form. Bright citrus, neroli and an impeccable base create a sophisticated and timeless impression."
    },
    scentType: { sr: "Classic citrus aromatic", en: "Classic citrus aromatic" },
    dominantNotes: {
      sr: ["citrusi", "neroli", "aromatične note", "drveni tonovi"],
      en: ["citrus", "neroli", "aromatic notes", "woody notes"]
    },
    tags: { sr: ["Classic", "Elegant", "Refined"], en: ["Classic", "Elegant", "Refined"] }
  },

  "Acqua di Parma Colonia Pura Eau de Cologne": {
    miniTag: { sr: "❄️ Fresh / Daily", en: "❄️ Fresh / Daily" },
    card: {
      sr: "Čisto i sofisticirano — bergamot, citrusi i beli mošus.",
      en: "Clean and sophisticated — bergamot, citrus and white musk."
    },
    modal: {
      sr: "Svežina koja izgleda skupo. Bergamot, čisti citrusi i beli mošus stvaraju uredan, lagan i luksuzan trag.",
      en: "Freshness that looks expensive. Bergamot, clean citrus and white musk create a polished, light and luxurious trail."
    },
    scentType: { sr: "Fresh citrus musky", en: "Fresh citrus musky" },
    dominantNotes: {
      sr: ["bergamot", "citrusi", "beli mošus", "aromatične note"],
      en: ["bergamot", "citrus", "white musk", "aromatic notes"]
    },
    tags: { sr: ["Fresh", "Clean", "Luxury"], en: ["Fresh", "Clean", "Luxury"] }
  },

  "BLEU DE CHANEL Eau de Parfum Spray": {
    miniTag: { sr: "🔥 Bestseller", en: "🔥 Bestseller" },
    card: {
      sr: "Čist i elegantan — citrusi, tamjan i tamno drvo.",
      en: "Clean and elegant — citrus, incense and dark woods."
    },
    modal: {
      sr: "Sigurnost bez potrebe za dokazivanjem. Citrusna svežina, tamjan i drvena dubina daju autoritet, stil i trajnost.",
      en: "Confidence without needing to prove anything. Citrus freshness, incense and woody depth bring authority, style and longevity."
    },
    scentType: { sr: "Citrus incense woody", en: "Citrus incense woody" },
    dominantNotes: {
      sr: ["citrusi", "tamjan", "grejpfrut", "drveni tonovi"],
      en: ["citrus", "incense", "grapefruit", "woody notes"]
    },
    tags: { sr: ["Classic", "Elegant", "Signature"], en: ["Classic", "Elegant", "Signature"] }
  },

  "Bois Impérial by Essential Parfums": {
    miniTag: { sr: "🔥 Bestseller", en: "🔥 Bestseller" },
    card: {
      sr: "Moderno zelen — bosiljak, začini i sofisticirano drvo.",
      en: "Modern green — basil, spices and sophisticated woods."
    },
    modal: {
      sr: "Miris koji deluje nišno i savremeno. Zeleni, začinski i drveni tonovi daju čist, elegantan i vrlo prepoznatljiv profil.",
      en: "A scent that feels niche and contemporary. Green, spicy and woody tones create a clean, elegant and highly distinctive profile."
    },
    scentType: { sr: "Green woody spicy", en: "Green woody spicy" },
    dominantNotes: {
      sr: ["zeleni tonovi", "bosiljak", "začini", "drveni tonovi"],
      en: ["green tones", "basil", "spices", "woody notes"]
    },
    tags: { sr: ["Niche", "Modern", "Signature"], en: ["Niche", "Modern", "Signature"] }
  },

  "BOSS Bottled Beyond Eau de Parfum": {
    miniTag: { sr: "🍯 Sweet / Date Night", en: "🍯 Sweet / Date Night" },
    card: {
      sr: "Topao i moderan — začini, drvo i slatka muževnost.",
      en: "Warm and modern — spices, woods and sweet masculinity."
    },
    modal: {
      sr: "Savremen boss vibe. Začinski tonovi i drvena toplina daju uredan, privlačan i lako dopadljiv karakter.",
      en: "A modern boss vibe. Spicy tones and woody warmth create a polished, attractive and easy-to-love character."
    },
    scentType: { sr: "Warm spicy woody", en: "Warm spicy woody" },
    dominantNotes: {
      sr: ["začini", "drveni tonovi", "slatki akordi", "amber"],
      en: ["spices", "woody notes", "sweet accords", "amber"]
    },
    tags: { sr: ["Modern", "Warm", "Versatile"], en: ["Modern", "Warm", "Versatile"] }
  },

  "BOSS The Scent Elixir Parfum Intense for Him": {
    miniTag: { sr: "🍯 Sweet / Date Night", en: "🍯 Sweet / Date Night" },
    card: {
      sr: "Topao i senzualan — amber, začini i intenzivno drvo.",
      en: "Warm and sensual — amber, spices and intense woods."
    },
    modal: {
      sr: "Privlačnost u najčišćem obliku. Topao amber, začinska dubina i bogata baza stvaraju magnetičan večernji trag.",
      en: "Attraction in its purest form. Warm amber, spicy depth and a rich base create a magnetic evening trail."
    },
    scentType: { sr: "Amber spicy woody", en: "Amber spicy woody" },
    dominantNotes: {
      sr: ["amber", "začini", "drveni tonovi", "topli akordi"],
      en: ["amber", "spices", "woody notes", "warm accords"]
    },
    tags: { sr: ["Night", "Sensual", "Intense"], en: ["Night", "Sensual", "Intense"] }
  },

  "BOSS The Scent Le Parfum for Him": {
    miniTag: { sr: "🍯 Sweet / Date Night", en: "🍯 Sweet / Date Night" },
    card: {
      sr: "Zavodljiv i topao — iris, začini i bogata baza.",
      en: "Seductive and warm — iris, spices and a rich base."
    },
    modal: {
      sr: "Mekši i elegantniji tip zavodljivosti. Iris i začinska toplina daju sofisticiran, topao i veoma prijatan miris.",
      en: "A softer, more elegant type of seduction. Iris and spicy warmth create a sophisticated, warm and very pleasant scent."
    },
    scentType: { sr: "Warm spicy powdery", en: "Warm spicy powdery" },
    dominantNotes: {
      sr: ["iris", "začini", "amber", "drveni tonovi"],
      en: ["iris", "spices", "amber", "woody notes"]
    },
    tags: { sr: ["Elegant", "Date Night", "Warm"], en: ["Elegant", "Date Night", "Warm"] }
  },

  "Calvin Klein CK All Eau de Toilette": {
    miniTag: { sr: "❄️ Fresh / Daily", en: "❄️ Fresh / Daily" },
    card: {
      sr: "Univerzalno svež — citrusi i beli mošus.",
      en: "Universally fresh — citrus and white musk."
    },
    modal: {
      sr: "Čista svakodnevica. Lagani citrusi i beli mošus daju mekan, čist i prijatan miris koji ide uz sve.",
      en: "Clean everyday ease. Light citrus and white musk create a soft, clean and pleasant scent that goes with everything."
    },
    scentType: { sr: "Fresh musky citrus", en: "Fresh musky citrus" },
    dominantNotes: {
      sr: ["citrusi", "beli mošus", "mandarina", "čisti akordi"],
      en: ["citrus", "white musk", "mandarin", "clean accords"]
    },
    tags: { sr: ["Fresh", "Daily", "Soft"], en: ["Fresh", "Daily", "Soft"] }
  },

  "Calvin Klein Defy Eau de Toilette": {
    miniTag: { sr: "❄️ Fresh / Daily", en: "❄️ Fresh / Daily" },
    card: {
      sr: "Svež i čist — citrusi, lavanda i vetiver.",
      en: "Fresh and clean — citrus, lavender and vetiver."
    },
    modal: {
      sr: "Moderan minimalizam sa muževnim finišem. Citrusna svežina i lavanda prelaze u čist vetiver i drvenu bazu.",
      en: "Modern minimalism with a masculine finish. Citrus freshness and lavender move into clean vetiver and a woody base."
    },
    scentType: { sr: "Fresh aromatic woody", en: "Fresh aromatic woody" },
    dominantNotes: {
      sr: ["citrusi", "lavanda", "vetiver", "drveni tonovi"],
      en: ["citrus", "lavender", "vetiver", "woody notes"]
    },
    tags: { sr: ["Fresh", "Daily", "Clean"], en: ["Fresh", "Daily", "Clean"] }
  },

  "Calvin Klein Defy Parfum": {
    miniTag: { sr: "💎 Luxury / Signature", en: "💎 Luxury / Signature" },
    card: {
      sr: "Dublji i topliji — amber, lavanda i elegantno drvo.",
      en: "Deeper and warmer — amber, lavender and elegant woods."
    },
    modal: {
      sr: "Intenzivnija verzija svežine. Amber i lavanda u bogatijoj drvenoj bazi daju ozbiljniji, topliji i sofisticiran karakter.",
      en: "A more intense version of freshness. Amber and lavender in a richer woody base create a more serious, warmer and sophisticated character."
    },
    scentType: { sr: "Amber aromatic woody", en: "Amber aromatic woody" },
    dominantNotes: {
      sr: ["amber", "lavanda", "drveni tonovi", "topli akordi"],
      en: ["amber", "lavender", "woody notes", "warm accords"]
    },
    tags: { sr: ["Elegant", "Modern", "Versatile"], en: ["Elegant", "Modern", "Versatile"] }
  },

  "Chopard Oud Malaki Eau de Parfum": {
    miniTag: { sr: "💎 Luxury / Signature", en: "💎 Luxury / Signature" },
    card: {
      sr: "Raskošan i taman — oud, začini i topla amber dubina.",
      en: "Rich and dark — oud, spices and warm amber depth."
    },
    modal: {
      sr: "Luksuzan oud sa klasičnim karakterom. Začini i amber omekšavaju tamnu dubinu i daju skup, ozbiljan trag.",
      en: "A luxurious oud with classic character. Spices and amber soften the dark depth and create an expensive, serious trail."
    },
    scentType: { sr: "Oud spicy amber", en: "Oud spicy amber" },
    dominantNotes: {
      sr: ["oud", "začini", "amber", "drveni tonovi"],
      en: ["oud", "spices", "amber", "woody notes"]
    },
    tags: { sr: ["Oud", "Luxury", "Evening"], en: ["Oud", "Luxury", "Evening"] }
  },

  "Creed Aventus Cologne": {
    miniTag: { sr: "🔥 Bestseller", en: "🔥 Bestseller" },
    card: {
      sr: "Elegantno svež — citrusi, đumbir i vetiver.",
      en: "Elegantly fresh — citrus, ginger and vetiver."
    },
    modal: {
      sr: "Tihi luksuz bez buke. Citrusna svetlost i nota đumbira spajaju se sa vetiverom u čist, moćan i sofisticiran miris.",
      en: "Quiet luxury without noise. Citrus brightness and a touch of ginger meet vetiver in a clean, powerful and sophisticated scent."
    },
    scentType: { sr: "Citrus spicy woody", en: "Citrus spicy woody" },
    dominantNotes: {
      sr: ["citrusi", "đumbir", "vetiver", "mandarina"],
      en: ["citrus", "ginger", "vetiver", "mandarin"]
    },
    tags: { sr: ["Luxury", "Fresh", "Refined"], en: ["Luxury", "Fresh", "Refined"] }
  },

  "Giorgio Armani Acqua di Giò Profondo Parfum": {
    miniTag: { sr: "🔥 Bestseller", en: "🔥 Bestseller" },
    card: {
      sr: "Duboko svež — morski tonovi, bergamot i mineralna baza.",
      en: "Deeply fresh — marine notes, bergamot and a mineral base."
    },
    modal: {
      sr: "Svežina sa dubinom i ozbiljnošću. Morski akordi, bergamot i mineralna baza daju moderan i veoma čist muški potpis.",
      en: "Freshness with depth and seriousness. Marine accords, bergamot and a mineral base create a modern and very clean masculine signature."
    },
    scentType: { sr: "Aquatic aromatic fresh", en: "Aquatic aromatic fresh" },
    dominantNotes: {
      sr: ["morski tonovi", "bergamot", "mineralni tonovi", "aromatične note"],
      en: ["marine notes", "bergamot", "mineral tones", "aromatic notes"]
    },
    tags: { sr: ["Aquatic", "Fresh", "Signature"], en: ["Aquatic", "Fresh", "Signature"] }
  },

  "Gisada Ambassador Men Eau de Parfum": {
    miniTag: { sr: "🔥 Bestseller", en: "🔥 Bestseller" },
    card: {
      sr: "Topao i sladak — voće, vanila i amber.",
      en: "Warm and sweet — fruit, vanilla and amber."
    },
    modal: {
      sr: "Ulazak koji svi primete. Voćna slatkoća, amber i vanila daju harizmu, toplinu i mnogo komplimenata.",
      en: "An entrance everyone notices. Fruity sweetness, amber and vanilla bring charisma, warmth and plenty of compliments."
    },
    scentType: { sr: "Fruity sweet amber", en: "Fruity sweet amber" },
    dominantNotes: {
      sr: ["voćne note", "vanila", "amber", "slatki tonovi"],
      en: ["fruity notes", "vanilla", "amber", "sweet accords"]
    },
    tags: { sr: ["Compliment", "Sweet", "Popular"], en: ["Compliment", "Sweet", "Popular"] }
  },

  "Givenchy Gentleman Eau de Parfum Réserve Privée": {
    miniTag: { sr: "💎 Luxury / Signature", en: "💎 Luxury / Signature" },
    card: {
      sr: "Topao i sofisticiran — viski, iris i tamno drvo.",
      en: "Warm and sophisticated — whisky, iris and dark woods."
    },
    modal: {
      sr: "Elegantna dubina sa karakterom. Kremasti iris i viski akord stvaraju luksuzan, mekan i veoma zavodljiv utisak.",
      en: "Elegant depth with character. Creamy iris and a whisky accord create a luxurious, soft and highly seductive impression."
    },
    scentType: { sr: "Boozy powdery woody", en: "Boozy powdery woody" },
    dominantNotes: {
      sr: ["viski", "iris", "drveni tonovi", "topli akordi"],
      en: ["whisky", "iris", "woody notes", "warm accords"]
    },
    tags: { sr: ["Elegant", "Luxury", "Evening"], en: ["Elegant", "Luxury", "Evening"] }
  },

  "Jimmy Choo Man Blue Eau de Toilette": {
    miniTag: { sr: "❄️ Fresh / Daily", en: "❄️ Fresh / Daily" },
    card: {
      sr: "Ležerno svež — aromatične note, crni biber i sivo drvo.",
      en: "Casually fresh — aromatic notes, black pepper and grey woods."
    },
    modal: {
      sr: "Opušten, moderan i lak za nošenje. Aromatična svežina sa začinskim dodirom daje urban i prijatan karakter.",
      en: "Relaxed, modern and easy to wear. Aromatic freshness with a spicy touch creates an urban and pleasant character."
    },
    scentType: { sr: "Fresh spicy aromatic", en: "Fresh spicy aromatic" },
    dominantNotes: {
      sr: ["aromatične note", "crni biber", "drveni tonovi", "lavanda"],
      en: ["aromatic notes", "black pepper", "woody notes", "lavender"]
    },
    tags: { sr: ["Fresh", "Casual", "Easy"], en: ["Fresh", "Casual", "Easy"] }
  },

  "L'Homme Eau de Parfum by Yves Saint Laurent": {
    miniTag: { sr: "💎 Luxury / Signature", en: "💎 Luxury / Signature" },
    card: {
      sr: "Elegantno zavodljiv — začini, lavanda i sofisticirano drvo.",
      en: "Elegantly seductive — spices, lavender and sophisticated woods."
    },
    modal: {
      sr: "Miris doteranog samopouzdanja. Začini i lavanda otvaraju elegantno, dok drvena toplina daje ozbiljnu sofisticiranost.",
      en: "A scent of polished confidence. Spices and lavender open elegantly, while woody warmth brings serious sophistication."
    },
    scentType: { sr: "Spicy aromatic woody", en: "Spicy aromatic woody" },
    dominantNotes: {
      sr: ["začini", "lavanda", "drveni tonovi", "amber"],
      en: ["spices", "lavender", "woody notes", "amber"]
    },
    tags: { sr: ["Elegant", "Refined", "Date Night"], en: ["Elegant", "Refined", "Date Night"] }
  },

  "L'Homme Idéal De Guerlain Paris Eau De Toilette": {
    miniTag: { sr: "💎 Luxury / Signature", en: "💎 Luxury / Signature" },
    card: {
      sr: "Chic i drugačiji — badem, citrusi i toplo drvo.",
      en: "Chic and distinctive — almond, citrus and warm woods."
    },
    modal: {
      sr: "Francuska elegancija sa karakterom. Badem daje poseban potpis, dok citrusi i drvo održavaju miris elegantnim i modernim.",
      en: "French elegance with character. Almond gives it a distinctive signature, while citrus and woods keep the scent elegant and modern."
    },
    scentType: { sr: "Almond citrus woody", en: "Almond citrus woody" },
    dominantNotes: {
      sr: ["badem", "citrusi", "drveni tonovi", "začini"],
      en: ["almond", "citrus", "woody notes", "spices"]
    },
    tags: { sr: ["Elegant", "Unique", "Refined"], en: ["Elegant", "Unique", "Refined"] }
  },

  "Mancera Cedrat Boise Eau de Parfum": {
    miniTag: { sr: "🔥 Bestseller", en: "🔥 Bestseller" },
    card: {
      sr: "Citrusno-drveni luksuz — limun, voćna svežina i kremasto drvo.",
      en: "Citrus-woody luxury — lemon, fruity freshness and creamy woods."
    },
    modal: {
      sr: "Energija uspeha u bočici. Svetao citrusni opening, voćna slatkoća i kremasta drvena baza daju luksuz bez napora.",
      en: "The energy of success in a bottle. A bright citrus opening, fruity sweetness and a creamy woody base deliver effortless luxury."
    },
    scentType: { sr: "Citrus fruity woody", en: "Citrus fruity woody" },
    dominantNotes: {
      sr: ["limun", "voćne note", "drveni tonovi", "vanila"],
      en: ["lemon", "fruity notes", "woody notes", "vanilla"]
    },
    tags: { sr: ["Luxury", "Fresh", "Signature"], en: ["Luxury", "Fresh", "Signature"] }
  },

  "Montblanc Explorer Extreme Parfum": {
    miniTag: { sr: "💎 Luxury / Signature", en: "💎 Luxury / Signature" },
    card: {
      sr: "Avanturistički i dubok — citrusi, pačuli i snažno drvo.",
      en: "Adventurous and deep — citrus, patchouli and powerful woods."
    },
    modal: {
      sr: "Miris kretanja, samopouzdanja i modernog muškog stila. Citrusna svežina prelazi u zemljani pačuli i moćnu drvenu bazu.",
      en: "A scent of movement, confidence and modern masculine style. Citrus freshness moves into earthy patchouli and a powerful woody base."
    },
    scentType: { sr: "Citrus earthy woody", en: "Citrus earthy woody" },
    dominantNotes: {
      sr: ["citrusi", "pačuli", "drveni tonovi", "zemljani akordi"],
      en: ["citrus", "patchouli", "woody notes", "earthy accords"]
    },
    tags: { sr: ["Masculine", "Modern", "Versatile"], en: ["Masculine", "Modern", "Versatile"] }
  },

  "Narciso Rodriguez for Him Bleu Noir Eau de Parfum": {
    miniTag: { sr: "💎 Luxury / Signature", en: "💎 Luxury / Signature" },
    card: {
      sr: "Misteriozan i čist — mošus, iris i tamna elegancija.",
      en: "Mysterious and clean — musk, iris and dark elegance."
    },
    modal: {
      sr: "Diskretan, ali veoma sofisticiran. Mošus i iris daju čist, taman i zavodljivo elegantan potpis.",
      en: "Discreet yet highly sophisticated. Musk and iris create a clean, dark and seductively elegant signature."
    },
    scentType: { sr: "Musky powdery woody", en: "Musky powdery woody" },
    dominantNotes: {
      sr: ["mošus", "iris", "drveni tonovi", "začinski tonovi"],
      en: ["musk", "iris", "woody notes", "spicy tones"]
    },
    tags: { sr: ["Elegant", "Dark", "Refined"], en: ["Elegant", "Dark", "Refined"] }
  },

  "Terre d'Hermès Eau de Toilette": {
    miniTag: { sr: "💎 Luxury / Signature", en: "💎 Luxury / Signature" },
    card: {
      sr: "Suvo elegantan — narandža, vetiver i mineralno drvo.",
      en: "Dry and elegant — orange, vetiver and mineral woods."
    },
    modal: {
      sr: "Miris karaktera i stava. Narandža, vetiver i mineralna suvoća daju jedinstven, ozbiljan i bezvremenski potpis.",
      en: "A scent of character and attitude. Orange, vetiver and mineral dryness create a unique, serious and timeless signature."
    },
    scentType: { sr: "Citrus earthy woody", en: "Citrus earthy woody" },
    dominantNotes: {
      sr: ["narandža", "vetiver", "mineralni tonovi", "drveni tonovi"],
      en: ["orange", "vetiver", "mineral tones", "woody notes"]
    },
    tags: { sr: ["Classic", "Refined", "Signature"], en: ["Classic", "Refined", "Signature"] }
  },

  "Tom Ford Noir Extreme Eau de Parfum": {
    miniTag: { sr: "🍯 Sweet / Date Night", en: "🍯 Sweet / Date Night" },
    card: {
      sr: "Bogato i zavodljivo — kardamom, vanila i kremasti amber.",
      en: "Rich and seductive — cardamom, vanilla and creamy amber."
    },
    modal: {
      sr: "Večernji luksuz u punom sjaju. Začinski opening, kremasta vanila i topli amber daju senzualan i veoma bogat trag.",
      en: "Evening luxury at full intensity. A spicy opening, creamy vanilla and warm amber create a sensual and very rich trail."
    },
    scentType: { sr: "Sweet spicy amber", en: "Sweet spicy amber" },
    dominantNotes: {
      sr: ["kardamom", "vanila", "amber", "kremasti tonovi"],
      en: ["cardamom", "vanilla", "amber", "creamy tones"]
    },
    tags: { sr: ["Luxury", "Date Night", "Rich"], en: ["Luxury", "Date Night", "Rich"] }
  }
};

const fallbackCopy = {
  miniTag: {
    sr: "💎 Luxury / Signature",
    en: "💎 Luxury / Signature"
  },
  card: {
    sr: "Premium miris sa karakterom i pažljivo biranim akordima.",
    en: "A premium fragrance with character and carefully chosen accords."
  },
  modal: {
    sr: "Pažljivo odabran miris sa upečatljivim stilom, dominantnim akordima i premium PlayNice karakterom.",
    en: "A carefully selected fragrance with distinctive style, dominant accords and premium PlayNice character."
  },
  scentType: {
    sr: "Signature fragrance",
    en: "Signature fragrance"
  },
  dominantNotes: {
    sr: ["premium akordi"],
    en: ["premium accords"]
  },
  tags: {
    sr: ["Signature"],
    en: ["Signature"]
  }
  whyChoose: {
  sr: "Odličan izbor za otkrivanje mirisa sa karakterom, jasnim identitetom i premium utiskom u decant formatu.",
  en: "A strong choice for discovering a fragrance with character, clear identity and a premium feel in decant format."
}
};

const PRODUCTS_PER_PAGE = 12;
const SHIPPING_COST = 3.5;
const FREE_SHIPPING_THRESHOLD = 39;

function formatPrice(value) {
  return `€${Number(value).toFixed(2)}`;
}

function getDefaultLanguage() {
  if (typeof window === "undefined") return "en";

  const savedLang = window.localStorage.getItem("playnice_lang");
  if (savedLang === "sr" || savedLang === "en") return savedLang;

  const browserLang = (window.navigator.language || "").toLowerCase();
  if (
    browserLang.startsWith("sr") ||
    browserLang.startsWith("hr") ||
    browserLang.startsWith("bs") ||
    browserLang.startsWith("me")
  ) {
    return "sr";
  }

  return "en";
}

function getFallbackDescription(product, lang) {
  const map = {
    sr: {
      Arabian:
        "Pažljivo odabran arapski parfem sa izraženim karakterom, odličnim odnosom cene i utiska, i idealan za otkrivanje kroz decant format.",
      Designer:
        "Pažljivo odabran dizajnerski parfem sa premium karakterom, elegantnim nastupom i odličnom prilikom da ga prvo testiraš kroz decant format.",
      Niche:
        "Pažljivo odabran niche parfem sa luksuznim karakterom, dubinom i izraženim signature potencijalom.",
      Summer:
        "Svetao, svež i dopadljiv parfem idealan za toplije dane, odmor i lagano nošenje."
    },
    en: {
      Arabian:
        "A carefully selected Arabian fragrance with strong character, excellent value and an ideal profile for discovery through decant format.",
      Designer:
        "A carefully selected designer fragrance with premium character, refined presence and a perfect profile to discover through decant format.",
      Niche:
        "A carefully selected niche fragrance with luxurious character, depth and strong signature potential.",
      Summer:
        "A bright, fresh and easy-to-love fragrance ideal for warm weather, holidays and effortless wear."
    }
  };

  return map[lang]?.[product.category] || map.en.Designer;
}

function getFallbackVibe(product, lang) {
  const map = {
    sr: {
      Arabian: "Karakter • Value • Upečatljiv trag",
      Designer: "Elegantno • Dopadljivo • Premium osećaj",
      Niche: "Luksuz • Dubina • Signature potencijal",
      Summer: "Sveže • Svetlo • Letnji vajb"
    },
    en: {
      Arabian: "Character • Value • Strong trail",
      Designer: "Elegant • Appealing • Premium feel",
      Niche: "Luxury • Depth • Signature potential",
      Summer: "Fresh • Bright • Summer mood"
    }
  };

  return map[lang]?.[product.category] || map.en.Designer;
}

function getProductCopy(product, lang) {
  const copy = productCopy[product.name] || fallbackCopy;

  return {
    miniTag: copy.miniTag?.[lang] || copy.miniTag?.en || fallbackCopy.miniTag[lang],
    card: copy.card?.[lang] || copy.card?.en || fallbackCopy.card[lang],
    modal: copy.modal?.[lang] || copy.modal?.en || fallbackCopy.modal[lang],
    scentType: copy.scentType?.[lang] || copy.scentType?.en || fallbackCopy.scentType[lang],
    dominantNotes:
      copy.dominantNotes?.[lang] ||
      copy.dominantNotes?.en ||
      fallbackCopy.dominantNotes[lang],
    tags: copy.tags?.[lang] || copy.tags?.en || fallbackCopy.tags[lang],
    whyChoose:
      copy.whyChoose?.[lang] ||
      copy.whyChoose?.en ||
      fallbackCopy.whyChoose[lang]
  };
}

function ProductImage({ product, className = "" }) {
  if (product.image) {
    return <img className={className} src={product.image} alt={product.name} />;
  }

  return (
    <div className={`product-image-fallback ${className}`}>
      {product.name.charAt(0)}
    </div>
  );
}

function App() {
  const [lang, setLang] = useState(() => getDefaultLanguage());
  const [view, setView] = useState("home");
  const [category, setCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [addedFeedback, setAddedFeedback] = useState("");
  const [justAddedKey, setJustAddedKey] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderSuccessMessage, setOrderSuccessMessage] = useState("");

  const [checkoutForm, setCheckoutForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    city: "",
    address: "",
    note: ""
  });

  useLayoutEffect(() => {
  window.scrollTo(0, 0);
}, [view]);

  const tr = translations[lang];

  const categories = useMemo(
    () => ["All", "Arabian", "Designer", "Niche", "Summer"],
    []
  );

  const impactProducts = useMemo(
    () =>
      [2, 11, 5]
        .map((id) => products.find((product) => product.id === id))
        .filter(Boolean),
    []
  );

const switchView = (nextView) => {
  if (view === nextView) return;
  setView(nextView);
};

  useEffect(() => {
    window.localStorage.setItem("playnice_lang", lang);
  }, [lang]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlView = params.get("view");
    const urlCategory = params.get("category");
    const urlSearch = params.get("search");
    const urlPage = params.get("page");

    if (urlView && ["home", "shop"].includes(urlView)) setView(urlView);
    if (urlCategory && categories.includes(urlCategory)) setCategory(urlCategory);
    if (urlSearch) setSearchTerm(urlSearch);
    if (urlPage && !Number.isNaN(Number(urlPage))) {
      setCurrentPage(Number(urlPage));
    }
  }, [categories]);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("view", view);

    if (category !== "All") params.set("category", category);
    if (searchTerm.trim()) params.set("search", searchTerm.trim());
    if (currentPage > 1) params.set("page", String(currentPage));

    const query = params.toString();
    const nextUrl = query
      ? `${window.location.pathname}?${query}`
      : window.location.pathname;

    window.history.replaceState({}, "", nextUrl);
  }, [view, category, searchTerm, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [category, searchTerm]);

  useEffect(() => {
    if (!addedFeedback) return;
    const timer = setTimeout(() => setAddedFeedback(""), 1200);
    return () => clearTimeout(timer);
  }, [addedFeedback]);

  useEffect(() => {
    if (!justAddedKey) return;
    const timer = setTimeout(() => setJustAddedKey(""), 900);
    return () => clearTimeout(timer);
  }, [justAddedKey]);

  useEffect(() => {
    if (!orderSuccessMessage) return;
    const timer = setTimeout(() => setOrderSuccessMessage(""), 2200);
    return () => clearTimeout(timer);
  }, [orderSuccessMessage]);

  useEffect(() => {
    if (selectedProduct) {
      const firstSize = Object.keys(selectedProduct.sizes)[0];
      setSelectedSize(firstSize);
    } else {
      setSelectedSize("");
    }
  }, [selectedProduct]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const categoryMatch = category === "All" || product.category === category;
      const searchMatch = product.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      return categoryMatch && searchMatch;
    });
  }, [category, searchTerm]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE)
  );

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [currentPage, totalPages]);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
    return filteredProducts.slice(start, start + PRODUCTS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  const shipping =
    cart.length === 0 ? 0 : subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;

  const total = subtotal + shipping;
  const amountLeftForFreeShipping = Math.max(
    0,
    FREE_SHIPPING_THRESHOLD - subtotal
  );
    const announcementItems = useMemo(() => {
    if (cart.length === 0) {
      return [
        { text: tr.announcementDynamicEmpty1, icon: "🚚" },
        { text: tr.announcementDynamicEmpty2, icon: "✓" },
        { text: tr.announcementDynamicEmpty3, icon: "🔥" },
        { text: tr.announcementDynamicEmpty4, icon: "🔥" },
        { text: tr.announcementDynamicEmpty5, icon: "🚚" }
      ];
    }

    if (subtotal >= FREE_SHIPPING_THRESHOLD) {
      return [
        { text: tr.announcementDynamicUnlocked, icon: "✓", tone: "success" },
        { text: tr.announcementDynamicEmpty3, icon: "🔥" },
        { text: tr.announcementDynamicEmpty4, icon: "🔥" },
        { text: tr.announcementDynamicEmpty5, icon: "🚚" }
      ];
    }

    return [
      {
        text: tr.announcementDynamicLocked.replace(
          "{{amount}}",
          formatPrice(amountLeftForFreeShipping)
        ),
        icon: "🚚",
        tone: "warning"
      },
      { text: tr.announcementDynamicEmpty2, icon: "✓" },
      { text: tr.announcementDynamicEmpty3, icon: "🔥" },
      { text: tr.announcementDynamicEmpty4, icon: "🔥" }
    ];
  }, [cart.length, subtotal, amountLeftForFreeShipping, tr]);
  const freeShippingProgress = Math.min(
    100,
    Math.max(0, (subtotal / FREE_SHIPPING_THRESHOLD) * 100)
  );

  const showFeedback = (text) => {
    setAddedFeedback(text);
  };

  const addToCart = (
    product,
    size,
    customPrice = null,
    customLabel = null,
    options = {}
  ) => {
    const { showToast = true } = options;

    const key = `${product.id}-${size}-${customLabel || ""}`;
    const price = customPrice ?? product.sizes[size];
    const label = customLabel || size;

    setCart((prev) => {
      const existing = prev.find((item) => item.key === key);

      if (existing) {
        return prev.map((item) =>
          item.key === key ? { ...item, quantity: item.quantity + 1 } : item
        );
      }

      return [
        ...prev,
        {
          key,
          id: product.id,
          name: product.name,
          size: label,
          price,
          quantity: 1
        }
      ];
    });

    if (showToast) {
      showFeedback(`${product.name} ${tr.addedToCart}`);
    }
  };

  const triggerInlineAddedFeedback = (productId, size) => {
    const key = `${productId}-${size}`;
    setJustAddedKey(key);

    window.clearTimeout(triggerInlineAddedFeedback.timeoutId);

    triggerInlineAddedFeedback.timeoutId = window.setTimeout(() => {
      setJustAddedKey("");
    }, 900);
  };

  const addHeroBottleToCart = () => {
    const heroProduct = {
      id: 999,
      name: "Afnan 9PM Rebel",
      image: "/hero-bottle.png",
      sizes: { "100ml": 34.9 }
    };

    addToCart(heroProduct, "100ml", 34.9, "100ml Full Bottle");
    setCartOpen(true);
    setCheckoutOpen(true);
  };

  const updateQuantity = (key, delta) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.key === key ? { ...item, quantity: item.quantity + delta } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (key) => {
    setCart((prev) => prev.filter((item) => item.key !== key));
  };

  const handleCheckoutInput = (e) => {
    const { name, value } = e.target;
    setCheckoutForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      alert(tr.emptyCartAlert);
      return;
    }

    if (
      !checkoutForm.firstName.trim() ||
      !checkoutForm.lastName.trim() ||
      !checkoutForm.email.trim() ||
      !checkoutForm.phone.trim() ||
      !checkoutForm.city.trim() ||
      !checkoutForm.address.trim()
    ) {
      alert(tr.fillRequired);
      return;
    }

    setIsSubmittingOrder(true);

    try {
      const payload = {
        customer: {
          firstName: checkoutForm.firstName.trim(),
          lastName: checkoutForm.lastName.trim(),
          email: checkoutForm.email.trim(),
          phone: checkoutForm.phone.trim(),
          city: checkoutForm.city.trim(),
          address: checkoutForm.address.trim(),
          note: checkoutForm.note.trim()
        },
        items: cart,
        subtotal,
        shipping,
        total,
        language: lang
      };

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error("Checkout request failed");
      }

      setOrderSuccessMessage(tr.orderSuccess);
      setCart([]);
      setCheckoutForm({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        city: "",
        address: "",
        note: ""
      });

      setTimeout(() => {
        setCheckoutOpen(false);
        setCartOpen(false);
      }, 1800);
    } catch (error) {
      alert(tr.orderError);
    } finally {
      setIsSubmittingOrder(false);
    }
  };

const goToShop = () => {
  setView("shop");
};

const nextPage = () => {
  setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  requestAnimationFrame(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
};

const prevPage = () => {
  setCurrentPage((prev) => Math.max(1, prev - 1));
  requestAnimationFrame(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
};

  const openProductModal = (product) => {
    setSelectedProduct(product);
  };

  const closeProductModal = () => {
    setSelectedProduct(null);
  };

  const openImpactProductModal = (product) => {
    if (!product) return;
    setSelectedProduct(product);
  };

  const addSelectedProductToCart = () => {
    if (!selectedProduct || !selectedSize) return;
    addToCart(selectedProduct, selectedSize);
    setCartOpen(true);
  };

  const getCategoryLabel = (categoryKey) => {
    if (categoryKey === "All") return tr.all;
    return categoryLabels[categoryKey]?.[lang] || categoryKey;
  };

const getProductDescription = (product) => {
  const copy = getProductCopy(product, lang);
  return copy.modal || getFallbackDescription(product, lang);
};

const getProductVibe = (product) => {
  const copy = getProductCopy(product, lang);

  if (copy?.dominantNotes?.length) {
    return copy.dominantNotes.slice(0, 3).join(" • ");
  }

  return getFallbackVibe(product, lang);
};

  const selectedCopy = selectedProduct
  ? getProductCopy(selectedProduct, lang)
  : {
      miniTag: fallbackCopy.miniTag[lang],
      card: fallbackCopy.card[lang],
      modal: fallbackCopy.modal[lang],
      scentType: fallbackCopy.scentType[lang],
      dominantNotes: fallbackCopy.dominantNotes[lang],
      tags: fallbackCopy.tags[lang]
    };

const ProductCard = ({ product }) => {
  const copy = getProductCopy(product, lang);

  return (
    <article
      className="product-card clickable"
      key={product.id}
      onClick={() => openProductModal(product)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openProductModal(product);
        }
      }}
    >
      {product.badge && <span className="product-badge">{product.badge}</span>}

      <div className="product-image">
        <ProductImage product={product} className="product-image-real" />
      </div>

      <div className="product-meta">
        <p className="product-category">{getCategoryLabel(product.category)}</p>
        <h3>{product.name}</h3>

        <div className="product-copy-block">
          <span className="product-mini-tag">{copy.miniTag}</span>
          <p className="product-card-copy">{copy.card}</p>
        </div>

        <p className="product-price-from">
          {tr.from} {formatPrice(Math.min(...Object.values(product.sizes)))}
        </p>
      </div>

      <div className="product-preview-line">
        <span>{tr.openDetails}</span>
        <strong>{tr.luxuryModal}</strong>
      </div>

      <div
        className="size-buttons"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        {Object.entries(product.sizes).map(([size, price]) => {
          const feedbackKey = `${product.id}-${size}`;
          const isJustAdded = justAddedKey === feedbackKey;

          return (
            <button
              key={size}
              type="button"
              className={`size-chip ${isJustAdded ? "is-added" : ""}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                e.currentTarget.blur();

                addToCart(product, size, null, null, { showToast: false });
                triggerInlineAddedFeedback(product.id, size);
              }}
            >
              <span className="size-chip-main">{size}</span>
              <strong>{formatPrice(price)}</strong>

              <span className={`size-chip-feedback ${isJustAdded ? "show" : ""}`}>
                {tr.justAdded}
              </span>
            </button>
          );
        })}
      </div>
    </article>
  );
};

  return (
 <div className="app-shell">
<header className="topbar">
  <button className="brand" type="button" onClick={() => switchView("home")}>
    <span className="brand-mark">▶</span>
    <span className="brand-copy">
      <strong>PlayNice</strong>
      <small>Remember. PlayNice.</small>
    </span>
  </button>

  <nav className="nav-links">
    <button
      type="button"
      className={view === "home" ? "active" : ""}
      onClick={() => switchView("home")}
    >
      {tr.navHome}
    </button>
    <button
      type="button"
      className={view === "shop" ? "active" : ""}
      onClick={() => switchView("shop")}
    >
      {tr.navShop}
    </button>
  </nav>

  <div className="topbar-right">
    <div className="lang-switch">
      <button
        className={lang === "en" ? "active" : ""}
        onClick={() => setLang("en")}
        type="button"
      >
        EN
      </button>
      <button
        className={lang === "sr" ? "active" : ""}
        onClick={() => setLang("sr")}
        type="button"
      >
        SR
      </button>
    </div>

    <button
      className="cart-button"
      type="button"
      onClick={() => setCartOpen((prev) => !prev)}
    >
      {tr.cart}
      {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
    </button>
  </div>
</header>

<div
  className={`announcement-bar ${
    cart.length === 0
      ? ""
      : subtotal >= FREE_SHIPPING_THRESHOLD
      ? "announcement-bar-success"
      : "announcement-bar-warning"
  }`}
>
  <div className="announcement-bar-inner">
    <div className="announcement-marquee">
      <div className="announcement-track">
        {[...announcementItems, ...announcementItems].map((item, index) => (
          <React.Fragment key={`${item.text}-${index}`}>
            <span
              className={`announcement-text ${
                item.tone ? `announcement-${item.tone}` : ""
              }`}
            >
              {item.text}
            </span>

            <span
              className={`announcement-icon ${
                item.tone ? `announcement-${item.tone}` : ""
              }`}
            >
              {item.icon}
            </span>
          </React.Fragment>
        ))}
      </div>
    </div>

    <div className="announcement-progress-shell">
      <div className="announcement-progress-bar">
        <div
          className="announcement-progress-fill"
          style={{
            width:
              cart.length === 0
                ? "100%"
                : `${Math.min(
                    100,
                    (subtotal / FREE_SHIPPING_THRESHOLD) * 100
                  )}%`
          }}
        />
      </div>
    </div>
  </div>
</div>

{addedFeedback && <div className="added-feedback">{addedFeedback}</div>}

<main>
        {view === "home" && (
          <>
            <section className="hero">
              <div className="hero-grid">
                <div className="hero-copy">
                  <p className="eyebrow">{tr.heroEyebrow}</p>
                  <h1>
                    {tr.heroTitleLine1}
                    <br />
                    {tr.heroTitleLine2}
                  </h1>
                  <p className="hero-text">{tr.heroText}</p>

                  <div className="hero-price-line">
                    <span className="old-price">€45.90</span>
                    <span className="new-price">{tr.heroNow}</span>
                    <span className="hero-offer-text">{tr.heroOffer}</span>
                  </div>

                  <div className="hero-actions">
                    <button className="gold-button" type="button" onClick={goToShop}>
                      {tr.exploreCollection}
                    </button>
                    <button
                      className="ghost-button"
                      type="button"
                      onClick={addHeroBottleToCart}
                    >
                      {tr.claimOffer}
                    </button>
                  </div>
                </div>

                <div className="hero-visual">
                  <button
                    className="hero-bottle-wrap"
                    type="button"
                    onClick={addHeroBottleToCart}
                    aria-label="Add Afnan 9PM Rebel full bottle to cart"
                  >
                    <img
                      className="hero-bottle"
                      src="/hero-bottle.png"
                      alt="Afnan 9PM Rebel"
                    />
                  </button>
                </div>
              </div>
            </section>

            <section className="value-strip">
              <div>{tr.valueTry}</div>
              <div>{tr.valuePremium}</div>
              <div>{tr.valueDelivery}</div>
            </section>

            <div className="section-divider" />

            <section className="featured-section section-wrap">
              <div className="section-head">
                <p className="section-kicker">{tr.highlightsKicker}</p>
                <h2>{tr.highlightsTitle}</h2>
                <p>{tr.highlightsText}</p>
              </div>

              <div className="feature-grid">
                <article
                  className="feature-card large"
                  role="button"
                  tabIndex={0}
                  onClick={() => openImpactProductModal(impactProducts[0])}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      openImpactProductModal(impactProducts[0]);
                    }
                  }}
                >
                  <div className="feature-image-wrap">
                    <img src="/9pm.png" alt="Afnan 9PM Rebel" className="feature-image" />
                  </div>
                  <span className="feature-tag">{tr.campaignPick}</span>
                  <h3>Afnan 9PM Rebel</h3>
                  <p>{tr.rebelCardText}</p>
                  <button
                    className="inline-link"
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      addHeroBottleToCart();
                    }}
                  >
                    {tr.add100ml}
                  </button>
                </article>

                <article
                  className="feature-card"
                  role="button"
                  tabIndex={0}
                  onClick={() => openImpactProductModal(impactProducts[1])}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      openImpactProductModal(impactProducts[1]);
                    }
                  }}
                >
                  <div className="feature-image-wrap">
                    <img
                      src="/island.png"
                      alt="Khadlaj Island Dreams Extrait de Parfum"
                      className="feature-image"
                    />
                  </div>
                  <span className="feature-tag">{tr.summerHit}</span>
                  <h3>Khadlaj Island Dreams Extrait de Parfum</h3>
                  <p>{tr.islandDreamsText}</p>
                </article>

                <article
                  className="feature-card"
                  role="button"
                  tabIndex={0}
                  onClick={() => openImpactProductModal(impactProducts[2])}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      openImpactProductModal(impactProducts[2]);
                    }
                  }}
                >
                  <div className="feature-image-wrap">
                    <img
                      src="/marwa.png"
                      alt="Arabiyat Prestige Marwa"
                      className="feature-image"
                    />
                  </div>
                  <span className="feature-tag">{tr.arabianEdge}</span>
                  <h3>Arabiyat Prestige Marwa</h3>
                  <p>{tr.marwaText}</p>
                </article>
              </div>
            </section>

            <div className="section-divider" />

            <section className="homepage-shop-preview section-wrap">
              <div className="section-head">
                <p className="section-kicker">{tr.privateSelection}</p>
                <h2>{tr.bestsellersTitle}</h2>
                <p>{tr.bestsellersText}</p>
              </div>

              <div className="product-grid">
                {[1, 2, 4, 7]
                  .map((id) => products.find((product) => product.id === id))
                  .filter(Boolean)
                  .map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
              </div>

              <div className="section-cta-center">
                <button className="gold-button" type="button" onClick={goToShop}>
                  {tr.viewFullCollection}
                </button>
              </div>
            </section>

            <div className="section-divider" />

            <section className="cta-section">
              <h2>{tr.discoverTitle}</h2>
              <p>{tr.discoverText}</p>
              <button type="button" onClick={goToShop}>
                {tr.exploreCollection}
              </button>
            </section>
          </>
        )}

        {view === "shop" && (
          <section className="shop-section section-wrap">
            <div className="shop-top">
              <div>
                <p className="section-kicker">{tr.shopKicker}</p>
                <h2>{tr.shopTitle}</h2>
                <p className="shop-subtext">{tr.shopText}</p>
              </div>
            </div>

            <div className="shop-toolbar">
              <div className="toolbar-group">
                <label>{tr.searchLabel}</label>
                <input
                  type="text"
                  placeholder={tr.searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="toolbar-group">
                <label>{tr.categoryLabel}</label>
                <select
                  className="category-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {getCategoryLabel(cat)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="product-grid">
              {paginatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            <div className="pagination-wrap">
              <button type="button" onClick={prevPage} disabled={currentPage === 1}>
                Prev
              </button>
              <span>
                {tr.page} {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                onClick={nextPage}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </section>
        )}
      </main>

      <aside className={`cart-drawer ${cartOpen ? "open" : ""}`}>
        <div className="cart-drawer-header">
          <div>
            <p className="section-kicker">{tr.yourCart}</p>
            <h3>{tr.selectedItems}</h3>
          </div>
          <button className="close-button" type="button" onClick={() => setCartOpen(false)}>
            ×
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="cart-empty">
            <p>{tr.cartEmpty}</p>
            <button className="gold-button small" type="button" onClick={goToShop}>
              {tr.goToShop}
            </button>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cart.map((item) => (
                <div className="cart-item" key={item.key}>
                  <div className="cart-item-info">
                    <h4>{item.name}</h4>
                    <p>{item.size}</p>
                    <strong>{formatPrice(item.price)}</strong>
                  </div>

                  <div className="cart-item-actions">
                    <div className="qty-control">
                      <button type="button" onClick={() => updateQuantity(item.key, -1)}>
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button type="button" onClick={() => updateQuantity(item.key, 1)}>
                        +
                      </button>
                    </div>
                    <button
                      className="remove-link"
                      type="button"
                      onClick={() => removeFromCart(item.key)}
                    >
                      {tr.remove}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <div>
                <span>{tr.subtotal}</span>
                <strong>{formatPrice(subtotal)}</strong>
              </div>

              <div>
                <span>{tr.shipping}</span>
                <strong>
                  {shipping === 0 && cart.length > 0 ? "FREE" : formatPrice(shipping)}
                </strong>
              </div>

              {cart.length > 0 && (
                <div
                  className={`shipping-progress-card ${
                    subtotal >= FREE_SHIPPING_THRESHOLD
                      ? "shipping-note-unlocked"
                      : "shipping-note-locked"
                  }`}
                >
                  <div className="shipping-note">
                    {subtotal >= FREE_SHIPPING_THRESHOLD
                      ? `${tr.freeShippingUnlocked} ✓`
                      : tr.freeShippingProgress.replace(
                          "{{amount}}",
                          formatPrice(amountLeftForFreeShipping)
                        )}
                  </div>

                  <div className="shipping-progress-bar">
                    <div
                      className="shipping-progress-fill"
                      style={{ width: `${freeShippingProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="cart-total">
                <span>{tr.total}</span>
                <strong>{formatPrice(total)}</strong>
              </div>
            </div>

            <button
              className="gold-button checkout-button"
              type="button"
              onClick={() => setCheckoutOpen(true)}
            >
              {tr.continueCheckout}
            </button>
          </>
        )}
      </aside>

      <div
        className={`backdrop ${cartOpen || checkoutOpen || selectedProduct ? "show" : ""}`}
        onClick={() => {
          setCartOpen(false);
          setCheckoutOpen(false);
          closeProductModal();
        }}
      />

      <div className={`product-modal ${selectedProduct ? "open" : ""}`}>
        {selectedProduct && (
          <>
            <div className="product-modal-header">
              <div>
                <p className="section-kicker">{tr.privateSelectionModal}</p>
                <h3>{selectedProduct.name}</h3>
              </div>
              <button className="close-button" type="button" onClick={closeProductModal}>
                ×
              </button>
            </div>

            <div className="product-modal-grid">
              <div className="product-modal-visual">
                {selectedProduct.badge && (
                  <span className="product-modal-badge">{selectedProduct.badge}</span>
                )}

                <div className="product-modal-image-wrap">
                  <ProductImage product={selectedProduct} className="product-modal-image" />
                </div>

                <div className="product-modal-meta">
                  <p className="product-modal-category">
                    {getCategoryLabel(selectedProduct.category)}
                  </p>
                  <p className="product-modal-vibe">{getProductVibe(selectedProduct)}</p>
                </div>
              </div>

              <div className="product-modal-content">
<div className="product-modal-copy">
  <span className="product-mini-tag">{selectedCopy.miniTag}</span>

  <p className="product-modal-description">
    {selectedCopy.modal}
  </p>

  <p className="product-modal-notes">
    Dominantne note: {selectedCopy.dominantNotes.join(", ")}
  </p>

<div className="product-modal-info-box">
  <span>{tr.whyChoose}</span>
  <strong>{selectedCopy.whyChoose}</strong>
</div>

                <div className="product-modal-sizes">
                  <p className="modal-label">{tr.chooseSize}</p>

                  <div className="modal-size-grid">
                    {Object.entries(selectedProduct.sizes).map(([size, price]) => (
                      <button
                        key={size}
                        type="button"
                        className={`modal-size-button ${
                          selectedSize === size ? "active" : ""
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          setSelectedSize(size);
                        }}
                      >
                        <span>{size}</span>
                        <strong>{formatPrice(price)}</strong>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="product-modal-footer">
                  <div className="product-modal-price">
                    <span>{tr.selectedPrice}</span>
                    <strong>
                      {selectedSize ? formatPrice(selectedProduct.sizes[selectedSize]) : "—"}
                    </strong>
                  </div>

                  <button
                    className="gold-button modal-add-button"
                    type="button"
                    onClick={addSelectedProductToCart}
                  >
                    {tr.addToCart}
                  </button>
                </div>

                <p className="product-modal-note">{tr.modalNote}</p>
              </div>
            </div>
          </>
        )}
      </div>

      <div className={`checkout-modal ${checkoutOpen ? "open" : ""}`}>
        <div className="checkout-header">
          <div>
            <p className="section-kicker">{tr.checkoutKicker}</p>
            <h3>{tr.checkoutTitle}</h3>
          </div>
          <button className="close-button" type="button" onClick={() => setCheckoutOpen(false)}>
            ×
          </button>
        </div>

        <div className="checkout-grid">
          <div className="checkout-form">
            <div className="form-row two">
              <input
                name="firstName"
                placeholder={tr.firstName}
                value={checkoutForm.firstName}
                onChange={handleCheckoutInput}
              />
              <input
                name="lastName"
                placeholder={tr.lastName}
                value={checkoutForm.lastName}
                onChange={handleCheckoutInput}
              />
            </div>

            <div className="form-row two">
              <input
                name="email"
                type="email"
                placeholder={tr.email}
                value={checkoutForm.email}
                onChange={handleCheckoutInput}
              />
              <input
                name="phone"
                placeholder={tr.phone}
                value={checkoutForm.phone}
                onChange={handleCheckoutInput}
              />
            </div>

            <div className="form-row two">
              <input
                name="city"
                placeholder={tr.city}
                value={checkoutForm.city}
                onChange={handleCheckoutInput}
              />
              <input
                name="address"
                placeholder={tr.address}
                value={checkoutForm.address}
                onChange={handleCheckoutInput}
              />
            </div>

            <div className="form-row">
              <textarea
                name="note"
                placeholder={tr.note}
                rows="4"
                value={checkoutForm.note}
                onChange={handleCheckoutInput}
              />
            </div>

            {orderSuccessMessage && (
              <div className="order-success-message">{orderSuccessMessage}</div>
            )}

            <button
              className="gold-button submit-order-button"
              type="button"
              onClick={handlePlaceOrder}
              disabled={isSubmittingOrder}
            >
              {isSubmittingOrder ? tr.placingOrder : tr.placeOrder}
            </button>
          </div>

          <div className="checkout-summary">
            <h4>{tr.orderSummary}</h4>

            {cart.length === 0 ? (
              <p className="checkout-empty">{tr.noItemsCart}</p>
            ) : (
              <>
                <div className="checkout-summary-items">
                  {cart.map((item) => (
                    <div className="checkout-summary-item" key={item.key}>
                      <div>
                        <strong>{item.name}</strong>
                        <p>
                          {item.size} × {item.quantity}
                        </p>
                      </div>
                      <span>{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                <div
                  className={`shipping-progress-card checkout-shipping-note ${
                    subtotal >= FREE_SHIPPING_THRESHOLD
                      ? "shipping-note-unlocked"
                      : "shipping-note-locked"
                  }`}
                >
                  <div className="shipping-note">
                    {subtotal >= FREE_SHIPPING_THRESHOLD
                      ? `${tr.freeShippingUnlocked} ✓`
                      : tr.freeShippingProgress.replace(
                          "{{amount}}",
                          formatPrice(amountLeftForFreeShipping)
                        )}
                  </div>

                  <div className="shipping-progress-bar">
                    <div
                      className="shipping-progress-fill"
                      style={{ width: `${freeShippingProgress}%` }}
                    />
                  </div>
                </div>

                <div className="checkout-totals">
                  <div>
                    <span>{tr.subtotal}</span>
                    <strong>{formatPrice(subtotal)}</strong>
                  </div>
                  <div>
                    <span>{tr.shipping}</span>
                    <strong>
                      {shipping === 0 && cart.length > 0 ? "FREE" : formatPrice(shipping)}
                    </strong>
                  </div>
                  <div className="grand-total">
                    <span>{tr.total}</span>
                    <strong>{formatPrice(total)}</strong>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;