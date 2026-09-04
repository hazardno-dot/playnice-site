const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO = "hazardno-dot/playnice-site";
const [OWNER, REPO_NAME] = REPO.split("/");
const REQUIRED_CHECKS = ["card", "modal-desktop", "modal-390", "modal-360", "note-map", "purchase"];

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

async function github(path) {
  const response = await fetch(`https://api.github.com${path}`, {
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.message || `GitHub request failed (${response.status})`);
  return data;
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });
  if (!SUPABASE_URL || !SUPABASE_KEY || !GITHUB_TOKEN) return json(res, 500, { error: "Server configuration is incomplete." });

  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    if (!token) return json(res, 401, { error: "Missing admin session." });

    const userRes = await supabaseFetch("/auth/v1/user", token);
    if (!userRes.ok) return json(res, 401, { error: "Invalid admin session." });
    const user = await userRes.json();

    const adminRes = await supabaseFetch(
      `/rest/v1/admin_users?user_id=eq.${encodeURIComponent(user.id)}&select=user_id&limit=1`,
      token
    );
    const admins = adminRes.ok ? await adminRes.json() : [];
    if (!admins.length) return json(res, 403, { error: "Not authorized." });

    const slug = String(req.body?.product_slug || "").trim();
    const checks = req.body?.checks && typeof req.body.checks === "object" ? req.body.checks : {};
    if (!slug) return json(res, 400, { error: "product_slug is required." });

    const missingChecks = REQUIRED_CHECKS.filter((id) => checks[id] !== true);
    if (missingChecks.length) {
      return json(res, 409, {
        error: `Visual parity checklist incomplete: ${missingChecks.join(", ")}.`,
      });
    }

    const draftRes = await supabaseFetch(
      `/rest/v1/product_drafts?product_slug=eq.${encodeURIComponent(slug)}&select=product_slug,apply_branch,apply_pr_number&limit=1`,
      token
    );
    const [draft] = draftRes.ok ? await draftRes.json() : [];
    if (!draft?.apply_branch || !draft?.apply_pr_number) {
      return json(res, 409, { error: "Preview branch/PR is missing." });
    }

    const pr = await github(`/repos/${OWNER}/${REPO_NAME}/pulls/${draft.apply_pr_number}`);
    if (pr.state !== "open" || pr.head?.ref !== draft.apply_branch) {
      return json(res, 409, {
        error: "Preview PR is not open or no longer matches the Controlled Apply branch.",
      });
    }

    const headSha = pr.head?.sha;
    if (!headSha) return json(res, 409, { error: "Preview PR head SHA is missing." });

    const status = await github(`/repos/${OWNER}/${REPO_NAME}/commits/${headSha}/status`);
    const shopStatuses = (status.statuses || []).filter((item) =>
      String(item.context || "").includes("playnice-site")
    );
    const shopReady = shopStatuses.some((item) => item.state === "success");

    if (!shopReady) {
      return json(res, 409, {
        error: "Shop preview is not green for the current PR head. Verification is locked until Vercel – playnice-site succeeds.",
        head_sha: headSha,
      });
    }

    const now = new Date().toISOString();
    const updateRes = await supabaseFetch(
      `/rest/v1/product_drafts?product_slug=eq.${encodeURIComponent(slug)}`,
      token,
      {
        method: "PATCH",
        body: JSON.stringify({
          preview_verified_at: now,
          preview_verified_by: user.id,
        }),
      }
    );
    if (!updateRes.ok) throw new Error("Could not save preview verification.");

    await supabaseFetch("/rest/v1/draft_audit_log", token, {
      method: "POST",
      body: JSON.stringify({
        product_slug: slug,
        actor_id: user.id,
        action: "preview_verified",
        details: {
          branch: draft.apply_branch,
          pr_number: draft.apply_pr_number,
          head_sha: headSha,
          checklist: REQUIRED_CHECKS,
          shop_preview: "success",
        },
      }),
    });

    return json(res, 200, {
      ok: true,
      verified_at: now,
      head_sha: headSha,
      shop_preview: "success",
    });
  } catch (error) {
    return json(res, 500, { error: error?.message || "Preview verification failed." });
  }
};
