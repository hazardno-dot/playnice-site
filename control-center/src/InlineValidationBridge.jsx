import React, { useEffect, useState } from "react";
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
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let timer;
    const mainStage = document.querySelector(".main-stage") || document.body;

    const run = () => {
      window.clearTimeout(timer);
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

  if (!visible) return null;
  const errors = issues.filter((issue) => issue.level === "error");

  return <div className={`inline-validation-floating ${errors.length ? "blocked" : "ready"}`}>
    <div className="inline-validation-floating-head">
      <span>LIVE VALIDATION</span>
      <strong>{errors.length ? `${errors.length} FIELDS REMAINING` : "VISIBLE CHECKS PASS"}</strong>
    </div>
    {errors.length ? <div className="inline-validation-floating-issues">
      {errors.slice(0, 2).map((issue, index) => <div key={`${issue.field}-${index}`}><strong>{issue.field}</strong><span>{issue.message}</span></div>)}
      {errors.length > 2 ? <small>+ {errors.length - 2} more</small> : null}
    </div> : <p>All visible editor checks pass.</p>}
    <small>Draft Manager performs the authoritative validation before review. Save Draft remains safe and unpublished.</small>
  </div>;
}