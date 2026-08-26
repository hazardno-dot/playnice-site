from pathlib import Path

# App: add topbar action slots and controlled apply slot in normal flow.
app = Path('control-center/src/App.jsx')
text = app.read_text()
old = '<div className="read-only-badge">NO PUBLISH</div></header>'
new = '<div className="topbar-actions"><div id="draft-manager-trigger-slot" className="draft-manager-trigger-slot"/><div className="read-only-badge">NO PUBLISH</div></div></header><div id="controlled-apply-slot" className="controlled-apply-slot"/>'
if old not in text:
    raise SystemExit('App topbar anchor not found')
text = text.replace(old, new, 1)
app.write_text(text)

# Main: managers stay mounted, but render into App slots via portals.
main = Path('control-center/src/main.jsx')
text = main.read_text()
old = '''    <AuthGate>\n      <div className="control-center-apply-top">\n        <ControlledApplyManager />\n      </div>\n      <App />\n      <DraftManager />\n      <InlineValidationBridge />\n    </AuthGate>'''
new = '''    <AuthGate>\n      <App />\n      <DraftManager />\n      <InlineValidationBridge />\n      <ControlledApplyManager />\n    </AuthGate>'''
if old not in text:
    raise SystemExit('main layout anchor not found')
main.write_text(text.replace(old, new, 1))

# Controlled Apply: portal into slot near topbar.
cap = Path('control-center/src/ControlledApplyManager.jsx')
text = cap.read_text()
if 'createPortal' not in text:
    text = text.replace('import React, { useEffect, useMemo, useState } from "react";','import React, { useEffect, useMemo, useState } from "react";\nimport { createPortal } from "react-dom";',1)
text = text.replace('  return <div className="controlled-apply-box">','  const slot = document.getElementById("controlled-apply-slot");\n  const panel = <div className="controlled-apply-box">',1)
old_end = '  </div>;\n}'
new_end = '  </div>;\n\n  return slot ? createPortal(panel, slot) : panel;\n}'
if old_end not in text:
    raise SystemExit('ControlledApply end anchor not found')
text = text.replace(old_end,new_end,1)
cap.write_text(text)

# Draft manager: portal trigger beside NO PUBLISH, keep drawer in root.
dm = Path('control-center/src/DraftManager.jsx')
text = dm.read_text()
if 'createPortal' not in text:
    text = text.replace('import React, { useEffect, useMemo, useState } from "react";','import React, { useEffect, useMemo, useState } from "react";\nimport { createPortal } from "react-dom";',1)
old = '  return <>\n    <button className={`draft-manager-trigger ${count ? "has-drafts" : ""}`} onClick={() => { setOpen(true); load(); }}><span>Drafts</span><strong>{loading ? "…" : count}</strong></button>'
new = '  const trigger = <button className={`draft-manager-trigger ${count ? "has-drafts" : ""}`} onClick={() => { setOpen(true); load(); }}><span>Drafts</span><strong>{loading ? "…" : count}</strong></button>;\n  const triggerSlot = document.getElementById("draft-manager-trigger-slot");\n\n  return <>\n    {triggerSlot ? createPortal(trigger, triggerSlot) : trigger}'
if old not in text:
    raise SystemExit('Draft trigger anchor not found')
text = text.replace(old,new,1)
dm.write_text(text)

# Controlled Apply width matches main content exactly.
css = Path('control-center/src/controlled-apply.css')
text = css.read_text()
start = text.find('.control-center-apply-top{')
if start >= 0:
    end = text.find('.controlled-apply-box{', start)
    text = text[:start] + '.controlled-apply-slot{width:100%;margin:0 0 18px}' + text[end:]
else:
    text = '.controlled-apply-slot{width:100%;margin:0 0 18px}' + text
text = text.replace('@media(max-width:1050px){.control-center-apply-top{margin-left:102px;padding:16px 20px 0}}','@media(max-width:1050px){.controlled-apply-slot{margin-bottom:16px}}')
text = text.replace('@media(max-width:800px){.control-center-apply-top{margin-left:0;padding:14px 14px 0}', '@media(max-width:800px){.controlled-apply-slot{margin-bottom:14px}')
css.write_text(text)

# Draft trigger becomes normal-flow green/emerald action next to NO PUBLISH.
css = Path('control-center/src/draft-manager.css')
text = css.read_text()
first_end = text.find('.draft-manager-backdrop{')
if first_end < 0:
    raise SystemExit('draft-manager css anchor not found')
rest = text[first_end:]
trigger_css = '.draft-manager-trigger-slot{display:flex;align-items:center}.draft-manager-trigger{position:static;display:flex;align-items:center;gap:8px;border:1px solid rgba(73,185,129,.35);background:rgba(73,185,129,.08);color:#8fe0b5;border-radius:999px;padding:8px 11px;font-size:10px;box-shadow:none;cursor:pointer}.draft-manager-trigger strong{display:grid;place-items:center;min-width:20px;height:20px;border-radius:999px;background:rgba(73,185,129,.14);color:#b9efd2}.draft-manager-trigger.has-drafts{border-color:rgba(73,185,129,.5);color:#9ce5bd;background:rgba(73,185,129,.1)}.draft-manager-trigger.has-drafts strong{background:rgba(73,185,129,.18);color:#d2f5e1}'
text = trigger_css + rest
# Strip legacy trigger media positioning if present.
text = text.replace('@media(max-width:1050px){.draft-manager-trigger{right:126px;top:70px}}','')
text = text.replace('.draft-manager-trigger{right:14px;top:74px;bottom:auto}','')
css.write_text(text)

# Shared topbar actions.
styles = Path('control-center/src/styles.css')
text = styles.read_text()
anchor = '.topbar { display: flex; align-items: flex-end; justify-content: space-between; gap: 20px; margin-bottom: 22px; }'
if anchor not in text:
    raise SystemExit('styles topbar anchor not found')
text = text.replace(anchor, anchor + '\n.topbar-actions { display: flex; align-items: center; gap: 10px; }',1)
styles.write_text(text)
