const fs = require('fs');

const file = 'playnice-site/src/mobile-v2/product-page/MobileProductPage.jsx';
let src = fs.readFileSync(file, 'utf8');

const refAnchor = '  const recommendationTrackRef = useRef(null);\n  const previousProductSlugRef = useRef(null);';
const refReplacement = '  const recommendationTrackRef = useRef(null);\n  const accordionRef = useRef(null);\n  const previousProductSlugRef = useRef(null);';
if (!src.includes('const accordionRef = useRef(null);')) {
  if (!src.includes(refAnchor)) throw new Error('Accordion ref anchor not found');
  src = src.replace(refAnchor, refReplacement);
}

const trackAnchor = `    const track = recommendationTrackRef.current;\n    if (track) {\n      track.scrollTo({ left: 0, behavior: \"auto\" });\n    }`;
const trackReplacement = `${trackAnchor}\n\n    const accordions = accordionRef.current;\n    if (accordions) {\n      accordions.querySelectorAll(\"details\").forEach((details) => {\n        details.open = false;\n      });\n    }`;
if (!src.includes('accordions.querySelectorAll("details")')) {
  if (!src.includes(trackAnchor)) throw new Error('Product change effect anchor not found');
  src = src.replace(trackAnchor, trackReplacement);
}

const sectionAnchor = '<section className="mobile-product-page__accordions">';
const sectionReplacement = '<section ref={accordionRef} className="mobile-product-page__accordions">';
if (!src.includes(sectionReplacement)) {
  if (!src.includes(sectionAnchor)) throw new Error('Accordion section anchor not found');
  src = src.replace(sectionAnchor, sectionReplacement);
}

src = src.replace('"Kada ga NE nositi" : "When NOT to wear it"', '"Kada ga ne nositi" : "When not to wear it"');

fs.writeFileSync(file, src);
console.log('Reset PDP accordions on product change and normalized do-not-wear title case.');
