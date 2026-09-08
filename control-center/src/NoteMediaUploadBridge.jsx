import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { supabase } from "./supabase";
import "./note-media-upload.css";

const MAX_IMAGE_BYTES = 1_500_000;
const NOTE_MEDIA_SESSION_PREFIX = "playnice:note-media-stage:";
const NOTE_WORKFLOW_UPDATED_EVENT = "playnice:note-workflow-updated";

const sessionKey = (key) => `${NOTE_MEDIA_SESSION_PREFIX}${key}`;

function readStoredStage(key) {
  if (!key) return null;
  try {
    const raw = sessionStorage.getItem(sessionKey(key));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function storeStage(key, stage) {
  if (!key || !stage?.branch || !stage?.baseSha) return;
  try { sessionStorage.setItem(sessionKey(key), JSON.stringify(stage)); }
  catch { /* Supabase becomes persistent source of truth after Save draft. */ }
}

function getVisibleNoteKey() {
  const editor = document.querySelector(".main-stage .note-editor");
  if (editor) {
    const label = [...editor.querySelectorAll(".note-editor-grid label")]
      .find((item) => item.querySelector(":scope > span")?.textContent?.toLowerCase().startsWith("canonical key"));
    const value = label?.querySelector("input")?.value?.trim().toLowerCase();
    if (value) return value;
  }
  return document.querySelector(".main-stage .notes-detail-hero code")?.textContent?.trim().toLowerCase() || "";
}

function ensureSlot(editor) {
  let slot = editor.querySelector(":scope > #note-media-upload-slot");
  if (slot) return slot;
  slot = document.createElement("div");
  slot.id = "note-media-upload-slot";
  const help = editor.querySelector(":scope > .note-editor-help");
  if (help) editor.insertBefore(slot, help);
  else editor.appendChild(slot);
  return slot;
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || "").split(",")[1] || "");
    reader.onerror = () => reject(reader.error || new Error("Could not read image."));
    reader.readAsDataURL(file);
  });
}

function inspectImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const result = { width: image.naturalWidth, height: image.naturalHeight };
      URL.revokeObjectURL(url);
      resolve(result);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read WebP image."));
    };
    image.src = url;
  });
}

export default function NoteMediaUploadBridge() {
  const [slot, setSlot] = useState(null);
  const [noteKey, setNoteKey] = useState("");
  const [file, setFile] = useState(null);
  const [info, setInfo] = useState(null);
  const [preview, setPreview] = useState("");
  const previewRef = useRef("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    const mainStage = document.querySelector(".main-stage");
    if (!mainStage) return;
    let raf = 0;
    const sync = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const editor = mainStage.querySelector(".note-editor");
        const key = getVisibleNoteKey();
        setNoteKey((current) => current === key ? current : key);
        setSlot(editor ? ensureSlot(editor) : null);
      });
    };
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(mainStage, { childList: true, subtree: true, characterData: true, attributes: true });
    const interval = window.setInterval(sync, 300);
    return () => { cancelAnimationFrame(raf); observer.disconnect(); window.clearInterval(interval); };
  }, []);

  useEffect(() => {
    setFile(null); setInfo(null); setError(""); setResult(null);
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    previewRef.current = ""; setPreview("");
  }, [noteKey]);

  useEffect(() => {
    if (!noteKey || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(noteKey)) return;
    let repairing = false;
    const preserve = async (row) => {
      if (!row || row.review_status !== "draft") return;
      const stored = readStoredStage(noteKey);
      if (!stored?.branch || !stored?.baseSha || repairing) return;
      const current = row.payload?.mediaStage;
      if (current?.branch === stored.branch && current?.baseSha === stored.baseSha) return;
      repairing = true;
      try {
        const payload = { ...(row.payload || {}), assetPath: stored.assetPath || `/note-map/${noteKey}.webp`, mediaStage: stored };
        const { error: patchError } = await supabase.from("note_drafts").update({ payload }).eq("note_key", noteKey).eq("review_status", "draft");
        if (patchError) throw patchError;
        window.dispatchEvent(new CustomEvent(NOTE_WORKFLOW_UPDATED_EVENT, { detail: { noteKey, mediaStagePreserved: true } }));
      } catch (patchError) {
        setError(`Staged note asset preservation failed: ${patchError.message || String(patchError)}`);
      } finally {
        repairing = false;
      }
    };

    supabase.from("note_drafts").select("note_key,payload,review_status").eq("note_key", noteKey).maybeSingle().then(({ data }) => preserve(data || null));
    const channel = supabase.channel(`note-media-stage-guard-${noteKey}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "note_drafts", filter: `note_key=eq.${noteKey}` }, (event) => {
        if (event.eventType !== "DELETE") preserve(event.new || null);
      }).subscribe();
    return () => supabase.removeChannel(channel);
  }, [noteKey]);

  useEffect(() => () => { if (previewRef.current) URL.revokeObjectURL(previewRef.current); }, []);

  const pick = async (nextFile) => {
    setError(""); setResult(null);
    if (!nextFile) { setFile(null); setInfo(null); setPreview(""); return; }
    if (nextFile.size > MAX_IMAGE_BYTES) { setError("Note image is larger than 1.5 MB."); return; }
    if (!/image\/webp/i.test(nextFile.type) && !/\.webp$/i.test(nextFile.name)) { setError("Note image must be WebP."); return; }
    try {
      const nextInfo = await inspectImage(nextFile);
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
      const url = URL.createObjectURL(nextFile);
      previewRef.current = url;
      setFile(nextFile); setInfo(nextInfo); setPreview(url);
    } catch (inspectError) { setError(inspectError.message || String(inspectError)); }
  };

  const stage = async () => {
    if (!file || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(noteKey)) return;
    setBusy(true); setError(""); setResult(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("Admin session expired. Sign in again.");
      const stored = readStoredStage(noteKey);
      const response = await fetch("/api/create-note-media-apply", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ note_key: noteKey, asset_base64: await fileToBase64(file), stage_branch: stored?.branch || "", base_sha: stored?.baseSha || "" }),
      });
      const raw = await response.text();
      let body = {};
      try { body = raw ? JSON.parse(raw) : {}; } catch { throw new Error(raw || "Note media upload returned an invalid response."); }
      if (!response.ok) throw new Error(body?.error || "Could not stage note asset.");
      if (!body?.media_stage?.branch || !body?.media_stage?.baseSha) throw new Error("Note asset staged, but staging metadata is incomplete.");
      storeStage(noteKey, body.media_stage);
      setResult(body);
      window.dispatchEvent(new CustomEvent(NOTE_WORKFLOW_UPDATED_EVENT, { detail: { noteKey, mediaStaged: true } }));
    } catch (stageError) { setError(stageError.message || String(stageError)); }
    finally { setBusy(false); }
  };

  if (!slot) return null;
  const validKey = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(noteKey);
  return createPortal(<section className="note-media-upload">
    <div className="note-media-copy"><span>NOTE ASSET</span><strong>{validKey ? `/note-map/${noteKey}.webp` : "Enter canonical key first"}</strong><small>WebP · max 1.5 MB · staged safely before Controlled Apply</small></div>
    <div className="note-media-body">
      <label className="note-media-picker"><input type="file" accept="image/webp,.webp" disabled={!validKey || busy} onChange={(event) => pick(event.target.files?.[0] || null)} /><strong>{file ? "Replace selected WebP" : "Choose WebP"}</strong><small>{file ? `${file.name} · ${Math.round(file.size / 1000)} KB` : "Image is never written to main directly."}</small></label>
      {preview ? <div className="note-media-preview"><img src={preview} alt="Note asset preview" /><span>{info?.width} × {info?.height}px</span></div> : null}
      <button className="primary" disabled={!validKey || !file || busy} onClick={stage}>{busy ? "Staging…" : "Stage asset"}</button>
    </div>
    {result ? <div className="note-media-success">ASSET STAGED · {result.asset_path}</div> : null}
    {error ? <div className="note-media-error">{error}</div> : null}
  </section>, slot);
}
