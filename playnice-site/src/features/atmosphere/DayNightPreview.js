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
      // Keep opt-in class for test controls; no background selectors match "off".
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
  setMood(initial);
}
