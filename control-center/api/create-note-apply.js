import { noteExists, normalizeNotePayload, resolveLiveNote, stableJson, upsertLibraryNote } from "./note-apply-engine.mjs";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO = "hazardno-dot/playnice-site";
const [OWNER, REPO_NAME] = REPO.split("/");
const NOTE_SOURCE_PATH = "src/TheNoteMap.jsx";

const json = (res, status, body) => res.status(status).json(body);

async function supabaseFetch(path, token, options = {}) {
  return fetch(`${SUPABASE_URL}${path}`, {
    ...options,
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${token}`, "Content-Type": "application/json", Prefer: "return=representation", ...(options.headers || {}) },
  });
}

async function github(path, options = {}) {
  const response = await fetch(`https://api.github.com${path}`, {
    ...options,
    headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28", "Content-Type": "application/json", ...(options.headers || {}) },
  });
  const data = response.status === 204 ? null : await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data?.message || `GitHub request failed (${response.status})`);
    error.status = response.status;
    throw error;
  }
  return data;
}

async function githubExists(path) {
  try { await github(path); return true; }
  catch (error) { if (error.status === 404) return false; throw error; }
}

function validateNote(value, key) {
  const note = normalizeNotePayload(value);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(note.key)) throw new Error("Approved note requires a canonical lowercase key.");
  if (note.key !== key) throw new Error("Approved note key does not match note_key.");
  if (!note.srLabel || !note.enLabel) throw new Error("Approved note requires complete SR/EN labels.");
  if (note.assetPath !== `/note-map/${key}.webp`) throw new Error("Approved note asset path is not canonical.");
  return note;
}

async function authenticate(req) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!token) return { error: [401, "Missing admin session."] };
  const userRes = await supabaseFetch("/auth/v1/user", token);
  if (!userRes.ok) return { error: [401, "Invalid admin session."] };
  const user = await userRes.json();
  const adminRes = await supabaseFetch(`/rest/v1/admin_users?user_id=eq.${encodeURIComponent(user.id)}&select=user_id&limit=1`, token);
  const admins = adminRes.ok ? await adminRes.json() : [];
  if (!admins.length) return { error: [403, "This account is not authorized for Notes controlled apply."] };
  return { token, user };
}

async function loadDraft(noteKey, token) {
  const select = "note_key,payload,approved_payload,review_status,baseline_snapshot,prepared_at,apply_branch,apply_pr_number";
  const response = await supabaseFetch(`/rest/v1/note_drafts?note_key=eq.${encodeURIComponent(noteKey)}&select=${select}&limit=1`, token);
  if (!response.ok) throw new Error("Could not load Notes draft.");
  const [draft] = await response.json();
  return draft || null;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });
  if (!SUPABASE_URL || !SUPABASE_KEY) return json(res, 500, { error: "Supabase server configuration is missing." });
  if (!GITHUB_TOKEN) return json(res, 500, { error: "GITHUB_TOKEN is not configured on the Control Center project." });

  try {
    const auth = await authenticate(req);
    if (auth.error) return json(res, auth.error[0], { error: auth.error[1] });
    const { token, user } = auth;
    const noteKey = String(req.body?.note_key || "").trim().toLowerCase();
    const action = String(req.body?.action || "apply");
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(noteKey)) return json(res, 400, { error: "note_key must be a canonical lowercase slug." });

    const draft = await loadDraft(noteKey, token);
    if (!draft) return json(res, 404, { error: "Notes draft not found." });
    if (draft.review_status !== "approved" || !draft.approved_payload) return json(res, 409, { error: "Notes draft must be APPROVED first." });
    if (stableJson(draft.payload) !== stableJson(draft.approved_payload)) return json(res, 409, { error: "Approved payload no longer matches the current Notes draft. Review and approve again." });
    const approved = validateNote(draft.approved_payload, noteKey);

    const assetPath = `/repos/${OWNER}/${REPO_NAME}/contents/public/note-map/${encodeURIComponent(noteKey)}.webp?ref=main`;
    const assetExists = await githubExists(assetPath);
    if (!assetExists) return json(res, 409, { error: `Missing note asset on main: /public/note-map/${noteKey}.webp` });

    if (action === "prepare") {
      if (draft.apply_branch && draft.apply_pr_number) return json(res, 409, { error: "A Notes apply PR already exists for this draft." });
      const file = await github(`/repos/${OWNER}/${REPO_NAME}/contents/${NOTE_SOURCE_PATH}?ref=main`);
      const source = Buffer.from(file.content, "base64").toString("utf8");
      const live = resolveLiveNote(source, noteKey);
      if (live && stableJson(live.payload) === stableJson(approved)) return json(res, 409, { error: "No approved Notes changes remain to apply." });
      const baseline = { mode: live ? "replace" : "insert", note_key: noteKey, source_sha: file.sha, live_payload: live?.payload || null };
      const response = await supabaseFetch(`/rest/v1/note_drafts?note_key=eq.${encodeURIComponent(noteKey)}`, token, {
        method: "PATCH",
        body: JSON.stringify({ baseline_snapshot: baseline, prepared_at: new Date().toISOString(), prepared_by: user.id, apply_branch: null, apply_pr_number: null, apply_created_at: null, apply_created_by: null }),
      });
      if (!response.ok) throw new Error("Could not persist Notes preparation baseline.");
      return json(res, 200, { ok: true, prepared: true, note_key: noteKey, mode: baseline.mode });
    }

    if (action !== "apply") return json(res, 400, { error: "Unsupported Notes apply action." });
    const mode = draft.baseline_snapshot?.mode;
    if (!draft.prepared_at || !["replace", "insert"].includes(mode)) return json(res, 409, { error: "Notes draft must be prepared before Controlled Apply." });
    if (draft.apply_branch && draft.apply_pr_number) return json(res, 200, { ok: true, existing: true, branch: draft.apply_branch, pr_number: draft.apply_pr_number, pr_url: `https://github.com/${REPO}/pull/${draft.apply_pr_number}` });

    const file = await github(`/repos/${OWNER}/${REPO_NAME}/contents/${NOTE_SOURCE_PATH}?ref=main`);
    if (file.sha !== draft.baseline_snapshot.source_sha) return json(res, 409, { error: "LIVE DRIFT: TheNoteMap.jsx changed after Notes preparation. Prepare again." });
    const source = Buffer.from(file.content, "base64").toString("utf8");
    const existsNow = noteExists(source, noteKey);
    if (mode === "insert" && existsNow) return json(res, 409, { error: `LIVE DRIFT: Note ${noteKey} now exists on main.` });
    if (mode === "replace" && !existsNow) return json(res, 409, { error: `LIVE DRIFT: Note ${noteKey} no longer exists on main.` });

    const changed = upsertLibraryNote(source, approved);
    if (changed.source === source) return json(res, 409, { error: "No Notes source change was produced." });

    const mainRef = await github(`/repos/${OWNER}/${REPO_NAME}/git/ref/heads/main`);
    const stamp = new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 12);
    const branch = `cc-note-${noteKey}-${stamp}`;
    await github(`/repos/${OWNER}/${REPO_NAME}/git/refs`, { method: "POST", body: JSON.stringify({ ref: `refs/heads/${branch}`, sha: mainRef.object.sha }) });
    await github(`/repos/${OWNER}/${REPO_NAME}/contents/${NOTE_SOURCE_PATH}`, {
      method: "PUT",
      body: JSON.stringify({ message: `Control Center Notes apply: ${noteKey}`, content: Buffer.from(changed.source, "utf8").toString("base64"), sha: file.sha, branch }),
    });

    const pr = await github(`/repos/${OWNER}/${REPO_NAME}/pulls`, {
      method: "POST",
      body: JSON.stringify({
        title: `Control Center Notes: ${noteKey}`,
        head: branch,
        base: "main",
        draft: true,
        body: [
          "Generated by PlayNice Control Center Notes Controlled Apply v1.",
          "",
          `- Note key: ${noteKey}`,
          `- SR: ${approved.srLabel}`,
          `- EN: ${approved.enLabel}`,
          `- Source: ${NOTE_SOURCE_PATH}`,
          `- Asset verified on main: /public/note-map/${noteKey}.webp`,
          `- Operation: ${mode === "insert" ? "insert new NOTE_LIBRARY entry" : "replace/promote existing note metadata"}`,
          "- Safety: exact TheNoteMap.jsx SHA drift guard",
          "- Safety: approved payload equality guard",
          "- Safety: draft PR only; no automatic merge",
        ].join("\n"),
      }),
    });

    const update = await supabaseFetch(`/rest/v1/note_drafts?note_key=eq.${encodeURIComponent(noteKey)}`, token, {
      method: "PATCH",
      body: JSON.stringify({ apply_branch: branch, apply_pr_number: pr.number, apply_created_at: new Date().toISOString(), apply_created_by: user.id }),
    });
    if (!update.ok) throw new Error("Notes PR was created, but its draft metadata could not be persisted.");
    return json(res, 200, { ok: true, note_key: noteKey, branch, pr_number: pr.number, pr_url: pr.html_url, file: NOTE_SOURCE_PATH, version: "notes-v1" });
  } catch (error) {
    return json(res, 500, { error: error?.message || "Notes Controlled Apply failed." });
  }
}
