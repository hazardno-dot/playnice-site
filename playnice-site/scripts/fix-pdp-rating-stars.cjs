const fs = require('fs');

const file = 'playnice-site/src/mobile-v2/product-page/MobileProductPage.jsx';
let src = fs.readFileSync(file, 'utf8');

const helperAnchor = `const getProductDiscountForSize = (product, size) => {\n  if (!product?.discount) return null;\n  return product.discount.size === size ? product.discount : null;\n};\n`;

const helper = `${helperAnchor}\nconst getRatingStars = (rating) => {\n  const normalizedRating = Math.max(0, Math.min(10, Number(rating) || 0));\n  const filledStars = Math.round(normalizedRating);\n\n  return Array.from({ length: 10 }, (_, index) =>\n    index < filledStars ? \"★\" : \"☆\"\n  ).join(\"\");\n};\n`;

if (!src.includes('const getRatingStars = (rating) => {')) {
  if (!src.includes(helperAnchor)) throw new Error('Discount helper anchor not found');
  src = src.replace(helperAnchor, helper);
}

const oldRating = `<span className="mobile-product-page__rating-stars" aria-hidden="true">★★★★★★★★★★</span>`;
const newRating = `<span className="mobile-product-page__rating-stars" aria-hidden="true">{getRatingStars(product.rating)}</span>`;

if (!src.includes(oldRating)) throw new Error('Hardcoded rating stars anchor not found');
src = src.replace(oldRating, newRating);

fs.writeFileSync(file, src);
console.log('Updated PDP rating stars to follow product rating.');
