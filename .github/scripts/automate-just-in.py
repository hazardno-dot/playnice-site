from pathlib import Path
import re

ROOT = Path('.')
PRODUCTS = ROOT / 'playnice-site/src/data/products/index.js'
APP = ROOT / 'playnice-site/src/App.js'
ENGINE = ROOT / 'control-center/api/create-new-product-engine.js'
TEST = ROOT / 'control-center/tests/controlled-apply-new-product.mjs'

BOOTSTRAP_IDS = list(range(80, 96))
BOOTSTRAP_BASE = '2026-09-03T00:00:'


def read_preserved(path: Path) -> str:
    return path.read_bytes().decode('utf-8')


def write_preserved(path: Path, text: str) -> None:
    path.write_bytes(text.encode('utf-8'))


def newline_for(text: str) -> str:
    return '\r\n' if '\r\n' in text else '\n'


# 1) Product catalog: remove the old manual flags and bootstrap the latest 16.
products = read_preserved(PRODUCTS)
nl = newline_for(products)
products = re.sub(r'^[ \t]*isNew:\s*true,?\r?\n', '', products, flags=re.MULTILINE)

for offset, product_id in enumerate(BOOTSTRAP_IDS):
    marker_re = re.compile(rf'(^[ \t]*id:\s*{product_id},\r?\n)', re.MULTILINE)
    match = marker_re.search(products)
    if not match:
        raise SystemExit(f'Could not find product id {product_id}')

    # Avoid duplicate insertion if the helper is ever re-run.
    next_chunk = products[match.end():match.end() + 180]
    if 'addedAt:' in next_chunk:
        continue

    indent = re.match(r'^[ \t]*', match.group(1)).group(0)
    timestamp = f'{BOOTSTRAP_BASE}{offset:02d}.000Z'
    products = products[:match.end()] + f'{indent}addedAt: "{timestamp}",{nl}' + products[match.end():]

if len(re.findall(r'\baddedAt\s*:', products)) != 16:
    raise SystemExit('Expected exactly 16 bootstrap addedAt fields in product catalog')
if re.search(r'\bisNew\s*:\s*true', products):
    raise SystemExit('Old product isNew flags still remain')
write_preserved(PRODUCTS, products)


# 2) Shop/Home: derive Just In from addedAt, capped at 16.
app = read_preserved(APP)
nl = newline_for(app)
old_key = f'const SHOP_NEW_PRODUCTS_SEEN_KEY = "playnice_seen_new_products_signature";{nl}'
if old_key not in app:
    raise SystemExit('Could not find SHOP_NEW_PRODUCTS_SEEN_KEY anchor')

helper_block = (
    old_key
    + nl
    + f'const JUST_IN_LIMIT = 16;{nl}'
    + nl
    + f'const getJustInProducts = (items = []) =>{nl}'
    + f'  [...items]{nl}'
    + f'    .filter((product) => Boolean(product?.addedAt)){nl}'
    + f'    .sort((a, b) => {{{nl}'
    + f'      const dateDifference ={nl}'
    + f'        new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();{nl}'
    + f'      return dateDifference || Number(b.id || 0) - Number(a.id || 0);{nl}'
    + f'    }}){nl}'
    + f'    .slice(0, JUST_IN_LIMIT);{nl}'
    + nl
    + f'const JUST_IN_PRODUCT_IDS = new Set({nl}'
    + f'  getJustInProducts(products).map((product) => String(product.id)){nl}'
    + f');{nl}'
    + nl
    + f'const isJustInProduct = (product) =>{nl}'
    + f'  JUST_IN_PRODUCT_IDS.has(String(product?.id ?? ""));{nl}'
)
app = app.replace(old_key, helper_block, 1)

old_signature = (
    f'const getNewProductsSignature = (items = []) => {{{nl}'
    + f'  return items{nl}'
    + f'    .filter((product) => product.isNew){nl}'
    + f'    .map((product) => String(product.id)){nl}'
    + f'    .sort(){nl}'
    + f'    .join("|");{nl}'
    + f'}};'
)
new_signature = (
    f'const getNewProductsSignature = (items = []) =>{nl}'
    + f'  getJustInProducts(items){nl}'
    + f'    .map((product) => String(product.id)){nl}'
    + f'    .join("|");'
)
if old_signature not in app:
    raise SystemExit('Could not find old getNewProductsSignature implementation')
app = app.replace(old_signature, new_signature, 1)

old_arrivals = (
    f'const newArrivalProducts = [...products]{nl}'
    + f'  .filter((product) => product.isNew === true){nl}'
    + f'  .reverse();'
)
new_arrivals = 'const newArrivalProducts = getJustInProducts(products);'
if old_arrivals not in app:
    raise SystemExit('Could not find old newArrivalProducts implementation')
app = app.replace(old_arrivals, new_arrivals, 1)

old_card_guard = 'if (!product?.isNew || !newProductsSignature) return;'
if old_card_guard not in app:
    raise SystemExit('Could not find product card new-product guard')
app = app.replace(old_card_guard, 'if (!isJustInProduct(product) || !newProductsSignature) return;', 1)

old_badge = '{product.isNew && ('
if old_badge not in app:
    raise SystemExit('Could not find product Just In badge condition')
app = app.replace(old_badge, '{isJustInProduct(product) && (', 1)

if 'product.isNew' in app or 'product?.isNew' in app:
    raise SystemExit('A product isNew reference still remains in App.js')
write_preserved(APP, app)


# 3) Control Center: every newly created catalog product gets addedAt automatically.
engine = read_preserved(ENGINE)
nl = newline_for(engine)
old_sig = 'function renderProductObject(p, id) {'
if old_sig not in engine:
    raise SystemExit('Could not find renderProductObject signature')
engine = engine.replace(old_sig, 'function renderProductObject(p, id, addedAt = new Date().toISOString()) {', 1)

old_render_start = '  return `  {\\n    id: ${id},\\n    slug: ${js(p.slug)},'
new_render_start = '  return `  {\\n    id: ${id},\\n    addedAt: ${js(addedAt)},\\n    slug: ${js(p.slug)},'
if old_render_start not in engine:
    raise SystemExit('Could not find renderProductObject output anchor')
engine = engine.replace(old_render_start, new_render_start, 1)
write_preserved(ENGINE, engine)


# 4) Contract coverage for automatic timestamp generation.
test = read_preserved(TEST)
nl = newline_for(test)
anchor = f'if(!nextIndex.includes(`id: ${{expected}},`)) throw new Error("New product id is not max+1.");{nl}'
if anchor not in test:
    raise SystemExit('Could not find new-product id assertion')
assertion = (
    anchor
    + f'const renderedWithDate=__test.renderProductObject(p,expected,"2026-09-03T20:00:00.000Z");{nl}'
    + f'if(!renderedWithDate.includes(\'addedAt: "2026-09-03T20:00:00.000Z"\')) throw new Error("New product addedAt is not generated.");{nl}'
)
test = test.replace(anchor, assertion, 1)
log_anchor = f'console.log("PASS  catalog insertion assigns max+1 id");{nl}'
if log_anchor not in test:
    raise SystemExit('Could not find test log anchor')
test = test.replace(log_anchor, log_anchor + f'console.log("PASS  new product receives automatic addedAt timestamp");{nl}', 1)
write_preserved(TEST, test)

print('Just In automation patch applied.')
print('Bootstrap Just In ids:', ', '.join(map(str, BOOTSTRAP_IDS)))
