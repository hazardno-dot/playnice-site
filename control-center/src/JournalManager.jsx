import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { journalArticles } from "@shop/data/journal/index.js";
import { products } from "@shop/data/products/index.js";
import { auditJournalArticles, getJournalAuditText } from "./journalAudit.mjs";
import "./journal-manager.css";

const SHOP_ORIGIN = "https://www.playniceshop.me";

export default function JournalManager() {
  const [slot, setSlot] = useState(null);
  const [query, setQuery] = useState("");
  const sorted = useMemo(() => [...journalArticles].sort((a, b) => Number(b?.id || 0) - Number(a?.id || 0)), []);
  const [selectedId, setSelectedId] = useState(sorted[0]?.id || null);
  const audit = useMemo(() => auditJournalArticles(journalArticles, products.map((product) => product.slug)), []);

  useEffect(() => {
    const mainStage = document.querySelector(".main-stage");
    if (!mainStage) return;

    const sync = () => {
      const heading = mainStage.querySelector(".topbar h1");
      const placeholder = mainStage.querySelector(".placeholder-panel");
      if (!placeholder || heading?.textContent?.trim() !== "Journal") {
        setSlot(null);
        return;
      }

      let nextSlot = placeholder.querySelector("#journal-manager-slot");
      if (!nextSlot) {
        placeholder.classList.add("journal-module-active");
        nextSlot = document.createElement("div");
        nextSlot.id = "journal-manager-slot";
        nextSlot.className = "journal-manager-slot";
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
    if (!needle) return sorted;
    return sorted.filter((article) => [article.id, getJournalAuditText(article.title, "sr"), getJournalAuditText(article.title, "en"), getJournalAuditText(article.date, "sr")]
      .some((value) => String(value || "").toLowerCase().includes(needle)));
  }, [query, sorted]);

  useEffect(() => {
    if (filtered.length && !filtered.some((article) => article.id === selectedId)) setSelectedId(filtered[0].id);
  }, [filtered, selectedId]);

  if (!slot) return null;

  const selected = journalArticles.find((article) => article.id === selectedId) || filtered[0] || sorted[0] || null;
  const selectedAudit = audit.rows.find((row) => row.id === selected?.id);

  return createPortal(<section className="journal-manager">
    <div className="journal-audit-strip">
      <div><span>JOURNAL DATA AUDIT</span><strong>{audit.complete}/{audit.total} structurally complete</strong></div>
      <div className="journal-audit-metrics"><span>{audit.errors.length} errors</span><span>{audit.warnings.length} warnings</span><span>READ ONLY</span></div>
    </div>

    <div className="journal-manager-grid">
      <aside className="journal-catalog">
        <div className="journal-catalog-head"><div><span>EDITORIAL LIBRARY</span><strong>{journalArticles.length} articles</strong></div><span>{filtered.length}</span></div>
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search id, title, date…" />
        <div className="journal-list">{filtered.map((article) => {
          const row = audit.rows.find((item) => item.id === article.id);
          return <button key={article.id} className={article.id === selected?.id ? "active" : ""} onClick={() => setSelectedId(article.id)}>
            <span className={`journal-status-dot ${row?.complete ? "ok" : "warn"}`} />
            <div><strong>#{article.id} · {getJournalAuditText(article.title, "sr") || getJournalAuditText(article.title, "en") || "Untitled"}</strong><small>{getJournalAuditText(article.date, "sr") || "No date"}</small></div>
          </button>;
        })}</div>
      </aside>

      <article className="journal-detail">
        {!selected ? <div className="journal-empty">No Journal articles.</div> : <>
          <div className="journal-detail-hero">
            <div><span>ARTICLE / READ ONLY</span><h2>{getJournalAuditText(selected.title, "sr") || getJournalAuditText(selected.title, "en")}</h2><p>#{selected.id} · {getJournalAuditText(selected.date, "sr")}</p></div>
            {selected.image && !selected.image.endsWith("/") ? <img src={`${SHOP_ORIGIN}${selected.image}`} alt="" /> : null}
          </div>

          <div className={`journal-integrity ${selectedAudit?.complete ? "ok" : "warn"}`}>
            <strong>{selectedAudit?.complete ? "STRUCTURE COMPLETE" : `${selectedAudit?.errors.length || 0} STRUCTURE ERROR${selectedAudit?.errors.length === 1 ? "" : "S"}`}</strong>
            <span>Bilingual date, title, excerpt, content, image and linked products checked.</span>
          </div>

          {selectedAudit?.issues.length ? <section className="journal-issues"><span>DATA ISSUES</span>{selectedAudit.issues.map((item, index) => <div key={`${item.field}-${index}`} className={item.level}><strong>{item.field}</strong><p>{item.message}</p></div>)}</section> : null}

          <section className="journal-copy-audit"><span>SR / EN COPY</span>{["title", "excerpt", "content"].map((field) => <div key={field}><strong>{field}</strong><p>{getJournalAuditText(selected[field], "sr") || "—"}</p><small>{getJournalAuditText(selected[field], "en") || "—"}</small></div>)}</section>

          <section className="journal-related"><span>RELATED PRODUCTS</span>{Array.isArray(selected.relatedProducts) && selected.relatedProducts.length ? <div>{selected.relatedProducts.map((slug) => <span key={slug}>{products.find((product) => product.slug === slug)?.name || slug}</span>)}</div> : <p>No related products configured.</p>}</section>
        </>}
      </article>
    </div>
  </section>, slot);
}
