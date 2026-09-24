const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = "hazardno-dot";
const REPO = "playnice-site";
const COMMERCE_KEY = "shipping";

const PATHS = {
  app: "playnice-site/src/App.js",
  translations: "playnice-site/src/data/translations.js",
  checkout: "playnice-site/server/checkout-legacy.js",
};
const ALLOWED_FILES = Object.values(PATHS);

const json = (res, status, body) => res.status(status).json(body);

async function readJson(response, label) {
  const text = await response.text();
  try { return text ? JSON.parse(text) : null; }
  catch { throw new Error(`${label} returned a non-JSON response (${response.status}).`); }
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

async function githubGraphql(query, variables) {
  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  const data = await readJson(response, "GitHub GraphQL");
  if (!response.ok || data?.errors?.length) throw new Error(data?.errors?.[0]?.message || `GitHub GraphQL failed (${response.status}).`);
  return data.data;
}

async function authenticate(req) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!token) return { error: [401, "Admin session required."] };

  const userResponse = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${token}` },
  });
  const user = await readJson(userResponse, "Supabase Auth");
  if (!userResponse.ok || !user?.id) return { error: [401, "Admin session expired."] };

  const adminResponse = await supabaseFetch(`/rest/v1/admin_users?user_id=eq.${encodeURIComponent(user.id)}&select=user_id&limit=1`, token);
  const admins = await readJson(adminResponse, "Supabase admin lookup");
  if (!adminResponse.ok || !Array.isArray(admins) || !admins.length) return { error: [403, "PlayNice admin access required."] };
  return { token, user };
}

const stable = (value) => {
  const normalize = (item) => {
    if (Array.isArray(item)) return item.map(normalize);
    if (item && typeof item === "object") return Object.keys(item).sort().reduce((out, key) => {
      if (typeof item[key] !== "undefined") out[key] = normalize(item[key]);
      return out;
    }, {});
    return item;
  };
  return JSON.stringify(normalize(value ?? null));
};

function normalizePayload(value = {}) {
  return {
    shippingPrice: Number(value.shippingPrice),
    freeShippingThreshold: Number(value.freeShippingThreshold),
  };
}

function validatePayload(value) {
  const payload = normalizePayload(value);
  if (!Number.isFinite(payload.shippingPrice) || payload.shippingPrice < 0) throw new Error("Shipping price must be a number greater than or equal to 0.");
  if (!Number.isFinite(payload.freeShippingThreshold) || payload.freeShippingThreshold <= 0) throw new Error("Free shipping threshold must be greater than 0.");
  if (payload.freeShippingThreshold <= payload.shippingPrice) throw new Error("Free shipping threshold must be greater than the shipping price.");
  return payload;
}

function parseNumber(source, regex, label) {
  const match = regex.exec(source);
  if (!match) throw new Error(`${label} was not found.`);
  const value = Number(match[1]);
  if (!Number.isFinite(value)) throw new Error(`${label} is not a valid number.`);
  return value;
}

function parseLive(appSource, checkoutSource, translationsSource) {
  const appShipping = parseNumber(appSource, /const\s+SHIPPING_COST\s*=\s*([0-9.]+)\s*;/, "Storefront shipping price");
  const appThreshold = parseNumber(appSource, /const\s+FREE_SHIPPING_THRESHOLD\s*=\s*([0-9.]+)\s*;/, "Storefront free-shipping threshold");
  const checkoutShipping = parseNumber(checkoutSource, /const\s+SHIPPING_PRICE\s*=\s*([0-9.]+)\s*;/, "Checkout shipping price");
  const checkoutThreshold = parseNumber(checkoutSource, /const\s+FREE_SHIPPING_THRESHOLD\s*=\s*([0-9.]+)\s*;/, "Checkout free-shipping threshold");

  if (appShipping !== checkoutShipping || appThreshold !== checkoutThreshold) {
    throw new Error("COMMERCE DRIFT: storefront and checkout shipping values do not match.");
  }

  const thresholdText = Number.isInteger(appThreshold) ? String(appThreshold) : String(appThreshold);
  const enPhrase = `Free shipping over €${thresholdText}`;
  const srPhrase = `Besplatna dostava preko ${thresholdText}€`;
  if (!translationsSource.includes(enPhrase) || !translationsSource.includes(srPhrase)) {
    throw new Error("COMMERCE DRIFT: shipping translation copy does not match the live threshold.");
  }

  return { shippingPrice: appShipping, freeShippingThreshold: appThreshold };
}

function decodeFile(file) {
  return Buffer.from(file.content, "base64").toString("utf8");
}

async function readMainSources() {
  const entries = await Promise.all(ALLOWED_FILES.map(async (path) => {
    const file = await github(`/repos/${OWNER}/${REPO}/contents/${path}?ref=main`);
    return [path, { ...file, source: decodeFile(file) }];
  }));
  return Object.fromEntries(entries);
}

function replaceOne(source, regex, replacement, label) {
  const matches = source.match(new RegExp(regex.source, regex.flags.includes("g") ? regex.flags : `${regex.flags}g`)) || [];
  if (matches.length !== 1) throw new Error(`${label} expected exactly one match, found ${matches.length}.`);
  return source.replace(regex, replacement);
}

function patchApp(source, before, after) {
  let next = source;
  next = replaceOne(next, /const\s+SHIPPING_COST\s*=\s*[0-9.]+\s*;/, `const SHIPPING_COST = ${after.shippingPrice};`, "Storefront shipping constant");
  next = replaceOne(next, /const\s+FREE_SHIPPING_THRESHOLD\s*=\s*[0-9.]+\s*;/, `const FREE_SHIPPING_THRESHOLD = ${after.freeShippingThreshold};`, "Storefront threshold constant");
  next = replaceOne(
    next,
    /(shippingRate\s*:\s*\{[\s\S]*?"@type"\s*:\s*"MonetaryAmount"\s*,\s*value\s*:\s*)[0-9.]+(\s*,\s*currency\s*:\s*"EUR")/,
    `$1${after.shippingPrice}$2`,
    "SEO shipping rate",
  );
  return next;
}

function patchCheckout(source, after) {
  let next = source;
  next = replaceOne(next, /const\s+SHIPPING_PRICE\s*=\s*[0-9.]+\s*;/, `const SHIPPING_PRICE = ${after.shippingPrice};`, "Checkout shipping constant");
  next = replaceOne(next, /const\s+FREE_SHIPPING_THRESHOLD\s*=\s*[0-9.]+\s*;/, `const FREE_SHIPPING_THRESHOLD = ${after.freeShippingThreshold};`, "Checkout threshold constant");
  return next;
}

function patchTranslations(source, before, after) {
  if (before.freeShippingThreshold === after.freeShippingThreshold) return source;
  const beforeText = Number.isInteger(before.freeShippingThreshold) ? String(before.freeShippingThreshold) : String(before.freeShippingThreshold);
  const afterText = Number.isInteger(after.freeShippingThreshold) ? String(after.freeShippingThreshold) : String(after.freeShippingThreshold);
  const oldEn = `Free shipping over €${beforeText}`;
  const newEn = `Free shipping over €${afterText}`;
  const oldSr = `Besplatna dostava preko ${beforeText}€`;
  const newSr = `Besplatna dostava preko ${afterText}€`;
  if (!source.includes(oldEn) || !source.includes(oldSr)) throw new Error("Expected live free-shipping translation copy was not found.");
  const next = source.split(oldEn).join(newEn).split(oldSr).join(newSr);
  if (next.includes(oldEn) || next.includes(oldSr)) throw new Error("Free-shipping translation replacement was incomplete.");
  return next;
}

async function loadDraft(token) {
  const response = await supabaseFetch(`/rest/v1/commerce_drafts?commerce_key=eq.${COMMERCE_KEY}&select=*&limit=1`, token);
  const body = await readJson(response, "Supabase Commerce draft");
  if (!response.ok) throw new Error(body?.message || "Could not read Commerce draft.");
  return body?.[0] || null;
}

async function patchDraft(token, patch) {
  const response = await supabaseFetch(`/rest/v1/commerce_drafts?commerce_key=eq.${COMMERCE_KEY}`, token, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
  const body = await readJson(response, "Supabase Commerce metadata");
  if (!response.ok) throw new Error(body?.message || "Could not update Commerce draft metadata.");
  return body?.[0] || null;
}

async function actionReadLive(res) {
  const files = await readMainSources();
  const live = parseLive(files[PATHS.app].source, files[PATHS.checkout].source, files[PATHS.translations].source);
  return json(res, 200, { ok: true, live });
}

async function actionPrepare(token, user, res) {
  const draft = await loadDraft(token);
  if (!draft) return json(res, 404, { error: "Commerce shipping draft not found." });
  if (draft.review_status !== "approved" || !draft.approved_payload) return json(res, 409, { error: "Commerce draft must be APPROVED first." });
  if (stable(draft.payload) !== stable(draft.approved_payload)) return json(res, 409, { error: "Approved Commerce payload no longer matches the current draft." });

  const approved = validatePayload(draft.approved_payload);
  const files = await readMainSources();
  const live = parseLive(files[PATHS.app].source, files[PATHS.checkout].source, files[PATHS.translations].source);
  const expectedFiles = [PATHS.app, PATHS.checkout];
  if (approved.freeShippingThreshold !== live.freeShippingThreshold) expectedFiles.push(PATHS.translations);

  const baseline = {
    prepared_from: "main",
    live,
    files: Object.fromEntries(ALLOWED_FILES.map((path) => [path, files[path].sha])),
    expected_files: expectedFiles.sort(),
  };

  await patchDraft(token, {
    baseline_snapshot: baseline,
    prepared_at: new Date().toISOString(),
    prepared_by: user.id,
  });
  return json(res, 200, { ok: true, prepared: true, live, expected_files: baseline.expected_files });
}

async function actionCreateApply(token, user, res) {
  const draft = await loadDraft(token);
  if (!draft) return json(res, 404, { error: "Commerce shipping draft not found." });
  if (draft.review_status !== "approved" || !draft.approved_payload) return json(res, 409, { error: "Commerce draft must be approved before Controlled Apply." });
  if (stable(draft.payload) !== stable(draft.approved_payload)) return json(res, 409, { error: "APPROVAL SAFETY BLOCK: current Commerce draft differs from the approved snapshot." });
  if (!draft.prepared_at || !draft.baseline_snapshot?.files) return json(res, 409, { error: "Commerce draft must be prepared before Controlled Apply." });
  if (draft.apply_branch || draft.apply_pr_number) return json(res, 409, { error: "A Commerce preview branch already exists for this draft." });

  const approved = validatePayload(draft.approved_payload);
  const files = await readMainSources();
  for (const path of ALLOWED_FILES) {
    if (files[path].sha !== draft.baseline_snapshot.files[path]) {
      return json(res, 409, { error: `LIVE DRIFT: ${path} changed after Commerce preparation. Review and prepare again.` });
    }
  }
  const before = parseLive(files[PATHS.app].source, files[PATHS.checkout].source, files[PATHS.translations].source);
  if (stable(before) === stable(approved)) return json(res, 409, { error: "Approved Commerce draft contains no runtime change." });

  const patched = {
    [PATHS.app]: patchApp(files[PATHS.app].source, before, approved),
    [PATHS.checkout]: patchCheckout(files[PATHS.checkout].source, approved),
    [PATHS.translations]: patchTranslations(files[PATHS.translations].source, before, approved),
  };
  const changedPaths = ALLOWED_FILES.filter((path) => patched[path] !== files[path].source).sort();
  const expectedPaths = [...(draft.baseline_snapshot.expected_files || [])].sort();
  if (stable(changedPaths) !== stable(expectedPaths)) {
    return json(res, 409, { error: `SAFETY BLOCK: expected Commerce files ${expectedPaths.join(", ")}, got ${changedPaths.join(", ")}.` });
  }

  const mainRef = await github(`/repos/${OWNER}/${REPO}/git/ref/heads/main`);
  const stamp = new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 12);
  const branch = `cc-commerce-shipping-${stamp}`;
  await github(`/repos/${OWNER}/${REPO}/git/refs`, {
    method: "POST",
    body: JSON.stringify({ ref: `refs/heads/${branch}`, sha: mainRef.object.sha }),
  });

  for (const path of changedPaths) {
    await github(`/repos/${OWNER}/${REPO}/contents/${path}`, {
      method: "PUT",
      body: JSON.stringify({
        message: `Control Center Commerce shipping: ${before.shippingPrice}/${before.freeShippingThreshold} → ${approved.shippingPrice}/${approved.freeShippingThreshold}`,
        content: Buffer.from(patched[path], "utf8").toString("base64"),
        sha: files[path].sha,
        branch,
      }),
    });
  }

  const pr = await github(`/repos/${OWNER}/${REPO}/pulls`, {
    method: "POST",
    body: JSON.stringify({
      title: `Control Center Commerce: shipping €${approved.shippingPrice} / free €${approved.freeShippingThreshold}`,
      head: branch,
      base: "main",
      draft: true,
      body: [
        "Generated by PlayNice Control Center Commerce Controlled Apply v1.",
        "",
        `- Shipping price: €${before.shippingPrice} → €${approved.shippingPrice}`,
        `- Free shipping threshold: €${before.freeShippingThreshold} → €${approved.freeShippingThreshold}`,
        `- Files: ${changedPaths.join(", ")}`,
        "- Safety: approved payload parity checked",
        "- Safety: all prepared file SHAs must still match main",
        "- Safety: storefront, checkout, SEO and bilingual free-shipping copy are patched together",
        "- Safety: no automatic merge",
      ].join("\n"),
    }),
  });

  await patchDraft(token, {
    apply_branch: branch,
    apply_pr_number: pr.number,
    apply_created_at: new Date().toISOString(),
    apply_created_by: user.id,
    preview_verified_at: null,
    preview_verified_by: null,
    merged_at: null,
    merged_by: null,
    merged_commit_sha: null,
  });

  return json(res, 200, { ok: true, created: true, branch, pr_number: pr.number, changed_files: changedPaths });
}

async function actionResolvePreview(token, res) {
  const draft = await loadDraft(token);
  if (!draft?.apply_pr_number || !draft?.apply_branch) return json(res, 409, { error: "Commerce draft PR is missing." });
  const pr = await github(`/repos/${OWNER}/${REPO}/pulls/${draft.apply_pr_number}`);
  if (pr.head?.ref !== draft.apply_branch) return json(res, 409, { error: "Commerce PR branch no longer matches the draft." });

  const deployments = await github(`/repos/${OWNER}/${REPO}/deployments?sha=${encodeURIComponent(pr.head.sha)}&per_page=20`);
  for (const deployment of deployments || []) {
    const statuses = await github(`/repos/${OWNER}/${REPO}/deployments/${deployment.id}/statuses?per_page=20`);
    const ready = (statuses || []).find((status) => status.state === "success" && status.environment_url);
    if (ready?.environment_url) return json(res, 200, { ok: true, preview_url: ready.environment_url, head_sha: pr.head.sha });
  }
  return json(res, 409, { error: "Preview is not ready yet. Wait for the Vercel preview deployment to finish." });
}

async function actionMerge(token, user, res) {
  const draft = await loadDraft(token);
  if (!draft) return json(res, 404, { error: "Commerce shipping draft not found." });
  if (draft.merged_at) return json(res, 409, { error: "Commerce apply is already merged." });
  if (!draft.apply_branch || !draft.apply_pr_number) return json(res, 409, { error: "Commerce draft PR is missing." });
  if (!draft.preview_verified_at) return json(res, 409, { error: "Preview must be verified before merge." });
  if (!draft.baseline_snapshot?.files) return json(res, 409, { error: "Prepared Commerce baseline is missing." });

  const files = await readMainSources();
  for (const path of ALLOWED_FILES) {
    if (files[path].sha !== draft.baseline_snapshot.files[path]) {
      return json(res, 409, { error: `LIVE DRIFT: ${path} changed on main after Commerce preparation. Do not merge this PR.` });
    }
  }

  const pr = await github(`/repos/${OWNER}/${REPO}/pulls/${draft.apply_pr_number}`);
  if (pr.state !== "open") return json(res, 409, { error: "Commerce PR is not open." });
  if (pr.head?.ref !== draft.apply_branch || pr.base?.ref !== "main") return json(res, 409, { error: "Commerce PR branch/base no longer matches the prepared draft." });

  const prFiles = await github(`/repos/${OWNER}/${REPO}/pulls/${draft.apply_pr_number}/files?per_page=100`);
  const actual = (prFiles || []).map((file) => file.filename).sort();
  const expected = [...(draft.baseline_snapshot.expected_files || [])].sort();
  if (stable(actual) !== stable(expected) || actual.some((path) => !ALLOWED_FILES.includes(path))) {
    return json(res, 409, { error: `SAFETY BLOCK: Commerce PR files do not match the prepared contract. Expected ${expected.join(", ")}; got ${actual.join(", ")}.` });
  }

  if (pr.draft) {
    await githubGraphql(
      `mutation($id: ID!) { markPullRequestReadyForReview(input: { pullRequestId: $id }) { pullRequest { id isDraft } } }`,
      { id: pr.node_id },
    );
  }

  const merge = await github(`/repos/${OWNER}/${REPO}/pulls/${draft.apply_pr_number}/merge`, {
    method: "PUT",
    body: JSON.stringify({
      sha: pr.head.sha,
      merge_method: "merge",
      commit_title: `Control Center Commerce shipping (#${draft.apply_pr_number})`,
      commit_message: "Verified in Preview and merged through PlayNice Control Center Commerce Controlled Apply.",
    }),
  });
  if (!merge?.merged || !merge?.sha) throw new Error(merge?.message || "GitHub did not merge the Commerce PR.");

  await patchDraft(token, {
    merged_at: new Date().toISOString(),
    merged_by: user.id,
    merged_commit_sha: merge.sha,
  });
  return json(res, 200, { ok: true, merged: true, pr_number: draft.apply_pr_number, merge_commit_sha: merge.sha });
}

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed." });
  if (!SUPABASE_URL || !SUPABASE_KEY || !GITHUB_TOKEN) return json(res, 500, { error: "Commerce Controlled Apply environment is incomplete." });
  if (String(req.body?.commerce_key || "") !== COMMERCE_KEY) return json(res, 400, { error: "commerce_key must be shipping." });

  try {
    const auth = await authenticate(req);
    if (auth.error) return json(res, auth.error[0], { error: auth.error[1] });
    const action = String(req.body?.commerce_action || "prepare");
    if (action === "read_live") return actionReadLive(res);
    if (action === "create_apply") return actionCreateApply(auth.token, auth.user, res);
    if (action === "resolve_preview") return actionResolvePreview(auth.token, res);
    if (action === "merge_apply") return actionMerge(auth.token, auth.user, res);
    return actionPrepare(auth.token, auth.user, res);
  } catch (error) {
    console.error("Commerce shipping workflow failed", error);
    return json(res, error?.status && error.status < 500 ? error.status : 500, { error: error?.message || "Commerce shipping workflow failed." });
  }
}
