const fs = require('fs');

const jsxPath = 'playnice-site/src/mobile-v2/product-page/MobileProductPage.jsx';
const cssPath = 'playnice-site/src/mobile-v2/product-page/MobileProductPage.css';

let jsx = fs.readFileSync(jsxPath, 'utf8');
let css = fs.readFileSync(cssPath, 'utf8');

const oldHelper = `const getRatingStars = (rating) => {\n  const normalizedRating = Math.max(0, Math.min(10, Number(rating) || 0));\n  const filledStars = Math.round(normalizedRating);\n\n  return Array.from({ length: 10 }, (_, index) =>\n    index < filledStars ? \"★\" : \"☆\"\n  ).join(\"\");\n};`;

const newHelper = `const getRatingStarCount = (rating) => {\n  const normalizedRating = Math.max(0, Math.min(10, Number(rating) || 0));\n  return Math.round(normalizedRating);\n};`;

if (!jsx.includes(oldHelper)) throw new Error('Rating helper anchor not found');
jsx = jsx.replace(oldHelper, newHelper);

const oldMarkup = `<span className=\"mobile-product-page__rating-stars\" aria-hidden=\"true\">{getRatingStars(product.rating)}</span>`;
const newMarkup = `<span className=\"mobile-product-page__rating-stars\" aria-hidden=\"true\">\n                <span className=\"is-filled\">{\"★\".repeat(getRatingStarCount(product.rating))}</span>\n                <span className=\"is-empty\">{\"★\".repeat(10 - getRatingStarCount(product.rating))}</span>\n              </span>`;

if (!jsx.includes(oldMarkup)) throw new Error('Rating markup anchor not found');
jsx = jsx.replace(oldMarkup, newMarkup);

const cssAnchor = `  .mobile-product-page__rating-stars {\n    display: inline-block;\n    color: #d7b46c;\n    font-size: 0.74rem;\n    line-height: 1;\n    letter-spacing: 0.045em;\n    white-space: nowrap;\n    text-shadow: 0 0 10px rgba(220, 181, 107, 0.16);\n  }`;

const cssReplacement = `${cssAnchor}\n\n  .mobile-product-page__rating-stars .is-filled {\n    color: #d7b46c;\n  }\n\n  .mobile-product-page__rating-stars .is-empty {\n    color: rgba(244, 234, 216, 0.16);\n    text-shadow: none;\n  }`;

if (!css.includes(cssAnchor)) throw new Error('Rating CSS anchor not found');
css = css.replace(cssAnchor, cssReplacement);

fs.writeFileSync(jsxPath, jsx);
fs.writeFileSync(cssPath, css);
console.log('Updated PDP rating stars with distinct filled/empty states.');
