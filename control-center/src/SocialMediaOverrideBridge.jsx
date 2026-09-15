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
  const rows = [...social.querySelectorAll(".social-list > button")];
  const activeIndex = rows.findIndex((row) => row.classList.contains("active"));
  if (activeIndex < 0) return null;

  const activeFilter = [...social.querySelectorAll(".social-filter-bar > button")]
    .find((button) => button.classList.contains("active"));
  const rawFilter = String(activeFilter?.textContent || "all").trim().toLowerCase();
  const statusFilter = rawFilter.split(/\s+/)[0] || "all";
  return { activeIndex, statusFilter };
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

    const signature = `${queueState.statusFilter}:${queueState.activeIndex}`;
    if (!force && selectedRef.current === signature) return;
    selectedRef.current = signature;

    const { data, error: loadError } = await supabase
      .from("social_events")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    if (loadError) {
      setError(loadError.message || String(loadError));
      return;
    }

    const visible = queueState.statusFilter === "all"
      ? (data || [])
      : (data || []).filter((row) => row.status === queueState.statusFilter);
    setEvent(visible[queueState.activeIndex] || null);
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
  const overrides = useMemo(() => Object.fromEntries(CHANNELS.map(({ key }) => [key, socialAsset(event, key, "social_upload")])), [event]);
  const generated = useMemo(() => Object.fromEntries(CHANNELS.map(({ key }) => [key, socialAsset(event, key, "social_generated")])), [event]);
  const sourceDraft = useMemo(() => {
    if (!event) return null;
    try { return generateSocialDraft(sourceOnlyEvent(event)); } catch { return null; }
  }, [event]);

  const persistMediaAsset = async ({ channel, optimized, source, storageSuffix, source_url = "" }) => {
    const config = CHANNELS.find((item) => item.key === channel);
    if (!config || !event) throw new Error("Social media channel is unavailable.");

    const storagePath = `${event.id}/${channel}-${storageSuffix}.jpg`;
    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(storagePath, optimized.blob, {
      contentType: "image/jpeg",
      cacheControl: "60",
      upsert: true,
    });
    if (uploadError) throw uploadError;

    const { data: publicData } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
    const baseUrl = String(publicData?.publicUrl || "").trim();
    if (!baseUrl) throw new Error("Could not create a public Social media URL.");
    const publicUrl = `${baseUrl}?v=${Date.now()}`;
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

    const currentMedia = Array.isArray(event.media) ? event.media : [];
    const nextMedia = [entry, ...currentMedia.filter((item) => !(item?.source === source && item?.channel === channel))];
    const { data: updated, error: updateError } = await supabase
      .from("social_events")
      .update({ media: nextMedia })
      .eq("id", event.id)
      .select("*")
      .single();
    if (updateError) throw updateError;

    const { data: sessionData } = await supabase.auth.getSession();
    await supabase.from("social_audit_log").insert({
      social_event_id: event.id,
      actor_id: sessionData?.session?.user?.id || null,
      action: source === "social_upload" ? "social_media_uploaded" : "social_media_generated",
      details: {
        channel,
        format: config.format,
        width: optimized.width,
        height: optimized.height,
        bytes: optimized.blob.size,
        storage_path: storagePath,
        fit: "contain",
        background: "#000000",
        ...(source_url ? { source_url } : {}),
      },
    });

    setEvent(updated);
    window.dispatchEvent(new CustomEvent("playnice:social-media-updated", { detail: { eventId: event.id, channel, source } }));
    return { updated, entry };
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
      const optimized = await optimizeImage(sourceFile, config.preset);
      await persistMediaAsset({ channel, optimized, source: "social_upload", storageSuffix: "upload" });
      setMessage(`${config.label} uploaded · ${optimized.width} × ${optimized.height} · ${formatImageBytes(optimized.blob.size)}`);
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
      await persistMediaAsset({ channel, optimized, source: "social_generated", storageSuffix: "generated", source_url: sourceUrl });
      setMessage(`${config.label} generated safely · contain on black · ${optimized.width} × ${optimized.height} · ${formatImageBytes(optimized.blob.size)}`);
    } catch (generateError) {
      setError(`Could not generate ${config.label}: ${generateError?.message || String(generateError)}`);
    } finally {
      setBusyChannel("");
    }
  };

  if (!slot || !event) return null;
  return createPortal(
    <section className="social-media-override-panel">
      <div className="social-media-override-head">
        <div><span>SOCIAL ASSET GENERATOR</span><strong>Generate safely or upload channel-specific creative</strong></div>
        <small>No automatic crop · generated assets use contain on black · uploaded creative always has priority · visually review before Mark ready</small>
      </div>
      <div className="social-media-override-grid">
        {CHANNELS.map((channel) => {
          const override = overrides[channel.key];
          const generatedAsset = generated[channel.key];
          const selectedAsset = override || generatedAsset;
          const src = mediaUrl(selectedAsset);
          const sourceSrc = mediaUrl(sourceDraft?.[channel.key]?.media);
          const state = override ? "UPLOADED" : generatedAsset ? "GENERATED" : sourceSrc ? "SOURCE READY" : "NO SOURCE";
          return <div className={`social-media-override-card ${selectedAsset ? "has-override" : ""}`} key={channel.key}>
            <div className="social-media-override-card-head"><span>{channel.label}</span><em>{channel.format} · {channel.size}</em></div>
            {src ? <img src={src} alt={`${channel.label} social asset`} /> : <div className="social-media-override-empty">{sourceSrc ? "Ready to generate" : "No source media"}</div>}
            <div className="social-media-asset-state"><strong>{state}</strong><small>{selectedAsset ? "Canonical Social asset" : sourceSrc ? "Generate uses safe contain + black" : "Upload a prepared creative"}</small></div>
            <button className="social-media-generate" type="button" disabled={immutable || Boolean(busyChannel) || !sourceSrc} onClick={() => generate(channel.key)}>
              {busyChannel === channel.key ? "Working…" : generatedAsset ? "Regenerate safe asset" : "Generate safe asset"}
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
      </div>
      {message ? <div className="social-media-override-message ok">{message}</div> : null}
      {error ? <div className="social-media-override-message error">{error}</div> : null}
    </section>,
    slot,
  );
}
