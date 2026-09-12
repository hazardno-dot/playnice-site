const fs = require('fs');

const componentPath = 'playnice-site/src/mobile-v2/product-page/MobileProductPage.jsx';
const notePath = 'playnice-site/src/TheNoteMapImpl.jsx';

let component = fs.readFileSync(componentPath, 'utf8').replace(/\r\n/g, '\n');
let note = fs.readFileSync(notePath, 'utf8').replace(/\r\n/g, '\n');

const stateOld = `  const [noteMapOpen, setNoteMapOpen] = useState(false);\n  const [profile, setProfile] = useState(null);\n  const recommendationTrackRef = useRef(null);`;
const stateNew = `  const [noteMapOpen, setNoteMapOpen] = useState(false);\n  const [profile, setProfile] = useState(null);\n  const recommendationTrackRef = useRef(null);\n  const previousProductSlugRef = useRef(null);`;
if (!component.includes(stateOld)) throw new Error('PDP state anchor not found');
component = component.replace(stateOld, stateNew);

const layoutOld = `  useLayoutEffect(() => {\n    if (!product?.slug) return;\n    window.scrollTo({ top: 0, left: 0, behavior: "auto" });\n    const track = recommendationTrackRef.current;\n    if (track) {\n      track.scrollTo({ left: 0, behavior: "auto" });\n    }\n  }, [product?.slug]);`;
const layoutNew = `  useLayoutEffect(() => {\n    if (!product?.slug) return;\n\n    const previousSlug = previousProductSlugRef.current;\n    const isProductToProductNavigation =\n      Boolean(previousSlug) && previousSlug !== product.slug;\n\n    window.scrollTo({\n      top: 0,\n      left: 0,\n      behavior: isProductToProductNavigation ? "smooth" : "auto",\n    });\n\n    previousProductSlugRef.current = product.slug;\n\n    const track = recommendationTrackRef.current;\n    if (track) {\n      track.scrollTo({ left: 0, behavior: "auto" });\n    }\n  }, [product?.slug]);`;
if (!component.includes(layoutOld)) throw new Error('PDP layout effect anchor not found');
component = component.replace(layoutOld, layoutNew);

const frameOld = `        <div\n          className={\`mobile-product-page__visual-frame \${noteMapOpen ? "is-note-map-open" : ""}\`}\n          onClickCapture={(event) => {\n            if (!noteMapOpen) return;\n            if (event.target.closest?.(".the-note-map__levels")) {\n              setNoteMapOpen(false);\n            }\n          }}\n        >\n          <button\n            type="button"\n            className={\`mobile-product-page__image-button \${product.noteMap ? "has-note-map" : ""}\`}\n            onClick={() => product.noteMap && setNoteMapOpen((current) => !current)}\n            aria-label={\n              product.noteMap\n                ? noteMapOpen\n                  ? lang === "sr"\n                    ? "Vrati sliku parfema"\n                    : "Show fragrance image"\n                  : lang === "sr"\n                  ? "Prikaži note parfema"\n                  : "Show fragrance notes"\n                : product.name\n            }\n          >\n            {product.image ? (\n              <img src={product.image} alt={product.name} />\n            ) : (\n              <span className="mobile-product-page__monogram">{product.name.charAt(0)}</span>\n            )}\n          </button>\n\n          {product.noteMap ? (\n            <TheNoteMap\n              notes={product.noteMap}\n              lang={lang}\n              open={noteMapOpen}\n              onToggle={() => setNoteMapOpen((current) => !current)}\n            />\n          ) : null}\n        </div>`;

const frameNew = `        <div\n          className={\`mobile-product-page__visual-frame \${noteMapOpen ? "is-note-map-open" : ""}\`}\n        >\n          {!noteMapOpen ? (\n            <button\n              type="button"\n              className={\`mobile-product-page__image-button \${product.noteMap ? "has-note-map" : ""}\`}\n              onClick={() => product.noteMap && setNoteMapOpen(true)}\n              aria-label={\n                product.noteMap\n                  ? lang === "sr"\n                    ? "Prikaži note parfema"\n                    : "Show fragrance notes"\n                  : product.name\n              }\n            >\n              {product.image ? (\n                <img src={product.image} alt={product.name} />\n              ) : (\n                <span className="mobile-product-page__monogram">{product.name.charAt(0)}</span>\n              )}\n            </button>\n          ) : null}\n\n          {product.noteMap ? (\n            <TheNoteMap\n              notes={product.noteMap}\n              lang={lang}\n              open={noteMapOpen}\n              onToggle={() => setNoteMapOpen((current) => !current)}\n              onNoteClick={() => setNoteMapOpen(false)}\n            />\n          ) : null}\n        </div>`;
if (!component.includes(frameOld)) throw new Error('PDP visual frame anchor not found');
component = component.replace(frameOld, frameNew);

const itemSignatureOld = `function NoteMapItem({ noteKey, lang, delay }) {`;
const itemSignatureNew = `function NoteMapItem({ noteKey, lang, delay, onActivate }) {`;
if (!note.includes(itemSignatureOld)) throw new Error('NoteMapItem signature anchor not found');
note = note.replace(itemSignatureOld, itemSignatureNew);

const itemRootOld = `    <span\n      className="the-note-map__note"\n      role="listitem"\n      style={{ "--note-delay": \`${'${delay}'}ms\` }}\n    >`;
const itemRootNew = `    <span\n      className="the-note-map__note"\n      role={onActivate ? "button" : "listitem"}\n      tabIndex={onActivate ? 0 : undefined}\n      style={{ "--note-delay": \`${'${delay}'}ms\` }}\n      onClick={(event) => {\n        if (!onActivate) return;\n        event.preventDefault();\n        event.stopPropagation();\n        onActivate();\n      }}\n      onKeyDown={(event) => {\n        if (!onActivate || (event.key !== "Enter" && event.key !== " ")) return;\n        event.preventDefault();\n        event.stopPropagation();\n        onActivate();\n      }}\n    >`;
if (!note.includes(itemRootOld)) throw new Error('Note item root anchor not found');
note = note.replace(itemRootOld, itemRootNew);

const propsOld = `export default function TheNoteMap({\n  notes,\n  lang = "sr",\n  open = false,\n  onToggle,\n}) {`;
const propsNew = `export default function TheNoteMap({\n  notes,\n  lang = "sr",\n  open = false,\n  onToggle,\n  onNoteClick,\n}) {`;
if (!note.includes(propsOld)) throw new Error('TheNoteMap props anchor not found');
note = note.replace(propsOld, propsNew);

const mapItemOld = `                  <NoteMapItem\n                    key={\`${'${level.key}'}-${'${noteKey}'}-${'${noteIndex}'}\`}\n                    noteKey={noteKey}\n                    lang={activeLang}\n                    delay={rowIndex * 220 + noteIndex * 75}\n                  />`;
const mapItemNew = `                  <NoteMapItem\n                    key={\`${'${level.key}'}-${'${noteKey}'}-${'${noteIndex}'}\`}\n                    noteKey={noteKey}\n                    lang={activeLang}\n                    delay={rowIndex * 220 + noteIndex * 75}\n                    onActivate={onNoteClick}\n                  />`;
if (!note.includes(mapItemOld)) throw new Error('NoteMapItem render anchor not found');
note = note.replace(mapItemOld, mapItemNew);

fs.writeFileSync(componentPath, component);
fs.writeFileSync(notePath, note);
console.log('PDP note interaction and smooth product navigation applied.');
