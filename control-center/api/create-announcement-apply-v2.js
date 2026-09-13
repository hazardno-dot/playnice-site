const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO = "hazardno-dot/playnice-site";
const [OWNER, REPO_NAME] = REPO.split("/");
const CONFIG_PATH = "playnice-site/src/data/announcementConfig.generated.js";

const json = (res, status, body) => res.status(status).json(body);

async function readJson(response, label) {
  const text = await response.text();
  try { return text ? JSON.parse(text) : null; }
  catch { throw new Error(`${label} returned a non-JSON response (${response.status}).`); }
}

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
  const data = await readJson(response, "GitHub API");
  if (!response.ok) {
    const error = new Error(data?.message || `GitHub request failed (${response.status})`);
    error.status = response.status;
    throw error;
  }
  return data;
}

const stable = (value) => {
  const normalize = (item) => {
    if (Array.isArray(item)) return item.map(normalize);
    if (item && typeof item === "object") return Object.keys(item).sort().reduce((out, key) => {
      if (typeof item[key] !== "undefined") out[key] = normalize(item[key]);
      return out;
    }, {});
    return item;
  };
  return JSON.stringify(normalize(value ?? null));
};

function parseConfig(source) {
  const marker = "export const ANNOUNCEMENT_ITEMS = ";
  const start = source.indexOf(marker);
  if (start < 0) throw new Error("Generated Announcement config export was not found.");
  const raw = source.slice(start + marker.length).trim().replace(/;\s*$/, "");
  try {
    const parsed = Function(`\"use strict\"; return (${raw});`)();
    if (!Array.isArray(parsed)) throw new Error("not an array");
    return JSON.parse(JSON.stringify(parsed));
  } catch (error) {
    throw new Error(`Could not parse generated Announcement config: ${error.message}`);
  }
}

function normalizeItem(item) {
  const normalized = {
    id: String(item?.id || "").trim(),
    enabled: item?.enabled !== false,
    text: { sr: String(item?.text?.sr || "").trim(), en: String(item?.text?.en || "").trim() },
    icon: String(item?.icon || "").trim(),
    tone: String(item?.tone || "default").trim() || "default",
    action: String(item?.action || "none").trim() || "none",
    priority: Number.isFinite(Number(item?.priority)) ? Number(item.priority) : 0,
  };
  const slug = String(item?.slug || "").trim();
  if (normalized.action === "openProduct") normalized.slug = slug;
  return normalized;
}

function validateItem(item) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.id)) throw new Error("Announcement id must use lowercase kebab-case.");
  if (!item.text.sr || !item.text.en) throw new Error("Announcement requires both SR and EN copy.");
  if (item.action === "openProduct" && !item.slug) throw new Error("openProduct Announcement requires a product slug.");
}

function scanObject(source, braceStart) {
  let depth = 0;
  let quote = "";
  let escaped = false;
  for (let i = braceStart; i < source.length; i += 1) {
    const ch = source[i];
    if (quote) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
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
  throw new Error("Could not determine Announcement object boundary.");
}

function findItemBlock(source, id) {
  const escapedId = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = new RegExp(`\\bid\\s*:\\s*[\"']${escapedId}[\"']`).exec(source);
  if (!match) return null;
  const prefix = source.slice(0, match.index);
  const starts = [...prefix.matchAll(/(?:^|\n)[ \t]*\{/g)];
  const candidate = starts.at(-1);
  if (!candidate) throw new Error(`Could not locate Announcement object for ${id}.`);
  const start = candidate.index + candidate[0].lastIndexOf("{");
  return scanObject(source, start);
}

function escapeForQuote(value, quote) {
  return String(value).replace(/\\/g, "\\\\").replace(new RegExp(quote, "g"), `\\${quote}`);
}

function replaceScalar(block, property, value) {
  const re = new RegExp(`(^|\\n)([ \\t]*)${property}\\s*:\\s*([^,\\n]+)(,?)`, "m");
  const match = re.exec(block);
  if (!match) throw new Error(`Could not locate ${property} in Announcement object.`);
  const current = match[3].trim();
  let rendered;
  if (typeof value === "boolean" || typeof value === "number") rendered = String(value);
  else {
    const quote = current.startsWith("'") ? "'" : '"';
    rendered = `${quote}${escapeForQuote(value, quote)}${quote}`;
  }
  return block.slice(0, match.index) + `${match[1]}${match[2]}${property}: ${rendered}${match[4]}` + block.slice(match.index + match[0].length);
}

function replaceText(block, lang, value) {
  const textMatch = /(^|\n)([ \t]*)text\s*:\s*\{/m.exec(block);
  if (!textMatch) throw new Error("Could not locate text object in Announcement object.");
  const brace = block.indexOf("{", textMatch.index);
  const located = scanObject(block, brace);
  const property = new RegExp(`(^|\\n)([ \\t]*)${lang}\\s*:\\s*([\"'])([\\s\\S]*?)\\3(,?)`, "m");
  const match = property.exec(located.block);
  if (!match) throw new Error(`Could not locate text.${lang}.`);
  const rendered = `${match[1]}${match[2]}${lang}: ${match[3]}${escapeForQuote(value, match[3])}${match[3]}${match[5]}`;
  const nextText = located.block.slice(0, match.index) + rendered + located.block.slice(match.index + match[0].length);
  return block.slice(0, located.start) + nextText + block.slice(located.end);
}

function patchExistingItem(source, approved) {
  const located = findItemBlock(source, approved.id);
  if (!located) return null;
  let block = located.block;
  block = replaceScalar(block, "enabled", approved.enabled);
  block = replaceText(block, "sr", approved.text.sr);
  block = replaceText(block, "en", approved.text.en);
  block = replaceScalar(block, "icon", approved.icon);
  block = replaceScalar(block, "tone", approved.tone);
  block = replaceScalar(block, "action", approved.action);
  block = replaceScalar(block, "priority", approved.priority);
  if (approved.action === "openProduct") block = replaceScalar(block, "slug", approved.slug);
  return source.slice(0, located.start) + block + source.slice(located.end);
}

function renderNewItem(item) {
  const lines = [
    "  {",
    `    id: ${JSON.stringify(item.id)},`,
    `    enabled: ${item.enabled},`,
    "    text: {",
    `      sr: ${JSON.stringify(item.text.sr)},`,
    `      en: ${JSON.stringify(item.text.en)},`,
    "    },",
    `    icon: ${JSON.stringify(item.icon)},`,
    `    tone: ${JSON.stringify(item.tone)},`,
    `    action: ${JSON.stringify(item.action)},`,
  ];
  if (item.action === "openProduct") lines.push(`    slug: ${JSON.stringify(item.slug)},`);
  lines.push(`    priority: ${item.priority},`, "  },");
  return lines.join("\n");
}

function appendNewItem(source, item) {
  const marker = "export const ANNOUNCEMENT_ITEMS = [";
  const start = source.indexOf(marker);
  if (start < 0) throw new Error("Generated Announcement array was not found.");
  const close = source.lastIndexOf("];");
  if (close < start) throw new Error("Generated Announcement array boundary was not found.");
  const before = source.slice(0, close).replace(/\s*$/, "");
  return `${before}\n${renderNewItem(item)}\n${source.slice(close)}`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed." });
  if (!SUPABASE_URL || !SUPABASE_KEY || !GITHUB_TOKEN) return json(res, 500, { error: "Controlled Apply environment is incomplete." });

  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  const key = String(req.body?.announcement_key || "").trim();
  if (!token) return json(res, 401, { error: "Admin session required." });
  if (!key) return json(res, 400, { error: "announcement_key is required." });

  try {
    const userResponse = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${token}` } });
    const user = await readJson(userResponse, "Supabase Auth");
    if (!userResponse.ok || !user?.id) return json(res, 401, { error: "Admin session expired." });

    const adminResponse = await supabaseFetch(`/rest/v1/admin_users?user_id=eq.${encodeURIComponent(user.id)}&select=user_id`, token);
    const admins = await readJson(adminResponse, "Supabase admin lookup");
    if (!adminResponse.ok || !Array.isArray(admins) || !admins.length) return json(res, 403, { error: "PlayNice admin access required." });

    const draftResponse = await supabaseFetch(`/rest/v1/announcement_drafts?announcement_key=eq.${encodeURIComponent(key)}&select=announcement_key,payload,approved_payload,review_status,baseline_snapshot,prepared_at,apply_branch,apply_pr_number&limit=1`, token);
    const drafts = await readJson(draftResponse, "Supabase Announcement draft");
    if (!draftResponse.ok) throw new Error(drafts?.message || "Could not read Announcement draft.");
    const draft = drafts?.[0];
    if (!draft) return json(res, 404, { error: "Announcement draft not found." });
    if (draft.review_status !== "approved" || !draft.approved_payload) return json(res, 409, { error: "Announcement draft must be approved before Controlled Apply." });
    if (stable(draft.payload) !== stable(draft.approved_payload)) return json(res, 409, { error: "APPROVAL SAFETY BLOCK: current draft differs from the approved snapshot." });
    if (!draft.prepared_at || !draft.baseline_snapshot?.source_sha) return json(res, 409, { error: "Announcement draft must be prepared before Controlled Apply." });
    if (draft.apply_branch || draft.apply_pr_number) return json(res, 409, { error: "An Announcement preview branch already exists for this draft." });

    const approved = normalizeItem(draft.approved_payload);
    validateItem(approved);

    const mainRef = await github(`/repos/${OWNER}/${REPO_NAME}/git/ref/heads/main`);
    const baseSha = mainRef.object.sha;
    const configFile = await github(`/repos/${OWNER}/${REPO_NAME}/contents/${CONFIG_PATH}?ref=main`);
    if (configFile.sha !== draft.baseline_snapshot.source_sha) return json(res, 409, { error: "LIVE DRIFT: Announcement config changed after preparation. Return to draft, approve and prepare again." });

    const source = Buffer.from(configFile.content, "base64").toString("utf8");
    const currentItems = parseConfig(source).map(normalizeItem);
    const existingIndex = currentItems.findIndex((item) => item.id === key);
    const before = existingIndex >= 0 ? currentItems[existingIndex] : null;
    if (before && stable(before) === stable(approved)) return json(res, 409, { error: "Approved Announcement draft contains no runtime change." });

    const nextSource = existingIndex >= 0 ? patchExistingItem(source, approved) : appendNewItem(source, approved);
    if (!nextSource || nextSource === source) return json(res, 409, { error: "Announcement source patch produced no change." });

    const stamp = new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 12);
    const safeKey = key.replace(/[^a-z0-9-]/gi, "-").toLowerCase();
    const branch = `cc-announcement-apply-${safeKey}-${stamp}`;
    await github(`/repos/${OWNER}/${REPO_NAME}/git/refs`, { method: "POST", body: JSON.stringify({ ref: `refs/heads/${branch}`, sha: baseSha }) });

    await github(`/repos/${OWNER}/${REPO_NAME}/contents/${CONFIG_PATH}`, {
      method: "PUT",
      body: JSON.stringify({ message: `Control Center Announcement apply: ${key}`, content: Buffer.from(nextSource, "utf8").toString("base64"), sha: configFile.sha, branch }),
    });

    const pr = await github(`/repos/${OWNER}/${REPO_NAME}/pulls`, {
      method: "POST",
      body: JSON.stringify({
        title: `Control Center Announcement: ${key}`,
        head: branch,
        base: "main",
        draft: true,
        body: [
          "Generated by PlayNice Control Center Announcement Controlled Apply v2.",
          "",
          `- Announcement: ${key}`,
          `- Before: ${JSON.stringify(before)}`,
          `- Approved: ${JSON.stringify(approved)}`,
          `- File: ${CONFIG_PATH}`,
          `- Baseline SHA: ${draft.baseline_snapshot.source_sha}`,
          "- Safety: approved payload parity checked before PR creation",
          "- Safety: main config SHA must match prepared baseline",
          "- Safety: source formatting is preserved for existing items",
          "- Safety: one draft PR only; no automatic merge",
        ].join("\n"),
      }),
    });

    const now = new Date().toISOString();
    const patchResponse = await supabaseFetch(`/rest/v1/announcement_drafts?announcement_key=eq.${encodeURIComponent(key)}`, token, {
      method: "PATCH",
      body: JSON.stringify({ apply_branch: branch, apply_pr_number: pr.number, apply_created_at: now, apply_created_by: user.id, preview_verified_at: null, preview_verified_by: null }),
    });
    if (!patchResponse.ok) {
      const patchBody = await readJson(patchResponse, "Supabase Announcement apply metadata");
      throw new Error(patchBody?.message || "Could not save Announcement apply metadata.");
    }

    return json(res, 200, { ok: true, branch, pr_number: pr.number, pr_url: pr.html_url, files: [CONFIG_PATH] });
  } catch (error) {
    console.error("Announcement Controlled Apply v2 failed", error);
    return json(res, 500, { error: error?.message || "Announcement Controlled Apply failed." });
  }
}
