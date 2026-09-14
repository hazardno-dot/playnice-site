import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { products } from "@shop/data/products/index.js";
import { productCopy } from "@shop/data/products/productCopy.js";
import { CARD_COPY_REWRITE_CANDIDATES } from "./cardCopyRewriteCandidates.mjs";
import {
  CARD_COPY_TARGET_WIDTH,
  CARD_COPY_MAX_WIDTH_CH,
  classifyCardCopyFit,
  ensureCardCopyFont,
} from "./productCardCopyFit.mjs";
import "./product-card-copy-audit.css";

const CONTRACT_OPTIONS = [28, 30, 32, 34];

function buildRows(maxWidthCh) {
  return products.map((product) => {
    const copy = productCopy[product.name]?.card || {};
    const sr = classifyCardCopyFit(copy.sr, "sr", { maxWidthCh });
    const en = classifyCardCopyFit(copy.en, "en", { maxWidthCh });
    const riskScore = [sr, en].reduce((score, item) => {
      if (item.mismatch) return score + 4;
      if (item.visualPass === false) return score + 3;
      if (item.status === "near") return score + 1;
      return score;
    }, 0);
    return { product, sr, en, riskScore };
  }).sort((a, b) => b.riskScore - a.riskScore || a.product.name.localeCompare(b.product.name));
}

function buildCandidateRows() {
  return products
    .filter((product) => CARD_COPY_REWRITE_CANDIDATES[product.slug])
    .map((product) => {
      const current = productCopy[product.name]?.card || {};
      const candidate = CARD_COPY_REWRITE_CANDIDATES[product.slug] || {};
      const srValue = candidate.sr ?? current.sr;
      const enValue = candidate.en ?? current.en;
      return {
        product,
        sr: classifyCardCopyFit(srValue, "sr"),
        en: classifyCardCopyFit(enValue, "en"),
        changedSr: typeof candidate.sr === "string",
        changedEn: typeof candidate.en === "string",
      };
    })
    .sort((a, b) => a.product.name.localeCompare(b.product.name));
}

function summarize(rows) {
  const srVisual = rows.filter((row) => row.sr.visualPass === false).length;
  const enVisual = rows.filter((row) => row.en.visualPass === false).length;
  const productsToFix = rows.filter((row) => row.sr.visualPass === false || row.en.visualPass === false).length;
  const eitherMismatch = rows.filter((row) => row.sr.mismatch || row.en.mismatch).length;
  return { srVisual, enVisual, productsToFix, eitherMismatch };
}

function MetricCell({ result, changed = false }) {
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
    <span className={`card-copy-audit-status ${result.mismatch ? "is-mismatch" : ""}`}>{changed ? `CANDIDATE · ${label}` : label}</span>
    <small>{result.textWidth}px rendered · max {result.maxWidthCh}ch · CC legacy ≤ {result.legacyMax} · new ≤ {result.newMax}</small>
    <p>{result.value || "— missing copy —"}</p>
  </div>;
}

function AuditPanel() {
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

  const comparison = useMemo(() => {
    if (!fontReady) return [];
    return CONTRACT_OPTIONS.map((maxWidthCh) => {
      const rows = buildRows(maxWidthCh);
      return { maxWidthCh, rows, ...summarize(rows) };
    });
  }, [fontReady]);

  const candidateRows = useMemo(() => fontReady ? buildCandidateRows() : [], [fontReady]);
  const candidateSummary = useMemo(() => summarize(candidateRows), [candidateRows]);

  const current = comparison.find((item) => item.maxWidthCh === CARD_COPY_MAX_WIDTH_CH);
  const rows = current?.rows || [];
  const visibleRows = issuesOnly
    ? rows.filter((row) => row.sr.visualPass === false || row.en.visualPass === false)
    : rows;

  return <section className="card-copy-audit-panel">
    <div className="card-copy-audit-head">
      <div>
        <span className="eyebrow">READ-ONLY / CARD COPY</span>
        <h2>Visual fit audit</h2>
        <p>Audits all SR/EN Card Copy against the live desktop two-line contract. Character count is secondary; rendered fit is the authority.</p>
      </div>
      <div className="card-copy-audit-controls">
        <div>
          <span>LIVE STOREFRONT CONTRACT</span>
          <strong>{CARD_COPY_TARGET_WIDTH}px box · max {CARD_COPY_MAX_WIDTH_CH}ch · 2 lines</strong>
        </div>
        <button type="button" className={`secondary-btn ${issuesOnly ? "is-active" : ""}`} onClick={() => setIssuesOnly((value) => !value)}>
          {issuesOnly ? "Issues only" : "Show all"}
        </button>
      </div>
    </div>

    {!fontReady ? <div className="card-copy-audit-loading">Loading storefront font metrics…</div> : <>
      <div className="card-copy-audit-summary">
        {comparison.map((item) => <div key={item.maxWidthCh} className={item.maxWidthCh === CARD_COPY_MAX_WIDTH_CH ? "is-warning" : ""}>
          <span>{item.maxWidthCh}CH · PRODUCTS TO FIX{item.maxWidthCh === CARD_COPY_MAX_WIDTH_CH ? " · LIVE" : ""}</span>
          <strong>{item.productsToFix}</strong>
          <small>SR {item.srVisual} · EN {item.enVisual}</small>
        </div>)}
      </div>

      <div className="card-copy-audit-note">
        <strong>Authority:</strong> 32ch is now the live desktop Card Copy contract. The 28/30/34ch figures remain comparison references only; card dimensions, font, font size and two-line height are unchanged.
      </div>

      <div className="card-copy-audit-note">
        <strong>Rewrite candidates:</strong> {candidateRows.length} products are staged here read-only. After the proposed copy is substituted, {candidateSummary.productsToFix} still fail the live 2-line contract (SR {candidateSummary.srVisual} · EN {candidateSummary.enVisual}). Nothing below changes product data.
      </div>

      <div className="card-copy-audit-table-wrap">
        <table className="card-copy-audit-table">
          <thead><tr><th>Candidate rewrite · live {CARD_COPY_MAX_WIDTH_CH}ch</th><th>SR</th><th>EN</th></tr></thead>
          <tbody>
            {candidateRows.map(({ product, sr, en, changedSr, changedEn }) => <tr key={`candidate-${product.slug || product.name}`}>
              <td className="card-copy-audit-product"><strong>{product.shortName || product.name}</strong><small>{product.category} · {product.slug}</small></td>
              <td><MetricCell result={sr} changed={changedSr} /></td>
              <td><MetricCell result={en} changed={changedEn} /></td>
            </tr>)}
          </tbody>
        </table>
      </div>

      <div className="card-copy-audit-table-wrap">
        <table className="card-copy-audit-table">
          <thead><tr><th>Current product · live {CARD_COPY_MAX_WIDTH_CH}ch</th><th>SR</th><th>EN</th></tr></thead>
          <tbody>
            {visibleRows.map(({ product, sr, en }) => <tr key={product.slug || product.name}>
              <td className="card-copy-audit-product"><strong>{product.shortName || product.name}</strong><small>{product.category} · {product.slug}</small></td>
              <td><MetricCell result={sr} /></td>
              <td><MetricCell result={en} /></td>
            </tr>)}
          </tbody>
        </table>
      </div>
      {!visibleRows.length ? <div className="card-copy-audit-empty">No copy-fit issues under the live contract.</div> : null}
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
