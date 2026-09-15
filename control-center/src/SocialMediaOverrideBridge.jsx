import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { supabase } from "./supabase";
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

function uploadedOverride(event, channel) {
  return (Array.isArray(event?.media) ? event.media : []).find((item) => item?.source === "social_upload" && item?.channel === channel) || null;
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
  const overrides = useMemo(() => Object.fromEntries(CHANNELS.map(({ key }) => [key, uploadedOverride(event, key)])), [event]);

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
      const storagePath = `${event.id}/${channel}.jpg`;
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
        source: "social_upload",
        storage_path: storagePath,
        width: optimized.width,
        height: optimized.height,
        bytes: optimized.blob.size,
        uploaded_at: new Date().toISOString(),
      };
      const currentMedia = Array.isArray(event.media) ? event.media : [];
      const nextMedia = [entry, ...currentMedia.filter((item) => !(item?.source === "social_upload" && item?.channel === channel))];
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
        action: "social_media_uploaded",
        details: {
          channel,
          format: config.format,
          width: optimized.width,
          height: optimized.height,
          bytes: optimized.blob.size,
          storage_path: storagePath,
          fit: "contain",
          background: "#000000",
        },
      });

      setEvent(updated);
      setMessage(`${config.label} override uploaded · ${optimized.width} × ${optimized.height} · ${formatImageBytes(optimized.blob.size)}`);
      window.dispatchEvent(new CustomEvent("playnice:social-media-updated", { detail: { eventId: event.id, channel } }));
    } catch (uploadError) {
      setError(uploadError?.message || String(uploadError));
    } finally {
      setBusyChannel("");
    }
  };

  if (!slot || !event) return null;
  return createPortal(
    <section className="social-media-override-panel">
      <div className="social-media-override-head">
        <div><span>SOCIAL MEDIA OVERRIDES</span><strong>Upload channel-specific creative</strong></div>
        <small>No automatic crop · source is contained on black when needed · visually review before Mark ready</small>
      </div>
      <div className="social-media-override-grid">
        {CHANNELS.map((channel) => {
          const override = overrides[channel.key];
          const src = mediaUrl(override);
          return <div className={`social-media-override-card ${override ? "has-override" : ""}`} key={channel.key}>
            <div className="social-media-override-card-head"><span>{channel.label}</span><em>{channel.format} · {channel.size}</em></div>
            {src ? <img src={src} alt={`${channel.label} uploaded override`} /> : <div className="social-media-override-empty">No uploaded override</div>}
            <label className={`social-media-override-picker ${immutable ? "disabled" : ""}`}>
              <input type="file" accept={ACCEPT} disabled={immutable || Boolean(busyChannel)} onChange={(pickEvent) => {
                const file = pickEvent.target.files?.[0] || null;
                pickEvent.target.value = "";
                if (file) upload(channel.key, file);
              }} />
              <strong>{busyChannel === channel.key ? "Optimizing & uploading…" : override ? "Replace photo" : "Upload photo"}</strong>
              <small>{immutable ? "Return to draft to replace media" : "JPG / PNG / WebP · JPEG output · no crop"}</small>
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
