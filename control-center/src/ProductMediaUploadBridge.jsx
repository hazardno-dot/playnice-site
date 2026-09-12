import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { supabase } from "./supabase";
import { IMAGE_OPTIMIZER_PRESETS, formatImageBytes, optimizeImage } from "./imageOptimizer.mjs";
import "./product-media-upload.css";

const PRODUCT_WORKFLOW_UPDATED_EVENT = "playnice:product-workflow-updated";
const MEDIA_STAGE_SESSION_PREFIX = "playnice:product-media-stage:";
const PRODUCT_SOURCE_ACCEPT = "image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp";
const SHOP_PRESET = IMAGE_OPTIMIZER_PRESETS.productShop;
const JUST_IN_PRESET = IMAGE_OPTIMIZER_PRESETS.productJustIn;

const mediaStageSessionKey = (slug) => `${MEDIA_STAGE_SESSION_PREFIX}${slug}`;

function readStoredMediaStage(slug) {
  if (!slug) return null;
  try {
    const raw = sessionStorage.getItem(mediaStageSessionKey(slug));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function storeMediaStage(slug, mediaStage) {
  if (!slug || !mediaStage?.branch || !mediaStage?.baseSha) return;
  try {
    sessionStorage.setItem(mediaStageSessionKey(slug), JSON.stringify(mediaStage));
  } catch {
    // Supabase remains the persistent source of truth once a draft exists.
  }
}

function clearStoredMediaStage(slug) {
  if (!slug) return;
  try {
    sessionStorage.removeItem(mediaStageSessionKey(slug));
  } catch {
    // Ignore defensive session cleanup failures.
  }
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

function setNativeValue(element, value) {
  if (!element) return;
  const proto = element instanceof HTMLTextAreaElement
    ? window.HTMLTextAreaElement.prototype
    : element instanceof HTMLSelectElement
      ? window.HTMLSelectElement.prototype
      : window.HTMLInputElement.prototype;
  const descriptor = Object.getOwnPropertyDescriptor(proto, "value");
  descriptor?.set?.call(element, String(value ?? ""));
  element.dispatchEvent(new Event("input", { bubbles: true }));
  element.dispatchEvent(new Event("change", { bubbles: true }));
}

function setEditorImagePath(path) {
  const editor = document.querySelector(".product-detail.edit-mode");
  if (!editor) return;
  const field = [...editor.querySelectorAll(".edit-field")].find((item) =>
    item.querySelector(":scope > span")?.textContent?.trim() === "Image path"
  );
  const control = field?.querySelector("input, textarea");
  if (control) setNativeValue(control, path);
}

function ensureSlot(editor) {
  let slot = editor.querySelector(":scope > #product-media-upload-slot");
  const bulk = editor.querySelector(":scope > #product-bulk-paste-slot");
  const status = editor.querySelector(":scope > #product-media-status-slot");
  if (!slot) {
    slot = document.createElement("div");
    slot.id = "product-media-upload-slot";
    const warning = editor.querySelector(":scope > .draft-warning");
    if (status) editor.insertBefore(slot, status);
    else if (bulk) editor.insertBefore(slot, bulk);
    else if (warning) warning.insertAdjacentElement("afterend", slot);
    else editor.prepend(slot);
  } else if (bulk) {
    const validOrder = slot.nextElementSibling === bulk ||
      (status && slot.nextElementSibling === status && status.nextElementSibling === bulk);
    if (!validOrder) editor.insertBefore(slot, status || bulk);
  }
  return slot;
}

function MediaCard({ label, outputLabel, file, info, preview, contract, path, optimizing, onPick }) {
  return <div className={`product-media-card ${file ? "has-file" : ""}`}>
    <div className="product-media-card-head"><span>{label}</span><code>{path}</code></div>
    <label className="product-media-picker">
      <input type="file" accept={PRODUCT_SOURCE_ACCEPT} disabled={optimizing} onChange={(event) => onPick(event.target.files?.[0] || null)} />
      <strong>{optimizing ? "Optimizing…" : file ? "Replace source image" : "Choose image"}</strong>
      <small>{file && info
        ? `${info.originalWidth} × ${info.originalHeight}px · ${formatImageBytes(info.originalBytes)} → ${info.width} × ${info.height}px · ${formatImageBytes(info.bytes)}`
        : contract}</small>
    </label>
    {preview ? <img src={preview} alt={`${label} product preview`} /> : null}
    {info ? <div className="product-media-meta"><span>{info.width} × {info.height}px · {formatImageBytes(info.bytes)}</span><span>{outputLabel}</span></div> : null}
  </div>;
}

export default function ProductMediaUploadBridge() {
  const [slot, setSlot] = useState(null);
  const [slug, setSlug] = useState("");
  const [shopFile, setShopFile] = useState(null);
  const [justInFile, setJustInFile] = useState(null);
  const [shopInfo, setShopInfo] = useState(null);
  const [justInInfo, setJustInInfo] = useState(null);
  const [shopPreview, setShopPreview] = useState("");
  const [justInPreview, setJustInPreview] = useState("");
  const shopPreviewRef = useRef("");
  const justInPreviewRef = useRef("");
  const attachInFlightRef = useRef(new Set());
  const [busy, setBusy] = useState(false);
  const [optimizing, setOptimizing] = useState("");
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
          return;
        }
        setSlot(ensureSlot(editor));
        setSlug((current) => current === nextSlug ? current : nextSlug);
      });
    };
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(mainStage, { childList: true, subtree: true, characterData: true });
    return () => { cancelAnimationFrame(raf); observer.disconnect(); };
  }, []);

  useEffect(() => {
    setShopFile(null); setJustInFile(null); setShopInfo(null); setJustInInfo(null);
    if (shopPreviewRef.current) URL.revokeObjectURL(shopPreviewRef.current);
    if (justInPreviewRef.current) URL.revokeObjectURL(justInPreviewRef.current);
    shopPreviewRef.current = ""; justInPreviewRef.current = "";
    setShopPreview(""); setJustInPreview("");
    setOptimizing(""); setError(""); setResult(null);
  }, [slug]);

  useEffect(() => {
    if (!slug) return;
    let repairing = false;

    const preserveMediaStage = async (row) => {
      if (!row) return;
      if (row.review_status !== "draft") {
        clearStoredMediaStage(slug);
        return;
      }
      const stored = readStoredMediaStage(slug);
      if (!stored?.branch || !stored?.baseSha || repairing) return;
      const current = row.payload?.mediaStage;
      if (current?.branch === stored.branch && current?.baseSha === stored.baseSha) return;
      repairing = true;
      try {
        const payload = {
          ...(row.payload || {}),
          core: { ...(row.payload?.core || {}), image: stored.shopPath || `/products/${slug}.png` },
          mediaStage: stored,
        };
        const { error: repairError } = await supabase
          .from("product_drafts")
          .update({ payload })
          .eq("product_slug", slug)
          .eq("review_status", "draft");
        if (repairError) throw repairError;
        window.dispatchEvent(new CustomEvent(PRODUCT_WORKFLOW_UPDATED_EVENT, { detail: { productSlug: slug, mediaStagePreserved: true } }));
      } catch (repairError) {
        setError(`Staged media preservation failed: ${repairError.message || String(repairError)}`);
      } finally {
        repairing = false;
      }
    };

    supabase.from("product_drafts")
      .select("product_slug,payload,review_status")
      .eq("product_slug", slug)
      .maybeSingle()
      .then(({ data }) => preserveMediaStage(data || null));

    const channel = supabase.channel(`product-media-stage-guard-${slug}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "product_drafts", filter: `product_slug=eq.${slug}` }, (event) => {
        preserveMediaStage(event.eventType === "DELETE" ? null : event.new || null);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [slug]);

  useEffect(() => {
    let cancelled = false;

    const attachIfReady = async (row) => {
      const productSlug = String(row?.product_slug || "").trim();
      const mediaStage = row?.approved_payload?.mediaStage || row?.payload?.mediaStage;
      if (!productSlug || !row?.apply_branch || !row?.apply_pr_number || !mediaStage?.branch) return;
      const key = `${productSlug}:${row.apply_branch}`;
      if (attachInFlightRef.current.has(key)) return;
      attachInFlightRef.current.add(key);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token || cancelled) return;
        const response = await fetch("/api/attach-product-media-to-apply", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
          body: JSON.stringify({ product_slug: productSlug }),
        });
        const body = await readResponse(response);
        if (!response.ok) throw new Error(body?.error || "Could not attach Product media to the preview branch.");
        if (!body?.skipped && !cancelled) {
          window.dispatchEvent(new CustomEvent(PRODUCT_WORKFLOW_UPDATED_EVENT, { detail: { productSlug, mediaAttached: true } }));
        }
      } catch (attachError) {
        if (!cancelled) setError(`Product media apply failed: ${attachError.message || String(attachError)}`);
      } finally {
        attachInFlightRef.current.delete(key);
      }
    };

    supabase.from("product_drafts")
      .select("product_slug,payload,approved_payload,apply_branch,apply_pr_number")
      .not("apply_branch", "is", null)
      .then(({ data }) => (data || []).forEach(attachIfReady));

    const channel = supabase.channel("product-media-final-apply-guard")
      .on("postgres_changes", { event: "*", schema: "public", table: "product_drafts" }, (event) => {
        if (event.eventType !== "DELETE") attachIfReady(event.new || null);
      })
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, []);

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
      setFile(null); setInfo(null); setPreview(""); return;
    }

    setOptimizing(variant);
    try {
      const preset = isShop ? SHOP_PRESET : JUST_IN_PRESET;
      const optimized = await optimizeImage(sourceFile, preset);
      const extension = isShop ? "png" : "webp";
      const outputType = isShop ? "image/png" : "image/webp";
      const optimizedFile = new File([optimized.blob], `${slug || "product"}.${extension}`, { type: outputType, lastModified: Date.now() });

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

  const stageMedia = async () => {
    if (!slug || !shopFile || !justInFile) return;
    setBusy(true); setError(""); setResult(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("Admin session expired. Sign in again.");
      const [shopBase64, justInBase64] = await Promise.all([
        fileToBase64(shopFile),
        fileToBase64(justInFile),
      ]);
      const stored = readStoredMediaStage(slug);
      const response = await fetch("/api/create-product-media-apply", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({
          product_slug: slug,
          shop_base64: shopBase64,
          just_in_base64: justInBase64,
          stage_branch: stored?.branch || "",
          base_sha: stored?.baseSha || "",
        }),
      });
      const body = await readResponse(response);
      if (!response.ok) throw new Error(body?.error || "Could not stage Product media.");
      if (!body?.media_stage?.branch || !body?.media_stage?.baseSha) throw new Error("Product media staged, but staging metadata is incomplete.");
      storeMediaStage(slug, body.media_stage);
      setEditorImagePath(body.shop_path || `/products/${slug}.png`);
      setResult(body);
      window.dispatchEvent(new CustomEvent(PRODUCT_WORKFLOW_UPDATED_EVENT, { detail: { productSlug: slug, mediaStaged: true } }));
    } catch (uploadError) {
      setError(uploadError.message || String(uploadError));
    } finally {
      setBusy(false);
    }
  };

  if (!slot || !slug) return null;
  return createPortal(<section className="product-media-panel">
    <div className="product-media-head">
      <div><span>PRODUCT MEDIA</span><strong>AUTO-OPTIMIZE / STAGE</strong></div>
      <small>Upload JPG, PNG or WebP · Control Center creates the exact Shop and Just In assets · both files required</small>
    </div>
    <div className="product-media-grid">
      <MediaCard
        label="SHOP · 600 × 600"
        outputLabel="PNG · contain"
        file={shopFile}
        info={shopInfo}
        preview={shopPreview}
        contract={`JPG / PNG / WebP → 600 × 600 PNG · contain · transparent padding · target ≤ ${formatImageBytes(SHOP_PRESET.maxBytes)}`}
        path={`/products/${slug}.png`}
        optimizing={optimizing === "shop"}
        onPick={(file) => pick("shop", file)}
      />
      <MediaCard
        label="JUST IN · 320 × 320"
        outputLabel="WebP · contain"
        file={justInFile}
        info={justInInfo}
        preview={justInPreview}
        contract={`JPG / PNG / WebP → 320 × 320 WebP · contain · transparent padding · target ≤ ${formatImageBytes(JUST_IN_PRESET.maxBytes)}`}
        path={`/products/thumbs/${slug}.webp`}
        optimizing={optimizing === "just-in"}
        onPick={(file) => pick("just-in", file)}
      />
    </div>
    {error ? <div className="product-media-error">{error}</div> : null}
    {result ? <div className="product-media-result"><div><span>MEDIA STAGED</span><code>{result.stage_branch || "product draft"}</code></div><small>2 optimized image files staged for {slug}. Continue with Bulk product input, review and Save Draft.</small></div> : null}
    <div className="product-media-actions"><button className="primary" disabled={busy || Boolean(optimizing) || !shopFile || !justInFile} onClick={stageMedia}>{busy ? "Staging media…" : "Stage product media"}</button></div>
  </section>, slot);
}
