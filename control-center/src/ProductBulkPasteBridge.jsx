import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { products } from "@shop/data/products/index.js";
import { discoveryProfiles } from "@shop/data/products/discoveryProfiles";
import noteMapSource from "@shop/TheNoteMap.jsx?raw";
import { validateInlineFields } from "./inlineValidationRules.mjs";
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

const discoveryKeys = new Set(
  Object.values(discoveryProfiles || {}).flatMap((profile) => Object.keys(profile || {}))
);
const PRODUCT_SLUGS = products.map((product) => product.slug);

function noteLibraryKeys(source) {
  const start = source.indexOf("const NOTE_LIBRARY = {");
  const end = source.indexOf("const NOTE_SR = {", start);
  if (start < 0 || end < 0) return [];
  const section = source.slice(start, end);
  return [...section.matchAll(/^  (?:(?:\"([^\"]+)\")|(?:'([^']+)')|([A-Za-z0-9_-]+))\s*:\s*\{/gm)]
    .map((match) => match[1] || match[2] || match[3])
    .filter(Boolean);
}

const NOTE_KEYS = [...new Set([
  ...products.flatMap((product) => ["top", "heart", "base"].flatMap((level) => product.noteMap?.[level] || [])),
  ...noteLibraryKeys(noteMapSource),
])];

function flattenJson(input, out = {}, prefix = "") {
  Object.entries(input || {}).forEach(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) flattenJson(value, out, path);
    else out[path] = Array.isArray(value) ? value.join(", ") : value;
  });
  return out;
}

function normalizeKey(rawKey) {
  const lower = String(rawKey || "").trim().toLowerCase();
  const sizeMatch = lower.match(/^(?:(?:commerce[._-])?sizes?[._-]?)?(\d+(?:\.\d+)?)\s*ml$/i);
  if (sizeMatch) return `size:${sizeMatch[1]}ml`;

  const stripped = lower
    .replace(/^core[._-]/, "")
    .replace(/^commerce[._-]/, "")
    .replace(/^notes?[._-]/, "")
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
  const malformed = [];
  const duplicates = [];
  if (!trimmed) return { entries, malformed, duplicates };

  const pushEntry = (rawKey, value) => {
    const key = normalizeKey(rawKey);
    if (entries.some(([existing]) => existing === key)) duplicates.push(key);
    entries.push([key, value]);
  };

  if (trimmed.startsWith("{")) {
    try {
      const flat = flattenJson(JSON.parse(trimmed));
      Object.entries(flat).forEach(([key, value]) => pushEntry(key, value));
      return { entries, malformed, duplicates };
    } catch {
      return { entries: [], malformed: ["Invalid JSON"], duplicates };
    }
  }

  trimmed.split(/\r?\n/).forEach((line, index) => {
    const clean = line.trim();
    if (!clean || clean.startsWith("#")) return;
    const match = clean.match(/^([^:=]+?)\s*[:=]\s*(.*)$/);
    if (!match) { malformed.push(`Line ${index + 1}: ${clean}`); return; }
    pushEntry(match[1], match[2].trim());
  });
  return { entries, malformed, duplicates };
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
  if (!root) return map;
  root.querySelectorAll(".edit-field").forEach((field) => {
    const label = field.querySelector(":scope > span")?.textContent;
    const control = field.querySelector("input, textarea, select");
    if (label && control) map.set(normalize(label), control);
  });
  return map;
}

function resolveSelectValue(control, rawValue) {
  if (!(control instanceof HTMLSelectElement)) return String(rawValue ?? "");
  const target = String(rawValue ?? "").trim().toLowerCase();
  const option = Array.from(control.options).find((candidate) =>
    candidate.value.trim().toLowerCase() === target ||
    candidate.textContent.trim().toLowerCase() === target
  );
  return option ? option.value : null;
}

function preflight(parsed) {
  const root = document.querySelector(".product-detail.edit-mode");
  const blockers = [];
  const actions = [];
  if (!parsed.entries.length && !parsed.malformed.length) return { blockers, actions };
  if (!root) return { blockers: ["Product editor is not available."], actions };

  parsed.malformed.forEach((line) => blockers.push(line));
  parsed.duplicates.forEach((key) => blockers.push(`Duplicate key: ${key}`));

  const fieldMap = findFieldMap(root);
  const seen = new Set();

  parsed.entries.forEach(([key, rawValue]) => {
    if (seen.has(key)) return;
    seen.add(key);

    if (key.startsWith("size:")) {
      const size = key.slice(5);
      const price = Number(rawValue);
      if (!Number.isFinite(price) || price <= 0) {
        blockers.push(`Invalid price for ${size}: ${rawValue}`);
        return;
      }
      const existing = fieldMap.get(normalize(size));
      if (existing) actions.push({ type: "field", control: existing, value: rawValue, label: size });
      else if (root.querySelector(".size-composer")) actions.push({ type: "size", size, value: rawValue, label: size });
      else blockers.push(`Cannot add size: ${size}`);
      return;
    }

    if (key.startsWith("discovery:")) {
      const discoveryKey = key.slice(10);
      if (!discoveryKeys.has(discoveryKey)) {
        blockers.push(`Unknown Discovery key: ${discoveryKey}`);
        return;
      }
      const number = Number(rawValue);
      if (!Number.isFinite(number) || number < 0 || number > 10) {
        blockers.push(`Discovery ${discoveryKey} must be 0–10.`);
        return;
      }
      const control = fieldMap.get(normalize(discoveryKey));
      if (!control) blockers.push(`Field not found: ${discoveryKey}`);
      else actions.push({ type: "field", control, value: rawValue, label: discoveryKey });
      return;
    }

    const control = fieldMap.get(key);
    if (!control) {
      blockers.push(`Unknown field: ${key}`);
      return;
    }

    if (key === "rating") {
      const rating = Number(rawValue);
      if (!Number.isFinite(rating) || rating < 0 || rating > 10) {
        blockers.push("Rating must be 0–10.");
        return;
      }
    }

    if (key === "recommendation_slugs_3_comma_separated") {
      const recommendations = String(rawValue).split(",").map((item) => item.trim()).filter(Boolean);
      if (recommendations.length !== 3) {
        blockers.push("Recommendations must contain exactly 3 slugs.");
        return;
      }
    }

    const value = resolveSelectValue(control, rawValue);
    if (value === null) blockers.push(`Invalid option for ${key}: ${rawValue}`);
    else actions.push({ type: "field", control, value, label: key });
  });

  return { blockers, actions };
}

function classifyActions(actions) {
  return actions.map((action) => {
    if (action.type === "size") return { ...action, changeType: "new" };
    const current = String(action.control?.value ?? "").trim();
    const incoming = String(action.value ?? "").trim();
    if (!current) return { ...action, changeType: "new" };
    if (current === incoming) return { ...action, changeType: "unchanged" };
    return { ...action, changeType: "changed" };
  });
}

function changeSummary(actions) {
  return actions.reduce((summary, action) => {
    summary[action.changeType] += 1;
    return summary;
  }, { new: 0, changed: 0, unchanged: 0 });
}

function selectedSlug(root) {
  const slugNode = root?.querySelector(".slug");
  return String(slugNode?.textContent || "").split(" · ")[0].trim();
}

function contractBlockers(actions, mode) {
  const root = document.querySelector(".product-detail.edit-mode");
  if (!root) return ["Product editor is not available."];

  const selected = actions.filter((action) =>
    action.changeType === "new" || action.changeType === "unchanged" || (mode === "overwrite" && action.changeType === "changed")
  );
  const overrides = new Map(selected.filter((action) => action.type === "field").map((action) => [action.control, action.value]));
  const fields = [...root.querySelectorAll(".edit-field")].map((field) => {
    const name = field.querySelector(":scope > span")?.textContent?.trim() || "Field";
    const control = field.querySelector("input, textarea, select");
    return {
      name,
      value: overrides.has(control) ? overrides.get(control) : (control?.value ?? ""),
      type: control?.type || "text",
    };
  });
  selected.filter((action) => action.type === "size").forEach((action) => {
    fields.push({ name: action.size, value: action.value, type: "number" });
  });

  const slug = selectedSlug(root);
  const issues = validateInlineFields(fields, {
    knownProductSlugs: PRODUCT_SLUGS,
    knownNoteKeys: NOTE_KEYS,
    selectedSlug: slug,
    isNewProduct: Boolean(slug && !PRODUCT_SLUGS.includes(slug)),
  });
  return issues.filter((issue) => issue.level === "error").map((issue) => `${issue.field}: ${issue.message}`);
}

function nextFrame() {
  return new Promise((resolve) => window.requestAnimationFrame(() => window.requestAnimationFrame(resolve)));
}

async function addSize(size, price) {
  const root = document.querySelector(".product-detail.edit-mode");
  const composer = root?.querySelector(".size-composer");
  const inputs = composer?.querySelectorAll("input");
  const addButton = composer?.querySelector("button");
  if (!composer || !inputs || inputs.length < 2 || !addButton) return false;
  setNativeValue(inputs[0], size);
  setNativeValue(inputs[1], price);
  addButton.click();
  await nextFrame();
  const updatedRoot = document.querySelector(".product-detail.edit-mode");
  return Boolean(findFieldMap(updatedRoot).get(normalize(size)));
}

export default function ProductBulkPasteBridge() {
  const [slot, setSlot] = useState(null);
  const [source, setSource] = useState("");
  const [message, setMessage] = useState("");
  const [expanded, setExpanded] = useState(true);
  const [mode, setMode] = useState("fill-empty");

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
        setSlot(host);
        return;
      }
      setSlot((current) => current === host ? current : host);
    };
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(main, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  const parsed = useMemo(() => parseSource(source), [source]);
  const rawValidation = preflight(parsed);
  const actions = classifyActions(rawValidation.actions);
  const summary = changeSummary(actions);
  const contractErrors = rawValidation.blockers.length ? [] : contractBlockers(actions, mode);
  const validation = { ...rawValidation, actions, blockers: [...rawValidation.blockers, ...contractErrors] };
  const applicableActions = actions.filter((action) =>
    action.changeType === "new" || (mode === "overwrite" && action.changeType === "changed")
  );
  const hasInput = Boolean(source.trim());
  const canApply = hasInput && validation.blockers.length === 0 && applicableActions.length > 0;

  const apply = async () => {
    const latestRaw = preflight(parsed);
    const latestActions = classifyActions(latestRaw.actions);
    const latestContractErrors = latestRaw.blockers.length ? [] : contractBlockers(latestActions, mode);
    const blockers = [...latestRaw.blockers, ...latestContractErrors];
    if (blockers.length) {
      setMessage("Apply blocked. Fix the preflight issues first; no fields were changed.");
      return;
    }

    const selected = latestActions.filter((action) =>
      action.changeType === "new" || (mode === "overwrite" && action.changeType === "changed")
    );
    let applied = 0;
    const sizeActions = selected.filter((action) => action.type === "size");
    const fieldActions = selected.filter((action) => action.type === "field");

    fieldActions.forEach((action) => {
      setNativeValue(action.control, action.value);
      applied += 1;
    });

    for (const action of sizeActions) {
      if (await addSize(action.size, action.value)) applied += 1;
      else {
        setMessage(`${applied} fields applied, but ${action.size} could not be added. Nothing was saved; review before Save Draft.`);
        return;
      }
    }

    const skipped = latestActions.length - selected.length;
    setMessage(`${applied} fields applied · ${skipped} protected/skipped. Nothing was saved. Review live validation, then Save Draft.`);
  };

  if (!slot) return null;
  return createPortal(
    <section className={`product-bulk-paste ${expanded ? "is-open" : ""}`}>
      <div className="product-bulk-paste-head">
        <div>
          <span className="eyebrow">FAST ENTRY / DRAFT ONLY</span>
          <strong>Bulk product input</strong>
          <p>Paste one complete product block. CC checks parser + product contract before changing any field; Save Draft stays separate.</p>
        </div>
        <button type="button" className="secondary-btn" onClick={() => setExpanded((value) => !value)}>{expanded ? "Collapse" : "Open"}</button>
      </div>
      {expanded ? <>
        <div className="product-bulk-paste-footer">
          <div className="product-bulk-summary">
            <strong>Write mode</strong>
            <span> · default is safe</span>
          </div>
          <div>
            <button type="button" className={mode === "fill-empty" ? "primary-btn" : "secondary-btn"} onClick={() => { setMode("fill-empty"); setMessage(""); }}>Fill empty only</button>{" "}
            <button type="button" className={mode === "overwrite" ? "primary-btn" : "secondary-btn"} onClick={() => { setMode("overwrite"); setMessage(""); }}>Overwrite existing</button>
          </div>
        </div>
        <textarea
          value={source}
          onChange={(event) => { setSource(event.target.value); setMessage(""); }}
          spellCheck="false"
          placeholder={"name: Brand Fragrance Eau De Parfum\nshortName: Fragrance\ncategory: Arabian\nimage: /products/brand-fragrance.webp\n5ml: 5\n10ml: 9\n20ml: 17\ntopNotes: bergamot, cardamom\nheartNotes: iris, fig\nbaseNotes: vanilla, leather\nminiTagSR: ...\nminiTagEN: ...\nwearSR: ...\nwearEN: ...\nfreshness: 3.2\nsweetness: 6.8\n..."}
        />
        {hasInput ? <div className={`product-bulk-preflight ${validation.blockers.length ? "has-blockers" : "is-ready"}`}>
          <div className="product-bulk-preflight-title">
            <strong>{validation.actions.length} parsed</strong>
            <span> · {validation.blockers.length} blockers</span>
          </div>
          {validation.blockers.length ? <ul>{validation.blockers.slice(0, 8).map((blocker, index) => <li key={`${blocker}-${index}`}>{blocker}</li>)}</ul> : <p>Product preflight passed. {summary.new} new · {summary.changed} changed · {summary.unchanged} unchanged. {mode === "fill-empty" ? "Changed existing values are protected." : "Changed existing values will be overwritten."}</p>}
          {validation.blockers.length > 8 ? <p>+ {validation.blockers.length - 8} more blockers</p> : null}
        </div> : null}
        <div className="product-bulk-paste-footer">
          <div className="product-bulk-summary">
            <strong>{parsed.entries.length}</strong> parsed fields
            {parsed.malformed.length ? <span> · {parsed.malformed.length} malformed</span> : null}
            {parsed.duplicates.length ? <span> · {parsed.duplicates.length} duplicates</span> : null}
            {hasInput && !validation.blockers.length ? <span> · {applicableActions.length} will apply</span> : null}
          </div>
          <button type="button" className="primary-btn" onClick={apply} disabled={!canApply}>Apply to draft fields</button>
        </div>
        {message ? <div className="product-bulk-paste-message">{message}</div> : null}
      </> : null}
    </section>,
    slot
  );
}
