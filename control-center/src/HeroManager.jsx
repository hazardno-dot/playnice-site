import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { products } from "@shop/data/products/index.js";
import { supabase } from "./supabase";
import { HERO_SNAPSHOT } from "./heroSnapshot.mjs";
import { auditHeroSlides, heroRowToSlide } from "./heroAudit.mjs";
import { cloneHeroSlide, mergeHeroDrafts, normalizeHeroDraftPayload } from "./heroDraft.mjs";
import "./hero-manager.css";

const SHOP_ORIGIN = "https://www.playniceshop.me";
const productSlugs = products.map((product) => product.slug);
const MANIFESTOS = ["confidence", "playnice-mission", "details"];

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

function HeroEditor({ baseline, initial, allSlides, onCancel, onSave, saving }) {
  const [draft, setDraft] = useState(() => normalizeHeroDraftPayload(initial || baseline, baseline));
  const set = (key, value) => setDraft((current) => ({ ...current, [key]: value }));
  const selectedProduct = products.find((product) => product.slug === draft.actionProductSlug);
  const effectiveSlides = useMemo(() => allSlides.map((slide) => slide.heroKey === draft.heroKey ? normalizeHeroDraftPayload(draft, baseline) : slide), [allSlides, draft, baseline]);
  const audit = useMemo(() => auditHeroSlides(effectiveSlides, { productSlugs }), [effectiveSlides]);
  const slideIssues = audit.issues.filter((issue) => issue.field === "pinnedFirst" || issue.field.startsWith(`#${draft.id}.`));
  const blocked = audit.errors.length > 0;

  return <div className="hero-editor">
    <div className="hero-editor-head">
      <div><span>HERO / DRAFT EDITOR</span><h2>#{draft.id} · {draft.alt || baseline.alt}</h2><p>{draft.heroKey} · ID, key and position locked in v1</p></div>
      <div className="hero-editor-actions"><button onClick={onCancel} disabled={saving}>Cancel</button><button className="primary" onClick={() => onSave(normalizeHeroDraftPayload(draft, baseline))} disabled={saving || blocked}>{saving ? "Saving…" : blocked ? "Fix validation" : "Save Draft"}</button></div>
    </div>

    <div className={`hero-editor-validation ${blocked ? "blocked" : "ok"}`}><strong>{blocked ? `${audit.errors.length} validation error${audit.errors.length === 1 ? "" : "s"}` : "VALIDATION PASSED"}</strong><span>Draft only · no Apply, PR or Production path is enabled.</span></div>
    {slideIssues.length ? <div className="hero-editor-issues">{slideIssues.map((issue, index) => <div key={`${issue.field}-${index}`}><strong>{issue.field}</strong><span>{issue.message}</span></div>)}</div> : null}

    <section className="hero-editor-section"><span>STATUS & MEDIA</span><div className="hero-editor-grid">
      <label className="hero-check"><input type="checkbox" checked={draft.enabled !== false} onChange={(event) => set("enabled", event.target.checked)} /><span>Active slide</span></label>
      <label className="hero-check"><input type="checkbox" checked={Boolean(draft.pinnedFirst)} onChange={(event) => set("pinnedFirst", event.target.checked)} /><span>Pinned first</span></label>
      <label className="wide"><span>Desktop image path</span><input value={draft.desktopImage || ""} onChange={(event) => { setDraft((current) => ({ ...current, desktopImage: event.target.value, image: event.target.value })); }} /></label>
      <label className="wide"><span>Mobile image path</span><input value={draft.mobileImage || ""} onChange={(event) => set("mobileImage", event.target.value)} /></label>
      <label className="wide"><span>Alt text</span><input value={draft.alt || ""} onChange={(event) => set("alt", event.target.value)} /></label>
    </div></section>

    <section className="hero-editor-section"><span>ACTION</span><div className="hero-editor-grid">
      <label><span>Action type</span><select value={draft.actionPrimary || "none"} onChange={(event) => set("actionPrimary", event.target.value)}><option value="none">None</option><option value="shop">Shop</option><option value="product">Product</option><option value="collection">Collection</option><option value="manifesto">Manifesto</option></select></label>

      {draft.actionPrimary === "product" ? <>
        <label className="wide"><span>Product</span><select value={draft.actionProductSlug || ""} onChange={(event) => { const slug = event.target.value; const product = products.find((item) => item.slug === slug); const firstSize = Object.keys(product?.sizes || {})[0] || "10ml"; setDraft((current) => ({ ...current, actionProductSlug: slug, preferredSize: current.actionProductSlug === slug ? current.preferredSize : firstSize })); }}><option value="">Select product…</option>{products.map((product) => <option key={product.slug} value={product.slug}>{product.name}</option>)}</select></label>
        <label><span>Preferred size</span><select value={draft.preferredSize || ""} onChange={(event) => set("preferredSize", event.target.value)}><option value="">Select size…</option>{Object.keys(selectedProduct?.sizes || {}).map((size) => <option key={size} value={size}>{size}</option>)}</select></label>
      </> : null}

      {draft.actionPrimary === "collection" ? <>
        <label className="wide"><span>Collection title</span><input value={draft.collectionTitle || ""} onChange={(event) => set("collectionTitle", event.target.value)} /></label>
        <label className="wide"><span>Products · Ctrl/Cmd + click for multiple</span><select multiple size="10" value={draft.actionCollection || []} onChange={(event) => set("actionCollection", [...event.target.selectedOptions].map((option) => option.value))}>{products.map((product) => <option key={product.slug} value={product.slug}>{product.name}</option>)}</select></label>
      </> : null}

      {draft.actionPrimary === "manifesto" ? <label className="wide"><span>Manifesto</span><select value={draft.manifestoType || ""} onChange={(event) => set("manifestoType", event.target.value)}><option value="">Select manifesto…</option>{MANIFESTOS.map((type) => <option key={type} value={type}>{type}</option>)}</select></label> : null}
    </div></section>

    <section className="hero-editor-preview"><div><span>DESKTOP DRAFT PREVIEW</span><img src={`${SHOP_ORIGIN}${draft.desktopImage || baseline.desktopImage}`} alt={draft.alt || ""} /></div><div className="mobile"><span>MOBILE DRAFT PREVIEW</span><img src={`${SHOP_ORIGIN}${draft.mobileImage || baseline.mobileImage}`} alt={draft.alt || ""} /></div></section>
    <div className="hero-editor-actions bottom"><button onClick={onCancel} disabled={saving}>Cancel</button><button className="primary" onClick={() => onSave(normalizeHeroDraftPayload(draft, baseline))} disabled={saving || blocked}>{saving ? "Saving…" : blocked ? "Fix validation" : "Save Draft"}</button></div>
  </div>;
}

function HeroOverview() {
  const [baselineSlides, setBaselineSlides] = useState(HERO_SNAPSHOT);
  const [draftRows, setDraftRows] = useState({});
  const [selectedId, setSelectedId] = useState(HERO_SNAPSHOT[0]?.id || null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [source, setSource] = useState("snapshot fallback");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editorError, setEditorError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      const [{ data, error }, { data: draftData, error: draftError }] = await Promise.all([
        supabase.from("hero_slides").select("id,hero_key,kind,enabled,pinned_first,position,image,desktop_image,mobile_image,alt,action_type,product_slug,preferred_size,collection_title,collection_slugs,manifesto_type,updated_at").eq("enabled", true).order("position", { ascending: true }),
        supabase.from("hero_drafts").select("hero_key,payload,review_status,updated_at,baseline_snapshot").order("updated_at", { ascending: false })
      ]);
      if (cancelled) return;
      if (error) {
        setLoadError(error.message || String(error)); setSource("snapshot fallback"); setBaselineSlides(HERO_SNAPSHOT);
      } else {
        setBaselineSlides((data || []).map(heroRowToSlide)); setSource("Supabase read layer"); setLoadError("");
      }
      if (!draftError) setDraftRows(Object.fromEntries((draftData || []).map((row) => [row.hero_key, row])));
      setLoading(false);
    };
    load();
    const channel = supabase.channel("hero-drafts-manager").on("postgres_changes", { event: "*", schema: "public", table: "hero_drafts" }, load).subscribe();
    return () => { cancelled = true; supabase.removeChannel(channel); };
  }, []);

  const slides = useMemo(() => mergeHeroDrafts(baselineSlides, draftRows), [baselineSlides, draftRows]);
  const summary = useMemo(() => getSummary(slides), [slides]);
  const audit = useMemo(() => auditHeroSlides(slides, { productSlugs }), [slides]);
  const parityAudit = useMemo(() => auditHeroSlides(baselineSlides, { productSlugs, baseline: source === "Supabase read layer" ? HERO_SNAPSHOT : [] }), [baselineSlides, source]);
  const selected = slides.find((slide) => slide.id === selectedId) || slides[0];
  const selectedBaseline = baselineSlides.find((slide) => slide.id === selected?.id) || selected;
  const selectedDraft = selected ? draftRows[selected.heroKey] : null;
  const health = loading ? "CHECKING" : audit.errors.length ? "ERROR" : parityAudit.warnings.length ? "WARNING" : "HEALTHY";

  const saveDraft = async (payload) => {
    if (!selectedBaseline) return;
    setSaving(true); setEditorError("");
    try {
      const candidate = slides.map((slide) => slide.heroKey === selectedBaseline.heroKey ? normalizeHeroDraftPayload(payload, selectedBaseline) : slide);
      const validation = auditHeroSlides(candidate, { productSlugs });
      if (validation.errors.length) throw new Error(validation.errors[0].message);
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData?.user?.id) throw authError || new Error("Authenticated admin session required.");
      const now = new Date().toISOString();
      const row = { hero_key: selectedBaseline.heroKey, payload: normalizeHeroDraftPayload(payload, selectedBaseline), baseline_snapshot: cloneHeroSlide(selectedBaseline), created_by: authData.user.id, updated_at: now, review_status: "draft" };
      const { data, error } = await supabase.from("hero_drafts").upsert(row, { onConflict: "hero_key" }).select("hero_key,payload,review_status,updated_at,baseline_snapshot").single();
      if (error) throw error;
      setDraftRows((current) => ({ ...current, [data.hero_key]: data }));
      setEditing(false);
    } catch (error) { setEditorError(error.message || String(error)); }
    finally { setSaving(false); }
  };

  const discardDraft = async () => {
    if (!selectedDraft || !selectedBaseline) return;
    if (!window.confirm(`Discard saved Hero draft for #${selectedBaseline.id}?`)) return;
    setEditorError("");
    const { error } = await supabase.from("hero_drafts").delete().eq("hero_key", selectedBaseline.heroKey);
    if (error) { setEditorError(error.message || String(error)); return; }
    setDraftRows((current) => { const next = { ...current }; delete next[selectedBaseline.heroKey]; return next; });
    setEditing(false);
  };

  return <div className="hero-manager">
    <section className="hero-manager-summary">
      <div><span>Slides</span><strong>{summary.total}</strong><small>{source}</small></div>
      <div className="good"><span>Pinned first</span><strong>{summary.pinned}</strong><small>fixed before shuffle</small></div>
      <div><span>Product actions</span><strong>{summary.product}</strong><small>open product modal</small></div>
      <div><span>Collections</span><strong>{summary.collection}</strong><small>open filtered Shop</small></div>
      <div><span>Hero drafts</span><strong>{Object.keys(draftRows).length}</strong><small>Supabase only</small></div>
    </section>

    <div className="hero-manager-banner"><strong>HERO V1 · SUPABASE DRAFT EDITOR</strong><span>{loadError ? `Supabase baseline unavailable: ${loadError}.` : `Contract: ${audit.errors.length} errors · ${parityAudit.warnings.length} baseline warnings. Drafts cannot publish.`}</span></div>
    {editorError ? <div className="hero-editor-error">{editorError}</div> : null}

    <div className="hero-manager-layout">
      <section className="hero-manager-list">
        <div className="hero-manager-section-head"><div><span>HERO CONTRACT</span><h2>{summary.total} mapped slides</h2></div><span className={`hero-manager-health ${health === "HEALTHY" ? "" : "warn"}`}>{health}</span></div>
        <div className="hero-slide-list">{slides.map((slide) => <button key={slide.id} className={`hero-slide-row ${selectedId === slide.id ? "is-active" : ""}`} onClick={() => { setSelectedId(slide.id); setEditing(false); }}><img src={`${SHOP_ORIGIN}${slide.desktopImage || slide.image}`} alt="" loading="lazy" /><div className="hero-slide-row-copy"><div className="hero-slide-row-title"><strong>#{slide.id} · {slide.alt}</strong>{slide.pinnedFirst ? <span>PINNED FIRST</span> : null}{draftRows[slide.heroKey] ? <span className="hero-draft-badge">DRAFT</span> : null}</div><small>{slide.pinnedFirst ? "Fixed first" : "Shuffle pool"} · {slide.actionPrimary.toUpperCase()} · {getActionTarget(slide)}</small></div></button>)}</div>
      </section>

      <section className="hero-manager-detail">
        {selected && selectedBaseline ? editing ? <HeroEditor key={`${selected.heroKey}-${selectedDraft?.updated_at || "new"}`} baseline={selectedBaseline} initial={selectedDraft?.payload || selected} allSlides={slides} onCancel={() => setEditing(false)} onSave={saveDraft} saving={saving} /> : <>
          <div className="hero-manager-detail-head"><div><span>SLIDE / {selectedDraft ? "DRAFT PREVIEW" : "BASELINE"}</span><h2>#{selected.id} · {selected.alt}</h2></div><div className="hero-detail-actions">{selectedDraft ? <span className="hero-draft-badge large">DRAFT SAVED</span> : null}<button className="hero-edit-btn" onClick={() => setEditing(true)}>Edit slide</button></div></div>
          <div className="hero-preview-grid"><div><span>DESKTOP</span><img src={`${SHOP_ORIGIN}${selected.desktopImage || selected.image}`} alt={selected.alt} /></div><div className="mobile"><span>MOBILE · 4:3</span><img src={`${SHOP_ORIGIN}${selected.mobileImage || selected.image}`} alt={selected.alt} /></div></div>
          <div className="hero-contract-grid"><div><span>ID</span><strong>{selected.id}</strong></div><div><span>KIND</span><strong>{selected.kind}</strong></div><div><span>ACTION</span><strong>{selected.actionPrimary}</strong></div><div><span>TARGET</span><strong>{getActionTarget(selected)}</strong></div>{selected.preferredSize ? <div><span>PREFERRED SIZE</span><strong>{selected.preferredSize}</strong></div> : null}<div><span>DESKTOP PATH</span><code>{selected.desktopImage || selected.image}</code></div><div><span>MOBILE PATH</span><code>{selected.mobileImage || selected.image}</code></div></div>
          {selected.actionPrimary === "collection" ? <section className="hero-collection-contract"><span>COLLECTION PRODUCT SLUGS</span><ol>{selected.actionCollection.map((slug) => <li key={slug}><code>{slug}</code></li>)}</ol></section> : null}
          {selectedDraft ? <div className="hero-draft-footer"><span>Saved {new Date(selectedDraft.updated_at).toLocaleString()}</span><button onClick={discardDraft}>Discard draft</button></div> : null}
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
      button = document.createElement("button"); button.type = "button"; button.dataset.heroManagerNav = "true"; button.innerHTML = '<span class="nav-dot"></span>Hero';
      const journalButton = [...manageGroup.querySelectorAll("button")].find((item) => item.textContent?.trim() === "Journal"); manageGroup.insertBefore(button, journalButton || null);
    }
    const closeHero = () => setOpen(false);
    const openHero = (event) => { event.preventDefault(); event.stopPropagation(); setOpen(true); };
    button.addEventListener("click", openHero);
    [...sidebar.querySelectorAll("button")].filter((item) => item !== button).forEach((item) => item.addEventListener("click", closeHero));
    return () => { button?.removeEventListener("click", openHero); [...sidebar.querySelectorAll("button")].filter((item) => item !== button).forEach((item) => item.removeEventListener("click", closeHero)); };
  }, []);

  useEffect(() => {
    const mainStage = document.querySelector(".main-stage");
    const heading = mainStage?.querySelector(".topbar h1");
    const navButtons = [...document.querySelectorAll(".sidebar nav button")];
    const heroButton = navButtons.find((button) => button.dataset.heroManagerNav === "true");
    if (!mainStage || !heading || !heroButton) return;
    let heroSlot = mainStage.querySelector("#hero-manager-slot");
    if (!heroSlot) { heroSlot = document.createElement("div"); heroSlot.id = "hero-manager-slot"; mainStage.appendChild(heroSlot); }
    const baseChildren = [...mainStage.children].filter((child) => child !== mainStage.querySelector(".topbar") && child !== heroSlot);
    if (open) {
      navButtons.forEach((button) => button.classList.toggle("active", button === heroButton)); heading.textContent = "Hero";
      baseChildren.forEach((child) => { child.dataset.heroPreviousDisplay = child.style.display || ""; child.style.display = "none"; }); heroSlot.style.display = "block"; setSlot(heroSlot);
    } else {
      heroSlot.style.display = "none"; baseChildren.forEach((child) => { child.style.display = child.dataset.heroPreviousDisplay || ""; delete child.dataset.heroPreviousDisplay; }); setSlot(null);
    }
  }, [open]);

  return slot ? createPortal(<HeroOverview />, slot) : null;
}
