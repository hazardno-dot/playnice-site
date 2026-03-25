import React, { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";

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
  { id: 47, name: "Tom Ford Noir Extreme Eau de Parfum", category: "Designer/Niche", sizes: { "2ml": 9, "5ml": 21, "10ml": 37 } },
];

const INSTAGRAM_URL = "https://www.instagram.com/playnice.me/";
const SHIPPING_PRICE = 3.5;
const FREE_SHIPPING_THRESHOLD = 39;
const ALLOWED_FILTERS = ["All", "Arabian", "Designer/Niche"];

const HERO_PRODUCT = {
  productId: "hero-9pm-rebel-100ml",
  name: "Afnan 9PM Rebel",
  size: "100ml",
  price: 34.9,
};

const translations = {
  sr: {
    navHome: "Početna",
    navShop: "Shop",
    navContact: "Kontakt",

    heroBadge: "PLAYNICE FEATURED DROP",
    heroTitle: "OWN THE MOMENT.",
    heroSub: "Miriši kao parfem od 200€ — za 34.90€.",
    heroDesc: "Mračan. Zarazan. Stvoren za noći koje ne prolaze neprimećeno.",
    heroTag1: "Premium dekanti",
    heroTag2: "Plaćanje pouzećem",
    heroTag3: `Besplatna dostava preko ${FREE_SHIPPING_THRESHOLD}€`,
    heroPrimaryCta: "Kupi full bottle",
    heroSecondaryCta: "Naruči preko Instagrama",
    heroProof: "Aktuelno izdvojeni: 9PM Rebel • Island Dreams • Marwa",
    heroFloatBadge: "PRE 45.90€ • SADA 34.90€",
    heroStickyCta: "Kupi 100ml za 34.90€",

    ctaKicker: "PLAYNICE",
    ctaTitle: "Discover fragrances the right way.",
    ctaText:
      "Testiraj pre pune bočice. Premium dekanti, pažljivo biran izbor i jednostavna porudžbina.",
    ctaOpenShop: "Otvori shop",
    ctaSendDm: "Pošalji DM",

    shopKicker: "SHOP",
    shopTitle: "PlayNice fragrance collection",
    shopText: "Pregledaj parfeme, izaberi veličinu i dodaj u korpu.",
    searchPlaceholder: "Pretraži parfem...",
    filterAll: "Sve",
    filterArabian: "Arabian",
    filterDesigner: "Designer / Niche",
    showing: "Prikazano",
    of: "od",
    fragrances: "parfema",
    prev: "Nazad",
    next: "Dalje",
    page: "Strana",

    selected: "Izabrano",
    addToCart: "Dodaj u korpu",
    added: "Dodato ✓",
    orderNow: "Naruči odmah",
    bestSeller: "Best\nSeller",

    cartTitle: "Korpa",
    items: "stavki",
    cartEmpty: "Tvoja korpa je prazna.",
    subtotal: "Subtotal",
    shipping: "Dostava",
    total: "Ukupno",
    free: "Besplatna",
    unlockedFreeShipping: "Otključao si besplatnu dostavu.",
    addMoreForFreeShipping: "Dodaj još",
    forFreeShipping: "za besplatnu dostavu.",
    quickDmOrder: "Brza DM porudžbina",
    hideCheckout: "Sakrij checkout",
    proceedToCheckout: "Nastavi na checkout",
    checkoutTitle: "Checkout",
    fullName: "Ime i prezime *",
    email: "Email adresa *",
    phone: "Broj telefona *",
    city: "Grad *",
    address: "Adresa *",
    note: "Napomena uz porudžbinu (opciono)",
    payment: "Plaćanje: Pouzećem",
    freeShippingRule: `Besplatna dostava za porudžbine preko ${formatPrice(FREE_SHIPPING_THRESHOLD)}.`,
    confirmCheckout: "Potvrdi porudžbinu",

    successTitle: "Porudžbina je uspešno poslata",
    successText:
      "Hvala na kupovini. Tvoja porudžbina je primljena i uskoro ćemo te kontaktirati sa potvrdom i detaljima isporuke.",
    customer: "Kupac",
    noteLabel: "Napomena",
    continueShopping: "Nastavi kupovinu",
    emailMaybeFailed: "Porudžbina je primljena, ali potvrda na email možda nije stigla.",

    alertQuickOrderCopied:
      "Porudžbina je kopirana. Otvorio sam Instagram profil — samo nalepi tekst u DM.",
    alertQuickOrderFallback: "Kopiraj ovu poruku i pošalji u DM:",
    alertCartCopied:
      "Korpa je kopirana. Otvorio sam Instagram profil — samo nalepi tekst u DM.",
    alertCartFallback: "Kopiraj ovu poruku i pošalji u DM:",
    alertName: "Unesi ime i prezime.",
    alertEmail: "Unesi email adresu.",
    alertPhone: "Unesi broj telefona.",
    alertCity: "Unesi grad.",
    alertAddress: "Unesi adresu.",
    alertCheckoutError: "Došlo je do greške pri slanju porudžbine. Pokušaj ponovo.",

    dmIntro: "Zdravo, želim da naručim:",
    size: "Veličina",
    quantity: "Količina",
    price: "Cena",
    lineTotal: "Ukupno",
    orderTotal: "Ukupno za porudžbinu",

    footerInstagram: "Instagram",
    footerSendDm: "Pošalji DM",
  },

  en: {
    navHome: "Home",
    navShop: "Shop",
    navContact: "Contact",

    heroBadge: "PLAYNICE FEATURED DROP",
    heroTitle: "OWN THE MOMENT.",
    heroSub: "Smell like a 200€ fragrance — for 34.90€.",
    heroDesc: "Dark. Addictive. Built for nights that don’t go unnoticed.",
    heroTag1: "Premium decants",
    heroTag2: "Cash on delivery",
    heroTag3: `Free shipping over ${FREE_SHIPPING_THRESHOLD}€`,
    heroPrimaryCta: "Buy full bottle",
    heroSecondaryCta: "Order via Instagram",
    heroProof: "Featured now: 9PM Rebel • Island Dreams • Marwa",
    heroFloatBadge: "WAS 45.90€ • NOW 34.90€",
    heroStickyCta: "Buy 100ml for 34.90€",

    ctaKicker: "PLAYNICE",
    ctaTitle: "Discover fragrances the right way.",
    ctaText:
      "Test before committing to a full bottle. Premium decants, carefully selected fragrances, and effortless ordering.",
    ctaOpenShop: "Open shop",
    ctaSendDm: "Send DM",

    shopKicker: "SHOP",
    shopTitle: "PlayNice fragrance collection",
    shopText: "Browse fragrances, choose your size, and add them to cart.",
    searchPlaceholder: "Search fragrance...",
    filterAll: "All",
    filterArabian: "Arabian",
    filterDesigner: "Designer / Niche",
    showing: "Showing",
    of: "of",
    fragrances: "fragrances",
    prev: "Prev",
    next: "Next",
    page: "Page",

    selected: "Selected",
    addToCart: "Add to cart",
    added: "Added ✓",
    orderNow: "Order now",
    bestSeller: "Best\nSeller",

    cartTitle: "Cart",
    items: "items",
    cartEmpty: "Your cart is empty.",
    subtotal: "Subtotal",
    shipping: "Shipping",
    total: "Total",
    free: "Free",
    unlockedFreeShipping: "You unlocked free shipping.",
    addMoreForFreeShipping: "Add",
    forFreeShipping: "more for free shipping.",
    quickDmOrder: "Quick DM Order",
    hideCheckout: "Hide checkout",
    proceedToCheckout: "Proceed to checkout",
    checkoutTitle: "Checkout",
    fullName: "Full name *",
    email: "Email address *",
    phone: "Phone number *",
    city: "City / Town *",
    address: "Address *",
    note: "Order note (optional)",
    payment: "Payment: Cash on delivery",
    freeShippingRule: `Free shipping for orders over ${formatPrice(FREE_SHIPPING_THRESHOLD)}.`,
    confirmCheckout: "Confirm checkout",

    successTitle: "Your order has been sent successfully",
    successText:
      "Thank you for your purchase. Your order has been received and we will contact you soon with confirmation and delivery details.",
    customer: "Customer",
    noteLabel: "Note",
    continueShopping: "Continue shopping",
    emailMaybeFailed: "Your order was received, but the confirmation email may not have arrived.",

    alertQuickOrderCopied:
      "Order text copied. I opened the Instagram profile — just paste the message into DM.",
    alertQuickOrderFallback: "Copy this message and send it via DM:",
    alertCartCopied:
      "Cart text copied. I opened the Instagram profile — just paste the message into DM.",
    alertCartFallback: "Copy this message and send it via DM:",
    alertName: "Enter your full name.",
    alertEmail: "Enter your email address.",
    alertPhone: "Enter your phone number.",
    alertCity: "Enter your city.",
    alertAddress: "Enter your address.",
    alertCheckoutError: "There was an error sending your order. Please try again.",

    dmIntro: "Hello, I would like to order:",
    size: "Size",
    quantity: "Quantity",
    price: "Price",
    lineTotal: "Total",
    orderTotal: "Order total",

    footerInstagram: "Instagram",
    footerSendDm: "Send DM",
  },
};

function formatPrice(value) {
  return `${Number(value).toFixed(2)}€`;
}

function getSubtotal(cart) {
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function getShipping(subtotal) {
  if (subtotal === 0) return 0;
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_PRICE;
}

function getUrlParams() {
  if (typeof window === "undefined") return new URLSearchParams();
  return new URLSearchParams(window.location.search);
}

function normalizeFilter(value) {
  return ALLOWED_FILTERS.includes(value) ? value : "All";
}

function buildShopUrl(nextSearch, nextFilter, nextPage) {
  const params = new URLSearchParams();
  params.set("view", "shop");

  if (nextSearch && nextSearch.trim()) {
    params.set("search", nextSearch.trim());
  }

  if (nextFilter && nextFilter !== "All") {
    params.set("filter", nextFilter);
  }

  if (nextPage && nextPage > 1) {
    params.set("page", String(nextPage));
  }

  return `/?${params.toString()}`;
}

function updateUrlParams(nextSearch, nextFilter, nextPage) {
  if (typeof window === "undefined") return;
  window.history.replaceState({}, "", buildShopUrl(nextSearch, nextFilter, nextPage));
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      document.execCommand("copy");
      document.body.removeChild(textArea);
      return true;
    } catch {
      document.body.removeChild(textArea);
      return false;
    }
  }
}

function ProductCard({ product, onAddToCart, onQuickOrder, t }) {
  const sizeOptions = Object.keys(product.sizes);
  const [selectedSize, setSelectedSize] = useState(sizeOptions[0]);
  const [added, setAdded] = useState(false);
  const timeoutRef = useRef(null);

  const selectedPrice = product.sizes[selectedSize];

  useEffect(() => {
    setSelectedSize(Object.keys(product.sizes)[0]);
  }, [product.id]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleAdd = () => {
    onAddToCart({
      productId: product.id,
      name: product.name,
      size: selectedSize,
      price: selectedPrice,
    });

    setAdded(true);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => setAdded(false), 1400);
  };

  return (
    <article className="product-card">
      {product.badge && (
        <div className="card-flag bestseller">
          {t.bestSeller.split("\n")[0]}
          <br />
          {t.bestSeller.split("\n")[1]}
        </div>
      )}

      <div className="product-card-glow" />
      <div className="product-badge">{product.category}</div>
      <h3 className="product-title">{product.name}</h3>

      <div className="product-prices">
        {sizeOptions.map((size) => (
          <div className="price-row" key={size}>
            <span>{size}</span>
            <strong>{formatPrice(product.sizes[size])}</strong>
          </div>
        ))}
      </div>

      <div className="size-picker">
        {sizeOptions.map((size) => (
          <button
            key={size}
            className={selectedSize === size ? "size-btn active" : "size-btn"}
            onClick={() => setSelectedSize(size)}
            type="button"
          >
            {size}
          </button>
        ))}
      </div>

      <div className="selected-price-box">
        <span>{t.selected}</span>
        <strong>
          {selectedSize} → {formatPrice(selectedPrice)}
        </strong>
      </div>

      <div className="product-actions">
        <button className="btn btn-primary" type="button" onClick={handleAdd}>
          {added ? t.added : t.addToCart}
        </button>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={() =>
            onQuickOrder({
              name: product.name,
              size: selectedSize,
              price: selectedPrice,
            })
          }
        >
          {t.orderNow}
        </button>
      </div>
    </article>
  );
}

function CartPanel({
  cart,
  setCart,
  onOrderCart,
  checkoutData,
  setCheckoutData,
  onCheckout,
  orderSuccess,
  lastOrderData,
  onBackToShop,
  showCheckout,
  setShowCheckout,
  t,
}) {
  const subtotal = getSubtotal(cart);
  const shipping = getShipping(subtotal);
  const total = subtotal + shipping;
  const amountToFreeShipping =
    subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FREE_SHIPPING_THRESHOLD - subtotal;

  useEffect(() => {
    if (orderSuccess) {
      setShowCheckout(false);
    }
  }, [orderSuccess, setShowCheckout]);

  const increaseQty = (index) => {
    setCart((prev) =>
      prev.map((item, i) => (i === index ? { ...item, qty: item.qty + 1 } : item))
    );
  };

  const decreaseQty = (index) => {
    setCart((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, qty: Math.max(1, item.qty - 1) } : item
      )
    );
  };

  const removeItem = (index) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setCheckoutData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (orderSuccess && lastOrderData) {
    return (
      <aside className="cart-panel">
        <div className="success-screen">
          <div className="success-card">
            <div className="success-icon">✓</div>

            <p className="success-eyebrow">PLAYNICE</p>
            <h1 className="success-title">{t.successTitle}</h1>
            <p className="success-text">{t.successText}</p>

            <div className="success-summary">
              {lastOrderData.orderId ? (
                <div className="success-row">
                  <span>Order ID</span>
                  <strong>{lastOrderData.orderId}</strong>
                </div>
              ) : null}

              <div className="success-row">
                <span>{t.customer}</span>
                <strong>{lastOrderData.fullName}</strong>
              </div>
              <div className="success-row">
                <span>Email</span>
                <strong>{lastOrderData.email}</strong>
              </div>
              <div className="success-row">
                <span>{t.phone.replace(" *", "")}</span>
                <strong>{lastOrderData.phone}</strong>
              </div>
              <div className="success-row">
                <span>{t.city.replace(" *", "")}</span>
                <strong>{lastOrderData.city}</strong>
              </div>
              <div className="success-row">
                <span>{t.address.replace(" *", "")}</span>
                <strong>{lastOrderData.address}</strong>
              </div>

              {lastOrderData.note ? (
                <div className="success-row">
                  <span>{t.noteLabel}</span>
                  <strong>{lastOrderData.note}</strong>
                </div>
              ) : null}

              <div className="success-row">
                <span>{t.subtotal}</span>
                <strong>{formatPrice(lastOrderData.subtotal)}</strong>
              </div>
              <div className="success-row">
                <span>{t.shipping}</span>
                <strong>
                  {lastOrderData.shipping === 0 ? t.free : formatPrice(lastOrderData.shipping)}
                </strong>
              </div>
              <div className="success-row total">
                <span>{t.total}</span>
                <strong>{formatPrice(lastOrderData.total)}</strong>
              </div>
            </div>

            <div className="success-actions">
              <button className="success-shop-btn" type="button" onClick={onBackToShop}>
                {t.continueShopping}
              </button>
            </div>

            {lastOrderData.customerEmailSent === false ? (
              <p className="success-footer">{t.emailMaybeFailed}</p>
            ) : (
              <p className="success-footer">Remember. PlayNice.</p>
            )}
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="cart-panel">
      <div className="cart-head">
        <h3>{t.cartTitle}</h3>
        <span>
          {cart.length} {t.items}
        </span>
      </div>

      {cart.length === 0 ? (
        <div className="cart-empty">{t.cartEmpty}</div>
      ) : (
        <>
          <div className="cart-list">
            {cart.map((item, index) => (
              <div className="cart-item" key={`${item.productId}-${item.size}-${index}`}>
                <div className="cart-item-top">
                  <div className="cart-item-name">{item.name}</div>
                  <button
                    type="button"
                    className="cart-remove"
                    onClick={() => removeItem(index)}
                  >
                    ×
                  </button>
                </div>

                <div className="cart-meta">
                  <span>{item.size}</span>
                  <strong>{formatPrice(item.price)}</strong>
                </div>

                <div className="cart-qty-row">
                  <div className="qty-box">
                    <button type="button" onClick={() => decreaseQty(index)}>
                      −
                    </button>
                    <span>{item.qty}</span>
                    <button type="button" onClick={() => increaseQty(index)}>
                      +
                    </button>
                  </div>

                  <div className="cart-line-total">{formatPrice(item.price * item.qty)}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-footer">
            <div className="cart-summary-box">
              <div className="cart-summary-row">
                <span>{t.subtotal}</span>
                <strong>{formatPrice(subtotal)}</strong>
              </div>

              <div className="cart-summary-row">
                <span>{t.shipping}</span>
                <strong>{shipping === 0 ? t.free : formatPrice(shipping)}</strong>
              </div>

              <div className="cart-total-final">
                <span>{t.total}</span>
                <strong>{formatPrice(total)}</strong>
              </div>
            </div>

            <div className="shipping-progress-wrap">
              {shipping === 0 ? (
                <div className="shipping-badge success">{t.unlockedFreeShipping}</div>
              ) : (
                <div className="shipping-badge">
                  {t.addMoreForFreeShipping} <strong>{formatPrice(amountToFreeShipping)}</strong>{" "}
                  {t.forFreeShipping}
                </div>
              )}
            </div>

            <div className="cart-actions-stack">
              <button
                type="button"
                className="btn btn-secondary cart-order-btn"
                onClick={() => onOrderCart(cart)}
              >
                {t.quickDmOrder}
              </button>

              <button
                type="button"
                className="btn btn-primary cart-order-btn"
                onClick={() => setShowCheckout((prev) => !prev)}
              >
                {showCheckout ? t.hideCheckout : t.proceedToCheckout}
              </button>
            </div>

            {showCheckout && (
              <div className="checkout-box">
                <div className="checkout-title">{t.checkoutTitle}</div>

                <div className="checkout-grid">
                  <input
                    className="checkout-input"
                    type="text"
                    name="fullName"
                    placeholder={t.fullName}
                    value={checkoutData.fullName}
                    onChange={handleFieldChange}
                  />
                  <input
                    className="checkout-input"
                    type="email"
                    name="email"
                    placeholder={t.email}
                    value={checkoutData.email}
                    onChange={handleFieldChange}
                  />
                  <input
                    className="checkout-input"
                    type="text"
                    name="phone"
                    placeholder={t.phone}
                    value={checkoutData.phone}
                    onChange={handleFieldChange}
                  />
                  <input
                    className="checkout-input"
                    type="text"
                    name="city"
                    placeholder={t.city}
                    value={checkoutData.city}
                    onChange={handleFieldChange}
                  />
                  <input
                    className="checkout-input"
                    type="text"
                    name="address"
                    placeholder={t.address}
                    value={checkoutData.address}
                    onChange={handleFieldChange}
                  />
                  <textarea
                    className="checkout-textarea"
                    name="note"
                    placeholder={t.note}
                    value={checkoutData.note}
                    onChange={handleFieldChange}
                    rows={4}
                  />
                </div>

                <div className="checkout-note">
                  {t.payment}
                  <br />
                  {t.shipping}: {shipping === 0 ? t.free : formatPrice(shipping)}
                  <br />
                  {t.freeShippingRule}
                </div>

                <button
                  type="button"
                  className="btn btn-primary cart-order-btn"
                  onClick={() => onCheckout(cart)}
                >
                  {t.confirmCheckout}
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </aside>
  );
}

export default function App() {
  const initialParams = getUrlParams();
  const initialSearch = initialParams.get("search") || "";
  const initialFilter = normalizeFilter(initialParams.get("filter") || "All");
  const initialPage = Number(initialParams.get("page") || "1");
  const initialView = initialParams.get("view");

  const [lang, setLang] = useState(() => {
    try {
      if (typeof window === "undefined") return "sr";
      return window.localStorage.getItem("playnice_lang") || "sr";
    } catch {
      return "sr";
    }
  });

  const t = translations[lang];

  const [search, setSearch] = useState(initialSearch);
  const [filter, setFilter] = useState(initialFilter);
  const [currentPage, setCurrentPage] = useState(initialPage > 0 ? initialPage : 1);
  const [isShopPage, setIsShopPage] = useState(initialView === "shop");
  const [showCheckout, setShowCheckout] = useState(false);

  const [cart, setCart] = useState(() => {
    try {
      if (typeof window === "undefined") return [];
      const savedCart = window.localStorage.getItem("playnice_cart");
      return savedCart ? JSON.parse(savedCart) : [];
    } catch {
      return [];
    }
  });

  const [checkoutData, setCheckoutData] = useState(() => {
    const emptyCheckout = {
      fullName: "",
      email: "",
      phone: "",
      city: "",
      address: "",
      note: "",
    };

    try {
      if (typeof window === "undefined") return emptyCheckout;
      const saved = window.localStorage.getItem("playnice_checkout");
      return saved ? { ...emptyCheckout, ...JSON.parse(saved) } : emptyCheckout;
    } catch {
      return emptyCheckout;
    }
  });

  const [orderSuccess, setOrderSuccess] = useState(false);
  const [lastOrderData, setLastOrderData] = useState(null);

  const itemsPerPage = 12;

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("playnice_lang", lang);
  }, [lang]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("playnice_cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("playnice_checkout", JSON.stringify(checkoutData));
  }, [checkoutData]);

  const filteredProducts = useMemo(() => {
    const nextProducts = products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter === "All" || product.category === filter;
      return matchesSearch && matchesFilter;
    });

    if (filter === "All") {
      return [...nextProducts].sort((a, b) => a.name.localeCompare(b.name));
    }

    return nextProducts;
  }, [search, filter]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);

  const paginatedProducts = filteredProducts.slice(
    (safeCurrentPage - 1) * itemsPerPage,
    safeCurrentPage * itemsPerPage
  );

  useEffect(() => {
    if (currentPage !== safeCurrentPage) {
      setCurrentPage(safeCurrentPage);
    }
  }, [currentPage, safeCurrentPage]);

  useEffect(() => {
    if (isShopPage) {
      updateUrlParams(search, filter, safeCurrentPage);
    }
  }, [search, filter, safeCurrentPage, isShopPage]);

  useEffect(() => {
    const handleUrlChange = () => {
      const params = new URLSearchParams(window.location.search);
      const urlSearch = params.get("search") || "";
      const urlFilter = normalizeFilter(params.get("filter") || "All");
      const urlPage = Number(params.get("page") || "1");
      const urlView = params.get("view");

      setSearch(urlSearch);
      setFilter(urlFilter);
      setCurrentPage(urlPage > 0 ? urlPage : 1);
      setIsShopPage(urlView === "shop");
    };

    window.addEventListener("popstate", handleUrlChange);
    return () => window.removeEventListener("popstate", handleUrlChange);
  }, []);

  const addToCart = (newItem) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.productId === newItem.productId && item.size === newItem.size
      );

      if (existingIndex !== -1) {
        return prev.map((item, index) =>
          index === existingIndex ? { ...item, qty: item.qty + 1 } : item
        );
      }

      return [...prev, { ...newItem, qty: 1 }];
    });
  };

  const handleQuickOrder = async ({ name, size, price }) => {
    const orderText = `${t.dmIntro}

${name}
${t.size}: ${size}
${t.price}: ${formatPrice(price)}`;

    const copied = await copyText(orderText);
    window.open(INSTAGRAM_URL, "_blank", "noopener,noreferrer");

    if (copied) {
      alert(t.alertQuickOrderCopied);
    } else {
      alert(`${t.alertQuickOrderFallback}\n\n${orderText}`);
    }
  };

  const handleCartOrder = async (cartItems) => {
    const subtotal = getSubtotal(cartItems);
    const shipping = getShipping(subtotal);
    const total = subtotal + shipping;

    const orderText = `${t.dmIntro}

${cartItems
  .map(
    (item, index) =>
      `${index + 1}. ${item.name}
${t.size}: ${item.size}
${t.quantity}: ${item.qty}
${t.price}: ${formatPrice(item.price)}
${t.lineTotal}: ${formatPrice(item.price * item.qty)}`
  )
  .join("\n\n")}

${t.subtotal}: ${formatPrice(subtotal)}
${t.shipping}: ${shipping === 0 ? t.free : formatPrice(shipping)}
${t.orderTotal}: ${formatPrice(total)}`;

    const copied = await copyText(orderText);
    window.open(INSTAGRAM_URL, "_blank", "noopener,noreferrer");

    if (copied) {
      alert(t.alertCartCopied);
    } else {
      alert(`${t.alertCartFallback}\n\n${orderText}`);
    }
  };

  const handleCheckout = async (cartItems) => {
    if (!checkoutData.fullName.trim()) {
      alert(t.alertName);
      return;
    }

    if (!checkoutData.email.trim()) {
      alert(t.alertEmail);
      return;
    }

    if (!checkoutData.phone.trim()) {
      alert(t.alertPhone);
      return;
    }

    if (!checkoutData.city.trim()) {
      alert(t.alertCity);
      return;
    }

    if (!checkoutData.address.trim()) {
      alert(t.alertAddress);
      return;
    }

    try {
      const subtotal = getSubtotal(cartItems);
      const shipping = getShipping(subtotal);
      const total = subtotal + shipping;

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...checkoutData,
          cart: cartItems,
          lang,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || t.alertCheckoutError);
      }

      setLastOrderData({
        ...checkoutData,
        cart: [...cartItems],
        subtotal,
        shipping,
        total,
        customerEmailSent: data?.customerEmailSent ?? true,
        orderId: data?.orderId || null,
      });

      setOrderSuccess(true);
      setCart([]);

      const emptyCheckout = {
        fullName: "",
        email: "",
        phone: "",
        city: "",
        address: "",
        note: "",
      };

      setCheckoutData(emptyCheckout);

      if (typeof window !== "undefined") {
        window.localStorage.removeItem("playnice_cart");
        window.localStorage.removeItem("playnice_checkout");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (error) {
      console.error(error);
      alert(error?.message || t.alertCheckoutError);
    }
  };

  const handleBackToShop = () => {
    setOrderSuccess(false);
    setLastOrderData(null);
    setIsShopPage(true);
    updateUrlParams(search, filter, safeCurrentPage);

    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleHeroBottleClick = () => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.productId === HERO_PRODUCT.productId &&
          item.size === HERO_PRODUCT.size
      );

      if (existingIndex !== -1) {
        return prev.map((item, index) =>
          index === existingIndex ? { ...item, qty: item.qty + 1 } : item
        );
      }

      return [
        ...prev,
        {
          ...HERO_PRODUCT,
          qty: 1,
        },
      ];
    });

    setIsShopPage(true);
    setCurrentPage(1);
    setShowCheckout(true);

    if (typeof window !== "undefined") {
      window.history.pushState({}, "", buildShopUrl("", "All", 1));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const openHome = (e) => {
    e?.preventDefault?.();
    setIsShopPage(false);
    setShowCheckout(false);

    if (typeof window !== "undefined") {
      window.history.pushState({}, "", "/");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const goToShop = () => {
    setIsShopPage(true);
    setCurrentPage(1);

    if (typeof window !== "undefined") {
      window.history.pushState({}, "", buildShopUrl(search, filter, 1));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const goToShopWithSearch = (term) => {
    setSearch(term);
    setFilter("All");
    setCurrentPage(1);
    setIsShopPage(true);

    if (typeof window !== "undefined") {
      window.history.pushState({}, "", buildShopUrl(term, "All", 1));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="site-shell">
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />
      <div className="grain-overlay" />

      <header className="header">
        <div className="container header-inner">
          <div className="brand-block">
            <a href="/" className="brand-logo" onClick={openHome}>
              PLAYNICE
            </a>
            <div className="brand-tagline">Remember. PlayNice.</div>
          </div>

          <div className="header-right">
            <nav className="nav">
              <a href="/" onClick={openHome}>
                {t.navHome}
              </a>
              <a
                href="/?view=shop"
                onClick={(e) => {
                  e.preventDefault();
                  goToShop();
                }}
              >
                {t.navShop}
              </a>
              <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer">
                {t.navContact}
              </a>
            </nav>

            <div className="lang-toggle">
              <button
                type="button"
                className={lang === "sr" ? "lang-btn active" : "lang-btn"}
                onClick={() => setLang("sr")}
              >
                SR
              </button>
              <button
                type="button"
                className={lang === "en" ? "lang-btn active" : "lang-btn"}
                onClick={() => setLang("en")}
              >
                EN
              </button>
            </div>
          </div>
        </div>
      </header>

      <main>
        {!isShopPage ? (
          <>
            <section id="intro" className="hero intro-hero hero-featured hero-conversion">
              <div className="container hero-featured-grid">
                <div className="hero-featured-left">
                  <div className="hero-bottle-wrapper hero-bottle-wrapper-conversion">
                    <div className="hero-floating-badge">{t.heroFloatBadge}</div>

                    <button
                      type="button"
                      className="hero-bottle-float hero-bottle-button"
                      onClick={handleHeroBottleClick}
                      aria-label="Add Afnan 9PM Rebel 100ml to cart"
                    >
                      <img
                        src="/images/9pm.png"
                        alt="Afnan 9PM Rebel"
                        className="hero-bottle main"
                      />
                    </button>
                  </div>
                </div>

                <div className="hero-featured-right">
                  <div className="section-kicker">{t.heroBadge}</div>

                  <h1 className="hero-title">
                    {t.heroTitle.replace(".", "")}
                    <span className="dot">.</span>
                  </h1>

                  <h2 className="hero-product">AFNAN 9PM REBEL</h2>

                  <p className="hero-sub">{t.heroSub}</p>
                  <p className="hero-desc">{t.heroDesc}</p>

                  <div className="hero-tags">
                    <span>{t.heroTag1}</span>
                    <span>{t.heroTag2}</span>
                    <span>{t.heroTag3}</span>
                  </div>

                  <div className="hero-actions hero-actions-conversion">
                    <button
                      type="button"
                      className="btn btn-primary hero-main-cta"
                      onClick={handleHeroBottleClick}
                    >
                      {t.heroPrimaryCta}
                    </button>

                    <a
                      href={INSTAGRAM_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-secondary hero-secondary-cta"
                    >
                      {t.heroSecondaryCta}
                    </a>
                  </div>

                  <div className="hero-proof">{t.heroProof}</div>

                  <div className="hero-secondary hero-secondary-conversion">
                    <button
                      type="button"
                      className="hero-secondary-item hero-secondary-button"
                      onClick={() => goToShopWithSearch("Island Dreams")}
                    >
                      <img src="/images/island.png" alt="Khadlaj Island Dreams" />
                      <span>Island Dreams</span>
                    </button>

                    <button
                      type="button"
                      className="hero-secondary-item hero-secondary-button"
                      onClick={() => goToShopWithSearch("Marwa")}
                    >
                      <img src="/images/marwa.png" alt="Arabiyat Prestige Marwa" />
                      <span>Marwa</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="mobile-sticky-hero-cta">
                <button
                  type="button"
                  className="btn btn-primary mobile-sticky-hero-btn"
                  onClick={handleHeroBottleClick}
                >
                  {t.heroStickyCta}
                </button>
              </div>
            </section>

            <section className="section cta-section">
              <div className="container">
                <div className="cta-box">
                  <div className="section-kicker">{t.ctaKicker}</div>
                  <h2>{t.ctaTitle}</h2>
                  <p>{t.ctaText}</p>

                  <div className="cta-actions">
                    <button type="button" className="btn btn-primary" onClick={goToShop}>
                      {t.ctaOpenShop}
                    </button>
                    <a
                      href={INSTAGRAM_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-secondary"
                    >
                      {t.ctaSendDm}
                    </a>
                  </div>
                </div>
              </div>
            </section>
          </>
        ) : (
          <section id="catalog" className="section">
            <div className="container shop-layout">
              <div className="shop-main">
                <div className="section-head catalog-head">
                  <div>
                    <div className="section-kicker">{t.shopKicker}</div>
                    <h2 className="section-title">{t.shopTitle}</h2>
                    <p className="section-text">{t.shopText}</p>
                  </div>

                  <div className="search-wrap">
                    <input
                      type="text"
                      className="search-input"
                      placeholder={t.searchPlaceholder}
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setCurrentPage(1);
                      }}
                    />
                  </div>
                </div>

                <div className="filter-bar">
                  <button
                    className={filter === "All" ? "filter-btn active" : "filter-btn"}
                    onClick={() => {
                      setFilter("All");
                      setCurrentPage(1);
                    }}
                    type="button"
                  >
                    {t.filterAll}
                  </button>

                  <button
                    className={filter === "Arabian" ? "filter-btn active" : "filter-btn"}
                    onClick={() => {
                      setFilter("Arabian");
                      setCurrentPage(1);
                    }}
                    type="button"
                  >
                    {t.filterArabian}
                  </button>

                  <button
                    className={
                      filter === "Designer/Niche" ? "filter-btn active" : "filter-btn"
                    }
                    onClick={() => {
                      setFilter("Designer/Niche");
                      setCurrentPage(1);
                    }}
                    type="button"
                  >
                    {t.filterDesigner}
                  </button>
                </div>

                <div className="catalog-summary">
                  {t.showing} <strong>{filteredProducts.length}</strong> {t.of}{" "}
                  <strong>{products.length}</strong> {t.fragrances}
                </div>

                <div className="product-grid">
                  {paginatedProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={addToCart}
                      onQuickOrder={handleQuickOrder}
                      t={t}
                    />
                  ))}
                </div>

                <div className="pagination">
                  <button
                    type="button"
                    className="pagination-btn"
                    disabled={safeCurrentPage === 1}
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  >
                    {t.prev}
                  </button>

                  <div className="pagination-info">
                    {t.page} <strong>{safeCurrentPage}</strong> {t.of} <strong>{totalPages}</strong>
                  </div>

                  <button
                    type="button"
                    className="pagination-btn"
                    disabled={safeCurrentPage === totalPages}
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                  >
                    {t.next}
                  </button>
                </div>
              </div>

              <div className="shop-cart">
                <div className="shop-cart-inner">
                  <CartPanel
                    cart={cart}
                    setCart={setCart}
                    onOrderCart={handleCartOrder}
                    checkoutData={checkoutData}
                    setCheckoutData={setCheckoutData}
                    onCheckout={handleCheckout}
                    orderSuccess={orderSuccess}
                    lastOrderData={lastOrderData}
                    onBackToShop={handleBackToShop}
                    showCheckout={showCheckout}
                    setShowCheckout={setShowCheckout}
                    t={t}
                  />
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      <footer id="contact" className="footer">
        <div className="container footer-inner">
          <div className="footer-brand">PLAYNICE</div>
          <div className="footer-line">Try before you buy.</div>
          <div className="footer-links">
            <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer">
              {t.footerInstagram}
            </a>
            <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer">
              {t.footerSendDm}
            </a>
          </div>
          <div className="footer-copy">Remember. PlayNice.</div>
        </div>
      </footer>
    </div>
  );
}
