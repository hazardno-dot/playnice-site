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

function patchRatingOnly(source, slug, baselineRating, draftRating) {
  const slugEscaped = slug.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const blockRegex = new RegExp(`(slug\\s*:\\s*["']${slugEscaped}["'][\\s\\S]{0,2600}?\\brating\\s*:\\s*)([0-9]+(?:\\.[0-9]+)?)`);
  const match = source.match(blockRegex);
  if (!match) throw new Error(`Could not locate rating for ${slug} in main catalog.`);
  const liveRating = Number(match[2]);
  if (Number(liveRating) !== Number(baselineRating)) {
    throw new Error(`LIVE DRIFT: main currently has rating ${liveRating}, preparation baseline expected ${baselineRating}.`);
  }
  return source.replace(blockRegex, `$1${Number(draftRating)}`);
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

    const draftRes = await supabaseFetch(`/rest/v1/product_drafts?product_slug=eq.${encodeURIComponent(slug)}&select=product_slug,payload,approved_payload,review_status,prepared_at,baseline_snapshot&limit=1`, token);
    if (!draftRes.ok) return json(res, 400, { error: "Could not load prepared draft." });
    const [draft] = await draftRes.json();
    if (!draft) return json(res, 404, { error: "Prepared draft not found." });
    if (draft.review_status !== "approved" || !draft.prepared_at) return json(res, 409, { error: "Draft must be APPROVED and READY TO APPLY first." });

    const approved = draft.approved_payload || draft.payload;
    const baseline = draft.baseline_snapshot;
    const baselineRating = baseline?.core?.rating;
    const draftRating = approved?.core?.rating;
    if (baselineRating == null || draftRating == null) return json(res, 409, { error: "Rating baseline is incomplete." });

    // Controlled Apply v1 is deliberately narrow: one verified Core/Rating change only.
    const baselineCore = baseline?.core || {};
    const approvedCore = approved?.core || {};
    const normalizeCsv = (v) => Array.isArray(v) ? v.join(", ") : String(v ?? "");
    const coreChecks = [
      ["name", baselineCore.name, approvedCore.name],
      ["shortName", baselineCore.shortName, approvedCore.shortName],
      ["category", baselineCore.category, approvedCore.category],
      ["badge", baselineCore.badge, approvedCore.badge],
      ["ratingLabel", baselineCore.ratingLabel, approvedCore.ratingLabel],
      ["season", baselineCore.season, approvedCore.season],
      ["moods", normalizeCsv(baselineCore.moods), normalizeCsv(approvedCore.moods)],
      ["sizes", JSON.stringify(baselineCore.sizes || {}), JSON.stringify(approvedCore.sizes || {})],
      ["noteMap", JSON.stringify(baselineCore.noteMap || {}), JSON.stringify({
        top: String(approvedCore.noteMap?.top || "").split(",").map(s => s.trim()).filter(Boolean),
        heart: String(approvedCore.noteMap?.heart || "").split(",").map(s => s.trim()).filter(Boolean),
        base: String(approvedCore.noteMap?.base || "").split(",").map(s => s.trim()).filter(Boolean),
      })],
      ["recommendations", normalizeCsv(baselineCore.recommendations), normalizeCsv(approvedCore.recommendations)],
    ];
    const unexpectedCore = coreChecks.filter(([, a, b]) => String(a ?? "") !== String(b ?? ""));
    const nonCoreChanged = JSON.stringify(baseline.copy || {}) !== JSON.stringify(approved.copy || {}) ||
      JSON.stringify(baseline.wear || {}) !== JSON.stringify(approved.wear || {}) ||
      JSON.stringify(baseline.discovery || {}) !== JSON.stringify(approved.discovery || {});
    if (unexpectedCore.length || nonCoreChanged) {
      return json(res, 409, { error: "Controlled Apply v1 supports a single Core/Rating change only. Other changes must remain in draft for a later apply version." });
    }

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
    const nextSource = patchRatingOnly(source, slug, baselineRating, draftRating);

    await github(`/repos/${OWNER}/${REPO_NAME}/contents/${filePath}`, {
      method: "PUT",
      body: JSON.stringify({
        message: `Control Center apply: ${slug} rating ${baselineRating} -> ${draftRating}`,
        content: Buffer.from(nextSource, "utf8").toString("base64"),
        sha: file.sha,
        branch,
      }),
    });

    const pr = await github(`/repos/${OWNER}/${REPO_NAME}/pulls`, {
      method: "POST",
      body: JSON.stringify({
        title: `Control Center: ${slug} rating ${baselineRating} → ${draftRating}`,
        head: branch,
        base: "main",
        draft: true,
        body: [
          "Generated by PlayNice Control Center controlled apply v1.",
          "",
          `- Product: ${slug}`,
          `- Rating: ${baselineRating} → ${draftRating}`,
          "- Source: approved + prepared Supabase draft",
          "- Safety: draft PR only; no automatic merge",
        ].join("\n"),
      }),
    });

    await supabaseFetch("/rest/v1/draft_audit_log", token, {
      method: "POST",
      body: JSON.stringify({ product_slug: slug, actor_id: user.id, action: "apply_branch_created", details: { branch, pr_number: pr.number, pr_url: pr.html_url, base_sha: baseSha } }),
    });

    return json(res, 200, { ok: true, branch, pr_number: pr.number, pr_url: pr.html_url });
  } catch (error) {
    return json(res, 500, { error: error?.message || "Controlled apply failed." });
  }
}
