import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,"../..");
const engineSource=fs.readFileSync(path.join(root,"control-center/api/create-new-product-engine.js"),"utf8");
const engineModule=await import(`data:text/javascript;base64,${Buffer.from(engineSource,"utf8").toString("base64")}`);
const { __test }=engineModule;
const read=(p)=>fs.readFileSync(path.join(root,p),"utf8");
const files={
  index:read("playnice-site/src/data/products/index.js"),
  copy:read("playnice-site/src/data/products/productCopy.js"),
  wear:read("playnice-site/src/data/products/productWearContext.js"),
  discovery:read("playnice-site/src/data/products/discoveryProfiles.js"),
};
const payload={
  core:{name:"PlayNice Test Fragrance Eau de Parfum",shortName:"PN Test",category:"Niche",image:"/products/playnice-test.png",sizes:{"2ml":4,"5ml":9},badge:"NEW",rating:8.4,ratingLabel:"Test Pick",season:"all",moods:"clean, signature",recommendations:"afnan-9am, afnan-9pm-rebel, afnan-turathi-blue",inspiredBy:{name:"",short:""},noteMap:{top:"bergamot, mandarin",heart:"lavender",base:"cedarwood, musk"}},
  copy:{miniTag:{sr:"Test / Čist",en:"Test / Clean"},card:{sr:"Test opis.",en:"Test copy."},modal:{sr:"Test modal.",en:"Test modal."},scentType:{sr:"Test",en:"Test"},dominantNotes:{sr:["bergamot"],en:["bergamot"]},tags:{sr:["Test"],en:["Test"]},whyChoose:{sr:"Test razlog.",en:"Test reason."}},
  wear:{sr:"Svaki dan.",en:"Every day."},
  discovery:{freshness:8,office:9,longevity:7}
};
const p=__test.normalizePayload(payload,"playnice-test-fragrance");
const errors=__test.validateNewProduct(p); if(errors.length) throw new Error(errors.join(" | "));
const nextIndex=__test.insertProduct(files.index,p);
if(!nextIndex.includes('slug: "playnice-test-fragrance"')) throw new Error("New catalog slug missing.");
if(!nextIndex.includes('name: "PlayNice Test Fragrance Eau de Parfum"')) throw new Error("New catalog name missing.");
const ids=[...files.index.matchAll(/\bid\s*:\s*(\d+)/g)].map(m=>Number(m[1]));
const expected=Math.max(...ids)+1;
if(!nextIndex.includes(`id: ${expected},`)) throw new Error("New product id is not max+1.");
for(const [source,render,label,key,exportName] of [
  [files.copy,__test.renderCopy(p),"Product Copy",p.core.name,"productCopy"],
  [files.wear,__test.renderWear(p),"Wear Context",p.core.name,"productWearContext"],
  [files.discovery,__test.renderDiscovery(p),"Discovery Profiles",p.slug,"discoveryProfiles"],
]){
  const next=__test.insertObjectEntry(source,render,label,exportName);
  if(!next.includes(JSON.stringify(key))) throw new Error(`${label} key missing after insert.`);
}
let duplicate=false; try{__test.insertProduct(nextIndex,p)}catch(e){duplicate=String(e.message).includes("already exists")} if(!duplicate) throw new Error("Duplicate product guard failed.");
for(const [k,content] of Object.entries(files)){const actual={index:read("playnice-site/src/data/products/index.js"),copy:read("playnice-site/src/data/products/productCopy.js"),wear:read("playnice-site/src/data/products/productWearContext.js"),discovery:read("playnice-site/src/data/products/discoveryProfiles.js")}[k];if(actual!==content)throw new Error(`${k} mutated on disk.`)}
console.log("PASS  new product payload validates");
console.log("PASS  catalog insertion assigns max+1 id");
console.log("PASS  Copy, Wear and Discovery entries render and insert");
console.log("PASS  duplicate slug/name guard blocks catalog collision");
console.log("Production untouched: yes (in-memory regression only)");
