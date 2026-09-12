const fs = require('fs');

const jsxPath = 'playnice-site/src/mobile-v2/product-page/MobileProductPage.jsx';
const cssPath = 'playnice-site/src/mobile-v2/product-page/MobileProductPage.css';

let jsx = fs.readFileSync(jsxPath, 'utf8').replace(/\r\n/g, '\n');
let css = fs.readFileSync(cssPath, 'utf8').replace(/\r\n/g, '\n');

const oldHelper = '            <small>{lang === "sr" ? "Probaj. Nosi. Odluči." : "Try it. Wear it. Decide."}</small>';
const newHelper = `            <small>\n              {(() => {\n                const normalizedSize = String(activeSize || \"\").toLowerCase();\n\n                if (!normalizedSize) {\n                  return lang === \"sr\"\n                    ? \"Kreni manjom količinom. Nosi ga prvo.\"\n                    : \"Start small. Wear it first.\";\n                }\n\n                if (normalizedSize.includes(\"2ml\")) {\n                  return lang === \"sr\" ? \"Brzi test na koži.\" : \"Quick skin test.\";\n                }\n\n                if (normalizedSize.includes(\"5ml\")) {\n                  return (\n                    <>\n                      {lang === \"sr\" ? \"Testiraj \" : \"Test it over \"}\n                      <strong>{lang === \"sr\" ? \"nekoliko dana\" : \"a few days\"}</strong>\n                    </>\n                  );\n                }\n\n                if (normalizedSize.includes(\"10ml\")) {\n                  return (\n                    <>\n                      {lang === \"sr\" ? \"Savršen za \" : \"Perfect for \"}\n                      <strong>{lang === \"sr\" ? \"svakodnevno nošenje\" : \"daily wear\"}</strong>\n                    </>\n                  );\n                }\n\n                if (normalizedSize.includes(\"20ml\")) {\n                  return (\n                    <>\n                      {lang === \"sr\" ? \"Skoro kao \" : \"Almost like a \"}\n                      <strong>{lang === \"sr\" ? \"mala bočica\" : \"small bottle\"}</strong>\n                    </>\n                  );\n                }\n\n                return lang === \"sr\" ? \"Probaj. Nosi. Odluči.\" : \"Try it. Wear it. Decide.\";\n              })()}\n            </small>`;

if (!jsx.includes(oldHelper)) {
  throw new Error('Expected PDP size helper anchor not found');
}
jsx = jsx.replace(oldHelper, newHelper);

const buttonAnchor = `  .mobile-product-page__sizes button {\n    min-height: 72px;`;
const buttonReplacement = `  .mobile-product-page__sizes button {\n    position: relative;\n    min-height: 72px;`;
if (!css.includes(buttonAnchor)) {
  throw new Error('Expected PDP size button anchor not found');
}
css = css.replace(buttonAnchor, buttonReplacement);

const activeBlock = `  .mobile-product-page__sizes button.is-active {\n    border-color: rgba(213, 177, 106, 0.72);\n    box-shadow: inset 0 0 0 1px rgba(213, 177, 106, 0.1);\n    background: linear-gradient(145deg, rgba(213, 177, 106, 0.08), #0d0d0c 62%);\n  }`;
const activeReplacement = `${activeBlock}\n\n  .mobile-product-page__sizes button.is-active::after {\n    content: \"\";\n    position: absolute;\n    top: 10px;\n    right: 10px;\n    width: 8px;\n    height: 8px;\n    border-radius: 999px;\n    background: radial-gradient(circle, #f0d7a3 0%, #dcb56b 100%);\n    box-shadow:\n      0 0 0 4px rgba(220, 181, 107, 0.08),\n      0 0 12px rgba(220, 181, 107, 0.72);\n  }`;
if (!css.includes(activeBlock)) {
  throw new Error('Expected PDP active size block not found');
}
css = css.replace(activeBlock, activeReplacement);

fs.writeFileSync(jsxPath, jsx);
fs.writeFileSync(cssPath, css);
console.log('Restored live size guidance and active size indicator on mobile PDP.');
