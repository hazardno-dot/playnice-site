const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO = "hazardno-dot/playnice-site";
const [OWNER, REPO_NAME] = REPO.split("/");

const json = (res, status, body) => res.status(status).json(body);
const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const csv = (value) => Array.isArray(value) ? value.map(String).map((s)=>s.trim()).filter(Boolean) : String(value ?? "").split(",").map((s)=>s.trim()).filter(Boolean);
const js = (value) => JSON.stringify(value);
const stableJson = (value) => {
  const normalize = (v) => {
    if (Array.isArray(v)) return v.map(normalize);
    if (v && typeof v === "object") return Object.keys(v).sort().reduce((out, key) => {
      out[key] = normalize(v[key]);
      return out;
    }, {});
    return v;
  };
  return JSON.stringify(normalize(value ?? null));
};

async function supabaseFetch(path, token, options = {}) {
  return fetch(`${SUPABASE_URL}${path}`, { ...options, headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${token}`, "Content-Type": "application/json", Prefer: "return=representation", ...(options.headers || {}) } });
}
async function github(path, options = {}) {
  const response = await fetch(`https://api.github.com${path}`, { ...options, headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28", "Content-Type": "application/json", ...(options.headers || {}) } });
  const data = response.status === 204 ? null : await response.json();
  if (!response.ok) throw new Error(data?.message || `GitHub request failed (${response.status})`);
  return data;
}

function normalizePayload(payload, slug) {
  const core = payload?.core || {};
  const sizes = Object.fromEntries(Object.entries(core.sizes || {}).map(([k,v])=>[String(k).trim(), Number(v)]));
  const discovery = Object.fromEntries(Object.entries(payload?.discovery || {}).map(([k,v])=>[k, Number(v)]));
  return {
    slug,
    core: {
      name: String(core.name || "").trim(), shortName: String(core.shortName || "").trim(), category: String(core.category || "").trim(), image: String(core.image || "").trim(),
      sizes, badge: String(core.badge || "").trim(), rating: Number(core.rating), ratingLabel: String(core.ratingLabel || "").trim(), season: String(core.season || "").trim(),
      moods: csv(core.moods), recommendations: csv(core.recommendations), inspiredBy: { name: String(core.inspiredBy?.name || "").trim(), short: String(core.inspiredBy?.short || "").trim() },
      noteMap: { top: csv(core.noteMap?.top), heart: csv(core.noteMap?.heart), base: csv(core.noteMap?.base) }
    },
    copy: { ...(payload?.copy || {}), dominantNotes: { sr: csv(payload?.copy?.dominantNotes?.sr), en: csv(payload?.copy?.dominantNotes?.en) }, tags: { sr: csv(payload?.copy?.tags?.sr), en: csv(payload?.copy?.tags?.en) } },
    wear: payload?.wear || {},
    discovery
  };
}

function validateNewProduct(p) {
  const errors = [];
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.slug)) errors.push("Slug must be lowercase kebab-case.");
  for (const [label, value] of [["Name",p.core.name],["Short name",p.core.shortName],["Category",p.core.category],["Image",p.core.image],["Rating label",p.core.ratingLabel],["Season",p.core.season]]) if (!value) errors.push(`${label} is required.`);
  if (!p.core.image.startsWith("/products/") || p.core.image === "/products/" || p.core.image.endsWith("/")) errors.push("Image must be a specific product file under /products/.");
  if (!Number.isFinite(p.core.rating) || p.core.rating < 0 || p.core.rating > 10) errors.push("Rating must be 0–10.");
  if (!Object.keys(p.core.sizes).length || Object.values(p.core.sizes).some((v)=>!Number.isFinite(v)||v<=0)) errors.push("At least one valid size is required.");
  if (p.core.moods.length !== 3) errors.push("Exactly 3 moods are required for product-card parity.");
  if (!p.core.badge) errors.push("Presentation badge is required for a new product.");
  if (!p.core.inspiredBy.name) errors.push("Inspired-by/original-creation name is required for modal parity.");
  if (p.core.recommendations.length !== 3 || new Set(p.core.recommendations).size !== 3) errors.push("Exactly 3 unique recommendations are required.");
  for (const level of ["top","heart","base"]) if (!p.core.noteMap[level].length) errors.push(`${level} notes are required.`);
  for (const field of ["miniTag","scentType","card","modal","whyChoose"]) for (const lang of ["sr","en"]) if (!String(p.copy?.[field]?.[lang] || "").trim()) errors.push(`copy.${field}.${lang} is required.`);
  for (const field of ["dominantNotes","tags"]) for (const lang of ["sr","en"]) if (!csv(p.copy?.[field]?.[lang]).length) errors.push(`copy.${field}.${lang} is required.`);
  for (const lang of ["sr","en"]) {
    if (csv(p.copy?.dominantNotes?.[lang]).length !== 4) errors.push(`copy.dominantNotes.${lang} must contain exactly 4 items.`);
    if (csv(p.copy?.tags?.[lang]).length !== 3) errors.push(`copy.tags.${lang} must contain exactly 3 items.`);
  }
  const lengthRules = [
    ["miniTag",32,32],["scentType",42,42],["card",82,92],["modal",230,230],["whyChoose",125,125]
  ];
  for (const [field,srMax,enMax] of lengthRules) {
    const sr = String(p.copy?.[field]?.sr || "").trim();
    const en = String(p.copy?.[field]?.en || "").trim();
    if (sr.length > srMax) errors.push(`copy.${field}.sr exceeds presentation limit (${sr.length}/${srMax}).`);
    if (en.length > enMax) errors.push(`copy.${field}.en exceeds presentation limit (${en.length}/${enMax}).`);
  }
  for (const lang of ["sr","en"]) {
    const value = String(p.wear?.[lang] || "").trim();
    if (!value) errors.push(`wear.${lang} is required.`);
    if (value.length > 90) errors.push(`wear.${lang} exceeds product-card presentation limit (${value.length}/90).`);
  }
  if (!Object.keys(p.discovery).length || Object.values(p.discovery).some((v)=>!Number.isFinite(v)||v<0||v>10)) errors.push("Discovery profile must contain numeric 0–10 values.");
  return errors;
}

function nextProductId(source) {
  const ids = [...source.matchAll(/\bid\s*:\s*(\d+)/g)].map((m)=>Number(m[1])).filter(Number.isFinite);
  return (ids.length ? Math.max(...ids) : 0) + 1;
}
function assertUnique(source, p) {
  if (new RegExp(`\\bslug\\s*:\\s*["']${escapeRegex(p.slug)}["']`).test(source)) throw new Error(`Product slug already exists: ${p.slug}`);
  if (new RegExp(`\\bname\\s*:\\s*["']${escapeRegex(p.core.name)}["']`).test(source)) throw new Error(`Product name already exists: ${p.core.name}`);
}
function compactConcentrationName(name) {
  return String(name || "")
    .replace(/\bExtrait de Parfum\b/g, "Extrait")
    .replace(/\bEau de Parfum\b/g, "EDP")
    .replace(/\bEau de Toilette\b/g, "EDT")
    .trim();
}
function renderProductObject(p, id, addedAt = new Date().toISOString()) {
  const c=p.core;
  const inspired = c.inspiredBy.name || c.inspiredBy.short ? `,\n    inspiredBy: {\n      name: ${js(c.inspiredBy.name)},\n      short: ${js(c.inspiredBy.short)}\n    }` : "";
  const modalName = compactConcentrationName(c.name);
  const modalLine = modalName && modalName !== c.name ? `\n    modalName: ${js(modalName)},` : "";
  const cardName = c.name.length > 58 ? modalName : "";
  const cardLine = cardName && cardName !== c.name ? `\n    cardName: ${js(cardName)},` : "";
  return `  {\n    id: ${id},\n    addedAt: ${js(addedAt)},\n    slug: ${js(p.slug)},\n    name: ${js(c.name)},${modalLine}${cardLine}\n    shortName: ${js(c.shortName)},\n    category: ${js(c.category)},\n    image: ${js(c.image)},\n    sizes: ${js(c.sizes)},\n    badge: ${js(c.badge)},\n    rating: ${c.rating},\n    ratingLabel: ${js(c.ratingLabel)},\n    season: ${js(c.season)},\n    moods: ${js(c.moods)},\n    recommendations: ${js(c.recommendations)}${inspired},\n    noteMap: {\n      top: ${js(c.noteMap.top)},\n      heart: ${js(c.noteMap.heart)},\n      base: ${js(c.noteMap.base)}\n    }\n  }`;
}
function appendSeparator(before) { return /,\s*$/.test(before) ? "" : ","; }
function insertProduct(source, p) {
  assertUnique(source,p);
  const end = source.lastIndexOf("\n];");
  if (end < 0) throw new Error("Could not locate products array ending.");
  const before = source.slice(0,end).replace(/\s+$/,"");
  return `${before}${appendSeparator(before)}\n${renderProductObject(p,nextProductId(source))}\n${source.slice(end)}`;
}
function renderCopy(p) {
  const out={};
  for (const field of ["miniTag","card","modal","scentType","dominantNotes","tags","whyChoose"]) if (p.copy?.[field]) out[field]=p.copy[field];
  return `  ${js(p.core.name)}: ${JSON.stringify(out,null,2).replace(/^/gm,"  ").trimStart()}`;
}
function renderWear(p) { return `  ${js(p.core.name)}: ${JSON.stringify({sr:String(p.wear.sr),en:String(p.wear.en)},null,2).replace(/^/gm,"  ").trimStart()}`; }
function renderDiscovery(p) { return `  ${js(p.slug)}: ${JSON.stringify(p.discovery,null,2).replace(/^/gm,"  ").trimStart()}`; }

function findExportObjectEnd(source, exportName) {
  const start = source.indexOf(`export const ${exportName} = {`);
  if (start < 0) throw new Error(`Could not locate export ${exportName}.`);
  let depth = 0, quote = null, escaped = false;
  for (let i = source.indexOf("{", start); i < source.length; i += 1) {
    const ch = source[i];
    if (quote) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') { quote = ch; continue; }
    if (ch === "{") depth += 1;
    else if (ch === "}") {
      depth -= 1;
      if (depth === 0) return i;
    }
  }
  throw new Error(`Could not locate end of export ${exportName}.`);
}
function insertObjectEntry(source, rendered, label, exportName) {
  const exportEnd = findExportObjectEnd(source, exportName);
  const before = source.slice(0,exportEnd).replace(/\s+$/,"");
  const after = source.slice(exportEnd);
  return `${before}${appendSeparator(before)}\n\n${rendered}\n${after}`;
}

export const __test = { normalizePayload, validateNewProduct, nextProductId, renderProductObject, insertProduct, insertObjectEntry, renderCopy, renderWear, renderDiscovery, findExportObjectEnd, appendSeparator, stableJson, compactConcentrationName };

export default async function handler(req,res){
  if(req.method!=="POST") return json(res,405,{error:"Method not allowed"});
  if(!SUPABASE_URL||!SUPABASE_KEY||!GITHUB_TOKEN) return json(res,500,{error:"Server configuration is incomplete."});
  try{
    const auth=req.headers.authorization||"";
    const token=auth.startsWith("Bearer ")?auth.slice(7):"";
    if(!token)return json(res,401,{error:"Missing admin session."});
    const userRes=await supabaseFetch("/auth/v1/user",token);
    if(!userRes.ok)return json(res,401,{error:"Invalid admin session."});
    const user=await userRes.json();
    const adminRes=await supabaseFetch(`/rest/v1/admin_users?user_id=eq.${encodeURIComponent(user.id)}&select=user_id&limit=1`,token);
    const admins=adminRes.ok?await adminRes.json():[];
    if(!admins.length)return json(res,403,{error:"Not authorized."});
    const slug=String(req.body?.product_slug||"").trim();
    if(!slug)return json(res,400,{error:"product_slug is required."});
    const draftRes=await supabaseFetch(`/rest/v1/product_drafts?product_slug=eq.${encodeURIComponent(slug)}&select=product_slug,payload,approved_payload,review_status,prepared_at,baseline_snapshot,apply_branch,apply_pr_number&limit=1`,token);
    const [draft]=draftRes.ok?await draftRes.json():[];
    if(!draft)return json(res,404,{error:"Prepared draft not found."});
    if(draft.review_status!=="approved"||!draft.prepared_at||draft.baseline_snapshot?.kind!=="new_product") return json(res,409,{error:"New product draft must be APPROVED and prepared as new_product first."});
    if(!draft.approved_payload)return json(res,409,{error:"Approved snapshot is missing. Review and approve the new product draft again."});
    if(stableJson(draft.payload)!==stableJson(draft.approved_payload))return json(res,409,{error:"Approved payload no longer matches the current new product draft. Review and approve again."});
    if(draft.apply_branch&&draft.apply_pr_number)return json(res,200,{ok:true,existing:true,branch:draft.apply_branch,pr_number:draft.apply_pr_number,pr_url:`https://github.com/${REPO}/pull/${draft.apply_pr_number}`});
    const p=normalizePayload(draft.approved_payload,slug);
    const errors=validateNewProduct(p);
    if(errors.length)return json(res,409,{error:"New product validation failed.",errors});

    const mainRef=await github(`/repos/${OWNER}/${REPO_NAME}/git/ref/heads/main`);
    const baseSha=mainRef.object.sha;
    const baseCommit=await github(`/repos/${OWNER}/${REPO_NAME}/git/commits/${baseSha}`);
    const stamp=new Date().toISOString().replace(/[-:TZ.]/g,"").slice(0,12);
    const branch=`cc-create-${slug}-${stamp}`;
    const specs=[
      ["playnice-site/src/data/products/index.js",(s)=>insertProduct(s,p)],
      ["playnice-site/src/data/products/productCopy.js",(s)=>insertObjectEntry(s,renderCopy(p),"Product Copy","productCopy")],
      ["playnice-site/src/data/products/productWearContext.js",(s)=>insertObjectEntry(s,renderWear(p),"Wear Context","productWearContext")],
      ["playnice-site/src/data/products/discoveryProfiles.js",(s)=>insertObjectEntry(s,renderDiscovery(p),"Discovery Profiles","discoveryProfiles")],
    ];
    const files=[];
    const tree=[];
    for(const [filePath,transform] of specs){
      const file=await github(`/repos/${OWNER}/${REPO_NAME}/contents/${filePath}?ref=main`);
      const source=Buffer.from(file.content,"base64").toString("utf8");
      const next=transform(source);
      const blob=await github(`/repos/${OWNER}/${REPO_NAME}/git/blobs`,{method:"POST",body:JSON.stringify({content:next,encoding:"utf-8"})});
      tree.push({path:filePath,mode:"100644",type:"blob",sha:blob.sha});
      files.push(filePath);
    }
    const nextTree=await github(`/repos/${OWNER}/${REPO_NAME}/git/trees`,{method:"POST",body:JSON.stringify({base_tree:baseCommit.tree,tree})});
    const commit=await github(`/repos/${OWNER}/${REPO_NAME}/git/commits`,{method:"POST",body:JSON.stringify({message:`Control Center create: ${slug}`,tree:nextTree.sha,parents:[baseSha]})});
    await github(`/repos/${OWNER}/${REPO_NAME}/git/refs`,{method:"POST",body:JSON.stringify({ref:`refs/heads/${branch}`,sha:commit.sha})});

    const pr=await github(`/repos/${OWNER}/${REPO_NAME}/pulls`,{method:"POST",body:JSON.stringify({title:`Control Center: create ${slug}`,head:branch,base:"main",draft:true,body:["Generated by PlayNice Control Center controlled apply v3.0.","",`- New product: ${slug}`,`- Name: ${p.core.name}`,`- Files: ${files.join(", ")}`,"- Safety: one atomic commit; draft PR only; Shop preview + visual parity verification required before merge"].join("\n")})});
    await supabaseFetch(`/rest/v1/product_drafts?product_slug=eq.${encodeURIComponent(slug)}`,token,{method:"PATCH",body:JSON.stringify({apply_branch:branch,apply_pr_number:pr.number,apply_created_at:new Date().toISOString(),apply_created_by:user.id,preview_verified_at:null,preview_verified_by:null})});
    await supabaseFetch("/rest/v1/draft_audit_log",token,{method:"POST",body:JSON.stringify({product_slug:slug,actor_id:user.id,action:"new_product_branch_created",details:{branch,pr_number:pr.number,version:"3.0",files,atomic_commit:true}})});
    return json(res,200,{ok:true,branch,pr_number:pr.number,pr_url:pr.html_url,version:"3.0",files,atomic_commit:true});
  }catch(error){return json(res,500,{error:error?.message||"New product apply failed."});}
}
