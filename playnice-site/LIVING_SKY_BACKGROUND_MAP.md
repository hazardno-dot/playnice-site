# PlayNice — Living Sky & Background Surface Map

> **Purpose:** Single reference for the site-wide background system, route-specific overrides, responsive layers, and future seasonal effects.
>
> **Scope:** `playnice-site/` (paths below are relative to this directory). Prepared during Draft PR #572; PDP and Exhibition outro changes in that PR are **pending Preview QA and merge**, not yet Production-confirmed. The previous Living Sky work in PRs #567, #568, #570 and #571 has been merged. Verify against `main` again after future changes.

## 1. Mental model: one atmosphere, several surfaces

```text
public/index.html             first browser paint before React
        |
src/index.js                  loads Living Sky before React render
        |
features/atmosphere/
  solarCycle.js               solar altitude + interpolated palette
  DayNightPreview.js          state, location, variables, enable/disable
  DayNightPreview.css         shared .app-shell background, stars, QA panel
        |
src/App.js                    .app-shell (home / journal / exhibition / other routes)
        |
  +-- Home / Shop / Journal   inherited shared background
  +-- Exhibition             local page, mobile header, final outro, gallery modal
  +-- PDP                    desktop route override + mobile page canvas
        |
  Dark product/photo panels, overlays, and gallery viewers remain separate.
```

**Single source of truth:** The solar palette is calculated once by `solarCycle.js` and applied as root CSS custom properties from `DayNightPreview.js`. Route-specific backgrounds should **expose** the shared shell, not calculate their own solar colors or duplicate the atmospheric gradient.

The first-paint HTML contains a **temporary**, client-clock-based palette that is replaced by the actual solar calculation on JavaScript startup. It must remain lightweight and run before React loads; do not mistake it for the canonical solar engine.

## 2. Authoritative file map

| Area | File | What it controls / pitfalls |
| --- | --- | --- |
| First browser paint | `public/index.html` | Inline critical CSS and synchronous script set the atmosphere class, `data-pn-sky`, temporary CSS variables, and gradient on `html`, `body`, `#root`, `.app-shell` before React. Prevents the black frame on ordinary/hard refresh. |
| App entry | `src/index.js` | Static import of `features/atmosphere/DayNightPreview` before first React render. Never revert to late dynamic import without testing first paint. |
| Solar engine | `src/features/atmosphere/solarCycle.js` | Solar altitude, phase palettes and interpolation; **not** weather forecasting. Edit here for actual time-of-day palette behavior. |
| State / coordinates | `src/features/atmosphere/DayNightPreview.js` | Production/Preview gate, Off/On, CSS variables, approximate-location endpoint `/api/atmosphere-location`, fallback Tivat, minute updates, preview QA slider. |
| Shared sky layer | `src/features/atmosphere/DayNightPreview.css` | `html.pn-atmosphere-preview[data-pn-sky="active"] .app-shell`: global gradient; `.app-shell::before`: star points. Shared sky is the preferred visible page background. |
| App route shell | `src/App.js` | Chooses `.app-shell--home`, `.app-shell--exhibition`, `.app-shell--journal` or plain `.app-shell`. PDP is also mounted inside the app shell; look at route-specific body class below. |
| Baseline shell | `src/App.css` | `body`, `.app-shell`, `.app-shell--home` default Off colors and shared layout. These are intentionally distinct from active Living Sky. |
| Color harmonization | `src/shared/theme/ColorHarmonizationV1.css` | Older default/Off `.app-shell` and local Shop surfaces. Beware cascade and import order when changing backgrounds. |
| Atmosphere toggle | `src/features/header/HeaderNext.js` | Desktop Discover and mobile menu toggle; dispatches `playnice:atmosphere-change` and persists choice. |
| Desktop Discover cleanup | `src/features/header/DesktopDiscoverCleanup.css` | Hides only the redundant Scent Request entry by class, not the last row; avoid `:last-child` rules that hide Atmosphere. |
| Mobile menu order | `src/mobile-v2/navigation/MobileMenuContact.css` | Portal-injected Catalog/Support and flex order placing language + atmosphere at bottom; not the solar background itself. |
| Mobile header geometry | `src/mobile-v2/navigation/MobileHeaderV2.css` | Header/menu presentation. Dark menu surfaces are intentional and distinct from page sky. |
| Exhibition main | `src/features/exhibition/Exhibition.css` | `.exhibition-page` default opaque `#080808` and active transparent override. |
| Exhibition mobile header | `src/features/exhibition/Exhibition.css` | At `max-width:800px`, legacy `.app-shell--exhibition .header-system` forces dark; active rule makes header wrapper transparent. |
| Exhibition shell | `src/features/exhibition/Exhibition.css` | Legacy `.app-shell--exhibition` `#080808`, with mobile override. Check specificity and the global sky's gradient before editing. |
| Exhibition ending | `src/features/exhibition/Exhibition.css` | `.exhibition-outro` default opaque `#080808`; active transparent override added on PR #572 (**pending QA/merge**). |
| Exhibition mobile spacing | `src/mobile-v2/content/MobileExhibitionV2.css` | Mobile padding, rhythm, final CTA spacing. Currently not a source of the opaque background, but always check before changing mobile Exhibition. |
| Exhibition lightbox | `src/features/exhibition/Exhibition.css` | `.exhibition-viewer` opaque near-black by design. **Do not** replace with sky; artwork viewing requires contrast. |
| Exhibition body | `src/features/exhibition/Exhibition.css` | `body.exhibition-active` also declares `#080808`; if a future seam remains, inspect this alongside inherited active `body` CSS rather than blindly overriding. |
| Desktop PDP base | `src/desktop-product-page/DesktopProductPage.css` | `.desktop-product-page` default `#090909`; product imagery and detailed panel surfaces. |
| Desktop PDP overrides | `src/desktop-product-page/DesktopProductPageOverrides.css` | Legacy `body.desktop-product-route-active` forced `#050505 !important` across html/body/root/shell/main/header/footer/PDP. PR #572 gates this forcing to Atmosphere Off and makes outer PDP canvas transparent when On (**pending QA/merge**). |
| Mobile PDP | `src/mobile-v2/product-page/MobileProductPage.css` | `.mobile-product-page` has its own warm black page canvas. PR #572 makes **only the outer page** transparent when On; bottle stage, note map and buying controls stay dark (**pending QA/merge**). |
| Mobile first paint / performance | `src/mobile-v2/home/MobileFirstPaintContainment.css` | Content visibility and deferred painting of deeper Home sections; not Living Sky palette. May affect visual timing when troubleshooting. |

**Other page elements:** dark cards, hero imagery, CTA blocks, sticky bars, navigation menus, photo stages and modal overlays can intentionally differ from the ambient background. Do not flatten all `background` declarations across the app.

## 3. Existing on/off and preview contract

- **Enabled on Production:** `playniceshop.me` and `www.playniceshop.me`.
- **Opt-in on Preview:** append `?atmospherePreview=1` to the Preview URL. Append `&atmosphereCleanPreview=1` to hide the floating *Preview-only QA panel* while retaining Living Sky.
- **Off preference:** Production uses `localStorage["playnice_living_sky_enabled"]`; Preview uses `sessionStorage["playnice_living_sky_preview"]`. Stored `"off"` disables the atmosphere. The menu writes `"auto"` when enabled.
- **Active selector:** `html.pn-atmosphere-preview[data-pn-sky="active"]`. All page-specific sky-reveal overrides must be scoped by the active state. Do not make Off mode inadvertently transparent.
- **Root variables:** `--sky-base`, `--sky-top`, `--sky-glow`, `--sky-star-opacity`, `--sky-warm-opacity`. Actual values are written by `DayNightPreview.js`.
- **Location:** `/api/atmosphere-location` returns approximate visitor location when possible. Tivat fallback is defined in `DayNightPreview.js`; this is a **solar**, not live-weather, atmosphere.

## 4. Page/surface matrix

| Surface | Atmosphere On | Atmosphere Off | Visual QA |
| --- | --- | --- | --- |
| Home | Shared app-shell Living Sky | Existing dark Home palette | Desktop + Android + normal/hard refresh |
| Shop | Shared app-shell Living Sky | Existing dark Shop/shell palette | Search/filter, product navigation, refresh |
| Le Journal | Shared app-shell Living Sky | Original dark palette | Index and article if applicable |
| Exhibition main | Transparent page reveals shell sky | Original `#080808` | Desktop + mobile |
| Exhibition mobile header | Transparent wrapper reveals sky | Original dark header strip | <=800px; closed/open menu |
| Exhibition ending / final CTA | Transparent, inherits sky (**PR #572**) | Opaque `#080808` | End of long page |
| Exhibition lightbox | Intentionally near-black | Near-black | Open an image/video |
| Desktop PDP outer page | Sky visible behind content (**PR #572**) | Original black canvas | >=769px; photo panel stays dark |
| Mobile PDP outer page | Sky visible behind content (**PR #572**) | Original dark canvas | <=640px; bottle/card contrast |
| PDP image/card/modal | Remains separately dark | Dark | No accidental transparency |
| Navigation/menu overlays | Independently dark for readability | Independently dark | Dropdown + mobile sheet |

**Breakpoint risk:** Desktop PDP overrides start at **769px**; Mobile PDP base styles are under **640px**. Intermediate widths (641–768px) need explicit viewport testing and investigation of any other route CSS rather than assumptions.

## 5. How to add seasons and future visual weather without re-fragmenting the site

### Separation of concerns

1. **Solar base layer (current):** day/night color cycle; owns global palette, independent of season and weather.
2. **Seasonal appearance (future proposal, not implemented):** spring/summer/autumn/winter palette accents or texture. Choose data/state centrally; render a single shared layer. Do not add route-local leaf/snow/sky palettes.
3. **Weather effects (future proposal, not implemented):** particles for rain, snow, falling leaves, clouds, etc. Treat actual weather input as a separate feature with explicit source, permissions and fallback; the existing solar calculator does **not** know whether it is raining.
4. **Protected UI surfaces:** product media, CTAs, size/price controls, checkout, gallery lightboxes, nav overlays, forms remain legible and interactive regardless of atmosphere or particles.

### Suggested architecture (design proposal, not current source files)

```text
Atmosphere state
  solar phase (existing) + season (future) + weather mode (future)
        |
  shared visual tokens and one page-wide decorative overlay
        |
  all app-shell routes (with local canvas backgrounds transparent when active)
        |
  readable, protected UI panels above the decorative layer
```

Keep the ambient layer non-interactive (`pointer-events: none`), below clickable controls, and honor `prefers-reduced-motion`. Avoid layout shifts, excessive GPU load, blocking initial content, hardcoded location assumptions, and changing stock/order flows. Consider opt-in for animated effects; measure low-end Android performance and battery.

**Do not** create a separate snow animation inside Exhibition, another rain animation inside PDP, and another in Shop. The existing fragmented *canvas* CSS should be mapped and normalized first, but site-wide behavior should be implemented once.

## 6. Safe change procedure (every atmosphere change)

1. **Inventory first:** inspect this map, active selectors, and changes to `background`, `background-image`, `html`, `body`, `#root`, `.app-shell`, route page wrappers, and `!important` declarations. Prefer selectors scoped to On.
2. **Decide which layer owns the change:** astronomical palette -> `solarCycle.js`; runtime state -> `DayNightPreview.js`; common sky CSS -> `DayNightPreview.css`; first paint -> `public/index.html`; local opaque canvas -> the owning route CSS.
3. **Avoid global overrides:** make only the page *canvas* transparent while active. Preserve product/checkout cards, images, exhibition modal viewers and navigation menu backgrounds.
4. **Create a Draft PR** from fresh `main`; no Production writes. Review diff; prevent unrelated styling changes.
5. **Use one verified Preview SHA:** desktop and mobile, especially 390px, 427px, 640px, 768px, 769px, 800px, 900px and wider desktops. Do not assume Vercel Ready verifies visuals.
6. **Test state:** Atmosphere On/Off, persistence across reload and page navigation, desktop/menu toggle, non-opted-in Preview.
7. **Test loading:** F5, Ctrl+Shift+R, direct page entry, slow/cold load; verify no black first-frame or inconsistent header strip.
8. **Test all routes:** Home, Shop, Journal, Exhibition (top, mobile header, bottom CTA, modal), desktop/mobile PDP (image, prices, size, cart, note map).
9. **Only after approval:** merge, match Production SHA to merged commit, verify public domains, and then remove the merged branch.
10. **Update this map** whenever a route adds a new opaque full-page background, a seasonal effect or a new responsive override.

## 7. Search shortcuts for future audits

```bash
# Run from playnice-site/ (read-only investigation)
rg -n 'background(-image|-color)?\s*:|--exhibition-bg' src/features/exhibition src/desktop-product-page src/mobile-v2/product-page
rg -n 'app-shell|desktop-product-route-active|exhibition-active|data-pn-sky|pn-atmosphere-preview' src public/index.html
rg -n 'background.*!important|background-image:\s*none\s*!important' src
rg -n 'playnice_living_sky_|atmospherePreview|atmosphereCleanPreview|playnice:atmosphere-change' src public/index.html
```

## 8. Change history / checkpoints

- **PR #567:** Living Sky 24-hour solar cycle on Production.
- **PR #568:** Atmosphere On/Off moved into navigation; removed floating Production control.
- **PR #570:** Exhibition page + mobile header transparency and earlier static JS import for sky.
- **PR #571:** Critical pre-React `html`/`body` first-paint handling for normal/hard refresh.
- **PR #572 (Draft at writing):** Desktop/mobile PDP canvas and Exhibition final outro sky reveal; this document.

**Rule for future work:** When a new background seam appears, identify which element draws the opaque rectangle and update that one route-scoped canvas. Do not rebuild the sky engine or create independent per-page seasonal modes.
