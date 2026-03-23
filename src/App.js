import React, { useEffect, useMemo, useState } from "react";
import "./App.css";

const products = [
  // Arabian
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

  // Designer / Niche
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

const isShopPage =
  typeof window !== "undefined" &&
  new URLSearchParams(window.location.search).get("view") === "shop";

function formatPrice(value) {
  return `${Number(value).toFixed(value % 1 === 0 ? 0 : 1)}€`;
}

function getCartTotal(cart) {
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function updateUrlParams(nextSearch, nextFilter, nextPage) {
  const params = new URLSearchParams(window.location.search);
  params.set("view", "shop");

  if (nextSearch && nextSearch.trim()) {
    params.set("search", nextSearch.trim());
  } else {
    params.delete("search");
  }

  if (nextFilter && nextFilter !== "All") {
    params.set("filter", nextFilter);
  } else {
    params.delete("filter");
  }

  if (nextPage && nextPage > 1) {
    params.set("page", String(nextPage));
  } else {
    params.delete("page");
  }

  const newUrl = `${window.location.pathname}?${params.toString()}`;
  window.history.replaceState({}, "", newUrl);
}

function ProductCard({ product, onAddToCart }) {
  const sizeOptions = Object.keys(product.sizes);
  const [selectedSize, setSelectedSize] = useState(sizeOptions[0]);
  const selectedPrice = product.sizes[selectedSize];

  const mailText = encodeURIComponent(
    `Zdravo, želim da naručim:\n${product.name}\nVeličina: ${selectedSize}\nCena: ${formatPrice(selectedPrice)}`
  );

  const mailUrl = `mailto:order@playniceshop.me?subject=${encodeURIComponent(
    `Order request - ${product.name}`
  )}&body=${mailText}`;

  return (
    <article className="product-card">
      {product.badge && (
        <div className="card-flag bestseller">
          Best
          <br />
          Seller
        </div>
      )}

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
        <span>Selected</span>
        <strong>
          {selectedSize} → {formatPrice(selectedPrice)}
        </strong>
      </div>

      <div className="product-actions">
        <button
          className="btn btn-primary"
          type="button"
          onClick={() =>
            onAddToCart({
              productId: product.id,
              name: product.name,
              size: selectedSize,
              price: selectedPrice,
            })
          }
        >
          Add to Cart
        </button>

        <a href={mailUrl} className="btn btn-secondary">
          Order Now
        </a>
      </div>
    </article>
  );
}

function CartPanel({ cart, setCart }) {
  const total = getCartTotal(cart);

  const increaseQty = (index) => {
    setCart((prev) =>
      prev.map((item, i) => (i === index ? { ...item, qty: item.qty + 1 } : item))
    );
  };

  const decreaseQty = (index) => {
    setCart((prev) =>
      prev
        .map((item, i) =>
          i === index ? { ...item, qty: Math.max(1, item.qty - 1) } : item
        )
        .filter((item) => item.qty > 0)
    );
  };

  const removeItem = (index) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const orderBody = encodeURIComponent(
    `Zdravo, želim da naručim:\n\n${cart
      .map(
        (item, index) =>
          `${index + 1}. ${item.name}\n   Veličina: ${item.size}\n   Količina: ${item.qty}\n   Cena: ${formatPrice(item.price)}\n   Ukupno: ${formatPrice(item.price * item.qty)}`
      )
      .join("\n\n")}\n\nUkupno za porudžbinu: ${formatPrice(total)}`
  );

  const mailUrl = `mailto:order@playniceshop.me?subject=${encodeURIComponent(
    "PlayNice order"
  )}&body=${orderBody}`;

  return (
    <aside className="cart-panel">
      <div className="cart-head">
        <h3>Cart</h3>
        <span>{cart.length} items</span>
      </div>

      {cart.length === 0 ? (
        <div className="cart-empty">Your cart is empty.</div>
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

                  <div className="cart-line-total">
                    {formatPrice(item.price * item.qty)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-footer">
            <div className="cart-total">
              <span>Total</span>
              <strong>{formatPrice(total)}</strong>
            </div>

            <a href={mailUrl} className="btn btn-primary cart-order-btn">
              Order Entire Cart
            </a>
          </div>
        </>
      )}
    </aside>
  );
}

export default function App() {
  const initialParams =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search)
      : new URLSearchParams();

  const initialSearch = initialParams.get("search") || "";
  const initialFilter = initialParams.get("filter") || "All";
  const initialPage = Number(initialParams.get("page") || "1");

  const [search, setSearch] = useState(initialSearch);
  const [filter, setFilter] = useState(
    initialFilter === "Arabian" || initialFilter === "Designer/Niche"
      ? initialFilter
      : "All"
  );
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem("playnice_cart");
      return savedCart ? JSON.parse(savedCart) : [];
    } catch {
      return [];
    }
  });
  const [currentPage, setCurrentPage] = useState(initialPage > 0 ? initialPage : 1);
  const itemsPerPage = 12;

  useEffect(() => {
    localStorage.setItem("playnice_cart", JSON.stringify(cart));
  }, [cart]);

  const filteredProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesFilter = filter === "All" || product.category === filter;

      return matchesSearch && matchesFilter;
    });

    if (filter === "All") {
      return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    }

    return filtered;
  }, [search, filter]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const safeCurrentPage =
    totalPages === 0 ? 1 : Math.min(Math.max(currentPage, 1), totalPages);

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
  }, [search, filter, safeCurrentPage]);

  useEffect(() => {
    const handleUrlChange = () => {
      const params = new URLSearchParams(window.location.search);
      const urlSearch = params.get("search") || "";
      const urlFilter = params.get("filter") || "All";
      const urlPage = Number(params.get("page") || "1");

      setSearch(urlSearch);
      setFilter(
        urlFilter === "Arabian" || urlFilter === "Designer/Niche"
          ? urlFilter
          : "All"
      );
      setCurrentPage(urlPage > 0 ? urlPage : 1);
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

  return (
    <div className="site-shell">
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />
      <div className="grain-overlay" />

      <header className="header">
        <div className="container header-inner">
          <div className="brand-block">
            <a href="/" className="brand-logo">
              PLAYNICE
            </a>
            <div className="brand-tagline">Remember. PlayNice.</div>
          </div>

          <nav className="nav">
            <a href="/">Home</a>
            <a href="/?view=shop">Shop</a>
            <a href="mailto:order@playniceshop.me">Contact</a>
          </nav>
        </div>
      </header>

      <main>
        {!isShopPage ? (
          <>
            <section id="intro" className="hero intro-hero">
              <div className="container hero-grid">
                <div className="hero-copy">
                  <div className="section-kicker">PLAYNICE PREMIUM FRAGRANCE DECANTS</div>

                  <h1 className="hero-title">
                    Try before
                    <span> you buy.</span>
                  </h1>

                  <p className="hero-text">
                    Niche. Designer. Arabic.
                    <br />
                    Pažljivo odabrani parfemi u premium dekantima.
                    <br />
                    Otkrij pravi miris pre nego što kupiš punu bočicu.
                  </p>

                  <div className="hero-actions">
                    <a href="/?view=shop" className="btn btn-primary">
                      Shop
                    </a>
                    <a
                      href="https://www.instagram.com/playnice.me/"
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-secondary"
                    >
                      Instagram
                    </a>
                  </div>

                  <div className="stats-grid">
                    <div className="stat-card">
                      <div className="stat-value">{products.length}+</div>
                      <div className="stat-label">Fragrances</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-value">Arabian / Designer / Niche</div>
                      <div className="stat-label">Curated selection</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-value">Premium</div>
                      <div className="stat-label">Try before you buy</div>
                    </div>
                  </div>
                </div>

                <div className="hero-visual">
                  <div className="visual-card">
                    <div className="visual-topline">PLAYNICE COLLECTION</div>

                    <div className="bottle-stage">
                      <div className="bottle-glow" />
                      <div className="bottle-shadow" />
                      <div className="bottle">
                        <div className="bottle-cap" />
                        <div className="bottle-front">PN</div>
                      </div>
                    </div>

                    <div className="visual-panel">
                      <h3>Luxury starts with the right sample</h3>
                      <p>
                        Klikni na Shop i pregledaj kompletnu selekciju Arabian i
                        Designer/Niche parfema sa cenama i opcijom za poručivanje.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="section cta-section">
              <div className="container">
                <div className="cta-box">
                  <div className="section-kicker">PLAYNICE</div>
                  <h2>Discover fragrances the right way.</h2>
                  <p>
                    Testiraj pre pune bočice. Premium dekanti, pažljivo biran izbor i
                    jednostavna porudžbina.
                  </p>

                  <div className="cta-actions">
                    <a href="/?view=shop" className="btn btn-primary">
                      Open Shop
                    </a>
                    <a href="mailto:order@playniceshop.me" className="btn btn-secondary">
                      Send Email
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
                    <div className="section-kicker">SHOP</div>
                    <h2 className="section-title">PlayNice fragrance collection</h2>
                    <p className="section-text">
                      Pregledaj parfeme, izaberi veličinu i dodaj u korpu.
                    </p>
                  </div>

                  <div className="search-wrap">
                    <input
                      type="text"
                      className="search-input"
                      placeholder="Search fragrance..."
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
                    All
                  </button>

                  <button
                    className={filter === "Arabian" ? "filter-btn active" : "filter-btn"}
                    onClick={() => {
                      setFilter("Arabian");
                      setCurrentPage(1);
                    }}
                    type="button"
                  >
                    Arabian
                  </button>

                  <button
                    className={filter === "Designer/Niche" ? "filter-btn active" : "filter-btn"}
                    onClick={() => {
                      setFilter("Designer/Niche");
                      setCurrentPage(1);
                    }}
                    type="button"
                  >
                    Designer / Niche
                  </button>
                </div>

                <div className="catalog-summary">
                  Showing <strong>{filteredProducts.length}</strong> of{" "}
                  <strong>{products.length}</strong> fragrances
                </div>

                <div className="product-grid">
                  {paginatedProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={addToCart}
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
                    Prev
                  </button>

                  <div className="pagination-info">
                    Page <strong>{safeCurrentPage}</strong> of <strong>{totalPages || 1}</strong>
                  </div>

                  <button
                    type="button"
                    className="pagination-btn"
                    disabled={safeCurrentPage === totalPages || totalPages === 0}
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  >
                    Next
                  </button>
                </div>
              </div>

              <CartPanel cart={cart} setCart={setCart} />
            </div>
          </section>
        )}
      </main>

      <footer id="contact" className="footer">
        <div className="container footer-inner">
          <div className="footer-brand">PLAYNICE</div>
          <div className="footer-line">Try before you buy.</div>
          <div className="footer-links">
            <a
              href="https://www.instagram.com/playnice.me/"
              target="_blank"
              rel="noreferrer"
            >
              Instagram
            </a>
            <a href="mailto:order@playniceshop.me">order@playniceshop.me</a>
          </div>
          <div className="footer-copy">Remember. PlayNice.</div>
        </div>
      </footer>
    </div>
  );
}
