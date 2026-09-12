import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { exhibitionItems } from "@shop/data/exhibition.js";
import "./exhibition-manager.css";

const SHOP_ORIGIN = "https://www.playniceshop.me";
const PERIODS = [
  ["all", "All periods"],
  ["sep-dec-2026", "SEP — DEC 2026"],
  ["may-aug-2026", "MAY — AUG 2026"],
  ["feb-apr-2026", "FEB — APR 2026"],
];

const kindLabel = (kind) => String(kind || "item").replace(/[-_]/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
const publishedItems = (items) => items.filter((item) => item?.published !== false && item?.status !== "active");
const primaryAsset = (item) => (item?.assets || []).find((asset) => asset?.type === "image") || item?.assets?.[0] || null;

function AssetPreview({ asset, title }) {
  if (!asset) return <div className="exhibition-empty-preview">No asset attached.</div>;
  const src = `${SHOP_ORIGIN}${asset.src}`;
  if (asset.type === "video") return <video controls preload="metadata" src={src} />;
  return <img src={src} alt={asset.alt || title || ""} />;
}

function ExhibitionOverview() {
  const [query, setQuery] = useState("");
  const [period, setPeriod] = useState("all");
  const [kind, setKind] = useState("all");
  const [selectedId, setSelectedId] = useState(() => exhibitionItems[0]?.id || "");

  const kinds = useMemo(() => [...new Set(exhibitionItems.map((item) => item.kind).filter(Boolean))].sort(), []);
  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return exhibitionItems.filter((item) => {
      if (period !== "all" && item.period !== period) return false;
      if (kind !== "all" && item.kind !== kind) return false;
      if (!needle) return true;
      const haystack = `${item.title || ""} ${item.id || ""} ${item.kind || ""} ${item.label?.sr || ""} ${item.label?.en || ""}`.toLowerCase();
      return haystack.includes(needle);
    });
  }, [query, period, kind]);

  const selected = visible.find((item) => item.id === selectedId) || visible[0] || exhibitionItems.find((item) => item.id === selectedId) || null;
  const liveCount = publishedItems(exhibitionItems).length;
  const archivedCount = exhibitionItems.filter((item) => item.status === "archived").length;
  const heroCount = exhibitionItems.filter((item) => String(item.id || "").startsWith("hero-") || item.label?.en === "Hero Campaign").length;
  const selectedAsset = primaryAsset(selected);

  useEffect(() => {
    if (visible.length && !visible.some((item) => item.id === selectedId)) setSelectedId(visible[0].id);
  }, [visible, selectedId]);

  return <section className="exhibition-manager">
    <div className="exhibition-kpis">
      <div><span>ALL ITEMS</span><strong>{exhibitionItems.length}</strong><small>static Exhibition library</small></div>
      <div><span>PUBLISHED</span><strong>{liveCount}</strong><small>visible on Exhibition</small></div>
      <div><span>ARCHIVED</span><strong>{archivedCount}</strong><small>finished ideas</small></div>
      <div><span>HERO ARCHIVE</span><strong>{heroCount}</strong><small>retired Hero campaigns</small></div>
    </div>

    <div className="exhibition-banner">
      <div><span>EXHIBITION V1 · CURATED ARCHIVE</span><strong>One idea. One canonical visual.</strong></div>
      <small>Read + preview layer · publishing remains controlled through PR review.</small>
    </div>

    <div className="exhibition-toolbar">
      <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search Exhibition…" />
      <select value={period} onChange={(event) => setPeriod(event.target.value)}>{PERIODS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
      <select value={kind} onChange={(event) => setKind(event.target.value)}><option value="all">All types</option>{kinds.map((value) => <option key={value} value={value}>{kindLabel(value)}</option>)}</select>
      <a className="exhibition-open-live" href={`${SHOP_ORIGIN}/exhibition`} target="_blank" rel="noreferrer">Open live Exhibition ↗</a>
    </div>

    <div className="exhibition-layout">
      <aside className="exhibition-list-panel">
        <div className="exhibition-list-head"><span>LIBRARY</span><strong>{visible.length}</strong></div>
        <div className="exhibition-list">{visible.map((item) => {
          const asset = primaryAsset(item);
          return <button type="button" key={item.id} className={selected?.id === item.id ? "active" : ""} onClick={() => setSelectedId(item.id)}>
            <div className="exhibition-thumb">{asset?.type === "image" ? <img src={`${SHOP_ORIGIN}${asset.src}`} alt="" loading="lazy" /> : <span>{asset?.type === "video" ? "▶" : "—"}</span>}</div>
            <div><strong>{item.title}</strong><span>{kindLabel(item.kind)} · {item.period || "No period"}</span></div>
            <em className={item.published === false ? "draft" : "published"}>{item.published === false ? "HIDDEN" : "LIVE"}</em>
          </button>;
        })}</div>
      </aside>

      <article className="exhibition-detail-panel">
        {selected ? <>
          <div className="exhibition-detail-head">
            <div><span>{kindLabel(selected.kind)} · {selected.period}</span><h2>{selected.title}</h2><p>{selected.id}</p></div>
            <div className="exhibition-status"><strong>{selected.status || "—"}</strong><span>{selected.published === false ? "hidden" : "published"}</span></div>
          </div>

          <div className="exhibition-card-preview">
            <div className={`exhibition-media ${selectedAsset?.format || ""}`}><AssetPreview asset={selectedAsset} title={selected.title} /></div>
            <div className="exhibition-card-copy">
              <span>{selected.label?.en || kindLabel(selected.kind)}</span>
              <h3>{selected.title}</h3>
              <p>{selected.line?.en || selected.line?.sr || ""}</p>
              <small>Canonical asset · {selectedAsset?.format || "—"}</small>
            </div>
          </div>

          <div className="exhibition-meta-grid">
            <div><span>YEAR</span><strong>{selected.year || "—"}</strong></div>
            <div><span>PERIOD</span><strong>{selected.period || "—"}</strong></div>
            <div><span>TYPE</span><strong>{kindLabel(selected.kind)}</strong></div>
            <div><span>ASSETS</span><strong>{selected.assets?.length || 0}</strong></div>
          </div>

          <section className="exhibition-assets">
            <div className="exhibition-section-head"><span>ASSETS</span><strong>{selected.assets?.length || 0}</strong></div>
            {(selected.assets || []).map((asset, index) => <div key={asset.id || `${selected.id}-${index}`} className={index === 0 ? "canonical" : ""}>
              <div><strong>{asset.id || "asset"}</strong><span>{asset.type || "image"} · {asset.format || "—"}</span></div>
              <code>{asset.src}</code>
              {index === 0 ? <em>CANONICAL</em> : <em>ALTERNATE</em>}
            </div>)}
          </section>
        </> : <div className="exhibition-empty-preview">No Exhibition item matches the current filters.</div>}
      </article>
    </div>
  </section>;
}

export default function ExhibitionManager() {
  const [open, setOpen] = useState(false);
  const [slot, setSlot] = useState(null);

  useEffect(() => {
    const sidebar = document.querySelector(".sidebar nav");
    const mainStage = document.querySelector(".main-stage");
    if (!sidebar || !mainStage) return;
    const manageGroup = [...sidebar.querySelectorAll(".nav-group")].find((group) => group.querySelector(".nav-label")?.textContent?.trim() === "MANAGE");
    if (!manageGroup) return;

    let button = manageGroup.querySelector("[data-exhibition-manager-nav='true']");
    if (!button) {
      button = document.createElement("button");
      button.type = "button";
      button.dataset.exhibitionManagerNav = "true";
      button.title = "Exhibition";
      button.innerHTML = '<span class="nav-icon" aria-hidden="true">E</span><span class="nav-dot"></span><span class="nav-text">Exhibition</span>';
      const notesButton = [...manageGroup.querySelectorAll("button")].find((item) => item.textContent?.trim() === "Notes");
      manageGroup.insertBefore(button, notesButton || null);
    }

    const close = () => setOpen(false);
    const show = (event) => { event.preventDefault(); event.stopPropagation(); setOpen(true); };
    button.addEventListener("click", show);
    [...sidebar.querySelectorAll("button")].filter((item) => item !== button).forEach((item) => item.addEventListener("click", close));
    return () => {
      button?.removeEventListener("click", show);
      [...sidebar.querySelectorAll("button")].filter((item) => item !== button).forEach((item) => item.removeEventListener("click", close));
    };
  }, []);

  useEffect(() => {
    const mainStage = document.querySelector(".main-stage");
    const heading = mainStage?.querySelector(".topbar h1");
    const eyebrow = mainStage?.querySelector(".topbar .eyebrow");
    const description = mainStage?.querySelector(".topbar p");
    const navButtons = [...document.querySelectorAll(".sidebar nav button")];
    const button = navButtons.find((item) => item.dataset.exhibitionManagerNav === "true");
    if (!mainStage || !heading || !button) return;

    let nextSlot = mainStage.querySelector("#exhibition-manager-slot");
    if (!nextSlot) {
      nextSlot = document.createElement("div");
      nextSlot.id = "exhibition-manager-slot";
      mainStage.appendChild(nextSlot);
    }
    const topbar = mainStage.querySelector(".topbar");
    const baseChildren = [...mainStage.children].filter((child) => child !== topbar && child !== nextSlot);

    if (open) {
      navButtons.forEach((item) => item.classList.toggle("active", item === button));
      heading.textContent = "Exhibition";
      if (eyebrow) eyebrow.textContent = "MANAGE / VISUAL ARCHIVE";
      if (description) description.textContent = "Curated campaigns, stories, films and retired Hero ideas with canonical preview.";
      baseChildren.forEach((child) => {
        if (child.dataset.exhibitionPreviousDisplay === undefined) child.dataset.exhibitionPreviousDisplay = child.style.display || "";
        child.style.display = "none";
      });
      nextSlot.style.display = "block";
      setSlot(nextSlot);
    } else {
      nextSlot.style.display = "none";
      baseChildren.forEach((child) => {
        if (child.dataset.exhibitionPreviousDisplay !== undefined) {
          child.style.display = child.dataset.exhibitionPreviousDisplay;
          delete child.dataset.exhibitionPreviousDisplay;
        }
      });
      setSlot(null);
    }
  }, [open]);

  return slot ? createPortal(<ExhibitionOverview />, slot) : null;
}
