import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { supabase } from "./supabase";
import "./hero-media-upload.css";

const MAX_IMAGE_BYTES = 1_500_000;

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

function inspectImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const result = { width: image.naturalWidth, height: image.naturalHeight, ratio: image.naturalWidth / image.naturalHeight };
      URL.revokeObjectURL(url);
      resolve(result);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read image dimensions."));
    };
    image.src = url;
  });
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || "").split(",")[1] || "");
    reader.onerror = () => reject(reader.error || new Error("Could not read image."));
    reader.readAsDataURL(file);
  });
}

function formatBytes(bytes = 0) {
  if (bytes < 1000) return `${bytes} B`;
  return `${Math.round(bytes / 1000)} KB`;
}

function FileCard({ label, variant, file, info, preview, onPick, path }) {
  const warning = useMemo(() => {
    if (!info) return "";
    if (variant === "mobile") {
      const target = 4 / 3;
      return Math.abs(info.ratio - target) > 0.05 ? `Expected about 4:3; selected ${info.ratio.toFixed(2)}:1.` : "";
    }
    return info.ratio < 1.8 ? `Desktop image looks unusually narrow (${info.ratio.toFixed(2)}:1).` : "";
  }, [info, variant]);

  return <div className={`hero-media-file-card ${file ? "has-file" : ""}`}>
    <div className="hero-media-file-head"><span>{label}</span><code>{path || "—"}</code></div>
    <label className="hero-media-picker">
      <input type="file" accept="image/jpeg,.jpg,.jpeg" onChange={(event) => onPick(event.target.files?.[0] || null)} />
      <strong>{file ? "Replace selected file" : "Choose JPEG"}</strong>
      <small>{file ? `${file.name} · ${formatBytes(file.size)}` : "JPEG only · max 1.5 MB"}</small>
    </label>
    {preview ? <img className={variant === "mobile" ? "mobile" : ""} src={preview} alt="Selected Hero preview" /> : null}
    {info ? <div className="hero-media-meta"><span>{info.width} × {info.height}px</span><span>{info.ratio.toFixed(2)}:1</span></div> : null}
    {warning ? <div className="hero-media-warning">{warning}</div> : null}
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
    setError(""); setResult(null);
  }, [slide?.id]);

  useEffect(() => () => {
    if (desktopPreview) URL.revokeObjectURL(desktopPreview);
    if (mobilePreview) URL.revokeObjectURL(mobilePreview);
  }, [desktopPreview, mobilePreview]);

  const pickFile = async (variant, file) => {
    setError(""); setResult(null);
    const setFile = variant === "desktop" ? setDesktopFile : setMobileFile;
    const setInfo = variant === "desktop" ? setDesktopInfo : setMobileInfo;
    const setPreview = variant === "desktop" ? setDesktopPreview : setMobilePreview;

    if (!file) { setFile(null); setInfo(null); setPreview(""); return; }
    if (!/image\/jpeg/i.test(file.type) && !/\.jpe?g$/i.test(file.name)) {
      setError(`${variant === "desktop" ? "Desktop" : "Mobile"} image must be JPEG.`); return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError(`${variant === "desktop" ? "Desktop" : "Mobile"} image is larger than 1.5 MB.`); return;
    }
    try {
      const info = await inspectImage(file);
      setFile(file); setInfo(info);
      setPreview((current) => {
        if (current) URL.revokeObjectURL(current);
        return URL.createObjectURL(file);
      });
    } catch (inspectError) {
      setError(inspectError.message || String(inspectError));
    }
  };

  const createMediaPreview = async () => {
    if (!slide || (!desktopFile && !mobileFile)) return;
    setBusy(true); setError(""); setResult(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("Admin session expired. Sign in again.");
      const [desktopBase64, mobileBase64] = await Promise.all([
        desktopFile ? fileToBase64(desktopFile) : Promise.resolve(""),
        mobileFile ? fileToBase64(mobileFile) : Promise.resolve(""),
      ]);
      const response = await fetch("/api/create-hero-media-apply", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ hero_key: slide.hero_key, desktop_base64: desktopBase64, mobile_base64: mobileBase64 }),
      });
      const body = await readResponse(response);
      if (!response.ok) throw new Error(body?.error || "Could not create Hero media preview.");
      setResult(body);
    } catch (uploadError) {
      setError(uploadError.message || String(uploadError));
    } finally {
      setBusy(false);
    }
  };

  if (!slot || !slide) return null;

  return createPortal(<section className="hero-media-panel">
    <div className="hero-media-head">
      <div><span>HERO MEDIA</span><strong>UPLOAD / REPLACE</strong></div>
      <small>Images only · action and manifesto stay untouched · draft PR only</small>
    </div>

    <div className="hero-media-grid">
      <FileCard label="DESKTOP" variant="desktop" file={desktopFile} info={desktopInfo} preview={desktopPreview} onPick={(file) => pickFile("desktop", file)} path={slide.desktop_image} />
      <FileCard label="MOBILE · 4:3" variant="mobile" file={mobileFile} info={mobileInfo} preview={mobilePreview} onPick={(file) => pickFile("mobile", file)} path={slide.mobile_image} />
    </div>

    {error ? <div className="hero-media-error">{error}</div> : null}
    {result ? <div className="hero-media-result">
      <div><span>BRANCH</span><code>{result.branch}</code></div>
      <div><span>PR</span><a href={result.pr_url} target="_blank" rel="noreferrer">Open draft PR #{result.pr_number}</a></div>
      <small>{result.files?.length || 0} image file{result.files?.length === 1 ? "" : "s"} staged. Review the Vercel preview before merge.</small>
    </div> : null}

    <div className="hero-media-actions">
      <button className="primary" disabled={busy || (!desktopFile && !mobileFile)} onClick={createMediaPreview}>{busy ? "Uploading & creating preview…" : "Create media preview PR"}</button>
    </div>
  </section>, slot);
}
