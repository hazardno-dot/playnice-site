const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO = "hazardno-dot/playnice-site";
const [OWNER, REPO_NAME] = REPO.split("/");
const SHOP_PUBLIC_PREFIX = "playnice-site/public";
const MAX_IMAGE_BYTES = 1_500_000;
const GITHUB_RETRY_STATUSES = new Set([502, 503, 504]);
const GITHUB_MAX_ATTEMPTS = 3;

const json = (res, status, body) => res.status(status).json(body);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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
  let lastError;
  for (let attempt = 1; attempt <= GITHUB_MAX_ATTEMPTS; attempt += 1) {
    try {
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
      if (response.ok) return data;

      const error = new Error(data?.message || `GitHub request failed (${response.status})`);
      error.status = response.status;
      lastError = error;

      if (!GITHUB_RETRY_STATUSES.has(response.status) || attempt === GITHUB_MAX_ATTEMPTS) {
        throw error;
      }
      await sleep(350 * attempt);
    } catch (error) {
      lastError = error;
      if (error?.status && !GITHUB_RETRY_STATUSES.has(error.status)) throw error;
      if (attempt === GITHUB_MAX_ATTEMPTS) throw error;
      await sleep(350 * attempt);
    }
  }
  throw lastError || new Error("GitHub request failed.");
}

function cleanBase64(value = "") {
  return String(value).replace(/^data:image\/jpeg;base64,/i, "").replace(/\s+/g, "");
}

function validateJpeg(label, value) {
  const base64 = cleanBase64(value);
  if (!base64) return null;
  let buffer;
  try {
    buffer = Buffer.from(base64, "base64");
  } catch {
    throw new Error(`${label} image is not valid base64.`);
  }
  if (!buffer.length || buffer.length > MAX_IMAGE_BYTES) {
    throw new Error(`${label} image must be a JPEG smaller than ${Math.round(MAX_IMAGE_BYTES / 100000) / 10} MB.`);
  }
  if (buffer[0] !== 0xff || buffer[1] !== 0xd8 || buffer[2] !== 0xff) {
    throw new Error(`${label} image must be a JPEG file.`);
  }
  return buffer.toString("base64");
}

function repoPathFromPublicPath(publicPath, label) {
  const value = String(publicPath || "").trim();
  if (!/^\/hero\//.test(value) || !/\.jpe?g$/i.test(value)) {
    throw new Error(`${label} path is outside the managed Hero JPEG area.`);
  }
  if (value.includes("..")) throw new Error(`${label} path is invalid.`);
  return `${SHOP_PUBLIC_PREFIX}${value}`;
}

function rowToSlide(row) {
  return {
    id: Number(row.id),
    heroKey: row.hero_key,
    kind: row.kind || "imageOnly",
    enabled: row.enabled !== false,
    pinnedFirst: Boolean(row.pinned_first),
    position: Number(row.position || 0),
    image: row.image || row.desktop_image,
    desktopImage: row.desktop_image || row.image,
    mobileImage: row.mobile_image || row.image,
    alt: row.alt || "",
    actionPrimary: row.action_type || "none",
    actionProductSlug: row.product_slug || "",
    preferredSize: row.preferred_size || "",
    collectionTitle: row.collection_title || "",
    actionCollection: Array.isArray(row.collection_slugs) ? row.collection_slugs : [],
    manifestoType: row.manifesto_type || "",
  };
}

async function readRef(branch) {
  try {
    return await github(`/repos/${OWNER}/${REPO_NAME}/git/ref/heads/${encodeURIComponent(branch)}`);
  } catch (error) {
    if (error.status === 404) return null;
    throw error;
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed." });
  if (!SUPABASE_URL || !SUPABASE_KEY || !GITHUB_TOKEN) {
    return json(res, 500, { error: "Hero media environment is incomplete." });
  }

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

    const adminResponse = await supabaseFetch(
      `/rest/v1/admin_users?user_id=eq.${encodeURIComponent(user.id)}&select=user_id`,
      token
    );
    const admins = await readJson(adminResponse, "Supabase admin lookup");
    if (!adminResponse.ok || !Array.isArray(admins) || !admins.length) {
      return json(res, 403, { error: "PlayNice admin access required." });
    }

    const [slideResponse, draftResponse] = await Promise.all([
      supabaseFetch(`/rest/v1/hero_slides?hero_key=eq.${encodeURIComponent(heroKey)}&select=id,hero_key,kind,enabled,pinned_first,position,image,desktop_image,mobile_image,alt,action_type,product_slug,preferred_size,collection_title,collection_slugs,manifesto_type`, token),
      supabaseFetch(`/rest/v1/hero_drafts?hero_key=eq.${encodeURIComponent(heroKey)}&select=hero_key,payload,review_status,baseline_snapshot,apply_branch,apply_pr_number`, token),
    ]);
    const slides = await readJson(slideResponse, "Supabase Hero slide");
    const drafts = await readJson(draftResponse, "Supabase Hero draft");
    if (!slideResponse.ok) throw new Error(slides?.message || "Could not read Hero slide.");
    if (!draftResponse.ok) throw new Error(drafts?.message || "Could not read Hero draft.");
    const slideRow = slides?.[0];
    if (!slideRow) return json(res, 404, { error: "Hero slide not found." });
    const baseline = rowToSlide(slideRow);
    const draft = drafts?.[0] || null;

    if (draft?.apply_branch || draft?.apply_pr_number) {
      return json(res, 409, { error: "A Hero apply preview already exists. Return the Hero to draft before replacing media." });
    }
    if (draft && draft.review_status !== "draft") {
      return json(res, 409, { error: "Hero media can only be changed while the Hero is in Draft." });
    }

    const desktopContent = validateJpeg("Desktop", req.body?.desktop_base64);
    const mobileContent = validateJpeg("Mobile", req.body?.mobile_base64);
    if (!desktopContent && !mobileContent) {
      return json(res, 400, { error: "Choose at least one Hero image to replace." });
    }

    const desktopRepoPath = repoPathFromPublicPath(slideRow.desktop_image, "Desktop");
    const mobileRepoPath = repoPathFromPublicPath(slideRow.mobile_image, "Mobile");
    const mainRef = await github(`/repos/${OWNER}/${REPO_NAME}/git/ref/heads/main`);
    const baseSha = mainRef.object.sha;

    const existingStage = draft?.payload?.mediaStage;
    let branch = "";
    if (
      existingStage?.branch &&
      existingStage?.baseSha === baseSha &&
      /^cc-hero-media-stage-[a-z0-9-]+-\d{12}$/i.test(existingStage.branch) &&
      await readRef(existingStage.branch)
    ) {
      branch = existingStage.branch;
    } else {
      const stamp = new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 12);
      const safeKey = heroKey.replace(/[^a-z0-9-]/gi, "-").toLowerCase();
      branch = `cc-hero-media-stage-${safeKey}-${stamp}`;
      await github(`/repos/${OWNER}/${REPO_NAME}/git/refs`, {
        method: "POST",
        body: JSON.stringify({ ref: `refs/heads/${branch}`, sha: baseSha }),
      });
    }

    const replacements = [
      desktopContent ? { label: "desktop", path: desktopRepoPath, content: desktopContent } : null,
      mobileContent ? { label: "mobile", path: mobileRepoPath, content: mobileContent } : null,
    ].filter(Boolean);

    const stagedFiles = new Set(Array.isArray(existingStage?.files) && existingStage?.baseSha === baseSha ? existingStage.files : []);
    for (const replacement of replacements) {
      const current = await github(`/repos/${OWNER}/${REPO_NAME}/contents/${replacement.path}?ref=${encodeURIComponent(branch)}`);
      await github(`/repos/${OWNER}/${REPO_NAME}/contents/${replacement.path}`, {
        method: "PUT",
        body: JSON.stringify({
          message: `Stage Hero media: ${heroKey} ${replacement.label}`,
          content: replacement.content,
          sha: current.sha,
          branch,
        }),
      });
      stagedFiles.add(replacement.path);
    }

    const now = new Date().toISOString();
    const payload = {
      ...baseline,
      ...(draft?.payload || {}),
      mediaStage: {
        branch,
        baseSha,
        files: [...stagedFiles],
        stagedAt: now,
      },
    };

    let saveResponse;
    if (draft) {
      saveResponse = await supabaseFetch(`/rest/v1/hero_drafts?hero_key=eq.${encodeURIComponent(heroKey)}`, token, {
        method: "PATCH",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({
          payload,
          review_status: "draft",
          reviewed_at: null,
          reviewed_by: null,
          approved_payload: null,
          updated_at: now,
        }),
      });
    } else {
      saveResponse = await supabaseFetch("/rest/v1/hero_drafts", token, {
        method: "POST",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({
          hero_key: heroKey,
          payload,
          baseline_snapshot: baseline,
          created_by: user.id,
          review_status: "draft",
          updated_at: now,
        }),
      });
    }
    const saved = await readJson(saveResponse, "Supabase Hero media stage");
    if (!saveResponse.ok) throw new Error(saved?.message || "Could not save staged Hero media metadata.");

    return json(res, 200, {
      ok: true,
      hero_key: heroKey,
      slide_id: baseline.id,
      stage_branch: branch,
      files: [...stagedFiles],
      staged_at: now,
      draft_created: !draft,
    });
  } catch (error) {
    console.error("Hero media staging failed", error);
    return json(res, 500, { error: error?.message || "Hero media staging failed." });
  }
};
