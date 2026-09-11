const fs = require('fs');

const appPath = 'playnice-site/src/App.js';
const pdpPath = 'playnice-site/src/mobile-v2/product-page/MobileProductPage.jsx';

const app = fs.readFileSync(appPath, 'utf8');
const eol = app.includes('\r\n') ? '\r\n' : '\n';

const stickyPattern = /  const showStickyCta =\r?\n  !hasBlockingOverlay &&\r?\n  !isMobileProductPageActive &&\r?\n  \(view === "home" \|\| view === "shop"\);/;
if (!stickyPattern.test(app)) {
  throw new Error('Expected showStickyCta guard was not found');
}
const nextApp = app.replace(
  stickyPattern,
  [
    '  const showStickyCta =',
    '  !hasBlockingOverlay &&',
    '  (view === "home" || view === "shop");'
  ].join(eol)
);
fs.writeFileSync(appPath, nextApp);

let pdp = fs.readFileSync(pdpPath, 'utf8');

const oldMedia = `      <section className={\`mobile-product-page__media \${noteMapOpen ? "is-note-map-open" : ""}\`}>
        {product.badge && !noteMapOpen ? (
          <div className="mobile-product-page__badge">{product.badge}</div>
        ) : null}

        {!noteMapOpen ? (
          <button
            type="button"
            className={\`mobile-product-page__image-button \${product.noteMap ? "has-note-map" : ""}\`}
            onClick={() => product.noteMap && setNoteMapOpen(true)}
            aria-label={
              product.noteMap
                ? lang === "sr"
                  ? "Prikaži note parfema"
                  : "Show fragrance notes"
                : product.name
            }
          >
            {product.image ? (
              <img src={product.image} alt={product.name} />
            ) : (
              <span className="mobile-product-page__monogram">{product.name.charAt(0)}</span>
            )}
          </button>
        ) : null}

        {product.noteMap ? (
          <TheNoteMap
            notes={product.noteMap}
            lang={lang}
            open={noteMapOpen}
            onToggle={() => setNoteMapOpen((current) => !current)}
          />
        ) : null}
      </section>`;

const newMedia = `      <section className="mobile-product-page__media">
        {product.badge ? (
          <div className="mobile-product-page__badge">{product.badge}</div>
        ) : null}

        <div className={\`mobile-product-page__visual-frame \${noteMapOpen ? "is-note-map-open" : ""}\`}>
          <button
            type="button"
            className={\`mobile-product-page__image-button \${product.noteMap ? "has-note-map" : ""}\`}
            onClick={() => product.noteMap && setNoteMapOpen((current) => !current)}
            aria-label={
              product.noteMap
                ? noteMapOpen
                  ? lang === "sr"
                    ? "Vrati sliku parfema"
                    : "Show fragrance image"
                  : lang === "sr"
                  ? "Prikaži note parfema"
                  : "Show fragrance notes"
                : product.name
            }
          >
            {product.image ? (
              <img src={product.image} alt={product.name} />
            ) : (
              <span className="mobile-product-page__monogram">{product.name.charAt(0)}</span>
            )}
          </button>

          {product.noteMap ? (
            <TheNoteMap
              notes={product.noteMap}
              lang={lang}
              open={noteMapOpen}
              onToggle={() => setNoteMapOpen((current) => !current)}
            />
          ) : null}
        </div>
      </section>`;

if (!pdp.includes(oldMedia)) {
  throw new Error('Expected mobile PDP media block was not found');
}
pdp = pdp.replace(oldMedia, newMedia);

const oldSticky = `
      <div className="mobile-product-page__sticky" aria-label={lang === "sr" ? "Brza kupovina" : "Quick purchase"}>
        <div className="mobile-product-page__sticky-inner">
          <div className="mobile-product-page__sticky-copy">
            <span>{activeSize || "—"}</span>
            <strong>{Number.isFinite(Number(selectedPrice)) ? \`€\${Number(selectedPrice).toFixed(2)}\` : "—"}</strong>
          </div>
          <button
            type="button"
            disabled={!activeSize}
            onClick={() => onAddToCart?.(product, activeSize)}
          >
            {lang === "sr" ? "DODAJ U KORPU" : "ADD TO CART"}
          </button>
        </div>
      </div>`;

if (!pdp.includes(oldSticky)) {
  throw new Error('Expected custom PDP sticky CTA block was not found');
}
pdp = pdp.replace(oldSticky, '');

fs.writeFileSync(pdpPath, pdp);
console.log('Clean mobile PDP final polish applied successfully.');
