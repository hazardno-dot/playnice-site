const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO = "hazardno-dot/playnice-site";
const [OWNER, REPO_NAME] = REPO.split("/");
const EXHIBITION_PATH = "playnice-site/src/data/exhibition.js";

const json = (res, status, body) => res.status(status).json(body);

async function readJson(response, label) {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    throw new Error(`${label} returned a non-JSON response (${response.status}).`);
  }
}

async function supabaseFetch(path, token, options = {}) {
  return fetch(`${SUPABASE_URL}${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
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
    const error = new Error(data?.message || `GitHub request failed (${response.status}).`);
    error.status = response.status;
    throw error;
  }
  return data;
}

function safeId(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function periodFor(date = new Date()) {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  if (month <= 4) return { year, period: `feb-apr-${year}` };
  if (month <= 8) return { year, period: `may-aug-${year}` };
  return { year, period: `sep-dec-${year}` };
}

function uniqueAssets(baseline, entryId) {
  const candidates = [
    { suffix: "desktop", src: baseline?.desktopImage || baseline?.image || "", format: "wide" },
    { suffix: "mobile", src: baseline?.mobileImage || baseline?.image || "", format: "mobile" },
  ];
  const seen = new Set();
  return candidates
    .filter((asset) => asset.src && !seen.has(asset.src) && seen.add(asset.src))
    .map((asset) => ({
      id: `${entryId}-${asset.suffix}`,
      type: "image",
      src: asset.src,
      format: asset.format,
      alt: baseline?.alt || entryId,
    }));
}

function renderEntry({ heroKey, baseline }) {
  const { year, period } = periodFor();
  const entryId = `hero-${safeId(heroKey)}`;
  const title = String(baseline?.alt || heroKey).trim();
  const assets = uniqueAssets(baseline, entryId);
  if (!assets.length) throw new Error("Retired Hero has no reusable image asset for Exhibition.");

  const entry = {
    id: entryId,
    year,
    period,
    title,
    kind: "campaign",
    status: "archived",
    published: true,
    label: { sr: "Hero kampanja", en: "Hero Campaign" },
    line: {
      sr: "Kampanja je završena. Ideja ostaje.",
      en: "The campaign is over. The idea remains.",
    },
    assets,
  };

  return { entryId, entry, source: `  ${JSON.stringify(entry, null, 2).replace(/\n/g, "\n  ")},\n\n` };
}

function insertExhibitionEntry(source, rendered) {
  const marker = "export const exhibitionItems = [\n";
  const index = source.indexOf(marker);
  if (index < 0) throw new Error("Could not locate Exhibition data array.");
  return source.slice(0, index + marker.length) + rendered.source + source.slice(index + marker.length);
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed." });
  if (!SUPABASE_URL || !SUPABASE_KEY || !GITHUB_TOKEN) return json(res, 500, { error: "Hero retirement environment is incomplete." });

  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  const heroKey = String(req.body?.hero_key || "").trim();
  if (!token) return json(res, 401, { error: "Admin session required." });
  if (!heroKey) return json(res, 400, { error: "hero_key is required." });

  try {
    const userResponse = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${token}` },
    });
    const user = await readJson(userResponse, "Supabase Auth");
    if (!userResponse.ok || !user?.id) return json(res, 401, { error: "Admin session expired." });

    const adminResponse = await supabaseFetch(`/rest/v1/admin_users?user_id=eq.${encodeURIComponent(user.id)}&select=user_id`, token);
    const admins = await readJson(adminResponse, "Supabase admin lookup");
    if (!adminResponse.ok || !Array.isArray(admins) || !admins.length) return json(res, 403, { error: "PlayNice admin access required." });

    const draftResponse = await supabaseFetch(`/rest/v1/hero_drafts?hero_key=eq.${encodeURIComponent(heroKey)}&select=hero_key,approved_payload,review_status,baseline_snapshot,apply_branch,apply_pr_number`, token);
    const drafts = await readJson(draftResponse, "Supabase Hero draft");
    if (!draftResponse.ok) throw new Error(drafts?.message || "Could not read Hero draft.");
    const draft = drafts?.[0];
    if (!draft) return json(res, 404, { error: "Hero draft not found." });
    if (draft.review_status !== "approved" || !draft.approved_payload) return json(res, 409, { error: "Hero draft must be approved first." });
    if (!draft.apply_branch || !draft.apply_pr_number) return json(res, 409, { error: "Create the Hero preview branch before preparing Exhibition." });

    const wasActive = draft.baseline_snapshot?.enabled !== false;
    const isRetired = draft.approved_payload?.enabled === false;
    if (!wasActive || !isRetired) return json(res, 409, { error: "Exhibition archive is only prepared for an active → inactive Hero retirement." });

    const rendered = renderEntry({ heroKey, baseline: draft.baseline_snapshot });
    const branchFile = await github(`/repos/${OWNER}/${REPO_NAME}/contents/${EXHIBITION_PATH}?ref=${encodeURIComponent(draft.apply_branch)}`);
    const source = Buffer.from(branchFile.content, "base64").toString("utf8");
    const duplicateNeedle = `id: \"${rendered.entryId}\"`;
    const jsonDuplicateNeedle = `\"id\": \"${rendered.entryId}\"`;
    if (source.includes(duplicateNeedle) || source.includes(jsonDuplicateNeedle)) {
      return json(res, 200, { ok: true, already_present: true, exhibition_id: rendered.entryId, pr_number: draft.apply_pr_number });
    }

    const nextSource = insertExhibitionEntry(source, rendered);
    await github(`/repos/${OWNER}/${REPO_NAME}/contents/${EXHIBITION_PATH}`, {
      method: "PUT",
      body: JSON.stringify({
        message: `Archive retired Hero in Exhibition: ${heroKey}`,
        content: Buffer.from(nextSource, "utf8").toString("base64"),
        sha: branchFile.sha,
        branch: draft.apply_branch,
      }),
    });

    const pr = await github(`/repos/${OWNER}/${REPO_NAME}/pulls/${draft.apply_pr_number}`);
    const archiveLine = `- Retirement archive: ${rendered.entryId} → ${EXHIBITION_PATH}`;
    if (!String(pr.body || "").includes(archiveLine)) {
      await github(`/repos/${OWNER}/${REPO_NAME}/pulls/${draft.apply_pr_number}`, {
        method: "PATCH",
        body: JSON.stringify({ body: `${pr.body || ""}\n${archiveLine}`.trim() }),
      });
    }

    return json(res, 200, {
      ok: true,
      exhibition_id: rendered.entryId,
      pr_number: draft.apply_pr_number,
      branch: draft.apply_branch,
      file: EXHIBITION_PATH,
      assets: rendered.entry.assets.map((asset) => asset.src),
    });
  } catch (error) {
    console.error("Hero retirement Exhibition attach failed", error);
    return json(res, 500, { error: error?.message || "Hero retirement Exhibition attach failed." });
  }
};
