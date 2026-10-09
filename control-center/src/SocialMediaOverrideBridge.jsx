import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { supabase } from "./supabase";
import { generateSocialDraft } from "./socialDraft.mjs";
import { IMAGE_OPTIMIZER_PRESETS, formatImageBytes, optimizeImage } from "./imageOptimizer.mjs";
import "./social-media-override.css";

const BUCKET = "social-media";
const ACCEPT = "image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp";
const CHANNELS = [
  { key: "instagram_feed", label: "Instagram Feed", format: "1:1", preset: IMAGE_OPTIMIZER_PRESETS.socialFeed, size: "1080 × 1080" },
  { key: "instagram_story", label: "Instagram Story", format: "9:16", preset: IMAGE_OPTIMIZER_PRESETS.socialStory, size: "1080 × 1920" },
  { key: "facebook", label: "Facebook", format: "4:3", preset: IMAGE_OPTIMIZER_PRESETS.socialFacebook, size: "1200 × 900" },
];

const mediaUrl = (item) => String(item?.src || item?.url || "").trim();

function selectedQueueState() {
  const social = document.querySelector(".social-manager");
  if (!social) return null;
  const activeRow = social.querySelector(".social-list > button.active");
  const eventId = String(activeRow?.dataset?.socialEventId || "").trim();
  return eventId ? { eventId } : null;
}

function socialAsset(event, channel, source) {
  return (Array.isArray(event?.media) ? event.media : [])
    .find((item) => item?.source === source && item?.channel === channel) || null;
}

function sourceOnlyEvent(event) {
  return {
    ...event,
    media: (Array.isArray(event?.media) ? event.media : []).filter((item) => !["social_upload", "social_generated"].includes(String(item?.source || ""))),
  };
}

function approvalFor(event, channel, src) {
  const approval = event?.metadata?.social_media_approval?.[channel];
  return Boolean(approval?.approved) && String(approval?.src || "").trim() === String(src || "").trim();
}

export default function SocialMediaOverrideBridge() {
  const [slot, setSlot] = useState(null);
  const [event, setEvent] = useState(null);
  const [busyChannel, setBusyChannel] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const selectedRef = useRef("");

  const loadSelected = async (force = false) => {
    const queueState = selectedQueueState();
    if (!queueState) {
      selectedRef.current = "";
      setEvent(null);
      return;
    }

    const signature = queueState.eventId;
    if (!force && selectedRef.current === signature) return;
    selectedRef.current = signature;

    const { data, error: loadError } = await supabase
      .from("social_events")
      .select("*")
      .eq("id", queueState.eventId)
      .maybeSingle();
    if (loadError) {
      setError(loadError.message || String(loadError));
      return;
    }

    setEvent(data || null);
  };

  useEffect(() => {
    let observer;
    let raf = 0;
    const sync = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const social = document.querySelector(".social-manager");
        const grid = social?.querySelector(".social-channel-grid");
        if (!social || !grid) {
          selectedRef.current = "";
          setSlot(null);
          setEvent(null);
          return;
        }
        let node = social.querySelector("#social-media-override-slot");
        if (!node) {
          node = document.createElement("div");
          node.id = "social-media-override-slot";
          grid.insertAdjacentElement("afterend", node);
        }
        setSlot(node);
        loadSelected(false);
      });
    };
    sync();
    observer = new MutationObserver(sync);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ["class"] });
    return () => { cancelAnimationFrame(raf); observer.disconnect(); };
  }, []);

  useEffect(() => {
    const channel = supabase.channel("social-media-override-bridge")
      .on("postgres_changes", { event: "*", schema: "public", table: "social_events" }, () => loadSelected(true))
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  const immutable = event && event.status !== "draft";
  const carouselActive = Boolean(event?.metadata?.social_carousel);
  const carouselItems = useMemo(() => (Array.isArray(event?.media) ? event.media : [])
    .filter((item) => item?.source === "social_carousel" && item?.channel === "instagram_feed")
    .sort((a, b) => a.carousel_index - b.carousel_index), [event]);
  const carouselUrls = carouselItems.map(mediaUrl);
  const carouselApproved = ["instagram_feed", "facebook"].every((channel) =>
    Boolean(event?.metadata?.social_media_approval?.[channel]?.approved) &&
    JSON.stringify(event.metadata.social_media_approval[channel].carousel_urls || []) === JSON.stringify(carouselUrls));

  const overrides = useMemo(() => Object.fromEntries(CHANNELS.map(({ key }) => [key, socialAsset(event, key, "social_upload")])), [event]);
  const generated = useMemo(() => Object.fromEntries(CHANNELS.map(({ key }) => [key, socialAsset(event, key, "social_generated")])), [event]);
  const sourceDraft = useMemo(() => {
    if (!event) return null;
    try { return generateSocialDraft(sourceOnlyEvent(event)); } catch { return null; }
  }, [event]);

  const sessionToken = async () => {
    const { data: refreshData } = await supabase.auth.refreshSession().catch(() => ({ data: null }));
    if (refreshData?.session?.access_token) return refreshData.session.access_token;
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;
    if (sessionError || !token) throw sessionError || new Error("Authenticated admin session is required.");
    return token;
  };

  const callMediaEventApi = async (body) => {
    const token = await sessionToken();
    const response = await fetch("/api/social-media-event", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || `Social media event update failed (${response.status}).`);
    if (!payload.event) throw new Error("Social media event update returned no event.");
    return payload;
  };

  const persistMediaAsset = async ({ channel, optimized, source, storageSuffix, source_url = "" }) => {
    const config = CHANNELS.find((item) => item.key === channel);
    if (!config || !event) throw new Error("Social media channel is unavailable.");

    const version = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const storagePath = `${event.id}/${channel}-${storageSuffix}-${version}.jpg`;
    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(storagePath, optimized.blob, {
      contentType: "image/jpeg",
      cacheControl: "31536000",
      upsert: false,
    });
    if (uploadError) throw new Error(`STORAGE UPLOAD FAILED: ${uploadError.message || String(uploadError)}`);

    const { data: publicData } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
    const publicUrl = String(publicData?.publicUrl || "").trim();
    if (!publicUrl) throw new Error("Could not create a public Social media URL.");
    const entry = {
      src: publicUrl,
      url: publicUrl,
      format: config.format,
      channel,
      source,
      storage_path: storagePath,
      width: optimized.width,
      height: optimized.height,
      bytes: optimized.blob.size,
      created_at: new Date().toISOString(),
      ...(source_url ? { source_url } : {}),
    };

    let payload;
    try {
      payload = await callMediaEventApi({ id: event.id, action: "set_media", channel, entry });
    } catch (error) {
      await supabase.storage.from(BUCKET).remove([storagePath]).catch(() => {});
      throw error;
    }
    setEvent(payload.event);
    window.dispatchEvent(new CustomEvent("playnice:social-media-updated", { detail: { eventId: event.id, channel, source } }));
    return { updated: payload.event, entry, auditWarning: payload.audit_warning || "" };
  };

  const updateCarousel = async (items, action = "set_carousel") => {
    if (!event || busyChannel || immutable) return;
    setBusyChannel("carousel");
    setError("");
    setMessage("");
    try {
      const payload = await callMediaEventApi({ id: event.id, channel: "instagram_feed", action,
        items: items.map((item) => ({ src: mediaUrl(item), storage_path: item.storage_path, width: item.width, height: item.height, bytes: item.bytes })) });
      setEvent(payload.event);
      setMessage(action === "clear_carousel" ? "Carousel removed; normal single-photo workflow restored." : "Carousel saved · review and approval required.");
      window.dispatchEvent(new CustomEvent("playnice:social-media-updated", { detail: { eventId: event.id, channel: "instagram_feed", carousel: true } }));
    } catch (error) { setError(error?.message || String(error)); }
    finally { setBusyChannel(""); }
  };

  const uploadCarousel = async (files) => {
    if (!event || immutable || busyChannel || !files.length) return;
    if (carouselItems.length + files.length > 10) { setError("Maximum 10 carousel photos."); return; }
    setBusyChannel("carousel");
    setError("");
    setMessage("");
    const uploadedPaths = [];
    try {
      const next = [...carouselItems];
      for (const file of files) {
        const preset = { ...IMAGE_OPTIMIZER_PRESETS.socialFeed,
          width: 1080, height: 1350, fit: "strict", ratioTolerance: 0.015,
          backgroundPattern: "", centerVisibleObject: false, maxBytes: 700000 };
        const optimized = await optimizeImage(file, preset);
        const storagePath = `${event.id}/carousel-${Date.now()}-${Math.random().toString(36).slice(2, 9)}.jpg`;
        const { error: uploadError } = await supabase.storage.from(BUCKET).upload(storagePath, optimized.blob,
          { contentType: "image/jpeg", cacheControl: "31536000", upsert: false });
        if (uploadError) throw new Error(uploadError.message || "Carousel upload failed.");
        uploadedPaths.push(storagePath);
        const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
        next.push({ src: data.publicUrl, storage_path: storagePath,
          width: optimized.width, height: optimized.height, bytes: optimized.blob.size });
      }
      const payload = await callMediaEventApi({ id: event.id, channel: "instagram_feed", action: "set_carousel", items: next });
      setEvent(payload.event);
      setMessage(`${next.length} carousel images uploaded · approve after checking the order.`);
      window.dispatchEvent(new CustomEvent("playnice:social-media-updated", { detail: { eventId: event.id, channel: "instagram_feed", carousel: true } }));
    } catch (error) {
      if (uploadedPaths.length) await supabase.storage.from(BUCKET).remove(uploadedPaths).catch(() => {});
      setError(error?.message || String(error));
    } finally { setBusyChannel(""); }
  };

  const approveCarousel = async () => {
    if (!event || busyChannel || immutable || carouselItems.length < 2) return;
    setBusyChannel("carousel");
    setError("");
    try {
      const payload = await callMediaEventApi({ id: event.id, channel: "instagram_feed", action: "approve_carousel" });
      setEvent(payload.event);
      setMessage("All carousel images and their order approved for Instagram and Facebook.");
      window.dispatchEvent(new CustomEvent("playnice:social-media-updated", { detail: { eventId: event.id, channel: "instagram_feed", approval: true } }));
    } catch (error) { setError(error?.message || String(error)); }
    finally { setBusyChannel(""); }
  };

  const upload = async (channel, sourceFile) => {
    if (!event || !sourceFile || busyChannel) return;
    if (event.status !== "draft") {
      setError("Return this Social event to draft before replacing channel media.");
      return;
    }
    const config = CHANNELS.find((item) => item.key === channel);
    if (!config) return;

    setBusyChannel(channel);
    setError("");
    setMessage("");
    try {
      const uploadPreset = { ...config.preset, backgroundPattern: "" };
      const optimized = await optimizeImage(sourceFile, uploadPreset);
      const result = await persistMediaAsset({ channel, optimized, source: "social_upload", storageSuffix: "upload" });
      setMessage(`${config.label} uploaded · ${optimized.width} × ${optimized.height} · ${formatImageBytes(optimized.blob.size)} · review required${result.auditWarning ? ` · ${result.auditWarning}` : ""}`);
    } catch (uploadError) {
      setError(uploadError?.message || String(uploadError));
    } finally {
      setBusyChannel("");
    }
  };

  const generate = async (channel) => {
    if (!event || busyChannel) return;
    if (event.status !== "draft") {
      setError("Return this Social event to draft before generating channel media.");
      return;
    }
    const config = CHANNELS.find((item) => item.key === channel);
    const sourceUrl = mediaUrl(sourceDraft?.[channel]?.media);
    if (!config || !sourceUrl) {
      setError(`${config?.label || channel} has no source image to generate from.`);
      return;
    }

    setBusyChannel(channel);
    setError("");
    setMessage("");
    try {
      const response = await fetch(sourceUrl, { mode: "cors", cache: "no-store" });
      if (!response.ok) throw new Error(`Source image returned HTTP ${response.status}.`);
      const blob = await response.blob();
      if (!/^image\/(jpeg|png|webp)$/i.test(blob.type)) throw new Error(`Source media is ${blob.type || "not an image"}.`);
      const sourceFile = new File([blob], `social-source-${channel}`, { type: blob.type, lastModified: Date.now() });
      const optimized = await optimizeImage(sourceFile, config.preset);
      const result = await persistMediaAsset({ channel, optimized, source: "social_generated", storageSuffix: "generated", source_url: sourceUrl });
      setMessage(`${config.label} safe fallback generated · full source preserved with adaptive protected product zone · ${optimized.width} × ${optimized.height} · review required${result.auditWarning ? ` · ${result.auditWarning}` : ""}`);
    } catch (generateError) {
      setError(`Could not generate ${config.label}: ${generateError?.message || String(generateError)}`);
    } finally {
      setBusyChannel("");
    }
  };

  const approveVisual = async (channel, asset) => {
    if (!event || !asset || busyChannel || event.status !== "draft") return;
    const src = mediaUrl(asset);
    const config = CHANNELS.find((item) => item.key === channel);
    if (!src || !config) return;

    setBusyChannel(channel);
    setError("");
    setMessage("");
    try {
      const payload = await callMediaEventApi({ id: event.id, action: "approve_visual", channel, src });
      setEvent(payload.event);
      setMessage(`${config.label} visual approved for this exact asset.${payload.audit_warning ? ` ${payload.audit_warning}` : ""}`);
      window.dispatchEvent(new CustomEvent("playnice:social-media-updated", { detail: { eventId: event.id, channel, approval: true } }));
    } catch (approveError) {
      setError(approveError?.message || String(approveError));
    } finally {
      setBusyChannel("");
    }
  };

  if (!slot || !event) return null;
  return createPortal(
    <section className="social-media-override-panel">
      <div className="social-media-override-head">
        <div><span>SOCIAL ASSET GENERATOR</span><strong>Generate safely or upload channel-specific creative</strong></div>
        <small>Uploaded channel-specific creative has priority. Generated assets preserve the full source, add the subtle PlayNice pattern and adapt a protected dark zone to the product, so nothing is cropped.</small>
      </div>
      {(event.source_type === "custom" || carouselActive) ? <div className="social-carousel-panel">
        <div className="social-media-override-head"><div><span>CAROUSEL · INSTAGRAM + FACEBOOK</span>
          <strong>{carouselActive ? `${carouselItems.length} / 10 images` : "Create a multi-photo post"}</strong></div>
          <small>4:5 · 1080 × 1350 · no crop · manual publish only</small></div>
        <div className="social-carousel-gallery">
          {carouselItems.map((item, index) => <div className="social-carousel-tile" key={item.storage_path || index}>
            <img src={mediaUrl(item)} alt={`Carousel page ${index + 1}`} />
            <strong>{String(index + 1).padStart(2, "0")} / {carouselItems.length}</strong>
            <div>
              <button type="button" disabled={immutable || Boolean(busyChannel) || index === 0} onClick={() => {
                const next = [...carouselItems]; [next[index - 1], next[index]] = [next[index], next[index - 1]]; updateCarousel(next);
              }} aria-label="Move photo left">←</button>
              <button type="button" disabled={immutable || Boolean(busyChannel) || index === carouselItems.length - 1} onClick={() => {
                const next = [...carouselItems]; [next[index + 1], next[index]] = [next[index], next[index + 1]]; updateCarousel(next);
              }} aria-label="Move photo right">→</button>
              <button type="button" disabled={immutable || Boolean(busyChannel)} onClick={() => {
                const next = carouselItems.filter((_, i) => i !== index);
                updateCarousel(next, next.length ? "set_carousel" : "clear_carousel");
              }} aria-label="Remove photo">×</button>
            </div>
          </div>)}
        </div>
        <div className="social-carousel-actions">
          <label className={immutable ? "disabled" : ""}><input type="file" accept={ACCEPT} multiple
            disabled={immutable || Boolean(busyChannel) || carouselItems.length >= 10}
            onChange={(e) => { const files = Array.from(e.target.files || []); e.target.value = ""; if (files.length) uploadCarousel(files); }} />
            {busyChannel === "carousel" ? "Working…" : carouselActive ? "Add more photos" : "Upload carousel photos"}
          </label>
          {carouselActive ? <>
            <button type="button" disabled={immutable || Boolean(busyChannel) || carouselItems.length < 2 || carouselApproved}
              onClick={approveCarousel}>{carouselApproved ? "Carousel approved ✓" : "Approve all images & order"}</button>
            <button type="button" disabled={immutable || Boolean(busyChannel)} onClick={() => updateCarousel([], "clear_carousel")}>Return to single image</button>
          </> : null}
        </div>
        <small>Changes to any image or its position invalidate visual approval. Review both captions in the Social Publisher below.</small>
      </div> : null}
      {!carouselActive ? <div className="social-media-override-grid">
        {CHANNELS.filter((channel) => !Array.isArray(event.channels) || !event.channels.length || event.channels.includes(channel.key)).map((channel) => {
          const override = overrides[channel.key];
          const generatedAsset = generated[channel.key];
          const sourceAsset = sourceDraft?.[channel.key]?.media || null;
          const selectedAsset = override || generatedAsset || sourceAsset;
          const src = mediaUrl(selectedAsset);
          const sourceSrc = mediaUrl(sourceAsset);
          const approved = approvalFor(event, channel.key, src);
          const assetState = override ? "UPLOADED" : generatedAsset ? "GENERATED" : sourceSrc ? "SOURCE" : "NO SOURCE";
          return <div className={`social-media-override-card ${selectedAsset ? "has-override" : ""} ${approved ? "is-approved" : "needs-review"}`} key={channel.key}>
            <div className="social-media-override-card-head"><span>{channel.label}</span><em>{channel.format} · {channel.size}</em></div>
            {src ? <img src={src} alt={`${channel.label} social asset`} /> : <div className="social-media-override-empty">No source media</div>}
            <div className="social-media-asset-state">
              <strong>{assetState} · {approved ? "APPROVED" : "NEEDS REVIEW"}</strong>
              <small>{approved ? "Approval is locked to this exact asset URL" : selectedAsset ? "Inspect preview, then approve visual" : "Upload a prepared creative"}</small>
            </div>
            <button className={`social-media-approve ${approved ? "approved" : ""}`} type="button" disabled={immutable || Boolean(busyChannel) || !selectedAsset || approved} onClick={() => approveVisual(channel.key, selectedAsset)}>
              {busyChannel === channel.key ? "Working…" : approved ? "Visual approved ✓" : "Approve visual"}
            </button>
            <button className="social-media-generate" type="button" disabled={immutable || Boolean(busyChannel) || !sourceSrc} onClick={() => generate(channel.key)}>
              {busyChannel === channel.key ? "Working…" : override ? "Generate safe fallback" : generatedAsset ? "Regenerate safe fallback" : "Generate safe fallback"}
            </button>
            <label className={`social-media-override-picker ${immutable ? "disabled" : ""}`}>
              <input type="file" accept={ACCEPT} disabled={immutable || Boolean(busyChannel)} onChange={(pickEvent) => {
                const file = pickEvent.target.files?.[0] || null;
                pickEvent.target.value = "";
                if (file) upload(channel.key, file);
              }} />
              <strong>{busyChannel === channel.key ? "Working…" : override ? "Replace uploaded photo" : "Upload photo"}</strong>
              <small>{immutable ? "Return to draft to replace media" : "JPG / PNG / WebP · canonical JPEG · no crop"}</small>
            </label>
          </div>;
        })}
      </div> : null}
      {message ? <div className="social-media-override-message ok">{message}</div> : null}
      {error ? <div className="social-media-override-message error">{error}</div> : null}
    </section>,
    slot,
  );
}
