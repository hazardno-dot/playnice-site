const fs = require('fs');

const jsxPath = 'playnice-site/src/mobile-v2/product-page/MobileProductPage.jsx';
const cssPath = 'playnice-site/src/mobile-v2/product-page/MobileProductPage.css';

let jsx = fs.readFileSync(jsxPath, 'utf8').replace(/\r\n/g, '\n');
let css = fs.readFileSync(cssPath, 'utf8').replace(/\r\n/g, '\n');

const typeHelper = `const getProductType = (name = "") => {\n  const match = String(name).match(\n    /(Extrait de Parfum|Eau de Parfum|Eau de Toilette|Parfum|Cologne)$/i\n  );\n\n  return match?.[1] || "";\n};`;

if (!jsx.includes(typeHelper)) throw new Error('getProductType anchor not found');

jsx = jsx.replace(typeHelper, `${typeHelper}\n\nconst getDiscountedPrice = (price, percent) =>\n  Number((Number(price) * (1 - Number(percent) / 100)).toFixed(2));\n\nconst getProductDiscountForSize = (product, size) => {\n  if (!product?.discount) return null;\n  return product.discount.size === size ? product.discount : null;\n};`);

const selectedBlock = `  const selectedPrice = product.sizes?.[activeSize];\n  const type = getProductType(product.name);`;
if (!jsx.includes(selectedBlock)) throw new Error('selected price anchor not found');
jsx = jsx.replace(selectedBlock, `  const selectedPrice = product.sizes?.[activeSize];\n  const selectedDiscount = getProductDiscountForSize(product, activeSize);\n  const selectedFinalPrice = selectedDiscount\n    ? getDiscountedPrice(selectedPrice, selectedDiscount.percent)\n    : selectedPrice;\n  const type = getProductType(product.name);`);

const frameAnchor = `        >\n          <button\n            type="button"\n            className={\`mobile-product-page__image-button \${product.noteMap ? "has-note-map" : ""}\`}`;
if (!jsx.includes(frameAnchor)) throw new Error('visual frame anchor not found');
jsx = jsx.replace(frameAnchor, `        >\n          {product.discount ? (\n            <span className="mobile-product-page__sale-badge">\n              SALE · {String(product.discount.size).toUpperCase()} · -{product.discount.percent}%\n            </span>\n          ) : null}\n\n          <button\n            type="button"\n            className={\`mobile-product-page__image-button \${product.noteMap ? "has-note-map" : ""}\`}`);

const sizesBlock = `        <div className="mobile-product-page__sizes">\n          {sizes.map(([size, price]) => (\n            <button\n              key={size}\n              type="button"\n              className={size === activeSize ? "is-active" : ""}\n              onClick={() => onSelectSize?.(size)}\n            >\n              <span>{size}</span>\n              <strong>€{Number(price).toFixed(2)}</strong>\n            </button>\n          ))}\n        </div>`;

if (!jsx.includes(sizesBlock)) throw new Error('sizes block anchor not found');
jsx = jsx.replace(sizesBlock, `        <div className="mobile-product-page__sizes">\n          {sizes.map(([size, price]) => {\n            const discount = getProductDiscountForSize(product, size);\n            const finalPrice = discount\n              ? getDiscountedPrice(price, discount.percent)\n              : Number(price);\n\n            return (\n              <button\n                key={size}\n                type="button"\n                className={\`${'${'}size === activeSize ? "is-active" : ""} ${'${'}discount ? "has-discount" : ""}\`.trim()}\n                onClick={() => onSelectSize?.(size)}\n              >\n                <span className="mobile-product-page__size-topline">\n                  <span>{size}</span>\n                  {discount ? (\n                    <em>-{discount.percent}%</em>\n                  ) : null}\n                </span>\n\n                {discount ? (\n                  <span className="mobile-product-page__size-price-discount">\n                    <del>€{Number(price).toFixed(2)}</del>\n                    <strong>€{finalPrice.toFixed(2)}</strong>\n                  </span>\n                ) : (\n                  <strong>€{Number(price).toFixed(2)}</strong>\n                )}\n              </button>\n            );\n          })}\n        </div>`);

const priceStrong = `            <strong>{Number.isFinite(Number(selectedPrice)) ? \`€\${Number(selectedPrice).toFixed(2)}\` : "—"}</strong>`;
if (!jsx.includes(priceStrong)) throw new Error('selected price markup anchor not found');
jsx = jsx.replace(priceStrong, `            {selectedDiscount && Number.isFinite(Number(selectedPrice)) ? (\n              <span className="mobile-product-page__selected-discount">\n                <del>€{Number(selectedPrice).toFixed(2)}</del>\n                <strong>€{Number(selectedFinalPrice).toFixed(2)}</strong>\n              </span>\n            ) : (\n              <strong>{Number.isFinite(Number(selectedFinalPrice)) ? \`€\${Number(selectedFinalPrice).toFixed(2)}\` : "—"}</strong>\n            )}`);

const badgeCssAnchor = `  .mobile-product-page__badge {\n    margin: 0 auto 12px;\n    width: fit-content;\n  }`;
if (!css.includes(badgeCssAnchor)) throw new Error('badge css anchor not found');
css = css.replace(badgeCssAnchor, `${badgeCssAnchor}\n\n  .mobile-product-page__sale-badge {\n    position: absolute;\n    top: 14px;\n    left: 14px;\n    z-index: 4;\n    display: inline-flex;\n    align-items: center;\n    min-height: 25px;\n    padding: 0 9px;\n    border: 1px solid rgba(209, 76, 76, 0.42);\n    border-radius: 999px;\n    background: rgba(72, 18, 18, 0.88);\n    color: #f2b7ad;\n    font: 800 0.54rem/1 Inter, sans-serif;\n    letter-spacing: 0.08em;\n    text-transform: uppercase;\n    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);\n    transition: opacity 0.18s ease, transform 0.18s ease;\n    pointer-events: none;\n  }\n\n  .mobile-product-page__visual-frame.is-note-map-open .mobile-product-page__sale-badge {\n    opacity: 0;\n    transform: translateY(-3px);\n  }`);

const sizeStrongCss = `  .mobile-product-page__sizes strong {\n    font: 650 1.04rem/1 Inter, sans-serif;\n  }`;
if (!css.includes(sizeStrongCss)) throw new Error('size strong css anchor not found');
css = css.replace(sizeStrongCss, `${sizeStrongCss}\n\n  .mobile-product-page__size-topline {\n    width: 100%;\n    display: flex;\n    align-items: center;\n    justify-content: space-between;\n    gap: 5px;\n  }\n\n  .mobile-product-page__size-topline em {\n    color: #df8f82;\n    font: 800 0.54rem/1 Inter, sans-serif;\n    font-style: normal;\n    letter-spacing: 0.03em;\n  }\n\n  .mobile-product-page__sizes button.has-discount {\n    border-color: rgba(188, 76, 62, 0.34);\n  }\n\n  .mobile-product-page__sizes button.has-discount.is-active {\n    border-color: rgba(213, 177, 106, 0.76);\n  }\n\n  .mobile-product-page__size-price-discount {\n    display: flex;\n    align-items: baseline;\n    gap: 6px;\n  }\n\n  .mobile-product-page__size-price-discount del {\n    color: rgba(244, 234, 216, 0.38);\n    font: 600 0.66rem/1 Inter, sans-serif;\n    text-decoration-thickness: 1px;\n  }\n\n  .mobile-product-page__size-price-discount strong {\n    color: #e3bd6e;\n  }`);

const priceCssAnchor = `  .mobile-product-page__price-box strong {\n    color: #d9b56c;\n    font-family: "Cormorant Garamond", serif;\n    font-size: 1.45rem;\n    font-weight: 650;\n    line-height: 0.96;\n    letter-spacing: -0.01em;\n  }`;
if (!css.includes(priceCssAnchor)) throw new Error('selected price css anchor not found');
css = css.replace(priceCssAnchor, `${priceCssAnchor}\n\n  .mobile-product-page__selected-discount {\n    display: grid;\n    justify-items: center;\n    gap: 2px;\n  }\n\n  .mobile-product-page__selected-discount del {\n    color: rgba(244, 234, 216, 0.38);\n    font: 600 0.66rem/1 Inter, sans-serif;\n    text-decoration-thickness: 1px;\n  }\n\n  .mobile-product-page__selected-discount strong {\n    color: #d9b56c;\n    font-family: "Cormorant Garamond", serif;\n    font-size: 1.45rem;\n    font-weight: 650;\n    line-height: 0.96;\n    letter-spacing: -0.01em;\n  }`);

fs.writeFileSync(jsxPath, jsx);
fs.writeFileSync(cssPath, css);
console.log('Added mobile PDP discount presentation using existing product.discount contract.');
