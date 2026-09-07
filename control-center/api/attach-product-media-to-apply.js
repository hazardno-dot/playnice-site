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

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed." });
  if (!SUPABASE_URL || !SUPABASE_KEY || !GITHUB_TOKEN) {
    return json(res, 500, { error: "Product media apply environment is incomplete." });
  }

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

    const slug = String(req.body?.product_slug || "").trim().toLowerCase();
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return json(res, 400, { error: "A valid product_slug is required." });

    const draftRes = await supabaseFetch(`/rest/v1/product_drafts?product_slug=eq.${encodeURIComponent(slug)}&select=product_slug,payload,approved_payload,review_status,apply_branch,apply_pr_number&limit=1`, token);
    if (!draftRes.ok) return json(res, 400, { error: "Could not load Product apply state." });
    const [draft] = await draftRes.json();
    if (!draft) return json(res, 404, { error: "Product draft not found." });
    if (!draft.apply_branch || !draft.apply_pr_number) return json(res, 409, { error: "Create the Product preview branch before attaching media." });

    const mediaStage = draft.approved_payload?.mediaStage || draft.payload?.mediaStage || null;
    if (!mediaStage?.branch || !Array.isArray(mediaStage.files) || !mediaStage.files.length) {
      return json(res, 200, { ok: true, skipped: true, reason: "No staged Product media." });
    }

    const expected = new Set([
      `playnice-site/public/products/${slug}.png`,
      `playnice-site/public/products/thumbs/${slug}.webp`,
    ]);
    if (mediaStage.files.length !== 2 || mediaStage.files.some((path) => !expected.has(path))) {
      return json(res, 409, { error: "Staged Product media paths do not match the locked Shop / Just In contract." });
    }

    const stageRef = await github(`/repos/${OWNER}/${REPO_NAME}/git/ref/heads/${encodeURIComponent(mediaStage.branch)}`);
    if (!stageRef?.object?.sha) return json(res, 409, { error: "Product media staging branch no longer exists." });

    const attached = [];
    const changed = [];
    for (const path of mediaStage.files) {
      const source = await githubFile(path, mediaStage.branch);
      if (!source?.content || !source?.sha) throw new Error(`Staged media file is missing: ${path}`);
      const destination = await githubFile(path, draft.apply_branch);
      if (destination?.sha !== source.sha) {
        await github(`/repos/${OWNER}/${REPO_NAME}/contents/${path}`, {
          method: "PUT",
          body: JSON.stringify({
            message: `Control Center apply: ${slug} product media`,
            content: String(source.content).replace(/\s+/g, ""),
            ...(destination?.sha ? { sha: destination.sha } : {}),
            branch: draft.apply_branch,
          }),
        });
        changed.push(path);
      }
      attached.push(path);
    }

    if (changed.length) {
      await supabaseFetch("/rest/v1/draft_audit_log", token, {
        method: "POST",
        body: JSON.stringify({
          product_slug: slug,
          actor_id: user.id,
          action: "media_attached_to_apply",
          details: {
            source_branch: mediaStage.branch,
            apply_branch: draft.apply_branch,
            pr_number: draft.apply_pr_number,
            files: changed,
          },
        }),
      });
    }

    return json(res, 200, {
      ok: true,
      skipped: false,
      unchanged: changed.length === 0,
      product_slug: slug,
      branch: draft.apply_branch,
      pr_number: draft.apply_pr_number,
      files: attached,
      changed_files: changed,
    });
  } catch (error) {
    return json(res, 500, { error: error?.message || "Could not attach Product media to Controlled Apply." });
  }
}
