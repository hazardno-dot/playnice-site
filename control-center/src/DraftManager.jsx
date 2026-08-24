import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabase";
import { products } from "@shop/data/products/index.js";
import { productCopy } from "@shop/data/products/productCopy.js";
import { productWearContext } from "@shop/data/products/productWearContext.js";
import discoveryProfiles from "@shop/data/products/discoveryProfiles.js";
import "./draft-manager.css";

const formatDate = (value) => {
  if (!value) return "Unknown time";
  try {
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit"
    }).format(new Date(value));
  } catch { return value; }
};

const getLiveProduct = (slug) => products.find((p) => p.slug === slug);
const normalize = (value) => value == null ? "" : typeof value === "string" ? value : JSON.stringify(value);
const asCsv = (value) => Array.isArray(value) ? value.join(", ") : String(value ?? "");
const same = (a, b) => normalize(a) === normalize(b);
const pushChange = (arr, section, label, liveValue, draftValue) => {
  if (!same(liveValue, draftValue)) arr.push({ section, label, liveValue, draftValue });
};

function buildChanges(live, draft) {
  if (!live || !draft) return [];
  const changes = [];
  const core = draft.core || {};
  pushChange(changes, "Core", "Name", live.name, core.name);
  pushChange(changes, "Core", "Short name", live.shortName, core.shortName);
  pushChange(changes, "Core", "Category", live.category, core.category);
  pushChange(changes, "Core", "Badge", live.badge, core.badge);
  pushChange(changes, "Core", "Rating", String(live.rating ?? ""), String(core.rating ?? ""));
  pushChange(changes, "Core", "Rating label", live.ratingLabel, core.ratingLabel);
  pushChange(changes, "Core", "Season", live.season, core.season);
  pushChange(changes, "Core", "Moods", asCsv(live.moods), core.moods);

  const liveSizes = live.sizes || {};
  const draftSizes = core.sizes || {};
  [...new Set([...Object.keys(liveSizes), ...Object.keys(draftSizes)])].forEach((size) => {
    pushChange(changes, "Prices", size, String(liveSizes[size] ?? ""), String(draftSizes[size] ?? ""));
  });

  ["top", "heart", "base"].forEach((level) => {
    pushChange(changes, "Notes", level, asCsv(live.noteMap?.[level] || []), core.noteMap?.[level] || "");
  });
  pushChange(changes, "Recommendations", "Linked products", asCsv(live.recommendations || []), core.recommendations || "");

  const liveCopy = productCopy[live.name] || {};
  const draftCopy = draft.copy || {};
  ["miniTag", "scentType", "card", "modal", "whyChoose"].forEach((key) => {
    ["sr", "en"].forEach((lang) => pushChange(changes, "Copy", `${key} · ${lang.toUpperCase()}`, liveCopy?.[key]?.[lang] || "", draftCopy?.[key]?.[lang] || ""));
  });

  const liveWear = productWearContext[live.name] || {};
  const draftWear = draft.wear || {};
  ["sr", "en"].forEach((lang) => pushChange(changes, "Wear", lang.toUpperCase(), liveWear?.[lang] || "", draftWear?.[lang] || ""));

  const liveDiscovery = discoveryProfiles[live.slug] || {};
  const draftDiscovery = draft.discovery || {};
  [...new Set([...Object.keys(liveDiscovery), ...Object.keys(draftDiscovery)])].forEach((key) => {
    pushChange(changes, "Discovery", key.replace(/[-_]/g, " "), String(liveDiscovery[key] ?? ""), String(draftDiscovery[key] ?? ""));
  });

  return changes;
}

function groupChanges(changes) {
  return changes.reduce((acc, change) => {
    (acc[change.section] ||= []).push(change);
    return acc;
  }, {});
}

function displayValue(value) {
  const text = String(value ?? "");
  return text.length ? text : "—";
}

export default function DraftManager() {
  const [open, setOpen] = useState(false);
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true); setError("");
    const { data, error: loadError } = await supabase
      .from("product_drafts")
      .select("product_slug,payload,updated_at")
      .order("updated_at", { ascending: false });
    if (loadError) setError(loadError.message || "Could not load drafts.");
    setDrafts(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const count = drafts.length;
  const draftRows = useMemo(() => drafts.map((row) => {
    const live = getLiveProduct(row.product_slug);
    const changes = buildChanges(live, row.payload);
    return { ...row, live, changes, groupedChanges: groupChanges(changes) };
  }), [drafts]);

  const discard = async (slug) => {
    if (!window.confirm(`Discard unpublished draft for ${slug}? This cannot be undone.`)) return;
    const { error: deleteError } = await supabase.from("product_drafts").delete().eq("product_slug", slug);
    if (deleteError) { setError(deleteError.message || "Could not discard draft."); return; }
    await load();
    setExpanded(null);
    window.setTimeout(() => window.location.reload(), 250);
  };

  const openProduct = (row) => {
    setOpen(false);
    const productsButton = [...document.querySelectorAll(".sidebar nav button")].find((b) => b.textContent.trim() === "Products");
    productsButton?.click();
    window.setTimeout(() => {
      const search = document.querySelector(".search-wrap input");
      if (search) {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
        setter?.call(search, row.product_slug);
        search.dispatchEvent(new Event("input", { bubbles: true }));
        search.dispatchEvent(new Event("change", { bubbles: true }));
      }
      window.setTimeout(() => document.querySelector(".product-row")?.click(), 120);
    }, 80);
  };

  return <>
    <button className={`draft-manager-trigger ${count ? "has-drafts" : ""}`} onClick={() => { setOpen(true); load(); }}>
      <span>Drafts</span><strong>{loading ? "…" : count}</strong>
    </button>
    {open ? <div className="draft-manager-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
      <aside className="draft-manager-panel">
        <header className="draft-manager-head">
          <div><span className="eyebrow">SUPABASE / UNPUBLISHED</span><h2>Draft management</h2><p>{count} persistent draft{count === 1 ? "" : "s"}</p></div>
          <button className="draft-manager-close" onClick={() => setOpen(false)}>×</button>
        </header>
        <div className="draft-manager-notice">NO PUBLISH · Draft actions cannot change the live Shop.</div>
        {error ? <div className="draft-manager-error">{error}</div> : null}
        <div className="draft-manager-list">
          {loading ? <div className="draft-manager-empty">Loading drafts…</div> : !draftRows.length ? <div className="draft-manager-empty">No unpublished drafts.</div> : draftRows.map((row) => {
            const title = row.payload?.core?.name || row.live?.name || row.product_slug;
            const isExpanded = expanded === row.product_slug;
            return <article className="draft-manager-card" key={row.product_slug}>
              <div className="draft-manager-card-top">
                <div><strong>{title}</strong><span>{row.product_slug}</span><small>Updated {formatDate(row.updated_at)}</small></div>
                <span className="draft-manager-change-count">{row.changes.length} change{row.changes.length === 1 ? "" : "s"}</span>
              </div>
              {isExpanded ? <div className="draft-manager-review full-diff">
                {!row.changes.length ? <p className="draft-manager-no-core">Draft matches current live data.</p> : Object.entries(row.groupedChanges).map(([section, items]) => <section className="draft-review-section" key={section}>
                  <div className="draft-review-section-head"><strong>{section}</strong><span>{items.length} change{items.length === 1 ? "" : "s"}</span></div>
                  <div className="draft-review-section-body">{items.map((change) => <div className="draft-change" key={`${section}-${change.label}`}><span>{change.label}</span><div><small>LIVE</small><p>{displayValue(change.liveValue)}</p></div><div><small>DRAFT</small><p>{displayValue(change.draftValue)}</p></div></div>)}</div>
                </section>)}
              </div> : null}
              <div className="draft-manager-actions">
                <button onClick={() => setExpanded(isExpanded ? null : row.product_slug)}>{isExpanded ? "Hide review" : "Review changes"}</button>
                <button onClick={() => openProduct(row)}>Open product</button>
                <button className="danger" onClick={() => discard(row.product_slug)}>Discard draft</button>
              </div>
            </article>;
          })}
        </div>
      </aside>
    </div> : null}
  </>;
}
