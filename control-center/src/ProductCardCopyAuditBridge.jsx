import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { products } from "@shop/data/products/index.js";
import { productCopy } from "@shop/data/products/productCopy.js";
import {
  CARD_COPY_TARGET_WIDTH,
  cardCopyTextWidth,
  classifyCardCopyFit,
  ensureCardCopyFont,
} from "./productCardCopyFit.mjs";
import "./product-card-copy-audit.css";

const DEFAULT_WIDTH = CARD_COPY_TARGET_WIDTH;
const WIDTH_OPTIONS = [230, 250, 270];

function buildRows(width) {
  return products.map((product) => {
    const copy = productCopy[product.name]?.card || {};
    const sr = classifyCardCopyFit(copy.sr, "sr", { width });
    const en = classifyCardCopyFit(copy.en, "en", { width });
    const riskScore = [sr, en].reduce((score, item) => {
      if (item.mismatch) return score + 4;
      if (item.visualPass === false) return score + 3;
      if (item.status === "near") return score + 1;
      return score;
    }, 0);
    return { product, sr, en, riskScore };
  }).sort((a, b) => b.riskScore - a.riskScore || a.product.name.localeCompare(b.product.name));
}

function MetricCell({ result }) {
  const label = result.mismatch
    ? "CC PASS / VISUAL FAIL"
    : result.visualPass === false
      ? "OVER 2 LINES"
      : result.status === "near"
        ? "NEAR LIMIT"
        : "OK";

  return <div className={`card-copy-audit-metric is-${result.status}`}>
    <div className="card-copy-audit-metric-top">
      <strong>{result.chars} chars</strong>
      <span>{result.lines} {result.lines === 1 ? "line" : "lines"}</span>
    </div>
    <span className={`card-copy-audit-status ${result.mismatch ? "is-mismatch" : ""}`}>{label}</span>
    <small>{result.boxWidth}px box · {result.textWidth}px text · CC legacy ≤ {result.legacyMax} · new ≤ {result.newMax}</small>
    <p>{result.value || "— missing copy —"}</p>
  </div>;
}

function AuditPanel() {
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const [issuesOnly, setIssuesOnly] = useState(true);
  const [fontReady, setFontReady] = useState(false);

  useEffect(() => {
    ensureCardCopyFont();
    let cancelled = false;
    const ready = document.fonts?.load?.('italic 15.2px "Cormorant Garamond"');
    Promise.resolve(ready).finally(() => {
      if (!cancelled) setFontReady(true);
    });
    const timer = window.setTimeout(() => setFontReady(true), 1200);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, []);

  const rows = useMemo(() => fontReady ? buildRows(width) : [], [fontReady, width]);
  const visibleRows = issuesOnly
    ? rows.filter((row) => row.sr.status !== "ok" || row.en.status !== "ok")
    : rows;

  const summary = useMemo(() => {
    const srVisual = rows.filter((row) => row.sr.visualPass === false).length;
    const enVisual = rows.filter((row) => row.en.visualPass === false).length;
    const eitherMismatch = rows.filter((row) => row.sr.mismatch || row.en.mismatch).length;
    return { srVisual, enVisual, eitherMismatch };
  }, [rows]);

  return <section className="card-copy-audit-panel">
    <div className="card-copy-audit-head">
      <div>
        <span className="eyebrow">READ-ONLY / CARD COPY</span>
        <h2>Visual fit audit</h2>
        <p>Measures SR/EN Card Copy against the desktop 2-line contract, including the storefront copy-box padding. No product data is changed.</p>
      </div>
      <div className="card-copy-audit-controls">
        <label>
          <span>COPY BOX WIDTH</span>
          <select value={width} onChange={(event) => setWidth(Number(event.target.value))}>
            {WIDTH_OPTIONS.map((value) => <option key={value} value={value}>{value}px box · {cardCopyTextWidth(value)}px text{value === DEFAULT_WIDTH ? " · current target" : ""}</option>)}
          </select>
        </label>
        <button type="button" className={`secondary-btn ${issuesOnly ? "is-active" : ""}`} onClick={() => setIssuesOnly((value) => !value)}>
          {issuesOnly ? "Issues only" : "Show all"}
        </button>
      </div>
    </div>

    {!fontReady ? <div className="card-copy-audit-loading">Loading storefront font metrics…</div> : <>
      <div className="card-copy-audit-summary">
        <div><span>LIVE PRODUCTS</span><strong>{rows.length}</strong></div>
        <div><span>SR · OVER 2 LINES</span><strong>{summary.srVisual}</strong></div>
        <div><span>EN · OVER 2 LINES</span><strong>{summary.enVisual}</strong></div>
        <div className={summary.eitherMismatch ? "is-warning" : ""}><span>CC PASS / VISUAL FAIL</span><strong>{summary.eitherMismatch}</strong></div>
      </div>

      <div className="card-copy-audit-note">
        <strong>Why this matters:</strong> the storefront copy box has 12px horizontal padding on each side, so the 250px target leaves 226px of real text width. Character count remains a secondary safety check; rendered 2-line fit is the visual authority.
      </div>

      <div className="card-copy-audit-table-wrap">
        <table className="card-copy-audit-table">
          <thead><tr><th>Product</th><th>SR</th><th>EN</th></tr></thead>
          <tbody>
            {visibleRows.map(({ product, sr, en }) => <tr key={product.slug || product.name}>
              <td className="card-copy-audit-product"><strong>{product.shortName || product.name}</strong><small>{product.category} · {product.slug}</small></td>
              <td><MetricCell result={sr} /></td>
              <td><MetricCell result={en} /></td>
            </tr>)}
          </tbody>
        </table>
      </div>
      {!visibleRows.length ? <div className="card-copy-audit-empty">No copy-fit issues at this width.</div> : null}
    </>}
  </section>;
}

export default function ProductCardCopyAuditBridge() {
  const [host, setHost] = useState(null);

  useEffect(() => {
    const stage = document.querySelector(".main-stage");
    if (!stage) return undefined;

    const sync = () => {
      const heading = stage.querySelector(".topbar h1")?.textContent?.trim();
      const layout = stage.querySelector(".products-layout");
      let slot = stage.querySelector("#product-card-copy-audit-slot");

      if (heading !== "Products" || !layout) {
        setHost(null);
        return;
      }

      if (!slot) {
        slot = document.createElement("div");
        slot.id = "product-card-copy-audit-slot";
        slot.className = "product-card-copy-audit-slot";
        layout.insertAdjacentElement("beforebegin", slot);
      }
      setHost(slot);
    };

    const observer = new MutationObserver(sync);
    observer.observe(stage, { childList: true, subtree: true });
    sync();
    return () => observer.disconnect();
  }, []);

  return host ? createPortal(<AuditPanel />, host) : null;
}
