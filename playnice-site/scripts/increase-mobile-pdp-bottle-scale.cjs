const fs = require('fs');

const cssPath = 'playnice-site/src/mobile-v2/product-page/MobileProductPage.css';
let css = fs.readFileSync(cssPath, 'utf8').replace(/\r\n/g, '\n');

const oldBlock = `  .mobile-product-page__image-button img {\n    width: min(72%, 250px);\n    max-height: 280px;\n    object-fit: contain;\n    display: block;\n  }`;

const newBlock = `  .mobile-product-page__image-button img {\n    width: min(80%, 280px);\n    max-height: 314px;\n    object-fit: contain;\n    display: block;\n  }`;

if (!css.includes(oldBlock)) {
  throw new Error('Expected mobile PDP bottle image block not found');
}

css = css.replace(oldBlock, newBlock);
fs.writeFileSync(cssPath, css);
console.log('Increased mobile PDP bottle scale by ~12%.');
