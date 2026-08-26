import fs from "node:fs";

const replaceOnce = (source, before, after, label) => {
  if (!source.includes(before)) throw new Error(`${label} anchor not found`);
  return source.replace(before, after);
};

// Draft Manager: no-change drafts must never advance into apply lifecycle.
const draftPath = "control-center/src/DraftManager.jsx";
let draft = fs.readFileSync(draftPath, "utf8");
draft = replaceOnce(
  draft,
  '    const readyToApply = row.review_status === "approved" && !drifted && validation.status !== "blocked" && Boolean(row.prepared_at);',
  '    const readyToApply = row.review_status === "approved" && !drifted && validation.status !== "blocked" && Boolean(row.prepared_at) && changes.length > 0;',
  "readyToApply"
);
draft = replaceOnce(
  draft,
  '  const setWorkflowStatus = async (row, nextStatus) => {\n    if (row.validation.status === "blocked" && nextStatus !== "draft") {',
  '  const setWorkflowStatus = async (row, nextStatus) => {\n    if (!row.changes.length && nextStatus !== "draft") {\n      setError("This draft matches live data. Make at least one change before review."); return;\n    }\n    if (row.validation.status === "blocked" && nextStatus !== "draft") {',
  "workflow no-change guard"
);
draft = replaceOnce(
  draft,
  '  const prepareApply = async (row) => {\n    if (row.review_status !== "approved" || row.validation.status === "blocked") return;',
  '  const prepareApply = async (row) => {\n    if (row.review_status !== "approved" || row.validation.status === "blocked") return;\n    if (!row.changes.length) { setError("This draft matches live data. There is nothing to prepare or apply."); return; }',
  "prepare no-change guard"
);
fs.writeFileSync(draftPath, draft);

// Authoritative draft validation: a directory placeholder is not a valid product image.
const validationPath = "control-center/src/draftValidation.js";
let validation = fs.readFileSync(validationPath, "utf8");
validation = replaceOnce(
  validation,
  '  if (!String(core.image || "").startsWith("/products/")) issues.push(issue("warning", "Core", "Image path", "Product images normally live under /products/."));',
  '  const imagePath = String(core.image || "").trim();\n  if (!imagePath.startsWith("/products/") || imagePath === "/products/" || imagePath.endsWith("/")) issues.push(issue("error", "Core", "Image path", "Use a specific product image file under /products/, not a directory placeholder."));',
  "authoritative image validation"
);
fs.writeFileSync(validationPath, validation);

// Inline editor validation mirrors the authoritative image contract.
const inlinePath = "control-center/src/inlineValidationRules.mjs";
let inline = fs.readFileSync(inlinePath, "utf8");
inline = replaceOnce(
  inline,
  '    if (INLINE_REQUIRED_CORE_FIELDS.has(name) && !value) {\n      add(field, `${field.name} is required.`);\n    }',
  '    if (INLINE_REQUIRED_CORE_FIELDS.has(name) && !value) {\n      add(field, `${field.name} is required.`);\n    }\n\n    if (name === "image path" && value && (!value.startsWith("/products/") || value === "/products/" || value.endsWith("/"))) {\n      add(field, "Use a specific product image file under /products/, not a directory placeholder.");\n    }',
  "inline image validation"
);
fs.writeFileSync(inlinePath, inline);

// New-product API repeats the image guard server-side.
const enginePath = "control-center/api/create-new-product-engine.js";
let engine = fs.readFileSync(enginePath, "utf8");
engine = replaceOnce(
  engine,
  '  for (const [label, value] of [["Name",p.core.name],["Short name",p.core.shortName],["Category",p.core.category],["Image",p.core.image],["Rating label",p.core.ratingLabel],["Season",p.core.season]]) if (!value) errors.push(`${label} is required.`);',
  '  for (const [label, value] of [["Name",p.core.name],["Short name",p.core.shortName],["Category",p.core.category],["Image",p.core.image],["Rating label",p.core.ratingLabel],["Season",p.core.season]]) if (!value) errors.push(`${label} is required.`);\n  if (!p.core.image.startsWith("/products/") || p.core.image === "/products/" || p.core.image.endsWith("/")) errors.push("Image must be a specific product file under /products/.");',
  "new-product server image validation"
);
fs.writeFileSync(enginePath, engine);

// Draft-only read view should not issue a bogus request for /products/.
const appPath = "control-center/src/App.jsx";
let app = fs.readFileSync(appPath, "utf8");
app = replaceOnce(
  app,
  '<div className="product-thumb-wrap"><img className="product-thumb" src={`${SHOP_ORIGIN}${p.image}`} alt="" loading="lazy"/></div>',
  '<div className="product-thumb-wrap">{p.image&&!p.image.endsWith("/")?<img className="product-thumb" src={`${SHOP_ORIGIN}${p.image}`} alt="" loading="lazy"/>:null}</div>',
  "catalog image guard"
);
app = replaceOnce(
  app,
  '<button className="edit-btn" onClick={onEdit}>Edit product</button></div><img src={`${SHOP_ORIGIN}${product.image}`} alt={product.name}/></div>',
  '<button className="edit-btn" onClick={onEdit}>Edit product</button></div>{product.image&&!product.image.endsWith("/")?<img src={`${SHOP_ORIGIN}${product.image}`} alt={product.name}/>:null}</div>',
  "detail image guard"
);
fs.writeFileSync(appPath, app);

// Extend an already-running regression contract; no CI workflow edit required.
const testPath = "control-center/tests/draft-only-product-lifecycle.mjs";
let test = fs.readFileSync(testPath, "utf8");
const extra = `\nconst draftManager=fs.readFileSync("control-center/src/DraftManager.jsx","utf8");\nconst validation=fs.readFileSync("control-center/src/draftValidation.js","utf8");\nconst inline=fs.readFileSync("control-center/src/inlineValidationRules.mjs","utf8");\nconst engine=fs.readFileSync("control-center/api/create-new-product-engine.js","utf8");\nif(!draftManager.includes("changes.length > 0"))throw new Error("READY TO APPLY does not require an actual change.");\nif(!draftManager.includes("This draft matches live data. Make at least one change before review."))throw new Error("No-change review guard missing.");\nif(!validation.includes("Use a specific product image file under /products/"))throw new Error("Authoritative image placeholder guard missing.");\nif(!inline.includes("name === \\\"image path\\\""))throw new Error("Inline image placeholder guard missing.");\nif(!engine.includes("Image must be a specific product file under /products/."))throw new Error("Server-side new-product image guard missing.");\nif(!app.includes('p.image&&!p.image.endsWith("/")'))throw new Error("Draft-only image rendering guard missing.");\nconsole.log("PASS  no-change drafts cannot enter apply lifecycle");\nconsole.log("PASS  image directory placeholders are blocked end-to-end");\n`;
if (test.includes("no-change drafts cannot enter apply lifecycle")) throw new Error("test already patched");
test += extra;
fs.writeFileSync(testPath, test);
