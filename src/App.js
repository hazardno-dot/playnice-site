import React, { useEffect, useMemo, useState } from "react";
import "./App.css";

const products = [
  { id: 1, name: "Afnan 9AM", category: "Arabian", sizes: { "5ml": 4, "10ml": 7, "20ml": 13 } },
  { id: 2, name: "Afnan 9PM Rebel", category: "Arabian", sizes: { "5ml": 4, "10ml": 7, "20ml": 13 }, badge: "BESTSELLER" },
  { id: 3, name: "Afnan Supremacy Collector's Edition Pour Homme", category: "Arabian", sizes: { "5ml": 5, "10ml": 9, "20ml": 17 } },
  { id: 4, name: "Afnan Turathi Blue", category: "Arabian", sizes: { "5ml": 6, "10ml": 11, "20ml": 20 } },
  { id: 5, name: "Afnan 9PM", category: "Arabian", sizes: { "5ml": 4, "10ml": 7, "20ml": 13 } },
  { id: 6, name: "Lattafa Khamrah Qahwa", category: "Arabian", sizes: { "5ml": 5, "10ml": 9, "20ml": 17 }, badge: "HOT" },
  { id: 7, name: "Armaf Club de Nuit Intense Man EDT", category: "Designer", sizes: { "5ml": 5, "10ml": 9, "20ml": 17 } },
  { id: 8, name: "Armaf Club de Nuit Sillage", category: "Designer", sizes: { "5ml": 5, "10ml": 9, "20ml": 17 } },
  { id: 9, name: "Armaf Club de Nuit Bling", category: "Designer", sizes: { "5ml": 6, "10ml": 11, "20ml": 20 } },
  { id: 10, name: "Mancera Cedrat Boise", category: "Niche", sizes: { "5ml": 10, "10ml": 18, "20ml": 34 } },
  { id: 11, name: "Gisada Ambassador", category: "Designer", sizes: { "5ml": 11, "10ml": 20, "20ml": 38 } },
  { id: 12, name: "Givenchy Gentleman Réserve Privée", category: "Designer", sizes: { "5ml": 10, "10ml": 18, "20ml": 34 } },
  { id: 13, name: "Creed Aventus Cologne", category: "Niche", sizes: { "5ml": 29, "10ml": 52, "20ml": 98 } },
  { id: 14, name: "Bleu de Chanel EDP", category: "Designer", sizes: { "5ml": 15, "10ml": 27, "20ml": 50 } },
  { id: 15, name: "Boss The Scent Elixir", category: "Designer", sizes: { "5ml": 15, "10ml": 27, "20ml": 50 } },
  { id: 16, name: "Montblanc Explorer Extreme", category: "Designer", sizes: { "5ml": 10, "10ml": 18, "20ml": 34 } },
  { id: 17, name: "Swiss Arabian Tobacco 01", category: "Arabian", sizes: { "5ml": 10, "10ml": 18, "20ml": 34 } },
  { id: 18, name: "Calvin Klein Defy EDT", category: "Designer", sizes: { "5ml": 7, "10ml": 12, "20ml": 22 } },
  { id: 19, name: "Calvin Klein Defy Parfum", category: "Designer", sizes: { "5ml": 10, "10ml": 18, "20ml": 34 } },
  { id: 20, name: "CK All", category: "Designer", sizes: { "5ml": 6, "10ml": 11, "20ml": 20 } },
  { id: 21, name: "Kadlaj Island Dreams", category: "Summer", sizes: { "5ml": 5, "10ml": 9, "20ml": 17 }, badge: "SUMMER" },
  { id: 22, name: "Arabian Prestige Marwa", category: "Arabian", sizes: { "5ml": 5, "10ml": 9, "20ml": 17 } },
  { id: 23, name: "Parfums de Marly Castley", category: "Niche", sizes: { "5ml": 16, "10ml": 29, "20ml": 55 } },
  { id: 24, name: "Afnan Supremacy Not Only Intense", category: "Arabian", sizes: { "5ml": 6, "10ml": 11, "20ml": 20 } }
];

const productDetails = {
  "Afnan 9AM": {
    description: "Bright, modern and easy to wear. A clean energetic opener with a sharp daytime profile.",
    vibe: "Fresh. Crisp. Effortless daily reach."
  },
  "Afnan 9PM Rebel": {
    description: "A bold, addictive crowd-pleaser with strong presence and excellent value. Built to stand out.",
    vibe: "Sweet. Loud. Compliment magnet."
  },
  "Afnan Supremacy Collector's Edition Pour Homme": {
    description: "A richer and more elevated masculine profile with polished depth and strong signature energy.",
    vibe: "Refined. Powerful. Dressed-up confidence."
  },
  "Afnan Turathi Blue": {
    description: "Fresh citrus sparkle over a smooth woody base. Clean luxury with broad appeal.",
    vibe: "Blue. Sharp. Versatile."
  },
  "Afnan 9PM": {
    description: "A proven nightlife favorite with sweetness, projection and instant recognition.",
    vibe: "Playful. Loud. After-dark energy."
  },
  "Lattafa Khamrah Qahwa": {
    description: "Warm gourmand richness with coffee nuance and a deep addictive sweetness.",
    vibe: "Cozy. Rich. Delicious."
  },
  "Armaf Club de Nuit Intense Man EDT": {
    description: "Smoky-fruity freshness with serious impact. A modern classic for attention and projection.",
    vibe: "Bold. Recognizable. High impact."
  },
  "Armaf Club de Nuit Sillage": {
    description: "Metallic-citrus freshness with a cool refined edge and long-lasting airy trail.",
    vibe: "Silver. Clean. Distinct."
  },
  "Armaf Club de Nuit Bling": {
    description: "Flashy, stylish and made to be noticed. A confident wear with visual and olfactory presence.",
    vibe: "Glamorous. Modern. Statement-making."
  },
  "Mancera Cedrat Boise": {
    description: "A niche staple balancing citrus brightness, woods and smooth sweetness with serious elegance.",
    vibe: "Luxurious. Versatile. Elite casual."
  },
  "Gisada Ambassador": {
    description: "Polished and charismatic with a smooth designer feel that performs above expectations.",
    vibe: "Charismatic. Clean. Expensive aura."
  },
  "Givenchy Gentleman Réserve Privée": {
    description: "Elegant boozy warmth and iris sophistication in a seductive evening composition.",
    vibe: "Classy. Creamy. Intimate."
  },
  "Creed Aventus Cologne": {
    description: "Airy freshness wrapped in prestige. Refined, uplifting and unmistakably premium.",
    vibe: "Prestige. Fresh. Quiet power."
  },
  "Bleu de Chanel EDP": {
    description: "A benchmark designer scent with polished woods, freshness and timeless versatility.",
    vibe: "Elegant. Clean. Universal."
  },
  "Boss The Scent Elixir": {
    description: "Warm sensual density with a darker seductive edge suited to evening wear.",
    vibe: "Seductive. Deep. Magnetic."
  },
  "Montblanc Explorer Extreme": {
    description: "Adventure-inspired woods and freshness with a masculine polished finish.",
    vibe: "Confident. Travel-ready. Modern."
  },
  "Swiss Arabian Tobacco 01": {
    description: "Rich tobacco warmth with sweet depth and a smooth oriental backbone.",
    vibe: "Dark. Cozy. Mature."
  },
  "Calvin Klein Defy EDT": {
    description: "Fresh and approachable, ideal for daily wear with clean masculine simplicity.",
    vibe: "Fresh. Easy. Everyday."
  },
  "Calvin Klein Defy Parfum": {
    description: "A darker, fuller take on the Defy DNA with stronger character and warmth.",
    vibe: "Smooth. Masculine. Elevated."
  },
  "CK All": {
    description: "Clean universal freshness with bright simplicity and easy all-day wearability.",
    vibe: "Minimal. Fresh. Uncomplicated."
  },
  "Kadlaj Island Dreams": {
    description: "A breezy summer-ready scent that instantly creates vacation mood and sunny energy.",
    vibe: "Tropical. Easygoing. Must-try summer pick."
  },
  "Arabian Prestige Marwa": {
    description: "An elegant Arabian composition with smooth presence, warmth and excellent value.",
    vibe: "Soft spice. Elegant. Boutique feel."
  },
  "Parfums de Marly Castley": {
    description: "A luxury niche profile with upscale structure, sophistication and strong identity.",
    vibe: "Noble. Rich. High-end signature."
  },
  "Afnan Supremacy Not Only Intense": {
    description: "A powerful fresh-fruity-smoky profile with presence that punches above its price.",
    vibe: "Strong. Stylish. Attention-grabbing."
  }
};

const categories = ["All", ...Array.from(new Set(products.map((p) => p.category)))];
const PRODUCTS_PER_PAGE = 12;
const SHIPPING_COST = 3.5;

function formatPrice(value) {
  return `€${Number(value).toFixed(2)}`;
}

function App() {
  const [view, setView] = useState("home");
  const [category, setCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [addedFeedback, setAddedFeedback] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [cart, setCart] = useState([]);

  const [checkoutForm, setCheckoutForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    city: "",
    address: "",
    note: ""
  });

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
  }, []);

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
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setCartOpen(false);
        setCheckoutOpen(false);
        setProductModalOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

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

    showFeedback(`${product.name} added to cart`);
  };

  const addHeroBottleToCart = () => {
    const heroProduct = {
      id: 999,
      name: "Afnan 9PM Rebel",
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
    setProductModalOpen(true);
  };

  const closeProductModal = () => {
    setProductModalOpen(false);
    setSelectedProduct(null);
  };

  const getProductDetail = (productName) => {
    return (
      productDetails[productName] || {
        description: "A premium fragrance selection curated for style, character and strong impression.",
        vibe: "Confident. Refined. Memorable."
      }
    );
  };

  const ProductCard = ({ product }) => (
    <article className="product-card" key={product.id}>
      {product.badge && <span className="product-badge">{product.badge}</span>}

      <button
        className="product-card-click"
        onClick={() => openProductModal(product)}
        aria-label={`Open details for ${product.name}`}
      >
        <div className="product-image">
          <div className="product-image-inner">{product.name.charAt(0)}</div>
        </div>

        <div className="product-meta">
          <p className="product-category">{product.category}</p>
          <h3>{product.name}</h3>
          <p className="product-price-from">
            From {formatPrice(Math.min(...Object.values(product.sizes)))}
          </p>
        </div>
      </button>

      <div className="size-buttons">
        {Object.entries(product.sizes).map(([size, price]) => (
          <button
            key={size}
            onClick={(e) => {
              e.stopPropagation();
              addToCart(product, size);
            }}
          >
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
            Home
          </button>
          <button className={view === "shop" ? "active" : ""} onClick={() => setView("shop")}>
            Shop
          </button>
        </nav>

        <button className="cart-button" onClick={() => setCartOpen((prev) => !prev)}>
          Cart
          {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
        </button>
      </header>

      {addedFeedback && <div className="added-feedback">{addedFeedback}</div>}

      <main>
        {view === "home" && (
          <>
            <section className="hero">
              <div className="hero-grid">
                <div className="hero-copy">
                  <p className="eyebrow">Luxury Fragrance Curation</p>
                  <h1>
                    Desire begins
                    <br />
                    in the dark.
                  </h1>
                  <p className="hero-text">
                    Discover designer, niche and Arabian fragrances through a premium decant
                    experience. Test on skin. Wear with intent. Own the moment.
                  </p>

                  <div className="hero-price-line">
                    <span className="old-price">€45.90</span>
                    <span className="new-price">Now €34.90</span>
                    <span className="hero-offer-text">Afnan 9PM Rebel 100ml full bottle</span>
                  </div>

                  <div className="hero-actions">
                    <button className="gold-button" onClick={goToShop}>
                      Explore Collection
                    </button>
                    <button className="ghost-button" onClick={addHeroBottleToCart}>
                      Claim the Offer
                    </button>
                  </div>
                </div>

                <div className="hero-visual">
                  <button
                    className="hero-bottle-wrap"
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
              <div>✔ Try before you buy</div>
              <div>✔ Only premium fragrances</div>
              <div>✔ Delivery across Montenegro</div>
            </section>

            <div className="section-divider" />

            <section className="featured-section section-wrap">
              <div className="section-head">
                <p className="section-kicker">Current Highlights</p>
                <h2>Selected for impact</h2>
                <p>
                  Curated bottles and standout decants chosen for performance, compliment factor
                  and identity.
                </p>
              </div>

              <div className="feature-grid">
                <article className="feature-card large">
                  <span className="feature-tag">Campaign Pick</span>
                  <h3>Afnan 9PM Rebel</h3>
                  <p>
                    A bold full-bottle offer with serious value. The current hero of the season.
                  </p>
                  <button className="inline-link" onClick={addHeroBottleToCart}>
                    Add 100ml for €34.90
                  </button>
                </article>

                <article className="feature-card">
                  <span className="feature-tag">Summer Hit</span>
                  <h3>Kadlaj Island Dreams</h3>
                  <p>
                    Bright, addictive and made for warm weather. Easy reach, high reward.
                  </p>
                </article>

                <article className="feature-card">
                  <span className="feature-tag">Arabian Edge</span>
                  <h3>Arabian Prestige Marwa</h3>
                  <p>
                    Smooth character, strong identity and standout value in decant format.
                  </p>
                </article>
              </div>
            </section>

            <div className="section-divider" />

            <section className="homepage-shop-preview section-wrap">
              <div className="section-head">
                <p className="section-kicker">Private Selection</p>
                <h2>Best sellers & signature picks</h2>
                <p>
                  Premium decants that let customers discover the right fragrance before committing
                  to a full bottle.
                </p>
              </div>

              <div className="product-grid">
                {products.slice(0, 4).map((product) => (
                  <ProductCard product={product} key={product.id} />
                ))}
              </div>

              <div className="section-cta-center">
                <button className="gold-button" onClick={goToShop}>
                  View Full Collection
                </button>
              </div>
            </section>

            <div className="section-divider" />

            <section className="cta-section">
              <h2>Discover Your Signature</h2>
              <p>Test before you commit. Find what truly fits you.</p>
              <button onClick={goToShop}>Explore Collection</button>
            </section>
          </>
        )}

        {view === "shop" && (
          <section className="shop-section section-wrap">
            <div className="shop-top">
              <div>
                <p className="section-kicker">Shop</p>
                <h2>PlayNice Collection</h2>
                <p className="shop-subtext">
                  Premium decants and selected bottles. Built for discovery, style and smart buying.
                </p>
              </div>
            </div>

            <div className="shop-toolbar">
              <div className="toolbar-group">
                <label>Search</label>
                <input
                  type="text"
                  placeholder="Search fragrance..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="toolbar-group">
                <label>Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="product-grid">
              {paginatedProducts.map((product) => (
                <ProductCard product={product} key={product.id} />
              ))}
            </div>

            <div className="pagination-wrap">
              <button onClick={prevPage} disabled={currentPage === 1}>
                Prev
              </button>
              <span>
                Page {currentPage} / {totalPages}
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
            <p className="section-kicker">Your Cart</p>
            <h3>Selected items</h3>
          </div>
          <button className="close-button" onClick={() => setCartOpen(false)}>
            ×
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="cart-empty">
            <p>Your cart is empty.</p>
            <button className="gold-button small" onClick={goToShop}>
              Go to Shop
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
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <div>
                <span>Subtotal</span>
                <strong>{formatPrice(subtotal)}</strong>
              </div>
              <div>
                <span>Shipping</span>
                <strong>{formatPrice(shipping)}</strong>
              </div>
              <div className="cart-total">
                <span>Total</span>
                <strong>{formatPrice(total)}</strong>
              </div>
            </div>

            <button className="gold-button checkout-button" onClick={() => setCheckoutOpen(true)}>
              Continue to Checkout
            </button>
          </>
        )}
      </aside>

      <div
        className={`backdrop ${cartOpen || checkoutOpen || productModalOpen ? "show" : ""}`}
        onClick={() => {
          setCartOpen(false);
          setCheckoutOpen(false);
          closeProductModal();
        }}
      />

      <div className={`product-modal ${productModalOpen ? "open" : ""}`}>
        {selectedProduct && (
          <>
            <div className="product-modal-header">
              <div>
                <p className="section-kicker">Private Selection</p>
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

                <div className="product-modal-image">
                  <div className="product-modal-image-inner">
                    {selectedProduct.name.charAt(0)}
                  </div>
                </div>

                <div className="product-modal-note">
                  <span>Try before you buy</span>
                  <span>Premium decants</span>
                  <span>PlayNice curated</span>
                </div>
              </div>

              <div className="product-modal-content">
                <p className="product-modal-category">{selectedProduct.category}</p>

                <h4>{selectedProduct.name}</h4>

                <p className="product-modal-description">
                  {getProductDetail(selectedProduct.name).description}
                </p>

                <div className="product-modal-vibe">
                  <span>Character</span>
                  <strong>{getProductDetail(selectedProduct.name).vibe}</strong>
                </div>

                <div className="product-modal-pricing">
                  <span>Available sizes</span>
                  <div className="product-modal-size-grid">
                    {Object.entries(selectedProduct.sizes).map(([size, price]) => (
                      <button
                        key={size}
                        onClick={() => {
                          addToCart(selectedProduct, size);
                          setCartOpen(true);
                        }}
                      >
                        <span>{size}</span>
                        <strong>{formatPrice(price)}</strong>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="product-modal-footer">
                  <p>
                    Discover the fragrance on skin first, then decide whether it deserves a full
                    bottle place in your collection.
                  </p>

                  <div className="product-modal-actions">
                    <button
                      className="gold-button"
                      onClick={() => {
                        const firstSize = Object.keys(selectedProduct.sizes)[0];
                        addToCart(selectedProduct, firstSize);
                        setCartOpen(true);
                      }}
                    >
                      Add Signature Size
                    </button>

                    <button className="ghost-button" onClick={closeProductModal}>
                      Continue Browsing
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className={`checkout-modal ${checkoutOpen ? "open" : ""}`}>
        <div className="checkout-header">
          <div>
            <p className="section-kicker">Checkout</p>
            <h3>Complete your order</h3>
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
                placeholder="First name"
                value={checkoutForm.firstName}
                onChange={handleCheckoutInput}
              />
              <input
                name="lastName"
                placeholder="Last name"
                value={checkoutForm.lastName}
                onChange={handleCheckoutInput}
              />
            </div>

            <div className="form-row two">
              <input
                name="email"
                type="email"
                placeholder="Email"
                value={checkoutForm.email}
                onChange={handleCheckoutInput}
              />
              <input
                name="phone"
                placeholder="Phone"
                value={checkoutForm.phone}
                onChange={handleCheckoutInput}
              />
            </div>

            <div className="form-row two">
              <input
                name="city"
                placeholder="City"
                value={checkoutForm.city}
                onChange={handleCheckoutInput}
              />
              <input
                name="address"
                placeholder="Address"
                value={checkoutForm.address}
                onChange={handleCheckoutInput}
              />
            </div>

            <div className="form-row">
              <textarea
                name="note"
                placeholder="Order note (optional)"
                rows="4"
                value={checkoutForm.note}
                onChange={handleCheckoutInput}
              />
            </div>

            <button className="gold-button submit-order-button" type="button">
              Place Order
            </button>
          </div>

          <div className="checkout-summary">
            <h4>Order summary</h4>

            {cart.length === 0 ? (
              <p className="checkout-empty">No items in cart.</p>
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
                    <span>Subtotal</span>
                    <strong>{formatPrice(subtotal)}</strong>
                  </div>
                  <div>
                    <span>Shipping</span>
                    <strong>{formatPrice(shipping)}</strong>
                  </div>
                  <div className="grand-total">
                    <span>Total</span>
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