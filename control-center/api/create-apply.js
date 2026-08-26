const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO = "hazardno-dot/playnice-site";
const [OWNER, REPO_NAME] = REPO.split("/");

const json = (res, status, body) => res.status(status).json(body);
const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

async function supabaseFetch(path, token, options = {}) {
  return fetch(`${SUPABASE_URL}${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(options.headers || {}),
    },
  });
}

async function github(path, options = {}) {
  const response = await fetch(`https://api.github.com${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const data = response.status === 204 ? null : await response.json();
  if (!response.ok) throw new Error(data?.message || `GitHub request failed (${response.status})`);
  return data;
}

const normalizeCsv = (v) => Array.isArray(v)
  ? v.map(String).map((s) => s.trim()).filter(Boolean)
  : String(v ?? "").split(",").map((s) => s.trim()).filter(Boolean);

const normalizeSizes = (value) => Object.keys(value || {}).sort().reduce((out, key) => {
  const n = Number(value[key]);
  out[key] = Number.isFinite(n) ? n : value[key];
  return out;
}, {});

const stable = (value) => {
  const normalize = (v) => {
    if (Array.isArray(v)) return v.map(normalize);
    if (v && typeof v === "object") return Object.keys(v).sort().reduce((out, key) => {
      out[key] = normalize(v[key]);
      return out;
    }, {});
    return v;
  };
  return JSON.stringify(normalize(value ?? null));
};

const displayValue = (value) => typeof value === "string" ? value : JSON.stringify(value);

const valueForField = (field, core) => {
  if (field === "rating") return Number(core?.rating);
  if (field === "moods") return normalizeCsv(core?.moods);
  if (field === "sizes") return normalizeSizes(core?.sizes || {});
  return String(core?.[field] ?? "");
};

function scanObject(source, braceStart, label) {
  let depth = 0;
  let quote = "";
  let escapedChar = false;
  for (let i = braceStart; i < source.length; i += 1) {
    const ch = source[i];
    if (quote) {
      if (escapedChar) escapedChar = false;
      else if (ch === "\\") escapedChar = true;
      else if (ch === quote) quote = "";
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") { quote = ch; continue; }
    if (ch === "{") depth += 1;
    else if (ch === "}") {
      depth -= 1;
      if (depth === 0) return { start: braceStart, end: i + 1, block: source.slice(braceStart, i + 1) };
    }
  }
  throw new Error(`Could not determine object boundary for ${label}.`);
}

function findProductBlock(source, slug) {
  const slugRegex = new RegExp(`\\bslug\\s*:\\s*["']${escapeRegex(slug)}["']`);
  const slugMatch = slugRegex.exec(source);
  if (!slugMatch) throw new Error(`Could not locate ${slug} in main catalog.`);
  let start = source.lastIndexOf("\n  {", slugMatch.index);
  if (start < 0) start = source.lastIndexOf("{", slugMatch.index);
  else start += 3;
  if (start < 0) throw new Error(`Could not locate product object for ${slug}.`);
  return scanObject(source, start, slug);
}

function findNamedObjectBlock(source, objectKey, label = "data object") {
  const re = new RegExp(`(["'])${escapeRegex(objectKey)}\\1\\s*:\\s*\\{`);
  const match = re.exec(source);
  if (!match) throw new Error(`Could not locate ${objectKey} in ${label}.`);
  const braceStart = source.indexOf("{", match.index);
  return scanObject(source, braceStart, objectKey);
}

function findChildObjectBlock(block, property) {
  const re = new RegExp(`(?:^|\\n|\\{)\\s*(?:["']${escapeRegex(property)}["']|${escapeRegex(property)})\\s*:\\s*\\{`);
  const match = re.exec(block);
  if (!match) throw new Error(`Could not locate nested ${property} object.`);
  const braceStart = block.indexOf("{", match.index);
  return scanObject(block, braceStart, property);
}

function locatePropertyValue(block, property) {
  const re = new RegExp(`(?:^|\\n|\\{)\\s*(?:["']${escapeRegex(property)}["']|${escapeRegex(property)})\\s*:\\s*`);
  const match = re.exec(block);
  if (!match) throw new Error(`Could not locate ${property} in object.`);
  const start = match.index + match[0].length;
  let square = 0;
  let curly = 0;
  let paren = 0;
  let quote = "";
  let escapedChar = false;
  for (let i = start; i < block.length; i += 1) {
    const ch = block[i];
    if (quote) {
      if (escapedChar) escapedChar = false;
      else if (ch === "\\") escapedChar = true;
      else if (ch === quote) quote = "";
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") { quote = ch; continue; }
    if (ch === "[") square += 1;
    else if (ch === "]") square -= 1;
    else if (ch === "{") curly += 1;
    else if (ch === "}") {
      if (curly > 0) curly -= 1;
      else if (square === 0 && paren === 0) return { start, end: i };
    } else if (ch === "(") paren += 1;
    else if (ch === ")") paren -= 1;
    else if (ch === "," && square === 0 && curly === 0 && paren === 0) return { start, end: i };
  }
  throw new Error(`Could not read ${property} value.`);
}

function parseJsLiteral(raw) {
  const text = raw.trim();
  if (!text.length) return "";
  if (/^-?\d+(?:\.\d+)?$/.test(text)) return Number(text);
  try { return JSON.parse(text); } catch {
    if ((text.startsWith("'") && text.endsWith("'")) || (text.startsWith('"') && text.endsWith('"'))) return text.slice(1, -1);
  }
  throw new Error(`Unsupported catalog value syntax: ${text.slice(0, 80)}`);
}

function serializeField(field, value) {
  if (field === "rating") return String(Number(value));
  return JSON.stringify(value);
}

function patchStringArrayRaw(raw, baselineValue, draftValue, label) {
  const liveValue = parseJsLiteral(raw);
  const liveNormalized = normalizeCsv(liveValue);
  const baselineNormalized = normalizeCsv(baselineValue);
  const draftNormalized = normalizeCsv(draftValue);
  if (stable(liveNormalized) !== stable(baselineNormalized)) throw new Error(`LIVE DRIFT: ${label} changed after preparation.`);
  if (liveNormalized.length !== draftNormalized.length) throw new Error(`Controlled Apply can replace existing ${label} slots, but cannot add or remove slots yet.`);
  let index = 0;
  const nextRaw = raw.replace(/(["'])([^"']*)\1/g, (match, quote) => {
    if (index >= draftNormalized.length) return match;
    const next = String(draftNormalized[index]);
    index += 1;
    const escaped = next.replace(/\\/g, "\\\\").replace(new RegExp(quote, "g"), `\\${quote}`);
    return `${quote}${escaped}${quote}`;
  });
  if (index !== draftNormalized.length) throw new Error(`Could not preserve ${label} array formatting safely.`);
  return nextRaw;
}

function patchSizesRaw(raw, baselineValue, draftValue) {
  const liveValue = parseJsLiteral(raw);
  const liveNormalized = normalizeSizes(liveValue);
  if (stable(liveNormalized) !== stable(baselineValue)) throw new Error(`LIVE DRIFT: main sizes are ${displayValue(liveNormalized)}, preparation baseline expected ${displayValue(baselineValue)}.`);
  const liveKeys = Object.keys(liveValue || {}).sort();
  const draftKeys = Object.keys(draftValue || {}).sort();
  if (stable(liveKeys) !== stable(draftKeys)) throw new Error("Controlled Apply can change existing size prices, but cannot add or remove sizes yet.");
  let nextRaw = raw;
  for (const key of liveKeys) {
    const before = Number(liveValue[key]);
    const after = Number(draftValue[key]);
    if (before === after) continue;
    if (!Number.isFinite(after)) throw new Error(`Invalid price for ${key}.`);
    const re = new RegExp(`(["']${escapeRegex(key)}["']\\s*:\\s*)-?\\d+(?:\\.\\d+)?`);
    if (!re.test(nextRaw)) throw new Error(`Could not locate ${key} price inside sizes object.`);
    nextRaw = nextRaw.replace(re, `$1${after}`);
  }
  return nextRaw;
}

function patchProperty(block, field, baselineValue, draftValue) {
  const range = locatePropertyValue(block, field);
  const liveRaw = block.slice(range.start, range.end);
  if (field === "sizes") return block.slice(0, range.start) + patchSizesRaw(liveRaw, baselineValue, draftValue) + block.slice(range.end);
  if (field === "moods") return block.slice(0, range.start) + patchStringArrayRaw(liveRaw, baselineValue, draftValue, "moods") + block.slice(range.end);
  const liveValue = parseJsLiteral(liveRaw);
  const liveNormalized = field === "rating" ? Number(liveValue) : String(liveValue ?? "");
  if (stable(liveNormalized) !== stable(baselineValue)) throw new Error(`LIVE DRIFT: main ${field} is ${displayValue(liveNormalized)}, preparation baseline expected ${displayValue(baselineValue)}.`);
  return block.slice(0, range.start) + serializeField(field, draftValue) + block.slice(range.end);
}

function noteMapChangesBetween(baselineNoteMap = {}, approvedNoteMap = {}) {
  return ["top", "heart", "base"].map((field) => {
    const live = normalizeCsv(baselineNoteMap?.[field]);
    const next = normalizeCsv(approvedNoteMap?.[field]);
    return { section: "Note Map", field, live, next, changed: stable(live) !== stable(next) };
  }).filter((item) => item.changed);
}

function patchNoteMap(block, baselineNoteMap = {}, approvedNoteMap = {}) {
  const located = findChildObjectBlock(block, "noteMap");
  let child = located.block;
  for (const field of ["top", "heart", "base"]) {
    const before = normalizeCsv(baselineNoteMap?.[field]);
    const after = normalizeCsv(approvedNoteMap?.[field]);
    if (stable(before) === stable(after)) continue;
    const range = locatePropertyValue(child, field);
    const raw = child.slice(range.start, range.end);
    child = child.slice(0, range.start) + patchStringArrayRaw(raw, before, after, `noteMap.${field}`) + child.slice(range.end);
  }
  return block.slice(0, located.start) + child + block.slice(located.end);
}

function recommendationsChangeBetween(baselineCore = {}, approvedCore = {}) {
  const live = normalizeCsv(baselineCore.recommendations);
  const next = normalizeCsv(approvedCore.recommendations);
  return stable(live) === stable(next) ? [] : [{ section: "Recommendations", field: "recommendations", live, next }];
}

function patchRecommendations(block, baselineValue, approvedValue) {
  const range = locatePropertyValue(block, "recommendations");
  const raw = block.slice(range.start, range.end);
  return block.slice(0, range.start) + patchStringArrayRaw(raw, baselineValue, approvedValue, "recommendations") + block.slice(range.end);
}

function readWearBlock(block) {
  const out = {};
  for (const lang of ["sr", "en"]) {
    const range = locatePropertyValue(block, lang);
    out[lang] = String(parseJsLiteral(block.slice(range.start, range.end)) ?? "");
  }
  return out;
}

function patchWearBlock(block, baselineWear, approvedWear) {
  const liveWear = readWearBlock(block);
  const baseline = { sr: String(baselineWear?.sr ?? ""), en: String(baselineWear?.en ?? "") };
  if (stable(liveWear) !== stable(baseline)) throw new Error(`LIVE DRIFT: Wear Context changed after preparation. Main is ${displayValue(liveWear)}, baseline expected ${displayValue(baseline)}.`);
  let nextBlock = block;
  for (const lang of ["sr", "en"]) {
    const before = String(baselineWear?.[lang] ?? "");
    const after = String(approvedWear?.[lang] ?? "");
    if (before === after) continue;
    const range = locatePropertyValue(nextBlock, lang);
    nextBlock = nextBlock.slice(0, range.start) + JSON.stringify(after) + nextBlock.slice(range.end);
  }
  return nextBlock;
}

const COPY_FIELDS = ["miniTag", "card", "modal", "scentType", "dominantNotes", "tags", "whyChoose"];
const COPY_ARRAY_FIELDS = new Set(["dominantNotes", "tags"]);

function copyChangesBetween(baselineCopy = {}, approvedCopy = {}) {
  const changes = [];
  for (const field of COPY_FIELDS) {
    for (const lang of ["sr", "en"]) {
      const live = baselineCopy?.[field]?.[lang];
      const next = approvedCopy?.[field]?.[lang];
      if (stable(live) !== stable(next)) changes.push({ section: "Copy", field: `${field}.${lang}`, group: field, lang, live, next });
    }
  }
  return changes;
}

function patchCopyBlock(block, baselineCopy = {}, approvedCopy = {}) {
  let nextBlock = block;
  for (const field of COPY_FIELDS) {
    const beforeGroup = baselineCopy?.[field] || {};
    const afterGroup = approvedCopy?.[field] || {};
    if (stable(beforeGroup) === stable(afterGroup)) continue;
    const located = findChildObjectBlock(nextBlock, field);
    let child = located.block;
    for (const lang of ["sr", "en"]) {
      const before = beforeGroup?.[lang];
      const after = afterGroup?.[lang];
      if (stable(before) === stable(after)) continue;
      const range = locatePropertyValue(child, lang);
      const liveRaw = child.slice(range.start, range.end);
      if (COPY_ARRAY_FIELDS.has(field)) {
        child = child.slice(0, range.start) + patchStringArrayRaw(liveRaw, before, after, `copy.${field}.${lang}`) + child.slice(range.end);
      } else {
        const liveValue = String(parseJsLiteral(liveRaw) ?? "");
        if (liveValue !== String(before ?? "")) throw new Error(`LIVE DRIFT: copy.${field}.${lang} changed after preparation.`);
        child = child.slice(0, range.start) + JSON.stringify(String(after ?? "")) + child.slice(range.end);
      }
    }
    nextBlock = nextBlock.slice(0, located.start) + child + nextBlock.slice(located.end);
  }
  return nextBlock;
}

function discoveryChangesBetween(baselineDiscovery = {}, approvedDiscovery = {}) {
  const keys = Array.from(new Set([...Object.keys(baselineDiscovery || {}), ...Object.keys(approvedDiscovery || {})])).sort();
  return keys.filter((field) => stable(baselineDiscovery?.[field]) !== stable(approvedDiscovery?.[field])).map((field) => ({ section: "Discovery", field, live: Number(baselineDiscovery?.[field]), next: Number(approvedDiscovery?.[field]) }));
}

function patchDiscoveryBlock(block, baselineDiscovery = {}, approvedDiscovery = {}) {
  let nextBlock = block;
  for (const change of discoveryChangesBetween(baselineDiscovery, approvedDiscovery)) {
    if (!Number.isFinite(change.live) || !Number.isFinite(change.next)) throw new Error(`Discovery field ${change.field} must remain numeric.`);
    const range = locatePropertyValue(nextBlock, change.field);
    const liveValue = Number(parseJsLiteral(nextBlock.slice(range.start, range.end)));
    if (liveValue !== change.live) throw new Error(`LIVE DRIFT: discovery.${change.field} changed after preparation.`);
    nextBlock = nextBlock.slice(0, range.start) + String(change.next) + nextBlock.slice(range.end);
  }
  return nextBlock;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });
  if (!SUPABASE_URL || !SUPABASE_KEY) return json(res, 500, { error: "Supabase server configuration is missing." });
  if (!GITHUB_TOKEN) return json(res, 500, { error: "GITHUB_TOKEN is not configured on the Control Center project." });
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    if (!token) return json(res, 401, { error: "Missing admin session." });
    const userRes = await supabaseFetch("/auth/v1/user", token);
    if (!userRes.ok) return json(res, 401, { error: "Invalid admin session." });
    const user = await userRes.json();
    const adminRes = await supabaseFetch(`/rest/v1/admin_users?user_id=eq.${encodeURIComponent(user.id)}&select=user_id&limit=1`, token);
    const admins = adminRes.ok ? await adminRes.json() : [];
    if (!admins.length) return json(res, 403, { error: "This account is not authorized for controlled apply." });

    const slug = String(req.body?.product_slug || "").trim();
    if (!slug) return json(res, 400, { error: "product_slug is required." });
    const draftRes = await supabaseFetch(`/rest/v1/product_drafts?product_slug=eq.${encodeURIComponent(slug)}&select=product_slug,payload,approved_payload,review_status,prepared_at,baseline_snapshot,apply_branch,apply_pr_number&limit=1`, token);
    if (!draftRes.ok) return json(res, 400, { error: "Could not load prepared draft." });
    const [draft] = await draftRes.json();
    if (!draft) return json(res, 404, { error: "Prepared draft not found." });
    if (draft.review_status !== "approved" || !draft.prepared_at) return json(res, 409, { error: "Draft must be APPROVED and READY TO APPLY first." });
    if (draft.apply_branch && draft.apply_pr_number) return json(res, 200, { ok: true, existing: true, branch: draft.apply_branch, pr_number: draft.apply_pr_number, pr_url: `https://github.com/${REPO}/pull/${draft.apply_pr_number}` });

    const approved = draft.approved_payload || draft.payload;
    const baseline = draft.baseline_snapshot;
    if (!baseline?.core || !approved?.core) return json(res, 409, { error: "Preparation baseline is incomplete." });
    const baselineCore = baseline.core;
    const approvedCore = approved.core;
    const supportedFields = ["category", "rating", "ratingLabel", "badge", "season", "moods", "sizes"];
    const protectedFields = ["name", "shortName"];
    const unsupportedCore = protectedFields.filter((field) => String(baselineCore[field] ?? "") !== String(approvedCore[field] ?? ""));
    if (unsupportedCore.length) return json(res, 409, { error: "Controlled Apply supports Core, Note Map, Recommendations, Wear, Copy and Discovery. Name and Short name remain protected.", unsupported_core: unsupportedCore });

    const coreChanges = supportedFields.map((field) => {
      const live = valueForField(field, baselineCore);
      const next = valueForField(field, approvedCore);
      return { section: "Core", field, live, next, changed: stable(live) !== stable(next) };
    }).filter((item) => item.changed);
    const noteMapChanges = noteMapChangesBetween(baselineCore.noteMap || {}, approvedCore.noteMap || {});
    const recommendationChanges = recommendationsChangeBetween(baselineCore, approvedCore);
    const baselineWear = baseline.wear || {};
    const approvedWear = approved.wear || {};
    const wearChanges = ["sr", "en"].map((lang) => ({ section: "Wear", field: lang, live: String(baselineWear?.[lang] ?? ""), next: String(approvedWear?.[lang] ?? ""), changed: String(baselineWear?.[lang] ?? "") !== String(approvedWear?.[lang] ?? "") })).filter((item) => item.changed);
    const copyChanges = copyChangesBetween(baseline.copy || {}, approved.copy || {});
    const discoveryChanges = discoveryChangesBetween(baseline.discovery || {}, approved.discovery || {});
    const changes = [...coreChanges, ...noteMapChanges, ...recommendationChanges, ...wearChanges, ...copyChanges, ...discoveryChanges];
    if (!changes.length) return json(res, 409, { error: "No supported approved changes remain to apply." });

    const mainRef = await github(`/repos/${OWNER}/${REPO_NAME}/git/ref/heads/main`);
    const baseSha = mainRef.object.sha;
    const stamp = new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 12);
    const safeSlug = slug.replace(/[^a-z0-9-]/gi, "-").toLowerCase();
    const branch = `cc-apply-${safeSlug}-${stamp}`;
    await github(`/repos/${OWNER}/${REPO_NAME}/git/refs`, { method: "POST", body: JSON.stringify({ ref: `refs/heads/${branch}`, sha: baseSha }) });
    const changedFiles = [];

    if (coreChanges.length || noteMapChanges.length || recommendationChanges.length) {
      const filePath = "src/data/products/index.js";
      const file = await github(`/repos/${OWNER}/${REPO_NAME}/contents/${filePath}?ref=main`);
      const source = Buffer.from(file.content, "base64").toString("utf8");
      const located = findProductBlock(source, slug);
      let nextBlock = located.block;
      for (const change of coreChanges) nextBlock = patchProperty(nextBlock, change.field, change.live, change.next);
      if (noteMapChanges.length) nextBlock = patchNoteMap(nextBlock, baselineCore.noteMap || {}, approvedCore.noteMap || {});
      if (recommendationChanges.length) nextBlock = patchRecommendations(nextBlock, baselineCore.recommendations, approvedCore.recommendations);
      const nextSource = source.slice(0, located.start) + nextBlock + source.slice(located.end);
      const summary = [
        ...coreChanges.map((c) => c.field),
        ...noteMapChanges.map((c) => `noteMap.${c.field}`),
        ...recommendationChanges.map(() => "recommendations"),
      ].join(", ");
      await github(`/repos/${OWNER}/${REPO_NAME}/contents/${filePath}`, { method: "PUT", body: JSON.stringify({ message: `Control Center apply: ${slug} (${summary})`, content: Buffer.from(nextSource, "utf8").toString("base64"), sha: file.sha, branch }) });
      changedFiles.push(filePath);
    }
    if (wearChanges.length) {
      const filePath = "src/data/products/productWearContext.js";
      const file = await github(`/repos/${OWNER}/${REPO_NAME}/contents/${filePath}?ref=main`);
      const source = Buffer.from(file.content, "base64").toString("utf8");
      const productName = String(baselineCore.name || approvedCore.name || "");
      if (!productName) throw new Error("Wear Context apply requires a stable product name.");
      const located = findNamedObjectBlock(source, productName, "Wear Context");
      const nextBlock = patchWearBlock(located.block, baselineWear, approvedWear);
      const nextSource = source.slice(0, located.start) + nextBlock + source.slice(located.end);
      const summary = wearChanges.map((c) => `wear.${c.field}`).join(", ");
      await github(`/repos/${OWNER}/${REPO_NAME}/contents/${filePath}`, { method: "PUT", body: JSON.stringify({ message: `Control Center apply: ${slug} (${summary})`, content: Buffer.from(nextSource, "utf8").toString("base64"), sha: file.sha, branch }) });
      changedFiles.push(filePath);
    }
    if (copyChanges.length) {
      const filePath = "src/data/products/productCopy.js";
      const file = await github(`/repos/${OWNER}/${REPO_NAME}/contents/${filePath}?ref=main`);
      const source = Buffer.from(file.content, "base64").toString("utf8");
      const productName = String(baselineCore.name || approvedCore.name || "");
      if (!productName) throw new Error("Copy apply requires a stable product name.");
      const located = findNamedObjectBlock(source, productName, "Product Copy");
      const nextBlock = patchCopyBlock(located.block, baseline.copy || {}, approved.copy || {});
      const nextSource = source.slice(0, located.start) + nextBlock + source.slice(located.end);
      const summary = copyChanges.map((c) => `copy.${c.field}`).join(", ");
      await github(`/repos/${OWNER}/${REPO_NAME}/contents/${filePath}`, { method: "PUT", body: JSON.stringify({ message: `Control Center apply: ${slug} (${summary})`, content: Buffer.from(nextSource, "utf8").toString("base64"), sha: file.sha, branch }) });
      changedFiles.push(filePath);
    }
    if (discoveryChanges.length) {
      const filePath = "src/data/products/discoveryProfiles.js";
      const file = await github(`/repos/${OWNER}/${REPO_NAME}/contents/${filePath}?ref=main`);
      const source = Buffer.from(file.content, "base64").toString("utf8");
      const located = findNamedObjectBlock(source, slug, "Discovery Profiles");
      const nextBlock = patchDiscoveryBlock(located.block, baseline.discovery || {}, approved.discovery || {});
      const nextSource = source.slice(0, located.start) + nextBlock + source.slice(located.end);
      const summary = discoveryChanges.map((c) => `discovery.${c.field}`).join(", ");
      await github(`/repos/${OWNER}/${REPO_NAME}/contents/${filePath}`, { method: "PUT", body: JSON.stringify({ message: `Control Center apply: ${slug} (${summary})`, content: Buffer.from(nextSource, "utf8").toString("base64"), sha: file.sha, branch }) });
      changedFiles.push(filePath);
    }

    const changeLines = changes.map((c) => `- ${c.section} · ${String(c.field).toUpperCase()}: ${displayValue(c.live)} → ${displayValue(c.next)}`);
    const pr = await github(`/repos/${OWNER}/${REPO_NAME}/pulls`, { method: "POST", body: JSON.stringify({ title: `Control Center: ${slug} · ${changes.length} approved change${changes.length === 1 ? "" : "s"}`, head: branch, base: "main", draft: true, body: ["Generated by PlayNice Control Center controlled apply v2.4.", "", `- Product: ${slug}`, ...changeLines, `- Files: ${changedFiles.join(", ")}`, "- Source: approved + prepared Supabase draft", "- Safety: draft PR only; no automatic merge"].join("\n") }) });
    await supabaseFetch(`/rest/v1/product_drafts?product_slug=eq.${encodeURIComponent(slug)}`, token, { method: "PATCH", body: JSON.stringify({ apply_branch: branch, apply_pr_number: pr.number, apply_created_at: new Date().toISOString(), apply_created_by: user.id, preview_verified_at: null, preview_verified_by: null }) });
    await supabaseFetch("/rest/v1/draft_audit_log", token, { method: "POST", body: JSON.stringify({ product_slug: slug, actor_id: user.id, action: "apply_branch_created", details: { branch, pr_number: pr.number, pr_url: pr.html_url, base_sha: baseSha, version: "2.4", fields: changes.map((c) => `${c.section.toLowerCase().replace(/ /g, "_")}.${c.field}`), files: changedFiles } }) });
    return json(res, 200, { ok: true, branch, pr_number: pr.number, pr_url: pr.html_url, version: "2.4", fields: changes.map((c) => `${c.section.toLowerCase().replace(/ /g, "_")}.${c.field}`), files: changedFiles });
  } catch (error) {
    return json(res, 500, { error: error?.message || "Controlled apply failed." });
  }
}
