const fs = require('fs');

const cssPath = 'playnice-site/src/mobile-v2/product-page/MobileProductPage.css';
let css = fs.readFileSync(cssPath, 'utf8').replace(/\r\n/g, '\n');

const oldRule = `  .mobile-product-page__price-box strong {\n    color: #d9b56c;\n    font: 650 1.02rem/1 Inter, sans-serif;\n  }`;

const newRule = `  .mobile-product-page__price-box strong {\n    color: #d9b56c;\n    font-family: \"Cormorant Garamond\", serif;\n    font-size: 1.45rem;\n    font-weight: 650;\n    line-height: 0.96;\n    letter-spacing: -0.01em;\n  }`;

if (!css.includes(oldRule)) {
  throw new Error('Expected PDP selected-price rule not found');
}

css = css.replace(oldRule, newRule);
fs.writeFileSync(cssPath, css);
console.log('Updated PDP selected price to live Cormorant Garamond styling.');
