import React, { useMemo, useState } from "react";
import "./App.css";

const products = [
  { id: 1, name: "Afnan 9AM", category: "Arabian", price5: 4, price10: 7, price20: 13 },
  { id: 2, name: "Afnan 9PM Rebel", category: "Arabian", price5: 4, price10: 7, price20: 13 },
  { id: 3, name: "Afnan Supremacy Collector's Edition Pour Homme", category: "Arabian", price5: 5, price10: 9, price20: 17 },
  { id: 4, name: "Afnan Turathi Blue", category: "Arabian", price5: 5, price10: 9, price20: 17 },
  { id: 5, name: "Arabiyat Prestige Marwa", category: "Arabian", price5: 4.5, price10: 8, price20: 15 },
  { id: 6, name: "Armaf Club De Nuit Bling", category: "Arabian", price5: 6, price10: 11, price20: 20 },
  { id: 7, name: "Armaf Club de Nuit Intense", category: "Arabian", price5: 4, price10: 7, price20: 13 },
  { id: 8, name: "Armaf Club de Nuit Sillage", category: "Arabian", price5: 4, price10: 7, price20: 13 },
  { id: 9, name: "French Avenue Vulcan Sable by Fragrance World", category: "Arabian", price5: 5, price10: 9, price20: 17 },
  { id: 10, name: "Haramain Signature Blue", category: "Arabian", price5: 3, price10: 5, price20: 10 },
  { id: 11, name: "Khadlaj Island Dreams Extrait de Parfum", category: "Arabian", price5: 4.5, price10: 8, price20: 15 },
  { id: 12, name: "Lattafa Asad Elixir", category: "Arabian", price5: 4.5, price10: 8, price20: 15 },
  { id: 13, name: "Lattafa Fakhar Black", category: "Arabian", price5: 4, price10: 7, price20: 13 },
  { id: 14, name: "Lattafa Khamrah Qahwa", category: "Arabian", price5: 5, price10: 9, price20: 17 },
  { id: 15, name: "Lattafa Musamam Black Intense", category: "Arabian", price5: 5, price10: 9, price20: 17 },
  { id: 16, name: "Lattafa Qaed Al Fursan Untamed", category: "Arabian", price5: 3, price10: 5, price20: 10 },
  { id: 17, name: "Paris Corner Emir Trillium", category: "Arabian", price5: 4, price10: 7, price20: 13 },
  { id: 18, name: "Paris Corner Emir Voux Elegante", category: "Arabian", price5: 4, price10: 7, price20: 13 },
  { id: 19, name: "Paris Corner Ministry of Oud - Oud Satin", category: "Arabian", price5: 4, price10: 7, price20: 13 },
  { id: 20, name: "Paris Corner Perfumes North Stag Expressions II DEUX", category: "Arabian", price5: 4, price10: 7, price20: 13 },
  { id: 21, name: "Rayhaan Aquatica", category: "Arabian", price5: 4.5, price10: 8, price20: 15 },
  { id: 22, name: "Rayhaan Pacific Aura", category: "Arabian", price5: 4.5, price10: 8, price20: 15 },
  { id: 23, name: "Swiss Arabian Tobacco 01 Extrait de Parfum", category: "Arabian", price5: 10, price10: 18, price20: 34 },
];

const isShopPage =
  typeof window !== "undefined" &&
  new URLSearchParams(window.location.search).get("view") === "shop";

function formatPrice(value) {
  return `€${Number(value).toFixed(value % 1 === 0 ? 0 : 1)}`;
}

function getSelectedPrice(product, size) {
  if (size === "5ml") return product.price5;
  if (size === "10ml") return product.price10;
  return product.price20;
}

function ProductCard({ product }) {
  const [size, setSize] = useState("5ml");
  const selectedPrice = getSelectedPrice(product, size);

  const mailText = encodeURIComponent(
    `Zdravo, želim da naručim:\n${product.name}\nVeličina: ${size}\nCena: ${formatPrice(selectedPrice)}`
  );

  const mailUrl = `mailto:order@playniceshop.me?subject=${encodeURIComponent(
    `Order request - ${product.name}`
  )}&body=${mailText}`;

  return (
    <article className="product-card">
      <div className="product-badge">{product.category}</div>

      <h3 className="product-title">{product.name}</h3>

      <div className="product-prices">
        <div className="price-row">
          <span>5ml</span>
          <strong>{formatPrice(product.price5)}</strong>
        </div>
        <div className="price-row">
          <span>10ml</span>
          <strong>{formatPrice(product.price10)}</strong>
        </div>
        <div className="price-row">
          <span>20ml</span>
          <strong>{formatPrice(product.price20)}</strong>
        </div>
      </div>

      <div className="size-picker">
        <button
          className={size === "5ml" ? "size-btn active" : "size-btn"}
          onClick={() => setSize("5ml")}
          type="button"
        >
          5ml
        </button>
        <button
          className={size === "10ml" ? "size-btn active" : "size-btn"}
          onClick={() => setSize("10ml")}
          type="button"
        >
          10ml
        </button>
        <button
          className={size === "20ml" ? "size-btn active" : "size-btn"}
          onClick={() => setSize("20ml")}
          type="button"
        >
          20ml
        </button>
      </div>

      <div className="selected-price-box">
        <span>Selected</span>
        <strong>
          {size} — {formatPrice(selectedPrice)}
        </strong>
      </div>

      <div className="product-actions">
        <a href={mailUrl} className="btn btn-primary">
          Order Now
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
    </article>
  );
}

export default function App() {
  const [search, setSearch] = useState("");

  const filteredProducts = useMemo(() => {
    return products.filter((product) =>
      product.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

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
                      <div className="stat-label">Arabian fragrances</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-value">5ml / 10ml / 20ml</div>
                      <div className="stat-label">Available sizes</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-value">Luxury</div>
                      <div className="stat-label">Curated experience</div>
                    </div>
                  </div>
                </div>

                <div className="hero-visual">
                  <div className="visual-card">
                    <div className="visual-topline">ARABIAN COLLECTION</div>

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
                        Klikni na Shop i pregledaj kompletnu Arabian kolekciju sa
                        cenama i opcijom za poručivanje.
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
            <div className="container">
              <div className="section-head catalog-head">
                <div>
                  <div className="section-kicker">SHOP</div>
                  <h2 className="section-title">PlayNice Arabian collection</h2>
                  <p className="section-text">
                    Pregledaj parfeme, izaberi veličinu i poruči direktno.
                  </p>
                </div>

                <div className="search-wrap">
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Search fragrance..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="catalog-summary">
                Showing <strong>{filteredProducts.length}</strong> of{" "}
                <strong>{products.length}</strong> fragrances
              </div>

              <div className="product-grid">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
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
