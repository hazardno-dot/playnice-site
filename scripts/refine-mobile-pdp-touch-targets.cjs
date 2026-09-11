const fs = require('fs');

const path = 'playnice-site/src/mobile-v2/product-page/MobileProductPage.jsx';
let src = fs.readFileSync(path, 'utf8');

const oldBlock = '        <div className={`mobile-product-page__visual-frame ${noteMapOpen ? "is-note-map-open" : ""}`}>\n';
const newBlock = `        <div
          className={\`mobile-product-page__visual-frame \${noteMapOpen ? "is-note-map-open" : ""}\`}
          onClickCapture={(event) => {
            if (!noteMapOpen) return;
            if (event.target.closest?.(".the-note-map__levels")) {
              setNoteMapOpen(false);
            }
          }}
        >\n`;

if (!src.includes(oldBlock)) {
  throw new Error('Expected visual frame opening was not found');
}

src = src.replace(oldBlock, newBlock);
fs.writeFileSync(path, src);
console.log('Mobile PDP note-map touch target refinement applied.');
