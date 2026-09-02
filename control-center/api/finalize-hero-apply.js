const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO = "hazardno-dot/playnice-site";
const [OWNER, REPO_NAME] = REPO.split("/");
const CONFIG_PATH = "src/data/heroSlides.generated.js";

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
  if (!response.ok) throw new Error(data?.message || `GitHub request failed (${response.status}).`);
  return data;
}

function parseGeneratedConfig(source) {
  const marker = "export const BASE_HERO_SLIDES = ";
  const start = source.indexOf(marker);
  if (start < 0) throw new Error("Generated Hero config export was not found on main.");
  const raw = source.slice(start + marker.length).trim().replace(/;\s*$/, "");
  const parsed = Function(`\"use strict\"; return (${raw});`)();
  if (!Array.isArray(parsed)) throw new Error("Generated Hero config is not an array.");
  return JSON.parse(JSON.stringify(parsed));
}

function approvedRuntime(payload, id) {
  const out = {
    id: Number(id),
    kind: payload?.kind || "imageOnly",
    image: payload?.desktopImage || payload?.image || "",
    desktopImage: payload?.desktopImage || payload?.image || "",
    mobileImage: payload?.mobileImage || payload?.image || "",
    alt: String(payload?.alt || "").trim(),
    actionPrimary: payload?.actionPrimary || "none",
  };
  if (out.actionPrimary === "product") {
    out.actionProductSlug = payload?.actionProductSlug || "";
    out.preferredSize = payload?.preferredSize || "10ml";
  } else if (out.actionPrimary === "collection") {
    out.actionCollection = Array.isArray(payload?.actionCollection) ? payload.actionCollection : [];
    out.collectionTitle = payload?.collectionTitle || "";
  } else if (out.actionPrimary === "manifesto") {
    out.manifestoType = payload?.manifestoType || "";
  }
  return out;
}

const stable = (value) => JSON.stringify(value, Object.keys(value || {}).sort());

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed." });
  if (!SUPABASE_URL || !SUPABASE_KEY || !GITHUB_TOKEN) return json(res, 500, { error: "Finalize environment is incomplete." });

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

    const adminResponse = await supabaseFetch(`/rest/v1/admin_users?user_id=eq.${encodeURIComponent(user.id)}&select=user_id`, token);
    const admins = await readJson(adminResponse, "Supabase admin lookup");
    if (!adminResponse.ok || !Array.isArray(admins) || !admins.length) return json(res, 403, { error: "PlayNice admin access required." });

    const draftResponse = await supabaseFetch(`/rest/v1/hero_drafts?hero_key=eq.${encodeURIComponent(heroKey)}&select=hero_key,approved_payload,review_status,apply_pr_number,preview_verified_at`, token);
    const drafts = await readJson(draftResponse, "Supabase Hero draft");
    const draft = drafts?.[0];
    if (!draftResponse.ok || !draft) return json(res, 404, { error: "Hero apply draft not found." });
    if (draft.review_status !== "approved" || !draft.approved_payload) return json(res, 409, { error: "Hero draft is not approved." });
    if (!draft.preview_verified_at) return json(res, 409, { error: "Hero Preview must be verified before finalization." });
    if (!draft.apply_pr_number) return json(res, 409, { error: "Hero apply PR is missing." });

    const pr = await github(`/repos/${OWNER}/${REPO_NAME}/pulls/${draft.apply_pr_number}`);
    if (!pr.merged_at) return json(res, 409, { error: `PR #${draft.apply_pr_number} is not merged yet.` });

    const baselineResponse = await supabaseFetch(`/rest/v1/hero_slides?hero_key=eq.${encodeURIComponent(heroKey)}&select=id,hero_key`, token);
    const baselines = await readJson(baselineResponse, "Supabase Hero baseline");
    const baseline = baselines?.[0];
    if (!baselineResponse.ok || !baseline) return json(res, 409, { error: "Hero baseline no longer exists." });

    const configFile = await github(`/repos/${OWNER}/${REPO_NAME}/contents/${CONFIG_PATH}?ref=main`);
    const configSource = Buffer.from(configFile.content, "base64").toString("utf8");
    const runtimeSlides = parseGeneratedConfig(configSource);
    const liveSlide = runtimeSlides.find((slide) => Number(slide.id) === Number(baseline.id));
    const expectedSlide = approvedRuntime(draft.approved_payload, baseline.id);
    if (!liveSlide || stable(liveSlide) !== stable(expectedSlide)) {
      return json(res, 409, { error: "POST-MERGE SAFETY BLOCK: main Hero config does not match the approved snapshot." });
    }

    const rpcResponse = await supabaseFetch("/rest/v1/rpc/finalize_hero_apply", token, {
      method: "POST",
      body: JSON.stringify({ p_hero_key: heroKey, p_payload: draft.approved_payload }),
    });
    if (!rpcResponse.ok) {
      const rpcBody = await readJson(rpcResponse, "Supabase finalize Hero RPC");
      throw new Error(rpcBody?.message || "Could not finalize Hero baseline.");
    }

    return json(res, 200, { ok: true, hero_key: heroKey, pr_number: draft.apply_pr_number });
  } catch (error) {
    console.error("Finalize Hero apply failed", error);
    return json(res, 500, { error: error?.message || "Finalize Hero apply failed." });
  }
};
