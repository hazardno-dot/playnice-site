import React, { useEffect, useMemo, useState } from "react";
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
    addedToCart: "added to cart"
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
    addedToCart: "je dodat u korpu"
  }
};

const categoryLabels = {
  Arabian: { en: "Arabian", sr: "Arabian" },
  Designer: { en: "Designer", sr: "Designer" },
  Niche: { en: "Niche", sr: "Niche" },
  Summer: { en: "Summer", sr: "Summer" }
};

const products = [
  {
    id: 1,
    name: "Afnan 9AM",
    category: "Arabian",
    image: "/afnan-9am.png",
    sizes: { "5ml": 4, "10ml": 7, "20ml": 13 },
    description: {
      en: "Fresh, versatile and easy to wear. A clean daily driver with modern energy and broad appeal.",
      sr: "Svež, svestran i lak za nošenje. Čist svakodnevni izbor sa modernom energijom i širokom dopadljivošću."
    },
    vibe: {
      en: "Fresh • Bright • Everyday confidence",
      sr: "Svež • Svetao • Svakodnevno samopouzdanje"
    }
  },
  {
    id: 2,
    name: "Afnan 9PM Rebel",
    category: "Arabian",
    sizes: { "5ml": 4, "10ml": 7, "20ml": 13 },
    badge: "BESTSELLER",
    description: {
      en: "Bold, addictive and attention-grabbing. A nightlife weapon with strong charisma and premium value.",
      sr: "Smeo, zarazan i magnet za pažnju. Noćni adut sa snažnom harizmom i premium vrednošću."
    },
    vibe: {
      en: "Sweet • Magnetic • Night out",
      sr: "Sladak • Magnetičan • Noćni izlazak"
    }
  },
  {
    id: 3,
    name: "Afnan Supremacy Collector's Edition Pour Homme",
    category: "Arabian",
    image: "/afnan-supremacy.png",
    sizes: { "5ml": 5, "10ml": 9, "20ml": 17 },
    description: {
      en: "A smooth and elevated masculine scent with depth, polish and lasting presence.",
      sr: "Uglađen i uzdignut muški miris sa dubinom, elegancijom i postojanim prisustvom."
    },
    vibe: {
      en: "Refined • Powerful • Signature-ready",
      sr: "Rafiniran • Snažan • Spreman za signature ulogu"
    }
  },
  {
    id: 4,
    name: "Afnan Turathi Blue",
    category: "Arabian",
    image: "/afnan-turathi-blue.png",
    sizes: { "5ml": 6, "10ml": 11, "20ml": 20 },
    description: {
      en: "A crisp aromatic profile with upscale freshness and excellent versatility.",
      sr: "Čist aromatičan profil sa elegantnom svežinom i odličnom svestranošću."
    },
    vibe: {
      en: "Citrus • Elegant • High impact",
      sr: "Citrusan • Elegantan • Jak utisak"
    }
  },
  {
    id: 5,
    name: "Afnan 9PM",
    category: "Arabian",
    sizes: { "5ml": 4, "10ml": 7, "20ml": 13 },
    description: {
      en: "A crowd-pleasing sweet scent built for compliments, dates and cooler evenings.",
      sr: "Dopadljiv sladak miris stvoren za komplimente, sastanke i svežije večeri."
    },
    vibe: {
      en: "Warm • Sweet • Compliment magnet",
      sr: "Topao • Sladak • Magnet za komplimente"
    }
  },
  {
    id: 6,
    name: "Lattafa Khamrah Qahwa",
    category: "Arabian",
    sizes: { "5ml": 5, "10ml": 9, "20ml": 17 },
    badge: "HOT",
    description: {
      en: "Rich, sweet and spicy with an irresistible gourmand edge and addictive warmth.",
      sr: "Bogat, sladak i začinski, sa neodoljivim gourmand karakterom i zaraznom toplinom."
    },
    vibe: {
      en: "Spicy • Gourmand • Cozy luxury",
      sr: "Začinski • Gourmand • Ušuškan luksuz"
    }
  },
  {
    id: 7,
    name: "Armaf Club de Nuit Intense Man EDT",
    category: "Designer",
    image: "/armaf-cdn-intense.png",
    sizes: { "5ml": 5, "10ml": 9, "20ml": 17 },
    description: {
      en: "Sharp, confident and assertive. A modern classic for projection and presence.",
      sr: "Oštar, samouveren i upečatljiv. Moderni klasik za projekciju i prisustvo."
    },
    vibe: {
      en: "Smoky • Masculine • Commanding",
      sr: "Diman • Muževan • Dominantan"
    }
  },
  {
    id: 8,
    name: "Armaf Club de Nuit Sillage",
    category: "Designer",
    sizes: { "5ml": 5, "10ml": 9, "20ml": 17 },
    description: {
      en: "Airy metallic freshness with strong identity and standout trail.",
      sr: "Prozračna metalna svežina sa snažnim identitetom i upečatljivim tragom."
    },
    vibe: {
      en: "Bright • Mineral • Distinctive",
      sr: "Svetao • Mineralan • Poseban"
    }
  },
  {
    id: 9,
    name: "Armaf Club de Nuit Bling",
    category: "Designer",
    sizes: { "5ml": 6, "10ml": 11, "20ml": 20 },
    description: {
      en: "A flashy, modern scent with attention-grabbing energy and stylish appeal.",
      sr: "Efektan, moderan miris sa energijom koja privlači pažnju i stilskim karakterom."
    },
    vibe: {
      en: "Glamorous • Youthful • Loud in a good way",
      sr: "Glamurozan • Mladalački • Primetan na pravi način"
    }
  },
  {
    id: 10,
    name: "Mancera Cedrat Boise",
    category: "Niche",
    sizes: { "5ml": 10, "10ml": 18, "20ml": 34 },
    description: {
      en: "A niche favorite balancing citrus brightness with woods and sophistication.",
      sr: "Niche favorit koji spaja citrusnu svežinu, drvenaste tonove i sofisticiranost."
    },
    vibe: {
      en: "Niche • Smooth • Effortlessly classy",
      sr: "Niche • Uglađen • Nenametljivo otmen"
    }
  },
  {
    id: 11,
    name: "Gisada Ambassador",
    category: "Designer",
    sizes: { "5ml": 11, "10ml": 20, "20ml": 38 },
    description: {
      en: "A polished designer scent with elegant sweetness and strong mass appeal.",
      sr: "Uglancan dizajnerski miris sa elegantnom slatkoćom i velikom dopadljivošću."
    },
    vibe: {
      en: "Luxurious • Modern • Crowd favorite",
      sr: "Luksuzan • Moderan • Omiljen među publikom"
    }
  },
  {
    id: 12,
    name: "Givenchy Gentleman Réserve Privée",
    category: "Designer",
    sizes: { "5ml": 10, "10ml": 18, "20ml": 34 },
    description: {
      en: "A dark, smooth and upscale scent with a dressed-up evening personality.",
      sr: "Taman, uglađen i elegantan miris sa večernjim, doteranim karakterom."
    },
    vibe: {
      en: "Boozy • Elegant • Refined dark",
      sr: "Boozy • Elegantan • Rafinirano taman"
    }
  },
  {
    id: 13,
    name: "Creed Aventus Cologne",
    category: "Niche",
    sizes: { "5ml": 29, "10ml": 52, "20ml": 98 },
    description: {
      en: "Premium niche freshness with luxury polish, clean projection and prestige.",
      sr: "Premium niche svežina sa luksuznim finišem, čistom projekcijom i prestižem."
    },
    vibe: {
      en: "Prestige • Fresh • Executive energy",
      sr: "Prestiž • Svežina • Executive energija"
    }
  },
  {
    id: 14,
    name: "Bleu de Chanel EDP",
    category: "Designer",
    sizes: { "5ml": 15, "10ml": 27, "20ml": 50 },
    description: {
      en: "A universally respected signature scent that feels clean, masculine and premium.",
      sr: "Univerzalno cenjen signature miris koji deluje čisto, muževno i premium."
    },
    vibe: {
      en: "Blue • Elegant • Timeless",
      sr: "Blue • Elegantan • Bezvremenski"
    }
  },
  {
    id: 15,
    name: "Boss The Scent Elixir",
    category: "Designer",
    sizes: { "5ml": 15, "10ml": 27, "20ml": 50 },
    description: {
      en: "Dark, sensual and richer than the usual designer style. Ideal for evening wear.",
      sr: "Taman, senzualan i bogatiji od uobičajenog dizajnerskog stila. Idealan za veče."
    },
    vibe: {
      en: "Seductive • Dense • Smooth heat",
      sr: "Zavodljiv • Gust • Uglađena toplina"
    }
  },
  {
    id: 16,
    name: "Montblanc Explorer Extreme",
    category: "Designer",
    sizes: { "5ml": 10, "10ml": 18, "20ml": 34 },
    description: {
      en: "A bold and adventurous scent with familiar masculinity and a polished finish.",
      sr: "Smeo i avanturistički miris sa poznatom muževnošću i uglađenim završetkom."
    },
    vibe: {
      en: "Woody • Adventurous • Reliable",
      sr: "Drvenast • Avanturistički • Pouzdan"
    }
  },
  {
    id: 17,
    name: "Swiss Arabian Tobacco 01",
    category: "Arabian",
    sizes: { "5ml": 10, "10ml": 18, "20ml": 34 },
    description: {
      en: "Dense tobacco warmth with a rich Middle Eastern character and luxurious depth.",
      sr: "Gusta duvanska toplina sa bogatim bliskoistočnim karakterom i luksuznom dubinom."
    },
    vibe: {
      en: "Tobacco • Warm • Rich aura",
      sr: "Duvan • Topao • Bogata aura"
    }
  },
  {
    id: 18,
    name: "Calvin Klein Defy EDT",
    category: "Designer",
    sizes: { "5ml": 7, "10ml": 12, "20ml": 22 },
    description: {
      en: "A clean masculine designer freshie with easy wearability and modern simplicity.",
      sr: "Čist muški dizajnerski freshie sa lakim nošenjem i modernom jednostavnošću."
    },
    vibe: {
      en: "Clean • Casual • Everyday",
      sr: "Čist • Ležeran • Svakodnevan"
    }
  },
  {
    id: 19,
    name: "Calvin Klein Defy Parfum",
    category: "Designer",
    sizes: { "5ml": 10, "10ml": 18, "20ml": 34 },
    description: {
      en: "A darker and richer take on the Defy DNA with improved depth and stronger character.",
      sr: "Tamnija i bogatija interpretacija Defy DNK sa više dubine i jačim karakterom."
    },
    vibe: {
      en: "Modern • Darker • Elevated",
      sr: "Moderan • Tamniji • Uzdignut"
    }
  },
  {
    id: 20,
    name: "CK All",
    category: "Designer",
    sizes: { "5ml": 6, "10ml": 11, "20ml": 20 },
    description: {
      en: "Minimal, clean and very wearable. Great for effortless daily freshness.",
      sr: "Minimalan, čist i veoma nosiv. Odličan za nenametljivu svakodnevnu svežinu."
    },
    vibe: {
      en: "Soft • Clean • Universal",
      sr: "Mekan • Čist • Univerzalan"
    }
  },
  {
    id: 21,
    name: "Kadlaj Island Dreams",
    category: "Summer",
    sizes: { "5ml": 5, "10ml": 9, "20ml": 17 },
    badge: "SUMMER",
    description: {
      en: "A bright tropical mood with vacation energy, easy wear and warm-weather appeal.",
      sr: "Svetao tropski karakter sa odmorskom energijom, lakim nošenjem i letnjom dopadljivošću."
    },
    vibe: {
      en: "Tropical • Sunny • Must-try summer",
      sr: "Tropski • Sunčan • Letnji must-try"
    }
  },
  {
    id: 22,
    name: "Arabian Prestige Marwa",
    category: "Arabian",
    sizes: { "5ml": 5, "10ml": 9, "20ml": 17 },
    description: {
      en: "A strong value pick with character, smoothness and a distinctly Arabian profile.",
      sr: "Sjajan value izbor sa karakterom, uglađenošću i prepoznatljivo arapskim profilom."
    },
    vibe: {
      en: "Exotic • Smooth • Distinctive",
      sr: "Egzotičan • Uglađen • Poseban"
    }
  },
  {
    id: 23,
    name: "Parfums de Marly Castley",
    category: "Niche",
    sizes: { "5ml": 16, "10ml": 29, "20ml": 55 },
    description: {
      en: "Luxury niche perfumery with depth, polish and a premium signature aura.",
      sr: "Luksuzna niche parfimerija sa dubinom, elegancijom i premium signature aurom."
    },
    vibe: {
      en: "Niche • Regal • High-end presence",
      sr: "Niche • Kraljevski • High-end prisustvo"
    }
  },
  {
    id: 24,
    name: "Afnan Supremacy Not Only Intense",
    category: "Arabian",
    sizes: { "5ml": 6, "10ml": 11, "20ml": 20 },
    description: {
      en: "One of the strongest value performers in the category with excellent impact.",
      sr: "Jedan od najjačih value parfema u kategoriji sa odličnim efektom."
    },
    vibe: {
      en: "Intense • Bold • Powerful trail",
      sr: "Intenzivan • Smeo • Snažan trag"
    }
  }
];

const PRODUCTS_PER_PAGE = 12;
const SHIPPING_COST = 3.5;

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

function ProductImage({ product, className = "" }) {
  if (product.image) {
    return <img className={className} src={product.image} alt={product.name} />;
  }

  return <div className={`product-image-fallback ${className}`}>{product.name.charAt(0)}</div>;
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
    () => ["All", ...Array.from(new Set(products.map((p) => p.category)))],
    []
  );

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
    if (urlPage && !Number.isNaN(Number(urlPage))) setCurrentPage(Number(urlPage));
  }, [categories]);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("view", view);

    if (category !== "All") params.set("category", category);
    if (searchTerm.trim()) params.set("search", searchTerm.trim());
    if (currentPage > 1) params.set("page", String(currentPage));

    const nextUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, "", nextUrl);
  }, [view, category, searchTerm, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [category, searchTerm]);

  useEffect(() => {
    if (!addedFeedback) return;
    const timer = setTimeout(() => setAddedFeedback(""), 1800);
    return () => clearTimeout(timer);
  }, [addedFeedback]);

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
      const searchMatch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      return categoryMatch && searchMatch;
    });
  }, [category, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE));

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

  const shipping = cart.length > 0 ? SHIPPING_COST : 0;
  const total = subtotal + shipping;

  const showFeedback = (text) => {
    setAddedFeedback(text);
  };

  const addToCart = (product, size, customPrice = null, customLabel = null) => {
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

    showFeedback(`${product.name} ${tr.addedToCart}`);
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

  const goToShop = () => {
    setView("shop");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const nextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const prevPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openProductModal = (product) => {
    setSelectedProduct(product);
  };

  const closeProductModal = () => {
    setSelectedProduct(null);
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

  const ProductCard = ({ product }) => (
    <article
      className="product-card clickable"
      key={product.id}
      onClick={() => openProductModal(product)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") openProductModal(product);
      }}
    >
      {product.badge && <span className="product-badge">{product.badge}</span>}

      <div className="product-image">
        <ProductImage product={product} className="product-image-real" />
      </div>

      <div className="product-meta">
        <p className="product-category">{getCategoryLabel(product.category)}</p>
        <h3>{product.name}</h3>
        <p className="product-price-from">
          {tr.from} {formatPrice(Math.min(...Object.values(product.sizes)))}
        </p>
      </div>

      <div className="product-preview-line">
        <span>{tr.openDetails}</span>
        <strong>{tr.luxuryModal}</strong>
      </div>

      <div className="size-buttons" onClick={(e) => e.stopPropagation()}>
        {Object.entries(product.sizes).map(([size, price]) => (
          <button key={size} onClick={() => addToCart(product, size)}>
            <span>{size}</span>
            <strong>{formatPrice(price)}</strong>
          </button>
        ))}
      </div>
    </article>
  );

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={() => setView("home")}>
          <span className="brand-mark">▶</span>
          <span className="brand-copy">
            <strong>PlayNice</strong>
            <small>Remember. PlayNice.</small>
          </span>
        </button>

        <nav className="nav-links">
          <button className={view === "home" ? "active" : ""} onClick={() => setView("home")}>
            {tr.navHome}
          </button>
          <button className={view === "shop" ? "active" : ""} onClick={() => setView("shop")}>
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

          <button className="cart-button" onClick={() => setCartOpen((prev) => !prev)}>
            {tr.cart}
            {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
          </button>
        </div>
      </header>

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
                    <button className="gold-button" onClick={goToShop}>
                      {tr.exploreCollection}
                    </button>
                    <button className="ghost-button" onClick={addHeroBottleToCart}>
                      {tr.claimOffer}
                    </button>
                  </div>
                </div>

                <div className="hero-visual">
                  <button
                    className="hero-bottle-wrap"
                    onClick={addHeroBottleToCart}
                    aria-label="Add Afnan 9PM Rebel full bottle to cart"
                  >
                    <img className="hero-bottle" src="/hero-bottle.png" alt="Afnan 9PM Rebel" />
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
                <article className="feature-card large">
                  <span className="feature-tag">{tr.campaignPick}</span>
                  <h3>Afnan 9PM Rebel</h3>
                  <p>{tr.rebelCardText}</p>
                  <button className="inline-link" onClick={addHeroBottleToCart}>
                    {tr.add100ml}
                  </button>
                </article>

                <article className="feature-card">
                  <span className="feature-tag">{tr.summerHit}</span>
                  <h3>Kadlaj Island Dreams</h3>
                  <p>{tr.islandDreamsText}</p>
                </article>

                <article className="feature-card">
                  <span className="feature-tag">{tr.arabianEdge}</span>
                  <h3>Arabian Prestige Marwa</h3>
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
                {products.slice(0, 4).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              <div className="section-cta-center">
                <button className="gold-button" onClick={goToShop}>
                  {tr.viewFullCollection}
                </button>
              </div>
            </section>

            <div className="section-divider" />

            <section className="cta-section">
              <h2>{tr.discoverTitle}</h2>
              <p>{tr.discoverText}</p>
              <button onClick={goToShop}>{tr.exploreCollection}</button>
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
                <select value={category} onChange={(e) => setCategory(e.target.value)}>
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
              <button onClick={prevPage} disabled={currentPage === 1}>
                Prev
              </button>
              <span>
                {tr.page} {currentPage} / {totalPages}
              </span>
              <button onClick={nextPage} disabled={currentPage === totalPages}>
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
          <button className="close-button" onClick={() => setCartOpen(false)}>
            ×
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="cart-empty">
            <p>{tr.cartEmpty}</p>
            <button className="gold-button small" onClick={goToShop}>
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
                      <button onClick={() => updateQuantity(item.key, -1)}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.key, 1)}>+</button>
                    </div>
                    <button className="remove-link" onClick={() => removeFromCart(item.key)}>
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
                <strong>{formatPrice(shipping)}</strong>
              </div>
              <div className="cart-total">
                <span>{tr.total}</span>
                <strong>{formatPrice(total)}</strong>
              </div>
            </div>

            <button className="gold-button checkout-button" onClick={() => setCheckoutOpen(true)}>
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
              <button className="close-button" onClick={closeProductModal}>
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
                  <p className="product-modal-category">{getCategoryLabel(selectedProduct.category)}</p>
                  <p className="product-modal-vibe">{selectedProduct.vibe[lang]}</p>
                </div>
              </div>

              <div className="product-modal-content">
                <div className="product-modal-copy">
                  <p className="product-modal-description">{selectedProduct.description[lang]}</p>

                  <div className="product-modal-info-box">
                    <span>{tr.whyChoose}</span>
                    <strong>{tr.whyChooseText}</strong>
                  </div>
                </div>

                <div className="product-modal-sizes">
                  <p className="modal-label">{tr.chooseSize}</p>

                  <div className="modal-size-grid">
                    {Object.entries(selectedProduct.sizes).map(([size, price]) => (
                      <button
                        key={size}
                        className={`modal-size-button ${selectedSize === size ? "active" : ""}`}
                        onClick={() => setSelectedSize(size)}
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

                  <button className="gold-button modal-add-button" onClick={addSelectedProductToCart}>
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
          <button className="close-button" onClick={() => setCheckoutOpen(false)}>
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

            <button className="gold-button submit-order-button" type="button">
              {tr.placeOrder}
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

                <div className="checkout-totals">
                  <div>
                    <span>{tr.subtotal}</span>
                    <strong>{formatPrice(subtotal)}</strong>
                  </div>
                  <div>
                    <span>{tr.shipping}</span>
                    <strong>{formatPrice(shipping)}</strong>
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