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
  "Designer/Niche": { en: "Designer / Niche", sr: "Designer / Niche" }
};

const products = [
  { id: 1, name: "Afnan 9AM", category: "Arabian", sizes: { "5ml": 4, "10ml": 7, "20ml": 13 } },
  { id: 2, name: "Afnan 9PM Rebel", category: "Arabian", sizes: { "5ml": 4, "10ml": 7, "20ml": 13 }, badge: "BESTSELLER" },
  { id: 3, name: "Afnan Supremacy Collector's Edition Pour Homme", category: "Arabian", sizes: { "5ml": 5, "10ml": 9, "20ml": 17 } },
  { id: 4, name: "Afnan Turathi Blue", category: "Arabian", sizes: { "5ml": 5, "10ml": 9, "20ml": 17 }, badge: "BESTSELLER" },
  { id: 5, name: "Arabiyat Prestige Marwa", category: "Arabian", sizes: { "5ml": 4.5, "10ml": 8, "20ml": 15 } },
  { id: 6, name: "Armaf Club De Nuit Bling", category: "Arabian", sizes: { "5ml": 6, "10ml": 11, "20ml": 20 } },
  { id: 7, name: "Armaf Club de Nuit Intense", category: "Arabian", sizes: { "5ml": 4, "10ml": 7, "20ml": 13 }, badge: "BESTSELLER" },
  { id: 8, name: "Armaf Club de Nuit Sillage", category: "Arabian", sizes: { "5ml": 4, "10ml": 7, "20ml": 13 } },
  { id: 9, name: "French Avenue Vulcan Sable by Fragrance World", category: "Arabian", sizes: { "5ml": 5, "10ml": 9, "20ml": 17 } },
  { id: 10, name: "Haramain Signature Blue", category: "Arabian", sizes: { "5ml": 3, "10ml": 5, "20ml": 10 } },
  { id: 11, name: "Khadlaj Island Dreams Extrait de Parfum", category: "Arabian", sizes: { "5ml": 4.5, "10ml": 8, "20ml": 15 }, badge: "BESTSELLER" },
  { id: 12, name: "Lattafa Asad Elixir", category: "Arabian", sizes: { "5ml": 4.5, "10ml": 8, "20ml": 15 }, badge: "BESTSELLER" },
  { id: 13, name: "Lattafa Fakhar Black", category: "Arabian", sizes: { "5ml": 4, "10ml": 7, "20ml": 13 } },
  { id: 14, name: "Lattafa Khamrah Qahwa", category: "Arabian", sizes: { "5ml": 5, "10ml": 9, "20ml": 17 }, badge: "BESTSELLER" },
  { id: 15, name: "Lattafa Musamam Black Intense", category: "Arabian", sizes: { "5ml": 5, "10ml": 9, "20ml": 17 } },
  { id: 16, name: "Lattafa Qaed Al Fursan Untamed", category: "Arabian", sizes: { "5ml": 3, "10ml": 5, "20ml": 10 } },
  { id: 17, name: "Paris Corner Emir Trillium", category: "Arabian", sizes: { "5ml": 4, "10ml": 7, "20ml": 13 } },
  { id: 18, name: "Paris Corner Emir Voux Elegante", category: "Arabian", sizes: { "5ml": 4, "10ml": 7, "20ml": 13 } },
  { id: 19, name: "Paris Corner Ministry of Oud - Oud Satin", category: "Arabian", sizes: { "5ml": 4, "10ml": 7, "20ml": 13 } },
  { id: 20, name: "Paris Corner Perfumes North Stag Expressions II DEUX", category: "Arabian", sizes: { "5ml": 4, "10ml": 7, "20ml": 13 } },
  { id: 21, name: "Rayhaan Aquatica", category: "Arabian", sizes: { "5ml": 4.5, "10ml": 8, "20ml": 15 } },
  { id: 22, name: "Rayhaan Pacific Aura", category: "Arabian", sizes: { "5ml": 4.5, "10ml": 8, "20ml": 15 } },
  { id: 23, name: "Swiss Arabian Tobacco 01 Extrait de Parfum", category: "Arabian", sizes: { "5ml": 10, "10ml": 18, "20ml": 34 } },

  { id: 24, name: "Acqua di Parma Blu Mediterraneo Fico di Amalfi Eau de Toilette", category: "Designer/Niche", sizes: { "2ml": 6.5, "5ml": 15, "10ml": 27 } },
  { id: 25, name: "Acqua di Parma Colonia Essenza Eau de Cologne", category: "Designer/Niche", sizes: { "2ml": 7, "5ml": 16, "10ml": 29 } },
  { id: 26, name: "Acqua di Parma Colonia Pura Eau de Cologne", category: "Designer/Niche", sizes: { "2ml": 6.5, "5ml": 15, "10ml": 27 } },
  { id: 27, name: "BLEU DE CHANEL Eau de Parfum Spray", category: "Designer/Niche", sizes: { "2ml": 6.5, "5ml": 15, "10ml": 27 }, badge: "BESTSELLER" },
  { id: 28, name: "Bois Impérial by Essential Parfums", category: "Designer/Niche", sizes: { "2ml": 4, "5ml": 9, "10ml": 16 }, badge: "BESTSELLER" },
  { id: 29, name: "BOSS Bottled Beyond Eau de Parfum", category: "Designer/Niche", sizes: { "2ml": 5.5, "5ml": 13, "10ml": 23 } },
  { id: 30, name: "BOSS The Scent Elixir Parfum Intense for Him", category: "Designer/Niche", sizes: { "2ml": 6.5, "5ml": 15, "10ml": 27 } },
  { id: 31, name: "BOSS The Scent Le Parfum for Him", category: "Designer/Niche", sizes: { "2ml": 6, "5ml": 14, "10ml": 25 } },
  { id: 32, name: "Calvin Klein CK All Eau de Toilette", category: "Designer/Niche", sizes: { "2ml": 2.5, "5ml": 6, "10ml": 11 } },
  { id: 33, name: "Calvin Klein Defy Eau de Toilette", category: "Designer/Niche", sizes: { "2ml": 3, "5ml": 7, "10ml": 12 } },
  { id: 34, name: "Calvin Klein Defy Parfum", category: "Designer/Niche", sizes: { "2ml": 4.5, "5ml": 10, "10ml": 18 } },
  { id: 35, name: "Chopard Oud Malaki Eau de Parfum", category: "Designer/Niche", sizes: { "2ml": 5.5, "5ml": 13, "10ml": 23 } },
  { id: 36, name: "Creed Aventus Cologne", category: "Designer/Niche", sizes: { "2ml": 13, "5ml": 29, "10ml": 52 }, badge: "BESTSELLER" },
  { id: 37, name: "Giorgio Armani Acqua di Giò Profondo Parfum", category: "Designer/Niche", sizes: { "2ml": 6.5, "5ml": 15, "10ml": 27 }, badge: "BESTSELLER" },
  { id: 38, name: "Gisada Ambassador Men Eau de Parfum", category: "Designer/Niche", sizes: { "2ml": 5, "5ml": 11, "10ml": 20 }, badge: "BESTSELLER" },
  { id: 39, name: "Givenchy Gentleman Eau de Parfum Réserve Privée", category: "Designer/Niche", sizes: { "2ml": 5, "5ml": 12, "10ml": 21 } },
  { id: 40, name: "Jimmy Choo Man Blue Eau de Toilette", category: "Designer/Niche", sizes: { "2ml": 3.5, "5ml": 8, "10ml": 14 } },
  { id: 41, name: "L'Homme Eau de Parfum by Yves Saint Laurent", category: "Designer/Niche", sizes: { "2ml": 5.5, "5ml": 13, "10ml": 23 } },
  { id: 42, name: "L'Homme Idéal De Guerlain Paris Eau De Toilette", category: "Designer/Niche", sizes: { "2ml": 4.5, "5ml": 10, "10ml": 18 } },
  { id: 43, name: "Mancera Cedrat Boise Eau de Parfum", category: "Designer/Niche", sizes: { "2ml": 4.5, "5ml": 10, "10ml": 18 }, badge: "BESTSELLER" },
  { id: 44, name: "Montblanc Explorer Extreme Parfum", category: "Designer/Niche", sizes: { "2ml": 4.5, "5ml": 10, "10ml": 18 } },
  { id: 45, name: "Narciso Rodriguez for Him Bleu Noir Eau de Parfum", category: "Designer/Niche", sizes: { "2ml": 5.5, "5ml": 13, "10ml": 23 } },
  { id: 46, name: "Terre d'Hermès Eau de Toilette", category: "Designer/Niche", sizes: { "2ml": 4.5, "5ml": 10, "10ml": 18 } },
  { id: 47, name: "Tom Ford Noir Extreme Eau de Parfum", category: "Designer/Niche", sizes: { "2ml": 9, "5ml": 21, "10ml": 37 } }
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

function getFallbackDescription(product, lang) {
  const isArabian = product.category === "Arabian";

  if (lang === "sr") {
    return isArabian
      ? "Pažljivo odabran arapski parfem sa izraženim karakterom, odličnim odnosom cene i utiska, i idealan za otkrivanje kroz decant format."
      : "Pažljivo odabran designer/niche parfem sa premium karakterom, elegantnim nastupom i odličnom prilikom da ga prvo testiraš kroz decant format.";
  }

  return isArabian
    ? "A carefully selected Arabian fragrance with strong character, excellent value and an ideal profile for discovery through decant format."
    : "A carefully selected designer/niche fragrance with premium character, refined presence and a perfect profile to discover through decant format.";
}

function getFallbackVibe(product, lang) {
  const isArabian = product.category === "Arabian";

  if (lang === "sr") {
    return isArabian
      ? "Karakter • Value • Upečatljiv trag"
      : "Premium • Elegantno • Signature potencijal";
  }

  return isArabian
    ? "Character • Value • Strong trail"
    : "Premium • Elegant • Signature potential";
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

    const query = params.toString();
    const nextUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname;
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

  const getProductDescription = (product) => {
    if (product.description?.[lang]) return product.description[lang];
    return getFallbackDescription(product, lang);
  };

  const getProductVibe = (product) => {
    if (product.vibe?.[lang]) return product.vibe[lang];
    return getFallbackVibe(product, lang);
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
                  <h3>Khadlaj Island Dreams Extrait de Parfum</h3>
                  <p>{tr.islandDreamsText}</p>
                </article>

                <article className="feature-card">
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
                  <p className="product-modal-vibe">{getProductVibe(selectedProduct)}</p>
                </div>
              </div>

              <div className="product-modal-content">
                <div className="product-modal-copy">
                  <p className="product-modal-description">{getProductDescription(selectedProduct)}</p>

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