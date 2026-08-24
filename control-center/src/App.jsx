import React, { useMemo, useState } from "react";
import { products } from "@shop/data/products/index.js";

const SHOP_ORIGIN = "https://www.playniceshop.me";

const NAV = [
  { section: "", items: ["Overview"] },
  { section: "MANAGE", items: ["Products", "Journal", "Notes"] },
  { section: "INTELLIGENCE", items: ["Analytics"] },
  { section: "SYSTEM", items: ["Site Health"] }
];

const metricKeys = [
  ["category", "Category"],
  ["season", "Season"],
  ["rating", "Rating"],
  ["ratingLabel", "Rating label"],
  ["badge", "Badge"]
];

function ProductList({ items, selectedSlug, onSelect }) {
  return (
    <div className="product-list">
      {items.map((product) => (
        <button
          key={product.slug}
          className={`product-row ${selectedSlug === product.slug ? "is-active" : ""}`}
          onClick={() => onSelect(product)}
        >
          <div className="product-thumb-wrap">
            <img
              className="product-thumb"
              src={`${SHOP_ORIGIN}${product.image}`}
              alt=""
              loading="lazy"
            />
          </div>
          <div className="product-row-copy">
            <strong>{product.shortName || product.name}</strong>
            <span>{product.category} · {Object.keys(product.sizes || {}).join(" / ")}</span>
          </div>
          {product.isNew ? <span className="new-pill">NEW</span> : null}
        </button>
      ))}
    </div>
  );
}

function ProductDetail({ product }) {
  if (!product) {
    return (
      <div className="empty-detail">
        <span>PRODUCT VIEW</span>
        <h2>Select a fragrance</h2>
        <p>Read-only product inspection. Editing and publishing come later.</p>
      </div>
    );
  }

  return (
    <article className="product-detail">
      <div className="detail-hero">
        <div>
          <span className="eyebrow">PRODUCT / READ ONLY</span>
          <h2>{product.name}</h2>
          <p className="slug">{product.slug}</p>
        </div>
        <img src={`${SHOP_ORIGIN}${product.image}`} alt={product.name} />
      </div>

      <div className="detail-grid">
        {metricKeys.map(([key, label]) => (
          <div className="metric" key={key}>
            <span>{label}</span>
            <strong>{product[key] ?? "—"}</strong>
          </div>
        ))}
      </div>

      <section className="detail-section">
        <div className="section-heading">
          <span>COMMERCE</span>
          <h3>Sizes & prices</h3>
        </div>
        <div className="price-grid">
          {Object.entries(product.sizes || {}).map(([size, price]) => (
            <div key={size} className="price-chip">
              <span>{size}</span>
              <strong>€{Number(price).toFixed(2).replace(".00", "")}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="detail-section">
        <div className="section-heading">
          <span>CLASSIFICATION</span>
          <h3>Moods</h3>
        </div>
        <div className="tag-row">
          {(product.moods || []).map((mood) => <span key={mood}>{mood}</span>)}
        </div>
      </section>

      <section className="detail-section">
        <div className="section-heading">
          <span>FRAGRANCE DNA</span>
          <h3>Note map</h3>
        </div>
        <div className="notes-grid">
          {["top", "heart", "base"].map((level) => (
            <div key={level}>
              <span className="note-level">{level}</span>
              <div className="tag-row">
                {(product.noteMap?.[level] || []).map((note) => <span key={note}>{note}</span>)}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="detail-section">
        <div className="section-heading">
          <span>RECOMMENDATIONS</span>
          <h3>Linked products</h3>
        </div>
        <ol className="recommendations">
          {(product.recommendations || []).map((slug) => {
            const linked = products.find((item) => item.slug === slug);
            return <li key={slug}>{linked?.name || slug}</li>;
          })}
        </ol>
      </section>

      <section className="detail-section two-col">
        <div>
          <div className="section-heading">
            <span>INSPIRED BY</span>
            <h3>{product.inspiredBy?.short || "Original creation"}</h3>
          </div>
          <p>{product.inspiredBy?.name || "—"}</p>
        </div>
        <div>
          <div className="section-heading">
            <span>IDENTITY</span>
            <h3>ID {product.id}</h3>
          </div>
          <p>{product.shortName || "—"}</p>
        </div>
      </section>
    </article>
  );
}

export default function App() {
  const [active, setActive] = useState("Products");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(products[0] || null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((product) =>
      [product.name, product.shortName, product.slug, product.category, product.badge]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q))
    );
  }, [query]);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <span className="brand-mark">PN</span>
          <div>
            <strong>PlayNice</strong>
            <span>Control Center</span>
          </div>
        </div>

        <nav>
          {NAV.map((group, index) => (
            <div className="nav-group" key={group.section || index}>
              {group.section ? <span className="nav-label">{group.section}</span> : null}
              {group.items.map((item) => (
                <button
                  key={item}
                  className={active === item ? "active" : ""}
                  onClick={() => setActive(item)}
                >
                  <span className="nav-dot" />
                  {item}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <span className="status-dot" />
          <div>
            <strong>Foundation build</strong>
            <span>Production untouched</span>
          </div>
        </div>
      </aside>

      <main className="main-stage">
        <header className="topbar">
          <div>
            <span className="eyebrow">PLAYNICE / INTERNAL</span>
            <h1>{active}</h1>
          </div>
          <div className="read-only-badge">READ ONLY</div>
        </header>

        {active === "Products" ? (
          <div className="products-layout">
            <section className="catalog-panel">
              <div className="catalog-head">
                <div>
                  <span className="eyebrow">CATALOG</span>
                  <h2>{products.length} fragrances</h2>
                </div>
                <span className="catalog-count">{filtered.length}</span>
              </div>
              <div className="search-wrap">
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search name, slug, category…"
                  aria-label="Search products"
                />
              </div>
              <ProductList
                items={filtered}
                selectedSlug={selected?.slug}
                onSelect={setSelected}
              />
            </section>
            <section className="detail-panel">
              <ProductDetail product={selected} />
            </section>
          </div>
        ) : (
          <section className="placeholder-panel">
            <span className="eyebrow">MODULE RESERVED</span>
            <h2>{active}</h2>
            <p>This module is part of the Control Center architecture and will be activated in a later build.</p>
          </section>
        )}
      </main>
    </div>
  );
}
