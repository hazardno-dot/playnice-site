from pathlib import Path

# Draft validation: actual Note Library + strict presentation contract.
p = Path('control-center/src/draftValidation.js')
s = p.read_text(encoding='utf-8')
if 'TheNoteMap.jsx?raw' not in s:
    s = s.replace(
        'import discoveryProfiles from "@shop/data/products/discoveryProfiles.js";\n',
        'import discoveryProfiles from "@shop/data/products/discoveryProfiles.js";\nimport noteMapSource from "@shop/TheNoteMap.jsx?raw";\n'
    )
old_notes = '''const KNOWN_NOTE_KEYS = new Set(\n  products.flatMap((product) => ["top", "heart", "base"].flatMap((level) => product.noteMap?.[level] || []))\n);'''
new_notes = '''function noteLibraryKeys(source) {\n  const start = source.indexOf("const NOTE_LIBRARY = {");\n  const end = source.indexOf("const NOTE_SR = {", start);\n  if (start < 0 || end < 0) return [];\n  const section = source.slice(start, end);\n  return [...section.matchAll(/^  (?:(?:"([^\\"]+)")|(?:'([^']+)')|([A-Za-z0-9_-]+))\\s*:\\s*\\{/gm)]\n    .map((match) => match[1] || match[2] || match[3])\n    .filter(Boolean);\n}\n\nconst KNOWN_NOTE_KEYS = new Set([\n  ...products.flatMap((product) => ["top", "heart", "base"].flatMap((level) => product.noteMap?.[level] || [])),\n  ...noteLibraryKeys(noteMapSource),\n]);'''
if old_notes in s:
    s = s.replace(old_notes, new_notes, 1)
s = s.replace(
    '  if (!csv(core.moods).length) issues.push(issue("error", "Core", "Moods", "At least one mood is required."));',
    '  const moods = csv(core.moods);\n  if (moods.length !== 3) issues.push(issue("error", "Core", "Moods", "Exactly 3 moods are required for product-card parity."));'
)
old_inspired = '  if (core.inspiredBy && (!empty(core.inspiredBy.name) || !empty(core.inspiredBy.short)) && (empty(core.inspiredBy.name) || empty(core.inspiredBy.short))) issues.push(issue("warning", "Core", "Inspired by", "Use both inspired-by name and short label, or leave both empty."));'
new_inspired = '''  if (!live && empty(core.badge)) issues.push(issue("error", "Presentation", "Badge", "A new product must have a presentation badge so the modal media column keeps the standard PlayNice hierarchy."));\n  if (!live && empty(core.inspiredBy?.name)) issues.push(issue("error", "Presentation", "Inspired by · name", "A new product must define the modal reference/original-creation label. The optional short DNA label may remain empty."));\n  if (!empty(core.inspiredBy?.short) && empty(core.inspiredBy?.name)) issues.push(issue("warning", "Core", "Inspired by", "A short DNA label cannot be used without the main inspired-by/original-creation label."));'''
if old_inspired in s:
    s = s.replace(old_inspired, new_inspired, 1)
marker = '  const wear = draft?.wear || {};'
contract = '''  const presentationLengths = [\n    ["miniTag", 32],\n    ["scentType", 42],\n    ["card", { sr: 82, en: 92 }],\n    ["modal", 230],\n    ["whyChoose", 125],\n  ];\n  presentationLengths.forEach(([field, limit]) => {\n    ["sr", "en"].forEach((lang) => {\n      const value = String(copy?.[field]?.[lang] || "").trim();\n      const max = typeof limit === "object" ? limit[lang] : limit;\n      if (value.length > max) issues.push(issue("error", "Presentation", `${field} · ${lang.toUpperCase()}`, `Copy is ${value.length} characters; keep it at or below ${max} to protect the shared card/modal layout.`));\n    });\n  });\n  ["sr", "en"].forEach((lang) => {\n    const dominant = csv(copy?.dominantNotes?.[lang]);\n    const tags = csv(copy?.tags?.[lang]);\n    if (dominant.length !== 4) issues.push(issue("error", "Presentation", `dominantNotes · ${lang.toUpperCase()}`, "Exactly 4 dominant notes are required for modal parity."));\n    if (tags.length !== 3) issues.push(issue("error", "Presentation", `tags · ${lang.toUpperCase()}`, "Exactly 3 tags are required for product presentation parity."));\n  });\n\n'''
if 'presentationLengths' not in s:
    s = s.replace(marker, contract + marker, 1)
wear_marker = '''  ["sr", "en"].forEach((lang) => {\n    if (empty(wear?.[lang])) issues.push(issue("error", "Wear", lang.toUpperCase(), "Wear context is required in both languages."));\n  });'''
wear_replacement = wear_marker + '''\n  ["sr", "en"].forEach((lang) => {\n    const value = String(wear?.[lang] || "").trim();\n    if (value.length > 90) issues.push(issue("error", "Presentation", `Wear · ${lang.toUpperCase()}`, `Wear context is ${value.length} characters; keep it at or below 90 so product cards remain balanced.`));\n  });'''
if 'Wear context is ${value.length}' not in s:
    s = s.replace(wear_marker, wear_replacement, 1)
p.write_text(s, encoding='utf-8')

# Move new-product engine out of /api and strengthen the server-side contract.
src = Path('control-center/api/create-new-product-engine.js')
engine = src.read_text(encoding='utf-8')
engine = engine.replace(
    '  if (!p.core.moods.length) errors.push("At least one mood is required.");',
    '  if (p.core.moods.length !== 3) errors.push("Exactly 3 moods are required for product-card parity.");\n  if (!p.core.badge) errors.push("Presentation badge is required for a new product.");\n  if (!p.core.inspiredBy.name) errors.push("Inspired-by/original-creation name is required for modal parity.");'
)
copy_req = '  for (const field of ["dominantNotes","tags"]) for (const lang of ["sr","en"]) if (!csv(p.copy?.[field]?.[lang]).length) errors.push(`copy.${field}.${lang} is required.`);'
copy_guard = copy_req + '''\n  for (const lang of ["sr","en"]) {\n    if (csv(p.copy?.dominantNotes?.[lang]).length !== 4) errors.push(`copy.dominantNotes.${lang} must contain exactly 4 items.`);\n    if (csv(p.copy?.tags?.[lang]).length !== 3) errors.push(`copy.tags.${lang} must contain exactly 3 items.`);\n  }\n  const lengthRules = [\n    ["miniTag",32,32],["scentType",42,42],["card",82,92],["modal",230,230],["whyChoose",125,125]\n  ];\n  for (const [field,srMax,enMax] of lengthRules) {\n    const sr = String(p.copy?.[field]?.sr || "").trim();\n    const en = String(p.copy?.[field]?.en || "").trim();\n    if (sr.length > srMax) errors.push(`copy.${field}.sr exceeds presentation limit (${sr.length}/${srMax}).`);\n    if (en.length > enMax) errors.push(`copy.${field}.en exceeds presentation limit (${en.length}/${enMax}).`);\n  }'''
if 'lengthRules' not in engine:
    engine = engine.replace(copy_req, copy_guard, 1)
wear_req = '  for (const lang of ["sr","en"]) if (!String(p.wear?.[lang] || "").trim()) errors.push(`wear.${lang} is required.`);'
wear_guard = wear_req + '''\n  for (const lang of ["sr","en"]) {\n    const value = String(p.wear?.[lang] || "").trim();\n    if (value.length > 90) errors.push(`wear.${lang} exceeds product-card presentation limit (${value.length}/90).`);\n  }'''
if 'wear.${lang} exceeds product-card' not in engine:
    engine = engine.replace(wear_req, wear_guard, 1)
render_marker = 'function renderProductObject(p, id, addedAt = new Date().toISOString()) {'
helpers = '''function compactConcentrationName(name) {\n  return String(name || "")\n    .replace(/\\bExtrait de Parfum\\b/g, "Extrait")\n    .replace(/\\bEau de Parfum\\b/g, "EDP")\n    .replace(/\\bEau de Toilette\\b/g, "EDT")\n    .trim();\n}\nfunction renderProductObject(p, id, addedAt = new Date().toISOString()) {'''
if 'compactConcentrationName' not in engine:
    engine = engine.replace(render_marker, helpers, 1)
old_return = '  return `  {\\n    id: ${id},\\n    addedAt: ${js(addedAt)},\\n    slug: ${js(p.slug)},\\n    name: ${js(c.name)},\\n    shortName: ${js(c.shortName)},'
new_return = '  const modalName = compactConcentrationName(c.name);\n  const modalLine = modalName && modalName !== c.name ? `\\n    modalName: ${js(modalName)},` : "";\n  const cardName = c.name.length > 58 ? modalName : "";\n  const cardLine = cardName && cardName !== c.name ? `\\n    cardName: ${js(cardName)},` : "";\n  return `  {\\n    id: ${id},\\n    addedAt: ${js(addedAt)},\\n    slug: ${js(p.slug)},\\n    name: ${js(c.name)},${modalLine}${cardLine}\\n    shortName: ${js(c.shortName)},'
if old_return in engine:
    engine = engine.replace(old_return, new_return, 1)
start = engine.find('    const stamp=new Date().toISOString().replace(/[-:TZ.]/g,"").slice(0,12);')
end = engine.find('    const pr=await github(`/repos/${OWNER}/${REPO_NAME}/pulls`', start)
if start < 0 or end < 0:
    raise SystemExit('Could not locate new-product branch creation block')
combined = '''    const stamp=new Date().toISOString().replace(/[-:TZ.]/g,"").slice(0,12);\n    const branch=`cc-create-${slug}-${stamp}`;\n    const specs=[\n      ["playnice-site/src/data/products/index.js",(s)=>insertProduct(s,p)],\n      ["playnice-site/src/data/products/productCopy.js",(s)=>insertObjectEntry(s,renderCopy(p),"Product Copy","productCopy")],\n      ["playnice-site/src/data/products/productWearContext.js",(s)=>insertObjectEntry(s,renderWear(p),"Wear Context","productWearContext")],\n      ["playnice-site/src/data/products/discoveryProfiles.js",(s)=>insertObjectEntry(s,renderDiscovery(p),"Discovery Profiles","discoveryProfiles")],\n    ];\n    const baseCommit=await github(`/repos/${OWNER}/${REPO_NAME}/git/commits/${baseSha}`);\n    const treeEntries=[];\n    const files=[];\n    for(const [filePath,transform] of specs){\n      const file=await github(`/repos/${OWNER}/${REPO_NAME}/contents/${filePath}?ref=main`);\n      const source=Buffer.from(file.content,"base64").toString("utf8");\n      const next=transform(source);\n      const blob=await github(`/repos/${OWNER}/${REPO_NAME}/git/blobs`,{method:"POST",body:JSON.stringify({content:next,encoding:"utf-8"})});\n      treeEntries.push({path:filePath,mode:"100644",type:"blob",sha:blob.sha});\n      files.push(filePath);\n    }\n    const nextTree=await github(`/repos/${OWNER}/${REPO_NAME}/git/trees`,{method:"POST",body:JSON.stringify({base_tree:baseCommit.tree.sha,tree:treeEntries})});\n    const commit=await github(`/repos/${OWNER}/${REPO_NAME}/git/commits`,{method:"POST",body:JSON.stringify({message:`Control Center create: ${slug}`,tree:nextTree.sha,parents:[baseSha]})});\n    await github(`/repos/${OWNER}/${REPO_NAME}/git/refs`,{method:"POST",body:JSON.stringify({ref:`refs/heads/${branch}`,sha:commit.sha})});\n'''
engine = engine[:start] + combined + engine[end:]
engine = engine.replace('controlled apply v2.9', 'controlled apply v3.0')
engine = engine.replace('version:"2.9"', 'version:"3.0"')
engine = engine.replace('"- Safety: draft PR only; no automatic merge"', '"- Safety: one atomic commit; draft PR only; Shop preview + visual parity verification required before merge"')
engine = engine.replace('renderDiscovery, findExportObjectEnd, appendSeparator, stableJson }', 'renderDiscovery, findExportObjectEnd, appendSeparator, stableJson, compactConcentrationName }')
Path('control-center/lib').mkdir(exist_ok=True)
Path('control-center/lib/create-new-product-engine.mjs').write_text(engine, encoding='utf-8')
Path('control-center/api/create-new-product.js').write_text('''module.exports = async function handler(req, res) {\n  const mod = await import("../lib/create-new-product-engine.mjs");\n  return mod.default(req, res);\n};\n''', encoding='utf-8')
src.unlink()

# Server-side preview verification: complete visual checklist + current Shop Vercel status must be green.
Path('control-center/api/verify-product-preview.js').write_text(r'''const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO = "hazardno-dot/playnice-site";
const [OWNER, REPO_NAME] = REPO.split("/");
const REQUIRED_CHECKS = ["card","modal-desktop","modal-390","modal-360","note-map","purchase"];
const json = (res, status, body) => res.status(status).json(body);
async function supabaseFetch(path, token, options = {}) {
  return fetch(`${SUPABASE_URL}${path}`, { ...options, headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${token}`, "Content-Type": "application/json", Prefer: "return=representation", ...(options.headers || {}) } });
}
async function github(path) {
  const response = await fetch(`https://api.github.com${path}`, { headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" } });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.message || `GitHub request failed (${response.status})`);
  return data;
}
module.exports = async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });
  if (!SUPABASE_URL || !SUPABASE_KEY || !GITHUB_TOKEN) return json(res, 500, { error: "Server configuration is incomplete." });
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    if (!token) return json(res, 401, { error: "Missing admin session." });
    const userRes = await supabaseFetch("/auth/v1/user", token);
    if (!userRes.ok) return json(res, 401, { error: "Invalid admin session." });
    const user = await userRes.json();
    const adminRes = await supabaseFetch(`/rest/v1/admin_users?user_id=eq.${encodeURIComponent(user.id)}&select=user_id&limit=1`, token);
    const admins = adminRes.ok ? await adminRes.json() : [];
    if (!admins.length) return json(res, 403, { error: "Not authorized." });
    const slug = String(req.body?.product_slug || "").trim();
    const checks = req.body?.checks && typeof req.body.checks === "object" ? req.body.checks : {};
    if (!slug) return json(res, 400, { error: "product_slug is required." });
    const missingChecks = REQUIRED_CHECKS.filter((id) => checks[id] !== true);
    if (missingChecks.length) return json(res, 409, { error: `Visual parity checklist incomplete: ${missingChecks.join(", ")}.` });
    const draftRes = await supabaseFetch(`/rest/v1/product_drafts?product_slug=eq.${encodeURIComponent(slug)}&select=product_slug,apply_branch,apply_pr_number&limit=1`, token);
    const [draft] = draftRes.ok ? await draftRes.json() : [];
    if (!draft?.apply_branch || !draft?.apply_pr_number) return json(res, 409, { error: "Preview branch/PR is missing." });
    const pr = await github(`/repos/${OWNER}/${REPO_NAME}/pulls/${draft.apply_pr_number}`);
    if (pr.state !== "open" || pr.head?.ref !== draft.apply_branch) return json(res, 409, { error: "Preview PR is not open or no longer matches the Controlled Apply branch." });
    const headSha = pr.head?.sha;
    if (!headSha) return json(res, 409, { error: "Preview PR head SHA is missing." });
    const status = await github(`/repos/${OWNER}/${REPO_NAME}/commits/${headSha}/status`);
    const shopStatuses = (status.statuses || []).filter((item) => String(item.context || "").includes("playnice-site"));
    const shopReady = shopStatuses.some((item) => item.state === "success");
    if (!shopReady) return json(res, 409, { error: "Shop preview is not green for the current PR head. Verification is locked until Vercel – playnice-site succeeds.", head_sha: headSha });
    const now = new Date().toISOString();
    const updateRes = await supabaseFetch(`/rest/v1/product_drafts?product_slug=eq.${encodeURIComponent(slug)}`, token, { method: "PATCH", body: JSON.stringify({ preview_verified_at: now, preview_verified_by: user.id }) });
    if (!updateRes.ok) throw new Error("Could not save preview verification.");
    await supabaseFetch("/rest/v1/draft_audit_log", token, { method: "POST", body: JSON.stringify({ product_slug: slug, actor_id: user.id, action: "preview_verified", details: { branch: draft.apply_branch, pr_number: draft.apply_pr_number, head_sha: headSha, checklist: REQUIRED_CHECKS, shop_preview: "success" } }) });
    return json(res, 200, { ok: true, verified_at: now, head_sha: headSha, shop_preview: "success" });
  } catch (error) {
    return json(res, 500, { error: error?.message || "Preview verification failed." });
  }
};
''', encoding='utf-8')

# Controlled Apply: mandatory visual-parity checklist before verification.
p = Path('control-center/src/ControlledApplyManager.jsx')
s = p.read_text(encoding='utf-8')
if 'PREVIEW_CHECK_ITEMS' not in s:
    insert = '''\nconst PREVIEW_CHECK_ITEMS = [\n  ["card", "Product card · SR + EN · title/copy/badges/sizes aligned, no clipping"],\n  ["modal-desktop", "Desktop modal · same shared layout, header/media/content/purchase aligned"],\n  ["modal-390", "Mobile modal · 390px · no overflow, clipping or displaced controls"],\n  ["modal-360", "Mobile modal · 360px · no overflow, clipping or displaced controls"],\n  ["note-map", "Note Map · opens/closes correctly and notes/icons render"],\n  ["purchase", "Purchase block · sizes, price, Add to cart and recommendations remain aligned"],\n];\n'''
    s = s.replace('import "./controlled-apply.css";\n', 'import "./controlled-apply.css";\n' + insert, 1)
s = s.replace('  const [error, setError] = useState("");', '  const [error, setError] = useState("");\n  const [previewChecks, setPreviewChecks] = useState({});')
vstart = s.find('  const verifyPreview = async (row) => {')
vend = s.find('\n\n  if (!readyRows.length', vstart)
if vstart < 0 or vend < 0:
    raise SystemExit('Could not locate verifyPreview function')
verify = '''  const verifyPreview = async (row) => {\n    setBusy(`verify:${row.product_slug}`);\n    setError("");\n    try {\n      const checks = previewChecks[row.product_slug] || {};\n      const missing = PREVIEW_CHECK_ITEMS.filter(([id]) => checks[id] !== true);\n      if (missing.length) throw new Error("Complete every visual parity check before verification.");\n      const { data: { session } } = await supabase.auth.getSession();\n      if (!session?.access_token) throw new Error("Admin session expired. Sign in again.");\n      const response = await fetch("/api/verify-product-preview", {\n        method: "POST",\n        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },\n        body: JSON.stringify({ product_slug: row.product_slug, checks }),\n      });\n      const raw = await response.text();\n      let body = {};\n      try { body = raw ? JSON.parse(raw) : {}; } catch { throw new Error(raw || "Preview verification returned an invalid response."); }\n      if (!response.ok) throw new Error(body?.error || "Could not verify preview.");\n      await load({ sync: false });\n    } catch (e) {\n      setError(e?.message || "Could not verify preview.");\n    } finally {\n      setBusy("");\n    }\n  };'''
s = s[:vstart] + verify + s[vend:]
map_marker = '''      const hasApply = Boolean(row.apply_branch && row.apply_pr_number);\n      const verified = Boolean(row.preview_verified_at);\n      return <div'''
map_replacement = '''      const hasApply = Boolean(row.apply_branch && row.apply_pr_number);\n      const verified = Boolean(row.preview_verified_at);\n      const checks = previewChecks[row.product_slug] || {};\n      const completedChecks = PREVIEW_CHECK_ITEMS.filter(([id]) => checks[id] === true).length;\n      const visualGatePassed = completedChecks === PREVIEW_CHECK_ITEMS.length;\n      return <div'''
if map_marker in s:
    s = s.replace(map_marker, map_replacement, 1)
old_button = '''          {hasApply && !verified ? <button disabled={busy === `verify:${row.product_slug}`} onClick={() => verifyPreview(row)}>\n            {busy === `verify:${row.product_slug}` ? "Saving…" : "Mark preview verified"}\n          </button> : null}'''
new_button = '''          {hasApply && !verified ? <button disabled={busy === `verify:${row.product_slug}` || !visualGatePassed} onClick={() => verifyPreview(row)}>\n            {busy === `verify:${row.product_slug}` ? "Checking preview…" : visualGatePassed ? "Mark preview verified" : `Visual QA ${completedChecks}/${PREVIEW_CHECK_ITEMS.length}`}\n          </button> : null}'''
if old_button in s:
    s = s.replace(old_button, new_button, 1)
result_marker = '''        {hasApply ? <div className={`controlled-apply-result ${verified ? "controlled-apply-verified" : ""}`}>\n          <strong>{verified ? "Ready to merge" : "Preview branch created"}</strong>\n          <span>{row.apply_branch}</span>\n          <a href={`https://github.com/hazardno-dot/playnice-site/pull/${row.apply_pr_number}`} target="_blank" rel="noreferrer">\n            Open PR #{row.apply_pr_number}\n          </a>\n        </div> : null}'''
if 'controlled-preview-gate-head' not in s:
    gate = result_marker + '''\n\n        {hasApply && !verified ? <div className="controlled-preview-gate">\n          <div className="controlled-preview-gate-head"><strong>VISUAL PARITY GATE</strong><span>{completedChecks}/{PREVIEW_CHECK_ITEMS.length}</span></div>\n          <p>Merge remains locked in the PlayNice workflow until the current Shop preview is green and every shared card/modal check is confirmed.</p>\n          <div className="controlled-preview-checks">\n            {PREVIEW_CHECK_ITEMS.map(([id, label]) => <label key={id}>\n              <input type="checkbox" checked={checks[id] === true} onChange={(event) => setPreviewChecks((current) => ({ ...current, [row.product_slug]: { ...(current[row.product_slug] || {}), [id]: event.target.checked } }))} />\n              <span>{label}</span>\n            </label>)}\n          </div>\n        </div> : null}'''
    s = s.replace(result_marker, gate, 1)
p.write_text(s, encoding='utf-8')

# Visual-gate styles.
p = Path('control-center/src/controlled-apply.css')
s = p.read_text(encoding='utf-8')
if '.controlled-preview-gate{' not in s:
    s += '''\n.controlled-preview-gate{margin-top:10px;border:1px solid rgba(224,194,116,.2);border-radius:10px;background:rgba(224,194,116,.035);padding:10px}.controlled-preview-gate-head{display:flex;align-items:center;justify-content:space-between;gap:10px}.controlled-preview-gate-head strong{font-size:10px;color:#e5cd83;letter-spacing:.08em}.controlled-preview-gate-head span{font-size:9px;color:#79d7a8}.controlled-preview-gate>p{margin:6px 0 9px;font-size:9px;line-height:1.45;color:#7f8e86}.controlled-preview-checks{display:grid;grid-template-columns:1fr 1fr;gap:6px 12px}.controlled-preview-checks label{display:flex;align-items:flex-start;gap:7px;font-size:9px;line-height:1.35;color:#c7d0cb;cursor:pointer}.controlled-preview-checks input{margin:1px 0 0;accent-color:#d7b85f}.controlled-preview-checks span{font-size:9px;color:#c7d0cb;letter-spacing:0}@media(max-width:800px){.controlled-preview-checks{grid-template-columns:1fr}}\n'''
p.write_text(s, encoding='utf-8')

# Update tests for moved engine and stricter contract.
tests_dir = Path('control-center/tests')
for test in tests_dir.glob('*.mjs'):
    text = test.read_text(encoding='utf-8')
    text = text.replace('control-center/api/create-new-product-engine.js', 'control-center/lib/create-new-product-engine.mjs')
    test.write_text(text, encoding='utf-8')
p = tests_dir / 'controlled-apply-new-product.mjs'
s = p.read_text(encoding='utf-8')
s = s.replace('moods:"clean, signature"', 'moods:"clean, signature, summer"')
s = s.replace('inspiredBy:{name:"",short:""}', 'inspiredBy:{name:"Original PlayNice creation",short:""}')
s = s.replace('dominantNotes:{sr:["bergamot"],en:["bergamot"]}', 'dominantNotes:{sr:["bergamot","mandarina","lavanda","kedar"],en:["bergamot","mandarin","lavender","cedar"]}')
s = s.replace('tags:{sr:["Test"],en:["Test"]}', 'tags:{sr:["Svež","Čist","Test"],en:["Fresh","Clean","Test"]}')
if 'compact modalName guard' not in s:
    s = s.replace('if(!renderedWithDate.includes(\'addedAt: "2026-09-03T20:00:00.000Z"\')) throw new Error("New product addedAt is not generated.");', 'if(!renderedWithDate.includes(\'addedAt: "2026-09-03T20:00:00.000Z"\')) throw new Error("New product addedAt is not generated.");\nif(!renderedWithDate.includes(\'modalName: "PlayNice Test Fragrance EDP"\')) throw new Error("New product compact modalName guard is missing.");')
p.write_text(s, encoding='utf-8')

Path('control-center/tests/product-presentation-guardrails.mjs').write_text(r'''import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");
const engineSource = fs.readFileSync(path.join(root, "control-center/lib/create-new-product-engine.mjs"), "utf8");
const engine = await import(`data:text/javascript;base64,${Buffer.from(engineSource).toString("base64")}`);
const base = {
  core: { name:"Guardrail Test Eau de Parfum", shortName:"Guardrail Test", category:"Niche", image:"/products/guardrail-test.webp", sizes:{"2ml":4,"5ml":9,"10ml":16}, badge:"PLAYNICE PICK", rating:8.5, ratingLabel:"Test Pick", season:"all", moods:"clean, summer, signature", recommendations:"afnan-9am, afnan-9pm-rebel, afnan-turathi-blue", inspiredBy:{name:"Original Guardrail creation",short:""}, noteMap:{top:"bergamot",heart:"lavender",base:"musk"} },
  copy: { miniTag:{sr:"🍋 Citrusni / Čist",en:"🍋 Citrus / Clean"}, card:{sr:"Kratak i uredan opis proizvoda.",en:"Short and balanced product copy."}, modal:{sr:"Kratak modal opis koji ostaje u standardnoj PlayNice gustini.",en:"Short modal copy that stays within the standard PlayNice density."}, scentType:{sr:"Citrusno-aromatični",en:"Citrus aromatic"}, dominantNotes:{sr:["bergamot","mandarina","lavanda","mošus"],en:["bergamot","mandarin","lavender","musk"]}, tags:{sr:["Svež","Čist","Moderan"],en:["Fresh","Clean","Modern"]}, whyChoose:{sr:"Ako želiš čist i uredan miris.",en:"If you want a clean polished scent."} },
  wear:{sr:"Topli dani, posao, svakodnevno nošenje.",en:"Warm days, work, everyday wear."}, discovery:{freshness:9,cleanliness:9,office:9}
};
const valid = engine.__test.normalizePayload(base, "guardrail-test");
const validErrors = engine.__test.validateNewProduct(valid);
if (validErrors.length) throw new Error(`Valid presentation contract blocked: ${validErrors.join(" | ")}`);
if (!engine.__test.renderProductObject(valid, 999, "2026-09-04T00:00:00.000Z").includes('modalName: "Guardrail Test EDP"')) throw new Error("Compact modalName guard is missing.");
const broken = structuredClone(base);
broken.core.badge = ""; broken.core.inspiredBy.name = ""; broken.core.moods = "clean, summer";
broken.copy.card.sr = "X".repeat(120); broken.copy.dominantNotes.sr = ["bergamot","musk"]; broken.copy.tags.en = ["Fresh","Clean"]; broken.wear.en = "Y".repeat(110);
const errors = engine.__test.validateNewProduct(engine.__test.normalizePayload(broken, "guardrail-broken"));
for (const expected of ["Presentation badge is required", "Inspired-by/original-creation name is required", "Exactly 3 moods", "copy.card.sr exceeds presentation limit", "copy.dominantNotes.sr must contain exactly 4", "copy.tags.en must contain exactly 3", "wear.en exceeds product-card presentation limit"]) {
  if (!errors.some((item) => item.includes(expected))) throw new Error(`Missing presentation guard: ${expected}`);
}
const controlled = fs.readFileSync(path.join(root, "control-center/src/ControlledApplyManager.jsx"), "utf8");
for (const token of ["VISUAL PARITY GATE", "modal-390", "modal-360", "/api/verify-product-preview"]) if (!controlled.includes(token)) throw new Error(`Controlled Apply visual gate missing: ${token}`);
const verifyApi = fs.readFileSync(path.join(root, "control-center/api/verify-product-preview.js"), "utf8");
for (const token of ["REQUIRED_CHECKS", "playnice-site", "shopReady", "headSha"]) if (!verifyApi.includes(token)) throw new Error(`Server preview gate missing: ${token}`);
for (const token of ["git/trees", "git/commits", "treeEntries"]) if (!engineSource.includes(token)) throw new Error(`Atomic one-commit product apply missing: ${token}`);
console.log("PASS  strict product-card/modal data contract blocks Tonic Vert-class layout regressions");
console.log("PASS  compact modalName is generated automatically");
console.log("PASS  preview verification requires desktop + 390px + 360px visual QA");
console.log("PASS  server verifies current Shop preview is green before marking verified");
console.log("PASS  new product is written as one atomic commit across all four data files");
''', encoding='utf-8')

# Regression workflow paths + test.
p = Path('.github/workflows/control-center-apply-regression.yml')
s = p.read_text(encoding='utf-8')
s = s.replace('      - "control-center/api/create-new-product-engine.js"\n', '      - "control-center/api/create-new-product-engine.js"\n      - "control-center/lib/create-new-product-engine.mjs"\n      - "control-center/api/verify-product-preview.js"\n      - "control-center/src/draftValidation.js"\n      - "control-center/src/controlled-apply.css"\n')
if 'product-presentation-guardrails.mjs' not in s:
    s = s.replace('          node control-center/tests/controlled-apply-new-product-structure.mjs\n', '          node control-center/tests/controlled-apply-new-product-structure.mjs\n          node control-center/tests/product-presentation-guardrails.mjs\n')
p.write_text(s, encoding='utf-8')
