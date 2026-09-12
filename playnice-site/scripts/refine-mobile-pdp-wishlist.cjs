const fs = require('fs');

const cssPath = 'playnice-site/src/mobile-v2/product-page/MobileProductPage.css';
let css = fs.readFileSync(cssPath, 'utf8').replace(/\r\n/g, '\n');

const before = `  .mobile-product-page__wishlist {\n    width: 42px;\n    height: 42px;\n    display: grid;\n    place-items: center;\n    border: 1px solid rgba(213, 177, 106, 0.2);\n    border-radius: 999px;\n    font-size: 1.2rem;\n  }`;

const after = `  .mobile-product-page__wishlist {\n    width: 46px;\n    min-width: 46px;\n    height: 42px;\n    flex: 0 0 46px;\n    display: grid;\n    place-items: center;\n    border: 1px solid var(--line-strong);\n    border-radius: 999px;\n    color: var(--gold);\n    font-size: 1.2rem;\n  }`;

if (!css.includes(before)) {
  throw new Error('Wishlist CSS anchor not found; refusing to patch');
}

css = css.replace(before, after);
fs.writeFileSync(cssPath, css);
console.log('Refined clean mobile PDP wishlist geometry and color.');
