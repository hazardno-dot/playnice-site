import React, { useEffect, useMemo, useState } from "react";
import { products } from "@shop/data/products/index.js";
import { productCopy } from "@shop/data/products/productCopy.js";
import { productWearContext } from "@shop/data/products/productWearContext.js";
import discoveryProfiles from "@shop/data/products/discoveryProfiles.js";
import { journalArticles } from "@shop/data/journal/index.js";
import { supabase } from "./supabase";
import "./audit.css";
import "./editor.css";

const SHOP_ORIGIN = "https://www.playniceshop.me";
const NAV = [
  { section: "", items: ["Overview"] },
  { section: "MANAGE", items: ["Products", "Journal", "Notes"] },
  { section: "INTELLIGENCE", items: ["Analytics"] },
  { section: "SYSTEM", items: ["Site Health"] }
];
const FILTERS = [["all","All"],["complete","Complete"],["copy","Missing Copy"],["wear","Missing Wear"],["discovery","Missing Discovery"],["note-map","Missing Note Map"],["recommendations","Missing Recommendations"]];
const metricKeys = [["category","Category"],["season","Season"],["rating","Rating"],["ratingLabel","Rating label"],["badge","Badge"]];
const titleCase = (value) => String(value || "").replace(/[-_]/g," ").replace(/\b\w/g,(l)=>l.toUpperCase());

function getCoverage(product){
  const copy=productCopy[product.name]; const wear=productWearContext[product.name]; const discovery=discoveryProfiles[product.slug];
  const checks=[["Core",Boolean(product)],["Copy",Boolean(copy)],["Wear",Boolean(wear)],["Discovery",Boolean(discovery)],["Note map",Boolean(product.noteMap)],["Recommendations",(product.recommendations||[]).length===3]];
  const complete=checks.filter(([,ok])=>ok).length; return {copy,wear,discovery,checks,complete,total:checks.length};
}
function matchesCoverageFilter(product,filter){
  const c=getCoverage(product); if(filter==="all")return true; if(filter==="complete")return c.complete===c.total;
  const labels={copy:"Copy",wear:"Wear",discovery:"Discovery","note-map":"Note map",recommendations:"Recommendations"};
  return c.checks.some(([name,ok])=>name===labels[filter]&&!ok);
}
function makeDraft(product){
  const {copy,wear,discovery}=getCoverage(product);
  return {
    core:{name:product.name||"",shortName:product.shortName||"",category:product.category||"",image:product.image||"",badge:product.badge||"",rating:product.rating??"",ratingLabel:product.ratingLabel||"",season:product.season||"",moods:(product.moods||[]).join(", "),inspiredBy:{name:product.inspiredBy?.name||"",short:product.inspiredBy?.short||""},sizes:{...(product.sizes||{})},noteMap:{top:(product.noteMap?.top||[]).join(", "),heart:(product.noteMap?.heart||[]).join(", "),base:(product.noteMap?.base||[]).join(", ")},recommendations:(product.recommendations||[]).join(", ")},
    copy:JSON.parse(JSON.stringify(copy||{})), wear:JSON.parse(JSON.stringify(wear||{})), discovery:{...(discovery||{})}, savedAt:null
  };
}

function makeBlankDraft(){
  const discoveryKeys=Object.keys(discoveryProfiles[products[0]?.slug]||{});
  return {
    core:{name:"",shortName:"",category:"Arabian",image:"/products/",badge:"NEW",rating:"",ratingLabel:"New",season:"all",moods:"",inspiredBy:{name:"",short:""},sizes:{},noteMap:{top:"",heart:"",base:""},recommendations:""},
    copy:{miniTag:{sr:"",en:""},scentType:{sr:"",en:""},card:{sr:"",en:""},modal:{sr:"",en:""},dominantNotes:{sr:"",en:""},tags:{sr:"",en:""},whyChoose:{sr:"",en:""}},
    wear:{sr:"",en:""},discovery:Object.fromEntries(discoveryKeys.map((key)=>[key,0])),savedAt:null
  };
}

function ProductList({items,selectedSlug,onSelect,drafts}){
  if(!items.length)return <div className="empty-filter">No products match this audit filter.</div>;
  return <div className="product-list">{items.map((p)=>{const c=getCoverage(p);return <button key={p.slug} className={`product-row ${selectedSlug===p.slug?"is-active":""}`} onClick={()=>onSelect(p)}>
    <div className="product-thumb-wrap"><img className="product-thumb" src={`${SHOP_ORIGIN}${p.image}`} alt="" loading="lazy"/></div>
    <div className="product-row-copy"><strong>{p.shortName||p.name}</strong><span>{p.category} · {Object.keys(p.sizes||{}).join(" / ")}</span></div>
    <div className="row-flags">{drafts[p.slug]?<span className="draft-dot" title="Supabase draft saved"/>:null}<span className={`coverage-dot ${c.complete===c.total?"ok":"warn"}`}/>{p.isNew?<span className="new-pill">NEW</span>:null}</div>
  </button>;})}</div>;
}
function CoveragePanel({coverage}){const ok=coverage.complete===coverage.total;return <section className="coverage-panel"><div><span className="eyebrow">DATA COVERAGE</span><strong>{coverage.complete}/{coverage.total} layers</strong></div><div className={`coverage-status ${ok?"complete":"incomplete"}`}>{ok?"COMPLETE":"CHECK DATA"}</div><div className="coverage-checks">{coverage.checks.map(([l,v])=><span key={l} className={v?"ok":"missing"}>{v?"✓":"!"} {l}</span>)}</div></section>}

function Field({label,value,onChange,type="text",step}){return <label className="edit-field"><span>{label}</span><input type={type} step={step} value={value??""} onChange={(e)=>onChange(e.target.value)}/></label>}
function TextField({label,value,onChange}){return <label className="edit-field edit-wide"><span>{label}</span><textarea value={value??""} onChange={(e)=>onChange(e.target.value)}/></label>}
function LangPair({label,value={},onChange,multiline=false}){const C=multiline?TextField:Field;return <div className="lang-pair"><C label={`${label} · SR`} value={value?.sr||""} onChange={(v)=>onChange({...value,sr:v})}/><C label={`${label} · EN`} value={value?.en||""} onChange={(v)=>onChange({...value,en:v})}/></div>}

function DraftEditor({product,initial,onCancel,onSave}){
  const [draft,setDraft]=useState(initial); const [saving,setSaving]=useState(false); const core=draft.core;
  const setCore=(key,val)=>setDraft((d)=>({...d,core:{...d.core,[key]:val}}));
  const setSize=(key,val)=>setDraft((d)=>({...d,core:{...d.core,sizes:{...d.core.sizes,[key]:val}}}));
  const removeSize=(key)=>setDraft((d)=>{const sizes={...d.core.sizes};delete sizes[key];return {...d,core:{...d.core,sizes}}});
  const addSize=()=>{const key=window.prompt("Size label (for example 2ml)");if(!key)return;const price=window.prompt(`Price for ${key}`);if(price==null||price==="")return;setSize(key.trim(),price);};
  const setNote=(key,val)=>setDraft((d)=>({...d,core:{...d.core,noteMap:{...d.core.noteMap,[key]:val}}}));
  const setInspired=(key,val)=>setDraft((d)=>({...d,core:{...d.core,inspiredBy:{...d.core.inspiredBy,[key]:val}}}));
  const setCopy=(key,val)=>setDraft((d)=>({...d,copy:{...d.copy,[key]:val}}));
  const save=async()=>{setSaving(true);try{await onSave({...draft,savedAt:new Date().toISOString()});}finally{setSaving(false)}};
  return <article className="product-detail edit-mode">
    <div className="editor-head"><div><span className="eyebrow">PRODUCT / DRAFT EDITOR</span><h2>{core.name||product.name}</h2><p className="slug">{product.slug} · slug locked</p></div><div className="editor-actions"><button className="secondary-btn" onClick={onCancel} disabled={saving}>Cancel</button><button className="primary-btn" onClick={save} disabled={saving}>{saving?"Saving…":"Save Draft"}</button></div></div>
    <div className="draft-warning">SUPABASE DRAFT ONLY · nothing here can change the Shop or Production.</div>
    <section className="edit-section"><div className="section-heading"><span>IDENTITY & CLASSIFICATION</span><h3>Core product data</h3></div><div className="edit-grid"><Field label="Name" value={core.name} onChange={(v)=>setCore("name",v)}/><Field label="Short name" value={core.shortName} onChange={(v)=>setCore("shortName",v)}/><Field label="Category" value={core.category} onChange={(v)=>setCore("category",v)}/><Field label="Image path" value={core.image} onChange={(v)=>setCore("image",v)}/><Field label="Inspired by · name" value={core.inspiredBy?.name||""} onChange={(v)=>setInspired("name",v)}/><Field label="Inspired by · short" value={core.inspiredBy?.short||""} onChange={(v)=>setInspired("short",v)}/><Field label="Badge" value={core.badge} onChange={(v)=>setCore("badge",v)}/><Field label="Rating" type="number" step="0.1" value={core.rating} onChange={(v)=>setCore("rating",v)}/><Field label="Rating label" value={core.ratingLabel} onChange={(v)=>setCore("ratingLabel",v)}/><Field label="Season" value={core.season} onChange={(v)=>setCore("season",v)}/><Field label="Moods · comma separated" value={core.moods} onChange={(v)=>setCore("moods",v)}/></div></section>
    <section className="edit-section"><div className="section-heading"><span>COMMERCE</span><h3>Sizes & prices</h3></div><div className="edit-grid compact">{Object.entries(core.sizes||{}).map(([s,p])=><div key={s} className="size-edit-row"><Field label={s} type="number" step="0.5" value={p} onChange={(v)=>setSize(s,v)}/><button type="button" className="secondary-btn" onClick={()=>removeSize(s)}>Remove</button></div>)}</div><div className="editor-actions"><button type="button" className="secondary-btn" onClick={addSize}>+ Add size</button></div></section>
    <section className="edit-section"><div className="section-heading"><span>FRAGRANCE DNA</span><h3>Notes & recommendations</h3></div><div className="edit-grid"><Field label="Top notes · comma separated" value={core.noteMap.top} onChange={(v)=>setNote("top",v)}/><Field label="Heart notes · comma separated" value={core.noteMap.heart} onChange={(v)=>setNote("heart",v)}/><Field label="Base notes · comma separated" value={core.noteMap.base} onChange={(v)=>setNote("base",v)}/><Field label="Recommendation slugs · 3 comma separated" value={core.recommendations} onChange={(v)=>setCore("recommendations",v)}/></div></section>
    <section className="edit-section"><div className="section-heading"><span>EDITORIAL</span><h3>Product copy</h3></div><div className="edit-stack"><LangPair label="Mini tag" value={draft.copy.miniTag} onChange={(v)=>setCopy("miniTag",v)}/><LangPair label="Scent type" value={draft.copy.scentType} onChange={(v)=>setCopy("scentType",v)}/><LangPair label="Card copy" multiline value={draft.copy.card} onChange={(v)=>setCopy("card",v)}/><LangPair label="Modal copy" multiline value={draft.copy.modal} onChange={(v)=>setCopy("modal",v)}/><LangPair label="Dominant notes · comma separated" value={draft.copy.dominantNotes} onChange={(v)=>setCopy("dominantNotes",v)}/><LangPair label="Tags · comma separated" value={draft.copy.tags} onChange={(v)=>setCopy("tags",v)}/><LangPair label="Why choose" multiline value={draft.copy.whyChoose} onChange={(v)=>setCopy("whyChoose",v)}/></div></section>
    <section className="edit-section"><div className="section-heading"><span>WEAR CONTEXT</span><h3>When to wear</h3></div><div className="lang-pair"><TextField label="Wear · SR" value={draft.wear?.sr||""} onChange={(v)=>setDraft((d)=>({...d,wear:{...d.wear,sr:v}}))}/><TextField label="Wear · EN" value={draft.wear?.en||""} onChange={(v)=>setDraft((d)=>({...d,wear:{...d.wear,en:v}}))}/></div></section>
    <section className="edit-section"><div className="section-heading"><span>DISCOVERY INTELLIGENCE</span><h3>Scent profile</h3></div><div className="discovery-edit-grid">{Object.entries(draft.discovery||{}).map(([k,v])=><Field key={k} label={titleCase(k)} type="number" step="0.1" value={v} onChange={(x)=>setDraft((d)=>({...d,discovery:{...d.discovery,[k]:x}}))}/>)}</div></section>
    <div className="editor-actions bottom"><button className="secondary-btn" onClick={onCancel} disabled={saving}>Cancel</button><button className="primary-btn" onClick={save} disabled={saving}>{saving?"Saving…":"Save Draft"}</button></div>
  </article>;
}

function ProductDetail({product,draft,onEdit}){
  if(!product)return <div className="empty-detail"><h2>Select a fragrance</h2></div>; const c=getCoverage(product); const {copy,wear,discovery}=c;
  return <article className="product-detail"><div className="detail-hero"><div><div className="detail-title-row"><span className="eyebrow">PRODUCT / READ ONLY</span>{draft?<span className="draft-badge">DRAFT SAVED</span>:null}</div><h2>{product.name}</h2><p className="slug">{product.slug}</p><button className="edit-btn" onClick={onEdit}>Edit product</button></div><img src={`${SHOP_ORIGIN}${product.image}`} alt={product.name}/></div>
    <CoveragePanel coverage={c}/><div className="detail-grid">{metricKeys.map(([k,l])=><div className="metric" key={k}><span>{l}</span><strong>{product[k]??"—"}</strong></div>)}</div>
    <section className="detail-section"><div className="section-heading"><span>COMMERCE</span><h3>Sizes & prices</h3></div><div className="price-grid">{Object.entries(product.sizes||{}).map(([s,p])=><div className="price-chip" key={s}><span>{s}</span><strong>€{Number(p).toFixed(2).replace(".00","")}</strong></div>)}</div></section>
    <section className="detail-section"><div className="section-heading"><span>CLASSIFICATION</span><h3>Moods</h3></div><div className="tag-row">{(product.moods||[]).map((m)=><span key={m}>{m}</span>)}</div></section>
    <section className="detail-section"><div className="section-heading"><span>EDITORIAL</span><h3>Product copy</h3></div>{copy?<div className="copy-grid"><div><span>Mini tag</span><p>{copy.miniTag?.sr||"—"}</p><small>{copy.miniTag?.en||"—"}</small></div><div><span>Scent type</span><p>{copy.scentType?.sr||"—"}</p><small>{copy.scentType?.en||"—"}</small></div><div className="copy-wide"><span>Card copy</span><p>{copy.card?.sr||"—"}</p><small>{copy.card?.en||"—"}</small></div></div>:null}</section>
    <section className="detail-section"><div className="section-heading"><span>WEAR CONTEXT</span><h3>When to wear</h3></div>{wear?<div className="bilingual-copy"><p>{wear.sr}</p><small>{wear.en}</small></div>:null}</section>
    <section className="detail-section"><div className="section-heading"><span>FRAGRANCE DNA</span><h3>Note map</h3></div><div className="notes-grid">{["top","heart","base"].map((level)=><div key={level}><span className="note-level">{level}</span><div className="tag-row">{(product.noteMap?.[level]||[]).map((n)=><span key={n}>{n}</span>)}</div></div>)}</div></section>
    <section className="detail-section"><div className="section-heading"><span>DISCOVERY INTELLIGENCE</span><h3>Scent profile</h3></div><div className="discovery-grid">{Object.entries(discovery||{}).map(([k,v])=><div className="discovery-metric" key={k}><div><span>{titleCase(k)}</span><strong>{v}</strong></div><div className="meter"><span style={{width:`${Math.max(0,Math.min(10,Number(v)))*10}%`}}/></div></div>)}</div></section>
    <section className="detail-section"><div className="section-heading"><span>RECOMMENDATIONS</span><h3>Linked products</h3></div><ol className="recommendations">{(product.recommendations||[]).map((slug)=><li key={slug}>{products.find((p)=>p.slug===slug)?.name||slug}</li>)}</ol></section>
  </article>;
}

function Overview({audit,draftCount,draftsLoading}){const layers=[["Copy",audit.layerCounts.Copy],["Wear",audit.layerCounts.Wear],["Discovery",audit.layerCounts.Discovery],["Note map",audit.layerCounts["Note map"]],["Recommendations",audit.layerCounts.Recommendations]];return <div><div className="overview-grid"><div className="overview-card"><span>Products</span><strong>{products.length}</strong><small>live catalog records</small></div><div className="overview-card good"><span>Complete products</span><strong>{audit.complete}</strong><small>all layers aligned</small></div><div className="overview-card"><span>Journal articles</span><strong>{journalArticles.length}</strong><small>current editorial library</small></div><div className={`overview-card ${draftCount?"warn":"good"}`}><span>Cloud drafts</span><strong>{draftsLoading?"…":draftCount}</strong><small>{draftsLoading?"loading from Supabase":draftCount?"persistent unpublished drafts":"no unpublished drafts"}</small></div></div><section className="audit-panel"><div className="audit-head"><div><span className="eyebrow">GLOBAL DATA AUDIT</span><h2>Catalog integrity</h2></div><div className="audit-status">{audit.complete}/{products.length} products fully complete</div></div><div className="audit-list">{layers.map(([l,c])=><div className={`audit-row ${c===products.length?"ok":"warn"}`} key={l}><strong>{l}</strong><span>{c}/{products.length} covered · {products.length-c} missing</span></div>)}</div></section></div>}

export default function App(){
  const [active,setActive]=useState("Overview"),[query,setQuery]=useState(""),[coverageFilter,setCoverageFilter]=useState("all"),[selected,setSelected]=useState(products[0]||null),[editing,setEditing]=useState(false),[drafts,setDrafts]=useState({}),[draftsLoading,setDraftsLoading]=useState(true);
  const audit=useMemo(()=>{const cs=products.map(getCoverage),layerCounts={};cs.forEach((c)=>c.checks.forEach(([l,ok])=>{layerCounts[l]=(layerCounts[l]||0)+(ok?1:0)}));return {complete:cs.filter((c)=>c.complete===c.total).length,layerCounts};},[]);
  const filtered=useMemo(()=>{const q=query.trim().toLowerCase();return products.filter((p)=>(!q||[p.name,p.shortName,p.slug,p.category,p.badge].filter(Boolean).some((v)=>String(v).toLowerCase().includes(q)))&&matchesCoverageFilter(p,coverageFilter));},[query,coverageFilter]);
  useEffect(()=>{
    let cancelled=false;
    const load=async({quiet=false}={})=>{
      if(!quiet)setDraftsLoading(true);
      const {data,error}=await supabase.from("product_drafts").select("product_slug,payload,updated_at").order("updated_at",{ascending:false});
      if(cancelled)return;
      if(error){console.error("Failed to load product drafts",error);if(!quiet)setDraftsLoading(false);return;}
      const mapped={};
      (data||[]).forEach((row)=>{mapped[row.product_slug]={...(row.payload||{}),savedAt:row.updated_at||row.payload?.savedAt||null};});
      setDrafts(mapped);setDraftsLoading(false);
    };
    load();
    const channel=supabase.channel("app-product-drafts").on(
      "postgres_changes",
      {event:"*",schema:"public",table:"product_drafts"},
      ()=>load({quiet:true})
    ).subscribe();
    return()=>{cancelled=true;supabase.removeChannel(channel)};
  },[]);
  const choose=(p)=>{setSelected(p);setEditing(false)};
  const createNew=()=>{const raw=window.prompt("New product slug (lowercase kebab-case)");const slug=String(raw||"").trim();if(!slug)return;if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)){window.alert("Slug must be lowercase kebab-case.");return;}if(products.some((p)=>p.slug===slug)||drafts[slug]){window.alert("That slug already exists.");return;}setSelected({slug,__new:true,name:"",shortName:"",category:"Arabian",image:"/products/",sizes:{},moods:[],noteMap:{top:[],heart:[],base:[]},recommendations:[]});setEditing(true);};
  const saveDraft=async(draft)=>{
    const {data:{user},error:userError}=await supabase.auth.getUser();
    if(userError||!user)throw userError||new Error("No authenticated admin session");
    const {data,error}=await supabase.from("product_drafts").upsert({product_slug:selected.slug,payload:draft,created_by:user.id},{onConflict:"created_by,product_slug"}).select("product_slug,payload,updated_at").single();
    if(error)throw error;
    const saved={...(data.payload||draft),savedAt:data.updated_at||draft.savedAt};
    setDrafts((current)=>({...current,[selected.slug]:saved}));
    setEditing(false);
  };
  return <div className="app-shell"><aside className="sidebar"><div className="brand-block"><div><strong>PlayNice</strong><span>Control Center</span></div></div><nav>{NAV.map((g,i)=><div className="nav-group" key={g.section||i}>{g.section?<span className="nav-label">{g.section}</span>:null}{g.items.map((item)=><button key={item} className={active===item?"active":""} onClick={()=>{setActive(item);setEditing(false)}}><span className="nav-dot"/>{item}</button>)}</div>)}</nav><div className="sidebar-footer"><span className="status-dot"/><div><strong>Supabase draft build</strong><span>Shop remains read only</span></div></div></aside>
    <main className="main-stage"><header className="topbar"><div><span className="eyebrow">PLAYNICE / INTERNAL</span><h1>{active}</h1></div><div className="read-only-badge">NO PUBLISH</div></header>
    {active==="Overview"?<Overview audit={audit} draftCount={Object.keys(drafts).length} draftsLoading={draftsLoading}/>:active==="Products"?<div className="products-layout"><section className="catalog-panel"><div className="catalog-head"><div><span className="eyebrow">CATALOG</span><h2>{products.length} fragrances</h2></div><div className="editor-actions"><button className="secondary-btn" onClick={createNew}>+ New product</button><span className="catalog-count">{filtered.length}</span></div></div><div className="search-wrap"><input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search name, slug, category…"/></div><div className="filter-bar">{FILTERS.map(([v,l])=><button key={v} className={`filter-btn ${coverageFilter===v?"active":""}`} onClick={()=>setCoverageFilter(v)}>{l}</button>)}</div><ProductList items={filtered} selectedSlug={selected?.slug} onSelect={choose} drafts={drafts}/></section><section className="detail-panel">{editing?<DraftEditor key={selected.slug} product={selected} initial={drafts[selected.slug]||(selected.__new?makeBlankDraft():makeDraft(selected))} onCancel={()=>setEditing(false)} onSave={saveDraft}/>:<ProductDetail product={selected} draft={drafts[selected?.slug]} onEdit={()=>setEditing(true)}/>}</section></div>:<section className="placeholder-panel"><span className="eyebrow">MODULE RESERVED</span><h2>{active}</h2><p>This module will be activated in a later build.</p></section>}</main></div>;
}
