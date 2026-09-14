import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { supabase } from "./supabase";
import { IMAGE_OPTIMIZER_PRESETS, formatImageBytes, optimizeImage } from "./imageOptimizer.mjs";
import "./product-media-upload.css";
import "./product-media-replace.css";

const PRODUCT_SOURCE_ACCEPT = "image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp";
const SHOP_PRESET = IMAGE_OPTIMIZER_PRESETS.productShop;
const JUST_IN_PRESET = IMAGE_OPTIMIZER_PRESETS.productJustIn;

function readResponse(response) {
  return response.text().then((text) => {
    try {
      return text ? JSON.parse(text) : null;
    } catch {
      throw new Error(`Server returned ${response.status}: ${text || response.statusText}`);
    }
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

function getSelectedSlug() {
  const slugNode = document.querySelector(".detail-panel .product-detail .slug");
  return String(slugNode?.textContent || "").split(" · ")[0].trim();
}

function getEditorImagePath() {
  const editor = document.querySelector(".product-detail.edit-mode");
  if (!editor) return "";
  const field = [...editor.querySelectorAll(".edit-field")].find((item) =>
    item.querySelector(":scope > span")?.textContent?.trim() === "Image path"
  );
  return String(field?.querySelector("input, textarea")?.value || "").trim();
}

function thumbPathFromShopPath(shopPath) {
  const filename = String(shopPath || "").split("/").pop()?.replace(/\.png$/i, ".webp") || "";
  return filename ? `/products/thumbs/${filename}` : "";
}

function ensureSlot(editor) {
  let slot = editor.querySelector(":scope > #product-media-replace-slot");
  if (!slot) {
    slot = document.createElement("div");
    slot.id = "product-media-replace-slot";
    const mediaStatus = editor.querySelector(":scope > #product-media-status-slot");
    const mediaUpload = editor.querySelector(":scope > #product-media-upload-slot");
    if (mediaStatus) mediaStatus.insertAdjacentElement("afterend", slot);
    else if (mediaUpload) mediaUpload.insertAdjacentElement("afterend", slot);
    else editor.prepend(slot);
  }
  return slot;
}

function ReplaceCard({ label, path, file, info, preview, optimizing, onPick, contract }) {
  return <div className={`product-media-card product-media-replace-card ${file ? "has-file" : ""}`}>
    <div className="product-media-card-head"><span>{label}</span><code>{path || "No existing path"}</code></div>
    <label className="product-media-picker">
      <input type="file" accept={PRODUCT_SOURCE_ACCEPT} disabled={optimizing} onChange={(event) => onPick(event.target.files?.[0] || null)} />
      <strong>{optimizing ? "Optimizing…" : file ? "Choose another image" : "Choose replacement"}</strong>
      <small>{file && info
        ? `${info.originalWidth} × ${info.originalHeight}px · ${formatImageBytes(info.originalBytes)} → ${info.width} × ${info.height}px · ${formatImageBytes(info.bytes)}`
        : contract}</small>
    </label>
    {preview ? <img src={preview} alt={`${label} replacement preview`} /> : null}
  </div>;
}

export default function ProductMediaReplaceBridge() {
  const [slot, setSlot] = useState(null);
  const [slug, setSlug] = useState("");
  const [shopPath, setShopPath] = useState("");
  const [open, setOpen] = useState(false);
  const [shopFile, setShopFile] = useState(null);
  const [justInFile, setJustInFile] = useState(null);
  const [shopInfo, setShopInfo] = useState(null);
  const [justInInfo, setJustInInfo] = useState(null);
  const [shopPreview, setShopPreview] = useState("");
  const [justInPreview, setJustInPreview] = useState("");
  const shopPreviewRef = useRef("");
  const justInPreviewRef = useRef("");
  const [optimizing, setOptimizing] = useState("");
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
        const editor = mainStage.querySelector(".product-detail.edit-mode");
        const nextSlug = getSelectedSlug();
        if (!editor || !nextSlug) {
          setSlot(null);
          setSlug("");
          setShopPath("");
          return;
        }
        setSlot(ensureSlot(editor));
        setSlug((current) => current === nextSlug ? current : nextSlug);
        setShopPath(getEditorImagePath());
      });
    };
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(mainStage, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ["value"] });
    mainStage.addEventListener("input", sync, true);
    mainStage.addEventListener("change", sync, true);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      mainStage.removeEventListener("input", sync, true);
      mainStage.removeEventListener("change", sync, true);
    };
  }, []);

  useEffect(() => {
    setOpen(false);
    setShopFile(null); setJustInFile(null); setShopInfo(null); setJustInInfo(null);
    if (shopPreviewRef.current) URL.revokeObjectURL(shopPreviewRef.current);
    if (justInPreviewRef.current) URL.revokeObjectURL(justInPreviewRef.current);
    shopPreviewRef.current = ""; justInPreviewRef.current = "";
    setShopPreview(""); setJustInPreview("");
    setError(""); setResult(null); setOptimizing("");
  }, [slug]);

  useEffect(() => () => {
    if (shopPreviewRef.current) URL.revokeObjectURL(shopPreviewRef.current);
    if (justInPreviewRef.current) URL.revokeObjectURL(justInPreviewRef.current);
  }, []);

  const pick = async (variant, sourceFile) => {
    setError(""); setResult(null);
    const isShop = variant === "shop";
    const setFile = isShop ? setShopFile : setJustInFile;
    const setInfo = isShop ? setShopInfo : setJustInInfo;
    const setPreview = isShop ? setShopPreview : setJustInPreview;
    const previewRef = isShop ? shopPreviewRef : justInPreviewRef;
    if (!sourceFile) {
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
      previewRef.current = "";
      setFile(null); setInfo(null); setPreview("");
      return;
    }

    setOptimizing(variant);
    try {
      const preset = isShop ? SHOP_PRESET : JUST_IN_PRESET;
      const optimized = await optimizeImage(sourceFile, preset);
      const extension = isShop ? "png" : "webp";
      const outputType = isShop ? "image/png" : "image/webp";
      const optimizedFile = new File([optimized.blob], `replacement.${extension}`, { type: outputType, lastModified: Date.now() });
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
      const nextPreview = URL.createObjectURL(optimized.blob);
      previewRef.current = nextPreview;
      setFile(optimizedFile);
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
      setError(`${isShop ? "Shop" : "Just In"} optimization failed: ${optimizeError.message || String(optimizeError)}`);
    } finally {
      setOptimizing("");
    }
  };

  const replaceMedia = async () => {
    if (!slug || !shopPath || !shopFile || !justInFile) return;
    setBusy(true); setError(""); setResult(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("Admin session expired. Sign in again.");
      const [shopBase64, justInBase64] = await Promise.all([fileToBase64(shopFile), fileToBase64(justInFile)]);
      const response = await fetch("/api/replace-product-media", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({
          product_slug: slug,
          existing_shop_path: shopPath,
          shop_base64: shopBase64,
          just_in_base64: justInBase64,
        }),
      });
      const body = await readResponse(response);
      if (!response.ok) throw new Error(body?.error || "Could not replace Product media.");
      setResult(body);
    } catch (replaceError) {
      setError(replaceError.message || String(replaceError));
    } finally {
      setBusy(false);
    }
  };

  if (!slot || !slug) return null;
  const justInPath = thumbPathFromShopPath(shopPath);
  const validExistingPath = /^\/products\/[a-z0-9][a-z0-9._-]*\.png$/i.test(shopPath) && !shopPath.includes("/thumbs/");

  return createPortal(<section className={`product-media-replace-panel ${open ? "is-open" : ""}`}>
    <div className="product-media-replace-summary">
      <div>
        <span>EXISTING MEDIA</span>
        <strong>Replace images · keep paths</strong>
        <small>Overwrites the current Shop + Just In assets in a media-only draft PR. Product data and Image Path stay unchanged.</small>
      </div>
      <button type="button" className="secondary" onClick={() => setOpen((value) => !value)}>{open ? "Close" : "Replace existing media"}</button>
    </div>

    {open ? <>
      <div className="product-media-replace-paths">
        <div><span>SHOP PATH</span><code>{shopPath || "Not available"}</code></div>
        <div><span>JUST IN PATH</span><code>{justInPath || "Not available"}</code></div>
      </div>
      {!validExistingPath ? <div className="product-media-error">This product does not currently have a replaceable /products/*.png Image Path. No files will be changed.</div> : null}
      <div className="product-media-grid">
        <ReplaceCard
          label="SHOP · 600 × 600"
          path={shopPath}
          file={shopFile}
          info={shopInfo}
          preview={shopPreview}
          optimizing={optimizing === "shop"}
          onPick={(file) => pick("shop", file)}
          contract={`JPG / PNG / WebP → 600 × 600 PNG · same filename · target ≤ ${formatImageBytes(SHOP_PRESET.maxBytes)}`}
        />
        <ReplaceCard
          label="JUST IN · 320 × 320"
          path={justInPath}
          file={justInFile}
          info={justInInfo}
          preview={justInPreview}
          optimizing={optimizing === "just-in"}
          onPick={(file) => pick("just-in", file)}
          contract={`JPG / PNG / WebP → 320 × 320 WebP · same basename · target ≤ ${formatImageBytes(JUST_IN_PRESET.maxBytes)}`}
        />
      </div>
      {error ? <div className="product-media-error">{error}</div> : null}
      {result ? <div className="product-media-replace-result">
        <div><span>REPLACEMENT PREVIEW CREATED</span><strong>Product data unchanged</strong></div>
        <small>{result.shop_path} + {result.just_in_path}</small>
        {result.pr_url ? <a href={result.pr_url} target="_blank" rel="noreferrer">Open draft PR #{result.pr_number} ↗</a> : null}
      </div> : null}
      <div className="product-media-actions">
        <button type="button" className="primary" disabled={busy || Boolean(optimizing) || !validExistingPath || !shopFile || !justInFile} onClick={replaceMedia}>
          {busy ? "Creating replacement preview…" : "Create replacement preview"}
        </button>
      </div>
    </> : null}
  </section>, slot);
}
