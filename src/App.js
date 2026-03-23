import React, { useEffect, useMemo, useState } from "react";
import "./App.css";

/*
  Ako već imaš proizvode u posebnom fajlu, umesto ovog demo niza uradi npr:
  import { PRODUCTS } from "./data/products";
*/

const PRODUCTS = [
  {
    id: 1,
    name: "Afnan 9PM Rebel",
    brand: "Afnan",
    category: "Arabic",
    price5ml: 9,
    price10ml: 16,
    image:
      "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=900&q=80",
    bestseller: true,
    inStock: true,
  },
  {
    id: 2,
    name: "Bleu de Chanel EDP",
    brand: "Chanel",
    category: "Designer",
    price5ml: 15,
    price10ml: 27,
    image:
      "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=900&q=80",
    bestseller: false,
    inStock: true,
  },
  {
    id: 3,
    name: "Club de Nuit Sillage",
    brand: "Armaf",
    category: "Arabic",
    price5ml: 4,
    price10ml: 7,
    image:
      "https://images.unsplash.com/photo-1588405748880-12d1d2a59dc5?auto=format&fit=crop&w=900&q=80",
    bestseller: true,
    inStock: true,
  },
  {
    id: 4,
    name: "Cedrat Boise",
    brand: "Mancera",
    category: "Niche",
    price5ml: 12,
    price10ml: 22,
    image:
      "https://images.unsplash.com/photo-1615634262417-d1e6db70f9af?auto=format&fit=crop&w=900&q=80",
    bestseller: false,
    inStock: true,
  },
  {
    id: 5,
    name: "Gentleman Réserve Privée",
    brand: "Givenchy",
    category: "Designer",
    price5ml: 11,
    price10ml: 20,
    image:
      "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=900&q=80",
    bestseller: false,
    inStock: true,
  },
  {
    id: 6,
    name: "Ambassador",
    brand: "Gisada",
    category: "Designer",
    price5ml: 10,
    price10ml: 18,
    image:
      "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=900&q=80",
    bestseller: false,
    inStock: true,
  },
  {
    id: 7,
    name: "Supremacy Collector's Edition",
    brand: "Afnan",
    category: "Arabic",
    price5ml: 8,
    price10ml: 14,
    image:
      "https://images.unsplash.com/photo-1566977776052-9c9ad3f4f0bc?auto=format&fit=crop&w=900&q=80",
    bestseller: false,
    inStock: true,
  },
  {
    id: 8,
    name: "Boss The Scent Elixir",
    brand: "Hugo Boss",
    category: "Designer",
    price5ml: 15,
    price10ml: 27,
    image:
      "https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&w=900&q=80",
    bestseller: true,
    inStock: true,
  },
  {
    id: 9,
    name: "L'Homme EDP",
    brand: "YSL",
    category: "Designer",
    price5ml: 13,
    price10ml: 23,
    image:
      "https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&w=900&q=80",
    bestseller: false,
    inStock: true,
  },
  {
    id: 10,
    name: "Explorer Extreme",
    brand: "Montblanc",
    category: "Designer",
    price5ml: 10,
    price10ml: 18,
    image:
      "https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?auto=format&fit=crop&w=900&q=80",
    bestseller: false,
    inStock: true,
  },
  {
    id: 11,
    name: "Asad Elixir",
    brand: "Lattafa",
    category: "Arabic",
    price5ml: 6,
    price10ml: 11,
    image:
      "https://images.unsplash.com/photo-1603575449299-5a0ef10ac6f6?auto=format&fit=crop&w=900&q=80",
    bestseller: false,
    inStock: true,
  },
  {
    id: 12,
    name: "Musamam Black Intense",
    brand: "Lattafa",
    category: "Arabic",
    price5ml: 5,
    price10ml: 9,
    image:
      "https://images.unsplash.com/photo-1590736969955-71cc94901144?auto=format&fit=crop&w=900&q=80",
    bestseller: false,
    inStock: true,
  },
  {
    id: 13,
    name: "Aventus Cologne",
    brand: "Creed",
    category: "Niche",
    price5ml: 22,
    price10ml: 40,
    image:
      "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?auto=format&fit=crop&w=900&q=80",
    bestseller: true,
    inStock: true,
  },
];

const ITEMS_PER_PAGE = 12;
const EMAIL_ADDRESS = "order@playniceshop.me";

function getInitialQueryState() {
  const params = new URLSearchParams(window.location.search);

  return {
    view: params.get("view") === "shop" ? "shop" : "intro",
    search: params.get("search") || "",
    filter: params.get("filter") || "All",
    page: Math.max(1, Number(params.get("page")) || 1),
  };
}

function App() {
  const initial = getInitialQueryState();

  const [view, setView] = useState(initial.view);
  const [search, setSearch] = useState(initial.search);
  const [selectedFilter, setSelectedFilter] = useState(initial.filter);
  const [currentPage, setCurrentPage] = useState(initial.page);
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem("playnice_cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const categories = useMemo(() => {
    const unique = [...new Set(PRODUCTS.map((p) => p.category).filter(Boolean))];
    return ["All", ...unique];
  }, []);

  useEffect(() => {
    localStorage.setItem("playnice_cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    const params = new URLSearchParams();

    if (view !== "intro") params.set("view", view);
    if (search.trim()) params.set("search", search.trim());
    if (selectedFilter !== "All") params.set("filter", selectedFilter);
    if (currentPage > 1) params.set("page", String(currentPage));

    const queryString = params.toString();
    const newUrl = queryString
      ? `${window.location.pathname}?${queryString}`
      : window.location.pathname;

    window.history.replaceState({}, "", newUrl);
  }, [view, search, selectedFilter, currentPage]);

  useEffect(() => {
    const handlePopState = () => {
      const state = getInitialQueryState();
      setView(state.view);
      setSearch(state.search);
      setSelectedFilter(state.filter);
      setCurrentPage(state.page);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();

    return PRODUCTS.filter((product) => {
      const matchesSearch =
        !term ||
        product.name.toLowerCase().includes(term) ||
        (product.brand || "").toLowerCase().includes(term) ||
        (product.category || "").toLowerCase().includes(term);

      const matchesFilter =
        selectedFilter === "All" || product.category === selectedFilter;

      return matchesSearch && matchesFilter;
    });
  }, [search, selectedFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / ITEMS_PER_PAGE)
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const goToShop = () => {
    setView("shop");
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
    setCurrentPage(1);
  };

  const addToCart = (product, size = 10) => {
    const price = size === 5 ? product.price5ml : product.price10ml;
    const key = `${product.id}-${size}`;

    setCart((prev) => {
      const existing = prev.find((item) => item.key === key);

      if (existing) {
        return prev.map((item) =>
          item.key === key
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [
        ...prev,
        {
          key,
          id: product.id,
          name: product.name,
          brand: product.brand,
          size,
          price,
          quantity: 1,
        },
      ];
    });
  };

  const decreaseQuantity = (key) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.key === key
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const increaseQuantity = (key) => {
    setCart((prev) =>
      prev.map((item) =>
        item.key === key
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  const removeFromCart = (key) => {
    setCart((prev) => prev.filter((item) => item.key !== key));
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const totalPrice = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  const handleCheckoutEmail = () => {
    if (!cart.length) return;

    const subject = encodeURIComponent("PlayNice Order");

    const lines = [
      "Hello PlayNice,",
      "",
      "I would like to place the following order:",
      "",
      ...cart.map(
        (item) =>
          `- ${item.name} | ${item.size}ml | qty: ${item.quantity} | €${(
            item.price * item.quantity
          ).toFixed(2)}`
      ),
      "",
      `Total: €${totalPrice.toFixed(2)}`,
      "",
      "My details:",
      "Name:",
      "Phone:",
      "City:",
      "Address:",
      "",
      "Thank you.",
    ];

    const body = encodeURIComponent(lines.join("\n"));
    window.location.href = `mailto:${EMAIL_ADDRESS}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand-block">
          <h1 className="brand-title">PlayNice</h1>
          <p className="brand-subtitle">Remember. PlayNice.</p>
        </div>

        <div className="topbar-actions">
          <button
            className={`nav-btn ${view === "intro" ? "active" : ""}`}
            onClick={() => setView("intro")}
            type="button"
          >
            Home
          </button>
          <button
            className={`nav-btn ${view === "shop" ? "active" : ""}`}
            onClick={() => setView("shop")}
            type="button"
          >
            Shop
          </button>
        </div>
      </header>

      {view === "intro" && (
        <section className="hero-section">
          <div className="hero-overlay">
            <p className="hero-kicker">Niche. Designer. Arabic.</p>
            <h2 className="hero-title">Try before you buy.</h2>
            <p className="hero-text">
              Carefully selected fragrances in premium decants.
            </p>
            <button className="hero-cta" onClick={goToShop} type="button">
              Enter Shop
            </button>
          </div>
        </section>
      )}

      {view === "shop" && (
        <main className="shop-layout">
          <section className="shop-main">
            <div className="shop-toolbar">
              <div className="search-wrap">
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search fragrance, brand or category..."
                  value={search}
                  onChange={handleSearchChange}
                />
              </div>

              <div className="filter-wrap">
                {categories.map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    className={`filter-btn ${
                      selectedFilter === filter ? "active" : ""
                    }`}
                    onClick={() => handleFilterChange(filter)}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            <div className="results-meta">
              <span>
                {filteredProducts.length} fragrance
                {filteredProducts.length !== 1 ? "s" : ""}
              </span>
              <span>
                Page {currentPage} / {totalPages}
              </span>
            </div>

            <div className="products-grid">
              {paginatedProducts.map((product) => (
                <article className="product-card" key={product.id}>
                  <div className="product-image-wrap">
                    {product.bestseller && (
                      <div className="bestseller-badge">
                        <span>Best</span>
                        <span>Seller</span>
                      </div>
                    )}

                    <img
                      className="product-image"
                      src={product.image}
                      alt={product.name}
                    />
                  </div>

                  <div className="product-info">
                    <p className="product-brand">{product.brand}</p>
                    <h3 className="product-name">{product.name}</h3>
                    <p className="product-category">{product.category}</p>

                    <div className="product-prices">
                      <div className="price-line">
                        <span>5ml</span>
                        <strong>€{product.price5ml}</strong>
                      </div>
                      <div className="price-line">
                        <span>10ml</span>
                        <strong>€{product.price10ml}</strong>
                      </div>
                    </div>

                    <div className="product-actions">
                      <button
                        type="button"
                        className="add-to-cart-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(product, 5);
                        }}
                      >
                        Add 5ml
                      </button>

                      <button
                        type="button"
                        className="add-to-cart-btn secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(product, 10);
                        }}
                      >
                        Add 10ml
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="pagination">
              <button
                type="button"
                className="page-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              >
                Prev
              </button>

              <span className="page-indicator">
                {currentPage} / {totalPages}
              </span>

              <button
                type="button"
                className="page-btn"
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
              >
                Next
              </button>
            </div>
          </section>

          <aside className="cart-sidebar">
            <div className="cart-header">
              <h2>Cart</h2>
              <span>{cartCount} item{cartCount !== 1 ? "s" : ""}</span>
            </div>

            {!cart.length ? (
              <div className="cart-empty">
                <p>Your cart is empty.</p>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {cart.map((item) => (
                    <div className="cart-item" key={item.key}>
                      <div className="cart-item-info">
                        <h4>{item.name}</h4>
                        <p>
                          {item.size}ml · €{item.price}
                        </p>
                      </div>

                      <div className="cart-item-controls">
                        <button
                          type="button"
                          className="qty-btn"
                          onClick={() => decreaseQuantity(item.key)}
                        >
                          −
                        </button>

                        <span className="qty-value">{item.quantity}</span>

                        <button
                          type="button"
                          className="qty-btn"
                          onClick={() => increaseQuantity(item.key)}
                        >
                          +
                        </button>

                        <button
                          type="button"
                          className="remove-btn"
                          onClick={() => removeFromCart(item.key)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="cart-footer">
                  <div className="cart-total">
                    <span>Total</span>
                    <strong>€{totalPrice.toFixed(2)}</strong>
                  </div>

                  <button
                    type="button"
                    className="checkout-btn"
                    onClick={handleCheckoutEmail}
                  >
                    Order via Email
                  </button>

                  <button
                    type="button"
                    className="clear-cart-btn"
                    onClick={clearCart}
                  >
                    Clear cart
                  </button>
                </div>
              </>
            )}
          </aside>
        </main>
      )}
    </div>
  );
}

export default App;
