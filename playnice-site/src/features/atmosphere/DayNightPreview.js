// PlayNice Living Sky: automatic on production; manual QA on opted-in previews.
// Six solar phases follow actual solar altitude; manual slider is for visual QA.
import "./DayNightPreview.css";
import { atmosphere } from "./solarCycle";

const params = new URLSearchParams(window.location.search);
const host = window.location.hostname.toLowerCase();
const production = host === "playniceshop.me" || host === "www.playniceshop.me";
const preview = !production && params.get("atmospherePreview") === "1";
if (production || preview) {
  const root = document.documentElement;
  const STORAGE_KEY = production ? "playnice_living_sky_enabled" : "playnice_living_sky_preview";
  const FALLBACK = { latitude: 42.4304, longitude: 18.6967, city: "Tivat", timezone: "Europe/Podgorica", source: "fallback-tivat" };
  let location = { ...FALLBACK };
  let mode = "auto";
  let manualMinute = 720;
  let refreshTimer = null;
  const stored = (() => { try {return (production ? localStorage : sessionStorage).getItem(STORAGE_KEY);} catch {return null;} })();
  if (stored === "off") mode = "off";
  root.classList.add("pn-atmosphere-preview");

  const controls = document.createElement("div");
  controls.className = "pn-atmosphere-controls";
  controls.setAttribute("role", "group");
  controls.setAttribute("aria-label", production ? "Upravljanje PlayNice atmosferom" : "PlayNice Living Sky — preview test");
  controls.innerHTML = production ? "" : `
    <div class="pn-head">
      <strong>Living Sky · 24h</strong>
      <span class="pn-hint">Preview only</span>
    </div>
    <div class="pn-actions">
      <button type="button" data-mode="auto">Automatski</button>
      <button type="button" data-mode="manual">Ručno 24h</button>
      <button type="button" data-mode="off">Isključeno</button>
    </div>
    <label class="pn-slider" for="pn-solar-slider">
      <span id="pn-solar-label">Vreme: 12:00</span>
      <input id="pn-solar-slider" type="range" min="0" max="1439" step="5" value="720">
    </label>
    <div class="pn-status" role="status" aria-live="polite">Priprema solarnog ciklusa…</div>
  `;
  if (!production) document.body.appendChild(controls);
  const slider=controls.querySelector("#pn-solar-slider");
  const sliderLabel=controls.querySelector("#pn-solar-label");
  const status=controls.querySelector(".pn-status");
  const buttons=Array.from(controls.querySelectorAll("[data-mode]"));


  const rgb=values=>`rgb(${values.join(" ")})`;
  const pad=v=>String(v).padStart(2,"0");
  const minuteText=m=>`${pad(Math.floor(m/60))}:${pad(m%60)}`;
  function localParts(date,timezone) {
    try {
      const parts=new Intl.DateTimeFormat("en-GB", {
        timeZone:timezone,hour:"2-digit",minute:"2-digit",hourCycle:"h23"
      }).formatToParts(date);
      const get=t=>Number(parts.find(part=>part.type===t)?.value||0);
      return get("hour")*60+get("minute");
    } catch {return date.getHours()*60+date.getMinutes();}
  }
  const PHASE_NAMES={
    night:"Duboka noć",dawn:"Svitanje",sunrise:"Izlazak sunca",
    day:"Dan",sunset:"Zalazak sunca",blue:"Plavi sat"
  };
  function simulateAt(minute) {
    // Convert location-local wall clock offset to instant near current local day.
    const now=new Date();
    const delta=minute-localParts(now,location.timezone);
    return new Date(now.getTime()+delta*60000);
  }
  function apply() {
    buttons.forEach(button=>button.setAttribute("aria-pressed",String(button.dataset.mode===mode)));

    if (slider) slider.disabled=mode!=="manual";
    if (sliderLabel) sliderLabel.textContent=`Vreme: ${minuteText(manualMinute)}`;
    if(mode==="off"){
      root.removeAttribute("data-pn-sky");
      root.style.removeProperty("--sky-base");
      root.style.removeProperty("--sky-top");
      root.style.removeProperty("--sky-glow");
      root.style.removeProperty("--sky-star-opacity");
      root.style.removeProperty("--sky-warm-opacity");
      if (status) status.textContent="Atmosfera isključena · originalna pozadina";
      return;
    }
    const date=mode==="auto"?new Date():simulateAt(manualMinute);
    const solar=atmosphere(date,location.latitude,location.longitude);
    root.setAttribute("data-pn-sky","active");
    root.style.setProperty("--sky-base",rgb(solar.colors.base));
    root.style.setProperty("--sky-top",rgb(solar.colors.top));
    root.style.setProperty("--sky-glow",rgb(solar.colors.glow));
    root.style.setProperty("--sky-star-opacity",solar.colors.stars.toFixed(3));
    root.style.setProperty("--sky-warm-opacity",solar.colors.warm.toFixed(3));
    const locationLabel=location.source==="approximate-ip"
      ? `Približno: ${location.city}` : "Rezervna lokacija: Tivat";
    const clock=mode==="auto"?minuteText(localParts(date,location.timezone)):minuteText(manualMinute);
    if (status) status.textContent=`${PHASE_NAMES[solar.phase]} · ${clock} · ${locationLabel}`;
  }

  buttons.forEach(button=>button.addEventListener("click",()=>{
    mode=button.dataset.mode;
    if(mode==="manual"){
      manualMinute=Math.floor(localParts(new Date(),location.timezone)/5)*5;
      if (slider) slider.value=manualMinute;
    }
    try{(production ? localStorage : sessionStorage).setItem(STORAGE_KEY,mode==="off"?"off":"auto");}catch{}
    apply();
  }));
  window.addEventListener("playnice:atmosphere-change",(event)=>{
    if (!production) return;
    mode=event.detail?.enabled===false?"off":"auto";
    apply();
  });
  window.addEventListener("storage",(event)=>{
    if (!production || event.key!==STORAGE_KEY) return;
    mode=event.newValue==="off"?"off":"auto";
    apply();
  });
  if (slider) slider.addEventListener("input",()=>{
    manualMinute=Number(slider.value);
    if(mode!=="manual")mode="manual";
    apply();
  });
  // Update actual solar time every minute; no frame-by-frame animation needed.
  refreshTimer=window.setInterval(()=>{if(!document.hidden)apply();},60000);
  document.addEventListener("visibilitychange",()=>{if(!document.hidden)apply();});
  manualMinute=Math.floor(localParts(new Date(),location.timezone)/5)*5;
  if (slider) slider.value=manualMinute;
  apply();

  async function loadLocation(){
    try{
      const controller=new AbortController();
      const timeout=setTimeout(()=>controller.abort(),5000);
      let res;
      try{res=await fetch("/api/atmosphere-location",{cache:"no-store",signal:controller.signal});}
      finally{clearTimeout(timeout);}
      if(!res.ok)throw new Error("Location endpoint unavailable");
      const data=await res.json();
      if(!Number.isFinite(data.latitude)||!Number.isFinite(data.longitude)||
         Math.abs(data.latitude)>90||Math.abs(data.longitude)>180)throw new Error("Invalid coordinates");
      location={latitude:data.latitude,longitude:data.longitude,
        timezone:typeof data.timezone==="string"?data.timezone:FALLBACK.timezone,
        city:typeof data.city==="string"?data.city:FALLBACK.city,
        source:data.source==="approximate-ip"?"approximate-ip":"fallback-tivat"};
    }catch{location={...FALLBACK};}
    if(mode==="auto"){
      manualMinute=Math.floor(localParts(new Date(),location.timezone)/5)*5;
      if (slider) slider.value=manualMinute;
    }
    apply();
  }
  loadLocation();
}
