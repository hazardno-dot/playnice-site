import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { supabase } from "./supabase";
import { IMAGE_OPTIMIZER_PRESETS, blobToBase64, formatImageBytes, optimizeImage } from "./imageOptimizer.mjs";
import "./hero-media-upload.css";

const HERO_WORKFLOW_UPDATED_EVENT = "playnice:hero-workflow-updated";
const MEDIA_STAGE_SESSION_PREFIX = "playnice:hero-media-stage:";
const DESKTOP_PRESET = IMAGE_OPTIMIZER_PRESETS.heroDesktop;
const MOBILE_PRESET = IMAGE_OPTIMIZER_PRESETS.heroMobile;

const mediaStageSessionKey = (heroKey) => `${MEDIA_STAGE_SESSION_PREFIX}${heroKey}`;

function readStoredMediaStage(heroKey) {
  if (!heroKey) return null;
  try {
    const raw = sessionStorage.getItem(mediaStageSessionKey(heroKey));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function storeMediaStage(heroKey, mediaStage) {
  if (!heroKey || !mediaStage?.branch || !mediaStage?.baseSha) return;
  try {
    sessionStorage.setItem(mediaStageSessionKey(heroKey), JSON.stringify(mediaStage));
  } catch {
    // Session storage is only a defensive guard; Supabase remains the source of truth.
  }
}

function clearStoredMediaStage(heroKey) {
  if (!heroKey) return;
  try {
    sessionStorage.removeItem(mediaStageSessionKey(heroKey));
  } catch {
    // Ignore storage cleanup failures.
  }
}

function ensureMediaSlot(detail) {
  let slot = detail.querySelector("#hero-media-upload-slot");
  if (!slot) {
    slot = document.createElement("div");
    slot.id = "hero-media-upload-slot";
    const workflow = detail.querySelector("#hero-workflow-slot");
    if (workflow) detail.insertBefore(slot, workflow);
    else detail.appendChild(slot);
  }
  return slot;
}

function readResponse(response) {
  return response.text().then((text) => {
    try {
      return text ? JSON.parse(text) : null;
    } catch {
      throw new Error(`Server returned ${response.status}: ${text || response.statusText}`);
    }
  });
}

function FileCard({ label, variant, file, info, preview, onPick, path, optimizing }) {
  const preset = variant === "desktop" ? DESKTOP_PRESET : MOBILE_PRESET;
  const ratio = preset.width / preset.height;
  return <div className={`hero-media-file-card ${file ? "has-file" : ""}`}>
    <div className="hero-media-file-head"><span>{label}</span><code>{path || "—"}</code></div>
    <label className="hero-media-picker">
      <input type="file" accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp" disabled={optimizing} onChange={(event) => onPick(event.target.files?.[0] || null)} />
      <strong>{optimizing ? "Optimizing…" : file ? "Replace source image" : "Choose JPG / PNG / WebP"}</strong>
      <small>{file && info
        ? `${info.originalWidth} × ${info.originalHeight}px · ${formatImageBytes(info.originalBytes)} → ${info.width} × ${info.height}px · ${formatImageBytes(info.bytes)}`
        : `Required composition ${ratio.toFixed(2)}:1 · output ${preset.width} × ${preset.height} JPEG · no automatic crop`}</small>
    </label>
    {preview ? <img className={variant === "mobile" ? "mobile" : ""} src={preview} alt={`Optimized ${label} Hero preview`} /> : null}
    {info ? <div className="hero-media-meta"><span>{info.width} × {info.height}px · {formatImageBytes(info.bytes)}</span><span>JPEG · {ratio.toFixed(2)}:1</span></div> : null}
  </div>;
}

export default function HeroMediaUploadBridge() {
  const [slot, setSlot] = useState(null);
  const [slide, setSlide] = useState(null);
  const [desktopFile, setDesktopFile] = useState(null);
  const [mobileFile, setMobileFile] = useState(null);
  const [desktopInfo, setDesktopInfo] = useState(null);
  const [mobileInfo, setMobileInfo] = useState(null);
  const [desktopPreview, setDesktopPreview] = useState("");
  const [mobilePreview, setMobilePreview] = useState("");
  const desktopPreviewRef = useRef("");
  const mobilePreviewRef = useRef("");
  const [busy, setBusy] = useState(false);
  const [optimizingVariant, setOptimizingVariant] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    const mainStage = document.querySelector(".main-stage");
    if (!mainStage) return;
    let raf = 0;

    const sync = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const heading = mainStage.querySelector(".topbar h1");
        const detail = mainStage.querySelector(".hero-manager-detail");
        const active = mainStage.querySelector(".hero-slide-row.is-active");
        if (heading?.textContent?.trim() !== "Hero" || !detail || !active) {
          setSlot(null);
          setSlide(null);
          return;
        }
        setSlot(ensureMediaSlot(detail));
        const id = Number(active.textContent?.match(/#(\d+)/)?.[1]);
        if (!id) return;
        supabase.from("hero_slides")
          .select("id,hero_key,desktop_image,mobile_image,alt")
          .eq("id", id)
          .maybeSingle()
          .then(({ data, error: loadError }) => {
            if (loadError) { setError(loadError.message || String(loadError)); return; }
            setSlide((current) => current?.id === data?.id ? current : data || null);
          });
      });
    };

    sync();
    const observer = new MutationObserver(sync);
    observer.observe(mainStage, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ["class"] });
    return () => { cancelAnimationFrame(raf); observer.disconnect(); };
  }, []);

  useEffect(() => {
    setDesktopFile(null); setMobileFile(null); setDesktopInfo(null); setMobileInfo(null);
    if (desktopPreviewRef.current) URL.revokeObjectURL(desktopPreviewRef.current);
    if (mobilePreviewRef.current) URL.revokeObjectURL(mobilePreviewRef.current);
    desktopPreviewRef.current = "";
    mobilePreviewRef.current = "";
    setDesktopPreview(""); setMobilePreview("");
    setError(""); setResult(null); setOptimizingVariant("");
  }, [slide?.id]);

  useEffect(() => {
    if (!slide?.hero_key) return;
    let repairing = false;

    const preserveMediaStage = async (row) => {
      if (!row) {
        clearStoredMediaStage(slide.hero_key);
        return;
      }
      if (row.review_status !== "draft") {
        clearStoredMediaStage(slide.hero_key);
        return;
      }
      const stored = readStoredMediaStage(slide.hero_key);
      if (!stored?.branch || !stored?.baseSha || row.payload?.mediaStage || repairing) return;
      repairing = true;
      try {
        const { error: repairError } = await supabase
          .from("hero_drafts")
          .update({ payload: { ...(row.payload || {}), mediaStage: stored } })
          .eq("hero_key", slide.hero_key)
          .eq("review_status", "draft");
        if (repairError) throw repairError;
        window.dispatchEvent(new CustomEvent(HERO_WORKFLOW_UPDATED_EVENT, { detail: { heroKey: slide.hero_key, mediaStagePreserved: true } }));
      } catch (repairError) {
        setError(`Staged media preservation failed: ${repairError.message || String(repairError)}`);
      } finally {
        repairing = false;
      }
    };

    supabase.from("hero_drafts")
      .select("hero_key,payload,review_status")
      .eq("hero_key", slide.hero_key)
      .maybeSingle()
      .then(({ data }) => preserveMediaStage(data || null));

    const channel = supabase.channel(`hero-media-stage-guard-${slide.hero_key}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "hero_drafts", filter: `hero_key=eq.${slide.hero_key}` }, (event) => {
        preserveMediaStage(event.eventType === "DELETE" ? null : event.new || null);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [slide?.hero_key]);

  useEffect(() => () => {
    if (desktopPreviewRef.current) URL.revokeObjectURL(desktopPreviewRef.current);
    if (mobilePreviewRef.current) URL.revokeObjectURL(mobilePreviewRef.current);
  }, []);

  const pickFile = async (variant, sourceFile) => {
    setError(""); setResult(null);
    const isDesktop = variant === "desktop";
    const setFile = isDesktop ? setDesktopFile : setMobileFile;
    const setInfo = isDesktop ? setDesktopInfo : setMobileInfo;
    const setPreview = isDesktop ? setDesktopPreview : setMobilePreview;
    const previewRef = isDesktop ? desktopPreviewRef : mobilePreviewRef;
    const preset = isDesktop ? DESKTOP_PRESET : MOBILE_PRESET;

    if (!sourceFile) {
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
      previewRef.current = "";
      setFile(null); setInfo(null); setPreview(""); return;
    }

    setOptimizingVariant(variant);
    try {
      const optimized = await optimizeImage(sourceFile, preset);
      const outputFile = new File([optimized.blob], `${slide?.hero_key || "hero"}-${variant}.jpg`, { type: "image/jpeg", lastModified: Date.now() });
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
      const nextPreview = URL.createObjectURL(optimized.blob);
      previewRef.current = nextPreview;
      setFile(outputFile);
      setInfo({
        width: optimized.width,
        height: optimized.height,
        bytes: optimized.blob.size,
        originalWidth: optimized.originalWidth,
        originalHeight: optimized.originalHeight,
        originalBytes: optimized.originalBytes,
      });
      setPreview(nextPreview);
    } catch (optimizeError) {
      setFile(null); setInfo(null); setPreview("");
      setError(`${isDesktop ? "Desktop" : "Mobile"}: ${optimizeError.message || String(optimizeError)}`);
    } finally {
      setOptimizingVariant("");
    }
  };

  const stageMedia = async () => {
    if (!slide || (!desktopFile && !mobileFile)) return;
    setBusy(true); setError(""); setResult(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("Admin session expired. Sign in again.");

      const [desktopBase64, mobileBase64] = await Promise.all([
        desktopFile ? blobToBase64(desktopFile) : Promise.resolve(""),
        mobileFile ? blobToBase64(mobileFile) : Promise.resolve(""),
      ]);
      const response = await fetch("/api/create-hero-media-apply", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ hero_key: slide.hero_key, desktop_base64: desktopBase64, mobile_base64: mobileBase64 }),
      });
      const body = await readResponse(response);
      if (!response.ok) throw new Error(body?.error || "Could not stage Hero media.");

      const { data: stagedDraft, error: stagedDraftError } = await supabase
        .from("hero_drafts")
        .select("payload")
        .eq("hero_key", slide.hero_key)
        .maybeSingle();
      if (stagedDraftError) throw stagedDraftError;
      if (!stagedDraft?.payload?.mediaStage) throw new Error("Media staged, but staging metadata could not be re-read from Supabase.");
      storeMediaStage(slide.hero_key, stagedDraft.payload.mediaStage);

      setResult(body);
      window.dispatchEvent(new CustomEvent(HERO_WORKFLOW_UPDATED_EVENT, { detail: { heroKey: slide.hero_key, mediaStaged: true } }));
    } catch (uploadError) {
      setError(uploadError.message || String(uploadError));
    } finally {
      setBusy(false);
    }
  };

  if (!slot || !slide) return null;

  return createPortal(<section className="hero-media-panel">
    <div className="hero-media-head">
      <div><span>HERO MEDIA</span><strong>AUTO-OPTIMIZE / STAGE</strong></div>
      <small>Upload JPG, PNG or WebP · Control Center creates canonical JPEG dimensions · Hero composition is never auto-cropped</small>
    </div>

    <div className="hero-media-grid">
      <FileCard label="DESKTOP · 1920 × 700" variant="desktop" file={desktopFile} info={desktopInfo} preview={desktopPreview} optimizing={optimizingVariant === "desktop"} onPick={(file) => pickFile("desktop", file)} path={slide.desktop_image} />
      <FileCard label="MOBILE · 1200 × 900 · 4:3" variant="mobile" file={mobileFile} info={mobileInfo} preview={mobilePreview} optimizing={optimizingVariant === "mobile"} onPick={(file) => pickFile("mobile", file)} path={slide.mobile_image} />
    </div>

    {error ? <div className="hero-media-error">{error}</div> : null}
    {result ? <div className="hero-media-result">
      <div><span>MEDIA STAGED</span><code>{result.stage_branch}</code></div>
      <small>{result.files?.length || 0} image file{result.files?.length === 1 ? "" : "s"} staged. No PR yet — continue with Edit, Review and Approve. Controlled Apply will create the single final PR.</small>
    </div> : null}

    <div className="hero-media-actions">
      <button className="primary" disabled={busy || Boolean(optimizingVariant) || (!desktopFile && !mobileFile)} onClick={stageMedia}>{busy ? "Staging media…" : "Stage optimized Hero media"}</button>
    </div>
  </section>, slot);
}
