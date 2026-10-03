const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO = "hazardno-dot/playnice-site";
const [OWNER, REPO_NAME] = REPO.split("/");
const APP_PATH = "playnice-site/src/App.js";
const CONFIG_PATH = "playnice-site/src/data/heroSlides.generated.js";
const EXHIBITION_PATH = "playnice-site/src/data/exhibition.js";

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

function safeId(value) {
  return String(value || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function periodFor(date = new Date()) {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  if (month <= 4) return { year, period: `feb-apr-${year}` };
  if (month <= 8) return { year, period: `may-aug-${year}` };
  return { year, period: `sep-dec-${year}` };
}

function extensionFor(source) {
  const clean = String(source || "").split("?")[0];
  const match = clean.match(/\.([a-z0-9]+)$/i);
  return match?.[1]?.toLowerCase() || "jpg";
}

function buildReplacementExhibitionEntry(heroKey, baseline, canonicalAsset) {
  const { year, period } = periodFor();
  const title = String(baseline.alt || heroKey).trim();
  const campaignSlug = safeId(title).slice(0, 52) || safeId(heroKey) || `slot-${baseline.id}`;
  const entryId = `hero-${baseline.id}-${campaignSlug}`;
  const source = canonicalAsset === "mobile"
    ? (baseline.mobileImage || baseline.image || "")
    : (baseline.desktopImage || baseline.image || "");
  if (!source || !source.startsWith("/")) {
    throw new Error(`Replaced Hero has no local ${canonicalAsset} asset to archive.`);
  }
  const ext = extensionFor(source);
  const publicPath = `/exhibition/${year}/hero/${entryId}.${ext}`;
  const repositoryPath = `playnice-site/public${publicPath}`;
  return {
    repositoryPath,
    sourcePath: `playnice-site/public${source}`,
    entry: {
      id: entryId,
      year,
      period,
      title,
      kind: "campaign",
      status: "archived",
      published: true,
      label: { sr: "Hero kampanja", en: "Hero Campaign" },
      line: { sr: "Kampanja je završena. Ideja ostaje.", en: "The campaign is over. The idea remains." },
      assets: [{
        id: `${entryId}-${canonicalAsset}`,
        type: "image",
        src: publicPath,
        format: canonicalAsset === "mobile" ? "mobile" : "wide",
        alt: title || heroKey,
      }],
    },
  };
}

function insertExhibitionEntry(source, entry) {
  const marker = "export const exhibitionItems = [\n";
  const index = source.indexOf(marker);
  if (index < 0) throw new Error("Could not locate Exhibition data array.");
  const duplicateNeedles = [`id: "${entry.id}"`, `"id": "${entry.id}"`];
  if (duplicateNeedles.some((needle) => source.includes(needle))) return { source, alreadyPresent: true };
  const rendered = `  ${JSON.stringify(entry, null, 2).replace(/\n/g, "\n  ")},\n\n`;
  return { source: source.slice(0, index + marker.length) + rendered + source.slice(index + marker.length), alreadyPresent: false };
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

async function createGitBlob(content, encoding = "utf-8") {
  return github(`/repos/${OWNER}/${REPO_NAME}/git/blobs`, {
    method: "POST",
    body: JSON.stringify({ content, encoding }),
  });
}

async function commitBatchToBranch(branch, entries, message) {
  const ref = await github(`/repos/${OWNER}/${REPO_NAME}/git/ref/heads/${encodeURIComponent(branch)}`);
  const parentSha = ref?.object?.sha;
  if (!parentSha) throw new Error("Could not resolve Hero apply branch head.");

  const parentCommit = await github(`/repos/${OWNER}/${REPO_NAME}/git/commits/${parentSha}`);
  const tree = [];
  for (const entry of entries) {
    let sha = entry.sha || "";
    if (!sha) {
      const blob = await createGitBlob(entry.content, entry.encoding || "utf-8");
      sha = blob.sha;
    }
    tree.push({ path: entry.path, mode: "100644", type: "blob", sha });
  }

  const nextTree = await github(`/repos/${OWNER}/${REPO_NAME}/git/trees`, {
    method: "POST",
    body: JSON.stringify({ base_tree: parentCommit.tree.sha, tree }),
  });
  const commit = await github(`/repos/${OWNER}/${REPO_NAME}/git/commits`, {
    method: "POST",
    body: JSON.stringify({ message, tree: nextTree.sha, parents: [parentSha] }),
  });
  await github(`/repos/${OWNER}/${REPO_NAME}/git/refs/heads/${encodeURIComponent(branch)}`, {
    method: "PATCH",
    body: JSON.stringify({ sha: commit.sha, force: false }),
  });
  return commit.sha;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed." });
  if (!SUPABASE_URL || !SUPABASE_KEY || !GITHUB_TOKEN) return json(res, 500, { error: "Controlled Apply environment is incomplete." });

  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  const heroKey = String(req.body?.hero_key || "").trim();
  const includeInExhibition = req.body?.include_in_exhibition;
  const canonicalAsset = String(req.body?.canonical_asset || "desktop").trim().toLowerCase();
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
    const nextSlides = baselineSlides.map((slide) => {
      if (slide.heroKey === heroKey) return approvedSlide;
      if (approvedSlide.pinnedFirst) return { ...slide, pinnedFirst: false };
      return slide;
    });
    const nextRuntime = effectiveRuntime(nextSlides);
    const mediaStage = draft.approved_payload?.mediaStage || null;
    const stagedFiles = Array.isArray(mediaStage?.files) ? mediaStage.files : [];
    const hasMediaStage = Boolean(mediaStage?.branch && stagedFiles.length);
    const replacement = baseline.enabled !== false && approvedSlide.enabled !== false && hasMediaStage;
    if (replacement && typeof includeInExhibition !== "boolean") {
      return json(res, 400, { error: "Exhibition decision is required when replacing an active Hero campaign." });
    }
    if (replacement && includeInExhibition && !["desktop", "mobile"].includes(canonicalAsset)) {
      return json(res, 400, { error: "canonical_asset must be desktop or mobile." });
    }
    if (stable(nextRuntime) === stable(baselineRuntime) && !hasMediaStage) {
      return json(res, 409, { error: "Approved Hero draft contains no runtime or media change." });
    }

    let branch;
    if (hasMediaStage) {
      if (!/^cc-hero-media-stage-[a-z0-9-]+-\d{12}$/i.test(mediaStage.branch)) {
        return json(res, 409, { error: "Hero media staging branch is invalid." });
      }
      if (mediaStage.baseSha !== baseSha) {
        return json(res, 409, { error: "LIVE DRIFT: main changed after Hero media was staged. Return to draft and stage the media again." });
      }
      const stageRef = await github(`/repos/${OWNER}/${REPO_NAME}/git/ref/heads/${encodeURIComponent(mediaStage.branch)}`);
      if (!stageRef?.object?.sha) return json(res, 409, { error: "Hero media staging branch no longer exists." });
      branch = mediaStage.branch;
    } else {
      const stamp = new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 12);
      const safeKey = heroKey.replace(/[^a-z0-9-]/gi, "-").toLowerCase();
      branch = `cc-hero-apply-${safeKey}-${stamp}`;
      await github(`/repos/${OWNER}/${REPO_NAME}/git/refs`, { method: "POST", body: JSON.stringify({ ref: `refs/heads/${branch}`, sha: baseSha }) });
    }

    const configContent = renderConfig(nextRuntime);
    const applyEntries = [{ path: CONFIG_PATH, content: configContent, encoding: "utf-8" }];
    const changedFiles = [...new Set([...stagedFiles, CONFIG_PATH])];

    if (hardcoded) {
      const branchAppFile = await github(`/repos/${OWNER}/${REPO_NAME}/contents/${APP_PATH}?ref=${encodeURIComponent(branch)}`);
      const branchAppSource = Buffer.from(branchAppFile.content, "base64").toString("utf8");
      const nextApp = addConfigImportAndRemoveBlock(branchAppSource);
      applyEntries.push({ path: APP_PATH, content: nextApp, encoding: "utf-8" });
      changedFiles.push(APP_PATH);
    }

    let exhibitionEntry = null;
    if (replacement && includeInExhibition) {
      const archive = buildReplacementExhibitionEntry(heroKey, baseline, canonicalAsset);
      exhibitionEntry = archive.entry;

      const oldAssetFile = await github(`/repos/${OWNER}/${REPO_NAME}/contents/${archive.sourcePath}?ref=main`);
      const archiveAssetFile = await readMaybeGithubFile(archive.repositoryPath, branch);
      if (!archiveAssetFile) {
        applyEntries.push({ path: archive.repositoryPath, sha: oldAssetFile.sha });
      }

      const exhibitionFile = await github(`/repos/${OWNER}/${REPO_NAME}/contents/${EXHIBITION_PATH}?ref=${encodeURIComponent(branch)}`);
      const exhibitionSource = Buffer.from(exhibitionFile.content, "base64").toString("utf8");
      const prepared = insertExhibitionEntry(exhibitionSource, exhibitionEntry);
      if (!prepared.alreadyPresent) {
        applyEntries.push({ path: EXHIBITION_PATH, content: prepared.source, encoding: "utf-8" });
      }
      changedFiles.push(archive.repositoryPath, EXHIBITION_PATH);
    }

    const applyCommitSha = await commitBatchToBranch(
      branch,
      applyEntries,
      replacement && includeInExhibition
        ? `Apply Hero replacement + Exhibition archive: ${heroKey}`
        : `Control Center Hero apply: ${heroKey}`,
    );

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
          "Generated by PlayNice Control Center Hero Controlled Apply v2.",
          "",
          `- Hero: ${heroKey}`,
          `- Slide ID: ${baseline.id}`,
          `- Before: ${JSON.stringify(beforeSlide)}`,
          `- Approved: ${JSON.stringify(afterSlide)}`,
          `- Staged media: ${hasMediaStage ? stagedFiles.join(", ") : "none"}`,
          `- Active campaign replacement: ${replacement ? "yes" : "no"}`,
          `- Exhibition archive: ${replacement ? (includeInExhibition ? exhibitionEntry?.id || "included" : "skipped by explicit editorial decision") : "not applicable"}`,
          `- Canonical archive asset: ${replacement && includeInExhibition ? canonicalAsset : "n/a"}`,
          `- Files: ${[...new Set(changedFiles)].join(", ")}`,
          "- Source: approved_payload + staged Hero media",
          "- Safety: full Hero baseline parity checked before PR creation",
          "- Safety: staged media must be based on current main",
          "- Safety: one draft PR only; no automatic merge",
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

    return json(res, 200, {
      ok: true,
      branch,
      pr_number: pr.number,
      pr_url: pr.html_url,
      files: [...new Set(changedFiles)],
      media_files: stagedFiles,
      replacement,
      exhibition_included: replacement ? includeInExhibition : false,
      exhibition_id: exhibitionEntry?.id || null,
      canonical_asset: replacement && includeInExhibition ? canonicalAsset : null,
      apply_commit_sha: applyCommitSha,
      expected_commit_count: hasMediaStage ? 2 : 1,
    });
  } catch (error) {
    console.error("Hero Controlled Apply failed", error);
    return json(res, 500, { error: error?.message || "Hero Controlled Apply failed." });
  }
};
