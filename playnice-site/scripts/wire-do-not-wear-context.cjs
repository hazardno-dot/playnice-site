const fs = require('fs');

const pagePath = 'playnice-site/src/mobile-v2/product-page/MobileProductPage.jsx';
let page = fs.readFileSync(pagePath, 'utf8').replace(/\r\n/g, '\n');

const importAnchor = 'import { productWearContext } from "../../data/products/productWearContext";\n';
const newImport = importAnchor + 'import { productDoNotWearContext } from "../../data/products/productDoNotWearContext";\n';
if (!page.includes('productDoNotWearContext')) {
  if (!page.includes(importAnchor)) throw new Error('productWearContext import anchor not found');
  page = page.replace(importAnchor, newImport);
}

const wearAnchor = '  const wearContext = product ? productWearContext[product.name]?.[lang] || "" : "";\n';
const contextLine = wearAnchor + '  const doNotWearContext = product ? productDoNotWearContext[product.name]?.[lang] || "" : "";\n';
if (!page.includes('const doNotWearContext =')) {
  if (!page.includes(wearAnchor)) throw new Error('wearContext anchor not found');
  page = page.replace(wearAnchor, contextLine);
}

const accordionAnchor = `        <details>\n          <summary>{lang === "sr" ? "Kada ga nositi" : "When to wear it"}<span>+</span></summary>\n          <p>{wearContext || (lang === "sr" ? "Biraj ga prema raspoloženju, prilici i sezoni." : "Wear it according to mood, occasion and season.")}</p>\n        </details>\n`;
const accordionReplacement = accordionAnchor + `\n        {doNotWearContext ? (\n          <details>\n            <summary>{lang === "sr" ? "Kada ga NE nositi" : "When NOT to wear it"}<span>+</span></summary>\n            <p>{doNotWearContext}</p>\n          </details>\n        ) : null}\n`;

if (!page.includes('When NOT to wear it')) {
  if (!page.includes(accordionAnchor)) throw new Error('When to wear accordion anchor not found');
  page = page.replace(accordionAnchor, accordionReplacement);
}

fs.writeFileSync(pagePath, page);
console.log('Wired do-not-wear context into mobile PDP.');
