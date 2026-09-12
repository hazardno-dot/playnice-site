import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,"../..");
const engineSource=fs.readFileSync(path.join(root,"control-center/lib/create-new-product-engine.mjs"),"utf8");
const engineModule=await import(`data:text/javascript;base64,${Buffer.from(engineSource,"utf8").toString("base64")}`);
const { __test }=engineModule;
const read=(p)=>fs.readFileSync(path.join(root,p),"utf8");
const files={
  index:read("playnice-site/src/data/products/index.js"),
  copy:read("playnice-site/src/data/products/productCopy.js"),
  wear:read("playnice-site/src/data/products/productWearContext.js"),
  discovery:read("playnice-site/src/data/products/discoveryProfiles.js"),
};
const slug="playnice-test-fragrance";
const payload={
  core:{name:"PlayNice Test Fragrance Eau de Parfum",shortName:"PN Test",category:"Niche",image:`/products/${slug}.png`,sizes:{"2ml":4,"5ml":9},badge:"PLAYNICE PICK",rating:8.4,ratingLabel:"Test Pick",season:"all",moods:"clean, signature, summer",recommendations:"afnan-9am, afnan-9pm-rebel, afnan-turathi-blue",inspiredBy:{name:"Original PlayNice creation",short:""},noteMap:{top:"bergamot, mandarin",heart:"lavender",base:"cedarwood, musk"}},
  copy:{miniTag:{sr:"Test / Čist",en:"Test / Clean"},card:{sr:"Kratak test opis.",en:"Short test copy."},modal:{sr:"Kratak test modal opis.",en:"Short test modal copy."},scentType:{sr:"Test aromatični",en:"Test aromatic"},dominantNotes:{sr:["bergamot","mandarina","lavanda","kedar"],en:["bergamot","mandarin","lavender","cedar"]},tags:{sr:["Svež","Čist","Test"],en:["Fresh","Clean","Test"]},whyChoose:{sr:"Test razlog.",en:"Test reason."}},
  wear:{sr:"Svaki dan.",en:"Every day."},
  doNotWear:{sr:"Ne za ekstremnu vrućinu.",en:"Not for extreme heat."},
  whatToWear:{sr:"Bela košulja i čiste patike.",en:"White shirt and clean sneakers."},
  discovery:{freshness:8,office:9,longevity:7},
  mediaStage:{
    branch:`cc-product-media-stage-${slug}-202609071900`,
    baseSha:"abc123",
    files:[
      `playnice-site/public/products/${slug}.png`,
      `playnice-site/public/products/thumbs/${slug}.webp`,
    ],
    shopPath:`/products/${slug}.png`,
    justInPath:`/products/thumbs/${slug}.webp`,
  },
};
const p=__test.normalizePayload(payload,slug);
const errors=__test.validateNewProduct(p); if(errors.length) throw new Error(errors.join(" | "));
const mediaErrors=__test.validateMediaStage(p); if(mediaErrors.length) throw new Error(mediaErrors.join(" | "));
const expectedMedia=__test.expectedMediaPaths(slug);
if(expectedMedia.length!==2 || !expectedMedia.includes(`playnice-site/public/products/${slug}.png`) || !expectedMedia.includes(`playnice-site/public/products/thumbs/${slug}.webp`)) throw new Error("Locked Product media paths are wrong.");
const missingMedia=__test.normalizePayload({...payload,mediaStage:null},slug);
if(!__test.validateMediaStage(missingMedia).some((message)=>message.includes("must be uploaded"))) throw new Error("Missing Product media was not blocked.");
const wrongImage=__test.normalizePayload({...payload,core:{...payload.core,image:`/products/${slug}.webp`}},slug);
if(!__test.validateMediaStage(wrongImage).some((message)=>message.includes("Image path must be"))) throw new Error("Wrong Shop image path was not blocked.");
const nextIndex=__test.insertProduct(files.index,p);
if(!nextIndex.includes(`slug: "${slug}"`)) throw new Error("New catalog slug missing.");
if(!nextIndex.includes('name: "PlayNice Test Fragrance Eau de Parfum"')) throw new Error("New catalog name missing.");
const ids=[...files.index.matchAll(/\bid\s*:\s*(\d+)/g)].map(m=>Number(m[1]));
const expected=Math.max(...ids)+1;
if(!nextIndex.includes(`id: ${expected},`)) throw new Error("New product id is not max+1.");
const renderedWithDate=__test.renderProductObject(p,expected,"2026-09-03T20:00:00.000Z");
if(!renderedWithDate.includes('addedAt: "2026-09-03T20:00:00.000Z"')) throw new Error("New product addedAt is not generated.");
if(!renderedWithDate.includes('modalName: "PlayNice Test Fragrance EDP"')) throw new Error("New products must receive a compact modalName.");
const longPayload={...payload,core:{...payload.core,name:"PlayNice Exceptionally Long Test Fragrance Eau de Parfum Edition"}};
const longProduct=__test.normalizePayload(longPayload,`${slug}-long`);
const renderedLong=__test.renderProductObject(longProduct,expected+1,"2026-09-03T20:00:00.000Z");
if(!renderedLong.includes('cardName: "PlayNice Exceptionally Long Test Fragrance EDP Edition"')) throw new Error("Long card names are not compacted independently.");
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
console.log("PASS  new product payload validates against presentation contract");
console.log("PASS  new product requires locked Shop + Just In staged media");
console.log("PASS  wrong new-product Shop image path is blocked");
console.log("PASS  catalog insertion assigns max+1 id");
console.log("PASS  new product receives automatic addedAt timestamp");
console.log("PASS  new product receives compact modalName");
console.log("PASS  long card names compact independently from modal titles");
console.log("PASS  Copy, Wear and Discovery entries render and insert");
console.log("PASS  duplicate slug/name guard blocks catalog collision");
console.log("Production untouched: yes (in-memory regression only)");