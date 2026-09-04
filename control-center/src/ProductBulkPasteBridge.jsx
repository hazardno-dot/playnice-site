import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import "./product-bulk-paste.css";

const normalize = (value) => String(value || "")
  .trim()
  .toLowerCase()
  .replace(/[·]/g, " ")
  .replace(/[^a-z0-9]+/g, "_")
  .replace(/^_+|_+$/g, "");

const alias = {
  name: "name",
  shortname: "short_name",
  short_name: "short_name",
  category: "category",
  image: "image_path",
  imagepath: "image_path",
  image_path: "image_path",
  inspiredbyname: "inspired_by_name",
  inspired_by_name: "inspired_by_name",
  inspiredbyshort: "inspired_by_short",
  inspired_by_short: "inspired_by_short",
  badge: "badge_optional",
  rating: "rating",
  ratinglabel: "rating_label",
  rating_label: "rating_label",
  season: "season",
  moods: "moods_comma_separated",
  topnotes: "top_notes_comma_separated",
  top_notes: "top_notes_comma_separated",
  heartnotes: "heart_notes_comma_separated",
  heart_notes: "heart_notes_comma_separated",
  basenotes: "base_notes_comma_separated",
  base_notes: "base_notes_comma_separated",
  recommendations: "recommendation_slugs_3_comma_separated",
  recommendationslugs: "recommendation_slugs_3_comma_separated",
  recommendation_slugs: "recommendation_slugs_3_comma_separated",
  minitagsr: "mini_tag_sr",
  mini_tag_sr: "mini_tag_sr",
  minitagen: "mini_tag_en",
  mini_tag_en: "mini_tag_en",
  scenttypesr: "scent_type_sr",
  scent_type_sr: "scent_type_sr",
  scenttypeen: "scent_type_en",
  scent_type_en: "scent_type_en",
  cardcopysr: "card_copy_sr",
  card_copy_sr: "card_copy_sr",
  cardcopyen: "card_copy_en",
  card_copy_en: "card_copy_en",
  modalcopysr: "modal_copy_sr",
  modal_copy_sr: "modal_copy_sr",
  modalcopyen: "modal_copy_en",
  modal_copy_en: "modal_copy_en",
  dominantnotessr: "dominant_notes_comma_separated_sr",
  dominant_notes_sr: "dominant_notes_comma_separated_sr",
  dominantnotesen: "dominant_notes_comma_separated_en",
  dominant_notes_en: "dominant_notes_comma_separated_en",
  tagssr: "tags_comma_separated_sr",
  tags_sr: "tags_comma_separated_sr",
  tagsen: "tags_comma_separated_en",
  tags_en: "tags_comma_separated_en",
  whychoosesr: "why_choose_sr",
  why_choose_sr: "why_choose_sr",
  whychooseen: "why_choose_en",
  why_choose_en: "why_choose_en",
  wearsr: "wear_sr",
  wear_sr: "wear_sr",
  wearen: "wear_en",
  wear_en: "wear_en"
};

const discoveryKeys = new Set([
  "freshness","sweetness","warmth","darkness","airiness","cleanliness","creaminess","dryness","fruitiness","spiciness","woodiness","aromaticity","florality","gourmandness","citrus","aquatic","powdery","projection","longevity","office","casual","date"
]);

function flattenJson(input, out = {}, prefix = "") {
  Object.entries(input || {}).forEach(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) flattenJson(value, out, path);
    else out[path] = Array.isArray(value) ? value.join(", ") : value;
  });
  return out;
}

function normalizeKey(rawKey) {
  const raw = String(rawKey || "").trim();
  const lower = raw.toLowerCase();
  const sizeMatch = lower.match(/^(?:sizes?[._-]?)?(\d+(?:\.\d+)?)\s*ml$/i);
  if (sizeMatch) return `size:${sizeMatch[1]}ml`;

  const stripped = lower
    .replace(/^core[._-]/, "")
    .replace(/^copy[._-]/, "")
    .replace(/^wear[._-]/, "wear_")
    .replace(/^discovery[._-]/, "")
    .replace(/^notemap[._-]/, "")
    .replace(/^note_map[._-]/, "")
    .replace(/^inspiredby[._-]/, "inspired_by_")
    .replace(/^inspired_by[._-]/, "inspired_by_");

  const key = normalize(stripped).replace(/_+/g, "_");
  if (alias[key]) return alias[key];
  if (discoveryKeys.has(key)) return `discovery:${key}`;
  if (key === "top") return "top_notes_comma_separated";
  if (key === "heart") return "heart_notes_comma_separated";
  if (key === "base") return "base_notes_comma_separated";
  return key;
}

function parseSource(source) {
  const trimmed = source.trim();
  const entries = [];
  const invalid = [];
  if (!trimmed) return { entries, invalid: ["empty input"] };

  if (trimmed.startsWith("{")) {
    try {
      const flat = flattenJson(JSON.parse(trimmed));
      Object.entries(flat).forEach(([key, value]) => entries.push([normalizeKey(key), value]));
      return { entries, invalid };
    } catch {
      return { entries: [], invalid: ["invalid JSON"] };
    }
  }

  trimmed.split(/\r?\n/).forEach((line) => {
    const clean = line.trim();
    if (!clean || clean.startsWith("#")) return;
    const match = clean.match(/^([^:=]+?)\s*[:=]\s*(.*)$/);
    if (!match) { invalid.push(clean); return; }
    entries.push([normalizeKey(match[1]), match[2].trim()]);
  });
  return { entries, invalid };
}

function setNativeValue(element, value) {
  const proto = element instanceof HTMLTextAreaElement
    ? window.HTMLTextAreaElement.prototype
    : element instanceof HTMLSelectElement
      ? window.HTMLSelectElement.prototype
      : window.HTMLInputElement.prototype;
  const descriptor = Object.getOwnPropertyDescriptor(proto, "value");
  descriptor?.set?.call(element, String(value ?? ""));
  element.dispatchEvent(new Event("input", { bubbles: true }));
  element.dispatchEvent(new Event("change", { bubbles: true }));
}

function findFieldMap(root) {
  const map = new Map();
  root.querySelectorAll(".edit-field").forEach((field) => {
    const label = field.querySelector(":scope > span")?.textContent;
    const control = field.querySelector("input, textarea, select");
    if (label && control) map.set(normalize(label), control);
  });
  return map;
}

function addOrSetSize(root, size, price, fieldMap) {
  const existing = fieldMap.get(normalize(size));
  if (existing) { setNativeValue(existing, price); return true; }

  const composer = root.querySelector(".size-composer");
  if (!composer) return false;
  const inputs = composer.querySelectorAll("input");
  const addButton = composer.querySelector("button");
  if (inputs.length < 2 || !addButton) return false;
  setNativeValue(inputs[0], size);
  setNativeValue(inputs[1], price);
  addButton.click();
  return true;
}

export default function ProductBulkPasteBridge() {
  const [slot, setSlot] = useState(null);
  const [source, setSource] = useState("");
  const [message, setMessage] = useState("");
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    const main = document.querySelector(".main-stage");
    if (!main) return;
    const sync = () => {
      const editor = main.querySelector(".product-detail.edit-mode");
      if (!editor) { setSlot(null); return; }
      let host = editor.querySelector(":scope > #product-bulk-paste-slot");
      if (!host) {
        host = document.createElement("div");
        host.id = "product-bulk-paste-slot";
        const warning = editor.querySelector(":scope > .draft-warning");
        if (warning) warning.insertAdjacentElement("afterend", host);
        else editor.prepend(host);
      }
      setSlot(host);
    };
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(main, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  const preview = useMemo(() => parseSource(source), [source]);

  const apply = () => {
    const root = document.querySelector(".product-detail.edit-mode");
    if (!root) { setMessage("Product editor is not available."); return; }
    const fieldMap = findFieldMap(root);
    const unknown = [];
    const invalidValues = [];
    let applied = 0;

    preview.entries.forEach(([key, rawValue]) => {
      if (key.startsWith("size:")) {
        const size = key.slice(5);
        const number = Number(rawValue);
        if (!Number.isFinite(number) || number < 0) { invalidValues.push(size); return; }
        if (addOrSetSize(root, size, rawValue, fieldMap)) applied += 1;
        else unknown.push(key);
        return;
      }

      if (key.startsWith("discovery:")) {
        const discoveryKey = key.slice(10);
        const number = Number(rawValue);
        if (!Number.isFinite(number) || number < 0 || number > 10) { invalidValues.push(discoveryKey); return; }
        const control = fieldMap.get(normalize(discoveryKey));
        if (!control) unknown.push(discoveryKey);
        else { setNativeValue(control, rawValue); applied += 1; }
        return;
      }

      const control = fieldMap.get(key);
      if (!control) { unknown.push(key); return; }
      setNativeValue(control, rawValue);
      applied += 1;
    });

    const parts = [`${applied} fields applied`];
    if (preview.invalid.length) parts.push(`${preview.invalid.length} malformed lines`);
    if (invalidValues.length) parts.push(`${invalidValues.length} invalid values`);
    if (unknown.length) parts.push(`${unknown.length} unknown keys`);
    setMessage(`${parts.join(" · ")}. Nothing was saved. Review live validation, then Save Draft.`);
  };

  if (!slot) return null;
  return createPortal(
    <section className={`product-bulk-paste ${expanded ? "is-open" : ""}`}>
      <div className="product-bulk-paste-head">
        <div>
          <span className="eyebrow">FAST ENTRY / DRAFT ONLY</span>
          <strong>Bulk product input</strong>
          <p>Paste one complete product block. CC fills matching fields; Save Draft remains a separate explicit action.</p>
        </div>
        <button type="button" className="secondary-btn" onClick={() => setExpanded((value) => !value)}>{expanded ? "Collapse" : "Open"}</button>
      </div>
      {expanded ? <>
        <textarea
          value={source}
          onChange={(event) => { setSource(event.target.value); setMessage(""); }}
          spellCheck="false"
          placeholder={"name: Brand Fragrance Eau De Parfum\nshortName: Fragrance\ncategory: Arabian\nimage: /products/brand-fragrance.webp\n5ml: 5\n10ml: 9\n20ml: 17\ntopNotes: bergamot, cardamom\nheartNotes: iris, fig\nbaseNotes: vanilla, leather\nminiTagSR: ...\nminiTagEN: ...\nwearSR: ...\nwearEN: ...\nfreshness: 3.2\nsweetness: 6.8\n..."}
        />
        <div className="product-bulk-paste-footer">
          <div className="product-bulk-summary">
            <strong>{preview.entries.length}</strong> parsed fields
            {preview.invalid.length ? <span> · {preview.invalid.length} malformed</span> : null}
          </div>
          <button type="button" className="primary-btn" onClick={apply} disabled={!source.trim()}>Apply to draft fields</button>
        </div>
        {message ? <div className="product-bulk-paste-message">{message}</div> : null}
      </> : null}
    </section>,
    slot
  );
}
