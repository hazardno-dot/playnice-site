const fs = require('fs');

const jsxPath = 'playnice-site/src/mobile-v2/product-page/MobileProductPage.jsx';
const cssPath = 'playnice-site/src/mobile-v2/product-page/MobileProductPage.css';

let jsx = fs.readFileSync(jsxPath, 'utf8').replace(/\r\n/g, '\n');
let css = fs.readFileSync(cssPath, 'utf8').replace(/\r\n/g, '\n');

const oldRating = `          {product.rating ? (\n            <span className="mobile-product-page__rating">\n              ★ {Number(product.rating).toFixed(1)} <small>/ 10 · {product.ratingLabel}</small>\n            </span>\n          ) : null}`;

const newRating = `          {product.rating ? (\n            <span className="mobile-product-page__rating">\n              <span className="mobile-product-page__rating-stars" aria-hidden="true">★★★★★★★★★★</span>\n              <span className="mobile-product-page__rating-score">\n                {Number(product.rating).toFixed(1)} <small>/ 10 · {product.ratingLabel}</small>\n              </span>\n            </span>\n          ) : null}`;

if (!jsx.includes(oldRating)) throw new Error('Expected PDP rating markup not found');
jsx = jsx.replace(oldRating, newRating);

const oldCss = `  .mobile-product-page__rating {\n    color: #d7b46c;\n    font: 750 0.82rem/1.3 Inter, sans-serif;\n  }\n\n  .mobile-product-page__rating small {\n    color: rgba(244, 234, 216, 0.54);\n    font-weight: 500;\n  }`;

const newCss = `  .mobile-product-page__rating {\n    display: flex;\n    align-items: center;\n    flex-wrap: wrap;\n    gap: 7px;\n    color: #d7b46c;\n    font: 750 0.82rem/1.3 Inter, sans-serif;\n  }\n\n  .mobile-product-page__rating-stars {\n    display: inline-block;\n    color: #d7b46c;\n    font-size: 0.74rem;\n    line-height: 1;\n    letter-spacing: 0.045em;\n    white-space: nowrap;\n    text-shadow: 0 0 10px rgba(220, 181, 107, 0.16);\n  }\n\n  .mobile-product-page__rating-score {\n    white-space: nowrap;\n  }\n\n  .mobile-product-page__rating small {\n    color: rgba(244, 234, 216, 0.54);\n    font-weight: 500;\n  }`;

if (!css.includes(oldCss)) throw new Error('Expected PDP rating styles not found');
css = css.replace(oldCss, newCss);

fs.writeFileSync(jsxPath, jsx);
fs.writeFileSync(cssPath, css);
console.log('Restored ten-star PDP rating treatment.');
