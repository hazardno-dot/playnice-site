// Preview-only Day/Night atmosphere. Loaded solely via guarded dynamic import
// from src/index.js on a non-production host with ?atmospherePreview=1.
import "./DayNightPreview.css";

const MODES = new Set(["day", "night", "off"]);
const STORAGE_KEY = "playnice_atmosphere_day_night_preview";

const params = new URLSearchParams(window.location.search);
const host = window.location.hostname.toLowerCase();
const production = host === "playniceshop.me" || host === "www.playniceshop.me";
if (!production && params.get("atmospherePreview") === "1") {
  const root = document.documentElement;
  const stored = (() => {
    try { return window.sessionStorage.getItem(STORAGE_KEY); } catch { return null; }
  })();
  const initial = MODES.has(params.get("mood")) ? params.get("mood") : (MODES.has(stored) ? stored : "night");
  root.classList.add("pn-atmosphere-preview");

  const controls = document.createElement("div");
  controls.className = "pn-atmosphere-controls";
  controls.setAttribute("role", "group");
  controls.setAttribute("aria-label", "PlayNice Atmosphere test — samo preview");
  const title = document.createElement("span");
  title.textContent = "Atmosphere · test";
  controls.appendChild(title);
  const buttons = {};
  function setMood(mode) {
    if (!MODES.has(mode)) return;
    if (mode === "off") {
      root.removeAttribute("data-pn-mood");
      root.classList.remove("pn-atmosphere-preview");
    } else {
      root.classList.add("pn-atmosphere-preview");
      root.setAttribute("data-pn-mood", mode);
    }
    for (const [value, button] of Object.entries(buttons)) {
      button.setAttribute("aria-pressed", String(value === mode));
    }
    try { window.sessionStorage.setItem(STORAGE_KEY, mode); } catch {}
  }
  for (const [mode, label] of [["night", "Noć"], ["day", "Dan"], ["off", "Bez atmosfere"]]) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = label;
    button.setAttribute("aria-pressed", "false");
    button.addEventListener("click", () => setMood(mode));
    controls.appendChild(button);
    buttons[mode] = button;
  }
  document.body.appendChild(controls);
  // Controls remain visible when mode is off; only background theming is removed.
  // Re-enable prototype CSS for the controls independently of the mode.
  controls.style.cssText = "position:fixed;z-index:2147483000;bottom:max(12px,env(safe-area-inset-bottom));left:12px;display:flex;gap:8px;flex-wrap:wrap;max-width:calc(100vw - 24px);padding:10px;background:rgba(14,16,20,.96);border:1px solid rgba(219,181,113,.35);border-radius:12px;color:#eee7dc;font:12px Inter,system-ui,sans-serif";
  setMood(initial);
}
