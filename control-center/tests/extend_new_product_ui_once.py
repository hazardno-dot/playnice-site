from pathlib import Path

# App.jsx
path=Path('control-center/src/App.jsx'); text=path.read_text()
anchor='''function ProductList({items,selectedSlug,onSelect,drafts}){'''
blank='''function makeBlankDraft(){\n  const discoveryKeys=Object.keys(discoveryProfiles[products[0]?.slug]||{});\n  return {\n    core:{name:"",shortName:"",category:"Arabian",image:"/products/",badge:"NEW",rating:"",ratingLabel:"New",season:"all",moods:"",inspiredBy:{name:"",short:""},sizes:{},noteMap:{top:"",heart:"",base:""},recommendations:""},\n    copy:{miniTag:{sr:"",en:""},scentType:{sr:"",en:""},card:{sr:"",en:""},modal:{sr:"",en:""},dominantNotes:{sr:"",en:""},tags:{sr:"",en:""},whyChoose:{sr:"",en:""}},\n    wear:{sr:"",en:""},discovery:Object.fromEntries(discoveryKeys.map((key)=>[key,0])),savedAt:null\n  };\n}\n\n'''
assert anchor in text
if 'function makeBlankDraft()' not in text:text=text.replace(anchor,blank+anchor)
old='<LangPair label="Modal copy" multiline value={draft.copy.modal} onChange={(v)=>setCopy("modal",v)}/><LangPair label="Why choose" multiline value={draft.copy.whyChoose} onChange={(v)=>setCopy("whyChoose",v)}/>'
new='<LangPair label="Modal copy" multiline value={draft.copy.modal} onChange={(v)=>setCopy("modal",v)}/><LangPair label="Dominant notes · comma separated" value={draft.copy.dominantNotes} onChange={(v)=>setCopy("dominantNotes",v)}/><LangPair label="Tags · comma separated" value={draft.copy.tags} onChange={(v)=>setCopy("tags",v)}/><LangPair label="Why choose" multiline value={draft.copy.whyChoose} onChange={(v)=>setCopy("whyChoose",v)}/>'
assert old in text; text=text.replace(old,new)
choose='''  const choose=(p)=>{setSelected(p);setEditing(false)};'''
create=choose+'''\n  const createNew=()=>{const raw=window.prompt("New product slug (lowercase kebab-case)");const slug=String(raw||"").trim();if(!slug)return;if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)){window.alert("Slug must be lowercase kebab-case.");return;}if(products.some((p)=>p.slug===slug)||drafts[slug]){window.alert("That slug already exists.");return;}setSelected({slug,__new:true,name:"",shortName:"",category:"Arabian",image:"/products/",sizes:{},moods:[],noteMap:{top:[],heart:[],base:[]},recommendations:[]});setEditing(true);};'''
assert choose in text; text=text.replace(choose,create)
old='<div className="catalog-head"><div><span className="eyebrow">CATALOG</span><h2>{products.length} fragrances</h2></div><span className="catalog-count">{filtered.length}</span></div>'
new='<div className="catalog-head"><div><span className="eyebrow">CATALOG</span><h2>{products.length} fragrances</h2></div><div className="editor-actions"><button className="secondary-btn" onClick={createNew}>+ New product</button><span className="catalog-count">{filtered.length}</span></div></div>'
assert old in text; text=text.replace(old,new)
old='initial={drafts[selected.slug]||makeDraft(selected)}'
new='initial={drafts[selected.slug]||(selected.__new?makeBlankDraft():makeDraft(selected))}'
assert old in text; text=text.replace(old,new)
path.write_text(text)

# DraftManager.jsx
path=Path('control-center/src/DraftManager.jsx'); text=path.read_text()
old='''function buildChanges(live, draft) {\n  if (!live || !draft) return [];\n  const changes = []; const core = draft.core || {};'''
new='''function buildChanges(live, draft) {\n  if (!draft) return [];\n  live = live || { name:"", shortName:"", category:"", image:"", inspiredBy:{}, badge:"", rating:"", ratingLabel:"", season:"", moods:[], sizes:{}, noteMap:{top:[],heart:[],base:[]}, recommendations:[], slug:"" };\n  const changes = []; const core = draft.core || {};'''
assert old in text; text=text.replace(old,new)
old='''    const currentSnapshot = makeLiveSnapshot(live);\n    const drifted = Boolean(row.baseline_snapshot) && !snapshotsEqual(row.baseline_snapshot, currentSnapshot);'''
new='''    const currentSnapshot = live ? makeLiveSnapshot(live) : { kind: "new_product", product_slug: row.product_slug };\n    const drifted = Boolean(row.baseline_snapshot) && !snapshotsEqual(row.baseline_snapshot, currentSnapshot);'''
assert old in text; text=text.replace(old,new)
path.write_text(text)

# ControlledApplyManager.jsx
path=Path('control-center/src/ControlledApplyManager.jsx'); text=path.read_text()
old='''    if (!live || row.review_status !== "approved" || !row.prepared_at) return false;\n    const validation = validateProductDraft(live, row.payload);\n    const current = makeLiveSnapshot(live);\n    return validation.status !== "blocked" && row.baseline_snapshot && snapshotsEqual(row.baseline_snapshot, current);'''
new='''    if (row.review_status !== "approved" || !row.prepared_at) return false;\n    const validation = validateProductDraft(live || null, row.payload);\n    const current = live ? makeLiveSnapshot(live) : { kind: "new_product", product_slug: row.product_slug };\n    return validation.status !== "blocked" && row.baseline_snapshot && snapshotsEqual(row.baseline_snapshot, current);'''
assert old in text; text=text.replace(old,new)
old='''      const response = await fetch("/api/create-apply", {'''
new='''      const endpoint = row.baseline_snapshot?.kind === "new_product" ? "/api/create-new-product" : "/api/create-apply";\n      const response = await fetch(endpoint, {'''
assert old in text; text=text.replace(old,new)
path.write_text(text)

# draftValidation.js
path=Path('control-center/src/draftValidation.js'); text=path.read_text()
anchor='''const PRODUCT_SLUGS = new Set(products.map((product) => product.slug));'''
assert anchor in text; text=text.replace(anchor,anchor+'\nconst DISCOVERY_KEYS = Object.keys(discoveryProfiles[products[0]?.slug] || {});')
old='''  ["miniTag", "scentType", "card", "modal", "whyChoose"].forEach((field) => {'''
new='''  ["miniTag", "scentType", "card", "modal", "dominantNotes", "tags", "whyChoose"].forEach((field) => {'''
assert old in text; text=text.replace(old,new,1)
old='''  const liveDiscovery = discoveryProfiles[live?.slug] || {};\n  const discovery = draft?.discovery || {};\n  Object.keys(liveDiscovery).forEach((key) => {'''
new='''  const liveDiscovery = discoveryProfiles[live?.slug] || {};\n  const discovery = draft?.discovery || {};\n  const discoveryKeys = live ? Object.keys(liveDiscovery) : DISCOVERY_KEYS;\n  discoveryKeys.forEach((key) => {'''
assert old in text; text=text.replace(old,new)
path.write_text(text)

# create-new-product normalize/validation arrays
path=Path('control-center/api/create-new-product.js'); text=path.read_text()
old='''    copy: payload?.copy || {}, wear: payload?.wear || {}, discovery'''
new='''    copy: { ...(payload?.copy || {}), dominantNotes: { sr: csv(payload?.copy?.dominantNotes?.sr), en: csv(payload?.copy?.dominantNotes?.en) }, tags: { sr: csv(payload?.copy?.tags?.sr), en: csv(payload?.copy?.tags?.en) } }, wear: payload?.wear || {}, discovery'''
assert old in text; text=text.replace(old,new)
old='''  for (const field of ["miniTag","scentType","card","modal","whyChoose"]) for (const lang of ["sr","en"]) if (!String(p.copy?.[field]?.[lang] || "").trim()) errors.push(`copy.${field}.${lang} is required.`);'''
new='''  for (const field of ["miniTag","scentType","card","modal","whyChoose"]) for (const lang of ["sr","en"]) if (!String(p.copy?.[field]?.[lang] || "").trim()) errors.push(`copy.${field}.${lang} is required.`);\n  for (const field of ["dominantNotes","tags"]) for (const lang of ["sr","en"]) if (!csv(p.copy?.[field]?.[lang]).length) errors.push(`copy.${field}.${lang} is required.`);'''
assert old in text; text=text.replace(old,new)
path.write_text(text)
