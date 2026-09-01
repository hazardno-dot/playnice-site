import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { products } from "@shop/data/products/index.js";
import { supabase } from "./supabase";
import { HERO_SNAPSHOT } from "./heroSnapshot.mjs";
import { auditHeroSlides, heroRowToSlide } from "./heroAudit.mjs";
import "./hero-manager.css";

const SHOP_ORIGIN = "https://www.playniceshop.me";
const productSlugs = products.map((product) => product.slug);

function getActionTarget(slide) {
  if (slide.actionPrimary === "product") return slide.actionProductSlug || "—";
  if (slide.actionPrimary === "collection") return `${slide.actionCollection?.length || 0} products · ${slide.collectionTitle || "Untitled collection"}`;
  if (slide.actionPrimary === "manifesto") return slide.manifestoType || "—";
  if (slide.actionPrimary === "shop") return "Shop";
  return "None";
}

function getSummary(slides) {
  return {
    total: slides.length,
    pinned: slides.filter((slide) => slide.pinnedFirst).length,
    product: slides.filter((slide) => slide.actionPrimary === "product").length,
    collection: slides.filter((slide) => slide.actionPrimary === "collection").length,
    manifesto: slides.filter((slide) => slide.actionPrimary === "manifesto").length
  };
}

function HeroOverview() {
  const [slides, setSlides] = useState(HERO_SNAPSHOT);
  const [selectedId, setSelectedId] = useState(HERO_SNAPSHOT[0]?.id || null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [source, setSource] = useState("snapshot fallback");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("hero_slides")
        .select("id,hero_key,kind,enabled,pinned_first,position,image,desktop_image,mobile_image,alt,action_type,product_slug,preferred_size,collection_title,collection_slugs,manifesto_type,updated_at")
        .eq("enabled", true)
        .order("position", { ascending: true });
      if (cancelled) return;
      if (error) {
        setLoadError(error.message || String(error));
        setSource("snapshot fallback");
        setSlides(HERO_SNAPSHOT);
      } else {
        const mapped = (data || []).map(heroRowToSlide);
        setSlides(mapped);
        setSource("Supabase read layer");
        setLoadError("");
        if (mapped.length && !mapped.some((slide) => slide.id === selectedId)) setSelectedId(mapped[0].id);
      }
      setLoading(false);
    };
    load();
    return () => { cancelled = true; };
  }, [selectedId]);

  const summary = useMemo(() => getSummary(slides), [slides]);
  const audit = useMemo(() => auditHeroSlides(slides, { productSlugs, baseline: source === "Supabase read layer" ? HERO_SNAPSHOT : [] }), [slides, source]);
  const selected = slides.find((slide) => slide.id === selectedId) || slides[0];
  const health = loading ? "CHECKING" : audit.healthy ? "HEALTHY" : audit.errors.length ? "ERROR" : "WARNING";

  return <div className="hero-manager">
    <section className="hero-manager-summary">
      <div><span>Slides</span><strong>{summary.total}</strong><small>{source}</small></div>
      <div className="good"><span>Pinned first</span><strong>{summary.pinned}</strong><small>fixed before shuffle</small></div>
      <div><span>Product actions</span><strong>{summary.product}</strong><small>open product modal</small></div>
      <div><span>Collections</span><strong>{summary.collection}</strong><small>open filtered Shop</small></div>
      <div><span>Manifestos</span><strong>{summary.manifesto}</strong><small>open manifesto modal</small></div>
    </section>

    <div className="hero-manager-banner">
      <strong>READ ONLY · HERO V1 · {source.toUpperCase()}</strong>
      <span>{loadError ? `Supabase unavailable: ${loadError}. Showing static snapshot fallback.` : `Validation: ${audit.errors.length} errors · ${audit.warnings.length} warnings. No edit or publish capability is enabled.`}</span>
    </div>

    <div className="hero-manager-layout">
      <section className="hero-manager-list">
        <div className="hero-manager-section-head"><div><span>HERO CONTRACT</span><h2>{summary.total} mapped slides</h2></div><span className={`hero-manager-health ${health === "HEALTHY" ? "" : "warn"}`}>{health}</span></div>
        <div className="hero-slide-list">
          {slides.map((slide, index) => <button key={slide.id} className={`hero-slide-row ${selectedId === slide.id ? "is-active" : ""}`} onClick={() => setSelectedId(slide.id)}>
            <img src={`${SHOP_ORIGIN}${slide.desktopImage || slide.image}`} alt="" loading="lazy" />
            <div className="hero-slide-row-copy">
              <div className="hero-slide-row-title"><strong>#{slide.id} · {slide.alt}</strong>{slide.pinnedFirst ? <span>PINNED FIRST</span> : null}</div>
              <small>{slide.pinnedFirst ? "Fixed first" : "Shuffle pool"} · {slide.actionPrimary.toUpperCase()} · {getActionTarget(slide)}</small>
            </div>
          </button>)}
        </div>
      </section>

      <section className="hero-manager-detail">
        {selected ? <>
          <div className="hero-manager-detail-head"><div><span>SLIDE / READ ONLY</span><h2>#{selected.id} · {selected.alt}</h2></div>{selected.pinnedFirst ? <span className="hero-pinned-badge">PINNED FIRST</span> : null}</div>
          <div className="hero-preview-grid">
            <div><span>DESKTOP</span><img src={`${SHOP_ORIGIN}${selected.desktopImage || selected.image}`} alt={selected.alt} /></div>
            <div className="mobile"><span>MOBILE · 4:3</span><img src={`${SHOP_ORIGIN}${selected.mobileImage || selected.image}`} alt={selected.alt} /></div>
          </div>
          <div className="hero-contract-grid">
            <div><span>ID</span><strong>{selected.id}</strong></div>
            <div><span>KIND</span><strong>{selected.kind}</strong></div>
            <div><span>ACTION</span><strong>{selected.actionPrimary}</strong></div>
            <div><span>TARGET</span><strong>{getActionTarget(selected)}</strong></div>
            {selected.preferredSize ? <div><span>PREFERRED SIZE</span><strong>{selected.preferredSize}</strong></div> : null}
            <div><span>DESKTOP PATH</span><code>{selected.desktopImage || selected.image}</code></div>
            <div><span>MOBILE PATH</span><code>{selected.mobileImage || selected.image}</code></div>
          </div>
          {selected.actionPrimary === "collection" ? <section className="hero-collection-contract"><span>COLLECTION PRODUCT SLUGS</span><ol>{selected.actionCollection.map((slug) => <li key={slug}><code>{slug}</code></li>)}</ol></section> : null}
          {!audit.healthy ? <section className="hero-collection-contract"><span>VALIDATION FINDINGS</span><ol>{audit.issues.map((issue, index) => <li key={`${issue.field}-${index}`}><code>{issue.level.toUpperCase()} · {issue.field}</code> — {issue.message}</li>)}</ol></section> : null}
        </> : null}
      </section>
    </div>
  </div>;
}

export default function HeroManager() {
  const [slot, setSlot] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const sidebar = document.querySelector(".sidebar nav");
    const mainStage = document.querySelector(".main-stage");
    if (!sidebar || !mainStage) return;
    const manageGroup = [...sidebar.querySelectorAll(".nav-group")].find((group) => group.querySelector(".nav-label")?.textContent?.trim() === "MANAGE");
    if (!manageGroup) return;
    let button = manageGroup.querySelector("[data-hero-manager-nav='true']");
    if (!button) {
      button = document.createElement("button");
      button.type = "button";
      button.dataset.heroManagerNav = "true";
      button.innerHTML = '<span class="nav-dot"></span>Hero';
      const journalButton = [...manageGroup.querySelectorAll("button")].find((item) => item.textContent?.trim() === "Journal");
      manageGroup.insertBefore(button, journalButton || null);
    }
    const closeHero = () => setOpen(false);
    const openHero = (event) => { event.preventDefault(); event.stopPropagation(); setOpen(true); };
    button.addEventListener("click", openHero);
    [...sidebar.querySelectorAll("button")].filter((item) => item !== button).forEach((item) => item.addEventListener("click", closeHero));
    return () => {
      button?.removeEventListener("click", openHero);
      [...sidebar.querySelectorAll("button")].filter((item) => item !== button).forEach((item) => item.removeEventListener("click", closeHero));
    };
  }, []);

  useEffect(() => {
    const mainStage = document.querySelector(".main-stage");
    const heading = mainStage?.querySelector(".topbar h1");
    const navButtons = [...document.querySelectorAll(".sidebar nav button")];
    const heroButton = navButtons.find((button) => button.dataset.heroManagerNav === "true");
    if (!mainStage || !heading || !heroButton) return;
    let heroSlot = mainStage.querySelector("#hero-manager-slot");
    if (!heroSlot) {
      heroSlot = document.createElement("div");
      heroSlot.id = "hero-manager-slot";
      mainStage.appendChild(heroSlot);
    }
    const baseChildren = [...mainStage.children].filter((child) => child !== mainStage.querySelector(".topbar") && child !== heroSlot);
    if (open) {
      navButtons.forEach((button) => button.classList.toggle("active", button === heroButton));
      heading.textContent = "Hero";
      baseChildren.forEach((child) => { child.dataset.heroPreviousDisplay = child.style.display || ""; child.style.display = "none"; });
      heroSlot.style.display = "block";
      setSlot(heroSlot);
    } else {
      heroSlot.style.display = "none";
      baseChildren.forEach((child) => { child.style.display = child.dataset.heroPreviousDisplay || ""; delete child.dataset.heroPreviousDisplay; });
      setSlot(null);
    }
  }, [open]);

  return slot ? createPortal(<HeroOverview />, slot) : null;
}
