import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { products } from "@shop/data/products/index.js";
import {
  validateInlineFields,
} from "./inlineValidationRules.mjs";
import "./inline-validation.css";

const PRODUCT_SLUGS = products.map((product) => product.slug);
const NOTE_KEYS = [...new Set(
  products.flatMap((product) => ["top", "heart", "base"].flatMap((level) => product.noteMap?.[level] || []))
)];

const getSelectedSlug = (root) => {
  const slugNode = root.querySelector(".slug");
  if (!slugNode) return "";
  return String(slugNode.textContent || "").split(" · ")[0].trim();
};

function collectIssues(root) {
  const domFields = [...root.querySelectorAll(".edit-field")].map((label) => {
    const name = label.querySelector(":scope > span")?.textContent?.trim() || "Field";
    const control = label.querySelector("input, textarea, select");
    return { label, name, control, value: control?.value ?? "", type: control?.type || "text" };
  });

  domFields.forEach((field) => field.label.classList.remove("inline-field-error", "inline-field-warning"));

  const issues = validateInlineFields(domFields, {
    knownProductSlugs: PRODUCT_SLUGS,
    knownNoteKeys: NOTE_KEYS,
    selectedSlug: getSelectedSlug(root),
  });

  issues.forEach((issue) => {
    if (issue.index < 0) return;
    const field = domFields[issue.index];
    field?.label.classList.add(issue.level === "error" ? "inline-field-error" : "inline-field-warning");
  });

  return issues;
}

export default function InlineValidationBridge() {
  const [issues, setIssues] = useState([]);
  const [slot, setSlot] = useState(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    let timer;
    const mainStage = document.querySelector(".main-stage") || document.body;

    const run = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        const editor = document.querySelector(".product-detail.edit-mode");
        if (!editor) {
          setSlot(null);
          setIssues([]);
          return;
        }

        let host = editor.querySelector(":scope > #inline-validation-slot");
        if (!host) {
          host = document.createElement("div");
          host.id = "inline-validation-slot";
          const bulkSlot = editor.querySelector(":scope > #product-bulk-paste-slot");
          const firstSection = editor.querySelector(":scope > .edit-section");
          if (bulkSlot) bulkSlot.insertAdjacentElement("afterend", host);
          else if (firstSection) editor.insertBefore(host, firstSection);
          else editor.appendChild(host);
        }

        setSlot(host);
        setIssues(collectIssues(editor));
      }, 60);
    };

    run();
    const observer = new MutationObserver(run);
    observer.observe(mainStage, { childList: true, subtree: true });
    document.addEventListener("input", run, true);
    document.addEventListener("change", run, true);

    return () => {
      observer.disconnect();
      document.removeEventListener("input", run, true);
      document.removeEventListener("change", run, true);
      window.clearTimeout(timer);
    };
  }, []);

  if (!slot) return null;
  const errors = issues.filter((issue) => issue.level === "error");
  const warnings = issues.filter((issue) => issue.level === "warning");
  const shown = expanded ? errors : errors.slice(0, 2);

  return createPortal(
    <aside className={`inline-validation-dock ${errors.length ? "blocked" : "ready"}`}>
      <button type="button" className="inline-validation-summary" onClick={() => setExpanded((value) => !value)} aria-expanded={expanded}>
        <div className="inline-validation-title">
          <span>LIVE VALIDATION</span>
          <strong>{errors.length ? `${errors.length} fields remaining` : "All visible checks pass"}</strong>
        </div>
        <div className="inline-validation-meta">
          {warnings.length ? <span>{warnings.length} warning{warnings.length === 1 ? "" : "s"}</span> : null}
          <span>{errors.length ? (expanded ? "Collapse" : "Review issues") : "Ready"}</span>
        </div>
      </button>

      {errors.length ? <div className={`inline-validation-list ${expanded ? "is-expanded" : ""}`}>
        {shown.map((issue, index) => <div className="inline-validation-item" key={`${issue.field}-${index}`}>
          <strong>{issue.field}</strong>
          <span>{issue.message}</span>
        </div>)}
        {!expanded && errors.length > 2 ? <button type="button" className="inline-validation-more" onClick={() => setExpanded(true)}>+ {errors.length - 2} more</button> : null}
      </div> : <p className="inline-validation-ready-copy">Draft Manager will run the authoritative validation before review.</p>}
    </aside>,
    slot
  );
}
