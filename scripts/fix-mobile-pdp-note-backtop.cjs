const fs = require('fs');

const cssPath = 'playnice-site/src/mobile-v2/product-page/MobileProductPage.css';
const appPath = 'playnice-site/src/App.js';

let css = fs.readFileSync(cssPath, 'utf8').replace(/\r\n/g, '\n');
let app = fs.readFileSync(appPath, 'utf8').replace(/\r\n/g, '\n');

const widthOld = '    width: min(78%, 290px);';
const widthNew = '    width: min(62%, 230px);';
if (!css.includes(widthOld)) throw new Error('Bottle touch width anchor not found');
css = css.replace(widthOld, widthNew);

const opacityOld = '    opacity: 0.08;';
const opacityNew = '    opacity: 0;';
if (!css.includes(opacityOld)) throw new Error('Open note-map image opacity anchor not found');
css = css.replace(opacityOld, opacityNew);

const backTopOld = '{showBackToTop && !sideRailBlocked && (';
const backTopNew = '{showBackToTop && (!sideRailBlocked || (isMobileProductPageActive && !hasBlockingOverlay)) && (';
if (!app.includes(backTopOld)) throw new Error('Back-to-top render anchor not found');
app = app.replaceAll(backTopOld, backTopNew);

fs.writeFileSync(cssPath, css);
fs.writeFileSync(appPath, app);
console.log('Mobile PDP note-map and back-to-top fix applied.');
