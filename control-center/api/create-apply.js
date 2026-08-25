const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO = "hazardno-dot/playnice-site";
const [OWNER, REPO_NAME] = REPO.split("/");

const json = (res, status, body) => res.status(status).json(body);

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

const valueForField = (field, core) => {
  if (field === "rating") return Number(core?.rating);
  if (field === "moods") return normalizeCsv(core?.moods);
  if (field === "sizes") return normalizeSizes(core?.sizes || {});
  return String(core?.[field] ?? "");
};

const displayValue = (value) => typeof value === "string" ? value : JSON.stringify(value);

function findProductBlock(source, slug) {
  const escaped = slug.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const slugRegex = new RegExp(`\\bslug\\s*:\\s*["']${escaped}["']`);
  const slugMatch = slugRegex.exec(source);
  if (!slugMatch) throw new Error(`Could not locate ${slug} in main catalog.`);

  let start = source.lastIndexOf("\n  {", slugMatch.index);
  if (start < 0) start = source.lastIndexOf("{", slugMatch.index);
  else start += 3;
  if (start < 0) throw new Error(`Could not locate product object for ${slug}.`);

  let depth = 0;
  let quote = "";
  let escapedChar = false;
  for (let i = start; i < source.length; i += 1) {
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
      if (depth === 0) return { start, end: i + 1, block: source.slice(start, i + 1) };
    }
  }
  throw new Error(`Could not determine product object boundary for ${slug}.`);
}

function locatePropertyValue(block, property) {
  const escaped = property.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`\\n\\s{4}${escaped}\\s*:\\s*`);
  const match = re.exec(block);
  if (!match) throw new Error(`Could not locate ${property} in product object.`);
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
    if ((text.startsWith("'") && text.endsWith("'")) || (text.startsWith('"') && text.endsWith('"'))) {
      return text.slice(1, -1);
    }
  }
  throw new Error(`Unsupported catalog value syntax: ${text.slice(0, 80)}`);
}

function serializeField(field, value) {
  if (field === "rating") return String(Number(value));
  return JSON.stringify(value);
}

function patchProperty(block, field, baselineValue, draftValue) {
  const range = locatePropertyValue(block, field);
  const liveRaw = block.slice(range.start, range.end);
  const liveValue = parseJsLiteral(liveRaw);
  const liveNormalized = field === "moods" ? normalizeCsv(liveValue)
    : field === "sizes" ? normalizeSizes(liveValue)
    : field === "rating" ? Number(liveValue)
    : String(liveValue ?? "");

  if (stable(liveNormalized) !== stable(baselineValue)) {
    throw new Error(`LIVE DRIFT: main ${field} is ${displayValue(liveNormalized)}, preparation baseline expected ${displayValue(baselineValue)}.`);
  }
  return block.slice(0, range.start) + serializeField(field, draftValue) + block.slice(range.end);
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

    if (draft.apply_branch && draft.apply_pr_number) {
      return json(res, 200, {
        ok: true,
        existing: true,
        branch: draft.apply_branch,
        pr_number: draft.apply_pr_number,
        pr_url: `https://github.com/${REPO}/pull/${draft.apply_pr_number}`,
      });
    }

    const approved = draft.approved_payload || draft.payload;
    const baseline = draft.baseline_snapshot;
    if (!baseline?.core || !approved?.core) return json(res, 409, { error: "Preparation baseline is incomplete." });

    const baselineCore = baseline.core;
    const approvedCore = approved.core;
    const supportedFields = ["rating", "ratingLabel", "badge", "season", "moods", "sizes"];
    const protectedFields = ["name", "shortName", "category", "noteMap", "recommendations"];

    const unsupportedCore = protectedFields.filter((field) => {
      if (field === "noteMap") {
        const a = {
          top: normalizeCsv(baselineCore.noteMap?.top),
          heart: normalizeCsv(baselineCore.noteMap?.heart),
          base: normalizeCsv(baselineCore.noteMap?.base),
        };
        const b = {
          top: normalizeCsv(approvedCore.noteMap?.top),
          heart: normalizeCsv(approvedCore.noteMap?.heart),
          base: normalizeCsv(approvedCore.noteMap?.base),
        };
        return stable(a) !== stable(b);
      }
      if (field === "recommendations") return stable(normalizeCsv(baselineCore.recommendations)) !== stable(normalizeCsv(approvedCore.recommendations));
      return String(baselineCore[field] ?? "") !== String(approvedCore[field] ?? "");
    });

    const nonCoreChanged = stable(baseline.copy || {}) !== stable(approved.copy || {}) ||
      stable(baseline.wear || {}) !== stable(approved.wear || {}) ||
      stable(baseline.discovery || {}) !== stable(approved.discovery || {});

    if (unsupportedCore.length || nonCoreChanged) {
      return json(res, 409, {
        error: "Controlled Apply v2 currently supports Rating, Rating label, Badge, Season, Moods and Sizes/prices only. Other changes must remain in draft.",
        unsupported_core: unsupportedCore,
        non_core_changed: nonCoreChanged,
      });
    }

    const changes = supportedFields.map((field) => {
      const live = valueForField(field, baselineCore);
      const next = valueForField(field, approvedCore);
      return { field, live, next, changed: stable(live) !== stable(next) };
    }).filter((item) => item.changed);

    if (!changes.length) return json(res, 409, { error: "No supported approved changes remain to apply." });

    const mainRef = await github(`/repos/${OWNER}/${REPO_NAME}/git/ref/heads/main`);
    const baseSha = mainRef.object.sha;
    const stamp = new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 12);
    const safeSlug = slug.replace(/[^a-z0-9-]/gi, "-").toLowerCase();
    const branch = `cc-apply-${safeSlug}-${stamp}`;

    await github(`/repos/${OWNER}/${REPO_NAME}/git/refs`, {
      method: "POST",
      body: JSON.stringify({ ref: `refs/heads/${branch}`, sha: baseSha }),
    });

    const filePath = "src/data/products/index.js";
    const file = await github(`/repos/${OWNER}/${REPO_NAME}/contents/${filePath}?ref=main`);
    const source = Buffer.from(file.content, "base64").toString("utf8");
    const located = findProductBlock(source, slug);
    let nextBlock = located.block;
    for (const change of changes) nextBlock = patchProperty(nextBlock, change.field, change.live, change.next);
    const nextSource = source.slice(0, located.start) + nextBlock + source.slice(located.end);

    const summary = changes.map((c) => c.field).join(", ");
    await github(`/repos/${OWNER}/${REPO_NAME}/contents/${filePath}`, {
      method: "PUT",
      body: JSON.stringify({
        message: `Control Center apply: ${slug} (${summary})`,
        content: Buffer.from(nextSource, "utf8").toString("base64"),
        sha: file.sha,
        branch,
      }),
    });

    const changeLines = changes.map((c) => `- ${c.field}: ${displayValue(c.live)} → ${displayValue(c.next)}`);
    const pr = await github(`/repos/${OWNER}/${REPO_NAME}/pulls`, {
      method: "POST",
      body: JSON.stringify({
        title: `Control Center: ${slug} · ${changes.length} approved change${changes.length === 1 ? "" : "s"}`,
        head: branch,
        base: "main",
        draft: true,
        body: [
          "Generated by PlayNice Control Center controlled apply v2.",
          "",
          `- Product: ${slug}`,
          ...changeLines,
          "- Source: approved + prepared Supabase draft",
          "- Safety: draft PR only; no automatic merge",
        ].join("\n"),
      }),
    });

    await supabaseFetch(`/rest/v1/product_drafts?product_slug=eq.${encodeURIComponent(slug)}`, token, {
      method: "PATCH",
      body: JSON.stringify({
        apply_branch: branch,
        apply_pr_number: pr.number,
        apply_created_at: new Date().toISOString(),
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
        action: "apply_branch_created",
        details: {
          branch,
          pr_number: pr.number,
          pr_url: pr.html_url,
          base_sha: baseSha,
          version: 2,
          fields: changes.map((c) => c.field),
        },
      }),
    });

    return json(res, 200, {
      ok: true,
      branch,
      pr_number: pr.number,
      pr_url: pr.html_url,
      version: 2,
      fields: changes.map((c) => c.field),
    });
  } catch (error) {
    return json(res, 500, { error: error?.message || "Controlled apply failed." });
  }
}
