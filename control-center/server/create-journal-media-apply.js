const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO = "hazardno-dot/playnice-site";
const [OWNER, REPO_NAME] = REPO.split("/");
const JOURNAL_ASSET_ROOT = "playnice-site/public/journal";
const MAX_IMAGE_BYTES = 500_000;

const json = (res, status, body) => res.status(status).json(body);

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
  const data = response.status === 204 ? null : await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data?.message || `GitHub request failed (${response.status})`);
    error.status = response.status;
    throw error;
  }
  return data;
}

async function githubFile(path, branch) {
  try {
    return await github(`/repos/${OWNER}/${REPO_NAME}/contents/${path}?ref=${encodeURIComponent(branch)}`);
  } catch (error) {
    if (error.status === 404) return null;
    throw error;
  }
}

async function readRef(branch) {
  try {
    return await github(`/repos/${OWNER}/${REPO_NAME}/git/ref/heads/${encodeURIComponent(branch)}`);
  } catch (error) {
    if (error.status === 404) return null;
    throw error;
  }
}

function decodeWebp(value = "") {
  const base64 = String(value).replace(/^data:image\/webp;base64,/i, "").replace(/\s+/g, "");
  if (!base64) throw new Error("Journal WebP image is required.");
  const buffer = Buffer.from(base64, "base64");
  if (!buffer.length || buffer.length > MAX_IMAGE_BYTES) throw new Error("Optimized Journal image must be 500 KB or smaller.");
  if (buffer.length < 16 || buffer.subarray(0, 4).toString("ascii") !== "RIFF" || buffer.subarray(8, 12).toString("ascii") !== "WEBP") {
    throw new Error("Journal image must be a valid WebP file.");
  }
  return buffer.toString("base64");
}

async function authenticate(req) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!token) return { error: [401, "Admin session required."] };
  const userResponse = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${token}` },
  });
  const user = await userResponse.json().catch(() => null);
  if (!userResponse.ok || !user?.id) return { error: [401, "Admin session expired."] };
  const adminResponse = await supabaseFetch(`/rest/v1/admin_users?user_id=eq.${encodeURIComponent(user.id)}&select=user_id`, token);
  const admins = adminResponse.ok ? await adminResponse.json() : [];
  if (!Array.isArray(admins) || !admins.length) return { error: [403, "PlayNice admin access required."] };
  return { token, user };
}

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed." });
  if (!SUPABASE_URL || !SUPABASE_KEY || !GITHUB_TOKEN) return json(res, 500, { error: "Journal media environment is incomplete." });

  try {
    const auth = await authenticate(req);
    if (auth.error) return json(res, auth.error[0], { error: auth.error[1] });
    const { token } = auth;
    const articleId = Number(req.body?.article_id);
    if (!Number.isInteger(articleId) || articleId <= 0) return json(res, 400, { error: "article_id must be a positive integer." });
    const content = decodeWebp(req.body?.asset_base64);

    const draftResponse = await supabaseFetch(`/rest/v1/journal_drafts?article_id=eq.${articleId}&select=article_id,payload,review_status`, token);
    const drafts = draftResponse.ok ? await draftResponse.json() : [];
    if (!draftResponse.ok) throw new Error("Could not read Journal draft.");
    const draft = drafts?.[0] || null;
    if (draft && draft.review_status !== "draft") return json(res, 409, { error: "Journal media can only be changed while the article is in Draft." });

    const mainRef = await github(`/repos/${OWNER}/${REPO_NAME}/git/ref/heads/main`);
    const baseSha = mainRef.object.sha;
    const requestedBranch = String(req.body?.stage_branch || "").trim();
    const requestedBaseSha = String(req.body?.base_sha || "").trim();
    const savedStage = draft?.payload?.mediaStage;
    let branch = "";

    if (requestedBranch && requestedBaseSha === baseSha && /^cc-journal-media-stage-\d+-\d{12}$/i.test(requestedBranch) && await readRef(requestedBranch)) {
      branch = requestedBranch;
    } else if (savedStage?.branch && savedStage.baseSha === baseSha && /^cc-journal-media-stage-\d+-\d{12}$/i.test(savedStage.branch) && await readRef(savedStage.branch)) {
      branch = savedStage.branch;
    } else {
      const stamp = new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 12);
      branch = `cc-journal-media-stage-${articleId}-${stamp}`;
      await github(`/repos/${OWNER}/${REPO_NAME}/git/refs`, {
        method: "POST",
        body: JSON.stringify({ ref: `refs/heads/${branch}`, sha: baseSha }),
      });
    }

    const assetPath = `/journal/article${articleId}.webp`;
    const filePath = `${JOURNAL_ASSET_ROOT}/article${articleId}.webp`;
    const current = await githubFile(filePath, branch);
    await github(`/repos/${OWNER}/${REPO_NAME}/contents/${filePath}`, {
      method: "PUT",
      body: JSON.stringify({
        message: `Stage Journal media: article #${articleId}`,
        content,
        ...(current?.sha ? { sha: current.sha } : {}),
        branch,
      }),
    });

    const now = new Date().toISOString();
    const mediaStage = { branch, baseSha, file: filePath, assetPath, stagedAt: now };

    if (draft) {
      const payload = { ...(draft.payload || {}), image: assetPath, mediaStage };
      const saveResponse = await supabaseFetch(`/rest/v1/journal_drafts?article_id=eq.${articleId}`, token, {
        method: "PATCH",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({
          payload,
          review_status: "draft",
          reviewed_at: null,
          reviewed_by: null,
          approved_payload: null,
          baseline_snapshot: null,
          prepared_at: null,
          prepared_by: null,
          updated_at: now,
        }),
      });
      if (!saveResponse.ok) throw new Error("Could not persist staged Journal media metadata.");
    }

    return json(res, 200, {
      ok: true,
      article_id: articleId,
      asset_path: assetPath,
      media_stage: mediaStage,
      draft_linked: Boolean(draft),
      staged_at: now,
      bytes: Buffer.from(content, "base64").length,
    });
  } catch (error) {
    return json(res, 500, { error: error?.message || "Journal media staging failed." });
  }
}

export const config = { maxDuration: 60 };
