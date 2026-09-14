import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { products } from "@shop/data/products/index.js";
import {
  validateInlineFields,
} from "./inlineValidationRules.mjs";
import {
  classifyCardCopyFit,
  ensureCardCopyFont,
} from "./productCardCopyFit.mjs";
import "./inline-validation.css";

const PRODUCT_SLUGS = products.map((product) => product.slug);
const PRODUCT_SLUG_SET = new Set(PRODUCT_SLUGS);
const NOTE_KEYS = [...new Set(
  products.flatMap((product) => ["top", "heart", "base"].flatMap((level) => product.noteMap?.[level] || []))
)];

const getSelectedSlug = (root) => {
  const slugNode = root.querySelector(".slug");
  if (!slugNode) return "";
  return String(slugNode.textContent || "").split(" · ")[0].trim();
};

function addFitBadge(field, fit, isNewProduct) {
  if (!field?.label || !fit?.visualMeasured) return;
  const badge = document.createElement("div");
  const failed = fit.visualPass === false;
  badge.className = `card-copy-inline-fit ${failed ? "is-fail" : "is-pass"}`;
  badge.innerHTML = `<strong>${failed ? "TOO LONG" : "2-LINE PASS"}</strong><span>${fit.chars} chars · ${fit.lines} ${fit.lines === 1 ? "line" : "lines"}${fit.activeMax ? ` · char ceiling ${fit.activeMax}` : ""}</span>`;
  if (failed && !isNewProduct) badge.title = "Existing product: visual-fit warning. Shorten when this copy is next edited.";
  field.label.appendChild(badge);
}

function collectIssues(root) {
  root.querySelectorAll(".card-copy-inline-fit").forEach((node) => node.remove());

  const domFields = [...root.querySelectorAll(".edit-field")].map((label) => {
    const name = label.querySelector(":scope > span")?.textContent?.trim() || "Field";
    const control = label.querySelector("input, textarea, select");
    return { label, name, control, value: control?.value ?? "", type: control?.type || "text" };
  });

  domFields.forEach((field) => field.label.classList.remove("inline-field-error", "inline-field-warning"));

  const selectedSlug = getSelectedSlug(root);
  const isNewProduct = Boolean(selectedSlug) && !PRODUCT_SLUG_SET.has(selectedSlug);
  const issues = validateInlineFields(domFields, {
    knownProductSlugs: PRODUCT_SLUGS,
    knownNoteKeys: NOTE_KEYS,
    selectedSlug,
    isNewProduct,
  });

  domFields.forEach((field, index) => {
    const name = field.name.toLowerCase();
    if (!name.startsWith("card copy ·")) return;
    const lang = name.includes("· sr") ? "sr" : name.includes("· en") ? "en" : null;
    if (!lang || !String(field.value || "").trim()) return;

    const fit = classifyCardCopyFit(field.value, lang, { isNewProduct });
    addFitBadge(field, fit, isNewProduct);
    if (fit.visualPass === false) {
      issues.push({
        index,
        field: field.name,
        message: `Visual fit is ${fit.lines} lines; keep card copy within the 2-line Shop contract.`,
        level: isNewProduct ? "error" : "warning",
      });
    }
  });

  issues.forEach((issue) => {
    if (issue.index < 0) return;
    const field = domFields[issue.index];
    field?.label.classList.add(issue.level === "error" ? "inline-field-error" : "inline-field-warning");
  });

  return issues;
}

function ensureValidationSlot() {
  const mainStage = document.querySelector(".main-stage");
  const applySlot = mainStage?.querySelector("#controlled-apply-slot");
  if (!mainStage || !applySlot) return null;

  let slot = mainStage.querySelector("#inline-validation-slot");
  if (!slot) {
    slot = document.createElement("div");
    slot.id = "inline-validation-slot";
    slot.className = "inline-validation-slot";
    applySlot.insertAdjacentElement("afterend", slot);
  } else if (slot.previousElementSibling !== applySlot) {
    applySlot.insertAdjacentElement("afterend", slot);
  }
  return slot;
}

export default function InlineValidationBridge() {
  const [issues, setIssues] = useState([]);
  const [visible, setVisible] = useState(false);
  const [slot, setSlot] = useState(null);

  useEffect(() => {
    ensureCardCopyFont();
    let timer;
    let raf = 0;
    const mainStage = document.querySelector(".main-stage") || document.body;

    const run = () => {
      window.clearTimeout(timer);
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setSlot(ensureValidationSlot()));
      timer = window.setTimeout(() => {
        const editor = document.querySelector(".edit-mode");
        if (!editor) {
          setVisible(false);
          setIssues([]);
          return;
        }
        setVisible(true);
        setIssues(collectIssues(editor));
      }, 60);
    };

    run();
    document.fonts?.ready?.then(run).catch(() => {});
    const observer = new MutationObserver(run);
    observer.observe(mainStage, { childList: true, subtree: true });
    document.addEventListener("input", run, true);
    document.addEventListener("change", run, true);

    return () => {
      observer.disconnect();
      document.removeEventListener("input", run, true);
      document.removeEventListener("change", run, true);
      window.clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, []);

  if (!visible || !slot) return null;
  const errors = issues.filter((issue) => issue.level === "error");
  const warnings = issues.filter((issue) => issue.level === "warning");

  return createPortal(<div className={`inline-validation-floating ${errors.length ? "blocked" : "ready"}`}>
    <div className="inline-validation-floating-head">
      <span>LIVE VALIDATION</span>
      <strong>{errors.length ? `${errors.length} FIELDS REMAINING` : warnings.length ? `${warnings.length} WARNING${warnings.length === 1 ? "" : "S"}` : "VISIBLE CHECKS PASS"}</strong>
    </div>
    {errors.length ? <div className="inline-validation-floating-issues">
      {errors.slice(0, 2).map((issue, index) => <div key={`${issue.field}-${index}`}><strong>{issue.field}</strong><span>{issue.message}</span></div>)}
      {errors.length > 2 ? <small>+ {errors.length - 2} more</small> : null}
    </div> : warnings.length ? <div className="inline-validation-floating-issues">
      {warnings.slice(0, 2).map((issue, index) => <div key={`${issue.field}-${index}`}><strong>{issue.field}</strong><span>{issue.message}</span></div>)}
      {warnings.length > 2 ? <small>+ {warnings.length - 2} more</small> : null}
    </div> : <p>All visible editor checks pass.</p>}
    <small>New products must pass the 2-line Card Copy fit before review. Existing products show visual-fit warnings for gradual cleanup.</small>
  </div>, slot);
}
