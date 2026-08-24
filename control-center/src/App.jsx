import React, { useMemo, useState } from "react";
import { products } from "@shop/data/products/index.js";
import { productCopy } from "@shop/data/products/productCopy.js";
import { productWearContext } from "@shop/data/products/productWearContext.js";
import discoveryProfiles from "@shop/data/products/discoveryProfiles.js";
import { journalArticles } from "@shop/data/journal/index.js";
import "./audit.css";

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

const FILTERS = [
  ["all", "All"],
  ["complete", "Complete"],
  ["copy", "Missing Copy"],
  ["wear", "Missing Wear"],
  ["discovery", "Missing Discovery"],
  ["note-map", "Missing Note Map"],
  ["recommendations", "Missing Recommendations"]
];

const titleCase = (value) => String(value || "")
  .replace(/[-_]/g, " ")
  .replace(/\b\w/g, (letter) => letter.toUpperCase());

function getCoverage(product) {
  const copy = productCopy[product.name];
  const wear = productWearContext[product.name];
  const discovery = discoveryProfiles[product.slug];
  const checks = [
    ["Core", Boolean(product)],
    ["Copy", Boolean(copy)],
    ["Wear", Boolean(wear)],
    ["Discovery", Boolean(discovery)],
    ["Note map", Boolean(product.noteMap)],
    ["Recommendations", (product.recommendations || []).length === 3]
  ];
  const complete = checks.filter(([, ok]) => ok).length;
  return { copy, wear, discovery, checks, complete, total: checks.length };
}

function matchesCoverageFilter(product, filter) {
  const coverage = getCoverage(product);
  if (filter === "all") return true;
  if (filter === "complete") return coverage.complete === coverage.total;
  const lookup = {
    copy: "Copy",
    wear: "Wear",
    discovery: "Discovery",
    "note-map": "Note map",
    recommendations: "Recommendations"
  };
  const label = lookup[filter];
  return coverage.checks.some(([name, ok]) => name === label && !ok);
}

function ProductList({ items, selectedSlug, onSelect }) {
  if (!items.length) return <div className="empty-filter">No products match this audit filter.</div>;
  return (
    <div className="product-list">
      {items.map((product) => {
        const coverage = getCoverage(product);
        return (
          <button key={product.slug} className={`product-row ${selectedSlug === product.slug ? "is-active" : ""}`} onClick={() => onSelect(product)}>
            <div className="product-thumb-wrap"><img className="product-thumb" src={`${SHOP_ORIGIN}${product.image}`} alt="" loading="lazy" /></div>
            <div className="product-row-copy"><strong>{product.shortName || product.name}</strong><span>{product.category} · {Object.keys(product.sizes || {}).join(" / ")}</span></div>
            <div className="row-flags">
              <span className={`coverage-dot ${coverage.complete === coverage.total ? "ok" : "warn"}`} title={`${coverage.complete}/${coverage.total} data layers`} />
              {product.isNew ? <span className="new-pill">NEW</span> : null}
            </div>
          </button>
        );
      })}
    </div>
  );
}

function CoveragePanel({ coverage }) {
  const isComplete = coverage.complete === coverage.total;
  return (
    <section className="coverage-panel">
      <div><span className="eyebrow">DATA COVERAGE</span><strong>{coverage.complete}/{coverage.total} layers</strong></div>
      <div className={`coverage-status ${isComplete ? "complete" : "incomplete"}`}>{isComplete ? "COMPLETE" : "CHECK DATA"}</div>
      <div className="coverage-checks">{coverage.checks.map(([label, ok]) => <span key={label} className={ok ? "ok" : "missing"}>{ok ? "✓" : "!"} {label}</span>)}</div>
    </section>
  );
}

function ProductDetail({ product }) {
  if (!product) return <div className="empty-detail"><span>PRODUCT VIEW</span><h2>Select a fragrance</h2><p>Read-only product inspection. Editing and publishing come later.</p></div>;

  const coverage = getCoverage(product);
  const { copy, wear, discovery } = coverage;

  return (
    <article className="product-detail">
      <div className="detail-hero">
        <div><span className="eyebrow">PRODUCT / READ ONLY</span><h2>{product.name}</h2><p className="slug">{product.slug}</p></div>
        <img src={`${SHOP_ORIGIN}${product.image}`} alt={product.name} />
      </div>
      <CoveragePanel coverage={coverage} />
      <div className="detail-grid">{metricKeys.map(([key, label]) => <div className="metric" key={key}><span>{label}</span><strong>{product[key] ?? "—"}</strong></div>)}</div>

      <section className="detail-section"><div className="section-heading"><span>COMMERCE</span><h3>Sizes & prices</h3></div><div className="price-grid">{Object.entries(product.sizes || {}).map(([size, price]) => <div key={size} className="price-chip"><span>{size}</span><strong>€{Number(price).toFixed(2).replace(".00", "")}</strong></div>)}</div></section>
      <section className="detail-section"><div className="section-heading"><span>CLASSIFICATION</span><h3>Moods</h3></div><div className="tag-row">{(product.moods || []).map((mood) => <span key={mood}>{mood}</span>)}</div></section>
      <section className="detail-section"><div className="section-heading"><span>EDITORIAL</span><h3>Product copy</h3></div>{copy ? <div className="copy-grid"><div><span>Mini tag</span><p>{copy.miniTag?.sr || "—"}</p><small>{copy.miniTag?.en || "—"}</small></div><div><span>Scent type</span><p>{copy.scentType?.sr || "—"}</p><small>{copy.scentType?.en || "—"}</small></div><div className="copy-wide"><span>Card copy</span><p>{copy.card?.sr || "—"}</p><small>{copy.card?.en || "—"}</small></div><div className="copy-wide"><span>Modal copy</span><p>{copy.modal?.sr || "—"}</p><small>{copy.modal?.en || "—"}</small></div><div className="copy-wide"><span>Why choose</span><p>{copy.whyChoose?.sr || "—"}</p><small>{copy.whyChoose?.en || "—"}</small></div></div> : <p className="missing-copy">No dedicated product copy found.</p>}</section>
      <section className="detail-section"><div className="section-heading"><span>WEAR CONTEXT</span><h3>When to wear</h3></div>{wear ? <div className="bilingual-copy"><p>{wear.sr}</p><small>{wear.en}</small></div> : <p className="missing-copy">No wear context found.</p>}</section>
      <section className="detail-section"><div className="section-heading"><span>FRAGRANCE DNA</span><h3>Note map</h3></div><div className="notes-grid">{["top", "heart", "base"].map((level) => <div key={level}><span className="note-level">{level}</span><div className="tag-row">{(product.noteMap?.[level] || []).map((note) => <span key={note}>{note}</span>)}</div></div>)}</div></section>
      <section className="detail-section"><div className="section-heading"><span>DISCOVERY INTELLIGENCE</span><h3>Scent profile</h3></div>{discovery ? <div className="discovery-grid">{Object.entries(discovery).map(([key, value]) => <div className="discovery-metric" key={key}><div><span>{titleCase(key)}</span><strong>{value}</strong></div><div className="meter"><span style={{ width: `${Math.max(0, Math.min(10, Number(value))) * 10}%` }} /></div></div>)}</div> : <p className="missing-copy">No Discovery profile found.</p>}</section>
      <section className="detail-section"><div className="section-heading"><span>RECOMMENDATIONS</span><h3>Linked products</h3></div><ol className="recommendations">{(product.recommendations || []).map((slug) => { const linked = products.find((item) => item.slug === slug); return <li key={slug}>{linked?.name || slug}</li>; })}</ol></section>
      <section className="detail-section two-col"><div><div className="section-heading"><span>INSPIRED BY</span><h3>{product.inspiredBy?.short || "Original creation"}</h3></div><p>{product.inspiredBy?.name || "—"}</p></div><div><div className="section-heading"><span>IDENTITY</span><h3>ID {product.id}</h3></div><p>{product.shortName || "—"}</p></div></section>
    </article>
  );
}

function Overview({ audit, onOpenProblems }) {
  const layers = [
    ["Copy", audit.layerCounts.Copy],
    ["Wear", audit.layerCounts.Wear],
    ["Discovery", audit.layerCounts.Discovery],
    ["Note map", audit.layerCounts["Note map"]],
    ["Recommendations", audit.layerCounts.Recommendations]
  ];
  return (
    <div>
      <div className="overview-grid">
        <div className="overview-card"><span>Products</span><strong>{products.length}</strong><small>live catalog records</small></div>
        <div className={`overview-card ${audit.incomplete === 0 ? "good" : "warn"}`}><span>Complete products</span><strong>{audit.complete}</strong><small>{audit.incomplete === 0 ? "all layers aligned" : `${audit.incomplete} need review`}</small></div>
        <div className="overview-card"><span>Journal articles</span><strong>{journalArticles.length}</strong><small>current editorial library</small></div>
        <div className="overview-card good"><span>Control Center</span><strong>LIVE</strong><small>read-only validation mode</small></div>
      </div>

      <section className="audit-panel">
        <div className="audit-head"><div><span className="eyebrow">GLOBAL DATA AUDIT</span><h2>Catalog integrity</h2></div><div className="audit-status">{audit.complete}/{products.length} products fully complete</div></div>
        <div className="audit-list">
          {layers.map(([label, count]) => <div className={`audit-row ${count === products.length ? "ok" : "warn"}`} key={label}><strong>{label}</strong><span>{count}/{products.length} covered · {products.length - count} missing</span></div>)}
        </div>
        <div className="audit-summary">
          <span className="audit-chip"><strong>{audit.complete}</strong> complete</span>
          <span className="audit-chip"><strong>{audit.oneMissing}</strong> with 1 missing layer</span>
          <span className="audit-chip"><strong>{audit.multiMissing}</strong> with 2+ missing layers</span>
          {audit.incomplete > 0 ? <button className="filter-btn warn" onClick={onOpenProblems}>Open incomplete products</button> : null}
        </div>
      </section>
    </div>
  );
}

export default function App() {
  const [active, setActive] = useState("Overview");
  const [query, setQuery] = useState("");
  const [coverageFilter, setCoverageFilter] = useState("all");
  const [selected, setSelected] = useState(products[0] || null);

  const audit = useMemo(() => {
    const coverages = products.map((product) => getCoverage(product));
    const complete = coverages.filter((c) => c.complete === c.total).length;
    const missingCounts = coverages.map((c) => c.total - c.complete);
    const layerCounts = {};
    coverages.forEach((coverage) => coverage.checks.forEach(([label, ok]) => { layerCounts[label] = (layerCounts[label] || 0) + (ok ? 1 : 0); }));
    return {
      complete,
      incomplete: products.length - complete,
      oneMissing: missingCounts.filter((count) => count === 1).length,
      multiMissing: missingCounts.filter((count) => count >= 2).length,
      layerCounts
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((product) => {
      const textMatch = !q || [product.name, product.shortName, product.slug, product.category, product.badge].filter(Boolean).some((value) => String(value).toLowerCase().includes(q));
      return textMatch && matchesCoverageFilter(product, coverageFilter);
    });
  }, [query, coverageFilter]);

  const openProblems = () => {
    setActive("Products");
    setCoverageFilter("complete");
    setCoverageFilter("all");
    const firstProblem = products.find((product) => { const c = getCoverage(product); return c.complete !== c.total; });
    if (firstProblem) setSelected(firstProblem);
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block"><div><strong>PlayNice</strong><span>Control Center</span></div></div>
        <nav>{NAV.map((group, index) => <div className="nav-group" key={group.section || index}>{group.section ? <span className="nav-label">{group.section}</span> : null}{group.items.map((item) => <button key={item} className={active === item ? "active" : ""} onClick={() => setActive(item)}><span className="nav-dot" />{item}</button>)}</div>)}</nav>
        <div className="sidebar-footer"><span className="status-dot" /><div><strong>Read-only build</strong><span>Shop data mirrored</span></div></div>
      </aside>

      <main className="main-stage">
        <header className="topbar"><div><span className="eyebrow">PLAYNICE / INTERNAL</span><h1>{active}</h1></div><div className="read-only-badge">READ ONLY</div></header>

        {active === "Overview" ? <Overview audit={audit} onOpenProblems={openProblems} /> : active === "Products" ? (
          <div className="products-layout">
            <section className="catalog-panel">
              <div className="catalog-head"><div><span className="eyebrow">CATALOG</span><h2>{products.length} fragrances</h2></div><span className="catalog-count">{filtered.length}</span></div>
              <div className="search-wrap"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, slug, category…" aria-label="Search products" /></div>
              <div className="filter-bar">{FILTERS.map(([value, label]) => <button key={value} className={`filter-btn ${value !== "all" && value !== "complete" ? "warn" : ""} ${coverageFilter === value ? "active" : ""}`} onClick={() => setCoverageFilter(value)}>{label}</button>)}</div>
              <ProductList items={filtered} selectedSlug={selected?.slug} onSelect={setSelected} />
            </section>
            <section className="detail-panel"><ProductDetail product={selected} /></section>
          </div>
        ) : <section className="placeholder-panel"><span className="eyebrow">MODULE RESERVED</span><h2>{active}</h2><p>This module is part of the Control Center architecture and will be activated in a later build.</p></section>}
      </main>
    </div>
  );
}