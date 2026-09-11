const fs = require('fs');

const appPath = 'playnice-site/src/App.js';
const pdpPath = 'playnice-site/src/mobile-v2/product-page/MobileProductPage.jsx';

const appRaw = fs.readFileSync(appPath, 'utf8');
const pdpRaw = fs.readFileSync(pdpPath, 'utf8');
const appUsesCrLf = appRaw.includes('\r\n');
const pdpUsesCrLf = pdpRaw.includes('\r\n');

let app = appRaw.replace(/\r\n/g, '\n');
let pdp = pdpRaw.replace(/\r\n/g, '\n');

function replaceOnce(source, from, to, label) {
  const count = source.split(from).length - 1;
  if (count !== 1) {
    throw new Error(`${label}: expected exactly 1 match, found ${count}`);
  }
  return source.replace(from, to);
}

app = replaceOnce(
  app,
  'import MobilePartnerSpotlight from "./mobile-v2/content/MobilePartnerSpotlight";\n',
  'import MobilePartnerSpotlight from "./mobile-v2/content/MobilePartnerSpotlight";\nimport MobileProductPage from "./mobile-v2/product-page/MobileProductPage";\n',
  'MobileProductPage import'
);

app = replaceOnce(
  app,
  '  const hasBlockingOverlay =\n  !!selectedProduct ||\n',
  '  const isMobileProductPageActive =\n    isMobileProductModalViewport && Boolean(selectedProduct);\n\n  const hasBlockingOverlay =\n  (!isMobileProductPageActive && !!selectedProduct) ||\n',
  'mobile PDP derived state'
);

app = replaceOnce(
  app,
  '  const showStickyCta =\n  !hasBlockingOverlay &&\n  (view === "home" || view === "shop");',
  '  const showStickyCta =\n  !hasBlockingOverlay &&\n  !isMobileProductPageActive &&\n  (view === "home" || view === "shop");',
  'sticky CTA guard'
);

app = replaceOnce(
  app,
  'const switchView = (nextView, options = {}) => {\n  const { scrollTop = true } = options;\n',
  'const switchView = (nextView, options = {}) => {\n  const { scrollTop = true } = options;\n\n  if (isMobileProductPageActive) {\n    setSelectedProduct(null);\n    setSelectedSize("");\n    setProductModalVisible(false);\n    setHasUserPickedSize(false);\n    setNoteMapOpen(false);\n  }\n',
  'switchView cleanup'
);

app = replaceOnce(
  app,
  'const goHome = () => {\n  if (view === "home") {',
  'const goHome = () => {\n  if (view === "home" && !isMobileProductPageActive) {',
  'goHome PDP handling'
);

app = replaceOnce(
  app,
  '  if (changeView) {\n    setView("shop");\n  }',
  '  if (changeView || isMobileModal) {\n    setView("shop");\n  }',
  'mobile product view context'
);

const mainAnchor = '{addedFeedback && <div className="added-feedback">{addedFeedback}</div>}\n\n      <main>\n';
const mobilePdpBlock = `{addedFeedback && <div className="added-feedback">{addedFeedback}</div>}\n\n      <main>\n        {isMobileProductPageActive && selectedProduct && (\n          <MobileProductPage\n            product={selectedProduct}\n            lang={lang}\n            selectedSize={selectedSize}\n            onSelectSize={(size) => {\n              setSelectedSize(size);\n              setHasUserPickedSize(true);\n            }}\n            onAddToCart={(product, size) => {\n              const basePrice = Number(product.sizes?.[size] || 0);\n              const discount = getProductDiscountForSize(product, size);\n              const finalPrice = discount\n                ? getDiscountedPrice(basePrice, discount.percent)\n                : basePrice;\n              const productForCart = discount\n                ? { ...product, sizes: { ...product.sizes, [size]: finalPrice } }\n                : product;\n\n              addToCart(productForCart, size, null, null, {\n                showToast: false,\n                showMiniPreview: true\n              });\n            }}\n            onBuyNow={(product, size) => {\n              const basePrice = Number(product.sizes?.[size] || 0);\n              const discount = getProductDiscountForSize(product, size);\n              const finalPrice = discount\n                ? getDiscountedPrice(basePrice, discount.percent)\n                : basePrice;\n              const productForCart = discount\n                ? { ...product, sizes: { ...product.sizes, [size]: finalPrice } }\n                : product;\n\n              addToCart(productForCart, size, null, null, {\n                showToast: false,\n                showMiniPreview: false\n              });\n              setMiniCartPreview(null);\n              openCheckout();\n            }}\n            isWishlisted={wishlist.includes(selectedProduct.id)}\n            onToggleWishlist={() => toggleWishlist(selectedProduct.id)}\n            onOpenProduct={(product) =>\n              openProductModal(product, { changeView: false })\n            }\n            onBackToShop={() => {\n              if (window.history.state?.playniceProductModal === true) {\n                window.history.back();\n              } else {\n                goToShop();\n              }\n            }}\n          />\n        )}\n`;
app = replaceOnce(app, mainAnchor, mobilePdpBlock, 'mobile PDP render');

[
  ['        {view === "journal" && !journalPageArticle && (', '        {!isMobileProductPageActive && view === "journal" && !journalPageArticle && ('],
  ['        {view === "journal" && journalPageArticle && (', '        {!isMobileProductPageActive && view === "journal" && journalPageArticle && ('],
  ['        {view === "exhibition" && (', '        {!isMobileProductPageActive && view === "exhibition" && ('],
  ['      {view === "home" && (', '      {!isMobileProductPageActive && view === "home" && ('],
  ['          {view === "shop" && (', '          {!isMobileProductPageActive && view === "shop" && (']
].forEach(([from, to], index) => {
  app = replaceOnce(app, from, to, `view guard ${index + 1}`);
});

app = replaceOnce(
  app,
  '        cartOpen ||\n        checkoutOpen ||\n        selectedProduct ||\n        storyOpen ||',
  '        cartOpen ||\n        checkoutOpen ||\n        (!isMobileProductPageActive && selectedProduct) ||\n        storyOpen ||',
  'backdrop mobile PDP guard'
);

app = replaceOnce(
  app,
  '{selectedProduct && (\n  <div\n    className={`modal-overlay product-modal-layer ${',
  '{selectedProduct && !isMobileProductPageActive && (\n  <div\n    className={`modal-overlay product-modal-layer ${',
  'desktop legacy modal guard'
);

pdp = replaceOnce(
  pdp,
  '  onBackToShop,\n  onHome,\n  onShop,\n  onJournal,\n',
  '  onBackToShop,\n',
  'remove unused footer props'
);

pdp = replaceOnce(
  pdp,
  '    <main className="mobile-product-page" data-product-slug={product.slug}>',
  '    <div className="mobile-product-page" data-product-slug={product.slug}>',
  'PDP root element'
);

const footerStart = pdp.indexOf('      <footer className="mobile-product-page__footer">');
if (footerStart === -1) throw new Error('PDP footer start not found');
const footerEndToken = '      </footer>\n';
const footerEnd = pdp.indexOf(footerEndToken, footerStart);
if (footerEnd === -1) throw new Error('PDP footer end not found');
pdp = pdp.slice(0, footerStart) + pdp.slice(footerEnd + footerEndToken.length);

const lastMainClose = pdp.lastIndexOf('    </main>');
if (lastMainClose === -1) throw new Error('PDP closing main not found');
pdp = pdp.slice(0, lastMainClose) + '    </div>' + pdp.slice(lastMainClose + '    </main>'.length);

if (appUsesCrLf) app = app.replace(/\n/g, '\r\n');
if (pdpUsesCrLf) pdp = pdp.replace(/\n/g, '\r\n');

fs.writeFileSync(appPath, app);
fs.writeFileSync(pdpPath, pdp);
console.log('Clean mobile PDP integration applied successfully.');
