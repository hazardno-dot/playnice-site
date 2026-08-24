import React from "react";

export default function EditorValidationSummary({ validation }) {
  const errors = validation?.errors || [];
  const warnings = validation?.warnings || [];
  const blocked = errors.length > 0;

  return <section className={`editor-validation-summary ${blocked ? "blocked" : "ready"}`}>
    <div className="editor-validation-head">
      <div>
        <span className="eyebrow">LIVE VALIDATION</span>
        <strong>{blocked ? `BLOCKED · ${errors.length}` : "READY FOR REVIEW"}</strong>
      </div>
      <span>{errors.length} errors · {warnings.length} warnings</span>
    </div>
    {errors.length || warnings.length ? <div className="editor-validation-list">
      {[...errors, ...warnings].slice(0, 6).map((issue, index) => <div className={`editor-validation-issue ${issue.level || (index < errors.length ? "error" : "warning")}`} key={`${issue.section}-${issue.field}-${index}`}>
        <strong>{issue.section} · {issue.field}</strong>
        <span>{issue.message}</span>
      </div>)}
      {errors.length + warnings.length > 6 ? <small>+ {errors.length + warnings.length - 6} more issues in Draft Review</small> : null}
    </div> : <p>All required product-data checks currently pass.</p>}
    <small>Save Draft remains available even when blocked. Publish is not available.</small>
  </section>;
}
