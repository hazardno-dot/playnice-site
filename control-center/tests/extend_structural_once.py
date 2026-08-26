from pathlib import Path

# Controlled Apply engine
path = Path("control-center/api/create-apply.js")
text = path.read_text()
start = text.index("function patchSizesRaw(")
end = text.index("\nfunction patchProperty(", start)
new_block = r'''function patchSizesRaw(raw, baselineValue, draftValue) {
  const liveValue = parseJsLiteral(raw);
  const liveNormalized = normalizeSizes(liveValue);
  if (stable(liveNormalized) !== stable(baselineValue)) throw new Error(`LIVE DRIFT: main sizes are ${displayValue(liveNormalized)}, preparation baseline expected ${displayValue(baselineValue)}.`);
  const draftEntries = Object.entries(draftValue || {});
  if (!draftEntries.length) throw new Error("At least one size is required.");
  for (const [key, value] of draftEntries) {
    if (!String(key).trim()) throw new Error("Size label cannot be empty.");
    if (!Number.isFinite(Number(value)) || Number(value) <= 0) throw new Error(`Invalid price for ${key}.`);
  }
  const trimmed = raw.trim();
  const quoteMatch = trimmed.match(/[{,]\s*(["'])[^"']+\1\s*:/);
  const quote = quoteMatch?.[1] || '"';
  const separatorMatch = trimmed.match(/,([ \t]*)["']/);
  const separator = `,${separatorMatch?.[1] ?? " "}`;
  const beforeBrace = raw.slice(0, raw.indexOf("{") + 1);
  const afterBrace = raw.slice(raw.lastIndexOf("}"));
  const rendered = draftEntries.map(([key, value]) => {
    const escaped = String(key).replace(/\\/g, "\\\\").replace(new RegExp(quote, "g"), `\\${quote}`);
    return `${quote}${escaped}${quote}: ${Number(value)}`;
  }).join(separator);
  const innerLeading = /\{(\s*)/.exec(raw)?.[1] ?? " ";
  const innerTrailing = /(\s*)\}/.exec(raw)?.[1] ?? " ";
  return `${beforeBrace}${innerLeading}${rendered}${innerTrailing}${afterBrace}`;
}

function patchFlexibleStringArrayRaw(raw, baselineValue, draftValue, label) {
  const liveValue = parseJsLiteral(raw);
  const liveNormalized = normalizeCsv(liveValue);
  const baselineNormalized = normalizeCsv(baselineValue);
  const draftNormalized = normalizeCsv(draftValue);
  if (stable(liveNormalized) !== stable(baselineNormalized)) throw new Error(`LIVE DRIFT: ${label} changed after preparation.`);
  if (!draftNormalized.length) throw new Error(`${label} cannot be empty.`);
  const quoteMatch = raw.match(/(["'])[^"']*\1/);
  const quote = quoteMatch?.[1] || '"';
  const separatorMatch = raw.match(/,([ \t]*)["']/);
  const separator = `,${separatorMatch?.[1] ?? " "}`;
  const leading = raw.match(/^\s*/)?.[0] || "";
  const trailing = raw.match(/\s*$/)?.[0] || "";
  const rendered = draftNormalized.map((value) => {
    const escaped = String(value).replace(/\\/g, "\\\\").replace(new RegExp(quote, "g"), `\\${quote}`);
    return `${quote}${escaped}${quote}`;
  }).join(separator);
  return `${leading}[${rendered}]${trailing}`;
}
'''
text = text[:start] + new_block + text[end:]
old = 'child = child.slice(0, range.start) + patchStringArrayRaw(raw, before, after, `noteMap.${field}`) + child.slice(range.end);'
assert old in text
text = text.replace(old, 'child = child.slice(0, range.start) + patchFlexibleStringArrayRaw(raw, before, after, `noteMap.${field}`) + child.slice(range.end);')
text = text.replace('controlled apply v2.5.', 'controlled apply v2.6.')
text = text.replace('version: "2.5"', 'version: "2.6"')
path.write_text(text)

# Product editor: allow size add/remove
path = Path("control-center/src/App.jsx")
text = path.read_text()
old = '  const setSize=(key,val)=>setDraft((d)=>({...d,core:{...d.core,sizes:{...d.core.sizes,[key]:val}}}));'
assert old in text
text = text.replace(old, old + '\n  const removeSize=(key)=>setDraft((d)=>{const sizes={...d.core.sizes};delete sizes[key];return {...d,core:{...d.core,sizes}}});\n  const addSize=()=>{const key=window.prompt("Size label (for example 2ml)");if(!key)return;const price=window.prompt(`Price for ${key}`);if(price==null||price==="")return;setSize(key.trim(),price);};')
old = '<section className="edit-section"><div className="section-heading"><span>COMMERCE</span><h3>Sizes & prices</h3></div><div className="edit-grid compact">{Object.entries(core.sizes||{}).map(([s,p])=><Field key={s} label={s} type="number" step="0.5" value={p} onChange={(v)=>setSize(s,v)}/>)}</div></section>'
assert old in text
text = text.replace(old, '<section className="edit-section"><div className="section-heading"><span>COMMERCE</span><h3>Sizes & prices</h3></div><div className="edit-grid compact">{Object.entries(core.sizes||{}).map(([s,p])=><div key={s} className="size-edit-row"><Field label={s} type="number" step="0.5" value={p} onChange={(v)=>setSize(s,v)}/><button type="button" className="secondary-btn" onClick={()=>removeSize(s)}>Remove</button></div>)}</div><div className="editor-actions"><button type="button" className="secondary-btn" onClick={addSize}>+ Add size</button></div></section>')
path.write_text(text)

# Regression suite expectations
path = Path("control-center/tests/controlled-apply-regression.mjs")
text = path.read_text()
old_helpers = 'normalizeCsv, normalizeSizes, stable, findProductBlock, findNamedObjectBlock, findChildObjectBlock, locatePropertyValue, parseJsLiteral, patchStringArrayRaw, patchProperty, noteMapChangesBetween, patchNoteMap, recommendationsChangeBetween, patchRecommendations, patchWearBlock, patchCopyBlock, patchDiscoveryBlock'
assert old_helpers in text
text = text.replace(old_helpers, old_helpers.replace('patchStringArrayRaw, patchProperty', 'patchStringArrayRaw, patchFlexibleStringArrayRaw, patchProperty'))
old = '''check("note map slot-count guard blocks structural edits", () => {
  const draft = structuredClone(noteBaseline);
  draft.top.push("extra-note");
  expectThrow(() => h.patchNoteMap(catalogBlock, noteBaseline, draft), "cannot add or remove slots");
});'''
assert old in text
text = text.replace(old, '''check("note map supports structural add/remove", () => {
  const draft = structuredClone(noteBaseline);
  draft.top = [...draft.top, "bergamot"];
  draft.base = draft.base.slice(0, -1);
  const next = h.patchNoteMap(catalogBlock, noteBaseline, draft);
  const child = h.findChildObjectBlock(next, "noteMap").block;
  assert(JSON.stringify(h.normalizeCsv(readProp(child, "top"))) === JSON.stringify(draft.top), "Top-note addition failed.");
  assert(JSON.stringify(h.normalizeCsv(readProp(child, "base"))) === JSON.stringify(draft.base), "Base-note removal failed.");
});''')
anchor = '''check("size price patches only requested size", () => {
  const liveSizes = h.normalizeSizes(readProp(catalogBlock, "sizes"));
  const key = Object.keys(liveSizes)[0];
  const draft = { ...liveSizes, [key]: Number(liveSizes[key]) + 0.5 };
  const next = h.patchProperty(catalogBlock, "sizes", liveSizes, draft);
  const nextSizes = h.normalizeSizes(readProp(next, "sizes"));
  assert(nextSizes[key] === draft[key], "Requested price did not update.");
  for (const other of Object.keys(liveSizes).filter((k) => k !== key)) assert(nextSizes[other] === liveSizes[other], `${other} changed unexpectedly.`);
});'''
assert anchor in text
text = text.replace(anchor, anchor + '''\n\ncheck("sizes support structural add/remove", () => {
  const liveSizes = h.normalizeSizes(readProp(catalogBlock, "sizes"));
  const entries = Object.entries(liveSizes);
  const removedKey = entries[0][0];
  const draft = Object.fromEntries(entries.slice(1));
  draft["2ml"] = 2.5;
  const next = h.patchProperty(catalogBlock, "sizes", liveSizes, draft);
  const nextSizes = h.normalizeSizes(readProp(next, "sizes"));
  assert(!(removedKey in nextSizes), "Removed size is still present.");
  assert(nextSizes["2ml"] === 2.5, "Added size is missing.");
});''')
path.write_text(text)
