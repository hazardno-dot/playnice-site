import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { products } from "@shop/data/products/index.js";
import noteMapSource from "@shop/TheNoteMap.jsx?raw";
import { auditProductNotes } from "./noteAudit.mjs";
import { auditNoteLabels } from "./noteLabelAudit.mjs";
import "./notes-manager.css";

const SHOP_ORIGIN = "https://www.playniceshop.me";

export default function NotesManager() {
  const [slot, setSlot] = useState(null);
  const [query, setQuery] = useState("");
  const structuralAudit = useMemo(() => auditProductNotes(products), []);
  const labelAudit = useMemo(() => auditNoteLabels(structuralAudit.rows, noteMapSource), [structuralAudit.rows]);
  const audit = useMemo(() => ({
    ...structuralAudit,
    rows: labelAudit.rows,
    errors: [...structuralAudit.errors, ...labelAudit.errors],
    warnings: [...structuralAudit.warnings, ...labelAudit.warnings],
  }), [structuralAudit, labelAudit]);
  const [selectedKey, setSelectedKey] = useState(audit.rows[0]?.key || null);
  const [assetState, setAssetState] = useState("idle");

  useEffect(() => {
    const mainStage = document.querySelector(".main-stage");
    if (!mainStage) return;
    const sync = () => {
      const heading = mainStage.querySelector(".topbar h1");
      const placeholder = mainStage.querySelector(".placeholder-panel");
      if (!placeholder || heading?.textContent?.trim() !== "Notes") { setSlot(null); return; }
      let nextSlot = placeholder.querySelector("#notes-manager-slot");
      if (!nextSlot) {
        placeholder.classList.add("notes-module-active");
        nextSlot = document.createElement("div");
        nextSlot.id = "notes-manager-slot";
        nextSlot.className = "notes-manager-slot";
        placeholder.appendChild(nextSlot);
      }
      setSlot(nextSlot);
    };
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(mainStage, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, []);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return audit.rows;
    return audit.rows.filter((row) => [row.key, row.label, row.srLabel, row.enLabel, ...row.products.flatMap((product) => [product.name, product.slug])]
      .some((value) => String(value || "").toLowerCase().includes(needle)));
  }, [audit.rows, query]);

  useEffect(() => {
    if (filtered.length && !filtered.some((row) => row.key === selectedKey)) setSelectedKey(filtered[0].key);
  }, [filtered, selectedKey]);

  const selected = audit.rows.find((row) => row.key === selectedKey) || filtered[0] || null;

  useEffect(() => { setAssetState(selected ? "loading" : "idle"); }, [selected?.key]);

  if (!slot) return null;

  return createPortal(<section className="notes-manager">
    <div className="notes-audit-strip">
      <div><span>NOTE MAP AUDIT</span><strong>{audit.uniqueNotes} unique notes · {audit.placements} placements</strong></div>
      <div className="notes-audit-metrics">
        <span>{audit.productsWithNotes} products mapped</span>
        <span>SR {labelAudit.srCovered}/{audit.uniqueNotes}</span>
        <span>EN {labelAudit.enCovered}/{audit.uniqueNotes}</span>
        <span>{audit.errors.length} errors</span>
        <span>{audit.warnings.length} warnings</span>
      </div>
    </div>

    <div className="notes-manager-grid">
      <aside className="notes-catalog">
        <div className="notes-catalog-head"><div><span>NOTE LIBRARY / USED</span><strong>{audit.uniqueNotes} referenced keys</strong></div><span>{filtered.length}</span></div>
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search note, key, product…" />
        <div className="notes-list">{filtered.map((row) => <button key={row.key} className={row.key === selected?.key ? "active" : ""} onClick={() => setSelectedKey(row.key)}>
          <span className={`notes-status-dot ${row.srSource === "FALLBACK" ? "warn" : ""}`} />
          <div><strong>{row.enLabel}</strong><small>{row.key} · {row.uses} placement{row.uses === 1 ? "" : "s"}</small></div>
          <em>{row.productCount}</em>
        </button>)}</div>
      </aside>

      <article className="notes-detail">
        {!selected ? <div className="notes-empty">No notes match this search.</div> : <>
          <div className="notes-detail-hero">
            <div><span>NOTE / READ ONLY</span><h2>{selected.enLabel}</h2><code>{selected.key}</code></div>
            <div className={`notes-asset-preview ${assetState}`}>
              <img src={`${SHOP_ORIGIN}${selected.assetPath}`} alt={selected.enLabel} onLoad={() => setAssetState("ok")} onError={() => setAssetState("missing")} />
              <small>{assetState === "missing" ? "ASSET MISSING" : assetState === "ok" ? "ASSET LOADED" : "CHECKING ASSET…"}</small>
            </div>
          </div>

          <div className="notes-language-contract">
            <div><span>SR LABEL</span><strong>{selected.srLabel}</strong><small>{selected.srSource}</small></div>
            <div><span>EN LABEL</span><strong>{selected.enLabel}</strong><small>{selected.enSource}</small></div>
            <div><span>LIBRARY</span><strong>{selected.customLibrary ? "CUSTOM" : "CANONICAL"}</strong><small>{selected.customLibrary ? "NOTE_LIBRARY override" : "key + NOTE_SR"}</small></div>
          </div>

          <div className="notes-integrity"><div><span>ASSET CONTRACT</span><strong>{selected.assetPath}</strong></div><p>Every canonical note key expects a matching WebP asset. CI verifies all note assets referenced by products.</p></div>

          <section className="notes-usage"><span>USAGE</span><div className="notes-tier-grid"><div><small>TOP</small><strong>{selected.tiers.top}</strong></div><div><small>HEART</small><strong>{selected.tiers.heart}</strong></div><div><small>BASE</small><strong>{selected.tiers.base}</strong></div><div><small>PRODUCTS</small><strong>{selected.productCount}</strong></div></div></section>

          <section className="notes-products"><span>USED IN PRODUCTS</span>{selected.products.length ? <div>{selected.products.map((product) => <div key={product.slug || product.name}><strong>{product.name}</strong><code>{product.slug || "—"}</code><small>{product.tiers.join(" · ").toUpperCase()}</small></div>)}</div> : <p>No product references.</p>}</section>
        </>}
      </article>
    </div>
  </section>, slot);
}
