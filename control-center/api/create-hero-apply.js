const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO = "hazardno-dot/playnice-site";
const [OWNER, REPO_NAME] = REPO.split("/");
const APP_PATH = "playnice-site/src/App.js";
const CONFIG_PATH = "playnice-site/src/data/heroSlides.generated.js";

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
  const data = await readJson(response, "GitHub API");
  if (!response.ok) {
    const error = new Error(data?.message || `GitHub request failed (${response.status})`);
    error.status = response.status;
    throw error;
  }
  return data;
}

const stable = (value) => {
  const normalize = (item) => {
    if (Array.isArray(item)) return item.map(normalize);
    if (item && typeof item === "object") {
      return Object.keys(item).sort().reduce((out, key) => {
        out[key] = normalize(item[key]);
        return out;
      }, {});
    }
    return item;
  };
  return JSON.stringify(normalize(value ?? null));
};

function rowToSlide(row) {
  return {
    id: Number(row.id),
    heroKey: row.hero_key,
    kind: row.kind || "imageOnly",
    enabled: row.enabled !== false,
    pinnedFirst: Boolean(row.pinned_first),
    position: Number(row.position || 0),
    image: row.image || row.desktop_image,
    desktopImage: row.desktop_image || row.image,
    mobileImage: row.mobile_image || row.image,
    alt: row.alt || "",
    actionPrimary: row.action_type || "none",
    actionProductSlug: row.product_slug || "",
    preferredSize: row.preferred_size || "",
    collectionTitle: row.collection_title || "",
    actionCollection: Array.isArray(row.collection_slugs) ? row.collection_slugs : [],
    manifestoType: row.manifesto_type || "",
  };
}

function normalizeApproved(payload, baseline) {
  return {
    ...baseline,
    ...payload,
    id: Number(baseline.id),
    heroKey: baseline.heroKey,
    position: Number(baseline.position),
    kind: payload?.kind || baseline.kind || "imageOnly",
    enabled: payload?.enabled !== false,
    pinnedFirst: Boolean(payload?.pinnedFirst),
    image: payload?.desktopImage || payload?.image || baseline.desktopImage || baseline.image,
    desktopImage: payload?.desktopImage || payload?.image || baseline.desktopImage || baseline.image,
    mobileImage: payload?.mobileImage || baseline.mobileImage || baseline.image,
    alt: String(payload?.alt || "").trim(),
    actionPrimary: payload?.actionPrimary || "none",
    actionProductSlug: payload?.actionProductSlug || "",
    preferredSize: payload?.preferredSize || "",
    collectionTitle: payload?.collectionTitle || "",
    actionCollection: Array.isArray(payload?.actionCollection) ? payload.actionCollection : [],
    manifestoType: payload?.manifestoType || "",
  };
}

function runtimeObject(slide) {
  const out = {
    id: Number(slide.id),
    kind: slide.kind || "imageOnly",
    image: slide.desktopImage || slide.image,
    desktopImage: slide.desktopImage || slide.image,
    mobileImage: slide.mobileImage || slide.image,
    alt: slide.alt,
    actionPrimary: slide.actionPrimary || "none",
  };
  if (out.actionPrimary === "product") {
    out.actionProductSlug = slide.actionProductSlug;
    out.preferredSize = slide.preferredSize || "10ml";
  } else if (out.actionPrimary === "collection") {
    out.actionCollection = [...(slide.actionCollection || [])];
    out.collectionTitle = slide.collectionTitle || "";
  } else if (out.actionPrimary === "manifesto") {
    out.manifestoType = slide.manifestoType;
  }
  return out;
}

function effectiveRuntime(slides) {
  const active = slides.filter((slide) => slide.enabled !== false).slice().sort((a, b) => a.position - b.position);
  const pinned = active.filter((slide) => slide.pinnedFirst);
  if (pinned.length !== 1) throw new Error(`HERO CONTRACT: exactly one active slide must be pinned first; found ${pinned.length}.`);
  const first = pinned[0];
  return [first, ...active.filter((slide) => slide.heroKey !== first.heroKey)].map(runtimeObject);
}

function parseArrayLiteral(raw, label) {
  try {
    const parsed = Function(`"use strict"; return (${raw});`)();
    if (!Array.isArray(parsed)) throw new Error("not an array");
    return JSON.parse(JSON.stringify(parsed));
  } catch (error) {
    throw new Error(`Could not parse ${label}: ${error.message}`);
  }
}

function extractHardcodedHero(source) {
  const marker = "const BASE_HERO_SLIDES = ";
  const start = source.indexOf(marker);
  if (start < 0) return null;
  const arrayStart = source.indexOf("[", start + marker.length);
  const shuffleStart = source.indexOf("const shuffleHeroSlides", arrayStart);
  if (arrayStart < 0 || shuffleStart < 0) throw new Error("Hero markers are incomplete in App.js.");
  const between = source.slice(arrayStart, shuffleStart);
  const semi = between.lastIndexOf(";");
  if (semi < 0) throw new Error("Could not determine BASE_HERO_SLIDES boundary.");
  const raw = between.slice(0, semi).trim();
  return { start, end: shuffleStart, parsed: parseArrayLiteral(raw, "BASE_HERO_SLIDES") };
}

function parseGeneratedConfig(source) {
  const marker = "export const BASE_HERO_SLIDES = ";
  const start = source.indexOf(marker);
  if (start < 0) throw new Error("Generated Hero config export was not found.");
  const raw = source.slice(start + marker.length).trim().replace(/;\s*$/, "");
  return parseArrayLiteral(raw, "generated Hero config");
}

function renderConfig(runtimeSlides) {
  return [
    "// Generated by PlayNice Control Center Hero Controlled Apply.",
    "// Source: approved Supabase Hero draft + verified Hero baseline.",
    "// Do not edit manually unless deliberately taking Hero management out of Control Center.",
    "",
    `export const BASE_HERO_SLIDES = ${JSON.stringify(runtimeSlides, null, 2)};`,
    "",
  ].join("\n");
}

function addConfigImportAndRemoveBlock(appSource) {
  const importLine = 'import { BASE_HERO_SLIDES } from "./data/heroSlides.generated";';
  let next = appSource;
  if (!next.includes(importLine)) {
    const anchor = 'import { translations } from "./data/translations";';
    if (!next.includes(anchor)) throw new Error("Could not locate safe import anchor in App.js.");
    next = next.replace(anchor, `${anchor}\n${importLine}`);
  }
  const hardcoded = extractHardcodedHero(next);
  if (!hardcoded) throw new Error("Could not locate hardcoded Hero block after import insertion.");
  return next.slice(0, hardcoded.start) + next.slice(hardcoded.end);
}

async function readMaybeGithubFile(path, ref) {
  try {
    return await github(`/repos/${OWNER}/${REPO_NAME}/contents/${path}?ref=${encodeURIComponent(ref)}`);
  } catch (error) {
    if (error.status === 404) return null;
    throw error;
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed." });
  if (!SUPABASE_URL || !SUPABASE_KEY || !GITHUB_TOKEN) return json(res, 500, { error: "Controlled Apply environment is incomplete." });

  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  const heroKey = String(req.body?.hero_key || "").trim();
  if (!token) return json(res, 401, { error: "Admin session required." });
  if (!heroKey) return json(res, 400, { error: "hero_key is required." });

  try {
    const userResponse = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${token}` } });
    const user = await readJson(userResponse, "Supabase Auth");
    if (!userResponse.ok || !user?.id) return json(res, 401, { error: "Admin session expired." });

    const adminResponse = await supabaseFetch(`/rest/v1/admin_users?user_id=eq.${encodeURIComponent(user.id)}&select=user_id`, token);
    const admins = await readJson(adminResponse, "Supabase admin lookup");
    if (!adminResponse.ok || !Array.isArray(admins) || !admins.length) return json(res, 403, { error: "PlayNice admin access required." });

    const draftResponse = await supabaseFetch(`/rest/v1/hero_drafts?hero_key=eq.${encodeURIComponent(heroKey)}&select=hero_key,payload,approved_payload,review_status,baseline_snapshot,apply_branch,apply_pr_number`, token);
    const drafts = await readJson(draftResponse, "Supabase Hero draft");
    if (!draftResponse.ok) throw new Error(drafts?.message || "Could not read Hero draft.");
    const draft = drafts?.[0];
    if (!draft) return json(res, 404, { error: "Hero draft not found." });
    if (draft.review_status !== "approved" || !draft.approved_payload) return json(res, 409, { error: "Hero draft must be approved before Controlled Apply." });
    if (stable(draft.payload) !== stable(draft.approved_payload)) return json(res, 409, { error: "APPROVAL SAFETY BLOCK: current draft differs from the approved snapshot." });
    if (draft.apply_branch || draft.apply_pr_number) return json(res, 409, { error: "A Hero preview branch already exists for this draft." });

    const slidesResponse = await supabaseFetch("/rest/v1/hero_slides?select=id,hero_key,kind,enabled,pinned_first,position,image,desktop_image,mobile_image,alt,action_type,product_slug,preferred_size,collection_title,collection_slugs,manifesto_type&order=position.asc", token);
    const slideRows = await readJson(slidesResponse, "Supabase Hero baseline");
    if (!slidesResponse.ok || !Array.isArray(slideRows) || !slideRows.length) throw new Error(slideRows?.message || "Could not read Hero baseline.");
    const baselineSlides = slideRows.map(rowToSlide);
    const baseline = baselineSlides.find((slide) => slide.heroKey === heroKey);
    if (!baseline) return json(res, 409, { error: "Hero baseline no longer contains this slide." });
    if (draft.baseline_snapshot && stable(draft.baseline_snapshot) !== stable(baseline)) return json(res, 409, { error: "LIVE DRIFT: Supabase Hero baseline changed after this draft was created." });

    const mainRef = await github(`/repos/${OWNER}/${REPO_NAME}/git/ref/heads/main`);
    const baseSha = mainRef.object.sha;
    const appFile = await github(`/repos/${OWNER}/${REPO_NAME}/contents/${APP_PATH}?ref=main`);
    const appSource = Buffer.from(appFile.content, "base64").toString("utf8");
    const hardcoded = extractHardcodedHero(appSource);
    const generatedFile = await readMaybeGithubFile(CONFIG_PATH, "main");

    const baselineRuntime = effectiveRuntime(baselineSlides);
    if (hardcoded) {
      if (stable(hardcoded.parsed) !== stable(baselineRuntime)) return json(res, 409, { error: "LIVE DRIFT: main App.js Hero does not match the verified Supabase baseline." });
    } else {
      if (!generatedFile) return json(res, 409, { error: "Hero runtime source is neither hardcoded nor generated; manual review required." });
      const generatedSource = Buffer.from(generatedFile.content, "base64").toString("utf8");
      const generatedRuntime = parseGeneratedConfig(generatedSource).map(runtimeObject);
      if (stable(generatedRuntime) !== stable(baselineRuntime)) return json(res, 409, { error: "LIVE DRIFT: generated Hero config does not match the verified Supabase baseline." });
    }

    const approvedSlide = normalizeApproved(draft.approved_payload, baseline);
    const nextSlides = baselineSlides.map((slide) => slide.heroKey === heroKey ? approvedSlide : slide);
    const nextRuntime = effectiveRuntime(nextSlides);
    if (stable(nextRuntime) === stable(baselineRuntime)) return json(res, 409, { error: "Approved Hero draft contains no runtime change." });

    const stamp = new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 12);
    const safeKey = heroKey.replace(/[^a-z0-9-]/gi, "-").toLowerCase();
    const branch = `cc-hero-apply-${safeKey}-${stamp}`;
    await github(`/repos/${OWNER}/${REPO_NAME}/git/refs`, { method: "POST", body: JSON.stringify({ ref: `refs/heads/${branch}`, sha: baseSha }) });

    const configContent = renderConfig(nextRuntime);
    const configBody = { message: `Control Center Hero apply: ${heroKey}`, content: Buffer.from(configContent, "utf8").toString("base64"), branch };
    if (generatedFile) configBody.sha = generatedFile.sha;
    await github(`/repos/${OWNER}/${REPO_NAME}/contents/${CONFIG_PATH}`, { method: "PUT", body: JSON.stringify(configBody) });

    const changedFiles = [CONFIG_PATH];
    if (hardcoded) {
      const nextApp = addConfigImportAndRemoveBlock(appSource);
      await github(`/repos/${OWNER}/${REPO_NAME}/contents/${APP_PATH}`, { method: "PUT", body: JSON.stringify({ message: "Extract Hero slides to generated config", content: Buffer.from(nextApp, "utf8").toString("base64"), sha: appFile.sha, branch }) });
      changedFiles.push(APP_PATH);
    }

    const beforeSlide = baselineRuntime.find((slide) => Number(slide.id) === Number(baseline.id));
    const afterSlide = nextRuntime.find((slide) => Number(slide.id) === Number(baseline.id));
    const pr = await github(`/repos/${OWNER}/${REPO_NAME}/pulls`, {
      method: "POST",
      body: JSON.stringify({
        title: `Control Center Hero: ${heroKey}`,
        head: branch,
        base: "main",
        draft: true,
        body: [
          "Generated by PlayNice Control Center Hero Controlled Apply v1.",
          "",
          `- Hero: ${heroKey}`,
          `- Slide ID: ${baseline.id}`,
          `- Before: ${JSON.stringify(beforeSlide)}`,
          `- Approved: ${JSON.stringify(afterSlide)}`,
          `- Files: ${changedFiles.join(", ")}`,
          "- Source: approved_payload only",
          "- Safety: full Hero baseline parity checked before branch creation",
          "- Safety: draft PR only; no automatic merge",
        ].join("\n"),
      }),
    });

    const now = new Date().toISOString();
    const patchResponse = await supabaseFetch(`/rest/v1/hero_drafts?hero_key=eq.${encodeURIComponent(heroKey)}`, token, {
      method: "PATCH",
      body: JSON.stringify({
        apply_branch: branch,
        apply_pr_number: pr.number,
        apply_created_at: now,
        apply_created_by: user.id,
        preview_verified_at: null,
        preview_verified_by: null,
      }),
    });
    if (!patchResponse.ok) {
      const patchBody = await readJson(patchResponse, "Supabase Hero apply metadata");
      throw new Error(patchBody?.message || "Could not save Hero apply metadata.");
    }

    return json(res, 200, { ok: true, branch, pr_number: pr.number, pr_url: pr.html_url, files: changedFiles });
  } catch (error) {
    console.error("Hero Controlled Apply failed", error);
    return json(res, 500, { error: error?.message || "Hero Controlled Apply failed." });
  }
};