const fs = require('fs');

const file = 'playnice-site/src/mobile-v2/product-page/MobileProductPage.jsx';
let src = fs.readFileSync(file, 'utf8');

const importAnchor = 'import { productDoNotWearContext } from "../../data/products/productDoNotWearContext";';
const importLine = 'import { productWhatToWearContext } from "../../data/products/productWhatToWearContext";';
if (!src.includes(importLine)) {
  if (!src.includes(importAnchor)) throw new Error('Import anchor not found');
  src = src.replace(importAnchor, `${importAnchor}\n${importLine}`);
}

const dataAnchor = '  const doNotWearContext = product ? productDoNotWearContext[product.name]?.[lang] || "" : "";';
const dataLine = '  const whatToWearContext = product ? productWhatToWearContext[product.name]?.[lang] || "" : "";';
if (!src.includes(dataLine)) {
  if (!src.includes(dataAnchor)) throw new Error('Data anchor not found');
  src = src.replace(dataAnchor, `${dataAnchor}\n${dataLine}`);
}

const accordionAnchor = `        {doNotWearContext ? (\n          <details>\n            <summary>{lang === \"sr\" ? \"Kada ga ne nositi\" : \"When not to wear it\"}<span>+</span></summary>\n            <p>{doNotWearContext}</p>\n          </details>\n        ) : null}`;

const accordionBlock = `${accordionAnchor}\n\n        {whatToWearContext ? (\n          <details>\n            <summary>{lang === \"sr\" ? \"Šta obući?\" : \"What to wear?\"}<span>+</span></summary>\n            <p>{whatToWearContext}</p>\n          </details>\n        ) : null}`;

if (!src.includes('whatToWearContext ? (')) {
  if (!src.includes(accordionAnchor)) throw new Error('Accordion anchor not found');
  src = src.replace(accordionAnchor, accordionBlock);
}

fs.writeFileSync(file, src);
console.log('Wired what-to-wear context into mobile PDP.');
