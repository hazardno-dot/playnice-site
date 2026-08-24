import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabase";
import { products } from "@shop/data/products/index.js";
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

function changedCoreFields(live, draft) {
  if (!live || !draft?.core) return [];
  const pairs = [
    ["Name", live.name, draft.core.name],
    ["Short name", live.shortName, draft.core.shortName],
    ["Category", live.category, draft.core.category],
    ["Badge", live.badge, draft.core.badge],
    ["Rating", String(live.rating ?? ""), String(draft.core.rating ?? "")],
    ["Rating label", live.ratingLabel, draft.core.ratingLabel],
    ["Season", live.season, draft.core.season],
    ["Moods", (live.moods || []).join(", "), draft.core.moods]
  ];
  return pairs.filter(([, a, b]) => String(a ?? "") !== String(b ?? ""));
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
  const draftRows = useMemo(() => drafts.map((row) => ({
    ...row,
    live: getLiveProduct(row.product_slug),
    changes: changedCoreFields(getLiveProduct(row.product_slug), row.payload)
  })), [drafts]);

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
                <span className="draft-manager-change-count">{row.changes.length} core change{row.changes.length === 1 ? "" : "s"}</span>
              </div>
              {isExpanded ? <div className="draft-manager-review">
                {row.changes.length ? row.changes.map(([label, liveValue, draftValue]) => <div className="draft-change" key={label}><span>{label}</span><div><small>LIVE</small><p>{String(liveValue ?? "—")}</p></div><div><small>DRAFT</small><p>{String(draftValue ?? "—")}</p></div></div>) : <p className="draft-manager-no-core">No core-field differences. The draft may contain editorial or discovery changes.</p>}
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
