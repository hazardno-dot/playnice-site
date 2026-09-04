const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO = "hazardno-dot/playnice-site";
const [OWNER, REPO_NAME] = REPO.split("/");
const SHOP_PUBLIC_PREFIX = "playnice-site/public";
const MAX_IMAGE_BYTES = 1_500_000;

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
    const error = new Error(data?.message || `GitHub request failed (${response.status})`);
    error.status = response.status;
    throw error;
  }
  return data;
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

    const slideResponse = await supabaseFetch(
      `/rest/v1/hero_slides?hero_key=eq.${encodeURIComponent(heroKey)}&select=id,hero_key,desktop_image,mobile_image,alt`,
      token
    );
    const slides = await readJson(slideResponse, "Supabase Hero slide");
    if (!slideResponse.ok) throw new Error(slides?.message || "Could not read Hero slide.");
    const slide = slides?.[0];
    if (!slide) return json(res, 404, { error: "Hero slide not found." });

    const desktopContent = validateJpeg("Desktop", req.body?.desktop_base64);
    const mobileContent = validateJpeg("Mobile", req.body?.mobile_base64);
    if (!desktopContent && !mobileContent) {
      return json(res, 400, { error: "Choose at least one Hero image to replace." });
    }

    const desktopRepoPath = repoPathFromPublicPath(slide.desktop_image, "Desktop");
    const mobileRepoPath = repoPathFromPublicPath(slide.mobile_image, "Mobile");

    const mainRef = await github(`/repos/${OWNER}/${REPO_NAME}/git/ref/heads/main`);
    const baseSha = mainRef.object.sha;
    const stamp = new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 12);
    const safeKey = heroKey.replace(/[^a-z0-9-]/gi, "-").toLowerCase();
    const branch = `cc-hero-media-${safeKey}-${stamp}`;

    await github(`/repos/${OWNER}/${REPO_NAME}/git/refs`, {
      method: "POST",
      body: JSON.stringify({ ref: `refs/heads/${branch}`, sha: baseSha }),
    });

    const changedFiles = [];
    const replacements = [
      desktopContent ? { label: "desktop", path: desktopRepoPath, content: desktopContent } : null,
      mobileContent ? { label: "mobile", path: mobileRepoPath, content: mobileContent } : null,
    ].filter(Boolean);

    for (const replacement of replacements) {
      const current = await github(
        `/repos/${OWNER}/${REPO_NAME}/contents/${replacement.path}?ref=main`
      );
      await github(`/repos/${OWNER}/${REPO_NAME}/contents/${replacement.path}`, {
        method: "PUT",
        body: JSON.stringify({
          message: `Control Center Hero media: ${heroKey} ${replacement.label}`,
          content: replacement.content,
          sha: current.sha,
          branch,
        }),
      });
      changedFiles.push(replacement.path);
    }

    const pr = await github(`/repos/${OWNER}/${REPO_NAME}/pulls`, {
      method: "POST",
      body: JSON.stringify({
        title: `Control Center Hero media: ${heroKey}`,
        head: branch,
        base: "main",
        draft: true,
        body: [
          "Generated by PlayNice Control Center Hero Media Apply v1.",
          "",
          `- Hero: ${heroKey}`,
          `- Slide ID: ${slide.id}`,
          `- Slide: ${slide.alt || "—"}`,
          `- Files: ${changedFiles.join(", ")}`,
          "- Metadata/action: unchanged",
          "- Safety: draft PR only; no automatic merge",
          "- Review the Vercel preview before merging",
        ].join("\n"),
      }),
    });

    return json(res, 200, {
      ok: true,
      hero_key: heroKey,
      slide_id: slide.id,
      branch,
      pr_number: pr.number,
      pr_url: pr.html_url,
      files: changedFiles,
    });
  } catch (error) {
    console.error("Hero media apply failed", error);
    return json(res, 500, { error: error?.message || "Hero media apply failed." });
  }
};
