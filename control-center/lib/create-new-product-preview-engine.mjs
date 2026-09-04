import createFresh, { __test as helpers } from "./create-new-product-engine.mjs";

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

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function readAddedAt(source, slug) {
  const matcher = new RegExp(`addedAt\\s*:\\s*["']([^"']+)["'][\\s\\S]{0,500}?slug\\s*:\\s*["']${escapeRegex(slug)}["']`);
  return source.match(matcher)?.[1] || "";
}

function preserveAddedAt(source, slug, addedAt) {
  if (!addedAt) return source;
  const slugToken = `slug: ${JSON.stringify(slug)}`;
  const slugIndex = source.indexOf(slugToken);
  if (slugIndex < 0) return source;
  const objectStart = source.lastIndexOf("\n  {", slugIndex);
  if (objectStart < 0) return source;
  const prefix = source.slice(objectStart, slugIndex);
  const nextPrefix = prefix.replace(/addedAt\s*:\s*["'][^"']+["']/, `addedAt: ${JSON.stringify(addedAt)}`);
  return `${source.slice(0, objectStart)}${nextPrefix}${source.slice(slugIndex)}`;
}

async function findExistingPreview(slug, draft) {
  if (draft.apply_branch && draft.apply_pr_number) {
    try {
      const pr = await github(`/repos/${OWNER}/${REPO_NAME}/pulls/${draft.apply_pr_number}`);
      if (pr?.state === "open" && pr?.head?.ref === draft.apply_branch) {
        return { branch: draft.apply_branch, prNumber: draft.apply_pr_number, pr };
      }
    } catch {
      // Fall through to open-PR discovery.
    }
  }

  const pulls = await github(`/repos/${OWNER}/${REPO_NAME}/pulls?state=open&base=main&per_page=100`);
  const prefix = `cc-create-${slug}-`;
  const pr = pulls.find((item) => item?.head?.ref?.startsWith(prefix) || item?.title === `Control Center: create ${slug}`);
  return pr ? { branch: pr.head.ref, prNumber: pr.number, pr } : null;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });
  if (!SUPABASE_URL || !SUPABASE_KEY || !GITHUB_TOKEN) return json(res, 500, { error: "Server configuration is incomplete." });

  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    if (!token) return json(res, 401, { error: "Missing admin session." });

    const userRes = await supabaseFetch("/auth/v1/user", token);
    if (!userRes.ok) return json(res, 401, { error: "Invalid admin session." });
    const user = await userRes.json();
    const adminRes = await supabaseFetch(`/rest/v1/admin_users?user_id=eq.${encodeURIComponent(user.id)}&select=user_id&limit=1`, token);
    const admins = adminRes.ok ? await adminRes.json() : [];
    if (!admins.length) return json(res, 403, { error: "Not authorized." });

    const slug = String(req.body?.product_slug || "").trim();
    if (!slug) return json(res, 400, { error: "product_slug is required." });

    const draftRes = await supabaseFetch(`/rest/v1/product_drafts?product_slug=eq.${encodeURIComponent(slug)}&select=product_slug,payload,approved_payload,review_status,prepared_at,baseline_snapshot,apply_branch,apply_pr_number&limit=1`, token);
    const [draft] = draftRes.ok ? await draftRes.json() : [];
    if (!draft) return json(res, 404, { error: "Prepared draft not found." });
    if (draft.review_status !== "approved" || !draft.prepared_at || draft.baseline_snapshot?.kind !== "new_product") {
      return json(res, 409, { error: "New product draft must be APPROVED and prepared as new_product first." });
    }
    if (!draft.approved_payload) return json(res, 409, { error: "Approved snapshot is missing. Review and approve the new product draft again." });
    if (helpers.stableJson(draft.payload) !== helpers.stableJson(draft.approved_payload)) {
      return json(res, 409, { error: "Approved payload no longer matches the current new product draft. Review and approve again." });
    }

    const existing = await findExistingPreview(slug, draft);
    if (!existing) return createFresh(req, res);

    const product = helpers.normalizePayload(draft.approved_payload, slug);
    const errors = helpers.validateNewProduct(product);
    if (errors.length) return json(res, 409, { error: "New product validation failed.", errors });

    const branchRef = await github(`/repos/${OWNER}/${REPO_NAME}/git/ref/heads/${encodeURIComponent(existing.branch)}`);
    const headSha = branchRef.object.sha;
    const branchCommit = await github(`/repos/${OWNER}/${REPO_NAME}/git/commits/${headSha}`);
    const mainRef = await github(`/repos/${OWNER}/${REPO_NAME}/git/ref/heads/main`);

    let addedAt = "";
    try {
      const branchIndex = await github(`/repos/${OWNER}/${REPO_NAME}/contents/playnice-site/src/data/products/index.js?ref=${encodeURIComponent(existing.branch)}`);
      addedAt = readAddedAt(Buffer.from(branchIndex.content, "base64").toString("utf8"), slug);
    } catch {
      // If the preview did not yet contain the generated product, a fresh timestamp is acceptable.
    }

    const specs = [
      ["playnice-site/src/data/products/index.js", (source) => preserveAddedAt(helpers.insertProduct(source, product), slug, addedAt)],
      ["playnice-site/src/data/products/productCopy.js", (source) => helpers.insertObjectEntry(source, helpers.renderCopy(product), "Product Copy", "productCopy")],
      ["playnice-site/src/data/products/productWearContext.js", (source) => helpers.insertObjectEntry(source, helpers.renderWear(product), "Wear Context", "productWearContext")],
      ["playnice-site/src/data/products/discoveryProfiles.js", (source) => helpers.insertObjectEntry(source, helpers.renderDiscovery(product), "Discovery Profiles", "discoveryProfiles")],
    ];

    const files = [];
    const treeEntries = [];
    for (const [filePath, transform] of specs) {
      const file = await github(`/repos/${OWNER}/${REPO_NAME}/contents/${filePath}?ref=${mainRef.object.sha}`);
      const source = Buffer.from(file.content, "base64").toString("utf8");
      const next = transform(source);
      const blob = await github(`/repos/${OWNER}/${REPO_NAME}/git/blobs`, {
        method: "POST",
        body: JSON.stringify({ content: next, encoding: "utf-8" }),
      });
      treeEntries.push({ path: filePath, mode: "100644", type: "blob", sha: blob.sha });
      files.push(filePath);
    }

    const nextTree = await github(`/repos/${OWNER}/${REPO_NAME}/git/trees`, {
      method: "POST",
      body: JSON.stringify({ base_tree: branchCommit.tree.sha, tree: treeEntries }),
    });
    const commit = await github(`/repos/${OWNER}/${REPO_NAME}/git/commits`, {
      method: "POST",
      body: JSON.stringify({
        message: `Control Center update preview: ${slug}`,
        tree: nextTree.sha,
        parents: [headSha],
      }),
    });
    await github(`/repos/${OWNER}/${REPO_NAME}/git/refs/heads/${encodeURIComponent(existing.branch)}`, {
      method: "PATCH",
      body: JSON.stringify({ sha: commit.sha, force: false }),
    });

    await supabaseFetch(`/rest/v1/product_drafts?product_slug=eq.${encodeURIComponent(slug)}`, token, {
      method: "PATCH",
      body: JSON.stringify({
        apply_branch: existing.branch,
        apply_pr_number: existing.prNumber,
        preview_verified_at: null,
        preview_verified_by: null,
      }),
    });
    await supabaseFetch("/rest/v1/draft_audit_log", token, {
      method: "POST",
      body: JSON.stringify({
        product_slug: slug,
        actor_id: user.id,
        action: "new_product_preview_updated",
        details: {
          branch: existing.branch,
          pr_number: existing.prNumber,
          files,
          parent_sha: headSha,
          commit_sha: commit.sha,
          preserved_preview_assets: true,
          version: "3.1",
        },
      }),
    });

    return json(res, 200, {
      ok: true,
      existing: true,
      updated: true,
      branch: existing.branch,
      pr_number: existing.prNumber,
      pr_url: existing.pr.html_url,
      commit_sha: commit.sha,
      files,
      preserved_preview_assets: true,
      version: "3.1",
    });
  } catch (error) {
    return json(res, 500, { error: error?.message || "New product preview update failed." });
  }
}
