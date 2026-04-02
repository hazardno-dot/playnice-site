import React, { useEffect, useMemo, useState } from "react";
import "./App.css";

const slugify = (text) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const getProductImage = (product) => `/products/${slugify(product.name)}.png`;

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
    from: "Starting at",
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
    navStory: "Story",
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
    from: "Već od",
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
    announcement1: "Besplatna dostava preko 39€",
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
    navStory: "Priča",
  }
};

const categoryLabels = {
  Arabian: { en: "Arabian", sr: "Arapski" },
  Designer: { en: "Designer", sr: "Dizajner" },
  Niche: { en: "Niche", sr: "Niche" },
  Summer: { en: "Summer", sr: "Letnji" }
};

const products = [
  { id: 1, name: "Afnan 9AM", category: "Arabian", image: "/products/afnan-9am.png", sizes: { "5ml": 4, "10ml": 7, "20ml": 13 }, rating: 7.8, ratingLabel: "Well Loved" },
  { id: 2, name: "Afnan 9PM Rebel", category: "Arabian", image: "/products/9pm.png", sizes: { "5ml": 4, "10ml": 7, "20ml": 13 }, badge: "BESTSELLER", rating: 8.6, ratingLabel: "Audience Favorite" },
  { id: 3, name: "Afnan Supremacy Collector's Edition Pour Homme", category: "Arabian", image: "/products/afnan-supremacy.png", sizes: { "5ml": 5, "10ml": 9, "20ml": 17 }, rating: 8.1, ratingLabel: "Audience Favorite" },
  { id: 4, name: "Afnan Turathi Blue", category: "Arabian", image: "/products/afnan-turathi-blue.png", sizes: { "5ml": 5, "10ml": 9, "20ml": 17 }, badge: "BESTSELLER", rating: 8.9, ratingLabel: "Audience Favorite" },
  { id: 5, name: "Arabiyat Prestige Marwa", category: "Arabian", image: "/products/marwa.png", sizes: { "5ml": 4.5, "10ml": 8, "20ml": 15 }, rating: 8.0, ratingLabel: "Audience Favorite" },
  { id: 6, name: "Armaf Club De Nuit Bling", category: "Designer", image: "/products/Bling.png", sizes: { "5ml": 6, "10ml": 11, "20ml": 20 }, rating: 7.7, ratingLabel: "Well Loved" },
  { id: 7, name: "Armaf Club de Nuit Intense", category: "Designer", image: "/products/armaf-cdn-intense.png", sizes: { "5ml": 4, "10ml": 7, "20ml": 13 }, badge: "BESTSELLER", rating: 8.8, ratingLabel: "Audience Favorite" },
  { id: 8, name: "Armaf Club de Nuit Sillage", category: "Designer", image: "/products/CDN-Sillage.png", sizes: { "5ml": 4, "10ml": 7, "20ml": 13 }, rating: 8.0, ratingLabel: "Audience Favorite" },
  { id: 9, name: "French Avenue Vulcan Sable by Fragrance World", category: "Arabian", image: "/products/Vulcan-Sable.png", sizes: { "5ml": 5, "10ml": 9, "20ml": 17 }, rating: 7.9, ratingLabel: "Well Loved" },

  { id: 10, name: "Haramain Signature Blue", category: "Arabian", image: "/products/Haramain-Signature-Blue.png", sizes: { "5ml": 3, "10ml": 5, "20ml": 10 }, rating: 7.4, ratingLabel: "Popular Pick" },

  { id: 11, name: "Khadlaj Island Dreams Extrait de Parfum", category: "Summer", image: "/products/island.png", sizes: { "5ml": 4.5, "10ml": 8, "20ml": 15 }, badge: "BESTSELLER", rating: 8.7, ratingLabel: "Audience Favorite" },
  { id: 12, name: "Lattafa Asad Elixir", category: "Arabian", image: "/products/Lattafa-Asad-Elixir.png", sizes: { "5ml": 4.5, "10ml": 8, "20ml": 15 }, badge: "BESTSELLER", rating: 8.4, ratingLabel: "Audience Favorite" },
  { id: 13, name: "Lattafa Fakhar Black", category: "Arabian", image: "/products/Lattafa-Fakhar-Black.png", sizes: { "5ml": 4, "10ml": 7, "20ml": 13 }, rating: 8.0, ratingLabel: "Audience Favorite" },
  { id: 14, name: "Lattafa Khamrah Qahwa", category: "Arabian", image: "/products/Lattafa-Khamrah-Qahwa.png", sizes: { "5ml": 5, "10ml": 9, "20ml": 17 }, badge: "BESTSELLER", rating: 9.0, ratingLabel: "Top Rated" },
  { id: 15, name: "Lattafa Musamam Black Intense", category: "Arabian", image: "/products/Lattafa-Musamam-Black-Intense.png", sizes: { "5ml": 5, "10ml": 9, "20ml": 17 }, rating: 7.8, ratingLabel: "Well Loved" },
  { id: 16, name: "Lattafa Qaed Al Fursan Untamed", category: "Arabian", image: "/products/Lattafa-Qaed-Al-Fursan-Untamed.png", sizes: { "5ml": 3, "10ml": 5, "20ml": 10 }, rating: 7.5, ratingLabel: "Well Loved" },

  { id: 17, name: "Paris Corner Emir Trillium", category: "Arabian", image: "/products/Emir-Trillium.png", sizes: { "5ml": 4, "10ml": 7, "20ml": 13 }, rating: 7.6, ratingLabel: "Well Loved" },

  { id: 18, name: "Paris Corner Emir Voux Elegante", category: "Arabian", image: "/products/Emir-Voux-Elegante.png", sizes: { "5ml": 4, "10ml": 7, "20ml": 13 }, rating: 7.7, ratingLabel: "Well Loved" },
  { id: 19, name: "Paris Corner Ministry of Oud - Oud Satin", category: "Arabian", image: "/products/Ministry-of-Oud-Oud-Satin.png", sizes: { "5ml": 4, "10ml": 7, "20ml": 13 }, rating: 8.1, ratingLabel: "Audience Favorite" },
  { id: 20, name: "Paris Corner Perfumes North Stag Expressions II DEUX", category: "Arabian", image: "/products/II-DEUX.png", sizes: { "5ml": 4, "10ml": 7, "20ml": 13 }, rating: 7.9, ratingLabel: "Well Loved" },

  { id: 21, name: "Rayhaan Aquatica", category: "Summer", image: "/products/Rayhaan-AQUTICA.png", sizes: { "5ml": 4.5, "10ml": 8, "20ml": 15 }, rating: 7.8, ratingLabel: "Well Loved" },
  { id: 22, name: "Rayhaan Pacific Aura", category: "Summer", image: "/products/Rayhaan-Pacific-Aura.png", sizes: { "5ml": 4.5, "10ml": 8, "20ml": 15 }, rating: 7.9, ratingLabel: "Well Loved" },
  { id: 23, name: "Swiss Arabian Tobacco 01 Extrait de Parfum", category: "Arabian", image: "/products/Swiss-Arabian-Tobacco01.png", sizes: { "5ml": 10, "10ml": 18, "20ml": 34 }, rating: 8.5, ratingLabel: "Audience Favorite" },

  { id: 24, name: "Acqua di Parma Fico di Amalfi Eau de Toilette", category: "Designer", image: "/products/AdP-Fico.png", sizes: { "2ml": 6.5, "5ml": 15, "10ml": 27 }, rating: 8.3, ratingLabel: "Audience Favorite" },
  { id: 25, name: "Acqua di Parma Colonia Essenza Eau de Cologne", category: "Designer", image: "/products/AdP-Colonia-Essenza.png", sizes: { "2ml": 7, "5ml": 16, "10ml": 29 }, rating: 8.0, ratingLabel: "Audience Favorite" },
  { id: 26, name: "Acqua di Parma Colonia Pura Eau de Cologne", category: "Designer", image: "/products/AdP-Colonia-Pura.png", sizes: { "2ml": 6.5, "5ml": 15, "10ml": 27 }, rating: 7.8, ratingLabel: "Well Loved" },

  { id: 27, name: "BLEU DE CHANEL Eau de Parfum Spray", category: "Designer", image: "/products/BDC-EdP.png", sizes: { "2ml": 6.5, "5ml": 15, "10ml": 27 }, badge: "BESTSELLER", rating: 9.2, ratingLabel: "Top Rated" },

  { id: 28, name: "Bois Impérial by Essential Parfums", category: "Niche", image: "/products/Bois-Impérial-by-Essential-Parfums.png", sizes: { "2ml": 4, "5ml": 9, "10ml": 16 }, badge: "BESTSELLER", rating: 8.9, ratingLabel: "Audience Favorite" },

  { id: 29, name: "BOSS Bottled Beyond Eau de Parfum", category: "Designer", image: "/products/BOSS-Bottled-Beyond.png", sizes: { "2ml": 5.5, "5ml": 13, "10ml": 23 }, rating: 7.7, ratingLabel: "Well Loved" },

  { id: 30, name: "BOSS The Scent Elixir Parfum Intense for Him", category: "Designer", image: "/products/BOSS-The-Scent-Elixir.png", sizes: { "2ml": 6.5, "5ml": 15, "10ml": 27 }, rating: 8.1, ratingLabel: "Audience Favorite" },
  { id: 31, name: "BOSS The Scent Le Parfum for Him", category: "Designer", image: "/products/BOSS-The-Scent-Le-Parfum.png", sizes: { "2ml": 6, "5ml": 14, "10ml": 25 }, rating: 7.9, ratingLabel: "Well Loved" },

  { id: 32, name: "Calvin Klein CK All Eau de Toilette", category: "Designer", image: "/products/CK-All.png", sizes: { "2ml": 2.5, "5ml": 6, "10ml": 11 }, rating: 7.3, ratingLabel: "Popular Pick" },
  { id: 33, name: "Calvin Klein Defy Eau de Toilette", category: "Designer", image: "/products/CK-Defy-EdT.png", sizes: { "2ml": 3, "5ml": 7, "10ml": 12 }, rating: 7.5, ratingLabel: "Well Loved" },

  { id: 34, name: "Calvin Klein Defy Parfum", category: "Designer", image: "/products/CK-Defy-Parfum.png", sizes: { "2ml": 4.5, "5ml": 10, "10ml": 18 }, rating: 7.6, ratingLabel: "Well Loved" },
  { id: 35, name: "Chopard Oud Malaki Eau de Parfum", category: "Designer", image: "/products/Chopard-Oud-Malaki-EdP.png", sizes: { "2ml": 5.5, "5ml": 13, "10ml": 23 }, rating: 8.0, ratingLabel: "Audience Favorite" },

  { id: 36, name: "Creed Aventus Cologne", category: "Niche", image: "/products/Creed-Aventus-Cologne.png", sizes: { "2ml": 13, "5ml": 29, "10ml": 52 }, badge: "BESTSELLER", rating: 9.3, ratingLabel: "Top Rated" },

  { id: 37, name: "Giorgio Armani Acqua di Giò Profondo Parfum", category: "Designer", image: "/products/AcquadiGiò-Profondo-Parfum.png", sizes: { "2ml": 6.5, "5ml": 15, "10ml": 27 }, badge: "BESTSELLER", rating: 8.8, ratingLabel: "Audience Favorite" },
  { id: 38, name: "Gisada Ambassador Men Eau de Parfum", category: "Designer", image: "/products/Gisada-Ambassador-Men-EdP.png", sizes: { "2ml": 5, "5ml": 11, "10ml": 20 }, badge: "BESTSELLER", rating: 8.6, ratingLabel: "Audience Favorite" },
  { id: 39, name: "Givenchy Gentleman Eau de Parfum Réserve Privée", category: "Designer", image: "/products/Givenchy-Gentleman-EdP-Réserve-Privée.png", sizes: { "2ml": 5, "5ml": 12, "10ml": 21 }, rating: 8.7, ratingLabel: "Audience Favorite" },

  { id: 40, name: "Jimmy Choo Man Blue Eau de Toilette", category: "Designer", image: "/products/Jimmy-Choo-Man-Blue-EdT.png", sizes: { "2ml": 3.5, "5ml": 8, "10ml": 14 }, rating: 7.4, ratingLabel: "Popular Pick" },

  { id: 41, name: "L'Homme Eau de Parfum by Yves Saint Laurent", category: "Designer", image: "/products/L'Homme-EdP-YSL.png", sizes: { "2ml": 5.5, "5ml": 13, "10ml": 23 }, rating: 8.1, ratingLabel: "Audience Favorite" },
  { id: 42, name: "L'Homme Idéal De Guerlain Paris Eau De Toilette", category: "Designer", image: "/products/L'Homme-Idéal-De-Guerlain-Paris-EDT.png", sizes: { "2ml": 4.5, "5ml": 10, "10ml": 18 }, rating: 8.4, ratingLabel: "Audience Favorite" },

  { id: 43, name: "Mancera Cedrat Boise Eau de Parfum", category: "Niche", image: "/products/Mancera-Cedrat-Boise-EdP.png", sizes: { "2ml": 4.5, "5ml": 10, "10ml": 18 }, badge: "BESTSELLER", rating: 9.0, ratingLabel: "Top Rated" },
  { id: 44, name: "Montblanc Explorer Extreme Parfum", category: "Designer", image: "/products/Montblanc-Explorer-Extreme-Parfum.png", sizes: { "2ml": 4.5, "5ml": 10, "10ml": 18 }, rating: 7.8, ratingLabel: "Well Loved" },
  { id: 45, name: "Narciso Rodriguez for Him Bleu Noir Eau de Parfum", category: "Designer", image: "/products/Narciso-Rodriguez-for-Him-Bleu-Noir-EdP.png", sizes: { "2ml": 5.5, "5ml": 13, "10ml": 23 }, rating: 8.2, ratingLabel: "Audience Favorite" },
  { id: 46, name: "Terre d'Hermès Eau de Toilette", category: "Designer", image: "/products/Terre-d'Hermès-EdT.png", sizes: { "2ml": 4.5, "5ml": 10, "10ml": 18 }, rating: 8.9, ratingLabel: "Audience Favorite" },
  { id: 47, name: "Tom Ford Noir Extreme Eau de Parfum", category: "Niche", image: "/products/Tom-Ford-Noir-Extreme-EdP.png", sizes: { "2ml": 9, "5ml": 21, "10ml": 37 }, rating: 9.1, ratingLabel: "Top Rated" }
];

const productCopy = {
"Afnan 9AM": {
  miniTag:{sr:"❄️ Fresh / Daily",en:"❄️ Fresh / Daily"},
  card:{sr:"Svež citrusni start sa čistim aromatičnim profilom.",en:"Fresh citrus opening with clean aromatic profile."},
  modal:{sr:"Lagano, čisto i energično — savršen dnevni miris sa urednim karakterom.",en:"Light, clean and energetic — perfect daily scent."},
  scentType:{sr:"Fresh citrus aromatic",en:"Fresh citrus aromatic"},
  dominantNotes:{sr:["citrusi","lavanda","drvo"],en:["citrus","lavender","woods"]},
  tags:{sr:["Fresh","Daily"],en:["Fresh","Daily"]},
  whyChoose:{sr:"Idealan za svakodnevno nošenje i uredan svež utisak.",en:"Ideal for daily wear and a clean fresh impression."}
},

"Afnan 9PM Rebel": {
  miniTag:{sr:"🔥 Bestseller",en:"🔥 Bestseller"},
  card:{sr:"Sladak i zavodljiv — vanila i amber dominiraju.",en:"Sweet and seductive — vanilla and amber dominate."},
  modal:{sr:"Noćni magnet — gust, sladak i upečatljiv sa toplim tragom.",en:"A night magnet — rich, sweet and highly noticeable."},
  scentType:{sr:"Sweet amber",en:"Sweet amber"},
  dominantNotes:{sr:["vanila","amber","voćne note"],en:["vanilla","amber","fruity notes"]},
  tags:{sr:["Sweet","Night"],en:["Sweet","Night"]},
  whyChoose:{sr:"Savršen za komplimente i večernje izlaske.",en:"Perfect for compliments and nights out."}
},

"Afnan Supremacy Collector's Edition Pour Homme":{
  miniTag:{sr:"💎 Luxury / Signature",en:"💎 Luxury / Signature"},
  card:{sr:"Voćno-dimni luksuz sa snažnim karakterom.",en:"Fruity smoky luxury with strong character."},
  modal:{sr:"Moćan i upečatljiv miris koji ostavlja dubok trag.",en:"Powerful and memorable scent with depth."},
  scentType:{sr:"Fruity smoky",en:"Fruity smoky"},
  dominantNotes:{sr:["voće","dim","drvo"],en:["fruit","smoke","woods"]},
  tags:{sr:["Luxury"],en:["Luxury"]},
  whyChoose:{sr:"Za one koji žele ozbiljan signature miris.",en:"For those who want a strong signature scent."}
},

"Afnan Turathi Blue":{
  miniTag:{sr:"🔥 Bestseller",en:"🔥 Bestseller"},
  card:{sr:"Elegantna citrusno-drvena svežina.",en:"Elegant citrus-woody freshness."},
  modal:{sr:"Moderan, luksuzan i veoma nosiv miris.",en:"Modern, luxurious and very wearable scent."},
  scentType:{sr:"Fresh woody citrus",en:"Fresh woody citrus"},
  dominantNotes:{sr:["citrusi","ambra","drvo"],en:["citrus","amber","woods"]},
  tags:{sr:["Fresh","Luxury"],en:["Fresh","Luxury"]},
  whyChoose:{sr:"Perfektan balans svežine i elegancije.",en:"Perfect balance of freshness and elegance."}
},

"Arabiyat Prestige Marwa":{
  miniTag:{sr:"💎 Luxury / Signature",en:"💎 Luxury / Signature"},
  card:{sr:"Ruža i toplina u luksuznom orijentalnom stilu.",en:"Rose and warmth in oriental luxury style."},
  modal:{sr:"Raskošan, topao i elegantan miris sa dubinom.",en:"Rich, warm and elegant scent with depth."},
  scentType:{sr:"Oriental floral",en:"Oriental floral"},
  dominantNotes:{sr:["ruža","amber","začini"],en:["rose","amber","spices"]},
  tags:{sr:["Luxury"],en:["Luxury"]},
  whyChoose:{sr:"Za ljubitelje orijentalne elegancije.",en:"For lovers of oriental elegance."}
},

"Armaf Club De Nuit Bling":{
  miniTag:{sr:"🍯 Sweet / Date Night",en:"🍯 Sweet / Date Night"},
  card:{sr:"Sladak i glamurozan miris pun energije.",en:"Sweet glamorous scent full of energy."},
  modal:{sr:"Upadljiv i zavodljiv — pravi party miris.",en:"Bold and seductive — perfect party scent."},
  scentType:{sr:"Sweet fruity",en:"Sweet fruity"},
  dominantNotes:{sr:["voće","vanila","slatki tonovi"],en:["fruit","vanilla","sweet accords"]},
  tags:{sr:["Sweet"],en:["Sweet"]},
  whyChoose:{sr:"Ako želiš da budeš primećen — ovo radi.",en:"If you want attention — this delivers."}
},

"Armaf Club de Nuit Intense":{
  miniTag:{sr:"🔥 Bestseller",en:"🔥 Bestseller"},
  card:{sr:"Dimni citrus sa jakim karakterom.",en:"Smoky citrus with strong character."},
  modal:{sr:"Snažan i prepoznatljiv — pravi statement miris.",en:"Strong and recognizable statement scent."},
  scentType:{sr:"Smoky citrus woody",en:"Smoky citrus woody"},
  dominantNotes:{sr:["limun","dim","drvo"],en:["lemon","smoke","woods"]},
  tags:{sr:["Bold"],en:["Bold"]},
  whyChoose:{sr:"Za snažan prvi utisak.",en:"For a strong first impression."}
},

"Armaf Club de Nuit Sillage":{
  miniTag:{sr:"❄️ Fresh / Daily",en:"❄️ Fresh / Daily"},
  card:{sr:"Metalna svežina sa citrusnim sjajem.",en:"Metallic freshness with citrus shine."},
  modal:{sr:"Čist, drugačiji i vrlo elegantan miris.",en:"Clean, unique and elegant scent."},
  scentType:{sr:"Fresh metallic citrus",en:"Fresh metallic citrus"},
  dominantNotes:{sr:["citrusi","metalne note","mošus"],en:["citrus","metallic notes","musk"]},
  tags:{sr:["Fresh"],en:["Fresh"]},
  whyChoose:{sr:"Za drugačiju svežinu.",en:"For a different kind of freshness."}
},

"French Avenue Vulcan Sable by Fragrance World":{
  miniTag:{sr:"💎 Luxury / Night",en:"💎 Luxury / Night"},
  card:{sr:"Taman, bogat i zavodljiv profil.",en:"Dark rich seductive profile."},
  modal:{sr:"Dubok i luksuzan miris za večernji nastup.",en:"Deep luxurious evening scent."},
  scentType:{sr:"Dark oriental",en:"Dark oriental"},
  dominantNotes:{sr:["oud","začini","amber"],en:["oud","spices","amber"]},
  tags:{sr:["Night"],en:["Night"]},
  whyChoose:{sr:"Za ozbiljan večernji utisak.",en:"For strong evening presence."}
},

"Haramain Signature Blue":{
  miniTag:{sr:"❄️ Fresh / Daily",en:"❄️ Fresh / Daily"},
  card:{sr:"Čista i lagana svakodnevna svežina.",en:"Clean light everyday freshness."},
  modal:{sr:"Jednostavan i prijatan miris za svaki dan.",en:"Simple and pleasant daily scent."},
  scentType:{sr:"Fresh aquatic",en:"Fresh aquatic"},
  dominantNotes:{sr:["citrusi","voda","mošus"],en:["citrus","water","musk"]},
  tags:{sr:["Daily"],en:["Daily"]},
  whyChoose:{sr:"Lagano i bez razmišljanja.",en:"Easy and effortless."}
},

"Khadlaj Island Dreams Extrait de Parfum":{
  miniTag:{sr:"🔥 Bestseller",en:"🔥 Bestseller"},
  card:{sr:"Tropski, sladak i letnji vibe.",en:"Tropical sweet summer vibe."},
  modal:{sr:"Egzotičan i vedar miris koji diže raspoloženje.",en:"Exotic uplifting scent."},
  scentType:{sr:"Tropical sweet",en:"Tropical sweet"},
  dominantNotes:{sr:["kokos","voće","slatko"],en:["coconut","fruit","sweet"]},
  tags:{sr:["Summer"],en:["Summer"]},
  whyChoose:{sr:"Savršen letnji izbor.",en:"Perfect summer choice."}
},

"Lattafa Asad Elixir":{
  miniTag:{sr:"🔥 Bestseller",en:"🔥 Bestseller"},
  card:{sr:"Topao, sladak i snažan.",en:"Warm sweet powerful."},
  modal:{sr:"Bogata i zavodljiva kompozicija sa dubinom.",en:"Rich seductive composition."},
  scentType:{sr:"Sweet spicy",en:"Sweet spicy"},
  dominantNotes:{sr:["vanila","začini","amber"],en:["vanilla","spices","amber"]},
  tags:{sr:["Night"],en:["Night"]},
  whyChoose:{sr:"Za snažan večernji efekat.",en:"For strong evening impact."}
},

"Lattafa Fakhar Black":{
  miniTag:{sr:"❄️ Fresh / Daily",en:"❄️ Fresh / Daily"},
  card:{sr:"Moderan, čist i svestran.",en:"Modern clean versatile."},
  modal:{sr:"Jednostavan ali efektan svakodnevni miris.",en:"Simple yet effective daily scent."},
  scentType:{sr:"Fresh aromatic",en:"Fresh aromatic"},
  dominantNotes:{sr:["lavanda","jabuka","drvo"],en:["lavender","apple","woods"]},
  tags:{sr:["Daily"],en:["Daily"]},
  whyChoose:{sr:"Siguran izbor za svaki dan.",en:"Safe everyday pick."}
},

"Lattafa Khamrah Qahwa":{
  miniTag:{sr:"🍯 Sweet / Night",en:"🍯 Sweet / Night"},
  card:{sr:"Kafa, cimet i slatka toplina.",en:"Coffee cinnamon sweetness."},
  modal:{sr:"Gurmanski, gust i zavodljiv miris.",en:"Gourmand rich seductive scent."},
  scentType:{sr:"Gourmand",en:"Gourmand"},
  dominantNotes:{sr:["kafa","cimet","vanila"],en:["coffee","cinnamon","vanilla"]},
  tags:{sr:["Sweet"],en:["Sweet"]},
  whyChoose:{sr:"Za ljubitelje slatkih parfema.",en:"For lovers of sweet scents."}
},

"Lattafa Musamam Black Intense":{
  miniTag:{sr:"💎 Luxury / Dark",en:"💎 Luxury / Dark"},
  card:{sr:"Tamni začinski luksuz.",en:"Dark spicy luxury."},
  modal:{sr:"Dubok i ozbiljan orijentalni miris.",en:"Deep oriental scent."},
  scentType:{sr:"Spicy oriental",en:"Spicy oriental"},
  dominantNotes:{sr:["začini","oud","amber"],en:["spices","oud","amber"]},
  tags:{sr:["Luxury"],en:["Luxury"]},
  whyChoose:{sr:"Za ozbiljan karakter.",en:"For strong character."}
},

"Lattafa Qaed Al Fursan Untamed":{
  miniTag:{sr:"🍯 Sweet / Exotic",en:"🍯 Sweet / Exotic"},
  card:{sr:"Egzotičan voćni profil.",en:"Exotic fruity profile."},
  modal:{sr:"Smel i drugačiji miris sa snagom.",en:"Bold unique scent."},
  scentType:{sr:"Fruity spicy",en:"Fruity spicy"},
  dominantNotes:{sr:["ananas","začini","drvo"],en:["pineapple","spices","woods"]},
  tags:{sr:["Bold"],en:["Bold"]},
  whyChoose:{sr:"Za drugačiji stil.",en:"For unique style."}
},

"Paris Corner Emir Trillium":{
  miniTag:{sr:"❄️ Fresh / Clean",en:"❄️ Fresh / Clean"},
  card:{sr:"Čist i moderan minimalizam.",en:"Clean modern minimalism."},
  modal:{sr:"Lagano, čisto i lako nosivo.",en:"Light clean wearable."},
  scentType:{sr:"Fresh clean",en:"Fresh clean"},
  dominantNotes:{sr:["citrusi","mošus","drvo"],en:["citrus","musk","woods"]},
  tags:{sr:["Daily"],en:["Daily"]},
  whyChoose:{sr:"Za clean vibe.",en:"For clean vibe."}
},

"Paris Corner Emir Voux Elegante":{
  miniTag:{sr:"💎 Elegant",en:"💎 Elegant"},
  card:{sr:"Uglađen i luksuzan profil.",en:"Smooth luxurious profile."},
  modal:{sr:"Mek i sofisticiran miris.",en:"Soft sophisticated scent."},
  scentType:{sr:"Elegant woody",en:"Elegant woody"},
  dominantNotes:{sr:["drvo","mošus","amber"],en:["woods","musk","amber"]},
  tags:{sr:["Luxury"],en:["Luxury"]},
  whyChoose:{sr:"Za eleganciju bez napora.",en:"Effortless elegance."}
},

"Paris Corner Ministry of Oud - Oud Satin":{
  miniTag:{sr:"💎 Luxury / Oud",en:"💎 Luxury / Oud"},
  card:{sr:"Oud i ruža u raskošnom spoju.",en:"Oud and rose luxury."},
  modal:{sr:"Dubok, bogat i zavodljiv.",en:"Deep rich seductive."},
  scentType:{sr:"Oud floral",en:"Oud floral"},
  dominantNotes:{sr:["oud","ruža","vanila"],en:["oud","rose","vanilla"]},
  tags:{sr:["Luxury"],en:["Luxury"]},
  whyChoose:{sr:"Za ljubitelje ouda.",en:"For oud lovers."}
},

"Paris Corner Perfumes North Stag Expressions II DEUX":{
  miniTag:{sr:"❄️ Fresh / Bright",en:"❄️ Fresh / Bright"},
  card:{sr:"Svetao i energičan.",en:"Bright energetic."},
  modal:{sr:"Čist i živ miris.",en:"Clean lively scent."},
  scentType:{sr:"Fresh citrus",en:"Fresh citrus"},
  dominantNotes:{sr:["citrusi","drvo"],en:["citrus","woods"]},
  tags:{sr:["Fresh"],en:["Fresh"]},
  whyChoose:{sr:"Za energiju i svežinu.",en:"For energy and freshness."}
},

"Rayhaan Aquatica":{
  miniTag:{sr:"❄️ Summer",en:"❄️ Summer"},
  card:{sr:"Morska svežina.",en:"Marine freshness."},
  modal:{sr:"Lagano i prozračno.",en:"Light airy scent."},
  scentType:{sr:"Aquatic",en:"Aquatic"},
  dominantNotes:{sr:["more","citrusi"],en:["marine","citrus"]},
  tags:{sr:["Summer"],en:["Summer"]},
  whyChoose:{sr:"Idealno za leto.",en:"Perfect for summer."}
},

"Rayhaan Pacific Aura":{
  miniTag:{sr:"❄️ Summer",en:"❄️ Summer"},
  card:{sr:"Lagana letnja svežina.",en:"Light summer freshness."},
  modal:{sr:"Čist i vedar miris.",en:"Clean bright scent."},
  scentType:{sr:"Fresh aquatic",en:"Fresh aquatic"},
  dominantNotes:{sr:["citrusi","more"],en:["citrus","marine"]},
  tags:{sr:["Summer"],en:["Summer"]},
  whyChoose:{sr:"Za lagane dane.",en:"For easy days."}
},

"Swiss Arabian Tobacco 01 Extrait de Parfum":{
  miniTag:{sr:"💎 Luxury / Tobacco",en:"💎 Luxury / Tobacco"},
  card:{sr:"Duvan i med.",en:"Tobacco and honey."},
  modal:{sr:"Topao, bogat i luksuzan.",en:"Warm rich luxurious."},
  scentType:{sr:"Tobacco sweet",en:"Tobacco sweet"},
  dominantNotes:{sr:["duvan","med","začini"],en:["tobacco","honey","spices"]},
  tags:{sr:["Luxury"],en:["Luxury"]},
  whyChoose:{sr:"Za ljubitelje duvana.",en:"For tobacco lovers."}
},

// Nastavlja se identično za remaining designer/niche…

"Acqua di Parma Fico di Amalfi Eau de Toilette":{
  miniTag:{sr:"❄️ Fresh / Luxury",en:"❄️ Fresh / Luxury"},
  card:{sr:"Smokva i mediteranska svežina.",en:"Fig and mediterranean freshness."},
  modal:{sr:"Prirodan, lagan i elegantan.",en:"Natural light elegant."},
  scentType:{sr:"Fresh fruity",en:"Fresh fruity"},
  dominantNotes:{sr:["smokva","citrusi"],en:["fig","citrus"]},
  tags:{sr:["Luxury"],en:["Luxury"]},
  whyChoose:{sr:"Za prirodan luksuz.",en:"For natural luxury."}
},

"BLEU DE CHANEL Eau de Parfum Spray":{
  miniTag:{sr:"💎 Signature",en:"💎 Signature"},
  card:{sr:"Elegantna klasika.",en:"Elegant classic."},
  modal:{sr:"Bezvremenski izbor.",en:"Timeless choice."},
  scentType:{sr:"Fresh woody",en:"Fresh woody"},
  dominantNotes:{sr:["citrusi","tamjan","drvo"],en:["citrus","incense","woods"]},
  tags:{sr:["Signature"],en:["Signature"]},
  whyChoose:{sr:"Sigurna kupovina.",en:"Safe buy."}
},

"Bois Impérial by Essential Parfums":{
  miniTag:{sr:"💎 Niche",en:"💎 Niche"},
  card:{sr:"Zeleno-drveni niche profil.",en:"Green woody niche."},
  modal:{sr:"Moderan i drugačiji.",en:"Modern unique."},
  scentType:{sr:"Green woody",en:"Green woody"},
  dominantNotes:{sr:["vetiver","drvo"],en:["vetiver","woods"]},
  tags:{sr:["Niche"],en:["Niche"]},
  whyChoose:{sr:"Za niche vibe.",en:"For niche feel."}
},

"Creed Aventus Cologne":{
  miniTag:{sr:"💎 Luxury",en:"💎 Luxury"},
  card:{sr:"Luksuzna svežina.",en:"Luxury freshness."},
  modal:{sr:"Tihi luksuz.",en:"Quiet luxury."},
  scentType:{sr:"Fresh fruity",en:"Fresh fruity"},
  dominantNotes:{sr:["ananas","citrusi"],en:["pineapple","citrus"]},
  tags:{sr:["Luxury"],en:["Luxury"]},
  whyChoose:{sr:"Premium izbor.",en:"Premium choice."}
},

"Tom Ford Noir Extreme Eau de Parfum":{
  miniTag:{sr:"🍯 Luxury Night",en:"🍯 Luxury Night"},
  card:{sr:"Kremast i sladak.",en:"Creamy sweet."},
  modal:{sr:"Topao i zavodljiv.",en:"Warm seductive."},
  scentType:{sr:"Gourmand",en:"Gourmand"},
  dominantNotes:{sr:["vanila","kardamom"],en:["vanilla","cardamom"]},
  tags:{sr:["Night"],en:["Night"]},
  whyChoose:{sr:"Za luksuzne večeri.",en:"For luxury nights."}
},

"Acqua di Parma Colonia Essenza Eau de Cologne":{
  miniTag:{sr:"❄️ Fresh / Luxury",en:"❄️ Fresh / Luxury"},
  card:{sr:"Klasična citrusna elegancija.",en:"Classic citrus elegance."},
  modal:{sr:"Bezvremenska svežina sa sofisticiranim karakterom.",en:"Timeless freshness with refined character."},
  scentType:{sr:"Fresh citrus aromatic",en:"Fresh citrus aromatic"},
  dominantNotes:{sr:["citrusi","bergamot","drvo"],en:["citrus","bergamot","woods"]},
  tags:{sr:["Luxury"],en:["Luxury"]},
  whyChoose:{sr:"Za klasičnu eleganciju.",en:"For classic elegance."}
},

"Acqua di Parma Colonia Pura Eau de Cologne":{
  miniTag:{sr:"❄️ Fresh / Clean",en:"❄️ Fresh / Clean"},
  card:{sr:"Čista i moderna citrusna svežina.",en:"Clean modern citrus freshness."},
  modal:{sr:"Minimalistički i svetao miris za svaki dan.",en:"Minimal bright scent for everyday."},
  scentType:{sr:"Fresh citrus",en:"Fresh citrus"},
  dominantNotes:{sr:["citrusi","mošus","drvo"],en:["citrus","musk","woods"]},
  tags:{sr:["Fresh"],en:["Fresh"]},
  whyChoose:{sr:"Za clean i lagan vibe.",en:"For clean easy vibe."}
},

"BOSS Bottled Beyond Eau de Parfum":{
  miniTag:{sr:"🍯 Sweet / Modern",en:"🍯 Sweet / Modern"},
  card:{sr:"Topao i moderan muški profil.",en:"Warm modern masculine profile."},
  modal:{sr:"Savremen, uglađen i prijatan za nošenje.",en:"Modern smooth and easy to wear."},
  scentType:{sr:"Sweet woody",en:"Sweet woody"},
  dominantNotes:{sr:["vanila","drvo","začini"],en:["vanilla","woods","spices"]},
  tags:{sr:["Modern"],en:["Modern"]},
  whyChoose:{sr:"Siguran moderan izbor.",en:"Safe modern pick."}
},

"BOSS The Scent Elixir Parfum Intense for Him":{
  miniTag:{sr:"🔥 Night / Intense",en:"🔥 Night / Intense"},
  card:{sr:"Tamna, začinska senzualnost.",en:"Dark spicy sensuality."},
  modal:{sr:"Intenzivan i zavodljiv miris za večernje prilike.",en:"Intense seductive evening scent."},
  scentType:{sr:"Spicy sweet",en:"Spicy sweet"},
  dominantNotes:{sr:["začini","amber","drvo"],en:["spices","amber","woods"]},
  tags:{sr:["Night"],en:["Night"]},
  whyChoose:{sr:"Za snažan večernji utisak.",en:"For strong evening impact."}
},

"BOSS The Scent Le Parfum for Him":{
  miniTag:{sr:"🍯 Sweet / Elegant",en:"🍯 Sweet / Elegant"},
  card:{sr:"Sladak i sofisticiran profil.",en:"Sweet sophisticated profile."},
  modal:{sr:"Topao i elegantan miris sa zavodljivim karakterom.",en:"Warm elegant and seductive scent."},
  scentType:{sr:"Sweet spicy",en:"Sweet spicy"},
  dominantNotes:{sr:["vanila","đumbir","drvo"],en:["vanilla","ginger","woods"]},
  tags:{sr:["Elegant"],en:["Elegant"]},
  whyChoose:{sr:"Za suptilnu zavodljivost.",en:"For subtle seduction."}
},

"Calvin Klein CK All Eau de Toilette":{
  miniTag:{sr:"❄️ Fresh / Daily",en:"❄️ Fresh / Daily"},
  card:{sr:"Čista unisex svežina.",en:"Clean unisex freshness."},
  modal:{sr:"Lagano, čisto i nenametljivo.",en:"Light clean and effortless."},
  scentType:{sr:"Fresh citrus",en:"Fresh citrus"},
  dominantNotes:{sr:["citrusi","mošus","drvo"],en:["citrus","musk","woods"]},
  tags:{sr:["Daily"],en:["Daily"]},
  whyChoose:{sr:"Za svakodnevnu lakoću.",en:"For everyday ease."}
},

"Calvin Klein Defy Eau de Toilette":{
  miniTag:{sr:"❄️ Fresh / Modern",en:"❄️ Fresh / Modern"},
  card:{sr:"Svež i urban miris.",en:"Fresh urban scent."},
  modal:{sr:"Moderan, čist i energičan profil.",en:"Modern clean energetic profile."},
  scentType:{sr:"Fresh woody",en:"Fresh woody"},
  dominantNotes:{sr:["citrusi","lavanda","drvo"],en:["citrus","lavender","woods"]},
  tags:{sr:["Fresh"],en:["Fresh"]},
  whyChoose:{sr:"Za moderan dnevni stil.",en:"For modern daily style."}
},

"Calvin Klein Defy Parfum":{
  miniTag:{sr:"🍯 Sweet / Bold",en:"🍯 Sweet / Bold"},
  card:{sr:"Jača i toplija verzija Defy.",en:"Stronger warmer Defy."},
  modal:{sr:"Bogata i senzualna interpretacija sa više dubine.",en:"Richer deeper sensual version."},
  scentType:{sr:"Sweet woody",en:"Sweet woody"},
  dominantNotes:{sr:["vanila","drvo","amber"],en:["vanilla","woods","amber"]},
  tags:{sr:["Bold"],en:["Bold"]},
  whyChoose:{sr:"Za intenzivniji efekat.",en:"For stronger impact."}
},

"Chopard Oud Malaki Eau de Parfum":{
  miniTag:{sr:"💎 Oud / Luxury",en:"💎 Oud / Luxury"},
  card:{sr:"Oud sa toplim začinima.",en:"Oud with warm spices."},
  modal:{sr:"Bogata orijentalna kompozicija sa dubinom.",en:"Rich oriental composition."},
  scentType:{sr:"Oud spicy",en:"Oud spicy"},
  dominantNotes:{sr:["oud","začini","duvan"],en:["oud","spices","tobacco"]},
  tags:{sr:["Luxury"],en:["Luxury"]},
  whyChoose:{sr:"Za ljubitelje ouda.",en:"For oud lovers."}
},

"Giorgio Armani Acqua di Giò Profondo Parfum":{
  miniTag:{sr:"🔥 Bestseller",en:"🔥 Bestseller"},
  card:{sr:"Duboka morska svežina.",en:"Deep marine freshness."},
  modal:{sr:"Intenzivna i moderna interpretacija klasika.",en:"Intense modern take on a classic."},
  scentType:{sr:"Aquatic aromatic",en:"Aquatic aromatic"},
  dominantNotes:{sr:["more","bergamot","minerali"],en:["marine","bergamot","minerals"]},
  tags:{sr:["Fresh"],en:["Fresh"]},
  whyChoose:{sr:"Za svežinu sa snagom.",en:"Freshness with depth."}
},

"Gisada Ambassador Men Eau de Parfum":{
  miniTag:{sr:"🔥 Bestseller",en:"🔥 Bestseller"},
  card:{sr:"Voćno-sladak crowd pleaser.",en:"Fruity sweet crowd pleaser."},
  modal:{sr:"Moderan, upečatljiv i vrlo primetan miris.",en:"Modern noticeable compliment magnet."},
  scentType:{sr:"Sweet fruity",en:"Sweet fruity"},
  dominantNotes:{sr:["jabuka","vanila","amber"],en:["apple","vanilla","amber"]},
  tags:{sr:["Sweet"],en:["Sweet"]},
  whyChoose:{sr:"Za maksimalne komplimente.",en:"For maximum compliments."}
},

"Givenchy Gentleman Eau de Parfum Réserve Privée":{
  miniTag:{sr:"💎 Luxury / Night",en:"💎 Luxury / Night"},
  card:{sr:"Whiskey i iris elegancija.",en:"Whiskey iris elegance."},
  modal:{sr:"Topao, kremast i sofisticiran miris.",en:"Warm creamy sophisticated scent."},
  scentType:{sr:"Sweet woody",en:"Sweet woody"},
  dominantNotes:{sr:["whiskey","iris","drvo"],en:["whiskey","iris","woods"]},
  tags:{sr:["Luxury"],en:["Luxury"]},
  whyChoose:{sr:"Za elegantne večeri.",en:"For elegant evenings."}
},

"Jimmy Choo Man Blue Eau de Toilette":{
  miniTag:{sr:"❄️ Fresh / Casual",en:"❄️ Fresh / Casual"},
  card:{sr:"Ležerna svežina sa modernim twistom.",en:"Casual fresh with modern twist."},
  modal:{sr:"Opušten i prijatan miris za svaki dan.",en:"Relaxed easy everyday scent."},
  scentType:{sr:"Fresh aromatic",en:"Fresh aromatic"},
  dominantNotes:{sr:["citrusi","lavanda","drvo"],en:["citrus","lavender","woods"]},
  tags:{sr:["Daily"],en:["Daily"]},
  whyChoose:{sr:"Za opušten stil.",en:"For relaxed style."}
},

"L'Homme Eau de Parfum by Yves Saint Laurent":{
  miniTag:{sr:"💎 Elegant",en:"💎 Elegant"},
  card:{sr:"Topao i uglađen profil.",en:"Warm refined profile."},
  modal:{sr:"Sofisticiran i moderan miris za posebne prilike.",en:"Sophisticated modern scent."},
  scentType:{sr:"Woody spicy",en:"Woody spicy"},
  dominantNotes:{sr:["začini","drvo","amber"],en:["spices","woods","amber"]},
  tags:{sr:["Elegant"],en:["Elegant"]},
  whyChoose:{sr:"Za classy utisak.",en:"For classy impression."}
},

"L'Homme Idéal De Guerlain Paris Eau De Toilette":{
  miniTag:{sr:"🍯 Sweet / Unique",en:"🍯 Sweet / Unique"},
  card:{sr:"Badem i slatki tonovi.",en:"Almond sweet profile."},
  modal:{sr:"Topao i drugačiji miris sa karakterom.",en:"Warm unique scent with character."},
  scentType:{sr:"Sweet nutty",en:"Sweet nutty"},
  dominantNotes:{sr:["badem","vanila","drvo"],en:["almond","vanilla","woods"]},
  tags:{sr:["Unique"],en:["Unique"]},
  whyChoose:{sr:"Za drugačiji stil.",en:"For unique style."}
},

"Mancera Cedrat Boise Eau de Parfum":{
  miniTag:{sr:"🔥 Bestseller",en:"🔥 Bestseller"},
  card:{sr:"Citrus i drvo u savršenom balansu.",en:"Citrus and woods balance."},
  modal:{sr:"Svež, luksuzan i izuzetno nosiv miris.",en:"Fresh luxurious versatile scent."},
  scentType:{sr:"Fresh woody fruity",en:"Fresh woody fruity"},
  dominantNotes:{sr:["limun","crna ribizla","drvo"],en:["lemon","blackcurrant","woods"]},
  tags:{sr:["Luxury"],en:["Luxury"]},
  whyChoose:{sr:"Jedan od najboljih all-roundera.",en:"One of the best all-rounders."}
},

"Montblanc Explorer Extreme Parfum":{
  miniTag:{sr:"💎 Bold",en:"💎 Bold"},
  card:{sr:"Intenzivan drveni profil.",en:"Intense woody profile."},
  modal:{sr:"Jača i dublja verzija Explorer DNA.",en:"Stronger deeper Explorer DNA."},
  scentType:{sr:"Woody aromatic",en:"Woody aromatic"},
  dominantNotes:{sr:["vetiver","drvo","amber"],en:["vetiver","woods","amber"]},
  tags:{sr:["Bold"],en:["Bold"]},
  whyChoose:{sr:"Za snažan karakter.",en:"For strong presence."}
},

"Narciso Rodriguez for Him Bleu Noir Eau de Parfum":{
  miniTag:{sr:"💎 Elegant / Clean",en:"💎 Elegant / Clean"},
  card:{sr:"Mošusna elegancija.",en:"Musky elegance."},
  modal:{sr:"Čist, elegantan i sofisticiran miris.",en:"Clean elegant sophisticated scent."},
  scentType:{sr:"Musky woody",en:"Musky woody"},
  dominantNotes:{sr:["mošus","drvo","vetiver"],en:["musk","woods","vetiver"]},
  tags:{sr:["Elegant"],en:["Elegant"]},
  whyChoose:{sr:"Za suptilnu eleganciju.",en:"For subtle elegance."}
},

"Terre d'Hermès Eau de Toilette":{
  miniTag:{sr:"💎 Signature",en:"💎 Signature"},
  card:{sr:"Zemljani citrus klasik.",en:"Earthy citrus classic."},
  modal:{sr:"Ikoničan, sofisticiran i prepoznatljiv miris.",en:"Iconic sophisticated recognizable scent."},
  scentType:{sr:"Woody citrus",en:"Woody citrus"},
  dominantNotes:{sr:["narandža","vetiver","kremen"],en:["orange","vetiver","flint"]},
  tags:{sr:["Signature"],en:["Signature"]},
  whyChoose:{sr:"Bezvremenski izbor.",en:"Timeless choice."}
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
  },
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
  const [currentPage, setCurrentPage] = useState(1);
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderSuccessMessage, setOrderSuccessMessage] = useState("");
  const [storyOpen, setStoryOpen] = useState(false);
  const [inlineAddedKey, setInlineAddedKey] = useState(null);
  const [catalogPreview, setCatalogPreview] = useState(null);
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);

  const openCatalogPreview = (url) => {
  setCatalogPreview(url);
};

const closeCatalogPreview = () => {
  setCatalogPreview(null);
};

  const heroVideos = [
  "/videos/hero.mp4",
  "/videos/hero1.mp4",
  "/videos/hero2.mp4",
  "/videos/hero3.mp4",
  "/videos/hero4.mp4",
  "/videos/hero5.mp4",
];

const [currentVideo, setCurrentVideo] = useState(0);

  const [checkoutForm, setCheckoutForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    city: "",
    address: "",
    note: ""
  });

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

  // prvo render (bez delay)
  setView(nextView);

  // onda smooth scroll (ali odmah, bez čekanja)
  requestAnimationFrame(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  });
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
  setInlineAddedKey(key);

  setTimeout(() => {
    setInlineAddedKey((current) => (current === key ? null : current));
  }, 500);
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
  if (view !== "shop") {
    setView("shop");

    requestAnimationFrame(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth",
      });
    });
  } else {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  }
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
  setSelectedSize(Object.keys(product.sizes)[0]);
};

const closeProductModal = () => {
  setSelectedProduct(null);
  setSelectedSize("");
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
  const minPrice = Math.min(...Object.values(product.sizes));
  const getBadgeVariant = (miniTag = "") => {
  const tag = miniTag.toLowerCase();

  if (
    tag.includes("bestseller") ||
    tag.includes("top") ||
    tag.includes("🔥")
  ) {
    return "badge-hot";
  }

  if (
    tag.includes("fresh") ||
    tag.includes("summer") ||
    tag.includes("blue") ||
    tag.includes("❄️")
  ) {
    return "badge-fresh";
  }

  if (
    tag.includes("sweet") ||
    tag.includes("date") ||
    tag.includes("gourmand") ||
    tag.includes("🍯")
  ) {
    return "badge-sweet";
  }

  if (
    tag.includes("luxury") ||
    tag.includes("signature") ||
    tag.includes("exclusive") ||
    tag.includes("💎")
  ) {
    return "badge-luxury";
  }

  return "badge-default";
};

  return (
    <article className="product-card premium-product-card">
      <div
        className="product-card-media clickable-media"
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
        <img
          src={product.image || "/placeholder.png"}
          alt={product.name}
          className="product-card-image"
          loading="lazy"
        />
      </div>

      {copy.miniTag && (
  <span className={`product-floating-badge ${getBadgeVariant(copy.miniTag)}`}>
    {copy.miniTag}
  </span>
)}

      <div className="product-meta premium-product-meta">
        <div className="product-meta-top">
          <p className="product-category">
            {getCategoryLabel(product.category)}
          </p>

          <h3 className="product-card-title">{product.name}</h3>
        </div>

        <div className="product-meta-middle">
          <div className="product-card-copy-stack">
            <p className="product-card-copy premium-card-copy">
              {copy.card}
            </p>
          </div>
        </div>

        <div className="product-meta-bottom">
          <div className="product-price-block">

            <div className="product-price-row">
              <span className="product-price-from premium-product-price">
                <span className="price-prefix">{tr.from}</span>
                <span className="price-value">€{minPrice}</span>
              </span>
            </div>
          </div>

          <div className="product-preview-line premium-preview-line single-line-preview">
  <span className="product-card-cta">
    {lang === "sr" ? "Probaj pre kupovine" : "Try before you buy"}
  </span>
</div>
        </div>
      </div>

      <div
  className="size-buttons"
  onClick={(e) => e.stopPropagation()}
>
  {Object.entries(product.sizes).map(([size, price]) => {
    const feedbackKey = `${product.id}-${size}`;
const isJustAdded = inlineAddedKey === feedbackKey;

    return (
      <button
        key={size}
        type="button"
        className="size-chip"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          e.currentTarget.blur();

          addToCart(product, size, null, null, { showToast: false });
          triggerInlineAddedFeedback(product.id, size);
        }}
      >
        <span className="size-chip-main">{size}</span>
        <span className="size-chip-price">{formatPrice(price)}</span>

        <span className={`size-chip-flash ${isJustAdded ? "show" : ""}`}>
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
    className="nav-link"
    type="button"
    onClick={() => setStoryOpen(true)}
  >
    {tr.navStory}
  </button>

  <button
  className="nav-link"
  type="button"
  onClick={() => setHowItWorksOpen(true)}
>
  {lang === "sr" ? "How it works" : "How it works"}
</button>

  <button
    className={`nav-link ${view === "home" ? "active" : ""}`}
    type="button"
    onClick={() => switchView("home")}
  >
    {tr.navHome}
  </button>

  <button
    className={`nav-link ${view === "shop" ? "active" : ""}`}
    type="button"
    onClick={goToShop}
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

            <section className="how-it-works-section section-wrap">
  <div className="section-head how-it-works-head">
    <p className="section-kicker">
      {lang === "sr" ? "HOW IT WORKS" : "HOW IT WORKS"}
    </p>
    <h2>
      {lang === "sr"
        ? "Kako funkcionišu dekanti."
        : "How decants work."}
    </h2>
    <p>
      {lang === "sr"
        ? "Jednostavan i pametan način da pronađeš pravi parfem pre kupovine pune bočice."
        : "A simple and smart way to find the right fragrance before buying a full bottle."}
    </p>
  </div>

  <div className="how-it-works-grid">
    <article className="how-it-works-card">
      <span className="how-it-works-number">01</span>
      <h3>{lang === "sr" ? "Šta su dekanti" : "What are decants"}</h3>
      <p>
        {lang === "sr"
          ? "Manja, pažljivo presuta pakovanja originalnih parfema."
          : "Smaller, carefully decanted portions of original fragrances."}
      </p>
    </article>

    <article className="how-it-works-card">
      <span className="how-it-works-number">02</span>
      <h3>{lang === "sr" ? "Zašto su korisni" : "Why they matter"}</h3>
      <p>
        {lang === "sr"
          ? "Možeš da probaš miris na svojoj koži pre kupovine pune bočice."
          : "They let you test a fragrance on your skin before committing to a full bottle."}
      </p>
    </article>

    <article className="how-it-works-card">
      <span className="how-it-works-number">03</span>
      <h3>{lang === "sr" ? "Zašto je to pametnije" : "Why it is smarter"}</h3>
      <p>
        {lang === "sr"
          ? "Manji rizik, manji trošak i više parfema za rotaciju."
          : "Lower risk, lower cost, and more room to build a fragrance rotation."}
      </p>
    </article>
  </div>

  <div className="how-it-works-cta">
    <button
      className="ghost-button"
      type="button"
      onClick={() => setHowItWorksOpen(true)}
    >
      {lang === "sr" ? "Saznaj više" : "Learn more"}
    </button>
  </div>
</section>

            <div className="section-divider">
  <span />
</div>

<section className="featured-section section-wrap impact-split-section">
  <div className="impact-video-column">
    <div className="impact-video-frame">
<video
  key={currentVideo}
  autoPlay
  muted
  playsInline
  onEnded={() => {
    setCurrentVideo((prev) => (prev + 1) % heroVideos.length);
  }}
>
  <source src={heroVideos[currentVideo]} type="video/mp4" />
</video>

      <div className="impact-video-badge">PLAYNICE FILM</div>
    </div>

    <div className="impact-video-panel">
      <div className="impact-video-panel-content">
        <span className="impact-video-eyebrow">
          {lang === "sr" ? "PLAYNICE CONCEPT" : "PLAYNICE CONCEPT"}
        </span>

        <h3>
          {lang === "sr"
            ? "Probaj pre nego što se odlučiš."
            : "Try before you commit."}
        </h3>

        <p>
          {lang === "sr"
            ? "Isprobaj na koži kroz 5ml ili 10ml dekante. Bez rizika. Samo pravi izbor."
            : "Experience it on skin first. 5ml and 10ml decants. No risk. Just the right decision."}
        </p>

        <button
          className="impact-video-cta"
          type="button"
          onClick={() => setView("shop")}
        >
          {lang === "sr" ? "Istraži kolekciju" : "Explore collection"}
        </button>
      </div>
    </div>
  </div>

  <div className="impact-products-column">
    <div className="section-head impact-head">
      <p className="section-kicker">{tr.highlightsKicker}</p>
      <h2>{tr.highlightsTitle}</h2>
      <p>{tr.highlightsText}</p>
    </div>

    <div className="impact-products-panel">
      <article className="impact-products-merged-card">
        <div className="impact-product-row">
          <button
            type="button"
            className="impact-product-image-button"
            onClick={() => openImpactProductModal(impactProducts[0])}
            aria-label="Afnan 9PM Rebel"
          >
            <div className="impact-product-image-wrap">
              <img
                src="/products/9pm.png"
                alt="Afnan 9PM Rebel"
                className="impact-product-image"
              />
            </div>
          </button>

          <div className="impact-product-copy">
            <div className="impact-product-topline">
              <span className="impact-product-tag">{tr.campaignPick}</span>
            </div>

            <h3>Afnan 9PM Rebel</h3>
            <p>{tr.rebelCardText}</p>

            <div className="impact-product-actions">
              <button
                className="inline-link impact-inline-link"
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  addHeroBottleToCart();
                }}
              >
                {tr.add100ml}
              </button>
            </div>
          </div>
        </div>

        <div className="impact-product-divider" />

        <div className="impact-product-row">
          <button
            type="button"
            className="impact-product-image-button"
            onClick={() => openImpactProductModal(impactProducts[1])}
            aria-label="Khadlaj Island Dreams Extrait de Parfum"
          >
            <div className="impact-product-image-wrap">
              <img
                src="/products/island.png"
                alt="Khadlaj Island Dreams Extrait de Parfum"
                className="impact-product-image"
              />
            </div>
          </button>

          <div className="impact-product-copy">
            <div className="impact-product-topline">
              <span className="impact-product-tag">{tr.summerHit}</span>
            </div>

            <h3>Khadlaj Island Dreams Extrait de Parfum</h3>
            <p>{tr.islandDreamsText}</p>
          </div>
        </div>

        <div className="impact-product-divider" />

        <div className="impact-product-row">
          <button
            type="button"
            className="impact-product-image-button"
            onClick={() => openImpactProductModal(impactProducts[2])}
            aria-label="Arabiyat Prestige Marwa"
          >
            <div className="impact-product-image-wrap">
              <img
                src="/products/marwa.png"
                alt="Arabiyat Prestige Marwa"
                className="impact-product-image"
              />
            </div>
          </button>

          <div className="impact-product-copy">
            <div className="impact-product-topline">
              <span className="impact-product-tag">{tr.arabianEdge}</span>
            </div>

            <h3>Arabiyat Prestige Marwa</h3>
            <p>{tr.marwaText}</p>
          </div>
        </div>
      </article>
    </div>
  </div>
</section>

<div className="section-divider">
  <span />
</div>

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

            <div className="section-divider">
  <span />
</div>

<section className="catalog-download-section">
  <div className="catalog-download-card">
    <div className="catalog-download-copy">
      <p className="catalog-download-kicker">
        {lang === "sr" ? "PLAYNICE KATALOG" : "PLAYNICE CATALOG"}
      </p>

      <h2>
        {lang === "sr" ? "Preuzmi katalog." : "Download the catalog."}
      </h2>

      <p>
        {lang === "sr"
          ? "Brz pregled parfema, dostupnih militraža i cena. Idealno za lako deljenje, brzo pregledanje i poručivanje."
          : "A quick overview of fragrances, available sizes, and prices. Perfect for easy sharing, fast browsing, and ordering."}
      </p>
    </div>

    <div className="catalog-download-actions">
<a
  className="catalog-download-button recommended"
  href="/catalog-dark.pdf"
  onClick={(e) => {
    e.preventDefault();
    openCatalogPreview("/catalog-dark.pdf");
  }}
>
  <span className="recommended-badge">Recommended</span>

  {lang === "sr" ? "Premium katalog" : "Premium catalog"}
</a>

  <a
    className="catalog-download-button secondary"
    href="/catalog-clean.pdf"
    download
    target="_blank"
    rel="noreferrer"
  >
    {lang === "sr" ? "Brzi cenovnik" : "Quick price list"}
  </a>

  <span className="catalog-download-note">
    {lang === "sr"
      ? "DM / print verzije"
      : "DM / print versions"}
  </span>
</div>
  </div>
</section>

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

  <div className="pagination-numbers">
    {Array.from({ length: totalPages }, (_, index) => {
      const pageNumber = index + 1;
      return (
        <button
          key={pageNumber}
          type="button"
          className={`pagination-number ${
            currentPage === pageNumber ? "active" : ""
          }`}
          onClick={() => {
            setCurrentPage(pageNumber);
            requestAnimationFrame(() => {
              window.scrollTo({ top: 0, behavior: "smooth" });
            });
          }}
        >
          {pageNumber}
        </button>
      );
    })}
  </div>

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

<div
  className={`backdrop ${
    cartOpen ||
    checkoutOpen ||
    selectedProduct ||
    storyOpen ||
    howItWorksOpen
      ? "show"
      : ""
  }`}
  onClick={() => {
    setCartOpen(false);
    setCheckoutOpen(false);
    setStoryOpen(false);
    setHowItWorksOpen(false);
    closeProductModal();
  }}
/>

<aside className={`story-drawer ${storyOpen ? "open" : ""}`}>
  <div className="story-drawer-header story-anim story-anim-1">
    <div>
      <p className="section-kicker">OUR STORY</p>
      <h3>Curated to be remembered.</h3>
    </div>

    <button
      className="close-button"
      type="button"
      onClick={() => setStoryOpen(false)}
      aria-label={lang === "sr" ? "Zatvori Story panel" : "Close story panel"}
    >
      ×
    </button>
  </div>

  <div className="story-drawer-body">
    <p className="story-drawer-lead story-anim story-anim-2">
      {lang === "sr"
        ? "PlayNice je nastao za ljude koji žele više od nasumične bočice na polici. Biramo dizajnerske, niche i arapske parfeme sa jednom jasnom idejom — probaj pre kupovine."
        : "PlayNice was created for people who want more than a random bottle on a shelf. We curate designer, niche, and Arabian fragrances with one simple idea in mind — try before you buy."}
    </p>

    <p className="story-anim story-anim-3">
      {lang === "sr"
        ? "Parfem ne treba birati na brzinu. Treba ga nositi, osetiti i zapamtiti. Zato PlayNice nudi ličniji način otkrivanja mirisa kroz pažljivo odabrane dekante i limitirane dropove."
        : "A fragrance should not be chosen in a rush. It should be worn, felt, and remembered. That is why PlayNice offers a more personal way to discover scent through carefully selected decants and limited drops."}
    </p>

    <p className="story-anim story-anim-4">
      {lang === "sr"
        ? "Ovde nije poenta prodati sve. Poenta je odabrati ono što zaista zaslužuje pažnju."
        : "This is not about selling everything. It is about selecting what deserves attention."}
    </p>

    <div className="story-drawer-points story-anim story-anim-5">
      <div>
        {lang === "sr"
          ? "Dizajnerski, niche i arapski izbor"
          : "Designer, niche, and Arabian curation"}
      </div>
      <div>
        {lang === "sr"
          ? "Premium dekanti pre pune bočice"
          : "Premium decants before full bottles"}
      </div>
      <div>
        {lang === "sr"
          ? "Limitirani dropovi i boutique pristup"
          : "Limited drops with boutique logic"}
      </div>
    </div>

    <div className="story-drawer-footer story-anim story-anim-6">
      <span className="story-drawer-signature">Remember. PlayNice.</span>

      <button
        className="gold-button small"
        type="button"
        onClick={() => {
          setStoryOpen(false);
          goToShop();
        }}
      >
        {lang === "sr" ? "Istraži kolekciju" : "Explore collection"}
      </button>
    </div>
  </div>
</aside>

<aside className={`how-it-works-drawer ${howItWorksOpen ? "open" : ""}`}>
  <div className="how-it-works-drawer-header">
    <div>
      <p className="section-kicker">HOW IT WORKS</p>
      <h3>
        {lang === "sr"
          ? "Šta su dekanti i zašto imaju smisla."
          : "What decants are and why they matter."}
      </h3>
    </div>

    <button
      className="close-button"
      type="button"
      onClick={() => setHowItWorksOpen(false)}
      aria-label={lang === "sr" ? "Zatvori prozor" : "Close panel"}
    >
      ×
    </button>
  </div>

  <div className="how-it-works-drawer-body">
    <p className="how-it-works-drawer-lead">
      {lang === "sr"
        ? "Dekanti su manja, pažljivo presuta pakovanja originalnih parfema. Napravljeni su za ljude koji žele da miris prvo osete na svojoj koži, u svom ritmu, pre nego što se odluče za punu bočicu."
        : "Decants are smaller, carefully transferred portions of original fragrances. They are made for people who want to wear a scent on their skin, in real life, before committing to a full bottle."}
    </p>

    <div className="how-it-works-drawer-grid">
      <div className="how-it-works-drawer-card">
        <h4>{lang === "sr" ? "Manji rizik" : "Lower risk"}</h4>
        <p>
          {lang === "sr"
            ? "Ne kupuješ naslepo. Prvo probaš, pa tek onda odlučuješ da li miris zaista vredi pune bočice."
            : "You do not buy blindly. You test first, then decide whether the fragrance deserves a full bottle."}
        </p>
      </div>

      <div className="how-it-works-drawer-card">
        <h4>{lang === "sr" ? "Pametniji trošak" : "Smarter spending"}</h4>
        <p>
          {lang === "sr"
            ? "Umesto jedne skupe greške, možeš probati više parfema i pronaći ono što ti stvarno odgovara."
            : "Instead of making one expensive mistake, you can test several fragrances and find what truly fits you."}
        </p>
      </div>

      <div className="how-it-works-drawer-card">
        <h4>{lang === "sr" ? "Više izbora" : "More variety"}</h4>
        <p>
          {lang === "sr"
            ? "Dekanti ti omogućavaju da rotiraš više mirisa za različite prilike, godišnja doba i raspoloženja."
            : "Decants let you build a rotation for different occasions, seasons, and moods."}
        </p>
      </div>

      <div className="how-it-works-drawer-card">
        <h4>{lang === "sr" ? "Originalni parfemi" : "Original fragrances"}</h4>
        <p>
          {lang === "sr"
            ? "Poenta nije u zameni za bočicu, već u tome da originalan parfem doživiš na pametniji i pristupačniji način."
            : "The point is not to replace the bottle, but to experience the original fragrance in a smarter and more accessible way."}
        </p>
      </div>
    </div>

    <p className="how-it-works-proof">
  {lang === "sr"
    ? "Hiljade kupaca prvo testira dekante pre nego što kupi punu bočicu."
    : "Thousands of customers test decants before committing to a full bottle."}
</p>

    <div className="how-it-works-drawer-footer">
      <span className="story-drawer-signature">Remember. PlayNice.</span>

      <button
        className="gold-button small"
        type="button"
        onClick={() => {
          setHowItWorksOpen(false);
          goToShop();
        }}
      >
        {lang === "sr" ? "Istraži kolekciju" : "Explore collection"}
      </button>
      
      <button
  className="gold-button"
  onClick={() => {
    setHowItWorksOpen(false);
    goToShop();
  }}
>
  {lang === "sr" ? "Kreni od 2ml" : "Start with 2ml"}
</button>
    </div>
  </div>
</aside>

<aside className={`cart-drawer ${cartOpen ? "open" : ""}`}>
  <div className="cart-drawer-header">
    <div>
      <p className="section-kicker">{tr.yourCart}</p>
      <h3>{tr.selectedItems}</h3>
    </div>
    <button
      className="close-button"
      type="button"
      onClick={() => setCartOpen(false)}
    >
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

      {selectedProduct && (
        <div className="modal-overlay" onClick={closeProductModal}>
          <div
            className="product-modal open"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              type="button"
              onClick={closeProductModal}
              aria-label={lang === "sr" ? "Zatvori prozor" : "Close modal"}
            >
              <span>×</span>
            </button>

            <div className="modal-header">
              <span className="modal-eyebrow">PRIVATE SELECTION</span>
              <h2>{selectedProduct.name}</h2>

              {selectedProduct.rating && (
  <div className="modal-rating">
    <div className="modal-rating-stars" aria-hidden="true">
      {Array.from({ length: 10 }).map((_, index) => (
        <span
          key={index}
          className={index < Math.round(selectedProduct.rating) ? "filled" : ""}
        >
          ★
        </span>
      ))}
    </div>

    <div className="modal-rating-meta">
      <span className="modal-rating-score">
        {selectedProduct.rating.toFixed(1)} / 10
      </span>
      <span className="modal-rating-label">
        {selectedProduct.ratingLabel}
      </span>
    </div>
  </div>
)}
            </div>

            <div className="modal-body">
              <div className="modal-media">
                {selectedProduct.badge && (
                  <span className="modal-badge">{selectedProduct.badge}</span>
                )}

                <div className="modal-image-wrap">
                  {selectedProduct.image ? (
                    <img
                      src={selectedProduct.image}
                      alt={selectedProduct.name}
                      className="modal-image"
                    />
                  ) : (
                    <div className="modal-monogram">
                      {selectedProduct.name.charAt(0)}
                    </div>
                  )}
                </div>

                <div className="modal-media-meta">
                  <span className="modal-category">
                    {lang === "sr"
                      ? selectedProduct.category === "Arabian"
                        ? "ARAPSKI"
                        : selectedProduct.category === "Designer"
                        ? "DIZAJNERSKI"
                        : selectedProduct.category === "Niche"
                        ? "NICHE"
                        : selectedProduct.category === "Summer"
                        ? "LETNJI"
                        : selectedProduct.category.toUpperCase()
                      : selectedProduct.category.toUpperCase()}
                  </span>

                  <p>
                    {productCopy[selectedProduct.name]?.dominantNotes?.[lang]?.join(" • ") ||
                      (lang === "sr"
                        ? "Premium mirisna selekcija"
                        : "Premium fragrance selection")}
                  </p>
                </div>
              </div>

              <div className="modal-content">
                {productCopy[selectedProduct.name]?.miniTag?.[lang] && (
                  <span className="modal-chip">
                    {productCopy[selectedProduct.name].miniTag[lang]}
                  </span>
                )}

                <p className="modal-description">
                  {productCopy[selectedProduct.name]?.modal?.[lang] ||
                    (lang === "sr"
                      ? "Luksuzan miris sa izraženim karakterom i premium prisustvom."
                      : "A luxurious scent with strong character and premium presence.")}
                </p>

                <div className="modal-info-grid">
                  <div className="modal-info-card">
                    <span>
                      {lang === "sr" ? "DOMINANTNE NOTE" : "DOMINANT NOTES"}
                    </span>
                    <strong>
                      {productCopy[selectedProduct.name]?.dominantNotes?.[lang]?.join(" • ") ||
                        (lang === "sr" ? "premium akordi" : "premium accords")}
                    </strong>
                  </div>

                  <div className="modal-info-card">
                    <span>
                      {lang === "sr"
                        ? "ZAŠTO KUPCI BIRAJU OVAJ PARFEM"
                        : "WHY CUSTOMERS CHOOSE THIS FRAGRANCE"}
                    </span>
                    <strong>
                      {productCopy[selectedProduct.name]?.whyChoose?.[lang] ||
                        (lang === "sr"
                          ? "Odličan izbor za one koji žele upečatljiv premium miris."
                          : "An excellent choice for those who want a memorable premium scent.")}
                    </strong>
                  </div>
                </div>

                <div className="modal-purchase">
                  <div className="modal-size-block">
                    <span className="modal-label">
                      {lang === "sr" ? "IZABERI VELIČINU" : "CHOOSE SIZE"}
                    </span>

                    <div className="modal-sizes">
                      {Object.entries(selectedProduct.sizes).map(([size, price]) => (
                        <button
                          key={size}
                          type="button"
                          className={`modal-size ${selectedSize === size ? "active" : ""}`}
                          onClick={() => setSelectedSize(size)}
                        >
                          <span>{size}</span>
                          <strong>{formatPrice(price)}</strong>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="modal-purchase-bar">
                    <div className="modal-price-box">
                      <span>
                        {lang === "sr" ? "IZABRANA CENA" : "SELECTED PRICE"}
                      </span>
                      <strong>
                        {formatPrice(
                          selectedProduct.sizes[selectedSize] ??
                            Object.values(selectedProduct.sizes)[0]
                        )}
                      </strong>
                    </div>

                    <button
                      type="button"
                      className="modal-add-button"
                      onClick={() => {
                        const activeSize =
                          selectedSize || Object.keys(selectedProduct.sizes)[0];
                        addToCart(selectedProduct, activeSize);
                        setCartOpen(true);
                      }}
                    >
                      <span>{lang === "sr" ? "DODAJ U KORPU" : "ADD TO CART"}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
      {catalogPreview && (
  <div className="catalog-modal-overlay" onClick={closeCatalogPreview}>
    <div
      className="catalog-modal"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        className="catalog-modal-close"
        onClick={closeCatalogPreview}
      >
        ×
      </button>

      <iframe
        src={catalogPreview}
        title="Catalog Preview"
        className="catalog-modal-frame"
      />

      <a
        href={catalogPreview}
        download
        className="catalog-modal-download"
      >
        {lang === "sr" ? "Preuzmi PDF" : "Download PDF"}
      </a>
    </div>
  </div>
)}
    </div>
  );
}

export default App;