const fs = require('fs');

const jsxPath = 'playnice-site/src/mobile-v2/product-page/MobileProductPage.jsx';
const cssPath = 'playnice-site/src/mobile-v2/product-page/MobileProductPage.css';

let jsx = fs.readFileSync(jsxPath, 'utf8').replace(/\r\n/g, '\n');
let css = fs.readFileSync(cssPath, 'utf8').replace(/\r\n/g, '\n');

const wishlistButton = `          <button\n            type="button"\n            className={\`mobile-product-page__wishlist \${isWishlisted ? "is-active" : ""}\`}\n            onClick={onToggleWishlist}\n            aria-label={\n              isWishlisted\n                ? lang === "sr"\n                  ? "Ukloni iz Private Selection"\n                  : "Remove from Private Selection"\n                : lang === "sr"\n                ? "Dodaj u Private Selection"\n                : "Add to Private Selection"\n            }\n          >\n            {isWishlisted ? "♥" : "♡"}\n          </button>\n`;

if (!jsx.includes(wishlistButton)) throw new Error('Wishlist JSX anchor not found');
jsx = jsx.replace(`\n${wishlistButton}`, '\n');

const visualAnchor = `        >\n          {product.discount ? (`;
if (!jsx.includes(visualAnchor)) throw new Error('Visual frame JSX anchor not found');
jsx = jsx.replace(
  visualAnchor,
  `        >\n          <button\n            type="button"\n            className={\`mobile-product-page__wishlist mobile-product-page__wishlist--media \${isWishlisted ? "is-active" : ""}\`}\n            onClick={(event) => {\n              event.stopPropagation();\n              onToggleWishlist?.();\n            }}\n            aria-label={\n              isWishlisted\n                ? lang === "sr"\n                  ? "Ukloni iz Private Selection"\n                  : "Remove from Private Selection"\n                : lang === "sr"\n                ? "Dodaj u Private Selection"\n                : "Add to Private Selection"\n            }\n          >\n            {isWishlisted ? "♥" : "♡"}\n          </button>\n\n          {product.discount ? (`
);

const cssBefore = `  .mobile-product-page__wishlist {\n    width: 46px;\n    min-width: 46px;\n    height: 42px;\n    flex: 0 0 46px;\n    display: grid;\n    place-items: center;\n    border: 1px solid var(--line-strong);\n    border-radius: 999px;\n    color: var(--gold);\n    font-size: 1.2rem;\n  }\n\n  .mobile-product-page__wishlist.is-active {\n    color: #d5b16a;\n    background: rgba(213, 177, 106, 0.08);\n  }`;

const cssAfter = `  .mobile-product-page__wishlist {\n    width: 44px;\n    min-width: 44px;\n    height: 44px;\n    display: grid;\n    place-items: center;\n    padding: 0;\n    border: 0;\n    background: transparent;\n    color: var(--gold);\n    font-size: 1.58rem;\n    line-height: 1;\n    text-shadow: 0 0 12px rgba(220, 181, 107, 0.16);\n  }\n\n  .mobile-product-page__wishlist.is-active {\n    color: var(--gold-lit);\n    background: transparent;\n    text-shadow: 0 0 14px rgba(220, 181, 107, 0.28);\n  }\n\n  .mobile-product-page__wishlist--media {\n    position: absolute;\n    top: 12px;\n    right: 12px;\n    z-index: 6;\n  }\n\n  .mobile-product-page__visual-frame.is-note-map-open .mobile-product-page__wishlist--media {\n    opacity: 0;\n    pointer-events: none;\n  }`;

if (!css.includes(cssBefore)) throw new Error('Wishlist CSS anchor not found');
css = css.replace(cssBefore, cssAfter);

if (!css.includes('  .mobile-product-page__media {\n    position: relative;')) {
  throw new Error('Media positioning anchor not found');
}

fs.writeFileSync(jsxPath, jsx);
fs.writeFileSync(cssPath, css);
console.log('Moved PDP wishlist to image frame and removed visible container.');
