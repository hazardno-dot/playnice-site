from pathlib import Path

# 1) Fix create-new-product insertion targets and separators.
path = Path('control-center/api/create-new-product.js')
text = path.read_text()
old = '''function insertProduct(source, p) {\n  assertUnique(source,p);\n  const end = source.lastIndexOf("\\n];");\n  if (end < 0) throw new Error("Could not locate products array ending.");\n  const before = source.slice(0,end).replace(/\\s+$/,"");\n  return `${before},\\n${renderProductObject(p,nextProductId(source))}\\n${source.slice(end)}`;\n}'''
new = '''function appendSeparator(before) {\n  return /,\\s*$/.test(before) ? "" : ",";\n}\nfunction insertProduct(source, p) {\n  assertUnique(source,p);\n  const end = source.lastIndexOf("\\n];");\n  if (end < 0) throw new Error("Could not locate products array ending.");\n  const before = source.slice(0,end).replace(/\\s+$/,"");\n  return `${before}${appendSeparator(before)}\\n${renderProductObject(p,nextProductId(source))}\\n${source.slice(end)}`;\n}'''
assert old in text, 'insertProduct anchor not found'
text = text.replace(old, new)
old = '''function insertObjectEntry(source, rendered, label) {\n  const exportEnd = source.lastIndexOf("\\n};");\n  if (exportEnd < 0) throw new Error(`Could not locate ${label} object ending.`);\n  const before=source.slice(0,exportEnd).replace(/\\s+$/,"");\n  return `${before},\\n\\n${rendered}\\n${source.slice(exportEnd)}`;\n}'''
new = '''function findExportObjectEnd(source, exportName) {\n  const start = source.indexOf(`export const ${exportName} = {`);\n  if (start < 0) throw new Error(`Could not locate export ${exportName}.`);\n  let depth = 0, quote = null, escaped = false;\n  for (let i = source.indexOf("{", start); i < source.length; i += 1) {\n    const ch = source[i];\n    if (quote) {\n      if (escaped) escaped = false;\n      else if (ch === "\\\\") escaped = true;\n      else if (ch === quote) quote = null;\n      continue;\n    }\n    if (ch === '"' || ch === "'" || ch === '`') { quote = ch; continue; }\n    if (ch === "{") depth += 1;\n    else if (ch === "}") {\n      depth -= 1;\n      if (depth === 0) return i;\n    }\n  }\n  throw new Error(`Could not locate end of export ${exportName}.`);\n}\nfunction insertObjectEntry(source, rendered, label, exportName) {\n  const exportEnd = findExportObjectEnd(source, exportName);\n  const before = source.slice(0,exportEnd).replace(/\\s+$/,"");\n  const after = source.slice(exportEnd);\n  return `${before}${appendSeparator(before)}\\n\\n${rendered}\\n${after}`;\n}'''
assert old in text, 'insertObjectEntry anchor not found'
text = text.replace(old, new)
text = text.replace('["src/data/products/productCopy.js",(s)=>insertObjectEntry(s,renderCopy(p),"Product Copy")],','["src/data/products/productCopy.js",(s)=>insertObjectEntry(s,renderCopy(p),"Product Copy","productCopy")],')
text = text.replace('["src/data/products/productWearContext.js",(s)=>insertObjectEntry(s,renderWear(p),"Wear Context")],','["src/data/products/productWearContext.js",(s)=>insertObjectEntry(s,renderWear(p),"Wear Context","productWearContext")],')
text = text.replace('["src/data/products/discoveryProfiles.js",(s)=>insertObjectEntry(s,renderDiscovery(p),"Discovery Profiles")],','["src/data/products/discoveryProfiles.js",(s)=>insertObjectEntry(s,renderDiscovery(p),"Discovery Profiles","discoveryProfiles")],')
text = text.replace('export const __test = { normalizePayload, validateNewProduct, nextProductId, renderProductObject, insertProduct, insertObjectEntry, renderCopy, renderWear, renderDiscovery };','export const __test = { normalizePayload, validateNewProduct, nextProductId, renderProductObject, insertProduct, insertObjectEntry, renderCopy, renderWear, renderDiscovery, findExportObjectEnd, appendSeparator };')
path.write_text(text)

# 2) Update regression to enforce correct export and no double commas.
path = Path('control-center/tests/controlled-apply-new-product.mjs')
text = path.read_text()
text = text.replace('[files.copy,__test.renderCopy(p),"Product Copy",p.core.name],\n  [files.wear,__test.renderWear(p),"Wear Context",p.core.name],\n  [files.discovery,__test.renderDiscovery(p),"Discovery Profiles",p.slug],','[files.copy,__test.renderCopy(p),"Product Copy",p.core.name,"productCopy"],\n  [files.wear,__test.renderWear(p),"Wear Context",p.core.name,"productWearContext"],\n  [files.discovery,__test.renderDiscovery(p),"Discovery Profiles",p.slug,"discoveryProfiles"],')
text = text.replace('for(const [source,render,label,key] of [','for(const [source,render,label,key,exportName] of [')
text = text.replace('  const next=__test.insertObjectEntry(source,render,label);','  const next=__test.insertObjectEntry(source,render,label,exportName);')
needle = 'if(!nextIndex.includes(`id: ${expected},`)) throw new Error("New product id is not max+1.");\n'
assert needle in text
text = text.replace(needle, needle + 'if(nextIndex.includes("},,")) throw new Error("Catalog insertion created a double comma.");\n')
needle = '  if(!next.includes(JSON.stringify(key))) throw new Error(`${label} key missing after insert.`);\n'
assert needle in text
text = text.replace(needle, needle + '  if(next.includes("},,")) throw new Error(`${label} insertion created a double comma.`);\n  const exportStart=next.indexOf(`export const ${exportName} = {`); const keyPos=next.indexOf(JSON.stringify(key)); const exportEnd=__test.findExportObjectEnd(next,exportName); if(!(keyPos>exportStart&&keyPos<exportEnd)) throw new Error(`${label} inserted outside ${exportName}.`);\n')
path.write_text(text)

# 3) Put Controlled Apply in a portal slot inside main-stage, near the top.
path = Path('control-center/src/App.jsx')
text = path.read_text()
anchor = '<main className="main-stage"><header className="topbar"><div><span className="eyebrow">PLAYNICE / INTERNAL</span><h1>{active}</h1></div><div className="read-only-badge">NO PUBLISH</div></header>'
assert anchor in text, 'App main-stage anchor not found'
text = text.replace(anchor, anchor + '<div id="controlled-apply-slot" className="controlled-apply-slot"/>', 1)
path.write_text(text)

path = Path('control-center/src/ControlledApplyManager.jsx')
text = path.read_text()
text = text.replace('import React, { useEffect, useMemo, useState } from "react";','import React, { useEffect, useMemo, useState } from "react";\nimport { createPortal } from "react-dom";')
old = '  return <div className="controlled-apply-box">'
new = '  const slot = document.getElementById("controlled-apply-slot");\n  const panel = <div className="controlled-apply-box">'
assert old in text, 'ControlledApply return anchor not found'
text = text.replace(old,new,1)
old_end = '  </div>;\n}'
new_end = '  </div>;\n\n  return slot ? createPortal(panel, slot) : panel;\n}'
assert old_end in text, 'ControlledApply end anchor not found'
text = text.replace(old_end,new_end,1)
path.write_text(text)

# 4) Layout CSS: normal flow inside main-stage, no sidebar offset and no overlay.
path = Path('control-center/src/controlled-apply.css')
text = path.read_text()
start = text.index('.controlled-apply-box{')
end = text.index('}.controlled-apply-head', start) + 1
text = text[:start] + '.controlled-apply-slot{margin:0 0 18px}.controlled-apply-box{position:static;margin:0;border:1px solid rgba(224,194,116,.22);background:rgba(5,12,8,.96);border-radius:14px;padding:12px 14px;box-shadow:0 12px 28px rgba(0,0,0,.18)}' + text[end:]
text = text.replace('@media(max-width:1050px){.controlled-apply-box{margin:22px 20px 24px 102px}}','@media(max-width:1050px){.controlled-apply-slot{margin-bottom:16px}}')
text = text.replace('@media(max-width:800px){.controlled-apply-box{margin:18px 14px 22px}', '@media(max-width:800px){.controlled-apply-slot{margin-bottom:14px}.controlled-apply-box{margin:0')
path.write_text(text)
