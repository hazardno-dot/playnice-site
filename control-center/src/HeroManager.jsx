import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { HERO_SNAPSHOT, getHeroSnapshotSummary } from "./heroSnapshot.mjs";
import "./hero-manager.css";

const SHOP_ORIGIN = "https://www.playniceshop.me";

function getActionTarget(slide) {
  if (slide.actionPrimary === "product") return slide.actionProductSlug || "—";
  if (slide.actionPrimary === "collection") return `${slide.actionCollection?.length || 0} products · ${slide.collectionTitle || "Untitled collection"}`;
  if (slide.actionPrimary === "manifesto") return slide.manifestoType || "—";
  if (slide.actionPrimary === "shop") return "Shop";
  return "None";
}

function HeroOverview() {
  const summary = useMemo(() => getHeroSnapshotSummary(), []);
  const [selectedId, setSelectedId] = useState(HERO_SNAPSHOT[0]?.id || null);
  const selected = HERO_SNAPSHOT.find((slide) => slide.id === selectedId) || HERO_SNAPSHOT[0];

  return <div className="hero-manager">
    <section className="hero-manager-summary">
      <div><span>Slides</span><strong>{summary.total}</strong><small>current live snapshot</small></div>
      <div className="good"><span>Pinned first</span><strong>{summary.pinned}</strong><small>fixed before shuffle</small></div>
      <div><span>Product actions</span><strong>{summary.product}</strong><small>open product modal</small></div>
      <div><span>Collections</span><strong>{summary.collection}</strong><small>open filtered Shop</small></div>
      <div><span>Manifestos</span><strong>{summary.manifesto}</strong><small>open manifesto modal</small></div>
    </section>

    <div className="hero-manager-banner">
      <strong>READ ONLY · HERO V1 SNAPSHOT</strong>
      <span>This screen mirrors the current live Hero contract. It cannot edit, apply or publish anything.</span>
    </div>

    <div className="hero-manager-layout">
      <section className="hero-manager-list">
        <div className="hero-manager-section-head"><div><span>LIVE HERO</span><h2>12 mapped slides</h2></div><span className="hero-manager-health">HEALTHY</span></div>
        <div className="hero-slide-list">
          {HERO_SNAPSHOT.map((slide, index) => <button key={slide.id} className={`hero-slide-row ${selectedId === slide.id ? "is-active" : ""}`} onClick={() => setSelectedId(slide.id)}>
            <img src={`${SHOP_ORIGIN}${slide.desktopImage || slide.image}`} alt="" loading="lazy" />
            <div className="hero-slide-row-copy">
              <div className="hero-slide-row-title"><strong>#{slide.id} · {slide.alt}</strong>{slide.pinnedFirst ? <span>PINNED FIRST</span> : null}</div>
              <small>{index === 0 ? "Fixed first" : "Shuffle pool"} · {slide.actionPrimary.toUpperCase()} · {getActionTarget(slide)}</small>
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
