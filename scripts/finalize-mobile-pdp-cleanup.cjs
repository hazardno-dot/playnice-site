const fs = require('fs');

const cssPath = 'playnice-site/src/mobile-v2/product-page/MobileProductPage.css';
const fixesPath = 'playnice-site/src/mobile-v2/product-page/MobileProductPageFixes.css';
const componentPath = 'playnice-site/src/mobile-v2/product-page/MobileProductPage.jsx';
const indexPath = 'playnice-site/src/index.js';
const appPath = 'playnice-site/src/App.js';

let css = fs.readFileSync(cssPath, 'utf8').replace(/\r\n/g, '\n');
let component = fs.readFileSync(componentPath, 'utf8').replace(/\r\n/g, '\n');
let index = fs.readFileSync(indexPath, 'utf8').replace(/\r\n/g, '\n');
let app = fs.readFileSync(appPath, 'utf8').replace(/\r\n/g, '\n');
const fixes = fs.readFileSync(fixesPath, 'utf8').replace(/\r\n/g, '\n');

const oldTitle = `  .mobile-product-page__identity h1 {\n    margin: 7px 0 10px;\n    max-width: 15ch;\n    color: #f3e7d0;\n    font: 600 clamp(2rem, 8.7vw, 2.6rem)/0.96 "Cormorant Garamond", serif;\n    letter-spacing: -0.035em;\n    text-wrap: balance;\n  }`;
const newTitle = `  .mobile-product-page__identity h1 {\n    width: 100%;\n    margin: 7px 0 10px;\n    max-width: none;\n    color: #f3e7d0;\n    font: 600 clamp(2rem, 8.7vw, 2.6rem)/0.96 "Cormorant Garamond", serif;\n    letter-spacing: -0.035em;\n    text-wrap: wrap;\n    overflow-wrap: normal;\n    word-break: normal;\n  }`;
if (!css.includes(oldTitle)) throw new Error('Base PDP title block not found');
css = css.replace(oldTitle, newTitle);

const noteStart = fixes.indexOf('  /* The outer visual frame is presentation only.');
const noteEnd = fixes.lastIndexOf('\n}');
if (noteStart < 0 || noteEnd < noteStart) throw new Error('Final note-map rules not found in fixes stylesheet');
const noteRules = fixes.slice(noteStart, noteEnd).trimEnd();
const mediaClose = css.lastIndexOf('\n}');
if (mediaClose < 0) throw new Error('Base PDP media query closing brace not found');
css = css.slice(0, mediaClose) + '\n\n' + noteRules + '\n' + css.slice(mediaClose);

index = index.replace('import "./mobile-v2/product-page/MobileProductPageFixes.css";\n', '');
if (index.includes('MobileProductPageFixes.css')) throw new Error('Fixes import still present');

component = component.replace(
  'import React, { useEffect, useLayoutEffect, useMemo, useState } from "react";',
  'import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";'
);
if (!component.includes('useRef')) throw new Error('useRef import update failed');

const stateAnchor = `  const [noteMapOpen, setNoteMapOpen] = useState(false);\n  const [profile, setProfile] = useState(null);`;
const stateReplacement = `${stateAnchor}\n  const recommendationTrackRef = useRef(null);`;
if (!component.includes(stateAnchor)) throw new Error('PDP state anchor not found');
component = component.replace(stateAnchor, stateReplacement);

const layoutEffectOld = `  useLayoutEffect(() => {\n    if (!product?.slug) return;\n    window.scrollTo({ top: 0, left: 0, behavior: "auto" });\n  }, [product?.slug]);`;
const layoutEffectNew = `  useLayoutEffect(() => {\n    if (!product?.slug) return;\n    window.scrollTo({ top: 0, left: 0, behavior: "auto" });\n    const track = recommendationTrackRef.current;\n    if (track) {\n      track.scrollTo({ left: 0, behavior: "auto" });\n    }\n  }, [product?.slug]);`;
if (!component.includes(layoutEffectOld)) throw new Error('PDP layout effect anchor not found');
component = component.replace(layoutEffectOld, layoutEffectNew);

const trackOld = '<div className="mobile-product-page__recommendation-track">';
const trackNew = '<div ref={recommendationTrackRef} className="mobile-product-page__recommendation-track">';
if (!component.includes(trackOld)) throw new Error('Recommendation track anchor not found');
component = component.replace(trackOld, trackNew);

const backOld = `            onBackToShop={() => {\n              if (window.history.state?.playniceProductModal === true) {\n                window.history.back();\n              } else {\n                goToShop();\n              }\n            }}`;
const backNew = `            onBackToShop={() => {\n              goToShop();\n              requestAnimationFrame(() => {\n                window.scrollTo({ top: 0, left: 0, behavior: "auto" });\n              });\n            }}`;
if (!app.includes(backOld)) throw new Error('Mobile PDP back-to-shop handler not found');
app = app.replace(backOld, backNew);

fs.writeFileSync(cssPath, css);
fs.writeFileSync(componentPath, component);
fs.writeFileSync(indexPath, index);
fs.writeFileSync(appPath, app);
fs.unlinkSync(fixesPath);
console.log('Final mobile PDP cleanup applied successfully.');
