const fs = require('fs');

const jsxPath = 'playnice-site/src/mobile-v2/product-page/MobileProductPage.jsx';
const cssPath = 'playnice-site/src/mobile-v2/product-page/MobileProductPage.css';

let jsx = fs.readFileSync(jsxPath, 'utf8').replace(/\r\n/g, '\n');
let css = fs.readFileSync(cssPath, 'utf8').replace(/\r\n/g, '\n');

const mediaButton = `          <button\n            type="button"\n            className={\`mobile-product-page__wishlist mobile-product-page__wishlist--media \${isWishlisted ? "is-active" : ""}\`}\n            onClick={(event) => {\n              event.stopPropagation();\n              onToggleWishlist?.();\n            }}\n            aria-label={\n              isWishlisted\n                ? lang === "sr"\n                  ? "Ukloni iz Private Selection"\n                  : "Remove from Private Selection"\n                : lang === "sr"\n                ? "Dodaj u Private Selection"\n                : "Add to Private Selection"\n            }\n          >\n            {isWishlisted ? "♥" : "♡"}\n          </button>\n\n`;

if (!jsx.includes(mediaButton)) throw new Error('Media wishlist button anchor not found');
jsx = jsx.replace(mediaButton, '');

const backAnchor = `          <button type="button" className="mobile-product-page__back" onClick={onBackToShop}>\n            ← SHOP\n          </button>\n\n`;
if (!jsx.includes(backAnchor)) throw new Error('Back button anchor not found');

const wishlistButton = `${backAnchor}          <button\n            type="button"\n            className={\`mobile-product-page__wishlist \${isWishlisted ? "is-active" : ""}\`}\n            onClick={onToggleWishlist}\n            aria-label={\n              isWishlisted\n                ? lang === "sr"\n                  ? "Ukloni iz Private Selection"\n                  : "Remove from Private Selection"\n                : lang === "sr"\n                ? "Dodaj u Private Selection"\n                : "Add to Private Selection"\n            }\n          >\n            <svg viewBox="0 0 24 24" aria-hidden="true">\n              <path\n                className={isWishlisted ? "is-filled" : "is-outline"}\n                d="M20.8 5.9c-1.8-2.1-5.1-2.2-7-.3L12 7.4l-1.8-1.8c-1.9-1.9-5.2-1.8-7 .3-1.7 2-1.4 5 .5 6.9L12 21l8.3-8.2c1.9-1.9 2.2-4.9.5-6.9Z"\n              />\n            </svg>\n          </button>\n\n`;
jsx = jsx.replace(backAnchor, wishlistButton);

const cssBefore = `  .mobile-product-page__wishlist {\n    width: 44px;\n    min-width: 44px;\n    height: 44px;\n    display: grid;\n    place-items: center;\n    padding: 0;\n    border: 0;\n    background: transparent;\n    color: var(--gold);\n    font-size: 1.58rem;\n    line-height: 1;\n    text-shadow: 0 0 12px rgba(220, 181, 107, 0.16);\n  }\n\n  .mobile-product-page__wishlist.is-active {\n    color: var(--gold-lit);\n    background: transparent;\n    text-shadow: 0 0 14px rgba(220, 181, 107, 0.28);\n  }\n\n  .mobile-product-page__wishlist--media {\n    position: absolute;\n    top: 12px;\n    right: 12px;\n    z-index: 6;\n  }\n\n  .mobile-product-page__visual-frame.is-note-map-open .mobile-product-page__wishlist--media {\n    opacity: 0;\n    pointer-events: none;\n  }`;

const cssAfter = `  .mobile-product-page__wishlist {\n    width: 36px;\n    min-width: 36px;\n    height: 36px;\n    flex: 0 0 36px;\n    display: grid;\n    place-items: center;\n    padding: 0;\n    border: 0;\n    background: transparent;\n    color: inherit;\n  }\n\n  .mobile-product-page__wishlist svg {\n    width: 16px;\n    height: 16px;\n    overflow: visible;\n    fill: none;\n    stroke-width: 1.7;\n    stroke-linecap: round;\n    stroke-linejoin: round;\n    vector-effect: non-scaling-stroke;\n  }\n\n  .mobile-product-page__wishlist .is-outline {\n    fill: none;\n    stroke: rgba(220, 181, 107, 0.88);\n  }\n\n  .mobile-product-page__wishlist .is-filled {\n    fill: #dcb56b;\n    stroke: #e2bd72;\n  }`;

if (!css.includes(cssBefore)) throw new Error('Wishlist CSS anchor not found');
css = css.replace(cssBefore, cssAfter);

fs.writeFileSync(jsxPath, jsx);
fs.writeFileSync(cssPath, css);
console.log('Restored PDP wishlist to Shop row using HeaderNext SVG heart geometry.');
