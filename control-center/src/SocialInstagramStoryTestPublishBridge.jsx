import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { supabase } from "./supabase";
import "./social-instagram-test-publish.css";

const isExplicitTestEvent = (event) => Boolean(
  event?.metadata?.test ||
  event?.metadata?.replay ||
  String(event?.source_id || "").includes("--shadow-test-") ||
  String(event?.source_id || "").includes("--shadow-replay-")
);

const storyMediaSrc = (event) => String(
  event?.approved_content?.instagram_story?.media?.src ||
  event?.approved_content?.instagram_story?.media?.url ||
  ""
).trim();

const isJpegCandidate = (event) => {
  const src = storyMediaSrc(event);
  if (!src) return false;
  try {
    const pathname = new URL(src, "https://www.playniceshop.me").pathname.toLowerCase();
    return pathname.endsWith(".jpg") || pathname.endsWith(".jpeg");
  } catch {
    return false;
  }
};

const titleFor = (event) => event?.payload?.core?.shortName || event?.payload?.core?.name || event?.payload?.title?.sr || event?.payload?.name || event?.payload?.alt || event?.source_id || "Test event";

export default function SocialInstagramStoryTestPublishBridge() {
  const [slot, setSlot] = useState(null);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadEvent = async () => {
    const { data } = await supabase
      .from("social_events")
      .select("*")
      .in("status", ["ready", "scheduled"])
      .order("updated_at", { ascending: false })
      .limit(20);
    const candidate = (data || []).find((row) => isExplicitTestEvent(row) && isJpegCandidate(row)) || null;
    setEvent(candidate);
  };

  useEffect(() => {
    let observer;
    const attach = () => {
      const social = document.querySelector(".social-manager");
      if (!social) { setSlot(null); return; }
      let node = social.querySelector("#social-instagram-story-test-publish-slot");
      if (!node) {
        node = document.createElement("div");
        node.id = "social-instagram-story-test-publish-slot";
        const facebook = social.querySelector("#social-facebook-test-publish-slot");
        if (facebook) facebook.insertAdjacentElement("afterend", node);
        else {
          const instagram = social.querySelector("#social-instagram-test-publish-slot");
          if (instagram) instagram.insertAdjacentElement("afterend", node);
          else social.appendChild(node);
        }
      }
      setSlot(node);
    };
    attach();
    observer = new MutationObserver(attach);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    loadEvent();
    const channel = supabase.channel("social-instagram-story-test-publish-bridge")
      .on("postgres_changes", { event: "*", schema: "public", table: "social_events" }, loadEvent)
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  const eventTitle = useMemo(() => titleFor(event), [event]);

  const publish = async () => {
    if (!event || loading) return;
    const confirmed = window.confirm(`REAL TEST STORY\n\nPublish the approved Instagram Story for “${eventTitle}” to @playnice.me now?\n\nThis creates a real public Instagram Story. Scheduler remains locked.`);
    if (!confirmed) return;

    setLoading(true);
    setMessage("");
    setError("");
    try {
      const { data: refreshData } = await supabase.auth.refreshSession().catch(() => ({ data: null }));
      let token = refreshData?.session?.access_token;
      if (!token) {
        const { data } = await supabase.auth.getSession();
        token = data?.session?.access_token;
      }
      if (!token) throw new Error("Authenticated admin session is required.");

      const response = await fetch("/api/social-instagram-feed-test-publish", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ event_id: event.id, channel: "instagram_story" }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || `Instagram Story test publish failed (${response.status}).`);
      setMessage(`Published test Story · ${payload?.result?.post_id || "Meta Story created"}`);
      await loadEvent();
    } catch (publishError) {
      setError(publishError?.message || String(publishError));
    } finally {
      setLoading(false);
    }
  };

  if (!slot) return null;
  return createPortal(
    <section className="social-instagram-test-publish">
      <div className="social-instagram-test-copy">
        <span>INSTAGRAM STORY · MANUAL TEST ONLY</span>
        <strong>{event ? eventTitle : "No approved JPEG Story test/replay event"}</strong>
        <p>{event ? "Approved Story image is ready as a test candidate. v1 publishes the image only; interactive stickers and scheduler remain out of scope." : "Create a replay and mark it READY. Only explicit test/replay events with approved JPEG Story media can appear here."}</p>
      </div>
      <div className="social-instagram-test-actions">
        {message ? <small className="ok">{message}</small> : null}
        {error ? <small className="error">{error}</small> : null}
        <button type="button" onClick={publish} disabled={!event || loading}>{loading ? "Publishing test…" : "Test publish Instagram Story"}</button>
      </div>
    </section>,
    slot,
  );
}
