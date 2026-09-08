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

const normalizeCsv = (value) => Array.isArray(value)
  ? value.map(String).map((item) => item.trim()).filter(Boolean)
  : String(value ?? "").split(",").map((item) => item.trim()).filter(Boolean);

const normalizeSizes = (value) => Object.keys(value || {})
  .sort((a, b) => Number.parseFloat(a) - Number.parseFloat(b))
  .reduce((out, key) => {
    const number = Number(value[key]);
    out[key] = Number.isFinite(number) ? number : value[key];
    return out;
  }, {});

const stable = (value) => {
  const normalize = (item) => {
    if (Array.isArray(item)) return item.map(normalize);
    if (item && typeof item === "object") {
      return Object.keys(item).sort().reduce((out, key) => {
        out[key] = normalize(item[key]);
        return out;
      }, {});
    }
    return item;
  };
  return JSON.stringify(normalize(value ?? null));
};

function scanObject(source, braceStart, label) {
  let depth = 0;
  let quote = "";
  let escaped = false;
  for (let i = braceStart; i < source.length; i += 1) {
    const char = source[i];
    if (quote) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === quote) quote = "";
      continue;
    }
    if (char === '"' || char === "'" || char === "`") {
      quote = char;
      continue;
    }
    if (char === "{") depth += 1;
    else if (char === "}") {
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
  const prefix = source.slice(0, slugMatch.index);
  const starts = [...prefix.matchAll(/(?:^|\n)[ \t]*\{/g)];
  const candidate = starts.at(-1);
  if (!candidate) throw new Error(`Could not locate product object for ${slug}.`);
  const start = candidate.index + candidate[0].lastIndexOf("{");
  const located = scanObject(source, start, slug);
  if (!slugRegex.test(located.block)) throw new Error(`Could not safely locate product object for ${slug}.`);
  return located;
}

function findNamedObjectBlock(source, key, label) {
  const regex = new RegExp(`(["'])${escapeRegex(key)}\\1\\s*:\\s*\\{`);
  const match = regex.exec(source);
  if (!match) throw new Error(`Could not locate ${key} in ${label}.`);
  return scanObject(source, source.indexOf("{", match.index), key);
}

function findChildObjectBlock(block, property) {
  const regex = new RegExp(`(?:^|\\n|\\{)\\s*(?:["']${escapeRegex(property)}["']|${escapeRegex(property)})\\s*:\\s*\\{`);
  const match = regex.exec(block);
  if (!match) throw new Error(`Could not locate nested ${property} object.`);
  return scanObject(block, block.indexOf("{", match.index), property);
}

function locatePropertyValue(block, property) {
  const regex = new RegExp(`(?:^|\\n|\\{)\\s*(?:["']${escapeRegex(property)}["']|${escapeRegex(property)})\\s*:\\s*`);
  const match = regex.exec(block);
  if (!match) throw new Error(`Could not locate ${property} in object.`);
  const start = match.index + match[0].length;
  let square = 0;
  let curly = 0;
  let paren = 0;
  let quote = "";
  let escaped = false;
  for (let i = start; i < block.length; i += 1) {
    const char = block[i];
    if (quote) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === quote) quote = "";
      continue;
    }
    if (char === '"' || char === "'" || char === "`") {
      quote = char;
      continue;
    }
    if (char === "[") square += 1;
    else if (char === "]") square -= 1;
    else if (char === "{") curly += 1;
    else if (char === "}") {
      if (curly > 0) curly -= 1;
      else if (square === 0 && paren === 0) return { start, end: i };
    } else if (char === "(") paren += 1;
    else if (char === ")") paren -= 1;
    else if (char === "," && square === 0 && curly === 0 && paren === 0) return { start, end: i };
  }
  throw new Error(`Could not read ${property} value.`);
}

function parseJsLiteral(raw) {
  const text = raw.trim();
  if (!text) return "";
  if (/^-?\d+(?:\.\d+)?$/.test(text)) return Number(text);
  try {
    return JSON.parse(text);
  } catch {
    if ((text.startsWith("'") && text.endsWith("'")) || (text.startsWith('"') && text.endsWith('"'))) {
      return text.slice(1, -1);
    }
  }
  throw new Error(`Unsupported catalog value syntax: ${text.slice(0, 80)}`);
}

function patchScalar(block, property, baseline, approved, { numeric = false } = {}) {
  const before = numeric ? Number(baseline) : String(baseline ?? "");
  const after = numeric ? Number(approved) : String(approved ?? "");
  if (stable(before) === stable(after)) return block;
  const range = locatePropertyValue(block, property);
  const live = parseJsLiteral(block.slice(range.start, range.end));
  const normalizedLive = numeric ? Number(live) : String(live ?? "");
  if (stable(normalizedLive) !== stable(before)) throw new Error(`LIVE DRIFT: ${property} changed after preparation.`);
  const rendered = numeric ? String(after) : JSON.stringify(after);
  return block.slice(0, range.start) + rendered + block.slice(range.end);
}

function patchArray(block, property, baseline, approved, label) {
  const before = normalizeCsv(baseline);
  const after = normalizeCsv(approved);
  if (stable(before) === stable(after)) return block;
  const range = locatePropertyValue(block, property);
  const live = normalizeCsv(parseJsLiteral(block.slice(range.start, range.end)));
  if (stable(live) !== stable(before)) throw new Error(`LIVE DRIFT: ${label} changed after preparation.`);
  return block.slice(0, range.start) + JSON.stringify(after) + block.slice(range.end);
}

function patchSizes(block, baseline, approved) {
  const before = normalizeSizes(baseline);
  const after = normalizeSizes(approved);
  if (stable(before) === stable(after)) return block;
  const range = locatePropertyValue(block, "sizes");
  const live = normalizeSizes(parseJsLiteral(block.slice(range.start, range.end)));
  if (stable(live) !== stable(before)) throw new Error("LIVE DRIFT: sizes changed after preparation.");
  if (!Object.keys(after).length) throw new Error("At least one size is required.");
  for (const [key, value] of Object.entries(after)) {
    if (!String(key).trim() || !Number.isFinite(Number(value)) || Number(value) <= 0) {
      throw new Error(`Invalid price for ${key || "size"}.`);
    }
  }
  return block.slice(0, range.start) + JSON.stringify(after) + block.slice(range.end);
}

function patchNestedScalars(block, property, baseline = {}, approved = {}, fields) {
  if (stable(baseline) === stable(approved)) return block;
  const located = findChildObjectBlock(block, property);
  let child = located.block;
  for (const field of fields) {
    child = patchScalar(child, field, baseline?.[field], approved?.[field]);
  }
  return block.slice(0, located.start) + child + block.slice(located.end);
}

function patchNoteMap(block, baseline = {}, approved = {}) {
  if (stable({
    top: normalizeCsv(baseline.top),
    heart: normalizeCsv(baseline.heart),
    base: normalizeCsv(baseline.base),
  }) === stable({
    top: normalizeCsv(approved.top),
    heart: normalizeCsv(approved.heart),
    base: normalizeCsv(approved.base),
  })) return block;
  const located = findChildObjectBlock(block, "noteMap");
  let child = located.block;
  for (const field of ["top", "heart", "base"]) {
    child = patchArray(child, field, baseline?.[field], approved?.[field], `noteMap.${field}`);
  }
  return block.slice(0, located.start) + child + block.slice(located.end);
}

function renameNamedObjectKey(source, oldKey, newKey, label) {
  if (!oldKey || !newKey || oldKey === newKey) return source;
  const oldRegex = new RegExp(`(["'])${escapeRegex(oldKey)}\\1(\\s*:\\s*\\{)`);
  const oldMatch = oldRegex.exec(source);
  if (!oldMatch) throw new Error(`Could not locate ${oldKey} in ${label}.`);
  const duplicate = new RegExp(`(["'])${escapeRegex(newKey)}\\1\\s*:\\s*\\{`);
  if (duplicate.test(source)) throw new Error(`${label} already contains ${newKey}.`);
  return source.slice(0, oldMatch.index)
    + `${oldMatch[1]}${newKey}${oldMatch[1]}${oldMatch[2]}`
    + source.slice(oldMatch.index + oldMatch[0].length);
}

async function readMainFile(path) {
  const file = await github(`/repos/${OWNER}/${REPO_NAME}/contents/${path}?ref=main`);
  return {
    path,
    source: Buffer.from(file.content, "base64").toString("utf8"),
  };
}

async function createBlob(source) {
  const blob = await github(`/repos/${OWNER}/${REPO_NAME}/git/blobs`, {
    method: "POST",
    body: JSON.stringify({
      content: Buffer.from(source, "utf8").toString("base64"),
      encoding: "base64",
    }),
  });
  return blob.sha;
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

    const adminRes = await supabaseFetch(
      `/rest/v1/admin_users?user_id=eq.${encodeURIComponent(user.id)}&select=user_id&limit=1`,
      token,
    );
    const admins = adminRes.ok ? await adminRes.json() : [];
    if (!admins.length) return json(res, 403, { error: "This account is not authorized for controlled apply." });

    const slug = String(req.body?.product_slug || "").trim();
    if (!slug) return json(res, 400, { error: "product_slug is required." });

    const draftRes = await supabaseFetch(
      `/rest/v1/product_drafts?product_slug=eq.${encodeURIComponent(slug)}&select=product_slug,payload,approved_payload,review_status,prepared_at,baseline_snapshot,apply_branch,apply_pr_number&limit=1`,
      token,
    );
    if (!draftRes.ok) return json(res, 400, { error: "Could not load prepared draft." });
    const [draft] = await draftRes.json();
    if (!draft) return json(res, 404, { error: "Prepared draft not found." });
    if (draft.review_status !== "approved" || !draft.prepared_at) {
      return json(res, 409, { error: "Draft must be APPROVED and READY TO APPLY first." });
    }
    if (!draft.approved_payload) return json(res, 409, { error: "Approved snapshot is missing." });
    if (stable(draft.payload) !== stable(draft.approved_payload)) {
      return json(res, 409, { error: "Approved payload no longer matches the current product draft. Review and approve again." });
    }
    if (!draft.apply_branch || !draft.apply_pr_number) {
      return json(res, 409, { error: "No existing preview branch to refresh." });
    }

    const pr = await github(`/repos/${OWNER}/${REPO_NAME}/pulls/${draft.apply_pr_number}`);
    if (pr.state !== "open") return json(res, 409, { error: `PR #${draft.apply_pr_number} is not open.` });
    if (pr.head?.ref !== draft.apply_branch) {
      return json(res, 409, { error: `PR #${draft.apply_pr_number} no longer points to ${draft.apply_branch}.` });
    }
    if (pr.base?.ref !== "main") return json(res, 409, { error: `PR #${draft.apply_pr_number} no longer targets main.` });

    const approved = draft.approved_payload;
    const baseline = draft.baseline_snapshot;
    if (!baseline?.core || !approved?.core) return json(res, 409, { error: "Preparation baseline is incomplete." });

    const baselineCore = baseline.core;
    const approvedCore = approved.core;
    const oldName = String(baselineCore.name || "");
    const newName = String(approvedCore.name || oldName);
    const files = [];

    {
      const file = await readMainFile("playnice-site/src/data/products/index.js");
      const located = findProductBlock(file.source, slug);
      let block = located.block;

      for (const field of ["name", "shortName", "category", "image", "ratingLabel", "badge", "season"]) {
        block = patchScalar(block, field, baselineCore?.[field], approvedCore?.[field]);
      }
      block = patchScalar(block, "rating", baselineCore.rating, approvedCore.rating, { numeric: true });
      block = patchArray(block, "moods", baselineCore.moods, approvedCore.moods, "moods");
      block = patchSizes(block, baselineCore.sizes, approvedCore.sizes);
      block = patchNestedScalars(block, "inspiredBy", baselineCore.inspiredBy || {}, approvedCore.inspiredBy || {}, ["name", "short"]);
      block = patchNoteMap(block, baselineCore.noteMap || {}, approvedCore.noteMap || {});
      block = patchArray(block, "recommendations", baselineCore.recommendations, approvedCore.recommendations, "recommendations");

      const next = file.source.slice(0, located.start) + block + file.source.slice(located.end);
      if (next !== file.source) files.push({ path: file.path, source: next });
    }

    {
      const baselineWear = baseline.wear || baselineCore.wear || {};
      const approvedWear = approved.wear || approvedCore.wear || {};
      if (stable(baselineWear) !== stable(approvedWear) || oldName !== newName) {
        const file = await readMainFile("playnice-site/src/data/products/productWearContext.js");
        const located = findNamedObjectBlock(file.source, oldName, "Wear Context");
        let block = located.block;
        for (const lang of ["sr", "en"]) {
          block = patchScalar(block, lang, baselineWear?.[lang], approvedWear?.[lang]);
        }
        let next = file.source.slice(0, located.start) + block + file.source.slice(located.end);
        if (oldName !== newName) next = renameNamedObjectKey(next, oldName, newName, "Wear Context");
        if (next !== file.source) files.push({ path: file.path, source: next });
      }
    }

    {
      const baselineCopy = baseline.copy || {};
      const approvedCopy = approved.copy || {};
      if (stable(baselineCopy) !== stable(approvedCopy) || oldName !== newName) {
        const file = await readMainFile("playnice-site/src/data/products/productCopy.js");
        const located = findNamedObjectBlock(file.source, oldName, "Product Copy");
        let block = located.block;
        const arrayFields = new Set(["dominantNotes", "tags"]);
        for (const field of ["miniTag", "card", "modal", "scentType", "dominantNotes", "tags", "whyChoose"]) {
          const beforeGroup = baselineCopy?.[field] || {};
          const afterGroup = approvedCopy?.[field] || {};
          if (stable(beforeGroup) === stable(afterGroup)) continue;
          const childLocated = findChildObjectBlock(block, field);
          let child = childLocated.block;
          for (const lang of ["sr", "en"]) {
            if (arrayFields.has(field)) {
              child = patchArray(child, lang, beforeGroup?.[lang], afterGroup?.[lang], `copy.${field}.${lang}`);
            } else {
              child = patchScalar(child, lang, beforeGroup?.[lang], afterGroup?.[lang]);
            }
          }
          block = block.slice(0, childLocated.start) + child + block.slice(childLocated.end);
        }
        let next = file.source.slice(0, located.start) + block + file.source.slice(located.end);
        if (oldName !== newName) next = renameNamedObjectKey(next, oldName, newName, "Product Copy");
        if (next !== file.source) files.push({ path: file.path, source: next });
      }
    }

    {
      const baselineDiscovery = baseline.discovery || baselineCore.discovery || {};
      const approvedDiscovery = approved.discovery || approvedCore.discovery || {};
      if (stable(baselineDiscovery) !== stable(approvedDiscovery)) {
        const file = await readMainFile("playnice-site/src/data/products/discoveryProfiles.js");
        const located = findNamedObjectBlock(file.source, slug, "Discovery Profiles");
        let block = located.block;
        const fields = Array.from(new Set([
          ...Object.keys(baselineDiscovery || {}),
          ...Object.keys(approvedDiscovery || {}),
        ])).sort();
        for (const field of fields) {
          block = patchScalar(block, field, baselineDiscovery?.[field], approvedDiscovery?.[field], { numeric: true });
        }
        const next = file.source.slice(0, located.start) + block + file.source.slice(located.end);
        if (next !== file.source) files.push({ path: file.path, source: next });
      }
    }

    if (!files.length) return json(res, 409, { error: "No supported approved changes remain to refresh." });

    const mainRef = await github(`/repos/${OWNER}/${REPO_NAME}/git/ref/heads/main`);
    const baseSha = mainRef.object.sha;
    const mainCommit = await github(`/repos/${OWNER}/${REPO_NAME}/git/commits/${baseSha}`);
    const treeEntries = [];
    for (const file of files) {
      treeEntries.push({
        path: file.path,
        mode: "100644",
        type: "blob",
        sha: await createBlob(file.source),
      });
    }

    const tree = await github(`/repos/${OWNER}/${REPO_NAME}/git/trees`, {
      method: "POST",
      body: JSON.stringify({ base_tree: mainCommit.tree.sha, tree: treeEntries }),
    });
    const commit = await github(`/repos/${OWNER}/${REPO_NAME}/git/commits`, {
      method: "POST",
      body: JSON.stringify({
        message: `Control Center refresh: ${slug}`,
        tree: tree.sha,
        parents: [baseSha],
      }),
    });
    await github(`/repos/${OWNER}/${REPO_NAME}/git/refs/heads/${encodeURIComponent(draft.apply_branch)}`, {
      method: "PATCH",
      body: JSON.stringify({ sha: commit.sha, force: true }),
    });

    const refreshedAt = new Date().toISOString();
    await supabaseFetch(`/rest/v1/product_drafts?product_slug=eq.${encodeURIComponent(slug)}`, token, {
      method: "PATCH",
      body: JSON.stringify({
        apply_created_at: refreshedAt,
        apply_created_by: user.id,
        preview_verified_at: null,
        preview_verified_by: null,
      }),
    });
    await supabaseFetch("/rest/v1/draft_audit_log", token, {
      method: "POST",
      body: JSON.stringify({
        product_slug: slug,
        actor_id: user.id,
        action: "apply_branch_refreshed",
        details: {
          branch: draft.apply_branch,
          pr_number: draft.apply_pr_number,
          base_sha: baseSha,
          refresh_commit_sha: commit.sha,
          files: files.map((file) => file.path),
          version: "2.8-refresh",
        },
      }),
    });

    return json(res, 200, {
      ok: true,
      refreshed: true,
      existing: true,
      branch: draft.apply_branch,
      pr_number: draft.apply_pr_number,
      pr_url: `https://github.com/${REPO}/pull/${draft.apply_pr_number}`,
      base_sha: baseSha,
      commit_sha: commit.sha,
      files: files.map((file) => file.path),
      refreshed_at: refreshedAt,
    });
  } catch (error) {
    return json(res, 500, { error: error?.message || "Preview refresh failed." });
  }
}
