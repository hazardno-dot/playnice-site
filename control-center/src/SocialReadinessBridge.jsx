import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { supabase } from "./supabase";
import { generateSocialDraft, validateSocialDraftMedia } from "./socialDraft.mjs";
import "./social-readiness-bridge.css";

const CHANNELS = ["instagram_feed", "instagram_story", "facebook"];
const LABELS = {
  instagram_feed: "Instagram Feed",
  instagram_story: "Instagram Story",
  facebook: "Facebook",
};
const mediaSrc = (media) => String(media?.url || media?.src || "").trim();

function selectedQueueState() {
  const social = document.querySelector(".social-manager");
  if (!social) return null;
  const rows = [...social.querySelectorAll(".social-list > button")];
  const activeIndex = rows.findIndex((row) => row.classList.contains("active"));
  if (activeIndex < 0) return null;
  const activeFilter = [...social.querySelectorAll(".social-filter-bar > button")]
    .find((button) => button.classList.contains("active"));
  const rawFilter = String(activeFilter?.textContent || "all").trim().toLowerCase();
  return { activeIndex, statusFilter: rawFilter.split(/\s+/)[0] || "all" };
}

function isApproved(event, channel, src) {
  const approval = event?.metadata?.social_media_approval?.[channel];
  return Boolean(approval?.approved) && String(approval?.src || "").trim() === String(src || "").trim();
}

export default function SocialReadinessBridge() {
  const [slot, setSlot] = useState(null);
  const [event, setEvent] = useState(null);
  const selectedRef = useRef("");

  const loadSelected = async (force = false) => {
    const queue = selectedQueueState();
    if (!queue) { selectedRef.current = ""; setEvent(null); return; }
    const signature = `${queue.statusFilter}:${queue.activeIndex}`;
    if (!force && signature === selectedRef.current) return;
    selectedRef.current = signature;

    const { data } = await supabase.from("social_events").select("*").order("created_at", { ascending: false }).limit(100);
    const visible = queue.statusFilter === "all" ? (data || []) : (data || []).filter((row) => row.status === queue.statusFilter);
    setEvent(visible[queue.activeIndex] || null);
  };

  useEffect(() => {
    let observer;
    let raf = 0;
    const sync = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const social = document.querySelector(".social-manager");
        const old = social?.querySelector(".social-media-readiness");
        if (!social || !old) { setSlot(null); return; }
        old.style.display = "none";
        let node = social.querySelector("#social-readiness-bridge-slot");
        if (!node) {
          node = document.createElement("div");
          node.id = "social-readiness-bridge-slot";
          old.insertAdjacentElement("afterend", node);
        }
        setSlot(node);
        loadSelected(false);
      });
    };
    sync();
    observer = new MutationObserver(sync);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      const old = document.querySelector(".social-manager .social-media-readiness");
      if (old) old.style.display = "";
    };
  }, []);

  useEffect(() => {
    const channel = supabase.channel("social-readiness-bridge")
      .on("postgres_changes", { event: "*", schema: "public", table: "social_events" }, () => loadSelected(true))
      .subscribe();
    const onMediaUpdated = () => loadSelected(true);
    window.addEventListener("playnice:social-media-updated", onMediaUpdated);
    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener("playnice:social-media-updated", onMediaUpdated);
    };
  }, []);

  const state = useMemo(() => {
    if (!event) return null;
    let draft;
    try { draft = generateSocialDraft(event); } catch { return null; }
    const readiness = validateSocialDraftMedia(draft);
    const missing = readiness.blocking;
    const fallback = readiness.fallback;
    const unapproved = CHANNELS.filter((channel) => {
      const media = draft?.[channel]?.media;
      return mediaSrc(media) && !fallback.includes(channel) && !isApproved(event, channel, mediaSrc(media));
    });

    if (missing.length) return {
      tone: "blocked",
      title: "MEDIA REQUIRED",
      detail: `Missing media: ${missing.map((channel) => LABELS[channel]).join(", ")}.`,
      ready: false,
    };
    if (fallback.length) return {
      tone: "blocked",
      title: "CANONICAL ASSET REQUIRED",
      detail: `${fallback.map((channel) => LABELS[channel]).join(", ")} still ${fallback.length === 1 ? "uses" : "use"} fallback media. Generate a safe asset or upload a prepared creative.`,
      ready: false,
    };
    if (unapproved.length) return {
      tone: "review",
      title: "VISUAL REVIEW REQUIRED",
      detail: `Approve visual for: ${unapproved.map((channel) => LABELS[channel]).join(", ")}. Approval is locked to the exact asset URL.`,
      ready: false,
    };
    return {
      tone: "ready",
      title: "READY CHECK CAN RUN",
      detail: "All three channels use canonical media and each exact asset has visual approval. Backend will verify public availability before READY.",
      ready: true,
    };
  }, [event]);

  if (!slot || !state) return null;
  return createPortal(
    <div className={`social-readiness-bridge ${state.tone}`}>
      <div><span>MEDIA READINESS</span><strong>{state.title}</strong></div>
      <p>{state.detail}</p>
    </div>,
    slot,
  );
}
