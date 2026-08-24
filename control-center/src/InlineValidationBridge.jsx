import React, { useEffect, useState } from "react";
import "./inline-validation.css";

const numberInRange = (value, min, max) => {
  const n = Number(value);
  return Number.isFinite(n) && n >= min && n <= max;
};

function collectIssues(root) {
  const issues = [];
  const fields = [...root.querySelectorAll(".edit-field")].map((label) => {
    const name = label.querySelector(":scope > span")?.textContent?.trim() || "Field";
    const control = label.querySelector("input, textarea");
    return { label, name, control, value: control?.value ?? "" };
  });

  const add = (field, message, level = "error") => {
    issues.push({ field: field.name, message, level });
    field.label.classList.add(level === "error" ? "inline-field-error" : "inline-field-warning");
  };

  fields.forEach((field) => {
    field.label.classList.remove("inline-field-error", "inline-field-warning");
    const name = field.name.toLowerCase();
    const value = field.value.trim();

    if (name === "rating" && !numberInRange(value, 0, 10)) add(field, "Rating must be a number from 0 to 10.");
    if ((name.includes("discovery") || ["freshness","sweetness","warmth","darkness","airiness","cleanliness","creaminess","dryness","fruitiness","spiciness","woodiness","aromaticity","florality","gourmandness","citrus","aquatic","powdery","projection","longevity","office","casual","date","night","summer","winter"].includes(name)) && field.control?.type === "number" && !numberInRange(value, 0, 10)) add(field, "Discovery values must be from 0 to 10.");
    if (field.control?.type === "number" && /ml$/i.test(field.name) && (!Number.isFinite(Number(value)) || Number(value) <= 0)) add(field, "Price must be greater than 0.");
    if (["name","short name","category","rating label","season"].includes(name) && !value) add(field, `${field.name} is required.`);
    if (name.startsWith("wear ·") && !value) add(field, "Wear context is required in both languages.");
    if ((name.includes("· sr") || name.includes("· en")) && ["mini tag","scent type","card copy","modal copy","why choose"].some((prefix) => name.startsWith(prefix)) && !value) add(field, "Required bilingual copy is missing.");
    if (name.includes("notes · comma separated") && !value) add(field, "Notes cannot be empty.");
    if (name.includes("recommendation slugs")) {
      const recs = value.split(",").map((v) => v.trim()).filter(Boolean);
      if (recs.length !== 3) add(field, "Exactly 3 recommendation slugs are required.");
      else if (new Set(recs).size !== recs.length) add(field, "Recommendation slugs must be unique.");
    }
    if (name.includes("moods · comma separated") && !value) add(field, "At least one mood is required.");
  });

  return issues;
}

export default function InlineValidationBridge() {
  const [issues, setIssues] = useState([]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let timer;
    const run = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        const editor = document.querySelector(".edit-mode");
        if (!editor) { setVisible(false); setIssues([]); return; }
        setVisible(true);
        setIssues(collectIssues(editor));
      }, 60);
    };
    run();
    const observer = new MutationObserver(run);
    observer.observe(document.body, { childList: true, subtree: true });
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
  const errors = issues.filter((i) => i.level === "error");
  return <div className={`inline-validation-floating ${errors.length ? "blocked" : "ready"}`}>
    <div className="inline-validation-floating-head">
      <span>LIVE VALIDATION</span>
      <strong>{errors.length ? `BLOCKED · ${errors.length}` : "READY FOR REVIEW"}</strong>
    </div>
    {errors.length ? <div className="inline-validation-floating-issues">{errors.slice(0, 3).map((issue, index) => <div key={`${issue.field}-${index}`}><strong>{issue.field}</strong><span>{issue.message}</span></div>)}{errors.length > 3 ? <small>+ {errors.length - 3} more</small> : null}</div> : <p>All visible editor checks pass.</p>}
    <small>Save Draft is still allowed. Publish remains unavailable.</small>
  </div>;
}
