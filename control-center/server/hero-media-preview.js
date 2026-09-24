const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO = "hazardno-dot/playnice-site";
const [OWNER, REPO_NAME] = REPO.split("/");

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

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).send("Method not allowed");

  const rawPath = String(req.query?.path || "").trim();
  if (!rawPath.startsWith("/hero/") || rawPath.includes("..")) {
    return res.status(400).send("Invalid Hero media path");
  }

  if (!GITHUB_TOKEN) return res.status(500).send("GitHub preview environment is incomplete");

  const deploymentRef = getRef();
  const sourceRef = isHeroPreviewRef(deploymentRef) ? deploymentRef : "main";
  const repoPath = `playnice-site/public${rawPath}`;

  try {
    const { response: fileResponse, body: fileBody } = await github(
      `/repos/${OWNER}/${REPO_NAME}/contents/${repoPath}?ref=${encodeURIComponent(sourceRef)}`
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
    res.setHeader("X-PlayNice-Hero-Ref", sourceRef);
    res.setHeader("X-PlayNice-Hero-Deployment-Ref", deploymentRef);
    return res.status(200).send(buffer);
  } catch (error) {
    console.error("Hero media preview failed", error);
    return res.status(500).send(error?.message || "Hero media preview failed");
  }
};
