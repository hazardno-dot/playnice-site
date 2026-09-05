const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO = "hazardno-dot/playnice-site";
const [OWNER, REPO_NAME] = REPO.split("/");

function getRef() {
  return process.env.VERCEL_GIT_COMMIT_REF || process.env.GITHUB_REF_NAME || "main";
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).send("Method not allowed");
  if (!GITHUB_TOKEN) return res.status(500).send("GitHub preview environment is incomplete");

  const rawPath = String(req.query?.path || "").trim();
  if (!rawPath.startsWith("/hero/") || rawPath.includes("..")) {
    return res.status(400).send("Invalid Hero media path");
  }

  const repoPath = `playnice-site/public${rawPath}`;
  const ref = getRef();

  try {
    const response = await fetch(`https://api.github.com/repos/${OWNER}/${REPO_NAME}/contents/${repoPath}?ref=${encodeURIComponent(ref)}`, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    const body = await response.json();
    if (!response.ok || !body?.content) {
      return res.status(response.status || 404).send(body?.message || "Hero media not found");
    }

    const buffer = Buffer.from(String(body.content).replace(/\n/g, ""), "base64");
    const lower = rawPath.toLowerCase();
    const contentType = lower.endsWith(".png") ? "image/png" : lower.endsWith(".webp") ? "image/webp" : "image/jpeg";

    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "no-store, max-age=0");
    res.setHeader("X-PlayNice-Hero-Ref", ref);
    return res.status(200).send(buffer);
  } catch (error) {
    console.error("Hero media preview failed", error);
    return res.status(500).send(error?.message || "Hero media preview failed");
  }
};
