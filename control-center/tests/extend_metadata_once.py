from pathlib import Path

path = Path("control-center/src/App.jsx")
text = path.read_text()
old = 'core:{name:product.name||"",shortName:product.shortName||"",category:product.category||"",badge:product.badge||"",rating:product.rating??"",ratingLabel:product.ratingLabel||"",season:product.season||"",moods:(product.moods||[]).join(", "),sizes:{...(product.sizes||{})},noteMap:{top:(product.noteMap?.top||[]).join(", "),heart:(product.noteMap?.heart||[]).join(", "),base:(product.noteMap?.base||[]).join(", ")},recommendations:(product.recommendations||[]).join(", ")},'
new = 'core:{name:product.name||"",shortName:product.shortName||"",category:product.category||"",image:product.image||"",badge:product.badge||"",rating:product.rating??"",ratingLabel:product.ratingLabel||"",season:product.season||"",moods:(product.moods||[]).join(", "),inspiredBy:{name:product.inspiredBy?.name||"",short:product.inspiredBy?.short||""},sizes:{...(product.sizes||{})},noteMap:{top:(product.noteMap?.top||[]).join(", "),heart:(product.noteMap?.heart||[]).join(", "),base:(product.noteMap?.base||[]).join(", ")},recommendations:(product.recommendations||[]).join(", ")},'
assert old in text
text = text.replace(old, new)
old = 'const setNote=(key,val)=>setDraft((d)=>({...d,core:{...d.core,noteMap:{...d.core.noteMap,[key]:val}}}));'
assert old in text
text = text.replace(old, old + '\n  const setInspired=(key,val)=>setDraft((d)=>({...d,core:{...d.core,inspiredBy:{...d.core.inspiredBy,[key]:val}}}));')
old = '<Field label="Category" value={core.category} onChange={(v)=>setCore("category",v)}/><Field label="Badge"'
assert old in text
text = text.replace(old, '<Field label="Category" value={core.category} onChange={(v)=>setCore("category",v)}/><Field label="Image path" value={core.image} onChange={(v)=>setCore("image",v)}/><Field label="Inspired by · name" value={core.inspiredBy?.name||""} onChange={(v)=>setInspired("name",v)}/><Field label="Inspired by · short" value={core.inspiredBy?.short||""} onChange={(v)=>setInspired("short",v)}/><Field label="Badge"')
path.write_text(text)

path = Path("control-center/src/DraftManager.jsx")
text = path.read_text()
old = 'pushChange(changes, "Core", "Category", live.category, core.category);\n  pushChange(changes, "Core", "Badge", live.badge, core.badge);'
assert old in text
text = text.replace(old, 'pushChange(changes, "Core", "Category", live.category, core.category);\n  pushChange(changes, "Core", "Image path", live.image, core.image);\n  pushChange(changes, "Core", "Inspired by · name", live.inspiredBy?.name || "", core.inspiredBy?.name || "");\n  pushChange(changes, "Core", "Inspired by · short", live.inspiredBy?.short || "", core.inspiredBy?.short || "");\n  pushChange(changes, "Core", "Badge", live.badge, core.badge);')
path.write_text(text)

path = Path("control-center/src/prepublish.js")
text = path.read_text()
old = 'category: product.category || "",\n      badge: product.badge || "",'
assert old in text
text = text.replace(old, 'category: product.category || "",\n      image: product.image || "",\n      inspiredBy: { name: product.inspiredBy?.name || "", short: product.inspiredBy?.short || "" },\n      badge: product.badge || "",')
path.write_text(text)

path = Path("control-center/src/draftValidation.js")
text = path.read_text()
old = '[["Name", core.name], ["Short name", core.shortName], ["Category", core.category], ["Season", core.season], ["Rating label", core.ratingLabel]].forEach(([field, value]) => {'
assert old in text
text = text.replace(old, '[["Name", core.name], ["Short name", core.shortName], ["Category", core.category], ["Image path", core.image], ["Season", core.season], ["Rating label", core.ratingLabel]].forEach(([field, value]) => {')
anchor = 'if (!csv(core.moods).length) issues.push(issue("error", "Core", "Moods", "At least one mood is required."));'
assert anchor in text
text = text.replace(anchor, anchor + '\n\n  if (!String(core.image || "").startsWith("/products/")) issues.push(issue("warning", "Core", "Image path", "Product images normally live under /products/."));\n  if (core.inspiredBy && (!empty(core.inspiredBy.name) || !empty(core.inspiredBy.short)) && (empty(core.inspiredBy.name) || empty(core.inspiredBy.short))) issues.push(issue("warning", "Core", "Inspired by", "Use both inspired-by name and short label, or leave both empty."));')
path.write_text(text)

path = Path("control-center/api/create-apply.js")
text = path.read_text()
text = text.replace('const supportedFields = ["category", "rating", "ratingLabel", "badge", "season", "moods", "sizes"];', 'const supportedFields = ["category", "image", "rating", "ratingLabel", "badge", "season", "moods", "sizes"];')
marker = 'function recommendationsChangeBetween(baselineCore = {}, approvedCore = {}) {'
assert marker in text
helper = '''function inspiredByChangesBetween(baselineCore = {}, approvedCore = {}) {
  const changes = [];
  for (const field of ["name", "short"]) {
    const live = String(baselineCore?.inspiredBy?.[field] ?? "");
    const next = String(approvedCore?.inspiredBy?.[field] ?? "");
    if (live !== next) changes.push({ section: "Inspired By", field, live, next });
  }
  return changes;
}

function patchInspiredBy(block, baselineValue = {}, approvedValue = {}) {
  const located = findChildObjectBlock(block, "inspiredBy");
  let child = located.block;
  for (const field of ["name", "short"]) {
    const before = String(baselineValue?.[field] ?? "");
    const after = String(approvedValue?.[field] ?? "");
    if (before === after) continue;
    const range = locatePropertyValue(child, field);
    const live = String(parseJsLiteral(child.slice(range.start, range.end)) ?? "");
    if (live !== before) throw new Error(`LIVE DRIFT: inspiredBy.${field} changed after preparation.`);
    child = child.slice(0, range.start) + JSON.stringify(after) + child.slice(range.end);
  }
  return block.slice(0, located.start) + child + block.slice(located.end);
}

'''
text = text.replace(marker, helper + marker)
old = 'const recommendationChanges = recommendationsChangeBetween(baselineCore, approvedCore);'
assert old in text
text = text.replace(old, old + '\n    const inspiredByChanges = inspiredByChangesBetween(baselineCore, approvedCore);')
old = 'const changes = [...coreChanges, ...noteMapChanges, ...recommendationChanges, ...wearChanges, ...copyChanges, ...discoveryChanges];'
assert old in text
text = text.replace(old, 'const changes = [...coreChanges, ...inspiredByChanges, ...noteMapChanges, ...recommendationChanges, ...wearChanges, ...copyChanges, ...discoveryChanges];')
old = 'if (coreChanges.length || noteMapChanges.length || recommendationChanges.length) {'
assert old in text
text = text.replace(old, 'if (coreChanges.length || inspiredByChanges.length || noteMapChanges.length || recommendationChanges.length) {')
old = 'for (const change of coreChanges) nextBlock = patchProperty(nextBlock, change.field, change.live, change.next);\n      if (noteMapChanges.length)'
assert old in text
text = text.replace(old, 'for (const change of coreChanges) nextBlock = patchProperty(nextBlock, change.field, change.live, change.next);\n      if (inspiredByChanges.length) nextBlock = patchInspiredBy(nextBlock, baselineCore.inspiredBy || {}, approvedCore.inspiredBy || {});\n      if (noteMapChanges.length)')
old = '...coreChanges.map((c) => c.field),\n        ...noteMapChanges.map((c) => `noteMap.${c.field}`),'
assert old in text
text = text.replace(old, '...coreChanges.map((c) => c.field),\n        ...inspiredByChanges.map((c) => `inspiredBy.${c.field}`),\n        ...noteMapChanges.map((c) => `noteMap.${c.field}`),')
text = text.replace('controlled apply v2.4.', 'controlled apply v2.5.')
text = text.replace('version: "2.4"', 'version: "2.5"')
path.write_text(text)
