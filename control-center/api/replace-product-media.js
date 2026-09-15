const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO = "hazardno-dot/playnice-site";
const [OWNER, REPO_NAME] = REPO.split("/");
const SHOP_PUBLIC_PREFIX = "playnice-site/public";
const MAX_IMAGE_BYTES = 1_500_000;
const GITHUB_RETRY_STATUSES = new Set([409, 429, 502, 503, 504]);
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
      const data = response.status === 204 ? null : await readJson(response, "GitHub API");
      if (response.ok) return data;
      const error = new Error(data?.message || `GitHub request failed (${response.status})`);
      error.status = response.status;
      lastError = error;
      if (!GITHUB_RETRY_STATUSES.has(response.status) || attempt === GITHUB_MAX_ATTEMPTS) throw error;
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

async function githubFile(path, branch) {
  try {
    return await github(`/repos/${OWNER}/${REPO_NAME}/contents/${path}?ref=${encodeURIComponent(branch)}`);
  } catch (error) {
    if (error.status === 404) return null;
    throw error;
  }
}

function cleanBase64(value = "") {
  return String(value).replace(/^data:image\/(?:png|webp);base64,/i, "").replace(/\s+/g, "");
}

function decodeImage(label, value) {
  const base64 = cleanBase64(value);
  if (!base64) throw new Error(`${label} image is required.`);
  const buffer = Buffer.from(base64, "base64");
  if (!buffer.length || buffer.length > MAX_IMAGE_BYTES) throw new Error(`${label} image must be smaller than 1.5 MB.`);
  return { buffer, base64: buffer.toString("base64") };
}

function pngDimensions(buffer) {
  const signature = "89504e470d0a1a0a";
  if (buffer.length < 24 || buffer.subarray(0, 8).toString("hex") !== signature) throw new Error("Shop image must be a valid PNG file.");
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

function webpDimensions(buffer) {
  if (buffer.length < 30 || buffer.subarray(0, 4).toString("ascii") !== "RIFF" || buffer.subarray(8, 12).toString("ascii") !== "WEBP") throw new Error("Just In image must be a valid WebP file.");
  const chunk = buffer.subarray(12, 16).toString("ascii");
  if (chunk === "VP8X") return { width: 1 + buffer[24] + (buffer[25] << 8) + (buffer[26] << 16), height: 1 + buffer[27] + (buffer[28] << 8) + (buffer[29] << 16) };
  if (chunk === "VP8L") {
    if (buffer[20] !== 0x2f) throw new Error("Just In WebP lossless header is invalid.");
    const b1 = buffer[21], b2 = buffer[22], b3 = buffer[23], b4 = buffer[24];
    return { width: 1 + (((b2 & 0x3f) << 8) | b1), height: 1 + (((b4 & 0x0f) << 10) | (b3 << 2) | ((b2 & 0xc0) >> 6)) };
  }
  if (chunk === "VP8 ") {
    if (buffer[23] !== 0x9d || buffer[24] !== 0x01 || buffer[25] !== 0x2a) throw new Error("Just In WebP frame header is invalid.");
    return { width: buffer.readUInt16LE(26) & 0x3fff, height: buffer.readUInt16LE(28) & 0x3fff };
  }
  throw new Error("Unsupported Just In WebP encoding.");
}

function assertDimensions(label, dimensions, size) {
  if (dimensions.width !== size || dimensions.height !== size) throw new Error(`${label} image must be exactly ${size} × ${size}px; received ${dimensions.width} × ${dimensions.height}px.`);
}

function normalizeShopPath(value) {
  const path = String(value || "").trim();
  if (!/^\/products\/[a-z0-9][a-z0-9._-]*\.png$/i.test(path) || path.includes("..") || path.includes("/thumbs/")) {
    throw new Error("Existing Shop image path must be a /products/*.png path.");
  }
  return path;
}

function thumbPathFromShopPath(shopPath) {
  const filename = shopPath.split("/").pop().replace(/\.png$/i, ".webp");
  return `/products/thumbs/${filename}`;
}

async function writeFile({ path, content, label, slug }, branch) {
  const current = await githubFile(path, branch);
  if (!current?.sha) throw new Error(`${label} target no longer exists on the replacement branch.`);
  return github(`/repos/${OWNER}/${REPO_NAME}/contents/${path}`, {
    method: "PUT",
    body: JSON.stringify({
      message: `Replace Product media: ${slug} ${label}`,
      content,
      sha: current.sha,
      branch,
    }),
  });
}

async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed." });
  if (!SUPABASE_URL || !SUPABASE_KEY || !GITHUB_TOKEN) return json(res, 500, { error: "Product media environment is incomplete." });

  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  const slug = String(req.body?.product_slug || "").trim().toLowerCase();
  if (!token) return json(res, 401, { error: "Admin session required." });
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return json(res, 400, { error: "A valid product_slug is required." });

  try {
    const userResponse = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${token}` } });
    const user = await readJson(userResponse, "Supabase Auth");
    if (!userResponse.ok || !user?.id) return json(res, 401, { error: "Admin session expired." });

    const adminResponse = await supabaseFetch(`/rest/v1/admin_users?user_id=eq.${encodeURIComponent(user.id)}&select=user_id`, token);
    const admins = await readJson(adminResponse, "Supabase admin lookup");
    if (!adminResponse.ok || !Array.isArray(admins) || !admins.length) return json(res, 403, { error: "PlayNice admin access required." });

    const shopPath = normalizeShopPath(req.body?.existing_shop_path);
    const justInPath = thumbPathFromShopPath(shopPath);
    const shopRepoPath = `${SHOP_PUBLIC_PREFIX}${shopPath}`;
    const justInRepoPath = `${SHOP_PUBLIC_PREFIX}${justInPath}`;

    const [existingShop, existingJustIn] = await Promise.all([
      githubFile(shopRepoPath, "main"),
      githubFile(justInRepoPath, "main"),
    ]);
    if (!existingShop?.sha) return json(res, 409, { error: `Existing Shop asset was not found: ${shopPath}` });
    if (!existingJustIn?.sha) return json(res, 409, { error: `Existing Just In asset was not found: ${justInPath}` });

    const shop = decodeImage("Shop", req.body?.shop_base64);
    const justIn = decodeImage("Just In", req.body?.just_in_base64);
    assertDimensions("Shop", pngDimensions(shop.buffer), 600);
    assertDimensions("Just In", webpDimensions(justIn.buffer), 320);

    const mainRef = await github(`/repos/${OWNER}/${REPO_NAME}/git/ref/heads/main`);
    const baseSha = mainRef.object.sha;
    const stamp = new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 12);
    const branch = `cc-product-media-replace-${slug}-${stamp}`;
    await github(`/repos/${OWNER}/${REPO_NAME}/git/refs`, {
      method: "POST",
      body: JSON.stringify({ ref: `refs/heads/${branch}`, sha: baseSha }),
    });

    await writeFile({ path: shopRepoPath, content: shop.base64, label: "shop", slug }, branch);
    await writeFile({ path: justInRepoPath, content: justIn.base64, label: "just-in", slug }, branch);

    const pr = await github(`/repos/${OWNER}/${REPO_NAME}/pulls`, {
      method: "POST",
      body: JSON.stringify({
        title: `Control Center: Replace media · ${slug}`,
        head: branch,
        base: "main",
        draft: true,
        body: [
          "Generated by PlayNice Control Center Product Media Replace.",
          "",
          `- Product: ${slug}`,
          `- Shop asset: ${shopPath}`,
          `- Just In asset: ${justInPath}`,
          "- Product data: unchanged",
          "- Image Path: unchanged",
          "- Safety: existing assets verified on main before replacement",
          "- Safety: draft PR only; no automatic merge",
        ].join("\n"),
      }),
    });

    return json(res, 200, {
      ok: true,
      product_slug: slug,
      branch,
      base_sha: baseSha,
      shop_path: shopPath,
      just_in_path: justInPath,
      pr_number: pr?.number || null,
      pr_url: pr?.html_url || "",
    });
  } catch (error) {
    console.error("Product media replacement failed", error);
    return json(res, 500, { error: error?.message || "Product media replacement failed." });
  }
}

export const config = { maxDuration: 60 };
export default handler;
