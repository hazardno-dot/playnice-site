const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO = "hazardno-dot/playnice-site";
const [OWNER, REPO_NAME] = REPO.split("/");
const LIVE_ORIGIN = "https://www.playniceshop.me";

function getRef() {
  return process.env.VERCEL_GIT_COMMIT_REF || process.env.GITHUB_REF_NAME || "main";
}

function isHeroPreviewRef(ref) {
  return /^cc-hero-(?:media-stage|apply)-/i.test(String(ref || ""));
}

async function github(path) {
  const response = await fetch(`https://api.github.com${path}`, {
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  const body = await response.json();
  return { response, body };
}

function getContentType(path, fallback = "image/jpeg") {
  const lower = String(path || "").toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".gif")) return "image/gif";
  return fallback;
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).send("Method not allowed");

  const rawPath = String(req.query?.path || "").trim();
  if (!rawPath.startsWith("/hero/") || rawPath.includes("..")) {
    return res.status(400).send("Invalid Hero media path");
  }

  const ref = getRef();

  // Normal CC deployments proxy the live Hero asset through the CC origin.
  // This avoids browser cross-origin image failures while keeping the source
  // of truth on the live PlayNice site.
  if (!isHeroPreviewRef(ref)) {
    try {
      const liveUrl = `${LIVE_ORIGIN}${rawPath}?ccv=${Date.now()}`;
      const liveResponse = await fetch(liveUrl, {
        headers: { Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8" },
        cache: "no-store",
      });

      if (!liveResponse.ok) {
        return res.status(liveResponse.status).send("Live Hero media not found");
      }

      const buffer = Buffer.from(await liveResponse.arrayBuffer());
      const contentType = liveResponse.headers.get("content-type") || getContentType(rawPath);

      res.setHeader("Content-Type", contentType);
      res.setHeader("Cache-Control", "no-store, max-age=0");
      res.setHeader("X-PlayNice-Hero-Source", "live");
      return res.status(200).send(buffer);
    } catch (error) {
      console.error("Live Hero media preview failed", error);
      return res.status(502).send(error?.message || "Live Hero media preview failed");
    }
  }

  if (!GITHUB_TOKEN) return res.status(500).send("GitHub preview environment is incomplete");

  const repoPath = `playnice-site/public${rawPath}`;

  try {
    const { response: fileResponse, body: fileBody } = await github(
      `/repos/${OWNER}/${REPO_NAME}/contents/${repoPath}?ref=${encodeURIComponent(ref)}`
    );

    if (!fileResponse.ok || !fileBody?.sha) {
      return res.status(fileResponse.status || 404).send(fileBody?.message || "Hero media not found");
    }

    let encoded = fileBody.content;

    // GitHub Contents omits inline content for files above 1 MB. Hero uploads can be
    // up to 1.5 MB, so fall back to the Git blob endpoint when needed.
    if (!encoded) {
      const { response: blobResponse, body: blobBody } = await github(
        `/repos/${OWNER}/${REPO_NAME}/git/blobs/${encodeURIComponent(fileBody.sha)}`
      );
      if (!blobResponse.ok || !blobBody?.content) {
        return res.status(blobResponse.status || 404).send(blobBody?.message || "Hero media blob not found");
      }
      encoded = blobBody.content;
    }

    const buffer = Buffer.from(String(encoded).replace(/\n/g, ""), "base64");
    const contentType = getContentType(rawPath);

    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "no-store, max-age=0");
    res.setHeader("X-PlayNice-Hero-Ref", ref);
    return res.status(200).send(buffer);
  } catch (error) {
    console.error("Hero media preview failed", error);
    return res.status(500).send(error?.message || "Hero media preview failed");
  }
};
