from pathlib import Path

api=Path('control-center/api/create-new-product.js')
text=api.read_text()
old='''function insertProduct(source, p) {\n  assertUnique(source,p);\n  const end = source.lastIndexOf("\\n];");\n  if (end < 0) throw new Error("Could not locate products array ending.");\n  const before = source.slice(0,end).replace(/\\s+$/,"");\n  return `${before},\\n${renderProductObject(p,nextProductId(source))}\\n${source.slice(end)}`;\n}'''
new='''function appendRendered(before, rendered) {\n  const trimmed = before.replace(/\\s+$/, "");\n  const separator = trimmed.endsWith(",") ? "\\n" : ",\\n";\n  return `${trimmed}${separator}${rendered}`;\n}\nfunction insertProduct(source, p) {\n  assertUnique(source,p);\n  const end = source.lastIndexOf("\\n];");\n  if (end < 0) throw new Error("Could not locate products array ending.");\n  const before = source.slice(0,end);\n  return `${appendRendered(before, renderProductObject(p,nextProductId(source)))}\\n${source.slice(end)}`;\n}'''
assert old in text, 'insertProduct block missing'
text=text.replace(old,new)
old='''function insertObjectEntry(source, rendered, label) {\n  const exportEnd = source.lastIndexOf("\\n};");\n  if (exportEnd < 0) throw new Error(`Could not locate ${label} object ending.`);\n  const before=source.slice(0,exportEnd).replace(/\\s+$/,"");\n  return `${before},\\n\\n${rendered}\\n${source.slice(exportEnd)}`;\n}'''
new='''function insertObjectEntry(source, rendered, label, exportName = null) {\n  let exportEnd;\n  if (exportName) {\n    const marker = `export const ${exportName} = {`;\n    const start = source.indexOf(marker);\n    if (start < 0) throw new Error(`Could not locate ${label} export ${exportName}.`);\n    exportEnd = source.indexOf("\\n};", start);\n  } else {\n    exportEnd = source.lastIndexOf("\\n};");\n  }\n  if (exportEnd < 0) throw new Error(`Could not locate ${label} object ending.`);\n  const before = source.slice(0,exportEnd);\n  const after = source.slice(exportEnd);\n  return `${appendRendered(before, rendered)}\\n${after}`;\n}'''
assert old in text, 'insertObjectEntry block missing'
text=text.replace(old,new)
text=text.replace('["src/data/products/productCopy.js",(s)=>insertObjectEntry(s,renderCopy(p),"Product Copy")],','["src/data/products/productCopy.js",(s)=>insertObjectEntry(s,renderCopy(p),"Product Copy","productCopy")],')
text=text.replace('["src/data/products/productWearContext.js",(s)=>insertObjectEntry(s,renderWear(p),"Wear Context")],','["src/data/products/productWearContext.js",(s)=>insertObjectEntry(s,renderWear(p),"Wear Context","productWearContext")],')
text=text.replace('["src/data/products/discoveryProfiles.js",(s)=>insertObjectEntry(s,renderDiscovery(p),"Discovery Profiles")],','["src/data/products/discoveryProfiles.js",(s)=>insertObjectEntry(s,renderDiscovery(p),"Discovery Profiles","discoveryProfiles")],')
api.write_text(text)

test=Path('control-center/tests/controlled-apply-new-product.mjs')
t=test.read_text()
t=t.replace('[files.copy,__test.renderCopy(p),"Product Copy",p.core.name],','[files.copy,__test.renderCopy(p),"Product Copy",p.core.name,"productCopy"],')
t=t.replace('[files.wear,__test.renderWear(p),"Wear Context",p.core.name],','[files.wear,__test.renderWear(p),"Wear Context",p.core.name,"productWearContext"],')
t=t.replace('[files.discovery,__test.renderDiscovery(p),"Discovery Profiles",p.slug],','[files.discovery,__test.renderDiscovery(p),"Discovery Profiles",p.slug,"discoveryProfiles"],')
t=t.replace('for(const [source,render,label,key] of [','for(const [source,render,label,key,exportName] of [')
t=t.replace('const next=__test.insertObjectEntry(source,render,label);','const next=__test.insertObjectEntry(source,render,label,exportName);\n  if(next.includes("},,")) throw new Error(`${label} insertion produced a double comma.`);')
t=t.replace('if(!nextIndex.includes(`id: ${expected},`)) throw new Error("New product id is not max+1.");','if(!nextIndex.includes(`id: ${expected},`)) throw new Error("New product id is not max+1.");\nif(nextIndex.includes("},,")) throw new Error("Catalog insertion produced a double comma.");')
t=t.replace('let duplicate=false;','const copyNext=__test.insertObjectEntry(files.copy,__test.renderCopy(p),"Product Copy","productCopy");\nconst fallbackPos=copyNext.indexOf("export const fallbackCopy");\nconst newKeyPos=copyNext.indexOf(JSON.stringify(p.core.name));\nif(fallbackPos >= 0 && newKeyPos > fallbackPos) throw new Error("Product Copy entry was inserted into fallbackCopy instead of productCopy.");\nlet duplicate=false;')
t=t.replace('console.log("PASS  Copy, Wear and Discovery entries render and insert");','console.log("PASS  Copy, Wear and Discovery entries render and insert into correct exports");\nconsole.log("PASS  insertion never creates double commas");')
test.write_text(t)
