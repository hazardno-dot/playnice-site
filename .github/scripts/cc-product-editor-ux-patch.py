from pathlib import Path

root = Path('.')
app_path = root / 'control-center/src/App.jsx'
validation_path = root / 'control-center/src/InlineValidationBridge.jsx'
validation_css_path = root / 'control-center/src/inline-validation.css'
editor_css_path = root / 'control-center/src/editor.css'

app = app_path.read_text(encoding='utf-8')
validation = validation_path.read_text(encoding='utf-8')
validation_css = validation_css_path.read_text(encoding='utf-8')
editor_css = editor_css_path.read_text(encoding='utf-8')

old_blank = 'core:{name:"",shortName:"",category:"Arabian",image:"/products/",badge:"NEW",rating:"",ratingLabel:"New",season:"all",moods:"",inspiredBy:{name:"",short:""},sizes:{},noteMap:{top:"",heart:"",base:""},recommendations:""},'
new_blank = 'core:{name:"",shortName:"",category:"Arabian",image:"/products/",badge:"",rating:"",ratingLabel:"",season:"all",moods:"",inspiredBy:{name:"",short:""},sizes:{},noteMap:{top:"",heart:"",base:""},recommendations:""},'
if old_blank not in app:
    raise SystemExit('blank draft defaults pattern not found')
app = app.replace(old_blank, new_blank, 1)

old_fields = 'function Field({label,value,onChange,type="text",step}){return <label className="edit-field"><span>{label}</span><input type={type} step={step} value={value??""} onChange={(e)=>onChange(e.target.value)}/></label>}\nfunction TextField'
new_fields = '''function Field({label,value,onChange,type="text",step}){return <label className="edit-field"><span>{label}</span><input type={type} step={step} value={value??""} onChange={(e)=>onChange(e.target.value)}/></label>}\nfunction SelectField({label,value,onChange,options=[]}){return <label className="edit-field"><span>{label}</span><select value={value??""} onChange={(e)=>onChange(e.target.value)}>{options.map((option)=>{const item=typeof option==="string"?{value:option,label:option}:option;return <option key={item.value} value={item.value}>{item.label}</option>})}</select></label>}\nfunction TextField'''
if old_fields not in app:
    raise SystemExit('Field component pattern not found')
app = app.replace(old_fields, new_fields, 1)

old_core = '<Field label="Category" value={core.category} onChange={(v)=>setCore("category",v)}/><Field label="Image path" value={core.image} onChange={(v)=>setCore("image",v)}/><Field label="Inspired by · name" value={core.inspiredBy?.name||""} onChange={(v)=>setInspired("name",v)}/><Field label="Inspired by · short" value={core.inspiredBy?.short||""} onChange={(v)=>setInspired("short",v)}/><Field label="Badge" value={core.badge} onChange={(v)=>setCore("badge",v)}/><Field label="Rating" type="number" step="0.1" value={core.rating} onChange={(v)=>setCore("rating",v)}/><Field label="Rating label" value={core.ratingLabel} onChange={(v)=>setCore("ratingLabel",v)}/><Field label="Season" value={core.season} onChange={(v)=>setCore("season",v)}/><Field label="Moods · comma separated" value={core.moods} onChange={(v)=>setCore("moods",v)}/>'
new_core = '<SelectField label="Category" value={core.category} onChange={(v)=>setCore("category",v)} options={["Arabian","Designer","Niche"]}/><Field label="Image path" value={core.image} onChange={(v)=>setCore("image",v)}/><Field label="Inspired by · name" value={core.inspiredBy?.name||""} onChange={(v)=>setInspired("name",v)}/><Field label="Inspired by · short" value={core.inspiredBy?.short||""} onChange={(v)=>setInspired("short",v)}/><Field label="Badge · optional" value={core.badge} onChange={(v)=>setCore("badge",v)}/><Field label="Rating" type="number" step="0.1" value={core.rating} onChange={(v)=>setCore("rating",v)}/><Field label="Rating label" value={core.ratingLabel} onChange={(v)=>setCore("ratingLabel",v)}/><SelectField label="Season" value={core.season} onChange={(v)=>setCore("season",v)} options={[{value:"all",label:"All seasons"},{value:"summer",label:"Summer"},{value:"winter",label:"Winter"}]}/><Field label="Moods · comma separated" value={core.moods} onChange={(v)=>setCore("moods",v)}/>'
if old_core not in app:
    raise SystemExit('core editor pattern not found')
app = app.replace(old_core, new_core, 1)

old_status = '<strong>{errors.length ? `BLOCKED · ${errors.length}` : "VISIBLE CHECKS PASS"}</strong>'
new_status = '<strong>{errors.length ? `${errors.length} FIELDS REMAINING` : "VISIBLE CHECKS PASS"}</strong>'
if old_status not in validation:
    raise SystemExit('validation status pattern not found')
validation = validation.replace(old_status, new_status, 1)
validation = validation.replace('errors.slice(0, 3)', 'errors.slice(0, 2)', 1)
validation = validation.replace('errors.length > 3 ? <small>+ {errors.length - 3} more</small> : null', 'errors.length > 2 ? <small>+ {errors.length - 2} more</small> : null', 1)

validation_css = '''.inline-validation-floating{position:fixed;left:270px;right:auto;top:auto;bottom:18px;z-index:60;width:min(320px,calc(100vw - 300px));border:1px solid rgba(255,255,255,.09);background:rgba(7,16,11,.97);border-radius:14px;padding:12px 13px;box-shadow:0 18px 50px rgba(0,0,0,.34);backdrop-filter:blur(12px)}.inline-validation-floating.ready{border-color:rgba(73,185,129,.28)}.inline-validation-floating.blocked{border-color:rgba(216,93,93,.28)}.inline-validation-floating-head{display:flex;align-items:center;justify-content:space-between;gap:12px}.inline-validation-floating-head span{font-size:9px;letter-spacing:.14em;color:#718078}.inline-validation-floating-head strong{font-size:9px;letter-spacing:.08em;color:#7fd6a8}.inline-validation-floating.blocked .inline-validation-floating-head strong{color:#d5a0a0}.inline-validation-floating p{margin:8px 0 4px;color:#9eb0a6;font-size:10px}.inline-validation-floating>small{display:block;margin-top:7px;color:#68766e;font-size:8px;line-height:1.35}.inline-validation-floating-issues{display:grid;gap:6px;margin-top:8px}.inline-validation-floating-issues>div{display:grid;gap:2px;padding:7px 8px;border:1px solid rgba(216,93,93,.14);background:rgba(216,93,93,.03);border-radius:8px}.inline-validation-floating-issues strong{font-size:9px;color:#e0b1b1}.inline-validation-floating-issues span{font-size:9px;color:#9d8989}.inline-validation-floating-issues small{color:#846f6f;font-size:8px}.edit-field.inline-field-error>span{color:#e1a2a2}.edit-field.inline-field-error input,.edit-field.inline-field-error textarea,.edit-field.inline-field-error select{border-color:rgba(216,93,93,.52)!important;box-shadow:0 0 0 3px rgba(216,93,93,.07)!important}.edit-field.inline-field-warning>span{color:#dbc985}.edit-field.inline-field-warning input,.edit-field.inline-field-warning textarea,.edit-field.inline-field-warning select{border-color:rgba(224,194,116,.45)!important}@media(max-width:1100px){.inline-validation-floating{left:18px;width:min(300px,calc(100vw - 36px))}}@media(max-width:720px){.inline-validation-floating{left:12px;right:12px;bottom:64px;width:auto}}\n'''

old_controls = '.edit-field input,.edit-field textarea{width:100%;border:1px solid rgba(255,255,255,.09);background:#09100c;color:#f4f3ed;border-radius:9px;padding:10px 11px;outline:none}'
new_controls = '.edit-field input,.edit-field textarea,.edit-field select{width:100%;border:1px solid rgba(255,255,255,.09);background:#09100c;color:#f4f3ed;border-radius:9px;padding:10px 11px;outline:none}.edit-field select{appearance:auto;cursor:pointer;color-scheme:dark}'
if old_controls not in editor_css:
    raise SystemExit('editor controls pattern not found')
editor_css = editor_css.replace(old_controls, new_controls, 1)
old_focus = '.edit-field input:focus,.edit-field textarea:focus{border-color:rgba(73,185,129,.55);box-shadow:0 0 0 3px rgba(73,185,129,.07)}'
new_focus = '.edit-field input:focus,.edit-field textarea:focus,.edit-field select:focus{border-color:rgba(73,185,129,.55);box-shadow:0 0 0 3px rgba(73,185,129,.07)}'
if old_focus not in editor_css:
    raise SystemExit('editor focus pattern not found')
editor_css = editor_css.replace(old_focus, new_focus, 1)

app_path.write_text(app, encoding='utf-8')
validation_path.write_text(validation, encoding='utf-8')
validation_css_path.write_text(validation_css, encoding='utf-8')
editor_css_path.write_text(editor_css, encoding='utf-8')

print('PASS category dropdown')
print('PASS season dropdown')
print('PASS blank NEW defaults removed')
print('PASS validation moved lower-left and compacted')
