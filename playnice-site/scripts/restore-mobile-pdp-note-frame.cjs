const fs = require('fs');

const componentPath = 'playnice-site/src/mobile-v2/product-page/MobileProductPage.jsx';
const notePath = 'playnice-site/src/TheNoteMapImpl.jsx';

let component = fs.readFileSync(componentPath, 'utf8').replace(/\r\n/g, '\n');
let note = fs.readFileSync(notePath, 'utf8').replace(/\r\n/g, '\n');

const mediaStart = component.indexOf('      <section className="mobile-product-page__media">');
const storyStart = component.indexOf('      <section className="mobile-product-page__story">');
if (mediaStart < 0 || storyStart < 0 || storyStart <= mediaStart) {
  throw new Error('PDP media/story anchors not found');
}

const mediaBlock = `      <section className="mobile-product-page__media">\n        {product.badge ? (\n          <div className="mobile-product-page__badge">{product.badge}</div>\n        ) : null}\n\n        <div\n          className={\`mobile-product-page__visual-frame \${noteMapOpen ? "is-note-map-open" : ""}\`}\n          onClickCapture={(event) => {\n            if (!noteMapOpen) return;\n            if (event.target.closest?.(".the-note-map__levels")) {\n              setNoteMapOpen(false);\n            }\n          }}\n        >\n          <button\n            type="button"\n            className={\`mobile-product-page__image-button \${product.noteMap ? "has-note-map" : ""}\`}\n            onClick={() => product.noteMap && setNoteMapOpen((current) => !current)}\n            aria-label={\n              product.noteMap\n                ? noteMapOpen\n                  ? lang === "sr"\n                    ? "Vrati sliku parfema"\n                    : "Show fragrance image"\n                  : lang === "sr"\n                  ? "Prikaži note parfema"\n                  : "Show fragrance notes"\n                : product.name\n            }\n          >\n            {product.image ? (\n              <img src={product.image} alt={product.name} />\n            ) : (\n              <span className="mobile-product-page__monogram">{product.name.charAt(0)}</span>\n            )}\n          </button>\n\n          {product.noteMap ? (\n            <TheNoteMap\n              notes={product.noteMap}\n              lang={lang}\n              open={noteMapOpen}\n              onToggle={() => setNoteMapOpen((current) => !current)}\n            />\n          ) : null}\n        </div>\n      </section>\n\n`;

component = component.slice(0, mediaStart) + mediaBlock + component.slice(storyStart);

const currentItemStart = note.indexOf('function NoteMapItem(');
const currentExportStart = note.indexOf('export default function TheNoteMap(');
if (currentItemStart < 0 || currentExportStart < 0 || currentExportStart <= currentItemStart) {
  throw new Error('NoteMap function anchors not found');
}

const itemBlock = `function NoteMapItem({ noteKey, lang, delay }) {\n  const [imageFailed, setImageFailed] = useState(false);\n  const note = getNoteData(noteKey);\n  const noteLabel = note[lang] || note.en;\n  const showImage = Boolean(note.image) && !imageFailed;\n\n  return (\n    <span\n      className="the-note-map__note"\n      role="listitem"\n      style={{ "--note-delay": \`${'${delay}'}ms\` }}\n    >\n      <span className="the-note-map__thumb" aria-hidden="true">\n        <span\n          className={\`the-note-map__fallback \${\n            showImage ? "" : "is-visible"\n          }\`}\n        >\n          {note.fallback}\n        </span>\n\n        {showImage && (\n          <img\n            src={note.image}\n            alt=""\n            loading="lazy"\n            decoding="async"\n            draggable="false"\n            onError={() => setImageFailed(true)}\n          />\n        )}\n      </span>\n\n      <span className="the-note-map__name">{noteLabel}</span>\n    </span>\n  );\n}\n\n`;

note = note.slice(0, currentItemStart) + itemBlock + note.slice(currentExportStart);
note = note.replace(
`export default function TheNoteMap({\n  notes,\n  lang = "sr",\n  open = false,\n  onToggle,\n  onNoteClick,\n}) {`,
`export default function TheNoteMap({\n  notes,\n  lang = "sr",\n  open = false,\n  onToggle,\n}) {`
);
note = note.replace(/\n\s*onActivate=\{onNoteClick\}/g, '');

fs.writeFileSync(componentPath, component);
fs.writeFileSync(notePath, note);
console.log('Restored stable PDP note-map frame behavior.');
